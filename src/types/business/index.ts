/**
 * ビジネスロジック関連の型定義
 * 引越し業者管理システムのドメイン型
 */
import type { MoveType, TimeSlot } from '../forms';

// ユーザー管理
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type UserRole = 'customer' | 'business_owner' | 'employee' | 'admin';

export interface BusinessOwner extends User {
  role: 'business_owner';
  companyId: string;
  permissions: Permission[];
}

export interface Employee extends User {
  role: 'employee';
  companyId: string;
  employeeId: string;
  position: string;
  hireDate: Date;
  isAvailable: boolean;
}

export type Permission = 
  | 'quotes:read'
  | 'quotes:write'
  | 'quotes:delete'
  | 'dispatch:read'
  | 'dispatch:write'
  | 'employees:read'
  | 'employees:write'
  | 'settings:read'
  | 'settings:write';

// 会社情報
export interface Company {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  serviceAreas: string[];
  businessHours: BusinessHours;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

// 見積もり管理
export interface Quote {
  id: string;
  customerId: string;
  companyId: string;
  status: QuoteStatus;
  moveType: MoveType;
  fromAddress: string;
  toAddress: string;
  moveDate: Date;
  timeSlot: TimeSlot;
  items: MovingItem[];
  services: AdditionalService[];
  basePrice: number;
  additionalCosts: CostItem[];
  totalPrice: number;
  notes?: string;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = 
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'completed';

export interface MovingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  size?: ItemSize;
  weight?: number;
  isFragile: boolean;
  requiresDisassembly: boolean;
  notes?: string;
}

export type ItemCategory = 
  | 'furniture'
  | 'appliances'
  | 'boxes'
  | 'clothing'
  | 'books'
  | 'electronics'
  | 'kitchenware'
  | 'decorations'
  | 'sports'
  | 'plants'
  | 'other';

export type ItemSize = 'S' | 'M' | 'L' | 'XL';

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  isRequired: boolean;
}

export interface CostItem {
  id: string;
  name: string;
  amount: number;
  type: 'fee' | 'discount' | 'tax';
  description?: string;
}

// 配車・シフト管理
export interface Truck {
  id: string;
  companyId: string;
  name: string;
  licensePlate: string;
  capacity: number;
  type: TruckType;
  status: TruckStatus;
  isAvailable: boolean;
  maintenanceDate?: Date;
  notes?: string;
}

export type TruckType = 'light' | 'medium' | 'heavy' | 'extra_large';
export type TruckStatus = 'active' | 'maintenance' | 'retired';

export interface Shift {
  id: string;
  companyId: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: ShiftType;
  status: ShiftStatus;
  assignedJobs: string[]; // Job IDs
  notes?: string;
}

export type ShiftType = 'regular' | 'overtime' | 'holiday';
export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  quoteId: string;
  companyId: string;
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  assignedEmployees: string[];
  assignedTrucks: string[];
  status: JobStatus;
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes?: string;
}

export type JobStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

// レビュー・評価
export interface Review {
  id: string;
  customerId: string;
  companyId: string;
  jobId: string;
  rating: number; // 1-5
  comment?: string;
  categories: ReviewCategory[];
  isVerified: boolean;
  createdAt: Date;
  response?: CompanyResponse;
}

export interface ReviewCategory {
  name: string;
  rating: number;
}

export interface CompanyResponse {
  message: string;
  createdAt: Date;
  responderId: string;
}

// 通知システム
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  priority: NotificationPriority;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'quote_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'job_scheduled'
  | 'job_completed'
  | 'payment_due'
  | 'review_received'
  | 'system_maintenance';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// 分析・レポート
export interface Analytics {
  period: AnalyticsPeriod;
  quotes: QuoteAnalytics;
  revenue: RevenueAnalytics;
  performance: PerformanceAnalytics;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface QuoteAnalytics {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
  averageValue: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageJobValue: number;
  topServices: Array<{
    name: string;
    revenue: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface PerformanceAnalytics {
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  onTimeRate: number;
  cancellationRate: number;
} 