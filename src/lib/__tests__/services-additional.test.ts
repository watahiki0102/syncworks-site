/**
 * 追加のservices.tsのテスト
 * カバレッジ目標: 100%
 */

import { 
  EstimateService,
  ApiClient,
  NotificationService,
  StorageService
} from '../services';
import * as businessLogic from '../business-logic';

// business-logicのモック
jest.mock('../business-logic', () => ({
  customerManagementLogic: {
    validateCustomerData: jest.fn()
  },
  movingEstimateLogic: {
    calculateEstimate: jest.fn()
  }
}));

// loggerのモック
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// モックサービス
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

describe('Services Module', () => {
  let estimateService: EstimateService;

  beforeEach(() => {
    jest.clearAllMocks();
    estimateService = new EstimateService(
      mockApiClient,
      mockNotificationService,
      mockStorageService
    );
  });

  describe('EstimateService', () => {
    const mockEstimateData = {
      customerInfo: {
        lastName: 'テスト',
        firstName: '太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        postalCode: '150-0002',
        address: '東京都渋谷区渋谷1-1-1'
      },
      movingDetails: {
        distance: 10,
        items: [
          { name: '冷蔵庫', count: 1, points: 100 },
          { name: 'テーブル', count: 1, points: 50 }
        ],
        timeSlot: '午前',
        selectedOptions: ['梱包サービス'],
        moveDate: new Date('2024-01-15')
      }
    };

    describe('createEstimate', () => {
      it('有効なデータで見積もりを作成できる', async () => {
        // モックの設定
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000,
          breakdown: { basic: 100000, options: 50000 }
        });

        const savedEstimate = { id: 'estimate_123' };
        mockApiClient.post.mockResolvedValueOnce(savedEstimate);
        mockStorageService.save.mockResolvedValueOnce();
        mockNotificationService.sendEmail.mockResolvedValueOnce();

        const result = await estimateService.createEstimate(mockEstimateData);

        // 検証
        expect(businessLogic.customerManagementLogic.validateCustomerData).toHaveBeenCalledWith(
          mockEstimateData.customerInfo
        );
        expect(businessLogic.movingEstimateLogic.calculateEstimate).toHaveBeenCalledWith({
          ...mockEstimateData.movingDetails,
          taxRate: 0.1
        });
        expect(mockApiClient.post).toHaveBeenCalledWith('/api/estimates', expect.objectContaining({
          customerInfo: mockEstimateData.customerInfo,
          movingDetails: mockEstimateData.movingDetails,
          estimate: expect.any(Object),
          createdAt: expect.any(String)
        }));
        expect(mockStorageService.save).toHaveBeenCalledWith('estimate_estimate_123', expect.any(Object));
        expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.any(String),
          expect.any(String)
        );

        expect(result).toEqual({
          success: true,
          estimateId: 'estimate_123',
          estimate: expect.any(Object)
        });
      });

      it('無効な顧客データの場合はエラーを返す', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: false,
          errors: ['メールアドレスが無効です', '電話番号が無効です']
        });

        const result = await estimateService.createEstimate(mockEstimateData);

        expect(result).toEqual({
          success: false,
          errors: ['メールアドレスが無効です', '電話番号が無効です']
        });
        expect(mockApiClient.post).not.toHaveBeenCalled();
      });

      it('API保存エラーの場合は例外をスローする', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce(null); // 保存失敗

        await expect(estimateService.createEstimate(mockEstimateData)).rejects.toThrow(
          '見積もりの保存に失敗しました'
        );
      });

      it('APIが無効なレスポンスの場合は例外をスローする', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: undefined }); // 無効なID

        await expect(estimateService.createEstimate(mockEstimateData)).rejects.toThrow(
          '見積もりの保存に失敗しました'
        );
      });

      it('ストレージ保存エラーの場合は例外を伝播する', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: 'estimate_123' });
        mockStorageService.save.mockRejectedValueOnce(new Error('ストレージエラー'));

        await expect(estimateService.createEstimate(mockEstimateData)).rejects.toThrow('ストレージエラー');
      });

      it('通知送信エラーの場合は例外を伝播する', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: 'estimate_123' });
        mockStorageService.save.mockResolvedValueOnce();
        mockNotificationService.sendEmail.mockRejectedValueOnce(new Error('通知エラー'));

        await expect(estimateService.createEstimate(mockEstimateData)).rejects.toThrow('通知エラー');
      });

      it('正規化されたデータが使用される', async () => {
        const normalizedData = {
          ...mockEstimateData.customerInfo,
          phone: '09012345678' // 正規化された電話番号
        };

        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: 'estimate_123' });
        mockStorageService.save.mockResolvedValueOnce();
        mockNotificationService.sendEmail.mockResolvedValueOnce();

        await estimateService.createEstimate(mockEstimateData);

        expect(mockApiClient.post).toHaveBeenCalledWith('/api/estimates', expect.objectContaining({
          customerInfo: normalizedData
        }));
      });

      it('税率が正しく計算に使用される', async () => {
        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: 'estimate_123' });
        mockStorageService.save.mockResolvedValueOnce();
        mockNotificationService.sendEmail.mockResolvedValueOnce();

        await estimateService.createEstimate(mockEstimateData);

        expect(businessLogic.movingEstimateLogic.calculateEstimate).toHaveBeenCalledWith({
          ...mockEstimateData.movingDetails,
          taxRate: 0.1
        });
      });

      it('作成日時が正しく設定される', async () => {
        const mockDate = new Date('2024-01-01T10:00:00.000Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

        (businessLogic.customerManagementLogic.validateCustomerData as jest.Mock).mockReturnValue({
          isValid: true,
          normalizedData: mockEstimateData.customerInfo
        });

        (businessLogic.movingEstimateLogic.calculateEstimate as jest.Mock).mockReturnValue({
          totalAmount: 150000
        });

        mockApiClient.post.mockResolvedValueOnce({ id: 'estimate_123' });
        mockStorageService.save.mockResolvedValueOnce();
        mockNotificationService.sendEmail.mockResolvedValueOnce();

        await estimateService.createEstimate(mockEstimateData);

        expect(mockApiClient.post).toHaveBeenCalledWith('/api/estimates', expect.objectContaining({
          createdAt: mockDate.toISOString()
        }));

        jest.restoreAllMocks();
      });
    });
  });

  describe('インターフェース', () => {
    it('ApiClientインターフェースが正しく定義される', () => {
      expect(typeof mockApiClient.get).toBe('function');
      expect(typeof mockApiClient.post).toBe('function');
      expect(typeof mockApiClient.put).toBe('function');
      expect(typeof mockApiClient.delete).toBe('function');
    });

    it('NotificationServiceインターフェースが正しく定義される', () => {
      expect(typeof mockNotificationService.sendEmail).toBe('function');
      expect(typeof mockNotificationService.sendSMS).toBe('function');
    });

    it('StorageServiceインターフェースが正しく定義される', () => {
      expect(typeof mockStorageService.save).toBe('function');
      expect(typeof mockStorageService.load).toBe('function');
      expect(typeof mockStorageService.delete).toBe('function');
    });
  });

  describe('依存性注入', () => {
    it('異なる依存性で新しいサービスインスタンスを作成できる', () => {
      const altApiClient: ApiClient = {
        get: async () => ({}),
        post: async () => ({}),
        put: async () => ({}),
        delete: async () => {}
      };

      const altEstimateService = new EstimateService(
        altApiClient,
        mockNotificationService,
        mockStorageService
      );

      expect(altEstimateService).toBeInstanceOf(EstimateService);
      expect(altEstimateService).not.toBe(estimateService);
    });
  });
});