import { describe, expect, it } from "vitest";

import { LiteEmit } from "../src/index";

interface EventMap {
  foo: [string]
  bar: ["bar", number, symbol]
  baz: [42]
}

// @ts-expect-error i have no idea
const emitter = new LiteEmit<EventMap>();

const Sym = Symbol("d");

let countFoo = 0;
let countBar = 0;
let countBaz = 0;

describe("should", () => {
  it("on", () => {
    emitter.on("foo", (str) => {
      countFoo++;
      expect(str).toBe("foo");
    });
    emitter.on("bar", (str, num, symbol) => {
      countBar++;
      expect(str).toBe("bar");
      expect(num).toBe(42);
      expect(symbol).toBe(Sym);
    });
    emitter.on("baz", (num) => {
      countBaz++;
      expect(num).toBe(42);
    });
  });

  it("emit", () => {
    emitter.emit("foo", "foo");
    emitter.emit("bar", "bar", 42, Sym);
    emitter.emit("baz", 42);
  });

  it("off", () => {
    emitter.off("foo");
    emitter.emit("foo", "foo");
    expect(countFoo).toBe(1);
  });

  it("clear", () => {
    emitter.clear("bar");
    emitter.emit("bar", "bar", 42, Sym);
    expect(countBar).toBe(1);
    expect(countBaz).toBe(1);
  });
});
