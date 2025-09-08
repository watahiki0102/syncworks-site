/**
 * 案件一覧用の統合データ型定義
 * 見積依頼と見積履歴を統合したデータ構造
 */

import { SourceType } from '../types';

/**
 * 統合案件データの型定義
 * 見積依頼(QuoteRequest)と見積履歴(QuoteHistory)を統合
 */
export interface UnifiedCase {
  id: string;
  customerName: string;
  sourceType: SourceType;
  moveDate: string;
  moveTime?: string;
  status: UnifiedCaseStatus;
  type: 'request' | 'history';
  
  // 依頼固有のフィールド
  requestDate?: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
  
  // 履歴固有のフィールド
  responseDate?: string;
  amountWithTax?: number;
  isReQuote?: boolean;
  
  // 共通フィールド
  summary?: {
    fromAddress: string;
    toAddress: string;
    items: string[];
    totalPoints: number;
  };
}

/**
 * 統合ステータス型
 * 依頼と履歴の両方のステータスを包含
 */
export type UnifiedCaseStatus = 
  // 依頼ステータス
  | '見積依頼'     // 未回答
  | '見積済'       // 回答済
  // 履歴ステータス  
  | '再見積'       // 再見積
  | '受注'         // 受注
  | '失注'         // 失注
  | 'キャンセル';   // キャンセル

/**
 * フィルター用のステータスグループ
 */
export interface StatusFilter {
  id: string;
  label: string;
  statuses: UnifiedCaseStatus[];
}

/**
 * 統合案件のフィルター設定
 */
export interface UnifiedCaseFilter {
  status: string;           // 進捗フィルター（未回答・対応中・完了など）
  detailStatus?: string;    // 詳細ステータスフィルター
  type: 'all' | 'request' | 'history'; // タイプフィルター
  sourceType: 'all' | SourceType; // 仲介元フィルター
  searchTerm: string;       // 検索キーワード
}

/**
 * ステータスフィルターの定義
 */
export const STATUS_FILTERS: StatusFilter[] = [
  {
    id: 'all',
    label: '全て',
    statuses: ['見積依頼', '見積済', '再見積', '受注', '失注', 'キャンセル']
  },
  {
    id: 'pending',
    label: '見積依頼',
    statuses: ['見積依頼']
  },
  {
    id: 'in_progress',
    label: '対応中',
    statuses: ['見積済', '再見積']
  },
  {
    id: 'completed',
    label: '完了',
    statuses: ['受注']
  },
  {
    id: 'cancelled',
    label: 'キャンセル・失注',
    statuses: ['失注', 'キャンセル']
  }
];

/**
 * ステータス表示用のスタイル情報
 */
export interface StatusStyle {
  bgColor: string;
  textColor: string;
  label: string;
}

/**
 * ステータススタイルマッピング
 */
export const STATUS_STYLES: Record<UnifiedCaseStatus, StatusStyle> = {
  '見積依頼': { bgColor: 'bg-orange-100', textColor: 'text-orange-800', label: '見積依頼' },
  '見積済': { bgColor: 'bg-blue-100', textColor: 'text-blue-800', label: '見積済' },
  '再見積': { bgColor: 'bg-purple-100', textColor: 'text-purple-800', label: '再見積' },
  '受注': { bgColor: 'bg-green-100', textColor: 'text-green-800', label: '受注' },
  '失注': { bgColor: 'bg-red-100', textColor: 'text-red-800', label: '失注' },
  'キャンセル': { bgColor: 'bg-red-100', textColor: 'text-red-800', label: 'キャンセル' }
};

/**
 * 優先度スタイルマッピング
 */
export const PRIORITY_STYLES = {
  high: { bgColor: 'bg-red-100', textColor: 'text-red-800', label: '高' },
  medium: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', label: '中' },
  low: { bgColor: 'bg-green-100', textColor: 'text-green-800', label: '低' }
} as const;
