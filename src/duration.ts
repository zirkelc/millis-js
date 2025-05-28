import { DateTime } from './datetime.js';
import type { AbsoluteDuration, DateTimeLike, DurationLike } from './types.js';
import { isObject } from './utils.js';

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
 * A `Duration` represents a length of time.
 */
export class Duration {
  private value: number;

  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Creates a `Duration` object from an absolute duration.
   * @deprecated Use `Duration.from` instead.
   */
  static of(duration: AbsoluteDuration): Duration {
    return Duration.from(duration);
  }

  /**
   * Creates a `Duration` object from an absolute duration.
   */
  static from(duration: DurationLike): Duration {
    // Milliseconds
    if (typeof duration === 'number') return new Duration(duration);

    // TODO: support string durations like 1ms, 1s, 1m, 1h, 1d or ISO strings
    // if (typeof duration === 'string')
    //   return new Duration(parseDuration(duration));

    // Duration instance
    if (duration instanceof Duration) return new Duration(duration.millis());

    // Absolute duration
    if (isObject(duration)) {
      const millis =
        (duration.millis || 0) +
        (duration.seconds || 0) * 1_000 +
        (duration.minutes || 0) * 60 * 1_000 +
        (duration.hours || 0) * 60 * 60 * 1_000 +
        (duration.days || 0) * 24 * 60 * 60 * 1_000;

      return new Duration(millis);
    }

    throw new Error(`Invalid type for duration: ${typeof duration}`, {
      cause: duration,
    });
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
  millis(): number {
    return this.value;
  }

  /**
   * Returns the number of seconds of the `Duration` object.
   */
  seconds(options?: DurationOptions): number {
    const value = this.millis() / 1_000;
    return this.return(value, options);
  }

  /**
   * Returns the number of minutes of the `Duration` object.
   */
  minutes(options?: DurationOptions): number {
    const value = this.millis() / (60 * 1_000);
    return this.return(value, options);
  }

  /**
   * Returns the number of hours of the `Duration` object.
   */
  hours(options?: DurationOptions): number {
    const value = this.millis() / (60 * 60 * 1_000);
    return this.return(value, options);
  }

  /**
   * Returns the number of days of the `Duration` object.
   */
  days(options?: DurationOptions): number {
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
  plus(duration: AbsoluteDuration): Duration {
    return new Duration(this.millis() + Duration.from(duration).millis());
  }

  /**
   * Returns a new `Duration` object by subtracting a duration from the current `Duration` object.
   */
  minus(duration: AbsoluteDuration): Duration {
    return new Duration(this.millis() - Duration.from(duration).millis());
  }

  /**
   * Returns a new `Duration` object with the absolute value of the current `Duration` object.
   */
  abs(): Duration {
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
