import { Duration } from './duration.js';
import { Interval } from './interval.js';
import type {
  AbsoluteDuration,
  DateTimeFormat,
  DateTimeLike,
  DurationLike,
  RelativeDuration,
} from './types.js';
import { isDateTimeFormat, isObject, pad, parseNumber } from './utils.js';

type FormatLike = DateTimeFormat | Intl.DateTimeFormat;
type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

const YYYY_REGEX = /^\d{4}$/;
const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const YYYY_DDD_REGEX = /^\d{4}-\d{3}$/;

/**
 * A `DateTime` represents a point in time.
 */
export class DateTime {
  private value: number;

  private constructor(value: number) {
    if (Number.isNaN(value)) throw new Error('Invalid date time');

    this.value = value;
  }

  /**
   * Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
   */
  static millis(): number {
    return Date.now();
  }

  /**
   * Returns a new DateTime object representing the current date and time.
   */
  static now(): DateTime {
    return new DateTime(DateTime.millis());
  }

  /**
   * Returns a new DateTime object from a DateTimeLike value.
   */
  static from(dateTime: DateTimeLike): DateTime {
    // Milliseconds
    if (typeof dateTime === 'number') return new DateTime(dateTime);

    // String
    if (typeof dateTime === 'string') {
      const str = dateTime.trim();
      const length = str.length;

      switch (length) {
        case 4:
          // YYYY
          if (YYYY_REGEX.test(str)) return new DateTime(Date.parse(dateTime));
          break;

        case 10:
          // YYYY-MM-DD
          if (YYYY_MM_DD_REGEX.test(str))
            return new DateTime(Date.parse(dateTime));
          break;
        case 8:
          // YYYY-DDD
          if (YYYY_DDD_REGEX.test(str)) {
            const [year, dayOfYear] = str.split('-').map((s) => parseNumber(s));
            return DateTime.from({ year, dayOfYear });
          }
          break;
        default:
          // ISO
          return new DateTime(Date.parse(dateTime));
      }
    }

    // Date instance
    if (
      dateTime instanceof Date ||
      (isObject(dateTime) && 'getTime' in dateTime)
    )
      return new DateTime(dateTime.getTime());

    // DateTime instance
    if (dateTime instanceof DateTime) return new DateTime(dateTime.millis());

    // DateTimeComponents
    if (isObject(dateTime)) {
      if ('year' in dateTime) {
        // Extract time components with defaults
        const {
          year = 0,
          hour = 0,
          minute = 0,
          second = 0,
          millisecond = 0,
        } = dateTime;

        if ('dayOfYear' in dateTime) {
          const { dayOfYear } = dateTime;
          const date = new Date(
            Date.UTC(
              year,
              0, // January
              1, // First day
              hour,
              minute,
              second,
              millisecond,
            ),
          );
          date.setUTCDate(dayOfYear);

          if (date.getUTCFullYear() !== year) {
            throw new Error(
              `Invalid day of year: ${dayOfYear} for year ${year}`,
            );
          }

          return new DateTime(date.getTime());
        }

        const { month, dayOfMonth } = dateTime;
        const date = new Date(
          Date.UTC(
            year,
            month !== undefined ? month - 1 : undefined,
            dayOfMonth,
            hour,
            minute,
            second,
            millisecond,
          ),
        );

        // Validate components match what was provided
        if (
          date.getUTCFullYear() !== year ||
          date.getUTCMonth() !== month - 1 ||
          date.getUTCDate() !== dayOfMonth
        ) {
          throw new Error('Invalid date components');
        }

        return new DateTime(date.getTime());
      }

      // if (Object.keys(dateTime).length === 1) {
      //   const [format] = Object.keys(dateTime) as [DateTimeFormat];
      //   const value = dateTime[format];
      //   if (value === undefined) throw new Error('Invalid date time');

      //   switch (format) {
      //     case 'YYYY':
      //       return new DateTime(Date.parse(value));
      //     case 'YYYY-MM-DD':
      //       return new DateTime(Date.parse(value));
      //     case 'YYYY-DDD': {
      //       const [year, dayOfYear] = value
      //         .split('-')
      //         .map((s) => parseNumber(s));

      //       return DateTime.from({ year, dayOfYear });
      //     }
      //   }
      // }
    }

    throw new Error(`Invalid type for date time: ${typeof dateTime}`, {
      cause: dateTime,
    });
  }

