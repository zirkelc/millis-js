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
import { AbsoluteUnits } from './units.js';

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
 * Duration class represents a duration of time.
 */
export class Duration extends AbsoluteUnits {
  private constructor(value: Milliseconds) {
    super(value);
  }

  /**
   * Creates a `Duration` object from an absolute duration.
   */
  static of(duration: AbsoluteDuration) {
    const millis =
      (duration.millis || 0) +
      (duration.seconds || 0) * 1_000 +
      (duration.minutes || 0) * 60 * 1_000 +
      (duration.hours || 0) * 60 * 60 * 1_000 +
      (duration.days || 0) * 24 * 60 * 60 * 1_000;

    return new Duration(millis);
  }

  /**
   * Creates a `Duration` object from a number of days.
   */
  static days(days: number): Duration {
    return Duration.of({ days });
  }

  /**
   * Creates a `Duration` object from a number of hours.
   */
  static hours(hours: number): Duration {
    return Duration.of({ hours });
  }

  /**
   * Creates a `Duration` object from a number of minutes.
   */
  static minutes(minutes: number): Duration {
    return Duration.of({ minutes });
  }

  /**
   * Creates a `Duration` object from a number of seconds.
   */
  static seconds(seconds: number): Duration {
    return Duration.of({ seconds });
  }

  /**
   * Creates a `Duration` object from a number of milliseconds.
   */
  static millis(millis: number): Duration {
    return Duration.of({ millis });
  }

  /**
   * Creates a `Duration` object from the difference between two `DateTimeLike` objects.
   */
  static diff(start: DateTimeLike, end: DateTimeLike): Duration {
    const startMillis = DateTime.from(start).millis();
    const endMillis = DateTime.from(end).millis();

    return Duration.of({ millis: endMillis - startMillis });
  }

  /**
   * Returns the number of seconds of the `Duration` object.
   */
  override seconds(options?: DurationOptions): Seconds {
    const value = this.millis() / 1_000;

    return this.return(value, options);
  }

  /**
   * Returns the number of minutes of the `Duration` object.
   */
  override minutes(options?: DurationOptions): Minutes {
    const value = this.seconds() / 60;

    return this.return(value, options);
  }

  /**
   * Returns the number of hours of the `Duration` object.
   */
  override hours(options?: DurationOptions): Hours {
    const value = this.minutes() / 60;

    return this.return(value, options);
  }

  /**
   * Returns the number of days of the `Duration` object.
   */
  override days(options?: DurationOptions): Days {
    const value = this.hours() / 24;

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
    return new Duration(this.millis() + Duration.of(duration).millis());
  }

  /**
   * Returns a new `Duration` object by subtracting a duration from the current `Duration` object.
   */
  minus(duration: AbsoluteDuration) {
    return new Duration(this.millis() - Duration.of(duration).millis());
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
  override toString(): string {
    return this.iso();
  }

  /**
   * Returns the milliseconds value when coercing to a number
   */
  override valueOf(): number {
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
