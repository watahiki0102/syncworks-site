/**
 * トラック推奨・見積もり計算の統一ユーティリティ
 * 複数のファイルで重複していたロジックを統合
 *
 * NOTE: トラック種別の基本料金はDBから取得
 * @see src/hooks/useTruckTypes.ts
 */

import { Truck } from '@/types/shared';
import { getBasePriceFromCache, getRecommendedTruckTypeFromCache } from '@/hooks/useTruckTypes';

export interface EstimateParams {
  points: number;
  distance?: number;
  basePointPrice?: number;
  baseDistancePrice?: number;
}

export interface TruckRecommendationParams {
  points: number;
  weight?: number;
  trucks: Truck[];
}

/**
 * 統一された見積もり価格計算
 * 複数ファイルの異なる実装を統合
 */
export const calculateEstimatedPrice = (params: EstimateParams): number => {
  const {
    points,
    distance = 0,
    basePointPrice = 100, // 1ポイントあたりの基本価格
    baseDistancePrice = 50  // 1kmあたりの基本価格
  } = params;

  if (points <= 0) {
    throw new Error('ポイント数は0より大きい必要があります');
  }

  const pointPrice = points * basePointPrice;
  const distancePrice = distance * baseDistancePrice;

  return Math.round(pointPrice + distancePrice);
};

/**
 * 統一されたトラック推奨ロジック
 * ポイント数と重量に基づいて最適なトラックを推奨
 * 実際の推奨はDBから取得したmaxPointsを使用
 */
export const calculateRecommendedTrucks = (params: TruckRecommendationParams): Truck[] => {
  const { points, weight = 0, trucks } = params;

  if (points <= 0) {
    return [];
  }

  // 利用可能なトラックのみフィルタ
  const availableTrucks = trucks.filter(truck => truck.status === 'available');

  if (availableTrucks.length === 0) {
    return [];
  }

  // 容量に基づいてソート（小さい順）
  const sortedTrucks = [...availableTrucks].sort((a, b) => a.capacityKg - b.capacityKg);

  // 重量要件を満たすトラックをフィルタ
  const weightFilteredTrucks = weight > 0
    ? sortedTrucks.filter(truck => truck.capacityKg >= weight)
    : sortedTrucks;

  // 結果が空の場合は、容量の大きい順に返す
  if (weightFilteredTrucks.length === 0) {
    return sortedTrucks.slice(0, 3);
  }

  // 容量の小さい順（効率的な順）で上位5件を返す
  return weightFilteredTrucks.slice(0, 5);
};

/**
 * トラックタイプから基本料金を取得（DBキャッシュから）
 */
export const getTruckBasePrice = (truckType: string): number => {
  return getBasePriceFromCache(truckType);
};

/**
 * ポイント数から推奨トラックタイプを取得
 * DBのmaxPointsに基づいて判定
 */
export const getRecommendedTruckType = (points: number): string => {
  return getRecommendedTruckTypeFromCache(points);
};

/**
 * トラック効率性を計算（ポイント/容量比）
 */
export const calculateTruckEfficiency = (truck: Truck, requiredPoints: number): number => {
  if (truck.capacityKg === 0) {return 0;}
  const pointsPerKg = requiredPoints / truck.capacityKg;
  return Math.round(pointsPerKg * 1000) / 1000; // 小数点3位まで
};

/**
 * 複数の見積もりパラメータから最適なプランを計算
 */
export const calculateOptimalPlan = (
  pointsList: number[],
  distance: number,
  availableTrucks: Truck[]
): {
  totalCost: number;
  recommendedTrucks: Truck[];
  efficiency: number;
} => {
  const totalPoints = pointsList.reduce((sum, points) => sum + points, 0);

  // 各ポイント数に対する推奨トラックを取得
  const allRecommendations = pointsList.map(points =>
    calculateRecommendedTrucks({ points, trucks: availableTrucks })
  );

  // 最も効率的な組み合わせを選択（簡単な例）
  const recommendedTrucks = allRecommendations[0] || [];

  const totalCost = calculateEstimatedPrice({
    points: totalPoints,
    distance
  });

  const efficiency = recommendedTrucks.length > 0
    ? totalPoints / recommendedTrucks.reduce((sum, truck) => sum + truck.capacityKg, 0)
    : 0;

  return {
    totalCost,
    recommendedTrucks,
    efficiency: Math.round(efficiency * 1000) / 1000
  };
};

const truckUtils = {
  calculateEstimatedPrice,
  calculateRecommendedTrucks,
  getTruckBasePrice,
  getRecommendedTruckType,
  calculateTruckEfficiency,
  calculateOptimalPlan
};

export default truckUtils;
