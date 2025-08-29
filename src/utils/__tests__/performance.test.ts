/**
 * performance.ts のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  usePrevious,
  useDeepMemo,
  useAsyncState,
  useLocalStorage,
  useWindowSize,
  useIntersectionObserver,
  useKeyboardShortcut,
  useClipboard,
  useInterval
} from '../performance';

// モックのセットアップ
beforeEach(() => {
  jest.useFakeTimers();
  
  // localStorage のモック
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // navigator.clipboard のモック
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn()
    },
    writable: true
  });

  // document.execCommand のモック
  document.execCommand = jest.fn();

  // window サイズのモック
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });

  // window.addEventListener のスパイ
  jest.spyOn(window, 'addEventListener');
  jest.spyOn(window, 'removeEventListener');
  jest.spyOn(document, 'addEventListener');
  jest.spyOn(document, 'removeEventListener');

  // IntersectionObserver のモック
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    callback
  }));

  // DOM environment のセットアップ
  if (!document.body) {
    document.body = document.createElement('body');
  }
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('useDebounce', () => {
  it('初期値を返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('値が変更されても遅延時間内では初期値を返す', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');
  });

  it('遅延時間経過後に新しい値を返す', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('複数回値が変更された場合、最後の値のみを反映する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'update1', delay: 500 });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'update2', delay: 500 });
    act(() => jest.advanceTimersByTime(200));

    rerender({ value: 'final', delay: 500 });
    act(() => jest.advanceTimersByTime(500));

    expect(result.current).toBe('final');
  });

  it('delay が変更された場合、新しい delay で動作する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });
});

describe('useDebouncedCallback', () => {
  it('デバウンスされたコールバック関数を返す', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    expect(typeof result.current).toBe('function');
    expect(callback).not.toHaveBeenCalled();
  });

  it('遅延時間内では元のコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('遅延時間経過後にコールバックが呼ばれる', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1', 'arg2');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('複数回呼び出された場合、最後の呼び出しのみが実行される', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg3');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('コンポーネントがアンマウントされた場合、タイマーがクリアされる', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useThrottle', () => {
  it('スロットルされたコールバック関数を返す', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    expect(typeof result.current).toBe('function');
  });

  it('初回呼び出しは即座に実行される', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current('arg1');
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('制限時間内の追加呼び出しは無視される', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('制限時間経過後に再度実行できる', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current('arg1');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      result.current('arg2');
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledWith('arg2');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('制限時間経過前の呼び出しは無視される', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current('arg1');
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    act(() => {
      result.current('arg2');
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('usePrevious', () => {
  it('初回レンダリングではundefinedを返す', () => {
    const { result } = renderHook(() => usePrevious('initial'));
    expect(result.current).toBeUndefined();
  });

  it('2回目以降のレンダリングで前の値を返す', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    rerender({ value: 'final' });
    expect(result.current).toBe('updated');
  });

  it('同じ値で再レンダリングしても前の値を保持する', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'same' } }
    );

    rerender({ value: 'same' });
    expect(result.current).toBe('same');

    rerender({ value: 'same' });
    expect(result.current).toBe('same');
  });

  it('異なる型の値でも正しく動作する', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: any }) => usePrevious(value),
      { initialProps: { value: 'string' } }
    );

    rerender({ value: 42 });
    expect(result.current).toBe('string');

    rerender({ value: { key: 'value' } });
    expect(result.current).toBe(42);

    rerender({ value: null });
    expect(result.current).toEqual({ key: 'value' });
  });
});

describe('useDeepMemo', () => {
  it('初回実行時にファクトリー関数を実行する', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const { result } = renderHook(() => useDeepMemo(factory, [1, 2, 3]));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ data: 'test' });
  });

  it('依存配列が変わらない場合、ファクトリー関数を再実行しない', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [1, 2, 3] } }
    );

    rerender({ deps: [1, 2, 3] });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('依存配列が浅く異なる場合、ファクトリー関数を再実行する', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [1, 2, 3] } }
    );

    rerender({ deps: [1, 2, 4] });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('依存配列のオブジェクトが深く等しい場合、再実行しない', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const obj = { a: 1, b: { c: 2 } };
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [obj] } }
    );

    rerender({ deps: [{ a: 1, b: { c: 2 } }] });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('依存配列のオブジェクトが深く異なる場合、再実行する', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const obj = { a: 1, b: { c: 2 } };
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [obj] } }
    );

    rerender({ deps: [{ a: 1, b: { c: 3 } }] });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('配列の長さが異なる場合、再実行する', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [1, 2, 3] } }
    );

    rerender({ deps: [1, 2] });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('null/undefined/プリミティブ値も正しく比較する', () => {
    const factory = jest.fn(() => ({ data: 'test' }));
    const { rerender } = renderHook(
      ({ deps }: { deps: any[] }) => useDeepMemo(factory, deps),
      { initialProps: { deps: [null, undefined, 'string'] } }
    );

    rerender({ deps: [null, undefined, 'string'] });
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: [null, undefined, 'different'] });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe('useAsyncState', () => {
  it('初期状態を正しく設定する', () => {
    const asyncFunction = jest.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsyncState(asyncFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
  });

  it('execute実行時にローディング状態を設定する', () => {
    const asyncFunction = jest.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsyncState(asyncFunction));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('非同期処理成功時に正しい状態を設定する', async () => {
    const asyncFunction = jest.fn(() => Promise.resolve('success data'));
    const { result } = renderHook(() => useAsyncState(asyncFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('success data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('非同期処理失敗時に正しい状態を設定する', async () => {
    const error = new Error('Test error');
    const asyncFunction = jest.fn(() => Promise.reject(error));
    const { result } = renderHook(() => useAsyncState(asyncFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
  });

  it('複数回execute実行時に状態が正しく更新される', async () => {
    const asyncFunction = jest.fn(() => Promise.resolve('success'));
    const { result } = renderHook(() => useAsyncState(asyncFunction));

    // 1回目の実行
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('success');
    expect(result.current.loading).toBe(false);

    // 2回目の実行
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('success');
    expect(result.current.loading).toBe(false);
    expect(asyncFunction).toHaveBeenCalledTimes(2);
  });
});

describe('useLocalStorage', () => {
  it('初期値を返す（localStorage が空の場合）', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(typeof result.current[1]).toBe('function');
  });

  it('localStorage から値を復元する', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('storedValue');
  });

  it('値を設定すると localStorage に保存される', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  it('関数による値の更新が正しく動作する', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(6);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(6));
  });

  it('localStorage の読み込み時のエラーを処理する', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(consoleSpy).toHaveBeenCalledWith('Error reading localStorage key "testKey":', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('localStorage の書き込み時のエラーを処理する', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage full');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error setting localStorage key "testKey":', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('オブジェクト型の値も正しく処理する', () => {
    const obj = { name: 'test', count: 1 };
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(obj));
    
    const { result } = renderHook(() => useLocalStorage('testKey', {}));

    expect(result.current[0]).toEqual(obj);
  });
});

describe('useWindowSize', () => {
  it('初期状態でundefinedを返すか現在のwindowサイズを返す', () => {
    const { result } = renderHook(() => useWindowSize());

    // useWindowSizeは初期化時にhandleResizeを呼ぶため、
    // window.innerWidthとinnerHeightが設定されていればその値を返す
    expect(typeof result.current.width).toBe('number');
    expect(typeof result.current.height).toBe('number');
  });

  it('マウント時にリサイズイベントリスナーを追加する', () => {
    renderHook(() => useWindowSize());

    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('アンマウント時にリサイズイベントリスナーを削除する', () => {
    const { unmount } = renderHook(() => useWindowSize());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('window.innerWidth と window.innerHeight を正しく設定する', () => {
    // window サイズのモック
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useWindowSize());

    // 初期実行でサイズが設定される
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('リサイズイベントで値が更新される', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useWindowSize());

    // サイズ変更をシミュレート
    Object.defineProperty(window, 'innerWidth', { value: 1280 });
    Object.defineProperty(window, 'innerHeight', { value: 900 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(900);
  });
});

describe('useIntersectionObserver', () => {
  let mockObserver: jest.Mocked<IntersectionObserver>;
  let mockRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    } as any;

    (global.IntersectionObserver as jest.Mock).mockImplementation((callback) => {
      mockObserver.callback = callback;
      return mockObserver;
    });

    mockRef = { current: document.createElement('div') };
  });

  it('初期状態でfalseを返す', () => {
    const { result } = renderHook(() => useIntersectionObserver(mockRef));

    expect(result.current).toBe(false);
  });

  it('要素が存在する場合、observer を作成する', () => {
    renderHook(() => useIntersectionObserver(mockRef));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {}
    );
    expect(mockObserver.observe).toHaveBeenCalledWith(mockRef.current);
  });

  it('要素が存在しない場合、observer を作成しない', () => {
    const emptyRef = { current: null };
    renderHook(() => useIntersectionObserver(emptyRef));

    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('intersection変更時に状態が更新される', () => {
    const { result } = renderHook(() => useIntersectionObserver(mockRef));

    // intersection 状態を変更
    act(() => {
      mockObserver.callback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(result.current).toBe(true);

    act(() => {
      mockObserver.callback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    expect(result.current).toBe(false);
  });

  it('カスタムオプションが正しく渡される', () => {
    const options = { threshold: 0.5, rootMargin: '10px' };
    renderHook(() => useIntersectionObserver(mockRef, options));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      options
    );
  });

  it('アンマウント時にunobserveが呼ばれる', () => {
    const { unmount } = renderHook(() => useIntersectionObserver(mockRef));

    unmount();

    expect(mockObserver.unobserve).toHaveBeenCalledWith(mockRef.current);
  });

  it('ref.currentが変更された場合、古い要素をunobserveし新しい要素をobserveする', () => {
    const { rerender } = renderHook(
      ({ ref }) => useIntersectionObserver(ref),
      { initialProps: { ref: mockRef } }
    );

    const newElement = document.createElement('div');
    const newRef = { current: newElement };

    rerender({ ref: newRef });

    expect(mockObserver.unobserve).toHaveBeenCalledWith(mockRef.current);
    expect(mockObserver.observe).toHaveBeenCalledWith(newElement);
  });
});

describe('useKeyboardShortcut', () => {
  it('キーボードショートカットのイベントリスナーを追加する', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+s', callback));

    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('単一キーのショートカットが正しく動作する', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('Enter', callback));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ctrl+キーの組み合わせが正しく動作する', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+s', callback));

    const event = new KeyboardEvent('keydown', { 
      key: 's', 
      ctrlKey: true 
    });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('複数のモディファイアキーの組み合わせが正しく動作する', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+shift+a', callback));

    const event = new KeyboardEvent('keydown', { 
      key: 'a', 
      ctrlKey: true,
      shiftKey: true 
    });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('異なるキーの組み合わせではコールバックが呼ばれない', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('ctrl+s', callback));

    const event = new KeyboardEvent('keydown', { key: 's' }); // ctrlKey がない

    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('preventDefault オプションが false の場合、preventDefault が呼ばれない', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('Enter', callback, { preventDefault: false }));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('enabled オプションが false の場合、ショートカットが無効になる', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('Enter', callback, { enabled: false }));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it('アンマウント時にイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut('Enter', callback));

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('alt、meta キーも正しく処理される', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('alt+meta+f', callback));

    const event = new KeyboardEvent('keydown', { 
      key: 'f', 
      altKey: true,
      metaKey: true
    });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('大文字小文字を区別しない', () => {
    const callback = jest.fn();
    renderHook(() => useKeyboardShortcut('CTRL+S', callback));

    const event = new KeyboardEvent('keydown', { 
      key: 's', 
      ctrlKey: true 
    });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useClipboard', () => {
  it('初期状態で hasCopied が false である', () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.hasCopied).toBe(false);
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('navigator.clipboard.writeText が成功した場合', async () => {
    const mockWriteText = navigator.clipboard.writeText as jest.Mock;
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(mockWriteText).toHaveBeenCalledWith('test text');
    expect(result.current.hasCopied).toBe(true);
  });

  it('指定されたタイムアウト後に hasCopied が false になる', async () => {
    const mockWriteText = navigator.clipboard.writeText as jest.Mock;
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard(1000));

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(result.current.hasCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.hasCopied).toBe(false);
  });

  it('navigator.clipboard が失敗した場合のエラーハンドリング', async () => {
    const mockWriteText = navigator.clipboard.writeText as jest.Mock;
    mockWriteText.mockRejectedValue(new Error('Clipboard failed'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // DOM操作をモック（フォールバックが動作することを確認）
    (document.execCommand as jest.Mock).mockReturnValue(true);
    const mockTextArea = document.createElement('textarea');
    mockTextArea.select = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard('fallback text');
    });

    // エラーがログに記録されることを確認
    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('カスタムタイムアウトが正しく動作する', async () => {
    const mockWriteText = navigator.clipboard.writeText as jest.Mock;
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard(500));

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(result.current.hasCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.hasCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.hasCopied).toBe(false);
  });
});

describe('useInterval', () => {
  it('指定された間隔でコールバックを実行する', () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('delay が null の場合、インターバルを設定しない', () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, null));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('コールバック関数が変更された場合、新しい関数を使用する', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    const { rerender } = renderHook(
      ({ cb, delay }) => useInterval(cb, delay),
      { initialProps: { cb: callback1, delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback1).toHaveBeenCalledTimes(1);

    // コールバック関数を変更
    rerender({ cb: callback2, delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('delay が変更された場合、新しい間隔でインターバルを再設定する', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // delay を変更
    rerender({ delay: 500 });
    callback.mockClear();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('delay が null に変更された場合、インターバルを停止する', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ delay }: { delay: number | null }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // delay を null に変更
    rerender({ delay: null });
    callback.mockClear();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('アンマウント時にインターバルがクリアされる', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('デフォルトエクスポート', () => {
  it('すべてのフックがデフォルトエクスポートに含まれている', async () => {
    const performanceHooks = (await import('../performance')).default;
    
    expect(performanceHooks.useDebounce).toBeDefined();
    expect(performanceHooks.useDebouncedCallback).toBeDefined();
    expect(performanceHooks.useThrottle).toBeDefined();
    expect(performanceHooks.usePrevious).toBeDefined();
    expect(performanceHooks.useDeepMemo).toBeDefined();
    expect(performanceHooks.useAsyncState).toBeDefined();
    expect(performanceHooks.useLocalStorage).toBeDefined();
    expect(performanceHooks.useWindowSize).toBeDefined();
    expect(performanceHooks.useIntersectionObserver).toBeDefined();
    expect(performanceHooks.useKeyboardShortcut).toBeDefined();
    expect(performanceHooks.useClipboard).toBeDefined();
    expect(performanceHooks.useInterval).toBeDefined();
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('複数のフックを同時に使用しても競合しない', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    const { result: result1 } = renderHook(() => useDebouncedCallback(callback1, 100));
    const { result: result2 } = renderHook(() => useThrottle(callback2, 200));

    act(() => {
      result1.current('debounced');
      result2.current('throttled');
    });

    expect(callback2).toHaveBeenCalledWith('throttled');
    expect(callback1).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback1).toHaveBeenCalledWith('debounced');
  });

  it('メモリリークを防ぐためのクリーンアップが正しく動作する', () => {
    const callback = jest.fn();
    
    const { unmount: unmount1 } = renderHook(() => useDebouncedCallback(callback, 100));
    const { unmount: unmount2 } = renderHook(() => useInterval(callback, 100));
    const { unmount: unmount3 } = renderHook(() => useKeyboardShortcut('Enter', callback));

    unmount1();
    unmount2();
    unmount3();

    // クリーンアップ後にタイマーが実行されないことを確認
    act(() => {
      jest.advanceTimersByTime(1000);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('極端な値でも正常に動作する', () => {
    const callback = jest.fn();
    
    // 非常に小さいdelay
    const { result } = renderHook(() => useDebouncedCallback(callback, 1));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});