/**
 * TDD対応: 純粋関数の集約
 * - 副作用がなく、テストしやすい関数の実装
 * - t-wadaさんのTDDプリンシパルに従った設計
 * - 同じ入力に対して常に同じ出力を返す
 */

/**
 * 数値計算関連の純粋関数
 */
export const mathUtils = {
  /**
   * 消費税込み価格を計算
   * @param basePrice 基本価格
   * @param taxRate 税率（0.1 = 10%）
   * @returns 税込み価格
   */
  calculateTaxIncluded: (basePrice: number, taxRate: number): number => {
    if (basePrice < 0) throw new Error('基本価格は0以上である必要があります');
    if (taxRate < 0 || taxRate > 1) throw new Error('税率は0から1の間である必要があります');
    
    return Math.floor(basePrice * (1 + taxRate));
  },

  /**
   * 割引価格を計算
   * @param originalPrice 元の価格
   * @param discountRate 割引率（0.1 = 10%割引）
   * @returns 割引後価格
   */
  calculateDiscountPrice: (originalPrice: number, discountRate: number): number => {
    if (originalPrice < 0) throw new Error('元の価格は0以上である必要があります');
    if (discountRate < 0 || discountRate > 1) throw new Error('割引率は0から1の間である必要があります');
    
    return Math.floor(originalPrice * (1 - discountRate));
  },

  /**
   * パーセンテージを計算
   * @param value 値
   * @param total 合計
   * @returns パーセンテージ（0-100）
   */
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    if (value < 0 || total < 0) throw new Error('値と合計は0以上である必要があります');
    
    return Math.round((value / total) * 100);
  },
};

/**
 * 文字列処理関連の純粋関数
 */
export const stringUtils = {
  /**
   * 郵便番号の正規化
   * @param input 入力文字列
   * @returns 正規化された郵便番号（XXX-XXXX形式）
   */
  normalizePostalCode: (input: string): string => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length !== 7) {
      throw new Error('郵便番号は7桁の数字である必要があります');
    }
    
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  },

  /**
   * 電話番号の正規化
   * @param input 入力文字列
   * @returns 正規化された電話番号
   */
  normalizePhoneNumber: (input: string): string => {
    const cleaned = input.replace(/[^\d\-\+\(\)\s]/g, '').trim();
    
    if (cleaned.length === 0) {
      throw new Error('電話番号が入力されていません');
    }
    
    // 基本的な検証（日本の電話番号形式）
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      throw new Error('日本の電話番号の桁数が正しくありません');
    }
    
    return cleaned;
  },

  /**
   * 全角・半角の正規化
   * @param input 入力文字列
   * @returns 正規化された文字列
   */
  normalizeWidth: (input: string): string => {
    return input
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      )
      .replace(/[！-～]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      );
  },

  /**
   * カタカナをひらがなに変換
   * @param katakana カタカナ文字列
   * @returns ひらがな文字列
   */
  katakanaToHiragana: (katakana: string): string => {
    return katakana.replace(/[\u30a1-\u30f6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    );
  },

  /**
   * 安全なテキスト切り詰め
   * @param text 元のテキスト
   * @param maxLength 最大長
   * @param suffix 省略記号
   * @returns 切り詰められたテキスト
   */
  truncateText: (text: string, maxLength: number, suffix = '...'): string => {
    if (maxLength <= 0) throw new Error('最大長は正の数である必要があります');
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength - suffix.length) + suffix;
  },
};

/**
 * 配列操作関連の純粋関数
 */
