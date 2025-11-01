'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminButton from '@/components/admin/AdminButton';
import AdminTabs from '@/components/admin/AdminTabs';
import ShiftCalendar from '@/components/ShiftCalendar';
import EmployeeManagement from '@/components/EmployeeManagement';
import { TIME_SLOTS } from '@/constants/calendar';
import TimeRangeSelector, { TimeRangeType } from '@/components/TimeRangeSelector';
import TimeRangeDisplaySelector from '@/components/TimeRangeDisplaySelector';
import { UnifiedCase } from '@/types/common';
import { generateUnifiedTestData } from '@/app/admin/cases/lib/unifiedData';

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



export default function ShiftManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cases, setCases] = useState<UnifiedCase[]>([]);
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
  
  // クリップボード機能のstate
  const [showClipboard, setShowClipboard] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<EmployeeShift[]>([]);
  const [copiedShifts, setCopiedShifts] = useState<EmployeeShift[]>(() => {
    // ローカルストレージから読み込み
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('copiedShifts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [clipboardMode, setClipboardMode] = useState<'copy' | 'paste' | 'none'>('none');
  const [pendingPasteDates, setPendingPasteDates] = useState<string[]>([]);
  
  // 従業員集計表示のstate
  const [showEmployeeSummary, setShowEmployeeSummary] = useState(false);
  
  // サイドパネル内のアクティブなタブ
  const [activeSidePanelTab, setActiveSidePanelTab] = useState<'employeeSummary' | 'clipboard' | null>(null);
  
  // 未保存のシフトIDを管理
  const [unsavedShiftIds, setUnsavedShiftIds] = useState<Set<string>>(new Set());
  
  // サイドパネルのタブ状態を自動管理
  // copiedShiftsをローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('copiedShifts', JSON.stringify(copiedShifts));
    }
  }, [copiedShifts]);

  useEffect(() => {
    if (showEmployeeSummary && showClipboard) {
      // 両方ONの場合、アクティブなタブがない場合は従業員集計をデフォルトに
      if (!activeSidePanelTab) {
        setActiveSidePanelTab('employeeSummary');
      }
    } else if (showEmployeeSummary && !showClipboard) {
      // 従業員集計のみON
      setActiveSidePanelTab('employeeSummary');
    } else if (!showEmployeeSummary && showClipboard) {
      // クリップボードのみON
      setActiveSidePanelTab('clipboard');
    } else {
      // 両方OFF
      setActiveSidePanelTab(null);
    }
  }, [showEmployeeSummary, showClipboard, activeSidePanelTab]);
  
  const handleDisplayTimeRangeChange = (start: number, end: number) => {
    setDisplayStartTime(start);
    setDisplayEndTime(end);
  };

  // クリップボード機能
  const startCopyMode = () => {
    setClipboardMode('copy');
    setSelectedShifts([]);
    setCopiedShifts([]);
    setShowClipboard(true);
  };

  const startPasteMode = () => {
    if (copiedShifts.length === 0) {
      alert('コピーされたシフトがありません');
      return;
    }
    setClipboardMode('paste');
    setSelectedShifts([]);
    setPendingPasteDates([]);
    setShowClipboard(true);
  };

  const handleShiftClickForClipboard = (shift: EmployeeShift) => {
    if (clipboardMode === 'copy') {
      // コピーモード：シフトを選択
      setSelectedShifts(prev => {
        const exists = prev.some(s => s.id === shift.id);
        if (exists) {
          return prev.filter(s => s.id !== shift.id);
        } else {
          return [...prev, shift];
        }
      });
    }
  };

  const handleDateClickForClipboard = (date: string) => {
    if (clipboardMode === 'paste') {
      // ペーストモード：貼り付け先を複数選択可能
      setPendingPasteDates(prev => {
        const exists = prev.includes(date);
        if (exists) {
          return prev.filter(d => d !== date);
        } else {
          return [...prev, date];
        }
      });
    }
  };

  const executeCopy = () => {
    if (selectedShifts.length === 0) {
      alert('コピーするシフトを選択してください');
      return;
    }

    // 出勤状態のシフトのみコピー
    const workingShifts = selectedShifts.filter(shift => shift.status === 'working');
    
    if (workingShifts.length === 0) {
      alert('選択したシフトにコピー可能なシフト（出勤）がありません');
      return;
    }

    setCopiedShifts(workingShifts);
    setSelectedShifts([]);
    // コピー後、自動的に貼り付けモードに移行
    setClipboardMode('paste');
    setPendingPasteDates([]);
  };

  const executePaste = () => {
    if (pendingPasteDates.length === 0) {
      alert('貼り付け先の日付を選択してください');
      return;
    }

    // 重複チェック
    const conflicts: Array<{
      employeeName: string;
      date: string;
      timeRange: string;
      reason: string;
    }> = [];

    // 貼り付け予定のシフトを従業員・日付ごとに整理
    const pendingShiftsByEmployeeAndDate: {
      [key: string]: {
        employeeId: string;
        date: string;
        shifts: Array<{ startTime: string; endTime: string; shift: EmployeeShift }>
      }
    } = {};

    pendingPasteDates.forEach(date => {
      copiedShifts.forEach(shift => {
        const employee = employees.find(emp => emp.id === shift.employeeId);
        if (!employee) return;

        const key = `${shift.employeeId}|||${date}`;
        const newStartTime = shift.startTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.start || '';
        const newEndTime = shift.endTime || TIME_SLOTS.find(ts => ts.id === shift.timeSlot)?.end || '';

        if (!pendingShiftsByEmployeeAndDate[key]) {
          pendingShiftsByEmployeeAndDate[key] = {
            employeeId: shift.employeeId,
            date: date,
            shifts: []
          };
        }

        // 貼り付け予定のシフト同士の重複チェック
        const hasPendingConflict = pendingShiftsByEmployeeAndDate[key].shifts.some(pending => {
          return (newStartTime < pending.endTime && newEndTime > pending.startTime);
        });

        if (hasPendingConflict) {
          conflicts.push({
            employeeName: employee.name,
            date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
            timeRange: `${newStartTime}-${newEndTime}`,
            reason: '貼り付け予定のシフト同士が重複'
          });
        }

        // 既存シフトとの重複チェック
        const existingShifts = employee.shifts.filter(s => s.date === date);
        const hasExistingConflict = existingShifts.some(existingShift => {
          const existingStartTime = existingShift.startTime || TIME_SLOTS.find(ts => ts.id === existingShift.timeSlot)?.start || '';
          const existingEndTime = existingShift.endTime || TIME_SLOTS.find(ts => ts.id === existingShift.timeSlot)?.end || '';
          
          return (newStartTime < existingEndTime && newEndTime > existingStartTime);
        });

        if (hasExistingConflict) {
          conflicts.push({
            employeeName: employee.name,
            date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
            timeRange: `${newStartTime}-${newEndTime}`,
            reason: '既存のシフトと重複'
          });
        }

        // 重複がない場合は貼り付け予定リストに追加
        if (!hasPendingConflict && !hasExistingConflict) {
          pendingShiftsByEmployeeAndDate[key].shifts.push({
            startTime: newStartTime,
            endTime: newEndTime,
            shift
          });
        }
      });
    });

    // 重複がある場合はエラーを表示して中断
    if (conflicts.length > 0) {
      const pendingConflicts = conflicts.filter(c => c.reason === '貼り付け予定のシフト同士が重複');
      const existingConflicts = conflicts.filter(c => c.reason === '既存のシフトと重複');
      
      let message = '以下のシフトが重複しているため、貼り付けできません：\n\n';
      
      if (pendingConflicts.length > 0) {
        message += '【同じ担当者・同じ時間のシフトを複数貼り付けようとしています】\n';
        pendingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\nコピー元のシフトに重複がないか確認してください。\n';
      }
      
      if (existingConflicts.length > 0) {
        message += '【既に登録されているシフトと重複しています】\n';
        existingConflicts.forEach(c => {
          message += `・${c.employeeName} (${c.date} ${c.timeRange})\n`;
        });
        message += '\n以下の方法で解決してください：\n';
        message += '• 既存のシフトを削除してから再度貼り付ける\n';
        message += '• 貼り付け先またはコピー元のシフトを変更する\n';
      }
      
      alert(message);
      return;
    }

    // 重複がない場合のみ貼り付けを実行
    const newShiftsByEmployee: { [employeeId: string]: EmployeeShift[] } = {};
    const newShiftIds: string[] = [];
    
    Object.keys(pendingShiftsByEmployeeAndDate).forEach(key => {
      const group = pendingShiftsByEmployeeAndDate[key];
      group.shifts.forEach(pending => {
        const newShift: EmployeeShift = {
          ...pending.shift,
          id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: group.date,
        };
        
        if (!newShiftsByEmployee[group.employeeId]) {
          newShiftsByEmployee[group.employeeId] = [];
        }
        newShiftsByEmployee[group.employeeId].push(newShift);
        newShiftIds.push(newShift.id); // 新しいシフトIDを記録
      });
    });
    
    // 一度にすべての従業員のシフトを更新
    const updatedEmployees = employees.map(employee => {
      if (newShiftsByEmployee[employee.id]) {
        return {
          ...employee,
          shifts: [...employee.shifts, ...newShiftsByEmployee[employee.id]]
        };
      }
      return employee;
    });
    
    saveEmployees(updatedEmployees);
    
    // 貼り付けたシフトを未保存として記録
    setUnsavedShiftIds(prev => {
      const newSet = new Set(prev);
      newShiftIds.forEach(id => newSet.add(id));
      return newSet;
    });
    
    setPendingPasteDates([]);
    setClipboardMode('none');
  };

  const cancelClipboard = () => {
    setClipboardMode('none');
    setSelectedShifts([]);
    setPendingPasteDates([]);
    setShowClipboard(false);
  };

  const removeSelectedShift = (shiftIdToRemove: string) => {
    setSelectedShifts(prev => prev.filter(shift => shift.id !== shiftIdToRemove));
  };

  const clearSelectedShifts = () => {
    setSelectedShifts([]);
  };
  
  const router = useRouter();

  useEffect(() => {
    // 統合案件データを取得
    const unifiedData = generateUnifiedTestData();
    setCases(unifiedData);
    
    // ローカルストレージから従業員データを読み込み
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // テストデータを初期化（現実的な引越し作業スケジュール）
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
              timeSlot: '08:00',
              status: 'working',
              startTime: '08:00',
              endTime: '17:00',
              notes: '新宿区→渋谷区（引越し作業・2DK・終日）',
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
              timeSlot: '08:00',
              status: 'working',
              startTime: '08:00',
              endTime: '17:00',
              notes: '田中さんと同行（引越し作業・終日）',
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
              id: 'shift-6',
              employeeId: 'emp-3',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '13:00',
              status: 'working',
              startTime: '13:00',
              endTime: '18:00',
              notes: '目黒区→世田谷区（引越し作業・1LDK）',
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
              id: 'shift-7',
              employeeId: 'emp-4',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'working',
              startTime: '09:00',
              endTime: '18:00',
              notes: '中野区→杉並区（引越し作業・4LDK・終日作業）',
            },
          ],
        },
        {
          id: 'emp-5',
          name: '高橋 五郎',
          email: 'takahashi@syncmoving.com',
          phone: '080-3333-4444',
          position: '作業員',
          status: 'active',
          hireDate: '2023-02-28',
          shifts: [
            {
              id: 'shift-8',
              employeeId: 'emp-5',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '09:00',
              status: 'working',
              startTime: '09:00',
              endTime: '18:00',
              notes: '鈴木さんと同行（引越し作業・終日作業）',
            },
          ],
        },
        {
          id: 'emp-6',
          name: '渡辺 六郎',
          email: 'watanabe@syncmoving.com',
          phone: '070-7777-8888',
          position: 'ドライバー',
          status: 'active',
          hireDate: '2023-05-10',
          shifts: [
            {
              id: 'shift-9',
              employeeId: 'emp-6',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'working',
              startTime: '10:00',
              endTime: '19:00',
              notes: '足立区→葛飾区→北区（引越し作業・2件・終日）',
            },
          ],
        },
        {
          id: 'emp-7',
          name: '伊藤 七郎',
          email: 'ito@syncmoving.com',
          phone: '090-9999-0000',
          position: '作業員',
          status: 'active',
          hireDate: '2023-07-15',
          shifts: [
            {
              id: 'shift-11',
              employeeId: 'emp-7',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '10:00',
              status: 'working',
              startTime: '10:00',
              endTime: '19:00',
              notes: '渡辺さんと同行（引越し作業・終日）',
            },
          ],
        },
        {
          id: 'emp-8',
          name: '中村 八郎',
          email: 'nakamura@syncmoving.com',
          phone: '080-1111-3333',
          position: 'リーダー',
          status: 'active',
          hireDate: '2022-12-01',
          shifts: [
            {
              id: 'shift-13',
              employeeId: 'emp-8',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '08:30',
              status: 'working',
              startTime: '08:30',
              endTime: '18:00',
              notes: '中央区→港区→千代田区（引越し作業・2件・終日）',
            },
          ],
        },
        {
          id: 'emp-9',
          name: '小林 九郎',
          email: 'kobayashi@syncmoving.com',
          phone: '070-2222-4444',
          position: 'ドライバー',
          status: 'active',
          hireDate: '2023-04-20',
          shifts: [
            {
              id: 'shift-15',
              employeeId: 'emp-9',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'working',
              startTime: '11:00',
              endTime: '16:00',
              notes: '豊島区→北区（引越し作業・2DK）',
            },
          ],
        },
        {
          id: 'emp-10',
          name: '加藤 十郎',
          email: 'kato@syncmoving.com',
          phone: '090-5555-7777',
          position: '作業員',
          status: 'active',
          hireDate: '2023-08-05',
          shifts: [
            {
              id: 'shift-16',
              employeeId: 'emp-10',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '11:00',
              status: 'working',
              startTime: '11:00',
              endTime: '16:00',
              notes: '小林さんと同行（引越し作業）',
            },
          ],
        },
        {
          id: 'emp-11',
          name: '森 十一郎',
          email: 'mori@syncmoving.com',
          phone: '080-6666-8888',
          position: 'ドライバー',
          status: 'active',
          hireDate: '2023-09-10',
          shifts: [
            {
              id: 'shift-17',
              employeeId: 'emp-11',
              date: new Date().toISOString().split('T')[0],
              timeSlot: '16:00',
              status: 'working',
              startTime: '16:00',
              endTime: '20:00',
              notes: '品川区→大田区（引越し作業・1LDK）',
            },
          ],
        },
        {
          id: 'emp-12',
          name: '清水 十二郎',
          email: 'shimizu@syncmoving.com',
          phone: '070-8888-9999',
          position: '作業員',
          status: 'active',
          hireDate: '2023-10-01',
          shifts: [
            {
              id: 'shift-18',
              employeeId: 'emp-12',
              date: '2025-01-15',
              timeSlot: '16:00',
              status: 'working',
              startTime: '16:00',
              endTime: '20:00',
              notes: '森さんと同行（引越し作業）',
            },
          ],
        },
      ];
      setEmployees(testEmployees);
      localStorage.setItem('employees', JSON.stringify(testEmployees));
    }
    
    // 初期データ読み込み後、未保存状態をクリア
    setUnsavedShiftIds(new Set());
  }, []);

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    // 即座にlocalStorageには保存せず、メモリ内のstateのみ更新
  };

  // 明示的な保存処理（保存ボタン用）
  const handleSaveToStorage = () => {
    localStorage.setItem('employees', JSON.stringify(employees));
    setUnsavedShiftIds(new Set()); // 未保存IDをクリア
    alert('シフトを保存しました');
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
    console.warn('═══════════════════════════════════════');
    console.warn('📝 PAGE.TSX - updateShift called');
    console.warn('Employee ID:', employeeId);
    console.warn('Shift ID:', shift.id);
    console.warn('New time:', shift.startTime, '-', shift.endTime);
    console.warn('═══════════════════════════════════════');
    
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        const updatedShifts = employee.shifts.map(s => 
          s.id === shift.id ? shift : s
        );
        console.warn('Updated employee shifts count:', updatedShifts.length);
        return { ...employee, shifts: updatedShifts };
      }
      return employee;
    });
    
    console.warn('Calling saveEmployees with', updatedEmployees.length, 'employees');
    saveEmployees(updatedEmployees);
    
    // 未保存シフトとして記録
    setUnsavedShiftIds(prev => new Set(prev).add(shift.id));
    
    console.warn('✅ PAGE.TSX - updateShift completed');
  };

  const addShift = (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => {
    console.log('➕ PAGE.TSX - addShift called:', {
      employeeId,
      shift: {
        ...shift,
        status: shift.status
      }
    });

    // ID重複を防ぐためランダム値を追加
    const newShift: EmployeeShift = {
      ...shift,
      id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    console.log('🆔 Generated shift ID:', newShift.id);
    console.log('📋 New shift data:', newShift);
    
    // setEmployeesを使用して、前の状態を基に更新（状態更新の競合を回避）
    setEmployees(prevEmployees => {
      const updatedEmployees = prevEmployees.map(employee => {
        if (employee.id === employeeId) {
          const updatedEmployee = { ...employee, shifts: [...employee.shifts, newShift] };
          console.log(`👤 Updated employee ${employee.name}: ${employee.shifts.length} → ${updatedEmployee.shifts.length} shifts`);
          return updatedEmployee;
        }
        return employee;
      });
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      }
      
      return updatedEmployees;
    });
    
    // 未保存シフトとして記録
    setUnsavedShiftIds(prev => new Set(prev).add(newShift.id));
    
    console.log('✅ PAGE.TSX - addShift completed');
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
    // 削除したシフトを未保存リストから削除
    setUnsavedShiftIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(shiftId);
      return newSet;
    });
  };




  const actions = null;

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-white">
        <div className={`${(showClipboard || showEmployeeSummary) ? 'mr-[25%]' : ''}`}>
          <AdminPageHeader 
            title="従業員管理"
            subtitle="従業員の稼働スケジュール管理"
            actions={actions}
            breadcrumbs={[
              { label: '従業員管理' }
            ]}
          />
        </div>


        {/* タブナビゲーション */}
        <div className={`${(showClipboard || showEmployeeSummary) ? 'mr-[25%]' : ''}`}>
          <AdminTabs
            variant="calendar"
            tabs={[
              { id: 'calendar', label: 'シフト管理', icon: '📅' },
              { id: 'employees', label: '従業員一覧', icon: '👥' }
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => {
              setActiveTab(tabId as 'calendar' | 'employees');
              if (tabId === 'employees') {
                // 従業員一覧タブに切り替えた際にサイドバーを非表示にする
                setShowEmployeeSummary(false);
                setShowClipboard(false);
              }
            }}
            className="px-2 sm:px-4 lg:px-6 xl:px-8"
          />
        </div>

        {/* メインコンテンツ - dispatchと同じレスポンシブ仕様 */}
        <main className={`w-full ${(showClipboard || showEmployeeSummary) ? 'max-w-[75%] mr-[25%]' : 'max-w-7xl'} mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 transition-all duration-300`}>
          <div className="px-4 py-2 sm:px-0">


            {/* タブコンテンツ */}
            {activeTab === 'calendar' && (
              <div className="bg-white">
                <div className="px-4 py-2 sm:p-3">
                  <ShiftCalendar
                employees={employees}
                cases={cases}
                onUpdateShift={updateShift}
                onAddShift={addShift}
                onDeleteShift={deleteShift}
                timeRangeType={timeRangeType}
                customStartTime={customStartTime}
                customEndTime={customEndTime}
                showTimeRangeSelector={true}
                displayStartTime={displayStartTime}
                displayEndTime={displayEndTime}
                onDisplayTimeRangeChange={handleDisplayTimeRangeChange}
                showClipboard={showClipboard}
                setShowClipboard={setShowClipboard}
                showEmployeeSummary={showEmployeeSummary}
                setShowEmployeeSummary={setShowEmployeeSummary}
                clipboardMode={clipboardMode}
                selectedShifts={selectedShifts}
                copiedShifts={copiedShifts}
                pendingPasteDates={pendingPasteDates}
                onShiftClickForClipboard={handleShiftClickForClipboard}
                onDateClickForClipboard={handleDateClickForClipboard}
                unsavedShiftIds={unsavedShiftIds}
                onSave={handleSaveToStorage}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'employees' && (
              <div className="bg-white">
                <div className="px-4 py-2 sm:p-3">
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
                </div>
              </div>
            )}

          </div>
        </main>

        {/* 統合サイドパネル - 従業員集計とクリップボードをまとめたパネル */}
        {(showClipboard || showEmployeeSummary) && (
          <div className="fixed top-0 right-0 w-[25%] h-full bg-white border-l border-gray-300 shadow-lg z-50 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* ヘッダー - タブ切り替え */}
              <div className="flex border-b border-gray-200">
                {showEmployeeSummary && (
                  <button
                    onClick={() => setActiveSidePanelTab('employeeSummary')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeSidePanelTab === 'employeeSummary'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="text-lg">📊</span>
                    従業員集計
                  </button>
                )}
                {showClipboard && (
                  <button
                    onClick={() => setActiveSidePanelTab('clipboard')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeSidePanelTab === 'clipboard'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="text-lg">📋</span>
                    クリップボード
                  </button>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    setShowEmployeeSummary(false);
                    setShowClipboard(false);
                  }}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* コンテンツ */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 従業員集計セクション */}
                {activeSidePanelTab === 'employeeSummary' && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800">
                          {new Date().getFullYear()}年{new Date().getMonth() + 1}月 従業員集計
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                                従業員名
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                                出勤日数
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                                当月総労働時間
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              // 月間集計を計算する関数
                              const getEmployeeMonthlySummary = () => {
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth();
                                const firstDay = new Date(year, month, 1);
                                const lastDay = new Date(year, month + 1, 0);
                                
                                return employees.filter(emp => emp.status === 'active').map(employee => {
                                  let totalWorkingDays = 0;
                                  let totalWorkingMinutes = 0;
                                  
                                  // 月の各日をチェック
                                  for (let day = 1; day <= lastDay.getDate(); day++) {
                                    const date = new Date(year, month, day).toISOString().split('T')[0];
                                    const dayShifts = employee.shifts.filter(shift => shift.date === date);
                                    const workingShifts = dayShifts.filter(shift => shift.status === 'working');
                                    
                                    if (workingShifts.length > 0) {
                                      totalWorkingDays++;
                                      
                                      // その日の総労働時間を計算
                                      const timeSlots = workingShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
                                      const sortedTimeSlots = timeSlots.sort((a, b) => a.start.localeCompare(b.start));
                                      
                                      // 連続する時間帯をグループ化
                                      const timeGroups: string[][] = [];
                                      let currentGroup: string[] = [];
                                      
                                      sortedTimeSlots.forEach((slot, index) => {
                                        if (index === 0) {
                                          currentGroup = [slot.start, slot.end];
                                        } else {
                                          const prevSlot = sortedTimeSlots[index - 1];
                                          if (prevSlot.end === slot.start) {
                                            currentGroup[1] = slot.end;
                                          } else {
                                            timeGroups.push([...currentGroup]);
                                            currentGroup = [slot.start, slot.end];
                                          }
                                        }
                                      });
                                      
                                      timeGroups.push(currentGroup);
                                      
                                      // 各グループの労働時間を計算
                                      timeGroups.forEach(group => {
                                        const startTime = group[0].split(':').map(Number);
                                        const endTime = group[1].split(':').map(Number);
                                        const startMinutes = startTime[0] * 60 + startTime[1];
                                        const endMinutes = endTime[0] * 60 + endTime[1];
                                        totalWorkingMinutes += (endMinutes - startMinutes);
                                      });
                                    }
                                  }
                                  
                                  const totalHours = Math.floor(totalWorkingMinutes / 60);
                                  const remainingMinutes = totalWorkingMinutes % 60;
                                  const totalTimeStr = totalHours > 0 ? `${totalHours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}` : `${remainingMinutes}分`;
                                  
                                  return {
                                    employee,
                                    workingDays: totalWorkingDays,
                                    totalWorkingTime: totalTimeStr,
                                    totalWorkingMinutes
                                  };
                                }).sort((a, b) => b.totalWorkingMinutes - a.totalWorkingMinutes);
                              };
                              
                              return getEmployeeMonthlySummary().map((summary, index) => (
                                <tr key={summary.employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">
                                    {summary.employee.name}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-700">
                                    {summary.workingDays}日
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-700">
                                    {summary.totalWorkingTime}
                                  </td>
                                </tr>
                              ));
                            })()}
                            
                            {/* 合計行 */}
                            {(() => {
                              const year = new Date().getFullYear();
                              const month = new Date().getMonth();
                              const firstDay = new Date(year, month, 1);
                              const lastDay = new Date(year, month + 1, 0);
                              
                              let totalWorkingDays = 0;
                              let totalWorkingMinutes = 0;
                              
                              // 全従業員の合計を計算
                              employees.filter(emp => emp.status === 'active').forEach(employee => {
                                for (let day = 1; day <= lastDay.getDate(); day++) {
                                  const date = new Date(year, month, day).toISOString().split('T')[0];
                                  const dayShifts = employee.shifts.filter(shift => shift.date === date);
                                  const workingShifts = dayShifts.filter(shift => shift.status === 'working');
                                  
                                  if (workingShifts.length > 0) {
                                    totalWorkingDays++;
                                    
                                    // その日の総労働時間を計算
                                    const timeSlots = workingShifts.map(s => TIME_SLOTS.find(ts => ts.id === s.timeSlot)).filter(Boolean);
                                    const sortedTimeSlots = timeSlots.sort((a, b) => a.start.localeCompare(b.start));
                                    
                                    // 連続する時間帯をグループ化
                                    const timeGroups: string[][] = [];
                                    let currentGroup: string[] = [];
                                    
                                    sortedTimeSlots.forEach((slot, index) => {
                                      if (index === 0) {
                                        currentGroup = [slot.start, slot.end];
                                      } else {
                                        const prevSlot = sortedTimeSlots[index - 1];
                                        if (prevSlot.end === slot.start) {
                                          currentGroup[1] = slot.end;
                                        } else {
                                          timeGroups.push([...currentGroup]);
                                          currentGroup = [slot.start, slot.end];
                                        }
                                      }
                                    });
                                    
                                    timeGroups.push(currentGroup);
                                    
                                    // 各グループの労働時間を計算
                                    timeGroups.forEach(group => {
                                      const startTime = group[0].split(':').map(Number);
                                      const endTime = group[1].split(':').map(Number);
                                      const startMinutes = startTime[0] * 60 + startTime[1];
                                      const endMinutes = endTime[0] * 60 + endTime[1];
                                      totalWorkingMinutes += (endMinutes - startMinutes);
                                    });
                                  }
                                }
                              });
                              
                              const totalHours = Math.floor(totalWorkingMinutes / 60);
                              const remainingMinutes = totalWorkingMinutes % 60;
                              const totalTimeStr = totalHours > 0 ? `${totalHours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}` : `${remainingMinutes}分`;
                              
                              return (
                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900">
                                    合計
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900">
                                    {totalWorkingDays}日
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900">
                                    {totalTimeStr}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* 全体集計 */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-600">
                            登録従業員数: {employees.filter(emp => emp.status === 'active').length}名
                          </div>
                          <div className="text-gray-600">
                            出勤予定者数: {employees.filter(emp => emp.status === 'active').filter(emp => {
                              const year = new Date().getFullYear();
                              const month = new Date().getMonth();
                              const firstDay = new Date(year, month, 1);
                              const lastDay = new Date(year, month + 1, 0);
                              let hasWorkingDays = false;
                              for (let day = 1; day <= lastDay.getDate(); day++) {
                                const date = new Date(year, month, day).toISOString().split('T')[0];
                                const dayShifts = emp.shifts.filter(shift => shift.date === date);
                                if (dayShifts.filter(shift => shift.status === 'working').length > 0) {
                                  hasWorkingDays = true;
                                  break;
                                }
                              }
                              return hasWorkingDays;
                            }).length}名
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* クリップボードセクション */}
                {activeSidePanelTab === 'clipboard' && (
                  <div className="space-y-4">
                    {/* モード選択 */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={startCopyMode}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          clipboardMode === 'copy' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📋 コピー
                      </button>
                      
                      <button
                        onClick={startPasteMode}
                        disabled={copiedShifts.length === 0}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          clipboardMode === 'paste'
                            ? 'bg-green-600 text-white'
                            : copiedShifts.length === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📌 貼り付け
                      </button>
                    </div>
                    
                    {/* コピーモードの内容 */}
                    {clipboardMode === 'copy' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-blue-900">
                            {selectedShifts.length > 0 ? `選択中: ${selectedShifts.length}件` : 'コピーするシフトを選択してください'}
                          </div>
                          {selectedShifts.length > 0 && (
                            <button
                              onClick={clearSelectedShifts}
                              className="text-blue-700 hover:text-blue-900 text-sm underline font-medium"
                            >
                              すべてクリア
                            </button>
                          )}
                        </div>
                        
                        {selectedShifts.length > 0 ? (
                          <>
                            <div className="max-h-80 overflow-y-auto space-y-2 mb-3">
                            {selectedShifts.map(shift => {
                              const employee = employees.find(emp => emp.id === shift.employeeId);
                                return (
                                  <div key={shift.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-200 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900">
                                        {employee?.name || '不明な従業員'}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => removeSelectedShift(shift.id)}
                                      className="text-red-600 hover:text-red-800 text-sm font-bold"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            <button
                              onClick={executeCopy}
                              className="w-full py-2.5 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              コピー実行
                            </button>
                          </>
                        ) : (
                          <div className="text-blue-800 text-sm font-medium">
                            カレンダー上のシフトをクリックして選択してください
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* ペーストモードの内容 */}
                    {clipboardMode === 'paste' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-green-900">
                            {pendingPasteDates.length > 0 ? `選択中: ${pendingPasteDates.length}日` : '貼り付け先の日付を選択してください'}
                          </div>
                          {pendingPasteDates.length > 0 && (
                            <button
                              onClick={() => setPendingPasteDates([])}
                              className="text-green-700 hover:text-green-900 text-sm underline font-medium"
                            >
                              すべてクリア
                            </button>
                          )}
                        </div>
                        
                        {pendingPasteDates.length > 0 ? (
                          <>
                            <div className="max-h-80 overflow-y-auto space-y-2 mb-3">
                              {pendingPasteDates.map(date => (
                                <div key={date} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200 shadow-sm">
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                                  </span>
                                  <button
                                    onClick={() => setPendingPasteDates(prev => prev.filter(d => d !== date))}
                                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={executePaste}
                              className="w-full py-2.5 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              貼り付け実行
                            </button>
                          </>
                        ) : (
                          <div className="text-green-800 text-sm font-medium">
                            カレンダー上の日付をクリックして選択してください（複数選択可）
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* コピー済みシフト表示（コピーモード以外の時で、かつコピー済みシフトがある場合のみ表示） */}
                    {clipboardMode !== 'copy' && copiedShifts.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-gray-900">
                            コピー済み
                          </div>
                          <button
                            onClick={() => {
                              setCopiedShifts([]);
                              localStorage.removeItem('copiedShifts');
                            }}
                            className="text-gray-700 hover:text-gray-900 text-sm underline font-medium"
                          >
                            クリア
                          </button>
                        </div>
                        
                        <div className="text-gray-700 mb-2 font-medium">
                          {copiedShifts.length}件のシフト
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                        {copiedShifts.map(shift => {
                          const employee = employees.find(emp => emp.id === shift.employeeId);
                            return (
                              <div key={shift.id} className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee?.name || '不明な従業員'}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}