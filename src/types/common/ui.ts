/**
 * 共通UI要素の型定義
 * デザインシステムで使用される基本的な型
 */

// カラー系統の型定義
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ColorShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// サイズ系統の型定義
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Spacing = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32';

// アニメーション関連の型定義
export type AnimationDuration = 'fastest' | 'fast' | 'normal' | 'slow' | 'slowest';
export type AnimationType = 'fade-in' | 'fade-in-up' | 'slide-in-right' | 'bounce' | 'pulse';

// レスポンシブ関連の型定義
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ResponsiveValue<T> = T | { [K in Breakpoint]?: T };

// アクセシビリティ関連の型定義
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// 共通コンポーネントプロパティ
export interface BaseComponentProps extends AccessibilityProps {
  id?: string;
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

// フォーカス管理
export interface FocusableProps {
  autoFocus?: boolean;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// ローディング状態
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

// エラー状態
export interface ErrorProps {
  error?: string | null;
  hasError?: boolean;
} 