/**
 * ビジネスロジックのテスト
 * - 複合的なビジネスルールのテスト
 * - エッジケースとエラーハンドリング
 * - ドメイン知識の検証
 */

import businessLogic from '../business-logic';

describe('movingEstimateLogic', () => {
  describe('calculateMovingEstimate', () => {
    const validParams = {
      distance: 50,
      items: [
        { name: 'テーブル', count: 1, points: 10 },
        { name: '椅子', count: 4, points: 5 },
      ],
      timeSlot: 'normal',
      selectedOptions: ['packing'],
      moveDate: new Date('2024-06-15'), // 平日
      taxRate: 0.1,
    };

    test('正常な見積もり計算', () => {
      const result = businessLogic.movingEstimateLogic.calculateMovingEstimate(validParams);
      
      expect(result.baseFare).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(result.subtotal);
      expect(result.breakdown.totalPoints).toBe(30); // 1*10 + 4*5
      expect(result.breakdown.selectedOptions).toEqual(['packing']);
      expect(typeof result.taxAmount).toBe('number');
    });

    test('時間帯割増の適用', () => {
      const morningParams = { ...validParams, timeSlot: 'early_morning' };
      const normalParams = { ...validParams, timeSlot: 'normal' };
      
      const morningResult = businessLogic.movingEstimateLogic.calculateMovingEstimate(morningParams);
      const normalResult = businessLogic.movingEstimateLogic.calculateMovingEstimate(normalParams);
      
      expect(morningResult.timeSurcharge).toBeGreaterThan(normalResult.timeSurcharge);
    });

    test('オプション料金の加算', () => {
      const withOptionsParams = { ...validParams, selectedOptions: ['packing', 'cleaning'] };
      const withoutOptionsParams = { ...validParams, selectedOptions: [] };
      
      const withOptionsResult = businessLogic.movingEstimateLogic.calculateMovingEstimate(withOptionsParams);
      const withoutOptionsResult = businessLogic.movingEstimateLogic.calculateMovingEstimate(withoutOptionsParams);
      
      expect(withOptionsResult.optionsTotal).toBeGreaterThan(withoutOptionsResult.optionsTotal);
    });

    test('不正な距離でエラー', () => {
      const invalidParams = { ...validParams, distance: 0 };
      expect(() => businessLogic.movingEstimateLogic.calculateMovingEstimate(invalidParams))
        .toThrow('移動距離は0より大きい必要があります');
    });

    test('不正な日付でエラー', () => {
      const pastDate = new Date('2020-01-01');
      const invalidParams = { ...validParams, moveDate: pastDate };
      expect(() => businessLogic.movingEstimateLogic.calculateMovingEstimate(invalidParams))
        .toThrow('引越し日は今日から60営業日以内で選択してください');
    });
  });

  describe('validateMovingDate', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const unavailableDates = [
      new Date('2024-12-25'), // クリスマス
      new Date('2024-12-31'), // 大晦日
    ];

    test('有効な日付', () => {
      const result = businessLogic.movingEstimateLogic.validateMovingDate(tomorrow, unavailableDates);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('選択された日は利用可能です');
    });

    test('過去の日付', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = businessLogic.movingEstimateLogic.validateMovingDate(yesterday, unavailableDates);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('引越し日は今日以降を選択してください');
    });

    test('利用不可日', () => {
      const result = businessLogic.movingEstimateLogic.validateMovingDate(
        new Date('2024-12-25'), 
        unavailableDates
      );
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('選択された日は予約が埋まっています');
    });
  });
});

