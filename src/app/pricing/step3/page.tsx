'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 初期データ
const DEFAULT_DISTANCE_RULES = [
  { min: 0, max: 5, price: 0, description: "基本料金に含まれる" },
  { min: 5, max: 10, price: 2000, description: "5km〜10km" },
  { min: 10, max: 20, price: 5000, description: "10km〜20km" },
  { min: 20, max: 30, price: 8000, description: "20km〜30km" },
  { min: 30, max: 50, price: 12000, description: "30km〜50km" },
  { min: 50, max: 100, price: 20000, description: "50km〜100km" },
  { min: 100, max: null, price: 30000, description: "100km以上" },
];

interface DistanceRule {
  id: string;
  min: number | null;
  max: number | null;
  price: number;
  description: string;
}

export default function PricingStep3Page() {
  const router = useRouter();
  const [distanceRules, setDistanceRules] = useState<DistanceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const savedRules = localStorage.getItem('pricingStep3');
    if (savedRules) {
      setDistanceRules(JSON.parse(savedRules));
    } else {
      // デフォルトルールを設定
      const defaultRules = DEFAULT_DISTANCE_RULES.map((rule, index) => ({
        id: `distance-${index}`,
        min: rule.min,
        max: rule.max,
        price: rule.price,
        description: rule.description
      }));
      setDistanceRules(defaultRules);
    }
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep3', JSON.stringify(distanceRules));
    }
  }, [distanceRules, isLoading]);

  // ルールの追加
  const addRule = () => {
    const newRule: DistanceRule = {
      id: `distance-${Date.now()}`,
      min: null,
      max: null,
      price: 0,
      description: ""
    };
    setDistanceRules([...distanceRules, newRule]);
  };

  // ルールの削除
  const removeRule = (id: string) => {
    setDistanceRules(distanceRules.filter(rule => rule.id !== id));
  };

  // ルールの更新
  const updateRule = (id: string, field: keyof DistanceRule, value: any) => {
    setDistanceRules(distanceRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // バリデーション
  const validateRules = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (distanceRules.length === 0) {
      errors.push("最低1つの距離ルールが必要です");
      return { isValid: false, errors };
    }

    // 重複チェック
    for (let i = 0; i < distanceRules.length; i++) {
      const rule = distanceRules[i];
      
      if (rule.min === null && rule.max === null) {
        errors.push(`ルール${i + 1}: 下限または上限のいずれかは必須です`);
      }
      
      if (rule.min !== null && rule.max !== null && rule.min >= rule.max) {
        errors.push(`ルール${i + 1}: 上限は下限より大きい値にしてください`);
      }
      
      if (rule.price < 0) {
        errors.push(`ルール${i + 1}: 料金は0円以上にしてください`);
      }
    }

    // 範囲の重複チェック
    for (let i = 0; i < distanceRules.length - 1; i++) {
      const current = distanceRules[i];
      const next = distanceRules[i + 1];
      
      if (current.max !== null && next.min !== null && current.max >= next.min) {
        errors.push(`ルール${i + 1}と${i + 2}: 範囲が重複しています`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // 次へ進む
  const handleNext = () => {
    const validation = validateRules();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    router.push('/pricing/step4');
  };

  // 前へ戻る
  const handleBack = () => {
    router.push('/pricing/step2');
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
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            📏 距離別加算料金設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2">料金設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
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
            搬出〜搬入距離に応じた追加料金を設定します。
            基本料金に加算される距離料金を距離区分ごとに設定できます。
          </p>
        </div>

        {/* 距離料金設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📏 距離別加算料金</h2>
            <button
              onClick={addRule}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ＋ 距離ルール追加
            </button>
          </div>

          {distanceRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              距離ルールが設定されていません。「＋ 距離ルール追加」ボタンで追加してください。
            </div>
          ) : (
            <div className="space-y-4">
              {distanceRules.map((rule, index) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">距離ルール {index + 1}</h3>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 下限 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        下限距離（km）
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rule.min || ''}
                        onChange={(e) => updateRule(rule.id, 'min', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：0"
                      />
                    </div>

                    {/* 上限 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        上限距離（km）
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rule.max || ''}
                        onChange={(e) => updateRule(rule.id, 'max', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：5（空白で上限なし）"
                      />
                    </div>

                    {/* 加算料金 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        加算料金（円）
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.price}
                        onChange={(e) => updateRule(rule.id, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：2000"
                      />
                    </div>

                    {/* 説明 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明
                      </label>
                      <input
                        type="text"
                        value={rule.description}
                        onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：5km〜10km"
                      />
                    </div>
                  </div>

                  {/* 表示例 */}
                  <div className="mt-2 text-sm text-gray-600">
                    {rule.min !== null && rule.max !== null && (
                      <span>{rule.min}km〜{rule.max}km → {'+¥' + rule.price.toLocaleString()}</span>
                    )}
                    {rule.min !== null && rule.max === null && (
                      <span>{rule.min}km以上 → {'+¥' + rule.price.toLocaleString()}</span>
                    )}
                    {rule.min === null && rule.max !== null && (
                      <span>{rule.max}km以下 → {'+¥' + rule.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 参考例 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 参考例</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 0〜5km：基本料金に含まれる（加算0円）</p>
            <p>• 5〜10km：+2,000円</p>
            <p>• 10〜20km：+5,000円</p>
            <p>• 20〜30km：+8,000円</p>
            <p>• 30〜50km：+12,000円</p>
            <p>• 50〜100km：+20,000円</p>
            <p>• 100km以上：+30,000円</p>
          </div>
        </div>

        {/* 料金計算例 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🧮 料金計算例</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• 基本料金：35,000円（2tショート × 2人）</p>
            <p>• 距離：15km → +5,000円</p>
            <p>• 合計：40,000円</p>
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