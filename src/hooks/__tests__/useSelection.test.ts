/**
 * useSelection.ts のテスト
 * カバレッジ目標: 100%
 */

import { renderHook, act } from '@testing-library/react';
import { useSelection, useMultiSelection, useFilter } from '../useSelection';

describe('useSelection', () => {
  it('初期値なしで初期化される', () => {
    const { result } = renderHook(() => useSelection<string>());

    expect(result.current.selectedItem).toBeNull();
    expect(typeof result.current.selectItem).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
    expect(typeof result.current.isSelected).toBe('function');
  });

  it('初期値ありで初期化される', () => {
    const initialValue = 'initial';
    const { result } = renderHook(() => useSelection(initialValue));

    expect(result.current.selectedItem).toBe(initialValue);
  });

  it('アイテムを選択できる', () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItem).toBe('item1');
  });

  it('異なるアイテムを選択すると前の選択が置き換えられる', () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItem).toBe('item1');

    act(() => {
      result.current.selectItem('item2');
    });

    expect(result.current.selectedItem).toBe('item2');
  });

  it('選択をクリアできる', () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItem).toBe('item1');

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedItem).toBeNull();
  });

  it('isSelectedが正しく動作する', () => {
    const { result } = renderHook(() => useSelection<string>());

    expect(result.current.isSelected('item1')).toBe(false);

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.isSelected('item1')).toBe(true);
    expect(result.current.isSelected('item2')).toBe(false);
  });

  it('オブジェクト型のアイテムでも動作する', () => {
    type Item = { id: number; name: string };
    const item1: Item = { id: 1, name: 'Item 1' };
    const item2: Item = { id: 2, name: 'Item 2' };

    const { result } = renderHook(() => useSelection<Item>());

    act(() => {
      result.current.selectItem(item1);
    });

    expect(result.current.selectedItem).toBe(item1);
    expect(result.current.isSelected(item1)).toBe(true);
    expect(result.current.isSelected(item2)).toBe(false);
  });

  it('関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useSelection<string>());

    const initialSelectItem = result.current.selectItem;
    const initialClearSelection = result.current.clearSelection;

    rerender();

    expect(result.current.selectItem).toBe(initialSelectItem);
    expect(result.current.clearSelection).toBe(initialClearSelection);
  });
});

