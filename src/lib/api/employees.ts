/**
 * 従業員API クライアント
 */

import { Employee, EmployeeFromDB, mapEmployeeFromDB, mapEmployeeToDB } from '@/types/employee';

// TODO: 実際のcompany_idは認証情報から取得する
const DEFAULT_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

/**
 * 従業員一覧を取得
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const response = await fetch('/api/employees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch employees');
    }

    // DBデータをフロントエンド用にマッピング
    const employees: Employee[] = result.data.map((dbEmployee: EmployeeFromDB) =>
      mapEmployeeFromDB(dbEmployee)
    );

    return employees;
  } catch (error) {
    console.error('[fetchEmployees] Error:', error);
    throw error;
  }
}

/**
 * 特定の従業員を取得
 */
export async function fetchEmployee(id: string): Promise<Employee> {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch employee');
    }

    return mapEmployeeFromDB(result.data);
  } catch (error) {
    console.error(`[fetchEmployee] Error:`, error);
    throw error;
  }
}

/**
 * 新規従業員を作成
 */
export async function createEmployee(
  employee: Omit<Employee, 'id' | 'shifts'>
): Promise<Employee> {
  try {
    // フロントエンドデータをDB用にマッピング
    const dbData = mapEmployeeToDB(employee, DEFAULT_COMPANY_ID);

    // employee_numberを生成（タイムスタンプベース）
    const employeeNumber = `EMP-${Date.now()}`;

    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...dbData,
        employee_number: employeeNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create employee: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create employee');
    }

    return mapEmployeeFromDB(result.data);
  } catch (error) {
    console.error('[createEmployee] Error:', error);
    throw error;
  }
}

/**
 * 従業員情報を更新
 */
export async function updateEmployee(employee: Employee): Promise<Employee> {
  try {
    // shiftsを除外してDB用にマッピング
    const { id, shifts, ...employeeData } = employee;
    const dbData = mapEmployeeToDB(employeeData, DEFAULT_COMPANY_ID);

    const response = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dbData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update employee: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update employee');
    }

    // 元のshiftsデータを保持
    const updatedEmployee = mapEmployeeFromDB(result.data);
    updatedEmployee.shifts = shifts;

    return updatedEmployee;
  } catch (error) {
    console.error('[updateEmployee] Error:', error);
    throw error;
  }
}

