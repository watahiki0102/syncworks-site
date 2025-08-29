'use client';

import { toLocalDateString } from '@/utils/dateTimeUtils';
import { TIME_SLOTS, WEEKDAYS_JA } from '@/constants/calendar';
import { Truck, Schedule } from '@/types/shared';

interface TimeSlot {
  time: string;
  label: string;
  start: string;
  end: string;
}

interface GanttViewProps {
  trucks: Truck[];
  currentDate: Date;
  selectedDate: string;
  onCellClick: (date: string, timeSlot: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
  displayTimeRange: { start: number; end: number };
}

export default function GanttView({
  trucks,
  currentDate,
  selectedDate,
  onCellClick,
  onScheduleClick,
  displayTimeRange
}: GanttViewProps) {

  // 週の時間ブロックを生成
  const generateWeekTimeBlocks = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push({
        date: toLocalDateString(date),
        label: WEEKDAYS_JA[i],
        dayOfMonth: date.getDate()
      });
    }

    const timeSlots: TimeSlot[] = [];
    for (let hour = displayTimeRange.start; hour < displayTimeRange.end; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      timeSlots.push({
        time: `${start}-${end}`,
        label: `${hour}時`,
        start,
        end
      });
    }

    return { weekDays, timeSlots };
  };

  const handleCellClick = (date: string, timeSlot: string) => {
    const [start, end] = timeSlot.split('-');
    onCellClick(date, timeSlot);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    onScheduleClick(schedule);
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
    ];
    
    const hash = customerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // 苗字を抽出する関数
  const getLastName = (fullName: string | undefined) => {
    if (!fullName) return '未設定';
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || '未設定';
  };

  const weekTimeBlocks = generateWeekTimeBlocks();

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* ヘッダー */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-20 p-3 border-r border-gray-200 bg-gray-100">
              <div className="text-sm font-medium text-gray-600">時間</div>
            </div>
            {weekTimeBlocks.weekDays.map((day, index) => (
              <div key={day.date} className="flex-1 min-w-[100px] p-3 border-r border-gray-200 text-center">
                <div className={`text-sm font-medium ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.label}
                </div>
                <div className={`text-xs mt-1 ${
                  day.date === toLocalDateString(new Date()) ? 'text-blue-600 font-bold' : 'text-gray-600'
                }`}>
                  {day.dayOfMonth}日
                </div>
              </div>
            ))}
          </div>

          {/* タイムスロット */}
          <div className="divide-y divide-gray-200">
            {weekTimeBlocks.timeSlots.map((timeSlot) => (
              <div key={timeSlot.time} className="flex">
                <div className="w-20 p-2 border-r border-gray-200 bg-gray-50">
                  <div className="text-xs font-medium text-gray-600 text-center">
                    {timeSlot.label}
                  </div>
                </div>
                {weekTimeBlocks.weekDays.map((day) => {
                  const schedules = getBlockSchedules(day.date, timeSlot);
                  const isEmpty = schedules.length === 0;

                  return (
                    <div
                      key={`${day.date}-${timeSlot.time}`}
                      className={`flex-1 min-w-[100px] min-h-[60px] p-1 border-r border-gray-200 relative cursor-pointer transition-colors ${
                        isEmpty 
                          ? 'hover:bg-blue-50 hover:border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => isEmpty && handleCellClick(day.date, timeSlot.time)}
                    >
                      {schedules.length > 0 && (
                        <div className="h-full">
                          {schedules.slice(0, 4).map((schedule, scheduleIndex) => {
                            const backgroundColor = getCustomerColor(schedule.customerName || '');
                            
                            return (
                              <div
                                key={schedule.id}
                                className="mb-1 p-1 rounded text-xs border border-gray-300 hover:border-gray-400 cursor-pointer transition-all"
                                style={{ backgroundColor }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduleClick(schedule);
                                }}
                                title={`${schedule.customerName} (${schedule.truckName}) ${schedule.startTime}-${schedule.endTime}`}
                              >
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
                            );
                          })}
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
    </div>
  );
}