'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CaseDetail from '../CaseDetail';
import { CaseDetail as CaseDetailType } from '../../types/case';
import { Truck, Schedule } from '../../types/dispatch';
import PlaceLabels from './PlaceLabels';

interface DayViewProps {
  selectedDate: string;
  trucks: Truck[];
  cases: CaseDetailType[]; // 案件配列を追加
  onUpdateTruck: (truck: Truck) => void;
  onSelect?: (caseId: string) => void; // onScheduleClickをonSelectに変更
  highlightedScheduleId?: string | null;
  onEditCase?: (caseId: string) => void;
  statusFilter?: 'all' | 'confirmed' | 'estimate';
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
  onUpdateTruck, 
  onSelect,
  highlightedScheduleId,
  onEditCase,
  statusFilter = 'all'
}: DayViewProps) {
  const router = useRouter();
  const [displayTimeRange, setDisplayTimeRange] = useState<{ start: number; end: number }>({ start: 8, end: 20 });
  // 日ビューでは未使用: const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  // 日ビューでは未使用: const [showScheduleModal, setShowScheduleModal] = useState(false);
  // 日ビューでは未使用: const [prefillTime, setPrefillTime] = useState<{start?: string; end?: string}>({});

  // フィルタ適用後の案件配列
  const visibleCases = useMemo(() => {
    if (statusFilter === 'all') return cases;
    return cases.filter(c => c.contractStatus === statusFilter);
  }, [cases, statusFilter]);

  // フィルタ適用後のスケジュール配列
  const getFilteredSchedules = (truckSchedules: Schedule[]) => {
    if (statusFilter === 'all') return truckSchedules;
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

  // 指定された日付と時間のスケジュールを取得
  const getSchedulesForDateTime = (date: string, time: string) => {
    return trucks.flatMap(truck =>
      getFilteredSchedules(truck.schedules)
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

  // 重なり回避アルゴリズム：同一時間帯の最大同時案件数でカラム幅を算出
  const calculateOverlappingLayout = (schedules: Schedule[], truck: Truck): OverlappingSchedule[] => {
    if (schedules.length === 0) return [];

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
    
    timeGroups.forEach((groupSchedules, timeKey) => {
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
    if (percent >= 80) return 'bg-red-500';
    if (percent >= 50) return 'bg-yellow-500';
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

  // 住所の簡易表示を安全に処理
  const shortPrefMuni = (addr?: string) => {
    if (!addr) return '';
    const m = addr.match(/^(.*?[都道府県])\s*(.*?[市区町村])/);
    if (m) return `${m[1]}${m[2]}`;
    return addr.split(/[ \t　]/).slice(0,2).join('');
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
    <div className="bg-white rounded-lg shadow p-6" data-view="day">
      {/* 日付ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {new Date(selectedDate).getMonth() + 1}月{new Date(selectedDate).getDate()}日
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
      </div>

      {/* 表示期間選択 */}
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
            className="px-3 py-1 border rounded text-sm text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">～</span>
          <select
            value={displayTimeRange.end}
            onChange={(e) => setDisplayTimeRange({ ...displayTimeRange, end: parseInt(e.target.value) })}
            className="px-3 py-1 border rounded text-sm text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              i > displayTimeRange.start && (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
              )
            ))}
          </select>
          <button
            onClick={() => setDisplayTimeRange({ start: 8, end: 20 })}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 時間帯ヘッダー - 固定表示 */}
      <div className="grid grid-cols-[200px_1fr] gap-1 mb-2 sticky top-0 bg-white z-10">
        <div className="p-2 font-medium text-gray-600 bg-gray-50 border rounded">時間帯</div>
        <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
          {timeSlots.map(slot => (
            <div key={slot.time} className="p-2 text-center text-sm font-medium text-gray-600 border bg-gray-50 rounded">
              {slot.time}
            </div>
          ))}
        </div>
      </div>

      {/* 人数表示行 */}
      <div className="grid grid-cols-[200px_1fr] gap-1 mb-2">
        <div className="p-2 font-medium text-gray-600 bg-blue-50 border rounded text-center">
          <span className="text-sm">人数</span>
        </div>
        <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)` }}>
          {timeSlots.map(slot => {
            const personnelCount = getPersonnelCountForTimeSlot(slot);
            return (
              <div 
                key={`personnel-${slot.time}`} 
                className={`p-2 text-center text-sm font-medium border rounded ${
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
      <div className="overflow-y-auto max-h-[600px]">
        {trucks.map(truck => {
          // トラック全体の使用容量を計算
          const totalUsed = getFilteredSchedules(truck.schedules)
            .filter(s => s.date === selectedDate && s.status === 'available' && s.capacity)
            .reduce((sum, s) => sum + (s.capacity || 0), 0);
          const totalPercent = truck.capacityKg > 0 ? (totalUsed / truck.capacityKg) * 100 : 0;

          return (
            <div key={truck.id} className="grid grid-cols-[200px_1fr] gap-1 mb-1">
              {/* トラック情報 - 左側固定 */}
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
ポイント合計: ${getFilteredSchedules(truck.schedules)
                        .filter(s => s.date === selectedDate && s.status === 'available')
                        .reduce((sum, s) => sum + (s.points || 0), 0)}pt`}
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">{truck.name}</div>
                  <div className="text-xs text-gray-600">{truck.plateNumber}</div>
                  <div className="text-xs text-gray-500">{truck.capacityKg.toLocaleString()}kg</div>
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
                  const cellHeight = schedules.length > 1 ? 'h-20' : schedules.length === 1 ? 'h-16' : 'h-12';

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

                      {/* 重なり回避レイアウトでスケジュール表示 */}
                      {overlappingLayout.length > 0 && (
                        <div className="absolute inset-0 flex flex-col justify-start p-1 gap-1 ml-4">
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
                                  top: `${index * 20}px`,
                                  height: '18px',
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
                                <div className="text-xs text-gray-600 text-center leading-[18px] px-1">
                                  <PlaceLabels
                                    origin={schedule.origin || ''}
                                    destination={schedule.destination || ''}
                                    className="text-xs"
                                  />
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
                                <span title={`${schedule.customerName || '予約済み'} - 確定`} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">✅</span>
                              ) : schedule.contractStatus === 'estimate' ? (
                                <span title={`${schedule.customerName || '予約済み'} - 未確定`} className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">⏳</span>
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

      {/* 案件詳細（ステータスごとに色分け） */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">案件詳細</h4>
        <div className="space-y-3">
          {visibleCases
            .filter(c => c.confirmedDate === selectedDate)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((caseDetail, index) => {
              const isHighlighted = highlightedScheduleId === caseDetail.id;

              return (
                <div
                  key={caseDetail.id}
                  id={`case-${caseDetail.id}`}
                  data-case-id={caseDetail.id}
                  className={`scroll-mt-[var(--header-h,80px)] ${isHighlighted ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <CaseDetail
                    schedule={{
                      id: caseDetail.id,
                      date: caseDetail.confirmedDate || '',
                      startTime: caseDetail.startTime,
                      endTime: caseDetail.endTime,
                      status: 'available',
                      contractStatus: caseDetail.contractStatus,
                      customerName: caseDetail.customerName,
                      description: caseDetail.options?.join(', '),
                      capacity: 0,
                      points: 0,
                      origin: '', // 出発地は現在の型では利用不可
                      destination: caseDetail.arrivalAddress,
                      assignedEmployees: caseDetail.assignedEmployees || []
                    }}
                    truck={{
                      id: caseDetail.truckId || '',
                      name: caseDetail.truckName || '未割当',
                      plateNumber: '',
                      capacityKg: 0,
                      inspectionExpiry: '',
                      status: 'available',
                      truckType: ''
                    }}
                    isHighlighted={isHighlighted}
                    onEdit={() => {
                      // 直接編集画面に遷移
                      router.push(`/admin/cases/${caseDetail.id}/edit?from=dispatch-day&caseId=${caseDetail.id}`);
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* TODO: 新規作成モーダル - 空きセルクリック時に表示 */}
      {/* 日ビューでは案件詳細パネルは使用しない - 直接編集画面に遷移するため */}
    </div>
  );
}
