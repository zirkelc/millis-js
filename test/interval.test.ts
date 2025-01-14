import { describe, expect, test, vi } from 'vitest';
import { DateTime } from '../src/datetime.js';
import { Duration } from '../src/duration.js';
import { Interval } from '../src/interval.js';

vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('Interval', () => {
  describe('factory', () => {
    describe('between()', () => {
      test('should create interval between two dates', () => {
        // Arrange
        const start = DateTime.from('2024-01-01T00:00:00.000Z');
        const end = DateTime.from('2024-01-02T00:00:00.000Z');

        // Act
        const interval = Interval.between(start, end);

        // Assert
        expect(interval.starts().iso()).toBe('2024-01-01T00:00:00.000Z');
        expect(interval.ends().iso()).toBe('2024-01-02T00:00:00.000Z');
        expect(interval.millis()).toBe(24 * 60 * 60 * 1_000); // 1 day
      });
    });

    describe('days()', () => {
      test('should create interval for the next days if days is positive', () => {
        // Arrange
        const now = DateTime.now();
        const tomorrow = now.plus({ days: 1 });
        const sevenDaysFromNow = now.plus({ days: 7 });

        // Act
        const next7days = Interval.days(7);

        // Assert
        expect(next7days.starts().iso()).toBe(now.iso());
        expect(next7days.ends().iso()).toBe(sevenDaysFromNow.iso());
        expect(next7days.millis()).toBe(7 * 24 * 60 * 60 * 1_000);

        const days = next7days.days();
        expect(days).toHaveLength(7);
        expect(days[0].iso()).toBe(now.iso());
        expect(days[1].iso()).toBe(tomorrow.iso());
        expect(days[6].iso()).toBe(sevenDaysFromNow.minus({ days: 1 }).iso());
      });

      test('should create interval for the past days if days is negative', () => {
        // Arrange
        const now = DateTime.now();
        const yesterday = now.minus({ days: 1 });
        const sevenDaysAgo = now.minus({ days: 7 });

        // Act
        const last7days = Interval.days(-7);

        // Assert
        expect(last7days.starts().iso()).toBe(now.iso());
        expect(last7days.ends().iso()).toBe(sevenDaysAgo.iso());
        expect(last7days.millis()).toBe(-7 * 24 * 60 * 60 * 1_000);

        const days = last7days.days();
        expect(days).toHaveLength(7);
        expect(days[0].iso()).toBe(now.iso());
        expect(days[1].iso()).toBe(yesterday.iso());
        expect(days[6].iso()).toBe(sevenDaysAgo.plus({ days: 1 }).iso());
      });
    });
  });

  describe('instance', () => {
    describe('duration()', () => {
      test('should return duration between start and end', () => {
        // Arrange
        const interval = Interval.between(
          '2024-01-01T00:00:00.000Z',
          '2024-01-02T12:30:45.000Z',
        );

        // Act
        const duration = interval.duration();

        // Assert
        expect(duration.hours()).toBe(36.5125);
      });
    });

    describe('iso()', () => {
      test('should return ISO string representation', () => {
        // Arrange
        const interval = Interval.between(
          '2024-01-01T00:00:00.000Z',
          '2024-01-02T00:00:00.000Z',
        );

        // Act
        const iso = interval.iso();

        // Assert
        expect(iso).toBe('2024-01-01T00:00:00.000Z/2024-01-02T00:00:00.000Z');
      });
    });

    describe('toString()', () => {
      test('should return same as iso()', () => {
        // Arrange
        const interval = Interval.between(
          '2024-01-01T00:00:00.000Z',
          '2024-01-02T00:00:00.000Z',
        );

        // Act & Assert
        expect(interval.toString()).toBe(interval.iso());
      });
    });
  });
});
