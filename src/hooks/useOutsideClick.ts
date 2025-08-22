/**
 * 要素外クリック検出用カスタムフック
 * ドロップダウンメニューやモーダルなどの外部クリック処理に使用
 */
import { useEffect, useRef, MutableRefObject } from 'react';

/**
 * 指定された要素の外側をクリックした時にコールバックを実行するフック
 */
export const useOutsideClick = <T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // ref.currentが存在し、クリックされた要素がref内に含まれていない場合
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
};

/**
 * 複数の要素の外側をクリックした時にコールバックを実行するフック
 */
export const useMultipleOutsideClick = <T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true,
  numberOfRefs: number = 1
): MutableRefObject<T | null>[] => {
  const refs = useRef<MutableRefObject<T | null>[]>([]);
  
  // refs配列を初期化
  if (refs.current.length !== numberOfRefs) {
    refs.current = Array.from({ length: numberOfRefs }, () => ({ current: null }));
  }

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // すべてのrefの外側をクリックした場合のみコールバックを実行
      const isOutsideAll = refs.current.every(ref => 
        !ref.current || !ref.current.contains(event.target as Node)
      );

      if (isOutsideAll) {
        callback();
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return refs.current;
};

/**
 * 条件付きで外部クリック検出を行うフック
 */
export const useConditionalOutsideClick = <T extends HTMLElement>(
  callback: () => void,
  condition: () => boolean,
  enabled: boolean = true
): MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // 条件を満たし、かつ外部クリックの場合にコールバックを実行
      if (condition() && ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, condition, enabled]);

  return ref;
};

export default useOutsideClick;