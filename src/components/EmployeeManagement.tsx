'use client';

import { useState } from 'react';
import { EMPLOYEE_POSITIONS } from '@/constants/calendar';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  hireDate: string;
  shifts: any[];
}

interface EmployeeManagementProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onSelectEmployee: (employee: Employee | null) => void;
  onShowEmployeeModal: (show: boolean) => void;
  showEmployeeModal: boolean;
}

export default function EmployeeManagement({
  employees,
  selectedEmployee,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onSelectEmployee,
  onShowEmployeeModal,
  showEmployeeModal,
}: EmployeeManagementProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'ドライバー',
    status: 'active' as 'active' | 'inactive',
    hireDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmployee) {
      // 更新
      onUpdateEmployee({
        ...selectedEmployee,
        ...formData,
      });
    } else {
      // 新規追加
      onAddEmployee({
        ...formData,
        shifts: [],
      });
    }
    
    // フォームをリセット
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'ドライバー',
      status: 'active',
      hireDate: '',
    });
    onShowEmployeeModal(false);
    onSelectEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      status: employee.status,
      hireDate: employee.hireDate,
    });
    onSelectEmployee(employee);
    onShowEmployeeModal(true);
  };

  const handleDelete = (employeeId: string) => {
    if (window.confirm('この従業員を削除しますか？')) {
      onDeleteEmployee(employeeId);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? '在籍中' : '退職';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーアクション */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              position: 'ドライバー',
              status: 'active',
              hireDate: '',
            });
            onSelectEmployee(null);
            onShowEmployeeModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + 従業員追加
        </button>
      </div>

      {/* 従業員一覧 */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">登録済みの従業員がありません</p>
          <p className="text-sm text-gray-400">
            従業員を追加してシフト管理を開始してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(employee => (
            <div key={employee.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <p className="text-sm text-gray-500">{employee.phone}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employee.status)}`}>
                  {getStatusText(employee.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">役職:</span>
                  <span className="font-medium">{employee.position}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">入社日:</span>
                  <span className="font-medium">{employee.hireDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">シフト数:</span>
                  <span className="font-medium">{employee.shifts.length}件</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(employee)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 従業員追加・編集モーダル */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedEmployee ? '従業員編集' : '従業員追加'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">氏名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">役職</label>
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  {EMPLOYEE_POSITIONS.map(position => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="active">在籍中</option>
                  <option value="inactive">退職</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">入社日</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {selectedEmployee ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShowEmployeeModal(false);
                    onSelectEmployee(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 