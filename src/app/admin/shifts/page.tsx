'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import ShiftCalendar from '@/components/ShiftCalendar';
import EmployeeManagement from '@/components/EmployeeManagement';
import ShiftTemplateManager from '@/components/ShiftTemplateManager';
import ShiftBulkAssignment from '@/components/ShiftBulkAssignment';
import ShiftOverview from '@/components/ShiftOverview';
import { TIME_SLOTS, SHIFT_STATUS, EMPLOYEE_POSITIONS } from '@/constants/calendar';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  hireDate: string;
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

interface TruckSchedule {
  id: string;
  truckId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number;
  origin?: string;
  destination?: string;
  employeeId?: string;
}

export default function ShiftManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [truckSchedules, setTruckSchedules] = useState<TruckSchedule[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [overviewDate, setOverviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'employees' | 'templates' | 'bulk' | 'overview'>('calendar');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージから従業員データを読み込み
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // テストデータを初期化
      const testEmployees: Employee[] = [
        {
          id: 'emp-1',
          name: '田中 一郎',
          email: 'tanaka@syncmoving.com',
          phone: '090-1234-5678',
          position: 'ドライバー',
          status: 'active',
          hireDate: '2023-01-15',
          shifts: [
            {
              id: 'shift-1',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-1',
              customerName: '山田 太郎',
              workType: 'loading',
            },
            {
              id: 'shift-2',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-1',
              customerName: '山田 太郎',
              workType: 'moving',
            },
            {
              id: 'shift-3',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-1',
              customerName: '山田 太郎',
              workType: 'unloading',
            },
            {
              id: 'shift-4',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'confirmed',
              workType: 'maintenance',
              notes: '車両整備',
            },
            {
              id: 'shift-5',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'confirmed',
              workType: 'other',
              notes: '事務作業',
            },
          ],
        },
        {
          id: 'emp-2',
          name: '佐藤 花子',
          email: 'sato@syncmoving.com',
          phone: '080-9876-5432',
          position: '作業員',
          status: 'active',
          hireDate: '2023-03-20',
          shifts: [
            {
              id: 'shift-3',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'available',
            },
            {
              id: 'shift-4',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '12:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-2',
              customerName: '鈴木 次郎',
              workType: 'moving',
            },
            {
              id: 'shift-5',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '13:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-2',
              customerName: '鈴木 次郎',
              workType: 'moving',
            },
            {
              id: 'shift-6',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'booked',
              truckScheduleId: 'truck-schedule-2',
              customerName: '鈴木 次郎',
              workType: 'moving',
            },
          ],
        },
        {
          id: 'emp-3',
          name: '山田 三郎',
          email: 'yamada@syncmoving.com',
          phone: '070-5555-6666',
          position: 'リーダー',
          status: 'active',
          hireDate: '2022-11-10',
          shifts: [
            {
              id: 'shift-7',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:00',
              status: 'overtime',
              notes: '前日からの継続作業',
            },
            {
              id: 'shift-8',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'overtime',
              notes: '前日からの継続作業',
            },
            {
              id: 'shift-9',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'overtime',
              notes: '前日からの継続作業',
            },
            {
              id: 'shift-10',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'unavailable',
              notes: '休暇',
            },
            {
              id: 'shift-11',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'unavailable',
              notes: '休暇',
            },
          ],
        },
        {
          id: 'emp-4',
          name: '鈴木 四郎',
          email: 'suzuki@syncmoving.com',
          phone: '090-1111-2222',
          position: 'ドライバー',
          status: 'active',
          hireDate: '2023-06-05',
          shifts: [
            {
              id: 'shift-12',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'available',
            },
            {
              id: 'shift-13',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'available',
            },
            {
              id: 'shift-14',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'available',
            },
            {
              id: 'shift-15',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'available',
            },
            {
              id: 'shift-16',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'available',
            },
          ],
        },
        {
          id: 'emp-5',
          name: '高橋 五郎',
          email: 'takahashi@syncmoving.com',
          phone: '080-3333-4444',
          position: '作業員',
          status: 'inactive',
          hireDate: '2023-02-28',
          shifts: [],
        },
      ];
      setEmployees(testEmployees);
      localStorage.setItem('employees', JSON.stringify(testEmployees));
    }

    // ローカルストレージからトラックスケジュールデータを読み込み
    const savedTruckSchedules = localStorage.getItem('truckSchedules');
    if (savedTruckSchedules) {
      setTruckSchedules(JSON.parse(savedTruckSchedules));
    } else {

    // ローカルストレージからテンプレートデータを読み込み
    const savedTemplates = localStorage.getItem('shiftTemplates');
    if (savedTemplates) {
      setShiftTemplates(JSON.parse(savedTemplates));
    } else {
      // テストテンプレートデータ
      const testTemplates: ShiftTemplate[] = [
        {
          id: 'template-1',
          name: '朝勤務',
          employeeId: 'emp-1',
          startTime: '08:00',
          endTime: '12:00',
          weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          notes: '平日朝勤務',
        },
        {
          id: 'template-2',
          name: '午後勤務',
          employeeId: 'emp-2',
          startTime: '13:00',
          endTime: '17:00',
          weekdays: ['mon', 'wed', 'fri'],
          notes: '月水金午後勤務',
        },
      ];
      setShiftTemplates(testTemplates);
      localStorage.setItem('shiftTemplates', JSON.stringify(testTemplates));
    }
      // テストデータを初期化
      const testTruckSchedules: TruckSchedule[] = [
        {
          id: 'truck-schedule-1',
          truckId: 'truck-1',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '12:00',
          status: 'booked',
          customerName: '山田 太郎',
          workType: 'loading',
          description: '引っ越し作業',
          capacity: 800,
          origin: '東京都新宿区西新宿1-1-1',
          destination: '東京都渋谷区渋谷2-2-2',
          employeeId: 'emp-1',
        },
        {
          id: 'truck-schedule-2',
          truckId: 'truck-2',
          date: new Date().toISOString().split('T')[0],
          startTime: '12:00',
          endTime: '15:00',
          status: 'booked',
          customerName: '鈴木 次郎',
          workType: 'moving',
          description: '引っ越し作業',
          capacity: 600,
          origin: '東京都中野区中野3-3-3',
          destination: '東京都杉並区阿佐ヶ谷4-4-4',
          employeeId: 'emp-2',
        },
      ];
      setTruckSchedules(testTruckSchedules);
      localStorage.setItem('truckSchedules', JSON.stringify(testTruckSchedules));
    }
  }, []);

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('employees', JSON.stringify(newEmployees));
  };

  const saveTruckSchedules = (newTruckSchedules: TruckSchedule[]) => {
    setTruckSchedules(newTruckSchedules);
    localStorage.setItem('truckSchedules', JSON.stringify(newTruckSchedules));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
    };
    const updatedEmployees = [...employees, newEmployee];
    saveEmployees(updatedEmployees);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(employee => 
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );
    saveEmployees(updatedEmployees);
    setSelectedEmployee(null);
  };

  const deleteEmployee = (employeeId: string) => {
    if (window.confirm('この従業員を削除しますか？')) {
      const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
      saveEmployees(updatedEmployees);
      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(null);
      }
    }
  };

  const updateShift = (employeeId: string, shift: EmployeeShift) => {
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        const updatedShifts = employee.shifts.map(s => 
          s.id === shift.id ? shift : s
        );
        return { ...employee, shifts: updatedShifts };
      }
      return employee;
    });
    saveEmployees(updatedEmployees);
  };

  const addShift = (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => {
    const newShift: EmployeeShift = {
      ...shift,
      id: `shift-${Date.now()}`,
    };
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return { ...employee, shifts: [...employee.shifts, newShift] };
      }
      return employee;
    });
    saveEmployees(updatedEmployees);
  };

  const deleteShift = (employeeId: string, shiftId: string) => {
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return { 
          ...employee, 
          shifts: employee.shifts.filter(s => s.id !== shiftId) 
        };
      }
      return employee;
    });
    saveEmployees(updatedEmployees);
  };

  // テンプレート管理関数
  const addTemplate = (template: Omit<ShiftTemplate, 'id'>) => {
    const newTemplate: ShiftTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random()}`,
    };

    setShiftTemplates(prev => [...prev, newTemplate]);
    localStorage.setItem('shiftTemplates', JSON.stringify([...shiftTemplates, newTemplate]));
  };

  const updateTemplate = (id: string, template: Partial<ShiftTemplate>) => {
    setShiftTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...template } : t
    ));

    const updatedTemplates = shiftTemplates.map(t => 
      t.id === id ? { ...t, ...template } : t
    );
    localStorage.setItem('shiftTemplates', JSON.stringify(updatedTemplates));
  };

  const deleteTemplate = (id: string) => {
    setShiftTemplates(prev => prev.filter(t => t.id !== id));
    
    const updatedTemplates = shiftTemplates.filter(t => t.id !== id);
    localStorage.setItem('shiftTemplates', JSON.stringify(updatedTemplates));
  };

  const applyTemplate = (templateId: string, dates: string[]) => {
    const template = shiftTemplates.find(t => t.id === templateId);
    if (!template) return;

    dates.forEach(date => {
      const timeSlots = TIME_SLOTS.filter(slot => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        return slotStart >= template.startTime && slotEnd <= template.endTime;
      });

      timeSlots.forEach(timeSlot => {
        const newShift = {
          employeeId: template.employeeId,
          date,
          timeSlot: timeSlot.id,
          status: 'confirmed' as const,
          notes: template.notes,
        };
        addShift(template.employeeId, newShift);
      });
    });
  };

  const tabs = [
    { id: 'calendar', label: 'シフト表' },
    { id: 'employees', label: '従業員管理' },
    { id: 'templates', label: 'テンプレート' },
    { id: 'bulk', label: '一括設定' },
    { id: 'overview', label: '全体概要' }
  ];

  const actions = (
    <a
      href="/admin/dispatch"
      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
    >
      🚚 配車管理
    </a>
  );

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="シフト管理"
          subtitle="従業員の稼働スケジュール管理"
          actions={actions}
          breadcrumbs={[
            { label: 'シフト管理' }
          ]}
        />

        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminTabs 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as 'calendar' | 'employees' | 'templates' | 'bulk' | 'overview')}
            />
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* タブ切り替え */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'calendar'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 シフトカレンダー
                  </button>
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'employees'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 従業員管理
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'templates'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 テンプレート
                  </button>
                  <button
                    onClick={() => setActiveTab('bulk')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'bulk'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ⚡ 一括割当
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 全体確認
                  </button>
                </nav>
              </div>
            </div>

            {/* タブコンテンツ */}
            {activeTab === 'calendar' && (
              <ShiftCalendar
                employees={employees}
                truckSchedules={truckSchedules}
                onUpdateShift={updateShift}
                onAddShift={addShift}
                onDeleteShift={deleteShift}
                onUpdateTruckSchedules={saveTruckSchedules}
              />
            )}
            
            {activeTab === 'employees' && (
              <EmployeeManagement
                employees={employees}
                selectedEmployee={selectedEmployee}
                onAddEmployee={addEmployee}
                onUpdateEmployee={updateEmployee}
                onDeleteEmployee={deleteEmployee}
                onSelectEmployee={setSelectedEmployee}
                onShowEmployeeModal={setShowEmployeeModal}
                showEmployeeModal={showEmployeeModal}
              />
            )}

            {activeTab === 'templates' && (
              <ShiftTemplateManager
                employees={employees}
                templates={shiftTemplates}
                onAddTemplate={addTemplate}
                onUpdateTemplate={updateTemplate}
                onDeleteTemplate={deleteTemplate}
                onApplyTemplate={applyTemplate}
              />
            )}

            {activeTab === 'bulk' && (
              <ShiftBulkAssignment
                employees={employees}
                templates={shiftTemplates}
                selectedDates={selectedDates}
                onAddShift={addShift}
                onUpdateShift={updateShift}
              />
            )}

            {activeTab === 'overview' && (
              <ShiftOverview
                employees={employees}
                selectedDate={overviewDate}
                onDateChange={setOverviewDate}
              />
            )}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 