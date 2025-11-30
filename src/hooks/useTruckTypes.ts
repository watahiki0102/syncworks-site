/**
 * トラック種別データをDBから取得するカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';

export interface TruckTypeData {
  id: string;
  name: string;
  displayName: string;
  basePrice: number;
  capacityKg: number;
  maxPoints: number;
  coefficient: number;
  sortOrder: number;
}

interface UseTruckTypesResult {
  truckTypes: TruckTypeData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBasePrice: (truckType: string) => number;
  getTruckTypeNames: () => string[];
}

// キャッシュ用のモジュールレベル変数
let cachedTruckTypes: TruckTypeData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分

/**
 * トラック種別データを取得するカスタムフック
 */
export function useTruckTypes(): UseTruckTypesResult {
  const [truckTypes, setTruckTypes] = useState<TruckTypeData[]>(cachedTruckTypes || []);
  const [loading, setLoading] = useState(!cachedTruckTypes);
  const [error, setError] = useState<string | null>(null);

  const fetchTruckTypes = useCallback(async () => {
    // キャッシュが有効な場合はスキップ
    if (cachedTruckTypes && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setTruckTypes(cachedTruckTypes);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/truck-types');
      const result = await response.json();

      if (result.success && result.data) {
        cachedTruckTypes = result.data;
        cacheTimestamp = Date.now();
        setTruckTypes(result.data);
        setError(null);
      } else {
        setError(result.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('トラック種別の取得に失敗しました');
      console.error('トラック種別取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTruckTypes();
  }, [fetchTruckTypes]);

  const refetch = useCallback(async () => {
    // キャッシュをクリアして再取得
    cachedTruckTypes = null;
    cacheTimestamp = null;
    await fetchTruckTypes();
  }, [fetchTruckTypes]);

  const getBasePrice = useCallback((truckType: string): number => {
    const found = truckTypes.find(t => t.name === truckType);
    return found?.basePrice || 0;
  }, [truckTypes]);

  const getTruckTypeNames = useCallback((): string[] => {
    return truckTypes.map(t => t.name);
  }, [truckTypes]);

  return {
    truckTypes,
    loading,
    error,
    refetch,
    getBasePrice,
    getTruckTypeNames
  };
}

/**
 * サーバーサイド用: トラック種別データを直接取得
 */
export async function fetchTruckTypesServer(): Promise<TruckTypeData[]> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const truckTypes = await prisma.truck_types.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    return truckTypes.map(t => ({
      id: t.id,
      name: t.name,
      displayName: t.display_name || t.name,
      basePrice: t.base_price,
      capacityKg: t.capacity_kg,
      maxPoints: t.max_points,
      coefficient: Number(t.coefficient),
      sortOrder: t.sort_order,
    }));
  } catch (error) {
    console.error('トラック種別取得エラー:', error);
    return [];
  }
}

/**
 * 車種名から基本料金を取得（キャッシュ使用）
 */
export function getBasePriceFromCache(truckType: string): number {
  if (!cachedTruckTypes) return 0;
  const found = cachedTruckTypes.find(t => t.name === truckType);
  return found?.basePrice || 0;
}

/**
 * キャッシュされた車種名リストを取得
 */
export function getTruckTypeNamesFromCache(): string[] {
  if (!cachedTruckTypes) return [];
  return cachedTruckTypes.map(t => t.name);
}

/**
 * キャッシュから最小のトラック種別（デフォルト）を取得
 */
export function getDefaultTruckTypeFromCache(): string {
  if (!cachedTruckTypes || cachedTruckTypes.length === 0) return '';
  // sortOrder順にソートされているので最初のものがデフォルト
  return cachedTruckTypes[0].name;
}

/**
 * ポイント数から推奨トラック種別を取得（キャッシュ使用）
 * DBのmaxPointsに基づいて最適なトラックを判定
 */
export function getRecommendedTruckTypeFromCache(points: number): string {
  if (!cachedTruckTypes || cachedTruckTypes.length === 0) return '';

  // sortOrder順にソートされており、maxPointsが小さい順になっているはず
  // ポイント数以下のmaxPointsを持つ最大のトラックを選択
  for (const truck of cachedTruckTypes) {
    if (points <= truck.maxPoints) {
      return truck.name;
    }
  }

  // どのトラックの容量も超える場合は最大のトラックを返す
  return cachedTruckTypes[cachedTruckTypes.length - 1].name;
}

/**
 * ポイント数から推奨トラック種別リストを取得（キャッシュ使用）
 * 複数のトラック選択肢を返す
 */
export function getRecommendedTruckTypesFromCache(points: number): string[] {
  if (!cachedTruckTypes || cachedTruckTypes.length === 0) return [];

  const recommendations: string[] = [];

  for (let i = 0; i < cachedTruckTypes.length; i++) {
    const truck = cachedTruckTypes[i];
    if (points <= truck.maxPoints) {
      // 現在のトラックと次のトラック（あれば）を推奨
      recommendations.push(truck.name);
      if (i + 1 < cachedTruckTypes.length) {
        recommendations.push(cachedTruckTypes[i + 1].name);
      }
      break;
    }
  }

  // どのトラックも見つからなかった場合、最大容量のトラックを推奨
  if (recommendations.length === 0 && cachedTruckTypes.length > 0) {
    recommendations.push(cachedTruckTypes[cachedTruckTypes.length - 1].name);
  }

  return recommendations;
}

/**
 * キャッシュをクリア
 */
export function clearTruckTypesCache(): void {
  cachedTruckTypes = null;
  cacheTimestamp = null;
}
