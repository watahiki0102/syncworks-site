/**
 * 統一された入力コンポーネント
 * - フォームバリデーション対応
 * - エラー状態表示
 * - アイコン対応
 * - ヘルプテキスト対応
 */
import React, { forwardRef, InputHTMLAttributes, useMemo } from 'react';

type InputVariant = 'default' | 'filled';
type InputSize = 'sm' | 'default' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className = '',
    label,
    error,
    helperText,
    variant = 'default',
    inputSize = 'default',
    leftIcon,
    rightIcon,
    fullWidth = true,
    required = false,
    id,
    ...props
  }, ref) => {
    const inputId = useMemo(() => id || `input-${Math.random().toString(36).substr(2, 9)}`, [id]);

    const getVariantClasses = (variant: InputVariant): string => {
      switch (variant) {
        case 'filled':
          return 'bg-gray-50 border-gray-200 focus:bg-white';
        default:
          return '';
      }
    };

    const getSizeClasses = (size: InputSize): string => {
      switch (size) {
        case 'sm':
          return 'py-2 px-3 text-sm';
        case 'lg':
          return 'py-4 px-5 text-base';
        default:
          return '';
      }
    };

    const inputClasses = useMemo(() => [
      'form-input',
      getVariantClasses(variant),
      getSizeClasses(inputSize),
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
      fullWidth && 'w-full',
      className
    ].filter(Boolean).join(' '), [variant, inputSize, leftIcon, rightIcon, error, fullWidth, className]);

    return (
      <div className={`form-group ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={`form-label ${required ? 'form-label-required' : ''}`}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <div className="form-error">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div className="form-help">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
export default Input; 