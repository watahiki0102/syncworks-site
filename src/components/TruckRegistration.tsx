/**
 * トラック登録・編集コンポーネント
 * - トラックの新規登録・編集・削除
 * - トラック種別と料金設定の連携
 * - スケジュール管理
 */
'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/utils/dateTimeUtils';
import { TRUCK_STATUS_LABELS, TRUCK_STATUS_COLORS } from '../constants/truckStatus';

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string; // 料金設定のトラック種別
  schedules: Schedule[];
  maxPoints?: number; // 最大荷物ポイント
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'maintenance';
}

interface TruckRegistrationProps {
  trucks: Truck[];
  selectedTruck: Truck | null;
  onAddTruck: (truck: Omit<Truck, 'id'>) => void;
  onUpdateTruck: (truck: Truck) => void;
  onDeleteTruck: (truckId: string) => void;
  onSelectTruck: (truck: Truck | null) => void;
  availableTruckTypes: string[]; // 料金設定で利用可能なトラック種別
  pricingRules?: any; // 料金設定ルール
}

export default function TruckRegistration({
  trucks,
  selectedTruck,
  onAddTruck,
  onUpdateTruck,
  onDeleteTruck,
  onSelectTruck,
  availableTruckTypes,
  pricingRules = []
}: TruckRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    plateNumber: '',
    capacityKg: 1000,
    inspectionExpiry: '',
    status: 'available' as 'available' | 'maintenance' | 'inactive',
    truckType: '',
    maxPoints: 0,
  });
  const [schedules, setSchedules] = useState<Omit<Schedule, 'id'>[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    status: 'available' as const,
  });

  /**
   * 料金設定からトラック種別の最大ポイントを取得
   * @param truckType - トラック種別
   * @returns 最大ポイント数
   */
  const getMaxPointsForTruckType = (truckType: string): number => {
    const rule = pricingRules.find((rule: any) => rule.truckType === truckType);
    return rule?.maxPoint || 0;
  };

  /**
   * トラック種別が変更された時の処理
   * @param truckType - 選択されたトラック種別
   */
  const handleTruckTypeChange = (truckType: string) => {
    const maxPoints = getMaxPointsForTruckType(truckType);
    setFormData({ ...formData, truckType, maxPoints });
  };

  /**
   * 選択されたトラックが変更された時にフォームデータを更新
   */
  useEffect(() => {
    if (selectedTruck) {
      setFormData({
        name: selectedTruck.name,
        plateNumber: selectedTruck.plateNumber,
        capacityKg: selectedTruck.capacityKg,
        inspectionExpiry: selectedTruck.inspectionExpiry,
        status: selectedTruck.status,
        truckType: selectedTruck.truckType || '',
        maxPoints: selectedTruck.maxPoints || 0
      });
      setSchedules(selectedTruck.schedules.map(s => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
      })));
    } else {
      resetForm();
    }
  }, [selectedTruck]);

  /**
   * フォームをリセット
   */
  const resetForm = () => {
    setFormData({
      name: '',
      plateNumber: '',
      capacityKg: 1000,
      inspectionExpiry: '',
      status: 'available',
      truckType: '',
      maxPoints: 0,
    });
    setSchedules([]);
    setNewSchedule({
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      status: 'available',
    });
  };

  /**
   * フォーム送信時の処理
   * @param e - フォームイベント
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.plateNumber) {
      alert('車両名とナンバープレートは必須です');
      return;
    }

    const truckData = {
      ...formData,
      schedules: schedules.map(s => ({
        ...s,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })),
    };

    if (selectedTruck) {
      onUpdateTruck({
        ...truckData,
        id: selectedTruck.id,
      });
    } else {
      onAddTruck(truckData);
    }
    
    resetForm();
    onSelectTruck(null);
  };

  /**
   * 新規スケジュールを追加
   */
  const addSchedule = () => {
    if (!newSchedule.date) {
      alert('日付を選択してください');
      return;
    }
    
    if (newSchedule.startTime >= newSchedule.endTime) {
      alert('開始時間は終了時間より前である必要があります');
      return;
    }

    setSchedules([...schedules, { ...newSchedule }]);
    setNewSchedule({
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      status: 'available',
    });
  };

  /**
   * スケジュールを削除
   * @param index - 削除するスケジュールのインデックス
   */
  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // formatTime は utils/dateTimeUtils.ts からインポート

  return (
    <div className="space-y-6">
      {/* トラック一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">登録済みトラック</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trucks.map((truck) => (
            <div
              key={truck.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedTruck?.id === truck.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectTruck(truck)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{truck.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  truck.status === 'available' ? 'bg-green-100 text-green-800' :
                  truck.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {truck.status === 'available' ? '稼働中' :
                   truck.status === 'maintenance' ? '整備中' : '停止中'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{truck.plateNumber}</p>
              <p className="text-sm text-gray-600 mb-2">積載量: {truck.capacityKg}kg</p>
              {truck.truckType && (
                <p className="text-sm text-gray-600 mb-2">種別: {truck.truckType}</p>
              )}
              {truck.maxPoints && truck.maxPoints > 0 && (
                <p className="text-sm text-blue-600 font-medium mb-2">
                  最大荷物ポイント: {truck.maxPoints}pt
                </p>
              )}
              <p className="text-sm text-gray-600 mb-3">車検: {truck.inspectionExpiry}</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTruck(truck);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  編集
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTruck(truck.id);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
        {trucks.length === 0 && (
          <p className="text-gray-500 text-center py-4">登録済みのトラックがありません</p>
        )}
      </div>

      {/* トラック登録・編集フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {selectedTruck ? 'トラック編集' : '新規トラック登録'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車両名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 2トン平ボディA"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ナンバープレート *
              </label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 品川400 あ12-34"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トラック種別
              </label>
              <select
                value={formData.truckType}
                onChange={(e) => handleTruckTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">種別を選択</option>
                {availableTruckTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                積載量 (kg)
              </label>
              <input
                type="number"
                value={formData.capacityKg}
                onChange={(e) => setFormData({ ...formData, capacityKg: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大荷物ポイント (pt)
              </label>
              <input
                type="number"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                placeholder="手動で設定する場合"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車検満了日
              </label>
              <input
                type="date"
                value={formData.inspectionExpiry}
                onChange={(e) => setFormData({ ...formData, inspectionExpiry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">稼働中</option>
                <option value="maintenance">整備中</option>
                <option value="inactive">停止中</option>
              </select>
            </div>
          </div>

          {/* スケジュール管理 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">稼働スケジュール</h3>
            
            {/* 新規スケジュール追加 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-3">新規スケジュール追加</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>

            {/* 登録済みスケジュール一覧 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">登録済みスケジュール</h4>
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-4">スケジュールが登録されていません</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">
                          {schedule.date}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           schedule.status === 'available' ? 'bg-green-100 text-green-800' :
                           'bg-yellow-100 text-yellow-800'
                         }`}>
                           {schedule.status === 'available' ? '空き' : '整備中'}
                         </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedTruck ? '更新' : '登録'}
            </button>
            {selectedTruck && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onSelectTruck(null);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 