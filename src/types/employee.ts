/**
 * 従業員管理に関する型定義
 */

export interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  hireDate: string;
  shifts: EmployeeShift[];
  employmentType?: string; // 雇用形態
  qualifications?: string; // 保有資格
  birthDate?: string; // 生年月日
  address?: string; // 住所
  emergencyContact?: string; // 緊急連絡先
  retireDate?: string; // 退職日
}

/**
 * 従業員の月間集計データの型定義
 */
export interface EmployeeMonthlySummary {
  employee: Employee; // 従業員情報
  workingDays: number; // 出勤日数
  totalWorkingTime: string; // 総労働時間（表示用文字列）
  totalWorkingMinutes: number; // 総労働時間（分単位、ソート用）
}
