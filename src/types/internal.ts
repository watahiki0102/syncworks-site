/**
 * 内部管理画面で使用する型定義
 */

export interface BillingStatusRow {
  id: string;
  partnerName: string;
  month: string;
  amountInclTax: number;
  status: '未請求' | '請求済' | '入金待ち' | '入金済' | '保留';
  updatedAt: string;
}

export interface AccountRow {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer' | 'superadmin';
  active: boolean;
  createdAt: string;
}

export interface PartnerRow {
  id: string;
  name: string;
  type: '引越し業者' | '不動産会社';
  contact: string;
  active: boolean;
}

export interface InvoiceRow {
  id: string;
  partnerId: string;
  partnerName: string;
  billMonth: string;
  totalInclTax: number;
  issued: boolean;
  paid: boolean;
}

export interface ContactRow {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  tel?: string;
  message: string;
  source?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: string;
}
