/**
 * トラックAPI クライアント関数
 */

import { Truck, TruckFromDB, mapTruckFromDB, CreateTruckInput, UpdateTruckInput } from '@/types/truck';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * トラック一覧を取得
 * @param params - クエリパラメータ（company_id, status）
 */
export async function fetchTrucks(params?: {
  company_id?: string;
  status?: string;
}): Promise<Truck[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.company_id) searchParams.set('company_id', params.company_id);
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const url = queryString ? `/api/trucks?${queryString}` : '/api/trucks';

    const response = await fetch(url);
    const result: ApiResponse<TruckFromDB[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch trucks');
    }

    // DBデータをフロントエンド用にマッピング
    const trucks: Truck[] = (result.data || []).map((dbTruck: TruckFromDB) =>
      mapTruckFromDB(dbTruck)
    );

    return trucks;
  } catch (error) {
    console.error('[fetchTrucks] Error:', error);
    throw error;
  }
}

/**
 * 特定のトラックを取得
 */
export async function fetchTruck(id: string): Promise<Truck> {
  try {
    const response = await fetch(`/api/trucks/${id}`);
    const result: ApiResponse<TruckFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch truck');
    }

    return mapTruckFromDB(result.data!);
  } catch (error) {
    console.error(`[fetchTruck] Error:`, error);
    throw error;
  }
}

/**
 * 新規トラックを作成
 */
export async function createTruck(input: CreateTruckInput): Promise<Truck> {
  try {
    const response = await fetch('/api/trucks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result: ApiResponse<TruckFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create truck');
    }

    return mapTruckFromDB(result.data!);
  } catch (error) {
    console.error('[createTruck] Error:', error);
    throw error;
  }
}

/**
 * トラック情報を更新
 */
export async function updateTruck(id: string, input: UpdateTruckInput): Promise<Truck> {
  try {
    const response = await fetch(`/api/trucks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result: ApiResponse<TruckFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update truck');
    }

    return mapTruckFromDB(result.data!);
  } catch (error) {
    console.error('[updateTruck] Error:', error);
    throw error;
  }
}

/**
 * トラックを削除（論理削除または物理削除）
 */
export async function deleteTruck(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/trucks/${id}`, {
      method: 'DELETE',
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete truck');
    }
  } catch (error) {
    console.error('[deleteTruck] Error:', error);
    throw error;
  }
}

