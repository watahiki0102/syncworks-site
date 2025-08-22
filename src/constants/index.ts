/**
 * 定数ファイルの統合エクスポート
 * アプリケーション全体で使用する定数を一元管理
 */

// 各種定数ファイルのインポート
export * from './calendar';
export * from './case';
export * from './items';
export * from './scheduleStatus';
export * from './testData';
export * from './truckStatus';
export * from './truckTypes';
export * from './workTypes';

/**
 * アプリケーション共通定数
 */

/**
 * 通貨関連定数
 */
export const CURRENCY = {
  /** 日本円 */
  JPY: 'JPY',
  /** 米ドル */
  USD: 'USD'
} as const;

/**
 * 税率定数
 */
export const TAX_RATES = {
  /** 消費税率（10%） */
  CONSUMPTION_TAX: 0.1,
  /** 軽減税率（8%） */
  REDUCED_TAX: 0.08
} as const;

/**
 * ページネーション定数
 */
export const PAGINATION = {
  /** デフォルトページサイズ */
  DEFAULT_PAGE_SIZE: 20,
  /** 最大ページサイズ */
  MAX_PAGE_SIZE: 100,
  /** 最小ページサイズ */
  MIN_PAGE_SIZE: 5
} as const;

/**
 * 日付フォーマット定数
 */
export const DATE_FORMATS = {
  /** 表示用日付フォーマット */
  DISPLAY_DATE: 'YYYY-MM-DD',
  /** 表示用日時フォーマット */
  DISPLAY_DATETIME: 'YYYY-MM-DD HH:mm',
  /** API用日時フォーマット */
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  /** 時刻フォーマット */
  TIME: 'HH:mm'
} as const;

/**
 * ファイルサイズ制限（バイト）
 */
export const FILE_SIZE_LIMITS = {
  /** 画像ファイル最大サイズ（5MB） */
  IMAGE_MAX: 5 * 1024 * 1024,
  /** ドキュメント最大サイズ（10MB） */
  DOCUMENT_MAX: 10 * 1024 * 1024,
  /** 一般ファイル最大サイズ（2MB） */
  GENERAL_MAX: 2 * 1024 * 1024
} as const;

/**
 * 許可されるファイル形式
 */
export const ALLOWED_FILE_TYPES = {
  /** 画像ファイル */
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  /** ドキュメントファイル */
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  /** 表計算ファイル */
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
} as const;

/**
 * バリデーション定数
 */
export const VALIDATION_LIMITS = {
  /** 顧客名の最大文字数 */
  CUSTOMER_NAME_MAX: 100,
  /** 住所の最大文字数 */
  ADDRESS_MAX: 200,
  /** メモの最大文字数 */
  MEMO_MAX: 1000,
  /** 電話番号の最大文字数 */
  PHONE_MAX: 20,
  /** 最小パスワード長 */
  PASSWORD_MIN: 8,
  /** 最大パスワード長 */
  PASSWORD_MAX: 128
} as const;

/**
 * API エンドポイント定数
 */
export const API_ENDPOINTS = {
  /** 認証関連 */
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  /** 案件関連 */
  CASES: {
    LIST: '/api/cases',
    DETAIL: '/api/cases',
    CREATE: '/api/cases',
    UPDATE: '/api/cases',
    DELETE: '/api/cases'
  },
  /** 見積もり関連 */
  QUOTES: {
    LIST: '/api/quotes',
    DETAIL: '/api/quotes',
    CREATE: '/api/quotes',
    UPDATE: '/api/quotes'
  },
  /** トラック関連 */
  TRUCKS: {
    LIST: '/api/trucks',
    DETAIL: '/api/trucks',
    CREATE: '/api/trucks',
    UPDATE: '/api/trucks'
  }
} as const;

/**
 * ローカルストレージキー定数
 */
export const STORAGE_KEYS = {
  /** 管理者ログイン状態 */
  ADMIN_LOGGED_IN: 'adminLoggedIn',
  /** 管理者メールアドレス */
  ADMIN_EMAIL: 'adminEmail',
  /** 自動ログイン有効期限 */
  ADMIN_AUTO_LOGIN_EXPIRY: 'adminAutoLoginExpiry',
  /** ログイン記憶フラグ */
  ADMIN_REMEMBER_ME: 'adminRememberMe',
  /** フォーム下書きデータ */
  FORM_DRAFT_PREFIX: 'formDraft_',
  /** ユーザー設定 */
  USER_SETTINGS: 'userSettings'
} as const;

/**
 * UI関連定数
 */
export const UI_CONSTANTS = {
  /** デバウンス時間（ミリ秒） */
  DEBOUNCE_TIME: 300,
  /** トースト表示時間（ミリ秒） */
  TOAST_DURATION: 3000,
  /** アニメーション時間（ミリ秒） */
  ANIMATION_DURATION: 200,
  /** モバイルブレークポイント */
  MOBILE_BREAKPOINT: 768,
  /** タブレットブレークポイント */
  TABLET_BREAKPOINT: 1024
} as const;

/**
 * 正規表現パターン
 */
export const REGEX_PATTERNS = {
  /** 日本の電話番号 */
  JAPANESE_PHONE: /^[0-9-+\s()]+$/,
  /** 日本の郵便番号 */
  JAPANESE_ZIP: /^\d{3}-\d{4}$/,
  /** メールアドレス */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** カタカナ */
  KATAKANA: /^[ァ-ヶー\s]*$/,
  /** ひらがな */
  HIRAGANA: /^[ぁ-ゖー\s]*$/,
  /** 半角数字のみ */
  NUMBERS_ONLY: /^\d+$/,
  /** 半角英数字のみ */
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/
} as const;

/**
 * エラーメッセージ定数
 */
export const ERROR_MESSAGES = {
  /** 必須入力エラー */
  REQUIRED: '必須項目です',
  /** メールアドレス形式エラー */
  INVALID_EMAIL: '正しいメールアドレスを入力してください',
  /** 電話番号形式エラー */
  INVALID_PHONE: '正しい電話番号を入力してください',
  /** 日付形式エラー */
  INVALID_DATE: '正しい日付を入力してください',
  /** 数値形式エラー */
  INVALID_NUMBER: '数値を入力してください',
  /** ファイルサイズエラー */
  FILE_SIZE_EXCEEDED: 'ファイルサイズが制限を超えています',
  /** ファイル形式エラー */
  INVALID_FILE_TYPE: '許可されていないファイル形式です',
  /** ネットワークエラー */
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  /** 認証エラー */
  AUTH_ERROR: '認証に失敗しました',
  /** 権限エラー */
  PERMISSION_ERROR: 'この操作を行う権限がありません',
  /** 一般的なエラー */
  GENERAL_ERROR: 'エラーが発生しました'
} as const;

/**
 * 成功メッセージ定数
 */
export const SUCCESS_MESSAGES = {
  /** 保存成功 */
  SAVED: '保存しました',
  /** 更新成功 */
  UPDATED: '更新しました',
  /** 削除成功 */
  DELETED: '削除しました',
  /** 作成成功 */
  CREATED: '作成しました',
  /** 送信成功 */
  SENT: '送信しました',
  /** ログイン成功 */
  LOGIN_SUCCESS: 'ログインしました',
  /** ログアウト成功 */
  LOGOUT_SUCCESS: 'ログアウトしました'
} as const;