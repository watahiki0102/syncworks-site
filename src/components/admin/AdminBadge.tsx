/**
 * 管理画面統一バッジコンポーネント
 * - ステータス表示
 * - カウント表示
 * - 統一されたデザイン
 */
import React from 'react';

interface AdminBadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: string;
}

export default function AdminBadge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon
}: AdminBadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'info':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'default':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-0.5 text-sm';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-sm';
    }
  };

  const baseClasses = `
    inline-flex items-center
    font-medium rounded-full border
    transition-colors
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span className={baseClasses}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}