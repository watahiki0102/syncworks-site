/**
 * 管理画面統一テーブルコンポーネント
 * - ソート機能
 * - ページネーション
 * - ローディング状態
 * - アクションボタン
 */
import React, { useState, ReactNode } from 'react';
import AdminButton from './AdminButton';
import AdminBadge from './AdminBadge';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  actions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
    show?: (row: T) => boolean;
  }[];
}

export default function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'データがありません',
  onRowClick,
  rowKey = 'id',
  pagination,
  actions
}: AdminTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] || index;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      
      let result = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else {
        result = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortField, sortDirection]);

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = row[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, row, index);
    }

    // デフォルトの値レンダリング
    if (typeof value === 'boolean') {
      return (
        <AdminBadge variant={value ? 'success' : 'danger'}>
          {value ? '有効' : '無効'}
        </AdminBadge>
      );
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    return String(value);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pageSize, total, onPageChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-gray-50 border-t gap-3">
        <div className="text-sm text-gray-700">
          {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} / {total}件
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
          >
            前へ
          </AdminButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + Math.max(1, page - 2);
            if (pageNum > totalPages) return null;
            
            return (
              <AdminButton
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
              >
                {pageNum}
              </AdminButton>
            );
          })}
          
          <AdminButton
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
          >
            次へ
          </AdminButton>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* ヘッダー */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key as string) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th scope="col" className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  操作
                </th>
              )}
            </tr>
          </thead>

          {/* ボディ */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-2 sm:px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' :
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                  
                  {/* アクション列 */}
                  {actions && actions.length > 0 && (
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => {
                          if (action.show && !action.show(row)) return null;
                          
                          return (
                            <AdminButton
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              icon={action.icon}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.label}
                            </AdminButton>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {renderPagination()}
    </div>
  );
}