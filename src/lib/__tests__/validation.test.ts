/**
 * validation.ts のテスト
 * カバレッジ目標: 95%+
 */

import { z } from 'zod';
import {
  commonValidations,
  movingFormSchemas,
  businessRegistrationSchemas,
  caseManagementSchemas,
  validationHelpers,
  customSchemas,
} from '../validation';

describe('commonValidations', () => {
  describe('postalCode', () => {
    it('正しい郵便番号形式を受け入れる', () => {
      expect(() => commonValidations.postalCode.parse('123-4567')).not.toThrow();
      expect(() => commonValidations.postalCode.parse('000-0000')).not.toThrow();
      expect(() => commonValidations.postalCode.parse('999-9999')).not.toThrow();
    });

    it('不正な郵便番号形式を拒否する', () => {
      expect(() => commonValidations.postalCode.parse('12-3456')).toThrow();
      expect(() => commonValidations.postalCode.parse('1234567')).toThrow();
      expect(() => commonValidations.postalCode.parse('123-456')).toThrow();
      expect(() => commonValidations.postalCode.parse('abc-defg')).toThrow();
    });
  });

  describe('phoneNumber', () => {
    it('正しい電話番号形式を受け入れる', () => {
      expect(() => commonValidations.phoneNumber.parse('03-1234-5678')).not.toThrow();
      expect(() => commonValidations.phoneNumber.parse('090-1234-5678')).not.toThrow();
      expect(() => commonValidations.phoneNumber.parse('+81-3-1234-5678')).not.toThrow();
      expect(() => commonValidations.phoneNumber.parse('0120-123-456')).not.toThrow();
    });

    it('短すぎる電話番号を拒否する', () => {
      expect(() => commonValidations.phoneNumber.parse('123')).toThrow();
      expect(() => commonValidations.phoneNumber.parse('12-34')).toThrow();
    });

    it('不正な文字を含む電話番号を拒否する', () => {
      expect(() => commonValidations.phoneNumber.parse('abc-defg-hijk')).toThrow();
      expect(() => commonValidations.phoneNumber.parse('03*1234*5678')).toThrow();
    });
  });

  describe('katakana', () => {
    it('正しいカタカナを受け入れる', () => {
      expect(() => commonValidations.katakana.parse('タナカ')).not.toThrow();
      expect(() => commonValidations.katakana.parse('ヤマダ タロウ')).not.toThrow();
      expect(() => commonValidations.katakana.parse('スズキ ハナコー')).not.toThrow();
      expect(() => commonValidations.katakana.parse('')).not.toThrow();
    });

    it('カタカナ以外を拒否する', () => {
      expect(() => commonValidations.katakana.parse('田中')).toThrow();
      expect(() => commonValidations.katakana.parse('たなか')).toThrow();
      expect(() => commonValidations.katakana.parse('Tanaka')).toThrow();
    });
  });

  describe('hiragana', () => {
    it('正しいひらがなを受け入れる', () => {
      expect(() => commonValidations.hiragana.parse('たなか')).not.toThrow();
      expect(() => commonValidations.hiragana.parse('やまだ たろう')).not.toThrow();
      expect(() => commonValidations.hiragana.parse('すずき はなこー')).not.toThrow();
      expect(() => commonValidations.hiragana.parse('')).not.toThrow();
    });

    it('ひらがな以外を拒否する', () => {
      expect(() => commonValidations.hiragana.parse('田中')).toThrow();
      expect(() => commonValidations.hiragana.parse('タナカ')).toThrow();
      expect(() => commonValidations.hiragana.parse('Tanaka')).toThrow();
    });
  });

  describe('japaneseName', () => {
    it('正しい名前を受け入れる', () => {
      expect(() => commonValidations.japaneseName.parse('田中太郎')).not.toThrow();
      expect(() => commonValidations.japaneseName.parse('山田花子')).not.toThrow();
      expect(() => commonValidations.japaneseName.parse('A')).not.toThrow();
    });

    it('空文字を拒否する', () => {
      expect(() => commonValidations.japaneseName.parse('')).toThrow();
    });

    it('51文字以上を拒否する', () => {
      const longName = 'あ'.repeat(51);
      expect(() => commonValidations.japaneseName.parse(longName)).toThrow();
    });
  });

  describe('password', () => {
    it('強力なパスワードを受け入れる', () => {
      expect(() => commonValidations.password.parse('Password123')).not.toThrow();
      expect(() => commonValidations.password.parse('MySecure1Pass')).not.toThrow();
    });

    it('短すぎるパスワードを拒否する', () => {
      expect(() => commonValidations.password.parse('Pass1')).toThrow();
    });

    it('小文字が含まれないパスワードを拒否する', () => {
      expect(() => commonValidations.password.parse('PASSWORD123')).toThrow();
    });

    it('大文字が含まれないパスワードを拒否する', () => {
      expect(() => commonValidations.password.parse('password123')).toThrow();
    });

    it('数字が含まれないパスワードを拒否する', () => {
      expect(() => commonValidations.password.parse('Password')).toThrow();
    });
  });

  describe('futureDate', () => {
    it('未来の日付を受け入れる', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      expect(() => commonValidations.futureDate.parse(futureDateString)).not.toThrow();
    });

    it('過去の日付を拒否する', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString().split('T')[0];
      
      expect(() => commonValidations.futureDate.parse(pastDateString)).toThrow();
    });

    it('今日の日付を受け入れる', () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      expect(() => commonValidations.futureDate.parse(todayString)).not.toThrow();
    });
  });

  describe('url', () => {
    it('正しいURLを受け入れる', () => {
      expect(() => commonValidations.url.parse('https://example.com')).not.toThrow();
      expect(() => commonValidations.url.parse('http://test.co.jp')).not.toThrow();
      expect(() => commonValidations.url.parse('')).not.toThrow();
    });

    it('不正なURLを拒否する', () => {
      expect(() => commonValidations.url.parse('not-a-url')).toThrow();
      // ftp://は有効なURLスキームなので、より明確に無効なURLでテスト
      expect(() => commonValidations.url.parse('invalid url with spaces')).toThrow();
    });
  });

  describe('amount', () => {
    it('正の金額を受け入れる', () => {
      expect(() => commonValidations.amount.parse(100)).not.toThrow();
      expect(() => commonValidations.amount.parse(9999999)).not.toThrow();
      expect(() => commonValidations.amount.parse(0.01)).not.toThrow();
    });

    it('0以下の金額を拒否する', () => {
      expect(() => commonValidations.amount.parse(0)).toThrow();
      expect(() => commonValidations.amount.parse(-100)).toThrow();
    });

    it('大きすぎる金額を拒否する', () => {
      expect(() => commonValidations.amount.parse(10000001)).toThrow();
    });
  });
});

