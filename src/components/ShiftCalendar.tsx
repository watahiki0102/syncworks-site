'use client';

import { useState, useEffect } from 'react';
import { formatDate, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA, TIME_SLOTS, SHIFT_STATUS } from '@/constants/calendar';
import UnifiedMonthCalendar, { CalendarDay, CalendarEvent } from './UnifiedMonthCalendar';
import TimeRangeDisplaySelector from './TimeRangeDisplaySelector';

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
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

interface TruckSchedule {
  id: string;
  truckId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  origin: string;
  destination: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  employees: string[];
}

interface ShiftCalendarProps {
  employees: Employee[];
  truckSchedules: TruckSchedule[];
  onUpdateShift: (employeeId: string, shift: EmployeeShift) => void;
  onAddShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  onDeleteShift: (employeeId: string, shiftId: string) => void;
  onUpdateTruckSchedules: (schedules: TruckSchedule[]) => void;
  timeRangeType?: 'morning' | 'afternoon' | 'evening' | 'full' | 'custom';
  customStartTime?: string;
  customEndTime?: string;
  showTimeRangeSelector?: boolean;
  displayStartTime?: number;
  displayEndTime?: number;
  onDisplayTimeRangeChange?: (start: number, end: number) => void;
}

type ViewMode = 'day' | 'month';

