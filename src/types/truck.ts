/**
 * トラック型定義
 */

/**
 * フロントエンド用のトラック型（データベースのtrucksテーブルに合わせる）
 * schedulesは別途管理（jobs/shiftsテーブルから取得）
 */
export interface Truck {
  id: string;
  companyId: string;
  truckNumber: string;
  licensePlate: string;
  truckType: string;
  capacityCbm: number;
  maxLoadKg: number;
  hasLiftGate: boolean;
  hasAirConditioning: boolean;
  manufactureYear?: number;
  manufacturer?: string;
  modelName?: string;
  lastInspectionDate?: string;
  nextInspectionDate: string;
  fuelType?: string;
  fuelEfficiencyKmpl?: number;
  insuranceExpiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // 表示用の計算フィールド（オプション、dispatch/page.tsxで使用）
  schedules?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    contractStatus?: string;
    customerName?: string;
    customerPhone?: string;
    workType?: string;
    description?: string;
    capacity?: number;
    points?: number;
    origin?: string;
    destination?: string;
    [key: string]: unknown;
  }>;
}

/**
 * データベースから取得するトラックデータの型（Prismaから）
 */
export interface TruckFromDB {
  id: string;
  company_id: string;
  truck_number: string;
  license_plate: string;
  truck_type: string;
  capacity_cbm: number | string;
  max_load_kg: number;
  has_lift_gate: boolean;
  has_air_conditioning: boolean;
  manufacture_year: number | null;
  manufacturer: string | null;
  model_name: string | null;
  last_inspection_date: Date | string | null;
  next_inspection_date: Date | string;
  fuel_type: string | null;
  fuel_efficiency_kmpl: number | string | null;
  insurance_expiry_date: Date | string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * トラック作成用の入力型
 */
export interface CreateTruckInput {
  company_id: string;
  truck_number: string;
  license_plate: string;
  truck_type: string;
  capacity_cbm: number;
  max_load_kg: number;
  has_lift_gate?: boolean;
  has_air_conditioning?: boolean;
  manufacture_year?: number;
  manufacturer?: string;
  model_name?: string;
  last_inspection_date?: string;
  next_inspection_date: string;
  fuel_type?: string;
  fuel_efficiency_kmpl?: number;
  insurance_expiry_date: string;
  status?: string;
}

/**
 * トラック更新用の入力型
 */
export interface UpdateTruckInput {
  truck_number?: string;
  license_plate?: string;
  truck_type?: string;
  capacity_cbm?: number;
  max_load_kg?: number;
  has_lift_gate?: boolean;
  has_air_conditioning?: boolean;
  manufacture_year?: number;
  manufacturer?: string;
  model_name?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
  fuel_type?: string;
  fuel_efficiency_kmpl?: number;
  insurance_expiry_date?: string;
  status?: string;
}

/**
 * DBデータをフロントエンド用に変換
 */
export function mapTruckFromDB(dbTruck: TruckFromDB): Truck {
  return {
    id: dbTruck.id,
    companyId: dbTruck.company_id,
    truckNumber: dbTruck.truck_number,
    licensePlate: dbTruck.license_plate,
    truckType: dbTruck.truck_type,
    capacityCbm: typeof dbTruck.capacity_cbm === 'string' ? parseFloat(dbTruck.capacity_cbm) : dbTruck.capacity_cbm,
    maxLoadKg: dbTruck.max_load_kg,
    hasLiftGate: dbTruck.has_lift_gate,
    hasAirConditioning: dbTruck.has_air_conditioning,
    manufactureYear: dbTruck.manufacture_year || undefined,
    manufacturer: dbTruck.manufacturer || undefined,
    modelName: dbTruck.model_name || undefined,
    lastInspectionDate: dbTruck.last_inspection_date
      ? typeof dbTruck.last_inspection_date === 'string'
        ? dbTruck.last_inspection_date
        : dbTruck.last_inspection_date.toISOString().split('T')[0]
      : undefined,
    nextInspectionDate: typeof dbTruck.next_inspection_date === 'string'
      ? dbTruck.next_inspection_date
      : dbTruck.next_inspection_date.toISOString().split('T')[0],
    fuelType: dbTruck.fuel_type || undefined,
    fuelEfficiencyKmpl: dbTruck.fuel_efficiency_kmpl
      ? typeof dbTruck.fuel_efficiency_kmpl === 'string'
        ? parseFloat(dbTruck.fuel_efficiency_kmpl)
        : dbTruck.fuel_efficiency_kmpl
      : undefined,
    insuranceExpiryDate: typeof dbTruck.insurance_expiry_date === 'string'
      ? dbTruck.insurance_expiry_date
      : dbTruck.insurance_expiry_date.toISOString().split('T')[0],
    status: dbTruck.status,
    createdAt:
      typeof dbTruck.created_at === 'string'
        ? dbTruck.created_at
        : dbTruck.created_at.toISOString(),
    updatedAt:
      typeof dbTruck.updated_at === 'string'
        ? dbTruck.updated_at
        : dbTruck.updated_at.toISOString(),
  };
}

/**
 * フロントエンドデータをDB用に変換
 */
export function mapTruckToDB(truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): CreateTruckInput {
  return {
    company_id: truck.companyId,
    truck_number: truck.truckNumber,
    license_plate: truck.licensePlate,
    truck_type: truck.truckType,
    capacity_cbm: truck.capacityCbm,
    max_load_kg: truck.maxLoadKg,
    has_lift_gate: truck.hasLiftGate,
    has_air_conditioning: truck.hasAirConditioning,
    manufacture_year: truck.manufactureYear,
    manufacturer: truck.manufacturer,
    model_name: truck.modelName,
    last_inspection_date: truck.lastInspectionDate,
    next_inspection_date: truck.nextInspectionDate,
    fuel_type: truck.fuelType,
    fuel_efficiency_kmpl: truck.fuelEfficiencyKmpl,
    insurance_expiry_date: truck.insuranceExpiryDate,
    status: truck.status,
  };
}

