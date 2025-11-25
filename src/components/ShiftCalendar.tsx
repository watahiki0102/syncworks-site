'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toLocalDateString } from '@/utils/dateTimeUtils';
import { TIME_SLOTS, SHIFT_STATUS } from '@/constants/calendar';
import UnifiedMonthCalendar, { CalendarDay, CalendarEvent } from './UnifiedMonthCalendar';
import TimeRangeDisplaySelector from './TimeRangeDisplaySelector';
import ShiftModal, { ShiftModalData } from './ShiftModal';
import { fetchHolidays, type Holiday } from '@/utils/holidayUtils';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(isBetween);
dayjs.extend(minMax);

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
  startTime?: string;
  endTime?: string;
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
  timeSlot?: string;
}

interface ShiftVisualStyle {
  bg: string;
  text: string;
  icon?: string;
  iconClass?: string;
  isUnsaved: boolean;
  status: 'working' | 'unavailable' | 'mixed' | 'none';
  borderClass?: string;
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
  cases?: any[]; // UnifiedCase[]を追加
  truckSchedules?: TruckSchedule[];
  onUpdateShift: (employeeId: string, shift: EmployeeShift) => void;
  onAddShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  onDeleteShift: (employeeId: string, shiftId: string) => void;
  onDeleteMultipleShifts?: (employeeId: string, shiftIds: string[]) => void;
  onUpdateTruckSchedules?: (schedules: TruckSchedule[]) => void;
  timeRangeType?: 'morning' | 'afternoon' | 'evening' | 'full' | 'custom';
  customStartTime?: string;
  customEndTime?: string;
  showTimeRangeSelector?: boolean;
  displayStartTime?: number;
  displayEndTime?: number;
  onDisplayTimeRangeChange?: (start: number, end: number) => void;
  showClipboard?: boolean;
  setShowClipboard?: (show: boolean) => void;
  showEmployeeSummary?: boolean;
  setShowEmployeeSummary?: (show: boolean) => void;
  clipboardMode?: 'copy' | 'paste' | 'none' | null;
  setClipboardMode?: (mode: 'copy' | 'paste' | 'none' | null) => void;
  clipboardData?: any;
  setClipboardData?: (data: any) => void;
  onDateClickForClipboard?: (date: string) => void;
  selectedShifts?: EmployeeShift[];
  setSelectedShifts?: (shifts: EmployeeShift[] | ((prev: EmployeeShift[]) => EmployeeShift[])) => void;
  copiedShifts?: EmployeeShift[];
  setCopiedShifts?: (shifts: EmployeeShift[]) => void;
  pendingPasteDates?: string[];
  setPendingPasteDates?: (dates: string[] | ((prev: string[]) => string[])) => void;
  onShiftClickForClipboard?: (shift: EmployeeShift) => void;
  unsavedShiftIds?: Set<string>;
  onSave?: () => void;
  onCurrentMonthChange?: (year: number, month: number) => void;
}

type ViewMode = 'day' | 'month';

