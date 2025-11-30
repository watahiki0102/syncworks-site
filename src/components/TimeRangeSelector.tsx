'use client';

import { useState, useEffect } from 'react';

export type TimeRangeType = 'morning' | 'afternoon' | 'evening' | 'full' | 'custom';

export interface TimeRangeSelectorProps {
  value: TimeRangeType;
  onChange: (range: TimeRangeType) => void;
  customStartTime?: string;
  customEndTime?: string;
  onCustomTimeChange?: (startTime: string, endTime: string) => void;
  className?: string;
}

export default function TimeRangeSelector({
  value,
  onChange,
  customStartTime,
  customEndTime,
  onCustomTimeChange,
  className = ''
}: TimeRangeSelectorProps) {
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(customStartTime || '09:00');
  const [tempEndTime, setTempEndTime] = useState(customEndTime || '18:00');

  // カスタム時間が変更されたときにローカル状態を更新
  useEffect(() => {
    if (customStartTime) {setTempStartTime(customStartTime);}
    if (customEndTime) {setTempEndTime(customEndTime);}
  }, [customStartTime, customEndTime]);

  const handleTimeRangeChange = (range: TimeRangeType) => {
    onChange(range);
    if (range !== 'custom') {
      setShowCustomTimePicker(false);
    } else {
      setShowCustomTimePicker(true);
    }
  };

  const handleCustomTimeSubmit = () => {
    if (tempStartTime && tempEndTime && onCustomTimeChange) {
      onCustomTimeChange(tempStartTime, tempEndTime);
      setShowCustomTimePicker(false);
    }
  };

  const getTimeRangeLabel = (range: TimeRangeType) => {
    switch (range) {
      case 'morning':
        return '午前 (6:00-12:00)';
      case 'afternoon':
        return '午後 (12:00-18:00)';
      case 'evening':
        return '夜間 (18:00-24:00)';
      case 'full':
        return '全日 (6:00-24:00)';
      case 'custom':
        return customStartTime && customEndTime 
          ? `${customStartTime} ～ ${customEndTime}`
          : '時間指定';
      default:
        return '全日';
    }
  };

  const getTimeRangeTimes = (range: TimeRangeType) => {
    switch (range) {
      case 'morning':
        return { startTime: '06:00', endTime: '12:00' };
      case 'afternoon':
        return { startTime: '12:00', endTime: '18:00' };
      case 'evening':
        return { startTime: '18:00', endTime: '24:00' };
      case 'full':
        return { startTime: '06:00', endTime: '24:00' };
      case 'custom':
        return {
          startTime: customStartTime || '09:00',
          endTime: customEndTime || '18:00'
        };
      default:
        return { startTime: '06:00', endTime: '24:00' };
    }
  };

  const timeRangeTimes = getTimeRangeTimes(value);

  return (
    <div className={`time-range-selector ${className}`}>
      {/* 時間帯選択ボタン */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(['morning', 'afternoon', 'evening', 'full', 'custom'] as TimeRangeType[]).map((range) => (
          <button
            key={range}
            onClick={() => handleTimeRangeChange(range)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              value === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getTimeRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* 時間帯情報表示 */}
      <div className="text-sm text-gray-600 mb-3">
        <span className="font-medium">表示時間帯:</span>{' '}
        {timeRangeTimes.startTime} ～ {timeRangeTimes.endTime}
        {(() => {
          const start = parseInt(timeRangeTimes.startTime.split(':')[0]);
          const end = parseInt(timeRangeTimes.endTime.split(':')[0]);
          const hours = end - start;
          return (
            <span className="ml-2 text-gray-500">
              ({hours}時間)
            </span>
          );
        })()}
      </div>

      {/* カスタム時間選択 */}
      {showCustomTimePicker && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <input
                type="time"
                value={tempStartTime}
                onChange={(e) => setTempStartTime(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <input
                type="time"
                value={tempEndTime}
                onChange={(e) => setTempEndTime(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                min={tempStartTime}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomTimeSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                適用
              </button>
              <button
                onClick={() => setShowCustomTimePicker(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => {
            if (onCustomTimeChange) {
              onCustomTimeChange('08:00', '12:00');
              onChange('custom');
            }
          }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          早朝 (8:00-12:00)
        </button>
        <button
          onClick={() => {
            if (onCustomTimeChange) {
              onCustomTimeChange('13:00', '17:00');
              onChange('custom');
            }
          }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          午後 (13:00-17:00)
        </button>
        <button
          onClick={() => {
            if (onCustomTimeChange) {
              onCustomTimeChange('19:00', '22:00');
              onChange('custom');
            }
          }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          夜間 (19:00-22:00)
        </button>
        <button
          onClick={() => {
            if (onCustomTimeChange) {
              onCustomTimeChange('09:00', '17:00');
              onChange('custom');
            }
          }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          営業時間 (9:00-17:00)
        </button>
      </div>
    </div>
  );
}
