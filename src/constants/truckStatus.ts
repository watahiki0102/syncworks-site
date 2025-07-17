/**
 * トラックステータスの定数定義
 */

/**
 * トラックステータスの表示ラベル
 */
export const TRUCK_STATUS_LABELS = {
  available: '稼働中',
  maintenance: '整備中',
  inactive: '停止中',
} as const;

/**
 * トラックステータスの色クラス
 */
export const TRUCK_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-red-100 text-red-800',
} as const; 