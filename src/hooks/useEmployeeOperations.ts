import { useState, useCallback } from 'react';
import { Employee, EmployeeShift } from '@/types/employee';
import { generateShiftId } from '@/utils/shiftUtils';

interface UseEmployeeOperationsResult {
  employees: Employee[];
  unsavedShiftIds: Set<string>;
  setEmployees: (employees: Employee[]) => void;
  setUnsavedShiftIds: (ids: Set<string>) => void;
  updateEmployeesState: (newEmployees: Employee[]) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (updatedEmployee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  updateShift: (employeeId: string, shift: EmployeeShift) => void;
  addShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  deleteShift: (employeeId: string, shiftId: string) => void;
  deleteMultipleShifts: (employeeId: string, shiftIds: string[]) => void;
}

/**
 * 従業員操作ロジックを管理するカスタムフック
 */
export function useEmployeeOperations(): UseEmployeeOperationsResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unsavedShiftIds, setUnsavedShiftIds] = useState<Set<string>>(new Set());

  const updateEmployeesState = useCallback((newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    // 即座にlocalStorageには保存せず、メモリ内のstateのみ更新
  }, []);

  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
    };
    const updatedEmployees = [...employees, newEmployee];
    updateEmployeesState(updatedEmployees);
  }, [employees, updateEmployeesState]);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(employee =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );
    updateEmployeesState(updatedEmployees);
  }, [employees, updateEmployeesState]);

  const deleteEmployee = useCallback((employeeId: string) => {
    if (window.confirm('この従業員を削除しますか？')) {
      const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
      updateEmployeesState(updatedEmployees);
    }
  }, [employees, updateEmployeesState]);

  const updateShift = useCallback((employeeId: string, shift: EmployeeShift) => {
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        const updatedShifts = employee.shifts.map(s =>
          s.id === shift.id ? shift : s
        );
        return { ...employee, shifts: updatedShifts };
      }
      return employee;
    });

    updateEmployeesState(updatedEmployees);

    // 未保存シフトとして記録
    setUnsavedShiftIds(prev => new Set(prev).add(shift.id));
  }, [employees, updateEmployeesState]);

  const addShift = useCallback((employeeId: string, shift: Omit<EmployeeShift, 'id'>) => {
    // ID重複を防ぐため一意のIDを生成
    const newShift: EmployeeShift = {
      ...shift,
      id: generateShiftId(),
    };

    // setEmployeesを使用して、前の状態を基に更新（状態更新の競合を回避）
    setEmployees(prevEmployees => {
      const updatedEmployees = prevEmployees.map(employee => {
        if (employee.id === employeeId) {
          const updatedEmployee = { ...employee, shifts: [...employee.shifts, newShift] };
          return updatedEmployee;
        }
        return employee;
      });

      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        } catch (error) {
          console.error('シフト追加時のLocalStorage保存に失敗しました:', error);
          // 追加自体は成功しているので、ユーザーには通知しない
        }
      }

      return updatedEmployees;
    });

    // 未保存シフトとして記録
    setUnsavedShiftIds(prev => new Set(prev).add(newShift.id));
  }, []);

  const deleteShift = useCallback((employeeId: string, shiftId: string) => {
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          shifts: employee.shifts.filter(s => s.id !== shiftId)
        };
      }
      return employee;
    });

    updateEmployeesState(updatedEmployees);
    // 削除したシフトを未保存リストから削除
    setUnsavedShiftIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(shiftId);
      return newSet;
    });
  }, [employees, updateEmployeesState]);

  /**
   * 複数のシフトを一度に削除する関数
   * 【日マタギシフト対応】グループ全体を一度に削除するために使用
   */
  const deleteMultipleShifts = useCallback((employeeId: string, shiftIds: string[]) => {
    if (shiftIds.length === 0) return;

    const shiftIdSet = new Set(shiftIds);
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          shifts: employee.shifts.filter(s => !shiftIdSet.has(s.id))
        };
      }
      return employee;
    });

    updateEmployeesState(updatedEmployees);
    // 削除したシフトを未保存リストから削除
    setUnsavedShiftIds(prev => {
      const newSet = new Set(prev);
      shiftIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, [employees, updateEmployeesState]);

  return {
    employees,
    unsavedShiftIds,
    setEmployees,
    setUnsavedShiftIds,
    updateEmployeesState,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateShift,
    addShift,
    deleteShift,
    deleteMultipleShifts,
  };
}
