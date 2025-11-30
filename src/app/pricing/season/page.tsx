/**
 * シーズン加算設定ページコンポーネント
 * - シーズン別料金設定
 * - 期間限定の料金調整
 * - パーセンテージ・固定金額の設定
 * - DBと連携してデータを管理
 */
'use client';

import { useCallback } from 'react';
import UnifiedCalendarLayout from '@/components/layout/UnifiedCalendarLayout';
import SeasonCalendar from '@/components/pricing/SeasonCalendar';
import { useSeasonRules } from '@/hooks/useSeasonRules';
import type { SeasonRule } from '@/types/pricing';

type SeasonRuleInput = Omit<SeasonRule, 'id'>;

export default function SeasonPage() {
  const {
    seasonRules,
    isLoading,
    error,
    addRule,
    updateRule,
    removeRule,
    saveAll,
  } = useSeasonRules();

  /**
   * ローカルでルールを追加（即座にDBにも保存）
   */
  const handleAddRule = useCallback(async (newRule: SeasonRuleInput) => {
    const success = await addRule(newRule);
    if (!success) {
      alert('シーズンルールの追加に失敗しました');
    }
  }, [addRule]);

  /**
   * ローカルでルールを更新（即座にDBにも保存）
   */
  const handleUpdateRule = useCallback(async (updatedRule: SeasonRule) => {
    const success = await updateRule(updatedRule);
    if (!success) {
      alert('シーズンルールの更新に失敗しました');
    }
  }, [updateRule]);

  /**
   * ローカルでルールを削除（即座にDBにも削除）
   */
  const handleRemoveRule = useCallback(async (id: string) => {
    const success = await removeRule(id);
    if (!success) {
      alert('シーズンルールの削除に失敗しました');
    }
  }, [removeRule]);

  /**
   * 全ルールを一括保存
   */
  const handleSave = useCallback(async () => {
    const success = await saveAll(seasonRules);
    if (success) {
      alert('シーズン加算設定を保存しました！');
    } else {
      alert('保存に失敗しました');
    }
  }, [saveAll, seasonRules]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <UnifiedCalendarLayout
        title="🌸 シーズン加算設定"
        subtitle="繁忙期・閑散期など時期による料金加算を設定します"
        breadcrumbs={[
          { label: '料金設定', href: '/pricing' },
          { label: 'シーズン加算設定' }
        ]}
        backUrl="/pricing"
      >
        <div className="p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </UnifiedCalendarLayout>
    );
  }

  return (
    <UnifiedCalendarLayout
      title="🌸 シーズン加算設定"
      subtitle="繁忙期・閑散期など時期による料金加算を設定します"
      breadcrumbs={[
        { label: '料金設定', href: '/pricing' },
        { label: 'シーズン加算設定' }
      ]}
      backUrl="/pricing"
    >
      <SeasonCalendar
        seasonRules={seasonRules}
        onUpdateRule={handleUpdateRule}
        onAddRule={handleAddRule}
        onRemoveRule={handleRemoveRule}
        onSave={handleSave}
      />
    </UnifiedCalendarLayout>
  );
}