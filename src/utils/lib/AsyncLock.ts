export class AsyncLock {
  private lockPromise: Promise<void> | null;
  private resolveLock: (() => void) | null;
  private debugMode = false;
  constructor(debug?: boolean) {
    this.lockPromise = null;
    this.resolveLock = null;
    if (debug !== undefined) {
      this.debugMode = debug;
    }
  }

  async acquire(): Promise<void> {
    this.#log("enter acquire");
    // 如果当前有锁，等待它释放
    while (this.lockPromise) {
      await this.lockPromise;
      this.#log("pass one lockPromise");
    }
    this.#log("pass lock");

    // 创建新的锁
    this.lockPromise = new Promise((resolve) => {
      this.resolveLock = resolve;
    });
  }

  release(): void {
    // 释放锁
    if (this.resolveLock) {
      this.#log("release resolve lock");

      this.resolveLock();
      this.lockPromise = null;
      this.resolveLock = null;
    } else {
      throw new Error("Lock is not acquired");
    }
  }

  // 用于包装异步函数的辅助方法
  async wrap<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      const result = await fn();
      return result;
    } finally {
      this.release();
    }
  }

  #log(...str: any[]) {
    if (this.debugMode) {
      console.debug("[AsyncLock]", ...str);
    }
  }
}

export function wrapAsyncFunction<T extends any>(
  obj: T,
  functionKey: keyof T,
  before?: (...args: any[]) => Promise<any>,
  after?: (...args: any[]) => Promise<any> | any
): void {
  const originalRun = obj[functionKey];
  if (typeof originalRun !== "function") return;

  Object.defineProperty(obj, functionKey, {
    get() {
      return async (...args: any[]) => {
        await before?.(args);
        let result: any;
        try {
          result = await originalRun.apply(obj, args);
        } finally {
          await after?.(args);
        }
        return result;
      };
    },
  });
}
