/**
 * シーズン加算設定ページコンポーネント
 * - シーズン別料金設定
 * - 期間限定の料金調整
 * - パーセンテージ・固定金額の設定
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

/**
 * 料金タイプの定義
 */
const PRICE_TYPES = [
  { value: 'percentage', label: 'パーセンテージ（%）' },
  { value: 'fixed', label: '固定金額（円）' }
];

/**
 * デフォルトシーズンルール設定（より実用的なシーズン設定）
 */
const DEFAULT_SEASON_RULES = [
  {
    name: "年末年始繁忙期",
    startDate: "2024-12-25",
    endDate: "2025-01-05",
    priceType: "percentage",
    price: 25,
    description: "年末年始の繁忙期（最も需要が高い期間）"
  },
  {
    name: "春の引越しシーズン",
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    priceType: "percentage",
    price: 20,
    description: "春の引越しシーズン（新生活スタート時期）"
  },
  {
    name: "夏の引越しシーズン",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    priceType: "percentage",
    price: 15,
    description: "夏の引越しシーズン（暑い時期の作業加算）"
  },
  {
    name: "ゴールデンウィーク",
    startDate: "2024-04-29",
    endDate: "2024-05-05",
    priceType: "percentage",
    price: 30,
    description: "ゴールデンウィーク期間（連休中の特別料金）"
  },
  {
    name: "夏季特別料金",
    startDate: "2024-07-15",
    endDate: "2024-08-15",
    priceType: "fixed",
    price: 8000,
    description: "真夏の暑い時期の特別料金（熱中症対策等）"
  },
  {
    name: "閑散期割引",
    startDate: "2024-09-01",
    endDate: "2024-11-30",
    priceType: "percentage",
    price: -10,
    description: "秋の閑散期割引（需要が少ない時期の割引）"
  },
  {
    name: "年末繁忙期",
    startDate: "2024-12-01",
    endDate: "2024-12-24",
    priceType: "percentage",
    price: 15,
    description: "12月の年末繁忙期（年末年始前の準備期間）"
  },
  {
    name: "正月明け",
    startDate: "2025-01-06",
    endDate: "2025-01-15",
    priceType: "percentage",
    price: 10,
    description: "正月明けの繁忙期（年末年始後の需要）"
  }
];

/**
 * シーズンルールの型定義
 */
interface SeasonRule {
  id: string;             // ルールID
  name: string;           // シーズン名
  startDate: string;      // 開始日
  endDate: string;        // 終了日
  priceType: 'percentage' | 'fixed'; // 料金タイプ
  price: number;          // 料金値
  description: string;    // 説明
}

export default function SeasonPage() {
  const router = useRouter();
  const [seasonRules, setSeasonRules] = useState<SeasonRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初期データの読み込み
   * - 保存されたシーズンルールを復元
   */
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

  /**
   * シーズンルールの自動保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep3', JSON.stringify(seasonRules));
    }
  }, [seasonRules, isLoading]);

  /**
   * シーズンルールの追加
   */
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

  /**
   * シーズンルールの削除
   */
  const removeRule = (id: string) => {
    setSeasonRules(seasonRules.filter(rule => rule.id !== id));
  };

  /**
   * シーズンルールの更新
   */
  const updateRule = (id: string, field: keyof SeasonRule, value: any) => {
    setSeasonRules(seasonRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  /**
   * 日付の重複チェック
   */
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

  /**
   * バリデーション
   */
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

  /**
   * 保存処理
   */
  const handleSave = () => {
    const validation = validateRules();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    alert('シーズン加算設定を保存しました！');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ページヘッダー */}
      <AdminPageHeader
        title="🌸 シーズン加算設定"
        subtitle="繁忙期・閑散期など時期による料金加算を設定します"
        breadcrumbs={[
          { label: '料金設定', href: '/pricing' },
          { label: 'シーズン加算設定' }
        ]}
        backUrl="/pricing"
      />

      <main className="py-10 px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="w-full max-w-4xl mx-auto">
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
              <h2 className="text-xl font-semibold text-gray-800">📅 シーズン加算設定</h2>
              <button
                onClick={addRule}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                ＋ シーズン追加
              </button>
            </div>

            {seasonRules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">シーズンルールがありません。「シーズン追加」ボタンで追加してください。</p>
            ) : (
              <div className="space-y-4">
                {seasonRules.map((rule, index) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">シーズン {index + 1}</h3>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
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
                          placeholder="例：年末年始繁忙期"
                        />
                      </div>

                      {/* 料金タイプ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          料金タイプ
                        </label>
                        <select
                          value={rule.priceType}
                          onChange={(e) => updateRule(rule.id, 'priceType', e.target.value)}
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
                          料金
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            value={rule.price}
                            onChange={(e) => updateRule(rule.id, 'price', parseFloat(e.target.value) || 0)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
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
                          placeholder="例：年末年始の繁忙期（最も需要が高い期間）"
                        />
                      </div>
                    </div>

                    {/* 表示例 */}
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      {rule.name}：{rule.startDate}〜{rule.endDate} → 
                      {rule.priceType === 'percentage' ? `+${rule.price}%` : `+¥${rule.price.toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 参考例 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 参考例</h3>
            <p className="text-gray-700 text-sm">
              • 年末年始（12/25〜1/5）：+25%<br/>
              • 春の引越しシーズン（3/1〜4/30）：+20%<br/>
              • 夏季特別料金（7/15〜8/15）：+8,000円<br/>
              • 閑散期割引（9/1〜11/30）：-10%
            </p>
          </div>

          {/* 料金計算例 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">📊 料金計算例</h3>
            <p className="text-gray-700 text-sm">
              • 基本料金：40,000円<br/>
              • 年末年始繁忙期（+25%）：40,000円 × 1.25 = 50,000円<br/>
              • 夏季特別料金（+8,000円）：40,000円 + 8,000円 = 48,000円<br/>
              • 合計：48,000円
            </p>
          </div>

          {/* ナビゲーション */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              💾 保存
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}