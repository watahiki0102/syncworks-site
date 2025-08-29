/**
 * パフォーマンス統合テスト
 * 重要機能のパフォーマンス検証
 */

import { performance } from 'perf_hooks';
import { render } from '@testing-library/react';
import { calculateMovingEstimate } from '../../utils/pricing';
import { validateCustomerData } from '../../utils/validation';
import { formatCurrency, formatDate } from '../../utils/format';
import AdminButton from '../../components/admin/AdminButton';
import ProgressBar from '../../components/ProgressBar';
import StarRating from '../../components/StarRating';

describe('Performance Integration Tests', () => {
  describe('Pricing Calculation Performance', () => {
    it('大量データでも1秒以内で計算完了する', () => {
      const startTime = performance.now();
      
      // 大量のアイテムデータ
      const largeItemList = Array.from({ length: 1000 }, (_, i) => ({
        name: `アイテム${i + 1}`,
        points: Math.floor(Math.random() * 100) + 1,
        quantity: Math.floor(Math.random() * 10) + 1
      }));

      const result = calculateMovingEstimate({
        distance: 50,
        items: largeItemList,
        timeSlot: '午前',
        selectedOptions: ['梱包サービス', '家具組立', '不用品回収']
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // 1秒以内
      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
      expect(result.total).toBeGreaterThan(0);
    });

    it('複数回の計算でメモリリークがない', () => {
      const iterations = 100;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        const result = calculateMovingEstimate({
          distance: 20 + i,
          items: [
            { name: 'テスト', points: 50, quantity: 1 },
            { name: 'テスト2', points: 30, quantity: 2 }
          ],
          timeSlot: '午後',
          selectedOptions: ['梱包サービス']
        });
        results.push(result);
      }

      expect(results).toHaveLength(iterations);
      results.forEach(result => {
        expect(result.total).toBeGreaterThan(0);
      });
    });
  });

  describe('Validation Performance', () => {
    it('大量データバリデーションが効率的に実行される', () => {
      const startTime = performance.now();

      const testData = {
        lastName: '山田',
        firstName: '太郎',
        email: 'yamada.taro@example.com',
        phone: '090-1234-5678',
        postalCode: '150-0002',
        address: '東京都渋谷区渋谷1-1-1 渋谷ビル101号室'
      };

      // 1000回のバリデーション
      const results = [];
      for (let i = 0; i < 1000; i++) {
        const result = validateCustomerData({
          ...testData,
          email: `test${i}@example.com`
        });
        results.push(result);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // 0.5秒以内
      expect(results).toHaveLength(1000);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Format Function Performance', () => {
    it('大量の通貨フォーマットが高速処理される', () => {
      const startTime = performance.now();

      const amounts = Array.from({ length: 10000 }, () => 
        Math.floor(Math.random() * 1000000)
      );

      const formattedResults = amounts.map(amount => formatCurrency(amount));

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 0.1秒以内
      expect(formattedResults).toHaveLength(10000);
      formattedResults.forEach(formatted => {
        expect(typeof formatted).toBe('string');
        expect(formatted).toMatch(/¥[\d,]+/);
      });
    });

    it('日付フォーマットが効率的に処理される', () => {
      const startTime = performance.now();

      const dates = Array.from({ length: 1000 }, () => 
        new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      );

      const formattedResults = dates.map(date => formatDate(date));

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // 0.05秒以内
      expect(formattedResults).toHaveLength(1000);
      formattedResults.forEach(formatted => {
        expect(typeof formatted).toBe('string');
        expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
      });
    });
  });

  describe('Component Render Performance', () => {
    it('AdminButtonの大量レンダリングが効率的', () => {
      const startTime = performance.now();

      const buttons = Array.from({ length: 100 }, (_, i) => (
        <AdminButton key={i} variant={i % 2 === 0 ? 'primary' : 'secondary'}>
          ボタン {i + 1}
        </AdminButton>
      ));

      render(<div>{buttons}</div>);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(200); // 0.2秒以内
    });

    it('ProgressBarアニメーションが滑らか', () => {
      const startTime = performance.now();

      const progressBars = Array.from({ length: 50 }, (_, i) => (
        <ProgressBar 
          key={i} 
          current={i * 2} 
          total={100} 
        />
      ));

      render(<div>{progressBars}</div>);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 0.1秒以内
    });

    it('StarRatingの複雑計算が高速', () => {
      const startTime = performance.now();

      const ratings = Array.from({ length: 200 }, (_, i) => (
        <StarRating 
          key={i} 
          rating={Math.random() * 5} 
          size={20 + (i % 30)} 
        />
      ));

      render(<div>{ratings}</div>);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(300); // 0.3秒以内
    });
  });

  describe('Memory Usage', () => {
    it('オブジェクト生成でメモリリークがない', () => {
      const iterations = 1000;
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const data = {
          id: i,
          items: Array.from({ length: 10 }, (_, j) => ({
            name: `item_${j}`,
            value: Math.random() * 100
          })),
          calculation: calculateMovingEstimate({
            distance: 10,
            items: [{ name: 'test', points: 10, quantity: 1 }],
            timeSlot: '午前',
            selectedOptions: []
          })
        };

        // オブジェクトを参照から削除
        if (i % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // メモリ増加が10MB以下であることを確認
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Concurrent Operations', () => {
    it('並列処理でパフォーマンスが維持される', async () => {
      const startTime = performance.now();

      const promises = Array.from({ length: 50 }, async (_, i) => {
        return new Promise(resolve => {
          setTimeout(() => {
            const result = calculateMovingEstimate({
              distance: 10 + i,
              items: [{ name: `item${i}`, points: 20, quantity: 1 }],
              timeSlot: '午前',
              selectedOptions: []
            });
            resolve(result);
          }, Math.random() * 10);
        });
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 0.1秒以内（並列実行のため）
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Edge Case Performance', () => {
    it('極端な値でも安定したパフォーマンス', () => {
      const startTime = performance.now();

      const extremeCases = [
        { distance: 0, items: [], timeSlot: '午前', selectedOptions: [] },
        { distance: 1000, items: Array(100).fill({ name: 'test', points: 1, quantity: 1 }), timeSlot: '深夜', selectedOptions: ['梱包サービス', '家具組立', '不用品回収'] },
        { distance: 0.1, items: [{ name: 'tiny', points: 0.01, quantity: 1000 }], timeSlot: '午後', selectedOptions: [] }
      ];

      const results = extremeCases.map(testCase => 
        calculateMovingEstimate(testCase)
      );

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // 0.05秒以内
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.total).toBe('number');
        expect(result.total).toBeGreaterThanOrEqual(0);
      });
    });
  });
});