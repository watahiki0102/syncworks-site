/**
 * 純粋関数のユニットテスト
 * - t-wadaのTDDアプローチに基づく網羅的テスト
 * - 境界値テスト、エラーケース、正常ケースを含む
 */

import {
  mathUtils,
  stringUtils,
  arrayUtils,
  dateUtils,
  validationUtils,
  pricingCalculations,
} from '../pure-functions';

describe('mathUtils', () => {
  describe('calculateTaxIncluded', () => {
    test('正常な税込み価格を計算', () => {
      expect(mathUtils.calculateTaxIncluded(1000, 0.1)).toBe(1100);
      expect(mathUtils.calculateTaxIncluded(1999, 0.1)).toBe(2198); // 小数点切り捨て
    });

    test('境界値のテスト', () => {
      expect(mathUtils.calculateTaxIncluded(0, 0.1)).toBe(0);
      expect(mathUtils.calculateTaxIncluded(1, 0)).toBe(1);
      expect(mathUtils.calculateTaxIncluded(100, 1)).toBe(200);
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => mathUtils.calculateTaxIncluded(-1, 0.1)).toThrow('基本価格は0以上である必要があります');
      expect(() => mathUtils.calculateTaxIncluded(1000, -0.1)).toThrow('税率は0から1の間である必要があります');
      expect(() => mathUtils.calculateTaxIncluded(1000, 1.1)).toThrow('税率は0から1の間である必要があります');
    });
  });

  describe('calculateDiscountPrice', () => {
    test('正常な割引価格を計算', () => {
      expect(mathUtils.calculateDiscountPrice(1000, 0.1)).toBe(900);
      expect(mathUtils.calculateDiscountPrice(1999, 0.2)).toBe(1599);
    });

    test('境界値のテスト', () => {
      expect(mathUtils.calculateDiscountPrice(0, 0.1)).toBe(0);
      expect(mathUtils.calculateDiscountPrice(100, 0)).toBe(100);
      expect(mathUtils.calculateDiscountPrice(100, 1)).toBe(0);
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => mathUtils.calculateDiscountPrice(-1, 0.1)).toThrow('元の価格は0以上である必要があります');
      expect(() => mathUtils.calculateDiscountPrice(1000, -0.1)).toThrow('割引率は0から1の間である必要があります');
      expect(() => mathUtils.calculateDiscountPrice(1000, 1.1)).toThrow('割引率は0から1の間である必要があります');
    });
  });

  describe('calculatePercentage', () => {
    test('正常なパーセンテージを計算', () => {
      expect(mathUtils.calculatePercentage(25, 100)).toBe(25);
      expect(mathUtils.calculatePercentage(1, 3)).toBe(33); // 四捨五入
      expect(mathUtils.calculatePercentage(2, 3)).toBe(67);
    });

    test('特殊ケース', () => {
      expect(mathUtils.calculatePercentage(0, 100)).toBe(0);
      expect(mathUtils.calculatePercentage(10, 0)).toBe(0); // 分母が0の場合
      expect(mathUtils.calculatePercentage(100, 100)).toBe(100);
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => mathUtils.calculatePercentage(-1, 100)).toThrow('値と合計は0以上である必要があります');
      expect(() => mathUtils.calculatePercentage(100, -1)).toThrow('値と合計は0以上である必要があります');
    });
  });
});

