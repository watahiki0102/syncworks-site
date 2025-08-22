/**
 * 統一エラーハンドリングシステム
 * - エラーの分類と処理
 * - ユーザーフレンドリーなエラーメッセージ
 * - エラーレポーティング
 * - 復旧処理の自動化
 */
import { logger } from './logger';
import { config } from './config';

/**
 * エラーの種類を定義
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * エラーの重要度を定義
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 構造化されたエラー情報
 */
export interface StructuredError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: Record<string, unknown>;
  originalError?: Error;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

/**
 * エラー復旧アクション
 */
export interface RecoveryAction {
  type: 'retry' | 'redirect' | 'refresh' | 'logout' | 'custom';
  label: string;
  action: () => void | Promise<void>;
}

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly recoveryActions?: RecoveryAction[];

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      severity?: ErrorSeverity;
      code?: string;
      details?: Record<string, unknown>;
      cause?: Error;
      recoveryActions?: RecoveryAction[];
    } = {}
  ) {
    super(message, { cause: options.cause });
    
    this.name = 'AppError';
    this.type = type;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.userMessage = userMessage;
    this.code = options.code;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.recoveryActions = options.recoveryActions;
  }

  /**
   * エラーを構造化された形式に変換
   */
  toStructured(context?: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    context?: Record<string, unknown>;
  }): StructuredError {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      details: this.details,
      originalError: this.cause as Error,
      timestamp: this.timestamp,
      stackTrace: this.stack,
      ...context,
    };
  }
}

/**
 * エラー分類器
 */
export class ErrorClassifier {
  /**
   * HTTPステータスコードからエラータイプを判定
   */
  static classifyHttpError(status: number): ErrorType {
    if (status >= 400 && status < 500) {
      switch (status) {
        case 401:
          return ErrorType.AUTHENTICATION;
        case 403:
          return ErrorType.AUTHORIZATION;
        case 404:
          return ErrorType.NOT_FOUND;
        case 422:
          return ErrorType.VALIDATION;
        default:
          return ErrorType.CLIENT_ERROR;
      }
    }
    
    if (status >= 500) {
      return ErrorType.SERVER_ERROR;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * JavaScriptエラーからエラータイプを判定
   */
  static classifyJsError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorType.CLIENT_ERROR;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * エラーの重要度を判定
   */
  static classifySeverity(type: ErrorType, context?: Record<string, unknown>): ErrorSeverity {
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      
      case ErrorType.SERVER_ERROR:
        return ErrorSeverity.CRITICAL;
      
      case ErrorType.NETWORK:
      case ErrorType.EXTERNAL_SERVICE:
        return ErrorSeverity.MEDIUM;
      
      case ErrorType.VALIDATION:
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW;
      
      default:
        return ErrorSeverity.MEDIUM;
    }
  }
}

/**
 * ユーザーフレンドリーなエラーメッセージ生成
 */
export class ErrorMessageGenerator {
  private static readonly USER_MESSAGES: Record<ErrorType, Record<string, string>> = {
    [ErrorType.NETWORK]: {
      default: 'インターネット接続を確認して、もう一度お試しください。',
      timeout: '通信がタイムアウトしました。しばらくしてからもう一度お試しください。',
      offline: 'オフライン状態です。インターネット接続を確認してください。',
    },
    [ErrorType.VALIDATION]: {
      default: '入力内容を確認して、もう一度お試しください。',
      email: '正しいメールアドレスを入力してください。',
      phone: '正しい電話番号を入力してください。',
      required: '必須項目を入力してください。',
    },
    [ErrorType.AUTHENTICATION]: {
      default: 'ログインが必要です。もう一度ログインしてください。',
      expired: 'セッションが期限切れです。もう一度ログインしてください。',
      invalid: 'ユーザー名またはパスワードが間違っています。',
    },
    [ErrorType.AUTHORIZATION]: {
      default: 'この機能を使用する権限がありません。',
      insufficient: '権限が不足しています。管理者にお問い合わせください。',
    },
    [ErrorType.NOT_FOUND]: {
      default: 'お探しのページまたはデータが見つかりません。',
      page: 'ページが見つかりません。',
      data: 'データが見つかりません。',
    },
    [ErrorType.SERVER_ERROR]: {
      default: 'サーバーでエラーが発生しました。しばらくしてからもう一度お試しください。',
      maintenance: 'システムメンテナンス中です。しばらくお待ちください。',
    },
    [ErrorType.CLIENT_ERROR]: {
      default: 'アプリケーションでエラーが発生しました。ページを再読み込みしてください。',
    },
    [ErrorType.BUSINESS_LOGIC]: {
      default: '処理を完了できませんでした。入力内容を確認してください。',
    },
    [ErrorType.EXTERNAL_SERVICE]: {
      default: '外部サービスとの通信でエラーが発生しました。しばらくしてからもう一度お試しください。',
    },
    [ErrorType.UNKNOWN]: {
      default: '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
    },
  };

