'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminButton from '@/components/admin/AdminButton';
import ShiftCalendar from '@/components/ShiftCalendar';
import EmployeeManagement from '@/components/EmployeeManagement';
import { TIME_SLOTS } from '@/constants/calendar';
import TimeRangeSelector, { TimeRangeType } from '@/components/TimeRangeSelector';
import TimeRangeDisplaySelector from '@/components/TimeRangeDisplaySelector';

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
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}


interface TruckSchedule {
  id: string;
  truckId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  origin: string;
  destination: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  employees: string[];
}

export default function ShiftManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [truckSchedules, setTruckSchedules] = useState<TruckSchedule[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'employees'>('calendar');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  
  // 日ビュー用の時間帯設定関連のstate
  const [timeRangeType, setTimeRangeType] = useState<TimeRangeType>('full');
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  
  // 時間帯表示設定（配車管理画面のような機能）
  const [displayStartTime, setDisplayStartTime] = useState<number>(8);
  const [displayEndTime, setDisplayEndTime] = useState<number>(20);
  
  const handleDisplayTimeRangeChange = (start: number, end: number) => {
    setDisplayStartTime(start);
    setDisplayEndTime(end);
  };
  
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
            // 午前の引越し作業（9:00-12:30）
            {
              id: 'shift-1',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '新宿区→渋谷区（午前の引越し作業）',
            },
            // 午後の引越し作業（14:00-17:30）
            {
              id: 'shift-8',
              employeeId: 'emp-1',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '品川区→大田区（午後の引越し作業）',
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
            // 午前の引越し作業（9:00-12:30）- 田中さんと同行
            {
              id: 'shift-15',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-16',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:30',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-17',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-18',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:30',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-19',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-20',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:30',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            {
              id: 'shift-21',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '12:00',
              status: 'working',
              startTime: '09:00',
              endTime: '12:30',
              notes: '田中さんと同行（午前の引越し作業）',
            },
            // 午後の引越し作業（14:00-17:30）- 田中さんと同行
            {
              id: 'shift-22',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-23',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:30',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-24',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-25',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:30',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-26',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:00',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-27',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:30',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
            },
            {
              id: 'shift-28',
              employeeId: 'emp-2',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '17:00',
              status: 'working',
              startTime: '14:00',
              endTime: '17:30',
              notes: '田中さんと同行（午後の引越し作業）',
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
            // 午前休み（8:00-12:00）- 体調不良
            {
              id: 'shift-29',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:00',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-30',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:30',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-31',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-32',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:30',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-33',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-34',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:30',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-35',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            {
              id: 'shift-36',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:30',
              status: 'unavailable',
              startTime: '08:00',
              endTime: '12:00',
              notes: '体調不良のため午前休み',
            },
            // 午後の引越し作業（13:00-17:30）
            {
              id: 'shift-37',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '13:00',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-38',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '13:30',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-39',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:00',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-40',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:30',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-41',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-42',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:30',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-43',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:00',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-44',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:30',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
            },
            {
              id: 'shift-45',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '17:00',
              status: 'working',
              startTime: '13:00',
              endTime: '17:30',
              notes: '目黒区→世田谷区（午後の引越し作業）',
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
            // 午前の引越し作業（8:30-12:00）
            {
              id: 'shift-46',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:30',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-47',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-48',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:30',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-49',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-50',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:30',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-51',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            {
              id: 'shift-52',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:30',
              status: 'working',
              startTime: '08:30',
              endTime: '12:00',
              notes: '中野区→杉並区（午前の引越し作業）',
            },
            // 午後の引越し作業（14:30-18:00）
            {
              id: 'shift-53',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '14:30',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-54',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:00',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-55',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '15:30',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-56',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:00',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-57',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:30',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-58',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '17:00',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
            },
            {
              id: 'shift-59',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '17:30',
              status: 'working',
              startTime: '14:30',
              endTime: '18:00',
              notes: '江戸川区→江東区（午後の引越し作業）',
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

      // テストデータを初期化
      const testTruckSchedules: TruckSchedule[] = [
        {
          id: 'truck-schedule-1',
          truckId: 'truck-1',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '12:00',
          customerName: '山田 太郎',
          origin: '東京都新宿区西新宿1-1-1',
          destination: '東京都渋谷区渋谷2-2-2',
          notes: '引っ越し作業',
          status: 'confirmed',
          employees: ['emp-1'],
        },
        {
          id: 'truck-schedule-2',
          truckId: 'truck-2',
          date: new Date().toISOString().split('T')[0],
          startTime: '12:00',
          endTime: '15:00',
          customerName: '鈴木 次郎',
          origin: '東京都中野区中野3-3-3',
          destination: '東京都杉並区阿佐ヶ谷4-4-4',
          notes: '引っ越し作業',
          status: 'confirmed',
          employees: ['emp-2'],
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




  const actions = (
    <a href="/admin/dispatch">
      <AdminButton
        variant="primary"
        icon="🚚"
      >
        配車管理
      </AdminButton>
    </a>
  );

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="従業員管理"
          subtitle="従業員の稼働スケジュール管理"
          actions={actions}
          breadcrumbs={[
            { label: '従業員管理' }
          ]}
        />


        {/* メインコンテンツ */}
        <main className="w-full max-w-7xl mx-auto py-2 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="px-4 py-2 sm:px-0">
            {/* タブ切り替え */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-8 sm:gap-0">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'calendar'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 シフト管理
                  </button>
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'employees'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 従業員一覧
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
                timeRangeType={timeRangeType}
                customStartTime={customStartTime}
                customEndTime={customEndTime}
                showTimeRangeSelector={true}
                displayStartTime={displayStartTime}
                displayEndTime={displayEndTime}
                onDisplayTimeRangeChange={handleDisplayTimeRangeChange}
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

          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 