'use client';

export type AssignmentStatusFilterValue = 'all' | 'pending' | 'assigned' | 'completed';

interface AssignmentStatusFilterProps {
  value: AssignmentStatusFilterValue;
  onChange: (value: AssignmentStatusFilterValue) => void;
}

export default function AssignmentStatusFilter({ value, onChange }: AssignmentStatusFilterProps) {
  const options: { value: AssignmentStatusFilterValue; label: string; description: string }[] = [
    { value: 'all', label: 'すべて', description: '全案件を表示' },
    { value: 'pending', label: '未割当', description: '未割当案件のみ表示' },
    { value: 'assigned', label: '割当済', description: '割当済案件のみ表示' },
    { value: 'completed', label: '完了', description: '完了案件のみ表示' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">割当ステータス:</span>
      <div className="flex gap-1" role="group" aria-label="割当ステータスフィルタ">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${value === option.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
            aria-pressed={value === option.value}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
