/**
 * テストデータジェネレーター
 * - TDDサイクルを高速化するためのテストデータ生成
 * - 境界値テスト用のデータセット
 * - パフォーマンステスト用の大量データ生成
 */

/**
 * 基本的なデータジェネレーター
 */
export class DataGenerators {
  /**
   * ランダムな整数を生成
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * ランダムな文字列を生成
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * ランダムな日本語文字列を生成
   */
  static randomJapaneseString(length: number = 5): string {
    const hiragana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    return Array.from({ length }, () => hiragana[Math.floor(Math.random() * hiragana.length)]).join('');
  }

  /**
   * ランダムなメールアドレスを生成
   */
  static randomEmail(): string {
    const domains = ['example.com', 'test.co.jp', 'sample.org'];
    const username = this.randomString(8);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
  }

  /**
   * ランダムな郵便番号を生成
   */
  static randomPostalCode(): string {
    const first = this.randomInt(100, 999);
    const second = this.randomInt(1000, 9999);
    return `${first}-${second}`;
  }

  /**
   * ランダムな電話番号を生成
   */
  static randomPhoneNumber(): string {
    const patterns = [
      '090-####-####',
      '080-####-####', 
      '070-####-####',
      '03-####-####',
      '06-####-####'
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return pattern.replace(/#/g, () => this.randomInt(0, 9).toString());
  }

  /**
   * ランダムな日付を生成
   */
  static randomDate(startYear: number = 2020, endYear: number = 2025): Date {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}

/**
 * 引越しドメイン用のテストデータジェネレーター
 */
export class MovingDataGenerators {
  /**
   * 顧客データを生成
   */
  static generateCustomerData(overrides: Partial<any> = {}) {
    return {
      lastName: DataGenerators.randomJapaneseString(3),
      firstName: DataGenerators.randomJapaneseString(3),
      email: DataGenerators.randomEmail(),
      phone: DataGenerators.randomPhoneNumber(),
      postalCode: DataGenerators.randomPostalCode(),
      address: `東京都${DataGenerators.randomJapaneseString(2)}区${DataGenerators.randomString(3)}${DataGenerators.randomInt(1, 99)}-${DataGenerators.randomInt(1, 99)}-${DataGenerators.randomInt(1, 99)}`,
      ...overrides,
    };
  }

  /**
   * 引越しアイテムデータを生成
   */
  static generateMovingItems(count: number = 5): Array<{ name: string; count: number; points: number }> {
    const itemTypes = [
      { name: 'テーブル', basePoints: 15 },
      { name: '椅子', basePoints: 5 },
      { name: 'ソファ', basePoints: 20 },
      { name: '冷蔵庫', basePoints: 30 },
      { name: '洗濯機', basePoints: 25 },
      { name: 'ベッド', basePoints: 18 },
      { name: '本棚', basePoints: 12 },
      { name: 'テレビ', basePoints: 8 },
      { name: '衣装ケース', basePoints: 6 },
      { name: '掃除機', basePoints: 4 },
    ];

    return Array.from({ length: count }, () => {
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      return {
        name: itemType.name,
        count: DataGenerators.randomInt(1, 4),
        points: itemType.basePoints + DataGenerators.randomInt(-3, 3),
      };
    });
  }

  /**
   * 見積もりパラメーターを生成
   */
  static generateEstimateParams(overrides: Partial<any> = {}) {
    const timeSlots = ['normal', 'early_morning', 'night', 'afternoon'];
    const options = ['packing', 'cleaning', 'storage', 'disposal'];
    
    // 将来の日付を生成（7-37日後）
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + DataGenerators.randomInt(7, 37));
    
    return {
      distance: DataGenerators.randomInt(10, 200),
      items: this.generateMovingItems(DataGenerators.randomInt(3, 8)),
      timeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
      selectedOptions: options.slice(0, DataGenerators.randomInt(0, 3)),
      moveDate: futureDate,
      taxRate: 0.1,
      ...overrides,
    };
  }

  /**
   * 顧客履歴データを生成
   */
  static generateCustomerHistory(overrides: Partial<any> = {}) {
    return {
      completedOrders: DataGenerators.randomInt(0, 20),
      canceledOrders: DataGenerators.randomInt(0, 5),
      latePayments: DataGenerators.randomInt(0, 3),
      totalSpent: DataGenerators.randomInt(10000, 2000000),
      accountAge: DataGenerators.randomInt(1, 1000),
      ...overrides,
    };
  }

  /**
   * トラックデータを生成
   */
  static generateTruckData(count: number = 5): Array<{
    id: string;
    name: string;
    capacity: number;
    costPerKm: number;
    availability: Date[];
  }> {
    const truckTypes = [
      { name: '軽トラック', baseCapacity: 50, baseCost: 80 },
      { name: '小型トラック', baseCapacity: 100, baseCost: 120 },
      { name: '中型トラック', baseCapacity: 200, baseCost: 180 },
      { name: '大型トラック', baseCapacity: 350, baseCost: 250 },
    ];

    return Array.from({ length: count }, (_, i) => {
      const truckType = truckTypes[Math.floor(Math.random() * truckTypes.length)];
      const availabilityCount = DataGenerators.randomInt(3, 10);
      
      return {
        id: `truck_${i + 1}`,
        name: `${truckType.name}_${i + 1}`,
        capacity: truckType.baseCapacity + DataGenerators.randomInt(-20, 50),
        costPerKm: truckType.baseCost + DataGenerators.randomInt(-20, 30),
        availability: Array.from({ length: availabilityCount }, () => 
          DataGenerators.randomDate(2024, 2024)
        ),
      };
    });
  }
}

/**
 * 境界値テスト用のデータセット
 */
export class BoundaryTestData {
  /**
   * 数値系の境界値データ
   */
  static numericBoundaries = {
    positive: [0.01, 1, 999999, Number.MAX_SAFE_INTEGER],
    negative: [-0.01, -1, -999999, Number.MIN_SAFE_INTEGER],
    zero: [0, 0.0, -0],
    decimal: [0.1, 0.99, 1.01, 99.99],
    invalid: [NaN, Infinity, -Infinity],
  };

  /**
   * 文字列系の境界値データ
   */
  static stringBoundaries = {
    empty: ['', '   ', '\t\n'],
    short: ['a', '12', 'あ'],
    long: ['x'.repeat(100), 'あ'.repeat(50), DataGenerators.randomString(1000)],
    special: ['!@#$%^&*()', '()[]{}<>', '\\/"\'`~'],
    unicode: ['🎯', '😀', '■□▲△○●'],
    japanese: ['ひらがな', 'カタカナ', '漢字'],
  };

  /**
   * 配列系の境界値データ
   */
  static arrayBoundaries = {
    empty: [[]],
    single: [[1], ['a'], [{ id: 1 }]],
    large: [Array.from({ length: 10000 }, (_, i) => i)],
    mixed: [[1, 'a', null, undefined, {}]],
    nested: [[[1, 2], [3, 4]], [{ a: [1, 2] }]],
  };

  /**
   * 日付系の境界値データ
   */
  static dateBoundaries = {
    past: [new Date('1900-01-01'), new Date('2000-01-01')],
    present: [new Date(), new Date(Date.now() - 1000), new Date(Date.now() + 1000)],
    future: [new Date('2030-01-01'), new Date('2099-12-31')],
    invalid: [new Date('invalid'), new Date(NaN)],
  };
}

/**
 * パフォーマンステスト用の大量データジェネレーター
 */
export class PerformanceTestData {
  /**
   * 大量の顧客データを生成
   */
  static generateLargeCustomerDataset(size: number = 10000) {
    return Array.from({ length: size }, () => 
      MovingDataGenerators.generateCustomerData()
    );
  }

  /**
   * 大量の見積もりデータを生成
   */
  static generateLargeEstimateDataset(size: number = 5000) {
    return Array.from({ length: size }, () => 
      MovingDataGenerators.generateEstimateParams()
    );
  }

  /**
   * 複雑な階層データを生成
   */
  static generateComplexHierarchicalData(depth: number = 5, width: number = 10): any {
    if (depth === 0) {
      return {
        id: DataGenerators.randomString(),
        value: DataGenerators.randomInt(1, 1000),
        name: DataGenerators.randomJapaneseString(),
      };
    }

    return {
      id: DataGenerators.randomString(),
      level: depth,
      children: Array.from({ length: width }, () => 
        this.generateComplexHierarchicalData(depth - 1, width)
      ),
      metadata: {
        created: DataGenerators.randomDate(),
        tags: Array.from({ length: DataGenerators.randomInt(1, 5) }, () => 
          DataGenerators.randomString(5)
        ),
      },
    };
  }

  /**
   * 時系列データを生成
   */
  static generateTimeSeriesData(
    startDate: Date,
    endDate: Date,
    intervalMinutes: number = 60
  ): Array<{ timestamp: Date; value: number }> {
    const data: Array<{ timestamp: Date; value: number }> = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      data.push({
        timestamp: new Date(current),
        value: DataGenerators.randomInt(0, 1000) + Math.sin(current.getTime() / 1000000) * 100,
      });
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    
    return data;
  }
}

/**
 * テストシナリオジェネレーター
 */
export class TestScenarioGenerator {
  /**
   * 正常系のシナリオを生成
   */
  static generateHappyPathScenarios(count: number = 10) {
    return Array.from({ length: count }, () => ({
      description: `正常ケース_${DataGenerators.randomString(5)}`,
      input: MovingDataGenerators.generateEstimateParams(),
      expectedResult: 'success',
    }));
  }

  /**
   * 異常系のシナリオを生成
   */
  static generateErrorScenarios(): Array<{ description: string; input: any; expectedError: string }> {
    return [
      {
        description: '距離が負の値',
        input: MovingDataGenerators.generateEstimateParams({ distance: -10 }),
        expectedError: '移動距離は0より大きい必要があります',
      },
      {
        description: '過去の日付',
        input: MovingDataGenerators.generateEstimateParams({ 
          moveDate: new Date('2020-01-01') 
        }),
        expectedError: '引越し日は今日から60営業日以内で選択してください',
      },
      {
        description: '空のアイテムリスト',
        input: MovingDataGenerators.generateEstimateParams({ items: [] }),
        expectedError: 'アイテムが指定されていません',
      },
    ];
  }

  /**
   * パフォーマンステストシナリオを生成
   */
  static generatePerformanceScenarios() {
    return {
      light: {
        description: '軽量データ処理',
        dataSize: 100,
        expectedMaxTime: 50, // ms
      },
      medium: {
        description: '中量データ処理',  
        dataSize: 1000,
        expectedMaxTime: 200, // ms
      },
      heavy: {
        description: '大量データ処理',
        dataSize: 10000,
        expectedMaxTime: 1000, // ms
      },
    };
  }
}

/**
 * テストデータのバリデーター
 */
export class TestDataValidator {
  /**
   * 生成されたデータの妥当性をチェック
   */
  static validateCustomerData(data: any): boolean {
    return !!(
      data.lastName &&
      data.firstName &&
      data.email?.includes('@') &&
      data.phone &&
      data.postalCode?.match(/^\d{3}-\d{4}$/) &&
      data.address
    );
  }

  /**
   * 生成されたアイテムデータの妥当性をチェック
   */
  static validateMovingItems(items: any[]): boolean {
    return items.every(item => 
      item.name && 
      typeof item.count === 'number' && 
      item.count > 0 &&
      typeof item.points === 'number' &&
      item.points > 0
    );
  }

  /**
   * パフォーマンステストデータの統計情報を取得
   */
  static getDataStatistics(data: any[]): {
    count: number;
    memoryUsage: string;
    types: Record<string, number>;
  } {
    const types: Record<string, number> = {};
    
    data.forEach(item => {
      const type = Array.isArray(item) ? 'array' : typeof item;
      types[type] = (types[type] || 0) + 1;
    });

    // 概算メモリ使用量（実際のブラウザ環境では正確な測定が困難）
    const estimatedSize = JSON.stringify(data).length * 2; // UTF-16 approximation
    const memoryUsage = estimatedSize > 1024 * 1024 
      ? `${(estimatedSize / 1024 / 1024).toFixed(2)} MB`
      : `${(estimatedSize / 1024).toFixed(2)} KB`;

    return {
      count: data.length,
      memoryUsage,
      types,
    };
  }
}

export default {
  DataGenerators,
  MovingDataGenerators,
  BoundaryTestData,
  PerformanceTestData,
  TestScenarioGenerator,
  TestDataValidator,
};