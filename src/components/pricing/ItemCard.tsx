/**
 * 荷物カードコンポーネント
 * シミュレーション機能付きの荷物設定カード
 */
'use client';

import { ItemPoint } from '@/types/pricing';

interface ItemCardProps {
  item: ItemPoint;
  onUpdatePoints: (id: string, points: number) => void;
  onUpdateAdditionalCost: (id: string, cost: number) => void;
  onResetToDefault: (id: string) => void;
  onAddToSimulation: (item: ItemPoint) => void;
  isSimulationEnabled: boolean;
}

export default function ItemCard({
  item,
  onUpdatePoints,
  onUpdateAdditionalCost,
  onResetToDefault,
  onAddToSimulation,
  isSimulationEnabled
}: ItemCardProps) {
  return (
    <div className="border border-gray-200 rounded p-3 min-h-[200px]">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-800 flex-1 pr-2">{item.name}</span>
        <div className="flex space-x-1">
          {isSimulationEnabled && (
            <button
              onClick={() => onAddToSimulation(item)}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
              title="シミュレーションに追加"
            >
              ➕
            </button>
          )}
          <button
            onClick={() => onResetToDefault(item.id)}
            className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
            title="デフォルト値にリセット"
          >
            🔄
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">ポイント</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={item.points}
              onChange={(e) => onUpdatePoints(item.id, parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">pt</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">加算料金</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={item.additionalCost}
              onChange={(e) => onUpdateAdditionalCost(item.id, parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <span className="text-xs text-gray-500">円</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <div className="text-xs text-gray-400">
          ※追加料金が必要な場合のみ入力
        </div>
        <div className="text-xs text-gray-500">
          デフォルト: {item.defaultPoints}pt
        </div>
      </div>
    </div>
  );
}
