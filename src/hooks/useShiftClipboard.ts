import { useState, useEffect } from 'react';
import { Employee, EmployeeShift } from '@/types/employee';
import { useLocalStorage } from './useLocalStorage';
import {
  generateShiftId,
  getShiftTimeRange,
  isTimeOverlap,
  stripDayCrossingTag
} from '@/utils/shiftUtils';
import { TIME_SLOTS } from '@/constants/calendar';

export type ClipboardMode = 'copy' | 'paste' | 'none';

interface UseShiftClipboardResult {
  clipboardMode: ClipboardMode;
  selectedShifts: EmployeeShift[];
  copiedShifts: EmployeeShift[];
  pendingPasteDates: string[];
  startCopyMode: () => void;
  startPasteMode: () => void;
  handleShiftClickForClipboard: (shift: EmployeeShift) => void;
  handleDateClickForClipboard: (date: string) => void;
  executeCopy: () => void;
  executePaste: (employees: Employee[], onUpdate: (employees: Employee[], newShiftIds: string[]) => void) => void;
  cancelClipboard: () => void;
  removeSelectedShift: (shiftId: string) => void;
  clearSelectedShifts: () => void;
  clearCopiedShifts: () => void;
}

/**
 * シフトクリップボード機能を管理するカスタムフック
 */
