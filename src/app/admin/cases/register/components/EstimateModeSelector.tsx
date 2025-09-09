'use client';

import { EstimateInputMode } from '@/types/case';

interface EstimateModeSelectorProps {
  selectedMode: EstimateInputMode | null;
  onModeChange: (_mode: EstimateInputMode) => void;
}

export default function EstimateModeSelector({ selectedMode, onModeChange }: EstimateModeSelectorProps) {
  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        案件登録方式を選択してください
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => onModeChange('calc')}
          className={`px-8 py-4 rounded-lg border-2 font-medium text-lg transition-all ${
            selectedMode === 'calc'
              ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
              : 'border-blue-300 bg-white text-blue-700 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          見積済み案件を登録する
        </button>
        <button
          onClick={() => onModeChange('manual')}
          className={`px-8 py-4 rounded-lg border-2 font-medium text-lg transition-all ${
            selectedMode === 'manual'
              ? 'border-green-600 bg-green-600 text-white shadow-lg'
              : 'border-green-300 bg-white text-green-700 hover:border-green-500 hover:bg-green-50'
          }`}
        >
          見積前案件を登録する
        </button>
      </div>
      <p className="text-sm text-gray-600 text-center mt-3">
        どちらかを選択すると、該当する入力フォームが表示されます
      </p>
    </div>
  );
}
