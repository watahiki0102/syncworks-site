/**
 * 統一されたフォームフィールドコンポーネント
 * - バリデーション表示
 * - ラベルとエラー処理
 * - アクセシビリティ対応
 */
import React, { memo } from 'react';
import { Input, type InputProps } from './Input';

interface FormFieldProps extends Omit<InputProps, 'id'> {
  /** フィールド名（フォーム送信時のキー） */
  name: string;
  /** バリデーションエラーメッセージ */
  error?: string;
  /** フィールドがタッチされたかどうか */
  touched?: boolean;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** フィールドの説明文 */
  description?: string;
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
    <div className={`form-field ${className}`}>
      <Input
        id={fieldId}
        name={name}
        label={label}
        error={shouldShowError ? error : undefined}
        helperText={displayHelperText}
        required={required}
        aria-invalid={shouldShowError ? 'true' : 'false'}
        aria-describedby={
          displayHelperText ? (shouldShowError ? errorId : helpId) : undefined
        }
        {...inputProps}
      />
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;