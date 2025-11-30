/**
 * シーズンルール管理用のカスタムフック
 * DBからシーズンルールを取得し、キャッシュを管理
 */

import { useState, useEffect, useCallback } from 'react';
import type { SeasonRule } from '@/types/pricing';

interface UseSeasonRulesResult {
  seasonRules: SeasonRule[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addRule: (rule: Omit<SeasonRule, 'id'>) => Promise<boolean>;
  updateRule: (rule: SeasonRule) => Promise<boolean>;
  removeRule: (id: string) => Promise<boolean>;
  saveAll: (rules: SeasonRule[]) => Promise<boolean>;
}

// モジュールレベルのキャッシュ
let cachedSeasonRules: SeasonRule[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分

/**
 * キャッシュからシーズンルールを取得
 */
export function getSeasonRulesFromCache(): SeasonRule[] {
  return cachedSeasonRules || [];
}

/**
 * 特定の日付に適用されるシーズンルールを取得
 */
export function getSeasonRulesForDate(date: string): SeasonRule[] {
  const rules = getSeasonRulesFromCache();
  const targetDate = new Date(date);
  const targetDayOfWeek = targetDate.getDay();

  return rules.filter(rule => {
    // 繰り返し設定がある場合
    if (rule.isRecurring) {
      // 特定日付パターン
      if (rule.recurringType === 'specific') {
        return rule.recurringPattern?.specificDates?.includes(date) || false;
      }

      // 週単位の繰り返し
      if (rule.recurringType === 'weekly') {
        return rule.recurringPattern?.weekdays?.includes(targetDayOfWeek) || false;
      }

      // 月単位の繰り返し
      if (rule.recurringType === 'monthly') {
        const ruleStartDate = new Date(rule.startDate);
        if (rule.recurringPattern?.monthlyPattern === 'date') {
          return targetDate.getDate() === ruleStartDate.getDate();
        } else {
          const ruleWeekOfMonth = Math.ceil(ruleStartDate.getDate() / 7);
          const targetWeekOfMonth = Math.ceil(targetDate.getDate() / 7);
          return ruleStartDate.getDay() === targetDayOfWeek && ruleWeekOfMonth === targetWeekOfMonth;
        }
      }

      // 年単位の繰り返し
      if (rule.recurringType === 'yearly') {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);
        const targetMD = (targetDate.getMonth() + 1) * 100 + targetDate.getDate();
        const startMD = (ruleStart.getMonth() + 1) * 100 + ruleStart.getDate();
        const endMD = (ruleEnd.getMonth() + 1) * 100 + ruleEnd.getDate();

        if (startMD <= endMD) {
          return targetMD >= startMD && targetMD <= endMD;
        } else {
          return targetMD >= startMD || targetMD <= endMD;
        }
      }
    }

    // 通常の期間指定
    const ruleStart = new Date(rule.startDate);
    const ruleEnd = new Date(rule.endDate);
    return targetDate >= ruleStart && targetDate <= ruleEnd;
  });
}

/**
 * 特定の日付の料金調整額を計算
 */
export function calculateSeasonAdjustment(date: string, basePrice: number): { total: number; details: { name: string; adjustment: number }[] } {
  const rules = getSeasonRulesForDate(date);
  const details: { name: string; adjustment: number }[] = [];
  let total = 0;

  for (const rule of rules) {
    let adjustment = 0;
    if (rule.priceType === 'percentage') {
      adjustment = Math.round(basePrice * (rule.price / 100));
    } else {
      adjustment = rule.price;
    }
    details.push({ name: rule.name, adjustment });
    total += adjustment;
  }

  return { total, details };
}

/**
 * シーズンルール管理フック
 */
export function useSeasonRules(): UseSeasonRulesResult {
  const [seasonRules, setSeasonRules] = useState<SeasonRule[]>(cachedSeasonRules || []);
  const [isLoading, setIsLoading] = useState(!cachedSeasonRules);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    // キャッシュが有効な場合はスキップ
    if (cachedSeasonRules && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setSeasonRules(cachedSeasonRules);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/season-rules');
      const data = await response.json();

      if (data.success) {
        cachedSeasonRules = data.data;
        cacheTimestamp = Date.now();
        setSeasonRules(data.data);
      } else {
        setError(data.error || 'シーズンルールの取得に失敗しました');
      }
    } catch (err) {
      setError('シーズンルールの取得中にエラーが発生しました');
      console.error('シーズンルール取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const addRule = useCallback(async (rule: Omit<SeasonRule, 'id'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/season-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      const data = await response.json();

      if (data.success) {
        const newRule = data.data as SeasonRule;
        setSeasonRules(prev => [...prev, newRule]);
        cachedSeasonRules = [...(cachedSeasonRules || []), newRule];
        return true;
      }
      setError(data.error);
      return false;
    } catch (err) {
      console.error('シーズンルール追加エラー:', err);
      return false;
    }
  }, []);

  const updateRule = useCallback(async (rule: SeasonRule): Promise<boolean> => {
    try {
      const response = await fetch('/api/season-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonRules: [rule] }),
      });
      const data = await response.json();

      if (data.success) {
        setSeasonRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        cachedSeasonRules = cachedSeasonRules?.map(r => r.id === rule.id ? rule : r) || null;
        return true;
      }
      setError(data.error);
      return false;
    } catch (err) {
      console.error('シーズンルール更新エラー:', err);
      return false;
    }
  }, []);

  const removeRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/season-rules?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setSeasonRules(prev => prev.filter(r => r.id !== id));
        cachedSeasonRules = cachedSeasonRules?.filter(r => r.id !== id) || null;
        return true;
      }
      setError(data.error);
      return false;
    } catch (err) {
      console.error('シーズンルール削除エラー:', err);
      return false;
    }
  }, []);

  const saveAll = useCallback(async (rules: SeasonRule[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/season-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonRules: rules }),
      });
      const data = await response.json();

      if (data.success) {
        setSeasonRules(data.data);
        cachedSeasonRules = data.data;
        cacheTimestamp = Date.now();
        return true;
      }
      setError(data.error);
      return false;
    } catch (err) {
      console.error('シーズンルール一括保存エラー:', err);
      return false;
    }
  }, []);

  return {
    seasonRules,
    isLoading,
    error,
    refetch: fetchRules,
    addRule,
    updateRule,
    removeRule,
    saveAll,
  };
}

export default useSeasonRules;
