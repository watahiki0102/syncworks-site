/**
 * パフォーマンスベンチマークツール
 * - TDD開発時の性能回帰を防ぐ
 * - 関数レベルの詳細な性能測定
 * - メモリ使用量の監視
 */

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // ops/sec
  memoryUsage?: {
    before: number;
    after: number;
    peak: number;
  };
}

interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  timeout?: number;
  measureMemory?: boolean;
  compareBaseline?: BenchmarkResult;
}

/**
 * 高精度ベンチマークランナー
 */
export class BenchmarkRunner {
  private static readonly DEFAULT_ITERATIONS = 1000;
  private static readonly DEFAULT_WARMUP = 100;
  private static readonly DEFAULT_TIMEOUT = 10000; // 10秒

  /**
   * 単一関数のベンチマーク実行
   */
  static async benchmark<T extends any[], R>(
    name: string,
    fn: (...args: T) => R,
    args: T,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      iterations = this.DEFAULT_ITERATIONS,
      warmupIterations = this.DEFAULT_WARMUP,
      timeout = this.DEFAULT_TIMEOUT,
      measureMemory = false,
    } = options;

    // ウォームアップ実行
    await this.warmup(fn, args, warmupIterations);

    const times: number[] = [];
    const startTime = performance.now();
    let memoryBefore = 0;
    let memoryAfter = 0;
    let memoryPeak = 0;

    // メモリ使用量の初期測定
    if (measureMemory && 'memory' in performance) {
      memoryBefore = (performance as any).memory.usedJSHeapSize;
    }

    // ベンチマーク実行
    for (let i = 0; i < iterations; i++) {
      // タイムアウトチェック
      if (performance.now() - startTime > timeout) {
        throw new Error(`Benchmark timeout after ${timeout}ms`);
      }

      const iterationStart = performance.now();
      
      try {
        await fn(...args);
      } catch (error) {
        throw new Error(`Benchmark function failed at iteration ${i}: ${error}`);
      }
      
      const iterationEnd = performance.now();
      times.push(iterationEnd - iterationStart);

      // メモリ使用量のピーク測定
      if (measureMemory && 'memory' in performance) {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        memoryPeak = Math.max(memoryPeak, currentMemory);
      }
    }

    // メモリ使用量の最終測定
    if (measureMemory && 'memory' in performance) {
      memoryAfter = (performance as any).memory.usedJSHeapSize;
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = 1000 / averageTime; // ops per second

    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      throughput,
    };

    if (measureMemory) {
      result.memoryUsage = {
        before: memoryBefore,
        after: memoryAfter,
        peak: memoryPeak,
      };
    }

