/**
 * 料金設定関連の型定義
 * /pricing システムで使用される共通型
 */

/**
 * シーズン加算設定で使用する料金タイプ
 */
export type SeasonPriceType = 'percentage' | 'fixed';

/**
 * シーズン加算設定の繰り返しタイプ
 */
export type SeasonRecurringType = 'yearly' | 'monthly' | 'weekly' | 'specific' | 'none';

/**
 * シーズン加算設定の繰り返しパターン
 */
export interface SeasonRecurringPattern {
  /** 指定する曜日 (0=日, 1=月, ... 6=土) */
  weekdays?: number[];
  /** 月単位の繰り返し方法（日付固定 or 曜日固定） */
  monthlyPattern?: 'date' | 'weekday';
  /** 特定の日付リスト (ISO形式の日付文字列配列) */
  specificDates?: string[];
}

/**
 * シーズン加算ルール
 */
export interface SeasonRule {
  /** ルールID */
  id: string;
  /** シーズン名 */
  name: string;
  /** シーズン開始日 (ISO形式) */
  startDate: string;
  /** シーズン終了日 (ISO形式) */
  endDate: string;
  /** 料金タイプ（割合 or 固定額） */
  priceType: SeasonPriceType;
  /** 料金値 */
  price: number;
  /** 説明 */
  description?: string;
  /** 繰り返し設定が有効かどうか */
  isRecurring: boolean;
  /** 繰り返しタイプ */
  recurringType: SeasonRecurringType;
  /** 繰り返しパターンの詳細 */
  recurringPattern?: SeasonRecurringPattern;
  /** 繰り返し終了年 */
  recurringEndYear?: number;
}

/**
 * 荷物ポイントの型定義
 */
export interface ItemPoint {
  id: string;           // アイテムID
  category: string;     // カテゴリ
  name: string;         // 荷物名
  points: number;       // 設定ポイント
  defaultPoints: number; // デフォルトポイント
  additionalCost: number; // 加算金
}

/**
 * 料金ルールの型定義
 */
export interface PricingRule {
  id: string;
  truckType: string;
  minPoint: number;
  maxPoint: number | undefined;
  price: number | undefined;
}

/**
 * オプションアイテムの型定義
 */
export interface OptionItem {
  id: string;
  label: string;
  type: 'free' | 'paid' | 'individual' | 'nonSupported';
  price?: number;
  isDefault?: boolean;
  unit?: string;
  remarks?: string;
  minPoint?: number;
  maxPoint?: number;
}

/**
 * 荷物詳細の型定義（見積回答用）
 * 注意: この型は common.ts の ItemInfo と同一構造
 * 将来的に items-unified.ts の BaseItemInfo に統一予定
 */
export interface ItemDetail {
  id: string;
  category: string;
  name: string;
  quantity: number;
  points: number;
  additionalCost?: number;
}

// 後方互換性エイリアス
export type { ItemInfo as CommonItemInfo } from './common';

/**
 * /pricing データの統合型
 */
export interface PricingData {
  itemPoints: ItemPoint[];
  pricingRules: PricingRule[];
  options: OptionItem[];
}

/**
 * 自動見積算出結果の型定義
 */
export interface AutoQuoteResult {
  totalPoints: number;
  recommendedTruck: string;
  basePrice: number;
  distancePrice: number;
  estimatedDistance: number;
  optionPrice: number;
  adjustmentAmount: number;
  finalPrice: number;
}

/**
 * 価格調整理由の型定義
 */
export interface PriceAdjustmentReason {
  type: 'competitive' | 'urgent' | 'repeat_customer' | 'volume_discount' | 'difficulty' | 'other';
  label: string;
  description?: string;
}

/**
 * 見積回答記録の型定義
 */
export interface QuoteResponseRecord {
  calculatedPrice: number;
  finalPrice: number;
  adjustmentAmount: number;
  adjustmentRate: number;
  adjustmentReason?: PriceAdjustmentReason;
  calculationBreakdown: {
    basePrice: number;
    distancePrice: number;
    optionPrice: number;
    totalPoints: number;
    recommendedTruck: string;
  };
}