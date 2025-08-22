/**
 * フォーム入力コンポーネント群
 * 統一されたスタイルとバリデーション表示を提供
 */
import React from 'react';

// 基本的な入力フィールドのプロパティ
interface BaseInputProps {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルプテキスト */
  helpText?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** 無効化するかどうか */
  disabled?: boolean;
  /** 追加のCSSクラス */
  className?: string;
  /** ラベルのCSSクラス */
  labelClassName?: string;
  /** 入力フィールドのCSSクラス */
  inputClassName?: string;
}

// テキスト入力フィールドのプロパティ
interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  id?: string;
}

// 数値入力フィールドのプロパティ
interface NumberInputProps extends BaseInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
}

// テキストエリアのプロパティ
interface TextAreaProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  id?: string;
}

// セレクトボックスのプロパティ
interface SelectProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  id?: string;
}

// チェックボックスのプロパティ
interface CheckboxProps extends BaseInputProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

// ラジオボタンのプロパティ
interface RadioProps extends BaseInputProps {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  id?: string;
}

/**
 * 基本的なフィールドラッパーコンポーネント
 */
const FieldWrapper: React.FC<{
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
  htmlFor?: string;
}> = ({
  label,
  error,
  helpText,
  required,
  className = '',
  labelClassName = '',
  children,
  htmlFor
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * テキスト入力フィールド
 */
export const TextInput: React.FC<TextInputProps> = ({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  disabled,
  error,
  id,
  inputClassName = '',
  ...fieldProps
}) => {
  const baseInputClass = `
    block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `;

  return (
    <FieldWrapper {...fieldProps} error={error} htmlFor={id}>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        disabled={disabled}
        className={baseInputClass}
      />
    </FieldWrapper>
  );
};

/**
 * 数値入力フィールド
 */
export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  step,
  disabled,
  error,
  id,
  inputClassName = '',
  ...fieldProps
}) => {
  const baseInputClass = `
    block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `;

  return (
    <FieldWrapper {...fieldProps} error={error} htmlFor={id}>
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? '' : Number(val));
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={baseInputClass}
      />
    </FieldWrapper>
  );
};

/**
 * テキストエリア
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  cols,
  maxLength,
  disabled,
  error,
  id,
  inputClassName = '',
  ...fieldProps
}) => {
  const baseInputClass = `
    block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-vertical
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `;

  return (
    <FieldWrapper {...fieldProps} error={error} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        disabled={disabled}
        className={baseInputClass}
      />
    </FieldWrapper>
  );
};

/**
 * セレクトボックス
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  disabled,
  error,
  id,
  inputClassName = '',
  ...fieldProps
}) => {
  const baseInputClass = `
    block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `;

  return (
    <FieldWrapper {...fieldProps} error={error} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={baseInputClass}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

/**
 * チェックボックス
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  error,
  helpText,
  disabled,
  id,
  className = '',
  inputClassName = ''
}) => {
  const baseInputClass = `
    h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-red-300' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={baseInputClass}
        />
        {label && (
          <label
            htmlFor={id}
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * ラジオボタン
 */
export const Radio: React.FC<RadioProps> = ({
  value,
  selectedValue,
  onChange,
  options,
  disabled,
  error,
  id,
  inputClassName = '',
  ...fieldProps
}) => {
  const baseInputClass = `
    h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-red-300' : ''}
    ${inputClassName}
  `;

  return (
    <FieldWrapper {...fieldProps} error={error}>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${id}-${index}`}
              name={id}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || option.disabled}
              className={baseInputClass}
            />
            <label
              htmlFor={`${id}-${index}`}
              className="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FieldWrapper>
  );
};

/**
 * 日付入力フィールド
 */
export const DateInput: React.FC<Omit<TextInputProps, 'type'>> = (props) => {
  return <TextInput {...props} type="text" />;
};

export default {
  TextInput,
  NumberInput,
  TextArea,
  Select,
  Checkbox,
  Radio,
  DateInput
};