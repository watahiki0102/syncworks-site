'use client';

import { useState } from 'react';
import { TIME_SLOTS, SHIFT_STATUS } from '@/constants/calendar';

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

interface ShiftOverviewProps {
  employees: Employee[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function ShiftOverview({
  employees,
  selectedDate,
  onDateChange,
}: ShiftOverviewProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const activeEmployees = employees.filter(emp => emp.status === 'active');

  const getWeekDays = (date: string) => {
    const startDate = new Date(date);
    const dayOfWeek = startDate.getDay();
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      days.push(currentDate.toISOString().split('T')[0]);
    }
    return days;
  };

  const getShiftsForEmployee = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return [];
    
    return employee.shifts.filter(shift => shift.date === date);
  };

  const getTotalWorkHours = (employeeId: string, date: string) => {
    const shifts = getShiftsForEmployee(employeeId, date);
    return shifts.filter(shift => 
      shift.status === 'confirmed' || shift.status === 'booked'
    ).length;
  };

  const getWeeklyWorkHours = (employeeId: string, weekDays: string[]) => {
    return weekDays.reduce((total, date) => {
      return total + getTotalWorkHours(employeeId, date);
    }, 0);
  };

  const getTimeSlotStatus = (employeeId: string, date: string, timeSlot: string) => {
    const shifts = getShiftsForEmployee(employeeId, date);
    return shifts.find(shift => shift.timeSlot === timeSlot);
  };

  const getEmployeeStats = (employeeId: string, date: string) => {
    const shifts = getShiftsForEmployee(employeeId, date);
    const confirmedShifts = shifts.filter(s => s.status === 'confirmed' || s.status === 'booked');
    const totalHours = confirmedShifts.length;
    const isOverwork = totalHours > 8;

    return {
      totalHours,
      isOverwork,
      shiftCount: shifts.length,
    };
  };

  const getTimeSlotStats = (timeSlot: string, date: string) => {
    const workingEmployees = activeEmployees.filter(employee => {
      const shifts = getShiftsForEmployee(employee.id, date);
      return shifts.some(shift => 
        shift.timeSlot === timeSlot && 
        (shift.status === 'confirmed' || shift.status === 'booked')
      );
    });

    return {
      count: workingEmployees.length,
      employees: workingEmployees.map(emp => emp.name),
    };
  };

  const weekDays = viewMode === 'weekly' ? getWeekDays(selectedDate) : [selectedDate];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">シフト表（全体確認）</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            日別
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'weekly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            週別
          </button>
        </div>
      </div>

      {/* 日付選択 */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">表示日:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => onDateChange(e.target.value)}
          className="px-3 py-1 border rounded text-sm"
        />
      </div>

      {/* シフト表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* ヘッダー行 */}
            <div className="grid grid-cols-[200px_repeat(13,1fr)] gap-px bg-gray-200">
              <div className="p-3 bg-gray-50 font-medium text-gray-900">従業員</div>
              {TIME_SLOTS.map(slot => (
                <div key={slot.id} className="p-2 bg-gray-50 text-center text-xs font-medium text-gray-700">
                  {slot.label}
                </div>
              ))}
            </div>

            {/* 従業員行 */}
            {activeEmployees.map(employee => {
              const stats = getEmployeeStats(employee.id, selectedDate);
              
              return (
                <div
                  key={employee.id}
                  className={`grid grid-cols-[200px_repeat(13,1fr)] gap-px bg-gray-200 hover:bg-gray-100 transition-colors cursor-pointer ${
                    selectedEmployee === employee.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedEmployee(selectedEmployee === employee.id ? null : employee.id)}
                >
                  {/* 従業員情報 */}
                  <div className="p-3 bg-white">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-600">{employee.position}</div>
                    <div className={`text-xs font-medium ${
                      stats.isOverwork ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stats.totalHours}時間{stats.isOverwork && ' ⚠️'}
                    </div>
                  </div>

                  {/* 時間枠 */}
                  {TIME_SLOTS.map(slot => {
                    const shift = getTimeSlotStatus(employee.id, selectedDate, slot.id);
                    
                    return (
                      <div
                        key={slot.id}
                        className={`p-2 text-center text-xs ${
                          shift 
                            ? SHIFT_STATUS[shift.status].color.replace('text-', 'bg-').replace('-800', '-200')
                            : 'bg-white'
                        }`}
                      >
                        {shift && (
                          <div className="flex flex-col items-center">
                            <span className="text-lg">{SHIFT_STATUS[shift.status].icon}</span>
                            {shift.notes && (
                              <div className="text-xs opacity-75 truncate w-full" title={shift.notes}>
                                {shift.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 時間帯別統計 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">時間帯別稼働状況</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIME_SLOTS.map(slot => {
            const stats = getTimeSlotStats(slot.id, selectedDate);
            
            return (
              <div key={slot.id} className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                <div className="text-lg font-bold text-blue-600">{stats.count}名</div>
                {stats.employees.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {stats.employees.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 従業員詳細情報 */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">従業員詳細</h4>
          {(() => {
            const employee = employees.find(emp => emp.id === selectedEmployee);
            if (!employee) return null;

            const shifts = getShiftsForEmployee(selectedEmployee, selectedDate);
            const confirmedShifts = shifts.filter(s => s.status === 'confirmed' || s.status === 'booked');
            const totalHours = confirmedShifts.length;

            return (
              <div className="space-y-3">
                <div>
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-gray-600 ml-2">({employee.position})</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">総勤務時間:</span>
                    <span className="font-medium ml-2">{totalHours}時間</span>
                  </div>
                  <div>
                    <span className="text-gray-600">シフト数:</span>
                    <span className="font-medium ml-2">{shifts.length}件</span>
                  </div>
                </div>

                {shifts.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">シフト詳細:</div>
                    <div className="space-y-1">
                      {shifts.map(shift => {
                        const timeSlot = TIME_SLOTS.find(ts => ts.id === shift.timeSlot);
                        return (
                          <div key={shift.id} className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${SHIFT_STATUS[shift.status].color}`}>
                              {SHIFT_STATUS[shift.status].icon} {timeSlot?.label}
                            </span>
                            {shift.notes && (
                              <span className="text-gray-600">{shift.notes}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 週別表示の場合の週間統計 */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">週間統計</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">従業員</th>
                  {weekDays.map(date => (
                    <th key={date} className="p-2 text-center">
                      {new Date(date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </th>
                  ))}
                  <th className="p-2 text-center font-medium">週合計</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map(employee => {
                  const weeklyHours = getWeeklyWorkHours(employee.id, weekDays);
                  
                  return (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-gray-600">{employee.position}</div>
                      </td>
                      {weekDays.map(date => {
                        const hours = getTotalWorkHours(employee.id, date);
                        const isOverwork = hours > 8;
                        
                        return (
                          <td key={date} className="p-2 text-center">
                            <span className={`font-medium ${isOverwork ? 'text-red-600' : ''}`}>
                              {hours}時間{isOverwork && ' ⚠️'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-bold">
                        {weeklyHours}時間
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 