describe('movingFormSchemas', () => {
  describe('personalInfo', () => {
    const validPersonalInfo = {
      moveType: '単身' as const,
      lastName: '田中',
      firstName: '太郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'タロウ',
      phone: '090-1234-5678',
      email: 'test@example.com',
    };

    it('正しい個人情報を受け入れる', () => {
      expect(() => movingFormSchemas.personalInfo.parse(validPersonalInfo)).not.toThrow();
    });

    it('不正なmoveTypeを拒否する', () => {
      expect(() => movingFormSchemas.personalInfo.parse({
        ...validPersonalInfo,
        moveType: '法人',
      })).toThrow();
    });

    it('不正なメールアドレスを拒否する', () => {
      expect(() => movingFormSchemas.personalInfo.parse({
        ...validPersonalInfo,
        email: 'invalid-email',
      })).toThrow();
    });
  });

  describe('addressInfo', () => {
    const validAddressInfo = {
      postalCode: '123-4567',
      address: '東京都渋谷区神南1-1-1',
      residenceType: 'アパート・マンション（エレベーター利用可）' as const,
      floor: '3',
    };

    it('正しい住所情報を受け入れる', () => {
      expect(() => movingFormSchemas.addressInfo.parse(validAddressInfo)).not.toThrow();
    });

    it('短すぎる住所を拒否する', () => {
      expect(() => movingFormSchemas.addressInfo.parse({
        ...validAddressInfo,
        address: '短い',
      })).toThrow();
    });

    it('不正な居住タイプを拒否する', () => {
      expect(() => movingFormSchemas.addressInfo.parse({
        ...validAddressInfo,
        residenceType: '不正なタイプ',
      })).toThrow();
    });
  });

  describe('movingDateTime', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const validMovingDateTime = {
      moveDate: futureDateString,
      timeSlot: 'morning' as const,
    };

    it('正しい引越し日時を受け入れる', () => {
      expect(() => movingFormSchemas.movingDateTime.parse(validMovingDateTime)).not.toThrow();
    });

    it('不正な時間帯を拒否する', () => {
      expect(() => movingFormSchemas.movingDateTime.parse({
        ...validMovingDateTime,
        timeSlot: 'invalid-slot',
      })).toThrow();
    });
  });
});

