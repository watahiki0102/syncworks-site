'use client';

import { formatDate } from '@/utils/dateTimeUtils';
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

const WORK_TYPES = {
  loading: { label: '積込', color: 'bg-blue-500', icon: '📦' },
  moving: { label: '移動', color: 'bg-green-500', icon: '🚚' },
  unloading: { label: '積下ろし', color: 'bg-purple-500', icon: '📥' },
  maintenance: { label: '整備', color: 'bg-orange-500', icon: '🔧' },
  break: { label: '休憩', color: 'bg-gray-400', icon: '☕' },
  other: { label: 'その他', color: 'bg-gray-500', icon: '📝' },
} as const;

interface WeekDay {
  date: string;
  dayOfWeek: string;
  dayOfMonth: number;
}

interface WeekViewProps {
  employees: Employee[];
  weekDays: WeekDay[];
  onShiftClick: (employee: Employee, date: string, timeSlot: string) => void;
  onShiftUpdate: (employeeId: string, shift: EmployeeShift) => void;
  selectedEmployee?: Employee;
}

export default function WeekView({
  employees,
  weekDays,
  onShiftClick,
  onShiftUpdate,
  selectedEmployee
}: WeekViewProps) {

  // 従業員の指定日時のシフトを取得
  const getShiftForSlot = (employee: Employee, date: string, timeSlot: string) => {
    return employee.shifts.find(shift => 
      shift.date === date && shift.timeSlot === timeSlot
    );
  };

  // シフトステータスに応じた色を取得
  const getShiftColor = (status: EmployeeShift['status']) => {
    const config = SHIFT_STATUS[status];
    return config ? config.color : 'bg-gray-200';
  };

  // シフトステータスに応じたアイコンを取得
  const getShiftIcon = (status: EmployeeShift['status']) => {
    const config = SHIFT_STATUS[status];
    return config ? config.icon : '？';
  };

  // 作業種別の表示を取得
  const getWorkTypeDisplay = (workType?: EmployeeShift['workType']) => {
    if (!workType) return null;
    return WORK_TYPES[workType];
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <div className="min-w-[1600px]">
          {/* ヘッダー行 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-40 p-3 font-medium text-gray-900 border-r border-gray-200">
              従業員
            </div>
            {weekDays.map((day, index) => (
              <div key={day.date} className="flex-1 min-w-[180px] p-3 border-r border-gray-200 text-center">
                <div className={`text-sm font-medium ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.dayOfWeek}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatDate(day.date)}
                </div>
              </div>
            ))}
          </div>

          {/* 従業員行 */}
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee.id} className="flex">
                <div className={`w-40 p-3 border-r border-gray-200 ${
                  selectedEmployee?.id === employee.id ? 'bg-blue-50' : 'bg-white'
                }`}>
                  <div className="font-medium text-sm text-gray-900">{employee.name}</div>
                  <div className="text-xs text-gray-600">{employee.position}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status === 'active' ? '稼働中' : '非稼働'}
                  </div>
                </div>

                {/* 各日のシフト */}
                {weekDays.map((day) => (
                  <div key={`${employee.id}-${day.date}`} className="flex-1 min-w-[180px] border-r border-gray-200">
                    <div className="grid grid-cols-1 gap-px">
                      {TIME_SLOTS.map((timeSlot) => {
                        const shift = getShiftForSlot(employee, day.date, timeSlot.time);
                        const workType = shift?.workType ? getWorkTypeDisplay(shift.workType) : null;
                        
                        return (
                          <div
                            key={`${employee.id}-${day.date}-${timeSlot.time}`}
                            className={`h-16 p-1 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                              shift ? getShiftColor(shift.status) : 'bg-white'
                            }`}
                            onClick={() => onShiftClick(employee, day.date, timeSlot.time)}
                            title={shift ? `${shift.customerName || '作業'} (${timeSlot.label})` : `${timeSlot.label} - 空き`}
                          >
                            {shift && (
                              <div className="h-full flex flex-col justify-center">
                                <div className="flex items-center justify-center mb-1">
                                  <span className="text-xs mr-1">
                                    {getShiftIcon(shift.status)}
                                  </span>
                                  {workType && (
                                    <span className="text-xs mr-1">
                                      {workType.icon}
                                    </span>
                                  )}
                                </div>
                                
                                {shift.customerName && (
                                  <div className="text-xs font-medium text-gray-800 text-center truncate">
                                    {shift.customerName}
                                  </div>
                                )}
                                
                                {workType && (
                                  <div className="text-xs text-gray-600 text-center">
                                    {workType.label}
                                  </div>
                                )}
                                
                                {shift.notes && (
                                  <div className="text-xs text-gray-500 text-center truncate">
                                    {shift.notes}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {!shift && (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-xs text-gray-400">
                                  {timeSlot.label}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}