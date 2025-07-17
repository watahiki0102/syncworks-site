/**
 * 作業区分の定数定義
 * 引っ越し作業で使用される作業種別を定義
 */

export interface WorkTypeDefinition {
  id: 'loading' | 'moving' | 'unloading' | 'maintenance';
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * 作業区分の定義
 * 各作業区分の表示名、アイコン、色を設定
 */
export const WORK_TYPES: WorkTypeDefinition[] = [
  {
    id: 'loading',
    name: 'loading',
    displayName: '積込',
    icon: '📦',
    color: 'bg-blue-100 text-blue-800',
    description: '荷物をトラックに積み込む作業'
  },
  {
    id: 'moving',
    name: 'moving',
    displayName: '移動',
    icon: '🚚',
    color: 'bg-green-100 text-green-800',
    description: 'トラックでの荷物の移動作業'
  },
  {
    id: 'unloading',
    name: 'unloading',
    displayName: '積卸',
    icon: '📥',
    color: 'bg-purple-100 text-purple-800',
    description: 'トラックから荷物を降ろす作業'
  },
  {
    id: 'maintenance',
    name: 'maintenance',
    displayName: '整備',
    icon: '🔧',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'トラックの整備・点検作業'
  }
];

/**
 * 作業区分のID一覧
 */
export const WORK_TYPE_IDS = WORK_TYPES.map(type => type.id);

/**
 * 作業区分の表示名一覧
 */
export const WORK_TYPE_NAMES = WORK_TYPES.map(type => type.displayName);

/**
 * 作業区分IDから作業区分定義を取得する
 * @param id - 作業区分ID
 * @returns 作業区分定義
 */
export const getWorkTypeById = (id: string): WorkTypeDefinition | undefined => {
  return WORK_TYPES.find(type => type.id === id);
};

/**
 * 作業区分IDから表示名を取得する
 * @param id - 作業区分ID
 * @returns 表示名
 */
export const getWorkTypeDisplayName = (id: string): string => {
  const workType = getWorkTypeById(id);
  return workType?.displayName || '不明';
};

/**
 * 作業区分IDからアイコンを取得する
 * @param id - 作業区分ID
 * @returns アイコン
 */
export const getWorkTypeIcon = (id: string): string => {
  const workType = getWorkTypeById(id);
  return workType?.icon || '📋';
};

/**
 * 作業区分IDから色クラスを取得する
 * @param id - 作業区分ID
 * @returns 色クラス
 */
export const getWorkTypeColor = (id: string): string => {
  const workType = getWorkTypeById(id);
  return workType?.color || 'bg-gray-100 text-gray-800';
}; 