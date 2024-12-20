# DateTime.js

A tiny and dependency-free library for date and time manipulation in JavaScript. It provides an elegant, chainable API with immutable operations, making it easy to perform complex date arithmetic while avoiding common pitfalls.

## Key Features

- 🔄 **Immutable operations** - All operations return new instances, preventing accidental state mutations
- 🔗 **Chainable API** - Fluent interface for composing multiple operations
- 📅 **UTC-based** - Works with UTC milliseconds internally, avoiding timezone complexities
- ⚡ **Zero dependencies** - Tiny footprint, built on native JavaScript Date
- 🎯 **Type-safe** - Written in TypeScript with full type definitions

## Design

The library is built around two main concepts:

1. **DateTime**: An immutable wrapper around a timestamp (milliseconds since Unix Epoch). Each operation returns a new DateTime instance, making it safe and predictable to work with.

2. **Duration**: Represents a length of time, supporting both:
    - Absolute durations (days, hours, minutes, seconds, milliseconds)
    - Relative durations (months, years) which handle calendar complexities

## API

This library provides two classes: `DateTime` and `Duration`.

### `DateTime` class

A `DateTime` object is created by a factory method, followed by a chain of operations and concluded by a terminal method.

#### Factory methods

- `DateTime.now(): DateTime`
  ```ts
  // Get current time
  DateTime.now(); // 2024-01-01T00:00:00.000Z
  ```

- `DateTime.from(dateTime: DateTimeLike): DateTime`
  ```ts
  // From milliseconds
  DateTime.from(1704067200000); // 2024-01-01T00:00:00.000Z

  // From ISO string
  DateTime.from('2024-01-01T00:00:00.000Z');

  // From Date object
  DateTime.from(new Date());

  // From another DateTime object
  DateTime.from(DateTime.now());
  ```

#### Arithmetic operations

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

- `days()` - Get days since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').days() // 19722
  ```

- `hours()` - Get hours since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').hours() // 473328
  ```

- `minutes()` - Get minutes since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').minutes() // 28399680
  ```

- `seconds()` - Get seconds since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').seconds() // 1704067200
  ```

- `millis()` - Get milliseconds since Unix Epoch
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').millis() // 1704067200000
  ```

- `timestamp()` - Get seconds since Unix Epoch (floored)
  ```ts
  DateTime.from('2024-01-01T00:00:00.500Z').timestamp() // 1704067200
  ```

- `date()` - Get JavaScript Date object
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').date() // Date object
  ```

- `iso()` - Get ISO string representation
  ```ts
  DateTime.now().iso() // "2024-01-01T00:00:00.000Z"
  ```

- `year()` - Get the year
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').year() // 2024
  ```

- `dayOfYear()` - Get the day of year (1-365/366)
  ```ts
  DateTime.from('2024-01-01T00:00:00.000Z').dayOfYear() // 1
  DateTime.from('2024-12-31T00:00:00.000Z').dayOfYear() // 366 (leap year)
  ```

- `hourOfDay()` - Get the hour of day (0-23)
  ```ts
  DateTime.from('2024-01-01T12:00:00.000Z').hourOfDay() // 12
  ```


### `Duration` class

The `Duration` class represents a length of time. It supports absolute durations (days and smaller units) but not relative durations (months/years).

#### Factory methods

- `Duration.of(duration: AbsoluteDuration)`
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

- `Duration.diff(start: DateTimeLike, end: DateTimeLike)`
  ```ts
  Duration.diff(
    '2024-01-01T00:00:00.000Z',
    '2024-01-02T00:00:00.000Z'
  ) // 24 hours
  ```

#### Terminal methods

- `days()` - Get duration in days
  ```ts
  Duration.hours(25).days() // 1.0416666666666667
  Duration.hours(25).days({ round: true }) // 1
  ```

- `hours()` - Get duration in hours
  ```ts
  Duration.minutes(150).hours() // 2.5
  Duration.minutes(150).hours({ round: true }) // 3
  ```

- `minutes()` - Get duration in minutes
  ```ts
  Duration.seconds(150).minutes() // 2.5
  Duration.seconds(150).minutes({ round: true }) // 3
  ```

- `seconds()` - Get duration in seconds
  ```ts
  Duration.millis(2500).seconds() // 2.5
  Duration.millis(2500).seconds({ round: true }) // 3
  ```

- `millis()` - Get duration in milliseconds
  ```ts
  Duration.seconds(1.5).millis() // 1500
  ```

- `iso()` - Get ISO duration string
  ```ts
  Duration.of({ days: 1, hours: 2, minutes: 30 }).iso()
  // "P1DT2H30M"
  ```

#### Arithmetic operations

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
