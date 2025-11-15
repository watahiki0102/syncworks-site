'use client';

import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import EmployeeSearchSelect from './EmployeeSearchSelect';
import MultiSelectCalendar from './MultiSelectCalendar';

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
}

interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'working' | 'unavailable';
  notes?: string;
  timeSlot?: string;
}

type ModalMode = 'edit' | 'create' | 'bulk' | 'range';
type TabMode = 'bulk' | 'range';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  employees: Employee[];
  editingShift?: EmployeeShift | null;
  onSave: (data: ShiftModalData) => void;
  onDelete?: () => void;
}

export interface ShiftModalData {
  mode: ModalMode;
  employeeIds: string[];
  startDate: string;
  endDate?: string;
  dates?: string[]; // 一括登録用の複数日付
  startTime: string;
  endTime: string;
  status: 'working' | 'unavailable';
  notes: string;
}

export default function ShiftModal({
  isOpen,
  onClose,
  mode,
  employees,
  editingShift,
  onSave,
  onDelete,
}: ShiftModalProps) {
  // タブモード（bulk と range の時のみ使用）
  const [activeTab, setActiveTab] = useState<TabMode>('bulk');
  
  // フォームデータ
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // 一括登録用の複数日付
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [status, setStatus] = useState<'working' | 'unavailable'>('working');
  const [notes, setNotes] = useState('');

  // 30分単位の時間オプションを生成
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    times.push('24:00'); // 終了時間用
    return times;
  };

  const timeOptions = generateTimeOptions();

  // モードに応じた初期化
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingShift) {
        setSelectedEmployeeIds([editingShift.employeeId]);
        
        // 日マタギシフトの場合（__endDateプロパティが存在する場合）
        const isDayCrossing = (editingShift as any).__endDate !== undefined;
        if (isDayCrossing) {
          setStartDate(editingShift.date);
          setEndDate((editingShift as any).__endDate);
          setStartTime(editingShift.startTime || '09:00');
          setEndTime(editingShift.endTime || '18:00');
        } else {
          setStartDate(editingShift.date);
          setEndDate(editingShift.date);
          setStartTime(editingShift.startTime || '09:00');
          setEndTime(editingShift.endTime || '18:00');
        }
        setStatus(editingShift.status);
        setNotes(editingShift.notes || '');
      } else if (mode === 'create' && editingShift) {
        setSelectedEmployeeIds([editingShift.employeeId]);
        setStartDate(editingShift.date);
        setEndDate(editingShift.date);
        setStartTime(editingShift.startTime || '09:00');
        setEndTime(editingShift.endTime || '18:00');
        setStatus('working');
        setNotes('');
      } else {
        // bulk または range モード
        setSelectedEmployeeIds([]);
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setSelectedDates([]); // 複数日付をリセット
        setStartTime('09:00');
        setEndTime('18:00');
        setStatus('working');
        setNotes('');
        setActiveTab(mode === 'bulk' ? 'bulk' : 'range');
      }
    }
  }, [isOpen, mode, editingShift]);

  // タブ切り替え
  useEffect(() => {
    if (mode === 'bulk' || mode === 'range') {
      setActiveTab(mode);
    }
  }, [mode]);


  const handleSave = () => {
    // 編集モードで日マタギシフトの場合（開始日と終了日が異なる場合）はrangeモードとして扱う
    const isDayCrossingEdit = mode === 'edit' && editingShift && startDate !== endDate;
    
    const data: ShiftModalData = {
      mode: isDayCrossingEdit ? 'range' : (mode === 'bulk' || mode === 'range' ? activeTab : mode),
      employeeIds: selectedEmployeeIds,
      startDate,
      endDate: (activeTab === 'range' || isDayCrossingEdit) ? endDate : startDate,
      dates: activeTab === 'bulk' ? selectedDates : undefined, // 一括登録の場合は複数日付
      startTime,
      endTime,
      status,
      notes,
    };
    onSave(data);
  };

  const handleAddEmployee = (employeeId: string) => {
    if (!selectedEmployeeIds.includes(employeeId)) {
      setSelectedEmployeeIds([...selectedEmployeeIds, employeeId]);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employeeId));
  };

  // モーダルタイトル
  const getTitle = () => {
    if (mode === 'edit') return 'シフト編集';
    if (mode === 'create') return 'シフト登録';
    return 'シフト追加';
  };

  // 保存ボタンラベル
  const getSaveLabel = () => {
    if (mode === 'edit') return '更新';
    if (activeTab === 'bulk') return '一括登録';
    return '登録';
  };

  // タブ表示が必要かどうか
  const showTabs = mode === 'bulk' || mode === 'range';

  // バリデーション
  const isValid = () => {
    if (selectedEmployeeIds.length === 0) return false;
    // 一括登録の場合は複数日付をチェック
    if (activeTab === 'bulk' && selectedDates.length === 0) return false;
    // 単日登録の場合は開始日と終了日をチェック
    if (activeTab === 'range' && (!startDate || !endDate)) return false;
    // 編集・作成モードの場合は開始日をチェック
    if ((mode === 'edit' || mode === 'create') && !startDate) return false;
    if (!startTime || !endTime) return false;
    return true;
  };

  const formatDateLabel = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}/${month}/${day}`;
  };

  interface TimeBlockProps {
    title: string;
    badgeLabel: string;
    date: string;
    time: string;
    onTimeChange: React.Dispatch<React.SetStateAction<string>>;
    options: string[];
  }

  const TimeBlock: React.FC<TimeBlockProps> = ({
    title,
    badgeLabel,
    date,
    time,
    onTimeChange,
    options,
  }) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
        <span>{title}</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-600">
          {badgeLabel}
        </span>
      </div>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        {date ? formatDateLabel(date) : '—'}
      </div>
      <div className="mt-3">
        <select
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const isRangeTab = (mode === 'bulk' || mode === 'range') && activeTab === 'range';
  const isEditOrCreate = mode === 'edit' || mode === 'create';
  const isTabMode = showTabs;

  const employeeSelectMode: 'single' | 'multiple' = isTabMode ? 'multiple' : 'single';
  const handleEmployeeSelect = (employeeId: string) => {
    if (employeeSelectMode === 'multiple') {
      handleAddEmployee(employeeId);
    } else {
      setSelectedEmployeeIds([employeeId]);
    }
  };
  const handleEmployeeRemove = employeeSelectMode === 'multiple' ? handleRemoveEmployee : undefined;
  const employeeLabelSuffix = employeeSelectMode === 'multiple' ? '（複数選択可能）' : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      footer={
        <>
          {mode === 'edit' && onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              削除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isValid()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {getSaveLabel()}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 従業員選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            従業員{employeeLabelSuffix}
          </label>
          {mode === 'edit' ? (
            // 編集モードでは選択された従業員の情報のみ表示
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              {selectedEmployeeIds.length > 0 && (() => {
                const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeIds[0]);
                return selectedEmployee ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{selectedEmployee.name}</span>
                    <span className="text-gray-500 ml-2">({selectedEmployee.position})</span>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <EmployeeSearchSelect
              employees={employees}
              selectedEmployeeIds={selectedEmployeeIds}
              onSelect={handleEmployeeSelect}
              onRemove={handleEmployeeRemove}
              mode={employeeSelectMode}
            />
          )}
        </div>

        {/* タブUI（bulk/rangeモードのみ） */}
        {showTabs && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'bulk'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              一括登録
            </button>
            <button
              onClick={() => setActiveTab('range')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'range'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              単日登録
            </button>
          </div>
        )}

        {/* 日付選択 */}
        {mode === 'edit' || mode === 'create' ? (
          // 日マタギシフトの場合（終了日が開始日と異なる場合）は範囲選択を表示
          (mode === 'edit' && editingShift && startDate !== endDate) ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日付
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )
        ) : activeTab === 'bulk' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付（複数選択可能）
            </label>
            <MultiSelectCalendar
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              className="w-full"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* 時間帯 */}
        {isRangeTab || (mode === 'edit' && editingShift && startDate !== endDate) ? (
          // 範囲登録モードまたは日マタギシフト編集モードの場合
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TimeBlock
              title="開始"
              badgeLabel="開始日"
              date={startDate}
              time={startTime}
              onTimeChange={setStartTime}
              options={timeOptions}
            />
            <TimeBlock
              title="終了"
              badgeLabel="終了日"
              date={endDate}
              time={endTime}
              onTimeChange={setEndTime}
              options={timeOptions}
            />
          </div>
        ) : isEditOrCreate ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>対象日</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-600">
                {startDate ? formatDateLabel(startDate) : '—'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs font-semibold text-gray-500">開始</span>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1 block text-xs font-semibold text-gray-500">終了</span>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ステータス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'working' | 'unavailable')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="working">出勤</option>
            <option value="unavailable">出勤不可</option>
          </select>
        </div>

        {/* メモ（任意） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ（任意）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="例：引越し作業・2DK"
          />
        </div>
      </div>
    </Modal>
  );
}

