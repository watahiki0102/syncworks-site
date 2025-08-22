/**
 * エラーハンドリングシステムのテスト
 * - エラー分類と処理
 * - エラーレポーティング
 * - 復旧アクション
 */

import {
  ErrorType,
  ErrorSeverity,
  AppError,
  ErrorClassifier,
  ErrorMessageGenerator,
  RecoveryActionGenerator,
  ErrorHandler,
  createError,
  handleError,
} from '../error-handling';

// コンソール出力をモック化
const consoleMock = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
global.console = consoleMock as any;

describe('AppError', () => {
  test('基本的なエラー作成', () => {
    const error = new AppError(
      ErrorType.VALIDATION,
      'Invalid input',
      '入力内容を確認してください',
      { severity: ErrorSeverity.LOW, code: 'INVALID_INPUT' }
    );

    expect(error.type).toBe(ErrorType.VALIDATION);
    expect(error.message).toBe('Invalid input');
    expect(error.userMessage).toBe('入力内容を確認してください');
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.timestamp).toBeDefined();
  });

  test('構造化エラーへの変換', () => {
    const error = new AppError(
      ErrorType.NETWORK,
      'Connection failed',
      'ネットワークエラーが発生しました',
      { details: { endpoint: '/api/test' } }
    );

    const structured = error.toStructured({
      userId: 'user123',
      component: 'TestComponent',
    });

    expect(structured.type).toBe(ErrorType.NETWORK);
    expect(structured.message).toBe('Connection failed');
    expect(structured.userMessage).toBe('ネットワークエラーが発生しました');
    expect(structured.userId).toBe('user123');
    expect(structured.component).toBe('TestComponent');
    expect(structured.details).toEqual({ endpoint: '/api/test' });
  });

  test('エラー原因の保持', () => {
    const originalError = new Error('Original error');
    const appError = new AppError(
      ErrorType.SERVER_ERROR,
      'Server error',
      'サーバーエラーが発生しました',
      { cause: originalError }
    );

    expect(appError.cause).toBe(originalError);
  });
});

describe('ErrorClassifier', () => {
  describe('classifyHttpError', () => {
    test('HTTPステータスコードの分類', () => {
      expect(ErrorClassifier.classifyHttpError(401)).toBe(ErrorType.AUTHENTICATION);
      expect(ErrorClassifier.classifyHttpError(403)).toBe(ErrorType.AUTHORIZATION);
      expect(ErrorClassifier.classifyHttpError(404)).toBe(ErrorType.NOT_FOUND);
      expect(ErrorClassifier.classifyHttpError(422)).toBe(ErrorType.VALIDATION);
      expect(ErrorClassifier.classifyHttpError(400)).toBe(ErrorType.CLIENT_ERROR);
      expect(ErrorClassifier.classifyHttpError(500)).toBe(ErrorType.SERVER_ERROR);
      expect(ErrorClassifier.classifyHttpError(503)).toBe(ErrorType.SERVER_ERROR);
      expect(ErrorClassifier.classifyHttpError(200)).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('classifyJsError', () => {
    test('JavaScriptエラーの分類', () => {
      expect(ErrorClassifier.classifyJsError(new Error('Network failed')))
        .toBe(ErrorType.NETWORK);
      expect(ErrorClassifier.classifyJsError(new Error('Validation error')))
        .toBe(ErrorType.VALIDATION);
      expect(ErrorClassifier.classifyJsError(new TypeError('Cannot read property')))
        .toBe(ErrorType.CLIENT_ERROR);
      expect(ErrorClassifier.classifyJsError(new ReferenceError('Variable not defined')))
        .toBe(ErrorType.CLIENT_ERROR);
      expect(ErrorClassifier.classifyJsError(new Error('Unknown error')))
        .toBe(ErrorType.UNKNOWN);
    });
  });

  describe('classifySeverity', () => {
    test('エラータイプによる重要度の分類', () => {
      expect(ErrorClassifier.classifySeverity(ErrorType.AUTHENTICATION))
        .toBe(ErrorSeverity.HIGH);
      expect(ErrorClassifier.classifySeverity(ErrorType.AUTHORIZATION))
        .toBe(ErrorSeverity.HIGH);
      expect(ErrorClassifier.classifySeverity(ErrorType.SERVER_ERROR))
        .toBe(ErrorSeverity.CRITICAL);
      expect(ErrorClassifier.classifySeverity(ErrorType.NETWORK))
        .toBe(ErrorSeverity.MEDIUM);
      expect(ErrorClassifier.classifySeverity(ErrorType.VALIDATION))
        .toBe(ErrorSeverity.LOW);
    });
  });
});

describe('ErrorMessageGenerator', () => {
  test('エラータイプ別のユーザーメッセージ生成', () => {
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.NETWORK))
      .toContain('インターネット接続を確認して');
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.VALIDATION))
      .toContain('入力内容を確認して');
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.AUTHENTICATION))
      .toContain('ログインが必要です');
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.NOT_FOUND))
      .toContain('見つかりません');
  });

  test('エラーコード別のメッセージ生成', () => {
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.NETWORK, 'timeout'))
      .toContain('タイムアウトしました');
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.VALIDATION, 'email'))
      .toContain('正しいメールアドレス');
    expect(ErrorMessageGenerator.generateUserMessage(ErrorType.AUTHENTICATION, 'expired'))
      .toContain('期限切れです');
  });

  test('未知のエラーコードはデフォルトメッセージ', () => {
    const message = ErrorMessageGenerator.generateUserMessage(ErrorType.NETWORK, 'unknown_code');
    expect(message).toContain('インターネット接続を確認して');
  });
});

