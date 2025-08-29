/**
 * トラック推奨・見積もり計算の統一ユーティリティ
 * 複数のファイルで重複していたロジックを統合
 */

import { Truck } from '@/types/shared';

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

  // ポイント数に基づく推奨ロジック
  let recommendedTypes: string[] = [];
  
  if (points <= 50) {
    recommendedTypes = ['軽トラ', '2tショート', '2t'];
  } else if (points <= 100) {
    recommendedTypes = ['2tショート', '2t', '3t'];
  } else if (points <= 200) {
    recommendedTypes = ['2t', '3t', '4t'];
  } else if (points <= 350) {
    recommendedTypes = ['3t', '4t', '8t'];
  } else {
    recommendedTypes = ['4t', '8t', '10t'];
  }

  // 推奨タイプに該当するトラックを抽出
  const recommendedTrucks = availableTrucks.filter(truck => 
    recommendedTypes.includes(truck.truckType)
  );

  // 重量チェック（指定されている場合）
  const weightFilteredTrucks = weight > 0 
    ? recommendedTrucks.filter(truck => truck.capacityKg >= weight)
    : recommendedTrucks;

  // 結果が空の場合は、容量の大きい順に返す
  if (weightFilteredTrucks.length === 0) {
    return availableTrucks
      .sort((a, b) => a.capacityKg - b.capacityKg)
      .slice(0, 3);
  }

  // 容量の小さい順（効率的な順）にソートして返す
  return weightFilteredTrucks
    .sort((a, b) => a.capacityKg - b.capacityKg)
    .slice(0, 5);
};

/**
 * トラックタイプから基本料金を取得
 */
export const getTruckBasePrice = (truckType: string): number => {
  const basePrices: Record<string, number> = {
    '軽トラ': 15000,
    '2tショート': 25000,
    '2t': 30000,
    '2tロング': 35000,
    '3t': 45000,
    '4t': 60000,
    '8t': 80000,
    '10t': 100000,
    '20t': 150000,
    '25t': 180000,
  };

  return basePrices[truckType] || 0;
};

/**
 * ポイント数から推奨トラックタイプを取得
 */
export const getRecommendedTruckType = (points: number): string => {
  if (points <= 50) return '軽トラ';
  if (points <= 100) return '2t';
  if (points <= 200) return '3t';
  if (points <= 350) return '4t';
  return '8t';
};

/**
 * トラック効率性を計算（ポイント/容量比）
 */
export const calculateTruckEfficiency = (truck: Truck, requiredPoints: number): number => {
  if (truck.capacityKg === 0) return 0;
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