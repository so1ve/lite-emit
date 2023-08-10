export type EventMap = Record<string | symbol, any[]>;

export type Listener<A extends any[]> = (...args: A) => void | Promise<void>;

type _WildcardListener<
	EM extends EventMap,
	K extends keyof EM = keyof EM,
> = Listener<[K, ...EM[K]]>;
export type WildcardListener<EM extends EventMap> = _WildcardListener<EM>;

export type ListenerMap<EM extends EventMap> = Map<
	keyof EM,
	Set<Listener<EM[keyof EM]>>
>;

export type ErrorHandler=(e: unknown)=void

export interface Options {
	errorHandler?: ErrorHandler
}

export class LiteEmit<EM extends EventMap = EventMap> {
	#listenerMap = new Map() as ListenerMap<EM>;
	#wildcardListeners = new Set<WildcardListener<EM>>();
	#errorHandler: (ErrorHandler) | undefined;

	constructor(options?: Options) {
		this.#errorHandler = options?.errorHandler;
	}

	on(event: "*", listener: WildcardListener<EM>): this;
	on<K extends keyof EM>(event: K, listener: Listener<EM[K]>): this;
	on<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		if (event === "*") {
			this.#wildcardListeners.add(listener as WildcardListener<EM>);

			return this;
		}
		if (!this.#listenerMap.has(event)) {
			this.#listenerMap.set(event, new Set());
		}
		this.#listenerMap.get(event)!.add(listener as any);

		return this;
	}

	once(event: "*", listener: WildcardListener<EM>): this;
	once<K extends keyof EM>(event: K, listener: Listener<EM[K]>): this;
	once<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		const onceListener = (...args: any[]) => {
			this.off(event, onceListener);
			listener(...args);
		};

		return this.on(event, onceListener);
	}

	emit<K extends keyof EM>(event: K, ...args: EM[K]): this {
		if (this.#listenerMap.has(event)) {
			for (const listener of this.#wildcardListeners) {
				try {
					const result = listener(event, ...args);
					if (result instanceof Promise) {
						result.catch((e) => {
							this.#errorHandler?.(e);
						});
					}
				} catch (e: unknown) {
					this.#errorHandler?.(e);
				}
			}
			for (const listener of this.#listenerMap.get(event)!) {
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
		}

		return this;
	}

	off(): this;
	off(event: "*", listener?: WildcardListener<EM>): this;
	off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>): this;
	off<K extends keyof EM>(
		event?: K | "*",
		listener?: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		if (event === undefined) {
			this.#listenerMap.clear();
			this.#wildcardListeners.clear();

			return this;
			// Event param is given
		} else if (event === "*") {
			// Remove the specified listener
			if (listener) {
				this.#wildcardListeners.delete(listener as WildcardListener<EM>);
				// Clear all wildcard listners
			} else {
				this.#wildcardListeners.clear();
			}

			return this;
		}
		// The event param is defined and not a wildcard symbol
		if (listener) {
			this.#listenerMap.get(event)?.delete(listener as any);
		} else {
			this.#listenerMap.get(event)?.clear();
		}

		return this;
	}
}
