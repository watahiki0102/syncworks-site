/**
 * 統一されたバリデーションシステム
 * - Zodを使用した型安全なスキーマ定義
 * - 日本語エラーメッセージ
 * - カスタムバリデーター
 * - フォームバリデーション統合
 */
import { z } from 'zod';

// 日本語エラーメッセージは個別のスキーマで設定

// 共通のバリデーションパターン
export const commonValidations = {
  // 日本の郵便番号（XXX-XXXX形式）
  postalCode: z.string().regex(/^\d{3}-\d{4}$/, '郵便番号は XXX-XXXX の形式で入力してください'),
  
  // 日本の電話番号
  phoneNumber: z.string().regex(/^[\d\-\+\(\)\s]+$/, '正しい電話番号を入力してください').min(10, '正しい電話番号を入力してください'),
  
  // カタカナ
  katakana: z.string().regex(/^[ァ-ヶー\s]*$/, 'カタカナで入力してください'),
  
  // ひらがな
  hiragana: z.string().regex(/^[ぁ-ゖー\s]*$/, 'ひらがなで入力してください'),
  
  // 日本語名前
  japaneseName: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以下で入力してください'),
  
  // パスワード（8文字以上、大文字・小文字・数字を含む）
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[a-z]/, 'パスワードは小文字を含む必要があります')
    .regex(/[A-Z]/, 'パスワードは大文字を含む必要があります')
    .regex(/[0-9]/, 'パスワードは数字を含む必要があります'),
    
  // 日付（未来の日付）
  futureDate: z.string().refine((date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  }, '未来の日付を選択してください'),
  
  // URL
  url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  
  // 金額（正の数値）
  amount: z.number().positive('正の金額を入力してください').max(10000000, '金額が大きすぎます'),
};

// 引越しフォーム用のスキーマ
export const movingFormSchemas = {
  // 個人情報
  personalInfo: z.object({
    moveType: z.enum(['単身', '家族']),
    lastName: commonValidations.japaneseName,
    firstName: commonValidations.japaneseName,
    lastNameKana: commonValidations.katakana,
    firstNameKana: commonValidations.katakana,
    phone: commonValidations.phoneNumber,
    email: z.string().email('正しいメールアドレスを入力してください'),
  }),
  
  // 住所情報
  addressInfo: z.object({
    postalCode: commonValidations.postalCode,
    address: z.string().min(5, '住所を正しく入力してください').max(200, '住所は200文字以下で入力してください'),
    residenceType: z.enum([
      'アパート・マンション（エレベーター利用可）',
      'アパート・マンション（エレベーター利用不可）',
      '一軒家',
      'その他'
    ]),
    floor: z.string().min(1, '階数を入力してください'),
  }),
  
  // 引越し日時
  movingDateTime: z.object({
    moveDate: commonValidations.futureDate,
    timeSlot: z.enum([
      'none', 'early_morning', 'morning', 'afternoon', 
      'evening', 'night', 'not_early', 'not_night', 'daytime_only'
    ]),
  }),
};

// 業者登録フォーム用のスキーマ
export const businessRegistrationSchemas = {
  // 会社情報
  companyInfo: z.object({
    name: z.string().min(1, '会社名を入力してください').max(100, '会社名は100文字以下で入力してください'),
    licenseNo: z.string().min(5, '免許番号を入力してください'),
    repName: commonValidations.japaneseName,
    contactName: commonValidations.japaneseName,
    dept: z.string().max(50, '部署名は50文字以下で入力してください').optional(),
    tel: commonValidations.phoneNumber,
    email: z.string().email('正しいメールアドレスを入力してください'),
    address: z.string().min(10, '住所を正しく入力してください').max(200, '住所は200文字以下で入力してください'),
    websiteUrl: commonValidations.url,
    prefectures: z.array(z.string()).min(1, '対応エリアを1つ以上選択してください'),
  }),
  
  // 紹介情報
  referralInfo: z.object({
    kind: z.enum(['existing', 'individual', 'other']),
    name: z.string().min(1, '紹介者名を入力してください').max(100, '紹介者名は100文字以下で入力してください'),
    contact: z.string().min(1, '連絡先を入力してください').max(100, '連絡先は100文字以下で入力してください'),
    note: z.string().max(500, '備考は500文字以下で入力してください').optional(),
  }),
};

