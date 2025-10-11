'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatDate, toLocalDateString } from '@/utils/dateTimeUtils';
import { WEEKDAYS_JA, TIME_SLOTS, SHIFT_STATUS } from '@/constants/calendar';
import UnifiedMonthCalendar, { CalendarDay, CalendarEvent } from './UnifiedMonthCalendar';
import TimeRangeDisplaySelector from './TimeRangeDisplaySelector';
import Modal from './ui/Modal';
import ShiftModal, { ShiftModalData } from './ShiftModal';

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
}

type ViewMode = 'day' | 'month';

export default function ShiftCalendar({
  employees,
  truckSchedules = [],
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
  onDisplayTimeRangeChange,
  showClipboard,
  setShowClipboard,
  showEmployeeSummary,
  setShowEmployeeSummary,
  clipboardMode,
  setClipboardMode,
  clipboardData,
  setClipboardData,
  onDateClickForClipboard,
  selectedShifts,
  setSelectedShifts,
  copiedShifts,
  setCopiedShifts,
  pendingPasteDates,
  setPendingPasteDates,
  onShiftClickForClipboard,
  unsavedShiftIds,
  onSave
}: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [highlightedEmployee, setHighlightedEmployee] = useState<Employee | null>(null); // 青枠表示用
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [editingShift, setEditingShift] = useState<EmployeeShift | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<'edit' | 'create' | 'bulk' | 'range'>('edit');
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // 月ビュー展開状態管理
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [allDatesExpanded, setAllDatesExpanded] = useState<boolean>(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set()); // 展開された週を管理

  // デバッグ用：状態変化を監視
  useEffect(() => {
    console.log('State changed - allDatesExpanded:', allDatesExpanded, 'expandedDate:', expandedDate, 'collapsedDates:', Array.from(collapsedDates), 'expandedWeeks:', Array.from(expandedWeeks));
  }, [allDatesExpanded, expandedDate, collapsedDates, expandedWeeks]);

  // シフト追加後に自動的にシフトを結合する
  useEffect(() => {
    // 新しく追加されたシフトがあるかチェック
    employees.forEach(employee => {
      // 各従業員の各日付でシフトを結合
      const dates = [...new Set(employee.shifts.map(shift => shift.date))];
      dates.forEach(date => {
        const dayShifts = employee.shifts.filter(shift => shift.date === date);
        if (dayShifts.length > 1) {
          // 同じステータスの連続するシフトを結合
          mergeAdjacentShifts(employee.id, date);
        }
      });
    });
  }, [employees]); // employeesの変更を監視

  // グローバルなマウスイベントリスナー
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log('Global mouseup detected', { dragState: !!dragState, barResizeState: !!barResizeState });
      
      if (dragState) {
        console.log('Calling handleMouseUp');
        handleMouseUp();
      } else         if (barResizeState) {
          console.log('Calling handleBarResizeEnd');
          handleBarResizeEnd();
        }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // リサイズ中またはバーリサイズ中のみ処理
      if (!barResizeState) return;
      
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
    console.log('handleExpandAllDates called - setting allDatesExpanded to true');
    setAllDatesExpanded(true);
    setExpandedDate(null); // 個別展開をクリア
    setCollapsedDates(new Set()); // 個別縮小もクリア
    setExpandedWeeks(new Set()); // 週展開もクリア
  };

  const handleCollapseAllDates = () => {
    console.log('handleCollapseAllDates called - setting allDatesExpanded to false');
    setAllDatesExpanded(false);
    setExpandedDate(null); // 個別展開もクリア
    setCollapsedDates(new Set()); // 個別縮小もクリア
    setExpandedWeeks(new Set()); // 週展開もクリア
  };

  // 個別の日付を縮小する関数
  const handleCollapseDate = (date: string) => {
    console.log('handleCollapseDate called:', date);
    setExpandedDate(null);
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(date);
      return newSet;
    });
    setExpandedWeeks(new Set());
  };

  // 従業員をクリックした時の処理（日ビューに遷移）
  const handleEmployeeClick = (employee: Employee, date: string) => {
    console.log('handleEmployeeClick called:', employee.name, date);
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
    if (!employee) return [];
    
    return employee.shifts.filter(shift => shift.date === date);
  };

  // 日跨ぎシフト専用のブロック取得関数
  const getDayCrossingShiftBlocks = (employeeId: string, date: string, dayShifts: EmployeeShift[]): Array<{
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
    console.log('🌙 getDayCrossingShiftBlocks called');
    
    // 日跨ぎシフトをグループ化（同じnotesを持つシフトをグループ化）
    const dayCrossingGroups = new Map<string, EmployeeShift[]>();
    
    dayShifts.forEach(shift => {
      if (shift.notes && shift.notes.includes('日跨ぎ')) {
        // notesから元のメモを抽出（日跨ぎ-1日目、日跨ぎ-2日目を除く）
        const originalNotes = shift.notes.replace(/ \(日跨ぎ-[12]日目\)/, '');
        if (!dayCrossingGroups.has(originalNotes)) {
          dayCrossingGroups.set(originalNotes, []);
        }
        dayCrossingGroups.get(originalNotes)!.push(shift);
      }
    });
    
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
    
    dayCrossingGroups.forEach((shifts, originalNotes) => {
      if (shifts.length === 0) return;
      
      // 1日目のシフトを探す
      const day1Shift = shifts.find(shift => shift.notes?.includes('日跨ぎ-1日目'));
      if (day1Shift) {
        const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === day1Shift.timeSlot);
        const timeSlot = TIME_SLOTS[timeIndex];
        
        const shiftStartTime = day1Shift.startTime || timeSlot.start;
        const shiftEndTime = day1Shift.endTime || timeSlot.end;
        
        const startIndex = TIME_SLOTS.findIndex(ts => ts.start === shiftStartTime);
        const endIndex = TIME_SLOTS.findIndex(ts => ts.end === shiftEndTime);
        
        // 元の終了時間を取得（2日目のシフトから）
        const day2Shift = shifts.find(shift => shift.notes?.includes('日跨ぎ-2日目'));
        const originalEndTime = day2Shift?.endTime || '18:00';
        
        const block = {
          id: day1Shift.id,
          startTime: shiftStartTime,
          endTime: shiftEndTime,
          status: day1Shift.status,
          customerName: day1Shift.customerName,
          notes: originalNotes,
          startIndex: startIndex >= 0 ? startIndex : timeIndex,
          endIndex: endIndex >= 0 ? endIndex : timeIndex,
          isDayCrossing: true,
          originalStartTime: shiftStartTime,
          originalEndTime: originalEndTime,
        };
        
        blocks.push(block);
        console.log('🌙 日跨ぎブロック作成:', block);
      }
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
    console.log(`🚀 getShiftBlocks called for ${employeeId} on ${date}`);
    const dayShifts = getShiftsForDate(employeeId, date);
    
    console.log('🔍 getShiftBlocks:', employeeId, date, 'found', dayShifts.length, 'shifts');
    dayShifts.forEach((s, i) => {
      console.log(`  Shift ${i+1}:`, {
        id: s.id,
        timeSlot: s.timeSlot,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        customerName: s.customerName,
        notes: s.notes
      });
    });

    // 日跨ぎシフトの検出と処理
    const dayCrossingShifts = dayShifts.filter(shift => 
      shift.notes && shift.notes.includes('日跨ぎ')
    );
    
    if (dayCrossingShifts.length > 0) {
      console.log('🌙 日跨ぎシフト検出:', dayCrossingShifts.length, '個');
      // 日跨ぎシフトの場合は特別な表示処理
      return getDayCrossingShiftBlocks(employeeId, date, dayShifts);
    }

    // 重複したシフトをチェックして警告
    const uniqueShifts = new Map();
    const duplicateShifts: string[] = [];
    
    dayShifts.forEach(shift => {
      const key = `${shift.startTime}-${shift.endTime}-${shift.status}`;
      if (uniqueShifts.has(key)) {
        duplicateShifts.push(shift.id);
        console.warn(`⚠️ 重複したシフトが検出されました: ${shift.id} (${shift.startTime}-${shift.endTime})`);
      } else {
        uniqueShifts.set(key, shift);
      }
    });

    if (duplicateShifts.length > 0) {
      console.log(`🔄 ${duplicateShifts.length}個の重複したシフトが検出されました。自動統合を実行します...`);
      
      // 重複シフトが検出された場合は即座に自動統合を実行
      mergeOverlappingShifts(employeeId, date);
      
      // 統合後、統合されたシフトでブロックを再構築
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return [];
      
      const updatedDayShifts = employee.shifts.filter(shift => shift.date === date);
      console.log(`📊 統合後のシフト数: ${updatedDayShifts.length}個`);
      
      // 統合後のシフトでブロックを再構築
      if (updatedDayShifts.length === 1) {
        const shift = updatedDayShifts[0];
        const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
        const timeSlot = TIME_SLOTS[timeIndex];
        
        const shiftStartTime = shift.startTime || timeSlot.start;
        const shiftEndTime = shift.endTime || timeSlot.end;
        
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
          startIndex: startIndex >= 0 ? startIndex : timeIndex,
          endIndex: endIndex >= 0 ? endIndex : timeIndex,
        };
        
        console.log('📊 統合後のブロック:', block);
        return [block];
      }
      
      // 複数シフトがある場合は通常のブロック化処理を実行
      // （この時点では重複はないはず）
    }
    
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

    // 単一シフトの場合はstartTimeとendTimeをそのまま使用（ブロック化不要）
    if (dayShifts.length === 1) {
      const shift = dayShifts[0];
      const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
      const timeSlot = TIME_SLOTS[timeIndex];
      
      const shiftStartTime = shift.startTime || timeSlot.start;
      const shiftEndTime = shift.endTime || timeSlot.end;
      
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
        startIndex: startIndex >= 0 ? startIndex : timeIndex,
        endIndex: endIndex >= 0 ? endIndex : timeIndex,
        isDayCrossing: false,
        originalStartTime: undefined,
        originalEndTime: undefined,
      };
      
      console.log('📊 Returning 1 block:', block);
      return [block];
    }

    // 連続するシフトをブロック化（複数シフトの場合のみ）
    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
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

    console.log('📊 Sorted shifts for merging:', sortedShifts.map(s => ({
      id: s.id,
      timeSlot: s.timeSlot,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status
    })));

    let currentBlock: any = null;
    
    sortedShifts.forEach((shift, shiftIndex) => {
      const timeIndex = TIME_SLOTS.findIndex(ts => ts.id === shift.timeSlot);
      const timeSlot = TIME_SLOTS[timeIndex];
      
      // startTimeとendTimeが設定されている場合、それを優先的に使用
      const shiftStartTime = shift.startTime || timeSlot.start;
      const shiftEndTime = shift.endTime || timeSlot.end;
      
      // 開始時間と終了時間から正しいインデックスを計算
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === shiftStartTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === shiftEndTime);
      const actualStartIndex = startIndex >= 0 ? startIndex : timeIndex;
      const actualEndIndex = endIndex >= 0 ? endIndex : timeIndex;

      console.log(`🔄 Processing shift ${shiftIndex + 1}/${sortedShifts.length}:`, {
        id: shift.id,
        timeSlot: shift.timeSlot,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        status: shift.status,
        actualStartIndex,
        actualEndIndex,
        hasCurrentBlock: !!currentBlock,
        currentBlockEndIndex: currentBlock?.endIndex
      });
      
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
        console.log(`🔗 Merging shift blocks: ${currentBlock.startTime}-${currentBlock.endTime} + ${shiftStartTime}-${shiftEndTime}`);
        
        // より長い時間帯に拡張
        const currentDuration = currentBlock.endIndex - currentBlock.startIndex;
        const newDuration = actualEndIndex - actualStartIndex;
        const mergedDuration = Math.max(currentDuration, newDuration);
        
        // 開始時間は早い方を、終了時間は遅い方を採用
        const mergedStartIndex = Math.min(currentBlock.startIndex, actualStartIndex);
        const mergedEndIndex = Math.max(currentBlock.endIndex, actualEndIndex);
        
        currentBlock.startIndex = mergedStartIndex;
        currentBlock.endIndex = mergedEndIndex;
        currentBlock.startTime = TIME_SLOTS[mergedStartIndex]?.start || currentBlock.startTime;
        currentBlock.endTime = TIME_SLOTS[mergedEndIndex]?.end || currentBlock.endTime;
        
        console.log(`✅ Merged result: ${currentBlock.startTime}-${currentBlock.endTime} (${mergedStartIndex}-${mergedEndIndex})`);
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

    console.log('📊 getShiftBlocks returning', shiftBlocks.length, 'blocks:');
    shiftBlocks.forEach((b, i) => {
      console.log(`  Block ${i+1}:`, b.id, b.startTime, '-', b.endTime, `(${((parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime)) / 60).toFixed(1)}h)`);
    });

    return shiftBlocks;
  };

  // 時間文字列を分に変換するヘルパー関数
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 同一時間帯のシフトを統合する関数
  const mergeOverlappingShifts = (employeeId: string, date: string): Array<{
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
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return [];

    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    if (dayShifts.length <= 1) return []; // シフトが1つ以下の場合は統合不要

    console.log(`🔍 シフト統合チェック: ${employee.name} - ${date} (${dayShifts.length}個のシフト)`);

    // 重複するシフトを検出
    const overlappingGroups: EmployeeShift[][] = [];
    const processedShifts = new Set<string>();

    dayShifts.forEach(shift => {
      if (processedShifts.has(shift.id)) return;

      const shiftStart = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
      const shiftEnd = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';
      
      console.log(`  📋 シフトチェック: ${shift.id} (${shiftStart}-${shiftEnd})`);
      
      const group = [shift];
      processedShifts.add(shift.id);

      // 他のシフトとの重複をチェック
      dayShifts.forEach(otherShift => {
        if (processedShifts.has(otherShift.id)) return;

        const otherStart = otherShift.startTime || TIME_SLOTS.find(ts => ts.id === otherShift.timeSlot)?.start || '';
        const otherEnd = otherShift.endTime || TIME_SLOTS.find(ts => ts.id === otherShift.timeSlot)?.end || '';
        
        // 時間の重複をチェック
        const isOverlapping = shiftStart < otherEnd && shiftEnd > otherStart;
        console.log(`    🔄 重複チェック: ${otherShift.id} (${otherStart}-${otherEnd}) -> ${isOverlapping ? '重複あり' : '重複なし'}`);
        
        if (isOverlapping) {
          group.push(otherShift);
          processedShifts.add(otherShift.id);
        }
      });

      if (group.length > 1) {
        console.log(`  ⚠️ 重複グループ発見: ${group.length}個のシフト`);
        overlappingGroups.push(group);
      }
    });

    console.log(`📊 統合対象グループ数: ${overlappingGroups.length}`);

    // 重複グループを統合
    overlappingGroups.forEach((group, groupIndex) => {
      console.log(`🔄 自動シフト統合 ${groupIndex + 1}: ${group.length}個の重複シフトを統合します`);
      
      // グループ内のシフトを削除
      group.forEach(shift => {
        console.log(`  🗑️ シフト削除: ${shift.id}`);
        onDeleteShift(employeeId, shift.id);
      });

      // 統合された時間範囲を計算
      const allStartTimes = group.map(s => s.startTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || '').filter(Boolean);
      const allEndTimes = group.map(s => s.endTime || TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || '').filter(Boolean);
      
      const mergedStartTime = allStartTimes.sort()[0]; // 最も早い開始時間
      const mergedEndTime = allEndTimes.sort()[allEndTimes.length - 1]; // 最も遅い終了時間

      console.log(`✅ 統合完了: ${mergedStartTime} - ${mergedEndTime} (${group.length}個のシフトを統合)`);

      // 統合されたシフトを作成（無限ループを防ぐため直接onAddShiftを呼び出さない）
      const startIndex = TIME_SLOTS.findIndex(ts => ts.start === mergedStartTime);
      const endIndex = TIME_SLOTS.findIndex(ts => ts.end === mergedEndTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = startIndex; i <= endIndex; i++) {
          const timeSlot = TIME_SLOTS[i];
          const newShift: Omit<EmployeeShift, 'id'> = {
            employeeId,
            date,
            timeSlot: timeSlot.id,
            status: 'working', // 統合後は出勤ステータス
            customerName: '',
            notes: `統合されたシフト (${group.length}個のシフトから自動統合)`,
            startTime: mergedStartTime,
            endTime: mergedEndTime,
          };
          console.log(`  ➕ 新シフト作成: ${timeSlot.id} (${mergedStartTime}-${mergedEndTime})`);
          onAddShift(employeeId, newShift);
        }
      }
    });
    
    // 統合後のブロックを返す
    return getShiftBlocks(employeeId, date);
  };



  // シフトの変更を追跡する関数
  const handleShiftUpdate = (shiftId: string, updatedShift: Partial<EmployeeShift>) => {
    const employee = employees.find(emp => emp.shifts.some(shift => shift.id === shiftId));
    if (employee) {
      const existingShift = employee.shifts.find(shift => shift.id === shiftId);
      if (existingShift) {
        onUpdateShift(shiftId, { ...existingShift, ...updatedShift });
      }
    }
  };

  const handleShiftAdd = (newShift: Omit<EmployeeShift, 'id'>) => {
    console.log(`➕ handleShiftAdd called for ${newShift.employeeId}:`, newShift);
    onAddShift(newShift.employeeId, newShift);
    console.log(`✅ handleShiftAdd completed for ${newShift.employeeId}`);
  };

  const handleShiftDelete = (shiftId: string) => {
    const employee = employees.find(emp => emp.shifts.some(shift => shift.id === shiftId));
    if (employee) {
      onDeleteShift(employee.id, shiftId);
    }
  };

  // クリップボード機能
  const startCopyMode = () => {
    setClipboardMode && setClipboardMode('copy');
    setSelectedShifts && setSelectedShifts([]);
    setCopiedShifts && setCopiedShifts([]);
    setShowClipboard && setShowClipboard(true);
  };

  const startPasteMode = () => {
    if (copiedShifts && copiedShifts.length === 0) {
      alert('コピーされたシフトがありません');
      return;
    }
    setClipboardMode && setClipboardMode('paste');
    setSelectedShifts && setSelectedShifts([]);
    setPendingPasteDates && setPendingPasteDates([]);
    setShowClipboard && setShowClipboard(true);
  };

  const handleShiftClickForClipboard = (shift: EmployeeShift) => {
    if (clipboardMode === 'copy' && setSelectedShifts) {
      // コピーモード：シフトを選択
      setSelectedShifts((prev: EmployeeShift[]) => {
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
    if (clipboardMode === 'paste' && setPendingPasteDates && pendingPasteDates) {
      // ペーストモード：複数の貼り付け先を選択
      const exists = pendingPasteDates.includes(date);
      if (exists) {
        setPendingPasteDates(pendingPasteDates.filter(d => d !== date));
      } else {
        setPendingPasteDates([...pendingPasteDates, date]);
      }
    }
  };

  const executeCopy = () => {
    if (!selectedShifts || selectedShifts.length === 0) {
      alert('コピーするシフトを選択してください');
      return;
    }

    // 出勤状態のシフトのみコピー
    const workingShifts = selectedShifts.filter(shift => shift.status === 'working');
    
    if (workingShifts.length === 0) {
      alert('選択したシフトにコピー可能なシフト（出勤）がありません');
      return;
    }

    setCopiedShifts && setCopiedShifts(workingShifts);
    setSelectedShifts && setSelectedShifts([]);
    // コピー後、自動的に貼り付けモードに移行
    setClipboardMode && setClipboardMode('paste');
    setPendingPasteDates && setPendingPasteDates([]);
  };

  const executePaste = () => {
    if (!pendingPasteDates || pendingPasteDates.length === 0) {
      alert('貼り付け先の日付を選択してください');
      return;
    }

    if (!copiedShifts || copiedShifts.length === 0) {
      alert('コピーされたシフトがありません');
      return;
    }

    // 重複チェック
    const conflicts: Array<{
      employeeName: string;
      date: string;
      timeRange: string;
      reason: string;
    }> = [];

    // 貼り付け予定のシフトを従業員・日付ごとに整理
    const pendingShiftsByEmployeeAndDate: {
      [key: string]: {
        employeeId: string;
        date: string;
        shifts: Array<{ startTime: string; endTime: string; shift: typeof copiedShifts[0] }>
      }
    } = {};

    pendingPasteDates.forEach(date => {
      copiedShifts.forEach(shift => {
        const employee = employees.find(emp => emp.id === shift.employeeId);
        if (!employee) return;

        const key = `${shift.employeeId}|||${date}`; // より安全な区切り文字
        const newStartTime = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
        const newEndTime = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';

        if (!pendingShiftsByEmployeeAndDate[key]) {
          pendingShiftsByEmployeeAndDate[key] = {
            employeeId: shift.employeeId,
            date: date,
            shifts: []
          };
        }

        // 貼り付け予定のシフト同士の重複チェック
        const hasPendingConflict = pendingShiftsByEmployeeAndDate[key].shifts.some(pending => {
          return (newStartTime < pending.endTime && newEndTime > pending.startTime);
        });

        if (hasPendingConflict) {
          conflicts.push({
            employeeName: employee.name,
            date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
            timeRange: `${newStartTime}-${newEndTime}`,
            reason: '貼り付け予定のシフト同士が重複'
          });
        }

        // 既存シフトとの重複チェック
        const existingShifts = employee.shifts.filter(s => s.date === date);
        const hasExistingConflict = existingShifts.some(existingShift => {
          const existingStartTime = existingShift.startTime || TIME_SLOTS.find(ts => ts.id === existingShift.timeSlot)?.start || '';
          const existingEndTime = existingShift.endTime || TIME_SLOTS.find(ts => ts.id === existingShift.timeSlot)?.end || '';
          
          // 時間の重複をチェック
          return (newStartTime < existingEndTime && newEndTime > existingStartTime);
        });

        if (hasExistingConflict) {
          conflicts.push({
            employeeName: employee.name,
            date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
            timeRange: `${newStartTime}-${newEndTime}`,
            reason: '既存のシフトと重複'
          });
        }

        // 重複がない場合は貼り付け予定リストに追加
        if (!hasPendingConflict && !hasExistingConflict) {
          pendingShiftsByEmployeeAndDate[key].shifts.push({
            startTime: newStartTime,
            endTime: newEndTime,
            shift
          });
        }
      });
    });

    // 重複がある場合はエラーを表示して中断
    if (conflicts.length > 0) {
      // 重複を原因別にグループ化
      const pendingConflicts = conflicts.filter(c => c.reason === '貼り付け予定のシフト同士が重複');
      const existingConflicts = conflicts.filter(c => c.reason === '既存のシフトと重複');
      
      let message = '以下のシフトが重複しているため、貼り付けできません：\n\n';
      
      if (pendingConflicts.length > 0) {
        message += '【同じ担当者・同じ時間のシフトを複数貼り付けようとしています】\n';
        pendingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\n';
      }
      
      if (existingConflicts.length > 0) {
        message += '【既に登録されているシフトと重複しています】\n';
        existingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\n既存のシフトを削除してから再度お試しください。\n';
      }
      
      if (pendingConflicts.length > 0) {
        message += '\nコピー元のシフトに重複がないか確認してください。';
      }
      
      alert(message);
      return;
    }

    // 重複がない場合のみ貼り付けを実行
    // pendingShiftsByEmployeeAndDateに登録されたシフトのみを貼り付け
    Object.keys(pendingShiftsByEmployeeAndDate).forEach(key => {
      const group = pendingShiftsByEmployeeAndDate[key];
      group.shifts.forEach(pending => {
        const newShift: Omit<EmployeeShift, 'id'> = {
          employeeId: group.employeeId,
          date: group.date,
          timeSlot: pending.shift.timeSlot,
          status: pending.shift.status,
          customerName: pending.shift.customerName,
          notes: pending.shift.notes,
          startTime: pending.shift.startTime,
          endTime: pending.shift.endTime,
        };
        handleShiftAdd(newShift);
      });
    });
    
    setPendingPasteDates && setPendingPasteDates([]);
    setClipboardMode && setClipboardMode('none');
  };

  const cancelClipboard = () => {
    setClipboardMode && setClipboardMode('none');
    setSelectedShifts && setSelectedShifts([]);
    setPendingPasteDates && setPendingPasteDates([]);
    setShowClipboard && setShowClipboard(false);
  };

  const removeSelectedShift = (shiftIdToRemove: string) => {
    setSelectedShifts && setSelectedShifts((prev: EmployeeShift[]) => prev.filter(shift => shift.id !== shiftIdToRemove));
  };

  const clearSelectedShifts = () => {
    setSelectedShifts && setSelectedShifts([]);
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

  // シフトが入っている従業員のみを表示（日ビュー用）
  const displayEmployees = filteredEmployees.filter(employee => 
    employee.shifts.some(shift => shift.date === selectedDate)
  );

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
    // 休憩時間の設定を削除（12時から13時も通常時間として表示）
    return false;
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
  const checkShiftOverlap = (employeeId: string, date: string, startTime: string, endTime: string, excludeShiftId?: string, currentStatus?: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return false;

    const dayShifts = employee.shifts.filter(shift => 
      shift.date === date && shift.id !== excludeShiftId
    );

    const hasOverlap = dayShifts.some(shift => {
      const shiftStart = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
      const shiftEnd = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';
      
      // 時間の重複をチェック（完全に同じ時間帯は除外）
      const timeOverlap = (startTime < shiftEnd && endTime > shiftStart);
      
      // 隣接シフトの結合を許可するため、同じステータスで隣接している場合は重複としない
      const isAdjacent = (endTime === shiftStart) || (startTime === shiftEnd);
      
      // 同じステータスの場合のみ重複として扱う
      // currentStatusがundefinedの場合は、既存シフトのステータスと比較しない（常に重複として扱わない）
      const statusMatch = currentStatus ? shift.status === currentStatus : false;
      
      // 隣接している場合は重複としない
      const overlap = timeOverlap && statusMatch && !isAdjacent;
      
      if (timeOverlap) {
        console.warn(`⚠️ 時間重複検出: 新規(${startTime}-${endTime}) [${currentStatus}] vs 既存(${shiftStart}-${shiftEnd}) [${shift.status}]`);
        console.warn(`   判定式: (${startTime} < ${shiftEnd}) && (${endTime} > ${shiftStart}) = (${startTime < shiftEnd}) && (${endTime > shiftStart}) = ${timeOverlap}`);
        console.warn(`   ステータス一致: ${statusMatch}, 隣接判定: ${isAdjacent}, 重複判定: ${overlap}`);
        console.warn(`   既存シフト詳細:`, { id: shift.id, status: shift.status, timeSlot: shift.timeSlot });
      }
      
      return overlap;
    });

    if (hasOverlap) {
      console.warn(`🚨 重複シフト作成をブロック: ${employeeId} on ${date} at ${startTime}-${endTime} [${currentStatus}]`);
    }

    return hasOverlap;
  };

  // 同じステータスのシフトを結合する関数
  const mergeAdjacentShifts = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    console.log(`🔗 mergeAdjacentShifts called for ${employeeId} on ${date}`);

    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    console.log(`📋 Found ${dayShifts.length} shifts for the day:`, dayShifts.map(s => ({ id: s.id, timeSlot: s.timeSlot, startTime: s.startTime, endTime: s.endTime, status: s.status })));

    const sortedShifts = dayShifts.sort((a, b) => {
      const timeA = TIME_SLOTS.find(ts => ts.id === a.timeSlot)?.start || '';
      const timeB = TIME_SLOTS.find(ts => ts.id === b.timeSlot)?.start || '';
      return timeA.localeCompare(timeB);
    });

    // 同じステータスの連続するシフトを結合
    const mergedShifts: EmployeeShift[] = [];
    let currentGroup: EmployeeShift[] = [];
    let hasMerges = false;

    sortedShifts.forEach((shift, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(shift);
      } else {
        const lastShift = currentGroup[currentGroup.length - 1];
        const lastEndTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
        const currentStartTime = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
        
        console.log(`🔍 Comparing shifts: ${lastShift.id} (${lastEndTime}) vs ${shift.id} (${currentStartTime}), status: ${lastShift.status} vs ${shift.status}`);
        
        // 同じステータスで連続している場合
        if (lastShift.status === shift.status && lastEndTime === currentStartTime) {
          console.log(`✅ Shifts are adjacent and same status, adding to group`);
          currentGroup.push(shift);
        } else {
          // グループを結合して新しいシフトを作成
          if (currentGroup.length > 1) {
            console.log(`🔗 Merging group of ${currentGroup.length} shifts`);
            hasMerges = true;
            
            const firstShift = currentGroup[0];
            const lastShift = currentGroup[currentGroup.length - 1];
            const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
            const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
            
            console.log(`📝 Creating merged shift: ${startTime}-${endTime} [${firstShift.status}]`);
            
            // 既存のシフトを削除
            currentGroup.forEach(s => {
              console.log(`🗑️ Deleting shift: ${s.id}`);
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
              console.log('➕ Adding merged single shift:', newShift);
              handleShiftAdd(newShift);
            }
          }
          currentGroup = [shift];
        }
      }
    });

    // 最後のグループも処理
    if (currentGroup.length > 1) {
      console.log(`🔗 Merging final group of ${currentGroup.length} shifts`);
      hasMerges = true;
      
      const firstShift = currentGroup[0];
      const lastShift = currentGroup[currentGroup.length - 1];
      const startTime = firstShift.startTime || TIME_SLOTS.find(ts => ts.id === firstShift.timeSlot)?.start || '';
      const endTime = lastShift.endTime || TIME_SLOTS.find(ts => ts.id === lastShift.timeSlot)?.end || '';
      
      console.log(`📝 Creating final merged shift: ${startTime}-${endTime} [${firstShift.status}]`);
      
      // 既存のシフトを削除
      currentGroup.forEach(s => {
        console.log(`🗑️ Deleting final shift: ${s.id}`);
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
        console.log('➕ Adding final merged single shift:', newShift);
        handleShiftAdd(newShift);
      }
    }

    if (!hasMerges) {
      console.log(`ℹ️ No merges needed for ${employeeId} on ${date}`);
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
      
      console.log('Drag completed - startIndex:', startIndex, 'endIndex:', endIndex);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const [minIndex, maxIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
        const selectedSlots = maxIndex - minIndex + 1;
        
        console.log('Selected slots:', selectedSlots);
        
        // ドラッグした範囲にシフトを作成（長さに関わらず統一）
        console.log('Creating shifts for selected slots');
        const startTimeSlot = filteredTimeSlots[minIndex];
        const endTimeSlot = filteredTimeSlots[maxIndex];
        const startTime = startTimeSlot.start;
        const endTime = endTimeSlot.end;
        
        console.log('Creating shift from', startTime, 'to', endTime);
        
        // 重複チェック：ドラッグした時間範囲全体で既存シフトとの重複をチェック
        console.log('🔍 Checking overlap for drag:', {
          employeeId: dragState.currentEmployee,
          date: selectedDate,
          timeRange: `${startTime}-${endTime}`,
          status: 'working' // ドラッグで作成されるシフトは通常workingステータス
        });
        
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
        shiftsToCreate.forEach((shift, index) => {
          console.log(`📝 Creating shift ${index + 1}/${shiftsToCreate.length}:`, shift);
          handleShiftAdd(shift);
        });
        
        console.log(`📝 Created ${shiftsToCreate.length} shifts for ${dragState.currentEmployee}`);
        
        // シフト作成直後に、実際にシフトが追加されているかチェック
        setTimeout(() => {
          const employee = employees.find(emp => emp.id === dragState.currentEmployee);
          if (employee) {
            const dayShifts = employee.shifts.filter(s => s.date === selectedDate);
            console.log(`🔍 After creation: ${dayShifts.length} shifts found for ${employee.name}`);
            dayShifts.forEach((s, i) => {
              console.log(`  Shift ${i + 1}:`, s.id, s.startTime, '-', s.endTime);
            });
            
            // シフトブロックを再計算してチェック
            const updatedBlocks = getShiftBlocks(dragState.currentEmployee, selectedDate);
            console.log(`📊 Updated blocks: ${updatedBlocks.length} blocks found`);
            updatedBlocks.forEach((b, i) => {
              console.log(`  Block ${i + 1}:`, b.startTime, '-', b.endTime);
            });
          }
        }, 100);
        
        // シフト作成完了
        console.log('✅ ドラッグ操作でシフト作成完了');
        
        // 状態をクリア
        setDragState(null);
      }
    }
    setDragState(null);
  };



  // バーリサイズ用の関数
  const handleBarResizeEnter = (employeeId: string, timeSlotId: string) => {
    if (!barResizeState) return;
    if (barResizeState.employeeId !== employeeId) return;
    
    const timeSlot = TIME_SLOTS.find(ts => ts.id === timeSlotId);
    if (!timeSlot) return;
    
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
    if (!barResizeState) return;
    
    const employee = employees.find(emp => emp.id === barResizeState.employeeId);
    if (!employee) return;
    
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
      
      console.warn('═══════════════════════════════════════');
      console.warn('🔄 BAR RESIZE - UPDATING SHIFT TIME');
      console.warn('Old time:', barResizeState.originalStartTime, '-', barResizeState.originalEndTime);
      console.warn('New time:', newStartTime, '-', newEndTime);
      console.warn('═══════════════════════════════════════');
      
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
          if (shift.id === blockShift.id) return false;
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
          
          console.log(`🔗 隣接シフト結合: ${blockShift.id} (${newStartTime}-${newEndTime}) + ${adjacentShift.id} (${shiftStart}-${shiftEnd}) = ${finalStartTime}-${finalEndTime}`);
          
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
        
        console.warn('✅ BAR RESIZE - SHIFT TIME UPDATED!');
      } else {
        console.error('❌ Target shift not found for bar resize');
      }
    }
    
    setBarResizeState(null);
    
    // リサイズ完了後のスクロール防止フラグを設定
    setRecentlyResized(true);
    setTimeout(() => {
      setRecentlyResized(false);
    }, 1000); // 1秒後にリセット
  };

  const handleShiftSave = () => {
    if (!editingShift) return;

    console.log('💾 handleShiftSave called with:', {
      employeeId: editingShift.employeeId,
      date: editingShift.date,
      status: editingShift.status,
      startTime: editingShift.startTime,
      endTime: editingShift.endTime,
      timeSlot: editingShift.timeSlot
    });

    const startTime = editingShift.startTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.start;
    const endTime = editingShift.endTime || TIME_SLOTS.find(ts => ts.id === editingShift.timeSlot)?.end;

    console.log('⏰ Calculated times:', { startTime, endTime });

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

    // 関数を先に定義
    const updateExistingShift = () => {
      if (!selectedShift) return;
      
      console.log('🔄 Updating existing shift:', selectedShift.id);
      console.log('   From:', selectedShift.startTime, '-', selectedShift.endTime, '[', selectedShift.status, ']');
      console.log('   To  :', startTime, '-', endTime, '[', editingShift.status, ']');
      
      // 既存のシフトを新しい情報で更新
      const updatedShift: EmployeeShift = {
        ...selectedShift,
        status: editingShift.status,
        startTime: startTime,
        endTime: endTime,
        customerName: editingShift.customerName,
        notes: editingShift.notes,
        timeSlot: TIME_SLOTS[startIndex].id, // 開始時間のスロットを使用
      };
      
      // シフトを更新
      onUpdateShift(editingShift.employeeId, updatedShift);
      
      console.log('✅ Shift updated successfully');
      
      // モーダルを閉じる
      setShowShiftModal(false);
      setEditingShift(null);
      setSelectedShift(null);
    };

    const createNewShifts = () => {
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
        console.log(`📝 Creating shift ${i - startIndex + 1}/${endIndex - startIndex + 1}:`, newShift);
        handleShiftAdd(newShift);
      }
      
      // 同じステータスのシフトを結合
      mergeAdjacentShifts(editingShift.employeeId, editingShift.date);

      setShowShiftModal(false);
      setEditingShift(null);
      setSelectedShift(null);
    };

    // 条件分岐で関数を呼び出し
    if (selectedShift) {
      // 既存のシフトを更新
      console.log('🔄 Updating existing shift:', selectedShift.id);
      
      // 重複チェック（更新対象のシフトは除外）
      if (checkShiftOverlap(editingShift.employeeId, editingShift.date, startTime, endTime, selectedShift.id, editingShift.status)) {
        alert('選択した時間帯に既にシフトが登録されています。時間を調整してください。');
        return;
      }
      
      // 既存シフトを更新
      updateExistingShift();
    } else {
      // 新規作成の場合
      if (checkShiftOverlap(editingShift.employeeId, editingShift.date, startTime, endTime, undefined, editingShift.status)) {
        alert('選択した時間帯に既にシフトが登録されています。時間を調整してください。');
        return;
      }
      
      // 時間範囲内の各スロットにシフトを作成
      console.log(`📝 Creating shifts for ${startIndex} to ${endIndex} time slots`);
      createNewShifts();
    }
  };

  const handleDeleteShift = () => {
    if (selectedShift?.id) {
      handleShiftDelete(selectedShift.id);
    }
    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedShift(null);
  };

  // 新しいモーダル用のハンドラ
  const handleShiftModalSave = (data: ShiftModalData) => {
    console.log('💾 handleShiftModalSave called with:', data);

    // バリデーション
    if (data.employeeIds.length === 0 || !data.startTime || !data.endTime) {
      alert('必須項目を入力してください');
      return;
    }

    // 日付リストを決定
    let dates: string[] = [];
    
    console.log('📅 Date selection logic:', {
      hasDates: !!(data.dates && data.dates.length > 0),
      datesCount: data.dates?.length || 0,
      hasStartDate: !!data.startDate,
      hasEndDate: !!data.endDate,
      startDate: data.startDate,
      endDate: data.endDate,
      dates: data.dates
    });
    
    if (data.dates && data.dates.length > 0) {
      // 一括登録の場合：複数日付を使用
      dates = data.dates;
      console.log('📅 Using multiple dates (bulk):', dates);
    } else if (data.startDate && data.endDate) {
      // 単日登録の場合：日付範囲を生成
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
      console.log('📅 Using date range (range):', dates);
      
      // 日跨ぎ（日をまたぐシフト）の場合は特別な処理が必要
      if (data.startTime >= data.endTime) {
        console.log('🌙 日跨ぎシフト検出:', { startTime: data.startTime, endTime: data.endTime });
      }
    } else if (data.startDate) {
      // 編集・作成の場合：単一日付
      dates = [data.startDate];
      console.log('📅 Using single date (edit/create):', dates);
    } else {
      alert('日付を選択してください');
      return;
    }

    // 編集モードの場合は即座に更新
    if (shiftModalMode === 'edit' && selectedShift) {
      const employeeId = data.employeeIds[0];
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
        if (!checkShiftOverlap(employeeId, firstDate, data.startTime, '24:00', undefined, data.status)) {
          const startIdx = TIME_SLOTS.findIndex(ts => ts.start === data.startTime);
          if (startIdx !== -1) {
            const startShift = {
              employeeId,
              date: firstDate,
              timeSlot: TIME_SLOTS[startIdx].id,
              status: data.status,
              notes: `${data.notes} (日跨ぎ-起点)` ,
              startTime: data.startTime,
              endTime: '24:00'
            };
            allShifts.push(startShift);
            console.log('📝 Created start shift:', startShift);
            if (!affectedEmployees.includes(employeeId)) affectedEmployees.push(employeeId);
            if (!affectedDates.includes(firstDate)) affectedDates.push(firstDate);
          }
        } else {
          const employee = employees.find(emp => emp.id === employeeId);
          skippedShifts.push({ employeeId: employee?.name || employeeId, date: firstDate });
        }

        // 2) 中日: 00:00 -> 24:00（存在する場合）
        if (dates.length > 2) {
          for (let i = 1; i < dates.length - 1; i++) {
            const midDate = dates[i];
            if (!checkShiftOverlap(employeeId, midDate, '00:00', '24:00', undefined, data.status)) {
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
                  notes: `${data.notes} (日跨ぎ-中日)`,
                  startTime: '00:00',
                  endTime: '24:00'
                };
                allShifts.push(midShift);
                console.log('📝 Created middle shift:', midShift);
                if (!affectedEmployees.includes(employeeId)) affectedEmployees.push(employeeId);
                if (!affectedDates.includes(midDate)) affectedDates.push(midDate);
              }
            } else {
              const employee = employees.find(emp => emp.id === employeeId);
              skippedShifts.push({ employeeId: employee?.name || employeeId, date: midDate });
            }
          }
        }

        // 3) 最終日: 00:00 -> endTime
        if (dates.length > 1) {
          console.log(`🔍 Checking end shift creation for ${lastDate}:`, {
            employeeId,
            lastDate,
            endTime: data.endTime,
            datesLength: dates.length
          });
          
          const overlapCheck = checkShiftOverlap(employeeId, lastDate, '00:00', data.endTime, undefined, data.status);
          console.log(`🔍 Overlap check result for end shift: ${overlapCheck}`);
          
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
              console.log('⚠️ No 00:00 slot found, using first slot as fallback');
            }
            
            console.log(`🔍 Zero index found: ${zeroIdx}`);
            
            if (zeroIdx >= 0 && zeroIdx < TIME_SLOTS.length) {
              const endShift = {
                employeeId,
                date: lastDate,
                timeSlot: TIME_SLOTS[zeroIdx].id,
                status: data.status,
                notes: `${data.notes} (日跨ぎ-終点)`,
                startTime: '00:00',
                endTime: data.endTime
              };
              allShifts.push(endShift);
              console.log('📝 Created end shift:', endShift);
              if (!affectedEmployees.includes(employeeId)) affectedEmployees.push(employeeId);
              if (!affectedDates.includes(lastDate)) affectedDates.push(lastDate);
            } else {
              console.error('❌ Could not find valid TIME_SLOTS entry');
            }
          } else {
            const employee = employees.find(emp => emp.id === employeeId);
            console.log(`⚠️ End shift skipped due to overlap for ${employee?.name || employeeId} on ${lastDate}`);
            skippedShifts.push({ employeeId: employee?.name || employeeId, date: lastDate });
          }
        } else {
          console.log(`⚠️ End shift not created because dates.length = ${dates.length} (need > 1)`);
        }

        // 通常ループはスキップ
        continue;
      }

      // 通常のシフトの場合のみ、日付ごとのループを実行
      if (!isDayCrossing) {
        for (const date of dates) {
          // 重複チェック
          if (checkShiftOverlap(employeeId, date, data.startTime, data.endTime, undefined, data.status)) {
            console.warn(`⚠️ Shift overlap detected for employee ${employeeId} on ${date}`);
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
            console.error('Invalid time range');
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
      console.log(`📝 Creating ${allShifts.length} shifts in batch for ${affectedEmployees.length} employees across ${affectedDates.length} dates`);
      console.log('📊 Affected employees:', affectedEmployees);
      console.log('📊 Affected dates:', affectedDates);
      
      // 従業員ごと、日付ごとにグループ化
      const shiftsByEmployeeAndDate: Record<string, Record<string, Omit<EmployeeShift, 'id'>[]>> = {};
      
      allShifts.forEach(shift => {
        if (!shiftsByEmployeeAndDate[shift.employeeId]) {
          shiftsByEmployeeAndDate[shift.employeeId] = {};
        }
        if (!shiftsByEmployeeAndDate[shift.employeeId][shift.date]) {
          shiftsByEmployeeAndDate[shift.employeeId][shift.date] = [];
        }
        shiftsByEmployeeAndDate[shift.employeeId][shift.date].push(shift);
      });
      
      // 従業員ごと、日付ごとに順次処理（状態更新の競合を避けるため）
      affectedEmployees.forEach(employeeId => {
        affectedDates.forEach(date => {
          const shiftsForEmployeeAndDate = shiftsByEmployeeAndDate[employeeId]?.[date] || [];
          if (shiftsForEmployeeAndDate.length > 0) {
            console.log(`📝 Creating ${shiftsForEmployeeAndDate.length} shifts for ${employeeId} on ${date}: ${shiftsForEmployeeAndDate[0].startTime}-${shiftsForEmployeeAndDate[shiftsForEmployeeAndDate.length - 1].endTime}`);
            
            // 同じ従業員・同じ日付のシフトを一括で追加
            shiftsForEmployeeAndDate.forEach(shift => {
              handleShiftAdd(shift);
            });
          }
        });
      });
      
      // mergeAdjacentShiftsはuseEffectで自動的に実行されるため、ここでは実行しない
      console.log('✅ Shift creation completed - mergeAdjacentShifts will be triggered by useEffect');
    }

    // モーダルを閉じる
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
                  if (isHalfHour) return null;
                  
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
                            console.log(`🔍 Calculating hours for ${employee.name} - ${shiftBlocks.length} blocks`);
                            shiftBlocks.forEach((block, i) => {
                              console.log(`  Block ${i + 1}: ${block.startTime}-${block.endTime}`);
                            });
                            
                            const totalHours = shiftBlocks.reduce((total, block) => {
                              // 時間文字列を分に変換して正確な時間差を計算
                              const startMinutes = parseTimeToMinutes(block.startTime);
                              const endMinutes = parseTimeToMinutes(block.endTime);
                              const blockHours = (endMinutes - startMinutes) / 60;
                              
                              console.log(`⏰ Block hours: ${block.startTime}-${block.endTime} = ${blockHours}h (${startMinutes}-${endMinutes} minutes)`);
                              return total + blockHours;
                            }, 0);
                            
                            console.log(`⏰ Total hours for ${employee.name}:`, totalHours, 'h (from', shiftBlocks.length, 'blocks)');
                            console.log(`🎯 Rendered hours display: ${totalHours.toFixed(1)}h`);
                            
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
                          
                          // バーの実際の時間長を計算してログに追加
                          const startMinutes = parseTimeToMinutes(block.startTime);
                          const endMinutes = parseTimeToMinutes(block.endTime);
                          const actualHours = (endMinutes - startMinutes) / 60;
                          console.log(`📊 Bar ${index+1}: ${block.startTime}-${block.endTime}, width=${width.toFixed(1)}%, left=${left.toFixed(1)}% (indices: ${startIndex}-${endIndex}, actual: ${actualHours}h)`);
                          
                          // 日跨ぎシフトかどうかを判定
                          const isDayCrossing = block.isDayCrossing;
                          
                          const statusColors = {
                            working: isDayCrossing ? 'bg-gradient-to-r from-lime-400 to-purple-400' : 'bg-lime-400',
                            unavailable: isDayCrossing ? 'bg-gradient-to-r from-gray-400 to-red-400' : 'bg-gray-400',
                          };
                          
                          console.log(`🎨 Block ${index+1} status: ${block.status}, isDayCrossing: ${isDayCrossing}, color: ${statusColors[block.status as keyof typeof statusColors] || 'bg-gray-400'}`);
                          
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
                                    onShiftClickForClipboard(shift);
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
                          console.log(`🔍 Rendering shift block:`, {
                            id: block.id,
                            status: block.status,
                            timeRange: `${block.startTime}-${block.endTime}`,
                            style: style,
                            hasResizeHandles: true
                          });
                          
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
                                console.log('🖱️ Shift block clicked:', {
                                  target: e.target,
                                  currentTarget: e.currentTarget,
                                  targetEqualsCurrent: e.target === e.currentTarget,
                                  clipboardMode,
                                  blockId: block.id
                                });
                                
                                // リサイズハンドルがクリックされた場合は何もしない
                                const target = e.target as HTMLElement;
                                if (target.classList.contains('cursor-ew-resize') || target.closest('.cursor-ew-resize')) {
                                  console.log('🚫 Click blocked - resize handle clicked');
                                  return;
                                }
                                
                                const shift = employees
                                  .find(emp => emp.id === employee.id)
                                  ?.shifts.find(s => s.id === block.id);
                                
                                console.log('📋 Found shift:', shift);
                                
                                if (shift) {
                                  // コピーモードの場合はクリップボード処理
                                  if (clipboardMode === 'copy' && onShiftClickForClipboard) {
                                    console.log('📋 Clipboard mode - calling onShiftClickForClipboard');
                                    onShiftClickForClipboard(shift);
                                    return;
                                  }
                                  
                                  // 通常モード：モーダルを開く
                                  console.log('🔧 Normal mode - opening modal');
                                  setShiftModalMode('edit');
                                  setSelectedShift(shift);
                                  setEditingShift({ ...shift });
                                  setShowShiftModal(true);
                                } else {
                                  console.log('❌ No shift found');
                                }
                              }}
                              title={`${block.startTime}-${block.endTime} ${SHIFT_STATUS[block.status as keyof typeof SHIFT_STATUS]?.label || ''}`}
                            >
                              {/* 共通リサイズハンドル */}
                              <ResizeHandles 
                                block={block}
                                employee={employee}
                                index={blockIndex}
                                onResizeStart={handleResizeStart}
                              />

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
                                    if (shift && window.confirm(`${employee.name}のシフト（${block.startTime}-${block.endTime}）を削除しますか？`)) {
                                      onDeleteShift(employee.id, shift.id);
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
    const handleDateClick = (date: string, event?: React.MouseEvent) => {
      // allDatesExpandedがtrueの場合は個別の展開状態を変更しない
      if (!allDatesExpanded) {
        // 他の日をクリックした場合、展開状態をリセット
        if (expandedDate && expandedDate !== date) {
          setExpandedDate(null);
        }
      }
      
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
    const handleMoreEmployeesClick = (date: string, allEmployees: Employee[]) => {
      console.log('handleMoreEmployeesClick called:', date, 'allDatesExpanded:', allDatesExpanded, 'collapsedDates:', Array.from(collapsedDates));
      const weekKey = getWeekKey(date);
      
      if (allDatesExpanded) {
        // 全て展開されている場合は、個別に閉じる
        console.log('Adding date to collapsedDates:', date);
        handleCollapseDate(date);
        // 週の展開状態は変更しない（週全体は連動させない）
      } else {
        // 通常の個別展開/縮小
        if (expandedDate === date) {
          // 既に展開されている場合は閉じる
          setExpandedDate(null);
          // 週の展開状態は変更しない（個別動作のため）
        } else {
          // 展開する
          setExpandedDate(date);
          // 週の行幅を拡大するため、週を展開状態にする
          setExpandedWeeks(prev => {
            const newSet = new Set(prev);
            newSet.add(weekKey);
            return newSet;
          });
        }
      }
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

    // シフトが未保存かどうかをチェック
    const hasUnsavedShifts = (employeeId: string, date: string) => {
      if (!unsavedShiftIds || unsavedShiftIds.size === 0) return false;
      const shifts = getShiftsForDate(employeeId, date);
      return shifts.some(shift => unsavedShiftIds.has(shift.id));
    };

    // シフトの色を決定（未保存=グレー、保存済み=薄い青緑、日跨ぎ=特別色）
    const getShiftColor = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      if (shifts.length === 0) return { bg: 'bg-gray-100', text: 'text-gray-700' };
      
      // 日跨ぎシフトをチェック
      const dayCrossingShifts = shifts.filter(shift => 
        shift.notes && shift.notes.includes('日跨ぎ')
      );
      
      const isUnsaved = hasUnsavedShifts(employeeId, date);
      
      if (dayCrossingShifts.length > 0) {
        // 日跨ぎシフトの場合（より目立つ色にする）
        if (isUnsaved) {
          return { bg: 'bg-gradient-to-r from-orange-200 to-pink-200', text: 'text-orange-900' };
        } else {
          return { bg: 'bg-gradient-to-r from-orange-100 to-pink-100', text: 'text-orange-800' };
        }
      } else {
        // 通常のシフト
        if (isUnsaved) {
          return { bg: 'bg-gray-200', text: 'text-gray-700' }; // 未保存 = 薄いグレー
        } else {
          return { bg: 'bg-teal-50', text: 'text-teal-800' }; // 保存済み = 薄い青緑
        }
      }
    };

    const getShiftTimeRange = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      if (shifts.length === 0) return null;

      const confirmedShifts = shifts.filter(s => s.status === 'working');
      if (confirmedShifts.length === 0) return null;

      console.log(`🔍 getShiftTimeRange called for ${employeeId} on ${date}:`, {
        shiftsCount: shifts.length,
        confirmedShiftsCount: confirmedShifts.length,
        allShifts: shifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
      });

      // 日跨ぎシフトの場合は特別な処理
      const dayCrossingShifts = confirmedShifts.filter(s => 
        s.notes && s.notes.includes('日跨ぎ')
      );

      console.log(`🔍 Day crossing detection for ${employeeId} on ${date}:`, {
        dayCrossingShiftsCount: dayCrossingShifts.length,
        dayCrossingShifts: dayCrossingShifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime })),
        allConfirmedShifts: confirmedShifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime })),
        allShifts: shifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime, status: s.status }))
      });

      if (dayCrossingShifts.length > 0) {
        // 日跨ぎシフトの場合：起点から終点までの時間範囲を計算
        const startShift = dayCrossingShifts.find(s => 
          s.notes && (s.notes.includes('日跨ぎ-1日目') || s.notes.includes('日跨ぎ-起点'))
        );
        
        if (startShift) {
          // 終点シフトを探す（次の日から）
          let endTime = startShift.endTime;
          let dayCount = 1;
          
          // 次の日以降の終点シフトを探す
          let checkDate = new Date(date);
          for (let i = 0; i < 10; i++) { // 安全上の上限
            checkDate.setDate(checkDate.getDate() + 1);
            const nextDateStr = checkDate.toISOString().split('T')[0];
            const nextDayShifts = getShiftsForDate(employeeId, nextDateStr);
            const confirmedNextDayShifts = nextDayShifts.filter(s => s.status === 'working');
            
            console.log(`🔍 Checking next day ${nextDateStr}:`, {
              allShiftsCount: nextDayShifts.length,
              confirmedShiftsCount: confirmedNextDayShifts.length,
              shifts: confirmedNextDayShifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
            });
            
            const endShift = confirmedNextDayShifts.find(s => 
              s.notes && (s.notes.includes('日跨ぎ-2日目') || s.notes.includes('日跨ぎ-終点'))
            );
            
            if (endShift) {
              endTime = endShift.endTime;
              dayCount = i + 2;
              console.log(`🎯 Found end shift on ${nextDateStr}:`, { endTime, dayCount });
              break;
            }
            
            // 中日シフトがある場合はカウントを続ける
            const midShifts = confirmedNextDayShifts.filter(s => 
              s.notes && s.notes.includes('日跨ぎ-中日')
            );
            if (midShifts.length === 0) {
              console.log(`⚠️ No mid shifts found on ${nextDateStr}, breaking`);
              break;
            }
            dayCount++;
            console.log(`📅 Found ${midShifts.length} mid shifts on ${nextDateStr}, continuing...`);
          }
          
          console.log(`🌙 Day crossing time range for ${employeeId} on ${date}:`, {
            startShift: { startTime: startShift.startTime, endTime: startShift.endTime, notes: startShift.notes },
            endTime,
            dayCount,
            result: `1日目 ${startShift.startTime}〜${dayCount}日目 ${endTime}`
          });
          
          return `1日目 ${startShift.startTime}〜${dayCount}日目 ${endTime}`;
        } else {
          // 起点シフトが見つからない場合のフォールバック
          console.log(`⚠️ No start shift found for day crossing employee ${employeeId} on ${date}, using first shift`);
          const firstShift = dayCrossingShifts[0];
          if (firstShift) {
            return `🌙 ${firstShift.startTime}〜${firstShift.endTime}`;
          }
        }
      }

      // 通常のシフトの場合：直接 startTime/endTime を使用してマージ
      const ranges = confirmedShifts
        .map(s => ({
          start: s.startTime || (TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.start || ''),
          end: s.endTime || (TIME_SLOTS.find(ts => ts.id === s.timeSlot)?.end || ''),
        }))
        .filter(r => r.start && r.end)
        .sort((a, b) => a.start.localeCompare(b.start));

      const merged: { start: string; end: string }[] = [];
      ranges.forEach(r => {
        if (merged.length === 0) {
          merged.push({ ...r });
        } else {
          const last = merged[merged.length - 1];
          if (last.end === r.start) {
            last.end = r.end; // 連結
          } else {
            merged.push({ ...r });
          }
        }
      });

      const timeRanges = merged.map(m => `${m.start}〜${m.end}`);
      return timeRanges.join(', ');
    };

    // 日付ごとのイベントを取得
    const getEventsForDate = (date: string): CalendarEvent[] => {
      // 日跨ぎシフトの場合は中日・終点は表示しない（起点のみ表示）
      const shouldShowDate = (employeeId: string, targetDate: string) => {
        const shifts = getShiftsForDate(employeeId, targetDate);
        
        // 中日・終点シフトのみの場合は表示しない
        const middleOrEndShifts = shifts.filter(shift => 
          shift.notes && (
            shift.notes.includes('日跨ぎ-2日目') || 
            shift.notes.includes('日跨ぎ-中日') || 
            shift.notes.includes('日跨ぎ-終点')
          )
        );
        
        // すべてのシフトが中日・終点の場合は表示しない
        if (middleOrEndShifts.length === shifts.length && shifts.length > 0) {
          return false;
        }
        
        // 日跨ぎシフトの起点がある場合、通常シフトは表示しない（重複回避）
        const hasDayCrossingStart = shifts.some(shift => 
          shift.notes && (shift.notes.includes('日跨ぎ-1日目') || shift.notes.includes('日跨ぎ-起点'))
        );
        
        if (hasDayCrossingStart) {
          // 日跨ぎシフトの起点のみ表示（通常シフトは完全に除外）
          // 日跨ぎシフトの起点シフトのみを返す
          return true;
        }
        
        // 通常のシフトの場合は表示
        return shifts.length > 0;
      };

      // 日跨ぎシフトの結合表示用の関数（複数日対応）
      const getCombinedDayCrossingShifts = (employeeId: string, date: string) => {
        const shifts = getShiftsForDate(employeeId, date);
        const dayCrossingShifts = shifts.filter(shift => 
          shift.notes && (shift.notes.includes('日跨ぎ-1日目') || shift.notes.includes('日跨ぎ-起点'))
        );
        
        console.log(`🔍 getCombinedDayCrossingShifts: ${employeeId} on ${date}`, {
          shiftsCount: shifts.length,
          dayCrossingShiftsCount: dayCrossingShifts.length,
          allShifts: shifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
        });
        
        if (dayCrossingShifts.length > 0) {
          // 日跨ぎシフトがある場合：起点から連続して「中日/終点」を収集（通常シフトは除外）
          const collected: EmployeeShift[] = [...dayCrossingShifts]; // 起点シフトのみから開始
          let d = new Date(date);
          for (let i = 0; i < 10; i++) { // 安全上の上限
            d.setDate(d.getDate() + 1);
            const ds = d.toISOString().split('T')[0];
            const nextDay = getShiftsForDate(employeeId, ds);
            const mids = nextDay.filter(s => s.notes && (s.notes.includes('日跨ぎ-中日') || s.notes.includes('日跨ぎ-終点') || s.notes.includes('日跨ぎ-2日目')));
            
            console.log(`🔍 Checking next day ${ds}:`, {
              nextDayShiftsCount: nextDay.length,
              midsCount: mids.length,
              nextDayShifts: nextDay.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
            });
            
            if (mids.length === 0) break;
            collected.push(...mids);
            if (mids.some(s => s.notes && (s.notes.includes('日跨ぎ-終点') || s.notes.includes('日跨ぎ-2日目')))) break;
          }
          
          console.log(`✅ Collected ${collected.length} shifts for day crossing`, {
            dates: Array.from(new Set(collected.map(s => s.date))).sort(),
            collected: collected.map(s => ({ date: s.date, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
          });
          
          return collected.map(s => ({ ...s, __startDate: date } as any));
        }
        
        // 日跨ぎシフトがない場合のみ通常シフトを返す
        // 日跨ぎシフトがある場合は通常シフトを除外
        const hasAnyDayCrossing = shifts.some(s => s.notes && s.notes.includes('日跨ぎ'));
        if (hasAnyDayCrossing) {
          // 日跨ぎシフトがある場合は通常シフトを除外
          const normalShifts = shifts.filter(s => !s.notes || !s.notes.includes('日跨ぎ'));
          console.log(`🚫 Excluding normal shifts for day crossing employee ${employeeId} on ${date}:`, {
            normalShiftsCount: normalShifts.length,
            normalShifts: normalShifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
          });
          return []; // 日跨ぎシフトがある場合は通常シフトは表示しない
        }
        
        return shifts;
      };

      // シフトが入っている従業員のみを表示（月ビュー用）
      const activeEmployees = filteredEmployees.filter(employee => {
        return shouldShowDate(employee.id, date);
      });
      
      // 展開された日付の場合は全ての従業員を表示
      const weekKey = getWeekKey(date);
      const isWeekExpanded = expandedWeeks.has(weekKey);
      console.log('getEventsForDate:', date, 'expandedDate:', expandedDate, 'allDatesExpanded:', allDatesExpanded, 'collapsedDates:', Array.from(collapsedDates), 'activeEmployees.length:', activeEmployees.length, 'weekKey:', weekKey, 'isWeekExpanded:', isWeekExpanded);
      
      // 完全に個別の動作：該当日付のみが展開されている場合のみ全表示
      if ((expandedDate === date || (allDatesExpanded && !collapsedDates.has(date)))) {
        const events = activeEmployees.filter(employee => employee && employee.name).map(employee => {
          // 結合されたシフトを取得
          const allShifts = getCombinedDayCrossingShifts(employee.id, date);
          const hasShifts = allShifts.length > 0;
          const timeRange = getShiftTimeRange(employee.id, date);
          const shiftColor = getShiftColor(employee.id, date);
          
          return {
            id: `${employee.id}-${date}`,
            title: employee.name,
            description: timeRange || '',
            status: hasShifts ? 'working' as const : 'unavailable' as const,
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
            onClick: () => {
              console.log('Expanded event onClick triggered for:', employee.name, 'clipboardMode:', clipboardMode);
              if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
                // コピーモードの場合、各シフトを選択可能にする
                allShifts.forEach(shift => {
                  onShiftClickForClipboard(shift);
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
              startDate: date
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
      console.log('Checking 5+ condition for date:', date, 'activeEmployees.length:', activeEmployees.length, 'expandedDate:', expandedDate, 'allDatesExpanded:', allDatesExpanded, 'collapsedDates.has(date):', collapsedDates.has(date), 'isWeekExpanded:', isWeekExpanded);
      // 完全に個別の動作：該当日付が展開されていない場合のみ+N表示
      if (activeEmployees.length > 5 && expandedDate !== date && (!allDatesExpanded || collapsedDates.has(date))) {
        const displayEmployees = activeEmployees.slice(0, 4);
        const remainingCount = activeEmployees.length - 4;
        
        const events = displayEmployees.filter(employee => employee && employee.name).map(employee => {
          // 結合されたシフトを取得
          const allShifts = getCombinedDayCrossingShifts(employee.id, date);
          const hasShifts = allShifts.length > 0;
          const timeRange = getShiftTimeRange(employee.id, date);
          const shiftColor = getShiftColor(employee.id, date);
          
          return {
            id: `${employee.id}-${date}`,
            title: employee.name,
            description: timeRange || '',
            status: hasShifts ? 'working' as const : 'unavailable' as const,
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
            onClick: () => {
              if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
                // コピーモードの場合、各シフトを選択可能にする
                allShifts.forEach(shift => {
                  onShiftClickForClipboard(shift);
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
              startDate: date
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
        // 結合されたシフトを取得
        const allShifts = getCombinedDayCrossingShifts(employee.id, date);
        const hasShifts = allShifts.length > 0;
        const timeRange = getShiftTimeRange(employee.id, date);
        const shiftColor = getShiftColor(employee.id, date);
        
        return {
          id: `${employee.id}-${date}`,
          title: employee.name,
          description: timeRange || '',
          status: hasShifts ? ('working' as const) : ('unavailable' as const),
            backgroundColor: shiftColor.bg,
            color: shiftColor.text,
          onClick: () => {
            if (clipboardMode === 'copy' && hasShifts && onShiftClickForClipboard) {
              // コピーモードの場合、各シフトを選択可能にする
              allShifts.forEach(shift => {
                onShiftClickForClipboard(shift);
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
            startDate: date
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
    const renderEvent = (event: CalendarEvent, index: number, date?: string) => {
      const { employee, timeRange, shifts, startDate } = event.metadata;
      
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
      const hasMultipleTimeRanges = timeRanges.length > 1;
      
      // 従業員名の省略処理（6文字以上の場合は改行なしで表示）
      const displayName = employee.name;
      
      // 日跨ぎシフトかどうかをチェック
      const isDayCrossing = shifts && shifts.some((shift: EmployeeShift) => 
        shift.notes && shift.notes.includes('日跨ぎ')
      );
      
      // 日跨ぎシフトの起点かどうかをチェック
      const isDayCrossingStart = shifts && shifts.some((shift: EmployeeShift) => 
        shift.notes && (shift.notes.includes('日跨ぎ-起点') || shift.notes.includes('日跨ぎ-1日目'))
      );
      
      // 日跨ぎシフトの中日・終点かどうかをチェック
      const isDayCrossingMiddleOrEnd = shifts && shifts.some((shift: EmployeeShift) => 
        shift.notes && (
          shift.notes.includes('日跨ぎ-中日') || 
          shift.notes.includes('日跨ぎ-終点') || 
          shift.notes.includes('日跨ぎ-2日目')
        )
      );

      // デバッグログ追加
      if (isDayCrossing || isDayCrossingStart || isDayCrossingMiddleOrEnd) {
        console.log(`🔍 Day crossing debug for ${employee.name}:`, {
          isDayCrossing,
          isDayCrossingStart,
          isDayCrossingMiddleOrEnd,
          shifts: shifts?.map(s => ({ notes: s.notes, date: s.date, startTime: s.startTime, endTime: s.endTime })),
          startDate,
          date
        });
      }

      // 日跨ぎシフトの中日・終点は非表示
      if (isDayCrossingMiddleOrEnd && !isDayCrossingStart) {
        return null;
      }

      // 日跨ぎシフトの起点の場合は結合バーとして表示
      if (isDayCrossingStart && shifts && startDate) {
        // getShiftTimeRangeを使用して正確な時間表示を取得
        const dayCrossingTimeRange = getShiftTimeRange(employee.id, startDate);
        
        console.log(`🚀 Rendering day crossing start for ${employee.name}:`, {
          startDate,
          dayCrossingTimeRange,
          shifts: shifts.map(s => ({ date: s.date, startTime: s.startTime, endTime: s.endTime, notes: s.notes }))
        });

        // getShiftTimeRangeから時間表示を取得（「1日目 09:00〜3日目 18:00」形式）
        const timeDisplay = dayCrossingTimeRange || timeRange || '';

        // 日跨ぎシフト：通常シフトと同じサイズ・色で表示、時間表示のみ日跨ぎ形式
        return (
          <div
            key={event.id}
            className={`px-0.5 py-0.5 rounded text-center font-medium cursor-pointer transition-all w-full flex items-center justify-center hover:shadow-md hover:scale-105 hover:z-10 border-2 border-orange-400 ${event.backgroundColor || 'bg-gradient-to-r from-orange-100 to-pink-100'} ${event.color || 'text-orange-800'}`}
            style={{
              fontSize: '9px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              event.onClick?.();
            }}
            title={`${employee.name} ${timeDisplay}（日跨ぎ）`}
          >
            <div className="flex w-full items-center justify-between gap-0.5 overflow-hidden min-w-0">
              <span className="font-medium truncate leading-none" style={{ fontSize: '9px' }}>
                🌙 {employee.name}
              </span>
              <span className="opacity-75 truncate leading-none flex-shrink-0" style={{ fontSize: '7px' }}>
                {timeDisplay}
              </span>
            </div>
          </div>
        );
      }

      return (
        <div
          key={event.id}
          className={`px-0.5 py-0.5 rounded text-center font-medium cursor-pointer transition-all w-full flex items-center justify-center hover:shadow-md hover:scale-105 hover:z-10 ${
            isDayCrossing ? 'border-2 border-orange-400' : ''
          } ${event.backgroundColor || 'bg-gray-100'} ${event.color || 'text-gray-700'}`}
          style={{
            fontSize: '9px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Employee clicked:', employee.name);
            event.onClick?.();
          }}
          title={`${employee.name}${timeRange ? ` (${timeRange})` : ''}`}
        >
          
          {hasMultipleTimeRanges ? (
            // 複数の時間範囲がある場合：名前は中央揃え、時間は横並び
            <div className="flex w-full items-center justify-between gap-0.5 overflow-hidden min-w-0">
              <span className="font-medium truncate leading-none" style={{ fontSize: '9px' }}>
                {displayName}
              </span>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 overflow-hidden">
                {timeRanges.map((range, idx) => (
                  <span key={idx} className="opacity-75 truncate leading-none" style={{ fontSize: '7px' }}>
                    {range}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            // 単一の時間範囲の場合：横並び
            <div className="flex w-full items-center justify-between gap-0.5 overflow-hidden min-w-0">
              <span className="font-medium truncate leading-none" style={{ fontSize: '9px' }}>
                {displayName}
              </span>
              {timeRange && (
                <span className="opacity-75 truncate leading-none flex-shrink-0" style={{ fontSize: '7px' }}>
                  {timeRange}
                </span>
              )}
            </div>
          )}
        </div>
      );
    };


    // 日跨ぎシフトの結合表示用の関数（外部スコープに移動）
    const getCombinedDayCrossingShiftsForCell = (employeeId: string, date: string) => {
      const shifts = getShiftsForDate(employeeId, date);
      const dayCrossingShifts = shifts.filter(shift => 
        shift.notes && (shift.notes.includes('日跨ぎ-1日目') || shift.notes.includes('日跨ぎ-起点'))
      );
      
      console.log(`🔍 getCombinedDayCrossingShiftsForCell: ${employeeId} on ${date}`, {
        shiftsCount: shifts.length,
        dayCrossingShiftsCount: dayCrossingShifts.length,
        allShifts: shifts.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
      });
      
      if (dayCrossingShifts.length > 0) {
        // 起点から連続して「中日/終点」を収集
        const collected: EmployeeShift[] = [...shifts];
        let d = new Date(date);
        for (let i = 0; i < 10; i++) { // 安全上の上限
          d.setDate(d.getDate() + 1);
          const ds = d.toISOString().split('T')[0];
          const nextDay = getShiftsForDate(employeeId, ds);
          const mids = nextDay.filter(s => s.notes && (s.notes.includes('日跨ぎ-中日') || s.notes.includes('日跨ぎ-終点') || s.notes.includes('日跨ぎ-2日目')));
          
          console.log(`🔍 Checking next day ${ds}:`, {
            nextDayShiftsCount: nextDay.length,
            midsCount: mids.length,
            nextDayShifts: nextDay.map(s => ({ id: s.id, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
          });
          
          if (mids.length === 0) break;
          collected.push(...mids);
          if (mids.some(s => s.notes && (s.notes.includes('日跨ぎ-終点') || s.notes.includes('日跨ぎ-2日目')))) break;
        }
        
        console.log(`✅ Collected ${collected.length} shifts for day crossing`, {
          dates: Array.from(new Set(collected.map(s => s.date))).sort(),
          collected: collected.map(s => ({ date: s.date, notes: s.notes, startTime: s.startTime, endTime: s.endTime }))
        });
        
        return collected.map(s => ({ ...s, __startDate: date } as any));
      }
      return [];
    };

    // 表示月のすべての日跨ぎシフト起点を収集する関数
    const getAllDayCrossingStartShifts = () => {
      const startShifts: Array<{
        employee: Employee;
        shift: EmployeeShift;
        startDate: string;
        allShifts: EmployeeShift[];
        dates: string[];
      }> = [];

      // 現在の月の全日付を取得
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        
        filteredEmployees.forEach(employee => {
          const shifts = getShiftsForDate(employee.id, date);
          shifts.forEach(shift => {
            if (shift.notes && (shift.notes.includes('日跨ぎ-起点') || shift.notes.includes('日跨ぎ-1日目'))) {
              const allShifts = getCombinedDayCrossingShiftsForCell(employee.id, date);
              const dates = Array.from(new Set(allShifts.map((s: any) => s.date))).sort();
              
              startShifts.push({
                employee,
                shift,
                startDate: date,
                allShifts,
                dates
              });
            }
          });
        });
      }

      return startShifts;
    };

    // カスタム日付セルレンダリング（日跨ぎシフト結合バー付き）
    const renderDateCell = (day: any, events: any[]) => {
      const isExpanded = expandedDate === day.date;
      const hasEvents = events.length > 0;
      
      // 展開された日付の高さを従業員数に応じて動的に調整（白い部分を完全に削除）
      const expandedHeight = isExpanded ? Math.max(200, events.length * 16 + 15) : 100;

      // ペーストモードで選択されているかチェック
      const isSelectedForPaste = clipboardMode === 'paste' && pendingPasteDates && pendingPasteDates.includes(day.date);
      
      // 日跨ぎシフト情報を取得
      const dayCrossingShifts = getDayCrossingShiftInfo(day.date);
      
      return (
        <div
          key={day.date}
          data-date-cell
          data-date={day.date}
          className={`${isExpanded ? `min-h-[${expandedHeight}px]` : 'min-h-[100px]'} px-0.5 pt-0.5 pb-0 border cursor-pointer hover:bg-gray-50 transition-all duration-300 relative overflow-visible ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${day.isToday ? 'border-blue-500 border-2' : 'border-gray-200'} ${
            expandedDate === day.date 
              ? 'bg-blue-50 border-blue-400 border-2 shadow-md' 
              : ''
            } ${
            isSelectedForPaste
              ? 'bg-green-100 border-green-500 border-2 shadow-sm'
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
          <div className={`text-xs font-medium flex items-center gap-1 ${
            expandedDate === day.date 
              ? 'text-blue-800 font-bold' 
              : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${day.isToday ? 'text-blue-600' : ''} ${
            // 展開されていない場合のみ土曜日・日曜日・祝日の色を適用
            expandedDate !== day.date && (
              day.dayOfWeekNumber === 6 ? 'text-blue-600' :
              (day.dayOfWeekNumber === 0 || day.isHoliday) ? 'text-red-600' : ''
            )
            } ${isSelectedForPaste ? 'text-green-800 font-bold' : ''}`}>
            {day.day}
            {isSelectedForPaste && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>

          {/* 日跨ぎシフト結合バー（起点セルのみ） */}
          {dayCrossingShifts.map((crossingShift, index) => (
            <div
              key={`day-crossing-${crossingShift.employee.id}-${crossingShift.shift.id}`}
              className="absolute bg-gradient-to-r from-orange-400 to-red-400 text-white rounded shadow-lg border-2 border-orange-500 flex items-center justify-center cursor-pointer z-50"
              style={{
                top: `${25 + index * 26}px`,
                left: '2px',
                width: `calc(${crossingShift.dayCount * 100}% + ${(crossingShift.dayCount - 1) * 4}px)`,
                height: '22px',
                fontSize: '8px',
                fontWeight: '600',
                zIndex: 1000 + index
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedShift(crossingShift.shift);
                setEditingShift(crossingShift.shift);
                setShiftModalMode('edit');
                setShowShiftModal(true);
              }}
              title={`🌙 ${crossingShift.employee.name} 日跨ぎシフト: ${crossingShift.startTime}～${crossingShift.endTime} (${crossingShift.dayCount}日間)`}
            >
              <div className="flex items-center justify-between w-full px-2">
                <span className="truncate font-bold text-white">🌙 {crossingShift.employee.name}</span>
                <span className="text-orange-100 text-xs">{crossingShift.startTime}～{crossingShift.endTime}</span>
              </div>
            </div>
          ))}

          {hasEvents && (
            <div className="flex flex-col items-center pt-1">
              {events.map((event, index) => renderEvent(event, index))}
            </div>
          )}
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

      console.log(`📊 getDayCrossingShiftInfo called for date: ${date}`);

      filteredEmployees.forEach(employee => {
        const shifts = getShiftsForDate(employee.id, date);
        shifts.forEach(shift => {
          if (shift.notes && (shift.notes.includes('日跨ぎ-起点') || shift.notes.includes('日跨ぎ-1日目'))) {
            console.log(`🔍 Found day crossing start shift for ${employee.name} on ${date}:`, {
              shiftId: shift.id,
              notes: shift.notes,
              startTime: shift.startTime,
              endTime: shift.endTime
            });
            
            const allShifts = getCombinedDayCrossingShiftsForCell(employee.id, date);
            const dates = Array.from(new Set(allShifts.map((s: any) => s.date))).sort();
            
            console.log(`📅 Day crossing dates for ${employee.name}:`, dates);
            
            // 時刻情報を取得
            const firstShift = allShifts.find((s: any) => s.date === dates[0]);
            const lastShift = allShifts.find((s: any) => s.date === dates[dates.length - 1]);
            const startTime = firstShift?.startTime || shift.startTime;
            const endTime = lastShift?.endTime || shift.endTime;

            console.log(`⏰ Time range for ${employee.name}: ${startTime} - ${endTime} (${dates.length} days)`);

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

      console.log(`📊 Total day crossing shifts found for ${date}:`, dayCrossingShifts.length);
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
          onDateClick={(date, day, event) => handleDateClick(date, event)}
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
                          !allDatesExpanded && !expandedDate
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