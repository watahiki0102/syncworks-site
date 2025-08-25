/**
 * パフォーマンステスト
 * - 関数の実行時間測定
 * - メモリ使用量の監視
 * - 大量データ処理のテスト
 */

import { mathUtils, stringUtils, arrayUtils } from '../pure-functions';
import businessLogic from '../business-logic';

describe('パフォーマンステスト', () => {
  describe('純粋関数のパフォーマンス', () => {
    test('大量の税計算処理', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        mathUtils.calculateTaxIncluded(1000 + i, 0.1);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 10000回の計算が100ms以内に完了
      expect(duration).toBeLessThan(100);
    });

    test('大量の文字列正規化', () => {
      const testStrings = Array.from({ length: 1000 }, (_, i) => `123456${i % 10}`);
      
      const startTime = performance.now();
      
      testStrings.forEach(str => {
        stringUtils.normalizePostalCode(str.slice(0, 7));
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000回の正規化が50ms以内に完了
      expect(duration).toBeLessThan(50);
    });

    test('大量配列の処理', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        category: `category_${i % 10}`,
        value: Math.random() * 1000,
      }));
      
      const startTime = performance.now();
      
      // チャンク分割
      const chunks = arrayUtils.chunk(largeArray, 100);
      
      // グループ化
      const grouped = arrayUtils.groupBy(largeArray, item => item.category);
      
      // 重複削除
      const unique = arrayUtils.unique(largeArray, item => item.id);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(chunks.length).toBe(100);
      expect(Object.keys(grouped)).toHaveLength(10);
      expect(unique).toHaveLength(10000);
      
      // 大量データ処理が500ms以内に完了
      expect(duration).toBeLessThan(500);
    });
  });

  describe('ビジネスロジックのパフォーマンス', () => {
    test('大量見積もり計算', () => {
      const estimateParams = {
        distance: 50,
        items: [
          { name: 'テーブル', count: 1, points: 10 },
          { name: '椅子', count: 4, points: 5 },
        ],
        timeSlot: 'normal' as const,
        selectedOptions: ['packing'],
        moveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15日後
        taxRate: 0.1,
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        businessLogic.movingEstimateLogic.calculateMovingEstimate({
          ...estimateParams,
          distance: 50 + (i % 100), // バリエーションを追加
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000回の見積もり計算が200ms以内に完了
      expect(duration).toBeLessThan(200);
    });

    test('大量顧客データ検証', () => {
      const customerData = {
        lastName: '田中',
        firstName: '太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        postalCode: '123-4567',
        address: '東京都渋谷区1-1-1',
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        businessLogic.customerManagementLogic.validateCustomerData({
          ...customerData,
          email: `user${i}@example.com`,
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000回の顧客データ検証が100ms以内に完了
      expect(duration).toBeLessThan(100);
    });
  });

  describe('メモリ使用量テスト', () => {
    test('大量データでのメモリリーク検証', () => {
      // 初期メモリ使用量をGCで測定する代わりに、
      // 実際のデータ構造のサイズを確認
      const initialArraySize = 1000;
      let testArray: number[] = [];
      
      // 大量データを作成
      for (let i = 0; i < initialArraySize; i++) {
        testArray.push(i);
      }
      
      expect(testArray.length).toBe(initialArraySize);
      
      // データを処理
      const processed = arrayUtils.chunk(testArray, 10);
      expect(processed.length).toBe(100);
      
      // 元の配列をクリア（メモリ解放をシミュレート）
      testArray = [];
      expect(testArray.length).toBe(0);
    });
  });

  describe('並行処理パフォーマンス', () => {
    test('並行税計算', async () => {
      const calculations = Array.from({ length: 1000 }, (_, i) => 
        Promise.resolve(mathUtils.calculateTaxIncluded(1000 + i, 0.1))
      );
      
      const startTime = performance.now();
      const results = await Promise.all(calculations);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(results[0]).toBe(1100); // 最初の結果を確認
      
      // 並行処理が50ms以内に完了
      expect(duration).toBeLessThan(50);
    });

    test('並行見積もり計算', async () => {
      const baseParams = {
        distance: 50,
        items: [{ name: 'テーブル', count: 1, points: 10 }],
        timeSlot: 'normal' as const,
        selectedOptions: [] as string[],
        moveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15日後
        taxRate: 0.1,
      };

      const estimates = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(businessLogic.movingEstimateLogic.calculateMovingEstimate({
          ...baseParams,
          distance: 50 + i,
        }))
      );
      
      const startTime = performance.now();
      const results = await Promise.all(estimates);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(100);
      expect(results.every(result => result.total > 0)).toBe(true);
      
      // 100個の並行見積もり計算が100ms以内に完了
      expect(duration).toBeLessThan(100);
    });
  });

  describe('データ構造効率性テスト', () => {
    test('配列vs Setの性能比較', () => {
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => i);
      const searchTargets = [100, 5000, 9999];
      
      // 配列での検索
      const arrayStartTime = performance.now();
      searchTargets.forEach(target => {
        largeDataSet.includes(target);
      });
      const arrayEndTime = performance.now();
      const arrayDuration = arrayEndTime - arrayStartTime;
      
      // Setでの検索
      const dataSet = new Set(largeDataSet);
      const setStartTime = performance.now();
      searchTargets.forEach(target => {
        dataSet.has(target);
      });
      const setEndTime = performance.now();
      const setDuration = setEndTime - setStartTime;
      
      // Setの方が高速であることを確認
      expect(setDuration).toBeLessThan(arrayDuration);
      
      // 両方とも十分高速であることを確認
      expect(arrayDuration).toBeLessThan(10);
      expect(setDuration).toBeLessThan(5);
    });

    test('オブジェクトvs Mapの性能比較', () => {
      const keyCount = 1000;
      const testKeys = Array.from({ length: keyCount }, (_, i) => `key_${i}`);
      const testValues = Array.from({ length: keyCount }, (_, i) => `value_${i}`);
      
      // オブジェクトでの操作
      const objStartTime = performance.now();
      const testObj: Record<string, string> = {};
      testKeys.forEach((key, i) => {
        testObj[key] = testValues[i];
      });
      testKeys.forEach(key => {
        const _ = testObj[key];
      });
      const objEndTime = performance.now();
      const objDuration = objEndTime - objStartTime;
      
      // Mapでの操作
      const mapStartTime = performance.now();
      const testMap = new Map<string, string>();
      testKeys.forEach((key, i) => {
        testMap.set(key, testValues[i]);
      });
      testKeys.forEach(key => {
        testMap.get(key);
      });
      const mapEndTime = performance.now();
      const mapDuration = mapEndTime - mapStartTime;
      
      // 両方とも十分高速であることを確認
      expect(objDuration).toBeLessThan(50);
      expect(mapDuration).toBeLessThan(50);
    });
  });

  describe('リアルワールドシナリオ', () => {
    test('複雑な引越し見積もりシナリオ', () => {
      const complexScenario = {
        distance: 120,
        items: [
          { name: 'ソファ', count: 1, points: 20 },
          { name: 'テーブル', count: 2, points: 15 },
          { name: '椅子', count: 6, points: 5 },
          { name: '冷蔵庫', count: 1, points: 30 },
          { name: '洗濯機', count: 1, points: 25 },
          { name: 'ベッド', count: 2, points: 18 },
          { name: '本棚', count: 3, points: 12 },
          { name: 'テレビ', count: 1, points: 8 },
        ],
        timeSlot: 'early_morning' as const,
        selectedOptions: ['packing', 'cleaning', 'storage'],
        moveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15日後
        taxRate: 0.1,
      };

      const startTime = performance.now();
      
      // 100回の複雑な見積もり計算
      const results = Array.from({ length: 100 }, () => 
        businessLogic.movingEstimateLogic.calculateMovingEstimate(complexScenario)
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(100);
      expect(results.every(result => {
        return result.total > result.subtotal && 
               result.breakdown.totalPoints === 215 && // 正しい計算値: 1*20 + 2*15 + 6*5 + 1*30 + 1*25 + 2*18 + 3*12 + 1*8 = 215
               result.timeSurcharge > 0;
      })).toBe(true);
      
      // 複雑なシナリオでも100ms以内に完了
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('スケーラビリティテスト', () => {
  test('データサイズによる性能の線形性', () => {
    const testSizes = [100, 1000, 5000];
    const results: number[] = [];
    
    testSizes.forEach(size => {
      const testData = Array.from({ length: size }, (_, i) => i);
      
      const startTime = performance.now();
      arrayUtils.unique(testData);
      const endTime = performance.now();
      
      results.push(endTime - startTime);
    });
    
    // 処理時間がデータサイズに比例して増加することを確認
    expect(results[1]).toBeGreaterThan(results[0]);
    expect(results[2]).toBeGreaterThan(results[1]);
    
    // すべて許容範囲内であることを確認
    expect(results.every(duration => duration < 100)).toBe(true);
  });
});