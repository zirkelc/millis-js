import { Duration } from './duration.js';
import type { AbsoluteDuration, RelativeDuration } from './types.js';
import type { DateTimeLike, ISO, Seconds } from './types.js';
import type { Milliseconds } from './types.js';
import { AbsoluteUnits } from './units.js';

/**
 * DateTime class for date and time operations.
 */
export class DateTime extends AbsoluteUnits {
  private constructor(value: Milliseconds) {
    super(value);
  }

  /**
   * Returns the current date and time in milliseconds.
   */
  static instant(): Milliseconds {
    return Date.now();
  }

  /**
   * Returns the current date and time as a `DateTime` object.
   */
  static now(): DateTime {
    return new DateTime(DateTime.instant());
  }

  /**
   * Returns a new `DateTime` object from a `DateTimeLike` value.
   */
  static from(dateTime: DateTimeLike): DateTime {
    if (dateTime instanceof Date) return new DateTime(dateTime.getTime());
    if (dateTime instanceof DateTime) return new DateTime(dateTime.millis());
    return new DateTime(new Date(dateTime).getTime());
  }

  /**
   * Returns the ISO string representation of the `DateTime` object.
   */
  iso(): ISO {
    return new Date(this.millis()).toISOString();
  }

  /**
   * Returns the number of seconds since the Unix Epoch.
   * The value is floored to the nearest integer.
   */
  timestamp(): Seconds {
    return Math.floor(this.millis() / 1_000);
  }

  /**
   * Returns a JavaScript Date object representation of the `DateTime` object.
   */
  date(): Date {
    return new Date(this.millis());
  }

  /**
   * Returns the year for the current `DateTime` object.
   */
  year(): number {
    return this.date().getUTCFullYear();
  }

  /**
   * Returns the day of the year (1-365/366) for the current `DateTime` object.
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
   * Returns the hour of the day (0-23) for the current `DateTime` object.
   */
  hourOfDay(): number {
    return this.date().getUTCHours();
  }

  /**
   * Returns a new `DateTime` object by adding a duration to the current `DateTime` object.
   */
  plus(duration: AbsoluteDuration & RelativeDuration) {
    return new DateTime(
      this.millis() +
        this.relativeDuration(duration) +
        this.absoluteDuration(duration),
    );
  }

  /**
   * Returns a new `DateTime` object by subtracting a duration from the current `DateTime` object.
   */
  minus(duration: AbsoluteDuration & RelativeDuration) {
    return new DateTime(
      this.millis() -
        this.relativeDuration(duration, true) -
        this.absoluteDuration(duration),
    );
  }

  /**
   * Returns the ISO string representation of the `DateTime` object.
   * Example: "2024-01-01T00:00:00.000Z"
   */
  override toString(): string {
    return this.iso();
  }

  /**
   * Returns the milliseconds value when coercing to a number
   */
  override valueOf(): number {
    return this.millis();
  }

  private absoluteDuration(duration: AbsoluteDuration): Milliseconds {
    const { millis, seconds, minutes, hours, days } = duration;
    return Duration.of({ millis, seconds, minutes, hours, days }).millis();
  }

  private relativeDuration(
    duration: RelativeDuration,
    minus = false,
  ): Milliseconds {
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

    return Math.abs(Duration.diff(currentDate, targetDate).millis());
  }
}
