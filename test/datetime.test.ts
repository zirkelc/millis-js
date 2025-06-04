import { describe, expect, test, vi } from 'vitest';
import { DateTime } from '../src/datetime.js';

vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

type MethodsWithPrefix<T, P extends string> = {
  [K in keyof T]: K extends `${P}${string}`
    ? T[K] extends (...args: Array<any>) => any
      ? K
      : never
    : never;
}[keyof T];

type StartOfMethods = MethodsWithPrefix<DateTime, 'startOf'>;
type EndOfMethods = MethodsWithPrefix<DateTime, 'endOf'>;
type IsStartOfMethods = MethodsWithPrefix<DateTime, 'isStartOf'>;
type IsEndOfMethods = MethodsWithPrefix<DateTime, 'isEndOf'>;
type IsSameMethods = MethodsWithPrefix<DateTime, 'isSame'>;

describe('DateTime', () => {
  describe('millis()', () => {
    test('should return current time in milliseconds', () => {
      expect(DateTime.millis()).toBe(Date.now());
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
    describe('string', () => {
      test('should create datetime from ISO format', () => {
        const isoString = '2024-01-01T00:00:00.000Z';
        const date = new Date(isoString);
        const dateTime = DateTime.from(isoString);

        expect(dateTime.millis()).toBe(date.getTime());
      });

      test('should create datetime from ISO format with offset', () => {
        const isoString = '2024-01-01T00:00:00.000+01:00';
        const date = new Date(isoString);
        const dateTime = DateTime.from(isoString);

        expect(dateTime.millis()).toBe(date.getTime());
      });

      test('should create datetime from YYYY format', () => {
        const str = '2024';
        const date = new Date(str);
        const dateTime = DateTime.from(str);

        expect(dateTime.millis()).toBe(date.getTime());
      });

      test('should create datetime from YYYY-MM-DD format', () => {
        const str = '2024-02-29';
        const date = new Date(str);
        const dateTime = DateTime.from(str);

        expect(dateTime.millis()).toBe(date.getTime());
      });

      test('should create datetime from YYYY-DDD format', () => {
        const str = '2024-060';
        const date = new Date(Date.UTC(2024, 1, 29));
        const dateTime = DateTime.from(str);

        expect(dateTime.millis()).toBe(date.getTime());
      });

      test('should throw error for invalid format', () => {
        const result = () => DateTime.from('20240229');
        expect(result).toThrow();
      });
    });

    describe('number', () => {
      test('should create datetime from milliseconds', () => {
        const isoString = '2024-01-01T00:00:00.000Z';
        const date = new Date(isoString);
        const dateTime = DateTime.from(date.getTime());

        expect(dateTime.millis()).toBe(date.getTime());
      });
    });

    describe('date', () => {
      test('should create datetime from date instance', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const dateTime = DateTime.from(date);

        expect(dateTime.millis()).toBe(date.getTime());
      });
    });

    describe('datetime', () => {
      test('should create datetime from another datetime instance', () => {
        const original = DateTime.from('2024-01-01T00:00:00.000Z');
        const copy = DateTime.from(original);

        expect(copy.millis()).toBe(original.millis());
      });
    });

    describe('object', () => {
      test('should create datetime with date components', () => {
        expect(DateTime.from({ year: 2024, dayOfYear: 60 }).iso()).toBe(
          '2024-02-29T00:00:00.000Z',
        );
        expect(
          DateTime.from({
            year: 2024,
            month: 2,
            dayOfMonth: 29,
          }).iso(),
        ).toBe('2024-02-29T00:00:00.000Z');
      });

      test('should create datetime with time components', () => {
        expect(
          DateTime.from({
            year: 2024,
            dayOfYear: 60,
            hour: 12,
            minute: 34,
            second: 56,
            millisecond: 789,
          }).iso(),
        ).toBe('2024-02-29T12:34:56.789Z');
        expect(
          DateTime.from({
            year: 2024,
            month: 2,
            dayOfMonth: 29,
            hour: 12,
            minute: 34,
            second: 56,
            millisecond: 789,
          }).iso(),
        ).toBe('2024-02-29T12:34:56.789Z');
      });

      test('should throw error for invalid day of year', () => {
        expect(() => DateTime.from({ year: 2024, dayOfYear: 367 })).toThrow(
          'Invalid day of year: 367 for year 2024',
        );
      });

      test('should throw error for invalid date components', () => {
        expect(() =>
          DateTime.from({ year: 2024, month: 2, dayOfMonth: 30 }),
        ).toThrow('Invalid date components');
      });

      test('should throw error for invalid types', () => {
        expect(() => DateTime.from({} as any)).toThrow();
        expect(() => DateTime.from(null as any)).toThrow();
        expect(() => DateTime.from(undefined as any)).toThrow();
      });
    });
    // describe('format', () => {
    //   test('should create datetime from format object YYYY', () => {
    //     const dateTime = DateTime.from({ YYYY: '2024' });
    //     expect(dateTime.year()).toBe(2024);
    //   });

    //   test('should create datetime from format object YYYY-MM-DD', () => {
    //     const dateTime = DateTime.from({ 'YYYY-MM-DD': '2024-02-29' });
    //     expect(dateTime.iso()).toBe('2024-02-29T00:00:00.000Z');
    //   });

    //   test('should create datetime from format object YYYY-DDD', () => {
    //     const dateTime = DateTime.from({ 'YYYY-DDD': '2024-060' });
    //     expect(dateTime.iso()).toBe('2024-02-29T00:00:00.000Z');
    //   });

    //   test('should throw error for invalid format', () => {
    //     const result = () => DateTime.from({ 'YYYY-M-D': '2024-02-29' } as any);
    //     expect(result).toThrow();
    //   });
    // });
  });

  describe('plus()', () => {
    test('should handle absolute units correctly', () => {
      // Days
      // 2024-01-01T00:00:00.000Z + 1 day = 2024-01-02T00:00:00.000Z
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z').plus({ days: 1 }).iso(),
      ).toBe('2024-01-02T00:00:00.000Z');

      // Days and hours
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z')
          .plus({ days: 1, hours: 2 })
          .iso(),
      ).toBe('2024-01-02T02:00:00.000Z');

      // Days, hours, and minutes
      // 2024-01-01T00:00:00.000Z + 1 day + 2 hours + 30 minutes:
      // Step 1: +1 day = 2024-01-02T00:00:00.000Z
      // Step 2: +2 hours = 2024-01-02T02:00:00.000Z
      // Step 3: +30 minutes = 2024-01-02T02:30:00.000Z
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z')
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
        DateTime.from('2024-01-01T00:00:00.000Z')
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
        DateTime.from('2024-01-01T00:00:00.000Z')
          .plus({ days: 1, hours: 2, minutes: 30, seconds: 15, millis: 500 })
          .iso(),
      ).toBe('2024-01-02T02:30:15.500Z');
    });

    test('should handle relative units correctly', () => {
      // Adding months in leap year
      // 2024-01-31T00:00:00.000Z + 1 month = 2024-02-29T00:00:00.000Z (last day of Feb in leap year)
      expect(
        DateTime.from('2024-01-31T00:00:00.000Z').plus({ months: 1 }).iso(),
      ).toBe('2024-02-29T00:00:00.000Z');

      // 2024-02-29T00:00:00.000Z + 1 month = 2024-03-29T00:00:00.000Z
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z').plus({ months: 1 }).iso(),
      ).toBe('2024-03-29T00:00:00.000Z');

      // 2024-03-31T00:00:00.000Z + 1 month = 2024-04-30T00:00:00.000Z (last day of Apr)
      expect(
        DateTime.from('2024-03-31T00:00:00.000Z').plus({ months: 1 }).iso(),
      ).toBe('2024-04-30T00:00:00.000Z');

      // Adding months in non-leap year
      // 2025-01-31T00:00:00.000Z + 1 month = 2025-02-28T00:00:00.000Z (last day of Feb in non-leap year)
      expect(
        DateTime.from('2025-01-31T00:00:00.000Z').plus({ months: 1 }).iso(),
      ).toBe('2025-02-28T00:00:00.000Z');

      // Complex relative durations
      // 2024-01-31T00:00:00.000Z + 13 months + 1 year:
      // Step 1: +1 year = 2025-01-31T00:00:00.000Z
      // Step 2: +13 months = 2026-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from('2024-01-31T00:00:00.000Z')
          .plus({ months: 13, years: 1 })
          .iso(),
      ).toBe('2026-02-28T00:00:00.000Z');

      // Adding months and years to leap day
      // 2024-02-29T00:00:00.000Z + 12 months + 1 year:
      // Step 1: +1 year = 2025-02-28T00:00:00.000Z (non-leap year)
      // Step 2: +12 months = 2026-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z')
          .plus({ months: 12, years: 1 })
          .iso(),
      ).toBe('2026-02-28T00:00:00.000Z');

      // Combined relative and absolute durations
      // 2024-01-31T00:00:00.000Z + 1 month + 1 day + 2 hours:
      // Step 1: +1 month = 2024-02-29T00:00:00.000Z (leap year)
      // Step 2: +1 day = 2024-03-01T00:00:00.000Z
      // Step 3: +2 hours = 2024-03-01T02:00:00.000Z
      expect(
        DateTime.from('2024-01-31T00:00:00.000Z')
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
        DateTime.from('2024-02-29T00:00:00.000Z')
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
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z').minus({ days: 1 }).iso(),
      ).toBe('2023-12-31T00:00:00.000Z');

      // Days and hours
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z')
          .minus({ days: 1, hours: 2 })
          .iso(),
      ).toBe('2023-12-30T22:00:00.000Z');

      // Days, hours, and minutes
      // 2024-01-01T00:00:00.000Z - 1 day - 2 hours - 30 minutes:
      // Step 1: -1 day = 2023-12-31T00:00:00.000Z
      // Step 2: -2 hours = 2023-12-30T22:00:00.000Z
      // Step 3: -30 minutes = 2023-12-30T21:30:00.000Z
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z')
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
        DateTime.from('2024-01-01T00:00:00.000Z')
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
        DateTime.from('2024-01-01T00:00:00.000Z')
          .minus({ days: 1, hours: 2, minutes: 30, seconds: 15, millis: 500 })
          .iso(),
      ).toBe('2023-12-30T21:29:44.500Z');
    });

    test('should handle relative units correctly', () => {
      // Subtracting months in leap year
      // 2024-03-31T00:00:00.000Z - 1 month = 2024-02-29T00:00:00.000Z (last day of Feb in leap year)
      expect(
        DateTime.from('2024-03-31T00:00:00.000Z').minus({ months: 1 }).iso(),
      ).toBe('2024-02-29T00:00:00.000Z');

      // 2024-02-29T00:00:00.000Z - 1 month = 2024-01-29T00:00:00.000Z
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z').minus({ months: 1 }).iso(),
      ).toBe('2024-01-29T00:00:00.000Z');

      // 2024-01-31T00:00:00.000Z - 1 month = 2023-12-31T00:00:00.000Z (last day of Dec)
      expect(
        DateTime.from('2024-01-31T00:00:00.000Z').minus({ months: 1 }).iso(),
      ).toBe('2023-12-31T00:00:00.000Z');

      // Subtracting months in non-leap year
      // 2025-03-31T00:00:00.000Z - 1 month = 2025-02-28T00:00:00.000Z (last day of Feb in non-leap year)
      expect(
        DateTime.from('2025-03-31T00:00:00.000Z').minus({ months: 1 }).iso(),
      ).toBe('2025-02-28T00:00:00.000Z');

      // Complex relative durations
      // 2024-02-29T00:00:00.000Z - 13 months - 1 year:
      // Step 1: -1 year = 2023-02-28T00:00:00.000Z (non-leap year)
      // Step 2: -13 months = 2022-01-29T00:00:00.000Z
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z')
          .minus({ months: 13, years: 1 })
          .iso(),
      ).toBe('2022-01-29T00:00:00.000Z');

      // Subtracting months and years from leap day
      // 2024-02-29T00:00:00.000Z - 12 months - 1 year:
      // Step 1: -1 year = 2023-02-28T00:00:00.000Z (non-leap year)
      // Step 2: -12 months = 2022-02-28T00:00:00.000Z (non-leap year)
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z')
          .minus({ months: 12, years: 1 })
          .iso(),
      ).toBe('2022-02-28T00:00:00.000Z');

      // Combined relative and absolute durations
      // 2024-03-31T00:00:00.000Z - 1 month - 2 days - 12 hours:
      // Step 1: -1 month = 2024-02-29T00:00:00.000Z (leap year)
      // Step 2: -2 days = 2024-02-27T00:00:00.000Z
      // Step 3: -12 hours = 2024-02-26T12:00:00.000Z
      expect(
        DateTime.from('2024-03-31T00:00:00.000Z')
          .minus({ months: 1, days: 2, hours: 12 })
          .iso(),
      ).toBe('2024-02-26T12:00:00.000Z');

      // 2024-02-29T00:00:00.000Z - 1 month - 1 day - 2 hours:
      // Step 1: -1 month = 2024-01-29T00:00:00.000Z
      // Step 2: -1 day = 2024-01-28T00:00:00.000Z
      // Step 3: -2 hours = 2024-01-27T22:00:00.000Z
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z')
          .minus({ months: 1, days: 1, hours: 2 })
          .iso(),
      ).toBe('2024-01-27T22:00:00.000Z');
    });
  });

  describe('format()', () => {
    test('should format date as YYYY', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').format('YYYY')).toBe(
        '2024',
      );
      expect(DateTime.from('1999-12-31T23:59:59.999Z').format('YYYY')).toBe(
        '1999',
      );
    });

    test('should format date as YYYY-DDD', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').format('YYYY-DDD')).toBe(
        '2024-001',
      );
      expect(DateTime.from('2024-12-31T23:59:59.999Z').format('YYYY-DDD')).toBe(
        '2024-366',
      );
      expect(DateTime.from('2023-12-31T23:59:59.999Z').format('YYYY-DDD')).toBe(
        '2023-365',
      );
    });

    test('should format date as YYYY-MM-DD', () => {
      expect(
        DateTime.from('2024-01-01T00:00:00.000Z').format('YYYY-MM-DD'),
      ).toBe('2024-01-01');
      expect(
        DateTime.from('2024-12-31T23:59:59.999Z').format('YYYY-MM-DD'),
      ).toBe('2024-12-31');
      expect(
        DateTime.from('2024-02-29T00:00:00.000Z').format('YYYY-MM-DD'),
      ).toBe('2024-02-29');
    });

    test('should format time as HH:mm:ss', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').format('HH:mm:ss')).toBe(
        '00:00:00',
      );
      expect(DateTime.from('2024-01-01T23:59:59.999Z').format('HH:mm:ss')).toBe(
        '23:59:59',
      );
      expect(DateTime.from('2024-01-01T12:34:56.789Z').format('HH:mm:ss')).toBe(
        '12:34:56',
      );
    });

    test('should format using Intl.DateTimeFormat', () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(DateTime.from('2024-01-01T00:00:00.000Z').format(formatter)).toBe(
        'January 1, 2024',
      );
    });

    test('should throw error for unsupported format', () => {
      const result = () =>
        DateTime.from('2024-01-01T00:00:00.000Z').format('invalid' as any);
      expect(result).toThrow('Unsupported format: invalid');
    });
  });

  describe('toString()', () => {
    test('should return datetime as string', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);

      expect(dateTime.toString()).toBe(isoString);
    });
  });

  describe('valueOf()', () => {
    test('should return datetime as number', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);

      expect(dateTime.valueOf()).toBe(new Date(isoString).getTime());
    });
  });

  describe('iso()', () => {
    test('should return ISO string representation of datetime', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);

      expect(dateTime.iso()).toBe(isoString);
    });
  });

  describe('millis()', () => {
    test('should return datetime in milliseconds', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.millis()).toBe(date.getTime());
    });
  });

  describe('timestamp()', () => {
    test('should return datetime in seconds', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);
      expect(dateTime.timestamp()).toBe(Math.floor(date.getTime() / 1000));
    });
  });

  describe('date()', () => {
    test('should return JavaScript Date object', () => {
      const isoString = '2024-01-01T00:00:00.000Z';
      const dateTime = DateTime.from(isoString);
      const date = new Date(isoString);

      expect(dateTime.date()).toBeInstanceOf(Date);
      expect(dateTime.date()).toEqual(date);
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

  describe('dayOfYear()', () => {
    test('should return correct day of year for various dates', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').dayOfYear()).toBe(1); // First day of year
      expect(DateTime.from('2024-02-29T00:00:00.000Z').dayOfYear()).toBe(60); // Leap year day
      expect(DateTime.from('2024-12-31T00:00:00.000Z').dayOfYear()).toBe(366); // Last day of leap year
      expect(DateTime.from('2023-12-31T00:00:00.000Z').dayOfYear()).toBe(365); // Last day of normal year
      expect(DateTime.from('2023-07-04T00:00:00.000Z').dayOfYear()).toBe(185); // Mid-year date
    });
  });

  describe('dayOfMonth()', () => {
    test('should return correct day of month for various dates', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').dayOfMonth()).toBe(1); // First day of month
      expect(DateTime.from('2024-02-29T00:00:00.000Z').dayOfMonth()).toBe(29); // Leap year day
      expect(DateTime.from('2024-12-31T00:00:00.000Z').dayOfMonth()).toBe(31); // Last day of month
    });
  });

  describe('month()', () => {
    test('should return correct month for various dates', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').month()).toBe(1); // January
      expect(DateTime.from('2024-12-31T00:00:00.000Z').month()).toBe(12); // December
    });
  });

  describe('hour()', () => {
    test('should return correct hour of day for various times', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').hour()).toBe(0); // Midnight (00:00)
      expect(DateTime.from('2024-01-01T01:00:00.000Z').hour()).toBe(1); // 1 AM
      expect(DateTime.from('2024-01-01T12:00:00.000Z').hour()).toBe(12); // Noon
      expect(DateTime.from('2024-01-01T23:00:00.000Z').hour()).toBe(23); // 11 PM
    });
  });

  describe('minute()', () => {
    test('should return correct minute of hour for various times', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').minute()).toBe(0); // Midnight (00:00)
      expect(DateTime.from('2024-01-01T00:01:00.000Z').minute()).toBe(1); // 1 minute past midnight
      expect(DateTime.from('2024-01-01T00:59:00.000Z').minute()).toBe(59); // 59 minutes past midnight
    });
  });

  describe('second()', () => {
    test('should return correct second of minute for various times', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').second()).toBe(0); // Midnight (00:00:00)
      expect(DateTime.from('2024-01-01T00:00:01.000Z').second()).toBe(1); // 1 second past midnight
    });
  });

  describe('millisecond()', () => {
    test('should return correct millisecond of second for various times', () => {
      expect(DateTime.from('2024-01-01T00:00:00.000Z').millisecond()).toBe(0); // Midnight (00:00:00.000)
      expect(DateTime.from('2024-01-01T00:00:00.001Z').millisecond()).toBe(1); // 1 millisecond past midnight
    });
  });

  describe('startOf', () => {
    test.each<[StartOfMethods, string]>([
      ['startOfYear', '2024-01-01T00:00:00.000Z'],
      ['startOfMonth', '2024-03-01T00:00:00.000Z'],
      ['startOfDay', '2024-03-15T00:00:00.000Z'],
      ['startOfHour', '2024-03-15T12:00:00.000Z'],
      ['startOfMinute', '2024-03-15T12:34:00.000Z'],
      ['startOfSecond', '2024-03-15T12:34:56.000Z'],
    ])('%s should set time to start', (method, expected) => {
      // Arrange
      const dateTime = DateTime.from('2024-03-15T12:34:56.789Z');

      // Act
      const result = dateTime[method]();

      // Assert
      expect(result.iso()).toBe(expected);
    });
  });

  describe('endOf', () => {
    test.each<[EndOfMethods, string]>([
      ['endOfYear', '2024-12-31T23:59:59.999Z'],
      ['endOfMonth', '2024-03-31T23:59:59.999Z'],
      ['endOfDay', '2024-03-15T23:59:59.999Z'],
      ['endOfHour', '2024-03-15T12:59:59.999Z'],
      ['endOfMinute', '2024-03-15T12:34:59.999Z'],
      ['endOfSecond', '2024-03-15T12:34:56.999Z'],
    ])('%s', (method, expected) => {
      // Arrange
      const dateTime = DateTime.from('2024-03-15T12:34:56.789Z');

      // Act
      const result = dateTime[method]();

      // Assert
      expect(result.iso()).toBe(expected);
    });
  });

  describe('isStartOf', () => {
    test.each<[IsStartOfMethods, string]>([
      ['isStartOfYear', '2024-01-01T00:00:00.000Z'],
      ['isStartOfMonth', '2024-03-01T00:00:00.000Z'],
      ['isStartOfDay', '2024-03-15T00:00:00.000Z'],
      ['isStartOfHour', '2024-03-15T12:00:00.000Z'],
      ['isStartOfMinute', '2024-03-15T12:34:00.000Z'],
      ['isStartOfSecond', '2024-03-15T12:34:56.000Z'],
    ])('%s', (method, timestamp) => {
      // Arrange
      const dateTime = DateTime.from(timestamp);

      // Act & Assert
      expect(dateTime[method]()).toBe(true);
      expect(DateTime.from('2024-03-15T12:34:56.789Z')[method]()).toBe(false);
    });
  });

  describe('isEndOf', () => {
    test.each<[IsEndOfMethods, string]>([
      ['isEndOfYear', '2024-12-31T23:59:59.999Z'],
      ['isEndOfMonth', '2024-03-31T23:59:59.999Z'],
      ['isEndOfDay', '2024-03-15T23:59:59.999Z'],
      ['isEndOfHour', '2024-03-15T12:59:59.999Z'],
      ['isEndOfMinute', '2024-03-15T12:34:59.999Z'],
      ['isEndOfSecond', '2024-03-15T12:34:56.999Z'],
    ])('%s', (method, timestamp) => {
      // Arrange
      const dateTime = DateTime.from(timestamp);

      // Act & Assert
      expect(dateTime[method]()).toBe(true);
      expect(DateTime.from('2024-03-15T12:34:56.789Z')[method]()).toBe(false);
    });
  });

  describe('isSame', () => {
    test.each<[IsSameMethods, string, string, boolean]>([
      [
        'isSameSecond',
        '2024-03-15T12:34:56.123Z',
        '2024-03-15T12:34:56.789Z',
        true,
      ],
      [
        'isSameSecond',
        '2024-03-15T12:34:56.000Z',
        '2024-03-15T12:34:57.000Z',
        false,
      ],
      [
        'isSameMinute',
        '2024-03-15T12:34:10.000Z',
        '2024-03-15T12:34:50.000Z',
        true,
      ],
      [
        'isSameMinute',
        '2024-03-15T12:34:00.000Z',
        '2024-03-15T12:35:00.000Z',
        false,
      ],
      [
        'isSameHour',
        '2024-03-15T12:10:00.000Z',
        '2024-03-15T12:50:00.000Z',
        true,
      ],
      [
        'isSameHour',
        '2024-03-15T12:00:00.000Z',
        '2024-03-15T13:00:00.000Z',
        false,
      ],
      [
        'isSameDay',
        '2024-03-15T00:00:00.000Z',
        '2024-03-15T23:59:59.999Z',
        true,
      ],
      [
        'isSameDay',
        '2024-03-15T23:59:59.999Z',
        '2024-03-16T00:00:00.000Z',
        false,
      ],
      [
        'isSameMonth',
        '2024-03-01T00:00:00.000Z',
        '2024-03-31T23:59:59.999Z',
        true,
      ],
      [
        'isSameMonth',
        '2024-03-31T23:59:59.999Z',
        '2024-04-01T00:00:00.000Z',
        false,
      ],
      [
        'isSameYear',
        '2024-01-01T00:00:00.000Z',
        '2024-12-31T23:59:59.999Z',
        true,
      ],
      [
        'isSameYear',
        '2024-12-31T23:59:59.999Z',
        '2025-01-01T00:00:00.000Z',
        false,
      ],
    ])('%s', (method, timestamp1, timestamp2, expected) => {
      // Arrange
      const dateTime1 = DateTime.from(timestamp1);
      const dateTime2 = DateTime.from(timestamp2);

      // Act
      const result = dateTime1[method](dateTime2);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('isBefore()', () => {
    test('should return true when datetime is before target', () => {
      // Arrange
      const earlier = DateTime.from('2024-01-01T00:00:00.000Z');
      const later = DateTime.from('2024-01-02T00:00:00.000Z');

      // Act
      const result = earlier.isBefore(later);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when datetime is after target', () => {
      // Arrange
      const earlier = DateTime.from('2024-01-01T00:00:00.000Z');
      const later = DateTime.from('2024-01-02T00:00:00.000Z');

      // Act
      const result = later.isBefore(earlier);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when datetime is equal to target', () => {
      // Arrange
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-01T00:00:00.000Z');

      // Act
      const result = date1.isBefore(date2);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isAfter()', () => {
    test('should return true when datetime is after target', () => {
      // Arrange
      const earlier = DateTime.from('2024-01-01T00:00:00.000Z');
      const later = DateTime.from('2024-01-02T00:00:00.000Z');

      // Act
      const result = later.isAfter(earlier);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when datetime is before target', () => {
      // Arrange
      const earlier = DateTime.from('2024-01-01T00:00:00.000Z');
      const later = DateTime.from('2024-01-02T00:00:00.000Z');

      // Act
      const result = earlier.isAfter(later);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when datetime is equal to target', () => {
      // Arrange
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-01T00:00:00.000Z');

      // Act
      const result = date1.isAfter(date2);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isBetween()', () => {
    test('should return true when datetime is between start and end', () => {
      // Arrange
      const start = DateTime.from('2024-01-01T00:00:00.000Z');
      const middle = DateTime.from('2024-01-15T12:00:00.000Z');
      const end = DateTime.from('2024-01-31T23:59:59.999Z');

      // Act
      const result = middle.isBetween(start, end);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when datetime is equal to start', () => {
      // Arrange
      const start = DateTime.from('2024-01-01T00:00:00.000Z');
      const end = DateTime.from('2024-01-31T23:59:59.999Z');

      // Act
      const result = start.isBetween(start, end);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when datetime is equal to end', () => {
      // Arrange
      const start = DateTime.from('2024-01-01T00:00:00.000Z');
      const end = DateTime.from('2024-01-31T23:59:59.999Z');

      // Act
      const result = end.isBetween(start, end);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when datetime is before start', () => {
      // Arrange
      const start = DateTime.from('2024-01-01T00:00:00.000Z');
      const end = DateTime.from('2024-01-31T23:59:59.999Z');
      const before = DateTime.from('2023-12-31T23:59:59.999Z');

      // Act
      const result = before.isBetween(start, end);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when datetime is after end', () => {
      // Arrange
      const start = DateTime.from('2024-01-01T00:00:00.000Z');
      const end = DateTime.from('2024-01-31T23:59:59.999Z');
      const after = DateTime.from('2024-02-01T00:00:00.000Z');

      // Act
      const result = after.isBetween(start, end);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('equals()', () => {
    test('should return true if the datetimes are the same', () => {
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-01T00:00:00.000Z');

      expect(date1.equals(date2)).toBe(true);
    });

    test('should return false if the datetimes are different', () => {
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-02T00:00:00.000Z');

      expect(date1.equals(date2)).toBe(false);
    });
  });
  describe('compare()', () => {
    test('should return 0 if the datetimes are the same', () => {
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-01T00:00:00.000Z');

      expect(date1.compare(date2)).toBe(0);
    });

    test('should return negative value if the first datetime is before the second', () => {
      const date1 = DateTime.from('2024-01-01T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-02T00:00:00.000Z');

      expect(date1.compare(date2)).toBeLessThan(0);
    });

    test('should return positive value if the first datetime is after the second', () => {
      const date1 = DateTime.from('2024-01-02T00:00:00.000Z');
      const date2 = DateTime.from('2024-01-01T00:00:00.000Z');

      expect(date1.compare(date2)).toBeGreaterThan(0);
    });

    test('should sort datetimes in ascending order', () => {
      const datetimes = [
        DateTime.from('2024-01-03T00:00:00.000Z'),
        DateTime.from('2024-01-02T00:00:00.000Z'),
        DateTime.from('2024-01-01T00:00:00.000Z'),
      ];

      datetimes.sort((a, b) => a.compare(b));

      expect(datetimes).toEqual([
        DateTime.from('2024-01-01T00:00:00.000Z'),
        DateTime.from('2024-01-02T00:00:00.000Z'),
        DateTime.from('2024-01-03T00:00:00.000Z'),
      ]);
    });
  });
});
