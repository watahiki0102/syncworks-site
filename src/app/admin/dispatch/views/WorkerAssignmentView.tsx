'use client';

import { useState, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import { formatDate } from '@/utils/dateTimeUtils';
import { Truck, Schedule, WorkerRef, WorkerAssignment, ScheduleId } from '@/types/dispatch';
import TruckColumn from '../components/worker-assignment/TruckColumn';
import AssignDrawer from '../components/worker-assignment/AssignDrawer';
import WorkerPool from '../components/worker-assignment/WorkerPool';
import DayViewToggle from '../components/worker-assignment/DayViewToggle';

interface WorkerAssignmentViewProps {
  trucks: Truck[];
  selectedDate: string;
  onUpdateTruck: (truck: Truck) => void;
}

// モック作業者データ（実際のAPIから取得する想定）
const mockWorkers: WorkerRef[] = [
  { id: 'emp-1', name: '田中 一郎', role: 'driver', active: true },
  { id: 'emp-2', name: '佐藤 花子', role: 'staff', active: true },
  { id: 'emp-3', name: '山田 次郎', role: 'leader', active: true },
  { id: 'emp-4', name: '鈴木 三郎', role: 'driver', active: true },
  { id: 'emp-5', name: '高橋 四郎', role: 'staff', active: true },
  { id: 'emp-6', name: '渡辺 五郎', role: 'driver', active: false }, // 休職中
];

export default function WorkerAssignmentView({ 
  trucks, 
  selectedDate, 
  onUpdateTruck 
}: WorkerAssignmentViewProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<{
    scheduleId: ScheduleId;
    truckId: string;
    truckName: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [truckFilter, setTruckFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'schedule' | 'day'>('schedule');
  const [draggedWorker, setDraggedWorker] = useState<WorkerRef | null>(null);

  // 選択された日付のスケジュールを取得
  const dateSchedules = useMemo(() => {
    return trucks.map(truck => ({
      ...truck,
      schedules: truck.schedules.filter(s => s.date === selectedDate)
    }));
  }, [trucks, selectedDate]);

  // フィルタリングされたトラック
  const filteredTrucks = useMemo(() => {
    if (truckFilter === 'all') return dateSchedules;
    return dateSchedules.filter(truck => truck.truckType === truckFilter);
  }, [dateSchedules, truckFilter]);

  // フィルタリングされた作業者
  const filteredWorkers = useMemo(() => {
    if (workerFilter === 'all') return mockWorkers;
    return mockWorkers.filter(worker => worker.role === workerFilter);
  }, [workerFilter]);

  // スロット選択時の処理
  const handleSlotSelect = (scheduleId: ScheduleId, truckId: string, truckName: string, startTime: string, endTime: string) => {
    setSelectedSchedule({
      scheduleId,
      truckId,
      truckName,
      startTime,
      endTime
    });
    setShowAssignDrawer(true);
  };

  // 作業者割り当て処理
  const handleAssignEmployees = async (payload: {
    scheduleId: ScheduleId;
    employeeIds: string[];
    start: string;
    end: string;
  }) => {
    try {
      // 実際のAPI呼び出し（今回はモック）
      console.log('作業者割り当て:', payload);
      
      // トラックのスケジュールを更新
      const truck = trucks.find(t => 
        t.schedules.some(s => s.id === payload.scheduleId)
      );
      
      if (truck) {
        const updatedTruck = {
          ...truck,
          schedules: truck.schedules.map(schedule => 
            schedule.id === payload.scheduleId
              ? {
                  ...schedule,
                  workerAssignments: [
                    ...(schedule.workerAssignments || []),
                    ...payload.employeeIds.map(empId => ({
                      scheduleId: payload.scheduleId,
                      employeeId: empId,
                      start: payload.start,
                      end: payload.end
                    }))
                  ]
                }
              : schedule
          )
        };
        
        onUpdateTruck(updatedTruck);
      }
      
      setShowAssignDrawer(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('作業者割り当てエラー:', error);
      alert('作業者の割り当てに失敗しました');
    }
  };

  // 作業者割り当て解除処理
  const handleUnassignEmployee = async (payload: {
    scheduleId: ScheduleId;
    employeeId: string;
  }) => {
    try {
      console.log('作業者割り当て解除:', payload);
      
      const truck = trucks.find(t => 
        t.schedules.some(s => s.id === payload.scheduleId)
      );
      
      if (truck) {
        const updatedTruck = {
          ...truck,
          schedules: truck.schedules.map(schedule => 
            schedule.id === payload.scheduleId
              ? {
                  ...schedule,
                  workerAssignments: (schedule.workerAssignments || []).filter(
                    wa => wa.employeeId !== payload.employeeId
                  )
                }
              : schedule
          )
        };
        
        onUpdateTruck(updatedTruck);
      }
    } catch (error) {
      console.error('作業者割り当て解除エラー:', error);
      alert('作業者の割り当て解除に失敗しました');
    }
  };

  // ドラッグアンドドロップによる作業者割り当て
  const handleDragDrop = useCallback(async (workerId: string, scheduleId: ScheduleId, startTime: string, endTime: string) => {
    const worker = mockWorkers.find(w => w.id === workerId);
    if (!worker || !worker.active) {
      alert('この作業者は現在利用できません');
      return;
    }

    // 時間の重複チェック
    const hasConflict = trucks.some(truck => 
      truck.schedules.some(schedule => 
        schedule.date === selectedDate &&
        schedule.workerAssignments &&
        schedule.workerAssignments.some(wa => 
          wa.employeeId === workerId &&
          (
            (wa.start < endTime && wa.end > startTime) ||
            (startTime < wa.end && endTime > wa.start)
          )
        )
      )
    );

    if (hasConflict) {
      alert('この作業者は指定時間帯に別の作業が割り当てられています');
      return;
    }

    await handleAssignEmployees({
      scheduleId,
      employeeIds: [workerId],
      start: startTime,
      end: endTime
    });
  }, [trucks, selectedDate, handleAssignEmployees]);

  // 時間スロットの生成（30分間隔）
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white shadow rounded-lg">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">作業者割り当て</h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(selectedDate)} の作業者割り当て管理
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <DayViewToggle 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
          
          {/* フィルター */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">トラック種別:</label>
              <select
                value={truckFilter}
                onChange={(e) => setTruckFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">すべて</option>
                <option value="軽トラ">軽トラ</option>
                <option value="2tショート">2tショート</option>
                <option value="2tロング">2tロング</option>
                <option value="3t">3t</option>
                <option value="4t">4t</option>
                <option value="4t複数">4t複数</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">作業者役割:</label>
              <select
                value={workerFilter}
                onChange={(e) => setWorkerFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">すべて</option>
                <option value="driver">ドライバー</option>
                <option value="staff">スタッフ</option>
                <option value="leader">リーダー</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 凡例 */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>ドライバー</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>スタッフ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>リーダー</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>休職中</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex">
        {/* 作業者プール (ドラッグソース) */}
        <WorkerPool 
          workers={filteredWorkers}
          selectedDate={selectedDate}
          trucks={trucks}
          onDragStart={setDraggedWorker}
          onDragEnd={() => setDraggedWorker(null)}
        />
        
        {/* スケジュールビュー */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-max">
            {viewMode === 'schedule' ? (
              <>
                {/* 時間ヘッダー */}
                <div className="flex border-b border-gray-200">
                  <div className="w-48 border-r border-gray-200 bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">トラック</span>
                  </div>
                  {timeSlots.map((time, index) => (
                    <div
                      key={index}
                      className="w-20 border-r border-gray-200 bg-gray-50 p-2 text-center"
                    >
                      <span className="text-xs font-medium text-gray-600">{time}</span>
                    </div>
                  ))}
                </div>

                {/* トラック列 */}
                {filteredTrucks.map((truck) => (
                  <TruckColumn
                    key={truck.id}
                    truck={truck}
                    timeSlots={timeSlots}
                    selectedDate={selectedDate}
                    workers={filteredWorkers}
                    onSlotSelect={handleSlotSelect}
                    onUnassignEmployee={handleUnassignEmployee}
                    onDragDrop={handleDragDrop}
                    draggedWorker={draggedWorker}
                  />
                ))}
              </>
            ) : (
              /* 日ビュー - 統合されたタイムライン表示 */
              <DayTimelineView 
                trucks={filteredTrucks}
                selectedDate={selectedDate}
                workers={filteredWorkers}
                onDragDrop={handleDragDrop}
                onSlotSelect={handleSlotSelect}
                onUnassignEmployee={handleUnassignEmployee}
              />
            )}
          </div>
        </div>
      </div>

      {/* 割り当てドロワー */}
      {showAssignDrawer && selectedSchedule && (
        <AssignDrawer
          isOpen={showAssignDrawer}
          onClose={() => {
            setShowAssignDrawer(false);
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule}
          workers={filteredWorkers}
          onAssign={handleAssignEmployees}
        />
      )}
      </div>
    </DndProvider>
  );
}

// 日ビューコンポーネント - タイムライン統合表示
interface DayTimelineViewProps {
  trucks: Truck[];
  selectedDate: string;
  workers: WorkerRef[];
  onDragDrop: (workerId: string, scheduleId: ScheduleId, startTime: string, endTime: string) => void;
  onSlotSelect: (scheduleId: ScheduleId, truckId: string, truckName: string, startTime: string, endTime: string) => void;
  onUnassignEmployee: (payload: { scheduleId: ScheduleId; employeeId: string }) => void;
}

const DayTimelineView = ({ 
  trucks, 
  selectedDate, 
  workers, 
  onDragDrop, 
  onSlotSelect, 
  onUnassignEmployee 
}: DayTimelineViewProps) => {
  // 全スケジュールを時系列でソート
  const allSchedules = useMemo(() => {
    return trucks.flatMap(truck => 
      truck.schedules.map(schedule => ({
        ...schedule,
        truckId: truck.id,
        truckName: truck.name,
        truckPlateNumber: truck.plateNumber
      }))
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [trucks]);

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">日ビュー - タイムライン統合表示</h3>
        <p className="text-sm text-blue-700">
          全トラックのスケジュールを時系列で表示。作業者をドラッグして割り当てできます。
        </p>
      </div>
      
      {allSchedules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>選択された日付にスケジュールがありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allSchedules.map((schedule) => (
            <TimelineScheduleCard
              key={`${schedule.truckId}-${schedule.id}`}
              schedule={schedule}
              workers={workers}
              onDragDrop={onDragDrop}
              onSlotSelect={onSlotSelect}
              onUnassignEmployee={onUnassignEmployee}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// タイムラインスケジュールカード
interface TimelineScheduleCardProps {
  schedule: Schedule & { truckId: string; truckName: string; truckPlateNumber: string };
  workers: WorkerRef[];
  onDragDrop: (workerId: string, scheduleId: ScheduleId, startTime: string, endTime: string) => void;
  onSlotSelect: (scheduleId: ScheduleId, truckId: string, truckName: string, startTime: string, endTime: string) => void;
  onUnassignEmployee: (payload: { scheduleId: ScheduleId; employeeId: string }) => void;
}

const TimelineScheduleCard = ({ 
  schedule, 
  workers, 
  onDragDrop, 
  onSlotSelect, 
  onUnassignEmployee 
}: TimelineScheduleCardProps) => {
  const assignedWorkers = schedule.workerAssignments || [];
  
  const getWorkerDetails = (employeeId: string) => {
    return workers.find(w => w.id === employeeId);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'driver':
        return { color: 'bg-blue-100 text-blue-800', icon: '🚗' };
      case 'staff':
        return { color: 'bg-green-100 text-green-800', icon: '👷' };
      case 'leader':
        return { color: 'bg-purple-100 text-purple-800', icon: '👑' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '👤' };
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'worker',
    drop: (item: { workerId: string }) => {
      onDragDrop(item.workerId, schedule.id, schedule.startTime, schedule.endTime);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div 
      ref={drop}
      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isOver ? 'border-blue-500 bg-blue-50' : 'bg-white'
      }`}
      onClick={() => onSlotSelect(schedule.id, schedule.truckId, schedule.truckName, schedule.startTime, schedule.endTime)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-blue-600">
            {schedule.startTime} - {schedule.endTime}
          </div>
          <div className="text-sm text-gray-600">
            🚛 {schedule.truckName} ({schedule.truckPlateNumber})
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {schedule.workType === 'loading' ? '📦 積込' :
           schedule.workType === 'unloading' ? '📥 積卸' :
           schedule.workType === 'moving' ? '🚚 移動' : '🔧 整備'}
        </div>
      </div>
      
      {schedule.customerName && (
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">顧客: </span>
          <span className="text-sm text-gray-900">{schedule.customerName}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700 mb-2 block">
            割り当て作業者 ({assignedWorkers.length}人)
          </span>
          <div className="flex flex-wrap gap-2">
            {assignedWorkers.map((assignment) => {
              const worker = getWorkerDetails(assignment.employeeId);
              if (!worker) return null;
              
              const roleConfig = getRoleConfig(worker.role);
              
              return (
                <div
                  key={assignment.employeeId}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${roleConfig.color}`}
                >
                  <span>{roleConfig.icon}</span>
                  <span className="font-medium">{worker.name}</span>
                  <span className="text-xs opacity-75">({assignment.start}-{assignment.end})</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnassignEmployee({ scheduleId: schedule.id, employeeId: assignment.employeeId });
                    }}
                    className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            
            {assignedWorkers.length === 0 && (
              <div className="text-sm text-gray-400 italic">
                作業者が割り当てられていません - ここに作業者をドラッグしてください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