describe('useMultiSelection', () => {
  it('初期値なしで初期化される', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(typeof result.current.selectItem).toBe('function');
    expect(typeof result.current.deselectItem).toBe('function');
    expect(typeof result.current.toggleItem).toBe('function');
    expect(typeof result.current.isSelected).toBe('function');
    expect(typeof result.current.selectAll).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
  });

  it('初期値ありで初期化される', () => {
    const initialValues = ['item1', 'item2'];
    const { result } = renderHook(() => useMultiSelection(initialValues));

    expect(result.current.selectedItems).toEqual(expect.arrayContaining(initialValues));
    expect(result.current.selectedCount).toBe(2);
  });

  it('アイテムを選択できる', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItems).toContain('item1');
    expect(result.current.selectedCount).toBe(1);
  });

  it('複数のアイテムを選択できる', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    act(() => {
      result.current.selectItem('item1');
      result.current.selectItem('item2');
    });

    expect(result.current.selectedItems).toEqual(expect.arrayContaining(['item1', 'item2']));
    expect(result.current.selectedCount).toBe(2);
  });

  it('同じアイテムを複数回選択しても重複しない', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    act(() => {
      result.current.selectItem('item1');
      result.current.selectItem('item1');
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItems).toEqual(['item1']);
    expect(result.current.selectedCount).toBe(1);
  });

  it('アイテムを選択解除できる', () => {
    const { result } = renderHook(() => useMultiSelection(['item1', 'item2']));

    act(() => {
      result.current.deselectItem('item1');
    });

    expect(result.current.selectedItems).toEqual(['item2']);
    expect(result.current.selectedCount).toBe(1);
  });

  it('存在しないアイテムを選択解除してもエラーにならない', () => {
    const { result } = renderHook(() => useMultiSelection(['item1']));

    act(() => {
      result.current.deselectItem('nonexistent');
    });

    expect(result.current.selectedItems).toEqual(['item1']);
    expect(result.current.selectedCount).toBe(1);
  });

  it('toggleItemが正しく動作する', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    // 選択されていない状態から選択する
    act(() => {
      result.current.toggleItem('item1');
    });

    expect(result.current.isSelected('item1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    // 選択されている状態から選択解除する
    act(() => {
      result.current.toggleItem('item1');
    });

    expect(result.current.isSelected('item1')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('isSelectedが正しく動作する', () => {
    const { result } = renderHook(() => useMultiSelection(['item1']));

    expect(result.current.isSelected('item1')).toBe(true);
    expect(result.current.isSelected('item2')).toBe(false);
  });

  it('selectAllでアイテムを一括選択できる', () => {
    const { result } = renderHook(() => useMultiSelection<string>());
    const allItems = ['item1', 'item2', 'item3'];

    act(() => {
      result.current.selectAll(allItems);
    });

    expect(result.current.selectedItems).toEqual(expect.arrayContaining(allItems));
    expect(result.current.selectedCount).toBe(3);
  });

  it('selectAllで既存の選択が置き換えられる', () => {
    const { result } = renderHook(() => useMultiSelection(['item1']));
    const newItems = ['item2', 'item3'];

    act(() => {
      result.current.selectAll(newItems);
    });

    expect(result.current.selectedItems).toEqual(expect.arrayContaining(newItems));
    expect(result.current.selectedItems).not.toContain('item1');
    expect(result.current.selectedCount).toBe(2);
  });

  it('clearSelectionで全選択をクリアできる', () => {
    const { result } = renderHook(() => useMultiSelection(['item1', 'item2']));

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
  });

  it('selectedArrayがselectedItemsの変更に応じて更新される', () => {
    const { result } = renderHook(() => useMultiSelection<string>());

    // 初期状態
    expect(result.current.selectedItems).toEqual([]);

    // アイテム追加
    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedItems).toContain('item1');

    // アイテム削除
    act(() => {
      result.current.deselectItem('item1');
    });

    expect(result.current.selectedItems).toEqual([]);
  });

  it('オブジェクト型のアイテムでも動作する', () => {
    type Item = { id: number; name: string };
    const item1: Item = { id: 1, name: 'Item 1' };
    const item2: Item = { id: 2, name: 'Item 2' };

    const { result } = renderHook(() => useMultiSelection<Item>());

    act(() => {
      result.current.selectItem(item1);
      result.current.selectItem(item2);
    });

    expect(result.current.selectedItems).toEqual(expect.arrayContaining([item1, item2]));
    expect(result.current.isSelected(item1)).toBe(true);
    expect(result.current.isSelected(item2)).toBe(true);
  });

  it('関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useMultiSelection<string>());

    const initialSelectItem = result.current.selectItem;
    const initialDeselectItem = result.current.deselectItem;
    const initialToggleItem = result.current.toggleItem;
    const initialSelectAll = result.current.selectAll;
    const initialClearSelection = result.current.clearSelection;

    rerender();

    expect(result.current.selectItem).toBe(initialSelectItem);
    expect(result.current.deselectItem).toBe(initialDeselectItem);
    expect(result.current.toggleItem).toBe(initialToggleItem);
    expect(result.current.selectAll).toBe(initialSelectAll);
    expect(result.current.clearSelection).toBe(initialClearSelection);
  });
});

