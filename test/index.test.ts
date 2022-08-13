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
let countBaz1 = 0;
let countBaz2 = 0;

describe("should", () => {
  const wildcardEvents: any[] = [];
  const bazListener1 = (num: number) => {
    countBaz1++;
    expect(num).toBe(42);
  };
  const bazListener2 = (num: number) => {
    countBaz2++;
    expect(num).toBe(42);
  };
  const wildcardListener1 = (...args: any[]) => {
    wildcardEvents.push(args);
  };
  const wildcardListener2 = (...args: any[]) => {
    wildcardEvents.push(args);
  };
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
    // Chainable
    emitter.on("baz", bazListener1)
      .on("baz", bazListener2);
  });

  it("on wildcard", () => {
    emitter.on("*", wildcardListener1);
    emitter.on("*", wildcardListener2);
  });

  it("emit", () => {
    emitter.emit("foo", "foo")
      .emit("bar", "bar", 42, Sym)
      .emit("baz", 42);
  });

  it("off", () => {
    expect(countFoo).toBe(1);
    emitter.off("foo");
    emitter.emit("foo", "foo");
    expect(countFoo).toBe(1);
    emitter.off("baz", bazListener1);
    emitter.emit("baz", 42);
    expect(countBaz1).toBe(1);
    expect(countBaz2).toBe(2);
  });

  it("off wildcard", () => {
    expect(countBar).toBe(1);
    expect(countBaz1).toBe(1);
    expect(countBaz2).toBe(2);
    emitter.off("*", wildcardListener1);
    emitter.emit("bar", "bar", 42, Sym);
    expect(countBar).toBe(2);
    expect(countBaz1).toBe(1);
    expect(countBaz2).toBe(2);
    emitter.off("*");
    expect(countBar).toBe(2);
    expect(countBaz1).toBe(1);
    expect(countBaz2).toBe(2);
  });

  it("on wildcard listens all events", () => {
    expect(wildcardEvents).toHaveLength(11);
  });
});
