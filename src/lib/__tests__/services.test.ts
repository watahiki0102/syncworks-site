/**
 * サービス層のテスト
 * - 依存性注入とモック化
 * - 副作用のテスト
 * - 統合テストの考慮
 */

import {
  EstimateService,
  FleetManagementService,
  CustomerService,
  ApiClient,
  NotificationService,
  StorageService
} from '../services';

// ビジネスロジックのモック
jest.mock('../business-logic', () => ({
  businessLogic: {
    customerManagementLogic: {
      validateCustomerData: jest.fn().mockReturnValue({
        isValid: true,
        normalizedData: {
          lastName: '田中',
          firstName: '太郎',
          email: 'tanaka@example.com',
          phone: '090-1234-5678',
          postalCode: '123-4567',
          address: '東京都渋谷区1-1-1',
        }
      }),
      assessCustomerRisk: jest.fn().mockReturnValue({
        riskLevel: 'low',
        riskScore: 25,
        factors: ['新規顧客'],
        recommendedActions: ['定期的なフォローアップ']
      })
    },
    movingEstimateLogic: {
      calculateMovingEstimate: jest.fn().mockReturnValue({
        baseFare: 50000,
        timeSurcharge: 5000,
        optionsTotal: 10000,
        subtotal: 65000,
        taxAmount: 6500,
        total: 71500,
        breakdown: {
          distance: 50,
          totalPoints: 30,
          baseRate: 1000,
          timeSlot: 'normal',
          selectedOptions: ['packing']
        }
      })
    },
    fleetManagementLogic: {
      findOptimalTruckAssignment: jest.fn().mockReturnValue({
        success: true,
        recommendedTruck: {
          id: 'truck1',
          name: '中型トラック',
          capacity: 150,
          costPerKm: 150
        },
        alternatives: []
      })
    }
  }
}));

// モック定義
const mockApiClient: jest.Mocked<ApiClient> = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockNotificationService: jest.Mocked<NotificationService> = {
  sendEmail: jest.fn(),
  sendSMS: jest.fn(),
};

const mockStorageService: jest.Mocked<StorageService> = {
  save: jest.fn(),
  load: jest.fn(),
  delete: jest.fn(),
};

describe('EstimateService', () => {
  let estimateService: EstimateService;

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // サービスインスタンスを作成
    estimateService = new EstimateService(
      mockApiClient,
      mockNotificationService,
      mockStorageService
    );
  });

  describe('createEstimate', () => {
    const validEstimateData = {
      customerInfo: {
        lastName: '田中',
        firstName: '太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        postalCode: '123-4567',
        address: '東京都渋谷区1-1-1',
      },
      movingDetails: {
        distance: 50,
        items: [
          { name: 'テーブル', count: 1, points: 10 },
          { name: '椅子', count: 4, points: 5 },
        ],
        timeSlot: 'normal',
        selectedOptions: ['packing'],
        moveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14日後
      },
    };

    test('正常な見積もり作成フロー', async () => {
      // APIモックの設定
      mockApiClient.post.mockResolvedValue({ id: 'estimate_123' });
      mockStorageService.save.mockResolvedValue();
      mockNotificationService.sendEmail.mockResolvedValue();

      const result = await estimateService.createEstimate(validEstimateData);

      expect(result.success).toBe(true);
      expect(result.estimateId).toBe('estimate_123');
      expect(result.estimate).toBeTruthy();
      
      // APIが正しく呼ばれることを検証
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/estimates', expect.objectContaining({
        customerInfo: expect.any(Object),
        movingDetails: validEstimateData.movingDetails,
        estimate: expect.any(Object),
        createdAt: expect.any(String),
      }));
      
      // ストレージに保存されることを検証
      expect(mockStorageService.save).toHaveBeenCalledWith(
        'estimate_estimate_123',
        expect.objectContaining({
          estimate: expect.any(Object),
          estimateId: 'estimate_123',
        })
      );
      
      // 確認メールが送信されることを検証
      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
        'tanaka@example.com',
        '引越し見積もりを受け付けました',
        expect.stringContaining('estimate_123')
      );
    });

    test('不正な顧客データでエラー', async () => {
      const invalidData = {
        ...validEstimateData,
        customerInfo: {
          ...validEstimateData.customerInfo,
          lastName: '', // 必須フィールドが空
        },
      };

      const result = await estimateService.createEstimate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('姓は必須です');
      
      // エラー時はAPIが呼ばれないことを検証
      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(mockNotificationService.sendEmail).not.toHaveBeenCalled();
    });

    test('API呼び出し失敗時のエラーハンドリング', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await estimateService.createEstimate(validEstimateData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('見積もりの作成に失敗しました。しばらく経ってから再度お試しください。');
    });

    test('メール送信失敗は見積もり作成を妨げない', async () => {
      mockApiClient.post.mockResolvedValue({ id: 'estimate_123' });
      mockStorageService.save.mockResolvedValue();
      mockNotificationService.sendEmail.mockRejectedValue(new Error('Email service unavailable'));

      const result = await estimateService.createEstimate(validEstimateData);

      // メール送信が失敗しても見積もり作成は成功
      expect(result.success).toBe(true);
      expect(result.estimateId).toBe('estimate_123');
    });

    test('メールアドレスなしの場合はメール送信をスキップ', async () => {
      const dataWithoutEmail = {
        ...validEstimateData,
        customerInfo: {
          ...validEstimateData.customerInfo,
          email: '',
        },
      };

      mockApiClient.post.mockResolvedValue({ id: 'estimate_123' });
      mockStorageService.save.mockResolvedValue();

      const result = await estimateService.createEstimate(dataWithoutEmail);

      expect(result.success).toBe(true);
      expect(mockNotificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('getEstimateHistory', () => {
    test('履歴の正常取得', async () => {
      const mockHistory = [
        { id: '1', date: '2024-01-01', total: 50000 },
        { id: '2', date: '2024-02-01', total: 75000 },
      ];
      
      mockApiClient.get.mockResolvedValue(mockHistory);

      const result = await estimateService.getEstimateHistory('test@example.com');

      expect(result).toEqual(mockHistory);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/estimates/history?email=test@example.com');
    });

    test('API呼び出し失敗時のエラー', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      await expect(estimateService.getEstimateHistory('test@example.com'))
        .rejects.toThrow('見積もり履歴の取得に失敗しました');
    });
  });
});

