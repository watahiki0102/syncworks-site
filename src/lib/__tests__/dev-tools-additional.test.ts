/**
 * dev-tools.ts の追加テスト
 * 既存テストで不足している部分をカバー
 * カバレッジ目標: 90%+
 */

// 必要なモックの設定（既存テストと同様）
const mockUseRef = jest.fn(() => ({ current: 0 }));
const mockUseEffect = jest.fn();

// Reactのモック
(global as any).React = {
  useRef: mockUseRef,
  useEffect: mockUseEffect,
};

// PerformanceObserverのモック
const mockObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};
global.PerformanceObserver = jest.fn().mockImplementation((callback) => mockObserver);

// パフォーマンスAPIのモック
global.performance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
} as any;

// windowのモック
Object.defineProperty(global, 'window', {
  value: {
    location: { pathname: '/test' },
    document: {
      createElement: jest.fn(() => ({
        style: { cssText: '' },
        appendChild: jest.fn(),
        innerHTML: '',
      })),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
    },
  },
  writable: true,
});

// configとloggerのモック（開発環境用）
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
import {
  useRenderTracker,
  debugInfo,
  devTools,
} from '../dev-tools';

describe('useRenderTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('開発環境でレンダートラッカーを返す', () => {
    const tracker = useRenderTracker('TestComponent');
    
    expect(tracker).toHaveProperty('renderCount');
    expect(tracker).toHaveProperty('logPropsChange');
    expect(typeof tracker.logPropsChange).toBe('function');
  });

  it('レンダーカウントが正しくインクリメントされる', () => {
    // renderCountRefの更新をシミュレート
    mockUseRef.mockReturnValue({ current: 1 });
    
    const tracker = useRenderTracker('TestComponent');
    expect(tracker.renderCount).toBe(1);
  });

  it('props変更のログが正常に動作する', () => {
    const { logger } = require('../logger');
    const tracker = useRenderTracker('TestComponent');
    
    const props1 = { prop1: 'value1', prop2: 42 };
    const props2 = { prop1: 'value2', prop2: 42 };
    
    // 初回呼び出し（変更なし）
    tracker.logPropsChange(props1);
    expect(logger.debug).not.toHaveBeenCalled();
    
    // 2回目呼び出し（変更あり）
    tracker.logPropsChange(props2);
    expect(logger.debug).toHaveBeenCalledWith(
      'TestComponent props changed',
      expect.objectContaining({
        changedProps: ['prop1'],
        oldProps: props1,
        newProps: props2
      }),
      { component: 'TestComponent', action: 'propsChange' }
    );
  });

  it('useEffectがコンポーネント名とレンダーカウントでログを出力する', () => {
    const { logger } = require('../logger');
    
    // useEffectのコールバックを実行
    const effectCallback = mockUseEffect.mock.calls[0]?.[0];
    if (effectCallback) {
      effectCallback();
    }
    
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('rendered'),
      expect.objectContaining({
        renderCount: expect.any(Number),
        timestamp: expect.any(Number)
      }),
      expect.objectContaining({
        component: expect.any(String),
        action: 'render'
      })
    );
  });
});

