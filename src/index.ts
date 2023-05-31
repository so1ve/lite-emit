export type EventMap = Record<string | symbol, any[]>;

export type Listener<A extends any[]> = (...args: A) => void;

type _WildcardListener<
  EM extends EventMap,
  K extends keyof EM = keyof EM,
> = Listener<[K, ...EM[K]]>;
export type WildcardListener<EM extends EventMap> = _WildcardListener<EM>;

export type ListenerMap<EM extends EventMap> = Map<
  keyof EM,
  Set<Listener<EM[keyof EM]>>
>;

export class LiteEmit<EM extends EventMap = EventMap> {
  private listenerMap = new Map() as ListenerMap<EM>;
  private wildcardListeners = new Set<WildcardListener<EM>>();

  on<K extends keyof EM>(
    event: K | "*",
    listener: Listener<EM[K]> | WildcardListener<EM>,
  ): this {
    if (event === "*") {
      this.wildcardListeners.add(listener as WildcardListener<EM>);

      return this;
    }
    if (!this.listenerMap.has(event)) {
      this.listenerMap.set(event, new Set());
    }
    this.listenerMap.get(event)!.add(listener as any);

    return this;
  }

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
    if (this.listenerMap.has(event)) {
      for (const listener of this.wildcardListeners) {
        listener(event, ...args);
      }
      for (const listener of this.listenerMap.get(event)!) {
        listener(...args);
      }
    }

    return this;
  }

  off<K extends keyof EM>(
    event?: K | "*",
    listener?: Listener<EM[K]> | WildcardListener<EM>,
  ): this {
    if (event === undefined) {
      this.listenerMap.clear();
      this.wildcardListeners.clear();

      return this;
    } else if (event === "*") {
      if (listener) {
        this.wildcardListeners.delete(listener as WildcardListener<EM>);
      } else {
        this.wildcardListeners.clear();
      }

      return this;
    }
    if (listener) {
      this.listenerMap.get(event)?.delete(listener as any);
    } else {
      this.listenerMap.get(event)?.clear();
    }

    return this;
  }
}
