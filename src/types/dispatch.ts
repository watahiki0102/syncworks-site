export interface Option {
  name: string;
  price?: number;
}

import { ContractStatus } from './case';

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
