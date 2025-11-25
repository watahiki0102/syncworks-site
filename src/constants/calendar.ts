/**
 * カレンダー関連の定数
 */

/**
 * 日本語の曜日配列（日〜土）
 */
export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * ビュー切り替えラベル
 */
export const VIEW_MODE_LABELS = {
  month: '月',
  week: '週',
  day: '日',
};

/**
 * 従業員シフト管理関連の定数
 */

/**
 * 時間帯定義（30分単位）
 */
export const TIME_SLOTS = [
  { id: '00:00', label: '00:00-00:30', start: '00:00', end: '00:30', color: 'bg-gray-200 text-gray-700' },
  { id: '00:30', label: '00:30-01:00', start: '00:30', end: '01:00', color: 'bg-gray-200 text-gray-700' },
  { id: '01:00', label: '01:00-01:30', start: '01:00', end: '01:30', color: 'bg-gray-200 text-gray-700' },
  { id: '01:30', label: '01:30-02:00', start: '01:30', end: '02:00', color: 'bg-gray-200 text-gray-700' },
  { id: '02:00', label: '02:00-02:30', start: '02:00', end: '02:30', color: 'bg-gray-200 text-gray-700' },
  { id: '02:30', label: '02:30-03:00', start: '02:30', end: '03:00', color: 'bg-gray-200 text-gray-700' },
  { id: '03:00', label: '03:00-03:30', start: '03:00', end: '03:30', color: 'bg-gray-200 text-gray-700' },
  { id: '03:30', label: '03:30-04:00', start: '03:30', end: '04:00', color: 'bg-gray-200 text-gray-700' },
  { id: '04:00', label: '04:00-04:30', start: '04:00', end: '04:30', color: 'bg-gray-200 text-gray-700' },
  { id: '04:30', label: '04:30-05:00', start: '04:30', end: '05:00', color: 'bg-gray-200 text-gray-700' },
  { id: '05:00', label: '05:00-05:30', start: '05:00', end: '05:30', color: 'bg-gray-200 text-gray-700' },
  { id: '05:30', label: '05:30-06:00', start: '05:30', end: '06:00', color: 'bg-gray-200 text-gray-700' },
  { id: '06:00', label: '06:00-06:30', start: '06:00', end: '06:30', color: 'bg-gray-200 text-gray-700' },
  { id: '06:30', label: '06:30-07:00', start: '06:30', end: '07:00', color: 'bg-gray-200 text-gray-700' },
  { id: '07:00', label: '07:00-07:30', start: '07:00', end: '07:30', color: 'bg-blue-100 text-blue-800' },
  { id: '07:30', label: '07:30-08:00', start: '07:30', end: '08:00', color: 'bg-blue-100 text-blue-800' },
  { id: '08:00', label: '08:00-08:30', start: '08:00', end: '08:30', color: 'bg-blue-100 text-blue-800' },
  { id: '08:30', label: '08:30-09:00', start: '08:30', end: '09:00', color: 'bg-blue-100 text-blue-800' },
  { id: '09:00', label: '09:00-09:30', start: '09:00', end: '09:30', color: 'bg-green-100 text-green-800' },
  { id: '09:30', label: '09:30-10:00', start: '09:30', end: '10:00', color: 'bg-green-100 text-green-800' },
  { id: '10:00', label: '10:00-10:30', start: '10:00', end: '10:30', color: 'bg-green-100 text-green-800' },
  { id: '10:30', label: '10:30-11:00', start: '10:30', end: '11:00', color: 'bg-green-100 text-green-800' },
  { id: '11:00', label: '11:00-11:30', start: '11:00', end: '11:30', color: 'bg-green-100 text-green-800' },
  { id: '11:30', label: '11:30-12:00', start: '11:30', end: '12:00', color: 'bg-green-100 text-green-800' },
  { id: '12:00', label: '12:00-12:30', start: '12:00', end: '12:30', color: 'bg-yellow-100 text-yellow-800' },
  { id: '12:30', label: '12:30-13:00', start: '12:30', end: '13:00', color: 'bg-yellow-100 text-yellow-800' },
  { id: '13:00', label: '13:00-13:30', start: '13:00', end: '13:30', color: 'bg-yellow-100 text-yellow-800' },
  { id: '13:30', label: '13:30-14:00', start: '13:30', end: '14:00', color: 'bg-yellow-100 text-yellow-800' },
  { id: '14:00', label: '14:00-14:30', start: '14:00', end: '14:30', color: 'bg-yellow-100 text-yellow-800' },
  { id: '14:30', label: '14:30-15:00', start: '14:30', end: '15:00', color: 'bg-yellow-100 text-yellow-800' },
  { id: '15:00', label: '15:00-15:30', start: '15:00', end: '15:30', color: 'bg-purple-100 text-purple-800' },
  { id: '15:30', label: '15:30-16:00', start: '15:30', end: '16:00', color: 'bg-purple-100 text-purple-800' },
  { id: '16:00', label: '16:00-16:30', start: '16:00', end: '16:30', color: 'bg-purple-100 text-purple-800' },
  { id: '16:30', label: '16:30-17:00', start: '16:30', end: '17:00', color: 'bg-purple-100 text-purple-800' },
  { id: '17:00', label: '17:00-17:30', start: '17:00', end: '17:30', color: 'bg-purple-100 text-purple-800' },
  { id: '17:30', label: '17:30-18:00', start: '17:30', end: '18:00', color: 'bg-purple-100 text-purple-800' },
  { id: '18:00', label: '18:00-18:30', start: '18:00', end: '18:30', color: 'bg-gray-100 text-gray-800' },
  { id: '18:30', label: '18:30-19:00', start: '18:30', end: '19:00', color: 'bg-gray-100 text-gray-800' },
  { id: '19:00', label: '19:00-19:30', start: '19:00', end: '19:30', color: 'bg-gray-100 text-gray-800' },
  { id: '19:30', label: '19:30-20:00', start: '19:30', end: '20:00', color: 'bg-gray-100 text-gray-800' },
  { id: '20:00', label: '20:00-20:30', start: '20:00', end: '20:30', color: 'bg-gray-100 text-gray-800' },
  { id: '20:30', label: '20:30-21:00', start: '20:30', end: '21:00', color: 'bg-gray-100 text-gray-800' },
  { id: '21:00', label: '21:00-21:30', start: '21:00', end: '21:30', color: 'bg-gray-300 text-gray-800' },
  { id: '21:30', label: '21:30-22:00', start: '21:30', end: '22:00', color: 'bg-gray-300 text-gray-800' },
  { id: '22:00', label: '22:00-22:30', start: '22:00', end: '22:30', color: 'bg-gray-300 text-gray-800' },
  { id: '22:30', label: '22:30-23:00', start: '22:30', end: '23:00', color: 'bg-gray-300 text-gray-800' },
  { id: '23:00', label: '23:00-23:30', start: '23:00', end: '23:30', color: 'bg-gray-300 text-gray-800' },
  { id: '23:30', label: '23:30-24:00', start: '23:30', end: '24:00', color: 'bg-gray-300 text-gray-800' },
];

