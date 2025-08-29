/**
 * useAsyncOperation.ts のテスト
 * カバレッジ目標: 100%
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncOperation, useAsyncOperationGroup } from '../useAsyncOperation';

// タイマーをモック
jest.useFakeTimers();

// AbortController のモック
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: { aborted: false },
  abort: jest.fn()
}));

describe('useAsyncOperation', () => {
  const mockAsyncFunction = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('成功時の状態変更が正しく動作する', async () => {
    const testData = { id: 1, name: 'test' };
    mockAsyncFunction.mockResolvedValue(testData);

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFunction, { onSuccess: mockOnSuccess })
    );

    act(() => {
      result.current.execute('arg1', 'arg2');
    });

    // ローディング状態の確認
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isSuccess).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 成功状態の確認
    expect(result.current.data).toEqual(testData);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBe(null);
    expect(mockOnSuccess).toHaveBeenCalledWith(testData);
    expect(mockAsyncFunction).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('エラー時の状態変更が正しく動作する', async () => {
    const testError = new Error('Test error');
    mockAsyncFunction.mockRejectedValue(testError);

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFunction, { onError: mockOnError })
    );

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // エラー状態の確認
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(testError);
    expect(result.current.isSuccess).toBe(false);
    expect(mockOnError).toHaveBeenCalledWith(testError);
  });

  it('文字列エラーがErrorオブジェクトに変換される', async () => {
    mockAsyncFunction.mockRejectedValue('String error');

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });

    expect(result.current.error?.message).toBe('String error');
  });

  it('リトライ機能が正しく動作する', async () => {
    const testError = new Error('Network error');
    mockAsyncFunction
      .mockRejectedValueOnce(testError)
      .mockRejectedValueOnce(testError)
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFunction, { 
        retryCount: 2,
        retryDelay: 1000
      })
    );

    act(() => {
      result.current.execute();
    });

    // 最初の実行でエラー
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // 1回目のリトライ
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // 2回目のリトライ（指数バックオフで2秒後）
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe('success');
    expect(mockAsyncFunction).toHaveBeenCalledTimes(3);
  });

  it('リトライ回数を超えた場合エラーが報告される', async () => {
    const testError = new Error('Persistent error');
    mockAsyncFunction.mockRejectedValue(testError);

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFunction, { 
        retryCount: 1,
        retryDelay: 1000,
        onError: mockOnError
      })
    );

    act(() => {
      result.current.execute();
    });

    // リトライ実行
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(testError);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(mockOnError).toHaveBeenCalledWith(testError);
    expect(mockAsyncFunction).toHaveBeenCalledTimes(2); // 初回 + 1回リトライ
  });

  it('指数バックオフが正しく計算される', async () => {
    const testError = new Error('Network error');
    mockAsyncFunction.mockRejectedValue(testError);

    const { result } = renderHook(() => 
      useAsyncOperation(mockAsyncFunction, { 
        retryCount: 3,
        retryDelay: 1000
      })
    );

    act(() => {
      result.current.execute();
    });

    // 1回目のリトライ: 1秒後
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockAsyncFunction).toHaveBeenCalledTimes(2);

    // 2回目のリトライ: 2秒後（1000 * 2^1）
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockAsyncFunction).toHaveBeenCalledTimes(3);

    // 3回目のリトライ: 4秒後（1000 * 2^2）
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(mockAsyncFunction).toHaveBeenCalledTimes(4);
  });

  it('reset機能が正しく動作する', async () => {
    const testData = { test: 'data' };
    mockAsyncFunction.mockResolvedValue(testData);

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    // 最初に実行して成功状態にする
    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // リセット実行
    act(() => {
      result.current.reset();
    });

    // 初期状態に戻ることを確認
    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('cancel機能が正しく動作する', async () => {
    mockAsyncFunction.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('data'), 5000))
    );

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('前回のリクエストがキャンセルされる', async () => {
    let resolve1: Function;
    let resolve2: Function;
    
    mockAsyncFunction
      .mockImplementationOnce(() => new Promise(resolve => { resolve1 = resolve; }))
      .mockImplementationOnce(() => new Promise(resolve => { resolve2 = resolve; }));

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    // 最初のリクエスト
    act(() => {
      result.current.execute();
    });

    // 2番目のリクエスト（最初のリクエストをキャンセルするはず）
    act(() => {
      result.current.execute();
    });

    // 最初のリクエストを完了させても状態は変わらない
    act(() => {
      resolve1('first');
    });

    // 2番目のリクエストを完了
    act(() => {
      resolve2('second');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe('second');
  });

  it('AbortController がサポートされていない環境でも動作する', async () => {
    // AbortController を一時的に削除
    const originalAbortController = global.AbortController;
    (global as any).AbortController = undefined;

    const testData = { test: 'data' };
    mockAsyncFunction.mockResolvedValue(testData);

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    await act(async () => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(testData);

    // AbortController を復元
    global.AbortController = originalAbortController;
  });
});

describe('useAsyncOperationGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const operation = result.current.getOperation('test');
    expect(operation.data).toBe(null);
    expect(operation.isLoading).toBe(false);
    expect(operation.error).toBe(null);
    expect(operation.isSuccess).toBe(false);
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.hasAnyError).toBe(false);
  });

  it('操作の実行と状態管理が正しく動作する', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction = jest.fn().mockResolvedValue('success');

    act(() => {
      result.current.executeOperation('test', mockAsyncFunction);
    });

    // ローディング状態の確認
    expect(result.current.getOperation('test').isLoading).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.getOperation('test').isSuccess).toBe(true);
    });

    // 成功状態の確認
    const operation = result.current.getOperation('test');
    expect(operation.data).toBe('success');
    expect(operation.isLoading).toBe(false);
    expect(operation.error).toBe(null);
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('操作のエラーが正しく処理される', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const testError = new Error('Test error');
    const mockAsyncFunction = jest.fn().mockRejectedValue(testError);

    let thrownError;
    try {
      await act(async () => {
        await result.current.executeOperation('test', mockAsyncFunction);
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(testError);

    const operation = result.current.getOperation('test');
    expect(operation.error).toBe(testError);
    expect(operation.isLoading).toBe(false);
    expect(operation.isSuccess).toBe(false);
    expect(result.current.hasAnyError).toBe(true);
  });

  it('文字列エラーがErrorオブジェクトに変換される', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction = jest.fn().mockRejectedValue('String error');

    await act(async () => {
      try {
        await result.current.executeOperation('test', mockAsyncFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('String error');
      }
    });

    const operation = result.current.getOperation('test');
    expect(operation.error).toBeInstanceOf(Error);
    expect(operation.error?.message).toBe('String error');
  });

  it('複数の操作を並行して管理できる', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction1 = jest.fn().mockResolvedValue('result1');
    const mockAsyncFunction2 = jest.fn().mockResolvedValue('result2');

    act(() => {
      result.current.executeOperation('op1', mockAsyncFunction1);
      result.current.executeOperation('op2', mockAsyncFunction2);
    });

    // 両方ともローディング状態
    expect(result.current.getOperation('op1').isLoading).toBe(true);
    expect(result.current.getOperation('op2').isLoading).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.getOperation('op1').isSuccess).toBe(true);
      expect(result.current.getOperation('op2').isSuccess).toBe(true);
    });

    // 両方とも成功状態
    expect(result.current.getOperation('op1').data).toBe('result1');
    expect(result.current.getOperation('op2').data).toBe('result2');
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('個別操作のリセットが正しく動作する', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.executeOperation('test', mockAsyncFunction);
    });

    expect(result.current.getOperation('test').isSuccess).toBe(true);

    act(() => {
      result.current.resetOperation('test');
    });

    // デフォルト状態に戻る
    const operation = result.current.getOperation('test');
    expect(operation.data).toBe(null);
    expect(operation.isLoading).toBe(false);
    expect(operation.error).toBe(null);
    expect(operation.isSuccess).toBe(false);
  });

  it('全操作のリセットが正しく動作する', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.executeOperation('op1', mockAsyncFunction);
      await result.current.executeOperation('op2', mockAsyncFunction);
    });

    expect(result.current.getOperation('op1').isSuccess).toBe(true);
    expect(result.current.getOperation('op2').isSuccess).toBe(true);

    act(() => {
      result.current.resetAllOperations();
    });

    // 両方ともデフォルト状態に戻る
    expect(result.current.getOperation('op1').data).toBe(null);
    expect(result.current.getOperation('op2').data).toBe(null);
  });

  it('isAnyLoading が正しく計算される', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    let resolve1: Function;
    let resolve2: Function;

    const mockAsyncFunction1 = jest.fn(() => new Promise(resolve => { resolve1 = resolve; }));
    const mockAsyncFunction2 = jest.fn(() => new Promise(resolve => { resolve2 = resolve; }));

    act(() => {
      result.current.executeOperation('op1', mockAsyncFunction1);
      result.current.executeOperation('op2', mockAsyncFunction2);
    });

    expect(result.current.isAnyLoading).toBe(true);

    // op1を完了
    act(() => {
      resolve1('result1');
    });

    await waitFor(() => {
      expect(result.current.getOperation('op1').isSuccess).toBe(true);
    });

    // op2はまだローディング中なので、isAnyLoadingはtrue
    expect(result.current.isAnyLoading).toBe(true);

    // op2も完了
    act(() => {
      resolve2('result2');
    });

    await waitFor(() => {
      expect(result.current.getOperation('op2').isSuccess).toBe(true);
    });

    // 全て完了したのでisAnyLoadingはfalse
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('hasAnyError が正しく計算される', async () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const mockAsyncFunction1 = jest.fn().mockResolvedValue('success');
    const mockAsyncFunction2 = jest.fn().mockRejectedValue(new Error('error'));

    await act(async () => {
      await result.current.executeOperation('op1', mockAsyncFunction1);
    });

    expect(result.current.hasAnyError).toBe(false);

    await act(async () => {
      try {
        await result.current.executeOperation('op2', mockAsyncFunction2);
      } catch (e) {
        // エラーを無視
      }
    });

    expect(result.current.hasAnyError).toBe(true);
  });

  it('存在しない操作キーでもデフォルト値が返される', () => {
    const { result } = renderHook(() => useAsyncOperationGroup());

    const operation = result.current.getOperation('nonexistent');
    expect(operation.data).toBe(null);
    expect(operation.isLoading).toBe(false);
    expect(operation.error).toBe(null);
    expect(operation.isSuccess).toBe(false);
  });

  it('関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useAsyncOperationGroup());

    const getOperation1 = result.current.getOperation;
    const executeOperation1 = result.current.executeOperation;
    const resetOperation1 = result.current.resetOperation;
    const resetAllOperations1 = result.current.resetAllOperations;

    rerender();

    expect(result.current.getOperation).toBe(getOperation1);
    expect(result.current.executeOperation).toBe(executeOperation1);
    expect(result.current.resetOperation).toBe(resetOperation1);
    expect(result.current.resetAllOperations).toBe(resetAllOperations1);
  });
});