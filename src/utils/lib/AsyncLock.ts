export class AsyncLock {
  private lockPromise: Promise<void> | null;
  private resolveLock: (() => void) | null;

  constructor() {
    this.lockPromise = null;
    this.resolveLock = null;
  }

  async acquire(): Promise<void> {
    // 如果当前有锁，等待它释放
    while (this.lockPromise) {
      await this.lockPromise;
    }

    // 创建新的锁
    this.lockPromise = new Promise((resolve) => {
      this.resolveLock = resolve;
    });
  }

  release(): void {
    // 释放锁
    if (this.resolveLock) {
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
}