/**
 * シフトステータス
 */
export const SHIFT_STATUS = {
  working: { label: '出勤', color: 'bg-lime-100 text-lime-800', icon: '✅' },
  unavailable: { label: '出勤不可', color: 'bg-gray-100 text-gray-800', icon: '❌' },
  // 旧ステータス（後方互換性のため残す）
  confirmed: { label: '確定済み', color: 'bg-green-100 text-green-800', icon: '✅' },
  booked: { label: '配車済み', color: 'bg-blue-100 text-blue-800', icon: '🚚' },
  overtime: { label: '前日残業あり', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  available: { label: '稼働可能', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
} as const;

/**
 * 従業員役職
 */
export const EMPLOYEE_POSITIONS = [
  'ドライバー',
  '作業員',
  'リーダー',
  '管理者',
] as const;

/**
 * シフトテンプレート関連の定数
 */
export const WEEKDAYS_EN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * 重複チェック結果
 */
export const DUPLICATE_STATUS = {
  none: { label: '重複なし', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
  partial: { label: '部分重複', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  full: { label: '完全重複', color: 'bg-red-100 text-red-800', icon: '🔴' },
  working: { label: '登録可能', color: 'bg-green-100 text-green-800', icon: '🟢' },
} as const;

/**
 * 時間帯マッピング定義
 * フォーム入力の時間帯文字列を実際の作業時間に変換
 */
export const TIME_RANGE_MAPPINGS = {
  // 基本時間帯
  '早朝': { startTime: '06:00', endTime: '09:00' },
  '早朝（6～9時）': { startTime: '06:00', endTime: '09:00' },
  '午前': { startTime: '09:00', endTime: '12:00' },
  '午前中': { startTime: '09:00', endTime: '12:00' },
  '午前（9～12時）': { startTime: '09:00', endTime: '12:00' },
  '午後': { startTime: '13:00', endTime: '17:00' },
  '午後（12～15時）': { startTime: '12:00', endTime: '15:00' },
  '夕方': { startTime: '16:00', endTime: '19:00' },
  '夕方（15～18時）': { startTime: '15:00', endTime: '18:00' },
  '夜間': { startTime: '18:00', endTime: '21:00' },
  '夜間（18～21時）': { startTime: '18:00', endTime: '21:00' },
  // 組み合わせ時間帯
  '早朝以外': { startTime: '09:00', endTime: '21:00' },
  '早朝以外（9～21時）': { startTime: '09:00', endTime: '21:00' },
  '夜間以外': { startTime: '06:00', endTime: '18:00' },
  '夜間以外（6～18時）': { startTime: '06:00', endTime: '18:00' },
  '早朝・夜間以外': { startTime: '09:00', endTime: '18:00' },
  '早朝・夜間以外（9～18時）': { startTime: '09:00', endTime: '18:00' },
} as const;

/**
 * 時間帯文字列を開始・終了時刻に変換
 * @param timeString 時間帯文字列（例: "午前中", "10:00～12:00"）
 * @returns 開始・終了時刻のオブジェクト、または null
 */
export function parseTimeRange(timeString?: string): { startTime: string; endTime: string } | null {
  if (!timeString) {return null;}

  // "10:00～12:00" や "10:00-12:00" 形式の時刻範囲
  const rangeMatch = timeString.match(/(\d{1,2}):(\d{2})[～~\-](\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    return {
      startTime: `${rangeMatch[1].padStart(2, '0')}:${rangeMatch[2]}`,
      endTime: `${rangeMatch[3].padStart(2, '0')}:${rangeMatch[4]}`
    };
  }

  // 時間帯名称でのマッピング
  const mapping = TIME_RANGE_MAPPINGS[timeString as keyof typeof TIME_RANGE_MAPPINGS];
  if (mapping) {
    return mapping;
  }

  // 部分一致チェック（柔軟性のため）
  if (timeString.includes('午前')) {
    return TIME_RANGE_MAPPINGS['午前中'];
  }
  if (timeString.includes('午後')) {
    return TIME_RANGE_MAPPINGS['午後'];
  }
  if (timeString.includes('夕方')) {
    return TIME_RANGE_MAPPINGS['夕方'];
  }
  if (timeString.includes('早朝')) {
    return TIME_RANGE_MAPPINGS['早朝'];
  }
  if (timeString.includes('夜間')) {
    return TIME_RANGE_MAPPINGS['夜間'];
  }

  return null;
} 