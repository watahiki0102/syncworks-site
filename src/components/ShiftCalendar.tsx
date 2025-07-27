'use client';

import { useState, useEffect } from 'react';
import { formatDate, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA, TIME_SLOTS, SHIFT_STATUS } from '@/constants/calendar';

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  shifts: EmployeeShift[];
}

interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'booked' | 'unavailable' | 'overtime' | 'provisional' | 'available';
  truckScheduleId?: string;
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance' | 'break' | 'other';
  notes?: string;
}

interface ShiftCalendarProps {
  employees: Employee[];
  truckSchedules: any[];
  onUpdateShift: (employeeId: string, shift: EmployeeShift) => void;
  onAddShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  onDeleteShift: (employeeId: string, shiftId: string) => void;
  onUpdateTruckSchedules: (schedules: any[]) => void;
}

type ViewMode = 'week' | 'month';

const WORK_TYPES = {
  loading: { label: '積込', color: 'bg-blue-500', icon: '📦' },
  moving: { label: '移動', color: 'bg-green-500', icon: '🚚' },
  unloading: { label: '積下ろし', color: 'bg-purple-500', icon: '📥' },
  maintenance: { label: '整備', color: 'bg-orange-500', icon: '🔧' },
  break: { label: '休憩', color: 'bg-gray-400', icon: '☕' },
  other: { label: 'その他', color: 'bg-gray-500', icon: '📝' },
} as const;

