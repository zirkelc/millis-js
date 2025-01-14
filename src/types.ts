import type { DateTime } from './datetime.js';
import type { Duration } from './duration.js';

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

export type DurationComponents = AbsoluteDuration & RelativeDuration;

export type DurationLike = Milliseconds | DurationComponents | Duration;

export type OrdinalDate = {
  year: number;
  dayOfYear: number;
};
export type CalendarDate = {
  year: number;
  month: number;
  dayOfMonth: number;
};
export type TimeComponents = {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

export type DateTimeFormat = 'YYYY' | 'YYYY-MM-DD' | 'YYYY-DDD' | 'HH:mm:ss';

export type DateTimeFormats = {
  [K in DateTimeFormat]: { [P in K]: string } & {
    [P in Exclude<DateTimeFormat, K>]?: never;
  };
}[DateTimeFormat];

export type DateTimeComponents =
  | (OrdinalDate & Partial<TimeComponents>)
  | (CalendarDate & Partial<TimeComponents>);

export type DateLike = { getTime(): number };

export type DateTimeLike =
  | ISO
  | Milliseconds
  | DateTime
  | DateLike
  | DateTimeComponents
  | DateTimeFormats;

export type Milliseconds = number;
export type Seconds = number;
export type Minutes = number;
export type Hours = number;
export type Days = number;
export type ISO = string;
