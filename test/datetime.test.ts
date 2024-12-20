import { describe, expect, test, vi } from 'vitest';
import { DateTime } from '../src/datetime.js';
import { dates } from './fixtures.js';

vi.useFakeTimers();
vi.setSystemTime(new Date(dates.jan1_2024));

describe('DateTime', () => {
  describe('instant()', () => {
    test('should return current time in milliseconds', () => {
      expect(DateTime.instant()).toBe(Date.now());
    });
  });

  describe('now()', () => {
    test('should create datetime from current time', () => {
      const date = new Date();
      const datetime = DateTime.now();

      expect(datetime.millis()).toBe(date.getTime());
    });
  });

  describe('from()', () => {
    test('should create datetime from ISO string', () => {
      const isoString = dates.jan1_2024;
      const date = new Date(isoString);
      const dateTime = DateTime.from(isoString);

      expect(dateTime.millis()).toBe(date.getTime());
    });

    test('should create datetime from milliseconds', () => {
      const isoString = dates.jan1_2024;
      const date = new Date(isoString);
      const dateTime = DateTime.from(date.getTime());

      expect(dateTime.millis()).toBe(date.getTime());
    });

    test('should create datetime from another datetime instance', () => {
      const original = DateTime.from(dates.jan1_2024);
      const copy = DateTime.from(original);

      expect(copy.millis()).toBe(original.millis());
    });
  });

  describe('plus()', () => {
    test('should handle absolute units correctly', () => {
      // Days
      // 2024-01-01T00:00:00.000Z + 1 day = 2024-01-02T00:00:00.000Z
      expect(DateTime.from(dates.jan1_2024).plus({ days: 1 }).iso()).toBe(
        '2024-01-02T00:00:00.000Z',
      );

      // Days and hours
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      expect(
        DateTime.from(dates.jan1_2024).plus({ days: 1, hours: 2 }).iso(),
      ).toBe('2024-01-02T02:00:00.000Z');

      // Days, hours, and minutes
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours + 30 minutes:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      // Step 3: +30 minutes = 2024-01-02T02:30:00.000Z
      expect(
        DateTime.from(dates.jan1_2024)
          .plus({ days: 1, hours: 2, minutes: 30 })
          .iso(),
      ).toBe('2024-01-02T02:30:00.000Z');

      // Days, hours, minutes, and seconds
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours + 30 minutes + 15 seconds:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      // Step 3: +30 minutes = 2024-01-02T02:30:00.000Z
      // Step 4: +15 seconds = 2024-01-02T02:30:15.000Z
      expect(
        DateTime.from(dates.jan1_2024)
          .plus({ days: 1, hours: 2, minutes: 30, seconds: 15 })
          .iso(),
      ).toBe('2024-01-02T02:30:15.000Z');

      // Days, hours, minutes, seconds, and milliseconds
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours + 30 minutes + 15 seconds + 500 milliseconds:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      // Step 3: +30 minutes = 2024-01-02T02:30:00.000Z
      // Step 4: +15 seconds = 2024-01-02T02:30:15.000Z
      // Step 5: +500 milliseconds = 2024-01-02T02:30:15.500Z
      expect(
        DateTime.from(dates.jan1_2024)
          .plus({ days: 1, hours: 2, minutes: 30, seconds: 15, millis: 500 })
          .iso(),
      ).toBe('2024-01-02T02:30:15.500Z');
    });

    test('should handle relative units correctly', () => {
      // Adding months in leap year
      // 2024-01-31T00:00:00.000Z + 1 month = 2024-02-29T00:00:00.000Z (last day of Feb in leap year)
      expect(DateTime.from(dates.jan31_2024).plus({ months: 1 }).iso()).toBe(
        '2024-02-29T00:00:00.000Z',
      );

      // 2024-02-29T00:00:00.000Z + 1 month = 2024-03-29T00:00:00.000Z
      expect(DateTime.from(dates.feb29_2024).plus({ months: 1 }).iso()).toBe(
        '2024-03-29T00:00:00.000Z',
      );

      // 2024-03-31T00:00:00.000Z + 1 month = 2024-04-30T00:00:00.000Z (last day of Apr)
      expect(DateTime.from(dates.mar31_2024).plus({ months: 1 }).iso()).toBe(
        '2024-04-30T00:00:00.000Z',
      );

      // Adding months in non-leap year
      // 2025-01-31T00:00:00.000Z + 1 month = 2025-02-28T00:00:00.000Z (last day of Feb in non-leap year)
      expect(DateTime.from(dates.jan31_2025).plus({ months: 1 }).iso()).toBe(
        '2025-02-28T00:00:00.000Z',
      );

      // Complex relative durations
      // 2024-01-31T00:00:00.000Z + 13 months + 1 year:
      // Step 1: +1 year = 2025-01-31T00:00:00.000Z
      // Step 2: +13 months = 2026-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from(dates.jan31_2024).plus({ months: 13, years: 1 }).iso(),
      ).toBe('2026-02-28T00:00:00.000Z');

      // Adding months and years to leap day
      // 2024-02-29T00:00:00.000Z + 12 months + 1 year:
      // Step 1: +1 year = 2025-02-28T00:00:00.000Z (non-leap year)
      // Step 2: +12 months = 2026-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from(dates.feb29_2024).plus({ months: 12, years: 1 }).iso(),
      ).toBe('2026-02-28T00:00:00.000Z');

      // Combined relative and absolute durations
      // 2024-01-31T00:00:00.000Z + 1 month + 1 day + 2 hours:
      // Step 1: +1 month = 2024-02-29T00:00:00.000Z (leap year)
      // Step 2: +1 day = 2024-03-01T00:00:00.000Z
      // Step 3: +2 hours = 2024-03-01T02:00:00.000Z
      expect(
        DateTime.from(dates.jan31_2024)
          .plus({
            months: 1,
            days: 1,
            hours: 2,
          })
          .iso(),
      ).toBe('2024-03-01T02:00:00.000Z');

      // 2024-02-29T00:00:00.000Z + 1 month + 2 days + 12 hours:
      // Step 1: +1 month = 2024-03-29T00:00:00.000Z
      // Step 2: +2 days = 2024-03-31T00:00:00.000Z
      // Step 3: +12 hours = 2024-03-31T12:00:00.000Z
      expect(
        DateTime.from(dates.feb29_2024)
          .plus({
            months: 1,
            days: 2,
            hours: 12,
          })
          .iso(),
      ).toBe('2024-03-31T12:00:00.000Z');
    });
  });

  describe('minus()', () => {
    test('should handle absolute units correctly', () => {
      // Days
      // 2024-01-01T00:00:00.000Z - 1 day = 2023-12-31T00:00:00.000Z
      expect(DateTime.from(dates.jan1_2024).minus({ days: 1 }).iso()).toBe(
        '2023-12-31T00:00:00.000Z',
      );

      // Days and hours
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      expect(
        DateTime.from(dates.jan1_2024).minus({ days: 1, hours: 2 }).iso(),
      ).toBe('2023-12-30T22:00:00.000Z');

      // Days, hours, and minutes
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours - 30 minutes:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      // Step 3: -30 minutes = 2023-12-30T21:30:00.000Z
      expect(
        DateTime.from(dates.jan1_2024)
          .minus({ days: 1, hours: 2, minutes: 30 })
          .iso(),
      ).toBe('2023-12-30T21:30:00.000Z');

      // Days, hours, minutes, and seconds
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours - 30 minutes - 15 seconds:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      // Step 3: -30 minutes = 2023-12-30T21:30:00.000Z
      // Step 4: -15 seconds = 2023-12-30T21:29:45.000Z
      expect(
        DateTime.from(dates.jan1_2024)
          .minus({ days: 1, hours: 2, minutes: 30, seconds: 15 })
          .iso(),
      ).toBe('2023-12-30T21:29:45.000Z');

      // Days, hours, minutes, seconds, and milliseconds
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours - 30 minutes - 15 seconds - 500 milliseconds:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      // Step 3: -30 minutes = 2023-12-30T21:30:00.000Z
      // Step 4: -15 seconds = 2023-12-30T21:29:45.000Z
      // Step 5: -500 milliseconds = 2023-12-30T21:29:44.500Z
      expect(
        DateTime.from(dates.jan1_2024)
          .minus({ days: 1, hours: 2, minutes: 30, seconds: 15, millis: 500 })
          .iso(),
      ).toBe('2023-12-30T21:29:44.500Z');
    });

    test('should handle relative units correctly', () => {
      // Subtracting months in leap year
      // 2024-03-31T00:00:00.000Z - 1 month = 2024-02-29T00:00:00.000Z (last day of Feb in leap year)
      expect(DateTime.from(dates.mar31_2024).minus({ months: 1 }).iso()).toBe(
        '2024-02-29T00:00:00.000Z',
      );

      // 2024-02-29T00:00:00.000Z - 1 month = 2024-01-29T00:00:00.000Z
      expect(DateTime.from(dates.feb29_2024).minus({ months: 1 }).iso()).toBe(
        '2024-01-29T00:00:00.000Z',
      );

      // 2024-01-31T00:00:00.000Z - 1 month = 2023-12-31T00:00:00.000Z (last day of Dec)
      expect(DateTime.from(dates.jan31_2024).minus({ months: 1 }).iso()).toBe(
        '2023-12-31T00:00:00.000Z',
      );

      // Subtracting months in non-leap year
      // 2025-03-31T00:00:00.000Z - 1 month = 2025-02-28T00:00:00.000Z (last day of Feb in non-leap year)
      expect(DateTime.from(dates.mar31_2025).minus({ months: 1 }).iso()).toBe(
        '2025-02-28T00:00:00.000Z',
      );

      // Complex relative durations
      // 2024-02-29T00:00:00.000Z - 13 months - 1 year:
      // Step 1: -1 year = 2023-02-28T00:00:00.000Z (non-leap year)
      // Step 2: -13 months = 2022-01-29T00:00:00.000Z
      expect(
        DateTime.from(dates.feb29_2024).minus({ months: 13, years: 1 }).iso(),
      ).toBe('2022-01-29T00:00:00.000Z');

      // Subtracting months and years from leap day
      // 2024-02-29T00:00:00.000Z - 12 months - 1 year:
      // Step 1: -1 year = 2023-02-28T00:00:00.000Z (non-leap year)
      // Step 2: -12 months = 2022-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from(dates.feb29_2024).minus({ months: 12, years: 1 }).iso(),
      ).toBe('2022-02-28T00:00:00.000Z');

      // Combined relative and absolute durations
      // 2024-03-31T00:00:00.000Z - 1 month - 2 days - 12 hours:
      // Step 1: -1 month = 2024-02-29T00:00:00.000Z (leap year)
      // Step 2: -2 days = 2024-02-27T00:00:00.000Z
      // Step 3: -12 hours = 2024-02-26T12:00:00.000Z
      expect(
        DateTime.from(dates.mar31_2024)
          .minus({ months: 1, days: 2, hours: 12 })
          .iso(),
      ).toBe('2024-02-26T12:00:00.000Z');

      // 2024-02-29T00:00:00.000Z - 1 month - 1 day - 2 hours:
      // Step 1: -1 month = 2024-01-29T00:00:00.000Z
      // Step 2: -1 day = 2024-01-28T00:00:00.000Z
      // Step 3: -2 hours = 2024-01-27T22:00:00.000Z
      expect(
        DateTime.from(dates.feb29_2024)
          .minus({ months: 1, days: 1, hours: 2 })
          .iso(),
      ).toBe('2024-01-27T22:00:00.000Z');
    });
  });

  describe('millis()', () => {
    test('should return datetime in milliseconds', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.millis()).toBe(date.getTime());
    });
  });

  describe('seconds()', () => {
    test('should return datetime in seconds', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.seconds()).toBe(Math.floor(date.getTime() / 1000));
    });
  });

  describe('minutes()', () => {
    test('should return datetime in minutes', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.minutes()).toBe(date.getTime() / 1000 / 60);
    });
  });

  describe('hours()', () => {
    test('should return datetime in hours', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.hours()).toBe(date.getTime() / 1000 / 60 / 60);
    });
  });

  describe('days()', () => {
    test('should return datetime in days', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.days()).toBe(date.getTime() / 1000 / 60 / 60 / 24);
    });
  });

  describe('timestamp()', () => {
    test('should return datetime in seconds', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);
      expect(dateTime.timestamp()).toBe(Math.floor(date.getTime() / 1000));
    });
  });

  describe('iso()', () => {
    test('should return ISO string representation of datetime', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);

      expect(dateTime.iso()).toBe(isoString);
    });
  });

  describe('toString()', () => {
    test('should return datetime as string', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);

      expect(dateTime.toString()).toBe(isoString);
    });
  });

  describe('valueOf()', () => {
    test('should return datetime as number', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);

      expect(dateTime.valueOf()).toBe(new Date(isoString).getTime());
    });
  });

  describe('date()', () => {
    test('should return JavaScript Date object', () => {
      const isoString = dates.jan1_2024;
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.date()).toBeInstanceOf(Date);
      expect(dateTime.date()).toEqual(date);
    });
  });

  describe('dayOfYear()', () => {
    test('should return correct day of year for various dates', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').dayOfYear()).toBe(1); // First day of year
      expect(DateTime.from('2024-02-29T00:00:00.000Z').dayOfYear()).toBe(60); // Leap year day
      expect(DateTime.from('2024-12-31T00:00:00.000Z').dayOfYear()).toBe(366); // Last day of leap year
      expect(DateTime.from('2023-12-31T00:00:00.000Z').dayOfYear()).toBe(365); // Last day of normal year
      expect(DateTime.from('2023-07-04T00:00:00.000Z').dayOfYear()).toBe(185); // Mid-year date
    });
  });

  describe('year()', () => {
    test('should return correct year for various dates', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').year()).toBe(2024); // New year
      expect(DateTime.from('2023-12-31T23:59:59.999Z').year()).toBe(2023); // End of year
      expect(DateTime.from('1999-12-31T00:00:00.000Z').year()).toBe(1999); // End of century
      expect(DateTime.from('2000-01-01T00:00:00.000Z').year()).toBe(2000); // Start of millennium
    });
  });

  describe('hourOfDay()', () => {
    test('should return correct hour of day for various times', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').hourOfDay()).toBe(0); // Midnight (00:00)
      expect(DateTime.from('2024-01-01T01:00:00.000Z').hourOfDay()).toBe(1); // 1 AM
      expect(DateTime.from('2024-01-01T12:00:00.000Z').hourOfDay()).toBe(12); // Noon
      expect(DateTime.from('2024-01-01T23:00:00.000Z').hourOfDay()).toBe(23); // 11 PM
    });
  });
});
