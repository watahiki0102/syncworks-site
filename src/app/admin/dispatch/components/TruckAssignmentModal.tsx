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
import { Truck, Employee, EmployeeShift, TruckAssignment } from '@/types/shared';
import { FormModal, SimpleModal } from '@/components/ui/SimpleModal';
import { calculateTruckEfficiency } from '@/utils/truckUtils';
import { parseTimeRange } from '@/constants/calendar';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  moveTime1?: string; // 第一希望時間
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


// Employee と EmployeeShift は共通型から import済み

interface TruckAssignmentModalProps {
  selectedCase?: any; // DispatchCase
  selectedSubmission?: FormSubmission | null; // 後方互換性のため
  trucks: Truck[];
  pricingTrucks: any[];
  setShowTruckModal: (_show: boolean) => void;
  onAssign?: (caseId: string, truckId: string) => void; // 新しいインターフェース
  assignTruckToSubmission?: (_submissionId: string, _truckAssignment: TruckAssignment) => void; // 後方互換性のため
  calculateRecommendedTrucks?: (_points: number) => any[];
  calculateEstimatedPrice: (_points: number, _distance?: number) => number;
}

export default function TruckAssignmentModal({
  selectedCase,
  selectedSubmission,
  trucks,
  // pricingTrucks, // Currently unused
  setShowTruckModal,
  onAssign,
  assignTruckToSubmission,
  calculateRecommendedTrucks,
  // calculateEstimatedPrice, // Currently unused
}: TruckAssignmentModalProps) {
  const [formData, setFormData] = useState({
    truckId: '',
    startTime: '',
    endTime: '',
    workType: 'loading' as 'loading' | 'moving' | 'unloading',
    capacity: '',
    employeeId: '', // 従業員IDを追加
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [_selectedEmployee, _setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [manualSelectionReason, setManualSelectionReason] = useState('');

  useEffect(() => {
    // ローカルストレージから従業員データを読み込み
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  useEffect(() => {
    const currentCase = selectedCase || selectedSubmission;
    if (currentCase) {
      // 案件の時間情報を取得（共通の時間帯マッピングを使用）
      const parsedTime = parseTimeRange(currentCase.moveTime1);

      // 推奨トラックを自動選択
      if (calculateRecommendedTrucks) {
        const recommendedTrucks = calculateRecommendedTrucks(currentCase.totalPoints || currentCase.items?.totalPoints || 0);
        if (recommendedTrucks.length > 0) {
          setFormData(prev => ({
            ...prev,
            truckId: recommendedTrucks[0].id,
            capacity: (currentCase.totalCapacity || currentCase.items?.totalPoints || 0).toString(),
            startTime: parsedTime?.startTime || '',
            endTime: parsedTime?.endTime || '',
          }));
        } else {
          // 推奨トラックがない場合でも時間情報は設定
          setFormData(prev => ({
            ...prev,
            capacity: (currentCase.totalCapacity || currentCase.items?.totalPoints || 0).toString(),
            startTime: parsedTime?.startTime || '',
            endTime: parsedTime?.endTime || '',
          }));
        }
      } else {
        // calculateRecommendedTrucksがない場合でも時間情報は設定
        setFormData(prev => ({
          ...prev,
          capacity: (currentCase.totalCapacity || currentCase.items?.totalPoints || 0).toString(),
          startTime: parsedTime?.startTime || '',
          endTime: parsedTime?.endTime || '',
        }));
      }
    }
  }, [selectedCase, selectedSubmission, calculateRecommendedTrucks]);

  const handleSubmit = () => {
    const currentCase = selectedCase || selectedSubmission;
    if (!currentCase || !formData.truckId) return;

    const selectedTruck = trucks.find(t => t.id === formData.truckId);
    if (!selectedTruck) return;

    const recommendedTrucks = calculateRecommendedTrucks ? calculateRecommendedTrucks(currentCase.totalPoints || currentCase.items?.totalPoints || 0) : [];
    const recommendedTruckIds = recommendedTrucks.map(truck => truck.id);
    const isManualSelection = !recommendedTruckIds.includes(formData.truckId);

    const truckAssignment: TruckAssignment = {
      truckId: formData.truckId,
      truckName: selectedTruck.name,
      capacity: parseInt(formData.capacity) || currentCase.totalCapacity || currentCase.items?.totalPoints || 0,
      startTime: formData.startTime,
      endTime: formData.endTime,
      workType: formData.workType,
      employeeId: formData.employeeId || undefined, // 従業員IDを追加
      isManualSelection,
      selectionReason: isManualSelection ? manualSelectionReason : undefined,
      recommendedTrucks: recommendedTruckIds,
      selectionTimestamp: new Date().toISOString(),
    };

    if (onAssign) {
      onAssign(currentCase.id, formData.truckId);
    } else if (assignTruckToSubmission) {
      assignTruckToSubmission(currentCase.id, truckAssignment);
    }
    setShowTruckModal(false);
  };
  
  const handleClose = () => {
    setShowTruckModal(false);
  };
  
  const isFormValid = !!(formData.truckId && formData.startTime && formData.endTime);

  const getAvailableEmployees = (date: string, startTime: string, endTime: string) => {
    return employees.filter(emp => {
      if (emp.status !== 'active') return false;
      
      // 指定された時間帯にシフトがあるかチェック
      const hasShift = emp.shifts?.some(shift => {
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

  if (!selectedCase && !selectedSubmission) return null;

  const currentCase = selectedCase || selectedSubmission;
  if (!currentCase) return null;

  const availableEmployees = getAvailableEmployees(
    currentCase.moveDate || currentCase.move?.moveDate,
    formData.startTime,
    formData.endTime
  );

  // 推奨トラックを取得
  const recommendedTrucks = calculateRecommendedTrucks ? calculateRecommendedTrucks(currentCase.totalPoints || currentCase.items?.totalPoints || 0) : [];
  const recommendedTruckIds = recommendedTrucks.map(truck => truck.id);
  
  // 利用可能なトラックを推奨/非推奨で分類
  const availableTrucks = trucks.filter(truck => truck.status === 'available');
  const recommendedAvailableTrucks = availableTrucks.filter(truck => 
    recommendedTruckIds.includes(truck.id)
  );
  const otherAvailableTrucks = availableTrucks.filter(truck => 
    !recommendedTruckIds.includes(truck.id)
  );

  // 選択されたトラックが推奨外かどうか
  const isManualSelection = formData.truckId && !recommendedTruckIds.includes(formData.truckId);

  // トラック効率性を計算
  const calculateSuitabilityScore = (truck: Truck): number => {
    const efficiency = calculateTruckEfficiency(truck, currentCase.totalPoints || currentCase.items?.totalPoints || 0);
    // 効率性を0-100のスコアに変換（簡易版）
    return Math.min(100, Math.max(0, 100 - efficiency * 10));
  };

  return (
    <>
      <FormModal
        isOpen={!!currentCase}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title="トラック割り当て"
        submitText="割り当て"
        cancelText="キャンセル"
        isValid={isFormValid}
      >
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h4 className="font-medium text-gray-900 mb-2">案件情報</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">顧客名:</span> {currentCase.customerName || currentCase.customer?.customerName}
            </div>
            <div>
              <span className="font-medium text-gray-700">引越し日:</span> {currentCase.moveDate || currentCase.move?.moveDate}
            </div>
            <div>
              <span className="font-medium text-gray-700">総容量:</span> {(currentCase.totalCapacity || currentCase.items?.totalPoints || 0).toLocaleString()}kg
            </div>
            <div>
              <span className="font-medium text-gray-700">荷物ポイント:</span> {currentCase.totalPoints || currentCase.items?.totalPoints || 0}pt
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-700">希望時間:</span>{' '}
              {currentCase.moveTime1 ? (
                <span className="text-gray-900">{currentCase.moveTime1}</span>
              ) : (
                <span className="text-red-600 font-medium">時間未設定</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* トラック選択セクション */}
          <div className="space-y-4">
            {/* 推奨トラック */}
            {recommendedAvailableTrucks.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-green-700 flex items-center gap-2">
                  <span className="text-green-600">📋</span>
                  推奨トラック（基準に適合）
                </label>
                <div className="space-y-2">
                  {recommendedAvailableTrucks.map(truck => {
                    const efficiency = calculateTruckEfficiency(truck, currentCase.totalPoints || currentCase.items?.totalPoints || 0);
                    const suitabilityScore = calculateSuitabilityScore(truck);
                    const isSelected = formData.truckId === truck.id;
                    
                    return (
                      <div
                        key={truck.id}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                            : 'border-green-300 hover:bg-green-25 hover:border-green-400'
                        }`}
                        onClick={() => setFormData({ ...formData, truckId: truck.id })}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <input
                                type="radio"
                                name="truckSelection"
                                checked={isSelected}
                                onChange={() => setFormData({ ...formData, truckId: truck.id })}
                                className="text-green-600"
                              />
                              {truck.name} ({truck.plateNumber})
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">推奨</span>
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {truck.truckType} - {truck.capacityKg.toLocaleString()}kg
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>効率性: {efficiency.toFixed(2)}</div>
                            <div>適合度: {suitabilityScore.toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* その他のトラック（手動選択） */}
            {otherAvailableTrucks.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-2">
                  <span className="text-gray-500">🔧</span>
                  手動選択（その他利用可能トラック）
                </label>
                <div className="space-y-2">
                  {otherAvailableTrucks.map(truck => {
                    const efficiency = calculateTruckEfficiency(truck, currentCase.totalPoints || currentCase.items?.totalPoints || 0);
                    const suitabilityScore = calculateSuitabilityScore(truck);
                    const isSelected = formData.truckId === truck.id;
                    
                    return (
                      <div
                        key={truck.id}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' 
                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, truckId: truck.id })}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <input
                                type="radio"
                                name="truckSelection"
                                checked={isSelected}
                                onChange={() => setFormData({ ...formData, truckId: truck.id })}
                                className="text-yellow-600"
                              />
                              {truck.name} ({truck.plateNumber})
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {truck.truckType} - {truck.capacityKg.toLocaleString()}kg
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>効率性: {efficiency.toFixed(2)}</div>
                            <div>適合度: {suitabilityScore.toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 手動選択時の理由入力 */}
            {isManualSelection && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <label className="block text-sm font-medium text-yellow-800 mb-1">
                  手動選択の理由（任意）
                </label>
                <textarea
                  value={manualSelectionReason}
                  onChange={(e) => setManualSelectionReason(e.target.value)}
                  placeholder="推奨外のトラックを選択する理由を入力してください（例：顧客の特別な要望、緊急対応、効率性を重視など）"
                  className="w-full px-2 py-2 text-sm border rounded text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  rows={3}
                />
              </div>
            )}

            {/* トラックが選択されていない場合の表示 */}
            {availableTrucks.length === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                <p className="text-red-600 font-medium">利用可能なトラックがありません</p>
                <p className="text-sm text-red-500 mt-1">トラック管理画面で利用可能なトラックを確認してください</p>
              </div>
            )}
          </div>

          {/* 時間未設定の警告 */}
          {(!formData.startTime || !formData.endTime) && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">作業時間を設定してください</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    配車を行う場合は、作業開始時間と終了時間を必ず指定する必要があります。
                    {currentCase.moveTime1 && `案件の希望時間「${currentCase.moveTime1}」を参考に設定してください。`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                開始時間<span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className={`w-full px-3 py-2 border rounded text-gray-900 ${
                  !formData.startTime ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                終了時間<span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-3 py-2 border rounded text-gray-900 ${
                  !formData.endTime ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">作業区分</label>
            <select
              value={formData.workType}
              onChange={e => setFormData({ ...formData, workType: e.target.value as any })}
              className="w-full px-3 py-2 border rounded text-gray-900"
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
              className="w-full px-3 py-2 border rounded text-gray-900"
              placeholder="使用容量を入力"
              min="0"
              max={currentCase.totalCapacity || currentCase.items?.totalPoints || 0}
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
        </div>
      </FormModal>

        {/* 従業員選択モーダル */}
        <SimpleModal
          isOpen={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          title="従業員選択"
          footer={
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              キャンセル
            </button>
          }
        >
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
        </SimpleModal>
    </>
  );
}

