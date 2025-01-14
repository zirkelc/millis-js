import { DateTime } from './datetime.js';
import { Duration } from './duration.js';
import type { DateTimeLike } from './types.js';
import { range } from './utils.js';

export class Interval {
  private start: DateTime;
  private end: DateTime;

  private constructor(start: DateTime, end: DateTime) {
    this.start = start;
    this.end = end;
  }

  static between(start: DateTimeLike, end: DateTimeLike) {
    return new Interval(DateTime.from(start), DateTime.from(end));
  }

  static days(days: number) {
    const now = DateTime.now();
    const start = now;
    const end = now.plus({ days });

    return new Interval(start, end);
  }

  millis(): number {
    return this.end.millis() - this.start.millis();
  }

  duration(): Duration {
    return Duration.between(this.start, this.end);
  }

  starts(): DateTime {
    return this.start;
  }

  ends(): DateTime {
    return this.end;
  }

  iso(): string {
    return `${this.start.iso()}/${this.end.iso()}`;
  }

  toString(): string {
    return this.iso();
  }

  /**
   * Returns an array of `DateTime` objects for each day in the interval,
   * going from `start` to `end`.
   *
   * The order of the days depends if the interval is in the future (start < end)
   * or in the past (start > end).
   */
  days(): Array<DateTime> {
    const days = this.duration().days({ round: 'up' });

    return range(0, days).map((day) => this.start.plus({ days: day }));
  }
}
