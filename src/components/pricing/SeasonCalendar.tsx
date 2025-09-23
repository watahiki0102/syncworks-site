/**
 * シーズン料金設定用全画面カレンダーコンポーネント
 * - 配車カレンダーと同様の全画面表示
 * - シーズン期間の可視化
 * - 期間選択とルール編集機能
 */
'use client';

import { useState, useEffect } from 'react';
import { WEEKDAYS_JA } from '@/constants/calendar';

interface RecurringPattern {
  weekdays?: number[];
  monthlyPattern?: 'date' | 'weekday';
}

interface SeasonRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceType: 'percentage' | 'fixed';
  price: number;
  description: string;
  isRecurring: boolean;
  recurringType: 'yearly' | 'monthly' | 'weekly' | 'none';
  recurringPattern?: RecurringPattern;
  recurringEndYear?: number;
}

interface SeasonCalendarProps {
  seasonRules: SeasonRule[];
  onUpdateRule: (id: string, field: keyof SeasonRule, value: any) => void;
  onAddRule: (newRule?: SeasonRule) => void;
  onRemoveRule: (id: string) => void;
}

type ViewMode = 'month' | 'list';

export default function SeasonCalendar({
  seasonRules,
  onUpdateRule,
  onAddRule,
  onRemoveRule
}: SeasonCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedRule, setSelectedRule] = useState<SeasonRule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<SeasonRule | null>(null);

  // 月のカレンダー日付を生成
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 前月の日付を追加
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.toISOString().split('T')[0],
        day: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: prevDate.toDateString() === new Date().toDateString(),
      });
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate.toISOString().split('T')[0],
        day: day,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }

    // 翌月の日付を追加（6週分になるように）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate.toISOString().split('T')[0],
        day: nextDate.getDate(),
        isCurrentMonth: false,
        isToday: nextDate.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  // 指定日にかかるシーズンルールを取得
  const getRulesForDate = (dateStr: string) => {
    return seasonRules.filter(rule => {
      if (!rule.startDate || !rule.endDate) return false;
      const date = new Date(dateStr);
      const start = new Date(rule.startDate);
      const end = new Date(rule.endDate);
      return date >= start && date <= end;
    });
  };

  // 日付セルの背景色を決定
  const getDateCellStyle = (dateStr: string, isCurrentMonth: boolean) => {
    const rules = getRulesForDate(dateStr);
    
    if (rules.length === 0) {
      return isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400';
    }
    
    // 複数のルールがある場合は最初のルールの色を使用
    const rule = rules[0];
    if (rule.priceType === 'percentage') {
      if (rule.price > 0) {
        return 'bg-red-100 hover:bg-red-200 border-red-300';
      } else {
        return 'bg-green-100 hover:bg-green-200 border-green-300';
      }
    } else {
      return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
    }
  };

  // ルール編集モーダルを開く
  const openEditModal = (rule: SeasonRule) => {
    setSelectedRule(rule);
    setShowEditModal(true);
  };

  // 日付選択処理
  const handleDateClick = (dateStr: string, event: React.MouseEvent) => {
    // 既存のルールがある場合は編集モーダルを開く
    const rules = getRulesForDate(dateStr);
    if (rules.length > 0 && !isSelecting) {
      openEditModal(rules[0]);
      return;
    }

    // 選択モードの場合は日付を選択/選択解除
    if (isSelecting) {
      setSelectedDates(prev => {
        if (prev.includes(dateStr)) {
          return prev.filter(date => date !== dateStr);
        } else {
          return [...prev, dateStr];
        }
      });
    }
  };

  // 選択モードを開始
  const startSelection = () => {
    setIsSelecting(true);
    setSelectedDates([]);
  };

  // 選択をキャンセル
  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedDates([]);
  };

  // 選択した日付でシーズンを作成
  const createSeasonFromSelection = () => {
    if (selectedDates.length === 0) return;

    const sortedDates = selectedDates.sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    // 新しいルールを作成
    const newRule: SeasonRule = {
      id: `season-${Date.now()}`,
      name: '',
      startDate,
      endDate,
      priceType: 'percentage',
      price: 10,
      description: '',
      isRecurring: false,
      recurringType: 'none',
      recurringPattern: undefined,
      recurringEndYear: undefined
    };

    setSelectedRule(newRule);
    setShowEditModal(true);
    setIsSelecting(false);
    setSelectedDates([]);
  };

  // 新しいシーズンルールを保存
  const handleSaveSeason = () => {
    if (selectedRule) {
      // 新しいルールかどうかを判定
      const isNewRule = !seasonRules.find(rule => rule.id === selectedRule.id);
      
      if (isNewRule) {
        // 新しいルールを直接追加
        onAddRule(selectedRule);
      } else {
        // 既存ルールを更新
        Object.entries(selectedRule).forEach(([key, value]) => {
          if (key !== 'id') {
            onUpdateRule(selectedRule.id, key as keyof SeasonRule, value);
          }
        });
      }
      
      setShowEditModal(false);
      setSelectedRule(null);
    }
  };

  // 削除確認ダイアログを表示
  const confirmDelete = (rule: SeasonRule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  // 削除実行
  const handleDelete = () => {
    if (ruleToDelete) {
      onRemoveRule(ruleToDelete.id);
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  // 削除キャンセル
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
  };

  // 月ビューの表示
  const MonthView = () => {
    const monthDays = getMonthDays(currentDate);

    return (
      <div className="h-full flex flex-col">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
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

        {/* カレンダーグリッド */}
        <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
          {/* 曜日ヘッダー */}
          {WEEKDAYS_JA.map((weekday) => (
            <div key={weekday} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-100">
              {weekday}
            </div>
          ))}

          {/* 日付セル */}
          {monthDays.map((day) => {
            const rules = getRulesForDate(day.date);
            const cellStyle = getDateCellStyle(day.date, day.isCurrentMonth);
            const isSelected = selectedDates.includes(day.date);
            
            return (
              <div
                key={day.date}
                className={`border border-gray-200 p-2 min-h-[100px] cursor-pointer ${cellStyle} ${
                  day.isToday ? 'ring-2 ring-blue-500' : ''
                } ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''} ${
                  isSelecting ? 'hover:bg-green-100' : ''
                }`}
                onClick={(e) => handleDateClick(day.date, e)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm ${day.isToday ? 'font-bold text-blue-600' : ''}`}>
                    {day.day}
                  </span>
                </div>
                
                {/* シーズンルール表示 */}
                <div className="space-y-1">
                  {rules.map((rule, index) => (
                    <div
                      key={rule.id}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: rule.priceType === 'percentage' 
                          ? (rule.price > 0 ? '#fca5a5' : '#86efac')
                          : '#93c5fd'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(rule);
                      }}
                      title={`${rule.name}: ${rule.priceType === 'percentage' ? `${rule.price}%` : `¥${rule.price}`}`}
                    >
                      <div className="truncate font-medium">{rule.name}</div>
                      <div className="text-xs opacity-75">
                        {rule.priceType === 'percentage' ? `${rule.price}%` : `¥${rule.price.toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // リストビューの表示
  const ListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold">設定済みシーズン</h2>
        <div className="flex items-center space-x-2">
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
          <p className="text-lg mb-4">シーズンルールがありません</p>
          <p className="text-sm">カレンダービューで「＋ 新規作成」ボタンから日付を選択してシーズンを作成してください</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {seasonRules.map((rule, index) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-800">
                  {rule.name || `シーズン ${index + 1}`}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => confirmDelete(rule)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">期間:</span>
                  <div className="font-medium">
                    {rule.startDate} 〜 {rule.endDate}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">料金:</span>
                  <div className="font-medium">
                    {rule.priceType === 'percentage' ? `${rule.price}%` : `¥${rule.price.toLocaleString()}`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">繰り返し:</span>
                  <div className="font-medium">
                    {rule.isRecurring ? '有効' : '無効'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">説明:</span>
                  <div className="font-medium truncate">
                    {rule.description || '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 削除確認ダイアログ
  const DeleteConfirmDialog = () => {
    if (!showDeleteConfirm || !ruleToDelete) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">シーズン削除の確認</h3>
          <p className="text-gray-700 mb-6">
            「{ruleToDelete.name || '無題のシーズン'}」を削除しますか？<br />
            この操作は取り消せません。
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 編集モーダル
  const EditModal = () => {
    if (!selectedRule || !showEditModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">シーズンルール編集</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* シーズン名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                シーズン名
              </label>
              <input
                type="text"
                value={selectedRule.name}
                onChange={(e) => setSelectedRule({...selectedRule, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例：年末年始繁忙期"
              />
            </div>

            {/* 期間設定 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={selectedRule.startDate}
                  onChange={(e) => setSelectedRule({...selectedRule, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={selectedRule.endDate}
                  onChange={(e) => setSelectedRule({...selectedRule, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 料金設定 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  料金タイプ
                </label>
                <select
                  value={selectedRule.priceType}
                  onChange={(e) => setSelectedRule({...selectedRule, priceType: e.target.value as 'percentage' | 'fixed'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">パーセンテージ（%）</option>
                  <option value="fixed">固定金額（円）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  料金
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={selectedRule.price}
                    onChange={(e) => setSelectedRule({...selectedRule, price: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                    {selectedRule.priceType === 'percentage' ? '%' : '円'}
                  </span>
                </div>
              </div>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={selectedRule.description}
                onChange={(e) => setSelectedRule({...selectedRule, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="例：年末年始の繁忙期（最も需要が高い期間）"
              />
            </div>

            {/* 繰り返し設定 */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={selectedRule.isRecurring}
                  onChange={(e) => setSelectedRule({...selectedRule, isRecurring: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                  この設定を繰り返し適用する
                </label>
              </div>

              {selectedRule.isRecurring && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      繰り返しタイプ
                    </label>
                    <select
                      value={selectedRule.recurringType}
                      onChange={(e) => setSelectedRule({...selectedRule, recurringType: e.target.value as 'yearly' | 'monthly' | 'weekly' | 'none'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="yearly">毎年</option>
                      <option value="monthly">毎月</option>
                      <option value="weekly">毎週</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveSeason}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {viewMode === 'month' ? <MonthView /> : <ListView />}
      <EditModal />
      <DeleteConfirmDialog />
    </div>
  );
}