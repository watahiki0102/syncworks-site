'use client';

import { useState, useEffect } from 'react';

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
}

interface DispatchCalendarProps {
  trucks: Truck[];
  onUpdateTruck: (truck: Truck) => void;
}

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export default function DispatchCalendar({ trucks, onUpdateTruck }: DispatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const timeSlots: TimeSlot[] = [
    { start: '09:00', end: '12:00', label: '9:00-12:00' },
    { start: '13:00', end: '16:00', label: '13:00-16:00' },
    { start: '16:00', end: '19:00', label: '16:00-19:00' },
  ];

  // カレンダーの日付を生成
  const getDaysInMonth = (date: Date) => {
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
        isCurrentMonth: false,
        day: prevDate.getDate(),
      });
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate.toISOString().split('T')[0],
        isCurrentMonth: true,
        day: day,
      });
    }

    // 翌月の日付を追加（6週分になるように）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        day: nextDate.getDate(),
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // 指定された日付と時間帯のスケジュールを取得
  const getSchedulesForDateAndTime = (date: string, timeSlot: TimeSlot) => {
    return trucks.flatMap(truck => 
      truck.schedules
        .filter(schedule => schedule.date === date)
        .filter(schedule => {
          const scheduleStart = schedule.startTime;
          const scheduleEnd = schedule.endTime;
          const slotStart = timeSlot.start;
          const slotEnd = timeSlot.end;
          
          // スケジュールが時間帯と重複するかチェック
          return scheduleStart < slotEnd && scheduleEnd > slotStart;
        })
        .map(schedule => ({
          ...schedule,
          truckName: truck.name,
          truckId: truck.id,
        }))
    );
  };

  // 時間帯の背景色を決定
  const getTimeSlotBackgroundColor = (date: string, timeSlot: TimeSlot) => {
    const schedules = getSchedulesForDateAndTime(date, timeSlot);
    
    if (schedules.length === 0) {
      return 'bg-gray-100'; // 空き
    }
    
    const hasBooked = schedules.some(s => s.status === 'booked');
    const hasMaintenance = schedules.some(s => s.status === 'maintenance');
    
    if (hasMaintenance) {
      return 'bg-yellow-200'; // 整備中
    }
    if (hasBooked) {
      return 'bg-blue-200'; // 予約済み
    }
    return 'bg-green-200'; // 稼働中
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">配車カレンダー</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              今日
            </button>
            <button
              onClick={goToNextMonth}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h3>
        </div>

        {/* 凡例 */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
            <span>空き</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300"></div>
            <span>稼働中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-300"></div>
            <span>予約済み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-300"></div>
            <span>整備中</span>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-center font-medium text-gray-600"></div>
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* 時間帯ヘッダー */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-center font-medium text-gray-600">時間帯</div>
              {timeSlots.map(slot => (
                <div key={slot.label} className="p-2 text-center text-xs font-medium text-gray-600">
                  {slot.label}
                </div>
              ))}
            </div>

            {/* 日付と時間帯のグリッド */}
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1 mb-1">
                {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                  <div key={day.date} className="space-y-1">
                    {/* 日付 */}
                    <div className={`p-1 text-center text-xs ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${day.date === selectedDate ? 'bg-blue-100 rounded' : ''}`}>
                      {day.day}
                    </div>
                    
                    {/* 時間帯 */}
                    {timeSlots.map(timeSlot => (
                      <div
                        key={`${day.date}-${timeSlot.start}`}
                        className={`p-1 text-xs text-center cursor-pointer hover:opacity-80 transition-opacity ${
                          getTimeSlotBackgroundColor(day.date, timeSlot)
                        } border border-gray-200 rounded`}
                        onClick={() => setSelectedDate(day.date)}
                        title={`${formatDate(day.date)} ${timeSlot.label}`}
                      >
                        {getSchedulesForDateAndTime(day.date, timeSlot).length > 0 && (
                          <div className="w-2 h-2 bg-gray-600 rounded-full mx-auto"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 選択された日付の詳細 */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formatDate(selectedDate)} の配車状況
          </h3>
          
          <div className="space-y-4">
            {timeSlots.map(timeSlot => {
              const schedules = getSchedulesForDateAndTime(selectedDate, timeSlot);
              return (
                <div key={timeSlot.start} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{timeSlot.label}</h4>
                  
                  {schedules.length === 0 ? (
                    <p className="text-gray-500 text-sm">予定なし</p>
                  ) : (
                    <div className="space-y-2">
                      {schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{schedule.truckName}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            schedule.status === 'available' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {schedule.status === 'available' ? '稼働中' :
                             schedule.status === 'booked' ? '予約済み' : '整備中'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* トラック一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">トラック一覧</h3>
        
        {trucks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">登録済みのトラックがありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trucks.map(truck => {
              const nextSchedule = truck.schedules
                .filter(s => s.date >= new Date().toISOString().split('T')[0])
                .sort((a, b) => a.date.localeCompare(b.date))[0];

              return (
                <div key={truck.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{truck.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      truck.status === 'available' ? 'bg-green-100 text-green-800' :
                      truck.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {truck.status === 'available' ? '稼働中' :
                       truck.status === 'maintenance' ? '整備中' : '停止中'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{truck.plateNumber}</p>
                  <p className="text-sm text-gray-600 mb-2">積載量: {truck.capacityKg}kg</p>
                  
                  {nextSchedule ? (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800 font-medium">次回稼働予定</p>
                      <p className="text-xs text-blue-600">
                        {formatDate(nextSchedule.date)} {formatTime(nextSchedule.startTime)}-{formatTime(nextSchedule.endTime)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">稼働予定なし</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 