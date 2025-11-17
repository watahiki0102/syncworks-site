import { useState, useEffect, useCallback } from 'react';

/**
 * LocalStorageと状態を同期するカスタムフック
 * - JSON形式でシリアライズ/デシリアライズ
 * - SSR対応
 * - エラーハンドリング
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  // SSR対応：サーバーサイドでは初期値を使用
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 値を設定する関数
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // 関数の場合は現在の値を渡して実行
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  // 値を削除する関数
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // window.storageイベントを監視して他のタブでの変更を検知
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== localStorage) return;
      
      try {
        setStoredValue(e.newValue ? deserialize(e.newValue) : initialValue);
      } catch (error) {
        console.warn(`Error parsing localStorage change for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * セッションストレージ版
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * LocalStorageへの保存を手動で実行するカスタムフック
 * 保存成功/失敗を返す（エラーハンドリング強化版）
 */
export function useSaveToLocalStorage() {
  const saveToLocalStorage = <T>(key: string, value: T): { success: boolean; error?: string } => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return { success: true };
    } catch (error) {
      console.error(`LocalStorageへの保存に失敗しました (key: ${key}):`, error);

      // 容量オーバーの場合
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'ローカルストレージの容量が不足しています。\nブラウザのデータを削除するか、古いシフトデータを整理してください。'
        };
      }

      return {
        success: false,
        error: 'シフトの保存に失敗しました。再度お試しください。'
      };
    }
  };

  return saveToLocalStorage;
}