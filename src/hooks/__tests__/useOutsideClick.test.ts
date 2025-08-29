/**
 * useOutsideClick.ts のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  useOutsideClick,
  useMultipleOutsideClick,
  useConditionalOutsideClick
} from '../useOutsideClick';

// DOM要素のモック
beforeEach(() => {
  // document.addEventListener と removeEventListener のスパイ
  jest.spyOn(document, 'addEventListener');
  jest.spyOn(document, 'removeEventListener');
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('useOutsideClick', () => {
  it('refを返し、イベントリスナーを設定する', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useOutsideClick(callback));

    expect(result.current.current).toBeNull();
    expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('enabled=falseの場合、イベントリスナーを設定しない', () => {
    const callback = jest.fn();
    renderHook(() => useOutsideClick(callback, false));

    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it('要素外をクリックした時にコールバックが呼ばれる', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useOutsideClick(callback));

    // DOM要素を作成してrefに設定
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current.current = element;
    });

    // mousedownイベントを発火
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it('要素内をクリックした時にコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useOutsideClick(callback));

    // DOM要素を作成してrefに設定
    const element = document.createElement('div');
    const innerElement = document.createElement('span');
    element.appendChild(innerElement);
    document.body.appendChild(element);

    act(() => {
      result.current.current = element;
    });

    // 内部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(mouseEvent, 'target', {
      value: innerElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).not.toHaveBeenCalled();

    // クリーンアップ
    document.body.removeChild(element);
  });

  it('refがnullの場合、コールバックが呼ばれない', () => {
    const callback = jest.fn();
    renderHook(() => useOutsideClick(callback));

    // mousedownイベントを発火（refがnull）
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('アンマウント時にイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useOutsideClick(callback));

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('enabledがfalseからtrueに変更された時にイベントリスナーが追加される', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useOutsideClick(callback, enabled),
      { initialProps: { enabled: false } }
    );

    expect(document.addEventListener).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('enabledがtrueからfalseに変更された時にイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useOutsideClick(callback, enabled),
      { initialProps: { enabled: true } }
    );

    expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));

    rerender({ enabled: false });

    expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('コールバック関数が変更された場合、新しいコールバックが使用される', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    const { result, rerender } = renderHook(
      ({ cb }) => useOutsideClick(cb),
      { initialProps: { cb: callback1 } }
    );

    // DOM要素を設定
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current.current = element;
    });

    // 最初のコールバックでテスト
    const mouseEvent1 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent1, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent1);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // コールバックを変更
    rerender({ cb: callback2 });

    // 新しいコールバックでテスト
    const mouseEvent2 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent2, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent2);
    });

    expect(callback1).toHaveBeenCalledTimes(1); // 変わらず
    expect(callback2).toHaveBeenCalledTimes(1); // 新しいコールバックが呼ばれる

    // クリーンアップ
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });
});

describe('useMultipleOutsideClick', () => {
  it('指定された数のrefを返す', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useMultipleOutsideClick(callback, true, 3));

    expect(result.current).toHaveLength(3);
    expect(result.current.every(ref => ref.current === null)).toBe(true);
  });

  it('numberOfRefsが変更された場合、refs配列が再作成される', () => {
    const callback = jest.fn();
    const { result, rerender } = renderHook(
      ({ count }) => useMultipleOutsideClick(callback, true, count),
      { initialProps: { count: 2 } }
    );

    expect(result.current).toHaveLength(2);

    rerender({ count: 4 });

    expect(result.current).toHaveLength(4);
  });

  it('すべてのref要素の外側をクリックした時にコールバックが呼ばれる', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useMultipleOutsideClick(callback, true, 2));

    // DOM要素を作成
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element1);
    document.body.appendChild(element2);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current[0].current = element1;
      result.current[1].current = element2;
    });

    // 外部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element1);
    document.body.removeChild(element2);
    document.body.removeChild(outsideElement);
  });

  it('いずれかのref要素内をクリックした時にコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useMultipleOutsideClick(callback, true, 2));

    // DOM要素を作成
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    
    document.body.appendChild(element1);
    document.body.appendChild(element2);

    act(() => {
      result.current[0].current = element1;
      result.current[1].current = element2;
    });

    // 1つ目の要素内をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: element1,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).not.toHaveBeenCalled();

    // クリーンアップ
    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });

  it('enabled=falseの場合、イベントリスナーを設定しない', () => {
    const callback = jest.fn();
    renderHook(() => useMultipleOutsideClick(callback, false, 2));

    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it('refの一部がnullの場合でも正しく動作する', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useMultipleOutsideClick(callback, true, 2));

    // 1つだけ要素を設定
    const element1 = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element1);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current[0].current = element1;
      // result.current[1].current = null; // nullのまま
    });

    // 外部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element1);
    document.body.removeChild(outsideElement);
  });

  it('アンマウント時にイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useMultipleOutsideClick(callback, true, 2));

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });
});

describe('useConditionalOutsideClick', () => {
  it('条件がtrueで外部クリックした時にコールバックが呼ばれる', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => true);
    const { result } = renderHook(() => useConditionalOutsideClick(callback, condition));

    // DOM要素を作成
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current.current = element;
    });

    // 外部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(condition).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it('条件がfalseの場合、外部クリックしてもコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => false);
    const { result } = renderHook(() => useConditionalOutsideClick(callback, condition));

    // DOM要素を作成
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current.current = element;
    });

    // 外部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(condition).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();

    // クリーンアップ
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it('条件がtrueでも内部クリックの場合はコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => true);
    const { result } = renderHook(() => useConditionalOutsideClick(callback, condition));

    // DOM要素を作成
    const element = document.createElement('div');
    const innerElement = document.createElement('span');
    element.appendChild(innerElement);
    
    document.body.appendChild(element);

    act(() => {
      result.current.current = element;
    });

    // 内部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: innerElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(condition).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();

    // クリーンアップ
    document.body.removeChild(element);
  });

  it('enabled=falseの場合、イベントリスナーを設定しない', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => true);
    renderHook(() => useConditionalOutsideClick(callback, condition, false));

    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it('refがnullの場合、コールバックが呼ばれない', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => true);
    renderHook(() => useConditionalOutsideClick(callback, condition));

    // mousedownイベントを発火（refがnull）
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(condition).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('アンマウント時にイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const condition = jest.fn(() => true);
    const { unmount } = renderHook(() => useConditionalOutsideClick(callback, condition));

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('condition関数が変更された場合、新しいcondition関数が使用される', () => {
    const callback = jest.fn();
    const condition1 = jest.fn(() => false);
    const condition2 = jest.fn(() => true);
    
    const { result, rerender } = renderHook(
      ({ cond }) => useConditionalOutsideClick(callback, cond),
      { initialProps: { cond: condition1 } }
    );

    // DOM要素を設定
    const element = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element);
    document.body.appendChild(outsideElement);

    act(() => {
      result.current.current = element;
    });

    // 最初のcondition（false）でテスト
    const mouseEvent1 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent1, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent1);
    });

    expect(condition1).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();

    // conditionを変更（true）
    rerender({ cond: condition2 });

    // 新しいcondition（true）でテスト
    const mouseEvent2 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent2, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent2);
    });

    expect(condition2).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });
});

describe('デフォルトエクスポート', () => {
  it('useOutsideClickがデフォルトエクスポートされている', async () => {
    const defaultExport = (await import('../useOutsideClick')).default;
    expect(defaultExport).toBe(useOutsideClick);
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('複数のフックを同時に使用しても競合しない', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const condition = jest.fn(() => true);

    const { result: result1 } = renderHook(() => useOutsideClick(callback1));
    const { result: result2 } = renderHook(() => useConditionalOutsideClick(callback2, condition));

    // DOM要素を作成
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const outsideElement = document.createElement('div');
    
    document.body.appendChild(element1);
    document.body.appendChild(element2);
    document.body.appendChild(outsideElement);

    act(() => {
      result1.current.current = element1;
      result2.current.current = element2;
    });

    // 外部要素をクリック
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseEvent, 'target', {
      value: outsideElement,
      enumerable: true
    });

    act(() => {
      document.dispatchEvent(mouseEvent);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    // クリーンアップ
    document.body.removeChild(element1);
    document.body.removeChild(element2);
    document.body.removeChild(outsideElement);
  });

  it('無効なDOM要素でもエラーが発生しない', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useOutsideClick(callback));

    // 無効な要素を設定（テストのため）
    act(() => {
      result.current.current = null;
    });

    // mousedownイベントを発火
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    expect(() => {
      act(() => {
        document.dispatchEvent(mouseEvent);
      });
    }).not.toThrow();

    expect(callback).not.toHaveBeenCalled();
  });
});