  /**
   * Creates an Interval from this DateTime to the specified end DateTime
   */
  until(end: DateTimeLike): Interval {
    return Interval.between(this, end);
  }

  /**
   * Formats the DateTime according to the specified format
   */
  format(format: FormatLike): string {
    if (isDateTimeFormat(format)) return format.format(this.date());

    switch (format) {
      case 'YYYY':
        return `${pad(this.year(), 4)}`;
      case 'YYYY-DDD':
        return `${pad(this.year(), 4)}-${pad(this.dayOfYear(), 3)}`;
      case 'YYYY-MM-DD':
        return `${pad(this.year(), 4)}-${pad(this.month(), 2)}-${pad(this.dayOfMonth(), 2)}`;
      case 'HH:mm:ss':
        return `${pad(this.hour(), 2)}:${pad(this.minute(), 2)}:${pad(this.second(), 2)}`;
    }
    format satisfies never;

    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Returns the number of milliseconds of the DateTime object.
   */
  millis(): number {
    return this.value;
  }

  /**
   * Returns the ISO string representation of the DateTime object.
   */
  iso(): string {
    return new Date(this.millis()).toISOString();
  }

  /**
   * Returns the number of seconds since the Unix Epoch. The value is floored to the nearest integer.
   */
  timestamp(): number {
    return Math.floor(this.millis() / 1_000);
  }

  /**
   * Returns the JavaScript Date object representation of the DateTime object.
   */
  date(): Date {
    return new Date(this.millis());
  }

  /**
   * Returns the year for the current DateTime object.
   */
  year(): number {
    return this.date().getUTCFullYear();
  }

  /**
   * Returns the day of the year (1-365/366) for the current DateTime object.
   */
  dayOfYear(): number {
    const currentDate = this.date();
    const startOfYear = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
    return (
      Math.floor(
        (this.millis() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    );
  }

  /**
   * Returns the day of the month (1-31) for the current DateTime object.
   */
  dayOfMonth(): number {
    return this.date().getUTCDate();
  }

  /**
   * Returns the month of the year (1-12) for the current DateTime object.
   */
  month(): number {
    return this.date().getUTCMonth() + 1;
  }

  /**
   * Returns the day of the week (1-7, Monday=1, Sunday=7) for the current DateTime object.
   */
  dayOfWeek(): number {
    const day = this.date().getUTCDay();
    return day === 0 ? 7 : day;
  }

  /**
   * Returns the hour of the day (0-23) for the current DateTime object.
   */
  hour(): number {
    return this.date().getUTCHours();
  }

  /**
   * Returns the minute of the hour (0-59) for the current DateTime object.
   */
  minute(): number {
    return this.date().getUTCMinutes();
  }

  /**
   * Returns the second of the minute (0-59) for the current DateTime object.
   */
  second(): number {
    return this.date().getUTCSeconds();
  }

  /**
   * Returns the millisecond of the second (0-999) for the current DateTime object.
   */
  millisecond(): number {
    return this.date().getUTCMilliseconds();
  }

  /**
   * Returns a new DateTime object by adding a duration to the current DateTime object.
   */
  plus(
    duration: number | (AbsoluteDuration & RelativeDuration) | Duration,
  ): DateTime {
    const millis =
      typeof duration === 'number'
        ? duration
        : duration instanceof Duration
          ? duration.millis()
          : this.relativeDuration(duration, false) +
            this.absoluteDuration(duration);

    return new DateTime(this.millis() + millis);
  }

  /**
   * Returns a new DateTime object by subtracting a duration from the current DateTime object.
   */
  minus(
    duration: number | (AbsoluteDuration & RelativeDuration) | Duration,
  ): DateTime {
    const millis =
      typeof duration === 'number'
        ? duration
        : duration instanceof Duration
          ? duration.millis()
          : this.relativeDuration(duration, true) +
            this.absoluteDuration(duration);

    return new DateTime(this.millis() - millis);
  }

  /**
   * Returns the ISO string representation of the DateTime object.
   */
  toString(): string {
    return this.iso();
  }

  /**
   * Returns the milliseconds value when coercing to a number
   */
  valueOf(): number {
    return this.millis();
  }

  /**
   * Returns a new DateTime object set to the start of the second
   */
  startOfSecond(): DateTime {
    return this.startOf('second');
  }

  /**
   * Returns a new DateTime object set to the start of the minute
   */
  startOfMinute(): DateTime {
    return this.startOf('minute');
  }

  /**
   * Returns a new DateTime object set to the start of the hour
   */
  startOfHour(): DateTime {
    return this.startOf('hour');
  }

  /**
   * Returns a new DateTime object set to the start of the day
   */
  startOfDay(): DateTime {
    return this.startOf('day');
  }

  /**
   * Returns a new DateTime object set to the start of the month
   */
  startOfMonth(): DateTime {
    return this.startOf('month');
  }

  /**
   * Returns a new DateTime object set to the start of the year
   */
  startOfYear(): DateTime {
    return this.startOf('year');
  }

  /**
   * Returns a new DateTime object set to the end of the second
   */
  endOfSecond(): DateTime {
    return this.endOf('second');
  }

  /**
   * Returns a new DateTime object set to the end of the minute
   */
  endOfMinute(): DateTime {
    return this.endOf('minute');
  }

  /**
   * Returns a new DateTime object set to the end of the hour
   */
  endOfHour(): DateTime {
    return this.endOf('hour');
  }

  /**
   * Returns a new DateTime object set to the end of the day
   */
  endOfDay(): DateTime {
    return this.endOf('day');
  }

  /**
   * Returns a new DateTime object set to the end of the month
   */
  endOfMonth(): DateTime {
    return this.endOf('month');
  }

  /**
   * Returns a new DateTime object set to the end of the year
   */
  endOfYear(): DateTime {
    return this.endOf('year');
  }

  /**
   * Checks if the current DateTime is at the start of the second
   */
  isStartOfSecond(): boolean {
    return this.isStartOf('second');
  }

  /**
   * Checks if the current DateTime is at the start of the minute
   */
  isStartOfMinute(): boolean {
    return this.isStartOf('minute');
  }

  /**
   * Checks if the current DateTime is at the start of the hour
   */
  isStartOfHour(): boolean {
    return this.isStartOf('hour');
  }

  /**
   * Checks if the current DateTime is at the start of the day
   */
  isStartOfDay(): boolean {
    return this.isStartOf('day');
  }

  /**
   * Checks if the current DateTime is at the start of the month
   */
  isStartOfMonth(): boolean {
    return this.isStartOf('month');
  }

  /**
   * Checks if the current DateTime is at the start of the year
   */
  isStartOfYear(): boolean {
    return this.isStartOf('year');
  }

  /**
   * Checks if the current DateTime is at the end of the second
   */
  isEndOfSecond(): boolean {
    return this.isEndOf('second');
  }

  /**
   * Checks if the current DateTime is at the end of the minute
   */
  isEndOfMinute(): boolean {
    return this.isEndOf('minute');
  }

  /**
   * Checks if the current DateTime is at the end of the hour
   */
  isEndOfHour(): boolean {
    return this.isEndOf('hour');
  }

  /**
   * Checks if the current DateTime is at the end of the day
   */
  isEndOfDay(): boolean {
    return this.isEndOf('day');
  }

  /**
   * Checks if the current DateTime is at the end of the month
   */
  isEndOfMonth(): boolean {
    return this.isEndOf('month');
  }

  /**
   * Checks if the current DateTime is at the end of the year
   */
  isEndOfYear(): boolean {
    return this.isEndOf('year');
  }

  /**
   * Checks if the current DateTime is in the same second as the given DateTime
   */
  isSameSecond(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'second');
  }

  /**
   * Checks if the current DateTime is in the same minute as the given DateTime
   */
  isSameMinute(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'minute');
  }

  /**
   * Checks if the current DateTime is in the same hour as the given DateTime
   */
  isSameHour(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'hour');
  }

