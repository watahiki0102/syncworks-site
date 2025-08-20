/**
 * 依頼元種別の正規化ライブラリ
 */

export type SourceType = 'syncmoving' | 'suumo' | '外部' | '手動';

/**
 * 依頼元種別を正規化する
 * @param raw 生の依頼元種別文字列
 * @returns 正規化された依頼元種別
 */
export const normalizeSourceType = (raw?: string): SourceType => {
  if (!raw) return '外部';
  if (raw === 'sync') return 'syncmoving';
  const ok = new Set(['syncmoving', 'suumo', '外部', '手動']);
  return ok.has(raw) ? (raw as SourceType) : '外部';
};

/**
 * 依頼元種別の表示ラベルを取得する
 * @param sourceType 正規化された依頼元種別
 * @returns 表示用ラベル
 */
export const getSourceTypeLabel = (sourceType: SourceType): string => {
  const labels: Record<SourceType, string> = {
    'syncmoving': 'SyncMoving',
    'suumo': 'スーモ',
    '外部': '外部',
    '手動': '手動登録'
  };
  return labels[sourceType];
};

/**
 * 依頼元種別が編集可能かどうかを判定する
 * @param sourceType 依頼元種別
 * @returns 編集可能な場合はtrue
 */
export const isSourceTypeEditable = (sourceType: SourceType): boolean => {
  return sourceType !== 'syncmoving';
};
