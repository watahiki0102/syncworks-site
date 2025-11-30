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

const getRuleBorderClass = (rule: SeasonRule) => {
  if (rule.priceType === 'percentage') {
    if (rule.price > 0) {
      return 'border-rose-400';
    }
    if (rule.price < 0) {
      return 'border-emerald-400';
    }
    return 'border-amber-400';
  }

  return 'border-blue-400';
};

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
      const ruleStart = new Date(rule.startDate);
      const ruleEnd = new Date(rule.endDate);
      const targetDate = new Date(date);

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

  // ルール保存
  const saveRule = () => {
    if (!editingRule) {return;}

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
      <div className="space-y-4">
        {/* カレンダーコントロール */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isSelecting ? (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedDates.length}日選択中
                  </span>
                  <button
                    onClick={createSeasonFromSelection}
                    disabled={selectedDates.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm disabled:bg-gray-400"
                  >
                    シーズン作成
                  </button>
                  <button
                    onClick={cancelSelection}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startSelection}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                  >
                    ＋ 新規作成
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    リスト
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    カレンダー
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <UnifiedMonthCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={(date, _day) => handleDateClick(date, {} as React.MouseEvent)}
          getEventsForDate={getEventsForDate}
          renderEvent={renderEvent}
          showNavigation={true}
          showWeekdays={true}
          className=""
          navigationActions={
            onSave && (
              <button
                onClick={onSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>💾</span>
                <span>保存</span>
              </button>
            )
          }
        />
      </div>
    );
  };

  // リストビューの表示
  const ListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold">設定済みシーズン</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            カレンダー
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            リスト
          </button>
        </div>
      </div>

      {seasonRules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          シーズンルールが設定されていません
        </div>
      ) : (
        <div className="space-y-3">
          {seasonRules.map(rule => (
            <div
              key={rule.id}
              className={`bg-white p-4 rounded-lg shadow border-l-4 ${getRuleBorderClass(rule)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {rule.startDate} 〜 {rule.endDate}
                  </div>
                  <div className="text-sm text-gray-600">
                    {rule.priceType === 'percentage' ? `${rule.price}%` : `¥${rule.price.toLocaleString()}`}
                  </div>
                  {rule.description && (
                    <div className="text-sm text-gray-500 mt-2">{rule.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => confirmDelete(rule.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
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

              <div>
                <label className="block text-sm font-medium mb-1">料金タイプ</label>
                <select
                  value={editingRule.priceType}
                  onChange={(e) =>
                    setEditingRule(prev =>
                      prev ? { ...prev, priceType: e.target.value as 'percentage' | 'fixed' } : null
                    )
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="percentage">パーセンテージ</option>
                  <option value="fixed">固定金額</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {editingRule.priceType === 'percentage' ? '割増率 (%)' : '金額 (円)'}
                </label>
                <input
                  type="number"
                  value={editingRule.price}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full p-2 border rounded"
                  placeholder={editingRule.priceType === 'percentage' ? '10' : '1000'}
                />
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