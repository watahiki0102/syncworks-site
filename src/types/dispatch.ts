export interface Option {
  name: string;
  price?: number;
}

import { ContractStatus } from './case';

// 作業者割り当て用の型定義
export type ScheduleId = string; // truckId + date + timeRange などで一意

export interface WorkerRef { 
  id: string; 
  name: string; 
  role: 'driver'|'staff'|'leader'; 
  active: boolean; 
}

export interface WorkerAssignment {
  scheduleId: ScheduleId;          // ★スケジュール単位で割当
  employeeId: string;
  start: string;                   // 'HH:mm'
  end: string;                     // 'HH:mm'
}

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
  // 作業者割り当て情報を追加
  workerAssignments?: WorkerAssignment[];
}

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
