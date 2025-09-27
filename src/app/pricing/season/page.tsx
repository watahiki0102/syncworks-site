/**
 * シーズン加算設定ページコンポーネント
 * - シーズン別料金設定
 * - 期間限定の料金調整
 * - パーセンテージ・固定金額の設定
 */
'use client';

import { useState, useEffect } from 'react';
import UnifiedCalendarLayout from '@/components/layout/UnifiedCalendarLayout';
import SeasonCalendar from '@/components/pricing/SeasonCalendar';
import type { SeasonRule } from '@/types/pricing';

type SeasonRuleInput = Omit<SeasonRule, 'id'>;
type SeasonRuleSeed = Pick<SeasonRule, 'name' | 'startDate' | 'endDate' | 'priceType' | 'price' | 'description'>;

/**
 * デフォルトシーズンルール設定（より実用的なシーズン設定）
 */
const DEFAULT_SEASON_RULES: SeasonRuleSeed[] = [
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

const createSeasonRule = (rule: SeasonRuleInput, id?: string): SeasonRule => ({
  ...rule,
  id: id ?? `season-${Date.now()}`,
});

export default function SeasonPage() {
  const [seasonRules, setSeasonRules] = useState<SeasonRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  /**
   * 初期データの読み込み
   * - 保存されたシーズンルールを復元
   */
  useEffect(() => {
    const savedRulesRaw = localStorage.getItem('pricingStep3');

    if (savedRulesRaw) {
      try {
        const parsed = JSON.parse(savedRulesRaw) as SeasonRule[];
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(rule => ({
            ...rule,
            recurringType: rule.recurringType ?? 'none',
            isRecurring: rule.isRecurring ?? false,
          }));
          setSeasonRules(normalized);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to parse saved season rules', error);
      }
    }

    // デフォルトルールを設定
    const defaultRules = DEFAULT_SEASON_RULES.map((rule, index) =>
      createSeasonRule(
        {
          ...rule,
          isRecurring: false,
          recurringType: 'none',
          recurringPattern: undefined,
          recurringEndYear: undefined,
        },
        `season-${index}`,
      ),
    );

    setSeasonRules(defaultRules);
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
  const addRule = (newRule?: SeasonRuleInput) => {
    if (newRule) {
      setSeasonRules(prev => [...prev, createSeasonRule(newRule)]);
      return;
    }

    const defaultRule: SeasonRuleInput = {
      name: "",
      startDate: "",
      endDate: "",
      priceType: "percentage",
      price: 0,
      description: "",
      isRecurring: false,
      recurringType: "none",
      recurringPattern: undefined,
      recurringEndYear: undefined,
    };

    setSeasonRules(prev => [...prev, createSeasonRule(defaultRule)]);
  };

  /**
   * シーズンルールの削除
   */
  const removeRule = (id: string) => {
    setSeasonRules(prev => prev.filter(rule => rule.id !== id));
  };

  /**
   * シーズンルールの更新
   */
  const updateRule = (updatedRule: SeasonRule) => {
    setSeasonRules(prev =>
      prev.map(rule => (rule.id === updatedRule.id ? { ...updatedRule } : rule))
    );
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
      
      // 繰り返し設定のバリデーション
      if (rule.isRecurring) {
        if (rule.recurringType === 'none') {
          errors.push(`ルール${i + 1}: 繰り返し設定が有効な場合は繰り返しタイプを選択してください`);
        }
        
        if (rule.recurringType === 'weekly' && (!rule.recurringPattern?.weekdays || rule.recurringPattern.weekdays.length === 0)) {
          errors.push(`ルール${i + 1}: 週単位の繰り返しでは曜日を選択してください`);
        }
        
        if (rule.recurringType === 'monthly' && !rule.recurringPattern?.monthlyPattern) {
          errors.push(`ルール${i + 1}: 月単位の繰り返しではパターンを選択してください`);
        }
        
        if (rule.recurringType === 'yearly' && rule.recurringEndYear && rule.recurringEndYear <= new Date().getFullYear()) {
          errors.push(`ルール${i + 1}: 繰り返し終了年は来年以降を指定してください`);
        }
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'calendar', label: 'シーズン料金カレンダー', icon: '📅' },
    { id: 'settings', label: '設定', icon: '⚙️' }
  ];

  return (
    <UnifiedCalendarLayout
      title="🌸 シーズン加算設定"
      subtitle="繁忙期・閑散期など時期による料金加算を設定します"
      breadcrumbs={[
        { label: '料金設定', href: '/pricing' },
        { label: 'シーズン加算設定' }
      ]}
      backUrl="/pricing"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'calendar' && (
        <SeasonCalendar
          seasonRules={seasonRules}
          onUpdateRule={updateRule}
          onAddRule={addRule}
          onRemoveRule={removeRule}
        />
      )}
      {activeTab === 'settings' && (
        <div className="text-center py-8">
          <p className="text-gray-500">設定画面は今後実装予定です</p>
        </div>
      )}
    </UnifiedCalendarLayout>
  );
}