import { DateTime } from './datetime.js';
import type {
  AbsoluteDuration,
  DateTimeLike,
  Days,
  Hours,
  Milliseconds,
  Minutes,
  Seconds,
} from './types.js';

/**
 * Duration options
 */
type DurationOptions = {
  /**
   * Round the duration to the nearest integer:
   * - `true` rounds up or down to the nearest integer
   * - `'up'` rounds up to the nearest integer
   * - `'down'` rounds down to the nearest integer
   */
  round?: 'up' | 'down' | true;
};

/**
 * Duration class represents a length of time.
 */
export class Duration {
  private value: Milliseconds;

  private constructor(value: Milliseconds) {
    this.value = value;
  }

  /**
   * Creates a `Duration` object from an absolute duration.
   * @deprecated Use `Duration.from` instead.
   */
  static of(duration: AbsoluteDuration) {
    return Duration.from(duration);
  }

  /**
   * Creates a `Duration` object from an absolute duration.
   */
  static from(duration: AbsoluteDuration) {
    const millis =
      (duration.millis || 0) +
      (duration.seconds || 0) * 1_000 +
      (duration.minutes || 0) * 60 * 1_000 +
      (duration.hours || 0) * 60 * 60 * 1_000 +
      (duration.days || 0) * 24 * 60 * 60 * 1_000;

    return new Duration(millis);
  }

  /**
   * Creates a `Duration` object from the difference between two `DateTimeLike` objects.
   * @deprecated Use `Duration.between` instead.
   */
  static diff(start: DateTimeLike, end: DateTimeLike): Duration {
    return Duration.between(start, end);
  }

  /**
   * Creates a `Duration` object from the difference between two `DateTimeLike` objects.
   */
  static between(start: DateTimeLike, end: DateTimeLike): Duration {
    const startDate = DateTime.from(start);
    const endDate = DateTime.from(end);

    return Duration.from({ millis: endDate.millis() - startDate.millis() });
  }

  /**
   * Creates a `Duration` object from a number of days.
   */
  static days(days: number): Duration {
    return Duration.from({ days });
  }

  /**
   * Creates a `Duration` object from a number of hours.
   */
  static hours(hours: number): Duration {
    return Duration.from({ hours });
  }

  /**
   * Creates a `Duration` object from a number of minutes.
   */
  static minutes(minutes: number): Duration {
    return Duration.from({ minutes });
  }

  /**
   * Creates a `Duration` object from a number of seconds.
   */
  static seconds(seconds: number): Duration {
    return Duration.from({ seconds });
  }

  /**
   * Creates a `Duration` object from a number of milliseconds.
   */
  static millis(millis: number): Duration {
    return Duration.from({ millis });
  }

  /**
   * Returns the number of milliseconds of the `Duration` object.
   */
  millis(): Milliseconds {
    return this.value;
  }

  /**
   * Returns the number of seconds of the `Duration` object.
   */
  seconds(options?: DurationOptions): Seconds {
    const value = this.millis() / 1_000;
    return this.return(value, options);
  }

  /**
   * Returns the number of minutes of the `Duration` object.
   */
  minutes(options?: DurationOptions): Minutes {
    const value = this.millis() / (60 * 1_000);
    return this.return(value, options);
  }

  /**
   * Returns the number of hours of the `Duration` object.
   */
  hours(options?: DurationOptions): Hours {
    const value = this.millis() / (60 * 60 * 1_000);
    return this.return(value, options);
  }

  /**
   * Returns the number of days of the `Duration` object.
   */
  days(options?: DurationOptions): Days {
    const value = this.millis() / (24 * 60 * 60 * 1_000);

    return this.return(value, options);
  }

  /**
   * Returns the ISO string representation of the `Duration` object.
   * Example: "P2DT4H12M30S"
   */
  iso(): string {
    const days = Math.floor(this.value / (24 * 60 * 60 * 1_000));
    const hours = Math.floor(
      (this.value % (24 * 60 * 60 * 1_000)) / (60 * 60 * 1_000),
    );
    const minutes = Math.floor((this.value % (60 * 60 * 1_000)) / (60 * 1_000));
    const seconds = Math.floor((this.value % (60 * 1_000)) / 1_000);

    let iso = 'P';
    if (days > 0) iso += `${days}D`;

    // Only add time separator if we have time components.
    if (hours > 0 || minutes > 0 || seconds > 0) {
      iso += 'T';
      if (hours > 0) iso += `${hours}H`;
      if (minutes > 0) iso += `${minutes}M`;
      if (seconds > 0) iso += `${seconds}S`;
    }

    return iso === 'P' ? 'PT0S' : iso;
  }

  /**
   * Returns a new `Duration` object by adding a duration to the current `Duration` object.
   */
  plus(duration: AbsoluteDuration) {
    return new Duration(this.millis() + Duration.from(duration).millis());
  }

  /**
   * Returns a new `Duration` object by subtracting a duration from the current `Duration` object.
   */
  minus(duration: AbsoluteDuration) {
    return new Duration(this.millis() - Duration.from(duration).millis());
  }

  /**
   * Returns a new `Duration` object with the absolute value of the current `Duration` object.
   */
  abs() {
    return new Duration(Math.abs(this.millis()));
  }

  /**
   * Returns the ISO string representation of the `Duration` object.
   */
  toString(): string {
    return this.iso();
  }

  /**
   * Returns the milliseconds of the `Duration` object when coercing to a number
   */
  valueOf(): number {
    return this.millis();
  }

  private return(value: number, options?: DurationOptions): number {
    const { round } = options ?? {};
    if (round === true) return Math.round(value);
    if (round === 'up') return Math.ceil(value);
    if (round === 'down') return Math.floor(value);
    return value;
  }
}
