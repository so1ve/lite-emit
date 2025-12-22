import { describe, expect, it } from "vitest";

import { LiteEmit } from "../src";

// eslint-disable-next-line ts/consistent-type-definitions
type EventMap = {
	foo: [string];
	bar: ["bar", number, symbol];
	baz: [42];
	faq: [];
	error: [];
	error2: [];
	asyncEvent: [string];
	asyncEvent2: [number];
	concurrentEvent: [string];
	promiseErrorEvent: [];
};

const emitter = new LiteEmit<EventMap>();

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

	describe("await functionality", () => {
		it("should handle async listeners", async () => {
			let asyncResult = "";

			emitter.on("asyncEvent", async (str: string) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				asyncResult = `${str}-processed`;
			});

			await emitter.emit("asyncEvent", "test");

			expect(asyncResult).toBe("test-processed");
		});

		it("should return a Promise that can be awaited", async () => {
			const executionOrder: number[] = [];

			emitter.on("asyncEvent2", async (_num: number) => {
				executionOrder.push(1);
				await new Promise((resolve) => setTimeout(resolve, 10));
				executionOrder.push(2);
			});

			const promise = emitter.emit("asyncEvent2", 42);

			expect(promise).toBeInstanceOf(Promise);

			await promise;

			expect(executionOrder).toEqual([1, 2]);
		});

		it("should execute multiple async listeners concurrently", async () => {
			const startTime = Date.now();
			const delays: number[] = [];

			emitter.on("concurrentEvent", async (_str: string) => {
				const start = Date.now();
				await new Promise((resolve) => setTimeout(resolve, 50));
				delays.push(Date.now() - start);
			});

			emitter.on("concurrentEvent", async (_str: string) => {
				const start = Date.now();
				await new Promise((resolve) => setTimeout(resolve, 30));
				delays.push(Date.now() - start);
			});

			await emitter.emit("concurrentEvent", "test");
			const totalTime = Date.now() - startTime;

			// 并发执行，总时间应该接近最长的单个监听器时间，而不是所有时间的总和
			expect(totalTime).toBeLessThan(80); // 50ms + 30ms = 80ms，但并发执行应该更少
			expect(delays).toHaveLength(2);
		});

		it("should handle errors in async listeners", async () => {
			emitter.on("promiseErrorEvent", async () => {
				throw new Error("Async error");
			});

			await expect(emitter.emit("promiseErrorEvent")).rejects.toThrowError(
				"Async error",
			);
		});

		it("should work with mixed sync and async listeners", async () => {
			let syncResult = "";
			let asyncResult = "";

			emitter.on("asyncEvent", (str: string) => {
				syncResult = `${str}-sync`;
			});

			emitter.on("asyncEvent", async (str: string) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				asyncResult = `${str}-async`;
			});

			await emitter.emit("asyncEvent", "mixed");

			expect(syncResult).toBe("mixed-sync");
			expect(asyncResult).toBe("mixed-async");
		});
	});
});
