import type { Days, Hours, Milliseconds, Minutes, Seconds } from './types.js';

/**
 * TimeUnit class represents a unit of time.
 */
export abstract class AbsoluteUnits {
  protected constructor(protected value: Milliseconds) {}

  /**
   * Returns the milliseconds value of the time.
   */
  millis(): Milliseconds {
    return this.value;
  }

  /**
   * Returns the number of seconds of the time.
   */
  seconds(): Seconds {
    return this.millis() / 1_000;
  }

  /**
   * Returns the number of minutes of the time.
   */
  minutes(): Minutes {
    return this.seconds() / 60;
  }

  /**
   * Returns the number of hours of the time.
   */
  hours(): Hours {
    return this.minutes() / 60;
  }

  /**
   * Returns the number of days of the time.
   */
  days(): Days {
    return this.hours() / 24;
  }
}
