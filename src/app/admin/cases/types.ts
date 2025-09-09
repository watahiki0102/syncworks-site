import { SourceType } from './lib/normalize';
import { UnifiedCase } from '@/types/common';

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
 * 見積もり履歴の型定義（共通型を拡張）
 */
export interface QuoteHistory extends UnifiedCase {
  responseDate: string;    // 回答日
  amount: number;          // 見積もり金額（税抜）
  amountWithTax: number;   // 見積もり金額（税込）
  isContracted: boolean;   // 成約フラグ
  isReQuote: boolean;      // 再見積もりフラグ
  timeBandSurcharges: TimeBandSurcharge[]; // 時間帯割増賃金
}


// QuoteRequestは共通型から使用

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