describe('stringUtils', () => {
  describe('normalizePostalCode', () => {
    test('正常な郵便番号の正規化', () => {
      expect(stringUtils.normalizePostalCode('1234567')).toBe('123-4567');
      expect(stringUtils.normalizePostalCode('123-4567')).toBe('123-4567');
      expect(stringUtils.normalizePostalCode('123 4567')).toBe('123-4567');
      expect(stringUtils.normalizePostalCode('１２３４５６７')).toBe('123-4567'); // 全角数字
    });

    test('不正な郵便番号でエラーを投げる', () => {
      expect(() => stringUtils.normalizePostalCode('123456')).toThrow('郵便番号は7桁の数字である必要があります');
      expect(() => stringUtils.normalizePostalCode('12345678')).toThrow('郵便番号は7桁の数字である必要があります');
      expect(() => stringUtils.normalizePostalCode('abcdefg')).toThrow('郵便番号は7桁の数字である必要があります');
      expect(() => stringUtils.normalizePostalCode('')).toThrow('郵便番号は7桁の数字である必要があります');
    });
  });

  describe('normalizePhoneNumber', () => {
    test('正常な電話番号の正規化', () => {
      expect(stringUtils.normalizePhoneNumber('090-1234-5678')).toBe('090-1234-5678');
      expect(stringUtils.normalizePhoneNumber('09012345678')).toBe('09012345678');
      expect(stringUtils.normalizePhoneNumber('03-1234-5678')).toBe('03-1234-5678');
      expect(stringUtils.normalizePhoneNumber('+81-90-1234-5678')).toBe('+81-90-1234-5678');
    });

    test('不正な電話番号でエラーを投げる', () => {
      expect(() => stringUtils.normalizePhoneNumber('')).toThrow('電話番号が入力されていません');
      expect(() => stringUtils.normalizePhoneNumber('123')).toThrow('日本の電話番号の桁数が正しくありません');
      expect(() => stringUtils.normalizePhoneNumber('123456789012')).toThrow('日本の電話番号の桁数が正しくありません');
    });
  });

  describe('normalizeWidth', () => {
    test('全角文字を半角に正規化', () => {
      expect(stringUtils.normalizeWidth('１２３')).toBe('123');
      expect(stringUtils.normalizeWidth('ＡＢＣ')).toBe('ABC');
      expect(stringUtils.normalizeWidth('ａｂｃ')).toBe('abc');
      expect(stringUtils.normalizeWidth('！？')).toBe('!?');
    });

    test('既に半角の文字は変更しない', () => {
      expect(stringUtils.normalizeWidth('123ABC')).toBe('123ABC');
      expect(stringUtils.normalizeWidth('hello world')).toBe('hello world');
    });
  });

  describe('truncateText', () => {
    test('正常なテキスト切り詰め', () => {
      expect(stringUtils.truncateText('hello world', 10)).toBe('hello w...');
      expect(stringUtils.truncateText('hello', 10)).toBe('hello');
      expect(stringUtils.truncateText('hello world', 5, '…')).toBe('hell…');
    });

    test('境界値のテスト', () => {
      expect(stringUtils.truncateText('hello', 5)).toBe('hello');
      expect(stringUtils.truncateText('hello', 3)).toBe('...');
      expect(stringUtils.truncateText('', 5)).toBe('');
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => stringUtils.truncateText('hello', 0)).toThrow('最大長は正の数である必要があります');
      expect(() => stringUtils.truncateText('hello', -1)).toThrow('最大長は正の数である必要があります');
    });
  });
});