describe('debugInfo', () => {
  let consoleGroupSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleTraceSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleTraceSpy = jest.spyOn(console, 'trace').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    consoleGroupSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleTraceSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('logComponentInfo', () => {
    it('コンポーネント情報をコンソールに表示する', () => {
      const props = { prop1: 'value1', prop2: 42 };
      const state = { count: 5 };
      
      debugInfo.logComponentInfo('TestComponent', props, state);
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('🔍 TestComponent');
      expect(consoleLogSpy).toHaveBeenCalledWith('Props:', props);
      expect(consoleLogSpy).toHaveBeenCalledWith('State:', state);
      expect(consoleTraceSpy).toHaveBeenCalledWith('Render stack');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('stateがない場合はstateをログ出力しない', () => {
      const props = { prop1: 'value1' };
      
      debugInfo.logComponentInfo('TestComponent', props);
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('🔍 TestComponent');
      expect(consoleLogSpy).toHaveBeenCalledWith('Props:', props);
      expect(consoleLogSpy).not.toHaveBeenCalledWith('State:', expect.anything());
      expect(consoleTraceSpy).toHaveBeenCalledWith('Render stack');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });
  });

  describe('visualizePerformance', () => {
    let mockCreateElement: jest.Mock;
    let mockAppendChild: jest.Mock;
    let mockRemoveChild: jest.Mock;
    let mockSetInterval: jest.SpyInstance;
    let mockSetTimeout: jest.SpyInstance;
    let mockClearInterval: jest.SpyInstance;

    beforeEach(() => {
      mockCreateElement = jest.fn(() => ({
        style: { cssText: '' },
        innerHTML: '',
      }));
      mockAppendChild = jest.fn();
      mockRemoveChild = jest.fn();

      (global.document as any) = {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      };

      mockSetInterval = jest.spyOn(global, 'setInterval').mockImplementation(
        (callback, interval) => {
          callback(); // すぐに1回実行
          return 123 as any; // intervalIdを返す
        }
      );
      mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation(
        (callback) => {
          callback(); // すぐに実行
          return 456 as any;
        }
      );
      mockClearInterval = jest.spyOn(global, 'clearInterval').mockImplementation();
    });

    afterEach(() => {
      mockSetInterval.mockRestore();
      mockSetTimeout.mockRestore();
      mockClearInterval.mockRestore();
    });

    it('パフォーマンスオーバーレイを作成する', () => {
      debugInfo.visualizePerformance();
      
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('5秒後にオーバーレイを削除する', () => {
      debugInfo.visualizePerformance();
      
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockClearInterval).toHaveBeenCalledWith(123);
    });

    it('オーバーレイのスタイルが正しく設定される', () => {
      const mockElement = { style: { cssText: '' }, innerHTML: '' };
      mockCreateElement.mockReturnValue(mockElement);
      
      debugInfo.visualizePerformance();
      
      expect(mockElement.style.cssText).toContain('position: fixed');
      expect(mockElement.style.cssText).toContain('top: 10px');
      expect(mockElement.style.cssText).toContain('right: 10px');
      expect(mockElement.style.cssText).toContain('z-index: 9999');
    });
  });
});

describe('devTools統合', () => {
  it('開発環境でdevToolsオブジェクトが存在する', () => {
    expect(devTools).toBeDefined();
    expect(devTools).toHaveProperty('useRenderTracker');
    expect(devTools).toHaveProperty('performanceMonitor');
    expect(devTools).toHaveProperty('renderOptimizationChecker');
    expect(devTools).toHaveProperty('debugInfo');
    expect(devTools).toHaveProperty('attachToWindow');
  });

  it('attachToWindow機能が動作する', () => {
    const { logger } = require('../logger');
    
    if (devTools) {
      devTools.attachToWindow();
      
      expect((global as any).window.devTools).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('Dev tools attached to window.devTools');
    }
  });
});

describe('非開発環境での動作確認', () => {
  beforeAll(() => {
    // configを非開発環境に変更
    jest.doMock('../config', () => ({
      config: {
        env: {
          isDevelopment: false,
        },
      },
    }));
  });

  afterAll(() => {
    jest.dontMock('../config');
  });

  it('非開発環境でuseRenderTrackerが最小限の機能を返す', () => {
    // 非開発環境用のモジュールを再取得
    jest.resetModules();
    const { useRenderTracker: prodUseRenderTracker } = require('../dev-tools');
    
    const tracker = prodUseRenderTracker('TestComponent');
    
    expect(tracker.renderCount).toBe(0);
    expect(typeof tracker.logPropsChange).toBe('function');
    
    // 非開発環境では何も実行されない
    tracker.logPropsChange({ prop: 'value' });
    // 例外が投げられないことを確認
  });

  it('非開発環境でdebugInfoが何も実行しない', () => {
    jest.resetModules();
    const { debugInfo: prodDebugInfo } = require('../dev-tools');
    
    const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    
    prodDebugInfo.logComponentInfo('TestComponent', {});
    
    expect(consoleGroupSpy).not.toHaveBeenCalled();
    
    consoleGroupSpy.mockRestore();
  });
});

describe('エラーハンドリングとエッジケース', () => {
  it('windowが存在しない環境での動作', () => {
    const originalWindow = (global as any).window;
    
    // windowを一時的に削除
    delete (global as any).window;
    
    expect(() => {
      debugInfo.visualizePerformance();
    }).not.toThrow();
    
    // windowを復元
    (global as any).window = originalWindow;
  });

  it('documentが存在しない環境での動作', () => {
    const originalDocument = (global as any).document;
    
    // documentを一時的に削除
    delete (global as any).document;
    
    expect(() => {
      debugInfo.visualizePerformance();
    }).not.toThrow();
    
    // documentを復元
    (global as any).document = originalDocument;
  });

  it('performanceAPIが存在しない環境での動作', () => {
    const originalPerformance = global.performance;
    
    // performanceを一時的に削除
    delete (global as any).performance;
    
    expect(() => {
      const { PerformanceMonitor } = require('../dev-tools');
      const monitor = PerformanceMonitor.getInstance();
      monitor.startMeasurement('test');
    }).not.toThrow();
    
    // performanceを復元
    global.performance = originalPerformance;
  });

  it('JSON.stringify循環参照エラーのハンドリング', () => {
    const { renderOptimizationChecker } = require('../dev-tools');
    
    // 循環参照オブジェクトを作成
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;
    
    expect(() => {
      renderOptimizationChecker.checkUnnecessaryRerenders(
        'TestComponent',
        { prop: circularObj },
        { prop: { name: 'test' } }
      );
    }).not.toThrow();
  });
});