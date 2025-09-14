/**
 * シミュレーション切り替えボタンコンポーネント
 * Apple公式サイトUI参考のデザイン
 */
'use client';

interface SimulationToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export default function SimulationToggle({ isEnabled, onToggle }: SimulationToggleProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={onToggle}
        className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg ${
          isEnabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        {isEnabled ? 'シミュレーション ON' : 'シミュレーション OFF'}
      </button>
    </div>
  );
}
