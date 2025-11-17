import { Employee, EmployeeShift } from '@/types/employee';
import { TIME_SLOTS } from '@/constants/calendar';

/**
 * 時刻文字列（HH:MM）を分単位の数値に変換
 * 【バグ修正】文字列比較ではなく数値比較を行うために使用
 * @param time - 時刻文字列（例: "09:00", "17:30"）
 * @returns 0時からの経過分数（例: "09:00" → 540）
 */
export function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

/**
 * 2つの時間帯が重複しているかチェック
 * 【バグ修正】文字列比較から数値比較に変更
 * @param start1 - 時間帯1の開始時刻
 * @param end1 - 時間帯1の終了時刻
 * @param start2 - 時間帯2の開始時刻
 * @param end2 - 時間帯2の終了時刻
 * @returns 重複している場合true
 */
export function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
}

/**
 * 一意のシフトIDを生成
 * 【コード重複削減】タイムスタンプとランダム文字列を組み合わせてユニークなIDを生成
 *
 * 生成されるID形式: "shift-{タイムスタンプ}-{ランダム文字列}"
 * 例: "shift-1704067200000-a1b2c3d4e"
 *
 * @returns 一意のシフトID
 */
export function generateShiftId(): string {
  return `shift-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 総労働時間（分）を「○時間○分」形式に変換
 */
export function formatWorkingTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}時間${minutes > 0 ? minutes + '分' : ''}` : `${minutes}分`;
}

/**
 * 従業員の月間勤務統計を計算する共通関数
 * 【パフォーマンス改善】重複していたロジックを一箇所にまとめました
 * 【修正】startTime/endTimeを優先使用し、日マタギシフトにも正確に対応
 */
export function calculateEmployeeMonthlyStats(employee: Employee, year: number, month: number): { workingDays: number; totalWorkingMinutes: number } {
  const lastDay = new Date(year, month + 1, 0);
  let totalWorkingDays = 0;
  let totalWorkingMinutes = 0;

  // 月の各日をチェック
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day).toISOString().split('T')[0];
    const dayShifts = employee.shifts.filter(shift => shift.date === date);
    const workingShifts = dayShifts.filter(shift => shift.status === 'working');

    if (workingShifts.length > 0) {
      totalWorkingDays++;

      // startTime/endTimeを直接使用（優先）、timeSlotはフォールバック
      // これにより日マタギシフト（startTime: 09:00, endTime: 24:00など）も正確に計算できる
      const timeRanges: Array<{ start: string; end: string }> = workingShifts.map(shift => {
        // startTime/endTimeが存在する場合はそれを使用
        if (shift.startTime && shift.endTime) {
          return { start: shift.startTime, end: shift.endTime };
        }

        // フォールバック：timeSlotから取得
        const timeSlot = TIME_SLOTS.find(ts => ts.id === shift.timeSlot);
        if (timeSlot) {
          return { start: timeSlot.start, end: timeSlot.end };
        }

        // 最後のフォールバック：デフォルト値
        return { start: '09:00', end: '18:00' };
      });

      // 時刻でソート
      const sortedRanges = timeRanges.sort((a, b) => {
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });

      // 連続する時間帯をグループ化（例: 9:00-12:00と12:00-17:00 → 9:00-17:00）
      const timeGroups: Array<{ start: string; end: string }> = [];
      let currentGroup: { start: string; end: string } | null = null;

      sortedRanges.forEach(range => {
        if (!currentGroup) {
          currentGroup = { ...range };
        } else {
          const currentEndMinutes = timeToMinutes(currentGroup.end);
          const rangeStartMinutes = timeToMinutes(range.start);

          // 連続している場合（終了時刻 = 開始時刻、または1分以内の差）
          if (rangeStartMinutes <= currentEndMinutes + 1) {
            // 終了時刻を延長（より後ろの時刻を使用）
            if (timeToMinutes(range.end) > currentEndMinutes) {
              currentGroup.end = range.end;
            }
          } else {
            // 連続していない場合は新しいグループを開始
            timeGroups.push(currentGroup);
            currentGroup = { ...range };
          }
        }
      });

      if (currentGroup) {
        timeGroups.push(currentGroup);
      }

      // 各グループの労働時間を計算（分単位）
      timeGroups.forEach(group => {
        const startMinutes = timeToMinutes(group.start);
        const endMinutes = timeToMinutes(group.end);
        totalWorkingMinutes += (endMinutes - startMinutes);
      });
    }
  }

  return {
    workingDays: totalWorkingDays,
    totalWorkingMinutes
  };
}

/**
 * シフトから開始・終了時刻を取得するヘルパー関数
 */
export function getShiftTimeRange(shift: EmployeeShift): { start: string; end: string } {
  if (shift.startTime && shift.endTime) {
    return { start: shift.startTime, end: shift.endTime };
  }

  const timeSlot = TIME_SLOTS.find(ts => ts.id === shift.timeSlot);
  if (timeSlot) {
    return { start: timeSlot.start, end: timeSlot.end };
  }

  return { start: '09:00', end: '18:00' };
}

/**
 * 日マタギシフトのタグを除去する関数
 */
export function stripDayCrossingTag(notes?: string): string {
  return notes ? notes.replace(/\s*\(日跨ぎ-(?:\d+日目|中日|起点|終点)\)\s*/g, '').trim() : '';
}
