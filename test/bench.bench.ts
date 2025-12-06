import Emittery from "emittery";
import EventLite from "event-lite";
import EventEmitter3 from "eventemitter3";
import Mitt from "mitt";
import { createNanoEvents } from "nanoevents";
import { beforeEach, bench, describe } from "vitest";

import { LiteEmit } from "../src";

const liteEmit = new LiteEmit<{
	event: [number];
}>();
const emittery = new Emittery<{
	event: [number];
}>();
const eventLite = new EventLite();
const eventEmitter3 = new EventEmitter3<{
	event: [number];
}>();
const mitt = Mitt<{
	event: number;
}>();
const nanoEvents = createNanoEvents<{
	event: (number: number) => void;
}>();

let _counter = 0;

describe("bench", () => {
	liteEmit.on("event", (number) => {
		_counter += number;
	});
	emittery.on("event", ([number]) => {
		_counter += number;
	});
	eventLite.on("event", (number: number) => {
		_counter += number;
	});
	eventEmitter3.on("event", (number) => {
		_counter += number;
	});
	mitt.on("event", (number) => {
		_counter += number;
	});
	nanoEvents.on("event", (number) => {
		_counter += number;
	});

	beforeEach(() => {
		_counter = 0;
	});

	bench("LiteEmit", () => {
		liteEmit.emit("event", 1);
	});

	bench("Emittery", () => {
		emittery.emit("event", [1]);
	});

	bench("EventLite", () => {
		eventLite.emit("event", 1);
	});

	bench("EventEmitter3", () => {
		eventEmitter3.emit("event", 1);
	});

	bench("Mitt", () => {
		mitt.emit("event", 1);
	});

	bench("NanoEvents", () => {
		nanoEvents.emit("event", 1);
	});
});