export default function ShiftCalendar({
  employees,
  truckSchedules,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
}: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [colorByEmployee, setColorByEmployee] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [editingShift, setEditingShift] = useState<{
    employeeId: string;
    date: string;
    timeSlot: string;
    workType: string;
    customerName: string;
    notes: string;
  } | null>(null);
  const filteredEmployees = employees.filter(emp =>
    emp.status === 'active' &&
    emp.name.toLowerCase().includes(employeeFilter.toLowerCase())
  );
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startEmployee: string;
    startDate: string;
    startTime: string;
    currentEmployee: string;
    currentDate: string;
    currentTime: string;
  } | null>(null);

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
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      });
    }
    return days;
  };

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
        date: toLocalDateString(prevDate),
        day: prevDate.getDate(),
        dayOfWeek: WEEKDAYS_JA[prevDate.getDay()],
        isCurrentMonth: false,
        isToday: prevDate.toDateString() === new Date().toDateString(),
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
      });
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: toLocalDateString(currentDate),
        day: day,
        dayOfWeek: WEEKDAYS_JA[currentDate.getDay()],
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
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
        isCurrentMonth: false,
        isToday: nextDate.toDateString() === new Date().toDateString(),
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
      });
    }

    return days;
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);

  const getShiftForDateTime = (employeeId: string, date: string, timeSlot: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;
    
    return employee.shifts.find(shift => 
      shift.date === date && shift.timeSlot === timeSlot
    );
  };

  const getTruckScheduleForDateTime = (date: string, timeSlot: string) => {
    const timeSlotInfo = TIME_SLOTS.find(ts => ts.id === timeSlot);
    if (!timeSlotInfo) return null;

    return truckSchedules.find((schedule: any) => 
      schedule.date === date &&
      schedule.startTime < timeSlotInfo.end &&
      schedule.endTime > timeSlotInfo.start
    );
  };

  const isOverwork = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return false;
    
    const dayShifts = employee.shifts.filter(shift => 
      shift.date === date && 
      (shift.status === 'confirmed' || shift.status === 'booked')
    );
    
    return dayShifts.length > 8; // 8時間超でオーバーワーク
  };

  const isBreakTime = (timeSlot: string) => {
    return timeSlot === '12:00'; // 12:00-13:00を休憩時間として設定
  };

  const getEmployeeColor = (employeeId: string) => {
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-yellow-100 border-yellow-300',
      'bg-purple-100 border-purple-300',
      'bg-pink-100 border-pink-300',
      'bg-indigo-100 border-indigo-300',
    ];
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    return colors[employeeIndex % colors.length];
  };

  const getShiftBlock = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;

    const dayShifts = employee.shifts.filter(shift => 
      shift.date === date && 
      (shift.status === 'confirmed' || shift.status === 'booked')
    );

    if (dayShifts.length === 0) return null;

    // 連続した時間枠をグループ化
    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });

    const timeSlots = sortedShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
    if (timeSlots.length === 0) return null;

    const startTime = timeSlots[0]?.start || '';
    const endTime = timeSlots[timeSlots.length - 1]?.end || '';
    const workTypes = [...new Set(sortedShifts.map(s => s.workType).filter(Boolean))];
    const customers = [...new Set(sortedShifts.map(s => s.customerName).filter(Boolean))];

    return {
      startTime,
      endTime,
      duration: timeSlots.length,
      workTypes,
      customers,
      shifts: sortedShifts,
    };
  };

  const handleCellClick = (employeeId: string, date: string, timeSlot: string) => {
    const existingShift = getShiftForDateTime(employeeId, date, timeSlot);
    const truckSchedule = getTruckScheduleForDateTime(date, timeSlot);
    
    // 配車済みの場合は編集不可
    if (truckSchedule) {
      alert('この時間帯は配車済みのため編集できません');
      return;
    }

    if (existingShift) {
      // 既存シフトを編集モーダルで開く
      setEditingShift({
        employeeId,
        date,
        timeSlot,
        workType: existingShift.workType || 'other',
        customerName: existingShift.customerName || '',
        notes: existingShift.notes || '',
      });
      setSelectedShift(existingShift);
    } else {
      // 新規シフト作成モーダル
      setEditingShift({
        employeeId,
        date,
        timeSlot,
        workType: isBreakTime(timeSlot) ? 'break' : 'other',
        customerName: '',
        notes: '',
      });
      setSelectedShift(null);
    }
    setShowShiftModal(true);
  };

  const handleMouseDown = (employeeId: string, date: string, timeSlot: string) => {
    setDragState({
      isDragging: true,
      startEmployee: employeeId,
      startDate: date,
      startTime: timeSlot,
      currentEmployee: employeeId,
      currentDate: date,
      currentTime: timeSlot,
    });
  };

  const handleMouseEnter = (employeeId: string, date: string, timeSlot: string) => {
    if (dragState?.isDragging) {
      setDragState(prev => prev ? {
        ...prev,
        currentEmployee: employeeId,
        currentDate: date,
        currentTime: timeSlot,
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (dragState?.isDragging) {
      // ドラッグ範囲内のシフトを一括作成
      const startIndex = TIME_SLOTS.findIndex(ts => ts.id === dragState.startTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.id === dragState.currentTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const startIdx = Math.min(startIndex, endIndex);
        const endIdx = Math.max(startIndex, endIndex);
        
        for (let i = startIdx; i <= endIdx; i++) {
          const timeSlot = TIME_SLOTS[i];
          const existingShift = getShiftForDateTime(dragState.currentEmployee, dragState.currentDate, timeSlot.id);
          
          if (!existingShift) {
                         const newShift = {
               employeeId: dragState.currentEmployee,
               date: dragState.currentDate,
               timeSlot: timeSlot.id,
               status: 'confirmed' as const,
               workType: (isBreakTime(timeSlot.id) ? 'break' : 'other') as 'loading' | 'moving' | 'unloading' | 'maintenance' | 'break' | 'other',
               customerName: '',
               notes: '',
             };
            onAddShift(dragState.currentEmployee, newShift);
          }
        }
      }
    }
    setDragState(null);
  };

  const handleShiftSave = () => {
    if (!editingShift) return;

    const newShift = {
      employeeId: editingShift.employeeId,
      date: editingShift.date,
      timeSlot: editingShift.timeSlot,
      status: 'confirmed' as const,
      workType: editingShift.workType as any,
      customerName: editingShift.customerName,
      notes: editingShift.notes,
    };

    if (selectedShift) {
      // 既存シフトを更新
      onUpdateShift(editingShift.employeeId, {
        ...selectedShift,
        workType: editingShift.workType as any,
        customerName: editingShift.customerName,
        notes: editingShift.notes,
      });
    } else {
      // 新規シフトを追加
      onAddShift(editingShift.employeeId, newShift);
    }

    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  const handleShiftDelete = () => {
    if (!selectedShift) return;
    onDeleteShift(selectedShift.employeeId, selectedShift.id);
    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(toLocalDateString(today));
  };

  const copyPreviousWeek = () => {
    const previousWeekStart = new Date(currentDate);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    employees.forEach(employee => {
      if (employee.status === 'active') {
        // 前週のシフトを取得
        const previousWeekShifts = employee.shifts.filter(shift => {
          const shiftDate = new Date(shift.date);
          const weekStart = new Date(previousWeekStart);
          const weekEnd = new Date(previousWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        });

        // 今週にコピー
        previousWeekShifts.forEach(shift => {
          const newDate = new Date(shift.date);
          newDate.setDate(newDate.getDate() + 7);
          const newShift = {
            ...shift,
            date: toLocalDateString(newDate),
            status: 'provisional' as const,
          };
          onAddShift(employee.id, newShift);
        });
      }
    });
  };

  // 週ビュー
  const WeekView = () => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <div className="min-w-[1600px]">
            {/* ヘッダー行 */}
            <div className="grid grid-cols-[250px_repeat(7,1fr)] gap-px bg-gray-200 sticky top-0 z-20">
              <div className="p-4 bg-gray-50 font-medium text-gray-900 sticky left-0 z-20">従業員</div>
              {weekDays.map(day => (
                <div
                  key={day.date}
                  className={`p-3 text-center bg-gray-50 ${day.isWeekend ? 'bg-gray-100' : ''}`}
                >
                  <div className={`font-medium text-lg ${day.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day.dayOfWeek}
                  </div>
                  <div className={`text-sm ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>

            {/* 時間帯ヘッダー */}
            <div className="grid grid-cols-[250px_repeat(7,1fr)] gap-px bg-gray-200 sticky top-14 z-10">
              <div className="p-2 bg-gray-50 font-medium text-gray-600 sticky left-0 z-20">時間帯</div>
              {weekDays.map(day => (
                <div key={day.date} className={`grid grid-cols-[repeat(13,1fr)] gap-px ${day.isWeekend ? 'bg-gray-100' : ''}`}>
                  {TIME_SLOTS.map(slot => (
                    <div
                      key={slot.id}
                      className={`p-1 text-xs text-center text-gray-500 border bg-gray-50 ${
                        isBreakTime(slot.id) ? 'bg-gray-200' : ''
                      }`}
                      title={isBreakTime(slot.id) ? '休憩時間' : slot.label}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 従業員行 */}
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="grid grid-cols-[250px_repeat(7,1fr)] gap-px bg-gray-200">
                {/* 従業員情報 */}
                <div className={`p-4 border ${colorByEmployee ? getEmployeeColor(employee.id) : 'bg-white'} sticky left-0 z-10 bg-white`}>
                  <div className="font-medium text-lg text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-600">{employee.position}</div>
                  {isOverwork(employee.id, weekDays[0].date) && (
                    <div className="text-xs text-red-600 font-medium mt-1">⚠️ オーバーワーク</div>
                  )}
                </div>

                {/* 各日のシフト */}
                {weekDays.map(day => (
                  <div key={day.date} className={`grid grid-cols-[repeat(13,1fr)] gap-px ${day.isWeekend ? 'bg-gray-100' : ''}`}
                  >
                    {TIME_SLOTS.map(slot => {
                      const shift = getShiftForDateTime(employee.id, day.date, slot.id);
                      const truckSchedule = getTruckScheduleForDateTime(day.date, slot.id);
                      const isOverworkDay = isOverwork(employee.id, day.date);
                      const isBreak = isBreakTime(slot.id);
                      
                      let cellClass = 'h-16 border cursor-pointer hover:opacity-80 transition-opacity relative group';
                      let tooltipText = `${day.date} ${slot.label} - 空き`;

                      if (shift) {
                        const statusColor = SHIFT_STATUS[shift.status].color.replace('text-', 'bg-').replace('-800', '-200');
                        cellClass += ` ${statusColor}`;
                        tooltipText = `${SHIFT_STATUS[shift.status].label}`;
                        if (shift.workType && shift.workType !== 'other') {
                          tooltipText += ` - ${WORK_TYPES[shift.workType].label}`;
                        }
                        if (shift.customerName) {
                          tooltipText += ` - ${shift.customerName}`;
                        }
                        if (shift.notes) {
                          tooltipText += ` - ${shift.notes}`;
                        }
                      } else if (isBreak) {
                        cellClass += ' bg-gray-200';
                        tooltipText = '休憩時間';
                      } else {
                        cellClass += ' bg-gray-50';
                      }

                      if (isOverworkDay) {
                        cellClass += ' border-red-300';
                      }
                      
                      return (
                        <div
                          key={slot.id}
                          className={cellClass}
                          onClick={() => handleCellClick(employee.id, day.date, slot.id)}
                          onMouseDown={() => handleMouseDown(employee.id, day.date, slot.id)}
                          onMouseEnter={() => handleMouseEnter(employee.id, day.date, slot.id)}
                          onMouseUp={handleMouseUp}
                          title={tooltipText}
                        >
                          {shift && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs p-1">
                              <div className="text-center">
                                <div className="text-lg">{SHIFT_STATUS[shift.status].icon}</div>
                                {shift.workType && shift.workType !== 'other' && (
                                  <div className="text-xs opacity-75 mt-1">
                                    {WORK_TYPES[shift.workType].icon}
                                  </div>
                                )}
                                {shift.customerName && (
                                  <div className="text-xs opacity-75 mt-1 truncate w-full">
                                    {shift.customerName}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {!shift && !isBreak && !truckSchedule && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none">
                              ＋
                            </div>
                          )}
                          {truckSchedule && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
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

  // 月ビュー
  const MonthView = () => {
    const handleDayClick = (employee: Employee, date: string) => {
      setSelectedEmployee(employee);
      setSelectedDate(date);
      setViewMode('week');
    };

    const getShiftsForDate = (employeeId: string, date: string) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return [];
      
      return employee.shifts.filter(shift => shift.date === date);
    };

    const getUtilizationRate = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      const confirmedShifts = shifts.filter(s => s.status === 'confirmed' || s.status === 'booked');
      return (confirmedShifts.length / TIME_SLOTS.length) * 100;
    };

    const getUtilizationColor = (rate: number) => {
      if (rate < 30) return 'bg-green-100 text-green-800';
      if (rate < 70) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    const getShiftTimeRange = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      if (shifts.length === 0) return null;

      const confirmedShifts = shifts.filter(s => s.status === 'confirmed' || s.status === 'booked');
      if (confirmedShifts.length === 0) return null;

      const timeSlots = confirmedShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
      if (timeSlots.length === 0) return null;

      const startTime = timeSlots[0]?.start;
      const endTime = timeSlots[timeSlots.length - 1]?.end;
      
      return `${startTime}〜${endTime}`;
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
                  const activeEmployees = filteredEmployees;

                  return (
                    <div
                      key={day.date}
                      className={`min-h-[200px] p-2 border cursor-pointer hover:bg-gray-50 transition-colors ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${day.isWeekend ? 'bg-gray-100' : ''} ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.day}
                      </div>
                      
                      <div className="space-y-1">
                        {activeEmployees.map(employee => {
                          const shifts = getShiftsForDate(employee.id, day.date);
                          const utilizationRate = getUtilizationRate(employee.id, day.date);
                          const hasShifts = shifts.length > 0;
                          const isOverworkDay = isOverwork(employee.id, day.date);
                          const timeRange = getShiftTimeRange(employee.id, day.date);
                          
                          return (
                            <div
                              key={employee.id}
                              className={`text-xs p-1 rounded cursor-pointer ${
                                hasShifts ? getUtilizationColor(utilizationRate) : 'bg-gray-100'
                              } ${isOverworkDay ? 'border border-red-300' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDayClick(employee, day.date);
                              }}
                              title={`${employee.name}: ${utilizationRate.toFixed(0)}%稼働${timeRange ? ` (${timeRange})` : ''}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="truncate">{employee.name}</span>
                                {hasShifts && (
                                  <span className="text-xs font-medium">
                                    {utilizationRate.toFixed(0)}%
                                  </span>
                                )}
                                {isOverworkDay && <span className="text-red-600">⚠️</span>}
                              </div>
                              {timeRange && (
                                <div className="text-xs opacity-75 mt-1">
                                  {timeRange}
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
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ナビゲーション */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">従業員シフト管理</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousPeriod}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full bg-white shadow hover:bg-gray-50"
              aria-label="前へ"
            >
              ‹
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
            >
              今日
            </button>
            <button
              onClick={goToNextPeriod}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full bg-white shadow hover:bg-gray-50"
              aria-label="次へ"
            >
              ›
            </button>
          </div>
        </div>

        {/* ビューモード切り替え */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            週ビュー
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded ${
              viewMode === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            月ビュー
          </button>
        </div>

        {/* 従業員検索 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="従業員検索..."
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border rounded"
          />
          <p className="mt-2 text-xs text-gray-500">空欄をクリックまたはドラッグしてシフトを登録できます</p>
        </div>

        {/* 操作ボタンとオプション */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={copyPreviousWeek}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm border"
            >
              前週コピー
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm border"
            >
              {showLegend ? '凡例を隠す' : '凡例を表示'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={colorByEmployee}
                onChange={(e) => setColorByEmployee(e.target.checked)}
                className="rounded"
              />
              従業員別色分け
            </label>
          </div>
        </div>

        {/* 期間表示 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'month' && `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
            {viewMode === 'week' && `${formatDate(weekDays[0].date)} - ${formatDate(weekDays[6].date)}`}
          </h3>
        </div>

        {/* 凡例（折りたたみ可能） */}
        {showLegend && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">凡例</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(SHIFT_STATUS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${value.color}`}></div>
                  <span className="text-xs">{value.icon} {value.label}</span>
                </div>
              ))}
              {Object.entries(WORK_TYPES).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${value.color}`}></div>
                  <span className="text-xs">{value.icon} {value.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-300 border border-red-400 rounded"></div>
                <span className="text-xs">⚠️ オーバーワーク</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">配車済み</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ビューモードに応じた表示 */}
      {viewMode === 'week' && <WeekView />}
      {viewMode === 'month' && <MonthView />}

      {/* シフト編集モーダル */}
      {showShiftModal && editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedShift ? 'シフト編集' : 'シフト追加'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">従業員</label>
                <div className="p-2 bg-gray-50 rounded">
                  {employees.find(emp => emp.id === editingShift.employeeId)?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">日付・時間</label>
                <div className="p-2 bg-gray-50 rounded">
                  {formatDate(editingShift.date)} {TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.label}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">作業種別</label>
                <select
                  value={editingShift.workType}
                  onChange={(e) => setEditingShift({...editingShift, workType: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  {Object.entries(WORK_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">顧客名（任意）</label>
                <input
                  type="text"
                  value={editingShift.customerName}
                  onChange={(e) => setEditingShift({...editingShift, customerName: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="顧客名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">備考（任意）</label>
                <textarea
                  value={editingShift.notes}
                  onChange={(e) => setEditingShift({...editingShift, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="備考を入力"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleShiftSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                {selectedShift ? '更新' : '追加'}
              </button>
              {selectedShift && (
                <button
                  onClick={handleShiftDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  削除
                </button>
              )}
              <button
                onClick={() => {
                  setShowShiftModal(false);
                  setEditingShift(null);
                  setSelectedShift(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 