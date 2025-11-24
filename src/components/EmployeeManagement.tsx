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
  emergencyContactRelation?: string; // 緊急連絡先との関係
  retireDate?: string; // 退職日
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
    emergencyContactRelation: '',
    retireDate: '',
  });

  // フィルタ用のstate（デフォルトで「在籍中」のみ表示）
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  // フィルタリングされた従業員リスト
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // 名前で検索
      const matchesSearch = !searchQuery || employee.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 役割でフィルタ
      const matchesPosition = !filterPosition || employee.position === filterPosition;
      
      // ステータスでフィルタ（デフォルトで在籍中のみ表示）
      const matchesStatus = !filterStatus || employee.status === filterStatus;
      
      return matchesSearch && matchesPosition && matchesStatus;
    });
  }, [employees, searchQuery, filterPosition, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 在籍中 → 退職 に変更する場合は退職日必須
    if (formData.status === 'inactive' && !formData.retireDate) {
      alert('退職ステータスを設定する場合は「退職日」を入力してください。');
      return;
    }

    // 在籍中に戻す場合は退職日をクリア
    const normalizedFormData = {
      ...formData,
      retireDate: formData.status === 'active' ? '' : formData.retireDate,
    };

    // 在籍中 → 退職 へ変更する場合のみ確認ダイアログを表示
    if (
      selectedEmployee &&
      selectedEmployee.status === 'active' &&
      normalizedFormData.status === 'inactive'
    ) {
      const ok = window.confirm(
        `この従業員を「退職」ステータスに変更します。\n` +
        `退職日: ${normalizedFormData.retireDate || '未設定'}\n\n` +
        'よろしいですか？'
      );
      if (!ok) return;
    }

    if (selectedEmployee) {
      // 更新
      onUpdateEmployee({
        ...selectedEmployee,
        ...normalizedFormData,
      });
    } else {
      // 新規追加
      onAddEmployee({
        ...normalizedFormData,
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
      emergencyContactRelation: '',
      retireDate: '',
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
      emergencyContactRelation: employee.emergencyContactRelation || '',
      retireDate: employee.retireDate || '',
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
          <div className="mb-6 space-y-4">
            {/* 検索・フィルタ */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">従業員名で検索</label>
                <input 
                  type="text" 
                  placeholder="氏名を入力..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
                <select 
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">すべて</option>
                  {EMPLOYEE_POSITIONS.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              <div className="sm:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="active">在籍中</option>
                  <option value="inactive">退職</option>
                  <option value="">すべて</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
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
                      emergencyContactRelation: '',
                      retireDate: '',
                    });
                    onSelectEmployee(null);
                    onShowEmployeeModal(true);
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 shadow-md transition duration-200 whitespace-nowrap"
                >
                  ＋ 従業員追加
                </button>
              </div>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => {onShowEmployeeModal(false); onSelectEmployee(null);}}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedEmployee ? '従業員詳細' : '従業員追加'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onShowEmployeeModal(false);
                    onSelectEmployee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="090-1234-5678"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  役割 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="position-options"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="選択または入力してください"
                  required
                />
                <datalist id="position-options">
                  {EMPLOYEE_POSITIONS.map(position => (
                    <option key={position} value={position} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  required
                >
                  <option value="active">在籍中</option>
                  <option value="inactive">退職</option>
                </select>
              </div>

              {formData.status === 'inactive' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    退職日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.retireDate}
                    onChange={e => setFormData({ ...formData, retireDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  雇用形態 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentType}
                  onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">保有資格</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="例: 準中型免許、大型免許"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入社日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="例: 東京都新宿区..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="例: 090-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先との関係</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={e => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="例: 父、母、配偶者など"
                />
              </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 shadow-md transition duration-200"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShowEmployeeModal(false);
                    onSelectEmployee(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition duration-200"
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