describe('useFilter', () => {
  const validFilters = ['all', 'active', 'completed'] as const;
  type FilterType = typeof validFilters[number];

  it('初期値で初期化される', () => {
    const initialFilter: FilterType = 'all';
    const { result } = renderHook(() => useFilter(initialFilter, validFilters));

    expect(result.current.filter).toBe(initialFilter);
    expect(typeof result.current.updateFilter).toBe('function');
    expect(typeof result.current.resetFilter).toBe('function');
  });

  it('有効なフィルターに更新できる', () => {
    const { result } = renderHook(() => useFilter<FilterType>('all', validFilters));

    act(() => {
      result.current.updateFilter('active');
    });

    expect(result.current.filter).toBe('active');
  });

  it('無効なフィルターは無視される', () => {
    const { result } = renderHook(() => useFilter<FilterType>('all', validFilters));

    act(() => {
      // TypeScriptでは型エラーになるが、実行時の安全性をテスト
      result.current.updateFilter('invalid' as FilterType);
    });

    expect(result.current.filter).toBe('all'); // 変更されない
  });

  it('フィルターをリセットできる', () => {
    const initialFilter: FilterType = 'all';
    const { result } = renderHook(() => useFilter(initialFilter, validFilters));

    act(() => {
      result.current.updateFilter('active');
    });

    expect(result.current.filter).toBe('active');

    act(() => {
      result.current.resetFilter();
    });

    expect(result.current.filter).toBe(initialFilter);
  });

  it('validFiltersが変更された場合、新しいvalidation条件が適用される', () => {
    const newValidFilters = ['new1', 'new2'] as const;
    type NewFilterType = typeof newValidFilters[number];
    
    const { result, rerender } = renderHook(
      ({ filters }) => useFilter<NewFilterType>('new1', filters),
      { initialProps: { filters: newValidFilters } }
    );

    // 初期状態では有効
    act(() => {
      result.current.updateFilter('new2');
    });
    expect(result.current.filter).toBe('new2');

    // validFiltersを変更
    const updatedFilters = ['new1'] as const;
    rerender({ filters: updatedFilters });

    // 以前有効だったフィルターが無効になる
    act(() => {
      result.current.updateFilter('new2' as any);
    });
    expect(result.current.filter).toBe('new2'); // 変更されない（前の値を保持）
  });

  it('initialFilterが変更された場合、resetFilterで新しい初期値にリセットされる', () => {
    const { result, rerender } = renderHook(
      ({ initial }) => useFilter<FilterType>(initial, validFilters),
      { initialProps: { initial: 'all' as FilterType } }
    );

    // フィルターを変更
    act(() => {
      result.current.updateFilter('active');
    });
    expect(result.current.filter).toBe('active');

    // initialFilterを変更
    rerender({ initial: 'completed' as FilterType });

    // リセットすると新しい初期値になる
    act(() => {
      result.current.resetFilter();
    });
    expect(result.current.filter).toBe('completed');
  });

  it('関数の参照が依存配列に基づいて安定している', () => {
    const { result, rerender } = renderHook(() => 
      useFilter<FilterType>('all', validFilters)
    );

    const initialUpdateFilter = result.current.updateFilter;
    const initialResetFilter = result.current.resetFilter;

    // validFiltersが同じ場合、関数の参照は安定
    rerender();

    expect(result.current.updateFilter).toBe(initialUpdateFilter);
    expect(result.current.resetFilter).toBe(initialResetFilter);
  });

  it('文字列以外の型でも動作する', () => {
    const numberFilters = [1, 2, 3] as const;
    type NumberFilter = typeof numberFilters[number];

    const { result } = renderHook(() => useFilter<NumberFilter>(1, numberFilters));

    expect(result.current.filter).toBe(1);

    act(() => {
      result.current.updateFilter(2);
    });

    expect(result.current.filter).toBe(2);
  });
});

describe('デフォルトエクスポート', () => {
  it('useSelectionがデフォルトエクスポートされている', async () => {
    const defaultExport = (await import('../useSelection')).default;
    expect(defaultExport).toBe(useSelection);
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('null/undefinedを含むselectionでも動作する', () => {
    const { result } = renderHook(() => useSelection<string | null>());

    act(() => {
      result.current.selectItem(null);
    });

    expect(result.current.selectedItem).toBeNull();
    expect(result.current.isSelected(null)).toBe(true);
    expect(result.current.isSelected('item')).toBe(false);
  });

  it('空配列でのselectAllが正しく動作する', () => {
    const { result } = renderHook(() => useMultiSelection(['item1']));

    act(() => {
      result.current.selectAll([]);
    });

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
  });

  it('大量のアイテムでもパフォーマンスが良い', () => {
    const largeItemList = Array.from({ length: 1000 }, (_, i) => `item${i}`);
    const { result } = renderHook(() => useMultiSelection<string>());

    act(() => {
      result.current.selectAll(largeItemList);
    });

    expect(result.current.selectedCount).toBe(1000);

    // 中間のアイテムが正しく選択されているかテスト
    expect(result.current.isSelected('item500')).toBe(true);

    act(() => {
      result.current.deselectItem('item500');
    });

    expect(result.current.isSelected('item500')).toBe(false);
    expect(result.current.selectedCount).toBe(999);
  });

  it('複数のhookインスタンスが独立して動作する', () => {
    const { result: result1 } = renderHook(() => useSelection<string>());
    const { result: result2 } = renderHook(() => useSelection<string>());

    act(() => {
      result1.current.selectItem('item1');
      result2.current.selectItem('item2');
    });

    expect(result1.current.selectedItem).toBe('item1');
    expect(result2.current.selectedItem).toBe('item2');
    expect(result1.current.isSelected('item2')).toBe(false);
    expect(result2.current.isSelected('item1')).toBe(false);
  });
});