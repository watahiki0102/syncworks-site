/**
 * 共通スタイリングユーティリティ
 * 一貫したUI表現のための共通関数
 */

/**
 * ステータスに応じたスタイルクラス
 */
export const getStatusStyle = (
  status: string,
  type: 'badge' | 'bg' | 'text' | 'border' = 'badge'
): string => {
  const statusMap: Record<string, Record<string, string>> = {
    // 一般的なステータス
    active: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    inactive: {
      badge: 'bg-red-100 text-red-800',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    },
    pending: {
      badge: 'bg-yellow-100 text-yellow-800',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    completed: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    cancelled: {
      badge: 'bg-gray-100 text-gray-800',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200'
    },
    // トラック関連
    available: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    maintenance: {
      badge: 'bg-yellow-100 text-yellow-800',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    // 契約関連
    confirmed: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    estimate: {
      badge: 'bg-orange-100 text-orange-800',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    // 案件関連
    unanswered: {
      badge: 'bg-gray-100 text-gray-800',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200'
    },
    answered: {
      badge: 'bg-blue-100 text-blue-800',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    contracted: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    lost: {
      badge: 'bg-red-100 text-red-800',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  };

  return statusMap[status]?.[type] || statusMap.pending[type];
};

/**
 * 優先度に応じたスタイルクラス
 */
export const getPriorityStyle = (
  priority: 'high' | 'medium' | 'low',
  type: 'badge' | 'bg' | 'text' | 'border' = 'badge'
): string => {
  const priorityMap: Record<string, Record<string, string>> = {
    high: {
      badge: 'bg-red-100 text-red-800',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    },
    medium: {
      badge: 'bg-yellow-100 text-yellow-800',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    low: {
      badge: 'bg-green-100 text-green-800',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    }
  };

  return priorityMap[priority][type];
};

/**
 * 作業タイプに応じたスタイルとアイコン
 */
export const getWorkTypeDisplay = (workType: string): {
  icon: string;
  label: string;
  color: string;
} => {
  const workTypeMap: Record<string, { icon: string; label: string; color: string }> = {
    loading: { icon: '📦', label: '積込', color: 'bg-blue-100 text-blue-800' },
    moving: { icon: '🚚', label: '移動', color: 'bg-green-100 text-green-800' },
    unloading: { icon: '📥', label: '積卸', color: 'bg-purple-100 text-purple-800' },
    maintenance: { icon: '🔧', label: '整備', color: 'bg-orange-100 text-orange-800' },
    break: { icon: '☕', label: '休憩', color: 'bg-gray-100 text-gray-800' },
    other: { icon: '📝', label: 'その他', color: 'bg-gray-100 text-gray-800' }
  };

  return workTypeMap[workType] || workTypeMap.other;
};

/**
 * 数値に応じた色分け（稼働率など）
 */
export const getUtilizationColor = (rate: number): string => {
  if (rate < 30) return 'bg-green-100 text-green-800';
  if (rate < 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

/**
 * クラス名を条件付きで結合
 */
export const classNames = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 文字列をハッシュ値に変換して色を生成
 */
export const getHashColor = (str: string, alpha: number = 0.1): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsla(${hue}, 70%, 80%, ${alpha})`;
};

/**
 * 顧客名から一意の背景色を生成
 */
export const getCustomerColor = (customerName: string): string => {
  const colors = [
    '#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff',
    '#fed7aa', '#ccfbf1', '#fecaca', '#dbeafe', '#e0e7ff'
  ];
  
  const hash = customerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * レスポンシブ対応のパディング・マージンクラス
 */
export const getResponsivePadding = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizeMap = {
    sm: 'px-2 sm:px-4 lg:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };
  return sizeMap[size];
};

/**
 * レスポンシブ対応のテキストサイズクラス
 */
export const getResponsiveText = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizeMap = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl lg:text-2xl'
  };
  return sizeMap[size];
};

/**
 * ボタンの基本スタイル
 */
export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return classNames(baseClasses, variantClasses[variant], sizeClasses[size]);
};

const styleUtils = {
  getStatusStyle,
  getPriorityStyle,
  getWorkTypeDisplay,
  getUtilizationColor,
  classNames,
  getHashColor,
  getCustomerColor,
  getResponsivePadding,
  getResponsiveText,
  getButtonStyle
};

export default styleUtils;