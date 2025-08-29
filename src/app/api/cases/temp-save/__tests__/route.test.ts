/**
 * /api/cases/temp-save/route.ts のテスト
 * カバレッジ目標: 100%
 */

// Next.js関連のモック
const mockJson = jest.fn();
const mockNextResponse = {
  json: mockJson.mockImplementation((data, options) => ({
    json: () => Promise.resolve(data),
    status: options?.status || 200
  }))
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}));

// Date.nowをモック
const mockDateNow = jest.fn();
Date.now = mockDateNow;

// console.errorをモック
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

describe('/api/cases/temp-save', () => {
  let POST: any;

  beforeAll(async () => {
    // POST関数を動的にインポート
    const module = await import('../route');
    POST = module.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1234567890000);
    mockJson.mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }));
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('POST', () => {
    it('正常なリクエストで一時保存が成功する', async () => {
      const requestBody = {
        customerName: '田中太郎',
        customerEmail: 'tanaka@example.com',
        moveDate: '2024-03-15'
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(requestBody)
      };

      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith({
        id: 'temp_1234567890000',
        message: '一時保存が完了しました',
        data: requestBody
      });

      expect(response.status).toBe(200);
    });

    it('空のリクエストボディでも正常に処理される', async () => {
      const requestBody = {};
      const mockRequest = {
        json: jest.fn().mockResolvedValue(requestBody)
      };
      
      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith({
        id: 'temp_1234567890000',
        message: '一時保存が完了しました',
        data: requestBody
      });
      
      expect(response.status).toBe(200);
    });

    it('一意のIDが生成される', async () => {
      const requestBody = { test: 'data' };
      const mockRequest = {
        json: jest.fn().mockResolvedValue(requestBody)
      };

      // 異なる時間を設定
      mockDateNow
        .mockReturnValueOnce(1000000000000)
        .mockReturnValueOnce(2000000000000);

      await POST(mockRequest);
      await POST(mockRequest);

      expect(mockJson).toHaveBeenNthCalledWith(1, expect.objectContaining({
        id: 'temp_1000000000000'
      }));
      expect(mockJson).toHaveBeenNthCalledWith(2, expect.objectContaining({
        id: 'temp_2000000000000'
      }));
    });

    it('JSONパースエラー時に500エラーが返される', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: '一時保存に失敗しました' },
        { status: 500 }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '一時保存エラー:',
        expect.any(Error)
      );

      expect(response.status).toBe(500);
    });

    it('複雑なオブジェクトデータも正常に処理される', async () => {
      const requestBody = {
        customer: {
          name: '田中太郎',
          email: 'tanaka@example.com'
        },
        items: ['テーブル', '椅子', '本棚'],
        notes: '特別な要望はありません'
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(requestBody)
      };

      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith({
        id: 'temp_1234567890000',
        message: '一時保存が完了しました',
        data: requestBody
      });

      expect(response.status).toBe(200);
    });

    it('非同期エラー時に500エラーが返される', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Async error'))
      };

      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: '一時保存に失敗しました' },
        { status: 500 }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '一時保存エラー:',
        expect.any(Error)
      );
    });

    it('nullデータも処理される', async () => {
      const requestBody = null;
      const mockRequest = {
        json: jest.fn().mockResolvedValue(requestBody)
      };
      
      const response = await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith({
        id: 'temp_1234567890000',
        message: '一時保存が完了しました',
        data: null
      });

      expect(response.status).toBe(200);
    });

    it('プリミティブなデータタイプも処理される', async () => {
      const testCases = [
        { input: 12345, description: '数値' },
        { input: "文字列データ", description: '文字列' },
        { input: true, description: 'ブール値' }
      ];

      for (const testCase of testCases) {
        const mockRequest = {
          json: jest.fn().mockResolvedValue(testCase.input)
        };
        
        const response = await POST(mockRequest);

        expect(mockJson).toHaveBeenCalledWith({
          id: 'temp_1234567890000',
          message: '一時保存が完了しました',
          data: testCase.input
        });

        expect(response.status).toBe(200);
      }
    });
  });

  describe('レスポンス形式', () => {
    it('成功レスポンスが正しい形式で返される', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ test: 'data' })
      };

      await POST(mockRequest);

      const expectedResponse = {
        id: expect.stringMatching(/^temp_\d+$/),
        message: '一時保存が完了しました',
        data: { test: 'data' }
      };

      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });

    it('エラーレスポンスが正しい形式で返される', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Test error'))
      };

      await POST(mockRequest);

      expect(mockJson).toHaveBeenCalledWith(
        { error: '一時保存に失敗しました' },
        { status: 500 }
      );
    });
  });
});