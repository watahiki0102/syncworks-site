/**
 * 統一されたボタンコンポーネント
 * - 複数のバリアント（primary, secondary, outline, ghost）
 * - サイズ対応（sm, default, lg）
 * - アクセシビリティ対応
 * - ローディング状態対応
 */
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'default' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'default',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    type = 'button',
    ...props
  }, ref) => {
    const getVariantClasses = (variant: ButtonVariant): string => {
      switch (variant) {
        case 'primary':
          return 'btn-primary';
        case 'secondary':
          return 'btn-secondary';
        case 'outline':
          return 'btn-outline';
        case 'ghost':
          return 'btn-ghost';
        case 'destructive':
          return 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700';
        default:
          return 'btn-primary';
      }
    };

    const getSizeClasses = (size: ButtonSize): string => {
      switch (size) {
        case 'sm':
          return 'btn-sm';
        case 'lg':
          return 'btn-lg';
        default:
          return '';
      }
    };

    const classes = [
      'btn',
      getVariantClasses(variant),
      getSizeClasses(size),
      fullWidth && 'w-full',
      isLoading && 'opacity-75 cursor-not-allowed',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!isLoading && leftIcon && leftIcon}
        <span className={isLoading || leftIcon || rightIcon ? 'mx-1' : ''}>
          {children}
        </span>
        {!isLoading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
export default Button; 