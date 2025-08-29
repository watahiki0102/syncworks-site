/**
 * realEstateUtils.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  generateReferralLink,
  validateLicenseNumber,
  validatePhoneNumber,
  hasPrefectureSelection,
  getInitialFormData,
  getFieldLabel
} from '../realEstateUtils';

// 環境変数のモック
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('generateReferralLink', () => {
  it('基本的な紹介リンクを生成する', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const link = generateReferralLink('referrer123');
    expect(link).toBe('https://example.com/real-estates/register?mode=referral&referrer=referrer123');
  });

  it('明示的にreferralモードを指定した紹介リンクを生成する', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const link = generateReferralLink('referrer456', 'referral');
    expect(link).toBe('https://example.com/real-estates/register?mode=referral&referrer=referrer456');
  });

  it('BASE_URLが設定されていない場合は空文字列をベースURLとして使用する', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    const link = generateReferralLink('referrer789');
    expect(link).toBe('/real-estates/register?mode=referral&referrer=referrer789');
  });

  it('BASE_URLが空文字列の場合', () => {
    process.env.NEXT_PUBLIC_BASE_URL = '';
    const link = generateReferralLink('referrer999');
    expect(link).toBe('/real-estates/register?mode=referral&referrer=referrer999');
  });

  it('特殊文字を含むreferrerIdでも正しくエンコードされる', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const link = generateReferralLink('referrer@#$%');
    expect(link).toBe('https://example.com/real-estates/register?mode=referral&referrer=referrer%40%23%24%25');
  });

  it('日本語のreferrerIdでも正しくエンコードされる', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const link = generateReferralLink('紹介者テスト');
    expect(link).toBe('https://example.com/real-estates/register?mode=referral&referrer=%E7%B4%B9%E4%BB%8B%E8%80%85%E3%83%86%E3%82%B9%E3%83%88');
  });

  it('空文字列のreferrerIdでも処理する', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const link = generateReferralLink('');
    expect(link).toBe('https://example.com/real-estates/register?mode=referral&referrer=');
  });
});

describe('validateLicenseNumber', () => {
  describe('有効な免許番号', () => {
    it('標準的な免許番号形式を受け入れる', () => {
      // 正規表現は連続する数字グループが1つのみ許可するため、シンプルな形式のみ
      expect(validateLicenseNumber('東京都知事免許第12345号')).toBe(true);
    });

    it('別の都道府県の免許番号を受け入れる', () => {
      expect(validateLicenseNumber('大阪府知事免許第67890号')).toBe(true);
    });

    it('国土交通大臣免許を受け入れる', () => {
      expect(validateLicenseNumber('国土交通大臣免許第11111号')).toBe(true);
    });

    it('数字のみでも5文字以上なら受け入れる', () => {
      expect(validateLicenseNumber('12345')).toBe(true);
    });

    it('英数字混じりでも数字を含み5文字以上なら受け入れる', () => {
      expect(validateLicenseNumber('ABC123')).toBe(true);
    });

    it('連続する数字を含む場合は有効', () => {
      expect(validateLicenseNumber('東京都知事免許第1234567号')).toBe(true);
    });
  });

  describe('無効な免許番号', () => {
    it('5文字未満は無効', () => {
      expect(validateLicenseNumber('1234')).toBe(false);
    });

    it('数字を含まない文字列は無効', () => {
      expect(validateLicenseNumber('東京都知事免許')).toBe(false);
    });

    it('空文字列は無効', () => {
      expect(validateLicenseNumber('')).toBe(false);
    });

    it('英字のみは無効', () => {
      expect(validateLicenseNumber('ABCDEF')).toBe(false);
    });

    it('記号のみは無効', () => {
      expect(validateLicenseNumber('@#$%^&')).toBe(false);
    });

    it('スペースのみは無効', () => {
      expect(validateLicenseNumber('     ')).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('ちょうど5文字で数字を含む場合は有効', () => {
      expect(validateLicenseNumber('ABC1D')).toBe(true);
    });

    it('非常に長い文字列でも数字を含めば有効', () => {
      const longString = 'あいうえおかきくけこ'.repeat(10) + '12345';
      expect(validateLicenseNumber(longString)).toBe(true);
    });

    it('改行文字を含む場合', () => {
      expect(validateLicenseNumber('東京都知事免許\n1\n第12345号')).toBe(false);
    });

    it('タブ文字を含む場合', () => {
      expect(validateLicenseNumber('東京都知事免許\t1\t第12345号')).toBe(false);
    });
  });
});

describe('validatePhoneNumber', () => {
  describe('有効な電話番号', () => {
    it('携帯電話番号（090）を受け入れる', () => {
      expect(validatePhoneNumber('09012345678')).toBe(true);
    });

    it('携帯電話番号（080）を受け入れる', () => {
      expect(validatePhoneNumber('08098765432')).toBe(true);
    });

    it('携帯電話番号（070）を受け入れる', () => {
      expect(validatePhoneNumber('07011111111')).toBe(true);
    });

    it('固定電話番号（東京）を受け入れる', () => {
      expect(validatePhoneNumber('0312345678')).toBe(true);
    });

    it('固定電話番号（大阪）を受け入れる', () => {
      expect(validatePhoneNumber('0687654321')).toBe(true);
    });

    it('ハイフン付きの電話番号を受け入れる', () => {
      expect(validatePhoneNumber('090-1234-5678')).toBe(true);
    });

    it('スペース付きの電話番号を受け入れる', () => {
      expect(validatePhoneNumber('090 1234 5678')).toBe(true);
    });

    it('ハイフンとスペース混在の電話番号を受け入れる', () => {
      expect(validatePhoneNumber('090-1234 5678')).toBe(true);
    });

    it('国際形式（+81）を受け入れる', () => {
      expect(validatePhoneNumber('+819012345678')).toBe(true);
    });

    it('10桁の固定電話番号を受け入れる', () => {
      expect(validatePhoneNumber('0123456789')).toBe(true);
    });

    it('11桁の携帯電話番号を受け入れる', () => {
      expect(validatePhoneNumber('09012345678')).toBe(true);
    });
  });

  describe('無効な電話番号', () => {
    it('数字が足りない', () => {
      expect(validatePhoneNumber('090123456')).toBe(false);
    });

    it('数字が多すぎる', () => {
      expect(validatePhoneNumber('090123456789')).toBe(false);
    });

    it('0で始まらない（国際形式でもない）', () => {
      expect(validatePhoneNumber('9012345678')).toBe(false);
    });

    it('2番目の桁が0', () => {
      expect(validatePhoneNumber('0012345678')).toBe(false);
    });

    it('空文字列', () => {
      expect(validatePhoneNumber('')).toBe(false);
    });

    it('英字を含む', () => {
      expect(validatePhoneNumber('090abcd5678')).toBe(false);
    });

    it('国際形式の桁数が不正', () => {
      expect(validatePhoneNumber('+8190123456')).toBe(false);
    });

    it('ハイフンのみ', () => {
      expect(validatePhoneNumber('---')).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('複数のハイフンやスペースがあっても正しく処理', () => {
      expect(validatePhoneNumber('090--1234  5678')).toBe(true);
    });

    it('先頭と末尾にスペースがあっても処理', () => {
      expect(validatePhoneNumber(' 09012345678 ')).toBe(true);
    });
  });
});

describe('hasPrefectureSelection', () => {
  it('都道府県が選択されている場合はtrueを返す', () => {
    expect(hasPrefectureSelection(['東京都'])).toBe(true);
  });

  it('複数の都道府県が選択されている場合はtrueを返す', () => {
    expect(hasPrefectureSelection(['東京都', '大阪府', '神奈川県'])).toBe(true);
  });

  it('都道府県が選択されていない場合はfalseを返す', () => {
    expect(hasPrefectureSelection([])).toBe(false);
  });

  it('空文字列の要素がある場合でも長さが1以上ならtrueを返す', () => {
    expect(hasPrefectureSelection([''])).toBe(true);
  });

  it('undefinedやnullを含む配列でも長さが1以上ならtrueを返す', () => {
    // TypeScriptでは通常こうはならないが、実行時の安全性テスト
    expect(hasPrefectureSelection([undefined as any])).toBe(true);
    expect(hasPrefectureSelection([null as any])).toBe(true);
  });
});

describe('getInitialFormData', () => {
  describe('selfモード', () => {
    it('自己登録モードの初期データを返す', () => {
      const result = getInitialFormData('self');
      
      expect(result).toEqual({
        company: {
          name: '',
          licenseNo: '',
          repName: '',
          contactName: '',
          dept: '',
          tel: '',
          email: '',
          address: '',
          websiteUrl: '',
          prefectures: []
        },
        referral: undefined,
        referrer: null
      });
    });

    it('自己登録モードでreferrerを指定した場合', () => {
      const result = getInitialFormData('self', 'referrer123');
      
      expect(result.referrer).toBe('referrer123');
      expect(result.referral).toBeUndefined();
    });
  });

  describe('referralモード', () => {
    it('紹介登録モードの初期データを返す', () => {
      const result = getInitialFormData('referral');
      
      expect(result).toEqual({
        company: {
          name: '',
          licenseNo: '',
          repName: '',
          contactName: '',
          dept: '',
          tel: '',
          email: '',
          address: '',
          websiteUrl: '',
          prefectures: []
        },
        referral: {
          kind: 'existing',
          name: '',
          contact: '',
          note: ''
        },
        referrer: null
      });
    });

    it('紹介登録モードでreferrerを指定した場合', () => {
      const result = getInitialFormData('referral', 'referrer456');
      
      expect(result.referrer).toBe('referrer456');
      expect(result.referral).toEqual({
        kind: 'existing',
        name: '',
        contact: '',
        note: ''
      });
    });
  });

  describe('referrer引数のバリエーション', () => {
    it('referrerが空文字列の場合', () => {
      const result = getInitialFormData('self', '');
      expect(result.referrer).toBe(null); // 空文字列はfalsy値なのでnullになる
    });

    it('referrerがundefinedの場合', () => {
      const result = getInitialFormData('self', undefined);
      expect(result.referrer).toBe(null);
    });

    it('referrerが指定されていない場合', () => {
      const result = getInitialFormData('self');
      expect(result.referrer).toBe(null);
    });
  });

  describe('会社データの初期値', () => {
    it('すべてのフィールドが正しく初期化される', () => {
      const result = getInitialFormData('self');
      
      expect(result.company.name).toBe('');
      expect(result.company.licenseNo).toBe('');
      expect(result.company.repName).toBe('');
      expect(result.company.contactName).toBe('');
      expect(result.company.dept).toBe('');
      expect(result.company.tel).toBe('');
      expect(result.company.email).toBe('');
      expect(result.company.address).toBe('');
      expect(result.company.websiteUrl).toBe('');
      expect(result.company.prefectures).toEqual([]);
    });
  });
});

describe('getFieldLabel', () => {
  describe('会社情報フィールド', () => {
    it('会社名のラベルを返す', () => {
      expect(getFieldLabel('company.name')).toBe('会社名');
    });

    it('免許番号のラベルを返す', () => {
      expect(getFieldLabel('company.licenseNo')).toBe('免許番号');
    });

    it('代表者名のラベルを返す', () => {
      expect(getFieldLabel('company.repName')).toBe('代表者名');
    });

    it('担当者氏名のラベルを返す', () => {
      expect(getFieldLabel('company.contactName')).toBe('担当者氏名');
    });

    it('部署のラベルを返す', () => {
      expect(getFieldLabel('company.dept')).toBe('部署');
    });

    it('電話番号のラベルを返す', () => {
      expect(getFieldLabel('company.tel')).toBe('電話番号');
    });

    it('メールアドレスのラベルを返す', () => {
      expect(getFieldLabel('company.email')).toBe('メールアドレス');
    });

    it('住所のラベルを返す', () => {
      expect(getFieldLabel('company.address')).toBe('住所');
    });
  });

  describe('紹介者情報フィールド', () => {
    it('紹介者名のラベルを返す', () => {
      expect(getFieldLabel('referral.name')).toBe('紹介者名');
    });

    it('連絡先のラベルを返す', () => {
      expect(getFieldLabel('referral.contact')).toBe('連絡先');
    });
  });

  describe('未定義フィールド', () => {
    it('定義されていないフィールドは元の文字列をそのまま返す', () => {
      expect(getFieldLabel('unknown.field')).toBe('unknown.field');
    });

    it('空文字列の場合は空文字列を返す', () => {
      expect(getFieldLabel('')).toBe('');
    });

    it('単純な文字列の場合はそのまま返す', () => {
      expect(getFieldLabel('customField')).toBe('customField');
    });

    it('日本語フィールド名でも未定義なら元の文字列を返す', () => {
      expect(getFieldLabel('未定義フィールド')).toBe('未定義フィールド');
    });

    it('特殊文字を含む場合でもそのまま返す', () => {
      expect(getFieldLabel('field@#$%')).toBe('field@#$%');
    });
  });

  describe('エッジケース', () => {
    it('ドット記法でない単純なフィールド名', () => {
      expect(getFieldLabel('name')).toBe('name');
    });

    it('複数のドットを含む場合', () => {
      expect(getFieldLabel('company.info.name')).toBe('company.info.name');
    });

    it('数値が含まれる場合', () => {
      expect(getFieldLabel('field123')).toBe('field123');
    });
  });
});