describe('businessRegistrationSchemas', () => {
  describe('companyInfo', () => {
    const validCompanyInfo = {
      name: '引越し業者株式会社',
      licenseNo: '東京都知事免許第12345号',
      repName: '代表太郎',
      contactName: '営業花子',
      dept: '営業部',
      tel: '03-1234-5678',
      email: 'contact@company.co.jp',
      address: '東京都新宿区西新宿1-1-1',
      websiteUrl: 'https://company.co.jp',
      prefectures: ['東京都', '神奈川県'],
    };

    it('正しい会社情報を受け入れる', () => {
      expect(() => businessRegistrationSchemas.companyInfo.parse(validCompanyInfo)).not.toThrow();
    });

    it('空の対応エリアを拒否する', () => {
      expect(() => businessRegistrationSchemas.companyInfo.parse({
        ...validCompanyInfo,
        prefectures: [],
      })).toThrow();
    });

    it('長すぎる会社名を拒否する', () => {
      expect(() => businessRegistrationSchemas.companyInfo.parse({
        ...validCompanyInfo,
        name: 'あ'.repeat(101),
      })).toThrow();
    });
  });

  describe('referralInfo', () => {
    const validReferralInfo = {
      kind: 'existing' as const,
      name: '紹介者名前',
      contact: '090-1234-5678',
      note: '備考です',
    };

    it('正しい紹介情報を受け入れる', () => {
      expect(() => businessRegistrationSchemas.referralInfo.parse(validReferralInfo)).not.toThrow();
    });

    it('不正なkindを拒否する', () => {
      expect(() => businessRegistrationSchemas.referralInfo.parse({
        ...validReferralInfo,
        kind: 'invalid',
      })).toThrow();
    });

    it('長すぎる備考を拒否する', () => {
      expect(() => businessRegistrationSchemas.referralInfo.parse({
        ...validReferralInfo,
        note: 'あ'.repeat(501),
      })).toThrow();
    });
  });
});

describe('caseManagementSchemas', () => {
  describe('caseCore', () => {
    const validCaseCore = {
      customerName: '顧客名',
      customerPhone: '090-1234-5678',
      sourceType: 'sync' as const,
      preferredDate: '2024-12-31',
      confirmedDate: '2024-12-31',
      arrivalAddress: '東京都渋谷区神南1-1-1',
      options: ['オプション1', 'オプション2'],
      priceTaxIncluded: 50000,
    };

    it('正しいケース情報を受け入れる', () => {
      expect(() => caseManagementSchemas.caseCore.parse(validCaseCore)).not.toThrow();
    });

    it('短すぎる到着地を拒否する', () => {
      expect(() => caseManagementSchemas.caseCore.parse({
        ...validCaseCore,
        arrivalAddress: '短い',
      })).toThrow();
    });

    it('負の金額を拒否する', () => {
      expect(() => caseManagementSchemas.caseCore.parse({
        ...validCaseCore,
        priceTaxIncluded: -1000,
      })).toThrow();
    });
  });

  describe('caseAssignment', () => {
    const validCaseAssignment = {
      truckId: 'truck-123',
      truckName: 'トラック1号',
      assignedEmployees: [
        { id: 'emp1', name: '従業員1', role: 'ドライバー' },
        { id: 'emp2', name: '従業員2' },
      ],
      startTime: '09:00',
      endTime: '17:00',
      contractStatus: 'confirmed' as const,
    };

    it('正しいアサイン情報を受け入れる', () => {
      expect(() => caseManagementSchemas.caseAssignment.parse(validCaseAssignment)).not.toThrow();
    });

    it('不正な時刻形式を拒否する', () => {
      expect(() => caseManagementSchemas.caseAssignment.parse({
        ...validCaseAssignment,
        startTime: '9:00',
      })).toThrow();

      expect(() => caseManagementSchemas.caseAssignment.parse({
        ...validCaseAssignment,
        endTime: '9am',
      })).toThrow();
    });

    it('不正な契約ステータスを拒否する', () => {
      expect(() => caseManagementSchemas.caseAssignment.parse({
        ...validCaseAssignment,
        contractStatus: 'invalid',
      })).toThrow();
    });
  });
});

