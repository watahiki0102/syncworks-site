'use client';

import { useState, useMemo } from 'react';
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
  employmentType?: string; // 雇用形態
  qualifications?: string; // 保有資格
  birthDate?: string; // 生年月日
  address?: string; // 住所
  emergencyContact?: string; // 緊急連絡先
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
    employmentType: '正社員',
    qualifications: '',
    birthDate: '',
    address: '',
    emergencyContact: '',
  });

  // フィルタ用のstate
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // フィルタリングされた従業員リスト
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // 名前で検索
      const matchesSearch = !searchQuery || employee.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 役職でフィルタ
      const matchesPosition = !filterPosition || employee.position === filterPosition;
      
      // ステータスでフィルタ
      const matchesStatus = !filterStatus || employee.status === filterStatus;
      
      return matchesSearch && matchesPosition && matchesStatus;
    });
  }, [employees, searchQuery, filterPosition, filterStatus]);

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
      employmentType: '正社員',
      qualifications: '',
      birthDate: '',
      address: '',
      emergencyContact: '',
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
      employmentType: employee.employmentType || '正社員',
      qualifications: employee.qualifications || '',
      birthDate: employee.birthDate || '',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
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
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? '在籍中' : '退職';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
        
          {/* 検索・フィルタ・アクションバー */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 gap-2">
            {/* 検索・フィルタ */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="従業員名で検索..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <select 
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">すべての役職</option>
                {EMPLOYEE_POSITIONS.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">すべてのステータス</option>
                <option value="active">在籍中</option>
                <option value="inactive">退職</option>
              </select>
            </div>
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
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 shadow-md transition duration-200"
            >
              従業員追加
            </button>
          </div>

          {/* テーブル */}
          {employees.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">登録済みの従業員がありません</p>
              <p className="text-sm text-gray-400">
                従業員を追加してシフト管理を開始してください
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-2">検索条件に一致する従業員が見つかりません</p>
              <p className="text-sm text-gray-400">
                検索条件を変更してください
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">氏名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役割</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">雇用形態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保有資格</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入社日</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employmentType || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.qualifications || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.hireDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 従業員追加・編集モーダル */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedEmployee ? '従業員編集' : '従業員追加'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">氏名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">役割</label>
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900"
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
                <label className="block text-sm font-medium text-gray-900 mb-1">ステータス</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border rounded text-gray-900"
                  required
                >
                  <option value="active">在籍中</option>
                  <option value="inactive">退職</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">雇用形態</label>
                <select
                  value={formData.employmentType}
                  onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900"
                  required
                >
                  <option value="正社員">正社員</option>
                  <option value="契約社員">契約社員</option>
                  <option value="アルバイト">アルバイト</option>
                  <option value="パート">パート</option>
                  <option value="派遣">派遣</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">保有資格</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  placeholder="例: 準中型免許、大型免許"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">生年月日</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">入社日</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">住所</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  placeholder="例: 東京都新宿区..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">緊急連絡先</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  placeholder="例: 090-1234-5678（家族等）"
                />
              </div>
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