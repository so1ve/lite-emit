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

export class LiteEmit<EM extends EventMap = EventMap> {
	#listenerMap = new Map<keyof EM, Listener<EM[keyof EM]>[]>();
	#wildcardListeners: WildcardListener<EM>[] = [];
	#errorHandler: ErrorHandler | undefined;

	constructor(options?: Options) {
		this.#errorHandler = options?.errorHandler;
	}

	public on(event: "*", listener: WildcardListener<EM>): this;
	public on<K extends keyof EM>(event: K, listener: Listener<EM[K]>): this;
	public on<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		if (event === "*") {
			if (!this.#wildcardListeners.includes(listener as any)) {
				this.#wildcardListeners.push(listener as any);
			}

			return this;
		}
		if (!this.#listenerMap.has(event)) {
			this.#listenerMap.set(event, []);
		}
		const listeners = this.#listenerMap.get(event)!;
		if (!listeners.includes(listener as any)) {
			listeners.push(listener as any);
		}

		return this;
	}

	public once(event: "*", listener: WildcardListener<EM>): this;
	public once<K extends keyof EM>(event: K, listener: Listener<EM[K]>): this;
	public once<K extends keyof EM>(
		event: K | "*",
		listener: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		const onceListener = (...args: any[]) => {
			this.off(event, onceListener);
			listener(...args);
		};

		return this.on(event, onceListener);
	}

	public emit<K extends keyof EM>(event: K, ...args: EM[K]): this {
		const listeners = this.#listenerMap.get(event);
		if (listeners) {
			if (this.#wildcardListeners.length > 0) {
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
			}
			for (const listener of listeners) {
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

	public off(): this;
	public off(event: "*", listener?: WildcardListener<EM>): this;
	public off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>): this;
	public off<K extends keyof EM>(
		event?: K | "*",
		listener?: Listener<EM[K]> | WildcardListener<EM>,
	): this {
		if (event === undefined) {
			this.#listenerMap.clear();
			this.#wildcardListeners.length = 0;

			return this;
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

			return this;
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

		return this;
	}
}
