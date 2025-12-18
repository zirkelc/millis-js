/**
 * Parses a string, number, or undefined value to a number.
 */
export const parseNumber = (value: string | number | undefined): number => {
  if (!value) throw new Error('Invalid value');
  const parsed = typeof value === 'string' ? Number.parseInt(value) : value;
  if (Number.isNaN(parsed)) throw new Error('Invalid value');
  return parsed;
};

/**
 * Pads a number with leading zeros to a given length.
 */
export const pad = (value: number, length: number): string => {
  return value.toString().padStart(length, '0');
};

/**
 * Creates an array of numbers progressing from start up to, but not including, end.
 */
export function range(start: number, end: number): Array<number> {
  const length = Math.abs(end - start);
  const step = end >= start ? 1 : -1;

  return Array.from({ length }, (_, i) => start + i * step);
}

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

/**
 * Checks if a value is an Intl.DateTimeFormat instance.
 */
export const isDateTimeFormat = (
  value: unknown,
): value is Intl.DateTimeFormat => {
  return (
    value instanceof Intl.DateTimeFormat ||
    (isObject(value) && 'format' in value && typeof value.format === 'function')
  );
};
