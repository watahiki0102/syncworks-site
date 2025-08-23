import { FormEvent } from 'react';
import { Truck } from '@/types/dispatch';

interface UnavailablePeriodModalProps {
  truck: Truck | null;
  onClose: () => void;
  onSave: (_period: { startDate: string; endDate: string; reason: string }) => void;
  initialPeriod: { startDate: string; endDate: string; reason: string };
  onPeriodChange: (_period: { startDate: string; endDate: string; reason: string }) => void;
}

const UnavailablePeriodModal = ({
  truck,
  onClose,
  onSave,
  initialPeriod,
  onPeriodChange,
}: UnavailablePeriodModalProps) => {
  if (!truck) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!initialPeriod.startDate || !initialPeriod.endDate) {
      alert('開始日と終了日を入力してください');
      return;
    }

    if (new Date(initialPeriod.startDate) > new Date(initialPeriod.endDate)) {
      alert('開始日は終了日より前の日付を選択してください');
      return;
    }

    onSave(initialPeriod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">車両使用不能期間設定</h3>
        <p className="text-sm text-gray-600 mb-4">
          対象車両: {truck.name} ({truck.plateNumber})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.startDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, startDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.endDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, endDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              理由
            </label>
            <select
              value={initialPeriod.reason}
              onChange={(e) => onPeriodChange({ ...initialPeriod, reason: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="車検">車検</option>
              <option value="定期点検">定期点検</option>
              <option value="修理">修理</option>
              <option value="清掃・メンテナンス">清掃・メンテナンス</option>
              <option value="休車">休車</option>
              <option value="その他">その他</option>
            </select>
            {initialPeriod.reason === 'その他' && (
              <input
                type="text"
                placeholder="詳細を入力してください"
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  onPeriodChange({ ...initialPeriod, reason: `その他: ${e.target.value}` })
                }
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              使用不能期間を設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnavailablePeriodModal;
