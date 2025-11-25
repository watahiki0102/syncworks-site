/**
 * ShiftCalendar関連のユーティリティ関数
 */

import { TIME_SLOTS } from '@/constants/calendar';
import type { EmployeeShift, Employee } from './types';

/**
 * 時間文字列を分に変換する
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 日跨ぎタグを除去する正規表現
 */
export const DAY_CROSSING_TAG_REMOVAL_REGEX = /\s*\(日跨ぎ-(?:\d+日目|中日|起点|終点)\)\s*/g;

/**
 * 日跨ぎタグを除去する
 */
export const stripDayCrossingTag = (notes?: string): string =>
  notes ? notes.replace(DAY_CROSSING_TAG_REMOVAL_REGEX, '').trim() : '';

/**
 * シフトの時間範囲を解決する
 */
export const resolveShiftTimeRange = (shift: EmployeeShift): { startTime: string; endTime: string } => {
  const timeSlot = TIME_SLOTS.find(ts => ts.id === shift.timeSlot);
  const startTime = shift.startTime || timeSlot?.start || '';
  const endTime = shift.endTime || timeSlot?.end || '';
  return { startTime, endTime };
};

/**
 * シフトの時間が有効かどうかをチェック
 */
export const isValidShiftDuration = (shift: EmployeeShift): boolean => {
  const { startTime, endTime } = resolveShiftTimeRange(shift);
  if (!startTime || !endTime) {
    return false;
  }
  return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
};

/**
 * 指定日のシフトを取得する
 */
export const getShiftsForDate = (
  employees: Employee[],
  employeeId: string,
  date: string
): EmployeeShift[] => {
  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) {
    return [];
  }
  return employee.shifts.filter(shift => shift.date === date);
};

/**
 * 関連する日跨ぎシフトを取得する
 */
export const getRelatedDayCrossingShifts = (
  employees: Employee[],
  employeeId: string,
  baseNotes: string
): EmployeeShift[] => {
  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) {
    return [];
  }

  return employee.shifts.filter(shift =>
    shift.notes &&
    shift.notes.includes('日跨ぎ') &&
    stripDayCrossingTag(shift.notes) === baseNotes
  );
};

/**
 * 日付から週キーを取得する
 */
export const getWeekKey = (date: string): string => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const weekNumber = Math.ceil(
    (dateObj.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return `${year}-W${weekNumber}`;
};

/**
 * マージが必要かどうかをチェックする
 */
export const needsMerging = (
  employees: Employee[],
  employeeId: string,
  date: string
): boolean => {
  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) {
    return false;
  }

  const dayShifts = employee.shifts.filter(shift => shift.date === date);
  if (dayShifts.length < 2) {
    return false;
  }

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

/**
 * シフトのビジュアルスタイルを取得する
 */
export const getShiftVisualStyle = (
  status: 'working' | 'unavailable' | 'mixed' | 'none',
  isUnsaved: boolean
): {
  bg: string;
  text: string;
  borderClass: string;
} => {
  const baseStyles = {
    working: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      borderClass: 'border-blue-300',
    },
    unavailable: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      borderClass: 'border-red-300',
    },
    mixed: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      borderClass: 'border-purple-300',
    },
    none: {
      bg: 'bg-gray-50',
      text: 'text-gray-400',
      borderClass: 'border-gray-200',
    },
  };

  const style = baseStyles[status];

  if (isUnsaved) {
    return {
      ...style,
      borderClass: 'border-yellow-400 border-2',
    };
  }

  return style;
};

/**
 * 時間スロットのインデックスを取得する
 */
export const getTimeSlotIndex = (time: string): number => {
  const index = TIME_SLOTS.findIndex(ts => ts.start === time || ts.end === time);
  return index >= 0 ? index : 0;
};

/**
 * 時間スロットIDから時間範囲を取得する
 */
export const getTimeRangeFromSlotId = (slotId: string): { start: string; end: string } | null => {
  const slot = TIME_SLOTS.find(ts => ts.id === slotId);
  if (!slot) {
    return null;
  }
  return { start: slot.start, end: slot.end };
};
