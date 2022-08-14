export interface EventMap { [key: string | symbol]: any[] }

export type Listener<A extends any[]> = (...args: A) => void;

type _WildcardListener<EM extends EventMap, K extends keyof EM = keyof EM> = Listener<K extends unknown ? [...EM[K], K] : [...EM[K], K]>;
export type WildcardListener<EM extends EventMap> = _WildcardListener<EM>;

export type ListenerMap<EM extends EventMap> = {
  [K in keyof EM]: Set<Listener<EM[K]>>
};

export class LiteEmit<EM extends EventMap = EventMap> {
  private listenerMap = {} as ListenerMap<EM>;
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
    this.listenerMap[event].add(listener as Listener<EM[K]>);
    return this;
  }

  emit<K extends keyof EM>(event: K, ...args: EM[K]): this {
    if (this.listenerMap[event]) {
      this.wildcardListeners.forEach(listener => listener(...[...args, event] as any));
      this.listenerMap[event].forEach(listener => listener(...args));
    }
    return this;
  }

  off (event: "**"): this;
  off (event: "*", listener?: WildcardListener<EM>): this;
  off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>): this;
  off<K extends keyof EM>(event: K | "*" | "**", listener?: Listener<EM[K]> | WildcardListener<EM>): this {
    if (event === "**") {
      this.listenerMap = {} as any;
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
      this.listenerMap[event]?.delete(listener as Listener<EM[K]>);
    } else {
      this.listenerMap[event]?.clear();
    }
    return this;
  }
}
