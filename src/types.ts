export type EventMap = Record<PropertyKey, any[]>;
export type Listener<A extends any[]> = (...args: A) => void | Promise<void>;
export type WildcardListener = Listener<[event: string, ...args: string[]]>;
export type OffFunction = () => void;
