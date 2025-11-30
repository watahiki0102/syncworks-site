/**
 * 統一月ビューカレンダーコンポーネント
 * - DispatchCalendarの月ビューをベースに作成
 * - シフト管理、配車管理、シーズン料金設定で共通使用
 * - 各用途に応じて表示内容をカスタマイズ可能
 */
'use client';

import React, { useState, useEffect } from 'react';
import { WEEKDAYS_JA } from '@/constants/calendar';
import { toLocalDateString } from '@/utils/dateTimeUtils';
import { fetchHolidays, isHoliday as checkIsHoliday, getHolidayName, type Holiday } from '@/utils/holidayUtils';

export interface SeasonPriceInfo {
  name: string;
  priceType: 'percentage' | 'fixed';
  price: number;
}

export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: string;
  dayOfWeekNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  seasonPrices?: SeasonPriceInfo[];
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
  renderDateCell?: (day: CalendarDay, events: CalendarEvent[], week?: any) => React.ReactNode;
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
  // シーズン料金表示オプション
  showSeasonPrices?: boolean;
  getSeasonPricesForDate?: (date: string) => SeasonPriceInfo[];
}

/**
 * 指定月のカレンダー表示用日付配列を返す
 */
const getMonthDays = (date: Date, holidays: Holiday[]): CalendarDay[] => {
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
    const dateString = toLocalDateString(prevDate);
    days.push({
      date: dateString,
      day: prevDate.getDate(),
      dayOfWeek: WEEKDAYS_JA[prevDate.getDay()],
      dayOfWeekNumber: prevDate.getDay(),
      isCurrentMonth: false,
      isToday: prevDate.toDateString() === new Date().toDateString(),
      isHoliday: checkIsHoliday(dateString, holidays),
      holidayName: getHolidayName(dateString, holidays) || undefined,
    });
  }

  // 当月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateString = toLocalDateString(currentDate);
    days.push({
      date: dateString,
      day: day,
      dayOfWeek: WEEKDAYS_JA[currentDate.getDay()],
      dayOfWeekNumber: currentDate.getDay(),
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isHoliday: checkIsHoliday(dateString, holidays),
      holidayName: getHolidayName(dateString, holidays) || undefined,
    });
  }

  // 翌月の日付を追加（6週分になるように）
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day);
    const dateString = toLocalDateString(nextDate);
    days.push({
      date: dateString,
      day: nextDate.getDate(),
      dayOfWeek: WEEKDAYS_JA[nextDate.getDay()],
      dayOfWeekNumber: nextDate.getDay(),
      isCurrentMonth: false,
      isToday: nextDate.toDateString() === new Date().toDateString(),
      isHoliday: checkIsHoliday(dateString, holidays),
      holidayName: getHolidayName(dateString, holidays) || undefined,
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
  showSeasonPrices = false,
  getSeasonPricesForDate,
}: UnifiedMonthCalendarProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 祝日データを取得
  useEffect(() => {
    fetchHolidays().then(setHolidays);
  }, []);

  const monthDays = getMonthDays(currentDate, holidays);

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

  // シーズン料金バッジの計算
  const getSeasonPriceBadge = (date: string): { total: number; isPositive: boolean; hasFixed: boolean } | null => {
    if (!showSeasonPrices || !getSeasonPricesForDate) return null;
    const prices = getSeasonPricesForDate(date);
    if (!prices || prices.length === 0) return null;

    let totalPercent = 0;
    let hasFixed = false;
    for (const p of prices) {
      if (p.priceType === 'percentage') {
        totalPercent += p.price;
      } else {
        hasFixed = true;
      }
    }

    if (totalPercent === 0 && !hasFixed) return null;
    return { total: totalPercent, isPositive: totalPercent > 0, hasFixed };
  };

  // DispatchCalendarスタイルのデフォルト日付セルレンダリング
  const defaultRenderDateCell = (day: CalendarDay, events: CalendarEvent[], _weekIndex?: number) => {
    const hasEvents = events.length > 0;
    const seasonBadge = getSeasonPriceBadge(day.date);

    return (
      <div
        key={day.date}
        data-date-cell
        className={`p-1 border-r border-b border-gray-200 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-150 relative min-h-24 ${
          !day.isCurrentMonth ? 'bg-gray-50' :
          day.isToday ? 'bg-blue-50' :
          day.isHoliday ? 'bg-red-50' :
          day.dayOfWeekNumber === 0 ? 'bg-red-50' :
          day.dayOfWeekNumber === 6 ? 'bg-blue-50' :
          'bg-white'
          } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'} ${
          selectedDates.includes(day.date)
            ? 'ring-2 ring-blue-500 ring-inset'
            : ''
          } ${cellClassName}`}
        onClick={(e) => onDateClick(day.date, day, e)}
      >
        {/* シーズン料金バッジ（右上に小さく表示、ホバーで詳細表示） */}
        {seasonBadge && day.isCurrentMonth && (
          <div className="absolute top-0.5 right-0.5 group">
            <div
              className={`text-[9px] font-bold px-1 py-0 rounded cursor-help ${
                seasonBadge.total > 0
                  ? 'bg-rose-100 text-rose-700'
                  : seasonBadge.total < 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {seasonBadge.total !== 0 && `${seasonBadge.total > 0 ? '+' : ''}${seasonBadge.total}%`}
              {seasonBadge.hasFixed && (seasonBadge.total !== 0 ? '+' : '¥')}
            </div>
            {/* ホバー時の詳細ツールチップ */}
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 z-50 w-48 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs">
              <div className="font-semibold text-gray-900 mb-1 border-b pb-1">シーズン料金詳細</div>
              {getSeasonPricesForDate && getSeasonPricesForDate(day.date).map((p, i) => (
                <div key={i} className="flex justify-between items-center py-0.5">
                  <span className="text-gray-600 truncate mr-2">{p.name}</span>
                  <span className={`font-medium whitespace-nowrap ${
                    p.priceType === 'percentage'
                      ? p.price > 0 ? 'text-rose-600' : 'text-emerald-600'
                      : 'text-blue-600'
                  }`}>
                    {p.priceType === 'percentage'
                      ? `${p.price > 0 ? '+' : ''}${p.price}%`
                      : `¥${p.price.toLocaleString()}`
                    }
                  </span>
                </div>
              ))}
              {seasonBadge.total !== 0 && (
                <div className="border-t mt-1 pt-1 flex justify-between font-semibold">
                  <span className="text-gray-700">合計</span>
                  <span className={seasonBadge.total > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {seasonBadge.total > 0 ? '+' : ''}{seasonBadge.total}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 日付と祝日名 */}
        <div className="flex items-center gap-1 mb-0.5 relative z-40">
          <div className={`text-xs font-medium ${
            selectedDates.includes(day.date)
              ? 'text-blue-800 font-bold'
              : !day.isCurrentMonth ? 'text-gray-400'
              : day.isToday ? 'text-blue-600'
              : day.isHoliday ? 'text-red-600'
              : day.dayOfWeekNumber === 0 ? 'text-red-500'
              : day.dayOfWeekNumber === 6 ? 'text-blue-500'
              : 'text-gray-900'
            }`}>
            {day.day}
          </div>
          {day.holidayName && day.isCurrentMonth && (
            <div className="text-[8px] text-red-600 font-medium truncate">
              {day.holidayName}
            </div>
          )}
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
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
        <div className="w-full" style={{ minWidth: '900px', maxWidth: 'min(1800px, 100%)' }}>
          {/* 月次ナビゲーション */}
          {showNavigation && (
            <div className="p-1.5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-start items-center">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    ＜
                  </button>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    ＞
                  </button>
                </div>
                {navigationActions && (
                  <div className="flex items-center gap-2 ml-auto">
                    {navigationActions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 曜日ヘッダー */}
          {showWeekdays && (
            <div className="grid grid-cols-7 border-b border-gray-200 sticky top-[38px] bg-white z-10">
              {WEEKDAYS_JA.map((day) => (
                <div key={day} className="p-1 text-center text-xs font-medium text-gray-500 bg-gray-50 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* カレンダーグリッド（日付のみ） */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, dayIndex) => {
              const events = getEventsForDate(day.date);
              const weekIndex = Math.floor(dayIndex / 7);
              const weekDays = monthDays.slice(weekIndex * 7, Math.min((weekIndex + 1) * 7, monthDays.length));
              const week = {
                startDate: weekDays[0]?.date,
                endDate: weekDays[weekDays.length - 1]?.date,
                days: weekDays,
                weekIndex: weekIndex
              };

              if (renderDateCell) {
                return renderDateCell(day, events, week);
              } else {
                return defaultRenderDateCell(day, events, weekIndex);
              }
            })}
          </div>

          {/* モーダル表示 */}
          {showModal && modalContent && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              data-month-modal="true"
              onClick={onCloseModal}
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}