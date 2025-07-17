/**
 * トラック管理モーダルコンポーネント
 * - 新規トラックの追加
 * - 既存トラックの編集
 * - トラック情報の入力フォーム
 */
'use client';
import React from 'react';

/**
 * トラックフォームデータの型定義
 */
interface TruckFormData {
  name: string;            // トラック名
  plateNumber: string;     // ナンバープレート
  truckType: string;       // トラック種別
  capacityKg: number;      // 積載量（kg）
  basePrice: number;       // 基本料金
  status: 'active' | 'inactive'; // ステータス
  description: string;     // 説明
}

/**
 * 料金設定トラック情報の型定義
 */
export interface PricingTruck {
  id: string;              // トラックID
  name: string;            // トラック名
  plateNumber: string;     // ナンバープレート
  truckType: string;       // トラック種別
  capacityKg: number;      // 積載量（kg）
  basePrice: number;       // 基本料金
  status: 'active' | 'inactive'; // ステータス
  description?: string;    // 説明
}

/**
 * プロパティの型定義
 */
interface Props {
  selectedTruck: PricingTruck | null;  // 選択されたトラック
  truckFormData: TruckFormData;        // フォームデータ
  setTruckFormData: React.Dispatch<React.SetStateAction<TruckFormData>>; // フォームデータ更新
  setShowTruckModal: React.Dispatch<React.SetStateAction<boolean>>; // モーダル表示制御
  addPricingTruck: () => void;         // トラック追加処理
  updatePricingTruck: (truck: PricingTruck) => void; // トラック更新処理
  truckTypes: string[];                // トラック種別一覧
}

export default function TruckManagementModal({
  selectedTruck,
  truckFormData,
  setTruckFormData,
  setShowTruckModal,
  addPricingTruck,
  updatePricingTruck,
  truckTypes
}: Props) {
  /**
   * フォーム送信処理
   * @param e フォームイベント
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTruck) {
      updatePricingTruck({
        ...selectedTruck,
        ...truckFormData,
      });
    } else {
      addPricingTruck();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedTruck ? 'トラック編集' : '新規トラック追加'}
          </h2>
          <button
            onClick={() => setShowTruckModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車両名 *
              </label>
              <input
                type="text"
                value={truckFormData.name}
                onChange={e => setTruckFormData({ ...truckFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 軽トラA"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ナンバープレート *
              </label>
              <input
                type="text"
                value={truckFormData.plateNumber}
                onChange={e => setTruckFormData({ ...truckFormData, plateNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 品川400 あ12-34"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トラック種別 *
              </label>
              <select
                value={truckFormData.truckType}
                onChange={e => setTruckFormData({ ...truckFormData, truckType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">種別を選択</option>
                {truckTypes.map(type => (
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
                value={truckFormData.capacityKg}
                onChange={e => setTruckFormData({ ...truckFormData, capacityKg: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                基本料金 (円)
              </label>
              <input
                type="number"
                value={truckFormData.basePrice}
                onChange={e => setTruckFormData({ ...truckFormData, basePrice: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={truckFormData.status}
                onChange={e => setTruckFormData({ ...truckFormData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">稼働中</option>
                <option value="inactive">停止中</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={truckFormData.description}
              onChange={e => setTruckFormData({ ...truckFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="トラックの詳細説明"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowTruckModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedTruck ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

