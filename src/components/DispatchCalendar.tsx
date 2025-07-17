'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatTime } from '@/utils/dateTimeUtils';

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string;
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number; // 引っ越し容量（kg）
  origin?: string; // 出発地
  destination?: string; // 終了地点
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

type ViewMode = 'month' | 'week' | 'day';

interface TimeBlock {
  time: string;
  hour: number;
  minute: number;
}

export default function DispatchCalendar({ trucks, onUpdateTruck }: DispatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // 時間ブロック生成（1時間単位）
  const generateTimeBlocks = () => {
    const blocks: TimeBlock[] = [];
    for (let hour = 9; hour <= 19; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      blocks.push({ time, hour, minute: 0 });
    }
    return blocks;
  };

  // 週ビュー用の時間帯ブロック生成
  const generateWeekTimeBlocks = () => {
    return [
      { time: '09:00-12:00', label: '午前', start: '09:00', end: '12:00' },
      { time: '12:00-15:00', label: '昼', start: '12:00', end: '15:00' },
      { time: '15:00-18:00', label: '午後', start: '15:00', end: '18:00' },
      { time: '18:00-21:00', label: '夜', start: '18:00', end: '21:00' },
    ];
  };

  const timeBlocks = generateTimeBlocks();

  // 週の日付を生成
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      days.push({
        date: currentDate.toISOString().split('T')[0],
        day: currentDate.getDate(),
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][i],
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }
    return days;
  };

  // 月の日付を生成
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
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][prevDate.getDay()],
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
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()],
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
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][nextDate.getDay()],
        isCurrentMonth: false,
        isToday: nextDate.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  // 日ビューの日付を生成
  const getDayView = (date: Date) => {
    const currentDate = new Date(date);
    return {
      date: currentDate.toISOString().split('T')[0],
      day: currentDate.getDate(),
      dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()],
      isToday: currentDate.toDateString() === new Date().toDateString(),
    };
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const dayView = getDayView(currentDate);

  // 指定された日付と時間のスケジュールを取得
  const getSchedulesForDateTime = (date: string, time: string) => {
    return trucks.flatMap(truck => 
      truck.schedules
        .filter(schedule => schedule.date === date)
        .filter(schedule => {
          const scheduleStart = schedule.startTime;
          const scheduleEnd = schedule.endTime;
          return time >= scheduleStart && time < scheduleEnd;
        })
        .map(schedule => ({
          ...schedule,
          truckName: truck.name,
          truckId: truck.id,
        }))
    );
  };

  // 時間ブロックの背景色を決定
  const getTimeBlockBackgroundColor = (date: string, time: string) => {
    const schedules = getSchedulesForDateTime(date, time);
    
    if (schedules.length === 0) {
      return 'bg-gray-50'; // 空き
    }
    
    const schedule = schedules[0];
    switch (schedule.status) {
      case 'booked':
        return 'bg-blue-200'; // 予約済み
      case 'maintenance':
        return 'bg-yellow-200'; // 整備中
      default:
        return 'bg-green-200'; // 稼働中
    }
  };

  // 作業タイプのアイコンと色を取得
  const getWorkTypeInfo = (workType?: string) => {
    switch (workType) {
      case 'loading':
        return { icon: '📦', color: 'text-blue-600', label: '積込' };
      case 'moving':
        return { icon: '🚚', color: 'text-green-600', label: '移動' };
      case 'unloading':
        return { icon: '📥', color: 'text-purple-600', label: '積卸' };
      case 'maintenance':
        return { icon: '🔧', color: 'text-yellow-600', label: '整備' };
      default:
        return { icon: '📋', color: 'text-gray-600', label: '作業' };
    }
  };

  // formatDate と formatTime は utils/dateTimeUtils.ts からインポート

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // スケジュール追加・編集モーダル
  const ScheduleModal = () => {
    const [formData, setFormData] = useState({
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      customerName: '',
      workType: 'loading' as 'loading' | 'moving' | 'unloading' | 'maintenance',
      description: '',
      status: 'booked' as 'available' | 'booked' | 'maintenance',
      capacity: '',
      origin: '',
      destination: '',
    });

    useEffect(() => {
      if (selectedSchedule) {
        setFormData({
          date: selectedSchedule.date,
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime,
          customerName: selectedSchedule.customerName || '',
          workType: selectedSchedule.workType || 'loading',
          description: selectedSchedule.description || '',
          status: selectedSchedule.status,
          capacity: selectedSchedule.capacity?.toString() || '',
          origin: selectedSchedule.origin || '',
          destination: selectedSchedule.destination || '',
        });
      }
    }, [selectedSchedule]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedTruck) return;

      const updatedTruck = { ...selectedTruck };
      const scheduleData = {
        id: selectedSchedule?.id || `schedule-${Date.now()}`,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        customerName: formData.customerName,
        workType: formData.workType,
        description: formData.description,
        status: formData.status,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        origin: formData.origin || undefined,
        destination: formData.destination || undefined,
      };

      if (selectedSchedule) {
        // 既存スケジュールの更新
        updatedTruck.schedules = updatedTruck.schedules.map(s => 
          s.id === selectedSchedule.id ? scheduleData : s
        );
      } else {
        // 新規スケジュールの追加
        updatedTruck.schedules = [...updatedTruck.schedules, scheduleData];
      }

      onUpdateTruck(updatedTruck);
      setShowScheduleModal(false);
      setSelectedSchedule(null);
    };

    const handleDelete = () => {
      if (!selectedSchedule || !selectedTruck) return;

      const updatedTruck = {
        ...selectedTruck,
        schedules: selectedTruck.schedules.filter(s => s.id !== selectedSchedule.id)
      };

      onUpdateTruck(updatedTruck);
      setShowScheduleModal(false);
      setSelectedSchedule(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {selectedSchedule ? 'スケジュール編集' : 'スケジュール追加'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">トラック</label>
              <div className="text-gray-700">{selectedTruck?.name}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">日付</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">開始時間</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">終了時間</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">顧客名</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="顧客名（任意）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">作業区分</label>
              <select
                value={formData.workType}
                onChange={e => setFormData({ ...formData, workType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="loading">積込</option>
                <option value="moving">移動</option>
                <option value="unloading">積卸</option>
                <option value="maintenance">整備</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">引っ越し容量（kg）</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="容量（任意）"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">出発地</label>
              <input
                type="text"
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="出発地（任意）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">終了地点</label>
              <input
                type="text"
                value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="終了地点（任意）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">備考</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="備考（任意）"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {selectedSchedule ? '更新' : '追加'}
              </button>
              {selectedSchedule && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 月ビュー
  const MonthView = () => {
    const handleCellClick = (truck: Truck, date: string) => {
      setSelectedTruck(truck);
      setSelectedDate(date);
      setSelectedSchedule(null);
      setShowScheduleModal(true);
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
      const bookedSchedules = schedules.filter(s => s.status === 'booked');
      const totalTrucks = trucks.length;
      return totalTrucks > 0 ? (bookedSchedules.length / totalTrucks) * 100 : 0;
    };

    // 稼働率の色を決定
    const getUtilizationColor = (rate: number) => {
      if (rate < 30) return 'bg-green-100 text-green-800';
      if (rate < 70) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            {Array.from({ length: Math.ceil(monthDays.length / 7) }, (_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                {monthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                  const schedules = getSchedulesForDate(day.date);
                  const hasSchedules = schedules.length > 0;
                  
                  return (
                    <div
                      key={day.date}
                      className={`min-h-[100px] p-2 border cursor-pointer hover:bg-gray-50 transition-colors ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.day}
                      </div>
                      
                      {hasSchedules && (
                        <div className="space-y-1">
                          {/* 稼働率表示 */}
                          <div className={`text-xs px-2 py-1 rounded text-center font-medium ${getUtilizationColor(getUtilizationRate(day.date))}`}>
                            {getUtilizationRate(day.date).toFixed(0)}%
                          </div>
                          {/* 予約件数バッジ */}
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center font-medium">
                            {schedules.filter(s => s.status === 'booked').length}件
                          </div>
                          {/* スケジュール詳細 */}
                          {schedules.slice(0, 2).map((schedule, index) => (
                            <div
                              key={index}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${
                                schedule.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                                schedule.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const truck = trucks.find(t => t.id === schedule.truckId);
                                if (truck) {
                                  handleCellClick(truck, day.date);
                                }
                              }}
                              title={`${schedule.truckName}: ${schedule.customerName || '予約済み'} (${schedule.workType || '作業'})`}
                            >
                              <div className="flex items-center gap-1">
                                <span>{getWorkTypeInfo(schedule.workType).icon}</span>
                                <span className="truncate">{schedule.customerName || schedule.truckName}</span>
                              </div>
                            </div>
                          ))}
                          {schedules.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{schedules.length - 2}件
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 日ビュー
  const DayView = () => {
    const handleCellClick = (truck: Truck, time: string) => {
      setSelectedTruck(truck);
      setSelectedDate(dayView.date);
      setSelectedSchedule(null);
      setShowScheduleModal(true);
    };

    const handleScheduleClick = (schedule: Schedule, truck: Truck) => {
      setSelectedTruck(truck);
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    };

    // 時間ごとの容量を計算
    const getCapacityForTime = (time: string) => {
      const totalCapacity = trucks.reduce((total, truck) => {
        const schedules = truck.schedules.filter(s => 
          s.date === dayView.date && 
          s.startTime <= time && 
          s.endTime > time &&
          s.status === 'booked' &&
          s.capacity
        );
        return total + schedules.reduce((sum, s) => sum + (s.capacity || 0), 0);
      }, 0);
      return totalCapacity;
    };

    // 時間ごとの残容量を計算
    const getRemainingCapacityForTime = (time: string) => {
      const usedCapacity = getCapacityForTime(time);
      const maxCapacity = trucks.reduce((total, truck) => total + truck.capacityKg, 0);
      return Math.max(0, maxCapacity - usedCapacity);
    };

    // 最大容量を計算（トラックの最大積載量の合計）
    const maxCapacity = trucks.reduce((total, truck) => total + truck.capacityKg, 0);

    // 作業区分のアイコンと色を取得
    const getWorkTypeDisplay = (workType?: string) => {
      switch (workType) {
        case 'loading':
          return { icon: '📦', color: 'bg-blue-100 text-blue-800', label: '積込' };
        case 'moving':
          return { icon: '🚚', color: 'bg-green-100 text-green-800', label: '移動' };
        case 'unloading':
          return { icon: '📥', color: 'bg-purple-100 text-purple-800', label: '積卸' };
        case 'maintenance':
          return { icon: '🔧', color: 'bg-yellow-100 text-yellow-800', label: '整備' };
        default:
          return { icon: '📋', color: 'bg-gray-100 text-gray-800', label: '作業' };
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* 容量表示ヘッダー */}
            <div className="grid grid-cols-[250px_1fr] gap-1 mb-4">
              <div className="p-3 font-medium text-gray-600 bg-gray-50 border rounded">残容量</div>
              <div className="grid grid-cols-[repeat(11,1fr)] gap-px">
                {timeBlocks.map(block => {
                  const usedCapacity = getCapacityForTime(block.time);
                  const remainingCapacity = getRemainingCapacityForTime(block.time);
                  const usagePercentage = maxCapacity > 0 ? (usedCapacity / maxCapacity) * 100 : 0;
                  
                  // 残容量の色を決定（緑：余裕〜赤：満載）
                  const getCapacityColor = (percentage: number) => {
                    if (percentage < 30) return 'bg-green-500';
                    if (percentage < 70) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };
                  
                  return (
                    <div key={block.time} className="relative h-20 border bg-gray-50">
                      <div className="absolute top-0 left-0 right-0 p-1 text-xs text-center text-gray-500">
                        {block.time}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="text-xs text-center font-medium mb-1">
                          {remainingCapacity.toLocaleString()}kg
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-200 ${getCapacityColor(usagePercentage)}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            title={`${block.time}: 使用${usedCapacity.toLocaleString()}kg / 残${remainingCapacity.toLocaleString()}kg (${usagePercentage.toFixed(1)}%)`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 時間ヘッダー */}
            <div className="grid grid-cols-[250px_1fr] gap-1 mb-2">
              <div className="p-3 font-medium text-gray-600 bg-gray-50 border rounded">トラック</div>
              <div className="grid grid-cols-[repeat(11,1fr)] gap-px">
                {timeBlocks.map(block => (
                  <div key={block.time} className="p-2 text-xs text-center text-gray-500 border bg-gray-50">
                    {block.time}
                  </div>
                ))}
              </div>
            </div>

            {/* トラック行 */}
            {trucks.map(truck => (
              <div key={truck.id} className="grid grid-cols-[250px_1fr] gap-1 mb-1">
                {/* トラック情報 */}
                <div className="p-3 border bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{truck.name}</div>
                  <div className="text-xs text-gray-600">{truck.plateNumber}</div>
                  <div className="text-xs text-gray-500">{truck.capacityKg}kg</div>
                </div>
                {/* 時間ブロック */}
                <div className="grid grid-cols-[repeat(11,1fr)] gap-px">
                  {timeBlocks.map(block => {
                    // そのトラックのその時間帯の予約済み容量合計
                    const used = truck.schedules.filter(s =>
                      s.date === dayView.date &&
                      s.startTime <= block.time &&
                      s.endTime > block.time &&
                      s.status === 'booked' &&
                      s.capacity
                    ).reduce((sum, s) => sum + (s.capacity || 0), 0);
                    const percent = truck.capacityKg > 0 ? (used / truck.capacityKg) * 100 : 0;
                    // 色
                    const getBarColor = (p: number) => {
                      if (p < 30) return 'bg-green-500';
                      if (p < 70) return 'bg-yellow-500';
                      return 'bg-red-500';
                    };
                    const schedules = truck.schedules.filter(s => 
                      s.date === dayView.date && 
                      s.startTime <= block.time && 
                      s.endTime > block.time
                    );
                    
                    return (
                      <div
                        key={block.time}
                        className={`${schedules.length > 1 ? 'h-16' : 'h-12'} border cursor-pointer hover:opacity-80 transition-opacity relative ${
                          schedules.length > 0 ? '' : 'bg-gray-50'
                        }`}
                        onClick={() => handleCellClick(truck, block.time)}
                        title={schedules.length > 0 ? 
                          `${schedules.length}件のスケジュール` : 
                          `${dayView.date} ${block.time} - 空き`
                        }
                      >
                        {/* 積載割合バー */}
                        <div className="absolute left-1 top-1 bottom-1 w-2 bg-gray-200 rounded">
                          <div
                            className={`rounded ${getBarColor(percent)}`}
                            style={{ height: `${Math.min(percent, 100)}%`, width: '100%' }}
                            title={`使用: ${used}kg / ${truck.capacityKg}kg (${percent.toFixed(1)}%)`}
                          />
                        </div>
                        
                        {/* 複数スケジュール表示 */}
                        {schedules.length > 0 && (
                          <div className="absolute inset-0 flex flex-col justify-start p-1 gap-1">
                            {schedules.map((schedule, index) => {
                              // 各スケジュールの背景色を決定
                              const getScheduleBackgroundColor = (status: string) => {
                                switch (status) {
                                  case 'booked':
                                    return 'bg-blue-100';
                                  case 'maintenance':
                                    return 'bg-yellow-100';
                                  case 'available':
                                    return 'bg-green-100';
                                  default:
                                    return 'bg-gray-100';
                                }
                              };
                              
                              // 複数スケジュールがある場合の高さ調整
                              const scheduleHeight = schedules.length > 1 ? 'h-6' : 'h-full';
                              const maxSchedules = 4; // 最大表示件数
                              
                              if (index >= maxSchedules) {
                                return (
                                  <div
                                    key={`more-${index}`}
                                    className="text-xs text-gray-500 text-center bg-gray-100 rounded px-1 py-0.5"
                                  >
                                    +{schedules.length - maxSchedules}件
                                  </div>
                                );
                              }
                              
                              return (
                                <div
                                  key={schedule.id}
                                  className={`${scheduleHeight} ${getScheduleBackgroundColor(schedule.status)} rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center px-1`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScheduleClick(schedule, truck);
                                  }}
                                  title={`${schedule.customerName || '予約済み'} ${schedule.startTime}-${schedule.endTime} ${schedule.capacity ? `(${schedule.capacity}kg)` : ''}`}
                                >
                                                                   <div className="flex items-center gap-1 w-full min-w-0">
                                   <span className="text-xs flex-shrink-0">{getWorkTypeDisplay(schedule.workType).icon}</span>
                                   <span className="text-xs font-medium truncate flex-1 min-w-0">
                                     {schedule.customerName || '予約済み'}
                                   </span>
                                   {schedule.capacity && (
                                     <span className="text-xs text-gray-600 font-medium flex-shrink-0">
                                       {schedule.capacity}kg
                                     </span>
                                   )}
                                 </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* スケジュール詳細 */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">当日のスケジュール詳細</h4>
              <div className="space-y-3">
                {trucks.flatMap(truck => 
                  truck.schedules
                    .filter(s => s.date === dayView.date && s.status === 'booked')
                    .map(schedule => ({
                      ...schedule,
                      truckName: truck.name,
                      truckId: truck.id,
                    }))
                ).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((schedule, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{schedule.customerName || '予約済み'}</h5>
                        <p className="text-sm text-gray-600">{schedule.truckName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </p>
                        {schedule.capacity && (
                          <p className="text-sm text-blue-600 font-medium">
                            {schedule.capacity.toLocaleString()}kg
                          </p>
                        )}
                      </div>
                    </div>
                    {(schedule.origin || schedule.destination) && (
                      <div className="mt-2 text-sm text-gray-700">
                        {schedule.origin && (
                          <p><span className="font-medium">出発地:</span> {schedule.origin}</p>
                        )}
                        {schedule.destination && (
                          <p><span className="font-medium">終了地点:</span> {schedule.destination}</p>
                        )}
                      </div>
                    )}
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mt-2">{schedule.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ガントチャート風ビュー
  const GanttView = () => {
    const weekTimeBlocks = generateWeekTimeBlocks();

    const handleCellClick = (truck: Truck, date: string, timeSlot: string) => {
      setSelectedTruck(truck);
      setSelectedDate(date);
      setSelectedSchedule(null);
      setShowScheduleModal(true);
    };

    const handleScheduleClick = (schedule: Schedule, truck: Truck) => {
      setSelectedTruck(truck);
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    };

    // 作業区分のアイコンと色を取得
    const getWorkTypeDisplay = (workType?: string) => {
      switch (workType) {
        case 'loading':
          return { icon: '📦', color: 'bg-blue-100 text-blue-800', label: '積込' };
        case 'moving':
          return { icon: '🚚', color: 'bg-green-100 text-green-800', label: '移動' };
        case 'unloading':
          return { icon: '📥', color: 'bg-purple-100 text-purple-800', label: '積卸' };
        case 'maintenance':
          return { icon: '🔧', color: 'bg-yellow-100 text-yellow-800', label: '整備' };
        default:
          return { icon: '📋', color: 'bg-gray-100 text-gray-800', label: '作業' };
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* ヘッダー行 */}
            <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 mb-2">
              <div className="p-2 font-medium text-gray-600">トラック</div>
              {weekDays.map(day => (
                <div key={day.date} className="p-2 text-center">
                  <div className={`font-medium ${day.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day.dayOfWeek}
                  </div>
                  <div className={`text-sm ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>

            {/* 時間帯ヘッダー */}
            <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 mb-2">
              <div className="p-2 font-medium text-gray-600">時間帯</div>
              {weekDays.map(day => (
                <div key={day.date} className="grid grid-cols-[repeat(4,1fr)] gap-px">
                  {weekTimeBlocks.map(block => (
                    <div key={block.time} className="p-1 text-xs text-center text-gray-500 border bg-gray-50">
                      {block.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* トラック行 */}
            {trucks.map(truck => (
              <div key={truck.id} className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 mb-1">
                {/* トラック情報 */}
                <div className="p-2 border bg-gray-50">
                  <div className="font-medium text-gray-900">{truck.name}</div>
                  <div className="text-xs text-gray-600">{truck.plateNumber}</div>
                  <div className="text-xs text-gray-500">{truck.capacityKg}kg</div>
                </div>

                {/* 各日のスケジュール */}
                {weekDays.map(day => (
                  <div key={day.date} className="grid grid-cols-[repeat(4,1fr)] gap-px">
                    {weekTimeBlocks.map(block => {
                      const schedules = truck.schedules.filter(s => 
                        s.date === day.date && 
                        s.startTime < block.end && 
                        s.endTime > block.start
                      );
                      const schedule = schedules[0];

                      return (
                        <div
                          key={block.time}
                          className={`h-16 border cursor-pointer hover:opacity-80 transition-opacity ${
                            schedule ? 'relative' : ''
                          }`}
                          style={{
                            backgroundColor: schedule ? 
                              (schedule.status === 'booked' ? '#dbeafe' : 
                               schedule.status === 'maintenance' ? '#fef3c7' : '#dcfce7') : 
                              '#f9fafb'
                          }}
                          onClick={() => handleCellClick(truck, day.date, block.time)}
                          title={schedule ? 
                            `${schedule.customerName || '予約済み'} ${schedule.startTime}-${schedule.endTime}` : 
                            `${day.date} ${block.label} - 空き`
                          }
                        >
                          {schedule && (
                            <div
                              className="absolute inset-0 flex flex-col items-center justify-center text-xs cursor-pointer p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScheduleClick(schedule, truck);
                              }}
                            >
                              {schedule.customerName && (
                                <div className="text-center w-full">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="text-lg">{getWorkTypeDisplay(schedule.workType).icon}</span>
                                    <span className="text-xs font-medium truncate">
                                      {schedule.customerName}
                                    </span>
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {formatTime(schedule.startTime)}-{formatTime(schedule.endTime)}
                                  </div>
                                  {schedule.capacity && (
                                    <div className="text-xs opacity-75 font-medium">
                                      {schedule.capacity.toLocaleString()}kg
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ビュー切り替えとナビゲーション */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">配車スケジュール</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousPeriod}
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
              onClick={goToNextPeriod}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        {/* ビューモード切り替え */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded ${
              viewMode === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            週
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded ${
              viewMode === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            日
          </button>
        </div>

        {/* 期間表示 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'month' && `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
            {viewMode === 'week' && `${formatDate(weekDays[0].date)} - ${formatDate(weekDays[6].date)}`}
            {viewMode === 'day' && formatDate(currentDate.toISOString().split('T')[0])}
          </h3>
        </div>

        {/* 凡例 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">凡例</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* ステータス */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600">ステータス</h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
                  <span className="text-xs">空き</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
                  <span className="text-xs">予約済み</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span className="text-xs">稼働中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                  <span className="text-xs">整備中</span>
                </div>
              </div>
            </div>

            {/* 作業区分 */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600">作業区分</h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span className="text-xs">積込</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <span className="text-xs">移動</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📥</span>
                  <span className="text-xs">積卸</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔧</span>
                  <span className="text-xs">整備</span>
                </div>
              </div>
            </div>

            {/* 容量表示 */}
            {viewMode === 'day' && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-600">残容量</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-green-500 rounded"></div>
                    <span className="text-xs">余裕 (0-30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-yellow-500 rounded"></div>
                    <span className="text-xs">注意 (30-70%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-red-500 rounded"></div>
                    <span className="text-xs">満載 (70%+)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 月ビュー凡例 */}
            {viewMode === 'month' && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-600">稼働率</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 text-green-800 rounded text-xs flex items-center justify-center font-medium">30%</div>
                    <span className="text-xs">低稼働</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 text-yellow-800 rounded text-xs flex items-center justify-center font-medium">70%</div>
                    <span className="text-xs">中稼働</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 text-red-800 rounded text-xs flex items-center justify-center font-medium">100%</div>
                    <span className="text-xs">高稼働</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ビューモードに応じた表示 */}
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'week' && <GanttView />}
      {viewMode === 'day' && <DayView />}

      {/* スケジュールモーダル */}
      {showScheduleModal && <ScheduleModal />}

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
                      {nextSchedule.customerName && (
                        <p className="text-xs text-blue-600">{nextSchedule.customerName}</p>
                      )}
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