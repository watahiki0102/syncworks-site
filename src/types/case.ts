export type ContractStatus = 'confirmed' | 'estimate';
export type SourceType = 'sync' | 'suumo' | 'other_agency' | 'manual';

// 新しく追加する型定義
export type EstimateInputMode = 'calc' | 'manual';
export type MoveDateKind = '希望日' | '確定日';
export type PaymentMethod = '銀行振込' | '現金' | 'クレジットカード' | '請求書';
export type PaymentStatus = '未請求' | '請求済' | '入金待ち' | '入金済' | '保留';

export interface CompanyProfile {
  name: string;
  postal: string;
  address: string;
  tel: string;
  email?: string;
  logoUrl?: string;
}

// 共通型定義から再エクスポート
import { type Employee } from './shared';

export interface CaseCore {
  id: string;
  customerName: string;
  customerPhone?: string;
  sourceType?: SourceType;
  preferredDate: string | null;     // 希望日（なければnull）
  confirmedDate?: string | null;    // 確定日（なければnull）
  arrivalAddress: string;           // 「到着地」に統一
  options?: string[];               // 作業オプション
  priceTaxIncluded?: number | null; // 税込金額
}


export interface CaseAssignment {
  truckId?: string | null;
  truckName?: string | null;
  assignedEmployees?: Employee[];
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  contractStatus: ContractStatus;
}

export type CaseDetail = CaseCore & CaseAssignment;