  /**
   * ユーザー向けエラーメッセージを生成
   */
  static generateUserMessage(
    type: ErrorType,
    code?: string,
    details?: Record<string, unknown>
  ): string {
    const messages = this.USER_MESSAGES[type];
    
    if (code && messages[code]) {
      return messages[code];
    }
    
    return messages.default;
  }
}

/**
 * エラー復旧アクション生成
 */
export class RecoveryActionGenerator {
  /**
   * エラータイプに応じた復旧アクションを生成
   */
  static generateActions(
    type: ErrorType,
    context?: Record<string, unknown>
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    
    switch (type) {
      case ErrorType.NETWORK:
        actions.push({
          type: 'retry',
          label: 'もう一度試す',
          action: () => window.location.reload(),
        });
        break;
        
      case ErrorType.AUTHENTICATION:
        actions.push({
          type: 'redirect',
          label: 'ログイン画面へ',
          action: () => {
            window.location.href = '/login';
          },
        });
        break;
        
      case ErrorType.AUTHORIZATION:
        actions.push({
          type: 'redirect',
          label: 'ホームに戻る',
          action: () => {
            window.location.href = '/';
          },
        });
        break;
        
      case ErrorType.NOT_FOUND:
        actions.push({
          type: 'redirect',
          label: '前のページに戻る',
          action: () => window.history.back(),
        });
        actions.push({
          type: 'redirect',
          label: 'ホームに戻る',
          action: () => {
            window.location.href = '/';
          },
        });
        break;
        
      case ErrorType.SERVER_ERROR:
      case ErrorType.EXTERNAL_SERVICE:
        actions.push({
          type: 'retry',
          label: 'もう一度試す',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            window.location.reload();
          },
        });
        break;
        
      case ErrorType.CLIENT_ERROR:
        actions.push({
          type: 'refresh',
          label: 'ページを再読み込み',
          action: () => window.location.reload(),
        });
        break;
        
      default:
        actions.push({
          type: 'refresh',
          label: 'ページを再読み込み',
          action: () => window.location.reload(),
        });
        break;
    }
    
    return actions;
  }
}

/**
 * エラーレポーティング
 */
export class ErrorReporter {
  private static shouldReport(error: StructuredError): boolean {
    // 本番環境でのみレポート
    if (!config.env.isProduction) {
      return false;
    }
    
    // 重要度の低いエラーはレポートしない
    if (error.severity === ErrorSeverity.LOW) {
      return false;
    }
    
    return true;
  }

  /**
   * エラーを外部サービスにレポート
   */
  static async reportError(error: StructuredError): Promise<void> {
    if (!this.shouldReport(error)) {
      return;
    }

    try {
      // 実際の実装では外部エラートラッキングサービス（Sentry等）に送信
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          environment: config.env.NODE_ENV,
          version: config.app.version,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
    } catch (reportingError) {
      // レポート送信の失敗は無視（無限ループを防ぐ）
      logger.error('Failed to report error', reportingError as Error);
    }
  }
}

