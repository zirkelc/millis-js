import { DateTime } from './datetime.js';
import { Duration } from './duration.js';
import type { DateTimeLike } from './types.js';
import { range } from './utils.js';

/**
 * An `Interval` represents a time span between two `DateTime` objects.
 */
export class Interval {
  private start: DateTime;
  private end: DateTime;

  private constructor(start: DateTime, end: DateTime) {
    this.start = start;
    this.end = end;
  }

  /**
   * Creates a new Interval between two DateTimeLike values
   */
  static between(start: DateTimeLike, end: DateTimeLike) {
    return new Interval(DateTime.from(start), DateTime.from(end));
  }

  /**
   * Creates a new Interval starting from now and extending for the specified number of days
   */
  static days(days: number) {
    const now = DateTime.now();
    const start = now;
    const end = now.plus({ days });

    return new Interval(start, end);
  }

  /**
   * Returns the number of milliseconds between the start and end of the interval.
   */
  millis(): number {
    return this.end.millis() - this.start.millis();
  }

  /**
   * Returns the duration between the start and end of the interval.
   */
  duration(): Duration {
    return Duration.between(this.start, this.end);
  }

  /**
   * Returns the start DateTime of the interval.
   */
  starts(): DateTime {
    return this.start;
  }

  /**
   * Returns the end DateTime of the interval.
   */
  ends(): DateTime {
    return this.end;
  }

  /**
   * Returns the ISO string representation of the interval.
   */
  iso(): string {
    return `${this.start.iso()}/${this.end.iso()}`;
  }

  toString(): string {
    return this.iso();
  }

  /**
   * Returns an array of DateTime objects for each day in the interval, going from start to end.
   * The day of the end date is only included if it is not exactly at the start of a day.
   *
   * @example
   * - `2024-01-01T00:00:00.000Z` to `2024-01-02T00:00:00.000Z` will include only `2024-01-01`
   * - `2024-01-01T00:00:00.000Z` to `2024-01-02T23:59:59.999Z` will include both `2024-01-01` and `2024-01-02`
   */
  days(): Array<DateTime> {
    const startDate = this.start;

    // If end time is exactly at the start of a day, don't include that day
    const endDate = this.end.isStartOfDay()
      ? this.end.minus({ millis: 1 })
      : this.end;

    // Use Duration.between to calculate the difference because days cannot be subtracted in the same way as years
    const days = Duration.between(startDate, endDate).days({
      round: 'down',
    });

    return range(0, days + 1).map((day) => startDate.plus({ days: day }));
  }

  /**
   * Returns an array of DateTime objects for each year in the interval, going from start to end.
   * The year of the end date is only included if it is not exactly at the start of a year.
   *
   * @example
   * - `2024-01-01T00:00:00.000Z` to `2025-01-01T00:00:00.000Z` will include only `2024`
   * - `2024-01-01T00:00:00.000Z` to `2025-01-01T23:59:59.999Z` will include both `2024` and `2025`
   */
  years(): Array<DateTime> {
    const startDate = this.start;

    // If end date is exactly at the start of a year, don't include that year
    const endDate = this.end.isStartOfYear()
      ? this.end.minus({ millis: 1 })
      : this.end;

    const years = endDate.year() - startDate.year();

    return range(0, years + 1).map((year) => startDate.plus({ years: year }));
  }

  /**
   * Returns true if the Interval contains the specified DateTime.
   */
  contains(dateTime: DateTimeLike): boolean {
    return this.start.isBefore(dateTime) && this.end.isAfter(dateTime);
  }
}
