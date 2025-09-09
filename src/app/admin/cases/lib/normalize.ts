/**
 * 依頼元種別の正規化ライブラリ
 */

export type SourceType = 'syncmoving' | 'suumo' | '外部' | '手動' | string;

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
  const labels: Record<string, string> = {
    'syncmoving': 'SyncMoving',
    'suumo': 'スーモ',
    '外部': '外部',
    '手動': '手動登録'
  };
  
  // 固定値の場合
  if (labels[sourceType]) {
    return labels[sourceType];
  }
  
  // 保存された仲介元名の場合
  const savedNames = IntermediaryService.getSavedNames();
  if (savedNames.includes(sourceType)) {
    return sourceType;
  }
  
  // 見つからない場合のデフォルト
  return sourceType || '外部';
};

/**
 * 依頼元種別が編集可能かどうかを判定する
 * @param sourceType 依頼元種別
 * @returns 編集可能な場合はtrue
 */
export const isSourceTypeEditable = (sourceType: SourceType): boolean => {
  return sourceType !== 'syncmoving';
};

/**
 * 管理ナンバーを生成する（SyncMoving用）
 * @param id 案件ID
 * @returns 管理ナンバー（SM + 生年月日時間秒）
 */
export const generateManagementNumber = (id: string): string => {
  // 案件IDをシードとして使用し、一意な日時を生成
  const numericId = parseInt(id, 10) || 1;
  const baseDate = new Date('2025-01-01T00:00:00');
  const offsetMs = numericId * 3600000; // 1時間ずつずらす
  const targetDate = new Date(baseDate.getTime() + offsetMs);
  
  // YYMMDDHHMMSS形式で生成（年は下2桁のみ）
  const year = String(targetDate.getFullYear()).slice(-2); // 下2桁のみ取得
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const seconds = String(targetDate.getSeconds()).padStart(2, '0');
  
  return `SM${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * 管理ナンバーを取得する（SyncMovingの場合のみ、それ以外は空文字）
 * @param sourceType 依頼元種別
 * @param id 案件ID
 * @returns 管理ナンバーまたは空文字
 */
export const getManagementNumber = (sourceType: SourceType, id: string): string => {
  return sourceType === 'syncmoving' ? generateManagementNumber(id) : '';
};

/**
 * 依頼元種別の表示ラベルを固定幅で取得する（管理ナンバー付き）
 * @param sourceType 正規化された依頼元種別
 * @param id 案件ID（管理ナンバー生成用）
 * @returns 表示用ラベル
 */
export const getSourceTypeLabelWithNumber = (sourceType: SourceType, id: string): string => {
  const baseLabel = getSourceTypeLabel(sourceType);
  if (sourceType === 'syncmoving') {
    const managementNumber = generateManagementNumber(id);
    return `${baseLabel} (${managementNumber})`;
  }
  return baseLabel;
};

/**
 * シンプルな仲介元管理
 */
const INTERMEDIARY_NAMES_KEY = 'intermediary_names';

export class IntermediaryService {
  /**
   * 保存された仲介元名の一覧を取得
   */
  static getSavedNames(): string[] {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(INTERMEDIARY_NAMES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('仲介元名の取得に失敗しました:', error);
      return [];
    }
  }

  /**
   * 新しい仲介元名を追加
   */
  static addName(name: string): void {
    if (typeof window === 'undefined') return;
    if (!name.trim()) return;
    
    const savedNames = this.getSavedNames();
    if (!savedNames.includes(name.trim())) {
      savedNames.push(name.trim());
      try {
        localStorage.setItem(INTERMEDIARY_NAMES_KEY, JSON.stringify(savedNames));
      } catch (error) {
        console.error('仲介元名の保存に失敗しました:', error);
      }
    }
  }

  /**
   * IDで仲介元名を取得（後方互換性のため）
   */
  static getById(id: string): { name: string } | null {
    // 固定値の場合
    const fixedLabels: Record<string, string> = {
      'syncmoving': 'SyncMoving',
      'suumo': 'スーモ',
      '外部': '外部',
      '手動': '手動登録'
    };
    
    if (fixedLabels[id]) {
      return { name: fixedLabels[id] };
    }
    
    // 保存された仲介元名の場合
    const savedNames = this.getSavedNames();
    if (savedNames.includes(id)) {
      return { name: id };
    }
    
    return null;
  }

  /**
   * 初期データを設定
   */
  static initializeTestData(): void {
    if (typeof window === 'undefined') return;
    
    const testNames = ['スーモ', '引越し侍'];
    testNames.forEach(name => this.addName(name));
  }

  /**
   * 選択肢用のデータを取得（他社案件登録用）
   */
  static getSelectOptions() {
    const savedNames = this.getSavedNames();
    const savedOptions = savedNames.map(name => ({
      value: name,
      label: name,
    }));

    return savedOptions;
  }

  /**
   * 全ての選択肢用のデータを取得（管理画面のフィルター用）
   */
  static getAllSelectOptions() {
    const fixedOptions = [
      { value: 'syncmoving', label: 'SyncMoving' },
    ];

    const savedNames = this.getSavedNames();
    const savedOptions = savedNames.map(name => ({
      value: name,
      label: name,
    }));

    return [...fixedOptions, ...savedOptions];
  }
}
