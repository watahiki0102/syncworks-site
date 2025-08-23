/**
 * トラック割り当てモーダルコンポーネント
 * - フォーム提出に対してトラックを割り当てる
 * - スケジュール競合チェック
 * - 推奨トラックの表示
 * - 見積もり価格の計算
 */
'use client';

import { useState, useEffect } from 'react';
// import { formatTime } from '@/utils/dateTimeUtils'; // Currently unused
import { ContractStatus } from '@/types/case';
import { Truck } from '@/types/dispatch';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  originAddress: string;
  destinationAddress: string;
  totalPoints: number;
  totalCapacity: number;
  itemList: string[];
  additionalServices: string[];
  status: 'pending' | 'assigned' | 'completed';
  truckAssignments: TruckAssignment[];
  createdAt: string;
  distance?: number;
  estimatedPrice?: number;
  recommendedTruckTypes?: string[];
  contractStatus: ContractStatus;
  contractDate?: string;
}

interface TruckAssignment {
  truckId: string;
  truckName: string;
  capacity: number;
  startTime: string;
  endTime: string;
  workType: 'loading' | 'moving' | 'unloading';
  employeeId?: string; // 従業員IDを追加
}

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  shifts: EmployeeShift[];
}

interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'available' | 'booked' | 'unavailable' | 'overtime' | 'provisional';
  truckScheduleId?: string;
  customerName?: string;
  workType?: string;
  notes?: string;
}

interface TruckAssignmentModalProps {
  selectedSubmission: FormSubmission | null;
  trucks: Truck[];
  pricingTrucks: any[];
  setShowTruckModal: (_show: boolean) => void;
  assignTruckToSubmission: (_submissionId: string, _truckAssignment: TruckAssignment) => void;
  calculateRecommendedTrucks: (_points: number) => any[];
  calculateEstimatedPrice: (_points: number, _distance?: number) => number;
}

export default function TruckAssignmentModal({
  selectedSubmission,
  trucks,
  // pricingTrucks, // Currently unused
  setShowTruckModal,
  assignTruckToSubmission,
  calculateRecommendedTrucks,
  // calculateEstimatedPrice, // Currently unused
}: TruckAssignmentModalProps) {
  const [formData, setFormData] = useState({
    truckId: '',
    startTime: '09:00',
    endTime: '12:00',
    workType: 'loading' as 'loading' | 'moving' | 'unloading',
    capacity: '',
    employeeId: '', // 従業員IDを追加
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [_selectedEmployee, _setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  useEffect(() => {
    // ローカルストレージから従業員データを読み込み
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  useEffect(() => {
    if (selectedSubmission) {
      // 推奨トラックを自動選択
      const recommendedTrucks = calculateRecommendedTrucks(selectedSubmission.totalPoints);
      if (recommendedTrucks.length > 0) {
        setFormData(prev => ({
          ...prev,
          truckId: recommendedTrucks[0].id,
          capacity: selectedSubmission.totalCapacity.toString(),
        }));
      }
    }
  }, [selectedSubmission, calculateRecommendedTrucks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission || !formData.truckId) return;

    const selectedTruck = trucks.find(t => t.id === formData.truckId);
    if (!selectedTruck) return;

    const truckAssignment: TruckAssignment = {
      truckId: formData.truckId,
      truckName: selectedTruck.name,
      capacity: parseInt(formData.capacity) || selectedSubmission.totalCapacity,
      startTime: formData.startTime,
      endTime: formData.endTime,
      workType: formData.workType,
      employeeId: formData.employeeId || undefined, // 従業員IDを追加
    };

    assignTruckToSubmission(selectedSubmission.id, truckAssignment);
    setShowTruckModal(false);
  };

  const getAvailableEmployees = (date: string, startTime: string, endTime: string) => {
    return employees.filter(emp => {
      if (emp.status !== 'active') return false;
      
      // 指定された時間帯にシフトがあるかチェック
      const hasShift = emp.shifts.some(shift => {
        if (shift.date !== date) return false;
        
        // 時間帯の重複チェック
        const shiftStart = getTimeSlotStart(shift.timeSlot);
        const shiftEnd = getTimeSlotEnd(shift.timeSlot);
        
        return shift.status === 'available' && 
               shiftStart < endTime && 
               shiftEnd > startTime;
      });
      
      return hasShift;
    });
  };

  const getTimeSlotStart = (timeSlot: string) => {
    // 1時間単位の時間枠なので、そのまま返す
    return timeSlot;
  };

  const getTimeSlotEnd = (timeSlot: string) => {
    // 1時間単位の時間枠なので、1時間後を返す
    const hour = parseInt(timeSlot.split(':')[0]);
    const nextHour = hour + 1;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  };

  const handleEmployeeSelect = (employee: Employee) => {
    _setSelectedEmployee(employee);
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
    setShowEmployeeModal(false);
  };

  if (!selectedSubmission) return null;

  const availableEmployees = getAvailableEmployees(
    selectedSubmission.moveDate,
    formData.startTime,
    formData.endTime
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">トラック割り当て</h3>
        
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h4 className="font-medium text-gray-900 mb-2">案件情報</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">顧客名:</span> {selectedSubmission.customerName}
            </div>
            <div>
                               <span className="font-medium">引越し日:</span> {selectedSubmission.moveDate}
            </div>
            <div>
              <span className="font-medium">総容量:</span> {selectedSubmission.totalCapacity.toLocaleString()}kg
            </div>
            <div>
              <span className="font-medium">荷物ポイント:</span> {selectedSubmission.totalPoints}pt
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">トラック選択</label>
            <select
              value={formData.truckId}
              onChange={e => setFormData({ ...formData, truckId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">トラックを選択してください</option>
              {trucks
                .filter(truck => truck.status === 'available')
                .map(truck => (
                  <option key={truck.id} value={truck.id}>
                    {truck.name} ({truck.plateNumber}) - {truck.capacityKg}kg
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">開始時間</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">終了時間</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">作業区分</label>
            <select
              value={formData.workType}
              onChange={e => setFormData({ ...formData, workType: e.target.value as any })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="loading">積込</option>
              <option value="moving">移動</option>
              <option value="unloading">積卸</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">使用容量（kg）</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="使用容量を入力"
              min="0"
              max={selectedSubmission.totalCapacity}
            />
          </div>

          {/* 従業員選択セクション */}
          <div>
            <label className="block text-sm font-medium mb-1">従業員割り当て</label>
            <div className="space-y-2">
              {formData.employeeId ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div>
                    <span className="font-medium text-green-800">
                      {employees.find(emp => emp.id === formData.employeeId)?.name}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      ({employees.find(emp => emp.id === formData.employeeId)?.position})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, employeeId: '' })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              ) : (
                <div className="p-3 border border-gray-300 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">従業員が選択されていません</span>
                    <button
                      type="button"
                      onClick={() => setShowEmployeeModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      従業員を選択
                    </button>
                  </div>
                  {availableEmployees.length > 0 && (
                    <div className="text-xs text-green-600">
                      {availableEmployees.length}名の従業員が利用可能です
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              割り当て
            </button>
            <button
              type="button"
              onClick={() => setShowTruckModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </form>

        {/* 従業員選択モーダル */}
        {showEmployeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-4">従業員選択</h4>
              
              {availableEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">利用可能な従業員がいません</p>
                  <p className="text-sm text-gray-400">
                    指定された時間帯にシフトが空いている従業員を確認してください
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableEmployees.map(employee => (
                    <div
                      key={employee.id}
                      className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.position}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

