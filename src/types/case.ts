export type ContractStatus = 'confirmed' | 'estimate';
export type SourceType = 'sync' | 'suumo' | 'other_agency' | 'manual';

export interface EmployeeRef {
  id: string;
  name: string;
  role?: string;
}

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
  assignedEmployees?: EmployeeRef[];
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  contractStatus: ContractStatus;
}

export type CaseDetail = CaseCore & CaseAssignment;