describe('FleetManagementService', () => {
  let fleetService: FleetManagementService;

  beforeEach(() => {
    jest.clearAllMocks();
    fleetService = new FleetManagementService(mockApiClient, mockStorageService);
  });

  describe('findOptimalTruck', () => {
    const requirements = {
      totalPoints: 100,
      distance: 50,
      timeSlot: 'normal',
      preferredDate: new Date('2024-06-15'),
    };

    const mockTrucks = [
      {
        id: 'truck1',
        name: '中型トラック',
        capacity: 150,
        costPerKm: 150,
        availability: [new Date('2024-06-15')],
      },
    ];

    test('最適トラック選択の成功', async () => {
      mockApiClient.get.mockResolvedValue(mockTrucks);
      mockStorageService.save.mockResolvedValue();

      const result = await fleetService.findOptimalTruck(requirements);

      expect(result.success).toBe(true);
      expect(result.assignment).toBeTruthy();
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trucks/available');
      expect(mockStorageService.save).toHaveBeenCalled();
    });

    test('API呼び出し失敗時のエラーハンドリング', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      const result = await fleetService.findOptimalTruck(requirements);

      expect(result.success).toBe(false);
      expect(result.message).toBe('トラック割り当ての計算に失敗しました');
    });
  });

  describe('updateTruckStatus', () => {
    test('ステータス更新の成功', async () => {
      mockApiClient.put.mockResolvedValue({});

      await fleetService.updateTruckStatus('truck1', 'busy');

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/trucks/truck1/status', { status: 'busy' });
    });

    test('API呼び出し失敗時のエラー', async () => {
      mockApiClient.put.mockRejectedValue(new Error('API error'));

      await expect(fleetService.updateTruckStatus('truck1', 'busy'))
        .rejects.toThrow('トラックステータスの更新に失敗しました');
    });
  });
});

