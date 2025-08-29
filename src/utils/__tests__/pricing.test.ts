/**
 * pricing.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  getBasePrice,
  calculateTotalPoints,
  calculateTotalWeight,
  calculateCargoPrice,
  calculateOptionPrice,
  calculateDistancePrice,
  calculateTimeSurcharge,
  calculateTax,
  calculateEstimate,
  formatPriceJPY,
  formatPriceNumber,
  calculateDiscountRate,
  calculateDiscountAmount,
  getRecommendedTruckTypes,
  compareEstimates,
  CargoItem,
  WorkOption,
  TimeBandSurcharge,
  EstimateResult
} from '../pricing';

// テスト用データ
const mockCargoItems: CargoItem[] = [
  { name: 'テーブル', points: 5, weight: 20, quantity: 1 },
  { name: '椅子', points: 2, weight: 5, quantity: 4 },
  { name: '冷蔵庫', points: 10, weight: 60, quantity: 1 }
];

const mockWorkOptions: WorkOption[] = [
  { name: 'エレベーター搬入', price: 3000, selected: true },
  { name: '家具組み立て', price: 5000, selected: true },
  { name: '不用品回収', price: 2000, selected: false }
];

const mockTimeSurcharges: TimeBandSurcharge[] = [
  { id: '1', start: '18:00', end: '21:00', kind: 'rate', value: 1.2 },
  { id: '2', start: '06:00', end: '09:00', kind: 'fixed', value: 5000 }
];

describe('pricing utils', () => {
  describe('getBasePrice', () => {
    it('正しいトラック種別の基本料金を返す', () => {
      expect(getBasePrice('軽トラック')).toBe(15000);
      expect(getBasePrice('2tショート')).toBe(25000);
      expect(getBasePrice('2t')).toBe(30000);
      expect(getBasePrice('3t')).toBe(40000);
      expect(getBasePrice('4t')).toBe(50000);
    });

    it('存在しないトラック種別は0を返す', () => {
      expect(getBasePrice('存在しないトラック')).toBe(0);
      expect(getBasePrice('')).toBe(0);
    });
  });

  describe('calculateTotalPoints', () => {
    it('正しく総ポイント数を計算する', () => {
      const result = calculateTotalPoints(mockCargoItems);
      // テーブル(5*1) + 椅子(2*4) + 冷蔵庫(10*1) = 5 + 8 + 10 = 23
      expect(result).toBe(23);
    });

    it('空の配列は0を返す', () => {
      expect(calculateTotalPoints([])).toBe(0);
    });

    it('数量0のアイテムも正しく計算する', () => {
      const items: CargoItem[] = [
        { name: 'テーブル', points: 5, quantity: 0 },
        { name: '椅子', points: 2, quantity: 3 }
      ];
      expect(calculateTotalPoints(items)).toBe(6); // 0 + 6 = 6
    });
  });

  describe('calculateTotalWeight', () => {
    it('正しく総重量を計算する', () => {
      const result = calculateTotalWeight(mockCargoItems);
      // テーブル(20*1) + 椅子(5*4) + 冷蔵庫(60*1) = 20 + 20 + 60 = 100
      expect(result).toBe(100);
    });

    it('重量が未定義のアイテムも正しく処理する', () => {
      const items: CargoItem[] = [
        { name: 'テーブル', points: 5, weight: 20, quantity: 1 },
        { name: '小物', points: 1, quantity: 2 } // weightなし
      ];
      expect(calculateTotalWeight(items)).toBe(20); // 20 + 0 = 20
    });

    it('空の配列は0を返す', () => {
      expect(calculateTotalWeight([])).toBe(0);
    });
  });

  describe('calculateCargoPrice', () => {
    it('正しく荷物料金を計算する', () => {
      const result = calculateCargoPrice(mockCargoItems);
      // 23ポイント × 500円 = 11,500円
      expect(result).toBe(11500);
    });

    it('空の配列は0を返す', () => {
      expect(calculateCargoPrice([])).toBe(0);
    });
  });

  describe('calculateOptionPrice', () => {
    it('選択されたオプションのみ計算する', () => {
      const result = calculateOptionPrice(mockWorkOptions);
      // エレベーター搬入(3000) + 家具組み立て(5000) = 8,000円
      expect(result).toBe(8000);
    });

    it('何も選択されていない場合は0を返す', () => {
      const options: WorkOption[] = [
        { name: 'オプション1', price: 1000, selected: false },
        { name: 'オプション2', price: 2000, selected: false }
      ];
      expect(calculateOptionPrice(options)).toBe(0);
    });

    it('空の配列は0を返す', () => {
      expect(calculateOptionPrice([])).toBe(0);
    });
  });

  describe('calculateDistancePrice', () => {
    it('基本距離内は0円', () => {
      expect(calculateDistancePrice(5, 10)).toBe(0);
      expect(calculateDistancePrice(10, 10)).toBe(0);
    });

    it('基本距離を超える場合は追加料金が計算される', () => {
      // 15km, 基本距離10km → 追加5km × 50円 = 250円
      expect(calculateDistancePrice(15, 10)).toBe(250);
    });

    it('デフォルト基本距離(10km)が使用される', () => {
      expect(calculateDistancePrice(15)).toBe(250); // (15-10) * 50 = 250
    });

    it('小数点は切り上げられる', () => {
      expect(calculateDistancePrice(12.3, 10)).toBe(150); // Math.ceil(2.3) * 50 = 150
    });

    it('0距離は0円', () => {
      expect(calculateDistancePrice(0)).toBe(0);
    });
  });

  describe('calculateTimeSurcharge', () => {
    it('倍率タイプの追加料金を計算する', () => {
      const surcharges: TimeBandSurcharge[] = [
        { id: '1', start: '18:00', end: '21:00', kind: 'rate', value: 1.2 }
      ];
      const result = calculateTimeSurcharge(10000, surcharges);
      // 10000 × (1.2 - 1) = 2000円
      expect(result).toBe(2000);
    });

    it('固定額タイプの追加料金を計算する', () => {
      const surcharges: TimeBandSurcharge[] = [
        { id: '1', start: '06:00', end: '09:00', kind: 'fixed', value: 5000 }
      ];
      const result = calculateTimeSurcharge(10000, surcharges);
      expect(result).toBe(5000);
    });

    it('複数の追加料金を合計する', () => {
      const result = calculateTimeSurcharge(10000, mockTimeSurcharges);
      // 倍率: 10000 × (1.2 - 1) = 2000
      // 固定額: 5000
      // 合計: 7000円
      expect(result).toBe(7000);
    });

    it('追加料金がない場合は0を返す', () => {
      expect(calculateTimeSurcharge(10000, [])).toBe(0);
    });

    it('小数点は丸められる', () => {
      const surcharges: TimeBandSurcharge[] = [
        { id: '1', start: '18:00', end: '21:00', kind: 'rate', value: 1.33 }
      ];
      const result = calculateTimeSurcharge(10000, surcharges);
      // 10000 × (1.33 - 1) = 3300円
      expect(result).toBe(3300);
    });
  });

  describe('calculateTax', () => {
    it('デフォルト税率(10%)で計算する', () => {
      expect(calculateTax(1000)).toBe(100);
    });

    it('カスタム税率で計算する', () => {
      expect(calculateTax(1000, 0.08)).toBe(80); // 8%
    });

    it('小数点は丸められる', () => {
      expect(calculateTax(1333, 0.1)).toBe(133); // Math.round(133.3) = 133
    });

    it('0円の場合は0を返す', () => {
      expect(calculateTax(0)).toBe(0);
    });
  });

  describe('calculateEstimate', () => {
    it('総合見積もりを正しく計算する', () => {
      const params = {
        truckType: '2t',
        items: mockCargoItems,
        options: mockWorkOptions,
        distance: 15,
        timeSurcharges: mockTimeSurcharges,
        taxRate: 0.1
      };

      const result = calculateEstimate(params);

      expect(result.basePrice).toBe(30000);       // 2t基本料金
      expect(result.cargoPrice).toBe(11500);      // 23ポイント × 500
      expect(result.optionPrice).toBe(8000);      // 選択されたオプション合計
      expect(result.distancePrice).toBe(250);     // (15-10) × 50
      expect(result.timeSurcharge).toBe(14950);   // (49750 × 0.2) + 5000 = 14950
      expect(result.subtotal).toBe(64700);        // 49750 + 14950
      expect(result.tax).toBe(6470);              // 64700 × 0.1
      expect(result.total).toBe(71170);           // 64700 + 6470
    });

    it('最小構成で正しく計算する', () => {
      const params = {
        truckType: '軽トラック',
        items: [],
        options: []
      };

      const result = calculateEstimate(params);

      expect(result.basePrice).toBe(15000);
      expect(result.cargoPrice).toBe(0);
      expect(result.optionPrice).toBe(0);
      expect(result.distancePrice).toBe(0);
      expect(result.timeSurcharge).toBe(0);
      expect(result.subtotal).toBe(15000);
      expect(result.tax).toBe(1500);
      expect(result.total).toBe(16500);
    });

    it('存在しないトラック種別でも計算する', () => {
      const params = {
        truckType: '存在しないトラック',
        items: mockCargoItems,
        options: []
      };

      const result = calculateEstimate(params);
      expect(result.basePrice).toBe(0);
      expect(result.cargoPrice).toBe(11500);
    });
  });

  describe('formatPriceJPY', () => {
    it('日本円フォーマットで表示する', () => {
      expect(formatPriceJPY(1000)).toBe('￥1,000');
      expect(formatPriceJPY(1234567)).toBe('￥1,234,567');
    });

    it('0円も正しくフォーマットする', () => {
      expect(formatPriceJPY(0)).toBe('￥0');
    });

    it('小数点は表示されない', () => {
      expect(formatPriceJPY(1234.56)).toBe('￥1,235'); // 四捨五入される
    });
  });

  describe('formatPriceNumber', () => {
    it('数値フォーマットで表示する', () => {
      expect(formatPriceNumber(1000)).toBe('1,000');
      expect(formatPriceNumber(1234567)).toBe('1,234,567');
    });

    it('0も正しくフォーマットする', () => {
      expect(formatPriceNumber(0)).toBe('0');
    });
  });

  describe('calculateDiscountRate', () => {
    it('割引率を正しく計算する', () => {
      expect(calculateDiscountRate(10000, 8000)).toBe(20); // 20%割引
      expect(calculateDiscountRate(5000, 4000)).toBe(20);  // 20%割引
    });

    it('割引がない場合は0を返す', () => {
      expect(calculateDiscountRate(10000, 10000)).toBe(0);
    });

    it('元の価格が0の場合は0を返す', () => {
      expect(calculateDiscountRate(0, 0)).toBe(0);
    });

    it('値引き後の価格が高い場合（負の割引）も計算する', () => {
      expect(calculateDiscountRate(8000, 10000)).toBe(-25); // -25%（値上がり）
    });

    it('小数点は丸められる', () => {
      expect(calculateDiscountRate(1000, 667)).toBe(33); // 33.3% → 33%
    });
  });

  describe('calculateDiscountAmount', () => {
    it('割引額を正しく計算する', () => {
      expect(calculateDiscountAmount(10000, 20)).toBe(2000); // 20%割引 = 2000円
      expect(calculateDiscountAmount(5000, 10)).toBe(500);   // 10%割引 = 500円
    });

    it('0%割引は0円', () => {
      expect(calculateDiscountAmount(10000, 0)).toBe(0);
    });

    it('100%割引は全額', () => {
      expect(calculateDiscountAmount(10000, 100)).toBe(10000);
    });

    it('小数点は丸められる', () => {
      expect(calculateDiscountAmount(1000, 33)).toBe(330); // Math.round(333.3) = 333 → 実際は330
    });
  });

  describe('getRecommendedTruckTypes', () => {
    it('少ないポイント・軽量で軽トラックを推奨', () => {
      const result = getRecommendedTruckTypes(30, 200);
      expect(result).toContain('軽トラック');
    });

    it('中程度のポイント・重量で適切なトラックを推奨', () => {
      const result = getRecommendedTruckTypes(75, 1500);
      expect(result).toEqual(expect.arrayContaining(['2tショート', '2t']));
    });

    it('大量のポイント・重量で大型トラックを推奨', () => {
      const result = getRecommendedTruckTypes(400, 3500);
      expect(result).toContain('4t');
    });

    it('重量基準でフィルタリングされる', () => {
      const result = getRecommendedTruckTypes(50, 5000); // 軽量ポイントだが重い
      // 5000kgでも交集合がないため、ポイント基準の推奨が返される
      expect(result).toEqual(expect.arrayContaining(['軽トラック', '2tショート']));
    });

    it('交集合が空の場合はポイント基準の推奨を返す', () => {
      const result = getRecommendedTruckTypes(30, 10000); // 非常に重い
      // 重量基準では推奨なしだが、ポイント基準の推奨を返す
      expect(result.length).toBeGreaterThan(0);
    });

    it('境界値を正しく処理する', () => {
      expect(getRecommendedTruckTypes(50, 350)).toEqual(expect.arrayContaining(['軽トラック']));
      expect(getRecommendedTruckTypes(51, 351)).not.toContain('軽トラック');
    });
  });

  describe('compareEstimates', () => {
    const mockEstimates: EstimateResult[] = [
      {
        basePrice: 15000,
        cargoPrice: 5000,
        optionPrice: 2000,
        distancePrice: 500,
        timeSurcharge: 0,
        subtotal: 22500,
        tax: 2250,
        total: 24750
      },
      {
        basePrice: 30000,
        cargoPrice: 10000,
        optionPrice: 5000,
        distancePrice: 1000,
        timeSurcharge: 2000,
        subtotal: 48000,
        tax: 4800,
        total: 52800
      },
      {
        basePrice: 25000,
        cargoPrice: 7500,
        optionPrice: 3000,
        distancePrice: 750,
        timeSurcharge: 1000,
        subtotal: 37250,
        tax: 3725,
        total: 40975
      }
    ];

    it('正しく比較結果を返す', () => {
      const result = compareEstimates(mockEstimates);

      expect(result.cheapest.total).toBe(24750);
      expect(result.mostExpensive.total).toBe(52800);
      expect(result.averagePrice).toBe(39508); // (24750 + 52800 + 40975) / 3 ≈ 39508
    });

    it('単一の見積もりでも正しく処理する', () => {
      const result = compareEstimates([mockEstimates[0]]);

      expect(result.cheapest).toBe(mockEstimates[0]);
      expect(result.mostExpensive).toBe(mockEstimates[0]);
      expect(result.averagePrice).toBe(24750);
    });

    it('空の配列でエラーを投げる', () => {
      expect(() => compareEstimates([])).toThrow('見積もりデータが空です');
    });

    it('同じ金額の見積もりも正しく処理する', () => {
      const sameEstimates = [mockEstimates[0], { ...mockEstimates[0] }];
      const result = compareEstimates(sameEstimates);

      expect(result.cheapest.total).toBe(result.mostExpensive.total);
      expect(result.averagePrice).toBe(24750);
    });

    it('平均価格が正しく丸められる', () => {
      // 奇数で割り切れない値でテスト
      const oddEstimates = [
        { ...mockEstimates[0], total: 10000 },
        { ...mockEstimates[0], total: 10001 },
        { ...mockEstimates[0], total: 10002 }
      ];
      const result = compareEstimates(oddEstimates);
      expect(result.averagePrice).toBe(10001); // Math.round(30003/3)
    });
  });
});