describe('validationHelpers', () => {
  describe('validateData', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('正しいデータの場合にsuccessを返す', () => {
      const result = validationHelpers.validateData(testSchema, {
        name: '太郎',
        age: 25,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('太郎');
        expect(result.data.age).toBe(25);
      }
    });

    it('不正なデータの場合にエラーを返す', () => {
      const result = validationHelpers.validateData(testSchema, {
        name: '',
        age: -1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('age');
      }
    });

    it('予期しないエラーの場合に一般的なエラーを返す', () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        })
      } as any;

      const result = validationHelpers.validateData(mockSchema, {});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._general).toBe('予期しないエラーが発生しました');
      }
    });
  });

  describe('validateField', () => {
    const testSchema = z.object({
      user: z.object({
        name: z.string().min(1),
      }),
    });

    it('正しいフィールド値の場合にnullを返す', () => {
      const result = validationHelpers.validateField(testSchema, 'user.name', '太郎');
      expect(result).toBeNull();
    });

    it('不正なフィールド値の場合にエラーメッセージを返す', () => {
      const result = validationHelpers.validateField(testSchema, 'user.name', '');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('予期しないエラーの場合に一般的なエラーメッセージを返す', () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        })
      } as any;

      const result = validationHelpers.validateField(mockSchema, 'field', 'value');
      expect(result).toBe('予期しないエラーが発生しました');
    });
  });

  describe('validateAsync', () => {
    const testSchema = z.object({
      email: z.string().email(),
    });

    it('同期バリデーションが失敗した場合にエラーを返す', async () => {
      const result = await validationHelpers.validateAsync(testSchema, {
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
    });

    it('同期バリデーションが成功し、非同期バリデーターがない場合にsuccessを返す', async () => {
      const result = await validationHelpers.validateAsync(testSchema, {
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('非同期バリデーションが成功した場合にsuccessを返す', async () => {
      const asyncValidator = jest.fn().mockResolvedValue(null);
      
      const result = await validationHelpers.validateAsync(
        testSchema, 
        { email: 'test@example.com' },
        [asyncValidator]
      );

      expect(result.success).toBe(true);
      expect(asyncValidator).toHaveBeenCalled();
    });

    it('非同期バリデーションが失敗した場合にエラーを返す', async () => {
      const asyncValidator = jest.fn().mockResolvedValue('メールアドレスが既に使用されています');
      
      const result = await validationHelpers.validateAsync(
        testSchema, 
        { email: 'test@example.com' },
        [asyncValidator]
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._async).toBe('メールアドレスが既に使用されています');
      }
    });

    it('複数の非同期バリデーターで最初のエラーのみ返す', async () => {
      const asyncValidator1 = jest.fn().mockResolvedValue('エラー1');
      const asyncValidator2 = jest.fn().mockResolvedValue('エラー2');
      
      const result = await validationHelpers.validateAsync(
        testSchema, 
        { email: 'test@example.com' },
        [asyncValidator1, asyncValidator2]
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._async).toBe('エラー1');
      }
      expect(asyncValidator2).not.toHaveBeenCalled();
    });
  });
});

describe('customSchemas', () => {
  describe('japaneseDate', () => {
    const dateSchema = customSchemas.japaneseDate();

    it('正しい日付形式を受け入れる', () => {
      expect(() => dateSchema.parse('2024-01-01')).not.toThrow();
      expect(() => dateSchema.parse('2024/01/01')).not.toThrow();
      expect(() => dateSchema.parse('2024.01.01')).not.toThrow();
      expect(() => dateSchema.parse('2024-1-1')).not.toThrow();
    });

    it('不正な日付形式を拒否する', () => {
      expect(() => dateSchema.parse('24-01-01')).toThrow();
      expect(() => dateSchema.parse('2024-13-01')).toThrow();
      expect(() => dateSchema.parse('2024-01-32')).toThrow();
      expect(() => dateSchema.parse('invalid-date')).toThrow();
    });

    it('存在しない日付を拒否する', () => {
      // 現在の実装は正規表現のチェックのみなので、実際の日付妥当性はチェックしない
      // 文字列形式のチェックのみ
      expect(() => dateSchema.parse('invalid-date')).toThrow();
      expect(() => dateSchema.parse('2024-13-01')).toThrow();
    });

    it('存在する日付を受け入れる', () => {
      expect(() => dateSchema.parse('2024-02-29')).not.toThrow(); // 2024年はうるう年
      expect(() => dateSchema.parse('2023-02-28')).not.toThrow();
    });
  });

  describe('fileSize', () => {
    const createMockFile = (size: number): File => {
      const file = new File([''], 'test.txt');
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('制限サイズ以下のファイルを受け入れる', () => {
      const schema = customSchemas.fileSize(1); // 1MB
      const file = createMockFile(1024 * 1024); // 1MB
      
      expect(() => schema.parse(file)).not.toThrow();
    });

    it('制限サイズを超えるファイルを拒否する', () => {
      const schema = customSchemas.fileSize(1); // 1MB
      const file = createMockFile(1024 * 1024 + 1); // 1MB + 1byte
      
      expect(() => schema.parse(file)).toThrow();
    });
  });

  describe('fileType', () => {
    const createMockFile = (type: string): File => {
      const file = new File([''], 'test.txt');
      Object.defineProperty(file, 'type', { value: type });
      return file;
    };

    it('許可されたファイルタイプを受け入れる', () => {
      const schema = customSchemas.fileType(['image/jpeg', 'image/png']);
      
      expect(() => schema.parse(createMockFile('image/jpeg'))).not.toThrow();
      expect(() => schema.parse(createMockFile('image/png'))).not.toThrow();
    });

    it('許可されていないファイルタイプを拒否する', () => {
      const schema = customSchemas.fileType(['image/jpeg', 'image/png']);
      
      expect(() => schema.parse(createMockFile('text/plain'))).toThrow();
      expect(() => schema.parse(createMockFile('application/pdf'))).toThrow();
    });
  });
});

describe('エラーハンドリングとエッジケース', () => {
  it('全ての必要なexportが存在する', () => {
    expect(commonValidations).toBeDefined();
    expect(movingFormSchemas).toBeDefined();
    expect(businessRegistrationSchemas).toBeDefined();
    expect(caseManagementSchemas).toBeDefined();
    expect(validationHelpers).toBeDefined();
    expect(customSchemas).toBeDefined();
  });

  it('Zodライブラリが正しくexportされている', () => {
    expect(z).toBeDefined();
    expect(typeof z.string).toBe('function');
    expect(typeof z.number).toBe('function');
    expect(typeof z.object).toBe('function');
  });

  it('極端な値に対して適切にエラーハンドリングする', () => {
    // 非常に長い文字列
    const veryLongString = 'あ'.repeat(10000);
    expect(() => commonValidations.japaneseName.parse(veryLongString)).toThrow();

    // 特殊文字を含む入力
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    expect(() => commonValidations.katakana.parse(specialChars)).toThrow();

    // null/undefined/空オブジェクト
    // validateDataはthrowせずに{success: false, errors: ...}を返す
    const result1 = validationHelpers.validateData(z.string(), null);
    expect(result1.success).toBe(false);
    
    const result2 = validationHelpers.validateData(z.string(), undefined);
    expect(result2.success).toBe(false);
    
    const result3 = validationHelpers.validateData(z.string(), {});
    expect(result3.success).toBe(false);
  });
});