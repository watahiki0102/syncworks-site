'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/utils/dateTimeUtils';
import { Truck, Schedule, WorkerRef, WorkerAssignment, ScheduleId } from '@/types/dispatch';
import TruckColumn from '../components/worker-assignment/TruckColumn';
import AssignDrawer from '../components/worker-assignment/AssignDrawer';

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
          
          {/* フィルター */}
          <div className="flex items-center gap-4">
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
      <div className="overflow-x-auto">
        <div className="min-w-max">
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
            />
          ))}
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
  );
}