export default function ShiftCalendar({
  employees,
  truckSchedules: _truckSchedules = [],
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  onDeleteMultipleShifts,
  onUpdateTruckSchedules: _onUpdateTruckSchedules,
  timeRangeType = 'full',
  customStartTime = '06:00',
  customEndTime = '24:00',
  showTimeRangeSelector = false,
  displayStartTime = 8,
  displayEndTime = 20,
  onDisplayTimeRangeChange,
  showClipboard,
  setShowClipboard,
  showEmployeeSummary,
  setShowEmployeeSummary,
  clipboardMode,
  setClipboardMode,
  clipboardData: _clipboardData,
  setClipboardData: _setClipboardData,
  onDateClickForClipboard,
  selectedShifts,
  setSelectedShifts,
  copiedShifts: _copiedShifts,
  setCopiedShifts: _setCopiedShifts,
  pendingPasteDates,
  setPendingPasteDates,
  onShiftClickForClipboard,
  unsavedShiftIds,
  onSave,
  onCurrentMonthChange
}: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // 前回の年月を記録して無限ループを防ぐ
  const lastNotifiedMonthRef = useRef<{ year: number; month: number } | null>(null);
  
  // 現在表示中の月が変更されたら親コンポーネントに通知
  useEffect(() => {
    if (onCurrentMonthChange && viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // 前回と同じ年月の場合は通知しない
      const lastNotified = lastNotifiedMonthRef.current;
      if (lastNotified && lastNotified.year === year && lastNotified.month === month) {
        return;
      }
      
      // 年月が変更された場合のみ通知
      lastNotifiedMonthRef.current = { year, month };
      onCurrentMonthChange(year, month);
    }
  }, [currentDate, viewMode]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [highlightedEmployee, setHighlightedEmployee] = useState<Employee | null>(null); // 青枠表示用
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [editingShift, setEditingShift] = useState<EmployeeShift | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<'edit' | 'create' | 'bulk' | 'range'>('edit');

  // 祝日データを取得
  const [_holidays, setHolidays] = useState<Holiday[]>([]);
  useEffect(() => {
    fetchHolidays().then(setHolidays);
  }, []);
  const [dragState, setDragState] = useState<{
    currentEmployee: string;
    startTime: string;
    currentTime: string;
  } | null>(null);
  const [barResizeState, setBarResizeState] = useState<{
    employeeId: string;
    blockIndex: number;
    direction: 'start' | 'end';
    originalStartTime: string;
    originalEndTime: string;
    currentTime: string;
  } | null>(null);
  const [recentlyResized, setRecentlyResized] = useState(false); // リサイズ完了後の状態
  const [_hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // 月ビュー展開状態管理
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set()); // 複数の日付を展開可能に変更
  const [allDatesExpanded, setAllDatesExpanded] = useState<boolean>(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set()); // 展開された週を管理

  // マージが必要かどうかをチェックする関数
  const needsMerging = (employeeId: string, date: string): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {return false;}
    
    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    if (dayShifts.length < 2) {return false;}
    
    // ソートして連続するシフトがあるかチェック
    const sortedShifts = [...dayShifts].sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });
    
    // 連続する同じステータスのシフトがあるかチェック
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const currentShift = sortedShifts[i];
      const nextShift = sortedShifts[i + 1];
      const currentEndTime = currentShift.endTime || TIME_SLOTS.find(ts => ts.id === currentShift.timeSlot)?.end || '';
      const nextStartTime = nextShift.startTime || TIME_SLOTS.find(ts => ts.id === nextShift.timeSlot)?.start || '';
      
      if (currentShift.status === nextShift.status && currentEndTime === nextStartTime) {
        return true; // マージが必要
      }
    }
    
    return false; // マージ不要
  };
  
  // 前回のemployeesの状態を記録して無限ループを防ぐ
  const previousEmployeesRef = useRef<string>('');
  // マージ処理の実行中フラグ（無限ループを防ぐ）
  const isMergingRef = useRef<boolean>(false);
  
  // シフト追加後に自動的にシフトを結合する
  useEffect(() => {
    // マージ処理が実行中の場合はスキップ
    if (isMergingRef.current) {
      return;
    }
    
    // employeesの状態をシリアライズして比較
    const employeesKey = JSON.stringify(
      employees.map(emp => ({
        id: emp.id,
        shiftsCount: emp.shifts.length,
        shifts: emp.shifts.map(s => ({ id: s.id, date: s.date, timeSlot: s.timeSlot }))
      }))
    );
    
    // 前回と同じ状態の場合はスキップ（無限ループを防ぐ）
    if (previousEmployeesRef.current === employeesKey) {
      return;
    }
    
    // マージが必要な場合のみ実行
    let hasMerges = false;
    const needsMergeCheck = employees.some(employee => {
      const dates = [...new Set(employee.shifts.map(shift => shift.date))];
      return dates.some(date => needsMerging(employee.id, date));
    });
    
    if (!needsMergeCheck) {
      // マージが不要な場合は、前回の状態を更新
      previousEmployeesRef.current = employeesKey;
      return;
    }
    
    // マージ処理開始
    isMergingRef.current = true;
    
    employees.forEach(employee => {
      const dates = [...new Set(employee.shifts.map(shift => shift.date))];
      dates.forEach(date => {
        if (needsMerging(employee.id, date)) {
          const merged = mergeAdjacentShifts(employee.id, date);
          if (merged) {
            hasMerges = true;
          }
        }
      });
    });
    
    // マージ処理完了
    isMergingRef.current = false;
    
    // マージが実行された場合、employeesが更新されるため、
    // previousEmployeesRefを更新しない（次のレンダリングで再度チェック）
    // マージが実行されなかった場合のみ、前回の状態を更新
    if (!hasMerges) {
      previousEmployeesRef.current = employeesKey;
    }
  }, [employees]); // employeesの変更を監視

  // グローバルなマウスイベントリスナー
  useEffect(() => {
    const handleGlobalMouseUp = (_e: MouseEvent) => {
      if (dragState) {
        handleMouseUp();
      } else if (barResizeState) {
        handleBarResizeEnd();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // リサイズ中またはバーリサイズ中のみ処理
      if (!barResizeState) {return;}
      
      // 時間セルまたはその子要素から時間スロットIDを取得
      let timeSlotElement = target;
      let depth = 0;
      while (timeSlotElement && !timeSlotElement.dataset.timeSlotId && depth < 10) {
        timeSlotElement = timeSlotElement.parentElement as HTMLElement;
        depth++;
        if (!timeSlotElement || timeSlotElement.classList.contains('calendar-grid')) {
          break;
        }
      }
      
      if (timeSlotElement && timeSlotElement.dataset.timeSlotId) {
        const timeSlotId = timeSlotElement.dataset.timeSlotId;
        
        // barResizeStateの処理
        if (barResizeState) {
          handleBarResizeEnter(barResizeState.employeeId, timeSlotId);
        }
        
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [dragState, barResizeState]);

  // 日付から週を取得するヘルパー関数
  const getWeekKey = (date: string) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const weekNumber = Math.ceil((dateObj.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${weekNumber}`;
  };

  // すべての日付を展開/縮小する処理
  const handleExpandAllDates = () => {
    setAllDatesExpanded(true);
    setExpandedDates(new Set()); // 個別展開をクリア
    setCollapsedDates(new Set()); // 個別縮小もクリア
    setExpandedWeeks(new Set()); // 週展開もクリア
  };

  const handleCollapseAllDates = () => {
    setAllDatesExpanded(false);
    setExpandedDates(new Set()); // 個別展開もクリア
    setCollapsedDates(new Set()); // 個別縮小もクリア
    setExpandedWeeks(new Set()); // 週展開もクリア
  };

  // 個別の日付を縮小する関数
  const handleCollapseDate = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      newSet.delete(date); // 個別展開から削除
      return newSet;
    });
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(date);
      return newSet;
    });
  };

  // 従業員をクリックした時の処理（日ビューに遷移）
  const handleEmployeeClick = (employee: Employee, date: string) => {
    setSelectedEmployee(employee);
    setHighlightedEmployee(employee); // 青枠表示用
    setSelectedDate(date);
    setViewMode('day'); // 日ビューに遷移
  };
  // クリップボード関連の状態はプロパティから受け取る

  const filteredEmployees = employees.filter(emp => emp.status === 'active');

  // 共通のシフトデータ取得関数
  const getShiftsForDate = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return [];
    }
    
    const shifts = employee.shifts.filter(shift => shift.date === date);
    
    return shifts;
  };

  const DAY_CROSSING_TAG_REMOVAL_REGEX = /\s*\(日跨ぎ-(?:\d+日目|中日|起点|終点)\)\s*/g;

  const stripDayCrossingTag = (notes?: string) =>
    notes ? notes.replace(DAY_CROSSING_TAG_REMOVAL_REGEX, '').trim() : '';

  const resolveShiftTimeRange = (shift: EmployeeShift) => {
    const timeSlot = TIME_SLOTS.find(ts => ts.id === shift.timeSlot);
    const startTime = shift.startTime || timeSlot?.start || '';
    const endTime = shift.endTime || timeSlot?.end || '';
    return { startTime, endTime };
  };

  const isValidShiftDuration = (shift: EmployeeShift) => {
    const { startTime, endTime } = resolveShiftTimeRange(shift);
    if (!startTime || !endTime) {
      return false;
    }
    return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
  };

  const getRelatedDayCrossingShifts = (employeeId: string, baseNotes: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {return [];}

    return employee.shifts.filter(shift =>
      shift.notes &&
      shift.notes.includes('日跨ぎ') &&
      stripDayCrossingTag(shift.notes) === baseNotes
    );
  };

  /**
   * 日マタギシフトグループ全体を取得する関数
   * クリップボード機能で使用：1つの日マタギシフトをクリックすると、そのグループ全体を返す
   */
  const getAllShiftsInDayCrossingGroup = (employeeId: string, clickedShift: EmployeeShift): EmployeeShift[] => {
    // 日マタギシフトでない場合は、そのシフトのみを返す
    if (!clickedShift.notes || !clickedShift.notes.includes('日跨ぎ')) {
      return [clickedShift];
    }

    // 日マタギシフトのベースノート（タグを除去したもの）を取得
    const baseNotes = stripDayCrossingTag(clickedShift.notes);

    // buildDayCrossingDateGroupsを使用して、クリックされた日付に連続するグループのみを取得
    const dateGroups = buildDayCrossingDateGroups(employeeId, baseNotes, clickedShift.date);

    if (dateGroups.length === 0) {
      return [clickedShift];
    }

    // dateGroupsの日付範囲に該当する全シフトを取得
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return [clickedShift];
    }

    const groupDates = new Set(dateGroups.map(g => g.date));
    const allGroupShifts = employee.shifts.filter(shift =>
      shift.notes &&
      shift.notes.includes('日跨ぎ') &&
      stripDayCrossingTag(shift.notes) === baseNotes &&
      groupDates.has(shift.date)
    );

    return allGroupShifts;
  };

  const buildDayCrossingDateGroups = (
    employeeId: string,
    baseNotes: string,
    targetDate?: string
  ): Array<{ date: string; start: string; end: string }> => {
    const relatedShifts = getRelatedDayCrossingShifts(employeeId, baseNotes)
      .map(shift => {
        const { startTime, endTime } = resolveShiftTimeRange(shift);
        const normalizedStart = startTime || '00:00';
        const normalizedEnd = endTime || '24:00';
        return {
          shift,
          startTime: normalizedStart,
          endTime: normalizedEnd,
        };
      });

    if (relatedShifts.length === 0) {
      return [];
    }

    relatedShifts.sort((a, b) => {
      const dateDiff = new Date(a.shift.date).getTime() - new Date(b.shift.date).getTime();
      if (dateDiff !== 0) {return dateDiff;}
      return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
    });

    let contiguousShifts = relatedShifts;

    if (targetDate) {
      const targetIndex = relatedShifts.findIndex(item => item.shift.date === targetDate);
      if (targetIndex !== -1) {
        let startIndex = targetIndex;
        while (startIndex > 0) {
          const current = relatedShifts[startIndex];
          const previous = relatedShifts[startIndex - 1];
          const dayDiff = dayjs(current.shift.date).diff(dayjs(previous.shift.date), 'day');
          if (dayDiff > 1) {break;}
          startIndex--;
        }

        let endIndex = targetIndex;
        while (endIndex < relatedShifts.length - 1) {
          const current = relatedShifts[endIndex];
          const next = relatedShifts[endIndex + 1];
          const dayDiff = dayjs(next.shift.date).diff(dayjs(current.shift.date), 'day');
          if (dayDiff > 1) {break;}
          endIndex++;
        }

        contiguousShifts = relatedShifts.slice(startIndex, endIndex + 1);
      }
    }

    const dateMap = new Map<string, { date: string; start: string; end: string }>();
    contiguousShifts.forEach(item => {
      const existing = dateMap.get(item.shift.date);
      if (!existing) {
        dateMap.set(item.shift.date, {
          date: item.shift.date,
          start: item.startTime,
          end: item.endTime,
        });
      } else {
        if (parseTimeToMinutes(item.startTime) < parseTimeToMinutes(existing.start)) {
          existing.start = item.startTime;
        }
        if (parseTimeToMinutes(item.endTime) > parseTimeToMinutes(existing.end)) {
          existing.end = item.endTime;
        }
      }
    });

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // 日跨ぎシフト専用のブロック取得関数
  const getDayCrossingShiftBlocks = (employeeId: string, _date: string, dayShifts: EmployeeShift[]): Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: 'working' | 'unavailable';
    customerName?: string;
    notes?: string;
    startIndex: number;
    endIndex: number;
    isDayCrossing?: boolean;
    originalStartTime?: string;
    originalEndTime?: string;
  }> => {
    const blocks: Array<{
      id: string;
      startTime: string;
      endTime: string;
      status: 'working' | 'unavailable';
      customerName?: string;
      notes?: string;
      startIndex: number;
      endIndex: number;
      isDayCrossing?: boolean;
      originalStartTime?: string;
      originalEndTime?: string;
    }> = [];

    const dayCrossingShifts = dayShifts.filter(shift => shift.notes && shift.notes.includes('日跨ぎ'));

    if (dayCrossingShifts.length === 0) {
      return blocks;
    }

    dayCrossingShifts.forEach(shift => {
      const baseNotes = stripDayCrossingTag(shift.notes);
      const { startTime, endTime } = resolveShiftTimeRange(shift);

      if (!startTime || !endTime) {
        return;
      }

      if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
        return;
      }

      const timeSlotIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);

      const fallbackIndex = timeSlotIndex >= 0 ? timeSlotIndex : 0;
      const actualStartIndex = startIndex >= 0 ? startIndex : fallbackIndex;
      const actualEndIndex = endIndex >= 0 ? endIndex : fallbackIndex;

      const dateGroups = buildDayCrossingDateGroups(employeeId, baseNotes, shift.date);
      let originalStartLabel: string | undefined;
      let originalEndLabel: string | undefined;

      if (dateGroups.length > 0) {
        const totalDays = dateGroups.length;
        const currentIndex = dateGroups.findIndex(group => group.date === shift.date);

        if (currentIndex !== -1) {
          originalStartLabel = `${currentIndex + 1}日目 ${dateGroups[currentIndex].start}`;

          if (currentIndex === totalDays - 1) {
            originalEndLabel = `${currentIndex + 1}日目 ${dateGroups[currentIndex].end}`;
          } else {
            const lastGroup = dateGroups[totalDays - 1];
            originalEndLabel = `${totalDays}日目 ${lastGroup.end}`;
          }
        } else {
          originalStartLabel = `1日目 ${dateGroups[0].start}`;
          originalEndLabel = `${totalDays}日目 ${dateGroups[totalDays - 1].end}`;
        }
      }

      const block = {
        id: shift.id,
        startTime,
        endTime,
        status: shift.status,
        customerName: shift.customerName,
        notes: baseNotes,
        startIndex: actualStartIndex,
        endIndex: actualEndIndex,
        isDayCrossing: true,
        originalStartTime: originalStartLabel,
        originalEndTime: originalEndLabel,
      };

      blocks.push(block);
    });

    return blocks;
  };

  // シフトブロックを取得する関数（連続するシフトをグループ化）
  const getShiftBlocks = (employeeId: string, date: string): Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: 'working' | 'unavailable';
    customerName?: string;
    notes?: string;
    startIndex: number;
    endIndex: number;
    isDayCrossing?: boolean;
    originalStartTime?: string;
    originalEndTime?: string;
  }> => {
    const dayShifts = getShiftsForDate(employeeId, date);

    // 日跨ぎシフトの検出と処理
    const dayCrossingShifts = dayShifts.filter(shift => 
      shift.notes && shift.notes.includes('日跨ぎ')
    );
    
    if (dayCrossingShifts.length > 0) {
      // 日跨ぎシフトの場合は特別な表示処理
      return getDayCrossingShiftBlocks(employeeId, date, dayShifts);
    }

    // 重複したシフトをチェックして警告
    const uniqueShifts = new Map();
    const duplicateShifts: string[] = [];
    
    dayShifts.forEach(shift => {
      const { startTime, endTime } = resolveShiftTimeRange(shift);
      const key = `${startTime}-${endTime}-${shift.status}`;
      if (uniqueShifts.has(key)) {
        duplicateShifts.push(shift.id);
      } else {
        uniqueShifts.set(key, shift);
      }
    });

    let processedShifts = dayShifts;
    if (duplicateShifts.length > 0) {
      processedShifts = Array.from(uniqueShifts.values());
    }

    const validShifts = processedShifts.filter(isValidShiftDuration);

    if (validShifts.length === 0) {
      return [];
    }

    // 単一シフトの場合はstartTimeとendTimeをそのまま使用（ブロック化不要）
    if (validShifts.length === 1) {
      const shift = validShifts[0];
      const { startTime: shiftStartTime, endTime: shiftEndTime } = resolveShiftTimeRange(shift);

      if (!shiftStartTime || !shiftEndTime) {
        return [];
      }

      const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
      const fallbackIndex = timeIndex >= 0 ? timeIndex : 0;

      // 開始時間と終了時間から正しいインデックスを計算
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === shiftStartTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === shiftEndTime);

      const block = {
        id: shift.id,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        status: shift.status,
        customerName: shift.customerName,
        notes: shift.notes,
        startIndex: startIndex >= 0 ? startIndex : fallbackIndex,
        endIndex: endIndex >= 0 ? endIndex : fallbackIndex,
        isDayCrossing: false,
        originalStartTime: undefined,
        originalEndTime: undefined,
      };
      
      return [block];
    }

    // 連続するシフトをブロック化（複数シフトの場合のみ）
    const sortedShifts = [...validShifts].sort((a, b) => {
      const { startTime: startA } = resolveShiftTimeRange(a);
      const { startTime: startB } = resolveShiftTimeRange(b);
      return parseTimeToMinutes(startA) - parseTimeToMinutes(startB);
    });

    const shiftBlocks: Array<{
      id: string;
      startTime: string;
      endTime: string;
      status: 'working' | 'unavailable';
      customerName?: string;
      notes?: string;
      startIndex: number;
      endIndex: number;
      isDayCrossing?: boolean;
      originalStartTime?: string;
      originalEndTime?: string;
    }> = [];

    let currentBlock: any = null;

    sortedShifts.forEach((shift, _shiftIndex) => {
      const { startTime: shiftStartTime, endTime: shiftEndTime } = resolveShiftTimeRange(shift);

      if (!shiftStartTime || !shiftEndTime) {
        return;
      }

      const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
      const fallbackIndex = timeIndex >= 0 ? timeIndex : 0;

      // 開始時間と終了時間から正しいインデックスを計算
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === shiftStartTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === shiftEndTime);
      const actualStartIndex = startIndex >= 0 ? startIndex : fallbackIndex;
      const actualEndIndex = endIndex >= 0 ? endIndex : fallbackIndex;

      if (!currentBlock) {
        currentBlock = {
          id: shift.id,
          startTime: shiftStartTime,
          endTime: shiftEndTime,
          status: shift.status as 'working' | 'unavailable',
          customerName: shift.customerName,
          notes: shift.notes,
          startIndex: actualStartIndex,
          endIndex: actualEndIndex,
          isDayCrossing: false,
          originalStartTime: undefined,
          originalEndTime: undefined,
        };
      } else if (
        currentBlock.status === shift.status &&
        (
          // 連続する時間帯
          currentBlock.endIndex === actualStartIndex - 1 ||
          // 重複する時間帯（同じ開始時間または終了時間が重複）
          currentBlock.endIndex === actualStartIndex ||
          currentBlock.startIndex === actualStartIndex ||
          currentBlock.endIndex >= actualStartIndex
        )
      ) {
        // 連続するシフトまたは重複するシフトを結合
        // より長い時間帯に拡張

        // 開始時間は早い方を、終了時間は遅い方を採用
        const mergedStartIndex = Math.min(currentBlock.startIndex, actualStartIndex);
        const mergedEndIndex = Math.max(currentBlock.endIndex, actualEndIndex);
        
        currentBlock.startIndex = mergedStartIndex;
        currentBlock.endIndex = mergedEndIndex;
        currentBlock.startTime = TIME_SLOTS[mergedStartIndex]?.start || currentBlock.startTime;
        currentBlock.endTime = TIME_SLOTS[mergedEndIndex]?.end || currentBlock.endTime;
      } else {
        shiftBlocks.push(currentBlock);
        currentBlock = {
          id: shift.id,
          startTime: shiftStartTime,
          endTime: shiftEndTime,
          status: shift.status as 'working' | 'unavailable',
          customerName: shift.customerName,
          notes: shift.notes,
          startIndex: actualStartIndex,
          endIndex: actualEndIndex,
          isDayCrossing: false,
          originalStartTime: undefined,
          originalEndTime: undefined,
        };
      }
    });

    if (currentBlock) {
      shiftBlocks.push(currentBlock);
    }

    return shiftBlocks;
  };

  // 時間文字列を分に変換するヘルパー関数
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleShiftAdd = (newShift: Omit<EmployeeShift, 'id'>) => {
    onAddShift(newShift.employeeId, newShift);
  };

  const handleShiftDelete = (shiftId: string) => {
    const employee = employees.find(emp => emp.shifts.some(shift => shift.id === shiftId));
    if (employee) {
      onDeleteShift(employee.id, shiftId);
    }
  };

  // 時間帯に基づいてTIME_SLOTSをフィルタリング
  const getFilteredTimeSlots = () => {
    let filteredSlots: typeof TIME_SLOTS = TIME_SLOTS;

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

  // シフトが入っている従業員のみを表示（日ビュー用）
  const displayEmployees = filteredEmployees.filter(employee =>
    employee.shifts.some(shift => shift.date === selectedDate)
  );

  const getShiftAtDateTime = (employeeId: string, date: string, timeSlot: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {return null;}
    
    return employee.shifts.find(shift => 
      shift.date === date && shift.timeSlot === timeSlot
    );
  };

  const isBreakTime = (_timeSlot: string) => {
    // 休憩時間の設定を削除（12時から13時も通常時間として表示）
    return false;
  };

  const handleCellClick = (employeeId: string, date: string, timeSlot: string) => {
    const existingShift = getShiftAtDateTime(employeeId, date, timeSlot);
    
    // コピーモードの場合
    if (clipboardMode === 'copy' && existingShift && onShiftClickForClipboard) {
      onShiftClickForClipboard(existingShift);
      return;
    }
    
    // ペーストモードの場合は何もしない（貼り付けは日付単位で行う）
    if (clipboardMode === 'paste') {
      return;
    }
    
    // 通常モード：モーダルを開く
    if (existingShift) {
      setShiftModalMode('edit');
      setSelectedShift(existingShift);
      setEditingShift({ ...existingShift });
    } else {
      setShiftModalMode('create');
      setSelectedShift(null);
      setEditingShift({
        id: '',
        employeeId,
        date,
        timeSlot,
        status: 'working',
        notes: '',
      });
    }
    setShowShiftModal(true);
  };

  // シフトの重複チェック関数（隣接シフト結合を考慮）
  const checkShiftOverlap = (
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeShiftId?: string | string[],
    currentStatus?: string,
    isDayCrossingShift: boolean = false
  ) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {return false;}

    // 除外するシフトIDのセットを作成
    const excludeIds = Array.isArray(excludeShiftId) 
      ? new Set(excludeShiftId) 
      : excludeShiftId 
        ? new Set([excludeShiftId]) 
        : new Set<string>();

    const dayShifts = employee.shifts.filter(shift => 
      shift.date === date && !excludeIds.has(shift.id)
    );

    const hasOverlap = dayShifts.some(shift => {
      const shiftStart = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
      const shiftEnd = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';

      // 時間の重複をチェック（完全に同じ時間帯は除外）
      const timeOverlap = (startTime < shiftEnd && endTime > shiftStart);
      if (!timeOverlap) {
        return false;
      }

      const existingIsDayCrossing = !!(shift.notes && shift.notes.includes('日跨ぎ'));

      // 既存が日跨ぎシフトの場合、通常シフトとの共存は許可し、
      // 新規も日跨ぎシフトの場合のみ重複として扱う
      if (existingIsDayCrossing) {
        return isDayCrossingShift;
      }

      // 隣接シフトの結合を許可するため、同じステータスで隣接している場合は重複としない
      const isAdjacent = (endTime === shiftStart) || (startTime === shiftEnd);

      // 同じステータスの場合のみ重複として扱う
      // currentStatusがundefinedの場合は、既存シフトのステータスと比較しない（常に重複として扱わない）
      const statusMatch = currentStatus ? shift.status === currentStatus : false;

      // 隣接している場合は重複としない
      const overlap = timeOverlap && statusMatch && !isAdjacent;

      return overlap;
    });

    return hasOverlap;
  };

  // 同じステータスのシフトを結合する関数（マージが実行されたかどうかを返す）
  const mergeAdjacentShifts = (employeeId: string, date: string): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {return false;}

    const dayShifts = employee.shifts.filter(shift => shift.date === date);

    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });

    // 同じステータスの連続するシフトを結合
    let currentGroup: EmployeeShift[] = [];
    let hasMerges = false;

    sortedShifts.forEach((shift, _index) => {
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
            hasMerges = true;
            
            const firstShift = currentGroup[0];
            const lastShift = currentGroup[currentGroup.length - 1];
            const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
            const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
            
            // 既存のシフトを削除
            currentGroup.forEach(s => {
              onDeleteShift(employeeId, s.id);
            });
            
            // 結合されたシフトを作成
            const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
            const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);
            
            if (startIndex !== -1 && endIndex !== -1) {
              const newShift: Omit<EmployeeShift, 'id'> = {
                employeeId,
                date,
                timeSlot: TIME_SLOTS[startIndex].id,
                status: firstShift.status,
                customerName: firstShift.customerName,
                notes: firstShift.notes,
                startTime,
                endTime,
              };
              handleShiftAdd(newShift);
            }
          }
          currentGroup = [shift];
        }
      }
    });

    // 最後のグループも処理
    if (currentGroup.length > 1) {
      hasMerges = true;
      
      const firstShift = currentGroup[0];
      const lastShift = currentGroup[currentGroup.length - 1];
      const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
      const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
      
      // 既存のシフトを削除
      currentGroup.forEach(s => {
        onDeleteShift(employeeId, s.id);
      });
      
      // 結合されたシフトを作成
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === startTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === endTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const newShift: Omit<EmployeeShift, 'id'> = {
          employeeId,
          date,
          timeSlot: TIME_SLOTS[startIndex].id,
          status: firstShift.status,
          customerName: firstShift.customerName,
          notes: firstShift.notes,
          startTime,
          endTime,
        };
        handleShiftAdd(newShift);
      }
    }
    
    return hasMerges;
  };

  const handleMouseDown = (employeeId: string, _date: string, timeSlot: string) => {
    setDragState({
      currentEmployee: employeeId,
      startTime: timeSlot,
      currentTime: timeSlot,
    });
  };

  const handleMouseEnter = (employeeId: string, _date: string, timeSlot: string) => {
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

        // ドラッグした範囲にシフトを作成（長さに関わらず統一）
        const startTimeSlot = filteredTimeSlots[minIndex];
        const endTimeSlot = filteredTimeSlots[maxIndex];
        const startTime = startTimeSlot.start;
        const endTime = endTimeSlot.end;
        
        // 重複チェック：ドラッグした時間範囲全体で既存シフトとの重複をチェック
        
        if (checkShiftOverlap(dragState.currentEmployee, selectedDate, startTime, endTime, undefined, 'working')) {
          alert('選択した時間帯に既にシフトが登録されています。時間を調整してください。');
          setDragState(null);
          return;
        }
        
        // 重複がない場合のみ、各時間スロットにシフトを作成
        const shiftsToCreate: Omit<EmployeeShift, 'id'>[] = [];
        
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
              startTime: startTime,
              endTime: endTime,
            };
            shiftsToCreate.push(newShift);
          }
        }
        
        // 全てのシフトを一括作成
        shiftsToCreate.forEach((shift, _index) => {
          handleShiftAdd(shift);
        });
        
        // 状態をクリア
        setDragState(null);
      }
    }
    setDragState(null);
  };



  // バーリサイズ用の関数
  const handleBarResizeEnter = (employeeId: string, timeSlotId: string) => {
    if (!barResizeState) {return;}
    if (barResizeState.employeeId !== employeeId) {return;}
    
    const timeSlot = TIME_SLOTS.find(ts => ts.id === timeSlotId);
    if (!timeSlot) {return;}
    
    // 最小30分の確保のみチェック（時間の拡大・縮小両方を許可）
    if (barResizeState.direction === 'start') {
      const originalEndTime = barResizeState.originalEndTime;
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === originalEndTime);
      const currentStartIndex = TIME_SLOTS.findIndex(ts => ts.start === timeSlot.start);
      
      // 最小30分（1スロット）を確保
      if (currentStartIndex > endIndex) {
        return; // 開始時間が終了時間を超えてはいけない
      }
    }
    
    if (barResizeState.direction === 'end') {
      const originalStartTime = barResizeState.originalStartTime;
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === originalStartTime);
      const currentEndIndex = TIME_SLOTS.findIndex(ts => ts.end === timeSlot.end);
      
      // 最小30分（1スロット）を確保
      if (currentEndIndex < startIndex) {
        return; // 終了時間が開始時間より前になってはいけない
      }
    }
    
    const newTime = barResizeState.direction === 'start' ? timeSlot.start : timeSlot.end;
    
    setBarResizeState(prev => prev ? {
      ...prev,
      currentTime: newTime,
    } : null);
  };

  const handleBarResizeEnd = () => {
    if (!barResizeState) {return;}
    
    const employee = employees.find(emp => emp.id === barResizeState.employeeId);
    if (!employee) {return;}
    
    const dayShifts = employee.shifts.filter(shift => shift.date === selectedDate);
    const shiftBlocks = getShiftBlocks(employee.id, selectedDate);
    const targetBlock = shiftBlocks[barResizeState.blockIndex];

    if (targetBlock) {
      // 新しい時間範囲を計算
      let newStartTime: string;
      let newEndTime: string;

      if (barResizeState.direction === 'start') {
        // 開始時間をリサイズ
        newStartTime = barResizeState.currentTime;
        newEndTime = barResizeState.originalEndTime;
      } else {
        // 終了時間をリサイズ
        newStartTime = barResizeState.originalStartTime;
        // currentTimeはセルの開始時間なので、そのセルの終了時間を使用
        const currentTimeIndex = TIME_SLOTS.findIndex(ts => ts.start === barResizeState.currentTime);
        if (currentTimeIndex !== -1) {
          newEndTime = TIME_SLOTS[currentTimeIndex].end;
        } else {
          newEndTime = barResizeState.currentTime;
        }
      }

      // 対象ブロックに対応するシフトを見つける（最初のシフトを更新）
      const blockShift = dayShifts.find(shift => {
        const shiftStartTime = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
        const shiftEndTime = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';
        return shiftStartTime === barResizeState.originalStartTime && shiftEndTime === barResizeState.originalEndTime;
      });

      if (blockShift) {
        // 重複チェック：新しい時間範囲が他のシフトと重複しないかチェック
        if (checkShiftOverlap(barResizeState.employeeId, selectedDate, newStartTime, newEndTime, blockShift.id, blockShift.status)) {
          alert('選択した時間帯に既にシフトが登録されています。時間を調整してください。');
          setBarResizeState(null);
          return;
        }

        // 隣接シフトの結合チェック
        const adjacentShift = dayShifts.find(shift => {
          if (shift.id === blockShift.id) {return false;}
          const shiftStart = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
          const shiftEnd = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';

          // 同じステータスで隣接しているシフトを探す
          return shift.status === blockShift.status &&
                 ((newEndTime === shiftStart) || (newStartTime === shiftEnd));
        });

        if (adjacentShift) {
          // 隣接シフトを結合
          const shiftStart = adjacentShift.startTime || TIME_SLOTS.find(ts => ts.id === adjacentShift.timeSlot)?.start || '';
          const shiftEnd = adjacentShift.endTime || TIME_SLOTS.find(ts => ts.id === adjacentShift.timeSlot)?.end || '';

          const mergedStartTime = Math.min(
            TIME_SLOTS.findIndex(ts => ts.start === newStartTime),
            TIME_SLOTS.findIndex(ts => ts.start === shiftStart)
          );
          const mergedEndTime = Math.max(
            TIME_SLOTS.findIndex(ts => ts.end === newEndTime),
            TIME_SLOTS.findIndex(ts => ts.end === shiftEnd)
          );

          const finalStartTime = TIME_SLOTS[mergedStartTime]?.start || newStartTime;
          const finalEndTime = TIME_SLOTS[mergedEndTime]?.end || newEndTime;

          // 隣接シフトを削除
          onDeleteShift(employee.id, adjacentShift.id);

          // メインシフトを結合後の時間に更新
          const mergedShift: EmployeeShift = {
            ...blockShift,
            startTime: finalStartTime,
            endTime: finalEndTime,
            timeSlot: TIME_SLOTS.find(ts => ts.start === finalStartTime)?.id || blockShift.timeSlot,
          };

          onUpdateShift(employee.id, mergedShift);
        } else {
          // 通常のシフト時間更新
          const updatedShift: EmployeeShift = {
            ...blockShift,
            startTime: newStartTime,
            endTime: newEndTime,
            timeSlot: TIME_SLOTS.find(ts => ts.start === newStartTime)?.id || blockShift.timeSlot,
          };

          onUpdateShift(employee.id, updatedShift);
        }

        setHasUnsavedChanges(true);
      }
    }

    setBarResizeState(null);

    // リサイズ完了後のスクロール防止フラグを設定
    setRecentlyResized(true);
    setTimeout(() => {
      setRecentlyResized(false);
    }, 1000); // 1秒後にリセット
  };

  const handleDeleteShift = () => {
    if (!selectedShift?.id) {return;}
    
    const employeeId = selectedShift.employeeId;
    const isDayCrossing = selectedShift.notes && selectedShift.notes.includes('日跨ぎ');
    
    if (isDayCrossing) {
      // 日マタギシフトの場合はグループ全体を取得
      const groupShifts = getAllShiftsInDayCrossingGroup(employeeId, selectedShift);
      const groupDates = Array.from(new Set(groupShifts.map(s => s.date))).sort();
      
      const datesStr = groupDates.map(d => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }).join('、');
      
      const confirmMessage = `このシフトは日マタギシフトです（${groupDates.length}日間: ${datesStr}）。\n\nこの期間のすべてのシフトを削除しますか？\n\n削除されるシフト:\n${groupShifts.map(s => {
        const d = new Date(s.date);
        return `  • ${d.getMonth() + 1}/${d.getDate()} ${s.startTime}-${s.endTime}`;
      }).join('\n')}`;
      
      if (window.confirm(confirmMessage)) {
        // グループ全体を削除（一度に削除）
        const shiftIds = groupShifts.map(s => s.id);
        if (onDeleteMultipleShifts) {
          onDeleteMultipleShifts(employeeId, shiftIds);
        } else {
          // フォールバック：個別削除（通常は使われない）
          groupShifts.forEach(shift => {
            onDeleteShift(employeeId, shift.id);
          });
        }
        // 削除後にモーダルを閉じる
        setShowShiftModal(false);
        setEditingShift(null);
        setSelectedShift(null);
      }
      // キャンセルされた場合は何もしない（モーダルも開いたまま）
    } else {
      // 通常シフトの場合は確認ダイアログを表示
      const shiftDate = new Date(selectedShift.date);
      const dateStr = `${shiftDate.getMonth() + 1}/${shiftDate.getDate()}`;
      const timeStr = selectedShift.startTime && selectedShift.endTime 
        ? `${selectedShift.startTime}-${selectedShift.endTime}`
        : '時間未設定';
      const confirmMessage = `シフトを削除しますか？\n\n日付: ${dateStr}\n時間: ${timeStr}`;
      
      if (window.confirm(confirmMessage)) {
        // 単一削除
        handleShiftDelete(selectedShift.id);
        // 削除後にモーダルを閉じる
        setShowShiftModal(false);
        setEditingShift(null);
        setSelectedShift(null);
      }
      // キャンセルされた場合は何もしない（モーダルも開いたまま）
    }
  };

  // 新しいモーダル用のハンドラ
  const handleShiftModalSave = (data: ShiftModalData) => {
    // バリデーション
    if (data.employeeIds.length === 0 || !data.startTime || !data.endTime) {
      alert('必須項目を入力してください');
      return;
    }

    // 日付リストを決定
    let dates: string[] = [];
    
    if (data.dates && data.dates.length > 0) {
      // 一括登録の場合：複数日付を使用
      dates = data.dates;
    } else if (data.startDate && data.endDate) {
      // 単日登録の場合：日付範囲を生成
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
    } else if (data.startDate) {
      // 編集・作成の場合：単一日付
      dates = [data.startDate];
    } else {
      alert('日付を選択してください');
      return;
    }

    // 編集モードの場合は即座に更新
    if (shiftModalMode === 'edit' && selectedShift) {
      const employeeId = data.employeeIds[0];
      
      // 日マタギシフトかチェック
      const isDayCrossing = selectedShift.notes && selectedShift.notes.includes('日跨ぎ');
      
      if (isDayCrossing) {
        // 日マタギシフトの場合はグループ全体を取得
        const groupShifts = getAllShiftsInDayCrossingGroup(employeeId, selectedShift);
        const groupDates = Array.from(new Set(groupShifts.map(s => s.date))).sort();
        
        // 警告を表示して確認
        const datesStr = groupDates.map(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }).join('、');
        
        const confirmMessage = `このシフトは日マタギシフトです（${groupDates.length}日間: ${datesStr}）。\n\n編集内容を反映するため、この期間のすべてのシフトを削除して新しく作成します。よろしいですか？`;
        
        if (!window.confirm(confirmMessage)) {
          return; // キャンセルされた場合は何もしない
        }
        
        // グループ全体を削除（一度に削除）
        const shiftIds = groupShifts.map(s => s.id);
        if (onDeleteMultipleShifts) {
          onDeleteMultipleShifts(employeeId, shiftIds);
        } else {
          // フォールバック：個別削除（通常は使われない）
          groupShifts.forEach(shift => {
            onDeleteShift(employeeId, shift.id);
          });
        }
        
        // 編集された内容で日マタギシフトを再作成
        // 編集された開始日・終了日から新しい日付範囲を生成
        const newStartDate = new Date(data.startDate);
        const newEndDate = data.endDate ? new Date(data.endDate) : new Date(data.startDate);
        const newDates: string[] = [];
        for (let d = new Date(newStartDate); d <= newEndDate; d.setDate(d.getDate() + 1)) {
          newDates.push(d.toISOString().split('T')[0]);
        }
        const firstDate = newDates[0];
        const lastDate = newDates[newDates.length - 1];
        
        // 削除したシフトIDのリストを保持（重複チェックで除外するため）
        const deletedShiftIds = shiftIds;
        
        // 日マタギシフトとして判定（startTime >= endTime または複数日範囲）
        const isDayCrossingNew = (data.startTime >= data.endTime) || newDates.length > 1;
        
        if (isDayCrossingNew) {
          // 1) 起点日: 開始時刻 -> 24:00
          if (!checkShiftOverlap(employeeId, firstDate, data.startTime, '24:00', deletedShiftIds, data.status, true)) {
            const startIdx = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
            if (startIdx !== -1) {
              const startShift = {
                employeeId,
                date: firstDate,
                timeSlot: TIME_SLOTS[startIdx].id,
                status: data.status,
                notes: data.notes ? `${data.notes} (日跨ぎ-1日目)` : '(日跨ぎ-1日目)',
                startTime: data.startTime,
                endTime: '24:00'
              };
              handleShiftAdd(startShift);
            }
          }

          // 2) 中日: 00:00 -> 24:00（存在する場合）
          if (newDates.length > 2) {
            for (let i = 1; i < newDates.length - 1; i++) {
              const midDate = newDates[i];
              if (!checkShiftOverlap(employeeId, midDate, '00:00', '24:00', deletedShiftIds, data.status, true)) {
                let zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '00:00');
                if (zeroIdx === -1) {
                  zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '0:00');
                }
                if (zeroIdx === -1) {
                  zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '24:00');
                }
                if (zeroIdx === -1) {
                  zeroIdx = 0;
                }
                
                if (zeroIdx >= 0 && zeroIdx < TIME_SLOTS.length) {
                  const midShift = {
                    employeeId,
                    date: midDate,
                    timeSlot: TIME_SLOTS[zeroIdx].id,
                    status: data.status,
                    notes: data.notes ? `${data.notes} (日跨ぎ-中日)` : '(日跨ぎ-中日)',
                    startTime: '00:00',
                    endTime: '24:00'
                  };
                  handleShiftAdd(midShift);
                }
              }
            }
          }

          // 3) 最終日: 00:00 -> endTime
          if (newDates.length > 1) {
            if (!checkShiftOverlap(employeeId, lastDate, '00:00', data.endTime, deletedShiftIds, data.status, true)) {
              let zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '00:00');
              if (zeroIdx === -1) {
                zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '0:00');
              }
              if (zeroIdx === -1) {
                zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '24:00');
              }
              if (zeroIdx === -1) {
                zeroIdx = 0;
              }
              
              if (zeroIdx >= 0 && zeroIdx < TIME_SLOTS.length) {
                const endLabel = newDates.length === 2 ? '日跨ぎ-2日目' : '日跨ぎ-終点';
                const endShift = {
                  employeeId,
                  date: lastDate,
                  timeSlot: TIME_SLOTS[zeroIdx].id,
                  status: data.status,
                  notes: data.notes ? `${data.notes} (${endLabel})` : `(${endLabel})`,
                  startTime: '00:00',
                  endTime: data.endTime
                };
                handleShiftAdd(endShift);
              }
            }
          }
        } else {
          // 通常シフトとして再作成（日跨ぎでなくなった場合）
          for (const date of newDates) {
            if (!checkShiftOverlap(employeeId, date, data.startTime, data.endTime, deletedShiftIds, data.status)) {
              const startIndex = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
              const endIndex = TIME_SLOTS.findIndex(ts => ts.end === data.endTime);
              
              if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
                const newShift: Omit<EmployeeShift, 'id'> = {
                  employeeId,
                  date,
                  timeSlot: TIME_SLOTS[startIndex].id,
                  status: data.status,
                  notes: data.notes,
                  startTime: data.startTime,
                  endTime: data.endTime,
                };
                handleShiftAdd(newShift);
              }
            }
          }
        }
        
        // 日マタギシフトの更新処理完了後、モーダルを閉じる
        setShowShiftModal(false);
        setEditingShift(null);
        setSelectedShift(null);
      } else {
        // 通常シフトの場合は既存の処理
        const startIndex = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
        const updatedShift: EmployeeShift = {
          ...selectedShift,
          status: data.status,
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          timeSlot: TIME_SLOTS[startIndex].id,
        };
        onUpdateShift(employeeId, updatedShift);
      }
      
      // モーダルを閉じる
      setShowShiftModal(false);
      setEditingShift(null);
      setSelectedShift(null);
      return;
    }

    // 新規作成モード：全てのシフトを事前に準備
    const allShifts: Omit<EmployeeShift, 'id'>[] = [];
    const affectedEmployees: string[] = [];
    const affectedDates: string[] = [];
    const skippedShifts: Array<{employeeId: string, date: string}> = [];
    
    for (const employeeId of data.employeeIds) {
      // 日跨ぎシフトかどうかを判定（startTime >= endTime または複数日範囲）
      const isDayCrossing = (data.startTime >= data.endTime) || (data.mode === 'range' && dates.length > 1);
      
      if (isDayCrossing) {
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        
        // 1) 起点日: 開始時刻 -> 24:00
        if (!checkShiftOverlap(employeeId, firstDate, data.startTime, '24:00', undefined, data.status, true)) {
          const startIdx = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
          if (startIdx !== -1) {
            const startShift = {
              employeeId,
              date: firstDate,
              timeSlot: TIME_SLOTS[startIdx].id,
              status: data.status,
              notes: data.notes ? `${data.notes} (日跨ぎ-1日目)` : '(日跨ぎ-1日目)',
              startTime: data.startTime,
              endTime: '24:00'
            };
            allShifts.push(startShift);
            if (!affectedEmployees.includes(employeeId)) {affectedEmployees.push(employeeId);}
            if (!affectedDates.includes(firstDate)) {affectedDates.push(firstDate);}
          }
        } else {
          const employee = employees.find(emp => emp.id === employeeId);
          skippedShifts.push({ employeeId: employee?.name || employeeId, date: firstDate });
        }

        // 2) 中日: 00:00 -> 24:00（存在する場合）
        if (dates.length > 2) {
          for (let i = 1; i < dates.length - 1; i++) {
            const midDate = dates[i];
            if (!checkShiftOverlap(employeeId, midDate, '00:00', '24:00', undefined, data.status, true)) {
              // 00:00のTIME_SLOTを探す（複数の可能性を試す）
              let zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '00:00');
              if (zeroIdx === -1) {
                zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '0:00');
              }
              if (zeroIdx === -1) {
                zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '24:00');
              }
              if (zeroIdx === -1) {
                zeroIdx = 0; // フォールバック
              }
              
              if (zeroIdx >= 0 && zeroIdx < TIME_SLOTS.length) {
                const midShift = {
                  employeeId,
                  date: midDate,
                  timeSlot: TIME_SLOTS[zeroIdx].id,
                  status: data.status,
                  notes: data.notes ? `${data.notes} (日跨ぎ-中日)` : '(日跨ぎ-中日)',
                  startTime: '00:00',
                  endTime: '24:00'
                };
                allShifts.push(midShift);
                if (!affectedEmployees.includes(employeeId)) {affectedEmployees.push(employeeId);}
                if (!affectedDates.includes(midDate)) {affectedDates.push(midDate);}
              }
            } else {
              const employee = employees.find(emp => emp.id === employeeId);
              skippedShifts.push({ employeeId: employee?.name || employeeId, date: midDate });
            }
          }
        }

        // 3) 最終日: 00:00 -> endTime
        if (dates.length > 1) {
          const overlapCheck = checkShiftOverlap(employeeId, lastDate, '00:00', data.endTime, undefined, data.status, true);
          
          if (!overlapCheck) {
            // 00:00のTIME_SLOTを探す（複数の可能性を試す）
            let zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '00:00');
            
            // 00:00が見つからない場合、他の形式を試す
            if (zeroIdx === -1) {
              zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '0:00');
            }
            if (zeroIdx === -1) {
              zeroIdx = TIME_SLOTS.findIndex(ts => ts.start === '24:00');
            }
            // 最初のスロットを使用（フォールバック）
            if (zeroIdx === -1) {
              zeroIdx = 0;
            }
            
            
            if (zeroIdx >= 0 && zeroIdx < TIME_SLOTS.length) {
              // 2日間の場合は「2日目」、3日以上の場合は「終点」
              const endLabel = dates.length === 2 ? '日跨ぎ-2日目' : '日跨ぎ-終点';
              const endShift = {
                employeeId,
                date: lastDate,
                timeSlot: TIME_SLOTS[zeroIdx].id,
                status: data.status,
                notes: data.notes ? `${data.notes} (${endLabel})` : `(${endLabel})`,
                startTime: '00:00',
                endTime: data.endTime
              };
              allShifts.push(endShift);
              if (!affectedEmployees.includes(employeeId)) {affectedEmployees.push(employeeId);}
              if (!affectedDates.includes(lastDate)) {affectedDates.push(lastDate);}
            }
          } else {
            const employee = employees.find(emp => emp.id === employeeId);
            skippedShifts.push({ employeeId: employee?.name || employeeId, date: lastDate });
          }
        } else {
        }

        // 通常ループはスキップ
        continue;
      }

      // 通常のシフトの場合のみ、日付ごとのループを実行
      if (!isDayCrossing) {
        for (const date of dates) {
          // 重複チェック
          if (checkShiftOverlap(employeeId, date, data.startTime, data.endTime, undefined, data.status)) {
            const employee = employees.find(emp => emp.id === employeeId);
            skippedShifts.push({
              employeeId: employee?.name || employeeId,
              date
            });
            continue; // スキップ
          }

          // 時間範囲内のスロットを取得
          const startIndex = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
          const endIndex = TIME_SLOTS.findIndex(ts => ts.end === data.endTime);

          if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
            continue;
          }

          // 通常のシフトの場合（1レコードのみ作成）
          const newShift: Omit<EmployeeShift, 'id'> = {
            employeeId,
            date,
            timeSlot: TIME_SLOTS[startIndex].id,
            status: data.status,
            notes: data.notes,
            startTime: data.startTime,
            endTime: data.endTime,
          };
          allShifts.push(newShift);
          
          // 影響を受ける従業員と日付を記録
          if (!affectedEmployees.includes(employeeId)) {
            affectedEmployees.push(employeeId);
          }
          if (!affectedDates.includes(date)) {
            affectedDates.push(date);
          }
        }
      }
    }
    
    // スキップされたシフトがある場合は警告表示
    if (skippedShifts.length > 0) {
      const skippedList = skippedShifts.map(s => `${s.employeeId} (${s.date})`).join('\n');
      alert(`以下の日付は既にシフトが登録されているため、登録できませんでした：\n\n${skippedList}`);
    }

    // 全てのシフトを一括で作成
    if (allShifts.length > 0) {
      // 各シフトを個別に追加
      // 【バグ修正】従業員ごと・日付ごとにグループ化せずに、各シフトを直接追加する
      // これにより、単日登録時も正しく1つのシフトとして扱われる
      allShifts.forEach(shift => {
        handleShiftAdd(shift);
      });

      // mergeAdjacentShiftsはuseEffectで自動的に実行されるため、ここでは実行しない
    }

    // モーダルを閉じる
    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  // 共通リサイズハンドルコンポーネント
  const ResizeHandles = ({ 
    block, 
    employee, 
    index, 
    onResizeStart 
  }: {
    block: any;
    employee: any;
    index: number;
    onResizeStart: (direction: 'start' | 'end', block: any, employee: any, index: number) => void;
  }) => (
    <>
      {/* リサイズハンドル - 左端 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-4 cursor-w-resize opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center pointer-events-auto z-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart('start', block, employee, index);
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        title="開始時間を変更（ドラッグして調整・拡大/縮小可能）"
      >
        <div className="text-white text-xs opacity-70">←</div>
      </div>
      
      {/* リサイズハンドル - 右端 */}
      <div
        className="absolute right-0 top-0 bottom-0 w-4 cursor-e-resize opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center pointer-events-auto z-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart('end', block, employee, index);
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        title="終了時間を変更（ドラッグして調整・拡大/縮小可能）"
      >
        <div className="text-white text-xs opacity-70">→</div>
      </div>
    </>
  );

  // 共通リサイズ開始処理
  const handleResizeStart = (direction: 'start' | 'end', block: any, employee: any, index: number) => {
    // 日マタギシフトの場合はリサイズを無効化（モーダルからのみ編集可能）
    const shift = employees
      .find(emp => emp.id === employee.id)
      ?.shifts.find(s => {
        const shiftStartTime = s.startTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || '';
        const shiftEndTime = s.endTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || '';
        return s.date === block.date &&
               shiftStartTime >= block.startTime &&
               shiftEndTime <= block.endTime;
      });
    
    if (shift && shift.notes && shift.notes.includes('日跨ぎ')) {
      // 日マタギシフトの場合はリサイズ処理をスキップ
      return;
    }
    
    setBarResizeState({
      employeeId: employee.id,
      blockIndex: index,
      direction: direction,
      originalStartTime: block.startTime,
      originalEndTime: block.endTime,
      currentTime: direction === 'start' ? block.startTime : block.endTime,
    });
  };

  // 日ビュー - 横時間・縦従業員のレイアウト
  const DayView = () => {
    const employeeRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    // ハイライトされた従業員にスクロール（リサイズ中は無効化）
    useEffect(() => {
      if (highlightedEmployee && employeeRefs.current[highlightedEmployee.id] && !barResizeState && !dragState && !recentlyResized) {
        employeeRefs.current[highlightedEmployee.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, [highlightedEmployee, barResizeState, dragState, recentlyResized]);

    const getShiftBlockStyle = (block: any) => {
      if (filteredTimeSlots.length === 0) {
        return {
          width: '0%',
          left: '0%',
          className: 'bg-gray-200',
        };
      }

      const visibleStartIndex = TIME_SLOTS.findIndex(ts => ts.id === filteredTimeSlots[0].id);
      const visibleEndIndex = TIME_SLOTS.findIndex(ts => ts.id === filteredTimeSlots[filteredTimeSlots.length - 1].id);

      const totalVisibleSlots = visibleStartIndex !== -1 && visibleEndIndex !== -1 && visibleEndIndex >= visibleStartIndex
        ? (visibleEndIndex - visibleStartIndex + 1)
        : filteredTimeSlots.length;

      const clampedStartIndex = Math.max(block.startIndex, visibleStartIndex === -1 ? block.startIndex : visibleStartIndex);
      const clampedEndIndex = Math.min(block.endIndex, visibleEndIndex === -1 ? block.endIndex : visibleEndIndex);

      let width = 0;
      let left = 0;

      if (clampedEndIndex >= clampedStartIndex && totalVisibleSlots > 0) {
        width = ((clampedEndIndex - clampedStartIndex + 1) / totalVisibleSlots) * 100;
        left = ((clampedStartIndex - (visibleStartIndex === -1 ? clampedStartIndex : visibleStartIndex)) / totalVisibleSlots) * 100;
      }

      const statusColors = {
        working: 'bg-lime-200 border-lime-300',
        unavailable: 'bg-gray-200 border-gray-300',
      };

      return {
        width: `${Math.max(0, Math.min(100, width))}%`,
        left: `${Math.max(0, Math.min(100, left))}%`,
        className: statusColors[block.status as keyof typeof statusColors] || 'bg-gray-200',
      };
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 日ビューナビゲーション */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  setSelectedDate(toLocalDateString(prevDate));
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                ＜
              </button>
              <h3 
                className={`text-xl font-semibold text-gray-900 ${
                  clipboardMode === 'paste' 
                    ? `cursor-pointer px-2 py-1 rounded transition-colors ${
                        pendingPasteDates && pendingPasteDates.includes(selectedDate)
                          ? 'bg-green-200 hover:bg-green-300'
                          : 'hover:bg-green-100'
                      }`
                    : ''
                }`}
                onClick={() => {
                  if (clipboardMode === 'paste' && onDateClickForClipboard) {
                    onDateClickForClipboard(selectedDate);
                  }
                }}
                title={clipboardMode === 'paste' ? 'この日付に貼り付け' : ''}
              >
                {(() => {
                  const dateObj = new Date(selectedDate);
                  const year = dateObj.getFullYear();
                  const month = dateObj.getMonth() + 1;
                  const day = dateObj.getDate();
                  const weekday = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' });
                  return `${year}年${month}月${day}日（${weekday}）`;
                })()}
                {clipboardMode === 'paste' && (
                  <span className="ml-2 text-sm text-green-600">
                    {pendingPasteDates && pendingPasteDates.includes(selectedDate) ? '✓ 選択中' : '← クリックして選択'}
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  const nextDate = new Date(selectedDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  setSelectedDate(toLocalDateString(nextDate));
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                ＞
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* シフト追加ボタン */}
              <button
                onClick={() => {
                  setShiftModalMode('bulk');
                  setEditingShift(null);
                  setSelectedShift(null);
                  setShowShiftModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                シフト追加
              </button>
              {/* 保存ボタン（日ビュー） */}
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={!unsavedShiftIds || unsavedShiftIds.size === 0}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                    unsavedShiftIds && unsavedShiftIds.size > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  保存
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 時間帯表示選択機能 */}
        {showTimeRangeSelector && onDisplayTimeRangeChange && (
          <div className="px-4 py-3 border-b border-gray-200">
            <TimeRangeDisplaySelector
              startTime={displayStartTime}
              endTime={displayEndTime}
              onTimeRangeChange={onDisplayTimeRangeChange}
            />
          </div>
        )}
        
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sticky left-0 bg-gray-50 z-10">
                  従業員
                </th>
                {filteredTimeSlots.map(timeSlot => {
                  // 1時間単位で表示するため、30分スロットをグループ化
                  const hour = parseInt(timeSlot.start.split(':')[0]);
                  const isHalfHour = timeSlot.start.split(':')[1] === '30';
                  
                  // 30分スロットの場合は表示しない（1時間の開始時刻のみ表示）
                  if (isHalfHour) {return null;}
                  
                  return (
                    <th key={timeSlot.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-16 relative" colSpan={2}>
                      <div className="flex flex-col">
                        <span className="font-bold text-base">{hour}:00</span>
                        <span className="text-xs opacity-75">{hour + 1}:00</span>
                      </div>
                      
                      {/* 時間帯の可視化 */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded">
                        {(() => {
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
                  );
                }).filter(Boolean)}
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayEmployees.map(employee => {
                const shiftBlocks = getShiftBlocks(employee.id, selectedDate);
                
                return (
                  <tr 
                    key={employee.id} 
                    data-employee-id={employee.id}
                    ref={(el) => { employeeRefs.current[employee.id] = el; }}
                    className={`border-b border-gray-200 ${
                      highlightedEmployee?.id === employee.id 
                        ? 'bg-blue-50 ring-2 ring-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={(e) => {
                      // リサイズハンドルやシフトブロックがクリックされた場合は何もしない
                      if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('td:first-child')) {
                        return;
                      }
                      // 従業員名部分をクリックした場合のみ選択状態を更新
                      if (selectedEmployee?.id === employee.id) {
                        // 既に選択されている場合は解除
                        setSelectedEmployee(null);
                      } else {
                        // 新しく選択
                        setSelectedEmployee(employee);
                      }
                    }}
                    onMouseEnter={(e) => {
                      // リサイズハンドルがクリックされた場合は何もしない
                      if (e.target !== e.currentTarget) {
                        const target = e.target as HTMLElement;
                        if (target.closest('.cursor-w-resize, .cursor-e-resize')) {
                          return;
                        }
                      }
                      // カーソルが当たったら選択状態だけを解除（青枠は残す）
                      if (selectedEmployee?.id === employee.id) {
                        setSelectedEmployee(null);
                      }
                    }}
                  >
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 z-10 border-r border-gray-200 cursor-pointer transition-colors ${
                      highlightedEmployee?.id === employee.id 
                        ? 'bg-blue-50' 
                        : 'bg-white hover:bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{employee.name}</span>
                          {(() => {
                            const totalHours = shiftBlocks.reduce((total, block) => {
                              // 時間文字列を分に変換して正確な時間差を計算
                              const startMinutes = parseTimeToMinutes(block.startTime);
                              const endMinutes = parseTimeToMinutes(block.endTime);
                              const blockHours = (endMinutes - startMinutes) / 60;
                              return total + blockHours;
                            }, 0);
                            
                            return (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                                {totalHours.toFixed(1)}h
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* 出勤時間の可視化バー */}
                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden relative group">
                        {shiftBlocks.map((block, index) => {
                          const startIndex = TIME_SLOTS.findIndex(ts => ts.start === block.startTime);
                          const endIndex = TIME_SLOTS.findIndex(ts => ts.end === block.endTime);
                          const width = ((endIndex - startIndex + 1) / filteredTimeSlots.length) * 100;
                          const left = (startIndex / filteredTimeSlots.length) * 100;
                          
                          // バーの実際の時間長を計算
                          const startMinutes = parseTimeToMinutes(block.startTime);
                          const endMinutes = parseTimeToMinutes(block.endTime);
                          void ((endMinutes - startMinutes) / 60); // actualHours - 将来の使用のため計算
                          
                          // 日跨ぎシフトかどうかを判定
                          const isDayCrossing = block.isDayCrossing;
                          
                          const statusColors = {
                            working: isDayCrossing ? 'bg-gradient-to-r from-lime-400 to-purple-400' : 'bg-lime-400',
                            unavailable: isDayCrossing ? 'bg-gradient-to-r from-gray-400 to-red-400' : 'bg-gray-400',
                          };
                          
                          
                          // このブロックに該当するシフトを見つける
                          const blockShift = employees
                            .find(emp => emp.id === employee.id)
                            ?.shifts.find(s => {
                              const shiftStartTime = s.startTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || '';
                              const shiftEndTime = s.endTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || '';
                              return shiftStartTime >= block.startTime && shiftEndTime <= block.endTime;
                            });
                          const isBlockSelected = selectedShifts && blockShift && selectedShifts.some(s => s.id === blockShift.id);
                          
                          // 日跨ぎシフトのタイトル
                          const title = isDayCrossing && block.originalStartTime && block.originalEndTime
                            ? `🌙 日跨ぎ: ${block.originalStartTime} → ${block.originalEndTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`
                            : `${block.startTime}-${block.endTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`;
                          
                          return (
                            <div
                              key={index}
                              className={`absolute h-full ${statusColors[block.status as keyof typeof statusColors] || 'bg-gray-400'} group-hover:opacity-80 transition-opacity relative cursor-pointer ${
                                isBlockSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                              } ${isDayCrossing ? 'border-2 border-purple-300' : ''}`}
                              style={{
                                width: `${width}%`,
                                left: `${left}%`,
                              }}
                              title={title}
                              onClick={(e) => {
                                // リサイズハンドルやその子要素がクリックされた場合は何もしない
                                if (e.target !== e.currentTarget) {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('.cursor-w-resize, .cursor-e-resize')) {
                                    return;
                                  }
                                }
                                
                                // コピーモードの場合はクリップボード処理
                                if (clipboardMode === 'copy') {
                                  const shift = employees
                                    .find(emp => emp.id === employee.id)
                                    ?.shifts.find(s => {
                                      const shiftStartTime = s.startTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || '';
                                      const shiftEndTime = s.endTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || '';
                                      return shiftStartTime >= block.startTime && shiftEndTime <= block.endTime;
                                    });
                                  
                                  if (shift && onShiftClickForClipboard) {
                                    // 日マタギシフトの場合、グループ全体を取得（月ビューと同様のロジック）
                                    const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                                    const selectedShiftIds = new Set<string>(); // 重複を避ける
                                    
                                    groupShifts.forEach(groupShift => {
                                      if (!selectedShiftIds.has(groupShift.id)) {
                                        selectedShiftIds.add(groupShift.id);
                                        onShiftClickForClipboard(groupShift);
                                      }
                                    });
                                  }
                                  return;
                                }
                                
                                // 通常モード：モーダルを開く
                                const shift = employees
                                  .find(emp => emp.id === employee.id)
                                  ?.shifts.find(s => {
                                    const shiftStartTime = s.startTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || '';
                                    const shiftEndTime = s.endTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || '';
                                    return shiftStartTime >= block.startTime && shiftEndTime <= block.endTime;
                                  });
                                
                                if (shift) {
                                  setShiftModalMode('edit');
                                  setSelectedShift(shift);
                                  setEditingShift({ ...shift });
                                  setShowShiftModal(true);
                                }
                              }}
                            >
                              {/* 共通リサイズハンドル */}
                              <ResizeHandles 
                                block={block}
                                employee={employee}
                                index={index}
                                onResizeStart={handleResizeStart}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="relative h-16" colSpan={filteredTimeSlots.length}>
                      <div className="absolute inset-0 flex">
                        {/* 時間スロットの背景 - 30分単位で操作可能 */}
                        {filteredTimeSlots.map((timeSlot, index) => (
                          <div
                            key={timeSlot.id}
                            data-time-slot-id={timeSlot.id}
                            className={`flex-1 border-r border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors relative ${
                              isBreakTime(timeSlot.id) ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => {
                              handleCellClick(employee.id, selectedDate, timeSlot.id);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleMouseDown(employee.id, selectedDate, timeSlot.id);
                            }}
                            onMouseEnter={() => {
                              if (dragState) {
                                handleMouseEnter(employee.id, selectedDate, timeSlot.id);
                              } else if (barResizeState) {
                                handleBarResizeEnter(employee.id, timeSlot.id);
                              }
                            }}
                            onMouseUp={(e) => {
                              e.preventDefault();
                              if (dragState) {
                                handleMouseUp();
                              } else if (barResizeState) {
                                handleBarResizeEnd();
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
                              <div className="absolute inset-0 bg-lime-200 opacity-60 border-2 border-lime-400 border-solid z-10">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-lime-500"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-lime-500"></div>
                              </div>
                            )}
                            
                            
                            {/* バーリサイズ中の表示 */}
                            {barResizeState && 
                              barResizeState.employeeId === employee.id && (() => {
                                if (barResizeState.direction === 'start') {
                                  // 開始時間を変更中：現在の時間から元の終了時間までの範囲を表示
                                  const newStartIndex = filteredTimeSlots.findIndex(ts => ts.start === barResizeState.currentTime);
                                  const originalEndIndex = filteredTimeSlots.findIndex(ts => ts.end === barResizeState.originalEndTime);
                                  return index >= newStartIndex && index <= originalEndIndex;
                                } else {
                                  // 終了時間を変更中：元の開始時間から現在の時間までの範囲を表示
                                  const originalStartIndex = filteredTimeSlots.findIndex(ts => ts.start === barResizeState.originalStartTime);
                                  const newEndIndex = filteredTimeSlots.findIndex(ts => ts.end === barResizeState.currentTime);
                                  return index >= originalStartIndex && index <= newEndIndex;
                                }
                              })() && (
                              <div className="absolute inset-0 bg-lime-200 opacity-60 border-2 border-lime-400 border-solid z-20">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-lime-500"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-lime-500"></div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* シフトブロック */}
                        {shiftBlocks.map((block, blockIndex) => {
                          const style = getShiftBlockStyle(block);
                          
                          // シフトが選択されているかチェック
                          const shift = employees
                            .find(emp => emp.id === employee.id)
                            ?.shifts.find(s => s.id === block.id);
                          const isSelected = selectedShifts && shift && selectedShifts.some(s => s.id === shift.id);
                          
                          return (
                            <div
                              key={block.id}
                              style={{
                                width: style.width,
                                left: style.left,
                                pointerEvents: barResizeState ? 'none' : 'auto',
                              }}
                              className={`absolute top-1 bottom-1 rounded border-2 cursor-pointer hover:opacity-80 transition-all group ${style.className} ${
                                isSelected ? 'ring-4 ring-blue-500 ring-offset-1' : ''
                              }`}
                              onClick={(e) => {
                                // リサイズハンドルがクリックされた場合は何もしない
                                const target = e.target as HTMLElement;
                                if (target.classList.contains('cursor-ew-resize') || target.closest('.cursor-ew-resize')) {
                                  return;
                                }
                                
                                const shift = employees
                                  .find(emp => emp.id === employee.id)
                                  ?.shifts.find(s => s.id === block.id);
                                
                                if (shift) {
                                  // コピーモードの場合はクリップボード処理
                                  if (clipboardMode === 'copy' && onShiftClickForClipboard) {
                                    
                                    // 日マタギシフトの場合、グループ全体を取得（月ビューと同様のロジック）
                                    const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                                    const selectedShiftIds = new Set<string>(); // 重複を避ける
                                    
                                    groupShifts.forEach(groupShift => {
                                      if (!selectedShiftIds.has(groupShift.id)) {
                                        selectedShiftIds.add(groupShift.id);
                                        onShiftClickForClipboard(groupShift);
                                      }
                                    });
                                    return;
                                  }
                                  
                                  // 通常モード：モーダルを開く
                                  setShiftModalMode('edit');
                                  setSelectedShift(shift);
                                  
                                  // 日マタギシフトの場合、グループ全体の情報を計算
                                  const isDayCrossing = shift.notes && shift.notes.includes('日跨ぎ');
                                  if (isDayCrossing) {
                                    const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                                    const groupDates = Array.from(new Set(groupShifts.map(s => s.date))).sort();
                                    
                                    // 開始日・終了日・開始時刻・終了時刻を計算
                                    const firstShift = groupShifts.find(s => s.date === groupDates[0]);
                                    const lastShift = groupShifts.find(s => s.date === groupDates[groupDates.length - 1]);
                                    
                                    const startDate = groupDates[0];
                                    const endDate = groupDates[groupDates.length - 1];
                                    const startTime = firstShift?.startTime || TIME_SLOTS.find(ts => ts.id === firstShift?.timeSlot)?.start || '09:00';
                                    const endTime = lastShift?.endTime || TIME_SLOTS.find(ts => ts.id === lastShift?.timeSlot)?.end || '18:00';
                                    
                                    // 日マタギシフト用の情報を作成（開始日・終了日時を含む）
                                    const baseNotes = stripDayCrossingTag(shift.notes || '');
                                    setEditingShift({
                                      ...shift,
                                      date: startDate, // 開始日を保存
                                      startTime,
                                      endTime,
                                      notes: baseNotes, // タグを除去したベースノート
                                      // カスタムプロパティとして終了日を保存
                                      ...({ __endDate: endDate } as any)
                                    });
                                  } else {
                                    setEditingShift({ ...shift });
                                  }
                                  setShowShiftModal(true);
                                } else {
                                }
                              }}
                              title={`${block.startTime}-${block.endTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`}
                            >
                              {/* 共通リサイズハンドル（日マタギシフトの場合は非表示） */}
                              {shift && !(shift.notes && shift.notes.includes('日跨ぎ')) && (
                                <ResizeHandles 
                                  block={block}
                                  employee={employee}
                                  index={blockIndex}
                                  onResizeStart={handleResizeStart}
                                />
                              )}

                              <div className="h-full flex items-center justify-between p-1">
                                <div className="text-xs font-medium text-center truncate flex-1">
                                  <div className="font-bold">
                                    {SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {block.startTime}-{block.endTime}
                                  </div>
                                </div>
                                {/* 削除ボタン */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const shift = employees
                                      .find(emp => emp.id === employee.id)
                                      ?.shifts.find(s => s.id === block.id);
                                    
                                    if (shift) {
                                      const isDayCrossing = shift.notes && shift.notes.includes('日跨ぎ');
                                      
                                      if (isDayCrossing) {
                                        // 日マタギシフトの場合はグループ全体を取得
                                        const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                                        const groupDates = Array.from(new Set(groupShifts.map(s => s.date))).sort();
                                        
                                        const datesStr = groupDates.map(d => {
                                          const date = new Date(d);
                                          return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }).join('、');
                                        
                                        const confirmMessage = `このシフトは日マタギシフトです（${groupDates.length}日間: ${datesStr}）。\n\nこの期間のすべてのシフトを削除しますか？\n\n削除されるシフト:\n${groupShifts.map(s => {
                                          const d = new Date(s.date);
                                          return `  • ${d.getMonth() + 1}/${d.getDate()} ${s.startTime}-${s.endTime}`;
                                        }).join('\n')}`;
                                        
                                        if (window.confirm(confirmMessage)) {
                                          // グループ全体を削除（一度に削除）
                                          const shiftIds = groupShifts.map(s => s.id);
                                          if (onDeleteMultipleShifts) {
                                            onDeleteMultipleShifts(employee.id, shiftIds);
                                          } else {
                                            // フォールバック：個別削除（通常は使われない）
                                            groupShifts.forEach(groupShift => {
                                              onDeleteShift(employee.id, groupShift.id);
                                            });
                                          }
                                        }
                                      } else {
                                        // 通常シフトの場合は単一削除
                                        if (window.confirm(`${employee.name}のシフト（${block.startTime}-${block.endTime}）を削除しますか？`)) {
                                          onDeleteShift(employee.id, shift.id);
                                        }
                                      }
                                    }
                                  }}
                                  style={{ pointerEvents: 'auto' }}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                  title="このシフトを削除"
                                >
                                  ✕
                                </button>
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
    


    // 日付をクリックした時の処理（日ビューに遷移またはクリップボード操作）
    const handleDateClick = (date: string, _event?: React.MouseEvent) => {
      // 複数展開を許可するため、展開状態のリセットはしない

      if (clipboardMode === 'paste' && onDateClickForClipboard) {
        // ペーストモードの場合
        onDateClickForClipboard(date);
      } else {
        // 通常のクリックの場合、日ビューに遷移
        setSelectedDate(date);
        setViewMode('day');
      }
    };

    // +N表示をクリックした時の処理（日のマスを展開）
    const handleMoreEmployeesClick = (date: string, _allEmployees: Employee[]) => {
      const weekKey = getWeekKey(date);

      if (allDatesExpanded) {
        // 全て展開されている場合は、個別に閉じる
        handleCollapseDate(date);
        // 週の展開状態は変更しない（週全体は連動させない）
      } else {
        // 通常の個別展開/縮小（複数の日付を同時に展開可能）
        if (expandedDates.has(date)) {
          // 既に展開されている場合は閉じる
          setExpandedDates(prev => {
            const newSet = new Set(prev);
            newSet.delete(date);
            return newSet;
          });
          // この日付だけ週の展開状態から削除
          // 他に同じ週で展開されている日付がなければ週も閉じる
          setExpandedWeeks(prev => {
            const newSet = new Set(prev);
            const otherDatesInWeekExpanded = Array.from(expandedDates).some(d =>
              getWeekKey(d) === weekKey && d !== date
            );
            if (!otherDatesInWeekExpanded) {
              newSet.delete(weekKey);
            }
            return newSet;
          });
        } else {
          // 展開する（他の展開されている日付はそのまま維持）
          setExpandedDates(prev => {
            const newSet = new Set(prev);
            newSet.add(date);
            return newSet;
          });
          // 週の行幅を拡大するため、週を展開状態にする
          setExpandedWeeks(prev => {
            const newSet = new Set(prev);
            newSet.add(weekKey);
            return newSet;
          });
        }
      }
    };


    // シフトが未保存かどうかをチェック
    const hasUnsavedShifts = (employeeId: string, date: string) => {
      if (!unsavedShiftIds || unsavedShiftIds.size === 0) {return false;}
      const shifts = getShiftsForDate(employeeId, date);
      return shifts.some(shift => unsavedShiftIds.has(shift.id));
    };

    // シフトの表示スタイルを決定（背景色・文字色・縁取り色）
    const getShiftColor = (employeeId: string, date: string): ShiftVisualStyle => {
      const shifts = getShiftsForDate(employeeId, date);
      if (shifts.length === 0) {
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          isUnsaved: false,
          status: 'none',
          borderClass: '',
        };
      }

      const hasWorking = shifts.some(shift => shift.status === 'working');
      const hasUnavailable = shifts.some(shift => shift.status === 'unavailable');
      const statusType: ShiftVisualStyle['status'] = hasWorking && hasUnavailable
        ? 'mixed'
        : hasWorking
          ? 'working'
          : hasUnavailable
            ? 'unavailable'
            : 'none';

      const isUnsaved = hasUnsavedShifts(employeeId, date);
      if (isUnsaved) {
        return {
          bg: 'bg-gray-200',
          text: statusType === 'unavailable' ? 'text-rose-900' : 'text-gray-800',
          isUnsaved: true,
          status: statusType,
          borderClass: statusType === 'unavailable'
            ? 'border-2 border-rose-500'
            : statusType === 'working'
              ? 'border-2 border-green-600'
              : statusType === 'mixed'
                ? 'border-2 border-amber-500'
                : 'border-2 border-gray-400',
        };
      }

      if (statusType === 'working') {
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          isUnsaved: false,
          status: 'working',
          borderClass: '',
        };
      }

      if (statusType === 'unavailable') {
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-800',
          isUnsaved: false,
          status: 'unavailable',
          borderClass: '',
        };
      }

      if (statusType === 'mixed') {
        return {
          bg: 'bg-gradient-to-r from-green-100 via-amber-100 to-rose-100',
          text: 'text-green-900',
          isUnsaved: false,
          status: 'mixed',
          borderClass: '',
        };
      }

      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        isUnsaved: false,
        status: 'none',
        borderClass: '',
      };
    };

    const getShiftTimeRange = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      if (shifts.length === 0) {return null;}

      const workingShifts = shifts.filter(s => s.status === 'working');
      const primaryShifts = workingShifts.length > 0 ? workingShifts : shifts;

      if (primaryShifts.length === 0) {return null;}

      // 日跨ぎシフトの場合は特別な処理
      const dayCrossingShifts = primaryShifts.filter(s =>
        s.notes && s.notes.includes('日跨ぎ')
      );

      if (dayCrossingShifts.length > 0) {
        const descriptions: string[] = [];

        const baseNotesSet = new Set(
          dayCrossingShifts
            .map(shift => stripDayCrossingTag(shift.notes))
        );

        baseNotesSet.forEach(baseNotes => {
          const dateGroups = buildDayCrossingDateGroups(employeeId, baseNotes, date);
          if (dateGroups.length === 0) {return;}

          const totalDays = dateGroups.length;
          const currentIndex = dateGroups.findIndex(group => group.date === date);

          let startLabel: string;
          let endLabel: string;

          if (currentIndex !== -1) {
            startLabel = `${currentIndex + 1}日目 ${dateGroups[currentIndex].start}`;

            if (currentIndex === totalDays - 1) {
              endLabel = `${currentIndex + 1}日目 ${dateGroups[currentIndex].end}`;
            } else {
              const lastGroup = dateGroups[totalDays - 1];
              endLabel = `${totalDays}日目 ${lastGroup.end}`;
            }
          } else {
            startLabel = `1日目 ${dateGroups[0].start}`;
            endLabel = `${totalDays}日目 ${dateGroups[totalDays - 1].end}`;
          }

          descriptions.push(`${startLabel}〜${endLabel}`);
        });

        if (descriptions.length > 0) {
          const result = descriptions.join(', ');
          // 日跨ぎシフトがある場合は、それだけを返して通常シフトの処理をスキップ
          return result;
        }
      }

      // 通常のシフトの場合：直接 startTime/endTime を使用してマージ
      const ranges = primaryShifts
        .map(s => ({
          start: s.startTime || (TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || ''),
          end: s.endTime || (TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || ''),
        }))
        .filter(r => r.start && r.end && parseTimeToMinutes(r.end) > parseTimeToMinutes(r.start))
        .sort((a, b) => a.start.localeCompare(b.start));

      const merged: { start: string; end: string }[] = [];
      ranges.forEach(r => {
        if (merged.length === 0) {
          merged.push({ ...r });
          return;
        }

        const last = merged[merged.length - 1];
        const lastEndMinutes = parseTimeToMinutes(last.end);
        const currentStartMinutes = parseTimeToMinutes(r.start);
        const currentEndMinutes = parseTimeToMinutes(r.end);

        if (currentStartMinutes <= lastEndMinutes) {
          if (currentEndMinutes > lastEndMinutes) {
            last.end = r.end; // 終了時間を延長
          }
          return;
        }

        merged.push({ ...r });
      });

      const timeRanges = merged.map(m => `${m.start}〜${m.end}`);
      return timeRanges.join(', ');
    };

    // 日付ごとのイベントを取得
    const getEventsForDate = (date: string): CalendarEvent[] => {
      // shouldShowDate and getCombinedDayCrossingShifts removed - logic moved to renderEvent

      // Return all employees with shifts for the day - renderEvent will handle filtering/display logic
      const activeEmployees = filteredEmployees.filter(employee => {
        const shifts = getShiftsForDate(employee.id, date);
        return shifts.length > 0;
      });
      
      // 展開された日付の場合は全ての従業員を表示
      const weekKey = getWeekKey(date);
      void expandedWeeks.has(weekKey); // isWeekExpanded - 将来の使用のため

      // 完全に個別の動作：該当日付が展開されている場合のみ全表示
      if ((expandedDates.has(date) || (allDatesExpanded && !collapsedDates.has(date)))) {
        const events = activeEmployees.filter(employee => employee && employee.name).map(employee => {
          // Get all shifts for the day
          const allShifts = getShiftsForDate(employee.id, date);
          const hasShifts = allShifts.length > 0;
          const timeRange = getShiftTimeRange(employee.id, date);
          const shiftColor = getShiftColor(employee.id, date);
          
          
          const eventStatus = shiftColor.status === 'unavailable' ? 'unavailable' as const : 'working' as const;

          return {
            id: `${employee.id}-${date}`,
            title: employee.name,
            description: timeRange || '',
            status: hasShifts ? eventStatus : 'unavailable' as const,
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
            onClick: () => {
              if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
                // コピーモードの場合、日マタギシフトならグループ全体を、通常シフトなら個別に選択
                const selectedShiftIds = new Set<string>(); // 重複を避ける

                allShifts.forEach(shift => {
                  const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                  groupShifts.forEach(groupShift => {
                    if (!selectedShiftIds.has(groupShift.id)) {
                      selectedShiftIds.add(groupShift.id);
                      onShiftClickForClipboard(groupShift);
                    }
                  });
                });
              } else {
                // 通常モードの場合、シフト編集モーダルを表示
                handleEmployeeClick(employee, date);
              }
            },
            metadata: {
              employee,
              timeRange,
              shifts: allShifts,
              startDate: date,
              visual: shiftColor,
            }
          };
        });
        
        // 展開状態では-ボタンを追加（メンバーがいる場合のみ）
        if (activeEmployees.length > 0) {
          events.push({
          id: `collapse-${date}`,
          title: '-',
          description: '',
          status: 'unavailable' as const,
          backgroundColor: 'bg-red-100',
          color: 'text-red-700',
          onClick: () => handleMoreEmployeesClick(date, activeEmployees),
          metadata: {
            employee: null,
            timeRange: null,
            isMoreButton: true,
            allEmployees: activeEmployees,
            isExpanded: true
          } as any
          });
        }
        
        return events;
      }
      
      // メンバーがいない場合は何も表示しない
      if (activeEmployees.length === 0) {
        return [];
      }

      // 5人以上の場合の処理（展開状態でない場合のみ）
      // 完全に個別の動作：該当日付が展開されていない場合のみ+N表示
      if (activeEmployees.length > 5 && !expandedDates.has(date) && (!allDatesExpanded || collapsedDates.has(date))) {
        const hasDayCrossingShiftForDate = (employee: Employee) => {
          const shifts = getShiftsForDate(employee.id, date);
          return shifts.some(shift => shift.notes && shift.notes.includes('日跨ぎ'));
        };

        const getEarliestStartTimeForDate = (employee: Employee) => {
          const shifts = getShiftsForDate(employee.id, date);
          let earliest: string | null = null;

          shifts.forEach(shift => {
            const { startTime } = resolveShiftTimeRange(shift);
            if (!startTime) {
              return;
            }

            if (!earliest || startTime < earliest) {
              earliest = startTime;
            }
          });

          return earliest ?? '24:00';
        };

        const sortedActiveEmployees = activeEmployees.slice().sort((a, b) => {
          const aDayCrossing = hasDayCrossingShiftForDate(a);
          const bDayCrossing = hasDayCrossingShiftForDate(b);
          if (aDayCrossing !== bDayCrossing) {
            return aDayCrossing ? -1 : 1;
          }

          const aStart = getEarliestStartTimeForDate(a);
          const bStart = getEarliestStartTimeForDate(b);
          if (aStart !== bStart) {
            return aStart.localeCompare(bStart);
          }

          return a.name.localeCompare(b.name, 'ja');
        });

        const displayEmployees = sortedActiveEmployees.slice(0, 4);
        const remainingCount = activeEmployees.length - displayEmployees.length;
        
        const events = displayEmployees.filter(employee => employee && employee.name).map(employee => {
          // Get all shifts for the day
          const allShifts = getShiftsForDate(employee.id, date);
          const hasShifts = allShifts.length > 0;
          const timeRange = getShiftTimeRange(employee.id, date);
          const shiftColor = getShiftColor(employee.id, date);
          
          const eventStatus = shiftColor.status === 'unavailable' ? 'unavailable' as const : 'working' as const;

          return {
            id: `${employee.id}-${date}`,
            title: employee.name,
            description: timeRange || '',
            status: hasShifts ? eventStatus : 'unavailable' as const,
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
            onClick: () => {
              if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
                // コピーモードの場合、日マタギシフトならグループ全体を、通常シフトなら個別に選択
                const selectedShiftIds = new Set<string>(); // 重複を避ける

                allShifts.forEach(shift => {
                  const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                  groupShifts.forEach(groupShift => {
                    if (!selectedShiftIds.has(groupShift.id)) {
                      selectedShiftIds.add(groupShift.id);
                      onShiftClickForClipboard(groupShift);
                    }
                  });
                });
              } else {
                // 通常モードの場合、シフト編集モーダルを表示
                handleEmployeeClick(employee, date);
              }
            },
            metadata: {
              employee,
              timeRange,
              shifts: allShifts,
              startDate: date,
              visual: shiftColor,
            }
          };
        });
        
        // +N表示のイベントを追加（右上端に配置）
        events.push({
          id: `more-${date}`,
          title: `+${remainingCount}`,
          description: '',
          status: 'unavailable' as const,
          backgroundColor: 'bg-blue-100',
          color: 'text-blue-700',
          onClick: () => handleMoreEmployeesClick(date, activeEmployees),
          metadata: {
            employee: null,
            timeRange: null,
            isMoreButton: true,
            allEmployees: activeEmployees,
            isExpanded: false
          } as any
        });
        
        return events;
      }
      
      // 5人以下の場合は通常表示
      const events = activeEmployees.filter(employee => employee && employee.name).map(employee => {
        // Get all shifts for the day
        const allShifts = getShiftsForDate(employee.id, date);
        const hasShifts = allShifts.length > 0;
        const timeRange = getShiftTimeRange(employee.id, date);
        const shiftColor = getShiftColor(employee.id, date);
        
        const eventStatus = shiftColor.status === 'unavailable' ? 'unavailable' as const : 'working' as const;

        return {
          id: `${employee.id}-${date}`,
          title: employee.name,
          description: timeRange || '',
          status: hasShifts ? eventStatus : ('unavailable' as const),
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
          onClick: () => {
            if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
              // コピーモードの場合、日マタギシフトならグループ全体を、通常シフトなら個別に選択
              const selectedShiftIds = new Set<string>(); // 重複を避ける

              allShifts.forEach(shift => {
                const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, shift);
                groupShifts.forEach(groupShift => {
                  if (!selectedShiftIds.has(groupShift.id)) {
                    selectedShiftIds.add(groupShift.id);
                    onShiftClickForClipboard(groupShift);
                  }
                });
              });
            } else {
              // 通常モードの場合、シフト編集モーダルを表示
              handleEmployeeClick(employee, date);
            }
          },
            metadata: {
              employee,
              timeRange,
              shifts: allShifts,
              startDate: date,
              visual: shiftColor,
            }
          };
        });

      // allDatesExpandedがtrueで、この日付がcollapsedDatesに含まれていない場合は「-」ボタンを追加
      if (allDatesExpanded && !collapsedDates.has(date) && activeEmployees.length > 0) {
        events.push({
          id: `collapse-${date}`,
          title: '-',
          description: '',
          status: 'unavailable' as const,
          backgroundColor: 'bg-red-100',
          color: 'text-red-700',
          onClick: () => handleMoreEmployeesClick(date, activeEmployees),
          metadata: {
            employee: null,
            timeRange: null,
            isMoreButton: true,
            allEmployees: activeEmployees,
            isExpanded: true
          } as any
        });
      }

      return events;
    };

    // カスタムイベントレンダリング
    const renderEvent = (
      event: CalendarEvent,
      indexOrPositions: number | { index: number; normalIndex: number; dayCrossingIndex: number; totalDayCrossingShifts?: number },
      currentDate?: string,
      weekStartDate?: string,
      weekEndDate?: string
    ) => {
      const positions = typeof indexOrPositions === 'number'
        ? { index: indexOrPositions, normalIndex: indexOrPositions, dayCrossingIndex: 0, totalDayCrossingShifts: 0 }
        : indexOrPositions;
      const { index: _index, normalIndex, dayCrossingIndex, totalDayCrossingShifts = 0 } = positions;
      const { employee, timeRange, shifts, startDate: _startDate } = event.metadata || {};
      const shift = event.metadata?.shift; // Access original shift data from metadata
      const visual = event.metadata?.visual as ShiftVisualStyle | undefined;
      
      // employeeがnullの場合（+N人表示など）は特別な表示（右上端に配置）
      if (!employee) {
        return (
          <div
            key={event.id}
            className={`${event.backgroundColor || 'bg-gray-100'} ${event.color || 'text-gray-700'} rounded px-1 cursor-pointer hover:shadow-md hover:scale-110 transition-all absolute top-1 right-1 z-10`}
            style={{ fontSize: '12px', minWidth: '20px', textAlign: 'center', lineHeight: '1.2' }}
            onClick={(e) => {
              e.stopPropagation();
              event.onClick?.();
            }}
          >
            {event.title}
          </div>
        );
      }
      
      // employeeのnameプロパティがない場合はエラーを回避
      if (!employee.name) {
        return null;
      }
      
      // 時間範囲を解析（カンマ区切りで分割）
      const timeRanges = timeRange ? timeRange.split(', ') : [];
      void (timeRanges.length > 1); // hasMultipleTimeRanges - 将来の使用のため
      
      // 従業員名の省略処理（6文字以上の場合は改行なしで表示）
      const displayName = employee.name;
      const displayTimeRange = timeRange || '';
      const iconClassName = visual?.iconClass ?? 'text-yellow-500';

      // 日マタギシフトを上部に配置し、通常シフトはその下に配置
      // 日付表示との間隔を最小化（14px → 15pxへ、日付の直下に配置）
      const dayCrossingTop = (dayCrossingIndex * 18);
      const normalTop =  (totalDayCrossingShifts + normalIndex) * 18;

      const baseNormalClass = `px-0.5 py-0.5 rounded text-center font-medium cursor-pointer transition-all w-full flex items-center justify-center hover:shadow-md hover:scale-105 hover:z-10 ${event.backgroundColor || 'bg-gray-100'} ${event.color || 'text-gray-700'} ${visual?.borderClass || ''}`;
      const baseNormalStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${normalTop}px`,
        left: '2px',
        width: 'calc(100% - 4px)',
        height: '18px',
        fontSize: '9px',
        zIndex: 10 + normalIndex,  // 通常シフトは低いz-indexで日マタギシフトの下に表示
      };

      const renderStandardShift = (options?: { className?: string; style?: React.CSSProperties; title?: string; dataShiftType?: string }) => {
        const { className, style, title, dataShiftType } = options || {};
        return (
          <div
            key={event.id}
            data-shift-type={dataShiftType || 'normal'}
            className={`${baseNormalClass} ${className || ''}`.trim()}
            style={{ ...baseNormalStyle, ...(style || {}) }}
            onClick={(e) => {
              e.stopPropagation();
              event.onClick?.();
            }}
            title={title || `${employee.name}${displayTimeRange ? ` (${displayTimeRange})` : ''}`}
          >
            <div className="flex w-full items-center justify-between gap-0.5 overflow-hidden min-w-0">
              <div className="flex items-center gap-0.5 min-w-0">
                {visual?.icon && (
                  <span
                    className={`flex-shrink-0 leading-none ${iconClassName}`}
                    style={{ fontSize: '10px' }}
                    aria-hidden="true"
                  >
                    {visual.icon}
                  </span>
                )}
                <span className="font-medium truncate leading-none" style={{ fontSize: '9px' }}>
                  {displayName}
                </span>
              </div>
              <span className="opacity-75 truncate leading-none flex-shrink-0" style={{ fontSize: '7px' }}>
                {displayTimeRange}
              </span>
            </div>
          </div>
        );
      };

      // Check if it's a day-crossing shift based on notes
      const isDayCrossingShift = (shifts && shifts.some((shift: EmployeeShift) => 
        shift.notes && (
          shift.notes.includes('日跨ぎ-1日目') ||
          shift.notes.includes('日跨ぎ-起点') ||
          shift.notes.includes('日跨ぎ-中日') ||
          shift.notes.includes('日跨ぎ-2日目') ||
          shift.notes.includes('日跨ぎ-終点')
        )
      )) || (shift && shift.notes && (
        shift.notes.includes('日跨ぎ-1日目') ||
        shift.notes.includes('日跨ぎ-起点') ||
        shift.notes.includes('日跨ぎ-中日') ||
        shift.notes.includes('日跨ぎ-2日目') ||
        shift.notes.includes('日跨ぎ-終点')
      ));

      // 未保存の日跨ぎシフトも横長バーとして表示する
      const hasDayCrossingShift = isDayCrossingShift;
      const renderAsNormalShift = !hasDayCrossingShift;

      if (renderAsNormalShift) {
        return renderStandardShift();
      }

      // --- Day-crossing shift logic ---
      const dayCrossingShift = shift || shifts?.[0]; // Get the shift from event.shiftData or shifts[0]
      if (!dayCrossingShift || !currentDate || !weekStartDate || !weekEndDate) {
      return renderStandardShift({
        dataShiftType: 'day-crossing-fallback',
        style: { zIndex: 30 + dayCrossingIndex, top: `${normalTop}px` },
      });
      }

      const baseNotes = stripDayCrossingTag(dayCrossingShift.notes || '') || '';
      const dateGroups = buildDayCrossingDateGroups(dayCrossingShift.employeeId, baseNotes, currentDate);

      if (dateGroups.length === 0) {
        return renderStandardShift({
          dataShiftType: 'day-crossing-fallback',
          style: { zIndex: 30 + dayCrossingIndex, top: `${dayCrossingTop}px` },
        });
      }

      const groupIndex = dateGroups.findIndex(group => group.date === currentDate);
      if (groupIndex === -1) {
        return renderStandardShift({
          dataShiftType: 'day-crossing-fallback',
          style: { zIndex: 30 + dayCrossingIndex, top: `${normalTop}px` },
        });
      }

      const shiftStartDate = dateGroups[0].date;
      const shiftEndDate = dateGroups[dateGroups.length - 1].date;

      const currentMoment = dayjs(currentDate);
      const weekStartMoment = dayjs(weekStartDate);
      void dayjs(weekEndDate); // weekEndMoment - 将来の使用のため
      const shiftStartMoment = dayjs(shiftStartDate);
      const shiftEndMoment = dayjs(shiftEndDate);

      const isOverallShiftStart = currentMoment.isSame(shiftStartMoment, 'day');
      const isWeekSegmentStart = currentMoment.isSame(weekStartMoment, 'day') && currentMoment.isAfter(shiftStartMoment, 'day');

      // Determine if this specific event should render a bar segment.
      // A bar segment should render if:
      // 1. It's the overall start day of the day-crossing shift.
      // 2. It's the first day of a new week, AND the day-crossing shift is active on this day.
      const shouldRenderSegment = (isOverallShiftStart || isWeekSegmentStart) &&
                                  currentMoment.isBetween(dayjs(shiftStartDate), dayjs(shiftEndDate).add(1, 'day'), 'day', '[)');

      if (!shouldRenderSegment) {
        return null;
      }

      // Calculate how many days this segment should span within the current calendar grid row.
      // カレンダーグリッド内での現在のセルの位置を取得（0-6, 日曜が0）
      const currentDayOfWeek = currentMoment.day(); // 0=日曜, 1=月曜, ..., 6=土曜
      const daysUntilRowEnd = 6 - currentDayOfWeek; // 土曜日（行の終わり）までのセル数
      
      const daysUntilShiftEnd = shiftEndMoment.diff(currentMoment, 'day');
      let segmentDayCount = Math.min(daysUntilShiftEnd, daysUntilRowEnd) + 1;
      segmentDayCount = Math.max(1, segmentDayCount);

      // Calculate the time display for this specific week segment
      const segmentEndMoment = currentMoment.add(segmentDayCount - 1, 'day');

      // 日付をMM/DD形式でフォーマット
      const formatDateForDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
      };

      // Build the full shift time display for tooltip
      const fullShiftStartTime = dateGroups[0]?.start || '00:00';
      const fullShiftEndTime = dateGroups[dateGroups.length - 1]?.end || '00:00';
      const fullShiftStartDateDisplay = formatDateForDisplay(dateGroups[0]?.date || shiftStartDate);
      const fullShiftEndDateDisplay = formatDateForDisplay(dateGroups[dateGroups.length - 1]?.date || shiftEndDate);
      const fullTimeDisplay = `${fullShiftStartDateDisplay} ${fullShiftStartTime}〜${fullShiftEndDateDisplay} ${fullShiftEndTime}`;

      // このセグメントがシフト全体の最後の週かどうかを判定
      const isLastWeekSegment = segmentEndMoment.isSame(shiftEndMoment, 'day') || segmentEndMoment.isAfter(shiftEndMoment, 'day');

      // Build the time display for this segment
      // 最後の週のみ全体の期間を表示、それ以外は何も表示しない
      const timeDisplay = isLastWeekSegment ? fullTimeDisplay : '';


      const dayCrossingVisual = (() => {
        const borderClass = visual?.borderClass ? ` ${visual.borderClass}` : '';

        if (visual?.isUnsaved) {
          return {
            container: `bg-gray-200 text-gray-800${borderClass}`,
            timeText: 'text-gray-700',
          };
        }

        if (visual?.status === 'unavailable') {
          return {
            container: `bg-rose-100 text-rose-800${borderClass}`,
            timeText: 'text-rose-700',
          };
        }

        return {
          container: `bg-green-100 text-green-800${borderClass}`,
          timeText: 'text-green-700',
        };
      })();

      return (
        <div
          key={event.id}
          data-shift-type="day-crossing"
          data-employee={employee.name}
          data-time-display={timeDisplay}
          className={`${dayCrossingVisual.container} rounded flex items-center justify-between cursor-pointer px-0.5 py-0.5`}
          style={{
            position: 'absolute',
            top: `${dayCrossingTop}px`,
            left: '4px',
            width: `calc(${segmentDayCount * 100}% + ${(segmentDayCount - 1) * 9}px - 8px)`,
            fontSize: '9px',
            fontWeight: '600',
            height: '18px',
            lineHeight: '18px',
            zIndex: 30 + dayCrossingIndex,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            
            // クリップボードモードの場合は、シフトを選択
            if (clipboardMode === 'copy' && onShiftClickForClipboard) {
              // 日マタギシフトグループ全体を取得して選択
              const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, dayCrossingShift);
              groupShifts.forEach(shift => {
                onShiftClickForClipboard(shift);
              });
              return;
            }
            
            // 通常モード：日マタギシフトをクリックした場合は、開始日の日ビューに遷移
            const groupShifts = getAllShiftsInDayCrossingGroup(employee.id, dayCrossingShift);
            if (groupShifts.length > 0) {
              const startDate = groupShifts
                .map(s => s.date)
                .sort()[0]; // 開始日を取得
              setSelectedDate(startDate);
              setViewMode('day');
            } else if (event.onClick) {
              // フォールバック：通常のonClick処理
              event.onClick();
            }
          }}
          title={`${employee.name} ${fullTimeDisplay}（日跨ぎ）\n表示中: ${timeDisplay}`}
        >
          <span className="truncate font-bold" style={{ lineHeight: '18px' }}>{employee.name}</span>
          {timeDisplay && (
            <span className={`${dayCrossingVisual.timeText} text-xs font-semibold`} style={{ lineHeight: '18px' }}>
              {timeDisplay}
            </span>
          )}
        </div>
      );
    };


    // getCombinedDayCrossingShiftsForCell removed - logic moved to renderEvent

    // カスタム日付セルレンダリング（日跨ぎシフト結合バー付き）
    const renderDateCell = (day: CalendarDay, events: CalendarEvent[], week?: any) => {
      const isExpanded = expandedDates.has(day.date);
      const moreEvent = events.find(event => (event.metadata as any)?.isMoreButton);
      const eventsToRender = (moreEvent
        ? events.filter(event => !(event.metadata as any)?.isMoreButton)
        : events);

      const isDayCrossingEvent = (event: CalendarEvent) => {
        const shifts = (event.metadata as any)?.shifts as EmployeeShift[] | undefined;
        if (!Array.isArray(shifts)) {return false;}
        return shifts.some(shift => typeof shift?.notes === 'string' && shift.notes.includes('日跨ぎ'));
      };

      const getEarliestStartTime = (event: CalendarEvent) => {
        const shifts = (event.metadata as any)?.shifts as EmployeeShift[] | undefined;
        if (!Array.isArray(shifts) || shifts.length === 0) {return '24:00';}
        return shifts.reduce((earliest, shift) => {
          const candidate = shift?.startTime || (shift as any)?.originalStartTime || '24:00';
          return candidate < earliest ? candidate : earliest;
        }, '24:00');
      };

      const sortedEvents = eventsToRender.slice().sort((a, b) => {
        const aIsDayCrossing = isDayCrossingEvent(a);
        const bIsDayCrossing = isDayCrossingEvent(b);
        if (aIsDayCrossing !== bIsDayCrossing) {
          return aIsDayCrossing ? -1 : 1;
        }

        const aStart = getEarliestStartTime(a);
        const bStart = getEarliestStartTime(b);
        if (aStart !== bStart) {
          return aStart.localeCompare(bStart);
        }

        const aTitle = a.title || '';
        const bTitle = b.title || '';
        return aTitle.localeCompare(bTitle, 'ja');
      });

      const hasEvents = sortedEvents.length > 0;
      
      // 展開された日付の高さを従業員数に応じて動的に調整（白い部分を完全に削除）
      const expandedHeight = isExpanded ? Math.max(200, events.length * 16 + 15) : 100;

      // ペーストモードで選択されているかチェック
      const isSelectedForPaste = clipboardMode === 'paste' && pendingPasteDates && pendingPasteDates.includes(day.date);

      // 日跨ぎシフト情報を取得（将来の使用のため）
      void getDayCrossingShiftInfo(day.date);
      
      return (
        <div
          key={day.date}
          data-date-cell
          data-date={day.date}
          className={`p-1 border-r border-b border-gray-200 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-150 relative min-h-24 ${
            !day.isCurrentMonth ? 'bg-gray-50' :
            day.isToday ? 'bg-blue-50' :
            day.isHoliday ? 'bg-red-50' :
            day.dayOfWeekNumber === 0 ? 'bg-red-50' :
            day.dayOfWeekNumber === 6 ? 'bg-blue-50' :
            'bg-white'
          } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'} ${
            isSelectedForPaste
              ? 'ring-2 ring-green-500 ring-inset bg-green-50'
              : expandedDates.has(day.date)
              ? 'ring-2 ring-blue-500 ring-inset'
              : ''
          }`}
          style={isExpanded ? { minHeight: `${expandedHeight}px` } : {}}
          onClick={(e) => {
            // +N人ボタンまたは-ボタンがクリックされた場合は日ビューに遷移しない
            if (e.target !== e.currentTarget && ((e.target as HTMLElement).textContent?.includes('+') || (e.target as HTMLElement).textContent?.includes('-'))) {
              return;
            }
            handleDateClick(day.date, e);
          }}
        >
          {/* 日付と祝日名 */}
          <div className="flex items-center gap-1 mb-0 relative z-40">
            <div className={`text-xs font-medium ${
              isSelectedForPaste
                ? 'text-green-800 font-bold'
                : expandedDates.has(day.date)
                ? 'text-blue-800 font-bold'
                : !day.isCurrentMonth ? 'text-gray-400'
                : day.isToday ? 'text-blue-600'
                : day.isHoliday ? 'text-red-600'
                : day.dayOfWeekNumber === 0 ? 'text-red-500'
                : day.dayOfWeekNumber === 6 ? 'text-blue-500'
                : 'text-gray-900'
              }`}>
              {day.day}
            </div>
            {day.holidayName && day.isCurrentMonth && (
              <div className="text-[8px] text-red-600 font-medium truncate">
                {day.holidayName}
              </div>
            )}
            {moreEvent && (
              <button
                type="button"
                className={`ml-auto text-[11px] leading-none px-1 py-[2px] rounded ${moreEvent.backgroundColor || 'bg-blue-100'} ${moreEvent.color || 'text-blue-700'} hover:shadow-md transition`}
                onClick={(e) => {
                  e.stopPropagation();
                  moreEvent.onClick?.();
                }}
              >
                {moreEvent.title}
              </button>
            )}
          </div>
          {isSelectedForPaste && (
            <span className="text-green-600 text-xs">✓</span>
          )}

          {/* 古い日跨ぎシフト結合バーロジックを削除 - renderEventで処理 */}

          {hasEvents && (() => {
            let overallIndex = 0;
            let normalIndex = 0;
            let dayCrossingIndex = 0;
            const renderedEvents: React.ReactNode[] = [];

            // 事前に日マタギシフトの総数をカウント
            const totalDayCrossingShifts = sortedEvents.filter(event => isDayCrossingEvent(event)).length;

            sortedEvents.forEach((event) => {
              const consumesSlot = Boolean(event.metadata?.employee?.name);
              const isDayCrossing = isDayCrossingEvent(event);

              const rendered = renderEvent(
                event,
                {
                  index: overallIndex,
                  normalIndex,
                  dayCrossingIndex,
                  totalDayCrossingShifts,  // 日マタギシフトの総数を渡す
                },
                day.date,
                week.startDate,
                week.endDate
              );

              if (rendered) {
                renderedEvents.push(rendered);

                if (isDayCrossing) {
                  dayCrossingIndex += 1;
                } else if (consumesSlot) {
                  normalIndex += 1;
                }

                overallIndex += 1;
              }
            });

            const totalRows = totalDayCrossingShifts + normalIndex;

            return (
              <div
                className="relative flex flex-col items-center w-full pt-1"
                style={{ minHeight: `${totalRows * 18}px` }}
              >
                {renderedEvents}
              </div>
            );
          })()}
        </div>
      );
    };

    const handlePrevMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    };

    // 日跨ぎシフトグループ全体を取得するヘルパー関数
    const getDayCrossingShiftGroup = (employeeId: string, shiftId: string) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        return [];
      }

      // シフトIDから日跨ぎグループIDを抽出
      // パターン1: "shift-123-day-1" -> "shift-123"
      // パターン2: その他のフォーマット
      let groupId = shiftId;
      const dayMatch = shiftId.match(/^(.+)-day-\d+$/);
      if (dayMatch) {
        groupId = dayMatch[1];
      }

      // 同じグループIDを持つ全てのシフトを取得
      const groupShifts = employee.shifts.filter(s => {
        const isMatch = s.id === groupId || s.id.startsWith(groupId + '-day-');
        return isMatch;
      });
      return groupShifts.sort((a, b) => a.date.localeCompare(b.date));
    };

    // 日跨ぎシフトレンダリング用のヘルパー関数
    const getDayCrossingShiftInfo = (date: string) => {
      const dayCrossingShifts: Array<{
        employee: Employee;
        shift: EmployeeShift;
        startDate: string;
        dates: string[];
        dayCount: number;
        position: number;
        startTime: string;
        endTime: string;
      }> = [];

      filteredEmployees.forEach(employee => {
        const shifts = getShiftsForDate(employee.id, date);
        
        shifts.forEach(shift => {
          // 日跨ぎシフトの起点のみを検出（起点または1日目）
          if (shift.notes && (shift.notes.includes('日跨ぎ-起点') || shift.notes.includes('日跨ぎ-1日目'))) {
            // 日跨ぎシフトグループ全体を取得
            const groupShifts = getDayCrossingShiftGroup(employee.id, shift.id);
            const dates = Array.from(new Set(groupShifts.map(s => s.date))).sort();

            // 時刻情報を取得
            const firstShift = groupShifts.find(s => s.date === dates[0]);
            const lastShift = groupShifts.find(s => s.date === dates[dates.length - 1]);
            const startTime = firstShift?.startTime || shift.startTime || '';
            const endTime = lastShift?.endTime || shift.endTime || '';

            dayCrossingShifts.push({
              employee,
              shift,
              startDate: date,
              dates,
              dayCount: dates.length,
              position: dayCrossingShifts.length,
              startTime,
              endTime
            });
          }
        });
      });

      return dayCrossingShifts;
    };

    return (
      <div>
        {/* 月ビューナビゲーション - 白枠の外 */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              ＜
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              ＞
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* シフト追加ボタン */}
            <button
              onClick={() => {
                setShiftModalMode('bulk');
                setEditingShift(null);
                setSelectedShift(null);
                setShowShiftModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              シフト追加
            </button>
            {/* 保存ボタン */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={!unsavedShiftIds || unsavedShiftIds.size === 0}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                  unsavedShiftIds && unsavedShiftIds.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                保存
              </button>
            )}
          </div>
        </div>
        
        <UnifiedMonthCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={(date, _day, event) => handleDateClick(date, event)}
          getEventsForDate={getEventsForDate}
          renderEvent={renderEvent}
          renderDateCell={renderDateCell}
          showNavigation={false}
          showWeekdays={true}
          className=""
        />
      </div>
    );
  };

  return (
    <div className="space-y-2 w-full">
      {/* サイドパネル切り替えボタン - 白枠の外に配置 */}
      <div className="flex justify-end gap-2 pr-4 sm:pr-3">
        <button
          onClick={() => setShowEmployeeSummary && setShowEmployeeSummary(!showEmployeeSummary)}
          className={`px-3 py-1 rounded font-medium text-xs transition-all duration-300 ${
            showEmployeeSummary
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showEmployeeSummary ? '従業員集計 ON' : '従業員集計 OFF'}
        </button>
        <button
          onClick={() => {
            const newState = !showClipboard;
            setShowClipboard && setShowClipboard(newState);
            // クリップボードを開く時は自動的にコピーモードにする
            if (newState) {
              setClipboardMode && setClipboardMode('copy');
              setSelectedShifts && setSelectedShifts([]);
              setPendingPasteDates && setPendingPasteDates([]);
            } else {
              setClipboardMode && setClipboardMode('none');
            }
          }}
          className={`px-3 py-1 rounded font-medium text-xs transition-all duration-300 ${
            showClipboard
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showClipboard ? 'クリップボード ON' : 'クリップボード OFF'}
        </button>
      </div>

      {/* 白枠セクション */}
      <div className="bg-white shadow rounded-lg w-full overflow-hidden">
        <div className="px-4 py-2 sm:p-3 w-full overflow-hidden">
          {/* ビュー切り替えとナビゲーション */}
          <div className="space-y-2">
            {/* ビューモード選択とフィルター */}
            <div className="space-y-2">
              {/* 1行目：ビューモードとフィルター */}
              <div className="flex items-center justify-between">
                {/* ビューモード選択 */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'month' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    月
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'day' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    日
                  </button>
                </div>

                {/* 展開/縮小ボタン */}
                <div className="flex items-center justify-end">
                  {/* 展開/縮小ボタン（月ビューのみ表示） */}
                  {viewMode === 'month' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExpandAllDates}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          allDatesExpanded
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        展開
                      </button>
                      <button
                        onClick={handleCollapseAllDates}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          !allDatesExpanded && expandedDates.size === 0
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        縮小
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
            </div>

            {/* ビューモードに応じた表示 */}
            <div>
              {viewMode === 'day' && <DayView />}
              {viewMode === 'month' && <MonthView />}
            </div>
          </div>
        </div>
      </div>

      {/* シフト登録・編集モーダル（統合版） */}
      <ShiftModal
        isOpen={showShiftModal}
        onClose={() => {
          setShowShiftModal(false);
          setEditingShift(null);
          setSelectedShift(null);
        }}
        mode={shiftModalMode}
        employees={filteredEmployees}
        editingShift={editingShift}
        onSave={handleShiftModalSave}
        onDelete={selectedShift ? handleDeleteShift : undefined}
      />

    </div>
  );
}