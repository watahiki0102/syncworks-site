/**
 * 統一されたデータテーブルコンポーネント
 * - ソート機能
 * - ページネーション
 * - 行選択
 * - ローディング状態
 * - 空状態表示
 * - レスポンシブ対応
 */
import React, { memo, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from './Button';

export interface TableColumn<T> {
  /** カラムのキー */
  key: keyof T | string;
  /** 表示ラベル */
  label: string;
  /** ソート可能かどうか */
  sortable?: boolean;
  /** カラム幅 */
  width?: string | number;
  /** セルの描画関数 */
  render?: (value: any, item: T, index: number) => React.ReactNode;
  /** カラムの配置 */
  align?: 'left' | 'center' | 'right';
  /** カラムが固定されているか */
  sticky?: boolean;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  /** テーブルデータ */
  data: T[];
  /** カラム定義 */
  columns: TableColumn<T>[];
  
  /** ローディング状態 */
  loading?: boolean;
  /** 空状態のメッセージ */
  emptyMessage?: string;
  /** エラーメッセージ */
  error?: string;
  
  /** ソート設定 */
  sort?: TableSort;
  /** ソート変更時のコールバック */
  onSortChange?: (sort: TableSort) => void;
  
  /** 行選択機能 */
  selectable?: boolean;
  /** 選択された行のキー */
  selectedRows?: string[];
  /** 行選択変更時のコールバック */
  onSelectionChange?: (selectedRows: string[]) => void;
  /** 行のキーを取得する関数 */
  getRowKey?: (item: T, index: number) => string;
  
  /** 行クリック時のコールバック */
  onRowClick?: (item: T, index: number) => void;
  /** ホバー効果を有効にするか */
  hoverable?: boolean;
  
  /** ページネーション */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  
  /** コンパクト表示 */
  compact?: boolean;
  /** ストライプ表示 */
  striped?: boolean;
  /** ボーダー表示 */
  bordered?: boolean;
  
  /** 追加のクラス名 */
  className?: string;
}

/**
 * データテーブルコンポーネント
 */
export const DataTable = memo(<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'データがありません',
  error,
  sort,
  onSortChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowKey = (_, index) => index.toString(),
  onRowClick,
  hoverable = true,
  pagination,
  compact = false,
  striped = true,
  bordered = false,
  className = ''
}: DataTableProps<T>) => {
  // ソートアイコンの取得
  const getSortIcon = useCallback((columnKey: string) => {
    if (!sort || sort.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sort.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  }, [sort]);

  // ソート処理
  const handleSort = useCallback((columnKey: string) => {
    if (!onSortChange) {return;}
    
    const newDirection = sort?.key === columnKey && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: columnKey, direction: newDirection });
  }, [sort, onSortChange]);

  // 全選択の処理
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) {return;}
    
    const allRowKeys = data.map((item, index) => getRowKey(item, index));
    const isAllSelected = allRowKeys.every(key => selectedRows.includes(key));
    
    onSelectionChange(isAllSelected ? [] : allRowKeys);
  }, [data, selectedRows, onSelectionChange, getRowKey]);

  // 行選択の処理
  const handleRowSelect = useCallback((rowKey: string) => {
    if (!onSelectionChange) {return;}
    
    const newSelection = selectedRows.includes(rowKey)
      ? selectedRows.filter(key => key !== rowKey)
      : [...selectedRows, rowKey];
    
    onSelectionChange(newSelection);
  }, [selectedRows, onSelectionChange]);

  // 全選択状態の計算
  const selectAllState = useMemo(() => {
    if (data.length === 0) {return 'none';}
    
    const allRowKeys = data.map((item, index) => getRowKey(item, index));
    const selectedCount = allRowKeys.filter(key => selectedRows.includes(key)).length;
    
    if (selectedCount === 0) {return 'none';}
    if (selectedCount === allRowKeys.length) {return 'all';}
    return 'partial';
  }, [data, selectedRows, getRowKey]);

  // セルの値を取得
  const getCellValue = useCallback((item: T, column: TableColumn<T>) => {
    if (column.render) {
      const index = data.indexOf(item);
      return column.render(item[column.key as keyof T], item, index);
    }
    return item[column.key as keyof T];
  }, [data]);

  // テーブルクラスの生成
  const tableClasses = useMemo(() => [
    'data-table',
    compact && 'data-table--compact',
    striped && 'data-table--striped',
    bordered && 'data-table--bordered',
    hoverable && 'data-table--hoverable',
    className
  ].filter(Boolean).join(' '), [compact, striped, bordered, hoverable, className]);

  // エラー状態
  if (error) {
    return (
      <div className="data-table-error">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${tableClasses}`}>
          {/* ヘッダー */}
          <thead className="bg-gray-50">
            <tr>
              {/* 選択チェックボックスカラム */}
              {selectable && (
                <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectAllState === 'all'}
                    ref={input => {
                      if (input) {input.indeterminate = selectAllState === 'partial';}
                    }}
                    onChange={handleSelectAll}
                    aria-label="全て選択"
                  />
                </th>
              )}
              
              {/* データカラム */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align ? `text-${column.align}` : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(String(column.key))}
                      className="data-table__sort-button"
                      aria-label={`${column.label}でソート`}
                    >
                      {column.label}
                      {getSortIcon(String(column.key))}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* ボディ */}
          <tbody className="data-table__body">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-2 sm:px-4 py-8 text-center text-gray-500"
                >
                  <div className="data-table__loading">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>読み込み中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-2 sm:px-4 py-8 text-center text-gray-500"
                >
                  <div className="data-table__empty">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKey = getRowKey(item, index);
                const isSelected = selectedRows.includes(rowKey);
                
                return (
                  <tr
                    key={rowKey}
                    className={`data-table__row ${
                      isSelected ? 'data-table__row--selected' : ''
                    } ${
                      onRowClick ? 'data-table__row--clickable' : ''
                    }`}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {/* 選択チェックボックス */}
                    {selectable && (
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(rowKey)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`行を選択`}
                        />
                      </td>
                    )}
                    
                    {/* データセル */}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.align ? `text-${column.align}` : ''
                        } ${
                          column.sticky ? 'sticky' : ''
                        }`}
                      >
                        {getCellValue(item, column)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 border-t gap-3">
          <div className="text-sm text-gray-700">
            {pagination.totalItems > 0 && (
              <span>
                {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} / {' '}
                {pagination.totalItems}件
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              前へ
            </Button>
            
            <span className="text-sm text-gray-700 px-2">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;