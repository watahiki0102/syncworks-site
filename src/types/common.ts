/**
 * 共通型定義ファイル
 * アプリケーション全体で使用する基本的な型定義を提供
 */

/**
 * 基本的なID型
 */
export type ID = string | number;

/**
 * APIレスポンスの基本型
 */
export interface ApiResponse<T = unknown> {
  /** レスポンスデータ */
  data: T;
  /** 成功フラグ */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  message?: string;
  /** エラーコード（失敗時） */
  errorCode?: string;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  /** 現在のページ番号 */
  page: number;
  /** 1ページあたりのアイテム数 */
  limit: number;
  /** 総アイテム数 */
  total: number;
  /** 総ページ数 */
  totalPages: number;
  /** 前のページがあるかどうか */
  hasPrevious: boolean;
  /** 次のページがあるかどうか */
  hasNext: boolean;
}

/**
 * ページネーション付きデータの型
 */
export interface PaginatedData<T> {
  /** データ配列 */
  items: T[];
  /** ページネーション情報 */
  pagination: Pagination;
}

/**
 * ソート方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * ソート設定
 */
export interface SortConfig<T = string> {
  /** ソート対象のフィールド */
  field: T;
  /** ソート方向 */
  direction: SortDirection;
}

/**
 * フィルター条件の基本型
 */
export interface FilterCondition<T = unknown> {
  /** フィールド名 */
  field: string;
  /** 演算子 */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  /** 値 */
  value: T;
}

/**
 * 検索・フィルター・ソートパラメータ
 */
export interface SearchParams<T = string> {
  /** 検索クエリ */
  query?: string;
  /** フィルター条件 */
  filters?: FilterCondition[];
  /** ソート設定 */
  sort?: SortConfig<T>;
  /** ページネーション */
  page?: number;
  /** 1ページあたりのアイテム数 */
  limit?: number;
}

/**
 * 日付範囲
 */
export interface DateRange {
  /** 開始日 */
  startDate: string;
  /** 終了日 */
  endDate: string;
}

/**
 * 住所情報
 */
export interface Address {
  /** 郵便番号 */
  zipCode?: string;
  /** 都道府県 */
  prefecture: string;
  /** 市区町村 */
  city: string;
  /** 町名・番地 */
  streetAddress: string;
  /** 建物名・部屋番号 */
  building?: string;
  /** 完全な住所（表示用） */
  fullAddress?: string;
}

/**
 * 連絡先情報
 */
export interface ContactInfo {
  /** 名前 */
  name: string;
  /** 名前（カナ） */
  nameKana?: string;
  /** メールアドレス */
  email?: string;
  /** 電話番号 */
  phone?: string;
  /** 住所 */
  address?: Address;
}

/**
 * ファイル情報
 */
export interface FileInfo {
  /** ファイルID */
  id: string;
  /** ファイル名 */
  name: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** MIMEタイプ */
  type: string;
  /** アップロード日時 */
  uploadedAt: string;
  /** ファイルURL */
  url: string;
}

/**
 * 通貨型
 */
export type Currency = 'JPY' | 'USD';

/**
 * 金額情報
 */
export interface Amount {
  /** 金額 */
  value: number;
  /** 通貨 */
  currency: Currency;
  /** 税込みかどうか */
  includesTax?: boolean;
  /** 税率 */
  taxRate?: number;
}

/**
 * 期間情報
 */
export interface Period {
  /** 開始日時 */
  startDateTime: string;
  /** 終了日時 */
  endDateTime: string;
  /** 全日フラグ */
  allDay?: boolean;
}

/**
 * 位置情報
 */
export interface Location {
  /** 緯度 */
  latitude: number;
  /** 経度 */
  longitude: number;
  /** 住所（オプション） */
  address?: string;
}

/**
 * ステータス基底型
 */
export interface BaseStatus {
  /** ステータス値 */
  value: string;
  /** 表示名 */
  label: string;
  /** 説明 */
  description?: string;
  /** カラー（UI表示用） */
  color?: string;
}

/**
 * 汎用的なオプション項目
 */
export interface Option<T = string> {
  /** 値 */
  value: T;
  /** 表示ラベル */
  label: string;
  /** 無効化フラグ */
  disabled?: boolean;
  /** 説明 */
  description?: string;
  /** アイコン（オプション） */
  icon?: string;
}

/**
 * ユーザー基本情報
 */
export interface BaseUser {
  /** ユーザーID */
  id: string;
  /** 名前 */
  name: string;
  /** メールアドレス */
  email: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * タイムスタンプ情報
 */
export interface Timestamps {
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 削除日時（論理削除用） */
  deletedAt?: string;
}

/**
 * エンティティの基底型
 */
export interface BaseEntity extends Timestamps {
  /** エンティティID */
  id: string;
}

/**
 * 作成者・更新者情報付きエンティティ
 */
export interface AuditableEntity extends BaseEntity {
  /** 作成者ID */
  createdBy?: string;
  /** 更新者ID */
  updatedBy?: string;
}

/**
 * 検索結果のハイライト情報
 */
export interface SearchHighlight {
  /** フィールド名 */
  field: string;
  /** ハイライトされたテキスト */
  text: string;
}

/**
 * エラー情報
 */
export interface ErrorInfo {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** 詳細情報 */
  details?: Record<string, unknown>;
  /** スタックトレース（開発環境用） */
  stack?: string;
}

/**
 * 汎用的なキー・バリューペア
 */
export interface KeyValue<T = unknown> {
  /** キー */
  key: string;
  /** 値 */
  value: T;
}

// 型定義はexportのみで、default exportは不要