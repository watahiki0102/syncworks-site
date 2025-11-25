'use client';

import { useState } from 'react';
import { formatDate } from '@/utils/dateTimeUtils';
import { Truck, Schedule } from '@/types/shared';

interface MonthViewProps {
  trucks: Truck[];
  currentDate: Date;
  selectedDate: string;
  onScheduleClick: (schedule: Schedule, truck: Truck) => void;
  onAddSchedule: (truck: Truck, date: string) => void;
  monthViewFilterType: 'all' | 'confirmed' | 'unconfirmed';
  setMonthViewFilterType: (type: 'all' | 'confirmed' | 'unconfirmed') => void;
}

export default function MonthView({
  trucks,
  currentDate,
  selectedDate: _selectedDate,
  onScheduleClick,
  onAddSchedule,
  monthViewFilterType,
  setMonthViewFilterType
}: MonthViewProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const handleAddSchedule = (truck: Truck, date: string) => {
    onAddSchedule(truck, date);
  };

  const getSchedulesForDate = (date: string) => {
    return trucks.flatMap(truck =>
      truck.schedules
        .filter(schedule => schedule.date === date)
        .map(schedule => ({
          ...schedule,
          truckName: truck.name,
          truckId: truck.id,
        }))
    );
  };

  // 日付ごとの稼働率を計算
  const getUtilizationRate = (date: string) => {
    const schedules = getSchedulesForDate(date);
    const bookedSchedules = schedules.filter(s => s.status === 'available');
    const totalTrucks = trucks.length;
    return totalTrucks > 0 ? (bookedSchedules.length / totalTrucks) * 100 : 0;
  };

  // 稼働率の色を決定
  const getUtilizationColor = (rate: number) => {
    if (rate < 30) {return 'bg-green-100 text-green-800';}
    if (rate < 70) {return 'bg-yellow-100 text-yellow-800';}
    return 'bg-red-100 text-red-800';
  };

  // 月ビュー用スケジュール一覧モーダル
  const MonthScheduleModal = ({ date, schedules, onClose }: {
    date: string;
    schedules: any[];
    onClose: () => void;
  }) => {
    const formatPrefMunicipality = (addr?: string) => {
      if (!addr) {return '-';}
      const prefMatch = addr.match(/^(.*?[都道府県])/);
      const afterPref = addr.replace(/^(.*?[都道府県])/, '');
      const muniMatch = afterPref.match(/^(.*?[市区町村])/);
      const pref = prefMatch?.[1] || '';
      const muni = muniMatch?.[1] || '';
      const combined = `${pref}${muni}`.trim();
      return combined || '-';
    };

    // フィルター状態を管理（月ビューの状態を使用）
    const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'unconfirmed'>(monthViewFilterType);

    // 確定と未確定を分けて表示
    const confirmedSchedules = schedules.filter(s => s.contractStatus === 'confirmed');
    const unconfirmedSchedules = schedules.filter(s => s.contractStatus !== 'confirmed');

    // フィルターに基づいて表示する案件を決定
    let displaySchedules = schedules;
    let title = `${formatDate(date)} のスケジュール (${schedules.length}件)`;

    if (filterType === 'confirmed') {
      displaySchedules = confirmedSchedules;
      title = `${formatDate(date)} の確定スケジュール (${confirmedSchedules.length}件)`;
    } else if (filterType === 'unconfirmed') {
      displaySchedules = unconfirmedSchedules;
      title = `${formatDate(date)} の未確定スケジュール (${unconfirmedSchedules.length}件)`;
    }

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        data-month-modal="true"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>

          {/* フィルター選択 */}
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFilterType('all');
                  setMonthViewFilterType('all');
                }}
                className={`px-3 py-1 text-sm rounded ${
                  filterType === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて ({schedules.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('confirmed');
                  setMonthViewFilterType('confirmed');
                }}
                className={`px-3 py-1 text-sm rounded ${
                  filterType === 'confirmed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                確定 ({confirmedSchedules.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('unconfirmed');
                  setMonthViewFilterType('unconfirmed');
                }}
                className={`px-3 py-1 text-sm rounded ${
                  filterType === 'unconfirmed' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                未確定 ({unconfirmedSchedules.length})
              </button>
            </div>
          </div>

          {displaySchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              該当するスケジュールがありません
            </div>
          ) : (
            <div className="space-y-3">
              {displaySchedules.map((schedule, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{schedule.truckName}</span>
                        <span 
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            schedule.contractStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {schedule.contractStatus === 'confirmed' ? '確定' : '見積もり'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{schedule.customerName}</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>📍 出発: {formatPrefMunicipality(schedule.arrivalAddress)}</div>
                        <div>🏁 到着: {formatPrefMunicipality(schedule.arrivalAddress)}</div>
                        <div>⏰ {schedule.startTime} - {schedule.endTime}</div>
                        {schedule.priceTaxIncluded && (
                          <div>💰 ¥{schedule.priceTaxIncluded.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const truck = trucks.find(t => t.id === schedule.truckId);
                        if (truck) {
                          onScheduleClick(schedule, truck);
                        }
                        onClose();
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  };

  // カレンダーの日付配列を生成
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // 月の最初の日が含まれる週の日曜日から開始
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // 月の最後の日が含まれる週の土曜日まで
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const currentDateIterator = new Date(startDate);

    while (currentDateIterator <= endDate) {
      days.push(new Date(currentDateIterator));
      currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const month = currentDate.getMonth();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={day} className={`text-center font-medium p-2 text-sm ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const schedules = getSchedulesForDate(dateString);
            const utilizationRate = getUtilizationRate(dateString);
            const isExpanded = expandedDate === dateString;

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border rounded-lg transition-all ${
                  isCurrentMonth 
                    ? 'bg-white border-gray-200 hover:bg-gray-50' 
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                } ${
                  isToday 
                    ? 'ring-2 ring-blue-500 border-blue-500' 
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </span>
                  {schedules.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getUtilizationColor(utilizationRate)}`}>
                      {schedules.length}件
                    </span>
                  )}
                </div>

                {schedules.length > 0 && (
                  <div className="space-y-1">
                    {schedules.slice(0, isExpanded ? schedules.length : 3).map((schedule, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded border-l-2 cursor-pointer hover:opacity-80 transition-all duration-150 ${
                          schedule.contractStatus === 'confirmed' 
                            ? 'border-green-500 bg-green-50 text-green-800' 
                            : 'border-orange-500 bg-orange-50 text-orange-800'
                        }`}
                        onClick={() => {
                          const truck = trucks.find(t => t.id === schedule.truckId);
                          if (truck) {
                            onScheduleClick(schedule, truck);
                          }
                        }}
                      >
                        <div className="font-medium truncate">{schedule.truckName}</div>
                        <div className="truncate">{schedule.customerName}</div>
                        <div className="text-gray-600">{schedule.startTime}-{schedule.endTime}</div>
                      </div>
                    ))}

                    {schedules.length > 3 && !isExpanded && (
                      <button
                        className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
                        onClick={() => setExpandedDate(dateString)}
                      >
                        +{schedules.length - 3}件もっと見る
                      </button>
                    )}

                    {schedules.length > 3 && isExpanded && (
                      <button
                        className="w-full text-xs text-gray-600 hover:text-gray-800 py-1"
                        onClick={() => setExpandedDate(null)}
                      >
                        折りたたむ
                      </button>
                    )}
                  </div>
                )}

                {isCurrentMonth && (
                  <div className="mt-2">
                    <button
                      className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 border border-dashed border-gray-300 rounded hover:border-gray-400"
                      onClick={() => trucks.length > 0 && handleAddSchedule(trucks[0], dateString)}
                    >
                      + 追加
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* スケジュール詳細モーダル */}
      {expandedDate && (
        <MonthScheduleModal
          date={expandedDate}
          schedules={getSchedulesForDate(expandedDate)}
          onClose={() => setExpandedDate(null)}
        />
      )}
    </div>
  );
}