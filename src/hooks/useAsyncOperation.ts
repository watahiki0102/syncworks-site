/**
 * 非同期操作の状態管理用カスタムフック
 * ローディング状態、エラー処理、データキャッシュなどを統一管理
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export const useAsyncOperation = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const isMountedRef = useRef(true);

  const execute = useCallback(async (...args: any[]) => {
    // 前回のリクエストを適切にクリーンアップ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 既存のタイムアウトをクリア
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current.clear();

    // ブラウザ互換性の確実なチェック
    if (typeof window !== 'undefined' && 'AbortController' in window) {
      abortControllerRef.current = new AbortController();
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false
    }));

    const attemptExecution = async (attempt: number): Promise<void> => {
      try {
        const result = await asyncFunction(...args);
        
        // リクエストがキャンセルされていないかチェック
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setState({
          data: result,
          isLoading: false,
          error: null,
          isSuccess: true
        });

        onSuccess?.(result);
        retryCountRef.current = 0;
      } catch (error) {
        // リクエストがキャンセルされていないかチェック
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));

        // リトライ制限の確実な実装
        if (attempt < retryCount && retryCountRef.current < retryCount && isMountedRef.current) {
          retryCountRef.current = attempt + 1;
          const delay = Math.min(retryDelay * Math.pow(2, attempt), 10000); // 最大10秒
          const timeoutId = setTimeout(() => {
            timeoutIdsRef.current.delete(timeoutId);
            if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
              attemptExecution(attempt + 1);
            }
          }, delay);
          timeoutIdsRef.current.add(timeoutId);
        } else {
          setState({
            data: null,
            isLoading: false,
            error: errorObj,
            isSuccess: false
          });

          onError?.(errorObj);
          retryCountRef.current = 0;
        }
      }
    };

    await attemptExecution(0);
  }, [asyncFunction, onSuccess, onError, retryCount, retryDelay]);

  const reset = useCallback(() => {
    // AbortControllerのクリーンアップ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // タイムアウトのクリーンアップ
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current.clear();
    
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false
    });
    
    retryCountRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    // AbortControllerのクリーンアップ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // タイムアウトのクリーンアップ
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current.clear();
    
    setState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // AbortControllerのクリーンアップ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // タイムアウトのクリーンアップ
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
      timeoutIdsRef.current.clear();
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    retryCount: retryCountRef.current
  };
};

/**
 * 複数の非同期操作を管理するフック
 */
export const useAsyncOperationGroup = () => {
  const [operations, setOperations] = useState<Map<string, AsyncState<any>>>(new Map());

  const getOperation = useCallback((key: string) => {
    return operations.get(key) || {
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false
    };
  }, [operations]);

  const setOperationState = useCallback((key: string, state: Partial<AsyncState<any>>) => {
    setOperations(prev => {
      const next = new Map(prev);
      const current = next.get(key) || {
        data: null,
        isLoading: false,
        error: null,
        isSuccess: false
      };
      next.set(key, { ...current, ...state });
      return next;
    });
  }, []);

  const executeOperation = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>
  ) => {
    setOperationState(key, { isLoading: true, error: null, isSuccess: false });

    try {
      const result = await asyncFunction();
      setOperationState(key, {
        data: result,
        isLoading: false,
        isSuccess: true
      });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setOperationState(key, {
        isLoading: false,
        error: errorObj
      });
      throw errorObj;
    }
  }, [setOperationState]);

  const resetOperation = useCallback((key: string) => {
    setOperations(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const resetAllOperations = useCallback(() => {
    setOperations(new Map());
  }, []);

  const isAnyLoading = Array.from(operations.values()).some(op => op.isLoading);
  const hasAnyError = Array.from(operations.values()).some(op => op.error);

  return {
    getOperation,
    executeOperation,
    resetOperation,
    resetAllOperations,
    isAnyLoading,
    hasAnyError
  };
};

export default useAsyncOperation;