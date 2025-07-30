// 内存管理器 - 用于监控和优化内存使用
export class MemoryManager {
  private static instance: MemoryManager;
  private memoryThreshold = 0.8; // 80% 内存使用率阈值
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * 获取当前内存使用情况
   */
  getMemoryInfo(): {
    used: number;
    total: number;
    percentage: number;
    isHigh: boolean;
  } {
    if ("memory" in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const percentage = used / total;

      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentage,
        isHigh: percentage > this.memoryThreshold,
      };
    }

    // 如果不支持内存API，返回默认值
    return {
      used: 0,
      total: 0,
      percentage: 0,
      isHigh: false,
    };
  }

  /**
   * 检查内存使用是否过高
   */
  isMemoryHigh(): boolean {
    return this.getMemoryInfo().isHigh;
  }

  /**
   * 强制垃圾回收（如果支持）
   */
  forceGarbageCollection(): void {
    if ("gc" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gc();
        console.log("Forced garbage collection");
      } catch (error) {
        console.warn("Failed to force garbage collection:", error);
      }
    }
  }

  /**
   * 等待内存释放
   */
  async waitForMemoryRelease(maxWaitTime = 5000): Promise<boolean> {
    const startTime = Date.now();

    while (this.isMemoryHigh() && Date.now() - startTime < maxWaitTime) {
      this.forceGarbageCollection();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return !this.isMemoryHigh();
  }

  /**
   * 开始内存监控
   */
  startMonitoring(interval = 1000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    this.checkInterval = setInterval(() => {
      const memoryInfo = this.getMemoryInfo();

      if (memoryInfo.isHigh) {
        console.warn("High memory usage detected:", memoryInfo);
        this.forceGarbageCollection();
      }
    }, interval);
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 获取推荐的批处理大小
   */
  getRecommendedBatchSize(): number {
    const memoryInfo = this.getMemoryInfo();

    if (memoryInfo.percentage > 0.9) {
      return 1; // 内存使用率超过90%，只处理1个
    } else if (memoryInfo.percentage > 0.7) {
      return 2; // 内存使用率超过70%，处理2个
    } else if (memoryInfo.percentage > 0.5) {
      return 3; // 内存使用率超过50%，处理3个
    } else {
      return 5; // 内存使用率正常，处理5个
    }
  }

  /**
   * 获取推荐的处理间隔
   */
  getRecommendedInterval(): number {
    const memoryInfo = this.getMemoryInfo();

    if (memoryInfo.percentage > 0.8) {
      return 500; // 内存使用率高，间隔500ms
    } else if (memoryInfo.percentage > 0.6) {
      return 300; // 内存使用率中等，间隔300ms
    } else {
      return 100; // 内存使用率正常，间隔100ms
    }
  }

  /**
   * 打印内存使用报告
   */
  printMemoryReport(): void {
    const memoryInfo = this.getMemoryInfo();
    console.log("Memory Report:", {
      used: `${memoryInfo.used} MB`,
      total: `${memoryInfo.total} MB`,
      percentage: `${(memoryInfo.percentage * 100).toFixed(1)}%`,
      status: memoryInfo.isHigh ? "HIGH" : "NORMAL",
      recommendedBatchSize: this.getRecommendedBatchSize(),
      recommendedInterval: this.getRecommendedInterval(),
    });
  }
}

// 导出单例实例
export const memoryManager = MemoryManager.getInstance();
