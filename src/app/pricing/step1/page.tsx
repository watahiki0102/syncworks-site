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

// 初期データ
const DEFAULT_RULES = [
  { min: 0, max: 50, truckType: "軽トラ" },
  { min: 51, max: 150, truckType: "2tショート" },
  { min: 151, max: 300, truckType: "2tロング" },
  { min: 301, max: 500, truckType: "3t" },
  { min: 501, max: 800, truckType: "4t" },
  { min: 801, max: null, truckType: "4t複数 or 特別対応" }
];

interface TruckRule {
  id: string;
  min: number | null;
  max: number | null;
  truckType: string;
}

export default function PricingStep1Page() {
  const router = useRouter();
  const [rules, setRules] = useState<TruckRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const savedRules = localStorage.getItem('pricingStep1');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      // デフォルトルールを設定
      const defaultRules = DEFAULT_RULES.map((rule, index) => ({
        id: `rule-${index}`,
        min: rule.min,
        max: rule.max,
        truckType: rule.truckType
      }));
      setRules(defaultRules);
    }
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep1', JSON.stringify(rules));
    }
  }, [rules, isLoading]);

  // ルールの追加
  const addRule = () => {
    const newRule: TruckRule = {
      id: `rule-${Date.now()}`,
      min: null,
      max: null,
      truckType: "軽トラ"
    };
    setRules([...rules, newRule]);
  };

  // ルールの削除
  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // ルールの更新
  const updateRule = (id: string, field: keyof TruckRule, value: any) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // バリデーション
  const validateRules = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (rules.length === 0) {
      errors.push("最低1つのルールが必要です");
      return { isValid: false, errors };
    }

    // 重複チェック
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      
      if (rule.min === null && rule.max === null) {
        errors.push(`ルール${i + 1}: 下限または上限のいずれかは必須です`);
      }
      
      if (rule.min !== null && rule.max !== null && rule.min >= rule.max) {
        errors.push(`ルール${i + 1}: 上限は下限より大きい値にしてください`);
      }
      
      if (rule.truckType.trim() === '') {
        errors.push(`ルール${i + 1}: トラック種別を選択してください`);
      }
    }

    // 範囲の重複チェック
    for (let i = 0; i < rules.length - 1; i++) {
      const current = rules[i];
      const next = rules[i + 1];
      
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
            🚛 トラック換算ルール設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2">トラック換算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">2</div>
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
            荷物ポイント合計に応じて必要なトラックサイズを自動判定するルールを設定します。
            各行は自由に編集・追加・削除が可能です。
          </p>
        </div>

        {/* ルール設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🚛 トラック換算ルール</h2>
            <button
              onClick={addRule}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ＋ ルール追加
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ルールが設定されていません。「＋ ルール追加」ボタンで追加してください。
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">ルール {index + 1}</h3>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 下限 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        下限ポイント
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.min || ''}
                        onChange={(e) => updateRule(rule.id, 'min', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：0"
                      />
                    </div>

                    {/* 上限 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        上限ポイント
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.max || ''}
                        onChange={(e) => updateRule(rule.id, 'max', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：50（空白で上限なし）"
                      />
                    </div>

                    {/* トラック種別 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        トラック種別
                      </label>
                      <select
                        value={rule.truckType}
                        onChange={(e) => updateRule(rule.id, 'truckType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TRUCK_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 表示例 */}
                  <div className="mt-2 text-sm text-gray-600">
                    {rule.min !== null && rule.max !== null && (
                      <span>{rule.min}〜{rule.max}ポイント → {rule.truckType}</span>
                    )}
                    {rule.min !== null && rule.max === null && (
                      <span>{rule.min}ポイント以上 → {rule.truckType}</span>
                    )}
                    {rule.min === null && rule.max !== null && (
                      <span>{rule.max}ポイント以下 → {rule.truckType}</span>
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
            <p>• 〜50ポイント：軽トラ（小荷物）</p>
            <p>• 51〜150ポイント：2tショート（1K〜1LDK程度）</p>
            <p>• 151〜300ポイント：2tロング（2LDK程度）</p>
            <p>• 301〜500ポイント：3t（3LDK程度）</p>
            <p>• 501〜800ポイント：4t（4LDK以上）</p>
            <p>• 801ポイント〜：4t複数 or 特別対応</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/vendors')}
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