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
        setStartDate(editingShift.date);
        setEndDate(editingShift.date);
        setStartTime(editingShift.startTime || '09:00');
        setEndTime(editingShift.endTime || '18:00');
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
    const data: ShiftModalData = {
      mode: mode === 'bulk' || mode === 'range' ? activeTab : mode,
      employeeIds: selectedEmployeeIds,
      startDate,
      endDate: activeTab === 'range' ? endDate : startDate,
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

  const handleSingleSelect = (employeeId: string) => {
    setSelectedEmployeeIds([employeeId]);
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

        {/* 従業員選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            従業員{activeTab === 'bulk' ? '（複数選択可能）' : ''}
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
              onSelect={activeTab === 'bulk' ? handleAddEmployee : handleSingleSelect}
              onRemove={activeTab === 'bulk' ? handleRemoveEmployee : undefined}
              mode={activeTab === 'bulk' ? 'multiple' : 'single'}
            />
          )}
        </div>

        {/* 日付選択 */}
        {mode === 'edit' || mode === 'create' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            <option value="unavailable">欠勤・休暇</option>
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

