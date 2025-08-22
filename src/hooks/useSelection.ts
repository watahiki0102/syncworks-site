/**
 * 選択状態管理用カスタムフック
 * リストアイテムの選択、フィルタリングなどに使用
 */
import { useState, useCallback, useMemo } from 'react';

/**
 * 単一選択用フック
 */
export const useSelection = <T>(initialValue?: T) => {
  const [selectedItem, setSelectedItem] = useState<T | null>(initialValue || null);

  const selectItem = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selectedItem === item;
  }, [selectedItem]);

  return {
    selectedItem,
    selectItem,
    clearSelection,
    isSelected
  };
};

/**
 * 複数選択用フック
 */
export const useMultiSelection = <T>(initialValues?: T[]) => {
  const [selectedItems, setSelectedItems] = useState<Set<T>>(
    new Set(initialValues || [])
  );

  const selectItem = useCallback((item: T) => {
    setSelectedItems(prev => new Set(prev).add(item));
  }, []);

  const deselectItem = useCallback((item: T) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const toggleItem = useCallback((item: T) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback((item: T) => {
    return selectedItems.has(item);
  }, [selectedItems]);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectedArray = useMemo(() => {
    return Array.from(selectedItems);
  }, [selectedItems]);

  return {
    selectedItems: selectedArray,
    selectItem,
    deselectItem,
    toggleItem,
    isSelected,
    selectAll,
    clearSelection,
    selectedCount: selectedItems.size
  };
};

/**
 * フィルタ状態管理用フック
 */
export const useFilter = <T extends string>(
  initialFilter: T,
  validFilters: readonly T[]
) => {
  const [filter, setFilter] = useState<T>(initialFilter);

  const updateFilter = useCallback((newFilter: T) => {
    if (validFilters.includes(newFilter)) {
      setFilter(newFilter);
    }
  }, [validFilters]);

  const resetFilter = useCallback(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  return {
    filter,
    updateFilter,
    resetFilter
  };
};

export default useSelection;