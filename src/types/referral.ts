/**
 * 紹介者関連の型定義
 */

/**
 * 利用種別
 */
export type UserType = 'mover' | 'referrer';

/**
 * 紹介者種別
 */
export type ReferrerType = 'company' | 'individual';

/**
 * 振込先情報
 */
export interface BankAccount {
  /** 金融機関コード */
  bankCode: string;
  /** 支店名 */
  branchName: string;
  /** 口座番号 */
  accountNumber: string;
  /** 口座名義（全角カナ） */
  accountHolder: string;
}

/**
 * 紹介者基本情報
 */
export interface ReferrerBase {
  /** 表示名 */
  displayName: string;
  /** 連絡先（電話番号） */
  phone: string;
  /** メールアドレス */
  email: string;
  /** 住所 */
  address: string;
  /** 規約同意 */
  termsAccepted: boolean;
}

/**
 * 会社情報
 */
export interface CompanyInfo extends ReferrerBase {
  /** 会社名 */
  companyName: string;
  /** 部署・担当者 */
  department: string;
  /** 請求先情報 */
  billingInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
  };
}

/**
 * 個人情報
 */
export interface IndividualInfo extends ReferrerBase {
  /** 氏名 */
  fullName: string;
  /** 氏名（カナ） */
  fullNameKana: string;
  /** 税務区分 */
  taxCategory: '個人事業主' | '給与所得者' | '年金所得者' | 'その他';
  /** 源泉徴収フラグ */
  withholdingTax: boolean;
}

/**
 * 紹介者登録情報
 */
export interface ReferrerRegistration {
  /** 紹介者種別 */
  type: ReferrerType;
  /** 基本情報 */
  base: ReferrerBase;
  /** 会社情報（会社の場合） */
  company?: CompanyInfo;
  /** 個人情報（個人の場合） */
  individual?: IndividualInfo;
  /** 振込先情報 */
  bankAccount: BankAccount;
  /** 管理者フラグ */
  isAdmin: boolean;
}

/**
 * 紹介案件のステータス
 */
export type ReferralStatus = 
  | 'pending'      // 待機中
  | 'in_progress'  // 進行中
  | 'completed'    // 完了
  | 'cancelled'    // キャンセル
  | 'expired';     // 期限切れ

/**
 * 紹介案件
 */
export interface ReferralCase {
  /** 紹介ID */
  id: string;
  /** 申込日 */
  applicationDate: string;
  /** 顧客情報（匿名） */
  customer: {
    anonymousId: string;
    area: string;
    movingDate: string;
  };
  /** 紹介者名 */
  referrerName: string;
  /** 紹介者種別 */
  referrerType: ReferrerType;
  /** 希望日 */
  preferredDate: string;
  /** ステータス */
  status: ReferralStatus;
  /** 成約金額 */
  contractAmount?: number;
  /** 最終更新日時 */
  updatedAt: string;
  /** 紹介者ID */
  referrerId: string;
}

/**
 * 紹介状況リストのフィルター条件
 */
export interface ReferralFilter {
  /** ステータス */
  status?: ReferralStatus[];
  /** 紹介者種別 */
  referrerType?: ReferrerType[];
  /** 日付範囲 */
  dateRange?: {
    start: string;
    end: string;
  };
  /** 紹介者名 */
  referrerName?: string;
}

/**
 * 紹介状況リストのソート条件
 */
export interface ReferralSort {
  /** ソートフィールド */
  key: keyof ReferralCase;
  /** ソート方向 */
  direction: 'asc' | 'desc';
}

/**
 * 紹介状況リストの検索パラメータ
 */
export interface ReferralSearchParams {
  /** 検索クエリ */
  query?: string;
  /** フィルター条件 */
  filters?: ReferralFilter;
  /** ソート条件 */
  sort?: ReferralSort;
  /** ページネーション */
  page?: number;
  /** 1ページあたりのアイテム数 */
  limit?: number;
}

/**
 * 紹介状況リストのレスポンス
 */
export interface ReferralListResponse {
  /** 紹介案件一覧 */
  cases: ReferralCase[];
  /** 総件数 */
  total: number;
  /** 現在のページ */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
}

/**
 * 紹介者登録フォームのバリデーションエラー
 */
export interface ReferrerFormErrors {
  [key: string]: string;
}

/**
 * 振込先情報のバリデーションエラー
 */
export interface BankAccountErrors {
  bankCode?: string;
  branchName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

/**
 * 紹介者登録フォームの状態
 */
export interface ReferrerFormState {
  /** 基本情報 */
  base: Partial<ReferrerBase>;
  /** 会社情報 */
  company: Partial<CompanyInfo>;
  /** 個人情報 */
  individual: Partial<IndividualInfo>;
  /** 振込先情報 */
  bankAccount: Partial<BankAccount>;
  /** エラー情報 */
  errors: ReferrerFormErrors & BankAccountErrors;
  /** ローディング状態 */
  isLoading: boolean;
}
