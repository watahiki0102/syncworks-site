/**
 * 祝日データの型定義
 */
export interface Holiday {
  date: string; // YYYY-MM-DD形式
  name: string; // 祝日名
}

/**
 * 祝日データのキャッシュ
 */
let holidayCache: Holiday[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24時間

/**
 * 祝日データを取得
 * キャッシュがあれば使用し、なければAPIから取得
 */
export async function fetchHolidays(): Promise<Holiday[]> {
  const now = Date.now();

  // キャッシュが有効な場合は使用
  if (holidayCache && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    return holidayCache;
  }

  try {
    const response = await fetch('/api/holidays');
    if (!response.ok) {
      throw new Error('祝日データの取得に失敗しました');
    }

    const data = await response.json();
    holidayCache = data.holidays || [];
    lastFetchTime = now;

    return holidayCache || [];
  } catch (error) {
    console.error('祝日データ取得エラー:', error);
    // エラー時は空の配列を返す
    return [];
  }
}

/**
 * 指定した日付が祝日かどうかを判定
 * @param date - YYYY-MM-DD形式の日付文字列、またはDateオブジェクト
 * @param holidays - 祝日データの配列（省略時はキャッシュを使用）
 */
export function isHoliday(
  date: string | Date,
  holidays?: Holiday[]
): boolean {
  const dateStr = typeof date === 'string'
    ? date
    : date.toISOString().split('T')[0];

  const holidayList = holidays || holidayCache || [];
  return holidayList.some(holiday => holiday.date === dateStr);
}

/**
 * 指定した日付の祝日名を取得
 * @param date - YYYY-MM-DD形式の日付文字列、またはDateオブジェクト
 * @param holidays - 祝日データの配列（省略時はキャッシュを使用）
 * @returns 祝日名（祝日でない場合はnull）
 */
export function getHolidayName(
  date: string | Date,
  holidays?: Holiday[]
): string | null {
  const dateStr = typeof date === 'string'
    ? date
    : date.toISOString().split('T')[0];

  const holidayList = holidays || holidayCache || [];
  const holiday = holidayList.find(h => h.date === dateStr);

  return holiday ? holiday.name : null;
}

/**
 * 指定した日付が土曜日かどうかを判定
 */
export function isSaturday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getDay() === 6;
}

/**
 * 指定した日付が日曜日かどうかを判定
 */
export function isSunday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getDay() === 0;
}

/**
 * 指定した日付が週末（土日）かどうかを判定
 */
export function isWeekend(date: string | Date): boolean {
  return isSaturday(date) || isSunday(date);
}

/**
 * 指定した日付が休日（土日祝）かどうかを判定
 */
export function isDayOff(
  date: string | Date,
  holidays?: Holiday[]
): boolean {
  return isWeekend(date) || isHoliday(date, holidays);
}

/**
 * キャッシュをクリア（テスト用）
 */
export function clearHolidayCache(): void {
  holidayCache = null;
  lastFetchTime = null;
}
