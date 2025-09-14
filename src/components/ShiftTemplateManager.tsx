'use client';

import { useState, useEffect } from 'react';
import { WEEKDAYS_JA, WEEKDAYS_EN, TIME_SLOTS } from '@/constants/calendar';

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
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

interface ShiftTemplateManagerProps {
  employees: Employee[];
  templates: ShiftTemplate[];
  onAddTemplate: (template: Omit<ShiftTemplate, 'id'>) => void;
  onUpdateTemplate: (id: string, template: Partial<ShiftTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplate: (templateId: string, dates: string[]) => void;
}

export default function ShiftTemplateManager({
  employees,
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onApplyTemplate,
}: ShiftTemplateManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    startTime: '09:00',
    endTime: '17:00',
    weekdays: [] as string[],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, formData);
    } else {
      onAddTemplate(formData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      employeeId: template.employeeId,
      startTime: template.startTime,
      endTime: template.endTime,
      weekdays: template.weekdays,
      notes: template.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      onDeleteTemplate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      startTime: '09:00',
      endTime: '17:00',
      weekdays: [],
      notes: '',
    });
    setEditingTemplate(null);
  };

  const toggleWeekday = (weekday: string) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(weekday)
        ? prev.weekdays.filter(w => w !== weekday)
        : [...prev.weekdays, weekday],
    }));
  };

  const getTimeSlotsInRange = (startTime: string, endTime: string) => {
    return TIME_SLOTS.filter(slot => {
      const slotStart = slot.start;
      const slotEnd = slot.end;
      return slotStart >= startTime && slotEnd <= endTime;
    });
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          ＋ テンプレート追加
        </button>
      </div>

      {/* テンプレート一覧 */}
      <div className="grid gap-4">
        {templates.map(template => {
          const employee = employees.find(emp => emp.id === template.employeeId);
          const timeSlots = getTimeSlotsInRange(template.startTime, template.endTime);
          
          return (
            <div key={template.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">
                    {employee?.name} ({employee?.position})
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">勤務時間:</span>
                  <div className="text-gray-600">
                    {template.startTime} - {template.endTime}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({timeSlots.length}時間枠)
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-900">適用曜日:</span>
                  <div className="flex gap-1 mt-1">
                    {WEEKDAYS_EN.map((day, index) => (
                      <span
                        key={day}
                        className={`px-2 py-1 text-xs rounded ${
                          template.weekdays.includes(day)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {WEEKDAYS_JA[index]}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">備考:</span>
                  <div className="text-gray-600">
                    {template.notes || 'なし'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            テンプレートが登録されていません
          </div>
        )}
      </div>

      {/* テンプレート編集モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTemplate ? 'テンプレート編集' : 'テンプレート追加'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">テンプレート名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">従業員</label>
                <select
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900"
                  required
                >
                  <option value="">従業員を選択</option>
                  {employees.filter(emp => emp.status === 'active').map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">開始時間</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">終了時間</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">適用曜日</label>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS_EN.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={`p-2 text-xs rounded ${
                        formData.weekdays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {WEEKDAYS_JA[index]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">備考</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  {editingTemplate ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 