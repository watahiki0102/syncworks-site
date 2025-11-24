/**
 * シミュレーションパネルコンポーネント
 * 表示項目: 荷物ポイント、料金、選択した荷物の一覧
 * トグル機能の有無をpropsで制御可能
 */
'use client';

import { useState } from 'react';
import { ITEM_CATEGORY_NAMES, ITEM_CATEGORIES } from '@/constants/items';
import { usePriceCalculator } from './PriceCalculator';

interface SimulationItem {
  id: string;
  name: string;
  points: number;
  quantity: number;
}

interface SimulationPanelProps {
  items: SimulationItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearAll: () => void;
  onAddItem?: (itemId: string, itemName: string, points: number) => void;
  onClose?: () => void; // パネルを閉じるコールバック
  enableToggle?: boolean; // トグル機能の有無を制御
}

export default function SimulationPanel({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearAll,
  onAddItem,
  onClose,
  enableToggle = true
}: SimulationPanelProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [isSelectedItemsOpen, setIsSelectedItemsOpen] = useState(false);
  
  // 計算結果をstateで管理（再計算ボタン押下時のみ更新）
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  // 共通の料金計算機能を使用（再計算時のみ使用）
  const { calculationResult, calculateEstimate } = usePriceCalculator({});

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));

    // 既存のアイテムかどうかチェック
    const existingItem = items.find(item => item.name === itemId);

    if (quantity > 0) {
      if (existingItem) {
        // 既存のアイテムの場合、数量を更新
        onUpdateQuantity(existingItem.id, quantity);
      } else {
        // 新しいアイテムの場合、追加
        const itemPoints = getItemPoints(itemId);
        if (onAddItem) {
          onAddItem(itemId, itemId, itemPoints);
        } else {
          console.error('onAddItem is not available!');
        }
      }
    } else if (quantity === 0 && existingItem) {
      // 数量が0の場合、選択された荷物から削除
      onRemoveItem(existingItem.id);
    }
  };

  // 再計算ボタンが押された時の処理
  const handleRecalculate = () => {
    // 選択された荷物の数量を更新
    items.forEach(item => {
      const quantity = quantities[item.name];
      if (quantity !== undefined && quantity > 0) {
        onUpdateQuantity(item.id, quantity);
      }
    });

    // 計算結果を更新
    const totalPoints = items.reduce((total, item) => total + (item.points * item.quantity), 0);
    const totalPrice = items.reduce((total, item) => total + (item.points * item.quantity * 1000), 0); // 仮の単価

    setCalculatedPoints(totalPoints);
    setCalculatedPrice(totalPrice);

    // 料金計算を実行
    calculateEstimate();
  };

  // アイテムのポイントを取得する関数
  const getItemPoints = (itemName: string): number => {
    for (const category of ITEM_CATEGORIES) {
      const item = category.items.find(i => i.name === itemName);
      if (item) {
        return item.defaultPoints;
      }
    }
    return 10; // デフォルトポイント
  };

  const handleAddToSimulation = (itemId: string, itemName: string, points: number) => {
    if (onAddItem) {
      onAddItem(itemId, itemName, points);
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="fixed top-0 right-0 w-1/3 h-screen bg-white border-l border-gray-200 shadow-lg overflow-hidden" style={{ zIndex: 9998 }}>
      <div className="h-full flex flex-col">
        {/* ヘッダー - 固定部分 */}
        <div className="sticky top-0 z-10 flex-shrink-0 bg-gray-50 border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">📊 料金シミュレーション</h2>
              <p className="text-sm text-gray-600 mt-1">荷物を選択してトラックサイズを確認</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors text-2xl font-bold leading-none"
                title="閉じる"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 結果表示エリア - 固定部分 */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* 荷物ポイント表示 */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {calculatedPoints}pt
                </div>
                <div className="text-xs text-gray-600">
                  合計ポイント
                </div>
              </div>
            </div>

            {/* 料金表示 */}
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  ¥{calculatedPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">
                  合計料金（税込）
                </div>
              </div>
            </div>

            {/* 推奨トラック種別 */}
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-sm font-semibold text-orange-600">
                  {calculationResult?.truckSize || '未選択'}
                </div>
                <div className="text-xs text-gray-600">
                  推奨トラック
                </div>
              </div>
            </div>
          </div>
          
          {/* 再計算ボタン */}
          <div className="text-center">
            <button
              onClick={handleRecalculate}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs font-medium"
            >
              再計算
            </button>
          </div>
        </div>

        {/* スクロール可能エリア */}
        <div className="flex-1 overflow-y-auto">
          {/* 選択された荷物の一覧 - トグル形式 */}
          <div className="bg-white shadow-md rounded-lg border border-gray-200">
          <button
            onClick={() => setIsSelectedItemsOpen(!isSelectedItemsOpen)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">📦 選択された荷物 ({items.length}個)</h3>
            <span className="text-2xl font-bold text-gray-600">
              {isSelectedItemsOpen ? '−' : '+'}
            </span>
          </button>
          
          {isSelectedItemsOpen && (
            <div className="px-4 pb-4">
              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-sm">荷物を選択してください</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.points}pt × {item.quantity}個
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 荷物選択エリア - 常時表示 */}
        <div className="p-4 space-y-6">

          {/* 家具・家電の数量入力 - トグル機能の有無で分岐 */}
          {ITEM_CATEGORY_NAMES.map(({ category, data }) => (
            <section key={category} className="bg-white shadow-md rounded-lg border border-gray-200">
              {enableToggle ? (
                // トグル形式（管理画面用）
                <>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h2 className="text-lg font-semibold">🗂 {category}</h2>
                    <span className="text-2xl font-bold text-gray-600">
                      {openCategories[category] ? '−' : '+'}
                    </span>
                  </button>
                  
                  {openCategories[category] && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.map((itemName) => (
                          <div key={itemName} className="flex items-center justify-between">
                            <label className="flex-1 mr-4 text-sm">{itemName}</label>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(itemName, Math.max(0, (quantities[itemName] || 0) - 1))}
                                className="px-3 py-2 sm:px-2 sm:py-1 bg-gray-200 rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-gray-300"
                              >
                                −
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={quantities[itemName] || 0}
                                onChange={(e) => handleQuantityChange(itemName, parseInt(e.target.value) || 0)}
                                className="w-16 text-center border border-gray-300 rounded text-sm"
                              />

                              <button
                                type="button"
                                onClick={() => handleQuantityChange(itemName, (quantities[itemName] || 0) + 1)}
                                className="px-3 py-2 sm:px-2 sm:py-1 bg-green-500 text-white rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-green-600"
                              >
                                ＋
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // 常時表示（お客さん画面用）
                <>
                  <h2 className="text-lg font-semibold mb-4 px-4 pt-4">🗂 {category}</h2>
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.map((itemName) => (
                        <div key={itemName} className="flex items-center justify-between">
                          <label className="flex-1 mr-4 text-sm">{itemName}</label>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(itemName, Math.max(0, (quantities[itemName] || 0) - 1))}
                              className="px-3 py-2 sm:px-2 sm:py-1 bg-gray-200 rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-gray-300"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={quantities[itemName] || 0}
                              onChange={(e) => handleQuantityChange(itemName, parseInt(e.target.value) || 0)}
                              className="w-16 text-center border border-gray-300 rounded text-sm"
                            />

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(itemName, (quantities[itemName] || 0) + 1)}
                              className="px-3 py-2 sm:px-2 sm:py-1 bg-green-500 text-white rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center hover:bg-green-600"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>
          ))}
        </div>


          {/* クリアボタン */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={onClearAll}
                className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition text-sm font-medium"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
