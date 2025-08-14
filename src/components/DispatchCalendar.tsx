'use client';

/**
 * 配車スケジュール管理カレンダーコンポーネント
 * - 月/週/日ビュー切り替え
 * - トラックごとのスケジュール管理
 * - 案件の追加・編集・削除
 */
import { useState, useEffect } from 'react';
import { formatDate, formatTime, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA, VIEW_MODE_LABELS } from '../constants/calendar';
import CaseDetail from './CaseDetail';
import DayViewComponent from './dispatch/DayView';

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
  status: 'available' | 'maintenance';
  contractStatus?: 'confirmed' | 'estimate';
  customerName?: string;
  customerPhone?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number;
  points?: number;
  origin?: string;
  destination?: string;
  preferredDate1?: string;
  preferredDate2?: string;
  preferredDate3?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'invoice';
  paymentStatus?: 'paid' | 'pending' | 'partial';
  paymentAmount?: number;
  paymentDueDate?: string;
  selectedOptions?: Array<{ name: string; price?: number }>;
  truckName?: string;
  truckId?: string;
  isConfirmedOnly?: boolean;
  isUnconfirmedOnly?: boolean;
}

interface TimeBlock {
  time: string;
  hour: number;
  minute: number;
}

interface TimeSlot {
  time: string;
  label: string;
  start: string;
  end: string;
}

type ViewMode = 'month' | 'week' | 'day';

interface DispatchCalendarProps {
  trucks: Truck[];
  onUpdateTruck: (truck: Truck) => void;
}

