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
  emergencyContactRelation?: string; // 緊急連絡先との関係
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

// ===========================================
// API用の型定義
// ===========================================

/**
 * データベースから取得する従業員データの型（Prismaから）
 */
export interface EmployeeFromDB {
  id: string;
  company_id: string;
  user_id: string | null;
  employee_number: string;
  last_name: string;
  first_name: string;
  last_name_kana: string | null;
  first_name_kana: string | null;
  email: string | null;
  role: string;
  employment_type: string;
  qualifications: string[];
  hire_date: Date | string;
  termination_date: Date | string | null;
  birth_date: Date | string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  address_line: string | null;
  phone_number: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  hourly_rate: number | null;
  max_work_hours_per_day: number | null;
  max_work_days_per_month: number | null;
  points_balance: number | null;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  moving_companies?: {
    id: string;
    company_name: string;
  };
  users?: {
    id: string;
    email: string;
    display_name: string | null;
  } | null;
}

/**
 * DBデータをフロントエンド用に変換
 */
export function mapEmployeeFromDB(dbEmployee: EmployeeFromDB): Employee {
  const fullName = `${dbEmployee.last_name} ${dbEmployee.first_name}`;
  const address = dbEmployee.address_line
    ? `${dbEmployee.prefecture || ''}${dbEmployee.city || ''}${dbEmployee.address_line}`
    : '';

  return {
    id: dbEmployee.id,
    name: fullName,
    email: dbEmployee.email || '',
    phone: dbEmployee.phone_number,
    position: mapRoleToPosition(dbEmployee.role),
    status: dbEmployee.is_active ? 'active' : 'inactive',
    hireDate: formatDate(dbEmployee.hire_date),
    shifts: [], // シフトデータは別途処理
    employmentType: mapEmploymentType(dbEmployee.employment_type),
    qualifications: dbEmployee.qualifications?.join(', ') || '',
    birthDate: dbEmployee.birth_date ? formatDate(dbEmployee.birth_date) : undefined,
    address: address || undefined,
    emergencyContact: dbEmployee.emergency_contact_phone || undefined,
    emergencyContactRelation: dbEmployee.emergency_contact_name || undefined,
    retireDate: dbEmployee.termination_date ? formatDate(dbEmployee.termination_date) : undefined,
  };
}

/**
 * フロントエンドからDBへの変換
 */
export function mapEmployeeToDB(
  employee: Omit<Employee, 'id' | 'shifts'>,
  companyId: string
): Record<string, unknown> {
  // 名前を姓と名に分割（スペース区切り）
  const nameParts = employee.name.trim().split(/\s+/);

  let lastName: string;
  let firstName: string;

  if (nameParts.length >= 2) {
    // スペース区切りの場合: "山田 太郎" → lastName="山田", firstName="太郎"
    lastName = nameParts[0];
    firstName = nameParts.slice(1).join(' ');
  } else {
    // スペースがない場合: "山田太郎" → 半分に分割
    const fullName = nameParts[0];
    const midPoint = Math.ceil(fullName.length / 2);
    lastName = fullName.substring(0, midPoint);
    firstName = fullName.substring(midPoint) || lastName; // 1文字の場合は同じ文字を使用
  }

  return {
    company_id: companyId,
    last_name: lastName,
    first_name: firstName,
    email: employee.email || null,
    phone_number: employee.phone,
    role: mapPositionToRole(employee.position),
    employment_type: mapEmploymentTypeToDb(employee.employmentType || '正社員'),
    qualifications: employee.qualifications ? employee.qualifications.split(',').map(q => q.trim()) : [],
    hire_date: employee.hireDate,
    birth_date: employee.birthDate || null,
    termination_date: employee.retireDate || null,
    address_line: employee.address || null,
    emergency_contact_phone: employee.emergencyContact || null,
    emergency_contact_name: employee.emergencyContactRelation || null,
    is_active: employee.status === 'active',
  };
}

// ロールとポジションのマッピング
function mapRoleToPosition(role: string): string {
  const mapping: Record<string, string> = {
    'driver': 'ドライバー',
    'worker': '作業員',
    'leader': 'リーダー',
    'supervisor': '管理者',
  };
  return mapping[role] || role;
}

function mapPositionToRole(position: string): string {
  const mapping: Record<string, string> = {
    'ドライバー': 'driver',
    '作業員': 'worker',
    'リーダー': 'leader',
    '管理者': 'supervisor',
  };
  return mapping[position] || 'worker';
}

// 雇用形態のマッピング
function mapEmploymentType(type: string): string {
  const mapping: Record<string, string> = {
    'full_time': '正社員',
    'contract': '契約社員',
    'part_time': 'アルバイト',
    'temporary': '派遣',
  };
  return mapping[type] || type;
}

function mapEmploymentTypeToDb(type: string): string {
  const mapping: Record<string, string> = {
    '正社員': 'full_time',
    '契約社員': 'contract',
    'アルバイト': 'part_time',
    'パート': 'part_time',
    '派遣': 'temporary',
  };
  return mapping[type] || 'full_time';
}

// 日付フォーマット
function formatDate(date: Date | string): string {
  if (!date) {
    return '';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
