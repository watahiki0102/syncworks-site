/**
 * ステータス表示用の共通コンポーネント
 * チェックボックスフィルターと一覧表示で共通使用
 */

import React from 'react';

export interface StatusBadgeProps {
  status: string;
  bgColor: string;
  textColor: string;
  label: string;
  className?: string;
}

/**
 * ステータスバッジコンポーネント
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  bgColor,
  textColor,
  label,
  className = ''
}) => {
  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;