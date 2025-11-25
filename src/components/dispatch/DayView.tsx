'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CaseDetail as CaseDetailType } from '../../types/case';
import { Truck, Schedule } from '../../types/dispatch';
import PlaceLabels from './PlaceLabels';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  moveDate: string;
  preferredDate1?: string;
  preferredDate2?: string;
  preferredDate3?: string;
  moveTime1?: string;
  moveTime2?: string;
  moveTime3?: string;
  originAddress: string;
  destinationAddress: string;
  totalPoints: number;
  totalCapacity?: number;
  distance?: number;
  itemList?: string[];
  truckAssignments: Array<{
    truckId: string;
    scheduleId?: string;
    startTime?: string;
    endTime?: string;
  }>;
  contractStatus: 'estimate' | 'confirmed';
  estimatedPrice?: number;
  recommendedTruckTypes?: string[];
  additionalServices?: string[];
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  priceTaxIncluded?: number;
  sourceType?: string;
  createdAt?: string;
}

interface DayViewProps {
  selectedDate: string;
  trucks: Truck[];
  cases: CaseDetailType[]; // 案件配列を追加
  onUpdateTruck: (truck: Truck) => void;
  onSelect?: (caseId: string) => void; // onScheduleClickをonSelectに変更
  highlightedScheduleId?: string | null;
  onEditCase?: (caseId: string) => void;
  statusFilter?: 'all' | 'confirmed' | 'estimate';
  formSubmissions?: FormSubmission[]; // FormSubmissionデータを追加
  onAssignTruck?: (submission: FormSubmission, truck: Truck) => void; // トラック割当機能追加
}

interface TimeSlot {
  time: string;
  label: string;
  start: string;
  end: string;
}

interface OverlappingSchedule {
  schedule: Schedule;
  truck: Truck;
  caseId: string; // 案件IDを追加
  column: number;
  totalColumns: number;
}

