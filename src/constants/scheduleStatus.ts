/**
 * スケジュールステータスの定数定義
 * トラックスケジュールの状態を管理する定数
 */

export interface ScheduleStatusDefinition {
  id: 'available' | 'booked' | 'maintenance';
  name: string;
  displayName: string;
  color: string;
  description: string;
}

/**
 * スケジュールステータスの定義
 * 各ステータスの表示名、色、説明を設定
 */
export const SCHEDULE_STATUSES: ScheduleStatusDefinition[] = [
  {
    id: 'available',
    name: 'available',
    displayName: '空き',
    color: 'bg-gray-50 border-gray-200',
    description: '予約可能な時間帯'
  },
  {
    id: 'booked',
    name: 'booked',
    displayName: '予約済み',
    color: 'bg-blue-200 border-blue-300',
    description: '既に予約が入っている時間帯'
  },
  {
    id: 'maintenance',
    name: 'maintenance',
    displayName: '整備中',
    color: 'bg-yellow-200 border-yellow-300',
    description: 'トラック整備中の時間帯'
  }
];

/**
 * スケジュールステータスのID一覧
 */
export const SCHEDULE_STATUS_IDS = SCHEDULE_STATUSES.map(status => status.id);

/**
 * スケジュールステータスの表示名一覧
 */
export const SCHEDULE_STATUS_NAMES = SCHEDULE_STATUSES.map(status => status.displayName);

/**
 * ステータスIDからステータス定義を取得する
 * @param id - ステータスID
 * @returns ステータス定義
 */
export const getScheduleStatusById = (id: string): ScheduleStatusDefinition | undefined => {
  return SCHEDULE_STATUSES.find(status => status.id === id);
};

/**
 * ステータスIDから表示名を取得する
 * @param id - ステータスID
 * @returns 表示名
 */
export const getScheduleStatusDisplayName = (id: string): string => {
  const status = getScheduleStatusById(id);
  return status?.displayName || '不明';
};

/**
 * ステータスIDから色クラスを取得する
 * @param id - ステータスID
 * @returns 色クラス
 */
export const getScheduleStatusColor = (id: string): string => {
  const status = getScheduleStatusById(id);
  return status?.color || 'bg-gray-50 border-gray-200';
}; 