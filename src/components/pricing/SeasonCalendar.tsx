/**
 * シーズン料金設定カレンダーコンポーネント
 * - シーズンルールの作成・編集・削除
 * - 月ビュー・リストビューの切り替え
 * - シーズン期間の可視化
 * - 期間選択とルール編集機能
 */
'use client';

import { useState, useEffect } from 'react';
import type { SeasonRule } from '@/types/pricing';
import UnifiedMonthCalendar, { CalendarEvent } from '../UnifiedMonthCalendar';
import { fetchHolidays, type Holiday } from '@/utils/holidayUtils';

type SeasonRuleInput = Omit<SeasonRule, 'id'>;

interface SeasonCalendarProps {
  seasonRules: SeasonRule[];
  onUpdateRule: (rule: SeasonRule) => void;
  onAddRule: (rule: SeasonRuleInput) => void;
  onRemoveRule: (id: string) => void;
  onSave?: () => void;
}

type ViewMode = 'month' | 'list';

export default function SeasonCalendar({
  seasonRules,
  onUpdateRule,
  onAddRule,
  onRemoveRule,
  onSave
}: SeasonCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<SeasonRule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // 祝日データを取得
  const [_holidays, setHolidays] = useState<Holiday[]>([]);
  useEffect(() => {
    fetchHolidays().then(setHolidays);
  }, []);

  // 特定の日付に適用されるルールを取得
  const getRulesForDate = (date: string): SeasonRule[] => {
    return seasonRules.filter(rule => {
      const targetDate = new Date(date);
      const targetDayOfWeek = targetDate.getDay();

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
            // 同じ日付
            return targetDate.getDate() === ruleStartDate.getDate();
          } else {
            // 同じ曜日（第N週）
            const ruleWeekOfMonth = Math.ceil(ruleStartDate.getDate() / 7);
            const targetWeekOfMonth = Math.ceil(targetDate.getDate() / 7);
            return ruleStartDate.getDay() === targetDayOfWeek && ruleWeekOfMonth === targetWeekOfMonth;
          }
        }

        // 年単位の繰り返し
        if (rule.recurringType === 'yearly') {
          const ruleStart = new Date(rule.startDate);
          const ruleEnd = new Date(rule.endDate);
          // 月と日だけで比較
          const targetMD = (targetDate.getMonth() + 1) * 100 + targetDate.getDate();
          const startMD = (ruleStart.getMonth() + 1) * 100 + ruleStart.getDate();
          const endMD = (ruleEnd.getMonth() + 1) * 100 + ruleEnd.getDate();

          if (startMD <= endMD) {
            return targetMD >= startMD && targetMD <= endMD;
          } else {
            // 年をまたぐ場合（例: 12/25 〜 1/5）
            return targetMD >= startMD || targetMD <= endMD;
          }
        }
      }

      // 通常の期間指定
      const ruleStart = new Date(rule.startDate);
      const ruleEnd = new Date(rule.endDate);
      return targetDate >= ruleStart && targetDate <= ruleEnd;
    });
  };

  // 日付クリック処理
  const handleDateClick = (date: string, _event: React.MouseEvent) => {
    if (isSelecting) {
      setSelectedDates(prev => {
        if (prev.includes(date)) {
          return prev.filter(d => d !== date);
        } else {
          return [...prev, date];
        }
      });
    } else {
      const rules = getRulesForDate(date);
      if (rules.length > 0) {
        openEditModal(rules[0]);
      }
    }
  };

  // 期間選択を開始
  const startSelection = () => {
    setIsSelecting(true);
    setSelectedDates([]);
  };

  // 期間選択をキャンセル
  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedDates([]);
  };

  // 選択した期間からシーズンを作成
  const createSeasonFromSelection = () => {
    if (selectedDates.length === 0) {return;}

    const sortedDates = selectedDates.sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const newRule: SeasonRuleInput = {
      name: `新規シーズン`,
      priceType: 'percentage',
      price: 10,
      startDate,
      endDate,
      description: '',
      isRecurring: false,
      recurringType: 'none',
      recurringPattern: undefined,
      recurringEndYear: undefined,
    };

    setEditingRule({ ...newRule, id: `temp-${Date.now()}` });
    setShowEditModal(true);
    setIsSelecting(false);
    setSelectedDates([]);
  };

  // 編集モーダルを開く
  const openEditModal = (rule: SeasonRule) => {
    setEditingRule({ ...rule });
    setShowEditModal(true);
  };

  // 編集モーダルを閉じる
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRule(null);
  };

  // 日付重複チェック
  const checkDateOverlap = (startDate: string, endDate: string, excludeId?: string): { hasOverlap: boolean; overlappingRules: string[] } => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    const overlappingRules: string[] = [];

    for (const rule of seasonRules) {
      if (excludeId && rule.id === excludeId) continue;

      // 繰り返し設定がない通常の期間ルールの場合のみチェック
      if (!rule.isRecurring || rule.recurringType === 'none') {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);

        if (newStart <= ruleEnd && newEnd >= ruleStart) {
          overlappingRules.push(rule.name || '（名称未設定）');
        }
      }
    }

    return { hasOverlap: overlappingRules.length > 0, overlappingRules };
  };

  // ルール保存
  const saveRule = () => {
    if (!editingRule) {return;}

    // バリデーション
    if (!editingRule.name.trim()) {
      alert('シーズン名を入力してください');
      return;
    }
    if (!editingRule.startDate || !editingRule.endDate) {
      alert('開始日と終了日を入力してください');
      return;
    }
    if (new Date(editingRule.startDate) > new Date(editingRule.endDate)) {
      alert('終了日は開始日より後にしてください');
      return;
    }

    // 繰り返し設定がない場合のみ重複チェック
    if (!editingRule.isRecurring || editingRule.recurringType === 'none') {
      const excludeId = editingRule.id.startsWith('temp-') ? undefined : editingRule.id;
      const { hasOverlap, overlappingRules } = checkDateOverlap(
        editingRule.startDate,
        editingRule.endDate,
        excludeId
      );
      if (hasOverlap) {
        alert(`日付が以下のシーズンと重複しています:\n${overlappingRules.join('\n')}`);
        return;
      }
    }

    if (editingRule.id.startsWith('temp-')) {
      // 新規作成
      const { id: _id, ...ruleData } = editingRule;
      onAddRule(ruleData);
    } else {
      // 更新
      onUpdateRule(editingRule);
    }

    closeEditModal();
  };

  // 削除確認
  const confirmDelete = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setShowDeleteConfirm(true);
  };

  // 削除実行
  const executeDelete = () => {
    if (ruleToDelete) {
      onRemoveRule(ruleToDelete);
    }
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
    closeEditModal();
  };

  // 削除キャンセル
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
  };

  // 月ビューの表示
  const MonthView = () => {
    // 日付ごとのイベントを取得
    const getEventsForDate = (date: string): CalendarEvent[] => {
      const rules = getRulesForDate(date);

      return rules.map((rule, _index) => ({
        id: `${rule.id}-${date}`,
        title: rule.name,
        description: `${rule.priceType === 'percentage' ? `${rule.price}%` : `¥${rule.price.toLocaleString()}`}`,
        backgroundColor: rule.priceType === 'percentage'
          ? (rule.price > 0 ? '#fca5a5' : '#86efac')
          : '#93c5fd',
        color: '#374151',
        onClick: () => openEditModal(rule),
        metadata: { rule }
      }));
    };

    // カスタムイベントレンダリング
    const renderEvent = (event: CalendarEvent, _index: number) => {
      const { rule: _rule } = event.metadata;
      
      return (
        <div
          key={event.id}
          className="text-xs px-2 py-1 rounded text-center font-medium cursor-pointer hover:opacity-80 transition-colors w-full flex items-center justify-center gap-1"
          style={{
            backgroundColor: event.backgroundColor,
            color: event.color
          }}
          onClick={(e) => {
            e.stopPropagation();
            event.onClick?.();
          }}
          title={`${event.title}: ${event.description}`}
        >
          <div className="flex flex-col items-center w-full">
            <div className="truncate font-medium">{event.title}</div>
            <div className="text-xs opacity-75">
              {event.description}
            </div>
          </div>
        </div>
      );
    };

    return (
      <UnifiedMonthCalendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onDateClick={(date, _day) => handleDateClick(date, {} as React.MouseEvent)}
        getEventsForDate={getEventsForDate}
        renderEvent={renderEvent}
        showNavigation={true}
        showWeekdays={true}
        className=""
      />
    );
  };

  // 新規シーズン作成（リストビュー用）
  const createNewSeasonFromList = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const newRule: SeasonRuleInput = {
      name: '',
      priceType: 'percentage',
      price: 10,
      startDate: formatDate(today),
      endDate: formatDate(nextMonth),
      description: '',
      isRecurring: false,
      recurringType: 'none',
      recurringPattern: undefined,
      recurringEndYear: undefined,
    };

    setEditingRule({ ...newRule, id: `temp-${Date.now()}` });
    setShowEditModal(true);
  };

  // リストビューの表示
  const ListView = () => (
    <div className="space-y-4">
      {seasonRules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📅</div>
          <p className="text-gray-500 mb-4">シーズンルールが設定されていません</p>
          <button
            onClick={createNewSeasonFromList}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            ＋ 最初のシーズンを作成
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">シーズン名</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">期間</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">繰り返し</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">料金調整</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">説明</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seasonRules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        rule.priceType === 'percentage'
                          ? rule.price > 0 ? 'bg-rose-400' : rule.price < 0 ? 'bg-emerald-400' : 'bg-amber-400'
                          : 'bg-blue-400'
                      }`}></span>
                      <span className="font-medium text-gray-900">{rule.name || '（名称未設定）'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>{rule.startDate}</span>
                      <span className="text-gray-400">〜</span>
                      <span>{rule.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {rule.isRecurring ? (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          rule.recurringType === 'weekly' ? 'bg-purple-100 text-purple-800' :
                          rule.recurringType === 'monthly' ? 'bg-indigo-100 text-indigo-800' :
                          rule.recurringType === 'yearly' ? 'bg-teal-100 text-teal-800' :
                          rule.recurringType === 'specific' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.recurringType === 'weekly' && '毎週'}
                          {rule.recurringType === 'monthly' && '毎月'}
                          {rule.recurringType === 'yearly' && '毎年'}
                          {rule.recurringType === 'specific' && '特定日付'}
                        </span>
                        {rule.recurringType === 'weekly' && rule.recurringPattern?.weekdays && (
                          <span className="text-xs text-gray-500">
                            {rule.recurringPattern.weekdays.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join('・')}
                          </span>
                        )}
                        {rule.recurringType === 'specific' && rule.recurringPattern?.specificDates && (
                          <span className="text-xs text-gray-500">
                            {rule.recurringPattern.specificDates.length}日選択
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      rule.priceType === 'percentage'
                        ? rule.price > 0 ? 'bg-rose-100 text-rose-800' : rule.price < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.priceType === 'percentage'
                        ? `${rule.price > 0 ? '+' : ''}${rule.price}%`
                        : `¥${rule.price.toLocaleString()}`
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {rule.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => confirmDelete(rule.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 凡例 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">凡例</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span>
            <span className="text-gray-600">繁忙期（割増）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-gray-600">閑散期（割引）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            <span className="text-gray-600">固定金額</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-gray-600">通常期間</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 共通ヘッダー（ボタン位置を統一）
  const CommonHeader = () => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">シーズン加算設定</h2>
        <span className="text-sm text-gray-500">{seasonRules.length}件</span>
      </div>
      <div className="flex items-center gap-4">
        {/* 新規作成ボタン */}
        {viewMode === 'month' && isSelecting ? (
          <>
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
              {selectedDates.length}日選択中
            </span>
            <button
              onClick={createSeasonFromSelection}
              disabled={selectedDates.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:bg-gray-400"
            >
              シーズン作成
            </button>
            <button
              onClick={cancelSelection}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
            >
              キャンセル
            </button>
          </>
        ) : (
          <button
            onClick={viewMode === 'month' ? startSelection : createNewSeasonFromList}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-1"
          >
            <span>＋</span>
            <span>新規作成</span>
          </button>
        )}

        {/* 表示形式切替 */}
        <div className="flex items-center gap-2 border-l pl-4">
          <span className="text-sm text-gray-500">表示:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm transition ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📅 カレンダー
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm transition border-l ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📋 リスト
            </button>
          </div>
        </div>

        {/* 保存ボタン */}
        {onSave && (
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-1"
          >
            <span>💾</span>
            <span>保存</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* 共通ヘッダー */}
      <CommonHeader />

      {/* コンテンツ */}
      {viewMode === 'month' ? <MonthView /> : <ListView />}

      {/* 編集モーダル */}
      {showEditModal && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingRule.id.startsWith('temp-') ? 'シーズン新規作成' : 'シーズン編集'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">シーズン名</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full p-2 border rounded"
                  placeholder="シーズン名を入力"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">開始日</label>
                  <input
                    type="date"
                    value={editingRule.startDate}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">終了日</label>
                  <input
                    type="date"
                    value={editingRule.endDate}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* 料金タイプ（ラジオボタン） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">料金調整タイプ</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 割増率オプション */}
                  <label
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                      editingRule.priceType === 'percentage'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="percentage"
                      checked={editingRule.priceType === 'percentage'}
                      onChange={() => setEditingRule(prev => prev ? { ...prev, priceType: 'percentage' } : null)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        editingRule.priceType === 'percentage' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {editingRule.priceType === 'percentage' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">割増率 (%)</div>
                        <div className="text-xs text-gray-500">基本料金に対する割合</div>
                      </div>
                    </div>
                  </label>

                  {/* 固定金額オプション */}
                  <label
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                      editingRule.priceType === 'fixed'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="fixed"
                      checked={editingRule.priceType === 'fixed'}
                      onChange={() => setEditingRule(prev => prev ? { ...prev, priceType: 'fixed' } : null)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        editingRule.priceType === 'fixed' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {editingRule.priceType === 'fixed' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">固定金額 (円)</div>
                        <div className="text-xs text-gray-500">一律で加算する金額</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 金額入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingRule.priceType === 'percentage' ? '割増率' : '加算金額'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editingRule.price}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full p-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editingRule.priceType === 'percentage' ? '10' : '1000'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {editingRule.priceType === 'percentage' ? '%' : '円'}
                  </span>
                </div>
                {editingRule.priceType === 'percentage' && (
                  <p className="text-xs text-gray-500 mt-1">
                    マイナス値で割引、プラス値で割増になります（例: -10 = 10%OFF, +20 = 20%割増）
                  </p>
                )}
              </div>

              {/* 繰り返し設定 */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">繰り返し設定</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.isRecurring}
                      onChange={(e) => setEditingRule(prev => prev ? {
                        ...prev,
                        isRecurring: e.target.checked,
                        recurringType: e.target.checked ? 'weekly' : 'none',
                        recurringPattern: e.target.checked ? { weekdays: [] } : undefined
                      } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {editingRule.isRecurring && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    {/* 繰り返しタイプ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">繰り返しタイプ</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'weekly', label: '毎週', icon: '📅', desc: '曜日を指定' },
                          { value: 'monthly', label: '毎月', icon: '🗓️', desc: '日付/曜日' },
                          { value: 'yearly', label: '毎年', icon: '📆', desc: '同じ期間' },
                          { value: 'specific', label: '特定日付', icon: '📌', desc: '複数日選択' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setEditingRule(prev => prev ? {
                              ...prev,
                              recurringType: option.value as 'weekly' | 'monthly' | 'yearly' | 'specific',
                              recurringPattern: option.value === 'weekly' ? { weekdays: prev.recurringPattern?.weekdays || [] } :
                                option.value === 'monthly' ? { monthlyPattern: 'date' } :
                                option.value === 'specific' ? { specificDates: prev.recurringPattern?.specificDates || [] } : undefined
                            } : null)}
                            className={`p-2 rounded-lg border-2 text-sm font-medium transition text-left ${
                              editingRule.recurringType === option.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 曜日選択（週単位の場合） */}
                    {editingRule.recurringType === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">適用する曜日</label>
                        <div className="flex gap-1">
                          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => {
                            const isSelected = editingRule.recurringPattern?.weekdays?.includes(index);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const currentWeekdays = editingRule.recurringPattern?.weekdays || [];
                                  const newWeekdays = isSelected
                                    ? currentWeekdays.filter(d => d !== index)
                                    : [...currentWeekdays, index].sort();
                                  setEditingRule(prev => prev ? {
                                    ...prev,
                                    recurringPattern: { ...prev.recurringPattern, weekdays: newWeekdays }
                                  } : null);
                                }}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                                  isSelected
                                    ? index === 0 ? 'bg-red-500 text-white' : index === 6 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                                    : index === 0 ? 'bg-red-50 text-red-600 border border-red-200' : index === 6 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                                } hover:opacity-80`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          選択した曜日に毎週料金が適用されます
                        </p>
                      </div>
                    )}

                    {/* 月単位のパターン */}
                    {editingRule.recurringType === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">繰り返しパターン</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingRule(prev => prev ? {
                              ...prev,
                              recurringPattern: { monthlyPattern: 'date' }
                            } : null)}
                            className={`p-3 rounded-lg border-2 text-sm transition ${
                              editingRule.recurringPattern?.monthlyPattern === 'date'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">同じ日付</div>
                            <div className="text-xs text-gray-500">毎月{new Date(editingRule.startDate).getDate()}日</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRule(prev => prev ? {
                              ...prev,
                              recurringPattern: { monthlyPattern: 'weekday' }
                            } : null)}
                            className={`p-3 rounded-lg border-2 text-sm transition ${
                              editingRule.recurringPattern?.monthlyPattern === 'weekday'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">同じ曜日</div>
                            <div className="text-xs text-gray-500">
                              毎月第{Math.ceil(new Date(editingRule.startDate).getDate() / 7)}
                              {['日', '月', '火', '水', '木', '金', '土'][new Date(editingRule.startDate).getDay()]}曜日
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 年単位の説明 */}
                    {editingRule.recurringType === 'yearly' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          毎年同じ期間（{editingRule.startDate.slice(5)} 〜 {editingRule.endDate.slice(5)}）に適用されます
                        </p>
                      </div>
                    )}

                    {/* 特定日付選択（specific の場合） */}
                    {editingRule.recurringType === 'specific' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          適用する日付を選択
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            ({editingRule.recurringPattern?.specificDates?.length || 0}日選択中)
                          </span>
                        </label>

                        {/* 日付追加入力 */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="date"
                            id="specific-date-input"
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('specific-date-input') as HTMLInputElement;
                              if (input?.value) {
                                const currentDates = editingRule.recurringPattern?.specificDates || [];
                                if (!currentDates.includes(input.value)) {
                                  setEditingRule(prev => prev ? {
                                    ...prev,
                                    recurringPattern: {
                                      ...prev.recurringPattern,
                                      specificDates: [...currentDates, input.value].sort()
                                    }
                                  } : null);
                                }
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            追加
                          </button>
                        </div>

                        {/* 選択された日付一覧 */}
                        <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                          {editingRule.recurringPattern?.specificDates && editingRule.recurringPattern.specificDates.length > 0 ? (
                            <div className="divide-y">
                              {editingRule.recurringPattern.specificDates.map(date => {
                                const d = new Date(date);
                                const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
                                return (
                                  <div key={date} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                                    <span className="text-sm">
                                      {date}
                                      <span className={`ml-2 text-xs ${
                                        d.getDay() === 0 ? 'text-red-500' :
                                        d.getDay() === 6 ? 'text-blue-500' : 'text-gray-500'
                                      }`}>
                                        ({dayOfWeek})
                                      </span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRule(prev => prev ? {
                                          ...prev,
                                          recurringPattern: {
                                            ...prev.recurringPattern,
                                            specificDates: prev.recurringPattern?.specificDates?.filter(d => d !== date) || []
                                          }
                                        } : null);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                                    >
                                      削除
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-400 text-sm">
                              日付が選択されていません
                            </div>
                          )}
                        </div>

                        {/* 一括削除ボタン */}
                        {editingRule.recurringPattern?.specificDates && editingRule.recurringPattern.specificDates.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRule(prev => prev ? {
                                ...prev,
                                recurringPattern: { ...prev.recurringPattern, specificDates: [] }
                              } : null);
                            }}
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                          >
                            すべてクリア
                          </button>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          規則性のない任意の日付を複数選択できます
                        </p>
                      </div>
                    )}

                    {/* 繰り返し終了年 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">繰り返し終了年（任意）</label>
                      <input
                        type="number"
                        value={editingRule.recurringEndYear || ''}
                        onChange={(e) => setEditingRule(prev => prev ? {
                          ...prev,
                          recurringEndYear: e.target.value ? parseInt(e.target.value) : undefined
                        } : null)}
                        min={new Date().getFullYear() + 1}
                        placeholder="例: 2030"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        未設定の場合は無期限に繰り返します
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <textarea
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full p-2 border rounded h-20"
                  placeholder="説明を入力（任意）"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={saveRule}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                保存
              </button>
              {!editingRule.id.startsWith('temp-') && (
                <button
                  onClick={() => confirmDelete(editingRule.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  削除
                </button>
              )}
              <button
                onClick={closeEditModal}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">削除確認</h3>
            <p className="text-gray-600 mb-6">
              このシーズンルールを削除しますか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                削除
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}