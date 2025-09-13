/**
 * アドレス関連の統一型定義
 * originAddress/fromAddress、destinationAddress/toAddress の統一
 */

// 統一住所情報
export interface UnifiedAddressInfo {
  fromAddress: string;    // 標準名称
  toAddress: string;      // 標準名称
  fromPostalCode?: string;
  toPostalCode?: string;
  fromResidenceType?: string;
  toResidenceType?: string;
  fromFloor?: string;
  toFloor?: string;
}

// 既存コード互換性のための型エイリアス
export interface LegacyAddressInfo {
  originAddress: string;      // 既存コード用
  destinationAddress: string; // 既存コード用
}

// 型変換ユーティリティ（画面動作維持のため）
export function toUnifiedAddress(legacy: LegacyAddressInfo): Pick<UnifiedAddressInfo, 'fromAddress' | 'toAddress'> {
  return {
    fromAddress: legacy.originAddress,
    toAddress: legacy.destinationAddress
  };
}

export function toLegacyAddress(unified: Pick<UnifiedAddressInfo, 'fromAddress' | 'toAddress'>): LegacyAddressInfo {
  return {
    originAddress: unified.fromAddress,
    destinationAddress: unified.toAddress
  };
}

// FormSubmission等で使用されるアドレス情報の変換
export interface FormAddressFields {
  moveDate: string;
  originAddress: string;
  destinationAddress: string;
  distance?: number;
}

export interface StandardAddressFields {
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  distance?: number;
}

export function standardizeAddressFields(form: FormAddressFields): StandardAddressFields {
  return {
    moveDate: form.moveDate,
    fromAddress: form.originAddress,
    toAddress: form.destinationAddress,
    distance: form.distance
  };
}

export function toFormAddressFields(standard: StandardAddressFields): FormAddressFields {
  return {
    moveDate: standard.moveDate,
    originAddress: standard.fromAddress,
    destinationAddress: standard.toAddress,
    distance: standard.distance
  };
}