export const arrayUtils = {
  /**
   * 配列を指定サイズのチャンクに分割
   * @param array 元の配列
   * @param chunkSize チャンクサイズ
   * @returns 分割された配列
   */
  chunk: <T>(array: T[], chunkSize: number): T[][] => {
    if (chunkSize <= 0) throw new Error('チャンクサイズは正の数である必要があります');
    
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * 配列から重複を削除
   * @param array 元の配列
   * @param keySelector キー選択関数（オプション）
   * @returns 重複削除された配列
   */
  unique: <T>(array: T[], keySelector?: (item: T) => unknown): T[] => {
    if (!keySelector) {
      return Array.from(new Set(array));
    }
    
    const seen = new Set();
    return array.filter(item => {
      const key = keySelector(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  /**
   * 配列をソート（元の配列は変更しない）
   * @param array 元の配列
   * @param compareFunction 比較関数
   * @returns ソートされた新しい配列
   */
  sortBy: <T>(array: T[], compareFunction: (a: T, b: T) => number): T[] => {
    return [...array].sort(compareFunction);
  },

  /**
   * 配列をグループ化
   * @param array 元の配列
   * @param keySelector グループキー選択関数
   * @returns グループ化されたオブジェクト
   */
  groupBy: <T, K extends string | number | symbol>(
    array: T[],
    keySelector: (item: T) => K
  ): Record<K, T[]> => {
    const groups = {} as Record<K, T[]>;
    
    for (const item of array) {
      const key = keySelector(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }
    
    return groups;
  },
};

/**
 * 日付操作関連の純粋関数
 */
export const dateUtils = {
  /**
   * 日付が営業日かどうかチェック（土日祝日を除く）
   * @param date 日付
   * @returns 営業日の場合true
   */
  isBusinessDay: (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // 月曜日(1)〜金曜日(5)
  },

  /**
   * 指定した日数後の営業日を計算
   * @param startDate 開始日
   * @param businessDays 営業日数
   * @returns 指定営業日後の日付
   */
  addBusinessDays: (startDate: Date, businessDays: number): Date => {
    if (businessDays < 0) throw new Error('営業日数は0以上である必要があります');
    
    const result = new Date(startDate);
    let remainingDays = businessDays;
    
    while (remainingDays > 0) {
      result.setDate(result.getDate() + 1);
      if (dateUtils.isBusinessDay(result)) {
        remainingDays--;
      }
    }
    
    return result;
  },

  /**
   * 日付の範囲チェック
   * @param date チェックする日付
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 範囲内の場合true
   */
  isDateInRange: (date: Date, startDate: Date, endDate: Date): boolean => {
    return date >= startDate && date <= endDate;
  },

  /**
   * 日付を日本語フォーマットに変換
   * @param date 日付
   * @param includeWeekday 曜日を含むかどうか
   * @returns フォーマットされた日付文字列
   */
  formatJapaneseDate: (date: Date, includeWeekday = false): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let formatted = `${year}年${month}月${day}日`;
    
    if (includeWeekday) {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekday = weekdays[date.getDay()];
      formatted += `(${weekday})`;
    }
    
    return formatted;
  },
};

/**
 * バリデーション関連の純粋関数
 */
export const validationUtils = {
  /**
   * メールアドレスの検証
   * @param email メールアドレス
   * @returns 有効な場合true
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 日本の郵便番号の検証
   * @param postalCode 郵便番号
   * @returns 有効な場合true
   */
  isValidPostalCode: (postalCode: string): boolean => {
    const postalRegex = /^\d{3}-\d{4}$/;
    return postalRegex.test(postalCode);
  },

  /**
   * パスワード強度の検証
   * @param password パスワード
   * @returns 検証結果オブジェクト
   */
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('8文字以上入力してください');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('小文字を含めてください');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('大文字を含めてください');

    if (/\d/.test(password)) score += 1;
    else feedback.push('数字を含めてください');

    if (/[!@#$%^&*]/.test(password)) score += 1;
    else feedback.push('特殊文字を含めてください');

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  },

  /**
   * 必須フィールドの検証
   * @param value 値
   * @param fieldName フィールド名
   * @returns エラーメッセージまたはnull
   */
  validateRequired: (value: unknown, fieldName: string): string | null => {
    if (value === null || value === undefined) {
      return `${fieldName}は必須です`;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName}は必須です`;
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName}を少なくとも1つ選択してください`;
    }
    
    return null;
  },
};

/**
 * 価格計算の純粋関数（既存のpricing.tsから抽出）
 */
export const pricingCalculations = {
  /**
   * 基本運賃の計算
   * @param distance 距離（km）
   * @param baseRate 基本料金率
   * @returns 基本運賃
   */
  calculateBaseFare: (distance: number, baseRate: number): number => {
    if (distance < 0) throw new Error('距離は0以上である必要があります');
    if (baseRate <= 0) throw new Error('基本料金率は正の数である必要があります');
    
    return Math.floor(distance * baseRate);
  },

  /**
   * 時間帯割増料金の計算
   * @param baseFare 基本料金
   * @param timeSlot 時間帯
   * @returns 割増後料金
   */
  calculateTimeSurcharge: (baseFare: number, timeSlot: string): number => {
    if (baseFare < 0) throw new Error('基本料金は0以上である必要があります');
    
    const surchargeRates: Record<string, number> = {
      'early_morning': 1.2, // 早朝 20%割増
      'night': 1.3,         // 夜間 30%割増
      'default': 1.0,       // 通常
    };
    
    const rate = surchargeRates[timeSlot] || surchargeRates['default'];
    return Math.floor(baseFare * rate);
  },

  /**
   * オプションサービス料金の計算
   * @param selectedOptions 選択されたオプション
   * @param optionPrices オプション価格マップ
   * @returns オプション料金合計
   */
  calculateOptionsTotal: (
    selectedOptions: string[],
    optionPrices: Record<string, number>
  ): number => {
    return selectedOptions.reduce((total, option) => {
      const price = optionPrices[option] || 0;
      return total + price;
    }, 0);
  },
};

// 全ての純粋関数をまとめてエクスポート
const pureFunctions = {
  mathUtils,
  stringUtils,
  arrayUtils,
  dateUtils,
  validationUtils,
  pricingCalculations,
};

export default pureFunctions;