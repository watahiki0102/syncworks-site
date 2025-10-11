/**
 * 統一月ビューカレンダーコンポーネント
 * - DispatchCalendarの月ビューをベースに作成
 * - シフト管理、配車管理、シーズン料金設定で共通使用
 * - 各用途に応じて表示内容をカスタマイズ可能
 */
'use client';

import { useState } from 'react';
import { WEEKDAYS_JA } from '@/constants/calendar';
import { toLocalDateString } from '@/utils/dateTimeUtils';

export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: string;
  dayOfWeekNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  status?: 'working' | 'unavailable' | 'estimate' | 'pending' | 'booked';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  onClick?: () => void;
  metadata?: any;
}

export interface UnifiedMonthCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: string, day: CalendarDay, event?: React.MouseEvent) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  renderDateCell?: (day: CalendarDay, events: CalendarEvent[]) => React.ReactNode;
  renderEvent?: (event: CalendarEvent, index: number) => React.ReactNode;
  showNavigation?: boolean;
  showWeekdays?: boolean;
  className?: string;
  cellClassName?: string;
  eventClassName?: string;
  selectedDates?: string[];
  // モーダル表示用のプロパティ
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: React.ReactNode;
  onCloseModal?: () => void;
  // カスタムアクションボタン
  navigationActions?: React.ReactNode;
}

/**
 * 祝日かどうかを判定する関数（簡易版）
 */
const isHoliday = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 主要な祝日（簡易版）
  const holidays = [
    { month: 1, day: 1 },   // 元日
    { month: 1, day: 2 },   // 振替休日
    { month: 1, day: 3 },   // 振替休日
    { month: 1, day: 9 },   // 成人の日
    { month: 2, day: 11 },  // 建国記念の日
    { month: 2, day: 23 },  // 天皇誕生日
    { month: 3, day: 21 },  // 春分の日
    { month: 4, day: 29 },  // 昭和の日
    { month: 5, day: 3 },   // 憲法記念日
    { month: 5, day: 4 },   // みどりの日
    { month: 5, day: 5 },   // こどもの日
    { month: 7, day: 17 },  // 海の日
    { month: 8, day: 11 },  // 山の日
    { month: 9, day: 21 },  // 敬老の日
    { month: 9, day: 23 },  // 秋分の日
    { month: 10, day: 14 }, // スポーツの日
    { month: 11, day: 3 },  // 文化の日
    { month: 11, day: 23 }, // 勤労感謝の日
  ];

  return holidays.some(holiday => holiday.month === month && holiday.day === day);
};

/**
 * 指定月のカレンダー表示用日付配列を返す
 */
const getMonthDays = (date: Date): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];

  // 前月の日付を追加
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: toLocalDateString(prevDate),
      day: prevDate.getDate(),
      dayOfWeek: WEEKDAYS_JA[prevDate.getDay()],
      dayOfWeekNumber: prevDate.getDay(),
      isCurrentMonth: false,
      isToday: prevDate.toDateString() === new Date().toDateString(),
      isHoliday: isHoliday(prevDate),
    });
  }

  // 当月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: toLocalDateString(currentDate),
      day: day,
      dayOfWeek: WEEKDAYS_JA[currentDate.getDay()],
      dayOfWeekNumber: currentDate.getDay(),
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isHoliday: isHoliday(currentDate),
    });
  }

  // 翌月の日付を追加（6週分になるように）
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day);
    days.push({
      date: toLocalDateString(nextDate),
      day: nextDate.getDate(),
      dayOfWeek: WEEKDAYS_JA[nextDate.getDay()],
      dayOfWeekNumber: nextDate.getDay(),
      isCurrentMonth: false,
      isToday: nextDate.toDateString() === new Date().toDateString(),
      isHoliday: isHoliday(nextDate),
    });
  }

  return days;
};

export default function UnifiedMonthCalendar({
  currentDate,
  onDateChange,
  onDateClick,
  getEventsForDate,
  renderDateCell,
  renderEvent,
  showNavigation = true,
  showWeekdays = true,
  className = '',
  cellClassName = '',
  eventClassName = '',
  selectedDates = [],
  showModal = false,
  modalTitle = '',
  modalContent,
  onCloseModal,
  navigationActions,
}: UnifiedMonthCalendarProps) {
  const monthDays = getMonthDays(currentDate);

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onDateChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onDateChange(nextMonth);
  };

  // DispatchCalendarスタイルのデフォルト日付セルレンダリング
  const defaultRenderDateCell = (day: CalendarDay, events: CalendarEvent[]) => {
    const hasEvents = events.length > 0;

    return (
      <div
        key={day.date}
        data-date-cell
        className={`min-h-[100px] p-0.5 border cursor-pointer hover:bg-gray-50 transition-colors ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'} ${
          selectedDates.includes(day.date) 
            ? 'bg-blue-200 border-blue-400 border-2 shadow-md ring-2 ring-blue-300 ring-opacity-50' 
            : ''
          } ${cellClassName}`}
        onClick={(e) => onDateClick(day.date, day, e)}
      >
        <div className={`text-xs font-medium ${
          selectedDates.includes(day.date) 
            ? 'text-blue-800 font-bold' 
            : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${day.isToday ? 'text-blue-600' : ''} ${
          // 選択されていない場合のみ土曜日・日曜日・祝日の色を適用
          !selectedDates.includes(day.date) && (
            day.dayOfWeekNumber === 6 ? 'text-blue-600' :
            (day.dayOfWeekNumber === 0 || day.isHoliday) ? 'text-red-600' : ''
          )
          }`}>
          {day.day}
        </div>

        {hasEvents && (
          <div className="flex flex-col items-center">
            {events.map((event, index) =>
              renderEvent ? renderEvent(event, index) : (
                <div
                  key={event.id}
                  className={`text-xs px-1 py-0.5 rounded text-center font-medium cursor-pointer hover:opacity-80 transition-colors w-full flex items-center justify-center gap-1 ${eventClassName}`}
                  style={{
                    backgroundColor: event.backgroundColor || '#e5e7eb',
                    color: event.color || '#374151',
                    borderColor: event.borderColor || 'transparent',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    event.onClick?.();
                  }}
                  title={event.description || event.title}
                >
                  <span className="truncate">{event.title}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className || ''}>
      {/* 統合されたカレンダーセクション */}
      <div className="bg-white rounded-lg shadow">
        {/* 月次ナビゲーション */}
        {showNavigation && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  ＜
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  ＞
                </button>
              </div>
              {navigationActions && (
                <div className="flex items-center gap-2">
                  {navigationActions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* カレンダーグリッド - レスポンシブ対応 */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="w-full">
              {/* 曜日ヘッダー */}
              {showWeekdays && (
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS_JA.map(weekday => (
                    <div key={weekday} className="p-1 text-center text-sm font-medium text-gray-600">
                      {weekday}
                    </div>
                  ))}
                </div>
              )}

              {/* 日付グリッド */}
              {Array.from({ length: Math.ceil(monthDays.length / 7) }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-0.5">
                  {monthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                    const events = getEventsForDate(day.date);

                    return renderDateCell ?
                      renderDateCell(day, events) :
                      defaultRenderDateCell(day, events);
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* モーダル表示 */}
        {showModal && modalContent && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            data-month-modal="true"
            onClick={onCloseModal}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalTitle}
                </h3>
                <button
                  onClick={onCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              </div>
              {modalContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}