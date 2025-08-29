/**
 * dev-tools.ts のテスト
 * カバレッジ目標: 85%+
 */

// モックを最初に設定
// Reactのモック
const mockUseRef = jest.fn(() => ({ current: 0 }));
const mockUseEffect = jest.fn();

// グローバルReactのモック
(global as any).React = {
  useRef: mockUseRef,
  useEffect: mockUseEffect,
};

// パフォーマンスAPIのモック
global.performance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
} as any;

// PerformanceObserverのモック
const mockObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};
global.PerformanceObserver = jest.fn().mockImplementation((callback) => mockObserver);

// windowのモック
Object.defineProperty(global, 'window', {
  value: {
    location: {
      pathname: '/test',
    },
  },
  writable: true,
});

// configとloggerのモック
jest.mock('../config', () => ({
  config: {
    env: {
      isDevelopment: true,
    },
  },
}));

jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// import after mocks
import { PerformanceMonitor, renderOptimizationChecker } from '../dev-tools';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // シングルトンインスタンスをリセット
    (PerformanceMonitor as any).instance = undefined;
    monitor = PerformanceMonitor.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const monitor1 = PerformanceMonitor.getInstance();
      const monitor2 = PerformanceMonitor.getInstance();
      
      expect(monitor1).toBe(monitor2);
    });
  });

  describe('startMeasurement', () => {
    it('測定を開始して終了できる', () => {
      const mockNow = jest.spyOn(performance, 'now');
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const endMeasurement = monitor.startMeasurement('test-operation');
      
      expect(typeof endMeasurement).toBe('function');
      
      endMeasurement();
      
      expect(mockNow).toHaveBeenCalledTimes(2);
    });

    it('測定結果が正しく記録される', () => {
      const mockNow = jest.spyOn(performance, 'now');
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1150);

      const endMeasurement = monitor.startMeasurement('test-operation');
      endMeasurement();
      
      const stats = monitor.getStats('test-operation');
      expect(stats).toEqual({
        avg: 150,
        min: 150,
        max: 150,
        count: 1,
      });
    });

    it('複数の測定を記録できる', () => {
      const mockNow = jest.spyOn(performance, 'now');
      
      // 1回目の測定
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);
      const end1 = monitor.startMeasurement('multi-test');
      end1();
      
      // 2回目の測定
      mockNow.mockReturnValueOnce(2000).mockReturnValueOnce(2200);
      const end2 = monitor.startMeasurement('multi-test');
      end2();
      
      const stats = monitor.getStats('multi-test');
      expect(stats).toEqual({
        avg: 150, // (100 + 200) / 2
        min: 100,
        max: 200,
        count: 2,
      });
    });
  });

  describe('getStats', () => {
    it('存在しない測定名に対してnullを返す', () => {
      const stats = monitor.getStats('non-existent');
      expect(stats).toBeNull();
    });

    it('正しい統計情報を返す', () => {
      const mockNow = jest.spyOn(performance, 'now');
      
      // 複数の測定を追加
      const durations = [100, 200, 300];
      durations.forEach((duration, index) => {
        mockNow.mockReturnValueOnce(index * 1000).mockReturnValueOnce(index * 1000 + duration);
        const end = monitor.startMeasurement('stats-test');
        end();
      });
      
      const stats = monitor.getStats('stats-test');
      expect(stats).toEqual({
        avg: 200, // (100 + 200 + 300) / 3
        min: 100,
        max: 300,
        count: 3,
      });
    });
  });

  describe('logAllStats', () => {
    it('すべての測定結果をログ出力する', () => {
      const { logger } = require('../logger');
      
      const mockNow = jest.spyOn(performance, 'now');
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);
      
      const end = monitor.startMeasurement('log-test');
      end();
      
      monitor.logAllStats();
      
      expect(logger.info).toHaveBeenCalledWith(
        'Performance Stats: log-test',
        { avg: 100, min: 100, max: 100, count: 1 },
        { component: 'PerformanceMonitor', action: 'stats' }
      );
    });

    it('測定データがない場合はログ出力しない', () => {
      const { logger } = require('../logger');
      
      monitor.logAllStats();
      
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('clearMeasurements', () => {
    it('すべての測定結果をクリアする', () => {
      const mockNow = jest.spyOn(performance, 'now');
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);
      
      const end = monitor.startMeasurement('clear-test');
      end();
      
      expect(monitor.getStats('clear-test')).not.toBeNull();
      
      monitor.clearMeasurements();
      
      expect(monitor.getStats('clear-test')).toBeNull();
    });
  });

  describe('disconnect', () => {
    it('すべてのオブザーバーを停止する', () => {
      const mockDisconnect = jest.fn();
      const MockedPerformanceObserver = global.PerformanceObserver as jest.MockedClass<typeof PerformanceObserver>;
      
      MockedPerformanceObserver.mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: mockDisconnect,
      }) as any);
      
      // 新しいインスタンスを作成してオブザーバーを初期化
      (PerformanceMonitor as any).instance = undefined;
      const newMonitor = PerformanceMonitor.getInstance();
      
      newMonitor.disconnect();
      
      // disconnect が呼ばれることを確認（オブザーバーが作成されている場合）
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

describe('renderOptimizationChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUnnecessaryRerenders', () => {
    it('prevPropsがない場合は何もしない', () => {
      const { logger } = require('../logger');
      
      renderOptimizationChecker.checkUnnecessaryRerenders(
        'TestComponent',
        { prop1: 'value1' }
      );
      
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('プロパティに変更がない場合は警告しない', () => {
      const { logger } = require('../logger');
      
      const props = { prop1: 'value1', prop2: 42 };
      const prevProps = { prop1: 'value1', prop2: 42 };
      
      renderOptimizationChecker.checkUnnecessaryRerenders(
        'TestComponent',
        props,
        prevProps
      );
      
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('参照の変更による不要な再レンダリングを検出する', () => {
      const { logger } = require('../logger');
      
      const obj = { nested: 'value' };
      const props = { prop1: obj };
      const prevProps = { prop1: { nested: 'value' } }; // 異なる参照だが内容は同じ
      
      renderOptimizationChecker.checkUnnecessaryRerenders(
        'TestComponent',
        props,
        prevProps
      );
      
      expect(logger.warn).toHaveBeenCalledWith(
        'TestComponent: 参照の変更による不要な再レンダリングが発生している可能性があります',
        {
          shallowChangedProps: ['prop1'],
          suggestion: 'useMemo, useCallback, React.memoの使用を検討してください'
        },
        { component: 'TestComponent', action: 'renderOptimizationWarning' }
      );
    });

    it('実際の値の変更の場合は警告しない', () => {
      const { logger } = require('../logger');
      
      const props = { prop1: 'new-value' };
      const prevProps = { prop1: 'old-value' };
      
      renderOptimizationChecker.checkUnnecessaryRerenders(
        'TestComponent',
        props,
        prevProps
      );
      
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('checkUnmemoizedCallbacks', () => {
    it('メモ化されていないコールバックを検出する', () => {
      const { logger } = require('../logger');
      
      const callbacks = {
        onClick: () => console.log('click'),
        onSubmit: function() { return 'submit'; },
      };
      
      renderOptimizationChecker.checkUnmemoizedCallbacks('TestComponent', callbacks);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'TestComponent: onClick がメモ化されていない可能性があります',
        {
          callbackName: 'onClick',
          suggestion: 'useCallbackの使用を検討してください'
        },
        { component: 'TestComponent', action: 'callbackOptimizationWarning' }
      );
      
      expect(logger.warn).toHaveBeenCalledWith(
        'TestComponent: onSubmit がメモ化されていない可能性があります',
        {
          callbackName: 'onSubmit',
          suggestion: 'useCallbackの使用を検討してください'
        },
        { component: 'TestComponent', action: 'callbackOptimizationWarning' }
      );
    });

    it('メモ化されたコールバックは警告しない', () => {
      const { logger } = require('../logger');
      
      const callbacks = {
        onClick: 'useCallback(() => console.log("click"), [])',
        onSubmit: 'useMemo(() => () => console.log("submit"), [])',
      };
      
      // 実際の関数ではなく、文字列の関数として扱うため、toString()がそのまま返される
      callbacks.onClick = Object.assign(() => {}, { 
        toString: () => 'useCallback(() => console.log("click"), [])' 
      }) as any;
      callbacks.onSubmit = Object.assign(() => {}, { 
        toString: () => 'useMemo(() => () => console.log("submit"), [])' 
      }) as any;
      
      renderOptimizationChecker.checkUnmemoizedCallbacks('TestComponent', callbacks);
      
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('空のコールバックオブジェクトでエラーにならない', () => {
      expect(() => {
        renderOptimizationChecker.checkUnmemoizedCallbacks('TestComponent', {});
      }).not.toThrow();
    });
  });
});

describe('非開発環境での動作', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // configを非開発環境に変更
    jest.doMock('../config', () => ({
      config: {
        env: {
          isDevelopment: false,
        },
      },
    }));
  });

  afterEach(() => {
    jest.dontMock('../config');
  });

  it('PerformanceMonitorが適切に動作する', () => {
    // 非開発環境でもインスタンスは作成される
    const monitor = PerformanceMonitor.getInstance();
    expect(monitor).toBeDefined();
    
    // 測定は動作する（内部的に開発環境チェックがある）
    const endMeasurement = monitor.startMeasurement('prod-test');
    expect(typeof endMeasurement).toBe('function');
  });

  it('renderOptimizationCheckerが警告を出力しない', () => {
    const { logger } = require('../logger');
    
    const props = { prop1: { nested: 'value' } };
    const prevProps = { prop1: { nested: 'value' } };
    
    renderOptimizationChecker.checkUnnecessaryRerenders('TestComponent', props, prevProps);
    renderOptimizationChecker.checkUnmemoizedCallbacks('TestComponent', { onClick: () => {} });
    
    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe('エラーハンドリング', () => {
  it('PerformanceObserverがサポートされていない場合のエラーハンドリング', () => {
    const { logger } = require('../logger');
    
    // PerformanceObserverでエラーが発生するようにモック
    const MockedPerformanceObserver = global.PerformanceObserver as jest.MockedClass<typeof PerformanceObserver>;
    MockedPerformanceObserver.mockImplementation(() => {
      throw new Error('PerformanceObserver not supported');
    });
    
    // 新しいインスタンスを作成
    (PerformanceMonitor as any).instance = undefined;
    const monitor = PerformanceMonitor.getInstance();
    
    expect(monitor).toBeDefined();
    // エラーがログに記録されることを確認（initializeObservers内で）
    expect(logger.warn).toHaveBeenCalledWith(
      'Performance observers not supported',
      { error: expect.any(Error) }
    );
  });

  it('JSON.stringifyが失敗した場合の循環参照エラーハンドリング', () => {
    const { logger } = require('../logger');
    
    // 循環参照を作成
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;
    
    const props = { prop1: circularObj };
    const prevProps = { prop1: { name: 'test', self: {} } };
    
    // JSON.stringify が失敗しても例外が発生しないことを確認
    expect(() => {
      renderOptimizationChecker.checkUnnecessaryRerenders('TestComponent', props, prevProps);
    }).not.toThrow();
  });
});