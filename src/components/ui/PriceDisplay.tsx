/**
 * 価格表示コンポーネント
 * 金額表示を統一化するための共通コンポーネント
 */
import React from 'react';

interface PriceDisplayProps {
  /** 表示する金額 */
  amount: number;
  /** 通貨（デフォルト: JPY） */
  currency?: 'JPY' | 'USD';
  /** 税込み表示するかどうか */
  showTax?: boolean;
  /** 税率（デフォルト: 0.1 = 10%） */
  taxRate?: number;
  /** 価格のサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 追加のCSSクラス */
  className?: string;
  /** 税抜き価格も表示するかどうか */
  showBreakdown?: boolean;
  /** 色のテーマ */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

/**
 * サイズ別のスタイル定義
 */
const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

/**
 * バリアント別のスタイル定義
 */
const variantStyles = {
  default: 'text-gray-900',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

/**
 * 金額をフォーマットする関数
 */
const formatCurrency = (amount: number, currency: 'JPY' | 'USD' = 'JPY'): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * 価格表示コンポーネント
 * 統一された形式で金額を表示し、税込み/税抜きの計算も自動で行う
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'JPY',
  showTax = false,
  taxRate = 0.1,
  size = 'md',
  className = '',
  showBreakdown = false,
  variant = 'default'
}) => {
  // 税込み金額の計算
  const taxAmount = Math.round(amount * taxRate);
  const totalAmount = amount + taxAmount;
  
  // 表示する金額を決定
  const displayAmount = showTax ? totalAmount : amount;
  
  const sizeClass = sizeStyles[size];
  const variantClass = variantStyles[variant];

  return (
    <div className={`${className}`}>
      <div className={`font-bold ${sizeClass} ${variantClass}`}>
        {formatCurrency(displayAmount, currency)}
        {showTax && (
          <span className="text-xs font-normal text-gray-600 ml-1">
            （税込）
          </span>
        )}
      </div>
      
      {showBreakdown && showTax && (
        <div className="text-xs text-gray-600 mt-1">
          <div>税抜: {formatCurrency(amount, currency)}</div>
          <div>消費税: {formatCurrency(taxAmount, currency)}</div>
        </div>
      )}
    </div>
  );
};

/**
 * 価格比較表示コンポーネント
 * 元の価格と割引後価格を比較表示
 */
export const PriceComparison: React.FC<{
  originalPrice: number;
  discountedPrice: number;
  currency?: 'JPY' | 'USD';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  originalPrice,
  discountedPrice,
  currency = 'JPY',
  size = 'md',
  className = ''
}) => {
  const discountAmount = originalPrice - discountedPrice;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 line-through text-sm">
          {formatCurrency(originalPrice, currency)}
        </span>
        <PriceDisplay 
          amount={discountedPrice} 
          currency={currency}
          size={size}
          variant="error"
        />
      </div>
      <div className="text-xs text-green-600 mt-1">
        {formatCurrency(discountAmount, currency)}お得 ({discountPercentage}%OFF)
      </div>
    </div>
  );
};

/**
 * 価格範囲表示コンポーネント
 * 最小価格から最大価格の範囲を表示
 */
export const PriceRange: React.FC<{
  minPrice: number;
  maxPrice: number;
  currency?: 'JPY' | 'USD';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  minPrice,
  maxPrice,
  currency = 'JPY',
  size = 'md',
  className = ''
}) => {
  const sizeClass = sizeStyles[size];
  
  return (
    <div className={`${sizeClass} font-bold text-gray-900 ${className}`}>
      {formatCurrency(minPrice, currency)} 〜 {formatCurrency(maxPrice, currency)}
    </div>
  );
};

export default PriceDisplay;