export default function ShiftCalendar({
  employees,
  truckSchedules,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  onUpdateTruckSchedules,
  timeRangeType = 'full',
  customStartTime = '06:00',
  customEndTime = '24:00',
  showTimeRangeSelector = false,
  displayStartTime = 8,
  displayEndTime = 20,
  onDisplayTimeRangeChange
}: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [editingShift, setEditingShift] = useState<EmployeeShift | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [dragState, setDragState] = useState<{
    currentEmployee: string;
    startTime: string;
    currentTime: string;
  } | null>(null);
  const [resizeState, setResizeState] = useState<{
    shiftId: string;
    employeeId: string;
    direction: 'start' | 'end';
    originalTime: string;
  } | null>(null);
  const [showOnlyShiftEmployees, setShowOnlyShiftEmployees] = useState(true);
  const [showEmployeeListModal, setShowEmployeeListModal] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('');
  const [employeesForModal, setEmployeesForModal] = useState<Employee[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<EmployeeShift[]>([]);
  const [copiedShifts, setCopiedShifts] = useState<EmployeeShift[]>([]);
  const [clipboardMode, setClipboardMode] = useState<'copy' | 'paste' | 'none'>('none');
  const [showClipboard, setShowClipboard] = useState(false);
  const [pendingPasteShifts, setPendingPasteShifts] = useState<EmployeeShift[]>([]);
  const [pendingPasteDate, setPendingPasteDate] = useState<string>('');

  const filteredEmployees = employees.filter(emp => emp.status === 'active');

  // 共通のシフトデータ取得関数
  const getShiftsForDate = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return [];
    
    return employee.shifts.filter(shift => shift.date === date);
  };

  // 従業員の年間累計労働時間を計算する関数
  const getEmployeeYearlyWorkingTime = (employeeId: string) => {
    const currentYear = currentDate.getFullYear();
    let totalWorkingMinutes = 0;
    
    // 1月から12月まで各月をチェック
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(currentYear, month, 1);
      const lastDay = new Date(currentYear, month + 1, 0);
      
      // 月の各日をチェック
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, month, day).toISOString().split('T')[0];
        const dayShifts = getShiftsForDate(employeeId, date);
        const workingShifts = dayShifts.filter(shift => shift.status === 'working');
        
        if (workingShifts.length > 0) {
          // その日の総労働時間を計算
          const timeSlots = workingShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
          const sortedTimeSlots = timeSlots.sort((a, b) => a.start.localeCompare(b.start));
          
          // 連続する時間帯をグループ化
          const timeGroups: string[][] = [];
          let currentGroup: string[] = [];
          
          sortedTimeSlots.forEach((slot, index) => {
            if (index === 0) {
              currentGroup = [slot.start, slot.end];
            } else {
              const prevSlot = sortedTimeSlots[index - 1];
              if (prevSlot.end === slot.start) {
                currentGroup[1] = slot.end;
              } else {
                timeGroups.push([...currentGroup]);
                currentGroup = [slot.start, slot.end];
              }
            }
          });
          
          timeGroups.push(currentGroup);
          
          // 各グループの労働時間を計算
          timeGroups.forEach(group => {
            const startTime = group[0].split(':').map(Number);
            const endTime = group[1].split(':').map(Number);
            const startMinutes = startTime[0] * 60 + startTime[1];
            const endMinutes = endTime[0] * 60 + endTime[1];
            totalWorkingMinutes += (endMinutes - startMinutes);
          });
        }
      }
    }
    
    const totalHours = Math.floor(totalWorkingMinutes / 60);
    const remainingMinutes = totalWorkingMinutes % 60;
    return totalHours > 0 ? `${totalHours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}` : `${remainingMinutes}分`;
  };

  // 従業員の月間集計を計算する関数
  const getEmployeeMonthlySummary = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return filteredEmployees.map(employee => {
      let totalWorkingDays = 0;
      let totalWorkingMinutes = 0;
      
      // 月の各日をチェック
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        const dayShifts = getShiftsForDate(employee.id, date);
        const workingShifts = dayShifts.filter(shift => shift.status === 'working');
        
        if (workingShifts.length > 0) {
          totalWorkingDays++;
          
          // その日の総労働時間を計算
          const timeSlots = workingShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
          const sortedTimeSlots = timeSlots.sort((a, b) => a.start.localeCompare(b.start));
          
          // 連続する時間帯をグループ化
          const timeGroups: string[][] = [];
          let currentGroup: string[] = [];
          
          sortedTimeSlots.forEach((slot, index) => {
            if (index === 0) {
              currentGroup = [slot.start, slot.end];
            } else {
              const prevSlot = sortedTimeSlots[index - 1];
              if (prevSlot.end === slot.start) {
                currentGroup[1] = slot.end;
              } else {
                timeGroups.push([...currentGroup]);
                currentGroup = [slot.start, slot.end];
              }
            }
          });
          
          timeGroups.push(currentGroup);
          
          // 各グループの労働時間を計算
          timeGroups.forEach(group => {
            const startTime = group[0].split(':').map(Number);
            const endTime = group[1].split(':').map(Number);
            const startMinutes = startTime[0] * 60 + startTime[1];
            const endMinutes = endTime[0] * 60 + endTime[1];
            totalWorkingMinutes += (endMinutes - startMinutes);
          });
        }
      }
      
      const totalHours = Math.floor(totalWorkingMinutes / 60);
      const remainingMinutes = totalWorkingMinutes % 60;
      const totalTimeStr = totalHours > 0 ? `${totalHours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}` : `${remainingMinutes}分`;
      
      return {
        employee,
        workingDays: totalWorkingDays,
        totalWorkingTime: totalTimeStr,
        totalWorkingMinutes
      };
    }).sort((a, b) => b.totalWorkingMinutes - a.totalWorkingMinutes); // 労働時間の多い順にソート
  };

  // シフトの変更を追跡する関数
  const handleShiftUpdate = (shiftId: string, updatedShift: Partial<EmployeeShift>) => {
    const employee = employees.find(emp => emp.shifts.some(shift => shift.id === shiftId));
    if (employee) {
      const existingShift = employee.shifts.find(shift => shift.id === shiftId);
      if (existingShift) {
        onUpdateShift(shiftId, { ...existingShift, ...updatedShift });
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleShiftAdd = (newShift: Omit<EmployeeShift, 'id'>) => {
    onAddShift(newShift.employeeId, newShift);
    setHasUnsavedChanges(true);
    console.log('Shift added, hasUnsavedChanges set to true');
  };

  const handleShiftDelete = (shiftId: string) => {
    const employee = employees.find(emp => emp.shifts.some(shift => shift.id === shiftId));
    if (employee) {
      onDeleteShift(employee.id, shiftId);
      setHasUnsavedChanges(true);
      console.log('Shift deleted, hasUnsavedChanges set to true');
    }
  };

  // 保存ボタンの処理
  const handleConfirmChanges = () => {
    console.log('Save button clicked, hasUnsavedChanges:', hasUnsavedChanges);
    setHasUnsavedChanges(false);
    // ここでサーバーに保存するなどの処理を追加
    alert('シフトが保存されました');
  };

  // クリップボード機能
  const startCopyMode = () => {
    setClipboardMode('copy');
    setSelectedShifts([]);
    setCopiedShifts([]);
    setShowClipboard(true);
  };

  const startPasteMode = () => {
    if (copiedShifts.length === 0) {
      alert('コピーされたシフトがありません');
      return;
    }
    setClipboardMode('paste');
    setSelectedShifts([]);
    setPendingPasteShifts([]);
    setPendingPasteDate('');
    setShowClipboard(true);
  };

  const handleShiftClickForClipboard = (shift: EmployeeShift) => {
    if (clipboardMode === 'copy') {
      // コピーモード：シフトを選択
      setSelectedShifts(prev => {
        const exists = prev.some(s => s.id === shift.id);
        if (exists) {
          return prev.filter(s => s.id !== shift.id);
        } else {
          return [...prev, shift];
        }
      });
    }
  };

  const handleDateClickForClipboard = (date: string) => {
    if (clipboardMode === 'paste') {
      // ペーストモード：貼り付け先を選択
      setPendingPasteDate(date);
    }
  };

  const executeCopy = () => {
    if (selectedShifts.length === 0) {
      alert('コピーするシフトを選択してください');
      return;
    }

    // 出勤状態のシフトのみコピー
    const workingShifts = selectedShifts.filter(shift => shift.status === 'working');
    
    if (workingShifts.length === 0) {
      alert('選択したシフトにコピー可能なシフト（出勤）がありません');
      return;
    }

    setCopiedShifts(workingShifts);
    setClipboardMode('none');
    setSelectedShifts([]);
    setShowClipboard(false);
    alert(`${workingShifts.length}件のシフトをコピーしました`);
  };

  const executePaste = () => {
    if (!pendingPasteDate) {
      alert('貼り付け先の日付を選択してください');
      return;
    }

    setPendingPasteShifts(copiedShifts);
    setClipboardMode('none');
    setPendingPasteDate('');
    setShowClipboard(false);
    alert('貼り付け準備完了。保存ボタンを押して反映してください。');
  };

  const executeSave = () => {
    if (pendingPasteShifts.length === 0) {
      alert('貼り付け待ちのシフトがありません');
      return;
    }

    if (!pendingPasteDate) {
      alert('貼り付け先の日付が設定されていません');
      return;
    }

    pendingPasteShifts.forEach(shift => {
      const newShift: Omit<EmployeeShift, 'id'> = {
        employeeId: shift.employeeId,
        date: pendingPasteDate,
        timeSlot: shift.timeSlot,
        status: shift.status,
        customerName: shift.customerName,
        notes: shift.notes,
        startTime: shift.startTime,
        endTime: shift.endTime,
      };
      handleShiftAdd(newShift);
    });
    
    setPendingPasteShifts([]);
    setPendingPasteDate('');
    setHasUnsavedChanges(true);
    alert('シフトを保存しました');
  };

  const cancelClipboard = () => {
    setClipboardMode('none');
    setSelectedShifts([]);
    setPendingPasteShifts([]);
    setPendingPasteDate('');
    setShowClipboard(false);
  };

  const removeSelectedShift = (shiftIdToRemove: string) => {
    setSelectedShifts(prev => prev.filter(shift => shift.id !== shiftIdToRemove));
  };

  const clearSelectedShifts = () => {
    setSelectedShifts([]);
  };


  // 5分単位の時間選択肢を生成
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();


  // 時間帯に基づいてTIME_SLOTSをフィルタリング
  const getFilteredTimeSlots = () => {
    let filteredSlots: typeof TIME_SLOTS;

    // 時間帯表示設定が有効な場合は、それを使用
    if (showTimeRangeSelector) {
      const startTime = `${displayStartTime.toString().padStart(2, '0')}:00`;
      const endTime = `${displayEndTime.toString().padStart(2, '0')}:00`;
      
      filteredSlots = TIME_SLOTS.filter(slot => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        return slotStart >= startTime && slotEnd <= endTime;
      });
    } else {
      // 従来の時間帯選択機能
      let startTime: string;
      let endTime: string;

      switch (timeRangeType) {
        case 'morning':
          startTime = '06:00';
          endTime = '12:00';
          break;
        case 'afternoon':
          startTime = '12:00';
          endTime = '18:00';
          break;
        case 'evening':
          startTime = '18:00';
          endTime = '24:00';
          break;
        case 'custom':
          startTime = customStartTime;
          endTime = customEndTime;
          break;
        case 'full':
        default:
          filteredSlots = TIME_SLOTS;
          break;
      }

      if (timeRangeType !== 'full') {
        filteredSlots = TIME_SLOTS.filter(slot => {
          const slotStart = slot.start;
          const slotEnd = slot.end;
          return slotStart >= startTime && slotEnd <= endTime;
        });
      }
    }

    // 開始時間の昇順でソート
    return filteredSlots.sort((a, b) => a.start.localeCompare(b.start));
  };

  const filteredTimeSlots = getFilteredTimeSlots();
  
  // 出勤予定の従業員のみをフィルター
  const getShiftEmployees = (date: string) => {
    return filteredEmployees.filter(employee => 
      employee.shifts.some(shift => shift.date === date)
    );
  };


  const displayEmployees = showOnlyShiftEmployees 
    ? getShiftEmployees(selectedDate)
    : filteredEmployees;

  const getEmployeesWithShifts = (date: string) => {
    return filteredEmployees.filter(employee => 
      employee.shifts.some(shift => shift.date === date)
    );
  };

  const getShiftAtDateTime = (employeeId: string, date: string, timeSlot: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;
    
    return employee.shifts.find(shift => 
      shift.date === date && shift.timeSlot === timeSlot
    );
  };

  const getTruckScheduleForDateTime = (date: string, timeSlot: string) => {
    const timeSlotInfo = TIME_SLOTS.find(ts => ts.id === timeSlot);
    if (!timeSlotInfo) return null;

    return truckSchedules.find(schedule => 
      schedule.date === date && 
      schedule.startTime <= timeSlotInfo.end &&
      schedule.endTime > timeSlotInfo.start
    );
  };


  const isBreakTime = (timeSlot: string) => {
    // 12:00-13:00を休憩時間として設定（30分単位対応）
    return timeSlot === '12:00' || timeSlot === '12:30';
  };


  const getShiftBlock = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return { customers: [], shifts: [] };

    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });

    const customers = [...new Set(sortedShifts
      .filter(shift => shift.customerName)
      .map(shift => shift.customerName!)
    )];

    return {
      customers,
      shifts: sortedShifts,
    };
  };

  const handleCellClick = (employeeId: string, date: string, timeSlot: string) => {
    const existingShift = getShiftAtDateTime(employeeId, date, timeSlot);
    
    if (existingShift) {
      setSelectedShift(existingShift);
      setEditingShift({ ...existingShift });
    } else {
      setSelectedShift(null);
      setEditingShift({
        id: '',
        employeeId,
        date,
        timeSlot,
        status: 'working',
        customerName: '',
        notes: '',
      });
    }
    setShowShiftModal(true);
  };

  // シフトの重複チェック関数
  const checkShiftOverlap = (employeeId: string, date: string, startTime: string, endTime: string, excludeShiftId?: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return false;

    const dayShifts = employee.shifts.filter(shift => 
      shift.date === date && shift.id !== excludeShiftId
    );

    return dayShifts.some(shift => {
      const shiftStart = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
      const shiftEnd = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';
      
      // 時間の重複をチェック
      return (startTime < shiftEnd && endTime > shiftStart);
    });
  };

  // 同じステータスのシフトを結合する関数
  const mergeAdjacentShifts = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });

    // 同じステータスの連続するシフトを結合
    const mergedShifts: EmployeeShift[] = [];
    let currentGroup: EmployeeShift[] = [];

    sortedShifts.forEach((shift, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(shift);
      } else {
        const lastShift = currentGroup[currentGroup.length - 1];
        const lastEndTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
        const currentStartTime = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
        
        // 同じステータスで連続している場合
        if (lastShift.status === shift.status && lastEndTime === currentStartTime) {
          currentGroup.push(shift);
        } else {
          // グループを結合して新しいシフトを作成
          if (currentGroup.length > 1) {
            const firstShift = currentGroup[0];
            const lastShift = currentGroup[currentGroup.length - 1];
            const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
            const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
            
            // 既存のシフトを削除
            currentGroup.forEach(s => onDeleteShift(employeeId, s.id));
            
            // 結合されたシフトを作成
            const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
            const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);
            
            if (startIndex !== -1 && endIndex !== -1) {
              for (let i = startIndex; i <= endIndex; i++) {
                const timeSlot = TIME_SLOTS[i];
                const newShift: Omit<EmployeeShift, 'id'> = {
                  employeeId,
                  date,
                  timeSlot: timeSlot.id,
                  status: firstShift.status,
                  customerName: firstShift.customerName,
                  notes: firstShift.notes,
                  startTime,
                  endTime,
                };
                handleShiftAdd(newShift);
              }
            }
          }
          currentGroup = [shift];
        }
      }
    });

    // 最後のグループも処理
    if (currentGroup.length > 1) {
      const firstShift = currentGroup[0];
      const lastShift = currentGroup[currentGroup.length - 1];
      const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
      const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
      
      // 既存のシフトを削除
      currentGroup.forEach(s => onDeleteShift(employeeId, s.id));
      
      // 結合されたシフトを作成
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = startIndex; i <= endIndex; i++) {
          const timeSlot = TIME_SLOTS[i];
          const newShift: Omit<EmployeeShift, 'id'> = {
            employeeId,
            date,
            timeSlot: timeSlot.id,
            status: firstShift.status,
            customerName: firstShift.customerName,
            notes: firstShift.notes,
            startTime,
            endTime,
          };
          handleShiftAdd(newShift);
        }
      }
    }
  };

  const handleMouseDown = (employeeId: string, date: string, timeSlot: string) => {
    setDragState({
      currentEmployee: employeeId,
      startTime: timeSlot,
      currentTime: timeSlot,
    });
  };

  const handleMouseEnter = (employeeId: string, date: string, timeSlot: string) => {
    if (dragState && dragState.currentEmployee === employeeId) {
      setDragState(prev => prev ? {
        ...prev,
        currentTime: timeSlot,
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (dragState) {
      const startIndex = filteredTimeSlots.findIndex(ts => ts.id === dragState.startTime);
      const endIndex = filteredTimeSlots.findIndex(ts => ts.id === dragState.currentTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const [minIndex, maxIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
        
        for (let i = minIndex; i <= maxIndex; i++) {
          const timeSlot = filteredTimeSlots[i];
          const existingShift = getShiftAtDateTime(dragState.currentEmployee, selectedDate, timeSlot.id);
          
          if (!existingShift) {
            const newShift: Omit<EmployeeShift, 'id'> = {
              employeeId: dragState.currentEmployee,
              date: selectedDate,
              timeSlot: timeSlot.id,
              status: 'working',
              customerName: '',
              notes: '',
            };
            handleShiftAdd(newShift);
          }
        }
      }
    }
    setDragState(null);
  };

  const handleResizeEnter = (employeeId: string, date: string, timeSlotId: string) => {
    if (!resizeState) return;
    
    // リサイズのプレビューを更新
    const timeSlot = TIME_SLOTS.find(ts => ts.id === timeSlotId);
    if (!timeSlot) return;
    
    // ここでリサイズのプレビューを表示する処理を追加
    // 実際のリサイズは handleResizeEnd で実行
  };

  const handleResizeEnd = () => {
    if (!resizeState) return;
    
    // リサイズ操作を実行
    const shift = employees
      .find(emp => emp.id === resizeState.employeeId)
      ?.shifts.find(s => s.id === resizeState.shiftId);
    
    if (shift) {
      // 新しい時間範囲でシフトを更新
      const newStartTime = resizeState.direction === 'start' 
        ? TIME_SLOTS.find(ts => ts.id === resizeState.originalTime)?.start || ''
        : shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
      
      const newEndTime = resizeState.direction === 'end'
        ? TIME_SLOTS.find(ts => ts.id === resizeState.originalTime)?.end || ''
        : shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';
      
      // 既存のシフトを削除
      onDeleteShift(resizeState.employeeId, resizeState.shiftId);
      
      // 新しい時間範囲でシフトを再作成
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === newStartTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === newEndTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = startIndex; i <= endIndex; i++) {
          const timeSlot = TIME_SLOTS[i];
          const newShift: Omit<EmployeeShift, 'id'> = {
            employeeId: resizeState.employeeId,
            date: shift.date,
            timeSlot: timeSlot.id,
            status: shift.status,
            customerName: shift.customerName,
            notes: shift.notes,
            startTime: newStartTime,
            endTime: newEndTime,
          };
          handleShiftAdd(newShift);
        }
      }
    }
    
    setResizeState(null);
  };

  const handleShiftSave = () => {
    if (!editingShift) return;

    const startTime = editingShift.startTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.start;
    const endTime = editingShift.endTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.end;

    if (!startTime || !endTime) {
      alert('開始時間と終了時間を設定してください');
      return;
    }

    // 時間範囲内のすべてのスロットにシフトを作成
    const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
    const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      alert('無効な時間範囲です');
      return;
    }

    // 重複チェック
    if (checkShiftOverlap(editingShift.employeeId, editingShift.date, startTime, endTime, selectedShift?.id)) {
      alert('選択した時間帯に既にシフトが登録されています。時間を調整してください。');
      return;
    }

    if (selectedShift) {
      // 既存のシフトを更新 - まず削除してから新しいシフトを作成
      handleShiftDelete(selectedShift.id);
    }

    // 時間範囲内の各スロットにシフトを作成
    for (let i = startIndex; i <= endIndex; i++) {
      const timeSlot = TIME_SLOTS[i];
      const newShift: Omit<EmployeeShift, 'id'> = {
        employeeId: editingShift.employeeId,
        date: editingShift.date,
        timeSlot: timeSlot.id,
        status: editingShift.status,
        customerName: editingShift.customerName,
        notes: editingShift.notes,
        startTime: startTime,
        endTime: endTime,
      };
      handleShiftAdd(newShift);
    }

    // 同じステータスのシフトを結合
    mergeAdjacentShifts(editingShift.employeeId, editingShift.date);

    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  const handleDeleteShift = () => {
    if (selectedShift?.id) {
      handleShiftDelete(selectedShift.id);
    }
    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(toLocalDateString(today));
  };


  // 日ビュー - 横時間・縦従業員のレイアウト
  const DayView = () => {
    const getShiftBlocks = (employeeId: string, date: string) => {
      const dayShifts = getShiftsForDate(employeeId, date);
      const blocks: Array<{
        id: string;
        startTime: string;
        endTime: string;
        status: string;
        customerName?: string;
        notes?: string;
        startIndex: number;
        endIndex: number;
      }> = [];

      // 連続するシフトをブロック化
      const sortedShifts = dayShifts.sort((a, b) => {
        const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
        const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
        return timeA.localeCompare(timeB);
      });

      let currentBlock: any = null;
      
      sortedShifts.forEach(shift => {
        const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
        const timeSlot = TIME_SLOTS[timeIndex];
        
        if (!currentBlock) {
          currentBlock = {
            id: shift.id,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            status: shift.status,
            customerName: shift.customerName,
            notes: shift.notes,
            startIndex: timeIndex,
            endIndex: timeIndex,
          };
        } else if (
          currentBlock.status === shift.status &&
          currentBlock.endIndex === timeIndex - 1
        ) {
          currentBlock.endTime = timeSlot.end;
          currentBlock.endIndex = timeIndex;
        } else {
          blocks.push(currentBlock);
          currentBlock = {
            id: shift.id,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            status: shift.status,
            customerName: shift.customerName,
            notes: shift.notes,
            startIndex: timeIndex,
            endIndex: timeIndex,
          };
        }
      });

      if (currentBlock) {
        blocks.push(currentBlock);
      }

      return blocks;
    };

    const getShiftBlockStyle = (block: any) => {
      const width = ((block.endIndex - block.startIndex + 1) / filteredTimeSlots.length) * 100;
      const left = (block.startIndex / filteredTimeSlots.length) * 100;
      
      const statusColors = {
        working: 'bg-lime-200 border-lime-300',
        unavailable: 'bg-gray-200 border-gray-300',
      };

      return {
        width: `${width}%`,
        left: `${left}%`,
        className: statusColors[block.status as keyof typeof statusColors] || 'bg-gray-200',
      };
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 日ビューナビゲーション */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Previous day button clicked, hasUnsavedChanges:', hasUnsavedChanges);
                  if (hasUnsavedChanges) {
                    if (confirm('未保存の変更があります。日付を変更すると入力が削除されます。続行しますか？')) {
                      setHasUnsavedChanges(false);
                      const prevDate = new Date(selectedDate);
                      prevDate.setDate(prevDate.getDate() - 1);
                      setSelectedDate(toLocalDateString(prevDate));
                    }
                  } else {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    setSelectedDate(toLocalDateString(prevDate));
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                前日
              </button>
              <button
                onClick={() => {
                  console.log('Next day button clicked, hasUnsavedChanges:', hasUnsavedChanges);
                  if (hasUnsavedChanges) {
                    if (confirm('未保存の変更があります。日付を変更すると入力が削除されます。続行しますか？')) {
                      setHasUnsavedChanges(false);
                      const nextDate = new Date(selectedDate);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setSelectedDate(toLocalDateString(nextDate));
                    }
                  } else {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    setSelectedDate(toLocalDateString(nextDate));
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                翌日
              </button>
            </div>
          </div>
        </div>

        {/* 時間帯表示選択機能と確定ボタン */}
        {showTimeRangeSelector && onDisplayTimeRangeChange && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <TimeRangeDisplaySelector
                startTime={displayStartTime}
                endTime={displayEndTime}
                onTimeRangeChange={onDisplayTimeRangeChange}
              />
              <button
                onClick={handleConfirmChanges}
                disabled={!hasUnsavedChanges}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                保存
              </button>
            </div>
          </div>
        )}
        
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sticky left-0 bg-gray-50 z-10">
                  従業員
                </th>
                {filteredTimeSlots.map(timeSlot => (
                  <th key={timeSlot.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-16 relative">
                    <div className="flex flex-col">
                      <span className="font-bold">{timeSlot.start}</span>
                      <span className="text-xs opacity-75">{timeSlot.end}</span>
                    </div>
                    
                    {/* 時間帯の可視化 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded">
                      {(() => {
                        const hour = parseInt(timeSlot.start.split(':')[0]);
                        if (hour >= 6 && hour < 12) {
                          return <div className="h-full bg-yellow-300 rounded" title="午前" />;
                        } else if (hour >= 12 && hour < 18) {
                          return <div className="h-full bg-orange-300 rounded" title="午後" />;
                        } else if (hour >= 18 && hour < 22) {
                          return <div className="h-full bg-purple-300 rounded" title="夜間" />;
                        } else {
                          return <div className="h-full bg-gray-300 rounded" title="深夜" />;
                        }
                      })()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayEmployees.map(employee => {
                const shiftBlocks = getShiftBlocks(employee.id, selectedDate);
                
                return (
                  <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{employee.name}</span>
                          {(() => {
                            const totalHours = shiftBlocks.reduce((total, block) => {
                              const startIndex = TIME_SLOTS.findIndex(ts => ts.start === block.startTime);
                              const endIndex = TIME_SLOTS.findIndex(ts => ts.end === block.endTime);
                              return total + (endIndex - startIndex + 1) * 0.5; // 30分単位
                            }, 0);
                            return (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                                {totalHours}h
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1">
                          {shiftBlocks.length > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`${employee.name}のシフトをすべて削除しますか？`)) {
                                  // 現在のemployeesの状態から該当する従業員を取得
                                  const currentEmployee = employees.find(emp => emp.id === employee.id);
                                  if (!currentEmployee) return;
                                  
                                  // その従業員のその日のシフトをすべて削除
                                  const shiftsToDelete = currentEmployee.shifts
                                    .filter(shift => shift.date === selectedDate);
                                  
                                  // 削除対象のシフトIDを配列に格納
                                  const shiftIds = shiftsToDelete.map(shift => shift.id);
                                  
                                  // 各シフトを削除（逆順で削除してインデックスの問題を回避）
                                  shiftIds.reverse().forEach(shiftId => {
                                    onDeleteShift(employee.id, shiftId);
                                  });
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50"
                              title="シフトを削除"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* 出勤時間の可視化バー */}
                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        {shiftBlocks.map((block, index) => {
                          const startIndex = TIME_SLOTS.findIndex(ts => ts.start === block.startTime);
                          const endIndex = TIME_SLOTS.findIndex(ts => ts.end === block.endTime);
                          const width = ((endIndex - startIndex + 1) / filteredTimeSlots.length) * 100;
                          const left = (startIndex / filteredTimeSlots.length) * 100;
                          
                          const statusColors = {
                            working: 'bg-lime-400',
                            unavailable: 'bg-gray-400',
                          };
                          
                          return (
                            <div
                              key={index}
                              className={`absolute h-full ${statusColors[block.status as keyof typeof statusColors] || 'bg-gray-400'}`}
                              style={{
                                width: `${width}%`,
                                left: `${left}%`,
                              }}
                              title={`${block.startTime}-${block.endTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="relative h-16" colSpan={filteredTimeSlots.length}>
                      <div className="absolute inset-0 flex">
                        {/* 時間スロットの背景 */}
                        {filteredTimeSlots.map((timeSlot, index) => (
                          <div
                            key={timeSlot.id}
                            className={`flex-1 border-r border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors relative ${
                              isBreakTime(timeSlot.id) ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => {
                              if (!resizeState) {
                                handleCellClick(employee.id, selectedDate, timeSlot.id);
                              }
                            }}
                            onMouseDown={() => {
                              if (!resizeState) {
                                handleMouseDown(employee.id, selectedDate, timeSlot.id);
                              }
                            }}
                            onMouseEnter={() => {
                              if (resizeState) {
                                handleResizeEnter(employee.id, selectedDate, timeSlot.id);
                              } else {
                                handleMouseEnter(employee.id, selectedDate, timeSlot.id);
                              }
                            }}
                            onMouseUp={() => {
                              if (resizeState) {
                                handleResizeEnd();
                              } else {
                                handleMouseUp();
                              }
                            }}
                            title={`${timeSlot.start}-${timeSlot.end}`}
                          >
                            {/* ドラッグ中の表示 */}
                            {dragState && 
                              dragState.currentEmployee === employee.id &&
                              ((filteredTimeSlots.findIndex(ts => ts.id === dragState.startTime) <= index &&
                                index <= filteredTimeSlots.findIndex(ts => ts.id === dragState.currentTime)) ||
                               (filteredTimeSlots.findIndex(ts => ts.id === dragState.currentTime) <= index &&
                                index <= filteredTimeSlots.findIndex(ts => ts.id === dragState.startTime))) && (
                              <div className="absolute inset-0 bg-blue-200 opacity-50 border-2 border-blue-400 border-dashed"></div>
                            )}
                            
                            {/* リサイズ中の表示 */}
                            {resizeState && 
                              resizeState.employeeId === employee.id &&
                              ((resizeState.direction === 'start' && 
                                filteredTimeSlots.findIndex(ts => ts.id === timeSlot.id) <= filteredTimeSlots.findIndex(ts => ts.start === resizeState.originalTime)) ||
                               (resizeState.direction === 'end' && 
                                filteredTimeSlots.findIndex(ts => ts.id === timeSlot.id) >= filteredTimeSlots.findIndex(ts => ts.end === resizeState.originalTime))) && (
                              <div className="absolute inset-0 bg-yellow-200 opacity-50 border-2 border-yellow-400 border-dashed"></div>
                            )}
                          </div>
                        ))}
                        
                        {/* シフトブロック */}
                        {shiftBlocks.map(block => {
                          const style = getShiftBlockStyle(block);
                          return (
                            <div
                              key={block.id}
                              className={`absolute top-1 bottom-1 rounded border-2 cursor-pointer hover:opacity-80 transition-all group ${style.className}`}
                              style={{
                                width: style.width,
                                left: style.left,
                              }}
                              onClick={(e) => {
                                // リサイズハンドルがクリックされた場合は何もしない
                                if (e.target !== e.currentTarget) return;
                                
                                const shift = employees
                                  .find(emp => emp.id === employee.id)
                                  ?.shifts.find(s => s.id === block.id);
                                if (shift) {
                                  setSelectedShift(shift);
                                  setEditingShift({ ...shift });
                                  setShowShiftModal(true);
                                }
                              }}
                              title={`${block.startTime}-${block.endTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`}
                            >
                              {/* リサイズハンドル - 左端 */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-blue-400 hover:bg-blue-500 transition-all"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setResizeState({
                                    shiftId: block.id,
                                    employeeId: employee.id,
                                    direction: 'start',
                                    originalTime: block.startTime,
                                  });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                title="開始時間を変更（ドラッグでリサイズ）"
                              />
                              
                              {/* リサイズハンドル - 右端 */}
                              <div
                                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-blue-400 hover:bg-blue-500 transition-all"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setResizeState({
                                    shiftId: block.id,
                                    employeeId: employee.id,
                                    direction: 'end',
                                    originalTime: block.endTime,
                                  });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                title="終了時間を変更（ドラッグでリサイズ）"
                              />

                              <div className="h-full flex items-center justify-center p-1">
                                <div className="text-xs font-medium text-center truncate">
                                  <div className="font-bold">
                                    {SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {block.startTime}-{block.endTime}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 月ビュー
  const MonthView = () => {
    // 従業員をクリックした時の処理（シフト編集モーダル表示）
    const handleEmployeeClick = (employee: Employee, date: string) => {
      setSelectedEmployee(employee);
      setSelectedDate(date);
      setEditingShift(null); // 新規作成
      setShowShiftModal(true);
    };

    // 日付をクリックした時の処理（日ビューに遷移またはクリップボード操作）
    const handleDateClick = (date: string, event?: React.MouseEvent) => {
      if (clipboardMode === 'paste') {
        // ペーストモードの場合
        handleDateClickForClipboard(date);
      } else {
        // 通常のクリックの場合、日ビューに遷移
        if (hasUnsavedChanges) {
          const confirmMessage = '未保存の変更があります。画面を切り替えると入力が削除されます。続行しますか？';
          if (!confirm(confirmMessage)) {
            return;
          }
        }
      setSelectedDate(date);
      setViewMode('day');
      }
    };

    // +N表示をクリックした時の処理（従業員一覧モーダル表示）
    const handleMoreEmployeesClick = (date: string, allEmployees: Employee[]) => {
      setSelectedDateForModal(date);
      setEmployeesForModal(allEmployees);
      setShowEmployeeListModal(true);
    };


    const getUtilizationRate = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      const confirmedShifts = shifts.filter(s => s.status === 'working');
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

      const confirmedShifts = shifts.filter(s => s.status === 'working');
      if (confirmedShifts.length === 0) return null;

      const timeSlots = confirmedShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
      if (timeSlots.length === 0) return null;

      // 時間帯をソート
      const sortedTimeSlots = timeSlots.sort((a, b) => a.start.localeCompare(b.start));
      
      // 連続する時間帯をグループ化
      const timeGroups: string[][] = [];
      let currentGroup: string[] = [];
      
      sortedTimeSlots.forEach((slot, index) => {
        if (index === 0) {
          currentGroup = [slot.start, slot.end];
        } else {
          const prevSlot = sortedTimeSlots[index - 1];
          // 前の時間帯の終了時間と現在の開始時間が同じかチェック
          if (prevSlot.end === slot.start) {
            // 連続している場合、終了時間を更新
            currentGroup[1] = slot.end;
          } else {
            // 中抜けがある場合、現在のグループを保存して新しいグループを開始
            timeGroups.push([...currentGroup]);
            currentGroup = [slot.start, slot.end];
          }
        }
      });
      
      // 最後のグループを追加
      timeGroups.push(currentGroup);
      
      // 時間帯を文字列に変換
      const timeRanges = timeGroups.map(group => `${group[0]}〜${group[1]}`);
      
      // 総労働時間を計算
      const totalMinutes = timeGroups.reduce((total, group) => {
        const startTime = group[0].split(':').map(Number);
        const endTime = group[1].split(':').map(Number);
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];
        return total + (endMinutes - startMinutes);
      }, 0);
      
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      const totalTimeStr = totalHours > 0 ? `${totalHours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}` : `${remainingMinutes}分`;
      
      // 複数の時間帯がある場合はカンマ区切りで表示
      if (timeRanges.length > 1) {
        return timeRanges.join(', ');
      } else {
        return timeRanges[0];
      }
    };

    // 日付ごとのイベントを取得
    const getEventsForDate = (date: string): CalendarEvent[] => {
      const activeEmployees = showOnlyShiftEmployees 
        ? filteredEmployees.filter(employee => {
          const shifts = getShiftsForDate(employee.id, date);
          return shifts.length > 0; // シフトがある従業員のみ表示
        })
        : filteredEmployees; // 全てのアクティブな従業員を表示
      
      // 5人以上の場合の処理
      if (activeEmployees.length > 5) {
        const displayEmployees = activeEmployees.slice(0, 4);
        const remainingCount = activeEmployees.length - 4;
        
        const events = displayEmployees.map(employee => {
          const shifts = getShiftsForDate(employee.id, date);
          const utilizationRate = getUtilizationRate(employee.id, date);
          const hasShifts = shifts.length > 0;
          const timeRange = getShiftTimeRange(employee.id, date);
          
          return {
            id: `${employee.id}-${date}`,
            title: employee.name,
            description: timeRange || '',
            status: hasShifts ? 'working' as const : 'unavailable' as const,
            backgroundColor: hasShifts ? getUtilizationColor(utilizationRate).split(' ')[0] : 'bg-gray-100',
            color: hasShifts ? getUtilizationColor(utilizationRate).split(' ')[1] : 'text-gray-700',
            onClick: () => {
              if (clipboardMode === 'copy' && hasShifts) {
                // コピーモードの場合、各シフトを選択可能にする
                shifts.forEach(shift => {
                  handleShiftClickForClipboard(shift);
                });
              } else if (clipboardMode === 'none') {
                // 通常モードの場合、シフト編集モーダルを表示
                handleEmployeeClick(employee, date);
              }
            },
            metadata: {
              employee,
              utilizationRate,
              timeRange,
              shifts
            }
          };
        });
        
        // +N表示のイベントを追加
        events.push({
          id: `more-${date}`,
          title: `+${remainingCount}人`,
            description: '',
          status: 'unavailable' as const,
          backgroundColor: 'bg-blue-100',
          color: 'text-blue-700',
          onClick: () => handleMoreEmployeesClick(date, activeEmployees),
          metadata: {
            employee: null,
            utilizationRate: 0,
            timeRange: null,
            isMoreButton: true,
            allEmployees: activeEmployees
          } as any
        });
        
        return events;
      }
      
      // 5人以下の場合は通常表示
      return activeEmployees.map(employee => {
        const shifts = getShiftsForDate(employee.id, date);
        const utilizationRate = getUtilizationRate(employee.id, date);
        const hasShifts = shifts.length > 0;
        const timeRange = getShiftTimeRange(employee.id, date);
        
        return {
          id: `${employee.id}-${date}`,
          title: employee.name,
          description: timeRange || '',
          status: hasShifts ? 'working' : 'unavailable',
            backgroundColor: hasShifts ? getUtilizationColor(utilizationRate).split(' ')[0] : 'bg-gray-100',
            color: hasShifts ? getUtilizationColor(utilizationRate).split(' ')[1] : 'text-gray-700',
          onClick: () => {
            if (clipboardMode === 'copy' && hasShifts) {
              // コピーモードの場合、各シフトを選択可能にする
              shifts.forEach(shift => {
                handleShiftClickForClipboard(shift);
              });
            } else if (clipboardMode === 'none') {
              // 通常モードの場合、シフト編集モーダルを表示
              handleEmployeeClick(employee, date);
            }
          },
            metadata: {
              employee,
              utilizationRate,
            timeRange,
            shifts
            }
          };
        });
    };

    // カスタムイベントレンダリング
    const renderEvent = (event: CalendarEvent, index: number) => {
      const { employee, utilizationRate, timeRange } = event.metadata;
      
      // 時間範囲を解析（カンマ区切りで分割）
      const timeRanges = timeRange ? timeRange.split(', ') : [];
      const hasMultipleTimeRanges = timeRanges.length > 1;
      
      // 従業員名の省略処理（6文字以上の場合）
      const displayName = employee.name.length > 5 ? employee.name.substring(0, 5) + '...' : employee.name;
      
      return (
        <div
          key={event.id}
          className={`text-xs px-2 py-1 rounded text-center font-medium cursor-pointer hover:opacity-80 transition-colors w-full flex items-center justify-center gap-1 ${
            event.metadata.utilizationRate > 0 ? event.backgroundColor : 'bg-gray-100'
          }`}
          style={{
            backgroundColor: event.backgroundColor || '#e5e7eb',
            color: event.color || '#374151',
          }}
          onClick={(e) => {
            e.stopPropagation();
            event.onClick?.();
          }}
          title={`${employee.name}${timeRange ? ` (${timeRange})` : ''}`}
        >
          {hasMultipleTimeRanges ? (
            // 複数の時間範囲がある場合：最初の時間は名前と横並び、2つ目以降は縦並び
            <div className="flex flex-col w-full">
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-xs font-medium">{displayName}</span>
                <span className="text-xs opacity-75 whitespace-nowrap">
                  {timeRanges[0]}
                </span>
              </div>
              {timeRanges.slice(1).map((range, idx) => (
                <span key={idx + 1} className="text-xs opacity-75 text-right">
                  {range}
                </span>
              ))}
            </div>
          ) : (
            // 単一の時間範囲の場合：横並び
            <div className="flex w-full items-center justify-between gap-1">
              <span className="text-xs font-medium">{displayName}</span>
              {timeRange && (
                <span className="text-xs opacity-75 whitespace-nowrap">
                  {timeRange}
                </span>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <UnifiedMonthCalendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onDateClick={(date, day, event) => handleDateClick(date, event)}
        getEventsForDate={getEventsForDate}
        renderEvent={renderEvent}
        showNavigation={true}
        showWeekdays={true}
        className=""
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* ビューモード切り替えとコントロール */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          {/* 左側：ビューモード切り替え */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Month button clicked, hasUnsavedChanges:', hasUnsavedChanges);
                  if (hasUnsavedChanges) {
                    if (confirm('未保存の変更があります。画面を切り替えると入力が削除されます。続行しますか？')) {
                      setHasUnsavedChanges(false);
                      setViewMode('month');
                    }
                  } else {
                    setViewMode('month');
                  }
                }}
                className={`px-4 py-1 rounded ${
                  viewMode === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                月
              </button>
              <button
                onClick={() => {
                  console.log('Day button clicked, hasUnsavedChanges:', hasUnsavedChanges);
                  if (hasUnsavedChanges) {
                    if (confirm('未保存の変更があります。画面を切り替えると入力が削除されます。続行しますか？')) {
                      setHasUnsavedChanges(false);
                      setViewMode('day');
                    }
                  } else {
                    setViewMode('day');
                  }
                }}
                className={`px-4 py-1 rounded ${
                  viewMode === 'day' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                日
              </button>
            </div>
          </div>

        </div>

        {/* フィルターと操作ボタン */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyShiftEmployees}
                onChange={(e) => setShowOnlyShiftEmployees(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">出勤予定者のみ表示</span>
            </label>
            
            <div className="text-xs text-gray-500">
              {displayEmployees.length}名の従業員を表示中
            </div>
          </div>
          
        </div>

        {/* クリップボード機能 */}
        <div className="fixed top-32 right-4 z-50">
          {!showClipboard ? (
            <button
              onClick={() => setShowClipboard(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              クリップボード
            </button>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">クリップボード</h3>
                <button
                  onClick={() => cancelClipboard()}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={startCopyMode}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                    clipboardMode === 'copy' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  コピー
                </button>
                
                <button
                  onClick={startPasteMode}
                  disabled={copiedShifts.length === 0}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                    clipboardMode === 'paste'
                      ? 'bg-green-600 text-white'
                      : copiedShifts.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  貼り付け
                </button>
                
                {pendingPasteShifts.length > 0 && (
                  <button
                    onClick={executeSave}
                    className="w-full py-2 px-3 rounded text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    保存
                  </button>
                )}
              </div>
              
              {clipboardMode === 'copy' && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-blue-800">
                      {selectedShifts.length > 0 ? `選択中: ${selectedShifts.length}件` : 'コピーするシフトを選択してください'}
                    </div>
                    {selectedShifts.length > 0 && (
                      <button
                        onClick={clearSelectedShifts}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        すべてクリア
                      </button>
                    )}
                  </div>
                  
                  {selectedShifts.length > 0 ? (
                    <>
                      <div className="max-h-20 overflow-y-auto space-y-1 mb-2">
                        {selectedShifts.map(shift => {
                          const employee = filteredEmployees.find(emp => emp.id === shift.employeeId);
                          return (
                            <div key={shift.id} className="flex items-center justify-between bg-white rounded px-2 py-1">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-800">
                                  {employee?.name || '不明な従業員'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                                </span>
                              </div>
                              <button
                                onClick={() => removeSelectedShift(shift.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={executeCopy}
                        className="w-full py-1 px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        コピー実行
                      </button>
                    </>
                  ) : (
                    <div className="text-blue-700 text-xs">
                      カレンダー上のシフトをクリックして選択してください
                    </div>
                  )}
                </div>
              )}
              
              {clipboardMode === 'paste' && (
                <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-green-800">
                      {pendingPasteDate ? `貼り付け先: ${new Date(pendingPasteDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}` : '貼り付け先の日付を選択してください'}
                    </div>
                    {pendingPasteDate && (
                      <button
                        onClick={() => setPendingPasteDate('')}
                        className="text-green-600 hover:text-green-800 text-xs underline"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                  
                  {pendingPasteDate ? (
                    <button
                      onClick={executePaste}
                      className="w-full py-1 px-2 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      貼り付け実行
                    </button>
                  ) : (
                    <div className="text-green-700 text-xs">
                      カレンダー上の日付をクリックして選択してください
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-700">
                    {copiedShifts.length > 0 ? 'コピー済み' : 'コピーされたシフトはありません'}
                  </div>
                  {copiedShifts.length > 0 && (
                    <button
                      onClick={() => setCopiedShifts([])}
                      className="text-gray-600 hover:text-gray-800 text-xs underline"
                    >
                      クリア
                    </button>
                  )}
                </div>
                
                {copiedShifts.length > 0 ? (
                  <>
                    <div className="text-gray-600 mb-2">
                      {copiedShifts.length}件のシフト
                    </div>
                    <div className="max-h-16 overflow-y-auto space-y-1">
                      {copiedShifts.map(shift => {
                        const employee = filteredEmployees.find(emp => emp.id === shift.employeeId);
                        return (
                          <div key={shift.id} className="bg-white rounded px-2 py-1">
                            <div className="text-xs font-medium text-gray-800">
                              {employee?.name || '不明な従業員'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-600 text-xs">
                    コピー機能を使ってシフトをコピーしてください
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 説明テキストと操作ガイド */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>空欄をクリックまたはドラッグしてシフトを登録できます</div>
          <div className="flex gap-4 text-xs">
            <span>• シフトブロックをクリック: 編集</span>
            <span>• 青いハンドルをドラッグ: 時間変更</span>
            <span>• 空欄をドラッグ: 新規作成</span>
            <span>• 時間調整ボタン: 一括延長・縮小</span>
          </div>
          <div className="flex gap-4 text-xs text-blue-600">
            <span>• クリップボード: シフトのコピー・貼り付け</span>
            <span>• コピー→日付選択→貼り付け→保存の順で操作</span>
          </div>
          <div className="flex gap-4 text-xs text-green-600">
            <span>• 重複チェック: 同じ時間の重複を防止</span>
            <span>• 自動結合: 同じステータスの連続シフトを結合</span>
          </div>
        </div>

      </div>

      {/* ビューモードに応じた表示 */}
      {viewMode === 'day' && <DayView />}
      {viewMode === 'month' && <MonthView />}

      {/* 月間集計表示 */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月 従業員集計
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    従業員名
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    出勤日数
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    当月総労働時間
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    年間累計労働時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {getEmployeeMonthlySummary().map((summary, index) => (
                  <tr key={summary.employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                      {summary.employee.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                      {summary.workingDays}日
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                      {summary.totalWorkingTime}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                      {getEmployeeYearlyWorkingTime(summary.employee.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 全体集計 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                登録従業員数: {filteredEmployees.length}名
              </div>
              <div className="text-sm text-gray-600">
                出勤予定者数: {getEmployeeMonthlySummary().filter(s => s.workingDays > 0).length}名
              </div>
              <div className="text-sm font-medium text-gray-800">
                当月総労働時間: {
                  getEmployeeMonthlySummary().reduce((total, summary) => {
                    const hours = Math.floor(summary.totalWorkingMinutes / 60);
                    const minutes = summary.totalWorkingMinutes % 60;
                    return total + hours + (minutes / 60);
                  }, 0).toFixed(1)
                }時間
              </div>
            </div>
          </div>
        </div>
      )}

      {/* シフト編集モーダル */}
      {showShiftModal && editingShift && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
              {selectedShift ? 'シフト編集' : 'シフト追加'}
            </h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">従業員</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900 font-medium">
                  {employees.find(emp => emp.id === editingShift.employeeId)?.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900">
                  {formatDate(editingShift.date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                  <select
                    value={editingShift.startTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.start}
                    onChange={(e) => setEditingShift(prev => prev ? { 
                      ...prev, 
                      startTime: e.target.value,
                      timeSlot: TIME_SLOTS.find(ts => ts.start === e.target.value)?.id || prev.timeSlot
                    } : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">終了時間</label>
                  <select
                    value={editingShift.endTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.end}
                    onChange={(e) => setEditingShift(prev => prev ? { 
                      ...prev, 
                      endTime: e.target.value
                    } : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 時間延長・縮小ボタン */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">時間調整（30分単位）</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 font-medium">延長</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes + 30;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = newMinutes % 60;
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        +30分
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes + 60;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = newMinutes % 60;
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        +1時間
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes + 120;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = newMinutes % 60;
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        +2時間
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes + 180;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = newMinutes % 60;
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        +3時間
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 font-medium">縮小</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes - 30;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = ((newMinutes % 60) + 60) % 60;
                          if (newHours < 0) return; // 負の時間は許可しない
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        -30分
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes - 60;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = ((newMinutes % 60) + 60) % 60;
                          if (newHours < 0) return; // 負の時間は許可しない
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        -1時間
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes - 120;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = ((newMinutes % 60) + 60) % 60;
                          if (newHours < 0) return; // 負の時間は許可しない
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        -2時間
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingShift.startTime || !editingShift.endTime) return;
                          const currentEnd = editingShift.endTime;
                          const [hours, minutes] = currentEnd.split(':').map(Number);
                          const newMinutes = minutes - 180;
                          const newHours = hours + Math.floor(newMinutes / 60);
                          const finalMinutes = ((newMinutes % 60) + 60) % 60;
                          if (newHours < 0) return; // 負の時間は許可しない
                          const newEndTime = `${newHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
                          setEditingShift(prev => prev ? { ...prev, endTime: newEndTime } : null);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        -3時間
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">ステータス</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                <input
                      type="radio"
                      name="status"
                      value="working"
                      checked={editingShift.status === 'working'}
                      onChange={(e) => setEditingShift(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">出勤</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="unavailable"
                      checked={editingShift.status === 'unavailable'}
                      onChange={(e) => setEditingShift(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">出勤不可</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={editingShift.notes || ''}
                  onChange={(e) => setEditingShift(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="備考を入力"
                />
              </div>

              {/* 時間範囲の可視化 */}
              {editingShift.startTime && editingShift.endTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-900">時間範囲:</span>
                      <span className="text-lg font-semibold text-blue-900">
                      {editingShift.startTime} - {editingShift.endTime}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {(() => {
                        const start = editingShift.startTime;
                        const end = editingShift.endTime;
                        if (start && end) {
                          const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
                          const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
                          const duration = endMinutes - startMinutes;
                          const hours = Math.floor(duration / 60);
                          const minutes = duration % 60;
                          if (hours > 0 && minutes > 0) {
                            return `${hours}時間${minutes}分`;
                          } else if (hours > 0) {
                            return `${hours}時間`;
                          } else {
                            return `${minutes}分`;
                          }
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleShiftSave}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                保存
              </button>
              {selectedShift && (
                <button
                  onClick={handleDeleteShift}
                  className="bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 従業員一覧モーダル */}
      {showEmployeeListModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(selectedDateForModal).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}の従業員一覧 ({employeesForModal.length}人)
              </h3>
              <button
                onClick={() => setShowEmployeeListModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {employeesForModal.map(employee => {
                  const shifts = employee.shifts.filter(shift => shift.date === selectedDateForModal);
                  const hasShifts = shifts.length > 0;
                  const timeRange = (() => {
                    const shifts = employee.shifts.filter(shift => shift.date === selectedDateForModal);
                    if (shifts.length === 0) return null;

                    const confirmedShifts = shifts.filter(s => s.status === 'working');
                    if (confirmedShifts.length === 0) return null;

                    const timeSlots = confirmedShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
                    if (timeSlots.length === 0) return null;

                    const startTime = timeSlots[0]?.start;
                    const endTime = timeSlots[timeSlots.length - 1]?.end;
                    
                    return `${startTime}〜${endTime}`;
                  })();
                  
                  return (
                    <div
                      key={employee.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-all ${
                        hasShifts 
                          ? 'bg-lime-50 border-lime-200 hover:bg-lime-100' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setSelectedDate(selectedDateForModal);
                        setEditingShift(null); // 新規作成
                        setShowShiftModal(true);
                        setShowEmployeeListModal(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            hasShifts ? 'bg-lime-400' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {hasShifts ? (
                            <div>
                              <p className="text-sm font-medium text-lime-700">出勤</p>
                              {timeRange && (
                                <p className="text-xs text-lime-600">{timeRange}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">出勤不可</p>
                          )}
                        </div>
                      </div>
                      
                      {hasShifts && shifts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-lime-200">
                          <div className="flex flex-wrap gap-1">
                            {shifts.map(shift => (
                              <span
                                key={shift.id}
                                className="text-xs bg-lime-200 text-lime-800 px-2 py-1 rounded"
                              >
                                {TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || shift.timeSlot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowEmployeeListModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}