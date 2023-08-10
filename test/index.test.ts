import { describe, expect, it } from "vitest";

import { LiteEmit } from "../src/index";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
	const wildcardEvents: any[] = [];
	function bazListener1(num: number) {
		count3++;

		expect(num).toBe(42);
	}
	function bazListener2(num: number) {
		count4++;

		expect(num).toBe(42);
	}
	function wildcardListener1(...args: any[]) {
		wildcardEvents.push(args);
	}
	function wildcardListener2(...args: any[]) {
		wildcardEvents.push(args);
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
		// Chainable
		emitter.on("baz", bazListener1).on("baz", bazListener2);
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
		emitter.emit("foo", "foo").emit("bar", "bar", 42, Sym).emit("baz", 42);
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
		expect(wildcardEvents).toHaveLength(15);
	});

	it("clear", () => {
		emitter.off();
		emitter.emit("bar", "bar", 42, Sym);

		expect(count2).toBe(3);
	});

	it("errorHandler", () => {
		emitter
			.on("error", () => {
				throw new Error("Foo");
			})
			.emit("error");

		expect(errorMsgs[0]).toBe("Foo");
	});

	it("errorHandler async", () => {
		emitter
			.on("error2", async () => {
				throw new Error("Bar");
			})
			.emit("error2");

		// Wait for async action
		setTimeout(() => {
			expect(errorMsgs[1]).toBe("Bar");
		}, 500);
	});
});
