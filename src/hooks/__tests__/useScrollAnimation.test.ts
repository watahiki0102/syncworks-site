/**
 * useScrollAnimation.ts のテスト
 * カバレッジ目標: 100%
 */

import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, useInView } from '../useScrollAnimation';

// window.pageYOffset をモック
Object.defineProperty(window, 'pageYOffset', {
  writable: true,
  value: 0
});

// IntersectionObserver をモック
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

mockIntersectionObserver.mockImplementation((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  callback
}));

global.IntersectionObserver = mockIntersectionObserver as any;

describe('useScrollAnimation', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    window.pageYOffset = 0;
  });

  afterEach(() => {
    // イベントリスナーをクリーンアップ
    window.removeEventListener('scroll', jest.fn());
  });

  it('初期状態では非表示', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current).toBe(false);
  });

  it('100px以下のスクロールでは非表示のまま', () => {
    const { result } = renderHook(() => useScrollAnimation());

    // 50pxスクロール
    act(() => {
      window.pageYOffset = 50;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);

    // 100pxちょうど（境界値）
    act(() => {
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('100pxを超えるスクロールで表示状態になる', () => {
    const { result } = renderHook(() => useScrollAnimation());

    // 101pxスクロール
    act(() => {
      window.pageYOffset = 101;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);

    // より大きな値でも表示状態を維持
    act(() => {
      window.pageYOffset = 500;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('スクロール位置を戻すと非表示状態に戻る', () => {
    const { result } = renderHook(() => useScrollAnimation());

    // 先に表示状態にする
    act(() => {
      window.pageYOffset = 200;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(true);

    // スクロールを戻す
    act(() => {
      window.pageYOffset = 50;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(false);
  });

  it('コンポーネントのアンマウント時にイベントリスナーが削除される', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useScrollAnimation());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('複数のスクロールイベントに正しく反応する', () => {
    const { result } = renderHook(() => useScrollAnimation());

    // 一連のスクロール動作をシミュレート
    const scrollPositions = [0, 50, 101, 200, 80, 150, 99, 101];
    const expectedResults = [false, false, true, true, false, true, false, true];

    scrollPositions.forEach((position, index) => {
      act(() => {
        window.pageYOffset = position;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current).toBe(expectedResults[index]);
    });
  });

  it('負のスクロール値でも正しく動作する', () => {
    const { result } = renderHook(() => useScrollAnimation());

    // 負の値（通常は発生しないが、堅牢性のテスト）
    act(() => {
      window.pageYOffset = -50;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });
});

describe('useInView', () => {
  let mockObserverInstance: any;
  let observerCallback: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockIntersectionObserver.mockImplementation((callback, options) => {
      observerCallback = callback;
      mockObserverInstance = {
        observe: mockObserve,
        disconnect: mockDisconnect,
        callback,
        options
      };
      return mockObserverInstance;
    });
  });

  it('初期状態では非表示', () => {
    const { result } = renderHook(() => useInView());
    const [, isInView] = result.current;

    expect(isInView).toBe(false);
  });

  it('refが設定されていない場合はIntersectionObserverが作成されない', () => {
    renderHook(() => useInView());

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('refが設定されるとIntersectionObserverが作成される', () => {
    const { result } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 }
    );
    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('カスタムthresholdが正しく設定される', () => {
    const { result } = renderHook(() => useInView(0.5));
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.5 }
    );
  });

  it('要素が交差すると状態が更新される', () => {
    const { result } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    // 要素が表示領域に入る
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(result.current[1]).toBe(true);

    // 要素が表示領域から出る
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(result.current[1]).toBe(false);
  });

  it('refが変更されると新しい要素を監視する', () => {
    const { result } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement1 = document.createElement('div');
    const mockElement2 = document.createElement('div');
    
    // 最初の要素を設定
    act(() => {
      setRef(mockElement1);
    });

    expect(mockObserve).toHaveBeenCalledWith(mockElement1);
    expect(mockDisconnect).toHaveBeenCalledTimes(0);

    // 2番目の要素に変更
    act(() => {
      setRef(mockElement2);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(mockElement2);
  });

  it('thresholdが変更されると新しいIntersectionObserverが作成される', () => {
    let threshold = 0.1;
    const { result, rerender } = renderHook(() => useInView(threshold));
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 }
    );

    // thresholdを変更
    threshold = 0.5;
    rerender();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.5 }
    );
  });

  it('コンポーネントのアンマウント時にobserverが切断される', () => {
    const { result, unmount } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('refをnullに設定するとobserverが切断される', () => {
    const { result } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    // 要素を設定
    act(() => {
      setRef(mockElement);
    });

    expect(mockObserve).toHaveBeenCalledWith(mockElement);

    // nullに設定
    act(() => {
      setRef(null);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('複数のエントリーが返されても最初のエントリーのみ使用される', () => {
    const { result } = renderHook(() => useInView());
    const [setRef] = result.current;

    const mockElement = document.createElement('div');
    
    act(() => {
      setRef(mockElement);
    });

    // 複数のエントリーをシミュレート（実際には発生しないが堅牢性のテスト）
    act(() => {
      observerCallback([
        { isIntersecting: true },
        { isIntersecting: false } // この値は無視される
      ]);
    });

    expect(result.current[1]).toBe(true);
  });

  describe('エッジケース', () => {
    it('threshold 0 でも動作する', () => {
      const { result } = renderHook(() => useInView(0));
      const [setRef] = result.current;

      const mockElement = document.createElement('div');
      
      act(() => {
        setRef(mockElement);
      });

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0 }
      );
    });

    it('threshold 1 でも動作する', () => {
      const { result } = renderHook(() => useInView(1));
      const [setRef] = result.current;

      const mockElement = document.createElement('div');
      
      act(() => {
        setRef(mockElement);
      });

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 1 }
      );
    });
  });
});