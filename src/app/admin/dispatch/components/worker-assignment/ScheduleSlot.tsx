'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { Schedule, WorkerRef } from '@/types/dispatch';
import EmployeePill from './EmployeePill';

interface ScheduleSlotProps {
  schedule: Schedule;
  workers: WorkerRef[];
  onSelect: () => void;
  onUnassignEmployee: (_payload: { scheduleId: string; employeeId: string }) => void;
  onDragDrop?: (_workerId: string, _scheduleId: string, _startTime: string, _endTime: string) => void;
  draggedWorker?: WorkerRef | null;
}

export default function ScheduleSlot({
  schedule,
  workers,
  onSelect,
  onUnassignEmployee,
  onDragDrop,
  // draggedWorker // Currently unused
}: ScheduleSlotProps) {
  // このスケジュールに割り当てられている作業者を取得
  const assignedWorkers = schedule.workerAssignments || [];
  
  // 作業者の詳細情報を取得
  const getWorkerDetails = (employeeId: string) => {
    return workers.find(w => w.id === employeeId);
  };

  // スロットの高さを計算（30分間隔）
  const getSlotHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(60, Math.floor(diffMinutes / 30) * 30); // 最小60px、30分ごとに30px追加
  };

  const slotHeight = getSlotHeight(schedule.startTime, schedule.endTime);

  // ドロップゾーン設定
  const [{ isOver }, drop] = useDrop<{ workerId: string }, void, { isOver: boolean }>({
    accept: 'worker',
    drop: (item: { workerId: string }) => {
      if (onDragDrop) {
        onDragDrop(item.workerId, schedule.id, schedule.startTime, schedule.endTime);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={`w-full h-full p-2 cursor-pointer transition-colors border-l-4 ${
        isOver 
          ? 'border-green-500 bg-green-100' 
          : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
      }`}
      style={{ minHeight: `${slotHeight}px` }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      title={`${schedule.startTime}-${schedule.endTime} ${schedule.customerName || '空きスロット'}`}
    >
      {/* スケジュール情報 */}
      <div className="text-xs text-gray-700 mb-2">
        <div className="font-medium text-gray-900">{schedule.startTime}-{schedule.endTime}</div>
        {schedule.customerName && (
          <div className="truncate">{schedule.customerName}</div>
        )}
        {schedule.workType && (
          <div className="text-gray-600">
            {schedule.workType === 'loading' ? '積み込み' :
             schedule.workType === 'unloading' ? '荷下ろし' :
             schedule.workType === 'moving' ? '輸送' : '整備'}
          </div>
        )}
      </div>

      {/* 割り当て作業者 */}
      {assignedWorkers.length > 0 && (
        <div className="space-y-1">
          {assignedWorkers.slice(0, 3).map((assignment) => {
            const worker = getWorkerDetails(assignment.employeeId);
            if (!worker) return null;
            
            return (
              <EmployeePill
                key={assignment.employeeId}
                worker={worker}
                assignment={assignment}
                onUnassign={() => onUnassignEmployee({
                  scheduleId: schedule.id,
                  employeeId: assignment.employeeId
                })}
              />
            );
          })}
          
          {/* 4人以上の場合は「+N」を表示 */}
          {assignedWorkers.length > 3 && (
            <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full text-center">
              +{assignedWorkers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* 空きスロットの場合は追加インジケーター */}
      {assignedWorkers.length === 0 && (
        <div className="text-xs text-gray-400 text-center mt-2">
          + 作業者追加
        </div>
      )}
    </div>
  );
}