// ケース管理用のスキーマ
export const caseManagementSchemas = {
  // ケース基本情報
  caseCore: z.object({
    customerName: commonValidations.japaneseName,
    customerPhone: commonValidations.phoneNumber.optional(),
    sourceType: z.enum(['sync', 'suumo', 'other_agency', 'manual']).optional(),
    preferredDate: z.string().nullable(),
    confirmedDate: z.string().nullable(),
    arrivalAddress: z.string().min(5, '到着地を入力してください'),
    options: z.array(z.string()).optional(),
    priceTaxIncluded: z.number().positive('正の金額を入力してください').optional(),
  }),
  
  // 案件アサイン情報
  caseAssignment: z.object({
    truckId: z.string().nullable().optional(),
    truckName: z.string().nullable().optional(),
    assignedEmployees: z.array(z.object({
      id: z.string(),
      name: z.string(),
      role: z.string().optional(),
    })).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, '時刻は HH:MM 形式で入力してください'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, '時刻は HH:MM 形式で入力してください'),
    contractStatus: z.enum(['confirmed', 'estimate']),
  }),
};

// バリデーションヘルパー関数
export const validationHelpers = {
  /**
   * スキーマでデータを安全に検証
   */
  validateData: <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { _general: '予期しないエラーが発生しました' } };
    }
  },

  /**
   * 部分的なバリデーション（フィールド単位）
   */
  validateField: <T>(schema: z.ZodSchema<T>, fieldPath: string, value: unknown): string | null => {
    try {
      // 部分的なオブジェクトを作成してバリデーション
      const testObject = fieldPath.split('.').reduceRight((acc, key) => ({ [key]: acc }), value);
      schema.parse(testObject);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find(err => err.path.join('.') === fieldPath);
        return fieldError?.message || '入力内容を確認してください';
      }
      return '予期しないエラーが発生しました';
    }
  },

  /**
   * 非同期バリデーション（外部APIチェックなど）
   */
  validateAsync: async <T>(
    schema: z.ZodSchema<T>, 
    data: unknown,
    asyncValidators?: Array<(data: T) => Promise<string | null>>
  ): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> => {
    // まず同期バリデーションを実行
    const syncResult = validationHelpers.validateData(schema, data);
    if (!syncResult.success) {
      return syncResult;
    }

    // 非同期バリデーションを実行
    if (asyncValidators && asyncValidators.length > 0) {
      const errors: Record<string, string> = {};
      
      for (const validator of asyncValidators) {
        const error = await validator(syncResult.data);
        if (error) {
          errors._async = error;
          break;
        }
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }
    }

    return syncResult;
  },
};

// カスタムZodスキーマエクステンション
export const customSchemas = {
  /**
   * 日本の日付形式をサポート
   */
  japaneseDate: () => z.string().refine((date) => {
    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD形式をサポート
    const dateRegex = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date.replace(/[/.]/g, '-'));
    return !isNaN(parsedDate.getTime());
  }, '正しい日付形式で入力してください（YYYY-MM-DD）'),

  /**
   * ファイルサイズ制限
   */
  fileSize: (maxSizeInMB: number) => z.instanceof(File).refine((file) => {
    return file.size <= maxSizeInMB * 1024 * 1024;
  }, `ファイルサイズは${maxSizeInMB}MB以下にしてください`),

  /**
   * ファイル形式制限
   */
  fileType: (allowedTypes: string[]) => z.instanceof(File).refine((file) => {
    return allowedTypes.includes(file.type);
  }, `許可されたファイル形式: ${allowedTypes.join(', ')}`),
};

export { z };
export default validationHelpers;