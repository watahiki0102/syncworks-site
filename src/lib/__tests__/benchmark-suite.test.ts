/**
 * 統合ベンチマークテストスイート
 * - TDD開発時の性能回帰防止
 * - リアルワールドシナリオの性能測定
 * - メモリリーク検出
 */

import { BenchmarkRunner, BenchmarkSuite, MemoryProfiler } from '../test-helpers/benchmark-runner';
import { MovingDataGenerators, PerformanceTestData } from '../test-helpers/data-generators';
import { mathUtils, stringUtils, arrayUtils } from '../pure-functions';
import businessLogic from '../business-logic';

describe('統合パフォーマンスベンチマーク', () => {
  let benchmarkSuite: BenchmarkSuite;
  let memoryProfiler: MemoryProfiler;

  beforeEach(() => {
    benchmarkSuite = new BenchmarkSuite();
    memoryProfiler = new MemoryProfiler();
  });

  afterEach(() => {
    benchmarkSuite.clear();
    memoryProfiler.clear();
  });

  describe('純粋関数のベンチマーク', () => {
    test('数学計算関数の性能測定', async () => {
      const testData = Array.from({ length: 1000 }, (_, i) => [1000 + i, 0.1] as const);

      // 税計算のベンチマーク
      const taxResult = await BenchmarkRunner.benchmark(
        '税込み価格計算',
        (price: number, rate: number) => mathUtils.calculateTaxIncluded(price, rate),
        [1000, 0.1],
        { iterations: 10000, measureMemory: true }
      );

      expect(taxResult.averageTime).toBeLessThan(0.1); // 0.1ms以下
      expect(taxResult.throughput).toBeGreaterThan(10000); // 10K ops/sec以上

      // パーセンテージ計算のベンチマーク
      const percentResult = await BenchmarkRunner.benchmark(
        'パーセンテージ計算',
        (value: number, total: number) => mathUtils.calculatePercentage(value, total),
        [25, 100],
        { iterations: 10000 }
      );

      expect(percentResult.averageTime).toBeLessThan(0.05); // 0.05ms以下
    }, 15000);

    test('文字列処理関数の性能測定', async () => {
      const testStrings = Array.from({ length: 1000 }, () => 
        MovingDataGenerators.generateCustomerData()
      );

      // 郵便番号正規化のベンチマーク
      const postalResult = await BenchmarkRunner.benchmark(
        '郵便番号正規化',
        (code: string) => stringUtils.normalizePostalCode(code),
        ['1234567'],
        { iterations: 5000 }
      );

      expect(postalResult.averageTime).toBeLessThan(0.2); // 0.2ms以下

      // 全角半角変換のベンチマーク
      const widthResult = await BenchmarkRunner.benchmark(
        '全角半角変換',
        (text: string) => stringUtils.normalizeWidth(text),
        ['１２３ＡＢＣ'],
        { iterations: 5000 }
      );

      expect(widthResult.averageTime).toBeLessThan(0.1); // 0.1ms以下
    });

    test('配列操作関数の性能測定', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 2 }));

      // チャンク分割のベンチマーク
      const chunkResult = await BenchmarkRunner.benchmark(
        '配列チャンク分割',
        <T>(arr: T[], size: number) => arrayUtils.chunk(arr, size),
        [largeArray, 10],
        { iterations: 1000, measureMemory: true }
      );

      expect(chunkResult.averageTime).toBeLessThan(1.0); // 1ms以下

      // 重複削除のベンチマーク  
      const uniqueResult = await BenchmarkRunner.benchmark(
        '重複削除',
        <T>(arr: T[], keySelector?: (item: T) => unknown) => arrayUtils.unique(arr, keySelector),
        [largeArray, (item: { id: number }) => item.id],
        { iterations: 500 }
      );

      expect(uniqueResult.averageTime).toBeLessThan(2.0); // 2ms以下
    });
  });

  describe('ビジネスロジックのベンチマーク', () => {
    test('見積もり計算の性能測定', async () => {
      const estimateParams = MovingDataGenerators.generateEstimateParams({
        items: Array.from({ length: 20 }, () => ({ name: 'テスト', count: 1, points: 10 }))
      });

      const result = await BenchmarkRunner.benchmark(
        '引越し見積もり計算',
        (params: any) => businessLogic.movingEstimateLogic.calculateMovingEstimate(params),
        [estimateParams],
        { iterations: 1000, measureMemory: true }
      );

      expect(result.averageTime).toBeLessThan(1.0); // 1ms以下
      expect(result.throughput).toBeGreaterThan(1000); // 1K ops/sec以上

      // メモリ使用量が適切であることを確認
      if (result.memoryUsage) {
        const memoryGrowth = result.memoryUsage.after - result.memoryUsage.before;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB以下
      }
    });

    test('顧客データ検証の性能測定', async () => {
      const customerData = MovingDataGenerators.generateCustomerData();

      const result = await BenchmarkRunner.benchmark(
        '顧客データ検証',
        (data: any) => businessLogic.customerManagementLogic.validateCustomerData(data),
        [customerData],
        { iterations: 2000 }
      );

      expect(result.averageTime).toBeLessThan(0.5); // 0.5ms以下
      expect(result.throughput).toBeGreaterThan(2000); // 2K ops/sec以上
    });

    test('リスク評価の性能測定', async () => {
      const customerHistory = MovingDataGenerators.generateCustomerHistory();

      const result = await BenchmarkRunner.benchmark(
        '顧客リスク評価',
        (history: any) => businessLogic.customerManagementLogic.assessCustomerRisk(history),
        [customerHistory],
        { iterations: 1000 }
      );

      expect(result.averageTime).toBeLessThan(0.3); // 0.3ms以下
    });
  });

  describe('大量データ処理のベンチマーク', () => {
    test('大量見積もりの一括処理', async () => {
      const estimates = PerformanceTestData.generateLargeEstimateDataset(100);

      memoryProfiler.takeSnapshot('開始時');

      const result = await BenchmarkRunner.benchmark(
        '大量見積もり一括処理',
        (estimateList: any[]) => {
          return estimateList.map(params => 
            businessLogic.movingEstimateLogic.calculateMovingEstimate(params)
          );
        },
        [estimates],
        { iterations: 10, measureMemory: true }
      );

      memoryProfiler.takeSnapshot('処理後');

      expect(result.averageTime).toBeLessThan(100); // 100ms以下
      
      const memoryAnalysis = memoryProfiler.analyze();
      console.log('メモリ使用量分析:', memoryAnalysis);

      // メモリリークがないことを確認
      expect(memoryProfiler.detectLeaks()).toBe(false);
    });

    test('配列操作のスケーラビリティ', async () => {
      const dataSizes = [100, 1000, 5000];
      const results: Array<{ size: number; time: number }> = [];

      for (const size of dataSizes) {
        const testData = Array.from({ length: size }, (_, i) => ({ id: i, value: i }));
        
        const result = await BenchmarkRunner.benchmark(
          `配列処理_${size}件`,
          <T>(data: T[]) => {
            const chunked = arrayUtils.chunk(data, 10);
            const unique = arrayUtils.unique(data, item => (item as any).id);
            const grouped = arrayUtils.groupBy(data, item => (item as any).id % 10);
            return { chunked: chunked.length, unique: unique.length, grouped: Object.keys(grouped).length };
          },
          [testData],
          { iterations: 10 }
        );

        results.push({ size, time: result.averageTime });
      }

      // スケーラビリティの確認（線形より良い性能を期待）
      const timeGrowthRatio = results[2].time / results[0].time;
      const sizeGrowthRatio = dataSizes[2] / dataSizes[0];
      
      expect(timeGrowthRatio).toBeLessThan(sizeGrowthRatio * 1.5); // 線形の1.5倍以下
    });
  });

  describe('メモリプロファイリング', () => {
    test('メモリ使用パターンの分析', () => {
      memoryProfiler.takeSnapshot('テスト開始');
      
      // 大量データを作成
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: MovingDataGenerators.generateCustomerData()
      }));
      
      memoryProfiler.takeSnapshot('データ作成後');
      
      // データ処理
      const processed = largeData.map(item => ({
        ...item,
        score: Math.random() * 100
      }));
      
      memoryProfiler.takeSnapshot('データ処理後');
      
      // データクリーンアップ
      largeData.length = 0;
      processed.length = 0;
      
      memoryProfiler.takeSnapshot('クリーンアップ後');
      
      const analysis = memoryProfiler.analyze();
      
      expect(analysis.snapshots.length).toBe(4);
      expect(memoryProfiler.detectLeaks()).toBe(false);
      
      console.log('メモリ使用パターン:', analysis);
    });
  });

  describe('パフォーマンス比較テスト', () => {
    test('異なる実装方式の性能比較', async () => {
      const testArray = Array.from({ length: 1000 }, (_, i) => i);
      
      const comparison = await BenchmarkRunner.compare([
        {
          name: 'for文による処理',
          fn: (arr: number[]) => {
            const result = [];
            for (let i = 0; i < arr.length; i++) {
              result.push(arr[i] * 2);
            }
            return result;
          },
          args: [testArray]
        },
        {
          name: 'map関数による処理',
          fn: (arr: number[]) => arr.map(x => x * 2),
          args: [testArray]
        },
        {
          name: 'forEach文による処理',
          fn: (arr: number[]) => {
            const result: number[] = [];
            arr.forEach(x => result.push(x * 2));
            return result;
          },
          args: [testArray]
        }
      ], { iterations: 1000 });

      expect(comparison.results.length).toBe(3);
      expect(comparison.comparison.fastest).toBeDefined();
      expect(comparison.comparison.slowest).toBeDefined();
      
      console.log('性能比較結果:');
      console.log(`最速: ${comparison.comparison.fastest}`);
      console.log(`最遅: ${comparison.comparison.slowest}`);
      console.log('倍率:', comparison.comparison.speedupFactors);
    });
  });

  describe('時系列パフォーマンス測定', () => {
    test('継続的な性能監視', async () => {
      const estimateParams = MovingDataGenerators.generateEstimateParams();
      
      const timeSeriesResult = await BenchmarkRunner.timeSeriesBenchmark(
        '見積もり計算_時系列',
        (params: any) => businessLogic.movingEstimateLogic.calculateMovingEstimate(params),
        [estimateParams],
        3000, // 3秒間
        200   // 200ms間隔
      );

      expect(timeSeriesResult.timestamps.length).toBeGreaterThan(10);
      expect(timeSeriesResult.responseTimes.length).toBeGreaterThan(10);
      expect(timeSeriesResult.statistics.mean).toBeLessThan(2.0); // 2ms以下
      expect(timeSeriesResult.statistics.p95).toBeLessThan(5.0); // P95が5ms以下
      
      console.log('時系列統計:', timeSeriesResult.statistics);
    }, 10000);
  });

  describe('ベンチマークスイートの統合テスト', () => {
    test('完全なベンチマークスイートの実行', async () => {
      // 純粋関数のベンチマークを追加
      benchmarkSuite
        .add('税計算', mathUtils.calculateTaxIncluded, [1000, 0.1], 'math')
        .add('パーセント計算', mathUtils.calculatePercentage, [25, 100], 'math')
        .add('郵便番号正規化', stringUtils.normalizePostalCode, ['1234567'], 'string')
        .add('配列チャンク', arrayUtils.chunk, [Array.from({length: 100}, (_, i) => i), 10], 'array');

      // ビジネスロジックのベンチマークを追加
      const customerData = MovingDataGenerators.generateCustomerData();
      const estimateParams = MovingDataGenerators.generateEstimateParams();
      
      benchmarkSuite
        .add('顧客データ検証', businessLogic.customerManagementLogic.validateCustomerData, [customerData], 'business')
        .add('見積もり計算', businessLogic.movingEstimateLogic.calculateMovingEstimate, [estimateParams], 'business');

      // スイートを実行
      await benchmarkSuite.run({ iterations: 1000, measureMemory: true });

      const results = benchmarkSuite.getResults();
      expect(results.length).toBe(6);

      // カテゴリ別の結果を確認
      const categories = benchmarkSuite.getResultsByCategory();
      expect(categories.has('math')).toBe(true);
      expect(categories.has('string')).toBe(true);
      expect(categories.has('array')).toBe(true);
      expect(categories.has('business')).toBe(true);

      // 全体の性能が基準を満たすことを確認
      results.forEach(result => {
        expect(result.averageTime).toBeLessThan(10); // 10ms以下
        expect(result.throughput).toBeGreaterThan(100); // 100ops/sec以上
      });

      // レポート出力（テスト実行時に確認用）
      benchmarkSuite.printReport();
    }, 30000);
  });
});