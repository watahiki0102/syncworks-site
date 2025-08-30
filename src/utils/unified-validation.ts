/**
 * 統一バリデーションシステム
 * validation.ts と lib/validation.ts の機能を統合
 */

import type { UnifiedValidationResult, UnifiedValidationRule } from '@/types/unified';

// =============================================================================
// 基本バリデーター（統一版）
// =============================================================================

export const unifiedValidators = {
  /**
   * 必須チェック（統一版）
   */
  required: (message = '必須項目です'): UnifiedValidationRule<string> => 
    (value: string) => ({
      isValid: value != null && value.trim() !== '',
      errors: value != null && value.trim() !== '' ? [] : [message],
    }),

  /**
   * 文字数チェック（統一版）
   */
  length: (min?: number, max?: number, customMessage?: string): UnifiedValidationRule<string> => 
    (value: string) => {
      const errors: string[] = [];
      
      if (min !== undefined && value.length < min) {
        errors.push(customMessage || `${min}文字以上で入力してください`);
      }
      if (max !== undefined && value.length > max) {
        errors.push(customMessage || `${max}文字以下で入力してください`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
      };
    },

  /**
   * メールアドレス（統一版）
   */
  email: (message = '正しいメールアドレスを入力してください'): UnifiedValidationRule<string> => 
    (value: string) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return {
        isValid: emailRegex.test(value),
        errors: emailRegex.test(value) ? [] : [message],
      };
    },

  /**
   * 電話番号（統一版）
   */
  phone: (message = '正しい電話番号を入力してください'): UnifiedValidationRule<string> => 
    (value: string) => {
      // ハイフンあり/なし、括弧、スペース、プラス記号を許可
      const phoneRegex = /^[\d\-\+\(\)\s]+$/;
      const isValid = phoneRegex.test(value) && value.replace(/[\D]/g, '').length >= 10;
      return {
        isValid,
        errors: isValid ? [] : [message],
      };
    },

  /**
   * 郵便番号（統一版）
   */
  postalCode: (message = '正しい郵便番号を入力してください（例：123-4567）'): UnifiedValidationRule<string> => 
    (value: string) => {
      const postalRegex = /^\d{3}-\d{4}$/;
      return {
        isValid: postalRegex.test(value),
        errors: postalRegex.test(value) ? [] : [message],
      };
    },

  /**
   * 数値範囲チェック（統一版）
   */
  numberRange: (min?: number, max?: number, customMessage?: string): UnifiedValidationRule<number> => 
    (value: number) => {
      const errors: string[] = [];
      
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(customMessage || '数値を入力してください');
      } else {
        if (min !== undefined && value < min) {
          errors.push(customMessage || `${min}以上の値を入力してください`);
        }
        if (max !== undefined && value > max) {
          errors.push(customMessage || `${max}以下の値を入力してください`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
      };
    },
};

// =============================================================================
// 複合バリデーション関数
// =============================================================================

/**
 * 複数のバリデーションルールを適用（統一版）
 */
export const validateField = <T>(
  value: T,
  rules: UnifiedValidationRule<T>[]
): UnifiedValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  };
};

/**
 * オブジェクト全体のバリデーション（統一版）
 */
export const validateObject = <T extends Record<string, any>>(
  data: T,
  schema: Partial<Record<keyof T, UnifiedValidationRule<any>[]>>
): UnifiedValidationResult & { normalizedData: T } => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const normalizedData = { ...data };
  
  for (const [key, rules] of Object.entries(schema)) {
    if (rules && Array.isArray(rules)) {
      const fieldResult = validateField(data[key], rules);
      
      if (!fieldResult.isValid) {
        // フィールド名を含めたエラーメッセージ
        allErrors.push(...fieldResult.errors.map(error => `${key}: ${error}`));
      }
      
      if (fieldResult.warnings) {
        allWarnings.push(...fieldResult.warnings.map(warning => `${key}: ${warning}`));
      }
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    normalizedData,
  };
};

// =============================================================================
// 特定ドメイン用バリデーター
// =============================================================================

/**
 * 顧客データバリデーション（統一版）
 */
export const validateCustomerData = (customerData: {
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  postalCode?: string;
  address?: string;
}): UnifiedValidationResult & { normalizedData?: typeof customerData } => {
  return validateObject(customerData, {
    lastName: [unifiedValidators.required('姓は必須です')],
    firstName: [unifiedValidators.required('名は必須です')],
    email: [
      unifiedValidators.required('メールアドレスは必須です'),
      unifiedValidators.email()
    ],
    phone: customerData.phone ? [unifiedValidators.phone()] : [],
    postalCode: customerData.postalCode ? [unifiedValidators.postalCode()] : [],
    address: customerData.address ? [unifiedValidators.length(1, 200, '住所は200文字以内で入力してください')] : [],
  });
};

/**
 * 価格データバリデーション（統一版）
 */
export const validatePriceData = (priceData: {
  basePrice?: number;
  points?: number;
  distance?: number;
}): UnifiedValidationResult => {
  return validateObject(priceData, {
    basePrice: priceData.basePrice !== undefined ? 
      [unifiedValidators.numberRange(0, 1000000, '基本料金は0円以上100万円以下で入力してください')] : [],
    points: priceData.points !== undefined ?
      [unifiedValidators.numberRange(0, 9999, 'ポイントは0以上9999以下で入力してください')] : [],
    distance: priceData.distance !== undefined ?
      [unifiedValidators.numberRange(0, 1000, '距離は0km以上1000km以下で入力してください')] : [],
  });
};

// =============================================================================
// レガシー互換性関数
// =============================================================================

/**
 * 既存のvalidation.tsとの互換性を保つためのラッパー
 */
export const legacyValidationWrapper = {
  /**
   * 旧形式のValidationResult型への変換
   */
  toLegacyResult: (result: UnifiedValidationResult): { isValid: boolean; message?: string } => ({
    isValid: result.isValid,
    message: result.errors.length > 0 ? result.errors[0] : undefined,
  }),
};

/**
 * デバッグ用：バリデーション結果の詳細表示
 */
export const debugValidation = (result: UnifiedValidationResult, label = 'Validation') => {
  console.group(`🔍 ${label} Result`);
  console.log(`Valid: ${result.isValid ? '✅' : '❌'}`);
  if (result.errors.length > 0) {
    console.log('Errors:', result.errors);
  }
  if (result.warnings) {
    console.log('Warnings:', result.warnings);
  }
  console.groupEnd();
};