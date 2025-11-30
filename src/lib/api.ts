/**
 * 型安全なAPIクライアント
 * - 統一されたエラーハンドリング
 * - レスポンスの型安全性
 * - リクエストインターセプター
 * - レスポンスインターセプター
 */
import { config } from './config';

// APIレスポンスの基本型
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errorCode?: string;
}

// ページネーション情報
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ページネーション付きレスポンス
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// APIエラーの型
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// リクエストオプション
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// HTTPメソッド
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * APIクライアントクラス
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseURL: string = config.urls.api) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultTimeout = 30000; // 30秒
  }

  /**
   * デフォルトヘッダーを設定
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * 認証トークンを設定
   */
  setAuthToken(token: string): void {
    this.setDefaultHeader('Authorization', `Bearer ${token}`);
  }

  /**
   * 認証トークンを削除
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * URLを構築
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * リクエストを実行
   */
  private async executeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      headers = {},
      timeout = this.defaultTimeout,
      retries = 3,
      retryDelay = 1000
    } = options;

    const url = this.buildURL(endpoint);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // AbortControllerでタイムアウトを実装
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const executeWithRetry = async (attempt: number): Promise<T> => {
      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // レスポンスの処理
        const responseData = await this.handleResponse<T>(response);
        return responseData;

      } catch (error) {
        clearTimeout(timeoutId);

        // リトライ可能なエラーかチェック
        const isRetryable = this.isRetryableError(error);
        
        if (isRetryable && attempt < retries) {
          // 指数バックオフでリトライ
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry(attempt + 1);
        }

        throw error;
      }
    };

    return executeWithRetry(1);
  }

  /**
   * レスポンスを処理
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let responseData: any;
    try {
      responseData = isJson ? await response.json() : await response.text();
    } catch {
      throw new ApiError('Invalid response format', response.status);
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorCode = responseData?.errorCode;
      throw new ApiError(errorMessage, response.status, errorCode, responseData);
    }

    // API レスポンスの形式に応じて適切にデータを返す
    if (isJson && responseData && typeof responseData === 'object') {
      // 標準的なAPIレスポンス形式の場合
      if ('data' in responseData && 'success' in responseData) {
        return responseData.data;
      }
      // そのまま返す
      return responseData;
    }

    return responseData;
  }

  /**
   * リトライ可能なエラーかどうかを判定
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // 5xx系エラーや一時的なエラーの場合はリトライ
      return error.status >= 500 || error.status === 408 || error.status === 429;
    }
    
    if (error instanceof Error) {
      // ネットワークエラーの場合はリトライ
      return error.name === 'TypeError' || error.message.includes('fetch');
    }

    return false;
  }

  /**
   * GETリクエスト
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, options?: RequestOptions): Promise<T> {
    const url = params ? this.buildURL(endpoint, params) : endpoint;
    return this.executeRequest<T>('GET', url, undefined, options);
  }

  /**
   * POSTリクエスト
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('POST', endpoint, data, options);
  }

  /**
   * PUTリクエスト
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('PUT', endpoint, data, options);
  }

  /**
   * PATCHリクエスト
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('PATCH', endpoint, data, options);
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * ファイルアップロード
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>, options?: RequestOptions): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const uploadOptions = {
      ...options,
      headers: {
        ...options?.headers,
        // Content-Typeを削除してブラウザに自動設定させる
      }
    };
    delete uploadOptions.headers?.['Content-Type'];

    return this.executeRequest<T>('POST', endpoint, formData, uploadOptions);
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();

// 便利な関数をエクスポート
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>, options?: RequestOptions) =>
    apiClient.get<T>(endpoint, params, options),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.post<T>(endpoint, data, options),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.put<T>(endpoint, data, options),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.patch<T>(endpoint, data, options),
  
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.delete<T>(endpoint, options),
  
  uploadFile: <T>(endpoint: string, file: File, additionalData?: Record<string, string>, options?: RequestOptions) =>
    apiClient.uploadFile<T>(endpoint, file, additionalData, options),
};

export default apiClient;