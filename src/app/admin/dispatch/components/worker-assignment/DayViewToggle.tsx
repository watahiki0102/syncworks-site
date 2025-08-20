'use client';

interface DayViewToggleProps {
  viewMode: 'schedule' | 'day';
  onViewModeChange: (mode: 'schedule' | 'day') => void;
}

export default function DayViewToggle({ viewMode, onViewModeChange }: DayViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewModeChange('schedule')}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          viewMode === 'schedule'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📅 スケジュールビュー
      </button>
      <button
        onClick={() => onViewModeChange('day')}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          viewMode === 'day'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📋 日ビュー統合
      </button>
    </div>
  );
}