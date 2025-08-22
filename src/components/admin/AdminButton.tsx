/**
 * 管理画面統一ボタンコンポーネント
 * - 統一されたデザインシステム
 * - バリアント対応
 * - サイズ対応
 * - ローディング状態
 * - アイコン対応
 */
import React, { ButtonHTMLAttributes } from 'react';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function AdminButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent focus:ring-gray-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white border-transparent focus:ring-orange-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300 focus:ring-gray-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2.5 py-1.5 text-xs';
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg border
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const renderIcon = () => {
    if (loading) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      );
    }
    if (icon) {
      return <span className="text-base">{icon}</span>;
    }
    return null;
  };

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* 左側アイコン */}
      {(loading || (icon && iconPosition === 'left')) && (
        <span className={children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}>
          {renderIcon()}
        </span>
      )}
      
      {/* テキスト */}
      {loading ? 'processing...' : children}
      
      {/* 右側アイコン */}
      {!loading && icon && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {renderIcon()}
        </span>
      )}
    </button>
  );
}