    return result;
  }

  /**
   * 複数関数の比較ベンチマーク
   */
  static async compare<T extends any[], R>(
    benchmarks: Array<{
      name: string;
      fn: (...args: T) => R;
      args: T;
    }>,
    options: BenchmarkOptions = {}
  ): Promise<{
    results: BenchmarkResult[];
    comparison: {
      fastest: string;
      slowest: string;
      speedupFactors: Record<string, number>;
    };
  }> {
    const results: BenchmarkResult[] = [];

    // 各関数のベンチマークを実行
    for (const benchmark of benchmarks) {
      const result = await this.benchmark(
        benchmark.name,
        benchmark.fn,
        benchmark.args,
        options
      );
      results.push(result);
    }

    // パフォーマンス比較の分析
    const sortedResults = [...results].sort((a, b) => a.averageTime - b.averageTime);
    const fastest = sortedResults[0];
    const slowest = sortedResults[sortedResults.length - 1];

    const speedupFactors: Record<string, number> = {};
    results.forEach(result => {
      speedupFactors[result.name] = result.averageTime / fastest.averageTime;
    });

    return {
      results,
      comparison: {
        fastest: fastest.name,
        slowest: slowest.name,
        speedupFactors,
      },
    };
  }

  /**
   * 時系列パフォーマンス測定（性能回帰検出用）
   */
  static async timeSeriesBenchmark<T extends any[], R>(
    name: string,
    fn: (...args: T) => R,
    args: T,
    duration: number = 5000, // 5秒間
    samplingInterval: number = 100 // 100ms間隔
  ): Promise<{
    timestamps: number[];
    responseTimes: number[];
    throughput: number[];
    statistics: {
      mean: number;
      median: number;
      p95: number;
      p99: number;
      standardDeviation: number;
    };
  }> {
    const timestamps: number[] = [];
    const responseTimes: number[] = [];
    const throughput: number[] = [];

    const startTime = performance.now();
    let lastSampleTime = startTime;
    let operationsInInterval = 0;

    while (performance.now() - startTime < duration) {
      const opStart = performance.now();
      await fn(...args);
      const opEnd = performance.now();
      
      const responseTime = opEnd - opStart;
      operationsInInterval++;

      // サンプリング間隔ごとにデータを記録
      if (opEnd - lastSampleTime >= samplingInterval) {
        timestamps.push(opEnd - startTime);
        responseTimes.push(responseTime);
        throughput.push(operationsInInterval * 1000 / samplingInterval);
        
        operationsInInterval = 0;
        lastSampleTime = opEnd;
      }
    }

    // 統計情報の計算
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median = sortedTimes[Math.floor(sortedTimes.length / 2)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / responseTimes.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      timestamps,
      responseTimes,
      throughput,
      statistics: {
        mean,
        median,
        p95,
        p99,
        standardDeviation,
      },
    };
  }

  /**
   * ウォームアップ実行
   */
  private static async warmup<T extends any[], R>(
    fn: (...args: T) => R,
    args: T,
    iterations: number
  ): Promise<void> {
    for (let i = 0; i < iterations; i++) {
      await fn(...args);
    }
  }

  /**
   * ベンチマーク結果の詳細レポート生成
   */
  static generateReport(results: BenchmarkResult[]): string {
    let report = '\n=== パフォーマンスベンチマーク レポート ===\n\n';

    results.forEach(result => {
      report += `📊 ${result.name}\n`;
      report += `   反復回数: ${result.iterations.toLocaleString()}\n`;
      report += `   平均時間: ${result.averageTime.toFixed(3)}ms\n`;
      report += `   最小時間: ${result.minTime.toFixed(3)}ms\n`;
      report += `   最大時間: ${result.maxTime.toFixed(3)}ms\n`;
      report += `   スループット: ${result.throughput.toFixed(0)} ops/sec\n`;
      
      if (result.memoryUsage) {
        const memoryDiff = result.memoryUsage.after - result.memoryUsage.before;
        report += `   メモリ使用量: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB\n`;
        report += `   メモリピーク: ${(result.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB\n`;
      }
      
      report += '\n';
    });

    return report;
  }

  /**
   * パフォーマンス回帰の検出
   */
  static detectRegression(
    current: BenchmarkResult,
    baseline: BenchmarkResult,
    threshold: number = 0.1 // 10%の性能低下を閾値とする
  ): {
    hasRegression: boolean;
    degradation: number;
    message: string;
  } {
    const degradation = (current.averageTime - baseline.averageTime) / baseline.averageTime;
    const hasRegression = degradation > threshold;

    let message = '';
    if (hasRegression) {
      message = `⚠️  性能回帰が検出されました: ${(degradation * 100).toFixed(1)}%の性能低下`;
    } else if (degradation < -0.05) { // 5%以上の改善
      message = `🚀 性能が向上しました: ${Math.abs(degradation * 100).toFixed(1)}%の改善`;
    } else {
      message = `✅ 性能は安定しています`;
    }

    return {
      hasRegression,
      degradation,
      message,
    };
  }
}

/**
 * メモリ使用量プロファイラー
 */
export class MemoryProfiler {
  private snapshots: Array<{ name: string; timestamp: number; memory: number }> = [];

  /**
   * メモリスナップショットを取得
   */
  takeSnapshot(name: string): void {
    if ('memory' in performance) {
      this.snapshots.push({
        name,
        timestamp: performance.now(),
        memory: (performance as any).memory.usedJSHeapSize,
      });
    }
  }

