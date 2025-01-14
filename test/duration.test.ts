import { describe, expect, test, vi } from 'vitest';
import { DateTime } from '../src/datetime.js';
import { Duration } from '../src/duration.js';

vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('Duration', () => {
  describe('factory', () => {
    describe('from()', () => {
      test('should create duration from object', () => {
        expect(Duration.from({ days: 1 }).millis()).toBe(24 * 60 * 60 * 1000);
        expect(Duration.from({ hours: 2 }).millis()).toBe(2 * 60 * 60 * 1000);
        expect(Duration.from({ minutes: 30 }).millis()).toBe(30 * 60 * 1000);
        expect(Duration.from({ seconds: 15 }).millis()).toBe(15 * 1000);
        expect(Duration.from({ millis: 500 }).millis()).toBe(500);
        expect(Duration.from({ days: 1, hours: 2 }).millis()).toBe(
          1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        );
        expect(Duration.from({ days: 1, hours: 2, minutes: 30 }).millis()).toBe(
          1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 30 * 60 * 1000,
        );
        expect(
          Duration.from({
            days: 1,
            hours: 2,
            minutes: 30,
            seconds: 15,
          }).millis(),
        ).toBe(
          1 * 24 * 60 * 60 * 1000 +
            2 * 60 * 60 * 1000 +
            30 * 60 * 1000 +
            15 * 1000,
        );
        expect(
          Duration.from({
            days: 1,
            hours: 2,
            minutes: 30,
            seconds: 15,
            millis: 500,
          }).millis(),
        ).toBe(
          1 * 24 * 60 * 60 * 1000 +
            2 * 60 * 60 * 1000 +
            30 * 60 * 1000 +
            15 * 1000 +
            500,
        );
      });

      test('should handle empty duration object', () => {
        expect(Duration.from({}).millis()).toBe(0);
      });
    });

    describe('between()', () => {
      test('should create duration from ISO strings', () => {
        expect(
          Duration.between(
            '2024-01-01T00:00:00.000Z',
            '2024-01-02T00:00:00.000Z',
          ).millis(),
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          Duration.between(
            '2024-01-02T00:00:00.000Z',
            '2024-01-01T00:00:00.000Z',
          ).millis(),
        ).toBe(-24 * 60 * 60 * 1000);
      });

      test('should create duration from milliseconds', () => {
        expect(
          Duration.between(
            new Date('2024-01-01T00:00:00.000Z').getTime(),
            new Date('2024-01-02T00:00:00.000Z').getTime(),
          ).millis(),
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          Duration.between(
            new Date('2024-01-02T00:00:00.000Z').getTime(),
            new Date('2024-01-01T00:00:00.000Z').getTime(),
          ).millis(),
        ).toBe(-24 * 60 * 60 * 1000);
      });

      test('should create duration from Date', () => {
        expect(
          Duration.between(
            new Date('2024-01-01T00:00:00.000Z'),
            new Date('2024-01-02T00:00:00.000Z'),
          ).millis(),
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          Duration.between(
            new Date('2024-01-02T00:00:00.000Z'),
            new Date('2024-01-01T00:00:00.000Z'),
          ).millis(),
        ).toBe(-24 * 60 * 60 * 1000);
      });

      test('should create duration from DateTime', () => {
        expect(
          Duration.between(
            DateTime.from('2024-01-01T00:00:00.000Z'),
            DateTime.from('2024-01-02T00:00:00.000Z'),
          ).millis(),
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          Duration.between(
            DateTime.from('2024-01-02T00:00:00.000Z'),
            DateTime.from('2024-01-01T00:00:00.000Z'),
          ).millis(),
        ).toBe(-24 * 60 * 60 * 1000);
      });

      test('should create duration from Date and DateTime', () => {
        expect(
          Duration.between(
            new Date('2024-01-01T00:00:00.000Z'),
            DateTime.from('2024-01-02T00:00:00.000Z'),
          ).millis(),
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          Duration.between(
            DateTime.from('2024-01-02T00:00:00.000Z'),
            new Date('2024-01-01T00:00:00.000Z'),
          ).millis(),
        ).toBe(-24 * 60 * 60 * 1000);
      });
    });

    describe('days()', () => {
      test('should create duration from days', () => {
        const duration = Duration.days(2);

        expect(duration.millis()).toBe(2 * 24 * 60 * 60 * 1000);
      });
    });

    describe('hours()', () => {
      test('should create duration from hours', () => {
        const duration = Duration.hours(3);

        expect(duration.millis()).toBe(3 * 60 * 60 * 1000);
      });
    });

    describe('minutes()', () => {
      test('should create duration from minutes', () => {
        const duration = Duration.minutes(45);

        expect(duration.millis()).toBe(45 * 60 * 1000);
      });
    });

    describe('seconds()', () => {
      test('should create duration from seconds', () => {
        const duration = Duration.seconds(90);

        expect(duration.millis()).toBe(90 * 1000);
      });
    });

    describe('millis()', () => {
      test('should create duration from milliseconds', () => {
        const duration = Duration.millis(1500);

        expect(duration.millis()).toBe(1500);
      });
    });
  });

  describe('instance', () => {
    describe('millis()', () => {
      test('should return duration in milliseconds', () => {
        const duration = Duration.from({ hours: 2, minutes: 30 });

        expect(duration.millis()).toBe(2 * 60 * 60 * 1000 + 30 * 60 * 1000);
      });
    });

    describe('iso()', () => {
      test('should return ISO string representation of duration', () => {
        expect(Duration.from({ days: 1 }).iso()).toBe('P1D');
        expect(Duration.from({ hours: 1 }).iso()).toBe('PT1H');
        expect(Duration.from({ minutes: 1 }).iso()).toBe('PT1M');
        expect(Duration.from({ seconds: 1 }).iso()).toBe('PT1S');
        expect(Duration.from({ days: 1, hours: 1 }).iso()).toBe('P1DT1H');
        expect(Duration.from({ hours: 2, minutes: 30 }).iso()).toBe('PT2H30M');
        expect(
          Duration.from({ hours: 2, minutes: 30, seconds: 15 }).iso(),
        ).toBe('PT2H30M15S');
        expect(
          Duration.from({
            hours: 2,
            minutes: 30,
            seconds: 15,
            millis: 500,
          }).iso(),
        ).toBe('PT2H30M15S');
      });
    });

    describe('toString()', () => {
      test('should return duration as string', () => {
        const duration = Duration.from({ seconds: 1, millis: 999 });
        expect(duration.toString()).toBe('PT1S');
      });
    });

    describe('valueOf()', () => {
      test('should return duration as number', () => {
        const duration = Duration.from({ seconds: 1, millis: 999 });
        expect(duration.valueOf()).toBe(1_000 + 999);
      });
    });

    describe('days()', () => {
      test('should return duration in days', () => {
        const duration = Duration.from({ days: 2, hours: 12 });
        expect(duration.days()).toBe(2.5);
      });

      test('should convert to days with different rounding options', () => {
        const duration = Duration.hours(25);

        expect(duration.days()).toBe(1.0416666666666667);
        expect(duration.days({ round: true })).toBe(1);
        expect(duration.days({ round: 'up' })).toBe(2);
        expect(duration.days({ round: 'down' })).toBe(1);
      });

      test('should return diff in days', () => {
        // 01.01.2024 (start of day) - 31.12.2024 (end of day) = ~365.99999998842594 days
        expect(
          Duration.between(
            '2024-01-01T00:00:00.000Z',
            '2024-12-31T23:59:59.999Z',
          ).days(),
        ).toBeLessThan(366);
        expect(
          Duration.between(
            '2024-01-01T00:00:00.000Z',
            '2024-12-31T23:59:59.999Z',
          ).days({
            round: true,
          }),
        ).toBe(366);

        // 01.01.2024 (start of day) - 01.01.2025 (start of day) = 366 days
        expect(
          Duration.between(
            '2024-01-01T00:00:00.000Z',
            '2025-01-01T00:00:00.000Z',
          ).days(),
        ).toBe(366);
        // 31.12.2023 (end of day) - 31.12.2024 (end of day) = 366
        expect(
          Duration.between(
            '2023-12-31T23:59:59.999Z',
            '2024-12-31T23:59:59.999Z',
          ).days(),
        ).toBe(366);
      });
    });

    describe('hours()', () => {
      test('should return duration in hours', () => {
        const duration = Duration.from({ hours: 2, minutes: 30 });
        expect(duration.hours()).toBe(2.5);
      });

      test('should convert to hours with different rounding options', () => {
        const duration = Duration.minutes(150);

        expect(duration.hours()).toBe(2.5);
        expect(duration.hours({ round: true })).toBe(3);
        expect(duration.hours({ round: 'up' })).toBe(3);
        expect(duration.hours({ round: 'down' })).toBe(2);
      });
    });

    describe('minutes()', () => {
      test('should return duration in minutes', () => {
        const duration = Duration.from({ minutes: 2, seconds: 30 });
        expect(duration.minutes()).toBe(2.5);
      });

      test('should convert to minutes with different rounding options', () => {
        const duration = Duration.seconds(150);

        expect(duration.minutes()).toBe(2.5);
        expect(duration.minutes({ round: true })).toBe(3);
        expect(duration.minutes({ round: 'up' })).toBe(3);
        expect(duration.minutes({ round: 'down' })).toBe(2);
      });
    });
    describe('seconds()', () => {
      test('should return duration in seconds', () => {
        const duration = Duration.from({ seconds: 2, millis: 500 });
        expect(duration.seconds()).toBe(2.5);
      });

      test('should convert to seconds with different rounding options', () => {
        const duration = Duration.millis(2500);

        expect(duration.seconds()).toBe(2.5);
        expect(duration.seconds({ round: true })).toBe(3);
        expect(duration.seconds({ round: 'up' })).toBe(3);
        expect(duration.seconds({ round: 'down' })).toBe(2);
      });
    });

    describe('plus()', () => {
      test('should add two durations correctly', () => {
        const duration1 = Duration.from({ hours: 2, minutes: 30 });
        const duration2 = { hours: 1, minutes: 45 };
        const result = duration1.plus(duration2);

        expect(result.minutes()).toBe(255); // 4 hours and 15 minutes = 255 minutes
      });
    });

    describe('minus()', () => {
      test('should subtract two durations correctly', () => {
        const duration1 = Duration.from({ hours: 5 });
        const duration2 = { hours: 2, minutes: 30 };
        const result = duration1.minus(duration2);

        expect(result.minutes()).toBe(150); // 2.5 hours = 150 minutes
      });
    });
  });
});