describe('CustomerService', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService(mockApiClient, mockNotificationService);
  });

  describe('assessCustomerRisk', () => {
    const mockCustomerHistory = {
      completedOrders: 5,
      canceledOrders: 1,
      latePayments: 0,
      totalSpent: 200000,
      accountAge: 100,
    };

    test('リスク評価の正常実行', async () => {
      mockApiClient.get.mockResolvedValue(mockCustomerHistory);
      mockNotificationService.sendEmail.mockResolvedValue();

      const result = await customerService.assessCustomerRisk('customer_123');

      expect(result.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(typeof result.riskScore).toBe('number');
      expect(Array.isArray(result.factors)).toBe(true);
      expect(Array.isArray(result.recommendedActions)).toBe(true);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/customers/customer_123/history');
    });

    test('高リスク顧客の管理者通知', async () => {
      // ビジネスロジックのモックを一時的に変更
      const mockBusinessLogic = require('../business-logic').businessLogic;
      mockBusinessLogic.customerManagementLogic.assessCustomerRisk.mockReturnValueOnce({
        riskLevel: 'high',
        riskScore: 85,
        factors: ['キャンセル率高い', '支払い遅延'],
        recommendedActions: ['事前支払い要求', '厳格な条件設定']
      });
      
      const highRiskHistory = {
        completedOrders: 1,
        canceledOrders: 5,
        latePayments: 3,
        totalSpent: 10000,
        accountAge: 5,
      };
      
      mockApiClient.get.mockResolvedValue(highRiskHistory);
      mockNotificationService.sendEmail.mockResolvedValue();

      const result = await customerService.assessCustomerRisk('customer_123');

      expect(result.riskLevel).toBe('high');
      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
        'admin@example.com',
        '高リスク顧客の通知',
        expect.stringContaining('customer_123')
      );
    });

    test('低リスク顧客は管理者通知なし', async () => {
      const lowRiskHistory = {
        completedOrders: 10,
        canceledOrders: 0,
        latePayments: 0,
        totalSpent: 1000000,
        accountAge: 365,
      };
      
      mockApiClient.get.mockResolvedValue(lowRiskHistory);

      const result = await customerService.assessCustomerRisk('customer_123');

      expect(result.riskLevel).toBe('low');
      expect(mockNotificationService.sendEmail).not.toHaveBeenCalled();
    });

    test('API呼び出し失敗時のデフォルト値返却', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      const result = await customerService.assessCustomerRisk('customer_123');
      
      expect(result.riskLevel).toBe('low');
      expect(result.riskScore).toBe(0);
      expect(result.factors).toContain('評価エラー');
      expect(result.recommendedActions).toContain('システム管理者にお問い合わせください');
    });

    test('管理者通知失敗でも処理は継続', async () => {
      const highRiskHistory = {
        completedOrders: 1,
        canceledOrders: 5,
        latePayments: 3,
        totalSpent: 10000,
        accountAge: 5,
      };
      
      mockApiClient.get.mockResolvedValue(highRiskHistory);
      mockNotificationService.sendEmail.mockRejectedValue(new Error('Email service error'));

      // エラーを投げずに正常に完了することを確認
      const result = await customerService.assessCustomerRisk('customer_123');
      expect(result.riskLevel).toBe('high');
    });
  });
});

describe('Service integration tests', () => {
  test('サービス間の連携テスト', async () => {
    // 実際のサービス統合シナリオをテスト
    const estimateService = new EstimateService(
      mockApiClient,
      mockNotificationService,
      mockStorageService
    );
    
    const customerService = new CustomerService(
      mockApiClient,
      mockNotificationService
    );

    // 見積もり作成→顧客リスク評価のフロー
    mockApiClient.post.mockResolvedValue({ id: 'estimate_123' });
    mockApiClient.get.mockResolvedValue({
      completedOrders: 0,
      canceledOrders: 0,
      latePayments: 0,
      totalSpent: 0,
      accountAge: 1,
    });
    mockStorageService.save.mockResolvedValue();
    mockNotificationService.sendEmail.mockResolvedValue();

    const estimateData = {
      customerInfo: {
        lastName: '田中',
        firstName: '太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        postalCode: '123-4567',
        address: '東京都渋谷区1-1-1',
      },
      movingDetails: {
        distance: 50,
        items: [{ name: 'テーブル', count: 1, points: 10 }],
        timeSlot: 'normal',
        selectedOptions: [],
        moveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14日後
      },
    };

    const estimateResult = await estimateService.createEstimate(estimateData);
    expect(estimateResult.success).toBe(true);

    const riskResult = await customerService.assessCustomerRisk('customer_123');
    expect(riskResult.factors).toContain('新規顧客');
  });
});