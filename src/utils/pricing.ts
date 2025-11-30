/**
 * 価格計算ユーティリティ
 * 見積もり・料金計算に関する共通ロジックを提供
 *
 * NOTE: トラック種別の基本料金はDBから取得
 * @see src/hooks/useTruckTypes.ts
 */

import { UNIFIED_PRICING_CONFIG } from '@/config/pricing';
import { getBasePriceFromCache, getRecommendedTruckTypesFromCache } from '@/hooks/useTruckTypes';

/**
 * 荷物アイテムの型定義
 */
export interface CargoItem {
  /** アイテム名 */
  name: string;
  /** ポイント数 */
  points: number;
  /** 重量（kg） */
  weight?: number;
  /** 個数 */
  quantity: number;
}

/**
 * 作業オプションの型定義
 */
export interface WorkOption {
  /** オプション名 */
  name: string;
  /** 追加料金 */
  price: number;
  /** 選択されているかどうか */
  selected: boolean;
}

/**
 * 距離に基づく料金設定
 */
export interface DistancePricing {
  /** 距離（km） */
  distance: number;
  /** 基本料金 */
  basePrice: number;
  /** 追加料金（1kmあたり） */
  additionalPricePerKm: number;
}

/**
 * 時間帯追加料金の型定義
 */
export interface TimeBandSurcharge {
  /** ID */
  id: string;
  /** 開始時刻 */
  start: string;
  /** 終了時刻 */
  end: string;
  /** 料金タイプ（rate: 倍率, fixed: 固定額） */
  kind: 'rate' | 'fixed';
  /** 値（倍率または金額） */
  value: number;
}

/**
 * 見積もり計算結果の型定義
 */
export interface EstimateResult {
  /** 基本料金 */
  basePrice: number;
  /** 荷物料金 */
  cargoPrice: number;
  /** 作業オプション料金 */
  optionPrice: number;
  /** 距離料金 */
  distancePrice: number;
  /** 時間帯追加料金 */
  timeSurcharge: number;
  /** 小計（税抜き） */
  subtotal: number;
  /** 消費税額 */
  tax: number;
  /** 合計（税込み） */
  total: number;
}

/**
 * 基本料金を取得（DBキャッシュから）
 * @param truckType トラック種別（null/undefinedの場合は0を返す）
 * @returns 基本料金（円）
 */
export const getBasePrice = (truckType: string | null | undefined): number => {
  if (!truckType || typeof truckType !== 'string') {
    return 0;
  }

  const normalizedType = truckType.trim();
  return getBasePriceFromCache(normalizedType);
};

/**
 * 荷物の総ポイント数を計算
 */
export const calculateTotalPoints = (items: CargoItem[]): number => {
  return items.reduce((total, item) => total + (item.points * item.quantity), 0);
};

/**
 * 荷物の総重量を計算
 */
export const calculateTotalWeight = (items: CargoItem[]): number => {
  return items.reduce((total, item) => total + ((item.weight || 0) * item.quantity), 0);
};

/**
 * 荷物料金を計算（ポイントベース）
 */
export const calculateCargoPrice = (items: CargoItem[]): number => {
  const totalPoints = calculateTotalPoints(items);
  return totalPoints * UNIFIED_PRICING_CONFIG.POINT_UNIT_PRICE;
};

/**
 * 作業オプション料金を計算
 */
export const calculateOptionPrice = (options: WorkOption[]): number => {
  return options
    .filter(option => option.selected)
    .reduce((total, option) => total + option.price, 0);
};

/**
 * 距離料金を計算
 */
export const calculateDistancePrice = (distance: number, baseDistance: number = UNIFIED_PRICING_CONFIG.BASE_DISTANCE): number => {
  if (distance <= baseDistance) {
    return 0; // 基本距離内は無料
  }
  const additionalDistance = distance - baseDistance;
  return Math.ceil(additionalDistance) * UNIFIED_PRICING_CONFIG.DISTANCE_PRICE_PER_KM;
};

/**
 * 時間帯追加料金を計算
 */
