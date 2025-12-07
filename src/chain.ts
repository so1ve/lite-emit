import type { LiteEmit } from "./emitter";
import type { EventMap, Listener, WildcardListener } from "./types";

export interface ChainedLiteEmit<EM extends EventMap> {
	on: ((event: "*", listener: WildcardListener) => this) &
		(<K extends keyof EM>(event: K, listener: Listener<EM[K]>) => this);

	once: ((event: "*", listener: WildcardListener) => this) &
		(<K extends keyof EM>(event: K, listener: Listener<EM[K]>) => this);

	emit: <K extends keyof EM>(event: K, ...args: EM[K]) => this;

	off: (() => this) &
		((event: "*", listener?: WildcardListener) => this) &
		(<K extends keyof EM>(event: K, listener?: Listener<EM[K]>) => this);

	unwrap: () => LiteEmit<EM>;
}

export function chain<EM extends EventMap>(
	emitter: LiteEmit<EM>,
): ChainedLiteEmit<EM> {
	const self: ChainedLiteEmit<EM> = {
		on(event: any, listener: any): any {
			emitter.on(event, listener);

			return self;
		},
		once(event: any, listener: any): any {
			emitter.once(event, listener);

			return self;
		},
		emit(event: any, ...args: any[]): any {
			(emitter.emit as any)(event, ...args);

			return self;
		},
		off(event?: any, listener?: any): any {
			(emitter.off as any)(event, listener);

			return self;
		},
		unwrap() {
			return emitter;
		},
	};

	return self;
}
