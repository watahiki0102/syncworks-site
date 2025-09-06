/**
 * 統一されたフォームフィールドコンポーネント
 * - バリデーション表示
 * - ラベルとエラー処理
 * - アクセシビリティ対応
 */
import React, { memo } from 'react';
import { Input, type InputProps } from './Input';

interface FormFieldProps extends Omit<InputProps, 'id' | 'aria-describedby' | 'aria-invalid'> {
  /** フィールド名（フォーム送信時のキー） */
  name: string;
  /** ラベル */
  label?: string;
  /** バリデーションエラーメッセージ */
  error?: string;
  /** フィールドがタッチされたかどうか */
  touched?: boolean;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** フィールドの説明文 */
  description?: string;
  /** ヘルプテキスト */
  helperText?: string;
  /** 追加のCSSクラス */
  className?: string;
  /** 子コンポーネント */
  children?: React.ReactNode;
}

/**
 * フォームフィールドコンポーネント
 * バリデーション状態の表示とアクセシビリティを統一管理
 */
export const FormField = memo<FormFieldProps>(({
  name,
  label,
  error,
  touched = false,
  required = false,
  description,
  helperText,
  className = '',
  children,
  ...inputProps
}) => {
  // エラー表示の条件: タッチされていて、かつエラーがある場合
  const shouldShowError = touched && error;
  
  // ヘルプテキストの優先順位: エラー > 説明文 > ヘルプテキスト
  const displayHelperText = shouldShowError ? error : description || helperText;

  // アクセシビリティ用のID生成
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`block text-sm font-medium text-gray-700 ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-1">
        {children}
        
        {displayHelperText && (
          <p 
            id={shouldShowError ? errorId : helpId}
            className={`text-sm ${shouldShowError ? 'text-red-600' : 'text-gray-500'}`}
            role={shouldShowError ? 'alert' : undefined}
          >
            {displayHelperText}
          </p>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;