# lite-emit

[![NPM version](https://img.shields.io/npm/v/lite-emit?color=a1b858&label=)](https://www.npmjs.com/package/lite-emit)

A simple, lightweight, and fast event emitter.

## Usage

```ts
import { LiteEmit } from "lite-emit";

interface Events {
	foo: [string];
	bar: ["bar", number, symbol];
	baz: [42];
}

const emitter = new LiteEmit<Events>();

function fooListener1(str: string) {
	console.log(str);
}

function fooListener2(str: string) {
	console.log(str);
}

function fooListener3(str: string) {
	console.log(str);
}

// Add listeners
emitter.on("foo", fooListener1);
emitter.on("foo", fooListener2);
emitter.on("foo", fooListener3);
emitter.emit("foo", "hello");
emitter.on("baz", (num) => {
	console.log(num);
});
emitter.emit("baz", "42");
// 42

// You can retrieve an `off` function when adding a listener
const offQuxListener2 = emitter.on("qux", (str) => {
	console.log(str);
});
emitter.emit("qux", "hello");
// Output:
// hello
offQuxListener2();
emitter.emit("qux", "hello");
// Output:
// <NONE>

// Remove a specified listener for a specified event
emitter.off("foo", fooListener1);
emitter.emit("foo", "hello");
// Output:
// hello
// hello

// Add wildcard listeners
// Always called on every emit, no matter if the event has listeners or not
emitter.on("*", (event, ...args) => {
	console.log(`Wildcard listener: event=${event}, args=${args}`);
});

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
emitter.off();
```

## License

[MIT](./LICENSE) License © 2022 [Ray](https://github.com/so1ve)
