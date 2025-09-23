'use client';

import { useState } from 'react';

export interface TimeRangeDisplaySelectorProps {
  startTime: number;
  endTime: number;
  onTimeRangeChange: (start: number, end: number) => void;
  className?: string;
}

export default function TimeRangeDisplaySelector({
  startTime,
  endTime,
  onTimeRangeChange,
  className = ''
}: TimeRangeDisplaySelectorProps) {
  const [localStartTime, setLocalStartTime] = useState(startTime);
  const [localEndTime, setLocalEndTime] = useState(endTime);

  const handleStartTimeChange = (newStart: number) => {
    setLocalStartTime(newStart);
    onTimeRangeChange(newStart, Math.max(newStart + 1, localEndTime));
  };

  const handleEndTimeChange = (newEnd: number) => {
    setLocalEndTime(newEnd);
    onTimeRangeChange(localStartTime, newEnd);
  };

  const handleReset = () => {
    const defaultStart = 8;
    const defaultEnd = 20;
    setLocalStartTime(defaultStart);
    setLocalEndTime(defaultEnd);
    onTimeRangeChange(defaultStart, defaultEnd);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm font-medium text-gray-700">表示期間:</span>
      <div className="flex items-center gap-2">
        <select
          value={localStartTime}
          onChange={(e) => handleStartTimeChange(parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">～</span>
        <select
          value={localEndTime}
          onChange={(e) => handleEndTimeChange(parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 24 }, (_, i) => 
            i > localStartTime && (
              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
            )
          )}
        </select>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