export default function DayView({
  selectedDate,
  trucks,
  cases,
  onUpdateTruck: _onUpdateTruck,
  onSelect,
  highlightedScheduleId: _highlightedScheduleId,
  onEditCase: _onEditCase,
  statusFilter = 'all',
  formSubmissions = [],
  onAssignTruck
}: DayViewProps) {
  const router = useRouter();
  const ganttChartRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [displayTimeRange, setDisplayTimeRange] = useState<{ start: number; end: number }>({ start: 8, end: 20 });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'confirmed' | 'estimate' | 'unassigned'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailCase, setSelectedDetailCase] = useState<FormSubmission | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);
  // 日ビューでは未使用: const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  // 日ビューでは未使用: const [showScheduleModal, setShowScheduleModal] = useState(false);
  // 日ビューでは未使用: const [prefillTime, setPrefillTime] = useState<{start?: string; end?: string}>({});

  // ガントチャートの高さを監視して案件一覧の高さを合わせる
  useEffect(() => {
    const updateSidebarHeight = () => {
      if (ganttChartRef.current && sidebarVisible) {
        const ganttHeight = ganttChartRef.current.offsetHeight;
        setSidebarHeight(ganttHeight);
      }
    };

    updateSidebarHeight();
    window.addEventListener('resize', updateSidebarHeight);

    return () => window.removeEventListener('resize', updateSidebarHeight);
  }, [sidebarVisible, trucks, selectedDate]);

  // フィルタ適用後のスケジュール配列
  const getFilteredSchedules = (truckSchedules: Schedule[]) => {
    if (statusFilter === 'all') {
      return truckSchedules;
    }
    return truckSchedules.filter(s => s.contractStatus === statusFilter);
  };

  // URLハッシュから案件IDを取得
  useEffect(() => {
    // 初期表示時のスクロールを防ぐため、少し遅延させる
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash.startsWith('#case-')) {
        const caseId = hash.replace('#case-', '');

        // レイアウト確定後にスクロール
        requestAnimationFrame(() => {
          const el = document.getElementById(`case-${caseId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              const heading = el.querySelector<HTMLElement>('[data-case-heading]');
              if (heading) {
                heading.focus();
                
                // 既存ハイライトのクリア
                document.querySelectorAll('.__case-highlight').forEach(n => 
                  n.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400')
                );
                
                // カード全体にハイライトを付与
                el.classList.add('__case-highlight', 'ring-2', 'ring-blue-400');
                
                // 1.5秒後にハイライトを除去
                setTimeout(() => 
                  el.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400'), 
                  1500
                );
              }
            }, 180);
          } else {
            // ハッシュ対象が見つからない場合（フィルタで非表示になっている可能性）
            // 一時的に全件表示してスクロールを試行
            const originalFilter = statusFilter;
            if (originalFilter !== 'all') {
              // フィルタを一時的に 'all' に戻してスクロールを試行
              setTimeout(() => {
                const elRetry = document.getElementById(`case-${caseId}`);
                if (elRetry) {
                  elRetry.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setTimeout(() => {
                    const heading = elRetry.querySelector<HTMLElement>('[data-case-heading]');
                    if (heading) {
                      heading.focus();
                      
                      // 既存ハイライトをクリア
                      document.querySelectorAll('.__case-highlight').forEach(n => 
                        n.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400')
                      );
                      
                      // カード全体にハイライトを付与
                      elRetry.classList.add('__case-highlight', 'ring-2', 'ring-blue-400');
                      
                      // 1.5秒後にハイライトを除去
                      setTimeout(() => 
                        elRetry.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400'), 
                        1500
                      );
                    }
                  }, 180);
                }
              }, 100);
            }
          }
        });
      }
    }, 500); // 500ms遅延

    // クリーンアップ
    return () => clearTimeout(timer);
  }, [selectedDate, statusFilter]);

  // 表示時間範囲に基づいて時間スロットを生成
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = displayTimeRange.start; hour < displayTimeRange.end; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const nextHour = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        label: time,
        start: time,
        end: nextHour
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // 重なり回避アルゴリズム：同一時間帯の最大同時案件数でカラム幅を算出
  const calculateOverlappingLayout = (schedules: Schedule[], truck: Truck): OverlappingSchedule[] => {
    if (schedules.length === 0) {return [];}

    // 時間帯ごとにグループ化
    const timeGroups = new Map<string, Schedule[]>();
    
    schedules.forEach(schedule => {
      const timeKey = `${schedule.startTime}-${schedule.endTime}`;
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(schedule);
    });

    const result: OverlappingSchedule[] = [];

    timeGroups.forEach((groupSchedules, _timeKey) => {
      const totalColumns = groupSchedules.length;

      groupSchedules.forEach((schedule, index) => {
        result.push({
          schedule,
          truck,
          caseId: schedule.id, // 案件IDを追加
          column: index,
          totalColumns
        });
      });
    });

    return result;
  };

  // 容量バーの色を取得
  const getBarColor = (percent: number) => {
    if (percent >= 80) {
      return 'bg-red-500';
    }
    if (percent >= 50) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
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
    ];

    // 顧客名のハッシュ値で色を決定
    let hash = 0;
    for (let i = 0; i < customerName.length; i++) {
      hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // セルクリックハンドラー（空きセル用 - 新規作成モーダル）
  // 日ビューでは未使用 - 直接編集画面に遷移するため
  // const handleCellClick = (truck: Truck, time: string) => {
  //   // 日ビューでは新規作成モーダルは使用しない
  // };

  // 案件選択ハンドラー（スクロール処理）
  const handleCaseSelect = (caseId: string) => {
    if (onSelect) {
      onSelect(caseId);
    } else {
      // 同一画面内でスクロール
      const el = document.getElementById(`case-${caseId}`);
      if (el) {
        // レイアウト確定後に実行
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const heading = el.querySelector<HTMLElement>('[data-case-heading]');
            if (heading) {
              heading.focus();
              
              // 既存ハイライトのクリア
              document.querySelectorAll('.__case-highlight').forEach(n => 
                n.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400')
              );
              
              // カード全体にハイライトを付与
              el.classList.add('__case-highlight', 'ring-2', 'ring-blue-400');
              
              history.replaceState(null, '', `#case-${caseId}`);
              
              // 1.5秒後にハイライトを除去
              setTimeout(() => 
                el.classList.remove('__case-highlight', 'ring-2', 'ring-blue-400'), 
                1500
              );
            }
          }, 180);
        });
      }
    }
  };

  // 当日の合計対応件数を計算
  const getTotalSchedulesForDay = () => {
    return trucks.reduce((total, truck) => {
      const daySchedules = getFilteredSchedules(truck.schedules).filter(s =>
        s.date === selectedDate &&
        s.status === 'available'
      );
      return total + daySchedules.length;
    }, 0);
  };

  // トラック毎の対応件数を計算
  const getTruckSchedulesForDay = () => {
    return trucks.map(truck => {
      const daySchedules = getFilteredSchedules(truck.schedules).filter(s =>
        s.date === selectedDate &&
        s.status === 'available'
      );
      return {
        truckName: truck.name,
        count: daySchedules.length
      };
    }).filter(truck => truck.count > 0);
  };

  // 時間帯ごとの稼働人数を計算
  const getPersonnelCountForTimeSlot = (timeSlot: TimeSlot) => {
    const activeSchedules = trucks.flatMap(truck =>
      getFilteredSchedules(truck.schedules).filter(schedule =>
        schedule.date === selectedDate &&
        schedule.status === 'available' &&
        schedule.startTime <= timeSlot.time &&
        schedule.endTime > timeSlot.time
      )
    );

    // 各スケジュールの従業員数を合計（重複を除く）
    const uniquePersonnel = new Set<string>();
    activeSchedules.forEach(schedule => {
      // スケジュールに従業員IDが設定されている場合
      if (schedule.employeeId) {
        uniquePersonnel.add(schedule.employeeId);
      }
      // 案件データから従業員情報を取得
      const relatedCase = cases.find(c => c.id === schedule.id);
      if (relatedCase && relatedCase.assignedEmployees) {
        relatedCase.assignedEmployees.forEach(emp => {
          if (emp.id) {
            uniquePersonnel.add(emp.id);
          }
        });
      }
    });

    return uniquePersonnel.size;
  };

  return (
    <div className="flex gap-4 items-start" data-view="day">
      {/* 左側: カレンダー表示 */}
      <div ref={ganttChartRef} className="flex-1 bg-white rounded-lg shadow overflow-x-auto">
        <div className="w-full p-2 md:p-3" style={{ minWidth: '900px', maxWidth: 'min(1800px, 100%)' }}>
          {/* 日付ヘッダー */}
          <div className="flex justify-between items-start mb-2 md:mb-3 sticky top-0 bg-white z-20 pb-2">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">
                {new Date(selectedDate).getMonth() + 1}月{new Date(selectedDate).getDate()}日
              </h3>
              <div className="mt-1">
                <p className="text-xs font-medium text-gray-700 mb-0.5">
                  総計対応件数: {getTotalSchedulesForDay()}件
                </p>
                {getTruckSchedulesForDay().length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getTruckSchedulesForDay().map((truck, index) => (
                      <span key={index} className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {truck.truckName}: {truck.count}件
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

      {/* 表示期間選択 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-700">表示期間:</span>
        <div className="flex items-center gap-1">
          <select
            value={displayTimeRange.start}
            onChange={(e) => {
              const newStart = parseInt(e.target.value);
              setDisplayTimeRange({
                start: newStart,
                end: Math.max(newStart + 1, displayTimeRange.end)
              });
            }}
            className="px-2 py-0.5 border rounded text-xs text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">～</span>
          <select
            value={displayTimeRange.end}
            onChange={(e) => setDisplayTimeRange({ ...displayTimeRange, end: parseInt(e.target.value) })}
            className="px-2 py-0.5 border rounded text-xs text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              i > displayTimeRange.start && (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
              )
            ))}
          </select>
          <button
            onClick={() => setDisplayTimeRange({ start: 8, end: 20 })}
            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 時間帯ヘッダー - 固定表示 */}
      <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-1 mb-1 sticky top-0 bg-white z-10">
        <div className="p-0.5 md:p-1 font-medium text-gray-600 bg-gray-50 border rounded text-xs">時間帯</div>
        <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
          {timeSlots.map(slot => (
            <div key={slot.time} className="p-0.5 md:p-1 text-center text-[10px] md:text-xs font-medium text-gray-600 border bg-gray-50 rounded">
              {slot.time}
            </div>
          ))}
        </div>
      </div>

      {/* 人数表示行 */}
      <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-1 mb-1">
        <div className="p-0.5 md:p-1 font-medium text-gray-600 bg-blue-50 border rounded text-center">
          <span className="text-xs">人数</span>
        </div>
        <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
          {timeSlots.map(slot => {
            const personnelCount = getPersonnelCountForTimeSlot(slot);
            return (
              <div
                key={`personnel-${slot.time}`}
                className={`p-0.5 md:p-1 text-center text-[10px] md:text-xs font-medium border rounded ${
                  personnelCount > 0
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
                title={`${slot.time}の稼働人数: ${personnelCount}人`}
              >
                {personnelCount > 0 ? `${personnelCount}人` : '-'}
              </div>
            );
          })}
        </div>
      </div>

      {/* トラック行 - スクロール対応 */}
      <div className="overflow-y-auto max-h-[350px] md:max-h-[450px]">
        {trucks.map(truck => {
          // トラック全体の使用容量を計算
          const totalUsed = getFilteredSchedules(truck.schedules)
            .filter(s => s.date === selectedDate && s.status === 'available' && s.capacity)
            .reduce((sum, s) => sum + (s.capacity || 0), 0);
          const totalPercent = truck.capacityKg > 0 ? (totalUsed / truck.capacityKg) * 100 : 0;

          return (
            <div key={truck.id} className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-1 mb-1">
              {/* トラック情報 - 左側固定 */}
              <div className="p-1.5 md:p-2 border bg-gray-50 rounded relative">
                {/* トラック情報左側の容量バー */}
                <div className="absolute left-0.5 md:left-1 top-0.5 md:top-1 bottom-0.5 md:bottom-1 w-1.5 md:w-2 bg-gray-300 rounded border border-gray-400">
                  <div
                    className={`rounded transition-all duration-200 ${getBarColor(totalPercent)}`}
                    style={{
                      height: `${Math.min(totalPercent, 100)}%`,
                      width: '100%',
                      minHeight: totalPercent > 0 ? '3px' : '0px',
                      position: 'absolute',
                      bottom: '0'
                    }}
                    title={`重さ合計: ${totalUsed}kg / ${truck.capacityKg}kg (${totalPercent.toFixed(1)}%)
ポイント合計: ${getFilteredSchedules(truck.schedules)
                        .filter(s => s.date === selectedDate && s.status === 'available')
                        .reduce((sum, s) => sum + (s.points || 0), 0)}pt`}
                  />
                </div>
                <div className="ml-2 md:ml-3">
                  <div className="font-medium text-[10px] md:text-xs text-gray-900 truncate">{truck.name}</div>
                  <div className="text-[9px] md:text-[10px] text-gray-600 truncate">{truck.plateNumber}</div>
                  <div className="text-[9px] md:text-[10px] text-gray-500">{truck.capacityKg.toLocaleString()}kg</div>
                </div>
              </div>

              {/* 時間ブロック - 重なり回避レイアウト */}
              <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
                {timeSlots.map(slot => {
                  // そのトラックのその時間帯のスケジュール
                  const schedules = getFilteredSchedules(truck.schedules).filter(s =>
                    s.date === selectedDate &&
                    s.startTime <= slot.time &&
                    s.endTime > slot.time
                  );

                  // 重なり回避レイアウトを計算
                  const overlappingLayout = calculateOverlappingLayout(schedules, truck);

                  // そのトラックのその時間帯の予約済み容量合計
                  const used = schedules.reduce((sum, s) => sum + (s.capacity || 0), 0);
                  const percent = truck.capacityKg > 0 ? (used / truck.capacityKg) * 100 : 0;

                  // スケジュール数に応じて高さを調整
                  const cellHeight = schedules.length > 1 ? 'h-14 md:h-16' : schedules.length === 1 ? 'h-10 md:h-12' : 'h-8 md:h-10';

                  return (
                    <div
                      key={slot.time}
                      className={`${cellHeight} border transition-opacity relative ${
                        schedules.length > 0 ? 'cursor-pointer hover:opacity-80' : 'bg-gray-50'
                      }`}
                      onClick={schedules.length > 0 ? () => {
                        // スケジュールがある場合のみ案件選択
                        if (schedules.length === 1) {
                          handleCaseSelect(schedules[0].id);
                        }
                      } : undefined}
                      title={schedules.length > 0 ?
                        `${schedules.length}件のスケジュール
重さ合計: ${used}kg / ${truck.capacityKg}kg (${percent.toFixed(1)}%)
ポイント合計: ${schedules.reduce((sum, s) => sum + (s.points || 0), 0)}pt` :
                        `${selectedDate} ${slot.time} - 空き`
                      }
                    >
                      {/* トラック毎の縦軸容量バー */}
                      <div className="absolute left-0.5 top-0.5 bottom-0.5 w-2 bg-gray-300 rounded z-10 border border-gray-400">
                        <div
                          className={`rounded transition-all duration-200 ${getBarColor(percent)}`}
                          style={{
                            height: `${Math.min(percent, 100)}%`,
                            width: '100%',
                            minHeight: percent > 0 ? '3px' : '0px',
                            position: 'absolute',
                            bottom: '0'
                          }}
                          title={`重さ合計: ${used}kg / ${truck.capacityKg}kg (${percent.toFixed(1)}%)
ポイント合計: ${schedules.reduce((sum, s) => sum + (s.points || 0), 0)}pt`}
                        />
                      </div>

                      {/* 重なり回避レイアウトでスケジュール表示 */}
                      {overlappingLayout.length > 0 && (
                        <div className="absolute inset-0 flex flex-col justify-start p-0.5 gap-0.5 ml-3">
                          {overlappingLayout.map(({ schedule, column, totalColumns, caseId }, index) => {
                            // 顧客ごとの色を取得
                            const customerColor = schedule.customerName ?
                              getCustomerColor(schedule.customerName) :
                              '#f3f4f6';

                            // 重なり回避のための位置と幅を計算
                            const leftPercent = (column / totalColumns) * 100;
                            const widthPercent = 100 / totalColumns;

                            return (
                              <div
                                key={`${schedule.id}-${index}`}
                                role="button"
                                tabIndex={0}
                                className="rounded border cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm"
                                style={{
                                  backgroundColor: customerColor,
                                  left: `${leftPercent}%`,
                                  width: `calc(${widthPercent}% - 2px)`,
                                  maxWidth: `calc(${widthPercent}% - 2px)`,
                                  position: 'absolute',
                                  top: `${index * 14}px`,
                                  height: '14px',
                                  zIndex: index + 1
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCaseSelect(caseId);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCaseSelect(caseId);
                                  }
                                }}
                                title={`${schedule.customerName || '予約済み'} ${schedule.contractStatus === 'confirmed' ? '(確定)' : '(未確定)'} ${schedule.startTime}-${schedule.endTime} ${schedule.capacity ? `(${schedule.capacity}kg)` : ''} ${schedule.points ? `(${schedule.points}pt)` : ''}`}
                              >
                                <div className="text-[10px] text-gray-600 text-center leading-[14px] px-0.5">
                                  <PlaceLabels
                                    origin={schedule.origin || ''}
                                    destination={schedule.destination || ''}
                                    className="text-[10px]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 時間帯の契約ステータス表示 */}
                      {schedules.length > 0 && (
                        <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5">
                          {schedules.map((schedule, _index) => (
                            <div key={`status-${schedule.id}`} className="flex items-center gap-0.5">
                              {schedule.contractStatus === 'confirmed' ? (
                                <span title={`${schedule.customerName || '予約済み'} - 確定`} className="text-[10px] bg-green-100 text-green-800 px-0.5 py-0 rounded">✅</span>
                              ) : schedule.contractStatus === 'estimate' ? (
                                <span title={`${schedule.customerName || '予約済み'} - 未確定`} className="text-[10px] bg-orange-100 text-orange-800 px-0.5 py-0 rounded">⏳</span>
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
        </div>

          {/* TODO: 新規作成モーダル - 空きセルクリック時に表示 */}
          {/* 日ビューでは案件詳細パネルは使用しない - 直接編集画面に遷移するため */}
        </div>
      </div>

      {/* 右側: 案件一覧サイドバー */}
      {sidebarVisible && (
        <div
          ref={sidebarRef}
          className="w-96 bg-white rounded-lg shadow overflow-hidden flex flex-col"
          style={{ height: sidebarHeight ? `${sidebarHeight}px` : 'auto' }}
        >
          {/* ヘッダー */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-gray-900">案件一覧</h4>
              <button
                onClick={() => setSidebarVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* フィルター */}
            <div className="flex items-center gap-2">
              <select
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value as 'all' | 'confirmed' | 'estimate' | 'unassigned')}
                className="flex-1 px-2 py-1 border rounded text-xs"
              >
                <option value="all">全て</option>
                <option value="confirmed">確定のみ</option>
                <option value="estimate">未確定のみ</option>
                <option value="unassigned">未配車のみ</option>
              </select>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {formSubmissions.filter(s => s.moveDate === selectedDate).length}件
              </span>
            </div>
          </div>

          {/* 案件リスト */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-3">
              {formSubmissions
                .filter(submission => {
                  if (submission.moveDate !== selectedDate) {
                    return false;
                  }

                  const isUnassigned = !submission.truckAssignments || submission.truckAssignments.length === 0;

                  if (sidebarFilter === 'all') {
                    return true;
                  }
                  if (sidebarFilter === 'confirmed') {
                    return submission.contractStatus === 'confirmed';
                  }
                  if (sidebarFilter === 'estimate') {
                    return submission.contractStatus === 'estimate';
                  }
                  if (sidebarFilter === 'unassigned') {
                    return isUnassigned;
                  }

                  return true;
                })
                .sort((a, b) => (a.moveTime1 || '').localeCompare(b.moveTime1 || ''))
                .map((submission) => {
                  const isConfirmed = submission.contractStatus === 'confirmed';
                  const isUnassigned = !submission.truckAssignments || submission.truckAssignments.length === 0;
                  const bgColor = isConfirmed ? 'bg-green-100' : 'bg-gray-100';
                  const borderColor = isConfirmed ? 'border-green-200' : 'border-gray-200';
                  const textColor = isConfirmed ? 'text-green-800' : 'text-gray-700';

                  // truckAssignmentsから車両名を取得
                  const assignedTruckName = submission.truckAssignments && submission.truckAssignments.length > 0
                    ? trucks.find(t => t.id === submission.truckAssignments[0].truckId)?.name || '車両未設定'
                    : null;

                  return (
                    <div
                      key={submission.id}
                      className={`relative p-3 rounded border ${bgColor} ${textColor} ${borderColor}`}
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
                              発：{submission.originAddress.match(/^(.*?[都道府県])(.*?[市区町村])/)?.[0] || submission.originAddress.substring(0, 10)}
                            </span>
                          )}
                        </div>
                        {/* 2行目: 時間と着地 */}
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
                              着：{submission.destinationAddress.match(/^(.*?[都道府県])(.*?[市区町村])/)?.[0] || submission.destinationAddress.substring(0, 10)}
                            </span>
                          )}
                        </div>
                        {/* 3行目: 車両情報と配車ボタン */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isUnassigned ? (
                              <>
                                <span className="text-xs text-red-600 font-medium">未配車</span>
                                {onAssignTruck && trucks.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAssignTruck(submission, trucks[0]);
                                    }}
                                    className="bg-red-600 text-white rounded hover:bg-red-700"
                                    style={{ padding: '2px 6px', fontSize: '9px', lineHeight: '1.2', height: '16px', minHeight: '16px', maxHeight: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', gap: '3px' }}
                                  >
                                    <span>🚚</span>
                                    <span>配車</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs text-gray-700 font-medium">
                                  🚚 {assignedTruckName}
                                </span>
                                {onAssignTruck && trucks.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAssignTruck(submission, trucks[0]);
                                    }}
                                    className="bg-gray-600 text-white rounded hover:bg-gray-700"
                                    style={{ padding: '2px 6px', fontSize: '9px', lineHeight: '1.2', height: '16px', minHeight: '16px', maxHeight: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', gap: '3px' }}
                                  >
                                    <span>🔄</span>
                                    <span>変更</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailCase(submission);
                                setShowDetailModal(true);
                              }}
                              className="bg-blue-600 text-white rounded hover:bg-blue-700"
                              style={{ padding: '2px 8px', fontSize: '10px', lineHeight: '1.2', height: '18px', minHeight: '18px', maxHeight: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0', borderWidth: '0', outline: '0', outlineWidth: '0', boxShadow: 'none', boxSizing: 'border-box', minWidth: '40px' }}
                            >
                              詳細
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/cases/${submission.id}/edit?from=dispatch-day&caseId=${submission.id}`);
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
                })}
            </div>
          </div>
        </div>
      )}

      {/* サイドバーを閉じている場合の表示ボタン */}
      {!sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="fixed right-4 px-3 py-2 bg-blue-600 text-white rounded-l-lg shadow-lg hover:bg-blue-700 z-10"
          style={{ writingMode: 'vertical-rl', top: '120px' }}
        >
          案件一覧
        </button>
      )}

      {/* 詳細モーダル */}
      {showDetailModal && selectedDetailCase && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
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
                      selectedDetailCase.contractStatus === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDetailCase.contractStatus === 'confirmed' ? '確定' : '未確定'}
                    </span>
                    {(!selectedDetailCase.truckAssignments || selectedDetailCase.truckAssignments.length === 0) && (
                      <span className="text-sm px-3 py-1 rounded bg-yellow-100 text-yellow-800">
                        未割当
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
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
                    <span className="text-sm font-medium text-gray-900">{selectedDetailCase.customerName}</span>
                  </div>
                  {selectedDetailCase.customerPhone && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">電話番号:</span>
                      <span className="text-sm text-gray-900">{selectedDetailCase.customerPhone}</span>
                    </div>
                  )}
                  {selectedDetailCase.customerEmail && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">メール:</span>
                      <span className="text-sm text-gray-900">{selectedDetailCase.customerEmail}</span>
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
                    <span className="text-sm font-medium text-blue-900">{selectedDetailCase.moveDate}</span>
                  </div>
                  {(selectedDetailCase.preferredDate1 || selectedDetailCase.preferredDate2 || selectedDetailCase.preferredDate3) && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-2">希望日</div>
                      {selectedDetailCase.preferredDate1 && (
                        <div className="flex ml-4 mb-1">
                          <span className="w-28 text-sm text-blue-600">第一希望:</span>
                          <span className="text-sm text-gray-900">
                            {selectedDetailCase.preferredDate1}
                            {selectedDetailCase.moveTime1 && ` (${selectedDetailCase.moveTime1})`}
                          </span>
                        </div>
                      )}
                      {selectedDetailCase.preferredDate2 && (
                        <div className="flex ml-4 mb-1">
                          <span className="w-28 text-sm text-blue-600">第二希望:</span>
                          <span className="text-sm text-gray-900">
                            {selectedDetailCase.preferredDate2}
                            {selectedDetailCase.moveTime2 && ` (${selectedDetailCase.moveTime2})`}
                          </span>
                        </div>
                      )}
                      {selectedDetailCase.preferredDate3 && (
                        <div className="flex ml-4">
                          <span className="w-28 text-sm text-blue-600">第三希望:</span>
                          <span className="text-sm text-gray-900">
                            {selectedDetailCase.preferredDate3}
                            {selectedDetailCase.moveTime3 && ` (${selectedDetailCase.moveTime3})`}
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
                    <p className="text-sm text-gray-900 mt-1 ml-4">{selectedDetailCase.originAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-red-600">着地:</span>
                    <p className="text-sm text-gray-900 mt-1 ml-4">{selectedDetailCase.destinationAddress}</p>
                  </div>
                </div>
              </div>

              {/* 荷物・作業情報 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📦 荷物・作業情報</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-600">荷物ポイント:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedDetailCase.totalPoints} pt</span>
                  </div>
                  {selectedDetailCase.totalCapacity && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">総容量:</span>
                      <span className="text-sm text-gray-900">{selectedDetailCase.totalCapacity} kg</span>
                    </div>
                  )}
                  {selectedDetailCase.distance && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">移動距離:</span>
                      <span className="text-sm text-gray-900">{selectedDetailCase.distance} km</span>
                    </div>
                  )}
                  {selectedDetailCase.recommendedTruckTypes && selectedDetailCase.recommendedTruckTypes.length > 0 && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-600">推奨トラック:</span>
                      <span className="text-sm text-blue-600">{selectedDetailCase.recommendedTruckTypes.join(', ')}</span>
                    </div>
                  )}
                  {selectedDetailCase.itemList && selectedDetailCase.itemList.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">荷物リスト:</span>
                      <ul className="list-disc list-inside text-sm text-gray-900 ml-4">
                        {selectedDetailCase.itemList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedDetailCase.additionalServices && selectedDetailCase.additionalServices.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">追加サービス:</span>
                      <ul className="list-disc list-inside text-sm text-gray-900 ml-4">
                        {selectedDetailCase.additionalServices.map((service, idx) => (
                          <li key={idx}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 料金情報 */}
              {(selectedDetailCase.estimatedPrice || selectedDetailCase.priceTaxIncluded) && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">💰 料金情報</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedDetailCase.estimatedPrice && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">見積金額:</span>
                        <span className="text-sm font-medium text-gray-900">¥{selectedDetailCase.estimatedPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDetailCase.priceTaxIncluded && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">税込金額:</span>
                        <span className="text-sm font-medium text-gray-900">¥{selectedDetailCase.priceTaxIncluded.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDetailCase.paymentMethod && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">支払方法:</span>
                        <span className="text-sm text-gray-900">{selectedDetailCase.paymentMethod}</span>
                      </div>
                    )}
                    {selectedDetailCase.paymentStatus && (
                      <div className="flex">
                        <span className="w-32 text-sm text-gray-600">支払状況:</span>
                        <span className="text-sm text-gray-900">{selectedDetailCase.paymentStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 備考 */}
              {selectedDetailCase.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 備考</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDetailCase.notes}</p>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    router.push(`/admin/cases/${selectedDetailCase.id}/edit?from=dispatch-day&caseId=${selectedDetailCase.id}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  編集画面へ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
