'use client';

import React, { useState, useEffect } from 'react';

interface MultiSelectCalendarProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  className?: string;
}

export default function MultiSelectCalendar({
  selectedDates,
  onDatesChange,
  className = '',
}: MultiSelectCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 現在の月の日付を生成
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // 前月の日付（空のセル）
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // 日付の選択/解除
  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const isSelected = selectedDates.includes(dateString);
    
    if (isSelected) {
      // 選択解除
      onDatesChange(selectedDates.filter(d => d !== dateString));
    } else {
      // 選択追加
      onDatesChange([...selectedDates, dateString].sort());
    }
  };

  // 月の変更
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 日付が選択されているかチェック
  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return selectedDates.includes(dateString);
  };

  // 日付が今日かチェック
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-6"></div>;
          }

          const isSelected = isDateSelected(date);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                h-6 w-6 text-xs rounded transition-all duration-150 relative
                ${isSelected
                  ? 'bg-blue-600 text-white font-semibold'
                  : isCurrentDay
                  ? 'bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200'
                  : 'text-gray-700 hover:bg-blue-100'
                }
              `}
            >
              {date.getDate()}
              {isSelected && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択された日付のサマリー */}
      {selectedDates.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="text-xs font-medium text-blue-900 mb-1">
            選択された日付 ({selectedDates.length}日):
          </div>
          <div className="text-xs text-blue-700">
            {selectedDates.map(date => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
