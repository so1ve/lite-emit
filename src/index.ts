export interface EventMap { [key: string | symbol]: unknown[] }

export type Listener<A extends any[]> = (...args: A) => void;

export type WildcardListener<EM extends EventMap> = Listener<EM[keyof EM]>;

export type ListenerMap<EM extends EventMap> = {
  [K in keyof EM]: Set<Listener<EM[K]>>
};

export class LiteEmit<EM extends EventMap = EventMap> {
  private listenerMap: ListenerMap<EM> = {} as any;
  private wildcardListeners = new Set<WildcardListener<EM>>();

  on (event: "*", listener: WildcardListener<EM>): this;
  on<K extends keyof EM>(event: K, listener: Listener<EM[K]>): this;
  on<K extends keyof EM>(event: K | "*", listener: Listener<EM[K]> | WildcardListener<EM>): this {
    if (event === "*") {
      this.wildcardListeners.add(listener as WildcardListener<EM>);
      return this;
    }
    if (!this.listenerMap[event]) {
      this.listenerMap[event] = new Set();
    }
    this.listenerMap[event].add(listener);
    return this;
  }

  emit<K extends keyof EM>(event: K, ...args: EM[K]): this {
    this.wildcardListeners.forEach(listener => listener(...args));
    this.listenerMap[event]?.forEach(listener => listener(...args));
    return this;
  }

  off (event: "*"): this;
  off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>): this;
  off<K extends keyof EM>(event: K | "*", listener?: Listener<EM[K]>): this {
    if (event === "*") {
      this.listenerMap = {} as any;
      return this;
    }
    if (listener) {
      this.listenerMap[event]?.delete(listener);
    } else {
      this.listenerMap[event]?.clear();
    }
    return this;
  }
}