  /**
   * メモリ使用量の分析
   */
  analyze(): {
    snapshots: Array<{ name: string; memory: string; memoryDiff: string }>;
    peakMemory: string;
    totalGrowth: string;
  } {
    if (this.snapshots.length === 0) {
      return {
        snapshots: [],
        peakMemory: '0 MB',
        totalGrowth: '0 MB',
      };
    }

    const snapshots = this.snapshots.map((snapshot, index) => {
      const prevMemory = index > 0 ? this.snapshots[index - 1].memory : snapshot.memory;
      const memoryDiff = snapshot.memory - prevMemory;
      
      return {
        name: snapshot.name,
        memory: `${(snapshot.memory / 1024 / 1024).toFixed(2)} MB`,
        memoryDiff: `${memoryDiff >= 0 ? '+' : ''}${(memoryDiff / 1024 / 1024).toFixed(2)} MB`,
      };
    });

    const peakMemory = Math.max(...this.snapshots.map(s => s.memory));
    const totalGrowth = this.snapshots[this.snapshots.length - 1].memory - this.snapshots[0].memory;

    return {
      snapshots,
      peakMemory: `${(peakMemory / 1024 / 1024).toFixed(2)} MB`,
      totalGrowth: `${(totalGrowth / 1024 / 1024).toFixed(2)} MB`,
    };
  }

  /**
   * メモリリークの検出
   */
  detectLeaks(threshold: number = 50 * 1024 * 1024): boolean { // 50MB threshold
    if (this.snapshots.length < 2) return false;
    
    const growth = this.snapshots[this.snapshots.length - 1].memory - this.snapshots[0].memory;
    return growth > threshold;
  }

  /**
   * スナップショットをクリア
   */
  clear(): void {
    this.snapshots = [];
  }
}

/**
 * 統合ベンチマークスイート
 */
export class BenchmarkSuite {
  private benchmarks: Array<{
    name: string;
    fn: Function;
    args: any[];
    category: string;
  }> = [];
  
  private results: Map<string, BenchmarkResult> = new Map();

  /**
   * ベンチマークを追加
   */
  add<T extends any[], R>(
    name: string,
    fn: (...args: T) => R,
    args: T,
    category: string = 'general'
  ): this {
    this.benchmarks.push({ name, fn, args, category });
    return this;
  }

  /**
   * すべてのベンチマークを実行
   */
  async run(options: BenchmarkOptions = {}): Promise<void> {
    console.log(`🏃 ${this.benchmarks.length}個のベンチマークを実行中...\n`);

    for (const benchmark of this.benchmarks) {
      console.log(`⏱️  ${benchmark.name} を実行中...`);
      
      try {
        const result = await BenchmarkRunner.benchmark(
          benchmark.name,
          benchmark.fn,
          benchmark.args,
          options
        );
        
        this.results.set(benchmark.name, result);
        console.log(`   完了: ${result.averageTime.toFixed(3)}ms (平均)`);
        
      } catch (error) {
        console.error(`   エラー: ${error}`);
      }
    }

    console.log('\n✅ すべてのベンチマークが完了しました\n');
  }

  /**
   * 結果の取得
   */
  getResults(): BenchmarkResult[] {
    return Array.from(this.results.values());
  }

  /**
   * カテゴリ別の結果取得
   */
  getResultsByCategory(): Map<string, BenchmarkResult[]> {
    const categories = new Map<string, BenchmarkResult[]>();
    
    this.benchmarks.forEach(benchmark => {
      const result = this.results.get(benchmark.name);
      if (result) {
        if (!categories.has(benchmark.category)) {
          categories.set(benchmark.category, []);
        }
        categories.get(benchmark.category)!.push(result);
      }
    });

    return categories;
  }

  /**
   * 詳細レポートの出力
   */
  printReport(): void {
    const results = this.getResults();
    const report = BenchmarkRunner.generateReport(results);
    console.log(report);
  }

  /**
   * スイートをクリア
   */
  clear(): void {
    this.benchmarks = [];
    this.results.clear();
  }
}

export default {
  BenchmarkRunner,
  MemoryProfiler,
  BenchmarkSuite,
};