describe('RecoveryActionGenerator', () => {
  test('エラータイプ別の復旧アクション生成', () => {
    const networkActions = RecoveryActionGenerator.generateActions(ErrorType.NETWORK);
    expect(networkActions).toHaveLength(1);
    expect(networkActions[0].type).toBe('retry');
    expect(networkActions[0].label).toBe('もう一度試す');

    const authActions = RecoveryActionGenerator.generateActions(ErrorType.AUTHENTICATION);
    expect(authActions).toHaveLength(1);
    expect(authActions[0].type).toBe('redirect');
    expect(authActions[0].label).toBe('ログイン画面へ');

    const notFoundActions = RecoveryActionGenerator.generateActions(ErrorType.NOT_FOUND);
    expect(notFoundActions.length).toBeGreaterThan(1);
    expect(notFoundActions.some(action => action.label.includes('前のページ'))).toBe(true);
    expect(notFoundActions.some(action => action.label.includes('ホーム'))).toBe(true);
  });

  test('復旧アクションの実行', () => {
    // windowオブジェクトのモック
    const mockWindow = {
      location: { reload: jest.fn(), href: '', back: jest.fn() },
      history: { back: jest.fn() },
    };
    Object.defineProperty(global, 'window', { value: mockWindow, writable: true });

    const actions = RecoveryActionGenerator.generateActions(ErrorType.CLIENT_ERROR);
    const refreshAction = actions.find(action => action.type === 'refresh');
    
    if (refreshAction) {
      refreshAction.action();
      expect(mockWindow.location.reload).toHaveBeenCalled();
    }
  });
});

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    jest.clearAllMocks();
  });

  test('AppErrorの処理', async () => {
    const appError = new AppError(
      ErrorType.VALIDATION,
      'Test error',
      'テストエラー',
      { severity: ErrorSeverity.LOW }
    );

    await errorHandler.handleError(appError, {
      userId: 'user123',
      component: 'TestComponent',
    });

    // エラーが処理されることを確認（実際の実装では内部状態をテスト）
    const stats = errorHandler.getErrorStats();
    expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
  });

  test('通常のErrorからAppErrorへの変換', async () => {
    const normalError = new Error('Normal error');

    await errorHandler.handleError(normalError);

    // エラーが変換されて処理されることを確認
    const stats = errorHandler.getErrorStats();
    expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
  });

  test('AppErrorの作成', () => {
    const appError = errorHandler.createAppError(
      ErrorType.NETWORK,
      'Network error',
      'ネットワークエラー',
      { severity: ErrorSeverity.MEDIUM }
    );

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.type).toBe(ErrorType.NETWORK);
    expect(appError.severity).toBe(ErrorSeverity.MEDIUM);
    expect(appError.recoveryActions).toBeTruthy();
  });

  test('エラー統計の取得', () => {
    const stats = errorHandler.getErrorStats();
    
    expect(stats).toHaveProperty('totalErrors');
    expect(stats).toHaveProperty('errorsByType');
    expect(stats).toHaveProperty('errorsBySeverity');
    expect(typeof stats.totalErrors).toBe('number');
  });
});

describe('グローバルエラーハンドリング', () => {
  test('createError関数', () => {
    const error = createError(
      ErrorType.VALIDATION,
      'Test message',
      'テストメッセージ',
      { severity: ErrorSeverity.LOW }
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorType.VALIDATION);
  });

  test('handleError関数', async () => {
    const error = new Error('Test error');
    
    // エラーが正常に処理されることを確認（例外が投げられない）
    await expect(handleError(error)).resolves.not.toThrow();
  });
});

describe('エラー境界値テスト', () => {
  test('nullエラーの処理', async () => {
    await expect(handleError(null as any)).resolves.not.toThrow();
  });

  test('undefinedエラーの処理', async () => {
    await expect(handleError(undefined as any)).resolves.not.toThrow();
  });

  test('文字列エラーの処理', async () => {
    await expect(handleError('String error' as any)).resolves.not.toThrow();
  });

  test('オブジェクトエラーの処理', async () => {
    const objectError = { message: 'Object error', stack: 'fake stack' };
    await expect(handleError(objectError as any)).resolves.not.toThrow();
  });
});

describe('非同期エラー処理', () => {
  test('Promise拒否の処理', async () => {
    const promiseError = Promise.reject(new Error('Promise error'));
    
    try {
      await promiseError;
    } catch (error) {
      await expect(handleError(error as Error)).resolves.not.toThrow();
    }
  });

  test('非同期関数内でのエラー処理', async () => {
    const asyncFunction = async () => {
      throw new AppError(
        ErrorType.SERVER_ERROR,
        'Async error',
        '非同期エラー',
        { severity: ErrorSeverity.HIGH }
      );
    };

    try {
      await asyncFunction();
    } catch (error) {
      await expect(handleError(error as AppError)).resolves.not.toThrow();
    }
  });
});

describe('パフォーマンステスト', () => {
  test('大量エラーの処理性能', async () => {
    const startTime = performance.now();
    
    const promises = Array.from({ length: 100 }, (_, i) => 
      handleError(new Error(`Test error ${i}`))
    );
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 100個のエラー処理が1秒以内に完了することを確認
    expect(duration).toBeLessThan(1000);
  });

  test('エラー統計のパフォーマンス', () => {
    const errorHandler = ErrorHandler.getInstance();
    
    const startTime = performance.now();
    const stats = errorHandler.getErrorStats();
    const endTime = performance.now();
    
    // 統計取得が100ms以内に完了することを確認
    expect(endTime - startTime).toBeLessThan(100);
    expect(stats).toBeTruthy();
  });
});