export function useShiftClipboard(): UseShiftClipboardResult {
  const [clipboardMode, setClipboardMode] = useState<ClipboardMode>('none');
  const [selectedShifts, setSelectedShifts] = useState<EmployeeShift[]>([]);
  const [pendingPasteDates, setPendingPasteDates] = useState<string[]>([]);

  // ローカルストレージにコピー済みシフトを保存
  const [copiedShifts, setCopiedShifts] = useLocalStorage<EmployeeShift[]>('copiedShifts', []);

  const startCopyMode = () => {
    setClipboardMode('copy');
    setSelectedShifts([]);
    setCopiedShifts([]);
  };

  const startPasteMode = () => {
    if (copiedShifts.length === 0) {
      alert('コピーされたシフトがありません');
      return;
    }
    setClipboardMode('paste');
    setSelectedShifts([]);
    setPendingPasteDates([]);
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
      // ペーストモード：貼り付け先を複数選択可能
      setPendingPasteDates(prev => {
        const exists = prev.includes(date);
        if (exists) {
          return prev.filter(d => d !== date);
        } else {
          return [...prev, date];
        }
      });
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
    setSelectedShifts([]);
    // コピー後、自動的に貼り付けモードに移行
    setClipboardMode('paste');
    setPendingPasteDates([]);
  };

  const executePaste = (employees: Employee[], onUpdate: (employees: Employee[], newShiftIds: string[]) => void) => {
    if (pendingPasteDates.length === 0) {
      alert('貼り付け先の日付を選択してください');
      return;
    }

    // コピーされたシフトを日マタギグループごとに分類
    const dayCrossingGroups: Map<string, EmployeeShift[]> = new Map();
    const normalShifts: EmployeeShift[] = [];

    copiedShifts.forEach(shift => {
      if (shift.notes && shift.notes.includes('日跨ぎ')) {
        const baseNotes = stripDayCrossingTag(shift.notes);
        const groupKey = `${shift.employeeId}|||${baseNotes}`;

        if (!dayCrossingGroups.has(groupKey)) {
          dayCrossingGroups.set(groupKey, []);
        }
        dayCrossingGroups.get(groupKey)!.push(shift);
      } else {
        normalShifts.push(shift);
      }
    });

    // 日マタギグループを日付順にソート
    dayCrossingGroups.forEach(group => {
      group.sort((a, b) => a.date.localeCompare(b.date));
    });

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
        shifts: Array<{ startTime: string; endTime: string; shift: EmployeeShift }>
      }
    } = {};

    // 通常シフトの処理
    pendingPasteDates.forEach(date => {
      normalShifts.forEach(shift => {
        const employee = employees.find(emp => emp.id === shift.employeeId);
        if (!employee) return;

        const key = `${shift.employeeId}|||${date}`;
        const { start: newStartTime, end: newEndTime } = getShiftTimeRange(shift);

        if (!pendingShiftsByEmployeeAndDate[key]) {
          pendingShiftsByEmployeeAndDate[key] = {
            employeeId: shift.employeeId,
            date: date,
            shifts: []
          };
        }

        // 貼り付け予定のシフト同士の重複チェック
        const hasPendingConflict = pendingShiftsByEmployeeAndDate[key].shifts.some(pending => {
          return isTimeOverlap(newStartTime, newEndTime, pending.startTime, pending.endTime);
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
          const { start: existingStartTime, end: existingEndTime } = getShiftTimeRange(existingShift);
          return isTimeOverlap(newStartTime, newEndTime, existingStartTime, existingEndTime);
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

    // 日マタギシフトの処理
    pendingPasteDates.forEach(startDate => {
      dayCrossingGroups.forEach((groupShifts, groupKey) => {
        const employee = employees.find(emp => emp.id === groupShifts[0].employeeId);
        if (!employee) return;

        // グループの日数を計算
        const dayCount = groupShifts.length;

        // 貼り付け先の日付範囲を計算
        for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
          const targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + dayOffset);
          const targetDateStr = targetDate.toISOString().split('T')[0];

          const originalShift = groupShifts[dayOffset];
          const key = `${originalShift.employeeId}|||${targetDateStr}`;
          const { start: newStartTime, end: newEndTime } = getShiftTimeRange(originalShift);

          if (!pendingShiftsByEmployeeAndDate[key]) {
            pendingShiftsByEmployeeAndDate[key] = {
              employeeId: originalShift.employeeId,
              date: targetDateStr,
              shifts: []
            };
          }

          // 貼り付け予定のシフト同士の重複チェック
          const hasPendingConflict = pendingShiftsByEmployeeAndDate[key].shifts.some(pending => {
            return isTimeOverlap(newStartTime, newEndTime, pending.startTime, pending.endTime);
          });

          if (hasPendingConflict) {
            conflicts.push({
              employeeName: employee.name,
              date: new Date(targetDateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
              timeRange: `${newStartTime}-${newEndTime}`,
              reason: '貼り付け予定のシフト同士が重複'
            });
          }

          // 既存シフトとの重複チェック
          const existingShifts = employee.shifts.filter(s => s.date === targetDateStr);
          const hasExistingConflict = existingShifts.some(existingShift => {
            const { start: existingStartTime, end: existingEndTime } = getShiftTimeRange(existingShift);
            return isTimeOverlap(newStartTime, newEndTime, existingStartTime, existingEndTime);
          });

          if (hasExistingConflict) {
            conflicts.push({
              employeeName: employee.name,
              date: new Date(targetDateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
              timeRange: `${newStartTime}-${newEndTime}`,
              reason: '既存のシフトと重複'
            });
          }

          // 重複がない場合は貼り付け予定リストに追加
          if (!hasPendingConflict && !hasExistingConflict) {
            pendingShiftsByEmployeeAndDate[key].shifts.push({
              startTime: newStartTime,
              endTime: newEndTime,
              shift: originalShift
            });
          }
        }
      });
    });

    // 重複がある場合はエラーを表示して中断
    if (conflicts.length > 0) {
      const pendingConflicts = conflicts.filter(c => c.reason === '貼り付け予定のシフト同士が重複');
      const existingConflicts = conflicts.filter(c => c.reason === '既存のシフトと重複');

      let message = '以下のシフトが重複しているため、貼り付けできません：\n\n';

      if (pendingConflicts.length > 0) {
        message += '【同じ担当者・同じ時間のシフトを複数貼り付けようとしています】\n';
        pendingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\nコピー元のシフトに重複がないか確認してください。\n';
      }

      if (existingConflicts.length > 0) {
        message += '【既に登録されているシフトと重複しています】\n';
        existingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\n以下の方法で解決してください：\n';
        message += '• 既存のシフトを削除してから再度貼り付ける\n';
        message += '• 貼り付け先またはコピー元のシフトを変更する\n';
      }

      alert(message);
      return;
    }

    // 重複がない場合のみ貼り付けを実行
    const newShiftsByEmployee: { [employeeId: string]: EmployeeShift[] } = {};
    const newShiftIds: string[] = [];

    Object.keys(pendingShiftsByEmployeeAndDate).forEach(key => {
      const group = pendingShiftsByEmployeeAndDate[key];
      group.shifts.forEach(pending => {
        const newShift: EmployeeShift = {
          ...pending.shift,
          id: generateShiftId(),
          date: group.date,
        };

        if (!newShiftsByEmployee[group.employeeId]) {
          newShiftsByEmployee[group.employeeId] = [];
        }
        newShiftsByEmployee[group.employeeId].push(newShift);
        newShiftIds.push(newShift.id);
      });
    });

    // 一度にすべての従業員のシフトを更新
    const updatedEmployees = employees.map(employee => {
      if (newShiftsByEmployee[employee.id]) {
        return {
          ...employee,
          shifts: [...employee.shifts, ...newShiftsByEmployee[employee.id]]
        };
      }
      return employee;
    });

    onUpdate(updatedEmployees, newShiftIds);

    setPendingPasteDates([]);
    setClipboardMode('none');
  };

  const cancelClipboard = () => {
    setClipboardMode('none');
    setSelectedShifts([]);
    setPendingPasteDates([]);
  };

  const removeSelectedShift = (shiftIdToRemove: string) => {
    setSelectedShifts(prev => prev.filter(shift => shift.id !== shiftIdToRemove));
  };

  const clearSelectedShifts = () => {
    setSelectedShifts([]);
  };

  const clearCopiedShifts = () => {
    setCopiedShifts([]);
  };

  return {
    clipboardMode,
    selectedShifts,
    copiedShifts,
    pendingPasteDates,
    startCopyMode,
    startPasteMode,
    handleShiftClickForClipboard,
    handleDateClickForClipboard,
    executeCopy,
    executePaste,
    cancelClipboard,
    removeSelectedShift,
    clearSelectedShifts,
    clearCopiedShifts,
  };
}
