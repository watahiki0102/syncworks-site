/**
 * validation.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  validators,
  validateField,
  validateForm,
  commonValidators,
  ValidationResult,
  ValidationRule
} from '../validation';

describe('validation utils', () => {
  describe('validators.required', () => {
    it('空でない文字列はバリデーション成功', () => {
      const validate = validators.required();
      expect(validate('test')).toEqual({ isValid: true, message: undefined });
    });

    it('空文字列はバリデーション失敗', () => {
      const validate = validators.required();
      expect(validate('')).toEqual({ isValid: false, message: '必須項目です' });
    });

    it('空白のみの文字列はバリデーション失敗', () => {
      const validate = validators.required();
      expect(validate('   ')).toEqual({ isValid: false, message: '必須項目です' });
    });

    it('nullはバリデーション失敗', () => {
      const validate = validators.required();
      expect(validate(null as any)).toEqual({ isValid: false, message: '必須項目です' });
    });

    it('undefinedはバリデーション失敗', () => {
      const validate = validators.required();
      expect(validate(undefined as any)).toEqual({ isValid: false, message: '必須項目です' });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.required('カスタムエラーメッセージ');
      expect(validate('')).toEqual({ isValid: false, message: 'カスタムエラーメッセージ' });
    });
  });

  describe('validators.minLength', () => {
    it('最小文字数以上はバリデーション成功', () => {
      const validate = validators.minLength(5);
      expect(validate('12345')).toEqual({ isValid: true, message: undefined });
      expect(validate('123456')).toEqual({ isValid: true, message: undefined });
    });

    it('最小文字数未満はバリデーション失敗', () => {
      const validate = validators.minLength(5);
      expect(validate('1234')).toEqual({ isValid: false, message: '5文字以上で入力してください' });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.minLength(5, 'カスタムメッセージ');
      expect(validate('123')).toEqual({ isValid: false, message: 'カスタムメッセージ' });
    });
  });

  describe('validators.maxLength', () => {
    it('最大文字数以下はバリデーション成功', () => {
      const validate = validators.maxLength(5);
      expect(validate('12345')).toEqual({ isValid: true, message: undefined });
      expect(validate('1234')).toEqual({ isValid: true, message: undefined });
    });

    it('最大文字数超過はバリデーション失敗', () => {
      const validate = validators.maxLength(5);
      expect(validate('123456')).toEqual({ isValid: false, message: '5文字以下で入力してください' });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.maxLength(5, 'カスタムメッセージ');
      expect(validate('123456')).toEqual({ isValid: false, message: 'カスタムメッセージ' });
    });
  });

  describe('validators.email', () => {
    it('正しいメールアドレス形式はバリデーション成功', () => {
      const validate = validators.email();
      expect(validate('test@example.com')).toEqual({ isValid: true, message: undefined });
      expect(validate('user.name+tag@domain.co.jp')).toEqual({ isValid: true, message: undefined });
    });

    it('不正なメールアドレス形式はバリデーション失敗', () => {
      const validate = validators.email();
      expect(validate('invalid-email')).toEqual({ 
        isValid: false, 
        message: '正しいメールアドレスを入力してください' 
      });
      expect(validate('test@')).toEqual({ 
        isValid: false, 
        message: '正しいメールアドレスを入力してください' 
      });
      expect(validate('@example.com')).toEqual({ 
        isValid: false, 
        message: '正しいメールアドレスを入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.email('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.phone', () => {
    it('正しい電話番号形式はバリデーション成功', () => {
      const validate = validators.phone();
      expect(validate('090-1234-5678')).toEqual({ isValid: true, message: undefined });
      expect(validate('03-1234-5678')).toEqual({ isValid: true, message: undefined });
      expect(validate('09012345678')).toEqual({ isValid: true, message: undefined });
      expect(validate('+81-90-1234-5678')).toEqual({ isValid: true, message: undefined });
    });

    it('不正な電話番号形式はバリデーション失敗', () => {
      const validate = validators.phone();
      expect(validate('abc-defg-hijk')).toEqual({ 
        isValid: false, 
        message: '正しい電話番号を入力してください' 
      });
      expect(validate('090-123')).toEqual({ // 短すぎる
        isValid: false, 
        message: '正しい電話番号を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.phone('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.zipCode', () => {
    it('正しい郵便番号形式はバリデーション成功', () => {
      const validate = validators.zipCode();
      expect(validate('123-4567')).toEqual({ isValid: true, message: undefined });
    });

    it('不正な郵便番号形式はバリデーション失敗', () => {
      const validate = validators.zipCode();
      expect(validate('1234567')).toEqual({ 
        isValid: false, 
        message: '正しい郵便番号を入力してください（例：123-4567）' 
      });
      expect(validate('12-4567')).toEqual({ 
        isValid: false, 
        message: '正しい郵便番号を入力してください（例：123-4567）' 
      });
      expect(validate('123-456')).toEqual({ 
        isValid: false, 
        message: '正しい郵便番号を入力してください（例：123-4567）' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.zipCode('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.number', () => {
    it('正しい数値はバリデーション成功', () => {
      const validate = validators.number();
      expect(validate('123')).toEqual({ isValid: true, message: undefined });
      expect(validate('123.45')).toEqual({ isValid: true, message: undefined });
      expect(validate(123)).toEqual({ isValid: true, message: undefined });
      expect(validate(123.45)).toEqual({ isValid: true, message: undefined });
      expect(validate('0')).toEqual({ isValid: true, message: undefined });
      expect(validate('-123')).toEqual({ isValid: true, message: undefined });
    });

    it('不正な数値はバリデーション失敗', () => {
      const validate = validators.number();
      expect(validate('abc')).toEqual({ 
        isValid: false, 
        message: '数値を入力してください' 
      });
      expect(validate('')).toEqual({ 
        isValid: false, 
        message: '数値を入力してください' 
      });
      expect(validate('abc123')).toEqual({ 
        isValid: false, 
        message: '数値を入力してください' 
      });
    });

    it('InfinityとNaNはバリデーション失敗', () => {
      const validate = validators.number();
      expect(validate(Infinity)).toEqual({ 
        isValid: false, 
        message: '数値を入力してください' 
      });
      expect(validate(NaN)).toEqual({ 
        isValid: false, 
        message: '数値を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.number('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.min', () => {
    it('最小値以上はバリデーション成功', () => {
      const validate = validators.min(10);
      expect(validate(10)).toEqual({ isValid: true, message: undefined });
      expect(validate(15)).toEqual({ isValid: true, message: undefined });
    });

    it('最小値未満はバリデーション失敗', () => {
      const validate = validators.min(10);
      expect(validate(5)).toEqual({ 
        isValid: false, 
        message: '10以上の値を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.min(10, 'カスタムエラー');
      expect(validate(5)).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.max', () => {
    it('最大値以下はバリデーション成功', () => {
      const validate = validators.max(100);
      expect(validate(100)).toEqual({ isValid: true, message: undefined });
      expect(validate(50)).toEqual({ isValid: true, message: undefined });
    });

    it('最大値超過はバリデーション失敗', () => {
      const validate = validators.max(100);
      expect(validate(150)).toEqual({ 
        isValid: false, 
        message: '100以下の値を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.max(100, 'カスタムエラー');
      expect(validate(150)).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.date', () => {
    it('正しい日付形式はバリデーション成功', () => {
      const validate = validators.date();
      expect(validate('2023-12-25')).toEqual({ isValid: true, message: undefined });
      expect(validate('2023/12/25')).toEqual({ isValid: true, message: undefined });
      expect(validate('Dec 25, 2023')).toEqual({ isValid: true, message: undefined });
    });

    it('不正な日付形式はバリデーション失敗', () => {
      const validate = validators.date();
      expect(validate('invalid-date')).toEqual({ 
        isValid: false, 
        message: '正しい日付を入力してください' 
      });
      expect(validate('2023-13-01')).toEqual({ // 13月は存在しない
        isValid: false, 
        message: '正しい日付を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.date('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.futureDate', () => {
    it('未来の日付はバリデーション成功', () => {
      const validate = validators.futureDate();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      expect(validate(tomorrowStr)).toEqual({ isValid: true, message: undefined });
    });

    it('今日以降の日付は有効', () => {
      const validate = validators.futureDate();
      
      // 明日の日付で確実にテスト
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const result = validate(tomorrowStr);
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('過去の日付はバリデーション失敗', () => {
      const validate = validators.futureDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      expect(validate(yesterdayStr)).toEqual({ 
        isValid: false, 
        message: '未来の日付を入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.futureDate('カスタムエラー');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      expect(validate(yesterdayStr)).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.password', () => {
    it('強いパスワードはバリデーション成功', () => {
      const validate = validators.password();
      expect(validate('Password123')).toEqual({ isValid: true, message: undefined });
      expect(validate('MySecure1')).toEqual({ isValid: true, message: undefined });
    });

    it('弱いパスワードはバリデーション失敗', () => {
      const validate = validators.password();
      const message = 'パスワードは8文字以上で、大文字・小文字・数字を含んでください';
      
      expect(validate('short')).toEqual({ isValid: false, message });
      expect(validate('nouppercase123')).toEqual({ isValid: false, message });
      expect(validate('NOLOWERCASE123')).toEqual({ isValid: false, message });
      expect(validate('NoNumbers')).toEqual({ isValid: false, message });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.password('カスタムエラー');
      expect(validate('weak')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.katakana', () => {
    it('カタカナ文字列はバリデーション成功', () => {
      const validate = validators.katakana();
      expect(validate('カタカナ')).toEqual({ isValid: true, message: undefined });
      expect(validate('タナカ タロウ')).toEqual({ isValid: true, message: undefined });
      expect(validate('ー')).toEqual({ isValid: true, message: undefined }); // 長音符
      expect(validate('')).toEqual({ isValid: true, message: undefined }); // 空文字もOK
    });

    it('カタカナ以外の文字列はバリデーション失敗', () => {
      const validate = validators.katakana();
      expect(validate('ひらがな')).toEqual({ 
        isValid: false, 
        message: 'カタカナで入力してください' 
      });
      expect(validate('漢字')).toEqual({ 
        isValid: false, 
        message: 'カタカナで入力してください' 
      });
      expect(validate('English')).toEqual({ 
        isValid: false, 
        message: 'カタカナで入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.katakana('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validators.hiragana', () => {
    it('ひらがな文字列はバリデーション成功', () => {
      const validate = validators.hiragana();
      expect(validate('ひらがな')).toEqual({ isValid: true, message: undefined });
      expect(validate('たなか たろう')).toEqual({ isValid: true, message: undefined });
      expect(validate('ー')).toEqual({ isValid: true, message: undefined }); // 長音符
      expect(validate('')).toEqual({ isValid: true, message: undefined }); // 空文字もOK
    });

    it('ひらがな以外の文字列はバリデーション失敗', () => {
      const validate = validators.hiragana();
      expect(validate('カタカナ')).toEqual({ 
        isValid: false, 
        message: 'ひらがなで入力してください' 
      });
      expect(validate('漢字')).toEqual({ 
        isValid: false, 
        message: 'ひらがなで入力してください' 
      });
      expect(validate('English')).toEqual({ 
        isValid: false, 
        message: 'ひらがなで入力してください' 
      });
    });

    it('カスタムメッセージが使用される', () => {
      const validate = validators.hiragana('カスタムエラー');
      expect(validate('invalid')).toEqual({ isValid: false, message: 'カスタムエラー' });
    });
  });

  describe('validateField', () => {
    it('すべてのルールが成功した場合はバリデーション成功', () => {
      const rules = [
        validators.required(),
        validators.minLength(5),
        validators.maxLength(10)
      ];
      
      const result = validateField('hello', rules);
      expect(result).toEqual({ isValid: true });
    });

    it('1つのルールが失敗した場合はバリデーション失敗', () => {
      const rules = [
        validators.required(),
        validators.minLength(5),
        validators.maxLength(10)
      ];
      
      const result = validateField('hi', rules); // minLength(5)で失敗
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('5文字以上で入力してください');
    });

    it('空のルール配列では成功', () => {
      const result = validateField('anything', []);
      expect(result).toEqual({ isValid: true });
    });

    it('最初に失敗したルールのメッセージを返す', () => {
      const rules = [
        validators.required(),
        validators.minLength(10), // これで失敗
        validators.maxLength(5)   // これでも失敗するが、前のが優先
      ];
      
      const result = validateField('short', rules);
      expect(result.message).toBe('10文字以上で入力してください');
    });
  });

  describe('validateForm', () => {
    it('すべてのフィールドが有効な場合は成功', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      
      const schema = {
        name: [validators.required(), validators.minLength(2)],
        email: [validators.email()],
        age: [validators.min(0), validators.max(150)]
      };
      
      const result = validateForm(data, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('一部のフィールドが無効な場合は失敗', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: 200
      };
      
      const schema = {
        name: [validators.required()],
        email: [validators.email()],
        age: [validators.max(150)]
      };
      
      const result = validateForm(data, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
      expect(result.errors.email).toBe('正しいメールアドレスを入力してください');
      expect(result.errors.age).toBe('150以下の値を入力してください');
    });

    it('スキーマが空の場合は常に成功', () => {
      const data = { anything: 'value' };
      const result = validateForm(data, {});
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('データが空オブジェクトでも動作する', () => {
      const data = {};
      const schema = {
        name: [validators.required()]
      };
      
      const result = validateForm(data, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });
  });

  describe('commonValidators', () => {
    it('customerName バリデーターが正しく動作する', () => {
      const result1 = validateField('田中太郎', commonValidators.customerName);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('', commonValidators.customerName);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('顧客名は必須です');

      const longName = 'a'.repeat(101);
      const result3 = validateField(longName, commonValidators.customerName);
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('顧客名は100文字以下で入力してください');
    });

    it('email バリデーターが正しく動作する', () => {
      const result1 = validateField('test@example.com', commonValidators.email);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('', commonValidators.email);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('メールアドレスは必須です');

      const result3 = validateField('invalid', commonValidators.email);
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('正しいメールアドレスを入力してください');
    });

    it('optionalEmail バリデーターが正しく動作する', () => {
      // 空文字でもrequiredがないので成功（ただし、emptyチェックは含まれていない実装）
      const result1 = validateField('test@example.com', commonValidators.optionalEmail);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('invalid', commonValidators.optionalEmail);
      expect(result2.isValid).toBe(false);
    });

    it('phone バリデーターが正しく動作する', () => {
      const result1 = validateField('090-1234-5678', commonValidators.phone);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('', commonValidators.phone);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('電話番号は必須です');
    });

    it('address バリデーターが正しく動作する', () => {
      const result1 = validateField('東京都渋谷区', commonValidators.address);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('', commonValidators.address);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('住所は必須です');

      const result3 = validateField('短い', commonValidators.address);
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('正しい住所を入力してください');
    });

    it('moveDate バリデーターが正しく動作する', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const result1 = validateField(tomorrowStr, commonValidators.moveDate);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('', commonValidators.moveDate);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('引越し日は必須です');
    });

    it('points バリデーターが正しく動作する', () => {
      const result1 = validateField('50', commonValidators.points);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('0', commonValidators.points);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('1ポイント以上を入力してください');

      const result3 = validateField('1001', commonValidators.points);
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('1000ポイント以下を入力してください');
    });

    it('weight バリデーターが正しく動作する', () => {
      const result1 = validateField('1000', commonValidators.weight);
      expect(result1.isValid).toBe(true);

      const result2 = validateField('0', commonValidators.weight);
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('1kg以上を入力してください');

      const result3 = validateField('10001', commonValidators.weight);
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('10000kg以下を入力してください');
    });
  });
});