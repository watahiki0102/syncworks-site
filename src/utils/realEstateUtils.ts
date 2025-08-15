/**
 * 不動産登録用ユーティリティ関数
 * - 紹介リンク生成
 * - バリデーション関数
 * - その他のヘルパー関数
 */

/**
 * 紹介登録用のリンクを生成
 * @param referrerId 紹介者ID
 * @param mode 登録モード（デフォルト: referral）
 * @returns 紹介登録用のURL
 */
export function generateReferralLink(
  referrerId: string, 
  mode: 'referral' = 'referral'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const params = new URLSearchParams({
    mode,
    referrer: referrerId
  });
  
  return `${baseUrl}/real-estates/register?${params.toString()}`;
}

/**
 * 免許番号の形式チェック
 * @param licenseNo 免許番号
 * @returns 有効な免許番号かどうか
 */
export function validateLicenseNumber(licenseNo: string): boolean {
  // 宅地建物取引業免許番号の形式チェック
  // 例: 東京都知事免許(1)第12345号
  const licensePattern = /^[^\d]*(\d+)[^\d]*$/;
  return licensePattern.test(licenseNo) && licenseNo.length >= 5;
}

/**
 * 電話番号の形式チェック
 * @param tel 電話番号
 * @returns 有効な電話番号かどうか
 */
export function validatePhoneNumber(tel: string): boolean {
  // 日本の電話番号形式チェック
  const phonePattern = /^(\+81|0)[1-9]\d{8,9}$/;
  return phonePattern.test(tel.replace(/[-\s]/g, ''));
}

/**
 * 都道府県の選択状態をチェック
 * @param prefectures 選択された都道府県の配列
 * @returns 選択されているかどうか
 */
export function hasPrefectureSelection(prefectures: string[]): boolean {
  return prefectures.length > 0;
}

/**
 * フォームデータの初期値を取得
 * @param mode 登録モード
 * @param referrer 紹介者ID
 * @returns 初期フォームデータ
 */
export function getInitialFormData(mode: 'self' | 'referral', referrer?: string) {
  return {
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
    referral: mode === 'referral' ? {
      kind: 'existing' as const,
      name: '',
      contact: '',
      note: ''
    } : undefined,
    referrer: referrer || null
  };
}

/**
 * エラーメッセージの日本語化
 * @param field フィールド名
 * @returns 日本語のフィールド名
 */
export function getFieldLabel(field: string): string {
  const fieldLabels: Record<string, string> = {
    'company.name': '会社名',
    'company.licenseNo': '免許番号',
    'company.repName': '代表者名',
    'company.contactName': '担当者氏名',
    'company.dept': '部署',
    'company.tel': '電話番号',
    'company.email': 'メールアドレス',
    'company.address': '住所',
    'referral.name': '紹介者名',
    'referral.contact': '連絡先'
  };
  
  return fieldLabels[field] || field;
}
