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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'default':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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