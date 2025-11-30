/**
 * パフォーマンス最適化ユーティリティ
 * メモ化、デバウンス、スロットリングなどの機能を提供
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * デバウンス処理用カスタムフック
 * 指定された遅延時間内に複数回呼び出された場合、最後の呼び出しのみを実行
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * デバウンスされたコールバック関数を返すカスタムフック
 */
export const useDebouncedCallback = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * スロットリング処理用カスタムフック
 * 指定された間隔で最大1回まで関数を実行
 */
export const useThrottle = <T extends (...args: never[]) => unknown>(
  callback: T,
  limit: number
): T => {
  const inThrottle = useRef(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;

  return throttledCallback;
};

/**
 * 前の値を記憶するカスタムフック
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

/**
 * 深い等価性比較を行うメモ化フック
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);

  const isEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
    if (a.length !== b.length) {return false;}
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {return false;}
    }
    
    return true;
  };

  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }

  return ref.current.value;
};

/**
 * 深い等価性比較関数
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) {return true;}
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) {return false;}
    
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {return false;}
    
    for (const key of keys) {
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {return false;}
    }
    
    return true;
  }
  
  return false;
};

/**
 * 非同期操作の状態管理フック
 */
export const useAsyncState = <T, E = Error>(
  asyncFunction: () => Promise<T>
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: E | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as E });
    }
  }, [asyncFunction]);

  return { ...state, execute };
};

/**
 * ローカルストレージと同期するstate管理フック
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // 初期値を取得
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 値を設定する関数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

/**
 * 画面サイズの変更を監視するフック
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * 要素がビューポートに入っているかを判定するフック
 */
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {return;}

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

/**
 * キーボードショートカットを管理するフック
 */
export const useKeyboardShortcut = (
  shortcut: string,
  callback: () => void,
  options: { preventDefault?: boolean; enabled?: boolean } = {}
) => {
  const { preventDefault = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) {return;}

    const handleKeydown = (event: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+');
      const pressedKeys: string[] = [];

      if (event.ctrlKey) {pressedKeys.push('ctrl');}
      if (event.altKey) {pressedKeys.push('alt');}
      if (event.shiftKey) {pressedKeys.push('shift');}
      if (event.metaKey) {pressedKeys.push('meta');}
      
      // メタキー以外のキーを追加
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        pressedKeys.push(event.key.toLowerCase());
      }

      const isMatch = keys.every(key => pressedKeys.includes(key)) && 
                     keys.length === pressedKeys.length;

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [shortcut, callback, preventDefault, enabled]);
};

/**
 * クリップボードにコピーする機能を提供するフック
 */
export const useClipboard = (timeout: number = 2000) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), timeout);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), timeout);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  }, [timeout]);

  return { copyToClipboard, hasCopied };
};

/**
 * 指定された間隔でコールバックを実行するフック
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {return;}

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
};

const performanceHooks = {
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
};

export default performanceHooks;