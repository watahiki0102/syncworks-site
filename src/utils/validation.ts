/**
 * バリデーション関数ユーティリティ
 * アプリケーション全体で使用する共通のバリデーション機能を提供
 */

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// バリデーション関数の型定義
export type ValidationRule<T = unknown> = (value: T) => ValidationResult;

/**
 * 基本的なバリデーション関数
 */
export const validators = {
  /**
   * 必須入力チェック
   */
  required: (message: string = '必須項目です'): ValidationRule<string> =>
    (value: string) => ({
      isValid: value !== null && value !== undefined && value.trim() !== '',
      message: value !== null && value !== undefined && value.trim() !== '' ? undefined : message
    }),

  /**
   * 最小文字数チェック
   */
  minLength: (min: number, message?: string): ValidationRule<string> => 
    (value: string) => ({
      isValid: value.length >= min,
      message: value.length >= min ? undefined : message || `${min}文字以上で入力してください`
    }),

  /**
   * 最大文字数チェック
   */
  maxLength: (max: number, message?: string): ValidationRule<string> => 
    (value: string) => ({
      isValid: value.length <= max,
      message: value.length <= max ? undefined : message || `${max}文字以下で入力してください`
    }),

  /**
   * メールアドレス形式チェック
   */
  email: (message: string = '正しいメールアドレスを入力してください'): ValidationRule<string> => 
    (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        message: emailRegex.test(value) ? undefined : message
      };
    },

  /**
   * 電話番号形式チェック（日本の電話番号）
   */
  phone: (message: string = '正しい電話番号を入力してください'): ValidationRule<string> => 
    (value: string) => {
      const phoneRegex = /^[0-9-+\s()]+$/;
      return {
        isValid: phoneRegex.test(value) && value.length >= 10,
        message: phoneRegex.test(value) && value.length >= 10 ? undefined : message
      };
    },

  /**
   * 郵便番号形式チェック（日本の郵便番号）
   */
  zipCode: (message: string = '正しい郵便番号を入力してください（例：123-4567）'): ValidationRule<string> => 
    (value: string) => {
      const zipRegex = /^\d{3}-\d{4}$/;
      return {
        isValid: zipRegex.test(value),
        message: zipRegex.test(value) ? undefined : message
      };
    },

  /**
   * 数値チェック
   */
  number: (message: string = '数値を入力してください'): ValidationRule<string | number> => 
    (value: string | number) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return {
        isValid: !isNaN(num) && isFinite(num),
        message: !isNaN(num) && isFinite(num) ? undefined : message
      };
    },

  /**
   * 最小値チェック
   */
  min: (min: number, message?: string): ValidationRule<number> => 
    (value: number) => ({
      isValid: value >= min,
      message: value >= min ? undefined : message || `${min}以上の値を入力してください`
    }),

  /**
   * 最大値チェック
   */
  max: (max: number, message?: string): ValidationRule<number> => 
    (value: number) => ({
      isValid: value <= max,
      message: value <= max ? undefined : message || `${max}以下の値を入力してください`
    }),

  /**
   * 日付形式チェック
   */
  date: (message: string = '正しい日付を入力してください'): ValidationRule<string> => 
    (value: string) => {
      const date = new Date(value);
      return {
        isValid: !isNaN(date.getTime()),
        message: !isNaN(date.getTime()) ? undefined : message
      };
    },

  /**
   * 未来の日付チェック
   */
  futureDate: (message: string = '未来の日付を入力してください'): ValidationRule<string> => 
    (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return {
        isValid: date >= today,
        message: date >= today ? undefined : message
      };
    },

  /**
   * パスワード強度チェック
   */
  password: (message: string = 'パスワードは8文字以上で、大文字・小文字・数字を含んでください'): ValidationRule<string> => 
    (value: string) => {
      const hasLength = value.length >= 8;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const isValid = hasLength && hasUpper && hasLower && hasNumber;
      
      return {
        isValid,
        message: isValid ? undefined : message
      };
    },

  /**
   * カタカナチェック
   */
  katakana: (message: string = 'カタカナで入力してください'): ValidationRule<string> => 
    (value: string) => {
      const katakanaRegex = /^[ァ-ヶー\s]*$/;
      return {
        isValid: katakanaRegex.test(value),
        message: katakanaRegex.test(value) ? undefined : message
      };
    },

  /**
   * ひらがなチェック
   */
  hiragana: (message: string = 'ひらがなで入力してください'): ValidationRule<string> => 
    (value: string) => {
      const hiraganaRegex = /^[ぁ-ゖー\s]*$/;
      return {
        isValid: hiraganaRegex.test(value),
        message: hiraganaRegex.test(value) ? undefined : message
      };
    }
};

/**
 * 複数のバリデーションルールを組み合わせて実行
 */
export const validateField = <T>(value: T, rules: ValidationRule<T>[]): ValidationResult => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * オブジェクト全体のバリデーション
 */
export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  schema: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema) as [keyof T, ValidationRule<T[keyof T]>[]][]) {
    const result = validateField(data[field], rules);
    if (!result.isValid) {
      errors[field] = result.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * よく使用される組み合わせバリデーション
 */
export const commonValidators = {
  /** 必須の顧客名 */
  customerName: [
    validators.required('顧客名は必須です'),
    validators.minLength(1, '顧客名を入力してください'),
    validators.maxLength(100, '顧客名は100文字以下で入力してください')
  ] as ValidationRule<string>[],

  /** 必須のメールアドレス */
  email: [
    validators.required('メールアドレスは必須です'),
    validators.email()
  ] as ValidationRule<string>[],

  /** オプションのメールアドレス */
  optionalEmail: [
    validators.email()
  ] as ValidationRule<string>[],

  /** 必須の電話番号 */
  phone: [
    validators.required('電話番号は必須です'),
    validators.phone()
  ] as ValidationRule<string>[],

  /** 必須の住所 */
  address: [
    validators.required('住所は必須です'),
    validators.minLength(5, '正しい住所を入力してください'),
    validators.maxLength(200, '住所は200文字以下で入力してください')
  ] as ValidationRule<string>[],

  /** 引越し日 */
  moveDate: [
    validators.required('引越し日は必須です'),
    validators.date(),
    validators.futureDate()
  ] as ValidationRule<string>[],

  /** ポイント数 */
  points: [
    validators.required('ポイントは必須です'),
    validators.number(),
    validators.min(1, '1ポイント以上を入力してください'),
    validators.max(1000, '1000ポイント以下を入力してください')
  ] as ValidationRule<string>[],

  /** 重量 */
  weight: [
    validators.required('重量は必須です'),
    validators.number(),
    validators.min(1, '1kg以上を入力してください'),
    validators.max(10000, '10000kg以下を入力してください')
  ] as ValidationRule<string>[]
};

export default validators;