describe('arrayUtils', () => {
  describe('chunk', () => {
    test('正常な配列の分割', () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(arrayUtils.chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
      expect(arrayUtils.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });

    test('空配列の処理', () => {
      expect(arrayUtils.chunk([], 2)).toEqual([]);
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => arrayUtils.chunk([1, 2, 3], 0)).toThrow('チャンクサイズは正の数である必要があります');
      expect(() => arrayUtils.chunk([1, 2, 3], -1)).toThrow('チャンクサイズは正の数である必要があります');
    });
  });

  describe('unique', () => {
    test('プリミティブ型の重複削除', () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(arrayUtils.unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('オブジェクトの重複削除（キーセレクタ使用）', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice2' },
      ];
      expect(arrayUtils.unique(data, item => item.id)).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    test('空配列の処理', () => {
      expect(arrayUtils.unique([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    test('正常なグループ化', () => {
      const data = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' },
      ];
      
      const result = arrayUtils.groupBy(data, item => item.category);
      
      expect(result).toEqual({
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
        ],
        vegetable: [
          { category: 'vegetable', name: 'carrot' },
        ],
      });
    });

    test('空配列の処理', () => {
      expect(arrayUtils.groupBy([], item => item)).toEqual({});
    });
  });
});

describe('dateUtils', () => {
  describe('isBusinessDay', () => {
    test('営業日の判定', () => {
      expect(dateUtils.isBusinessDay(new Date('2024-01-01'))).toBe(true); // 月曜日
      expect(dateUtils.isBusinessDay(new Date('2024-01-05'))).toBe(true); // 金曜日
      expect(dateUtils.isBusinessDay(new Date('2024-01-06'))).toBe(false); // 土曜日
      expect(dateUtils.isBusinessDay(new Date('2024-01-07'))).toBe(false); // 日曜日
    });
  });

  describe('addBusinessDays', () => {
    test('営業日の追加', () => {
      const start = new Date('2024-01-01'); // 月曜日
      expect(dateUtils.addBusinessDays(start, 1)).toEqual(new Date('2024-01-02')); // 火曜日
      expect(dateUtils.addBusinessDays(start, 5)).toEqual(new Date('2024-01-08')); // 翌週月曜日
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => dateUtils.addBusinessDays(new Date(), -1)).toThrow('営業日数は0以上である必要があります');
    });
  });

  describe('isDateInRange', () => {
    test('日付範囲の判定', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      
      expect(dateUtils.isDateInRange(new Date('2024-01-15'), start, end)).toBe(true);
      expect(dateUtils.isDateInRange(new Date('2024-01-01'), start, end)).toBe(true);
      expect(dateUtils.isDateInRange(new Date('2024-01-31'), start, end)).toBe(true);
      expect(dateUtils.isDateInRange(new Date('2023-12-31'), start, end)).toBe(false);
      expect(dateUtils.isDateInRange(new Date('2024-02-01'), start, end)).toBe(false);
    });
  });

  describe('formatJapaneseDate', () => {
    test('日本語日付フォーマット', () => {
      const date = new Date('2024-01-15');
      expect(dateUtils.formatJapaneseDate(date)).toBe('2024年1月15日');
      expect(dateUtils.formatJapaneseDate(date, true)).toBe('2024年1月15日(月)');
    });
  });
});

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    test('正常なメールアドレス', () => {
      expect(validationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(validationUtils.isValidEmail('user.name+tag@example.com')).toBe(true);
    });

    test('不正なメールアドレス', () => {
      expect(validationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(validationUtils.isValidEmail('@example.com')).toBe(false);
      expect(validationUtils.isValidEmail('test@')).toBe(false);
      expect(validationUtils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPostalCode', () => {
    test('正常な郵便番号', () => {
      expect(validationUtils.isValidPostalCode('123-4567')).toBe(true);
    });

    test('不正な郵便番号', () => {
      expect(validationUtils.isValidPostalCode('1234567')).toBe(false);
      expect(validationUtils.isValidPostalCode('123-456')).toBe(false);
      expect(validationUtils.isValidPostalCode('abc-defg')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('強いパスワード', () => {
      const result = validationUtils.validatePasswordStrength('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(5);
      expect(result.feedback).toEqual([]);
    });

    test('弱いパスワード', () => {
      const result = validationUtils.validatePasswordStrength('123');
      expect(result.isValid).toBe(false);
      expect(result.score).toBe(1);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('validateRequired', () => {
    test('必須フィールドのバリデーション', () => {
      expect(validationUtils.validateRequired('value', 'フィールド')).toBeNull();
      expect(validationUtils.validateRequired(null, 'フィールド')).toBe('フィールドは必須です');
      expect(validationUtils.validateRequired('', 'フィールド')).toBe('フィールドは必須です');
      expect(validationUtils.validateRequired('  ', 'フィールド')).toBe('フィールドは必須です');
      expect(validationUtils.validateRequired([], 'フィールド')).toBe('フィールドを少なくとも1つ選択してください');
    });
  });
});

describe('pricingCalculations', () => {
  describe('calculateBaseFare', () => {
    test('正常な基本運賃計算', () => {
      expect(pricingCalculations.calculateBaseFare(10, 100)).toBe(1000);
      expect(pricingCalculations.calculateBaseFare(5.7, 200)).toBe(1140); // 小数点切り捨て
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => pricingCalculations.calculateBaseFare(-1, 100)).toThrow('距離は0以上である必要があります');
      expect(() => pricingCalculations.calculateBaseFare(10, 0)).toThrow('基本料金率は正の数である必要があります');
      expect(() => pricingCalculations.calculateBaseFare(10, -100)).toThrow('基本料金率は正の数である必要があります');
    });
  });

  describe('calculateTimeSurcharge', () => {
    test('時間帯割増の計算', () => {
      expect(pricingCalculations.calculateTimeSurcharge(1000, 'early_morning')).toBe(1200);
      expect(pricingCalculations.calculateTimeSurcharge(1000, 'night')).toBe(1300);
      expect(pricingCalculations.calculateTimeSurcharge(1000, 'normal')).toBe(1000);
      expect(pricingCalculations.calculateTimeSurcharge(1000, 'unknown')).toBe(1000);
    });

    test('不正な値でエラーを投げる', () => {
      expect(() => pricingCalculations.calculateTimeSurcharge(-1, 'normal')).toThrow('基本料金は0以上である必要があります');
    });
  });

  describe('calculateOptionsTotal', () => {
    test('オプション料金の合計計算', () => {
      const optionPrices = { 'packing': 10000, 'cleaning': 15000 };
      expect(pricingCalculations.calculateOptionsTotal(['packing'], optionPrices)).toBe(10000);
      expect(pricingCalculations.calculateOptionsTotal(['packing', 'cleaning'], optionPrices)).toBe(25000);
      expect(pricingCalculations.calculateOptionsTotal(['unknown'], optionPrices)).toBe(0);
      expect(pricingCalculations.calculateOptionsTotal([], optionPrices)).toBe(0);
    });
  });
});