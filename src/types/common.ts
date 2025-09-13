/**
 * 共通型定義
 * フォーム入力、見積依頼、見積回答で共通して使用する型定義
 */

/**
 * 顧客情報の型定義
 */
export interface CustomerInfo {
  /** 姓 */
  lastName: string;
  /** 名 */
  firstName: string;
  /** 姓（カタカナ） */
  lastNameKana: string;
  /** 名（カタカナ） */
  firstNameKana: string;
  /** 電話番号 */
  phone: string;
  /** メールアドレス */
  email: string;
  /** 顧客名（姓+名の結合） */
  customerName: string;
}

/**
 * 引越し情報の型定義
 */
export interface MoveInfo {
  /** 引越しタイプ */
  moveType: '単身' | '家族';
  /** 引越し日 */
  moveDate: string;
  /** 引越し時間帯 */
  moveTime?: string;
  /** 引越し元住所 */
  fromAddress: string;
  /** 引越し先住所 */
  toAddress: string;
  /** 引越し元郵便番号 */
  fromPostalCode?: string;
  /** 引越し先郵便番号 */
  toPostalCode?: string;
  /** 引越し元住宅タイプ */
  fromResidenceType?: string;
  /** 引越し先住宅タイプ */
  toResidenceType?: string;
  /** 引越し元階数 */
  fromFloor?: string;
  /** 引越し先階数 */
  toFloor?: string;
}

/**
 * 荷物アイテムの型定義
 * 注意: この型は items-unified.ts の BaseItemInfo と統一予定
 */
export interface ItemInfo {
  /** アイテムID */
  id: string;
  /** カテゴリ */
  category: string;
  /** 荷物名 */
  name: string;
  /** 数量 */
  quantity: number;
  /** ポイント */
  points: number;
  /** 追加コスト */
  additionalCost?: number;
}

// 後方互換性のため、統一型へのエイリアスを追加（循環参照回避）
// export type { BaseItemInfo as UnifiedItemInfo } from './items-unified';

/**
 * 荷物情報の型定義
 */
export interface ItemsInfo {
  /** 荷物リスト */
  items: ItemInfo[];
  /** 総ポイント */
  totalPoints: number;
  /** 備考 */
  remarks?: string;
}

/**
 * 見積依頼の型定義
 */
export interface QuoteRequest {
  /** 依頼ID */
  id: string;
  /** 顧客情報 */
  customer: CustomerInfo;
  /** 引越し情報 */
  move: MoveInfo;
  /** 荷物情報 */
  items: ItemsInfo;
  /** 依頼日 */
  requestDate: string;
  /** 回答期限 */
  deadline: string;
  /** 優先度 */
  priority: 'high' | 'medium' | 'low';
  /** 依頼元種別 */
  sourceType: string;
  /** ステータス */
  status: 'pending' | 'answered' | 'expired';
  /** 紹介ID */
  referralId?: string | null;
}

/**
 * 見積回答の型定義
 */
export interface QuoteResponse {
  /** 回答ID */
  id: string;
  /** 依頼ID */
  requestId: string;
  /** 回答タイプ */
  responseType: 'quote' | 'unavailable';
  /** 基本料金（見積可能時のみ） */
  basicAmount?: number;
  /** オプション料金（見積可能時のみ） */
  optionAmount?: number;
  /** 税込総額（見積可能時のみ） */
  totalAmountWithTax?: number;
  /** 見積有効期限（見積可能時のみ） */
  validUntil?: string;
  /** 回答コメント */
  comment: string;
  /** 特記事項 */
  notes?: string;
  /** 回答日時 */
  respondedAt: string;
  /** 回答者 */
  respondedBy: string;
}

/**
 * 統合案件データの型定義
 */
export interface UnifiedCase {
  /** 案件ID */
  id: string;
  /** 顧客情報 */
  customer: CustomerInfo;
  /** 引越し情報 */
  move: MoveInfo;
  /** 荷物情報 */
  items: ItemsInfo;
  /** 案件タイプ */
  type: 'request' | 'history';
  /** ステータス */
  status: '見積依頼' | '見積済' | '再見積' | '受注' | '失注' | 'キャンセル';
  /** 依頼固有のフィールド */
  requestDate?: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
  /** 履歴固有のフィールド */
  responseDate?: string;
  amountWithTax?: number;
  isReQuote?: boolean;
  /** 見積回答 */
  quoteResponse?: QuoteResponse;
  /** 依頼元種別 */
  sourceType: string;
  /** 紹介ID */
  referralId?: string | null;
  /** 梱包資材配送有無 */
  packingDelivery?: boolean;
  /** 梱包資材配送期限 */
  packingDeadline?: string;
  /** 梱包資材配送対応済み */
  packingDeliveryCompleted?: boolean;
}

/**
 * フォーム入力データの型定義
 */
export interface FormInputData {
  /** 顧客情報 */
  customer: CustomerInfo;
  /** 引越し情報 */
  move: MoveInfo;
  /** 荷物情報 */
  items: ItemsInfo;
  /** 紹介ID */
  referralId?: string | null;
}

/**
 * フォームステップ別の型定義
 */
export interface Step1FormData {
  moveType: '単身' | '家族';
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  phone: string;
  email: string;
  date1: string;
  date2: string;
  date3: string;
  timeSlot1: string;
  timeSlot2: string;
  timeSlot3: string;
  fromPostalCode: string;
  fromAddress: string;
  fromResidenceType: string;
  fromResidenceOther?: string;
  fromFloor: string;
  toPostalCode: string;
  toAddress: string;
  toResidenceType: string;
  toResidenceOther?: string;
  toFloor: string;
  referralId?: string | null;
}

export interface Step2FormData {
  items: Record<string, any>;
  itemsRemarks?: string;
}

/**
 * 完了データの型定義
 */
export interface CompleteData {
  submissionId: string;
  customerName: string;
  estimatedPrice: number;
  recommendedTruckType: string;
  totalPoints: number;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  referralId?: string | null;
  contactPreference?: 'line' | 'email';
}