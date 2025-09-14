/**
 * 荷物選択コンポーネント
 * form/step2と同じスタイルの共通コンポーネント
 */
'use client';

import { ITEM_CATEGORY_NAMES, ITEM_CATEGORIES } from '@/constants/items';

interface ItemQuantity {
  [key: string]: number;
}

interface ItemSelectorProps {
  quantities: ItemQuantity;
  onQuantityChange: (itemId: string, quantity: number) => void;
  showForm?: boolean; // form/step2スタイルを使用するかどうか
}

export default function ItemSelector({
  quantities,
  onQuantityChange,
  showForm = false
}: ItemSelectorProps) {

  if (showForm) {
    // form/step2と同じスタイル
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">必要なものをすべて入力してください（0でもOK）</p>
          <p className="text-sm text-gray-500">※ 段ボールに梱包できるものは入力不要です</p>
        </div>

        {/* 家具・家電の数量入力 - form/step2と同じスタイル */}
        {ITEM_CATEGORY_NAMES.map(({ category, data }) => (
          <section key={category} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">🗂 {category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.map((itemName) => (
                <div key={itemName} className="flex items-center justify-between">
                  <label className="flex-1 mr-4">{itemName}</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(itemName, Math.max(0, (quantities[itemName] || 0) - 1))}
                      className="px-3 py-2 sm:px-2 sm:py-1 bg-gray-200 rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-gray-300"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={quantities[itemName] || 0}
                      onChange={(e) => onQuantityChange(itemName, parseInt(e.target.value) || 0)}
                      className="w-16 text-center border border-gray-300 rounded"
                    />

                    <button
                      type="button"
                      onClick={() => onQuantityChange(itemName, (quantities[itemName] || 0) + 1)}
                      className="px-3 py-2 sm:px-2 sm:py-1 bg-green-500 text-white rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-green-600"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // 元のシミュレーション用スタイル
  return (
    <div className="space-y-4">
      {/* 荷物選択 */}
      <div className="space-y-4">
        {ITEM_CATEGORIES.map(({ category, items }) => (
          <div key={category} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🗂 {category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.name} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-800 flex-1 pr-2">
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onQuantityChange(item.name, Math.max(0, (quantities[item.name] || 0) - 1))}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-12 text-center">
                      {quantities[item.name] || 0}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.name, (quantities[item.name] || 0) + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {item.defaultPoints}pt
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
