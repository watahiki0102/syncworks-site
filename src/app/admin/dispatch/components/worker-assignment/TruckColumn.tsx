'use client';

import { useMemo } from 'react';
import { Truck, Schedule, WorkerRef, WorkerAssignment, ScheduleId } from '@/types/dispatch';
import ScheduleSlot from './ScheduleSlot';

interface TruckColumnProps {
  truck: Truck;
  timeSlots: string[];
  selectedDate: string;
  workers: WorkerRef[];
  onSlotSelect: (scheduleId: ScheduleId, truckId: string, truckName: string, startTime: string, endTime: string) => void;
  onUnassignEmployee: (payload: { scheduleId: ScheduleId; employeeId: string }) => void;
  onDragDrop?: (workerId: string, scheduleId: ScheduleId, startTime: string, endTime: string) => void;
  draggedWorker?: WorkerRef | null;
}

export default function TruckColumn({
  truck,
  timeSlots,
  selectedDate,
  workers,
  onSlotSelect,
  onUnassignEmployee,
  onDragDrop,
  draggedWorker
}: TruckColumnProps) {
  // トラックのスケジュールを時間スロットにマッピング
  const scheduleMap = useMemo(() => {
    const map = new Map<string, Schedule>();
    truck.schedules.forEach(schedule => {
      map.set(schedule.id, schedule);
    });
    return map;
  }, [truck.schedules]);

  // 各時間スロットのスケジュール情報を取得
  const getSlotSchedule = (timeSlot: string) => {
    // 時間スロットがスケジュールの時間範囲内かチェック
    for (const schedule of truck.schedules) {
      const scheduleStart = schedule.startTime;
      const scheduleEnd = schedule.endTime;
      
      if (timeSlot >= scheduleStart && timeSlot < scheduleEnd) {
        return schedule;
      }
    }
    return null;
  };

  // スロットの高さを計算（30分間隔）
  const getSlotHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(1, Math.floor(diffMinutes / 30)); // 30分 = 1行
  };

  return (
    <div className="flex border-b border-gray-200">
      {/* トラック情報ヘッダー */}
      <div className="w-48 border-r border-gray-200 bg-gray-50 p-3 flex-shrink-0">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 text-sm">{truck.name}</h3>
          <p className="text-xs text-gray-600">{truck.plateNumber}</p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">📦</span>
            <span className="text-xs text-gray-700">{truck.capacityKg.toLocaleString()}kg</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">🚛</span>
            <span className="text-xs text-gray-700">{truck.truckType}</span>
          </div>
        </div>
      </div>

      {/* 時間スロット */}
      {timeSlots.map((timeSlot, index) => {
        const schedule = getSlotSchedule(timeSlot);
        const isFirstSlot = schedule && timeSlot === schedule.startTime;
        
        if (schedule && isFirstSlot) {
          const slotHeight = getSlotHeight(schedule.startTime, schedule.endTime);
          
          return (
            <div
              key={`${truck.id}-${timeSlot}`}
              className="w-20 border-r border-gray-200 relative"
              style={{ gridRow: `span ${slotHeight}` }}
            >
              <ScheduleSlot
                schedule={schedule}
                workers={workers}
                onSelect={() => onSlotSelect(
                  schedule.id,
                  truck.id,
                  truck.name,
                  schedule.startTime,
                  schedule.endTime
                )}
                onUnassignEmployee={onUnassignEmployee}
                onDragDrop={onDragDrop}
                draggedWorker={draggedWorker}
              />
            </div>
          );
        } else if (schedule && !isFirstSlot) {
          // スケジュールの継続中のスロット（表示しない）
          return (
            <div
              key={`${truck.id}-${timeSlot}`}
              className="w-20 border-r border-gray-200"
            />
          );
        } else {
          // 空のスロット
          return (
            <div
              key={`${truck.id}-${timeSlot}`}
              className="w-20 border-r border-gray-200 p-2 min-h-[60px] flex items-center justify-center"
            >
              <div className="w-full h-full border-2 border-dashed border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => onSlotSelect(
                     `${truck.id}-${selectedDate}-${timeSlot}`,
                     truck.id,
                     truck.name,
                     timeSlot,
                     timeSlots[index + 1] || '23:59'
                   )}
              />
            </div>
          );
        }
      })}
    </div>
  );
}
