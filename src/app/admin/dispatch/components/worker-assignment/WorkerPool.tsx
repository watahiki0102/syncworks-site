'use client';

import React from 'react';
import { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Truck, WorkerRef } from '@/types/dispatch';

interface WorkerPoolProps {
  workers: WorkerRef[];
  selectedDate: string;
  trucks: Truck[];
  onDragStart: (_worker: WorkerRef) => void;
  onDragEnd: () => void;
}

interface DraggableWorkerProps {
  worker: WorkerRef;
  isAvailable: boolean;
  currentAssignments: string[];
  onDragStart: (_worker: WorkerRef) => void;
  onDragEnd: () => void;
}

const DraggableWorker = ({ worker, isAvailable, currentAssignments, onDragStart, onDragEnd }: DraggableWorkerProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'worker',
    item: { workerId: worker.id, worker },
    canDrag: worker.active,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      onDragStart(worker);
    },
    end: () => {
      onDragEnd();
    }
  }));

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'driver':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🚗', label: 'ドライバー' };
      case 'staff':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '👷', label: 'スタッフ' };
      case 'leader':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👑', label: 'リーダー' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '👤', label: '作業者' };
    }
  };

  const roleConfig = getRoleConfig(worker.role);

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`p-3 border rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        worker.active 
          ? isAvailable 
            ? `${roleConfig.color} hover:shadow-md` 
            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
      }`}
      title={worker.active ? (isAvailable ? 'ドラッグして割り当て' : '他の作業で割り当て中') : '休職中'}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{roleConfig.icon}</span>
        <span className="font-medium text-sm">{worker.name}</span>
      </div>
      <div className="text-xs opacity-75">{roleConfig.label}</div>
      
      {currentAssignments.length > 0 && (
        <div className="mt-2 space-y-1">
          {currentAssignments.slice(0, 2).map((assignment, index) => (
            <div key={index} className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded text-gray-700">
              {assignment}
            </div>
          ))}
          {currentAssignments.length > 2 && (
            <div className="text-xs opacity-75">+{currentAssignments.length - 2}件</div>
          )}
        </div>
      )}
      
      {!worker.active && (
        <div className="mt-1 text-xs">休職中</div>
      )}
    </div>
  );
};

export default function WorkerPool({ workers, selectedDate, trucks, onDragStart, onDragEnd }: WorkerPoolProps) {
  // 各作業者の当日の割り当て状況を計算
  const workerAssignments = useMemo(() => {
    const assignments: Record<string, string[]> = {};
    
    workers.forEach(worker => {
      assignments[worker.id] = [];
      
      trucks.forEach(truck => {
        truck.schedules.forEach(schedule => {
          if (schedule.date === selectedDate && schedule.workerAssignments) {
            schedule.workerAssignments.forEach(wa => {
              if (wa.employeeId === worker.id) {
                assignments[worker.id].push(`${wa.start}-${wa.end} (${truck.name})`);
              }
            });
          }
        });
      });
    });
    
    return assignments;
  }, [workers, selectedDate, trucks]);

  // 作業者を役割でグループ化
  const groupedWorkers = useMemo(() => {
    const groups: Record<string, WorkerRef[]> = {
      driver: [],
      leader: [],
      staff: []
    };
    
    workers.forEach(worker => {
      if (groups[worker.role]) {
        groups[worker.role].push(worker);
      }
    });
    
    return groups;
  }, [workers]);

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">作業者プール</h3>
        <p className="text-sm text-gray-600">
          作業者をドラッグしてスケジュールに割り当てることができます
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedWorkers).map(([role, roleWorkers]) => {
          if (roleWorkers.length === 0) {return null;}
          
          const roleConfig = {
            driver: { label: 'ドライバー', icon: '🚗', color: 'text-blue-600' },
            leader: { label: 'リーダー', icon: '👑', color: 'text-purple-600' },
            staff: { label: 'スタッフ', icon: '👷', color: 'text-green-600' }
          }[role];

          return (
            <div key={role}>
              <h4 className={`text-sm font-medium mb-3 flex items-center gap-1 ${roleConfig?.color}`}>
                <span>{roleConfig?.icon}</span>
                {roleConfig?.label} ({roleWorkers.length}名)
              </h4>
              <div className="space-y-2">
                {roleWorkers.map(worker => {
                  const assignments = workerAssignments[worker.id] || [];
                  const isAvailable = worker.active && assignments.length === 0;
                  
                  return (
                    <DraggableWorker
                      key={worker.id}
                      worker={worker}
                      isAvailable={isAvailable || false}
                      currentAssignments={assignments}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}