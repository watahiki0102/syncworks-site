/**
 * 共通型定義
 * 複数のモジュールで使用される基本的な型定義を集約
 */

// Employee/Worker共通型（EmployeeRefとWorkerRefを統合）
export interface Employee {
  id: string;
  name: string;
  role: 'driver' | 'staff' | 'leader' | string;
  active?: boolean;
  position?: string; // TruckAssignmentModalで使用
  status?: 'active' | 'inactive';
  shifts?: EmployeeShift[];
}

// 従業員シフト情報
export interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'available' | 'booked' | 'unavailable' | 'overtime' | 'provisional';
  truckScheduleId?: string;
  customerName?: string;
  workType?: string;
  notes?: string;
}

// トラック型（Truck型を統合）
export interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string;
  schedules: Schedule[];
}

// スケジュール型（dispatch.tsから移動）
export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  contractStatus?: ContractStatus;
  customerName?: string;
  customerPhone?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number;
  points?: number;
  origin?: string;
  destination?: string;
  preferredDate1?: string;
  preferredDate2?: string;
  preferredDate3?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'invoice';
  paymentStatus?: 'paid' | 'pending' | 'partial';
  paymentAmount?: number;
  paymentDueDate?: string;
  selectedOptions?: Array<{ name: string; price?: number }>;
  truckName?: string;
  truckId?: string;
  isConfirmedOnly?: boolean;
  isUnconfirmedOnly?: boolean;
  employeeId?: string;
  workerAssignments?: WorkerAssignment[];
}

// 作業者割り当て型
export interface WorkerAssignment {
  scheduleId: string;
  employeeId: string;
  start: string; // 'HH:mm'
  end: string;   // 'HH:mm'
}

// 契約ステータス（case.tsから再エクスポート）
export type ContractStatus = 'confirmed' | 'estimate';

// オプション型（dispatch.tsから移動）
export interface Option {
  name: string;
  price?: number;
}

// スケジュールID型
export type ScheduleId = string;