/**
 * 統合エラーハンドラー
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: StructuredError[] = [];
  private isProcessing = false;

  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * グローバルエラーハンドラーの設定
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // 未キャッチエラーのハンドリング
    window.addEventListener('error', (event) => {
      const error = this.createAppError(
        ErrorClassifier.classifyJsError(event.error),
        event.error?.message || 'Unknown error',
        'アプリケーションでエラーが発生しました。',
        {
          details: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
          cause: event.error,
        }
      );
      
      this.handleError(error);
    });

    // 未キャッチPromiseリジェクションのハンドリング
    window.addEventListener('unhandledrejection', (event) => {
      const error = this.createAppError(
        ErrorType.CLIENT_ERROR,
        event.reason?.message || 'Unhandled promise rejection',
        '処理中にエラーが発生しました。',
        {
          cause: event.reason,
        }
      );
      
      this.handleError(error);
    });
  }

  /**
   * AppErrorを作成するヘルパー
   */
  createAppError(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      severity?: ErrorSeverity;
      code?: string;
      details?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ): AppError {
    const severity = options.severity || ErrorClassifier.classifySeverity(type);
    const recoveryActions = RecoveryActionGenerator.generateActions(type);
    
    return new AppError(type, message, userMessage, {
      ...options,
      severity,
      recoveryActions,
    });
  }

  /**
   * エラーを統一的に処理
   */
  async handleError(
    error: AppError | Error,
    context?: {
      userId?: string;
      component?: string;
      action?: string;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    let appError: AppError;
    
    if (error instanceof AppError) {
      appError = error;
    } else {
      // 通常のErrorをAppErrorに変換
      const type = ErrorClassifier.classifyJsError(error);
      const userMessage = ErrorMessageGenerator.generateUserMessage(type);
      appError = this.createAppError(type, error.message, userMessage, {
        cause: error,
      });
    }

    const structuredError = appError.toStructured(context);

    // ログに記録
    logger.error(structuredError.message, structuredError.originalError as Error, {
      type: structuredError.type,
      severity: structuredError.severity,
      code: structuredError.code,
      details: structuredError.details,
    }, context);

    // エラーをキューに追加
    this.errorQueue.push(structuredError);
    
    // レポート処理
    await ErrorReporter.reportError(structuredError);
    
    // バッチ処理を開始
    if (!this.isProcessing) {
      this.processErrorQueue();
    }
  }

  /**
   * エラーキューの処理
   */
  private async processErrorQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift()!;
      
      try {
        await this.processError(error);
      } catch (processingError) {
        logger.error('Error processing failed', processingError as Error);
      }
      
      // 処理間隔を設ける
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * 個別エラーの処理
   */
  private async processError(error: StructuredError): Promise<void> {
    // 重大なエラーの場合は即座にユーザーに通知
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.notifyUser(error);
    }
  }

  /**
   * ユーザーへの通知
   */
  private notifyUser(error: StructuredError): void {
    // 実際の実装では適切な通知システム（トースト、モーダル等）を使用
    if (typeof window !== 'undefined') {
      console.error('Critical error:', error.userMessage);
      
      // 開発環境では詳細をアラート表示
      if (config.env.isDevelopment) {
        alert(`Critical Error: ${error.userMessage}\n\nDetails: ${error.message}`);
      }
    }
  }

  /**
   * エラー統計の取得
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      totalErrors: this.errorQueue.length,
      errorsByType: {} as Record<ErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
    };

    this.errorQueue.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// デフォルトのエラーハンドラーインスタンス
export const errorHandler = ErrorHandler.getInstance();

// 便利な関数をエクスポート
export const handleError = (
  error: AppError | Error,
  context?: {
    userId?: string;
    component?: string;
    action?: string;
    context?: Record<string, unknown>;
  }
) => errorHandler.handleError(error, context);

export const createError = (
  type: ErrorType,
  message: string,
  userMessage: string,
  options?: {
    severity?: ErrorSeverity;
    code?: string;
    details?: Record<string, unknown>;
    cause?: Error;
  }
) => errorHandler.createAppError(type, message, userMessage, options);

export default errorHandler;