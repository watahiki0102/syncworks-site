import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ManualCaseRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const workOptions = [
  "🏠 建物養生（壁や床の保護）",
  "📦 荷造り・荷ほどきの代行",
  "🪑 家具・家電の分解・組み立て",
  "🧺 洗濯機取り外し",
  "❄️ エアコン（本体＋室外機）取り外し",
  "💡 照明・テレビ配線取り外し",
  "🚮 不用品の回収・廃棄",
  "🐾 ペット運搬",
  "📝 その他（下記備考欄に記入）",
];

export default function ManualCaseRegistration({ isOpen, onClose }: ManualCaseRegistrationProps) {
  const [tab, setTab] = useState<'simple' | 'detail'>('simple');
  const [mode, setMode] = useState<'contract' | 'estimate'>('contract');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [points, setPoints] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  const router = useRouter();

  const toggleOption = (opt: string) => {
    setOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'detail') {
      onClose();
      router.push('/form/step1');
      return;
    }
    if (!customerName || !date || !timeSlot || !points || !origin || !destination || (mode === 'contract' && !price)) {
      alert('必須項目を入力してください');
      return;
    }
    const newSubmission = {
      id: Date.now().toString(),
      customerName,
      customerEmail: '',
      customerPhone: '',
      moveDate: date,
      originAddress: origin,
      destinationAddress: destination,
      totalPoints: Number(points),
      totalCapacity: 0,
      itemList: [],
      additionalServices: options,
      status: 'pending',
      truckAssignments: [],
      createdAt: new Date().toISOString(),
      contractStatus: mode === 'contract' ? 'contracted' as const : 'estimate' as const,
      contractDate: mode === 'contract' ? new Date().toISOString() : undefined,
      estimatedPrice: mode === 'contract' ? Number(price) : undefined,
    };
    const saved = localStorage.getItem('formSubmissions');
    const submissions = saved ? JSON.parse(saved) : [];
    submissions.push(newSubmission);
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    onClose();
    router.push('/admin/dispatch');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 overflow-y-auto max-h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">案件手動登録</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="mb-4 flex space-x-4 border-b">
          <button
            type="button"
            onClick={() => setTab('simple')}
            className={`pb-2 ${tab === 'simple' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          >
            簡易登録
          </button>
          <button
            type="button"
            onClick={() => setTab('detail')}
            className={`pb-2 ${tab === 'detail' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          >
            詳細登録
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="mr-1"
                checked={mode === 'contract'}
                onChange={() => setMode('contract')}
              />
              契約済み案件として登録
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="radio"
                className="mr-1"
                checked={mode === 'estimate'}
                onChange={() => setMode('estimate')}
              />
              見積もり回答のために登録
            </label>
          </div>
          {tab === 'simple' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">顧客名<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">予定日<span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">予定時間帯<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">荷物ポイント数<span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">発地<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">着地<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              {mode === 'contract' && (
                <div>
                  <label className="block text-sm font-medium">金額<span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">選択オプション</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {workOptions.map(opt => (
                    <label key={opt} className="inline-flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={options.includes(opt)}
                        onChange={() => toggleOption(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">詳細登録を選択すると、通常の見積もりフォームへ遷移します。</p>
          )}
          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm">キャンセル</button>
            {tab === 'simple' ? (
              <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">登録</button>
            ) : (
              <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">フォームへ移動</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
