'use client';

/**
 * 配車スケジュール管理カレンダーコンポーネント
 * - 月/週/日ビュー切り替え
 * - トラックごとのスケジュール管理
 * - 案件の追加・編集・削除
 */
import { useState, useEffect } from 'react';
import { formatDate, formatTime } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA, VIEW_MODE_LABELS } from '../constants/calendar';
import CaseDetail from './CaseDetail';

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
  contractStatus?: 'confirmed' | 'estimate'; // 確定 or 見積もり回答済み
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number; // 引っ越し容量（kg）
  points?: number; // ポイント数
  origin?: string; // 出発地
  destination?: string; // 終了地点
  // 希望日情報
  preferredDate1?: string;
  preferredDate2?: string;
  preferredDate3?: string;
  // 支払情報
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'invoice';
  paymentStatus?: 'paid' | 'pending' | 'partial';
  paymentAmount?: number;
  paymentDueDate?: string;
  // 選択オプション
  selectedOptions?: Array<{
    name: string;
    price?: number;
  }>;
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
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // 2025年7月1日を初期値に設定
  const [selectedDate, setSelectedDate] = useState<string>('2025-07-27'); // 7月27日を初期値に設定
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month'); // 初期表示を月ビューに変更
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [displayTimeRange, setDisplayTimeRange] = useState<{ start: number; end: number }>({ start: 9, end: 19 });
  const [highlightedScheduleId, setHighlightedScheduleId] = useState<string | null>(null);

  // selectedDateの変更を監視
  useEffect(() => {
    console.log('selectedDate changed to:', selectedDate);
  }, [selectedDate]);

  /**
   * 1時間単位の時間ブロック配列を生成
   * @returns TimeBlock[]
   */
  const generateTimeBlocks = () => {
    const blocks: TimeBlock[] = [];
    for (let hour = displayTimeRange.start; hour <= displayTimeRange.end; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      blocks.push({ time, hour, minute: 0 });
    }
    return blocks;
  };

  /**
   * 週ビュー用の時間帯ブロック配列を生成
   * @returns TimeSlot[]
   */
  const generateWeekTimeBlocks = () => [
    { time: '09:00-12:00', label: '午前', start: '09:00', end: '12:00' },
    { time: '12:00-15:00', label: '昼', start: '12:00', end: '15:00' },
    { time: '15:00-18:00', label: '午後', start: '15:00', end: '18:00' },
    { time: '18:00-21:00', label: '夜', start: '18:00', end: '21:00' },
  ];

  const timeBlocks = generateTimeBlocks();

  /**
   * 指定日付の週の各日付情報を返す
   * @param date - 基準日
   * @returns 週の各日付情報配列
   */
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
        dayOfWeek: WEEKDAYS_JA[i],
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }
    return days;
  };

  /**
   * 指定月のカレンダー表示用日付配列を返す
   * @param date - 基準日
   * @returns カレンダー表示用日付配列
   */
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
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: prevDate.toISOString().split('T')[0],
        day: prevDate.getDate(),
        dayOfWeek: WEEKDAYS_JA[prevDate.getDay()],
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
        dayOfWeek: WEEKDAYS_JA[currentDate.getDay()],
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
        dayOfWeek: WEEKDAYS_JA[nextDate.getDay()],
        isCurrentMonth: false,
        isToday: nextDate.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  /**
   * 日ビュー用の日付情報を返す
   * @param date - 基準日
   * @returns 日付情報
   */
  const getDayView = (date: Date) => {
    const currentDate = new Date(date);
    return {
      date: currentDate.toISOString().split('T')[0],
      day: currentDate.getDate(),
      dayOfWeek: WEEKDAYS_JA[currentDate.getDay()],
      month: currentDate.getMonth() + 1, // 月（1-12）
      year: currentDate.getFullYear(), // 年
      isToday: currentDate.toDateString() === new Date().toDateString(),
    };
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const dayView = getDayView(currentDate);

  // 顧客ごとの色を生成（案件ごとに色分け）
  const getCustomerColor = (customerName: string) => {
    const colors = [
      'bg-red-100 text-red-800 border-red-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
    ];
    
    // 顧客名のハッシュ値で色を決定
    let hash = 0;
    for (let i = 0; i < customerName.length; i++) {
      hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  /**
   * 指定された日付と時間のスケジュールを取得
   * @param date - 日付文字列
   * @param time - 時間文字列
   * @returns 該当するスケジュール配列
   */
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

  /**
   * 時間ブロックの背景色を決定
   * @param date - 日付文字列
   * @param time - 時間文字列
   * @returns 背景色クラス名
   */
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

  /**
   * 作業タイプのアイコンと色を取得
   * @param workType - 作業タイプ
   * @returns アイコン、色、ラベル情報
   */
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

  /**
   * 前の期間に移動
   */
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

  /**
   * 次の期間に移動
   */
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

  /**
   * 今日の日付に移動
   */
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  /**
   * スケジュール追加・編集モーダルコンポーネント
   */
  const ScheduleModal = () => {
    const [formData, setFormData] = useState({
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      customerName: '',
      workType: 'loading' as 'loading' | 'moving' | 'unloading' | 'maintenance',
      description: '',
      status: 'booked' as 'available' | 'booked' | 'maintenance',
      contractStatus: 'estimate' as 'confirmed' | 'estimate',
      capacity: '',
      points: '',
      origin: '',
      destination: '',
    });

    /**
     * 選択されたスケジュールが変更された時にフォームデータを更新
     */
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
          contractStatus: selectedSchedule.contractStatus || 'estimate',
          capacity: selectedSchedule.capacity?.toString() || '',
          points: selectedSchedule.points?.toString() || '',
          origin: selectedSchedule.origin || '',
          destination: selectedSchedule.destination || '',
        });
      }
    }, [selectedSchedule]);

    /**
     * フォーム送信時の処理
     * @param e - フォームイベント
     */
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
        contractStatus: formData.contractStatus,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        points: formData.points ? parseInt(formData.points) : undefined,
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

    /**
     * スケジュール削除時の処理
     */
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
              <label className="block text-sm font-medium mb-1">契約ステータス</label>
              <select
                value={formData.contractStatus}
                onChange={e => setFormData({ ...formData, contractStatus: e.target.value as 'confirmed' | 'estimate' })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="estimate">見積もり回答済み（仮）</option>
                <option value="confirmed">契約確定済み</option>
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
              <label className="block text-sm font-medium mb-1">ポイント数</label>
              <input
                type="number"
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="ポイント数（任意）"
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
        {/* 月ビュー用の前月・翌月ボタン */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const prevMonth = new Date(currentDate);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentDate(prevMonth);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              前月
            </button>
            <button
              onClick={() => {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentDate(nextMonth);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              翌月
            </button>
          </div>
        </div>
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
                      onClick={() => {
                        console.log('Clicked date:', day.date, 'Day number:', day.day);
                        setSelectedDate(day.date);
                        setViewMode('day');
                        // 日ビューのセクションにスクロール
                        setTimeout(() => {
                          const dayViewElement = document.querySelector('[data-view="day"]');
                          if (dayViewElement) {
                            dayViewElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            });
                          }
                        }, 200);
                      }}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.day}
                      </div>
                      
                      {hasSchedules && (
                        <div className="space-y-1">
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

        {/* 月ビュー用案件詳細 */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">案件詳細</h4>
          <div className="space-y-3">
            {trucks.flatMap(truck =>
              truck.schedules
                .filter(s => {
                  const scheduleDate = new Date(s.date);
                  const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                  return scheduleDate >= currentMonth && scheduleDate <= nextMonth;
                })
                .map(schedule => ({
                  ...schedule,
                  truckName: truck.name,
                  truckId: truck.id,
                }))
            ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map((schedule, index) => {
              const truckObj = trucks.find(t => t.id === schedule.truckId);
              return (
                <CaseDetail
                  key={schedule.id}
                  schedule={schedule}
                  truck={truckObj}
                  onEdit={() => {
                    if (truckObj) {
                      setSelectedTruck(truckObj);
                      setSelectedSchedule(schedule);
                      setShowScheduleModal(true);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 日ビュー
  const DayView = () => {
    // selectedDateに基づいて日付情報を動的に生成
    console.log('DayView - selectedDate:', selectedDate);
    const currentDayView = getDayView(new Date(selectedDate));
    console.log('DayView - currentDayView:', currentDayView);

    // selectedDateが変更されたときに再レンダリングを強制
    useEffect(() => {
      console.log('DayView useEffect - selectedDate:', selectedDate);
    }, [selectedDate]);

    const handleCellClick = (truck: Truck, time: string) => {
      setSelectedTruck(truck);
      setSelectedSchedule(null);
      setShowScheduleModal(true);
    };

    const handleScheduleClick = (schedule: Schedule, truck: Truck) => {
      setSelectedTruck(truck);
      setSelectedSchedule(schedule);
      setShowScheduleDetail(true);
    };

    // 時間帯の案件をクリックした際に当日スケジュール詳細にスクロール
    const handleTimeBlockScheduleClick = (schedule: Schedule, truck: Truck) => {
      setHighlightedScheduleId(schedule.id);
      
      // 当日スケジュール詳細の該当箇所にスクロール
      setTimeout(() => {
        const scheduleElement = document.getElementById(`schedule-${schedule.id}`);
        if (scheduleElement) {
          scheduleElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // ハイライト効果を3秒後に解除
          setTimeout(() => {
            setHighlightedScheduleId(null);
          }, 3000);
        }
      }, 100);
    };

    // 時間ごとの容量を計算
    const getCapacityForTime = (time: string) => {
      const totalCapacity = trucks.reduce((total, truck) => {
        const schedules = truck.schedules.filter(s => 
          s.date === currentDayView.date && 
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

    // 当日の合計対応件数を計算
    const getTotalSchedulesForDay = () => {
      return trucks.reduce((total, truck) => {
        const daySchedules = truck.schedules.filter(s => 
          s.date === currentDayView.date && 
          s.status === 'booked'
        );
        return total + daySchedules.length;
      }, 0);
    };

    // トラック毎の対応件数を計算
    const getTruckSchedulesForDay = () => {
      return trucks.map(truck => {
        const daySchedules = truck.schedules.filter(s => 
          s.date === currentDayView.date && 
          s.status === 'booked'
        );
        return {
          truckName: truck.name,
          count: daySchedules.length
        };
      }).filter(truck => truck.count > 0); // 対応件数が0より大きいトラックのみ
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

    // 容量バーの色を取得
    const getBarColor = (percent: number) => {
      if (percent >= 80) return 'bg-red-500';
      if (percent >= 50) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    // 顧客ごとの色を生成（案件ごとに色分け）
    const getCustomerColor = (customerName: string) => {
      const colors = [
        'bg-red-100 text-red-800 border-red-200',
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-pink-100 text-pink-800 border-pink-200',
        'bg-indigo-100 text-indigo-800 border-indigo-200',
        'bg-orange-100 text-orange-800 border-orange-200',
        'bg-teal-100 text-teal-800 border-teal-200',
        'bg-cyan-100 text-cyan-800 border-cyan-200',
      ];
      
      // 顧客名のハッシュ値で色を決定
      let hash = 0;
      for (let i = 0; i < customerName.length; i++) {
        hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div className="bg-white rounded-lg shadow p-6" data-view="day">
        {/* 日付ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentDayView.month}月{currentDayView.day}日
            </h3>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">
                総計対応件数: {getTotalSchedulesForDay()}件
              </p>
              {getTruckSchedulesForDay().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getTruckSchedulesForDay().map((truck, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {truck.truckName}: {truck.count}件
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const prevDate = new Date(currentDayView.date);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              前日
            </button>
            <button
              onClick={() => {
                const nextDate = new Date(currentDayView.date);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              翌日
            </button>
          </div>
        </div>

        {/* 表示期間選択（日ビューのみ） */}
        {viewMode === 'day' && (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">表示期間:</span>
            <div className="flex items-center gap-2">
              <select
                value={displayTimeRange.start}
                onChange={(e) => {
                  const newStart = parseInt(e.target.value);
                  setDisplayTimeRange({ 
                    start: newStart, 
                    end: Math.max(newStart + 1, displayTimeRange.end) 
                  });
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
              <span className="text-sm text-gray-500">～</span>
              <select
                value={displayTimeRange.end}
                onChange={(e) => setDisplayTimeRange({ ...displayTimeRange, end: parseInt(e.target.value) })}
                className="px-3 py-1 border rounded text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  i > displayTimeRange.start && (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                  )
                ))}
              </select>
              <button
                onClick={() => setDisplayTimeRange({ start: 9, end: 19 })}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                リセット
              </button>
            </div>
          </div>
        )}

        {/* 時間帯ヘッダー */}
        <div className="grid grid-cols-[250px_1fr] gap-1 mb-2">
          <div className="p-2 font-medium text-gray-600">時間帯</div>
          <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeBlocks.length}, 1fr)` }}>
            {timeBlocks.map(block => (
              <div key={block.time} className="p-2 text-center text-sm font-medium text-gray-600 border bg-gray-50">
                {block.time}
              </div>
            ))}
          </div>
        </div>

        {/* トラック行 */}
        {trucks.map(truck => {
          // トラック全体の使用容量を計算
          const totalUsed = truck.schedules
            .filter(s => s.date === currentDayView.date && s.status === 'booked' && s.capacity)
            .reduce((sum, s) => sum + (s.capacity || 0), 0);
          const totalPercent = truck.capacityKg > 0 ? (totalUsed / truck.capacityKg) * 100 : 0;
          
          return (
            <div key={truck.id} className="grid grid-cols-[250px_1fr] gap-1 mb-1">
              {/* トラック情報 */}
              <div className="p-3 border bg-gray-50 rounded relative">
                {/* トラック情報左側の容量バー */}
                <div className="absolute left-1 top-1 bottom-1 w-2 bg-gray-300 rounded border border-gray-400">
                  <div
                    className={`rounded transition-all duration-200 ${getBarColor(totalPercent)}`}
                    style={{ 
                      height: `${Math.min(totalPercent, 100)}%`, 
                      width: '100%',
                      minHeight: totalPercent > 0 ? '4px' : '0px',
                      position: 'absolute',
                      bottom: '0'
                    }}
                    title={`重さ合計: ${totalUsed}kg / ${truck.capacityKg}kg (${totalPercent.toFixed(1)}%)
ポイント合計: ${truck.schedules
  .filter(s => s.date === currentDayView.date && s.status === 'booked')
  .reduce((sum, s) => sum + (s.points || 0), 0)}pt`}
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">{truck.name}</div>
                  <div className="text-xs text-gray-600">{truck.plateNumber}</div>
                  <div className="text-xs text-gray-500">{truck.capacityKg}kg</div>
                </div>
              </div>
              
              {/* 時間ブロック */}
              <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeBlocks.length}, 1fr)` }}>
                {timeBlocks.map(block => {
                  // そのトラックのその時間帯の予約済み容量合計
                  const used = truck.schedules.filter(s =>
                    s.date === currentDayView.date &&
                    s.startTime <= block.time &&
                    s.endTime > block.time &&
                    s.status === 'booked' &&
                    s.capacity
                  ).reduce((sum, s) => sum + (s.capacity || 0), 0);
                  const percent = truck.capacityKg > 0 ? (used / truck.capacityKg) * 100 : 0;
                  
                  const schedules = truck.schedules.filter(s => 
                    s.date === currentDayView.date && 
                    s.startTime <= block.time && 
                    s.endTime > block.time
                  );
                  
                  // スケジュール数に応じて高さを調整
                  const cellHeight = schedules.length > 1 ? 'h-24' : schedules.length === 1 ? 'h-20' : 'h-12';
                  
                  return (
                    <div
                      key={block.time}
                      className={`${cellHeight} border cursor-pointer hover:opacity-80 transition-opacity relative ${
                        schedules.length > 0 ? '' : 'bg-gray-50'
                      }`}
                      onClick={() => handleCellClick(truck, block.time)}
                      title={schedules.length > 0 ? 
                        `${schedules.length}件のスケジュール
重さ合計: ${used}kg / ${truck.capacityKg}kg (${percent.toFixed(1)}%)
ポイント合計: ${schedules.reduce((sum, s) => sum + (s.points || 0), 0)}pt` : 
                        `${currentDayView.date} ${block.time} - 空き`
                      }
                    >
                      {/* トラック毎の縦軸容量バー */}
                      <div className="absolute left-1 top-1 bottom-1 w-3 bg-gray-300 rounded z-10 border border-gray-400">
                        <div
                          className={`rounded transition-all duration-200 ${getBarColor(percent)}`}
                          style={{ 
                            height: `${Math.min(percent, 100)}%`, 
                            width: '100%',
                            minHeight: percent > 0 ? '4px' : '0px',
                            position: 'absolute',
                            bottom: '0'
                          }}
                          title={`重さ合計: ${used}kg / ${truck.capacityKg}kg (${percent.toFixed(1)}%)
ポイント合計: ${schedules.reduce((sum, s) => sum + (s.points || 0), 0)}pt`}
                        />
                      </div>
                      
                      {/* 複数スケジュール表示（顧客ごとに色分け） */}
                      {schedules.length > 0 && (
                        <div className="absolute inset-0 flex flex-col justify-start p-1 gap-1 ml-4">
                          {schedules.map((schedule, index) => {
                            // 顧客ごとの色を取得（一貫性を保つため）
                            const customerColor = schedule.customerName ? 
                              getCustomerColor(schedule.customerName) : 
                              'bg-gray-100 text-gray-800 border-gray-200';
                            
                            // 複数スケジュールがある場合の高さ調整
                            const scheduleHeight = schedules.length > 1 ? 'h-10' : 'h-full';
                            const maxSchedules = 3; // 最大表示件数
                            
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
                                className={`${scheduleHeight} ${customerColor} rounded border cursor-pointer hover:opacity-80 transition-opacity flex flex-col items-center justify-center px-1`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTimeBlockScheduleClick(schedule, truck);
                                }}
                                title={`${schedule.customerName || '予約済み'} ${schedule.contractStatus === 'confirmed' ? '(契約確定済み)' : '(見積もり回答済み)'} ${schedule.startTime}-${schedule.endTime} ${schedule.capacity ? `(${schedule.capacity}kg)` : ''} ${schedule.points ? `(${schedule.points}pt)` : ''}`}
                              >
                                <div className="text-xs text-gray-600 mt-1">
                                  {schedule.origin && (
                                    <div className="truncate" title={schedule.origin}>
                                      発 {schedule.origin.replace(/^.*?[都府県]/, '').split('区')[0]}区
                                    </div>
                                  )}
                                  {schedule.destination && (
                                    <div className="truncate" title={schedule.destination}>
                                      着 {schedule.destination.replace(/^.*?[都府県]/, '').split('区')[0]}区
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 時間帯の契約ステータス表示 */}
                      {schedules.length > 0 && (
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                          {schedules.map((schedule, index) => (
                            <div key={`status-${schedule.id}`} className="flex items-center gap-1">
                              {schedule.contractStatus === 'confirmed' ? (
                                <span title={`${schedule.customerName || '予約済み'} - 契約確定済み`} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">✅</span>
                              ) : schedule.contractStatus === 'estimate' ? (
                                <span title={`${schedule.customerName || '予約済み'} - 見積もり回答済み（仮）`} className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">⏳</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* スケジュール詳細（ステータスごとに色分け） */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">案件詳細</h4>
          <div className="space-y-3">
            {trucks.flatMap(truck => 
              truck.schedules
                .filter(s => s.date === currentDayView.date)
                .map(schedule => ({
                  ...schedule,
                  truckName: truck.name,
                  truckId: truck.id,
                }))
            ).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((schedule, index) => {
              const truckObj = trucks.find(t => t.id === schedule.truckId);
              const isHighlighted = highlightedScheduleId === schedule.id;
              
              return (
                <CaseDetail
                  key={schedule.id}
                  schedule={schedule}
                  truck={truckObj}
                  isHighlighted={isHighlighted}
                  onEdit={() => {
                    if (truckObj) {
                      setSelectedTruck(truckObj);
                      setSelectedSchedule(schedule);
                      setShowScheduleModal(true);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // スケジュール詳細モーダル
  const ScheduleDetailModal = () => {
    if (!selectedSchedule || !selectedTruck) return null;

    const handleEdit = () => {
      setShowScheduleDetail(false);
      setShowScheduleModal(true);
    };

    const handleDelete = () => {
      if (!selectedSchedule || !selectedTruck) return;

      const updatedTruck = {
        ...selectedTruck,
        schedules: selectedTruck.schedules.filter(s => s.id !== selectedSchedule.id)
      };

      onUpdateTruck(updatedTruck);
      setShowScheduleDetail(false);
      setSelectedSchedule(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">スケジュール詳細</h3>
            <button
              onClick={() => {
                setShowScheduleDetail(false);
                setSelectedSchedule(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">基本情報</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">トラック</label>
                  <p className="text-gray-900">{selectedTruck.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">日付</label>
                  <p className="text-gray-900">{formatDate(selectedSchedule.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">時間</label>
                  <p className="text-gray-900">{formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">作業区分</label>
                  <p className="text-gray-900">
                    {selectedSchedule.workType === 'loading' ? '積込' : 
                     selectedSchedule.workType === 'moving' ? '移動' : 
                     selectedSchedule.workType === 'unloading' ? '積卸' : 
                     selectedSchedule.workType === 'maintenance' ? '整備' : '作業'}
                  </p>
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            {selectedSchedule.customerName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">顧客情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">顧客名</label>
                    <p className="text-gray-900">{selectedSchedule.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">契約ステータス</label>
                    <p className="text-gray-900">
                      {selectedSchedule.contractStatus === 'confirmed' ? '✅ 契約確定済み' : '⏳ 見積もり回答済み（仮）'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 荷物情報 */}
            {(selectedSchedule.capacity || selectedSchedule.points) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">荷物情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSchedule.capacity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">引っ越し容量</label>
                      <p className="text-gray-900">{selectedSchedule.capacity.toLocaleString()}kg</p>
                    </div>
                  )}
                  {selectedSchedule.points && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ポイント数</label>
                      <p className="text-gray-900">{selectedSchedule.points}pt</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 場所情報 */}
            {(selectedSchedule.origin || selectedSchedule.destination) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">場所情報</h4>
                <div className="space-y-3">
                  {selectedSchedule.origin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">出発地</label>
                      <p className="text-gray-900">{selectedSchedule.origin}</p>
                    </div>
                  )}
                  {selectedSchedule.destination && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">終了地点</label>
                      <p className="text-gray-900">{selectedSchedule.destination}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 備考 */}
            {selectedSchedule.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">備考</h4>
                <p className="text-gray-900">{selectedSchedule.description}</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
              <button
                onClick={() => {
                  setShowScheduleDetail(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                閉じる
              </button>
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

    // 顧客ごとの色を生成（案件ごとに色分け）
    const getCustomerColor = (customerName: string) => {
      const colors = [
        'bg-red-100 text-red-800 border-red-200',
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-pink-100 text-pink-800 border-pink-200',
        'bg-indigo-100 text-indigo-800 border-indigo-200',
        'bg-orange-100 text-orange-800 border-orange-200',
        'bg-teal-100 text-teal-800 border-teal-200',
        'bg-cyan-100 text-cyan-800 border-cyan-200',
      ];
      
      // 顧客名のハッシュ値で色を決定
      let hash = 0;
      for (let i = 0; i < customerName.length; i++) {
        hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* 週ビュー用の前週・翌週ボタン */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {formatDate(weekDays[0].date)} - {formatDate(weekDays[6].date)}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const prevWeek = new Date(currentDate);
                prevWeek.setDate(prevWeek.getDate() - 7);
                setCurrentDate(prevWeek);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              前週
            </button>
            <button
              onClick={() => {
                const nextWeek = new Date(currentDate);
                nextWeek.setDate(nextWeek.getDate() + 7);
                setCurrentDate(nextWeek);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              翌週
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* ヘッダー行 */}
            <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 mb-2">
              <div className="p-2 font-medium text-gray-600">トラック</div>
              {weekDays.map(day => (
                <div 
                  key={day.date} 
                  className="p-2 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setViewMode('day');
                    // 日ビューのセクションにスクロール
                    setTimeout(() => {
                      const dayViewElement = document.querySelector('[data-view="day"]');
                      if (dayViewElement) {
                        dayViewElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }
                    }, 100);
                  }}
                >
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
                            backgroundColor: schedule && schedule.customerName ? 
                              (() => {
                                const color = getCustomerColor(schedule.customerName);
                                // 色クラスから背景色を抽出
                                if (color.includes('red')) return '#fee2e2';
                                if (color.includes('blue')) return '#dbeafe';
                                if (color.includes('green')) return '#dcfce7';
                                if (color.includes('yellow')) return '#fef3c7';
                                if (color.includes('purple')) return '#f3e8ff';
                                if (color.includes('pink')) return '#fce7f3';
                                if (color.includes('indigo')) return '#e0e7ff';
                                if (color.includes('orange')) return '#fed7aa';
                                if (color.includes('teal')) return '#ccfbf1';
                                if (color.includes('cyan')) return '#cffafe';
                                return '#f9fafb';
                              })() : 
                              schedule ? 
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
                                    <span className="text-lg">
                                      {schedule.contractStatus === 'confirmed' ? '✅' : '⏳'}
                                    </span>
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {formatTime(schedule.startTime)}-{formatTime(schedule.endTime)}
                                  </div>
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

        {/* 週ビュー用案件詳細 */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">案件詳細</h4>
          <div className="space-y-3">
            {trucks.flatMap(truck => 
              truck.schedules
                .filter(s => {
                  const scheduleDate = new Date(s.date);
                  const weekStart = new Date(weekDays[0].date);
                  const weekEnd = new Date(weekDays[6].date);
                  return scheduleDate >= weekStart && scheduleDate <= weekEnd;
                })
                .map(schedule => ({
                  ...schedule,
                  truckName: truck.name,
                  truckId: truck.id,
                }))
            ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map((schedule, index) => {
              const truckObj = trucks.find(t => t.id === schedule.truckId);
              return (
                <CaseDetail
                  key={schedule.id}
                  schedule={schedule}
                  truck={truckObj}
                  onEdit={() => {
                    if (truckObj) {
                      setSelectedTruck(truckObj);
                      setSelectedSchedule(schedule);
                      setShowScheduleModal(true);
                    }
                  }}
                />
              );
            })}
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
        </div>

        {/* ビューモード選択と表示期間選択 */}
        <div className="flex items-center justify-between mb-6">
          {/* ビューモード選択 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              日
            </button>
          </div>


        </div>


        {/* 凡例 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">




            {/* 契約ステータス */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600">契約ステータス</h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">✅</span>
                  <span className="text-xs">契約確定済み</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">⏳</span>
                  <span className="text-xs">見積もり回答済み（仮）</span>
                </div>
              </div>
            </div>



            {/* 日ビュー凡例 */}
            {viewMode === 'day' && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-600">容量使用率</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">50%未満</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">50%以上</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">80%以上</span>
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
                    <div className={`mt-2 p-2 rounded ${
                      nextSchedule.customerName ? 
                        (() => {
                          const color = getCustomerColor(nextSchedule.customerName);
                          // 色クラスから背景色を抽出
                          if (color.includes('red')) return 'bg-red-50';
                          if (color.includes('blue')) return 'bg-blue-50';
                          if (color.includes('green')) return 'bg-green-50';
                          if (color.includes('yellow')) return 'bg-yellow-50';
                          if (color.includes('purple')) return 'bg-purple-50';
                          if (color.includes('pink')) return 'bg-pink-50';
                          if (color.includes('indigo')) return 'bg-indigo-50';
                          if (color.includes('orange')) return 'bg-orange-50';
                          if (color.includes('teal')) return 'bg-teal-50';
                          if (color.includes('cyan')) return 'bg-cyan-50';
                          return 'bg-blue-50';
                        })() : 'bg-blue-50'
                    }`}>
                      <p className="text-xs font-medium">次回稼働予定</p>
                      <p className="text-xs">
                        {formatDate(nextSchedule.date)} {formatTime(nextSchedule.startTime)}-{formatTime(nextSchedule.endTime)}
                      </p>
                      {nextSchedule.customerName && (
                        <p className="text-xs">{nextSchedule.customerName}様</p>
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
      {showScheduleDetail && selectedSchedule && selectedTruck && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow border max-w-2xl mx-auto">
          <h3 className="text-lg font-bold mb-4">スケジュール詳細</h3>
          <div className="mb-2"><span className="font-semibold">トラック:</span> {selectedTruck.name} ({selectedTruck.plateNumber})</div>
          <div className="mb-2"><span className="font-semibold">日付:</span> {selectedSchedule.date}</div>
          <div className="mb-2"><span className="font-semibold">時間:</span> {selectedSchedule.startTime} ～ {selectedSchedule.endTime}</div>
          <div className="mb-2"><span className="font-semibold">契約ステータス:</span> {selectedSchedule.contractStatus === 'confirmed' ? '✅ 確定' : selectedSchedule.contractStatus === 'estimate' ? '⏳ 仮' : '-'}</div>
          <div className="mb-2"><span className="font-semibold">依頼者名:</span> {selectedSchedule.customerName || '-'}</div>
          <div className="mb-2"><span className="font-semibold">重さ:</span> {selectedSchedule.capacity ? `${selectedSchedule.capacity}kg` : '-'}</div>
          <div className="mb-2"><span className="font-semibold">ポイント:</span> {selectedSchedule.points ? `${selectedSchedule.points}pt` : '-'}</div>
          <div className="mb-2"><span className="font-semibold">発:</span> {selectedSchedule.origin || '-'}</div>
          <div className="mb-2"><span className="font-semibold">着:</span> {selectedSchedule.destination || '-'}</div>
          <div className="mb-2"><span className="font-semibold">備考:</span> {selectedSchedule.description || '-'}</div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => { setShowScheduleDetail(false); setShowScheduleModal(true); }} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">編集</button>
            <button onClick={() => setShowScheduleDetail(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
} 