# lite-emit

[![NPM version](https://img.shields.io/npm/v/lite-emit?color=a1b858&label=)](https://www.npmjs.com/package/lite-emit)

A simple, lightweight, and fast event emitter.

## Usage

```ts
import { LiteEmit } from "lite-emit";

interface Events {
  foo: [string]
  bar: ["bar", number, symbol]
  baz: [42]
}

const emitter = new LiteEmit<Events>();

const fooListener1 = (str: string) => {
  console.log(str);
};

const fooListener2 = (str: string) => {
  console.log(str);
};

const fooListener3 = (str: string) => {
  console.log(str);
};

// Add listeners
// Chainable
emitter.on("foo", fooListener1);
emitter.on("foo", fooListener2);
emitter.on("foo", fooListener3).emit("foo", "hello");
emitter.on("baz", (num) => { console.log(num); }).emit("baz", "42");
// 42

// Remove a specified listener for a specified event
emitter.off("foo", fooListener1).emit("foo", "hello");
// Output:
// hello
// hello

// Remove all listeners for a specified event
emitter.off("foo");
// Output:
// <NONE>

emitter.emit("baz", 42);
// Output:
// 42

// Remove all wildcard listeners
emitter.off("*");

// Remove all listeners for all events
emitter.off("**");
```

## License

[MIT](./LICENSE) License © 2022 [Ray](https://github.com/so1ve)
