/**
 * truckUtils.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  calculateEstimatedPrice,
  calculateRecommendedTrucks,
  getTruckBasePrice,
  getRecommendedTruckType,
  calculateTruckEfficiency,
  calculateOptimalPlan,
  EstimateParams,
  TruckRecommendationParams
} from '../truckUtils';
import { Truck } from '@/types/shared';

// モックトラックデータ
const mockTrucks: Truck[] = [
  {
    id: '1',
    name: '軽トラック',
    plateNumber: '品川 500 あ 1234',
    truckType: '軽トラ',
    status: 'available',
    capacityKg: 350,
    inspectionExpiry: '2025-12-31',
    schedules: []
  },
  {
    id: '2', 
    name: '2トン',
    plateNumber: '品川 500 あ 1235',
    truckType: '2t',
    status: 'available',
    capacityKg: 2000,
    inspectionExpiry: '2025-12-31',
    schedules: []
  },
  {
    id: '3',
    name: '3トン',
    plateNumber: '品川 500 あ 1236', 
    truckType: '3t',
    status: 'available',
    capacityKg: 3000,
    inspectionExpiry: '2025-12-31',
    schedules: []
  },
  {
    id: '4',
    name: '使用中トラック',
    plateNumber: '品川 500 あ 1237',
    truckType: '2t',
    status: 'maintenance',
    capacityKg: 2000,
    inspectionExpiry: '2025-12-31',
    schedules: []
  }
];

describe('truckUtils', () => {
  describe('calculateEstimatedPrice', () => {
    it('基本的な見積もり計算ができる', () => {
      const params: EstimateParams = {
        points: 50,
        distance: 10,
        basePointPrice: 100,
        baseDistancePrice: 50
      };
      
      const result = calculateEstimatedPrice(params);
      expect(result).toBe(5500); // 50*100 + 10*50 = 5500
    });

    it('デフォルト値が正しく適用される', () => {
      const params: EstimateParams = {
        points: 10
      };
      
      const result = calculateEstimatedPrice(params);
      expect(result).toBe(1000); // 10*100 + 0*50 = 1000
    });

    it('距離のみ指定した場合', () => {
      const params: EstimateParams = {
        points: 20,
        distance: 30
      };
      
      const result = calculateEstimatedPrice(params);
      expect(result).toBe(3500); // 20*100 + 30*50 = 3500
    });

    it('ポイント数が0以下の場合エラーが発生する', () => {
      const params: EstimateParams = {
        points: 0
      };
      
      expect(() => calculateEstimatedPrice(params)).toThrow('ポイント数は0より大きい必要があります');
    });

    it('負のポイント数でエラーが発生する', () => {
      const params: EstimateParams = {
        points: -10
      };
      
      expect(() => calculateEstimatedPrice(params)).toThrow('ポイント数は0より大きい必要があります');
    });

    it('小数点を含む計算で正しく丸められる', () => {
      const params: EstimateParams = {
        points: 33,
        distance: 17,
        basePointPrice: 123,
        baseDistancePrice: 67
      };
      
      const result = calculateEstimatedPrice(params);
      expect(result).toBe(5198); // Math.round(33*123 + 17*67) = 5198
    });
  });

  describe('calculateRecommendedTrucks', () => {
    it('50ポイント以下で軽トラが推奨される', () => {
      const params: TruckRecommendationParams = {
        points: 30,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].truckType).toBe('軽トラ');
    });

    it('51-100ポイントで2tトラックが推奨される', () => {
      const params: TruckRecommendationParams = {
        points: 75,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.some(truck => truck.truckType === '2t')).toBe(true);
    });

    it('101-200ポイントで適切なトラックが推奨される', () => {
      const params: TruckRecommendationParams = {
        points: 150,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.some(truck => ['2t', '3t'].includes(truck.truckType))).toBe(true);
    });

    it('利用可能なトラックのみが推奨される', () => {
      const params: TruckRecommendationParams = {
        points: 50,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.every(truck => truck.status === 'available')).toBe(true);
    });

    it('ポイント数が0以下の場合空配列を返す', () => {
      const params: TruckRecommendationParams = {
        points: 0,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result).toEqual([]);
    });

    it('利用可能なトラックがない場合空配列を返す', () => {
      const unavailableTrucks: Truck[] = [
        { ...mockTrucks[0], status: 'maintenance' },
        { ...mockTrucks[1], status: 'booked' }
      ];
      
      const params: TruckRecommendationParams = {
        points: 50,
        trucks: unavailableTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result).toEqual([]);
    });

    it('重量チェックが正しく機能する', () => {
      const params: TruckRecommendationParams = {
        points: 150,  // 2t, 3tが推奨される範囲
        weight: 2500,
        trucks: mockTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.every(truck => truck.capacityKg >= 2500)).toBe(true);
    });

    it('351ポイント以上で大型トラックが考慮される', () => {
      const largeTrucks: Truck[] = [
        ...mockTrucks,
        {
          id: '5',
          name: '4トン',
          plateNumber: '品川 500 あ 1238',
          truckType: '4t',
          status: 'available',
          capacityKg: 4000,
          inspectionExpiry: '2025-12-31',
          schedules: []
        }
      ];

      const params: TruckRecommendationParams = {
        points: 400,
        trucks: largeTrucks
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.some(truck => truck.truckType === '4t')).toBe(true);
    });

    it('条件に合うトラックがない場合、容量順で代替案を提供', () => {
      const lightTrucksOnly: Truck[] = [
        mockTrucks[0] // 軽トラのみ
      ];

      const params: TruckRecommendationParams = {
        points: 500, // 大量だが軽トラしかない
        trucks: lightTrucksOnly
      };
      
      const result = calculateRecommendedTrucks(params);
      expect(result.length).toBe(1);
      expect(result[0].truckType).toBe('軽トラ');
    });
  });

  describe('getTruckBasePrice', () => {
    it('軽トラの基本料金が正しい', () => {
      expect(getTruckBasePrice('軽トラ')).toBe(15000);
    });

    it('2tトラックの基本料金が正しい', () => {
      expect(getTruckBasePrice('2t')).toBe(30000);
    });

    it('3tトラックの基本料金が正しい', () => {
      expect(getTruckBasePrice('3t')).toBe(45000);
    });

    it('存在しないトラックタイプは0を返す', () => {
      expect(getTruckBasePrice('存在しないタイプ')).toBe(0);
    });

    it('空文字列は0を返す', () => {
      expect(getTruckBasePrice('')).toBe(0);
    });
  });

  describe('getRecommendedTruckType', () => {
    it('50ポイント以下は軽トラ', () => {
      expect(getRecommendedTruckType(30)).toBe('軽トラ');
      expect(getRecommendedTruckType(50)).toBe('軽トラ');
    });

    it('51-100ポイントは2t', () => {
      expect(getRecommendedTruckType(51)).toBe('2t');
      expect(getRecommendedTruckType(100)).toBe('2t');
    });

    it('101-200ポイントは3t', () => {
      expect(getRecommendedTruckType(101)).toBe('3t');
      expect(getRecommendedTruckType(200)).toBe('3t');
    });

    it('201-350ポイントは4t', () => {
      expect(getRecommendedTruckType(201)).toBe('4t');
      expect(getRecommendedTruckType(350)).toBe('4t');
    });

    it('351ポイント以上は8t', () => {
      expect(getRecommendedTruckType(351)).toBe('8t');
      expect(getRecommendedTruckType(1000)).toBe('8t');
    });
  });

  describe('calculateTruckEfficiency', () => {
    it('効率性が正しく計算される', () => {
      const truck = mockTrucks[1]; // 2tトラック (capacityKg: 2000)
      const efficiency = calculateTruckEfficiency(truck, 100);
      
      expect(efficiency).toBe(0.05); // 100/2000 = 0.05
    });

    it('容量が0の場合0を返す', () => {
      const truck = { ...mockTrucks[0], capacityKg: 0 };
      const efficiency = calculateTruckEfficiency(truck, 100);
      
      expect(efficiency).toBe(0);
    });

    it('小数点3位まで正しく丸められる', () => {
      const truck = mockTrucks[0]; // capacityKg: 350
      const efficiency = calculateTruckEfficiency(truck, 117);
      
      expect(efficiency).toBe(0.334); // 117/350 ≈ 0.334
    });
  });

  describe('calculateOptimalPlan', () => {
    it('最適プランが計算される', () => {
      const result = calculateOptimalPlan([50, 30], 20, mockTrucks);
      
      expect(result.totalCost).toBe(9000); // (50+30)*100 + 20*50
      expect(result.recommendedTrucks.length).toBeGreaterThan(0);
      expect(result.efficiency).toBeGreaterThan(0);
    });

    it('最小ポイントリストで正しく処理される', () => {
      // 0ポイントはエラーになるため、代わりに1ポイントでテスト
      const result = calculateOptimalPlan([1], 10, mockTrucks);
      
      expect(result.totalCost).toBe(600); // 1*100 + 10*50 = 600
      expect(result.efficiency).toBeGreaterThanOrEqual(0); // 推奨トラックがない場合は0
    });

    it('推奨トラックがない場合', () => {
      const result = calculateOptimalPlan([50], 10, []);
      
      expect(result.totalCost).toBe(5500); // 50*100 + 10*50
      expect(result.recommendedTrucks).toEqual([]);
      expect(result.efficiency).toBe(0);
    });

    it('複数のポイント数で効率性が計算される', () => {
      const result = calculateOptimalPlan([100, 200, 150], 50, mockTrucks);
      
      expect(result.totalCost).toBe(47500); // 450*100 + 50*50
      expect(result.efficiency).toBeGreaterThan(0);
      expect(typeof result.efficiency).toBe('number');
    });
  });
});