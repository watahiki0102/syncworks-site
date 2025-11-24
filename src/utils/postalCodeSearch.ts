/**
 * 郵便番号検索ユーティリティ
 * zipcloud APIを使用して郵便番号から住所を取得
 */

export interface AddressResult {
  prefecture: string;
  city: string;
  streetNumber: string;
  fullAddress: string;
}

/**
 * 郵便番号から住所を検索
 * @param postalCode 郵便番号（7桁の数字）
 * @returns Promise<AddressResult | null>
 */
export async function searchAddressByPostalCode(postalCode: string): Promise<AddressResult | null> {
  if (!postalCode || !/^\d{7}$/.test(postalCode)) {
    return null;
  }

  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const { address1, address2, address3 } = data.results[0];

      // zipcloud APIの実際の仕様：
      // address1: 都道府県（例：東京都）
      // address2: 市区町村（例：品川区）
      // address3: 町名（例：北品川）

      // 完全な住所を構築
      const fullAddress = `${address1}${address2}${address3}`;

      // 市区町村フィールドには address2 + address3 を使用
      let city = `${address2 || ''}${address3 || ''}`;
      let streetNumber = ''; // 番地は表示しない
      
      return {
        prefecture: address1,
        city: city,
        streetNumber: streetNumber,
        fullAddress: `${address1}${city}${streetNumber}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('郵便番号検索エラー:', error);
    throw new Error('住所の検索に失敗しました');
  }
}

/**
 * 郵便番号から住所を検索（form/step1用の自動補完形式）
 * @param postalCode 郵便番号（7桁の数字）
 * @returns Promise<string | null> 結合された住所文字列
 */
export async function searchAddressForAutoComplete(postalCode: string): Promise<string | null> {
  const result = await searchAddressByPostalCode(postalCode);
  return result ? result.fullAddress : null;
}
