'use client';

/**
 * 配車スケジュール管理カレンダーコンポーネント
 * - 月/週/日ビュー切り替え
 * - トラックごとのスケジュール管理
 * - 案件の追加・編集・削除
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatTime, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA } from '@/constants/calendar';
import CaseDetail from './CaseDetail';
import DayViewComponent from './dispatch/DayView';
import StatusFilter from './dispatch/StatusFilter';
import GridCalendar from './GridCalendar';
import { CaseDetail as CaseDetailType } from '../types/case';
import { Truck, Schedule } from '../types/dispatch';
import UnifiedMonthCalendar, { CalendarDay, CalendarEvent } from './UnifiedMonthCalendar';
import { fetchHolidays, isHoliday as checkIsHoliday, type Holiday } from '@/utils/holidayUtils';

interface Option {
  name: string;
  price?: number;
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

type ViewMode = 'month' | 'day';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  preferredDate1?: string; // 第一希望日
  preferredDate2?: string; // 第二希望日
  preferredDate3?: string; // 第三希望日
  moveTime1?: string; // 第一希望時間
  moveTime2?: string; // 第二希望時間
  moveTime3?: string; // 第三希望時間
  originAddress: string;
  destinationAddress: string;
  totalPoints: number;
  totalCapacity?: number; // 総容量（kg）
  distance?: number; // 距離（km）
  itemList?: string[]; // 荷物リスト
  truckAssignments: any[];
  contractStatus: 'estimate' | 'confirmed';
  estimatedPrice?: number;
  recommendedTruckTypes?: string[];
  additionalServices?: string[]; // 追加サービス
  customAdditionalServices?: string; // カスタム追加サービス
  notes?: string; // 備考
  paymentMethod?: string; // 支払方法
  paymentStatus?: string; // 支払状況
  priceTaxIncluded?: number; // 税込金額
  sourceType?: string; // 依頼元（シンクワーク/SUUMO/手動登録など）
  createdAt?: string; // 作成日時
}

interface DispatchCalendarProps {
  trucks: Truck[];
  onUpdateTruck: (truck: Truck) => void;
  statusFilter?: 'all' | 'confirmed' | 'estimate';
  onStatusFilterChange?: (status: 'all' | 'confirmed' | 'estimate') => void;
  formSubmissions?: FormSubmission[]; // 案件データ
  onAssignTruck?: (submission: FormSubmission, truck: Truck) => void; // 配車割り当てハンドラー
}

export default function DispatchCalendar({ trucks, onUpdateTruck, statusFilter = 'all', onStatusFilterChange, formSubmissions = [], onAssignTruck }: DispatchCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(today));
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);

  const [highlightedScheduleId, setHighlightedScheduleId] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [monthViewFilterType, setMonthViewFilterType] = useState<'all' | 'confirmed' | 'unconfirmed' | 'unassigned'>('all');
  const [prefillTime, setPrefillTime] = useState<{start?: string; end?: string}>({});

  // 日ビュー用のステータスフィルタ状態管理
  const [dayViewStatusFilter, setDayViewStatusFilter] = useState<'all' | 'confirmed' | 'estimate'>('all');

  // 祝日データを取得
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  useEffect(() => {
    fetchHolidays().then(setHolidays);
  }, []);

  // URLクエリパラメータとの同期
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status') as 'all' | 'confirmed' | 'estimate' | null;
    
    if (statusParam && ['all', 'confirmed', 'estimate'].includes(statusParam)) {
      setDayViewStatusFilter(statusParam);
    }
  }, []);

  // フィルタ変更時にURLを更新
  const handleDayViewStatusFilterChange = (newStatus: 'all' | 'confirmed' | 'estimate') => {
    setDayViewStatusFilter(newStatus);
    
    // URLクエリパラメータを更新
    const url = new URL(window.location.href);
    if (newStatus === 'all') {
      url.searchParams.delete('status');
    } else {
      url.searchParams.set('status', newStatus);
    }
    
    // 履歴を更新（ページリロードなし）
    window.history.replaceState({}, '', url.toString());
  };

  // 編集ハンドラー
  const handleEditCase = (caseId: string) => {
    router.push(`/admin/cases/${caseId}/edit`);
  };

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
    // selectedDate changed
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
            for (let hour = 9; hour < 19; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      blocks.push({ time, hour, minute: 0 });
    }
    return blocks;
  };


  const timeBlocks = generateTimeBlocks();


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
 * 祝日かどうかを判定する関数（API経由で動的に取得）
 * @param date - 判定する日付
 * @returns 祝日かどうか
 */
  const isHoliday = (date: Date) => {
    return checkIsHoliday(date, holidays);
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

  const monthDays = getMonthDays(currentDate);
  const dayInfo = getDayInfo(currentDate);
  
  // トラックデータの監視
  useEffect(() => {
    // Trucks data updated
  }, [trucks]);


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
                <label className="block text-sm font-medium text-gray-700 mb-1">発地</label>
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

    // 日付ごとのイベントを取得（GridCalendar用）
    // トラックに割り当てられたスケジュールと未割り当て案件の両方を含める
    const getEventsForDate = (date: string) => {
      const schedules = getSchedulesForDate(date);

      // 未割り当て案件を取得
      const unassignedCases = formSubmissions.filter(submission =>
        submission.moveDate === date &&
        (!submission.truckAssignments || submission.truckAssignments.length === 0)
      );

      // スケジュールをイベント形式に変換
      const scheduledEvents = schedules.map(schedule => ({
        id: schedule.id,
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        truckId: schedule.truckId,
        truckName: schedule.truckName,
        status: schedule.status,
        contractStatus: schedule.contractStatus,
        customerName: schedule.customerName,
        customerPhone: schedule.customerPhone,
        originAddress: schedule.originAddress,
        destinationAddress: schedule.destinationAddress,
        totalPoints: schedule.totalPoints,
        totalCapacity: schedule.totalCapacity,
        itemList: schedule.itemList,
        additionalServices: schedule.additionalServices,
        estimatedPrice: schedule.estimatedPrice,
        contractDate: schedule.contractDate,
        caseStatus: schedule.caseStatus,
        requestSource: schedule.requestSource,
        isManualRegistration: schedule.isManualRegistration,
        registeredBy: schedule.registeredBy,
        distance: schedule.distance,
        recommendedTruckTypes: schedule.recommendedTruckTypes
      }));

      // 未割当案件をイベント形式に変換
      // 注意: contractStatusは元のsubmissionの値を使用（'estimate'または'confirmed'）
      const unassignedEvents = unassignedCases.map(submission => ({
        id: `unassigned-${submission.id}`,
        title: submission.customerName,
        contractStatus: submission.contractStatus, // 元のcontractStatusを使用
        isUnassigned: true, // 未割当フラグを追加
        customerName: submission.customerName,
        customerPhone: submission.customerPhone,
        originAddress: submission.originAddress,
        destinationAddress: submission.destinationAddress,
        totalPoints: submission.totalPoints,
        estimatedPrice: submission.estimatedPrice,
        recommendedTruckTypes: submission.recommendedTruckTypes,
      }));

      // スケジュールと未割り当て案件を結合して返す
      return [...scheduledEvents, ...unassignedEvents];
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

      // その日の未割り当て案件を取得
      const unassignedCases = formSubmissions.filter(submission =>
        submission.moveDate === date &&
        (!submission.truckAssignments || submission.truckAssignments.length === 0)
      );

      // フィルター状態を管理（月ビューの状態を使用）
      const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'unconfirmed' | 'unassigned'>(monthViewFilterType);

      // monthViewFilterTypeが変わったときにfilterTypeを更新
      useEffect(() => {
        setFilterType(monthViewFilterType);
      }, [monthViewFilterType]);

      // 確定と未確定を分けて表示
      const confirmedSchedules = schedules.filter(s => s.contractStatus === 'confirmed');
      const unconfirmedSchedules = schedules.filter(s => s.contractStatus !== 'confirmed');

      // 未割当案件（確定+未確定の両方）
      const unassignedSchedules = unassignedCases;

      // スケジュールと未割当案件を統合したリスト（表示用）
      // scheduleには時間情報があるが、未割当案件にはないので区別するため
      interface DisplayItem {
        type: 'schedule' | 'unassigned';
        data: any;
        contractStatus: 'confirmed' | 'estimate';
        isUnassigned: boolean;
      }

      // フィルターに基づいて表示する案件を決定
      let displayItems: DisplayItem[] = [];
      let title = `${formatDate(date)} のスケジュール (${schedules.length + unassignedCases.length}件)`;

      if (filterType === 'confirmed') {
        // 確定のみ：配車割当済みの確定案件 + 未割当の確定案件
        const confirmedScheduleItems = confirmedSchedules.map(s => ({
          type: 'schedule' as const,
          data: s,
          contractStatus: 'confirmed' as const,
          isUnassigned: false
        }));
        const confirmedUnassignedItems = unassignedCases
          .filter(s => s.contractStatus === 'confirmed')
          .map(s => ({
            type: 'unassigned' as const,
            data: s,
            contractStatus: 'confirmed' as const,
            isUnassigned: true
          }));
        displayItems = [...confirmedScheduleItems, ...confirmedUnassignedItems];
        title = `${formatDate(date)} の確定スケジュール (${displayItems.length}件)`;
      } else if (filterType === 'unconfirmed') {
        // 未確定のみ：配車割当済みの未確定案件 + 未割当の未確定案件
        const unconfirmedScheduleItems = unconfirmedSchedules.map(s => ({
          type: 'schedule' as const,
          data: s,
          contractStatus: 'estimate' as const,
          isUnassigned: false
        }));
        const unconfirmedUnassignedItems = unassignedCases
          .filter(s => s.contractStatus === 'estimate')
          .map(s => ({
            type: 'unassigned' as const,
            data: s,
            contractStatus: 'estimate' as const,
            isUnassigned: true
          }));
        displayItems = [...unconfirmedScheduleItems, ...unconfirmedUnassignedItems];
        title = `${formatDate(date)} の未確定スケジュール (${displayItems.length}件)`;
      } else if (filterType === 'unassigned') {
        // 未割当のみ：配車未割当の案件（確定+未確定の両方）
        displayItems = unassignedSchedules.map(s => ({
          type: 'unassigned' as const,
          data: s,
          contractStatus: s.contractStatus,
          isUnassigned: true
        }));
        title = `${formatDate(date)} の未割当案件 (${displayItems.length}件)`;
      } else {
        // 全て：配車割当済み + 未割当
        const scheduleItems = schedules.map(s => ({
          type: 'schedule' as const,
          data: s,
          contractStatus: s.contractStatus,
          isUnassigned: false
        }));
        const unassignedItems = unassignedCases.map(s => ({
          type: 'unassigned' as const,
          data: s,
          contractStatus: s.contractStatus,
          isUnassigned: true
        }));
        displayItems = [...scheduleItems, ...unassignedItems];
      }

      return (
        <div data-month-modal="true" className="p-6">
          <div>
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
            <div className="mb-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">表示:</label>
              <select
                value={filterType}
                onChange={(e) => {
                  e.stopPropagation();
                  setFilterType(e.target.value as 'all' | 'confirmed' | 'unconfirmed' | 'unassigned');
                }}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 border rounded text-xs flex-1"
              >
                <option value="all">全て</option>
                <option value="confirmed">確定のみ</option>
                <option value="unconfirmed">未確定のみ</option>
                <option value="unassigned">未配車のみ</option>
              </select>
            </div>

            <div className="space-y-3">
              {displayItems.map((item, index) => {
                // 確定/未確定に応じた色設定
                const isConfirmed = item.contractStatus === 'confirmed';
                const bgColor = isConfirmed ? 'bg-green-100' : 'bg-gray-100';
                const borderColor = isConfirmed ? 'border-green-200' : 'border-gray-200';
                const textColor = isConfirmed ? 'text-green-800' : 'text-gray-700';

                if (item.type === 'schedule') {
                  // 配車割当済みの案件
                  const schedule = item.data;
                  // スケジュールIDから対応するformSubmissionを取得
                  const submission = formSubmissions.find(fs =>
                    fs.truckAssignments?.some(ta => ta.scheduleId === schedule.id)
                  );

                  // 車両名を取得
                  const assignedTruckName = schedule.truckName || '車両未設定';

                  return (
                    <div
                      key={`schedule-${index}`}
                      className={`p-3 rounded border ${bgColor} ${textColor} ${borderColor}`}
                    >
                      {/* 案件情報 */}
                      <div className="text-sm">
                        {/* 1行目: 契約ステータス、顧客名、発地 */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {isConfirmed ? '✅' : '⏳'}
                            </span>
                            <span className="font-medium">
                              {schedule.customerName || '予約済み'}
                            </span>
                          </div>
                          {schedule.origin && (
                            <span className="text-blue-600 text-xs truncate ml-2">
                              発：{formatPrefMunicipality(schedule.origin)}
                            </span>
                          )}
                        </div>
                        {/* 2行目: 時間と着地 */}
                        <div className="flex items-center justify-between text-gray-600 mb-2">
                          <span className="text-xs font-medium">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </span>
                          {schedule.destination && (
                            <span className="text-red-600 text-xs truncate ml-2">
                              着：{formatPrefMunicipality(schedule.destination)}
                            </span>
                          )}
                        </div>
                        {/* 3行目: 車両情報と配車ボタン・詳細・編集ボタン */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-700 font-medium">
                              🚚 {assignedTruckName}
                            </span>
                            {onAssignTruck && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 配車割当モーダルを開く
                                  onAssignTruck(submission, trucks[0]);
                                  onClose();
                                }}
                                className="bg-gray-600 text-white rounded hover:bg-gray-700"
                                style={{ padding: '2px 6px', fontSize: '9px', lineHeight: '1.2', height: '16px', minHeight: '16px', maxHeight: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', gap: '3px' }}
                              >
                                <span>🔄</span>
                                <span>変更</span>
                              </button>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 詳細モーダル表示 - 今後実装
                                alert('詳細表示機能は今後実装予定です');
                              }}
                              className="bg-blue-600 text-white rounded hover:bg-blue-700"
                              style={{ padding: '2px 8px', fontSize: '10px', lineHeight: '1.2', height: '18px', minHeight: '18px', maxHeight: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', minWidth: '40px' }}
                            >
                              詳細
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (submission) {
                                  router.push(`/admin/cases/${submission.id}/edit?from=dispatch-month&caseId=${submission.id}`);
                                }
                              }}
                              className="bg-gray-600 text-white rounded hover:bg-gray-700"
                              style={{ padding: '2px 8px', fontSize: '10px', lineHeight: '1.2', height: '18px', minHeight: '18px', maxHeight: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', minWidth: '40px' }}
                            >
                              編集
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // 未割当案件
                  const submission = item.data;
                  // 配車未割当の判定（DayViewと同じロジック）
                  const isUnassigned = item.isUnassigned || !submission.truckAssignments || submission.truckAssignments.length === 0;

                  return (
                    <div
                      key={`unassigned-${index}`}
                      className={`relative p-3 rounded border ${bgColor} ${borderColor} ${textColor}`}
                    >
                      {/* 案件情報 */}
                      <div className="text-sm">
                        {/* 1行目: 契約ステータス、顧客名、発地 */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {isUnassigned && <span className="text-xs">⚠️</span>}
                            <span className="text-xs">
                              {isConfirmed ? '✅' : '⏳'}
                            </span>
                            <span className="font-medium">
                              {submission.customerName}
                            </span>
                          </div>
                          {submission.originAddress && (
                            <span className="text-blue-600 text-xs truncate ml-2">
                              発：{formatPrefMunicipality(submission.originAddress)}
                            </span>
                          )}
                        </div>
                        {/* 2行目: 作業時間と着地 */}
                        <div className="flex items-center justify-between text-gray-600 mb-2">
                          <span className="text-xs font-medium">
                            {(() => {
                              // 配車が割り当てられている場合は、実際の作業時間を表示
                              if (submission.truckAssignments && submission.truckAssignments.length > 0) {
                                const firstAssignment = submission.truckAssignments[0];
                                return `${firstAssignment.startTime}-${firstAssignment.endTime}`;
                              }
                              // 未配車の場合は希望時間を表示
                              return submission.moveTime1 || '時間未設定';
                            })()}
                          </span>
                          {submission.destinationAddress && (
                            <span className="text-red-600 text-xs truncate ml-2">
                              着：{formatPrefMunicipality(submission.destinationAddress)}
                            </span>
                          )}
                        </div>
                        {/* 3行目: 未配車/配車ボタンと詳細・編集ボタン */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isUnassigned && (
                              <>
                                <span className="text-xs text-red-600 font-medium">未配車</span>
                                {onAssignTruck && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // トラック選択モーダルを開く（親コンポーネントで処理）
                                      onAssignTruck(submission, trucks[0]);
                                      // モーダルを閉じる
                                      onClose();
                                    }}
                                    className="bg-red-600 text-white rounded hover:bg-red-700"
                                    style={{ padding: '2px 6px', fontSize: '9px', lineHeight: '1.2', height: '16px', minHeight: '16px', maxHeight: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', gap: '3px' }}
                                  >
                                    <span>🚚</span>
                                    <span>配車</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 詳細モーダル表示 - 今後実装
                                alert('詳細表示機能は今後実装予定です');
                              }}
                              className="bg-blue-600 text-white rounded hover:bg-blue-700"
                              style={{ padding: '2px 8px', fontSize: '10px', lineHeight: '1.2', height: '18px', minHeight: '18px', maxHeight: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', minWidth: '40px' }}
                            >
                              詳細
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/cases/${submission.id}/edit?from=dispatch-month&caseId=${submission.id}`);
                              }}
                              className="bg-gray-600 text-white rounded hover:bg-gray-700"
                              style={{ padding: '2px 8px', fontSize: '10px', lineHeight: '1.2', height: '18px', minHeight: '18px', maxHeight: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', minWidth: '40px' }}
                            >
                              編集
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      );
    };

    const handleDateClick = (date: string, filterType?: 'confirmed' | 'unconfirmed' | 'unassigned') => {
      // その日のスケジュールを取得
      const schedules = getSchedulesForDate(date);

      // その日の未割り当て案件を取得
      const unassignedCases = formSubmissions.filter(submission =>
        submission.moveDate === date &&
        (!submission.truckAssignments || submission.truckAssignments.length === 0)
      );

      // スケジュールも未割り当て案件もない場合はモーダルを開かない
      if (schedules.length === 0 && unassignedCases.length === 0) {
        return;
      }

      setSelectedDate(date);
      setExpandedDate(date);
      setIsExpandedView(true);
      // unassignedフィルターもサポート
      setMonthViewFilterType(filterType || 'all');
    };

    // 案件詳細モーダルの状態
    const [showCaseDetailModal, setShowCaseDetailModal] = useState(false);
    const [selectedCaseDetail, setSelectedCaseDetail] = useState<FormSubmission | null>(null);

    return (
      <div>
        {/* カレンダー本体 */}
        <div>

          <GridCalendar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            getEventsForDate={getEventsForDate}
            showModal={isExpandedView && Boolean(expandedDate)}
            modalTitle={expandedDate ? `${formatDate(expandedDate)} のスケジュール` : ''}
            modalContent={isExpandedView && expandedDate ? (
              <MonthScheduleModal
                date={expandedDate}
                schedules={getSchedulesForDate(expandedDate)}
                onClose={() => {
                  setIsExpandedView(false);
                  setExpandedDate(null);
                  setSelectedSchedule(null);
                  setMonthViewFilterType('all');
                }}
              />
            ) : null}
            onCloseModal={() => {
              setIsExpandedView(false);
              setExpandedDate(null);
              setSelectedSchedule(null);
              setMonthViewFilterType('all');
            }}
          />
        </div>

        {/* 案件詳細モーダル */}
        {showCaseDetailModal && selectedCaseDetail && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCaseDetailModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* ヘッダー */}
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      📋 案件詳細
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm px-3 py-1 rounded ${
                        selectedCaseDetail.contractStatus === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCaseDetail.contractStatus === 'confirmed' ? '確定' : '未確定'}
                      </span>
                      {(!selectedCaseDetail.truckAssignments || selectedCaseDetail.truckAssignments.length === 0) && (
                        <span className="text-sm px-3 py-1 rounded bg-yellow-100 text-yellow-800">
                          未割当
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCaseDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* 顧客情報 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">👤 顧客情報</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">氏名:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCaseDetail.customerName}</span>
                    </div>
                    {selectedCaseDetail.customerPhone && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">電話番号:</span>
                        <span className="text-sm text-gray-900">{selectedCaseDetail.customerPhone}</span>
                      </div>
                    )}
                    {selectedCaseDetail.customerEmail && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">メール:</span>
                        <span className="text-sm text-gray-900">{selectedCaseDetail.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 引っ越し日程 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📅 引っ越し日程</h4>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">予定日:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedCaseDetail.moveDate}</span>
                    </div>
                    {(selectedCaseDetail.preferredDate1 || selectedCaseDetail.preferredDate2 || selectedCaseDetail.preferredDate3) && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-2">希望日</div>
                        {selectedCaseDetail.preferredDate1 && (
                          <div className="flex ml-4 mb-1">
                            <span className="w-28 text-sm text-blue-600">第一希望:</span>
                            <span className="text-sm text-gray-900">
                              {selectedCaseDetail.preferredDate1}
                              {selectedCaseDetail.moveTime1 && ` (${selectedCaseDetail.moveTime1})`}
                            </span>
                          </div>
                        )}
                        {selectedCaseDetail.preferredDate2 && (
                          <div className="flex ml-4 mb-1">
                            <span className="w-28 text-sm text-blue-600">第二希望:</span>
                            <span className="text-sm text-gray-900">
                              {selectedCaseDetail.preferredDate2}
                              {selectedCaseDetail.moveTime2 && ` (${selectedCaseDetail.moveTime2})`}
                            </span>
                          </div>
                        )}
                        {selectedCaseDetail.preferredDate3 && (
                          <div className="flex ml-4">
                            <span className="w-28 text-sm text-blue-600">第三希望:</span>
                            <span className="text-sm text-gray-900">
                              {selectedCaseDetail.preferredDate3}
                              {selectedCaseDetail.moveTime3 && ` (${selectedCaseDetail.moveTime3})`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 住所情報 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📍 住所情報</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-blue-600">発地:</span>
                      <p className="text-sm text-gray-900 mt-1 ml-4">{selectedCaseDetail.originAddress}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-red-600">着地:</span>
                      <p className="text-sm text-gray-900 mt-1 ml-4">{selectedCaseDetail.destinationAddress}</p>
                    </div>
                  </div>
                </div>

                {/* 荷物・作業情報 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📦 荷物・作業情報</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">荷物ポイント:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCaseDetail.totalPoints} pt</span>
                    </div>
                    {selectedCaseDetail.totalCapacity && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">総容量:</span>
                        <span className="text-sm text-gray-900">{selectedCaseDetail.totalCapacity} kg</span>
                      </div>
                    )}
                    {selectedCaseDetail.distance && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">移動距離:</span>
                        <span className="text-sm text-gray-900">{selectedCaseDetail.distance} km</span>
                      </div>
                    )}
                    {selectedCaseDetail.recommendedTruckTypes && selectedCaseDetail.recommendedTruckTypes.length > 0 && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">推奨トラック:</span>
                        <span className="text-sm text-blue-600">{selectedCaseDetail.recommendedTruckTypes.join(', ')}</span>
                      </div>
                    )}
                    {selectedCaseDetail.itemList && selectedCaseDetail.itemList.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 font-medium block mb-2">荷物リスト:</span>
                        <div className="ml-4 grid grid-cols-2 gap-x-4 gap-y-1">
                          {selectedCaseDetail.itemList.map((item, index) => (
                            <div key={index} className="text-sm text-gray-700">• {item}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCaseDetail.additionalServices && selectedCaseDetail.additionalServices.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 font-medium block mb-2">追加サービス:</span>
                        <div className="ml-4 space-y-1">
                          {selectedCaseDetail.additionalServices.map((service, index) => (
                            <div key={index} className="text-sm text-gray-700">• {service}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCaseDetail.customAdditionalServices && (
                      <div>
                        <span className="text-sm text-gray-600 font-medium block mb-2">カスタムサービス:</span>
                        <div className="ml-4 text-sm text-gray-700">{selectedCaseDetail.customAdditionalServices}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 料金情報 */}
                {(selectedCaseDetail.estimatedPrice || selectedCaseDetail.priceTaxIncluded) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">💰 料金情報</h4>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2">
                      {selectedCaseDetail.estimatedPrice && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">見積金額:</span>
                          <span className="text-sm font-medium text-gray-900">
                            ¥{selectedCaseDetail.estimatedPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedCaseDetail.priceTaxIncluded && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">税込金額:</span>
                          <span className="text-sm font-bold text-green-900">
                            ¥{selectedCaseDetail.priceTaxIncluded.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedCaseDetail.paymentMethod && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">支払方法:</span>
                          <span className="text-sm text-gray-900">{selectedCaseDetail.paymentMethod}</span>
                        </div>
                      )}
                      {selectedCaseDetail.paymentStatus && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">支払状況:</span>
                          <span className="text-sm text-gray-900">{selectedCaseDetail.paymentStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 備考 */}
                {selectedCaseDetail.notes && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 備考</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCaseDetail.notes}</p>
                    </div>
                  </div>
                )}

                {/* その他の情報 */}
                {(selectedCaseDetail.sourceType || selectedCaseDetail.createdAt) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ その他の情報</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedCaseDetail.sourceType && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">依頼元:</span>
                          <span className="text-sm text-gray-900">{selectedCaseDetail.sourceType}</span>
                        </div>
                      )}
                      {selectedCaseDetail.createdAt && (
                        <div className="flex">
                          <span className="w-32 text-sm text-gray-600">登録日時:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(selectedCaseDetail.createdAt).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3 pt-4 border-t">
                  {(!selectedCaseDetail.truckAssignments || selectedCaseDetail.truckAssignments.length === 0) && onAssignTruck && (
                    <button
                      onClick={() => {
                        setShowCaseDetailModal(false);
                        onAssignTruck(selectedCaseDetail, trucks[0]);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      🚛 配車割当
                    </button>
                  )}
                  <button
                    onClick={() => setShowCaseDetailModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

             // 日ビュー - 新しいDayViewComponentを使用
           const DayView = () => {
             // トラックのスケジュールから案件データを生成
             const generateCases = (): CaseDetailType[] => {
               return trucks.flatMap(truck =>
                 truck.schedules
                   .filter(s => s.date === selectedDate && s.status === 'available')
                   .map(schedule => ({
                     id: schedule.id,
                     customerName: schedule.customerName || '予約済み',
                     customerPhone: schedule.customerPhone,
                     sourceType: 'manual' as const,
                     preferredDate: null,
                     confirmedDate: schedule.date,
                     arrivalAddress: schedule.destination || '未設定',
                     options: schedule.description ? [schedule.description] : [],
                     priceTaxIncluded: null,
                     truckId: truck.id,
                     truckName: truck.name,
                     assignedEmployees: schedule.employeeId ? [{ id: schedule.employeeId, name: '従業員名', role: 'staff' }] : [],
                     startTime: schedule.startTime,
                     endTime: schedule.endTime,
                     contractStatus: schedule.contractStatus || 'estimate'
                   }))
               );
             };

             return (
               <div>
                 {/* 日ビュー用のステータスフィルタ - 日ビューのみ表示 */}
                 <div className="mb-6">
                   <StatusFilter 
                     value={dayViewStatusFilter}
                     onChange={handleDayViewStatusFilterChange}
                   />
                 </div>
                 <DayViewComponent
                   selectedDate={selectedDate}
                   trucks={trucks}
                   cases={generateCases()}
                   onUpdateTruck={onUpdateTruck}
                   highlightedScheduleId={highlightedScheduleId}
                   onEditCase={handleEditCase}
                   statusFilter={dayViewStatusFilter}
                   formSubmissions={formSubmissions}
                   onAssignTruck={onAssignTruck}
                 />
               </div>
             );
           };





        




  return (
    <div className="space-y-2">
      {/* ビュー切り替えとナビゲーション */}
      <div className="bg-white rounded-lg shadow p-2">
        {/* ビューモード選択と案件ステータス */}
        <div className="flex items-center justify-between mb-2">
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
                setViewMode('day');
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              日
            </button>
          </div>
          
          {/* 案件ステータスフィルター */}
          {onStatusFilterChange && (
            <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
          )}
        </div>

        {/* 日ビュー用の凡例のみ表示 */}
        {viewMode === 'day' && (
          <div className="bg-gray-50 rounded p-2">
            <div className="flex items-center gap-6 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-700">50%未満</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-700">50%以上</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-700">80%以上</span>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* ビューモードに応じた表示 */}
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'day' && <DayView />}

      {/* スケジュールモーダル */}
      {showScheduleModal && <ScheduleModal />}
    </div>
  );
}