describe('customerManagementLogic', () => {
  describe('validateCustomerData', () => {
    const validCustomerData = {
      lastName: '田中',
      firstName: '太郎',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      postalCode: '123-4567',
      address: '東京都渋谷区1-1-1',
    };

    test('正常な顧客データ', () => {
      const result = businessLogic.customerManagementLogic.validateCustomerData(validCustomerData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.normalizedData).toBeTruthy();
      expect(result.normalizedData?.postalCode).toBe('123-4567');
    });

    test('必須フィールドが不足', () => {
      const invalidData = { ...validCustomerData, lastName: '' };
      const result = businessLogic.customerManagementLogic.validateCustomerData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('姓は必須です');
      expect(result.normalizedData).toBeNull();
    });

    test('不正なメールアドレス', () => {
      const invalidData = { ...validCustomerData, email: 'invalid-email' };
      const result = businessLogic.customerManagementLogic.validateCustomerData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('正しいメールアドレスを入力してください');
    });

    test('不正な郵便番号', () => {
      const invalidData = { ...validCustomerData, postalCode: '123456' };
      const result = businessLogic.customerManagementLogic.validateCustomerData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('郵便番号'))).toBe(true);
    });

    test('全角文字の正規化', () => {
      const dataWithFullWidth = { ...validCustomerData, lastName: '田中　太郎' };
      const result = businessLogic.customerManagementLogic.validateCustomerData(dataWithFullWidth);
      expect(result.isValid).toBe(true);
      expect(result.normalizedData?.lastName).toBe('田中 太郎'); // 全角スペースが半角に
    });
  });

  describe('assessCustomerRisk', () => {
    test('低リスク顧客', () => {
      const lowRiskHistory = {
        completedOrders: 10,
        canceledOrders: 0,
        latePayments: 0,
        totalSpent: 1000000,
        accountAge: 365,
      };
      
      const result = businessLogic.customerManagementLogic.assessCustomerRisk(lowRiskHistory);
      expect(result.riskLevel).toBe('low');
      expect(result.riskScore).toBeLessThanOrEqual(1);
      expect(result.factors).toContain('高額利用顧客');
    });

    test('高リスク顧客', () => {
      const highRiskHistory = {
        completedOrders: 2,
        canceledOrders: 3,
        latePayments: 5,
        totalSpent: 50000,
        accountAge: 10,
      };
      
      const result = businessLogic.customerManagementLogic.assessCustomerRisk(highRiskHistory);
      expect(result.riskLevel).toBe('high');
      expect(result.riskScore).toBeGreaterThanOrEqual(4);
      expect(result.factors).toContain('キャンセル率が高い');
      expect(result.factors).toContain('支払い遅延の履歴あり');
      expect(result.factors).toContain('新規顧客');
    });

    test('中リスク顧客', () => {
      const mediumRiskHistory = {
        completedOrders: 5,
        canceledOrders: 1,
        latePayments: 1,
        totalSpent: 200000,
        accountAge: 100,
      };
      
      const result = businessLogic.customerManagementLogic.assessCustomerRisk(mediumRiskHistory);
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });

    test('初回利用顧客', () => {
      const newCustomerHistory = {
        completedOrders: 0,
        canceledOrders: 0,
        latePayments: 0,
        totalSpent: 0,
        accountAge: 1,
      };
      
      const result = businessLogic.customerManagementLogic.assessCustomerRisk(newCustomerHistory);
      expect(result.factors).toContain('新規顧客');
    });
  });
});

describe('fleetManagementLogic', () => {
  describe('findOptimalTruckAssignment', () => {
    const requirements = {
      totalPoints: 100,
      distance: 50,
      timeSlot: 'normal',
      preferredDate: new Date('2024-06-15'),
    };

    const availableTrucks = [
      {
        id: 'truck1',
        name: '小型トラック',
        capacity: 80,
        costPerKm: 100,
        availability: [new Date('2024-06-14')],
      },
      {
        id: 'truck2',
        name: '中型トラック',
        capacity: 150,
        costPerKm: 150,
        availability: [new Date('2024-06-15'), new Date('2024-06-16')],
      },
      {
        id: 'truck3',
        name: '大型トラック',
        capacity: 200,
        costPerKm: 200,
        availability: [new Date('2024-06-15')],
      },
    ];

    test('最適なトラックの選択', () => {
      const result = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        requirements,
        availableTrucks
      );
      
      expect(result.success).toBe(true);
      expect(result.recommendedTruck).toBeTruthy();
      expect(result.recommendedTruck.capacity).toBeGreaterThanOrEqual(requirements.totalPoints);
      expect(result.alternatives).toBeTruthy();
      expect(result.costComparison).toBeTruthy();
    });

    test('容量不足のトラックは除外', () => {
      const highRequirements = { ...requirements, totalPoints: 250 };
      
      const result = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        highRequirements,
        availableTrucks
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('指定日に利用可能なトラックがありません');
      expect(result.alternatives).toBeTruthy();
    });

    test('利用可能日が異なる場合の代替日提案', () => {
      const unavailableDate = { ...requirements, preferredDate: new Date('2024-06-10') };
      
      const result = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        unavailableDate,
        availableTrucks
      );
      
      if (!result.success) {
        expect(result.alternatives).toBeTruthy();
        expect(Array.isArray(result.alternatives)).toBe(true);
      }
    });

    test('コスト効率での順位付け', () => {
      const result = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        requirements,
        availableTrucks
      );
      
      if (result.success && result.alternatives) {
        expect(result.costComparison).toBeTruthy();
        expect(Array.isArray(result.costComparison)).toBe(true);
        expect(result.costComparison.every(item => 
          typeof item.cost === 'number' && typeof item.efficiency === 'number'
        )).toBe(true);
      }
    });

    test('時間帯割増の考慮', () => {
      const earlyMorningRequirements = { ...requirements, timeSlot: 'early_morning' };
      const normalRequirements = { ...requirements, timeSlot: 'normal' };
      
      const earlyResult = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        earlyMorningRequirements,
        availableTrucks
      );
      const normalResult = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        normalRequirements,
        availableTrucks
      );
      
      if (earlyResult.success && normalResult.success) {
        expect(earlyResult.recommendedTruck.totalCost).toBeGreaterThan(
          normalResult.recommendedTruck.totalCost
        );
      }
    });
  });
});