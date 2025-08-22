/**
 * ステータスバッジコンポーネント
 * 各種ステータス表示の統一化のための共通コンポーネント
 */
import React from 'react';

// ステータスバッジのバリアント定義
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

// ステータスバッジのサイズ定義
export type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  /** 表示するステータステキスト */
  children: React.ReactNode;
  /** ステータスの種類（色を決定） */
  variant?: StatusVariant;
  /** バッジのサイズ */
  size?: StatusSize;
  /** 追加のCSSクラス */
  className?: string;
  /** アニメーション効果（点滅など） */
  animated?: boolean;
}

/**
 * バリアント別のスタイル定義
 */
const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
  pending: 'bg-orange-100 text-orange-800'
};

/**
 * サイズ別のスタイル定義
 */
const sizeStyles: Record<StatusSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
};

/**
 * ステータスバッジコンポーネント
 * アプリケーション全体で統一されたステータス表示を提供
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  animated = false
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const animationStyle = animated ? 'animate-pulse' : '';
  
  const combinedClassName = [
    baseStyles,
    variantStyle,
    sizeStyle,
    animationStyle,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};

/**
 * 一般的なステータス用の事前定義されたコンポーネント
 */
export const StatusBadges = {
  /** 成約済み */
  Contracted: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="success" className={className} {...props}>
      成約
    </StatusBadge>
  ),
  
  /** 未回答 */
  Unanswered: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="error" className={className} {...props}>
      未回答
    </StatusBadge>
  ),
  
  /** 回答済み */
  Answered: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="success" className={className} {...props}>
      回答済
    </StatusBadge>
  ),
  
  /** 見積中 */
  Estimating: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="warning" className={className} {...props}>
      見積中
    </StatusBadge>
  ),
  
  /** 完了 */
  Completed: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="info" className={className} {...props}>
      完了
    </StatusBadge>
  ),
  
  /** キャンセル */
  Cancelled: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="neutral" className={className} {...props}>
      キャンセル
    </StatusBadge>
  ),
  
  /** 失注 */
  Lost: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="error" className={className} {...props}>
      失注
    </StatusBadge>
  ),
  
  /** NEW表示 */
  New: ({ className = '', ...props }: Omit<StatusBadgeProps, 'variant' | 'children'>) => (
    <StatusBadge variant="error" className={className} animated {...props}>
      NEW
    </StatusBadge>
  )
};

export default StatusBadge;