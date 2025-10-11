'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
}

interface EmployeeSearchSelectProps {
  employees: Employee[];
  selectedEmployeeIds?: string[];
  onSelect: (employeeId: string) => void;
  onRemove?: (employeeId: string) => void;
  mode?: 'single' | 'multiple';
  placeholder?: string;
  disabled?: boolean;
}

export default function EmployeeSearchSelect({
  employees,
  selectedEmployeeIds = [],
  onSelect,
  onRemove,
  mode = 'single',
  placeholder = '従業員名で検索...',
  disabled = false,
}: EmployeeSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 検索結果のフィルタリング
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = mode === 'multiple' ? !selectedEmployeeIds.includes(emp.id) : true;
    return matchesSearch && notSelected && emp.status === 'active';
  });

  // 選択された従業員のリスト
  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEmployee = (employeeId: string) => {
    onSelect(employeeId);
    setSearchQuery('');
    if (mode === 'single') {
      setIsOpen(false);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    if (onRemove) {
      onRemove(employeeId);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 選択された従業員のチップ表示（複数選択モードのみ） */}
      {mode === 'multiple' && selectedEmployees.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              選択済み従業員
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {selectedEmployees.length}名
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedEmployees.map(emp => (
              <div
                key={emp.id}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full text-sm"
              >
                <span className="font-medium text-blue-900">{emp.name}</span>
                <span className="text-xs text-blue-600">({emp.position})</span>
                <button
                  onClick={() => handleRemoveEmployee(emp.id)}
                  className="ml-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                  title="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索入力 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ドロップダウンリスト */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleSelectEmployee(emp.id)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              >
                <div className="font-medium text-gray-900">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.position}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              {searchQuery ? '該当する従業員が見つかりません' : '従業員がいません'}
            </div>
          )}
        </div>
      )}

      {/* 単一選択モードで選択された従業員を表示 */}
      {mode === 'single' && selectedEmployees.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          選択中: <span className="font-medium text-gray-900">{selectedEmployees[0].name}</span> ({selectedEmployees[0].position})
        </div>
      )}
    </div>
  );
}

