# Tests

We use the Jest testing framework for unit tests and integration tests. If you
have the `jest` binary in your path, you can enter `jest` to run unit tests and
integration tests.

## Unit Tests

Unit tests are meant to test pieces of code in isolation. A unit test for a
file called `foo.ts` should be named using `unit` like `foo.unit.test.ts`. It
should *not* go in the `/tests` directory. It should live right next to the
file it tests as shown below.

```
dir/
    foo.ts
    foo.unit.test.ts
    bar.ts
    bar.unit.test.ts
    subdir/
        baz.ts
        baz.unit.test.ts
```

### Running Unit Tests

To run only unit tests, enter `jest unit`.

### Adding a Unit Test

Suppose you want to test `foo.ts`.

1. Create a file named `foo.unit.test.ts` in the same directory as `foo.ts`.
2. In `foo.unit.test.ts`, import the code you want to test from `foo.ts`.
3. Write your test(s). See Jest docs for how to write tests.
4. Enter `jest` to run all tests or `jest unit` to run unit tests.

## Integration Tests

Integration tests are meant to test how different pieces of code work together.
We put integration tests in the `/tests/int` directory. An integration test
`bing` should be named using `int` like `bing.int.test.ts`.

Here is how the `/tests/int` directory should look.

```
/tests
    /int
        bing.int.test.ts
        bong.int.test.ts
```

### Running Integration Tests

To run only integration tests, enter `jest int`.

### Adding an Integration Test

Suppose you want to test how `foo.ts`, `bar.ts`, and `baz.ts` are working
together. You should give this integration test a meaningful name. For example,
if `foo.ts`, `bar.ts`, and `baz.ts` work together to form an API, you could
name your integration test `api.int.test.ts`.

1. Create a file for your test with a meaningful name.
2. In the new file, import the code you want to test.
3. Write your test(s). See Jest docs for how to write tests.
4. Enter `jest` to run all tests or `jest int` to run integration tests.