/**
 * シフトAPI クライアント関数
 */

import { EmployeeShift } from '@/types/employee';

export interface ShiftFromAPI {
  id: string;
  employee_id: string;
  shift_date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employees?: {
    id: string;
    last_name: string;
    first_name: string;
    employee_number: string;
  };
}

/**
 * APIレスポンスをフロントエンド用のEmployeeShiftに変換
 */
export function mapShiftFromAPI(apiShift: ShiftFromAPI): EmployeeShift {
  // 時刻文字列をHH:MM形式に変換（DBからはISO形式で来る可能性がある）
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    // 既にHH:MM形式の場合
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // ISO形式やその他の形式の場合
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
    } catch {
      // パースに失敗した場合は元の値を返す
    }
    return timeStr;
  };

  // 日付文字列をYYYY-MM-DD形式に変換
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // 既にYYYY-MM-DD形式の場合
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // UTCとして解釈してフォーマット（タイムゾーンずれを防ぐ）
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      // パースに失敗した場合は元の値を返す
    }
    return dateStr;
  };

  const startTime = formatTime(apiShift.start_time);
  const endTime = formatTime(apiShift.end_time);

  return {
    id: apiShift.id,
    employeeId: apiShift.employee_id,
    date: formatDate(apiShift.shift_date),
    timeSlot: startTime, // 開始時刻をtimeSlotとして使用
    status: apiShift.status === 'scheduled' || apiShift.status === 'working' ? 'working' : 'unavailable',
    notes: apiShift.notes || undefined,
    startTime: startTime,
    endTime: endTime,
  };
}

/**
 * フロントエンド用のEmployeeShiftをAPI用の形式に変換
 */
export function mapShiftToAPI(shift: EmployeeShift): CreateShiftInput {
  return {
    employee_id: shift.employeeId,
    shift_date: shift.date,
    start_time: shift.startTime || shift.timeSlot || '09:00',
    end_time: shift.endTime || '18:00',
    shift_type: 'regular',
    status: shift.status === 'working' ? 'scheduled' : 'unavailable',
    notes: shift.notes || undefined,
  };
}

export interface CreateShiftInput {
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type?: string;
  break_minutes?: number;
  status?: string;
  notes?: string;
}

export interface UpdateShiftInput {
  shift_date?: string;
  start_time?: string;
  end_time?: string;
  shift_type?: string;
  break_minutes?: number;
  status?: string;
  notes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * シフト一覧を取得
 */
export async function fetchShifts(params?: {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ShiftFromAPI[]> {
  const searchParams = new URLSearchParams();
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);

  const queryString = searchParams.toString();
  const url = queryString ? `/api/shifts?${queryString}` : '/api/shifts';

  const response = await fetch(url);
  const result: ApiResponse<ShiftFromAPI[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch shifts');
  }

  return result.data || [];
}

/**
 * 特定のシフトを取得
 */
export async function fetchShift(id: string): Promise<ShiftFromAPI> {
  const response = await fetch(`/api/shifts/${id}`);
  const result: ApiResponse<ShiftFromAPI> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch shift');
  }

  return result.data!;
}

/**
 * シフトを作成
 */
export async function createShift(input: CreateShiftInput): Promise<ShiftFromAPI> {
  console.log('[createShift] Input:', JSON.stringify(input, null, 2));

  const response = await fetch('/api/shifts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();
  console.log('[createShift] Response:', JSON.stringify(result, null, 2));

  if (!result.success) {
    const errorMsg = result.message || result.error || 'Failed to create shift';
    console.error('[createShift] Error details:', result.details);
    throw new Error(errorMsg);
  }

  return result.data!;
}

/**
 * シフトを更新
 */
export async function updateShift(id: string, input: UpdateShiftInput): Promise<ShiftFromAPI> {
  const response = await fetch(`/api/shifts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const result: ApiResponse<ShiftFromAPI> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update shift');
  }

  return result.data!;
}

/**
 * シフトを削除
 */
export async function deleteShift(id: string): Promise<void> {
  const response = await fetch(`/api/shifts/${id}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete shift');
  }
}
