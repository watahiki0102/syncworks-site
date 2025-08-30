/**
 * 価格計算統一設定
 * pricing.ts、pure-functions.ts、business-logic.tsの価格計算ロジックを統一
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
 * トラック種別別基本料金 - pricing.tsから統一
 */
export const UNIFIED_TRUCK_BASE_PRICES = {
  '軽トラック': 15000,
  '2tショート': 25000,
  '2t': 30000,
  '3t': 40000,
  '4t': 50000,
  '4t複数': 80000,
  '特別対応': 100000,
} as const;

/**
 * ポイント基準トラック推奨ルール
 */
export const TRUCK_RECOMMENDATION_RULES = {
  pointRanges: [
    { min: 0, max: 50, trucks: ['軽トラック', '2tショート'] },
    { min: 51, max: 100, trucks: ['2tショート', '2t'] },
    { min: 101, max: 200, trucks: ['2t', '3t'] },
    { min: 201, max: 350, trucks: ['3t', '4t'] },
    { min: 351, max: Infinity, trucks: ['4t', '4t複数'] },
  ],
  weightLimits: {
    '軽トラック': 350,
    '2tショート': 2000,
    '2t': 2000,
    '3t': 3000,
    '4t': 4000,
    '4t複数': 8000,
  }
} as const;

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
    
    // トラック価格の検証
    for (const [type, price] of Object.entries(UNIFIED_TRUCK_BASE_PRICES)) {
      if (price <= 0) {
        console.error(`Invalid base price for truck type: ${type}`);
        return false;
      }
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