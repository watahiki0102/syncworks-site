/**
 * 価格計算統一設定
 * pricing.ts、pure-functions.ts、business-logic.tsの価格計算ロジックを統一
 *
 * NOTE: トラック種別の基本料金・推奨ルールはDBから取得
 * @see src/hooks/useTruckTypes.ts
 */

import { TAX_RATES } from '@/constants';
import type { UnifiedPricingConfig } from '@/types/unified';

/**
 * 統一価格設定 - 全ての価格計算でこの設定を使用
 */
export const UNIFIED_PRICING_CONFIG: UnifiedPricingConfig = {
  /** ポイント単価（円） - pricing.tsから統一 */
  POINT_UNIT_PRICE: 500,

  /** 消費税率 - constants.tsから取得 */
  TAX_RATE: TAX_RATES.CONSUMPTION_TAX,

  /** 距離料金（1kmあたり） - pricing.tsから統一 */
  DISTANCE_PRICE_PER_KM: 50,

  /** 基本距離（km） - この距離までは追加料金なし */
  BASE_DISTANCE: 10,
};

/**
 * @deprecated DBから取得するようになりました
 * 後方互換性のため空オブジェクトをエクスポート
 * 代わりに src/hooks/useTruckTypes.ts の getBasePrice を使用してください
 */
export const UNIFIED_TRUCK_BASE_PRICES: Record<string, number> = {};

/**
 * @deprecated DBから取得するようになりました
 * 代わりに src/hooks/useTruckTypes.ts を使用してください
 */
export const TRUCK_RECOMMENDATION_RULES = {
  pointRanges: [] as { min: number; max: number; trucks: string[] }[],
  weightLimits: {} as Record<string, number>
};

/**
 * バリデーション用定数
 */
export const PRICING_VALIDATION = {
  /** 最大ポイント数 */
  MAX_POINTS: 9999,
  /** 最大距離（km） */
  MAX_DISTANCE: 1000,
  /** 最大価格（円） */
  MAX_PRICE: 1000000,
  /** 最小価格（円） */
  MIN_PRICE: 0,
} as const;

/**
 * エラーメッセージ（統一）
 */
export const PRICING_ERROR_MESSAGES = {
  INVALID_TRUCK_TYPE: 'トラック種別が無効です',
  INVALID_POINTS: 'ポイント数が無効です（0以上9999以下）',
  INVALID_DISTANCE: '距離が無効です（0以上1000km以下）',
  INVALID_TAX_RATE: '税率が無効です（0以上1以下）',
  EMPTY_ITEMS: '荷物アイテムが指定されていません',
  CALCULATION_ERROR: '価格計算中にエラーが発生しました',
} as const;

/**
 * 設定値の妥当性チェック
 */
export const validatePricingConfig = (): boolean => {
  try {
    // 基本設定の検証
    if (UNIFIED_PRICING_CONFIG.POINT_UNIT_PRICE <= 0) {
      console.error('Invalid POINT_UNIT_PRICE');
      return false;
    }

    if (UNIFIED_PRICING_CONFIG.TAX_RATE < 0 || UNIFIED_PRICING_CONFIG.TAX_RATE > 1) {
      console.error('Invalid TAX_RATE');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating pricing config:', error);
    return false;
  }
};

// 初期化時に設定値を検証
if (process.env.NODE_ENV !== 'test') {
  if (!validatePricingConfig()) {
    throw new Error('Pricing configuration validation failed');
  }
}
