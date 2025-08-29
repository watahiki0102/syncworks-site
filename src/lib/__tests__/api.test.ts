/**
 * api.ts のテスト
 * カバレッジ目標: 100%
 */

import { ApiError, api, apiClient } from '../api';

// fetchをモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// configをモック
jest.mock('../config', () => ({
  config: {
    urls: {
      api: 'https://api.example.com'
    }
  }
}));

describe('ApiError', () => {
  it('正しく初期化される', () => {
    const error = new ApiError('Test error', 404, 'NOT_FOUND', { test: 'data' });
    
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.data).toEqual({ test: 'data' });
    expect(error.name).toBe('ApiError');
    expect(error instanceof Error).toBe(true);
  });

  it('オプショナルパラメータなしで初期化される', () => {
    const error = new ApiError('Simple error', 500);
    
    expect(error.message).toBe('Simple error');
    expect(error.status).toBe(500);
    expect(error.errorCode).toBeUndefined();
    expect(error.data).toBeUndefined();
  });
});

describe('ApiClient基本機能', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('GETリクエストが正しく実行される', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ result: 'success' }));

    const result = await apiClient.get('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result).toEqual({ result: 'success' });
  });

  it('POSTリクエストが正しく実行される', async () => {
    const postData = { name: 'test', value: 123 };
    mockFetch.mockResolvedValueOnce(createMockResponse({ created: true }));

    const result = await apiClient.post('/test', postData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData)
      })
    );
    expect(result).toEqual({ created: true });
  });

  it('クエリパラメータ付きGETリクエストが正しく実行される', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

    await apiClient.get('/test', { param1: 'value1', param2: 123, param3: true });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test?param1=value1&param2=123&param3=true',
      expect.any(Object)
    );
  });

  it('認証トークンが正しく設定される', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));
    
    apiClient.setAuthToken('test-token-123');
    await apiClient.get('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123'
        })
      })
    );
  });

  it('認証トークンが正しく削除される', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));
    
    apiClient.setAuthToken('test-token-123');
    apiClient.removeAuthToken();
    await apiClient.get('/test');

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });
});

describe('レスポンス処理', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('JSON レスポンスが正しく処理される', async () => {
    const responseData = { message: 'success', data: { id: 1 } };
    mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

    const result = await apiClient.get('/test');
    expect(result).toEqual(responseData);
  });

  it('APIレスポンス形式のJSONが正しく処理される', async () => {
    const responseData = {
      data: { id: 1, name: 'test' },
      success: true,
      message: 'OK'
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

    const result = await apiClient.get('/test');
    expect(result).toEqual({ id: 1, name: 'test' }); // data部分のみ返される
  });

  it('HTTPエラーレスポンスでApiErrorが発生する', async () => {
    const errorResponse = {
      message: 'Not Found',
      errorCode: 'RESOURCE_NOT_FOUND'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      },
      json: jest.fn().mockResolvedValue(errorResponse)
    });

    await expect(apiClient.get('/test')).rejects.toThrow(
      expect.objectContaining({
        message: 'Not Found',
        status: 404,
        errorCode: 'RESOURCE_NOT_FOUND'
      })
    );
  });

  it('無効なJSONレスポンスでエラーが発生する', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      },
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    });

    await expect(apiClient.get('/test')).rejects.toThrow(
      expect.objectContaining({
        message: 'Invalid response format',
        status: 200
      })
    );
  });
});

describe('HTTPメソッド', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('PUTリクエストが正しく実行される', async () => {
    const putData = { id: 1, name: 'updated' };
    mockFetch.mockResolvedValueOnce(createMockResponse({ updated: true }));

    await apiClient.put('/test/1', putData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(putData)
      })
    );
  });

  it('PATCHリクエストが正しく実行される', async () => {
    const patchData = { name: 'patched' };
    mockFetch.mockResolvedValueOnce(createMockResponse({ patched: true }));

    await apiClient.patch('/test/1', patchData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(patchData)
      })
    );
  });

  it('DELETEリクエストが正しく実行される', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ deleted: true }));

    await apiClient.delete('/test/1');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test/1',
      expect.objectContaining({
        method: 'DELETE',
        body: undefined
      })
    );
  });
});

describe('ファイルアップロード', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('ファイルアップロード機能が利用可能である', () => {
    expect(typeof apiClient.uploadFile).toBe('function');
  });

  it('ファイルアップロードメソッドが呼び出される', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    mockFetch.mockResolvedValueOnce(createMockResponse({ uploaded: true }));

    const result = await apiClient.uploadFile('/upload', mockFile);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/upload',
      expect.objectContaining({
        method: 'POST'
      })
    );
    expect(result).toEqual({ uploaded: true });
  });
});

describe('デフォルトapi関数', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('api.getが正しく動作する', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

    const result = await api.get('/test');
    expect(result).toEqual({ data: 'test' });
  });

  it('api.postが正しく動作する', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ created: true }));

    const result = await api.post('/test', { name: 'test' });
    expect(result).toEqual({ created: true });
  });

  it('api.putが正しく動作する', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ updated: true }));

    const result = await api.put('/test', { name: 'updated' });
    expect(result).toEqual({ updated: true });
  });

  it('api.patchが正しく動作する', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ patched: true }));

    const result = await api.patch('/test', { name: 'patched' });
    expect(result).toEqual({ patched: true });
  });

  it('api.deleteが正しく動作する', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ deleted: true }));

    const result = await api.delete('/test');
    expect(result).toEqual({ deleted: true });
  });

  it('api.uploadFileが正しく動作する', async () => {
    const mockFile = new File(['test'], 'test.txt');
    mockFetch.mockResolvedValueOnce(createMockResponse({ uploaded: true }));

    const result = await api.uploadFile('/upload', mockFile);
    expect(result).toEqual({ uploaded: true });
  });
});

describe('エクスポート', () => {
  it('apiClientインスタンスが正しくエクスポートされる', () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.setAuthToken).toBe('function');
  });
});

// テストヘルパー関数
function createMockResponse(data: any, status: number = 200, contentType: string = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      get: jest.fn().mockReturnValue(contentType)
    },
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
  };
}