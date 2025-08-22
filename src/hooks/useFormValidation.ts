/**
 * フォームバリデーション用カスタムフック
 * フォームの状態管理とバリデーションを統一化
 */
import { useState, useCallback, useMemo } from 'react';
import { ValidationRule, validateField, validateForm } from '@/utils/validation';

// フォームフィールドの型定義
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched?: boolean;
}

// フォーム状態の型定義
export type FormState<T extends Record<string, unknown>> = {
  [K in keyof T]: FormField<T[K]>;
};

// バリデーションスキーマの型定義
export type ValidationSchema<T extends Record<string, unknown>> = Partial<{
  [K in keyof T]: ValidationRule<T[K]>[];
}>;

// フォームフックの戻り値型定義
export interface UseFormValidationReturn<T extends Record<string, unknown>> {
  /** フォームの状態 */
  formState: FormState<T>;
  /** フォームデータ（値のみ） */
  formData: T;
  /** フォームが有効かどうか */
  isValid: boolean;
  /** 送信中かどうか */
  isSubmitting: boolean;
  /** バリデーションエラーがあるかどうか */
  hasErrors: boolean;
  /** フィールド値を更新 */
  updateField: (field: keyof T, value: T[keyof T]) => void;
  /** フィールドをタッチ状態にする */
  touchField: (field: keyof T) => void;
  /** 全フィールドをタッチ状態にする */
  touchAllFields: () => void;
  /** フィールドのエラーをクリア */
  clearFieldError: (field: keyof T) => void;
  /** 全エラーをクリア */
  clearAllErrors: () => void;
  /** フォームをリセット */
  resetForm: () => void;
  /** フォームバリデーションを実行 */
  validateForm: () => boolean;
  /** 特定フィールドのバリデーションを実行 */
  validateField: (field: keyof T) => boolean;
  /** フォーム送信ハンドラー */
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => Promise<void>;
}

/**
 * フォームバリデーション用カスタムフック
 */
export const useFormValidation = <T extends Record<string, unknown>>(
  initialData: T,
  validationSchema: ValidationSchema<T> = {}
): UseFormValidationReturn<T> => {
  // 初期フォーム状態を作成
  const createInitialState = useCallback((): FormState<T> => {
    const state = {} as FormState<T>;
    for (const key in initialData) {
      state[key] = {
        value: initialData[key],
        error: undefined,
        touched: false
      };
    }
    return state;
  }, [initialData]);

  const [formState, setFormState] = useState<FormState<T>>(createInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォームデータ（値のみ）を取得
  const formData = useMemo(() => {
    const data = {} as T;
    for (const key in formState) {
      data[key] = formState[key].value;
    }
    return data;
  }, [formState]);

  // フォームが有効かどうかを判定
  const isValid = useMemo(() => {
    return Object.values(formState).every(field => !field.error);
  }, [formState]);

  // エラーがあるかどうかを判定
  const hasErrors = useMemo(() => {
    return Object.values(formState).some(field => field.error);
  }, [formState]);

  // フィールド値を更新
  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: undefined // 値更新時にエラーをクリア
      }
    }));
  }, []);

  // フィールドをタッチ状態にする
  const touchField = useCallback((field: keyof T) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true
      }
    }));
  }, []);

  // 全フィールドをタッチ状態にする
  const touchAllFields = useCallback(() => {
    setFormState(prev => {
      const newState = { ...prev };
      for (const key in newState) {
        newState[key] = {
          ...newState[key],
          touched: true
        };
      }
      return newState;
    });
  }, []);

  // フィールドのエラーをクリア
  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: undefined
      }
    }));
  }, []);

  // 全エラーをクリア
  const clearAllErrors = useCallback(() => {
    setFormState(prev => {
      const newState = { ...prev };
      for (const key in newState) {
        newState[key] = {
          ...newState[key],
          error: undefined
        };
      }
      return newState;
    });
  }, []);

  // フォームをリセット
  const resetForm = useCallback(() => {
    setFormState(createInitialState());
    setIsSubmitting(false);
  }, [createInitialState]);

  // 特定フィールドのバリデーションを実行
  const validateFieldFn = useCallback((field: keyof T): boolean => {
    const rules = validationSchema[field];
    if (!rules) return true;

    const result = validateField(formState[field].value, rules);
    
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: result.message,
        touched: true
      }
    }));

    return result.isValid;
  }, [formState, validationSchema]);

  // フォーム全体のバリデーションを実行
  const validateFormFn = useCallback((): boolean => {
    const result = validateForm(formData, validationSchema as Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>);
    
    setFormState(prev => {
      const newState = { ...prev };
      
      // 全フィールドをタッチ状態にする
      for (const key in newState) {
        newState[key] = {
          ...newState[key],
          touched: true,
          error: result.errors[key] || undefined
        };
      }
      
      return newState;
    });

    return result.isValid;
  }, [formData, validationSchema]);

  // フォーム送信ハンドラー
  const handleSubmit = useCallback(async (onSubmit: (data: T) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    try {
      // バリデーション実行
      const isFormValid = validateFormFn();
      
      if (isFormValid) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('フォーム送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateFormFn]);

  return {
    formState,
    formData,
    isValid,
    isSubmitting,
    hasErrors,
    updateField,
    touchField,
    touchAllFields,
    clearFieldError,
    clearAllErrors,
    resetForm,
    validateForm: validateFormFn,
    validateField: validateFieldFn,
    handleSubmit
  };
};

/**
 * ローディング状態管理用カスタムフック
 */
export const useLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | undefined> => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('非同期処理エラー:', error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading
  };
};

/**
 * エラー状態管理用カスタムフック
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setError(message);
    console.error('エラーが発生しました:', error);
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

export default useFormValidation;