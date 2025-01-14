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
   */
  days(): Array<DateTime> {
    const days = this.duration().days({ round: 'up' });

    return range(0, days).map((day) => this.start.plus({ days: day }));
  }
}
