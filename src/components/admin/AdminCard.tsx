/**
 * 管理画面統一カードコンポーネント
 * - 統一されたデザイン
 * - ローディング状態
 * - エラー状態
 * - アクションボタン
 */
import React, { ReactNode } from 'react';

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  loading?: boolean;
  error?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export default function AdminCard({
  title,
  subtitle,
  icon,
  children,
  className = '',
  headerActions,
  loading = false,
  error,
  padding = 'md',
  shadow = 'md'
}: AdminCardProps) {
  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-4';
      case 'md': return 'p-6';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  };

  const getShadowClass = () => {
    switch (shadow) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${getShadowClass()} ${className} transition-colors`}>
      {/* ヘッダー */}
      {(title || headerActions) && (
        <div className={`border-b border-gray-200 dark:border-gray-700 ${title ? 'p-6 pb-4' : 'p-4'}`}>
          <div className="flex items-center justify-between">
            {title && (
              <div className="flex items-center gap-3">
                {icon && <span className="text-xl">{icon}</span>}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
            )}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <div className={getPaddingClass()}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <span className="text-4xl mb-2 block">⚠️</span>
              <p className="text-red-600 dark:text-red-400 font-medium">エラーが発生しました</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}