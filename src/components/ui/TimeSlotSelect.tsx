/**
 * 時間帯選択コンポーネント
 * form/step1とadmin/cases/registerで共通使用
 */

import React from 'react';

/**
 * 時間帯選択オプション
 */
export const TIME_SLOTS = [
  { value: 'none', label: '指定なし' },
  { value: 'early_morning', label: '早朝（6～9時）' },
  { value: 'morning', label: '午前（9～12時）' },
  { value: 'afternoon', label: '午後（12～15時）' },
  { value: 'evening', label: '夕方（15～18時）' },
  { value: 'night', label: '夜間（18～21時）' },
  { value: 'not_early', label: '早朝以外（9～21時）' },
  { value: 'not_night', label: '夜間以外（6～18時）' },
  { value: 'daytime_only', label: '早朝・夜間以外（9～18時）' }
];

interface TimeSlotSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
}

/**
 * 時間帯選択コンポーネント
 */
export const TimeSlotSelect: React.FC<TimeSlotSelectProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '時間帯を選択してください',
  required = false,
  error = false
}) => {
  const baseClassName = `mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseClassName} ${className}`}
      required={required}
    >
      <option value="">{placeholder}</option>
      {TIME_SLOTS.map(slot => (
        <option key={slot.value} value={slot.value}>
          {slot.label}
        </option>
      ))}
    </select>
  );
};

export default TimeSlotSelect;
