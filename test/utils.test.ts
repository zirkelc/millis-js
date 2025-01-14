import { describe, expect, test } from 'vitest';
import { pad, parseNumber, range } from '../src/utils.js';

describe('parseNumber', () => {
  test('should parse a string to a number', () => {
    expect(parseNumber('123')).toBe(123);
  });

  test('should parse a number to a number', () => {
    expect(parseNumber(123)).toBe(123);
  });

  test('should throw an error if the value is not a valid number', () => {
    expect(() => parseNumber('')).toThrow();
  });
});

describe('pad', () => {
  test('should pad a number with leading zeros to a given length', () => {
    expect(pad(1, 2)).toBe('01');
    expect(pad(1, 3)).toBe('001');
    expect(pad(1, 4)).toBe('0001');
  });
});

describe('range', () => {
  test('should return an array of numbers for ascending start and end', () => {
    const result = range(0, 7);
    expect(result.length).toEqual(7);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test('should return an array of numbers for descending start and end', () => {
    const result = range(7, 0);
    expect(result.length).toEqual(7);
    expect(result).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  test('should return an array of numbers for negative start', () => {
    const result = range(-7, 0);
    expect(result.length).toEqual(7);
    expect(result).toEqual([-7, -6, -5, -4, -3, -2, -1]);
  });

  test('should return an array of numbers for negative end', () => {
    const result = range(0, -7);
    expect(result.length).toEqual(7);
    expect(result).toEqual([0, -1, -2, -3, -4, -5, -6]);
  });

  test('should return an array of numbers for negative start and end', () => {
    const result = range(-7, -14);
    expect(result.length).toEqual(7);
    expect(result).toEqual([-7, -8, -9, -10, -11, -12, -13]);
  });
});
