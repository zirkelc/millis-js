[![CI](https://github.com/zirkelc/millis-js/actions/workflows/ci.yml/badge.svg)](https://github.com/zirkelc/millis-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/millis-js)](https://www.npmjs.com/package/millis-js)
[![npm](https://img.shields.io/npm/dt/millis-js)](https://www.npmjs.com/package/millis-js)

# Millis.js

A tiny and dependency-free library for date and time manipulation in JavaScript. It provides an elegant, chainable API with immutable operations, making it easy to perform complex date arithmetic while avoiding common pitfalls.

## Key Features

- 🔄 **Immutable operations** - All operations return new instances, preventing accidental state mutations
- 🔗 **Chainable API** - Fluent interface for composing multiple operations
- 📅 **UTC-based** - Works with UTC milliseconds internally, avoiding timezone complexities
- ⚡ **Zero dependencies** - Tiny footprint, built on native JavaScript Date
- 🎯 **Type-safe** - Written in TypeScript with full type definitions

## API

This library provides two classes: `DateTime` and `Duration`.

### `DateTime` class

The `DateTime` class represents a millisecond timestamp.

#### Factory methods

Factory methods return a new `DateTime` instance.

- `DateTime.now(): DateTime`
  ```ts
  // Get current time
  DateTime.now(); 
  ```

- `DateTime.from(dateTime: DateTimeLike): DateTime`
  ```ts
  // From milliseconds
  DateTime.from(1704067200000); 

  // From ISO string
  DateTime.from('2024-01-01T00:00:00.000Z');

  // From Date object
  DateTime.from(new Date());

  // From another DateTime object
  DateTime.from(DateTime.now());
  ```

- `DateTime.millis(): number`
  ```ts
  // Get current time in milliseconds (same as Date.now())
  DateTime.millis();
  ```

#### Arithmetic operations

DateTime accepts both absolute (days, hours, minutes, seconds, milliseconds) and relative (months, years) durations.

- `plus(duration: AbsoluteDuration & RelativeDuration): DateTime`
  ```ts
  // Add absolute durations (days and smaller units)
  DateTime.from('2024-01-01T00:00:00.000Z')
    .plus({ days: 1, hours: 2, minutes: 30 })
    // 2024-01-02T02:30:00.000Z

  // Add relative durations (months/years)
  DateTime.from('2024-01-31T00:00:00.000Z')
    .plus({ months: 1 })
    // 2024-02-29T00:00:00.000Z (handles leap years)

  // Combine absolute and relative durations
  DateTime.from('2024-01-31T00:00:00.000Z')
    .plus({ months: 1, days: 1, hours: 2 })
    // 2024-03-01T02:00:00.000Z
  ```

- `minus(duration: AbsoluteDuration & RelativeDuration): DateTime`
  ```ts
  // Subtract absolute durations
  DateTime.from('2024-01-01T00:00:00.000Z')
    .minus({ days: 1, hours: 2 })
    // 2023-12-30T22:00:00.000Z

  // Subtract relative durations
  DateTime.from('2024-03-31T00:00:00.000Z')
    .minus({ months: 1 })
    // 2024-02-29T00:00:00.000Z (handles leap years)
  ```

#### Terminal methods

Terminal methods end the chain and return a final value.

- `days(): number` - Get days since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').days() // 19722
  ```

- `hours(): number` - Get hours since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').hours() // 473328
  ```

- `minutes(): number` - Get minutes since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').minutes() // 28399680
  ```

- `seconds(): number` - Get seconds since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').seconds() // 1704067200
  ```

- `millis(): number` - Get milliseconds since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').millis() // 1704067200000
  ```

- `timestamp(): number` - Get seconds since Unix Epoch (floored)
  ```ts
  DateTime.from('2024-01-01T00:00:00.500Z').timestamp() // 1704067200
  ```

- `date(): Date` - Get JavaScript Date object
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').date() // Date object
  ```

- `iso(): string` - Get ISO string representation
  ```ts
  DateTime.now().iso() // "2024-01-01T00:00:00.000Z"
  ```

- `year(): number` - Get the year
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').year() // 2024
  ```

- `dayOfYear(): number` - Get the day of year (1-365/366)
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').dayOfYear() // 1
  DateTime.from('2024-12-31T00:00:00.000Z').dayOfYear() // 366 (leap year)
  ```

- `hourOfDay(): number` - Get the hour of day (0-23)
  ```ts
  DateTime.from('2024-01-01T12:00:00.000Z').hourOfDay() // 12
  ```

### `Duration` class

The `Duration` class represents a length of time.

#### Factory methods

Factory methods return a new `Duration` instance.

- `Duration.of(duration: AbsoluteDuration): Duration`
  ```ts
  Duration.of({ 
    days: 1,
    hours: 2,
    minutes: 30,
    seconds: 15,
    millis: 500
  })
  ```

- `Duration.days(days: number): Duration`
  ```ts
  Duration.days(2)
  ```

- `Duration.hours(hours: number): Duration`
  ```ts
  Duration.hours(3)
  ```

- `Duration.minutes(minutes: number): Duration`
  ```ts
  Duration.minutes(45)
  ```

- `Duration.seconds(seconds: number): Duration`
  ```ts
  Duration.seconds(90)
  ```

- `Duration.millis(millis: number): Duration`
  ```ts
  Duration.millis(1500)
  ```

- `Duration.diff(start: DateTimeLike, end: DateTimeLike): Duration`
  ```ts
  Duration.diff(
    '2024-01-01T00:00:00.000Z',
    '2024-01-02T00:00:00.000Z'
  ) // 24 hours
  ```

#### Arithmetic operations

Duration accepts absolute durations (days, hours, minutes, seconds, milliseconds) only.

- `plus(duration: AbsoluteDuration): Duration`
  ```ts
  Duration.hours(2)
    .plus({ minutes: 30 })
    // 2.5 hours
  ```

- `minus(duration: AbsoluteDuration): Duration`
  ```ts
  Duration.hours(5)
    .minus({ hours: 2, minutes: 30 })
    // 2.5 hours
  ```

- `abs()` - Get absolute value of duration
  ```ts
  Duration.hours(-2).abs() // 2 hours
  ```

#### Terminal methods

Terminal methods end the chain and return a final value.

- `days(): number` - Get duration in days
  ```ts
  Duration.hours(25).days() // 1.0416666666666667
  Duration.hours(25).days({ round: true }) // 1
  ```

- `hours(): number` - Get duration in hours
  ```ts
  Duration.minutes(150).hours() // 2.5
  Duration.minutes(150).hours({ round: true }) // 3
  ```

- `minutes(): number` - Get duration in minutes
  ```ts
  Duration.seconds(150).minutes() // 2.5
  Duration.seconds(150).minutes({ round: true }) // 3
  ```

- `seconds(): number` - Get duration in seconds
  ```ts
  Duration.millis(2500).seconds() // 2.5
  Duration.millis(2500).seconds({ round: true }) // 3
  ```

- `millis(): number` - Get duration in milliseconds
  ```ts
  Duration.seconds(1.5).millis() // 1500
  ```

- `iso(): string` - Get ISO duration string
  ```ts
  Duration.of({ days: 1, hours: 2, minutes: 30 }).iso()
  // "P1DT2H30M"
  ```

## License

MIT
