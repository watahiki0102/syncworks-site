'use client';

import { useState, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { formatDate } from '@/utils/dateTimeUtils';
import { Truck, WorkerRef, WorkerAssignment, ScheduleId } from '@/types/dispatch';
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
    if (truckFilter === 'all') {return dateSchedules;}
    return dateSchedules.filter(truck => truck.truckType === truckFilter);
  }, [dateSchedules, truckFilter]);

  // フィルタリングされた作業者
  const filteredWorkers = useMemo(() => {
    if (workerFilter === 'all') {return mockWorkers;}
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
                  workerAssignments: payload.employeeIds.map(empId => {
                    return {
                      scheduleId: payload.scheduleId,
                      employeeId: empId,
                      start: payload.start,
                      end: payload.end
                    } as WorkerAssignment;
                  })
                }
              : schedule
          )
        };

        onUpdateTruck(updatedTruck);
      }
      
      setShowAssignDrawer(false);
    } catch (error) {
      console.error('作業者割り当てエラー:', error);
    }
  };

  // 作業者の割り当て解除
  const handleUnassignEmployee = useCallback((payload: { scheduleId: string; employeeId: string }) => {
    try {
      const updatedTruck = trucks.find(truck => 
        truck.schedules.some(schedule => schedule.id === payload.scheduleId)
      );
      
      if (updatedTruck) {
        const newTruck = {
          ...updatedTruck,
          schedules: updatedTruck.schedules.map(schedule => 
            schedule.id === payload.scheduleId
              ? {
                  ...schedule,
                  workerAssignments: schedule.workerAssignments?.filter(
                    wa => wa.employeeId !== payload.employeeId
                  ) || []
                }
              : schedule
          )
        };
        
        onUpdateTruck(newTruck);
      }
    } catch (error) {
      console.error('作業者割り当て解除エラー:', error);
    }
  }, [trucks, onUpdateTruck]);

  // 時間スロットの生成
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
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="w-20 border-r border-gray-200 bg-gray-50 p-2 text-center text-xs text-gray-600"
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* トラック行 */}
                {filteredTrucks.map((truck) => (
                  <TruckColumn
                    key={truck.id}
                    truck={truck}
                    timeSlots={timeSlots}
                    selectedDate={selectedDate}
                    workers={mockWorkers}
                    onSlotSelect={handleSlotSelect}
                    onUnassignEmployee={handleUnassignEmployee}
                    draggedWorker={draggedWorker}
                  />
                ))}
              </>
            ) : (
              // 日別ビュー
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">日別スケジュール</h3>
                <div className="space-y-4">
                  {filteredTrucks.map((truck) => (
                    <div key={truck.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {truck.name} ({truck.truckType})
                      </h4>
                      {truck.schedules.length > 0 ? (
                        <div className="space-y-2">
                          {truck.schedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                            >
                              <div>
                                <span className="text-sm font-medium">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                  {schedule.customerName || '未割り当て案件'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleSlotSelect(
                                  schedule.id,
                                  truck.id,
                                  truck.name,
                                  schedule.startTime,
                                  schedule.endTime
                                )}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                作業者割り当て
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">スケジュールがありません</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 作業者割り当てドロワー */}
      {showAssignDrawer && selectedSchedule && (
        <AssignDrawer
          isOpen={showAssignDrawer}
          onClose={() => setShowAssignDrawer(false)}
          schedule={selectedSchedule}
          workers={filteredWorkers}
          onAssign={handleAssignEmployees}
        />
      )}
    </DndProvider>
  );
}
