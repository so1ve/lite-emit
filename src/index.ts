export type EventMap = Record<string | symbol, any[]>;

export type Listener<A extends any[]> = (...args: A) => void | Promise<void>;

type _WildcardListener<
	EM extends EventMap,
	K extends keyof EM = keyof EM,
> = Listener<[K, ...EM[K]]>;
export type WildcardListener<EM extends EventMap> = _WildcardListener<EM>;

export type ErrorHandler = (e: unknown) => void;

export interface Options {
	errorHandler?: ErrorHandler;
}

type OffFunction = () => void;

export class LiteEmit<EM extends EventMap = EventMap> {
	#listenerMap = new Map<keyof EM, Listener<EM[keyof EM]>[]>();
	#wildcardListeners: WildcardListener<EM>[] = [];
	#errorHandler: ErrorHandler | undefined;

	constructor(options?: Options) {
		this.#errorHandler = options?.errorHandler;
	}

	public on(event: "*", listener: WildcardListener<EM>): OffFunction;
	public on<K extends keyof EM>(
		event: K,
		listener: Listener<EM[K]>,
	): OffFunction;
	public on<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): OffFunction {
		if (event === "*") {
			if (!this.#wildcardListeners.includes(listener as any)) {
				this.#wildcardListeners.push(listener as any);
			}

			return () => this.off("*", listener as any);
		}

		if (!this.#listenerMap.has(event)) {
			this.#listenerMap.set(event, []);
		}
		const listeners = this.#listenerMap.get(event)!;
		if (!listeners.includes(listener as any)) {
			listeners.push(listener as any);
		}

		return () => this.off(event, listener as any);
	}

	public once(event: "*", listener: WildcardListener<EM>): OffFunction;
	public once<K extends keyof EM>(
		event: K,
		listener: Listener<EM[K]>,
	): OffFunction;
	public once<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): OffFunction {
		const onceListener = (...args: any[]) => {
			this.off(event, onceListener);
			listener(...args);
		};

		return this.on(event, onceListener);
	}

	#callListenerWithErrorHandler(listener: Listener<any>, args: any[]): void {
		try {
			const result = listener(...args);
			if (result instanceof Promise) {
				result.catch((e) => {
					this.#errorHandler?.(e);
				});
			}
		} catch (e: unknown) {
			this.#errorHandler?.(e);
		}
	}

	public emit<K extends keyof EM>(event: K, ...args: EM[K]): void {
		const listeners = this.#listenerMap.get(event);
		if (listeners) {
			if (this.#wildcardListeners.length > 0) {
				for (const listener of this.#wildcardListeners) {
					this.#callListenerWithErrorHandler(listener, [event, ...args]);
				}
			}
			for (const listener of listeners) {
				this.#callListenerWithErrorHandler(listener, args);
			}
		}
	}

	public off(): void;
	public off(event: "*", listener?: WildcardListener<EM>): void;
	public off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>): void;
	public off<K extends keyof EM>(
		event?: K | "*",
		listener?: Listener<EM[K]> | WildcardListener<EM>,
	): void {
		if (event === undefined) {
			this.#listenerMap.clear();
			this.#wildcardListeners.length = 0;

			return;
			// Event param is given
		} else if (event === "*") {
			// Remove the specified listener
			if (listener) {
				const index = this.#wildcardListeners.indexOf(listener as any);
				if (index !== -1) {
					this.#wildcardListeners.splice(index, 1);
				}
				// Clear all wildcard listners
			} else {
				this.#wildcardListeners.length = 0;
			}

			return;
		}
		// The event param is defined and not a wildcard symbol
		if (listener) {
			const listeners = this.#listenerMap.get(event);
			if (listeners) {
				const index = listeners.indexOf(listener as any);
				if (index !== -1) {
					listeners.splice(index, 1);
				}
			}
		} else {
			this.#listenerMap.delete(event);
		}
	}
}