export default function DispatchCalendar({ trucks, onUpdateTruck }: DispatchCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(today));
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [displayTimeRange, setDisplayTimeRange] = useState<{ start: number; end: number }>({ start: 9, end: 19 });
  const [highlightedScheduleId, setHighlightedScheduleId] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [monthViewFilterType, setMonthViewFilterType] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [prefillTime, setPrefillTime] = useState<{start?: string; end?: string}>({});


  // グローバルクリックイベントの処理
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 展開されたセルまたはその子要素をクリックした場合は何もしない
      if (target.closest('[data-expanded-cell="true"]')) {
        return;
      }

      // 月ビューのモーダル内をクリックした場合は何もしない
      if (target.closest('[data-month-modal="true"]')) {
        return;
      }

      // 日付セルをクリックした場合も何もしない（個別に処理される）
      if (target.closest('[data-date-cell]')) {
        return;
      }

      // その他の場所をクリックした場合は展開を閉じる
      if (isExpandedView) {
        setIsExpandedView(false);
        setExpandedDate(null);
        setHighlightedScheduleId(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isExpandedView, expandedDate]);

  // 案件ハイライト機能
  const handleScheduleClick = (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHighlightedScheduleId(scheduleId);
  };

  // selectedDateの変更を監視
  useEffect(() => {
    console.log('selectedDate changed to:', selectedDate);
  }, [selectedDate]);

  // ハイライト効果を一定時間後に自動的に消す
  useEffect(() => {
    if (highlightedScheduleId) {
      // ハイライトされた案件にスクロール
      setTimeout(() => {
        const scheduleElement = document.getElementById(`schedule-${highlightedScheduleId}`);
        if (scheduleElement) {
          scheduleElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);

      const timer = setTimeout(() => {
        setHighlightedScheduleId(null);
      }, 3000); // 3秒後にハイライトを消す

      return () => clearTimeout(timer);
    }
  }, [highlightedScheduleId]);

  /**
   * 1時間単位の時間ブロック配列を生成
   * @returns TimeBlock[]
   */
  const generateTimeBlocks = () => {
    const blocks: TimeBlock[] = [];
    for (let hour = displayTimeRange.start; hour < displayTimeRange.end; hour++) {
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
    { time: '09:00-11:00', label: '9:00', start: '09:00', end: '11:00' },
    { time: '11:00-13:00', label: '11:00', start: '11:00', end: '13:00' },
    { time: '13:00-15:00', label: '13:00', start: '13:00', end: '15:00' },
    { time: '15:00-17:00', label: '15:00', start: '15:00', end: '17:00' },
    { time: '17:00-19:00', label: '17:00', start: '17:00', end: '19:00' },
    { time: '19:00-21:00', label: '19:00', start: '19:00', end: '21:00' },
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
        date: toLocalDateString(currentDate),
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

  /**
   * 日ビュー用の日付情報を返す
   * @param date - 基準日
   * @returns 日付情報
   */
  /**
 * 祝日かどうかを判定する関数（簡易版）
 * @param date - 判定する日付
 * @returns 祝日かどうか
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

  const getDayInfo = (date: Date) => {
    return {
      date: toLocalDateString(date),
      day: date.getDate(),
      dayOfWeek: WEEKDAYS_JA[date.getDay()],
      dayOfWeekNumber: date.getDay(),
      isToday: date.toDateString() === new Date().toDateString(),
      isHoliday: isHoliday(date),
    };
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const dayInfo = getDayInfo(currentDate);
  
  // デバッグ用：トラックデータを確認
  useEffect(() => {
    console.log('Trucks data in DispatchCalendar:', trucks);
    if (trucks.length > 0 && trucks[0].schedules) {
      console.log('First truck schedules:', trucks[0].schedules);
    }
  }, [trucks]);

  // 初回レンダー時に週ビューが要求されている場合、selectedDateを今日に揃える
  useEffect(() => {
    if (viewMode === 'week') {
      setSelectedDate(toLocalDateString(today));
      setCurrentDate(today);
    }
  }, []);

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
      case 'available':
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
    setSelectedDate(toLocalDateString(today));
  };

  /**
   * スケジュール追加・編集モーダルコンポーネント
   */
  const ScheduleModal = () => {
    const [formData, setFormData] = useState<Schedule>({
      id: `schedule-${crypto.randomUUID()}`,
      date: selectedDate,
      startTime: prefillTime.start ?? '09:00',
      endTime: prefillTime.end ?? '17:00',
      status: 'available',
      contractStatus: 'estimate',
      customerName: '',
      workType: 'moving',
      description: '',
      capacity: 0,
      points: 0,
      origin: '',
      destination: '',
      preferredDate1: '',
      preferredDate2: '',
      preferredDate3: '',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      paymentAmount: 0,
      paymentDueDate: '',
      selectedOptions: [],
    });

    useEffect(() => {
      if (selectedSchedule) {
        setFormData({
          id: selectedSchedule.id,
          date: selectedSchedule.date,
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime,
          status: selectedSchedule.status,
          contractStatus: selectedSchedule.contractStatus || 'estimate',
          customerName: selectedSchedule.customerName || '',
          workType: selectedSchedule.workType || 'moving',
          description: selectedSchedule.description || '',
          capacity: selectedSchedule.capacity || 0,
          points: selectedSchedule.points || 0,
          origin: selectedSchedule.origin || '',
          destination: selectedSchedule.destination || '',
          preferredDate1: selectedSchedule.preferredDate1 || '',
          preferredDate2: selectedSchedule.preferredDate2 || '',
          preferredDate3: selectedSchedule.preferredDate3 || '',
          paymentMethod: selectedSchedule.paymentMethod || 'cash',
          paymentStatus: selectedSchedule.paymentStatus || 'pending',
          paymentAmount: selectedSchedule.paymentAmount || 0,
          paymentDueDate: selectedSchedule.paymentDueDate || '',
          selectedOptions: selectedSchedule.selectedOptions || [],
        });
      }
    }, [selectedSchedule]);

    // prefillTimeの変更を監視してフォームデータを更新
    useEffect(() => {
      setFormData(prev => ({
        ...prev,
        startTime: prefillTime.start ?? prev.startTime,
        endTime: prefillTime.end ?? prev.endTime,
      }));
    }, [prefillTime]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedTruck) return;

      const newSchedule: Schedule = {
        ...formData,
      };

      const updatedTruck = {
        ...selectedTruck,
        schedules: selectedSchedule
          ? selectedTruck.schedules.map(s => s.id === selectedSchedule.id ? newSchedule : s)
          : [...selectedTruck.schedules, newSchedule],
      };

      onUpdateTruck(updatedTruck);
      setShowScheduleModal(false);
      setSelectedSchedule(null);
      setSelectedTruck(null);
    };

    const addOption = () => {
      setFormData(prev => ({
        ...prev,
        selectedOptions: [...(prev.selectedOptions || []), { name: '', price: 0 }],
      }));
    };

    const updateOption = (index: number, field: 'name' | 'price', value: string | number) => {
      setFormData(prev => ({
        ...prev,
        selectedOptions: (prev.selectedOptions || []).map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        ),
      }));
    };

    const removeOption = (index: number) => {
      setFormData(prev => ({
        ...prev,
        selectedOptions: (prev.selectedOptions || []).filter((_, i) => i !== index),
      }));
    };

    if (!showScheduleModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {selectedSchedule ? 'スケジュール編集' : 'スケジュール追加'}
            </h3>
            <button
              onClick={() => {
                setShowScheduleModal(false);
                setSelectedSchedule(null);
                setSelectedTruck(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">トラック</label>
                <input
                  type="text"
                  value={selectedTruck?.name || ''}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="available">稼働中</option>
                  <option value="maintenance">整備中</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">契約ステータス</label>
                <select
                  value={formData.contractStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractStatus: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="estimate">未確定</option>
                  <option value="confirmed">確定</option>
                </select>
              </div>
            </div>

            {/* 顧客情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作業タイプ</label>
                <select
                  value={formData.workType}
                  onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="loading">積込</option>
                  <option value="moving">移動</option>
                  <option value="unloading">積卸</option>
                  <option value="maintenance">整備</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">荷物重量 (kg)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ポイント</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* 場所情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出発地</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了地点</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* 希望日（見積もり回答済みのみ） */}
            {formData.contractStatus === 'estimate' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">第1希望日</label>
                  <input
                    type="date"
                    value={formData.preferredDate1}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate1: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">第2希望日</label>
                  <input
                    type="date"
                    value={formData.preferredDate2}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate2: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">第3希望日</label>
                  <input
                    type="date"
                    value={formData.preferredDate3}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate3: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}

            {/* 支払情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払方法</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="cash">現金</option>
                  <option value="card">カード</option>
                  <option value="transfer">振込</option>
                  <option value="invoice">請求書</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払状況</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">未払い</option>
                  <option value="partial">一部支払い</option>
                  <option value="paid">支払済み</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払金額</label>
                <input
                  type="number"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払期限</label>
                <input
                  type="date"
                  value={formData.paymentDueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentDueDate: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* 選択オプション */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">選択オプション</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  追加
                </button>
              </div>
              {(formData.selectedOptions || []).map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="オプション名"
                    value={option.name}
                    onChange={(e) => updateOption(index, 'name', e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="価格"
                    value={option.price || ''}
                    onChange={(e) => updateOption(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-24 p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            {/* フリーコメント */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">フリーコメント</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedSchedule(null);
                  setSelectedTruck(null);
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {selectedSchedule ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 月ビュー
  const MonthView = () => {
    const handleAddSchedule = (truck: Truck, date: string) => {
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
      const bookedSchedules = schedules.filter(s => s.status === 'available');
      const totalTrucks = trucks.length;
      return totalTrucks > 0 ? (bookedSchedules.length / totalTrucks) * 100 : 0;
    };

    // 稼働率の色を決定
    const getUtilizationColor = (rate: number) => {
      if (rate < 30) return 'bg-green-100 text-green-800';
      if (rate < 70) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    // 月ビュー用スケジュール一覧モーダル
    const MonthScheduleModal = ({ date, schedules, onClose }: {
      date: string;
      schedules: any[];
      onClose: () => void;
    }) => {
      const formatPrefMunicipality = (addr?: string) => {
        if (!addr) return '-';
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
              <label className="block text-sm font-medium text-gray-700 mb-2">表示フィルター</label>
              <div className="inline-flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFilterType(e.target.value as 'all' | 'confirmed' | 'unconfirmed');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 border rounded text-sm w-auto min-w-[8rem]"
                >
                  <option value="all">全て</option>
                  <option value="confirmed">確定のみ</option>
                  <option value="unconfirmed">未確定のみ</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {displaySchedules.map((schedule, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border cursor-pointer hover:opacity-80 transition-opacity ${schedule.contractStatus === 'confirmed'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                    setHighlightedScheduleId(schedule.id);
                    onClose();
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
                  {/* 依頼者名と発着地を2行レイアウト */}
                  <div className="text-sm">
                    {/* 1行目: 依頼者名と発地 */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {schedule.contractStatus === 'confirmed' ? '✅' : '⏳'}
                        </span>
                        <span className="font-medium">
                          {schedule.customerName || '予約済み'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {schedule.truckName}
                        </span>
                        {schedule.customerPhone && (
                          <span className="text-xs text-gray-600 ml-2" title="電話番号">
                            ☎ {schedule.customerPhone}
                          </span>
                        )}
                      </div>
                      {schedule.origin && (
                        <span className="text-blue-600 text-xs truncate ml-2">
                          発：{formatPrefMunicipality(schedule.origin)}
                        </span>
                      )}
                    </div>
                    {/* 2行目: 時間と着地 */}
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="text-sm font-medium">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                      {schedule.destination && (
                        <span className="text-red-600 text-xs truncate ml-2">
                          着：{formatPrefMunicipality(schedule.destination)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* 月次ナビゲーション */}
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
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="p-1 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            {Array.from({ length: Math.ceil(monthDays.length / 7) }, (_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-0.5">
                {monthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                  const schedules = getSchedulesForDate(day.date);
                  const hasSchedules = schedules.length > 0;

                  return (
                    <div
                      key={day.date}
                      data-date-cell
                      className={`min-h-[80px] p-1 border cursor-pointer hover:bg-gray-50 transition-colors ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                      onClick={(e) => {
                        console.log('Date clicked:', day.date);
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
                      <div className={`text-xs font-medium mb-0.5 ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${day.isToday ? 'text-blue-600' : ''} ${
                        // 土曜日は青色、日曜日と祝日は赤色で表示
                        day.dayOfWeekNumber === 6 ? 'text-blue-600' :
                          (day.dayOfWeekNumber === 0 || day.isHoliday) ? 'text-red-600' : ''
                        }`}>
                        {day.day}
                      </div>

                      {hasSchedules && (
                        <div className="space-y-1 flex flex-col items-center">
                          {/* 確定と未確定の件数を分けて表示 */}
                          {(() => {
                            const confirmedSchedules = schedules.filter(s => s.contractStatus === 'confirmed');
                            const unconfirmedSchedules = schedules.filter(s => s.contractStatus !== 'confirmed');

                            return (
                              <>
                                {/* 確定件数 */}
                                {confirmedSchedules.length > 0 && (
                                  <div
                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center font-medium cursor-pointer hover:bg-green-200 transition-colors w-full flex items-center justify-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedDate(day.date);
                                      setIsExpandedView(true);
                                      // 確定でフィルターをかけた状態でモーダルを開く
                                      setMonthViewFilterType('confirmed');
                                    }}
                                  >
                                    <span>✅</span>
                                    <span>{confirmedSchedules.length}件</span>
                                  </div>
                                )}

                                {/* 未確定件数 */}
                                {unconfirmedSchedules.length > 0 && (
                                  <div
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded text-center font-medium cursor-pointer hover:bg-gray-200 transition-colors w-full flex items-center justify-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedDate(day.date);
                                      setIsExpandedView(true);
                                      // 未確定でフィルターをかけた状態でモーダルを開く
                                      setMonthViewFilterType('unconfirmed');
                                    }}
                                  >
                                    <span>⏳</span>
                                    <span>{unconfirmedSchedules.length}件</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 月ビュー用スケジュール一覧モーダル */}
        {isExpandedView && expandedDate && (
          <MonthScheduleModal
            date={expandedDate}
            schedules={getSchedulesForDate(expandedDate)}
            onClose={() => {
              setIsExpandedView(false);
              setExpandedDate(null);
              setSelectedSchedule(null);
              setMonthViewFilterType('all'); // フィルター状態をリセット
            }}
          />
        )}
      </div>
    );
  };

  // 日ビュー - 新しいDayViewComponentを使用
  const DayView = () => {
    return (
      <DayViewComponent
        selectedDate={selectedDate}
        trucks={trucks}
        onUpdateTruck={onUpdateTruck}
        onScheduleClick={(schedule, truck) => {
          setSelectedTruck(truck);
          setSelectedSchedule(schedule);
          setShowScheduleDetail(true);
        }}
        highlightedScheduleId={highlightedScheduleId}
      />
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
                      {selectedSchedule.contractStatus === 'confirmed' ? '✅ 確定' : '⏳ 未確定'}
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
                      <label className="block text-sm font-medium text-gray-600 mb-1">引越し容量</label>
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

    const handleCellClick = (date: string, timeSlot: string) => {
      const [start, end] = timeSlot.split('-');
      setSelectedDate(date);
      setSelectedSchedule(null);
      setPrefillTime({ start, end });
      setShowScheduleModal(true);
    };

    const handleScheduleClick = (schedule: Schedule) => {
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    };

    // 指定された日付と時間帯のスケジュールを取得（全トラックから）
    const getBlockSchedules = (date: string, timeBlock: TimeSlot) => {
      const allSchedules = trucks.flatMap(truck =>
        truck.schedules
          .filter(schedule => schedule.date === date)
          .filter(schedule => {
            const scheduleStart = schedule.startTime;
            const scheduleEnd = schedule.endTime;
            // 時間ブロックとスケジュールの重複を正しく判定
            // スケジュールの開始時刻 < 時間ブロックの終了時刻 かつ
            // スケジュールの終了時刻 > 時間ブロックの開始時刻
            const hasOverlap = scheduleStart < timeBlock.end && scheduleEnd > timeBlock.start;
            
            // デバッグ用：重複判定の詳細を確認
            if (date === toLocalDateString(new Date()) && timeBlock.start === '13:00') {
              console.log(`Schedule overlap check:`, {
                date,
                timeBlock: timeBlock.start + '-' + timeBlock.end,
                schedule: {
                  id: schedule.id,
                  startTime: scheduleStart,
                  endTime: scheduleEnd,
                  customerName: schedule.customerName
                },
                hasOverlap
              });
            }
            
            return hasOverlap;
          })
          .map(schedule => ({
            ...schedule,
            truckName: truck.name,
            truckId: truck.id,
          }))
      );

      // 重複するスケジュールを除外（IDベースでユニークにする）
      const uniqueSchedules = allSchedules.filter((schedule, index, self) =>
        index === self.findIndex(s => s.id === schedule.id)
      );

      // デバッグ用：最終結果を確認
      if (date === toLocalDateString(new Date()) && timeBlock.start === '13:00') {
        console.log(`Final schedules for ${date} ${timeBlock.time}:`, uniqueSchedules);
      }

      return uniqueSchedules;
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
        '#e0f2fe', // 薄い青
        '#fce7f3', // 薄いピンク
        '#dcfce7', // 薄い緑
        '#fef3c7', // 薄い黄色
        '#f3e8ff', // 薄い紫
        '#fed7aa', // 薄いオレンジ
        '#ccfbf1', // 薄いティール
        '#fecaca', // 薄い赤
        '#dbeafe', // 薄いブルー
        '#e0e7ff', // 薄いインディゴ
        '#fef2f2', // 薄いローズ
        '#f0fdf4', // 薄いエメラルド
        '#fffbeb', // 薄いアンバー
        '#f5f3ff', // 薄いバイオレット
        '#ecfdf5', // 薄いエメラルド
        '#fefce8', // 薄いライム
        '#fdf2f8', // 薄いピンク
        '#f0f9ff', // 薄いスカイ
        '#fdf4ff', // 薄いフューシャ
        '#f0fdfa', // 薄いティール
        '#fef7f0', // 薄いオレンジ
        '#f4f4f5', // 薄いグレー
        '#fafafa', // 薄いスレート
        '#f8fafc', // 薄いスレート
        '#f1f5f9', // 薄いスレート
        '#f9fafb', // 薄いグレー
        '#faf5ff', // 薄いバイオレット
        '#fef2f2', // 薄いローズ
        '#f0fdf4', // 薄いエメラルド
        '#fefce8', // 薄いライム
        '#fef2f2'  // 薄いローズ
      ];

      // 顧客名のハッシュ値で色を決定
      let hash = 0;
      for (let i = 0; i < customerName.length; i++) {
        hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    // 案件の表示用スタイルを取得
    const getScheduleDisplayStyle = (schedule: Schedule, index: number, totalSchedules: number) => {
      const baseColor = schedule.customerName ? 
        getCustomerColor(schedule.customerName) : 
        schedule.status === 'available' ? '#dbeafe' : '#fef3c7';
      
      // 境界線の色を決定（より濃い色で区切りを明確に）
      const borderColor = schedule.customerName ? 
        getCustomerColor(schedule.customerName).replace('0', '8') : 
        '#94a3b8';
      
      return {
        backgroundColor: baseColor,
        borderColor: borderColor,
        borderWidth: '1px',
        borderStyle: 'solid'
      };
    };

    // 苗字を抽出する関数
    const getLastName = (fullName?: string) => {
      if (!fullName) return '?';
      // 空白、全角空白、タブで分割して最初の部分（苗字）を取得
      const parts = fullName.split(/[ \t　]/);
      return parts[0] || '?';
    };

    // 住所の簡易表示を安全に処理
    const shortPrefMuni = (addr?: string) => {
      if (!addr) return '';
      const m = addr.match(/^(.*?[都道府県])\s*(.*?[市区町村])/);
      if (m) return `${m[1]}${m[2]}`;
      // フォールバック：空白/記号で分割して最初の2トークン程度
      return addr.split(/[ \t　]/).slice(0,2).join('');
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
            {/* ヘッダー行 - 曜日のみ */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
              <div className="p-2 font-medium text-gray-600">時間</div>
              {weekDays.map(day => (
                <div
                  key={day.date}
                  className="p-2 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setViewMode('day');
                    setExpandedDate(null);
                    setIsExpandedView(false);
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

            {/* メイングリッド - 各行が時間ブロック、各列が曜日 */}
            {weekTimeBlocks.map(block => (
              <div key={block.time} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                {/* 時間軸（左側） */}
                <div className="p-2 text-sm text-gray-600 border bg-gray-50 flex items-center justify-center">
                  {block.label}
                </div>

                {/* 各曜日のスケジュール */}
                {weekDays.map(day => {
                  const schedules = getBlockSchedules(day.date, block);
                  
                  // デバッグ用：特定の時間帯のスケジュールを確認
                  if (day.date === toLocalDateString(new Date()) && block.start === '13:00') {
                    console.log(`Debug - Date: ${day.date}, Time: ${block.time}, Schedules count: ${schedules.length}`, schedules);
                  }

                  return (
                    <div
                      key={day.date}
                      className={`h-20 border transition-opacity ${schedules.length > 0 ? 'relative overflow-hidden' : ''
                        }`}
                      style={{
                        backgroundColor: '#f9fafb' // セルの背景色を統一
                      }}
                      onClick={() => handleCellClick(day.date, block.time)}
                      title={schedules.length > 0 ?
                        schedules.length >= 5 ?
                          `${schedules.length}件のスケジュール` :
                          `${schedules.length}件のスケジュール` :
                        `${day.date} ${block.label} - 空き`
                      }
                    >
                      {schedules.length === 0 ? (
                        // 空き時間は何も表示しない
                        <div className="w-full h-full"></div>
                      ) : schedules.length >= 5 ? (
                        // 5件以上は件数のみ表示、クリックで日ビューに飛ばす
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center text-xs cursor-pointer p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day.date);
                            setViewMode('day');
                          }}
                        >
                          <div className="text-center w-full">
                            <div className="text-lg font-bold text-orange-600">
                              +{schedules.length}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // 4件までは横に重ねて表示
                        schedules.map((schedule, index) => {
                          // 横並びの位置を計算（セルの境界内に収める）
                          let leftPercent = 0;
                          if (schedules.length === 1) {
                            leftPercent = 0;
                          } else if (schedules.length === 2) {
                            leftPercent = index === 0 ? 0 : 50;
                          } else if (schedules.length === 3) {
                            leftPercent = index === 0 ? 0 : index === 1 ? 33.33 : index === 2 ? 66.67 : 0;
                          } else if (schedules.length === 4) {
                            leftPercent = index === 0 ? 0 : index === 1 ? 25 : index === 2 ? 50 : 75;
                          }

                          const displayStyle = getScheduleDisplayStyle(schedule, index, schedules.length);

                          return (
                            <div
                              key={`${schedule.id}-${index}`}
                              className={`absolute top-0 bottom-0 cursor-pointer p-1 text-xs hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm`}
                              style={{
                                left: `${leftPercent}%`,
                                width: `calc(${100 / schedules.length}% - 2px)`,
                                maxWidth: `calc(${100 / schedules.length}% - 2px)`,
                                ...displayStyle
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(schedule.date);
                                setViewMode('day');
                                setHighlightedScheduleId(schedule.id);
                              }}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                // ホバー時のツールチップ表示
                                const tooltip = document.createElement('div');
                                tooltip.className = 'absolute z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap';
                                tooltip.textContent = `${schedule.customerName || '未設定'} (${schedule.startTime}-${schedule.endTime})`;
                                tooltip.style.left = `${e.clientX + 10}px`;
                                tooltip.style.top = `${e.clientY - 30}px`;
                                document.body.appendChild(tooltip);
                                
                                // マウスアウト時にツールチップを削除
                                const removeTooltip = () => {
                                  if (tooltip.parentNode) {
                                    tooltip.parentNode.removeChild(tooltip);
                                  }
                                  document.removeEventListener('mouseleave', removeTooltip);
                                };
                                document.addEventListener('mouseleave', removeTooltip);
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                // ツールチップを削除
                                const tooltips = document.querySelectorAll('.absolute.z-50.bg-gray-900');
                                tooltips.forEach(tooltip => {
                                  if (tooltip.parentNode) {
                                    tooltip.parentNode.removeChild(tooltip);
                                  }
                                });
                              }}
                            >
                              <div className="text-center w-full h-full flex flex-col justify-center">
                                {schedules.length === 1 ? (
                                  // 1件の場合は契約状況アイコン、顧客名、時間の順で表示
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center justify-center">
                                      <span className="text-sm opacity-80">
                                        {schedule.contractStatus === 'confirmed' ? '✅' : '⏳'}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800">
                                      {schedule.customerName || '未設定'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {schedule.startTime}-{schedule.endTime}
                                    </div>
                                  </div>
                                ) : (
                                  // 2-4件の場合は契約状況アイコンと顧客名の苗字を表示
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center justify-center">
                                      <span className="text-sm opacity-80">
                                        {schedule.contractStatus === 'confirmed' ? '✅' : '⏳'}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-800">
                                      {getLastName(schedule.customerName)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
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

  return (
    <div className="space-y-3">
      {/* ビュー切り替えとナビゲーション */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">配車スケジュール</h2>
        </div>

        {/* ビューモード選択と表示期間選択 */}
        <div className="flex items-center justify-between mb-3">
          {/* ビューモード選択 */}
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              月
            </button>
            <button
              onClick={() => {
                setSelectedDate(toLocalDateString(today));
                setCurrentDate(today);
                setViewMode('week');
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              週
            </button>
            <button
              onClick={() => {
                setSelectedDate(toLocalDateString(today));
                setViewMode('day');
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              日
            </button>
          </div>
        </div>

        {/* 凡例 */}
        <div className="bg-gray-50 rounded p-2">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>確定</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⏳</span>
              <span>未確定</span>
            </div>

            {viewMode === 'day' && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>50%未満</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>50%以上</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>80%以上</span>
                </div>
              </>
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