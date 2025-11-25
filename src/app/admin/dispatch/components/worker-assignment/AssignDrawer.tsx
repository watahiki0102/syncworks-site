'use client';

import { useState, useEffect, useMemo } from 'react';
import { WorkerRef, ScheduleId } from '@/types/dispatch';

interface AssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    scheduleId: ScheduleId;
    truckId: string;
    truckName: string;
    startTime: string;
    endTime: string;
  };
  workers: WorkerRef[];
  onAssign: (_payload: {
    scheduleId: ScheduleId;
    employeeIds: string[];
    start: string;
    end: string;
  }) => void;
}

export default function AssignDrawer({
  isOpen,
  onClose,
  schedule,
  workers,
  onAssign
}: AssignDrawerProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [searchTerm, setSearchTerm] = useState('');
  const [_showConflicts, _setShowConflicts] = useState(false);

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

  // 検索フィルタリングされた作業者
  const filteredWorkers = useMemo(() => {
    if (!searchTerm) {
      return workers;
    }
    return workers.filter(worker =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workers, searchTerm]);

  // アクティブな作業者のみ
  const activeWorkers = useMemo(() => {
    return filteredWorkers.filter(worker => worker.active);
  }, [filteredWorkers]);

  // 時間競合チェック
  const conflicts = useMemo(() => {
    if (selectedEmployees.length === 0) {return [];}
    
    const conflicts: Array<{ employeeId: string; employeeName: string; conflictInfo: string }> = [];
    
    selectedEmployees.forEach(employeeId => {
      const worker = workers.find(w => w.id === employeeId);
      if (!worker) {
        return;
      }
      
      // 実際の実装では、この作業者が他のスケジュールに割り当てられているかをチェック
      // 今回はモックで競合をシミュレート
      if (worker.id === 'emp-1' && startTime === '09:00') {
        conflicts.push({
          employeeId: worker.id,
          employeeName: worker.name,
          conflictInfo: '09:00-11:00 に別の案件が割り当て済み'
        });
      }
    });
    
    return conflicts;
  }, [selectedEmployees, startTime, workers]);

  // バリデーション
  const isValid = useMemo(() => {
    const timeValid = startTime < endTime;
    const employeesSelected = selectedEmployees.length > 0;
    const allActive = selectedEmployees.every(id => 
      workers.find(w => w.id === id)?.active
    );
    
    return timeValid && employeesSelected && allActive;
  }, [startTime, endTime, selectedEmployees, workers]);

  // 作業者選択の切り替え
  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // 割り当て実行
  const handleAssign = () => {
    if (!isValid) {
      return;
    }
    
    onAssign({
      scheduleId: schedule.scheduleId,
      employeeIds: selectedEmployees,
      start: startTime,
      end: endTime
    });
  };

  // ドロワーが開いたときの初期化
  useEffect(() => {
    if (isOpen) {
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      setSelectedEmployees([]);
      setSearchTerm('');
      _setShowConflicts(false);
    }
  }, [isOpen, schedule]);

  // ESCキーでドロワーを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* ドロワー */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform">
        <div className="h-full flex flex-col">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">作業者割り当て</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">閉じる</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* スケジュール情報 */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-blue-900">{schedule.truckName}</div>
                <div className="text-blue-700">{startTime} - {endTime}</div>
              </div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* 時間設定 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">時間設定</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">開始時間</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">終了時間</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {startTime >= endTime && (
                <p className="text-red-600 text-xs mt-2">終了時間は開始時間より後である必要があります</p>
              )}
            </div>

            {/* 作業者選択 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">作業者選択</h4>
              
              {/* 検索 */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="作業者名または役割で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* 作業者リスト */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeWorkers.map((worker) => (
                  <label key={worker.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(worker.id)}
                      onChange={() => toggleEmployee(worker.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      <div className="text-xs text-gray-500">
                        {worker.role === 'driver' ? 'ドライバー' :
                         worker.role === 'staff' ? 'スタッフ' :
                         worker.role === 'leader' ? 'リーダー' : '作業者'}
                      </div>
                    </div>
                  </label>
                ))}
                
                {activeWorkers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    該当する作業者が見つかりません
                  </p>
                )}
              </div>
            </div>

            {/* 競合警告 */}
            {conflicts.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm font-medium text-yellow-800">時間競合の警告</span>
                </div>
                <div className="space-y-1">
                  {conflicts.map((conflict) => (
                    <div key={conflict.employeeId} className="text-xs text-yellow-700">
                      {conflict.employeeName}: {conflict.conflictInfo}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  競合があっても保存は可能ですが、作業者の負荷を確認してください。
                </p>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleAssign}
                disabled={!isValid}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isValid
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                割り当て
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
