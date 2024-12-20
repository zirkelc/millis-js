import type { DateTime } from './datetime.js';

export interface DurationLike {
  days?: number | undefined;
  hours?: number | undefined;
  minutes?: number | undefined;
  seconds?: number | undefined;
  millis?: number | undefined;
}

export type AbsoluteDuration = {
  readonly millis?: number;
  readonly seconds?: number;
  readonly minutes?: number;
  readonly hours?: number;
  readonly days?: number;
};

export type RelativeDuration = {
  readonly months?: number;
  readonly years?: number;
};

export type DateTimeLike = ISO | Milliseconds | DateTime | Date;

export type Milliseconds = number;
export type Seconds = number;
export type Minutes = number;
export type Hours = number;
export type Days = number;
export type ISO = string;
