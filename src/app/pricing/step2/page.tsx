'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// トラック種別の定義
const TRUCK_TYPES = [
  "軽トラ",
  "2tショート",
  "2tロング", 
  "3t",
  "4t",
  "4t複数",
  "特別対応"
];

// 作業人数の定義
const WORKER_COUNTS = [1, 2, 3, 4, 5, 6];

// 初期データ
const DEFAULT_PRICING = [
  { truckType: "軽トラ", workers: 1, basePrice: 15000, workerPrice: 0 },
  { truckType: "軽トラ", workers: 2, basePrice: 20000, workerPrice: 5000 },
  { truckType: "2tショート", workers: 1, basePrice: 25000, workerPrice: 0 },
  { truckType: "2tショート", workers: 2, basePrice: 35000, workerPrice: 10000 },
  { truckType: "2tショート", workers: 3, basePrice: 45000, workerPrice: 10000 },
  { truckType: "2tロング", workers: 1, basePrice: 30000, workerPrice: 0 },
  { truckType: "2tロング", workers: 2, basePrice: 40000, workerPrice: 10000 },
  { truckType: "2tロング", workers: 3, basePrice: 50000, workerPrice: 10000 },
  { truckType: "3t", workers: 1, basePrice: 40000, workerPrice: 0 },
  { truckType: "3t", workers: 2, basePrice: 55000, workerPrice: 15000 },
  { truckType: "3t", workers: 3, basePrice: 70000, workerPrice: 15000 },
  { truckType: "4t", workers: 1, basePrice: 50000, workerPrice: 0 },
  { truckType: "4t", workers: 2, basePrice: 70000, workerPrice: 20000 },
  { truckType: "4t", workers: 3, basePrice: 90000, workerPrice: 20000 },
  { truckType: "4t", workers: 4, basePrice: 110000, workerPrice: 20000 },
];

interface PricingRule {
  id: string;
  truckType: string;
  workers: number;
  basePrice: number;
  workerPrice: number;
}

export default function PricingStep2Page() {
  const router = useRouter();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const savedPricing = localStorage.getItem('pricingStep2');
    if (savedPricing) {
      setPricingRules(JSON.parse(savedPricing));
    } else {
      // デフォルト料金を設定
      const defaultPricing = DEFAULT_PRICING.map((rule, index) => ({
        id: `pricing-${index}`,
        truckType: rule.truckType,
        workers: rule.workers,
        basePrice: rule.basePrice,
        workerPrice: rule.workerPrice
      }));
      setPricingRules(defaultPricing);
    }
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep2', JSON.stringify(pricingRules));
    }
  }, [pricingRules, isLoading]);

  // 料金ルールの追加
  const addPricingRule = () => {
    const newRule: PricingRule = {
      id: `pricing-${Date.now()}`,
      truckType: "軽トラ",
      workers: 1,
      basePrice: 0,
      workerPrice: 0
    };
    setPricingRules([...pricingRules, newRule]);
  };

  // 料金ルールの削除
  const removePricingRule = (id: string) => {
    setPricingRules(pricingRules.filter(rule => rule.id !== id));
  };

  // 料金ルールの更新
  const updatePricingRule = (id: string, field: keyof PricingRule, value: any) => {
    setPricingRules(pricingRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // 料金計算
  const calculateTotalPrice = (rule: PricingRule) => {
    return rule.basePrice + (rule.workerPrice * (rule.workers - 1));
  };

  // バリデーション
  const validatePricing = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (pricingRules.length === 0) {
      errors.push("最低1つの料金設定が必要です");
      return { isValid: false, errors };
    }

    // 重複チェック
    const combinations = new Set();
    for (let i = 0; i < pricingRules.length; i++) {
      const rule = pricingRules[i];
      const key = `${rule.truckType}-${rule.workers}`;
      
      if (combinations.has(key)) {
        errors.push(`重複: ${rule.truckType} × ${rule.workers}人の設定が重複しています`);
      } else {
        combinations.add(key);
      }
      
      if (rule.basePrice < 0) {
        errors.push(`${rule.truckType} × ${rule.workers}人: 基本料金は0円以上にしてください`);
      }
      
      if (rule.workerPrice < 0) {
        errors.push(`${rule.truckType} × ${rule.workers}人: 作業員追加料金は0円以上にしてください`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // 次へ進む
  const handleNext = () => {
    const validation = validatePricing();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    router.push('/pricing/step3');
  };

  // 前へ戻る
  const handleBack = () => {
    router.push('/pricing/step1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            💰 料金設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <span className="ml-2">トラック換算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2">料金設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
              <span className="ml-2">距離加算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">4</div>
              <span className="ml-2">シーズン設定</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 設定内容</h2>
          <p className="text-gray-700">
            トラック種別と作業人数に応じた基本料金を設定します。
            基本料金 + 作業員追加料金 × (作業員数 - 1) で計算されます。
          </p>
        </div>

        {/* 料金設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">💰 料金設定</h2>
            <button
              onClick={addPricingRule}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ＋ 料金設定追加
            </button>
          </div>

          {pricingRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              料金設定がありません。「＋ 料金設定追加」ボタンで追加してください。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">トラック種別</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">作業員数</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">基本料金（円）</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">作業員追加料金（円/人）</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">合計料金</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRules.map((rule, index) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <select
                          value={rule.truckType}
                          onChange={(e) => updatePricingRule(rule.id, 'truckType', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          {TRUCK_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <select
                          value={rule.workers}
                          onChange={(e) => updatePricingRule(rule.id, 'workers', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          {WORKER_COUNTS.map(count => (
                            <option key={count} value={count}>{count}人</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={rule.basePrice}
                          onChange={(e) => updatePricingRule(rule.id, 'basePrice', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={rule.workerPrice}
                          onChange={(e) => updatePricingRule(rule.id, 'workerPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-2 font-semibold text-blue-600">
                        {'¥' + calculateTotalPrice(rule).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <button
                          onClick={() => removePricingRule(rule.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ 削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 料金計算例 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 料金計算例</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 基本料金：トラック1台分の基本料金</p>
            <p>• 作業員追加料金：2人目以降の作業員1人あたりの追加料金</p>
            <p>• 計算式：基本料金 + 作業員追加料金 × (作業員数 - 1)</p>
            <p>• 例：2tショート × 3人 = 35,000円 + 10,000円 × 2 = 55,000円</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-400 text-white px-6 py-3 rounded hover:bg-gray-500 transition"
          >
            ← 戻る
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            次へ →
          </button>
        </div>
      </div>
    </main>
  );
} 