'use client';

import { useState, useEffect } from 'react';
import { formatDate, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA } from '@/constants/calendar';

interface StatusBox {
  type: 'completed' | 'pending';
  count: number;
  color: string;
  icon: string;
}

interface CalendarCell {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  statusBoxes: StatusBox[];
}

interface GridCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: string) => void;
  selectedDate?: string;
  getEventsForDate?: (date: string) => any[];
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: React.ReactNode;
  onCloseModal?: () => void;
}

export default function GridCalendar({
  currentDate,
  onDateChange,
  onDateClick,
  selectedDate,
  getEventsForDate,
  showModal = false,
  modalTitle = '',
  modalContent,
  onCloseModal
}: GridCalendarProps) {
  const [calendarData, setCalendarData] = useState<CalendarCell[]>([]);

  // カレンダーデータを生成
  useEffect(() => {
    const generateCalendarData = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // 月の最初の日
      const firstDay = new Date(year, month, 1);
      // 月の最後の日
      const lastDay = new Date(year, month + 1, 0);
      
      // カレンダーの開始日（前月の最後の週の日曜日）
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay());
      
      // カレンダーの終了日（来月の最初の週の土曜日）
      const endDate = new Date(lastDay);
      endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
      
      const cells: CalendarCell[] = [];
      const today = new Date();
      const todayString = toLocalDateString(today);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = toLocalDateString(date);
        const events = getEventsForDate ? getEventsForDate(dateString) : [];
        
        // ステータスボックスの生成（実際のデータに基づく）
        const completedCount = events.filter(event => 
          event.contractStatus === 'contracted' || event.status === 'confirmed'
        ).length;
        
        const pendingCount = events.filter(event => 
          event.contractStatus === 'estimate' || event.status !== 'confirmed'
        ).length;
        
        const statusBoxes: StatusBox[] = [];
        
        if (completedCount > 0) {
          statusBoxes.push({
            type: 'completed',
            count: completedCount,
            color: 'bg-green-100 border-green-200',
            icon: '✓'
          });
        }
        
        if (pendingCount > 0) {
          statusBoxes.push({
            type: 'pending',
            count: pendingCount,
            color: 'bg-orange-100 border-orange-200',
            icon: '⏳'
          });
        }
        
        cells.push({
          date: dateString,
          dayNumber: date.getDate(),
          isToday: dateString === todayString,
          isCurrentMonth: date.getMonth() === month,
          statusBoxes: statusBoxes
        });
      }
      
      setCalendarData(cells);
    };

    generateCalendarData();
  }, [currentDate, getEventsForDate]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー - シフト管理UI仕様に統一 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatMonthYear(currentDate)}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              前月
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              翌月
            </button>
          </div>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS_JA.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {calendarData.map((cell) => (
          <div
            key={cell.date}
            onClick={() => onDateClick(cell.date)}
            className={`
              min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer
              hover:bg-gray-50 transition-colors relative
              ${cell.isToday ? 'bg-blue-50' : ''}
              ${selectedDate === cell.date ? 'ring-2 ring-blue-500 ring-inset' : ''}
              ${!cell.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
            `}
          >
            {/* 日付 */}
            <div className={`
              text-sm font-medium mb-2
              ${cell.isToday ? 'text-blue-600' : ''}
              ${!cell.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            `}>
              {cell.dayNumber}
            </div>

            {/* ステータスボックス */}
            <div className="space-y-1">
              {cell.statusBoxes.map((box, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center px-2 py-1 rounded-md text-xs border
                    ${box.color}
                  `}
                >
                  <span className="mr-1">{box.icon}</span>
                  <span className="font-medium">
                    {box.type === 'completed' ? '確定' : '未確定'} {box.count}件
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* モーダル - MonthScheduleModal already has its own modal wrapper */}
      {showModal && modalContent}
    </div>
  );
}
