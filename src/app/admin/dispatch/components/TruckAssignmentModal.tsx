/**
 * トラック割り当てモーダルコンポーネント
 * - フォーム提出に対してトラックを割り当てる
 * - スケジュール競合チェック
 * - 推奨トラックの表示
 * - 見積もり価格の計算
 */
'use client';
import React, { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../../../utils/dateTimeUtils';

/**
 * トラック情報の型定義
 */
export interface Truck {
  id: string;              // トラックID
  name: string;            // トラック名
  plateNumber: string;     // ナンバープレート
  capacityKg: number;      // 積載量（kg）
  inspectionExpiry: string; // 車検有効期限
  status: 'available' | 'maintenance' | 'inactive'; // ステータス
  truckType: string;       // トラック種別
  schedules?: Schedule[];  // スケジュール一覧
  basePrice?: number;      // 基本料金
}

/**
 * スケジュール情報の型定義
 */
export interface Schedule {
  id: string;              // スケジュールID
  date: string;            // 日付
  startTime: string;       // 開始時刻
  endTime: string;         // 終了時刻
  status: 'available' | 'booked' | 'maintenance'; // ステータス
  customerName?: string;   // 顧客名
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance'; // 作業タイプ
  description?: string;    // 説明
  capacity?: number;       // 容量
  origin?: string;         // 出発地
  destination?: string;    // 目的地
}

/**
 * トラック割り当て情報の型定義
 */
export interface TruckAssignment {
  truckId: string;         // トラックID
  truckName: string;       // トラック名
  capacity: number;        // 容量
  startTime: string;       // 開始時刻
  endTime: string;         // 終了時刻
  workType: 'loading' | 'moving' | 'unloading'; // 作業タイプ
}

/**
 * フォーム提出情報の型定義
 */
export interface FormSubmission {
  id: string;              // 提出ID
  customerName: string;    // 顧客名
  customerEmail: string;   // 顧客メール
  moveDate: string;        // 引越し日
  totalCapacity: number;   // 総容量
  totalPoints: number;     // 総ポイント
  distance?: number;       // 距離
}

/**
 * プロパティの型定義
 */
interface Props {
  selectedSubmission: FormSubmission | null;  // 選択された提出
  trucks: Truck[];                            // トラック一覧
  pricingTrucks: Truck[];                     // 料金設定トラック一覧
  setShowTruckModal: React.Dispatch<React.SetStateAction<boolean>>; // モーダル表示制御
  assignTruckToSubmission: (id: string, assign: TruckAssignment) => void; // 割り当て処理
  calculateRecommendedTrucks: (points: number) => Truck[]; // 推奨トラック計算
  calculateEstimatedPrice: (points: number, distance?: number) => number; // 見積もり価格計算
}

export default function TruckAssignmentModal({
  selectedSubmission,
  trucks,
  pricingTrucks,
  setShowTruckModal,
  assignTruckToSubmission,
  calculateRecommendedTrucks,
  calculateEstimatedPrice
}: Props) {
  const [modalSelectedTruck, setModalSelectedTruck] = useState<Truck | null>(null);
  const [formData, setFormData] = useState({
    capacity: '',
    startTime: '09:00',
    endTime: '17:00',
    workType: 'loading' as 'loading' | 'moving' | 'unloading',
  });

  /**
   * 選択された提出が変更された時の初期化
   */
  useEffect(() => {
    if (selectedSubmission) {
      setFormData({
        capacity: '',
        startTime: '09:00',
        endTime: '17:00',
        workType: 'loading',
      });
      setModalSelectedTruck(null);
    }
  }, [selectedSubmission]);

  /**
   * 推奨トラックと見積もり価格の計算
   */
  const recommendedTrucks = selectedSubmission ?
    calculateRecommendedTrucks(selectedSubmission.totalPoints) : [];
  const estimatedPrice = selectedSubmission ?
    calculateEstimatedPrice(selectedSubmission.totalPoints, selectedSubmission.distance || 0) : 0;

  /**
   * フォーム送信処理
   * @param e フォームイベント
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSelectedTruck || !selectedSubmission) return;

    const truckAssignment: TruckAssignment = {
      truckId: modalSelectedTruck.id,
      truckName: modalSelectedTruck.name,
      capacity: parseInt(formData.capacity),
      startTime: formData.startTime,
      endTime: formData.endTime,
      workType: formData.workType,
    };

    assignTruckToSubmission(selectedSubmission.id, truckAssignment);
    setShowTruckModal(false);
    setModalSelectedTruck(null);
  };

  /**
   * 利用可能な料金設定トラックのフィルタリング
   * - ステータスが利用可能
   * - スケジュール競合がない
   */
  const availablePricingTrucks = pricingTrucks.filter(truck => {
    const hasConflict = trucks.some(dispatchTruck =>
      dispatchTruck.schedules?.some(schedule =>
        schedule.date === selectedSubmission?.moveDate &&
        schedule.status === 'booked' &&
        ((schedule.startTime <= formData.startTime && schedule.endTime > formData.startTime) ||
         (schedule.startTime < formData.endTime && schedule.endTime >= formData.endTime) ||
         (schedule.startTime >= formData.startTime && schedule.endTime <= formData.endTime))
      ) || false
    );
    return truck.status === 'available' && !hasConflict;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">トラック割り当て</h3>

        {selectedSubmission && (
          <div className="mb-4 p-4 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-900">{selectedSubmission.customerName}</h4>
            <p className="text-sm text-blue-700">{selectedSubmission.customerEmail}</p>
            <p className="text-sm text-blue-600">
              {formatDate(selectedSubmission.moveDate)} {formatTime(formData.startTime)}-{formatTime(formData.endTime)}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-blue-600">
                  総容量: {selectedSubmission.totalCapacity.toLocaleString()}kg
                </p>
                <p className="text-sm text-blue-600">
                  総ポイント: {selectedSubmission.totalPoints}pt
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600">
                  見積もり価格: ¥{estimatedPrice.toLocaleString()}
                </p>
                {selectedSubmission.distance && (
                  <p className="text-sm text-blue-600">距離: {selectedSubmission.distance}km</p>
                )}
              </div>
            </div>
            {recommendedTrucks.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-blue-900 mb-2">推奨トラック:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedTrucks.map(truck => (
                    <span
                      key={truck.id}
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        modalSelectedTruck?.id === truck.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => setModalSelectedTruck(truck)}
                    >
                      {truck.name} ({truck.truckType})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">トラック選択</label>
            <select
              value={modalSelectedTruck?.id || ''}
              onChange={e => {
                const truck = availablePricingTrucks.find(t => t.id === e.target.value);
                setModalSelectedTruck(truck || null);
              }}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">トラックを選択</option>
              {availablePricingTrucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.name} ({truck.plateNumber}) - {truck.truckType} - {truck.capacityKg}kg - ¥{(truck.basePrice || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">割り当て容量（kg）</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                min="0"
                max={modalSelectedTruck?.capacityKg}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作業区分</label>
              <select
                value={formData.workType}
                onChange={e => setFormData({ ...formData, workType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="loading">積込</option>
                <option value="moving">移動</option>
                <option value="unloading">積卸</option>
              </select>
            </div>
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

          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              割り当て
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTruckModal(false);
                setModalSelectedTruck(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

