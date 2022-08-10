export interface EventMap { [key: string | symbol]: unknown[] }

export type Listener<A extends any[]> = (...args: A) => void;

export type ListenerMap<EM extends EventMap> = {
  [K in keyof EM]: Set<Listener<EM[K]>>
};

export class LiteEmit<EM extends EventMap = EventMap> {
  private listenerMap: ListenerMap<EM> = {} as any;

  on<K extends keyof EM>(event: K, listener: Listener<EM[K]>) {
    if (!this.listenerMap[event]) {
      this.listenerMap[event] = new Set();
    }
    this.listenerMap[event].add(listener);
  }

  emit<K extends keyof EM>(event: K, ...args: EM[K]) {
    this.listenerMap[event]?.forEach(listener => listener(...args));
  }

  off<K extends keyof EM>(event: K, listener?: Listener<EM[K]>) {
    if (listener) {
      this.listenerMap[event]?.delete(listener);
    } else {
      this.listenerMap[event]?.clear();
    }
  }

  clear<K extends keyof EM>(event: K) {
    this.listenerMap[event]?.clear();
  }
}
