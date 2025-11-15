'use client';

import { useState, useEffect } from 'react';
import { formatDate, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA } from '@/constants/calendar';
import { fetchHolidays, isHoliday, getHolidayName, isSaturday, isSunday, type Holiday } from '@/utils/holidayUtils';

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
  isHoliday: boolean;
  holidayName: string | null;
  isSaturday: boolean;
  isSunday: boolean;
  statusBoxes: StatusBox[];
}

interface GridCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: string, filterType?: 'confirmed' | 'unconfirmed') => void;
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
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 祝日データを取得
  useEffect(() => {
    fetchHolidays().then(setHolidays);
  }, []);

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
          event.contractStatus === 'confirmed'
        ).length;

        const pendingCount = events.filter(event =>
          event.contractStatus === 'estimate'
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
            color: 'bg-gray-100 border-gray-200',
            icon: '⏳'
          });
        }
        
        cells.push({
          date: dateString,
          dayNumber: date.getDate(),
          isToday: dateString === todayString,
          isCurrentMonth: date.getMonth() === month,
          isHoliday: isHoliday(dateString, holidays),
          holidayName: getHolidayName(dateString, holidays),
          isSaturday: isSaturday(dateString),
          isSunday: isSunday(dateString),
          statusBoxes: statusBoxes
        });
      }

      setCalendarData(cells);
    };

    generateCalendarData();
  }, [currentDate, getEventsForDate, holidays]);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto overflow-y-visible">
      <div className="w-full" style={{ minWidth: '900px', maxWidth: 'min(1800px, 100%)' }}>
        {/* ヘッダー - UnifiedMonthCalendarと同じレイアウトに統一 */}
        <div className="p-1.5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-start items-center">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePreviousMonth}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                ＜
              </button>
              <h3 className="text-sm font-semibold text-gray-900">
                {formatMonthYear(currentDate)}
              </h3>
              <button
                onClick={handleNextMonth}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                ＞
              </button>
            </div>
          </div>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-gray-200 sticky top-[38px] bg-white z-10">
          {WEEKDAYS_JA.map((day) => (
            <div key={day} className="p-0.5 text-center text-xs font-medium text-gray-500 bg-gray-50">
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
                p-1 border-r border-b border-gray-200 cursor-pointer
                hover:bg-blue-100 hover:border-blue-300 transition-all duration-150 relative
                aspect-[1/0.7]
                ${cell.isToday ? 'bg-blue-50' : ''}
                ${selectedDate === cell.date ? 'ring-2 ring-blue-500 ring-inset' : ''}
                ${!cell.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${cell.isHoliday && cell.isCurrentMonth ? 'bg-red-50' : cell.isSunday && cell.isCurrentMonth ? 'bg-red-50' : cell.isSaturday && cell.isCurrentMonth ? 'bg-blue-50' : ''}
              `}
            >
              {/* 日付と祝日名 */}
              <div className="flex items-center gap-1 mb-0.5">
                <div className={`
                  text-xs font-medium
                  ${cell.isToday ? 'text-blue-600' : ''}
                  ${!cell.isCurrentMonth ? 'text-gray-400' : cell.isHoliday ? 'text-red-600' : cell.isSunday ? 'text-red-500' : cell.isSaturday ? 'text-blue-500' : 'text-gray-900'}
                `}>
                  {cell.dayNumber}
                </div>
                {cell.holidayName && cell.isCurrentMonth && (
                  <div className="text-[8px] text-red-600 font-medium truncate">
                    {cell.holidayName}
                  </div>
                )}
              </div>

              {/* ステータスボックス */}
              <div className="flex flex-col justify-center h-[calc(100%-1.5rem)] space-y-0.5 relative z-20">
                {cell.statusBoxes.map((box, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(cell.date, box.type === 'completed' ? 'confirmed' : 'unconfirmed');
                    }}
                    className={`
                      flex items-center justify-center px-1 py-0.5 rounded text-[9px] border cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto
                      ${box.color}
                    `}
                  >
                    <span className="mr-0.5">{box.icon}</span>
                    <span className="font-medium truncate">
                      {box.type === 'completed' ? '確定' : '未確定'} {box.count}件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
}
