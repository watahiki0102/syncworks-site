/**
 * 料金設定関連の型定義
 * /pricing システムで使用される共通型
 */

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