export const calculateTimeSurcharge = (
  baseAmount: number,
  surcharges: TimeBandSurcharge[]
): number => {
  let total = 0;

  surcharges.forEach(surcharge => {
    if (surcharge.kind === 'rate') {
      // 倍率の場合（例：1.5倍）
      total += baseAmount * (surcharge.value - 1);
    } else {
      // 固定額の場合
      total += surcharge.value;
    }
  });

  return Math.round(total);
};

/**
 * 消費税を計算
 */
export const calculateTax = (amount: number, taxRate: number = UNIFIED_PRICING_CONFIG.TAX_RATE): number => {
  return Math.round(amount * taxRate);
};

/**
 * 総合見積もり計算
 */
export const calculateEstimate = (params: {
  truckType: string;
  items: CargoItem[];
  options: WorkOption[];
  distance?: number;
  timeSurcharges?: TimeBandSurcharge[];
  taxRate?: number;
}): EstimateResult => {
  const {
    truckType,
    items,
    options,
    distance = 0,
    timeSurcharges = [],
    taxRate = UNIFIED_PRICING_CONFIG.TAX_RATE
  } = params;

  // 各項目の料金を計算
  const basePrice = getBasePrice(truckType);
  const cargoPrice = calculateCargoPrice(items);
  const optionPrice = calculateOptionPrice(options);
  const distancePrice = calculateDistancePrice(distance);

  // 小計（時間帯追加料金適用前）
  const subtotalBeforeSurcharge = basePrice + cargoPrice + optionPrice + distancePrice;

  // 時間帯追加料金を計算
  const timeSurcharge = calculateTimeSurcharge(subtotalBeforeSurcharge, timeSurcharges);

  // 小計（税抜き）
  const subtotal = subtotalBeforeSurcharge + timeSurcharge;

  // 消費税を計算
  const tax = calculateTax(subtotal, taxRate);

  // 合計（税込み）
  const total = subtotal + tax;

  return {
    basePrice,
    cargoPrice,
    optionPrice,
    distancePrice,
    timeSurcharge,
    subtotal,
    tax,
    total
  };
};

/**
 * 料金を日本円フォーマットで表示
 */
export const formatPriceJPY = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * 料金を数値フォーマットで表示（¥記号なし）
 */
export const formatPriceNumber = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount);
};

/**
 * 割引率を計算
 */
export const calculateDiscountRate = (originalPrice: number, discountedPrice: number): number => {
  if (originalPrice === 0) {return 0;}
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * 割引額を計算
 */
export const calculateDiscountAmount = (originalPrice: number, discountRate: number): number => {
  return Math.round(originalPrice * (discountRate / 100));
};

/**
 * 推奨トラック種別を判定
 * DBのmaxPointsに基づいて判定
 */
export const getRecommendedTruckTypes = (totalPoints: number, _totalWeight: number): string[] => {
  return getRecommendedTruckTypesFromCache(totalPoints);
};

/**
 * 複数の見積もりを比較
 */
export const compareEstimates = (estimates: EstimateResult[]): {
  cheapest: EstimateResult;
  mostExpensive: EstimateResult;
  averagePrice: number;
} => {
  if (estimates.length === 0) {
    throw new Error('見積もりデータが空です');
  }

  const sortedEstimates = [...estimates].sort((a, b) => a.total - b.total);
  const totalSum = estimates.reduce((sum, estimate) => sum + estimate.total, 0);

  return {
    cheapest: sortedEstimates[0],
    mostExpensive: sortedEstimates[sortedEstimates.length - 1],
    averagePrice: Math.round(totalSum / estimates.length)
  };
};

const pricingUtils = {
  calculateEstimate,
  calculateTotalPoints,
  calculateTotalWeight,
  calculateCargoPrice,
  calculateOptionPrice,
  calculateDistancePrice,
  calculateTimeSurcharge,
  calculateTax,
  formatPriceJPY,
  formatPriceNumber,
  calculateDiscountRate,
  calculateDiscountAmount,
  getRecommendedTruckTypes,
  compareEstimates,
  getBasePrice
};

export default pricingUtils;
