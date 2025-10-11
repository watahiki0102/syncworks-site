'use client';

import React from 'react';

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
  startTime: string;
  endTime: string;
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
}

interface MonthlyStats {
  workDays: number;
  totalHours: number;
}

interface EmployeeSummaryPanelProps {
  employees: Employee[];
  currentDate: Date;
  showEmployeeSummary: boolean;
  setShowEmployeeSummary: (show: boolean) => void;
  getMonthlyEmployeeStats: (employeeId: string, date: Date) => MonthlyStats;
  getTotalWorkDays: (date: Date) => number;
  getTotalWorkingHours: (date: Date) => number;
}

const EmployeeSummaryPanel: React.FC<EmployeeSummaryPanelProps> = ({
  employees,
  currentDate,
  showEmployeeSummary,
  setShowEmployeeSummary,
  getMonthlyEmployeeStats,
  getTotalWorkDays,
  getTotalWorkingHours,
}) => {
  const formatWorkingHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}分`;
    } else if (remainingMinutes === 0) {
      return `${hours}時間`;
    } else {
      return `${hours}時間${remainingMinutes}分`;
    }
  };

  if (!showEmployeeSummary) return null;

  return (
    <div className="w-80 bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">従業員集計</h3>
          </div>
          <button
            onClick={() => setShowEmployeeSummary(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月 従業員集計
        </p>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">従業員名</th>
                <th className="text-center py-2 font-medium text-gray-700">出勤日数</th>
                <th className="text-right py-2 font-medium text-gray-700">当月総労働時間</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => {
                const monthlyStats = getMonthlyEmployeeStats(employee.id, currentDate);
                return (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 text-gray-900">{employee.name}</td>
                    <td className="py-2 text-center text-gray-600">{monthlyStats.workDays}日</td>
                    <td className="py-2 text-right text-gray-600">{formatWorkingHours(monthlyStats.totalHours)}</td>
                  </tr>
                );
              })}
              {/* 合計行 */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-2 text-gray-900">合計</td>
                <td className="py-2 text-center text-gray-900">{getTotalWorkDays(currentDate)}日</td>
                <td className="py-2 text-right text-gray-900">{formatWorkingHours(getTotalWorkingHours(currentDate))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSummaryPanel;
