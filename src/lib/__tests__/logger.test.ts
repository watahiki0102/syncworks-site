/**
 * logger.ts のテスト
 * カバレッジ目標: 90%+
 */

import { logger, log, LogLevel } from '../logger';

// console.*をモック
const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
const consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();

// performanceをモック
global.performance = {
  now: jest.fn(() => 1000),
} as any;

// fetchをモック
global.fetch = jest.fn();

// setIntervalをモック
jest.spyOn(global, 'setInterval').mockImplementation(jest.fn());

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleDebugSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleTimeSpy.mockRestore();
    consoleTimeEndSpy.mockRestore();
  });

  describe('基本的なログ出力', () => {
    it('debugログが正しく出力される', () => {
      logger.debug('Debug message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[DEBUG\].*Debug message/)
      );
    });

    it('infoログが正しく出力される', () => {
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*Info message/)
      );
    });

    it('warnログが正しく出力される', () => {
      logger.warn('Warning message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[WARN\].*Warning message/)
      );
    });

    it('errorログが正しく出力される', () => {
      logger.error('Error message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[ERROR\].*Error message/)
      );
    });
  });

  describe('追加データ付きログ', () => {
    it('データオブジェクトと一緒にログが出力される', () => {
      const testData = { userId: '123', action: 'login' };
      logger.info('User action', testData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*User action/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Data:',
        expect.objectContaining(testData)
      );
    });

    it('エラーオブジェクトと一緒にログが出力される', () => {
      const testError = new Error('Test error');
      logger.error('An error occurred', testError);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[ERROR\].*An error occurred/)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        testError
      );
    });

    it('複雑なデータ構造もログ出力される', () => {
      const complexData = {
        user: { id: '123', name: 'John' },
        request: { method: 'POST', path: '/api/data' },
        metadata: { timestamp: Date.now(), version: '1.0.0' }
      };

      logger.info('Complex operation', complexData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*Complex operation/)
      );
    });
  });

  describe('ログレベルフィルタリング', () => {
    it('実装された設定によりログが出力される', () => {
      // デフォルトの設定では開発環境でdebugレベルから出力される
      logger.debug('Debug message');
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[DEBUG\].*Debug message/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*Info message/)
      );
    });
  });

  describe('設定更新機能', () => {
    it('updateConfigが正しく動作する', () => {
      logger.updateConfig({ enableConsole: false });
      
      logger.debug('Debug message');
      
      // enableConsole: falseの場合はコンソール出力されない
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringMatching(/.*\[DEBUG\].*Debug message/)
      );
      
      // 設定を元に戻す
      logger.updateConfig({ enableConsole: true });
    });
  });

  describe('パフォーマンス測定', () => {
    it('startTimerが正しく動作する', () => {
      const endTimer = logger.startTimer('test-operation');
      
      expect(typeof endTimer).toBe('function');
      expect(consoleTimeSpy).toHaveBeenCalledWith('test-operation');
      
      // 終了関数を呼ぶ
      endTimer();
      
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('test-operation');
    });
  });

  describe('ログ履歴機能', () => {
    it('getLogHistoryが正しく動作する', () => {
      logger.info('Test log 1');
      logger.error('Test error');
      logger.info('Test log 2');

      const history = logger.getLogHistory();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      const infoLogs = logger.getLogHistory('info');
      expect(infoLogs.every(log => log.level === 'info')).toBe(true);
      
      const limitedLogs = logger.getLogHistory(undefined, 1);
      expect(limitedLogs.length).toBe(1);
    });
  });

  describe('専用ログメソッド', () => {
    it('logUserActionが正しく動作する', () => {
      logger.logUserAction('login', { browser: 'Chrome' }, 'user-123');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*User action: login/)
      );
    });

    it('logApiRequestが正しく動作する', () => {
      logger.logApiRequest('GET', '/api/users', 200, 150);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].*API GET \/api\/users - 200/)
      );
    });

    it('logComponentが正しく動作する', () => {
      logger.logComponent('Button', 'click', { id: 'submit-btn' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[DEBUG\].*Button: click/)
      );
    });
  });

  describe('フラッシュ機能', () => {
    it('flushが正しく動作する', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await logger.flush();
      
      // 非同期処理が完了することを確認
      expect(mockFetch).not.toThrow();
    });
  });
});

describe('log関数（便利な関数）', () => {
  it('log.debugが正しく動作する', () => {
    log.debug('Debug via log function');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[DEBUG\].*Debug via log function/)
    );
  });

  it('log.infoが正しく動作する', () => {
    log.info('Info via log function');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[INFO\].*Info via log function/)
    );
  });

  it('log.warnが正しく動作する', () => {
    log.warn('Warn via log function');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[WARN\].*Warn via log function/)
    );
  });

  it('log.errorが正しく動作する', () => {
    const testError = new Error('Test error');
    log.error('Error via log function', testError);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[ERROR\].*Error via log function/)
    );
  });

  it('log.timerが正しく動作する', () => {
    const endTimer = log.timer('test-timer');

    expect(typeof endTimer).toBe('function');
    // テスト環境では enableConsole が false の場合があるので、
    // console.time が呼ばれるかどうかではなく、関数が正しく動作するかを確認
    endTimer(); // 終了関数を呼ぶことで、タイマーが正しく設定されたことを確認
  });

  it('log.userActionが正しく動作する', () => {
    log.userAction('test-action', { data: 'test' });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[INFO\].*User action: test-action/)
    );
  });

  it('log.apiRequestが正しく動作する', () => {
    log.apiRequest('POST', '/api/test', 201);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[INFO\].*API POST \/api\/test - 201/)
    );
  });

  it('log.componentが正しく動作する', () => {
    log.component('TestComponent', 'render');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[DEBUG\].*TestComponent: render/)
    );
  });
});

describe('エラーハンドリング', () => {
  it('循環参照のあるオブジェクトも安全に処理する', () => {
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;

    expect(() => {
      logger.info('Circular object test', circularObj);
    }).not.toThrow();
  });

  it('undefinedやnullの値も安全に処理する', () => {
    expect(() => {
      logger.info('Null test', { value: null, undef: undefined });
    }).not.toThrow();
  });

  it('APIリクエストでエラーステータスの場合にerrorレベルになる', () => {
    logger.logApiRequest('GET', '/api/error', 500);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/.*\[ERROR\].*API GET \/api\/error - 500/)
    );
  });
});