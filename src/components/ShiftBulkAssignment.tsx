'use client';

import { useState, useEffect } from 'react';
import { TIME_SLOTS, DUPLICATE_STATUS } from '@/constants/calendar';

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  shifts: EmployeeShift[];
}

interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'booked' | 'unavailable' | 'overtime' | 'provisional' | 'available';
  truckScheduleId?: string;
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance' | 'break' | 'other';
  notes?: string;
}

interface ShiftTemplate {
  id: string;
  name: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  weekdays: string[];
  notes?: string;
}

interface ShiftBulkAssignmentProps {
  employees: Employee[];
  templates: ShiftTemplate[];
  selectedDates: string[];
  onAddShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  onUpdateShift: (employeeId: string, shift: EmployeeShift) => void;
}

export default function ShiftBulkAssignment({
  employees,
  templates,
  selectedDates,
  onAddShift,
  onUpdateShift,
}: ShiftBulkAssignmentProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [duplicateCheckResults, setDuplicateCheckResults] = useState<{[key: string]: string}>({});

  const activeEmployees = employees.filter(emp => emp.status === 'active');

  const getTimeSlotsInRange = (start: string, end: string) => {
    return TIME_SLOTS.filter(slot => {
      const slotStart = slot.start;
      const slotEnd = slot.end;
      return slotStart >= start && slotEnd <= end;
    });
  };

  const checkDuplicate = (employeeId: string, date: string, timeSlots: string[]) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 'none';

    const existingShifts = employee.shifts.filter(shift => 
      shift.date === date && 
      timeSlots.includes(shift.timeSlot)
    );

    if (existingShifts.length === 0) return 'none';
    if (existingShifts.length === timeSlots.length) return 'full';
    return 'partial';
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedEmployee(template.employeeId);
        setStartTime(template.startTime);
        setEndTime(template.endTime);
        setNotes(template.notes || '');
      }
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setSelectedTemplate(''); // テンプレート選択をクリア
  };

  const performDuplicateCheck = () => {
    if (!selectedEmployee || selectedDates.length === 0) return;

    const timeSlots = getTimeSlotsInRange(startTime, endTime).map(slot => slot.id);
    const results: {[key: string]: string} = {};

    selectedDates.forEach(date => {
      results[date] = checkDuplicate(selectedEmployee, date, timeSlots);
    });

    setDuplicateCheckResults(results);
  };

  const handleBulkAssign = () => {
    if (!selectedEmployee || selectedDates.length === 0) {
      alert('従業員と日付を選択してください');
      return;
    }

    const timeSlots = getTimeSlotsInRange(startTime, endTime).map(slot => slot.id);
    let successCount = 0;
    let skipCount = 0;

    selectedDates.forEach(date => {
      const duplicateStatus = checkDuplicate(selectedEmployee, date, timeSlots);
      
      if (duplicateStatus === 'full') {
        skipCount++;
        return;
      }

      // 既存のシフトを削除（部分重複の場合）
      if (duplicateStatus === 'partial') {
        const employee = employees.find(emp => emp.id === selectedEmployee);
        if (employee) {
          employee.shifts.forEach(shift => {
            if (shift.date === date && timeSlots.includes(shift.timeSlot)) {
              // 既存シフトを削除（実際の実装では削除関数を呼び出す）
            }
          });
        }
      }

      // 新しいシフトを追加
      timeSlots.forEach(timeSlot => {
        const newShift = {
          employeeId: selectedEmployee,
          date,
          timeSlot,
          status: 'confirmed' as const,
          notes,
        };
        onAddShift(selectedEmployee, newShift);
      });

      successCount++;
    });

    alert(`${successCount}日分のシフトを登録しました${skipCount > 0 ? `（${skipCount}日は重複のためスキップ）` : ''}`);
    
    // フォームをリセット
    setSelectedTemplate('');
    setSelectedEmployee('');
    setStartTime('09:00');
    setEndTime('17:00');
    setNotes('');
    setDuplicateCheckResults({});
  };

  useEffect(() => {
    if (selectedEmployee && selectedDates.length > 0) {
      performDuplicateCheck();
    }
  }, [selectedEmployee, selectedDates, startTime, endTime]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">シフト一括割当</h3>

      <div className="space-y-4">
        {/* テンプレート選択 */}
        <div>
          <label className="block text-sm font-medium mb-1">テンプレート選択（任意）</label>
          <select
            value={selectedTemplate}
            onChange={e => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">テンプレートを選択</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {employees.find(emp => emp.id === template.employeeId)?.name}
              </option>
            ))}
          </select>
        </div>

        {/* 従業員選択 */}
        <div>
          <label className="block text-sm font-medium mb-1">従業員</label>
          <select
            value={selectedEmployee}
            onChange={e => handleEmployeeChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">従業員を選択</option>
            {activeEmployees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name} ({employee.position})
              </option>
            ))}
          </select>
        </div>

        {/* 勤務時間 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">開始時間</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">終了時間</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium mb-1">備考</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={2}
          />
        </div>

        {/* 選択された日付 */}
        {selectedDates.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">
              対象日 ({selectedDates.length}日)
            </label>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {selectedDates.map(date => (
                  <div
                    key={date}
                    className={`p-2 rounded text-center ${
                      duplicateCheckResults[date] === 'full'
                        ? DUPLICATE_STATUS.full.color
                        : duplicateCheckResults[date] === 'partial'
                        ? DUPLICATE_STATUS.partial.color
                        : duplicateCheckResults[date] === 'available'
                        ? DUPLICATE_STATUS.available.color
                        : 'bg-gray-100'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                    {duplicateCheckResults[date] && (
                      <div className="text-xs mt-1">
                        {DUPLICATE_STATUS[duplicateCheckResults[date] as keyof typeof DUPLICATE_STATUS]?.icon}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 重複チェック結果 */}
        {Object.keys(duplicateCheckResults).length > 0 && (
          <div className="p-3 bg-blue-50 rounded border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">重複チェック結果</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {Object.entries(DUPLICATE_STATUS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${value.color}`}></div>
                  <span>{value.icon} {value.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 一括割当ボタン */}
        <div className="pt-4">
          <button
            onClick={handleBulkAssign}
            disabled={!selectedEmployee || selectedDates.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded font-medium"
          >
            一括割当実行 ({selectedDates.length}日分)
          </button>
        </div>
      </div>
    </div>
  );
} 