import { SourceType } from './lib/normalize';

// SourceTypeをエクスポート
export type { SourceType };

/**
 * 時間帯割増賃金の型定義
 */
export interface TimeBandSurcharge {
  id: string;
  start: string;        // 開始時間 (HH:MM)
  end: string;          // 終了時間 (HH:MM)
  kind: 'rate' | 'amount'; // 率(×1.25) または 定額(+3000円)
  value: number;        // 率の場合は1.25、定額の場合は3000
}

/**
 * 見積もり履歴の型定義
 */
export interface QuoteHistory {
  id: string;              // 見積もりID
  customerName: string;    // 顧客名
  requestDate: string;     // 依頼日
  responseDate: string;    // 回答日
  amount: number;          // 見積もり金額（税抜）
  amountWithTax: number;   // 見積もり金額（税込）
  status: QuoteStatus;     // ステータス
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
  moveDate: string;        // 引越し予定日
  sourceType: SourceType;  // 依頼元種別
  isContracted: boolean;   // 成約フラグ
  isReQuote: boolean;      // 再見積もりフラグ
  timeBandSurcharges: TimeBandSurcharge[]; // 時間帯割増賃金
  summary: {               // 見積もり概要
    from: string;          // 引越し元住所
    to: string;            // 引越し先住所
    items: string[];       // 荷物リスト
    totalPoints?: number;  // 総ポイント
  };
}

/**
 * 見積もりステータスの型定義
 */
export type QuoteStatus = '見積中' | '回答済' | '再見積' | '成約' | '不成約' | 'キャンセル' | '完了';

/**
 * 見積もり依頼データの型定義
 */
export interface QuoteRequest {
  id: string;                    // 依頼ID
  customerName: string;          // 顧客名
  requestDate: string;           // 依頼日
  deadline: string;              // 回答期限
  summary: {                     // 依頼概要
    moveDate: string;            // 引越し日
    moveTime: string;            // 引越し時間帯
    fromAddress: string;         // 引越し元住所
    toAddress: string;           // 引越し先住所
    items: string[];             // 荷物リスト
    totalPoints: number;         // 総ポイント
  };
  status: 'pending' | 'answered' | 'expired';  // ステータス
  priority: 'high' | 'medium' | 'low';         // 優先度
  sourceType: SourceType;        // 依頼元種別
}

/**
 * 成約データの型定義
 */
export interface Contract {
  id: string;              // 成約ID
  customerName: string;    // 顧客名
  contractDate: string;    // 成約日
  moveDate: string;        // 引越し日
  contractAmount: number;  // 成約金額（税込）
  commission: number;      // 手数料
  revenue: number;         // 手数料差引額（税込）
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
  serviceType: 'internal' | 'external'; // 業者種別（自社 or 他社サービス）
  sourceType: SourceType;  // 仲介元種別
}

/**
 * トラック割り当て状況の型定義
 */
export interface TruckAvailability {
  date: string;            // 日付
  availableTrucks: number; // 利用可能トラック数
  totalTrucks: number;     // 総トラック数
  timeSlots: {             // 時間帯別空き状況
    morning: number;        // 午前
    afternoon: number;      // 午後
    evening: number;        // 夜間
  };
}
