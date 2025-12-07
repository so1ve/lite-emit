import { describe, expect, it } from "vitest";

import { LiteEmit, chain } from "../src";

// eslint-disable-next-line ts/consistent-type-definitions
type EventMap = {
	foo: [string];
	bar: ["bar", number, symbol];
	baz: [42];
	faq: [];
	error: [];
	error2: [];
};

const errorMsgs: string[] = [];

const emitter = new LiteEmit<EventMap>({
	errorHandler: (s: any) => errorMsgs.push(s.message),
});

const Sym = Symbol("d");

let count1 = 0;
let count2 = 0;
let count3 = 0;
let count4 = 0;
let count5 = 0;

describe("should", () => {
	let wildcardCount = 0;
	function bazListener1(num: number) {
		count3++;

		expect(num).toBe(42);
	}
	function bazListener2(num: number) {
		count4++;

		expect(num).toBe(42);
	}
	function wildcardListener1() {
		wildcardCount++;
	}
	function wildcardListener2() {
		wildcardCount++;
	}

	it("on", () => {
		emitter.on("foo", (str) => {
			count1++;

			expect(str).toBe("foo");
		});
		emitter.on("bar", (str, num, symbol) => {
			count2++;

			expect(str).toBe("bar");
			expect(num).toBe(42);
			expect(symbol).toBe(Sym);
		});
		emitter.on("baz", bazListener1);
		emitter.on("baz", bazListener2);
	});

	it("off function", () => {
		const offFoo = emitter.on("foo", () => {
			count1++;
		});
		offFoo();
	});

	it("on wildcard", () => {
		emitter.on("*", wildcardListener1);
		emitter.on("*", wildcardListener2);
	});

	it("once", () => {
		emitter.once("faq", () => {
			count5++;
		});
		emitter.emit("faq");
		emitter.emit("faq");

		expect(count5).toBe(1);
	});

	it("emit", () => {
		emitter.emit("foo", "foo");
		emitter.emit("bar", "bar", 42, Sym);
		emitter.emit("baz", 42);
	});

	it("off", () => {
		expect(count1).toBe(1);

		emitter.off("foo");
		emitter.emit("foo", "foo");

		expect(count1).toBe(1);

		emitter.off("baz", bazListener1);
		emitter.emit("baz", 42);

		expect(count3).toBe(1);
		expect(count4).toBe(2);
	});

	it("off wildcard", () => {
		expect(count2).toBe(1);
		expect(count3).toBe(1);
		expect(count4).toBe(2);

		emitter.off("*", wildcardListener1);
		emitter.emit("bar", "bar", 42, Sym);

		expect(count2).toBe(2);
		expect(count3).toBe(1);
		expect(count4).toBe(2);

		emitter.off("*");
		emitter.emit("bar", "bar", 42, Sym);

		expect(count2).toBe(3);
		expect(count3).toBe(1);
		expect(count4).toBe(2);
	});

	it("on wildcard listens all events", () => {
		expect(wildcardCount).toBe(15);
	});

	it("clear", () => {
		emitter.off();
		emitter.emit("bar", "bar", 42, Sym);

		expect(count2).toBe(3);
	});

	it("errorHandler", () => {
		emitter.on("error", () => {
			throw new Error("Foo");
		});
		emitter.emit("error");

		expect(errorMsgs[0]).toBe("Foo");
	});

	it("errorHandler async", () => {
		emitter.on("error2", async () => {
			throw new Error("Bar");
		});
		emitter.emit("error2");

		// Wait for async action
		setTimeout(() => {
			expect(errorMsgs[1]).toBe("Bar");
		}, 500);
	});
});

describe("chain", () => {
	const Sym = Symbol("d");

	it("should be chainable and work correctly", () => {
		const emitter = new LiteEmit<EventMap>();
		const chained = chain(emitter);
		let onCount = 0;
		let onceCount = 0;

		chained
			.on("foo", (str) => {
				onCount++;

				expect(str).toBe("foo");
			})
			.once("bar", (str, num, symbol) => {
				onceCount++;

				expect(str).toBe("bar");
				expect(num).toBe(42);
				expect(symbol).toBe(Sym);
			});

		chained.emit("foo", "foo");

		expect(onCount).toBe(1);

		chained.emit("bar", "bar", 42, Sym);

		expect(onceCount).toBe(1);

		// once should not trigger again
		chained.emit("bar", "bar", 42, Sym);

		expect(onceCount).toBe(1);

		// off should work
		chained.off("foo").emit("foo", "foo");

		expect(onCount).toBe(1);
	});

	it("should handle wildcard listeners", () => {
		const emitter = new LiteEmit<EventMap>();
		const chained = chain(emitter);
		let wildcardCount = 0;

		chained
			.on("*", () => {
				wildcardCount++;
			})
			.emit("foo", "foo")
			.emit("bar", "bar", 42, Sym);

		expect(wildcardCount).toBe(2);

		chained.off("*").emit("foo", "foo");

		expect(wildcardCount).toBe(2);
	});

	it("should handle off() to clear all listeners", () => {
		const emitter = new LiteEmit<EventMap>();
		const chained = chain(emitter);
		let count = 0;
		chained
			.on("foo", () => {
				count++;
			})
			.emit("foo", "foo");

		expect(count).toBe(1);

		chained.off().emit("foo", "foo");

		expect(count).toBe(1);
	});

	it("should unwrap to the original emitter", () => {
		const emitter = new LiteEmit<EventMap>();
		const chained = chain(emitter);

		expect(chained.unwrap()).toBe(emitter);

		// Verify that operations on the unwrapped emitter are reflected
		let count = 0;
		chained
			.on("foo", () => {
				count++;
			})
			.emit("foo", "foo");

		expect(count).toBe(1);
	});
});
