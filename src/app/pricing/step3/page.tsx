'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 料金タイプの定義
const PRICE_TYPES = [
  { value: 'percentage', label: 'パーセンテージ（%）' },
  { value: 'fixed', label: '固定金額（円）' }
];

// 初期データ
const DEFAULT_SEASON_RULES = [
  {
    name: "年末年始",
    startDate: "2024-12-25",
    endDate: "2025-01-05",
    priceType: "percentage",
    price: 20,
    description: "年末年始の繁忙期"
  },
  {
    name: "引越しシーズン",
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    priceType: "percentage",
    price: 15,
    description: "春の引越しシーズン"
  },
  {
    name: "夏季料金",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    priceType: "fixed",
    price: 5000,
    description: "夏季の特別料金"
  }
];

interface SeasonRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceType: 'percentage' | 'fixed';
  price: number;
  description: string;
}

export default function PricingStep3Page() {
  const router = useRouter();
  const [seasonRules, setSeasonRules] = useState<SeasonRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const savedRules = localStorage.getItem('pricingStep3');
    if (savedRules) {
      setSeasonRules(JSON.parse(savedRules));
    } else {
      // デフォルトルールを設定
      const defaultRules = DEFAULT_SEASON_RULES.map((rule, index) => ({
        id: `season-${index}`,
        name: rule.name,
        startDate: rule.startDate,
        endDate: rule.endDate,
        priceType: rule.priceType as 'percentage' | 'fixed',
        price: rule.price,
        description: rule.description
      }));
      setSeasonRules(defaultRules);
    }
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep3', JSON.stringify(seasonRules));
    }
  }, [seasonRules, isLoading]);

  // ルールの追加
  const addRule = () => {
    const newRule: SeasonRule = {
      id: `season-${Date.now()}`,
      name: "",
      startDate: "",
      endDate: "",
      priceType: "percentage",
      price: 0,
      description: ""
    };
    setSeasonRules([...seasonRules, newRule]);
  };

  // ルールの削除
  const removeRule = (id: string) => {
    setSeasonRules(seasonRules.filter(rule => rule.id !== id));
  };

  // ルールの更新
  const updateRule = (id: string, field: keyof SeasonRule, value: any) => {
    setSeasonRules(seasonRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // 日付の重複チェック
  const checkDateOverlap = (startDate: string, endDate: string, excludeId?: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return seasonRules.some(rule => {
      if (excludeId && rule.id === excludeId) return false;
      
      const ruleStart = new Date(rule.startDate);
      const ruleEnd = new Date(rule.endDate);
      
      return (start <= ruleEnd && end >= ruleStart);
    });
  };

  // バリデーション
  const validateRules = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (seasonRules.length === 0) {
      errors.push("最低1つのシーズンルールが必要です");
      return { isValid: false, errors };
    }

    // 各ルールのチェック
    for (let i = 0; i < seasonRules.length; i++) {
      const rule = seasonRules[i];
      
      if (!rule.name.trim()) {
        errors.push(`ルール${i + 1}: シーズン名を入力してください`);
      }
      
      if (!rule.startDate) {
        errors.push(`ルール${i + 1}: 開始日を選択してください`);
      }
      
      if (!rule.endDate) {
        errors.push(`ルール${i + 1}: 終了日を選択してください`);
      }
      
      if (rule.startDate && rule.endDate && rule.startDate > rule.endDate) {
        errors.push(`ルール${i + 1}: 終了日は開始日より後にしてください`);
      }
      
      if (rule.price < 0) {
        errors.push(`ルール${i + 1}: 料金は0以上にしてください`);
      }
      
      if (rule.priceType === 'percentage' && rule.price > 100) {
        errors.push(`ルール${i + 1}: パーセンテージは100%以下にしてください`);
      }
    }

    // 日付の重複チェック
    for (let i = 0; i < seasonRules.length; i++) {
      const rule = seasonRules[i];
      if (rule.startDate && rule.endDate) {
        if (checkDateOverlap(rule.startDate, rule.endDate, rule.id)) {
          errors.push(`ルール${i + 1}: 他のシーズンと日付が重複しています`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // 完了処理
  const handleComplete = () => {
    const validation = validateRules();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    
    // 全ステップのデータを保存
    const allPricingData = {
      step1: JSON.parse(localStorage.getItem('pricingStep1') || '[]'),
      step2: JSON.parse(localStorage.getItem('pricingStep2') || '[]'),
      step3: seasonRules
    };
    
    localStorage.setItem('pricingComplete', JSON.stringify(allPricingData));
    alert('料金設定が完了しました！');
    router.push('/vendors');
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
            🌸 シーズン料金設定
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
              <span className="ml-2">シーズン設定</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 設定内容</h2>
          <p className="text-gray-700">
            繁忙期・閑散期など時期による料金加算を設定します。
            日付範囲と加算金額（パーセンテージまたは固定金額）を指定できます。
          </p>
        </div>

        {/* シーズン料金設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📅 シーズン料金設定</h2>
            <button
              onClick={addRule}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ＋ シーズン追加
            </button>
          </div>

          {seasonRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              シーズンルールが設定されていません。「＋ シーズン追加」ボタンで追加してください。
            </div>
          ) : (
            <div className="space-y-4">
              {seasonRules.map((rule, index) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">シーズン {index + 1}</h3>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* シーズン名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        シーズン名
                      </label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：年末年始"
                      />
                    </div>

                    {/* 料金タイプ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        料金タイプ
                      </label>
                      <select
                        value={rule.priceType}
                        onChange={(e) => updateRule(rule.id, 'priceType', e.target.value as 'percentage' | 'fixed')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {PRICE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 開始日 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        開始日
                      </label>
                      <input
                        type="date"
                        value={rule.startDate}
                        onChange={(e) => updateRule(rule.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* 終了日 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        終了日
                      </label>
                      <input
                        type="date"
                        value={rule.endDate}
                        onChange={(e) => updateRule(rule.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* 料金 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        加算料金
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          max={rule.priceType === 'percentage' ? 100 : undefined}
                          step={rule.priceType === 'percentage' ? 1 : 100}
                          value={rule.price}
                          onChange={(e) => updateRule(rule.id, 'price', parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder={rule.priceType === 'percentage' ? "例：20" : "例：5000"}
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                          {rule.priceType === 'percentage' ? '%' : '円'}
                        </span>
                      </div>
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
                        placeholder="例：年末年始の繁忙期"
                      />
                    </div>
                  </div>

                  {/* 表示例 */}
                  <div className="mt-2 text-sm text-gray-600">
                    <span>
                      {rule.name}：{rule.startDate}〜{rule.endDate} → 
                      {rule.priceType === 'percentage' ? `+${rule.price}%` : `+¥${rule.price.toLocaleString()}`}
                    </span>
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
            <p>• 年末年始（12/25〜1/5）：+20%（繁忙期）</p>
            <p>• 引越しシーズン（3/1〜4/30）：+15%（春の繁忙期）</p>
            <p>• 夏季料金（7/1〜8/31）：+5,000円（夏季特別料金）</p>
            <p>• 閑散期（9/1〜11/30）：-10%（割引期間）</p>
          </div>
        </div>

        {/* 料金計算例 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🧮 料金計算例</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• 基本料金：35,000円（2tショート × 2人）</p>
            <p>• 距離：15km → +5,000円</p>
            <p>• シーズン：年末年始 → +20%（8,000円）</p>
            <p>• 合計：48,000円</p>
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
            onClick={handleComplete}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            完了
          </button>
        </div>
      </div>
    </main>
  );
} 