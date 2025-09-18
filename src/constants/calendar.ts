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
];

/**
 * シフトステータス
 */
export const SHIFT_STATUS = {
  confirmed: { label: '確定済み', color: 'bg-green-100 text-green-800', icon: '✅' },
  booked: { label: '配車済み', color: 'bg-blue-100 text-blue-800', icon: '🚚' },
  unavailable: { label: '非稼働/休み', color: 'bg-red-100 text-red-800', icon: '❌' },
  overtime: { label: '前日残業あり', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  provisional: { label: '仮登録', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
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
  available: { label: '登録可能', color: 'bg-green-100 text-green-800', icon: '🟢' },
} as const; 