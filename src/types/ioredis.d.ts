declare module "ioredis" {
  import type { EventEmitter } from "events";

  class Redis extends EventEmitter {
    constructor(url?: string, options?: any);
    duplicate(): Redis;
    on(event: string, listener: (...args: any[]) => void): this;
    subscribe(channel: string, callback?: (err: Error | null, count?: number) => void): Promise<number>;
    unsubscribe(channel?: string): Promise<number>;
    quit(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: Array<string | number>): Promise<"OK" | null>;
    setex(key: string, seconds: number, value: string): Promise<"OK">;
    incr(key: string): Promise<number>;
    incrby(key: string, amount: number): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    del(...keys: string[]): Promise<number>;
    publish(channel: string, message: string): Promise<number>;
  }

  export default Redis;
}