  /**
   * Checks if the current DateTime is in the same day as the given DateTime
   */
  isSameDay(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'day');
  }

  /**
   * Checks if the current DateTime is in the same month as the given DateTime
   */
  isSameMonth(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'month');
  }

  /**
   * Checks if the current DateTime is in the same year as the given DateTime
   */
  isSameYear(dateTime: DateTimeLike): boolean {
    return this.isSame(dateTime, 'year');
  }

  /**
   * Returns true if the current DateTime is before the specified DateTime.
   */
  isBefore(dateTime: DateTimeLike): boolean {
    return this < DateTime.from(dateTime);
  }

  /**
   * Returns true if the current DateTime is after the specified DateTime.
   */
  isAfter(dateTime: DateTimeLike): boolean {
    return this > DateTime.from(dateTime);
  }

  /**
   * Returns true if the current DateTime is between the specified DateTime.
   */
  isBetween(start: DateTimeLike, end: DateTimeLike): boolean {
    return this.isAfter(start) && this.isBefore(end);
  }

  /**
   * Returns true if the current DateTime is equal to the specified DateTime.
   */
  equals(dateTime: DateTimeLike): boolean {
    return this.millis() === DateTime.from(dateTime).millis();
  }

  /**
   * Returns a comparison value of the current DateTime object to the given DateTime object to be used in sorting.
   * The result is:
   * - negative (< 0) if the current DateTime object is before the given DateTime object (a < b)
   * - positive (> 0) if the current DateTime object is after the given DateTime object (a > b)
   * - zero (0) if the current DateTime object and the given DateTime object are the same (a === b)
   *
   * @example
   * const dates = [
   *   DateTime.from('2024-01-02T00:00:00.000Z'),
   *   DateTime.from('2024-01-01T00:00:00.000Z'),
   * ];
   *
   * dates.sort((a, b) => a.compare(b));
   */
  compare(dateTime: DateTimeLike): number {
    return this.millis() - DateTime.from(dateTime).millis();
  }

  /**
   * Returns a new DateTime object set to the start of the specified unit
   */
  private startOf(unit: TimeUnit): DateTime {
    const date = this.date();
    switch (unit) {
      case 'second':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            0,
          ),
        );
      case 'minute':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            0,
            0,
          ),
        );
      case 'hour':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            0,
            0,
            0,
          ),
        );
      case 'day':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      case 'month':
        return DateTime.from(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
        );
      case 'year':
        return DateTime.from(Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
    }
  }

  /**
   * Returns a new DateTime object set to the end of the specified unit
   */
  private endOf(unit: TimeUnit): DateTime {
    const date = this.date();
    switch (unit) {
      case 'second':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            999,
          ),
        );
      case 'minute':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            59,
            999,
          ),
        );
      case 'hour':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            59,
            59,
            999,
          ),
        );
      case 'day':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        );
      case 'month':
        return DateTime.from(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        );
      case 'year':
        return DateTime.from(
          Date.UTC(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999),
        );
    }
  }

  /**
   * Checks if the current DateTime is at the start of the specified unit
   */
  private isStartOf(unit: TimeUnit): boolean {
    return this.millis() === this.startOf(unit).millis();
  }

  /**
   * Checks if the current DateTime is at the end of the specified unit
   */
  private isEndOf(unit: TimeUnit): boolean {
    return this.millis() === this.endOf(unit).millis();
  }

  /**
   * Checks if the current DateTime is in the same time unit as the given DateTime
   */
  private isSame(dateTime: DateTimeLike, unit: TimeUnit): boolean {
    const other = DateTime.from(dateTime);
    return this.startOf(unit).millis() === other.startOf(unit).millis();
  }

  /**
   * Calculates the absolute duration in milliseconds between the current DateTime and the absolute duration.
   */
  private absoluteDuration(duration: AbsoluteDuration): number {
    const { millis, seconds, minutes, hours, days } = duration;
    return Duration.from({ millis, seconds, minutes, hours, days }).millis();
  }

  /**
   * Calculates the duration in milliseconds between the current DateTime and the relative duration.
   * The minus parameter is used to determine the direction of the duration.
   * If minus is true, the duration is subtracted from the current DateTime.
   * If minus is false, the duration is added to the current DateTime.
   * In other words, are we going back in time or forward in time?
   */
  private relativeDuration(duration: RelativeDuration, minus: boolean): number {
    const { months = 0, years = 0 } = duration;

    const currentDate = this.date();
    const targetDate = new Date(currentDate);

    const currentDay = targetDate.getUTCDate();

    // set to first day to avoid month skipping issues
    targetDate.setUTCDate(1);

    targetDate.setUTCFullYear(
      targetDate.getUTCFullYear() + years * (minus ? -1 : 1),
    );
    targetDate.setUTCMonth(
      targetDate.getUTCMonth() + months * (minus ? -1 : 1),
    );

    // Calculate the last day of the target month
    const daysInMonth = new Date(
      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 0),
    ).getUTCDate();

    // Restore the day, but don't exceed the days in the target month
    targetDate.setUTCDate(Math.min(currentDay, daysInMonth));

    return Math.abs(Duration.between(currentDate, targetDate).millis());
  }
}
