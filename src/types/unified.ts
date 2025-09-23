/**
 * 統一型定義 - データ整合性確保のための統合型システム
 * 重複した型定義を統一し、データ一貫性を保つ
 */

// =============================================================================
// 基本エンティティ型（統一版）
// =============================================================================

/**
 * 統一Employee型 - 全てのEmployee参照をこの型に統合
 */
export interface UnifiedEmployee {
  id: string;
  name: string;
  email?: string;
  /** 基本役職 */
  role: EmployeeRole;
  /** 勤務ステータス */
  status: EntityStatus;
  /** 詳細ポジション */
  position?: string;
  /** アクティブ状態（非推奨 - statusを使用） */
  active?: boolean;
  /** 可用性（ビジネスロジック用） */
  isAvailable?: boolean;
  /** シフト情報 */
  shifts?: EmployeeShift[];
  /** 会社ID（ビジネスユーザー用） */
  companyId?: string;
  /** 従業員ID（社内管理用） */
  employeeId?: string;
  /** 雇用日 */
  hireDate?: Date;
}

/**
 * 統一Truck型 - 全てのTruck参照をこの型に統合
 */
export interface UnifiedTruck {
  id: string;
  name: string;
  plateNumber: string;
  truckType: string;
  /** 統一ステータス */
  status: TruckStatus;
  capacityKg: number;
  inspectionExpiry: string;
  schedules: TruckSchedule[];
}

// =============================================================================
// 統一ステータス型
// =============================================================================

/** 統一エンティティステータス */
export type EntityStatus = 'active' | 'inactive' | 'suspended';

/** Employee役職（統一） */
export type EmployeeRole = 'driver' | 'staff' | 'leader' | 'manager';

/** Truck状態（統一） */
export type TruckStatus = 'available' | 'maintenance' | 'inactive' | 'in_use';

/** 契約状態（統一） - shared.tsと同じ定義を使用 */
export type ContractStatus = 'confirmed' | 'estimate';

// =============================================================================
// 関連型定義
// =============================================================================

export interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'available' | 'booked' | 'unavailable' | 'overtime';
  truckScheduleId?: string;
  customerName?: string;
  workType?: string;
  notes?: string;
}

export interface TruckSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  contractStatus?: ContractStatus;
  customerName?: string;
  employeeIds?: string[];
}

// =============================================================================
// 価格計算統一型
// =============================================================================

/**
 * 統一価格設定 - pricing.tsとbusiness-logic.tsの統合
 */
export interface UnifiedPricingConfig {
  /** ポイント単価（円） */
  POINT_UNIT_PRICE: number;
  /** 消費税率 */
  TAX_RATE: number;
  /** 距離料金（1kmあたり） */
  DISTANCE_PRICE_PER_KM: number;
  /** 基本距離（km） */
  BASE_DISTANCE: number;
}

/**
 * 統一見積もり計算パラメータ
 */
// CargoItemは utils/pricing.ts に統一 - 重複解消
export type { CargoItem } from '../utils/pricing';

export interface UnifiedEstimateParams {
  truckType: string;
  items: import('../utils/pricing').CargoItem[];
  options: WorkOption[];
  distance?: number;
  timeSurcharges?: TimeBandSurcharge[];
  taxRate?: number;
}

export interface WorkOption {
  name: string;
  price: number;
  selected: boolean;
}

export interface TimeBandSurcharge {
  id: string;
  start: string;
  end: string;
  kind: 'rate' | 'fixed';
  value: number;
}

// =============================================================================
// バリデーション統一型
// =============================================================================

/**
 * 統一バリデーション結果
 */
export interface UnifiedValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  normalizedData?: any;
}

/**
 * 統一バリデーションルール
 */
export type UnifiedValidationRule<T = unknown> = (value: T) => UnifiedValidationResult;

// =============================================================================
// API統一型
// =============================================================================

/**
 * 統一APIレスポンス型
 */
export interface UnifiedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// =============================================================================
// 型ガード関数（安全な型チェック用）
// =============================================================================

export const isUnifiedEmployee = (obj: any): obj is UnifiedEmployee => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string';
};

export const isUnifiedTruck = (obj: any): obj is UnifiedTruck => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' && 
         typeof obj.plateNumber === 'string';
};

// =============================================================================
// マイグレーション用ヘルパー（既存型からの変換）
// =============================================================================

/**
 * 既存Employee型を統一型に変換
 */
export const migrateToUnifiedEmployee = (oldEmployee: any): UnifiedEmployee => {
  return {
    id: oldEmployee.id,
    name: oldEmployee.name,
    email: oldEmployee.email,
    role: oldEmployee.role === 'employee' ? 'staff' : (oldEmployee.role || 'staff'),
    status: oldEmployee.status === 'active' ? 'active' : 
            oldEmployee.active === true ? 'active' : 
            oldEmployee.isActive === true ? 'active' : 'inactive',
    position: oldEmployee.position,
    isAvailable: oldEmployee.isAvailable,
    shifts: oldEmployee.shifts,
    companyId: oldEmployee.companyId,
    employeeId: oldEmployee.employeeId,
    hireDate: oldEmployee.hireDate,
  };
};

/**
 * 既存Truck型を統一型に変換
 */
export const migrateToUnifiedTruck = (oldTruck: any): UnifiedTruck => {
  return {
    id: oldTruck.id,
    name: oldTruck.name,
    plateNumber: oldTruck.plateNumber,
    truckType: oldTruck.truckType,
    status: oldTruck.status === 'available' ? 'available' :
            oldTruck.status === 'busy' ? 'in_use' :
            oldTruck.status || 'inactive',
    capacityKg: oldTruck.capacityKg,
    inspectionExpiry: oldTruck.inspectionExpiry,
    schedules: oldTruck.schedules || [],
  };
};