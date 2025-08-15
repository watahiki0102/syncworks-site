import React from 'react';

interface Option {
  name: string;
  price?: number;
}

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string;
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  contractStatus?: 'confirmed' | 'estimate';
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number;
  points?: number;
  origin?: string;
  destination?: string;
  preferredDate1?: string;
  preferredDate2?: string;
  preferredDate3?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'invoice';
  paymentStatus?: 'paid' | 'pending' | 'partial';
  paymentAmount?: number;
  paymentDueDate?: string;
  selectedOptions?: Option[];
  truckName?: string;
  truckId?: string;
  assignedEmployees?: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
}

interface CaseDetailProps {
  schedule: Schedule;
  truck?: Truck;
  isHighlighted?: boolean;
  onEdit?: () => void;
}

function formatDate(date: string) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('ja-JP');
  } catch {
    return date;
  }
}

function formatTime(time: string) {
  if (!time) return '-';
  return time.length === 5 ? time : time.slice(0, 5);
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ schedule, truck, isHighlighted, onEdit }) => {
  // 顧客ごとの背景色
  const getCustomerColor = (customerName?: string) => {
    if (!customerName) return 'bg-gray-50 border-gray-200';
    const colors = [
      'bg-red-50 border-red-200',
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-yellow-50 border-yellow-200',
      'bg-purple-50 border-purple-200',
      'bg-pink-50 border-pink-200',
      'bg-indigo-50 border-indigo-200',
      'bg-orange-50 border-orange-200',
      'bg-teal-50 border-teal-200',
      'bg-cyan-50 border-cyan-200',
      'bg-rose-50 border-rose-200',
      'bg-emerald-50 border-emerald-200',
      'bg-amber-50 border-amber-200',
      'bg-violet-50 border-violet-200',
      'bg-lime-50 border-lime-200',
      'bg-sky-50 border-sky-200',
      'bg-fuchsia-50 border-fuchsia-200',
      'bg-slate-50 border-slate-200',
      'bg-gray-50 border-gray-200',
      'bg-zinc-50 border-zinc-200',
      'bg-neutral-50 border-neutral-200',
      'bg-stone-50 border-stone-200'
    ];
    let hash = 0;
    for (let i = 0; i < customerName.length; i++) {
      hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const customerColor = getCustomerColor(schedule.customerName);

  return (
    <div
      id={`schedule-${schedule.id}`}
      className={`border rounded-lg p-4 ${customerColor} transition-all duration-300 ${isHighlighted ? 'ring-4 ring-blue-400 shadow-lg' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h5 
            data-case-heading
            tabIndex={-1}
            className="font-semibold text-gray-900 text-lg mb-1 scroll-mt-[var(--header-h,80px)]"
          >
            {schedule.customerName ? `${schedule.customerName}様` : '予約済み'}
            {schedule.destination && (
              <span className="block text-sm font-normal text-gray-600 mt-1">
                到着地: {schedule.destination}
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">{schedule.truckName || truck?.name}</span>
          </div>
          {schedule.contractStatus && (
            <div className="flex items-center gap-1 mb-2">
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                schedule.contractStatus === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                                    {schedule.contractStatus === 'confirmed' ? '✅ 確定' : '⏳ 未確定'}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {formatDate(schedule.date)}
          </div>
          <div className="text-sm font-medium text-blue-600 flex items-center gap-2">
            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="編集"
              >
                ✏️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
        <div>
          <p><strong>トラック:</strong> {schedule.truckName || truck?.name}</p>
          <p><strong>ナンバー:</strong> {truck?.plateNumber || '-'}</p>
          <p><strong>積載量:</strong> {truck?.capacityKg || '-'}kg</p>
        </div>
        <div>
          <p><strong>ステータス:</strong> {
            schedule.status === 'booked' ? '予約済み' :
            schedule.status === 'maintenance' ? '整備中' :
            '稼働中'
          }</p>
          <p><strong>契約状況:</strong> {
            schedule.contractStatus === 'confirmed' ? '確定済み' :
            schedule.contractStatus === 'estimate' ? '見積もり中' :
            '-'
          }</p>
        </div>
      </div>

      {/* 従業員情報 */}
      {schedule.assignedEmployees && schedule.assignedEmployees.length > 0 && (
        <div className="mb-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="font-bold text-blue-800 mb-2">担当従業員</div>
            <div className="space-y-1">
              {schedule.assignedEmployees.map((employee, idx) => (
                <div key={employee.id} className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600">👤</span>
                  <span className="font-medium">{employee.name}</span>
                  {employee.role && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {employee.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 荷物・ポイント情報 */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
        <div>
          {schedule.capacity && (
            <p><strong>荷物重量:</strong> <span className="text-blue-600 font-medium">{schedule.capacity.toLocaleString()}kg</span></p>
          )}
          {schedule.points && (
            <p><strong>ポイント:</strong> <span className="text-purple-600 font-medium">{schedule.points}pt</span></p>
          )}
        </div>
        <div>
          <p><strong>作業時間:</strong> {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</p>
          <p><strong>作業日:</strong> {formatDate(schedule.date)}</p>
        </div>
      </div>

      {/* 希望日（見積もり回答済みのみ） */}
      {schedule.contractStatus === 'estimate' && (
        <div className="mb-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-bold text-yellow-800 mb-1">希望日</div>
            <div>第1希望: {schedule.preferredDate1 || '-'}</div>
            <div>第2希望: {schedule.preferredDate2 || '-'}</div>
            <div>第3希望: {schedule.preferredDate3 || '-'}</div>
          </div>
        </div>
      )}

      {/* 場所情報 */}
      {(schedule.origin || schedule.destination) && (
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
          {schedule.origin && (
            <div>
              <p><strong>出発地:</strong> {schedule.origin}</p>
            </div>
          )}
          {schedule.destination && (
            <div>
              <p><strong>到着地:</strong> {schedule.destination}</p>
            </div>
          )}
        </div>
      )}

      {/* 支払情報 */}
      {(schedule.paymentMethod || schedule.paymentStatus) && (
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          <div>
            <p><strong>支払方法:</strong> {
              schedule.paymentMethod === 'cash' ? '現金' :
              schedule.paymentMethod === 'card' ? 'カード' :
              schedule.paymentMethod === 'transfer' ? '振込' :
              schedule.paymentMethod === 'invoice' ? '請求書' : '-'
            }</p>
            <p><strong>支払状況:</strong> {
              schedule.paymentStatus === 'paid' ? '支払済み' :
              schedule.paymentStatus === 'pending' ? '未払い' :
              schedule.paymentStatus === 'partial' ? '一部支払い' : '-'
            }</p>
          </div>
          <div>
            {schedule.paymentAmount && (
              <p><strong>支払金額:</strong> <span className="text-green-600 font-medium">¥{schedule.paymentAmount.toLocaleString()}</span></p>
            )}
            {schedule.paymentDueDate && (
              <p><strong>支払期限:</strong> {formatDate(schedule.paymentDueDate)}</p>
            )}
          </div>
        </div>
      )}

      {/* 選択オプション */}
      {schedule.selectedOptions && schedule.selectedOptions.length > 0 && (
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <p className="font-medium text-blue-800 mb-2">選択オプション</p>
            <div className="space-y-1">
              {schedule.selectedOptions.map((option, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>{option.name}</span>
                  {option.price && (
                    <span className="text-blue-600 font-medium">¥{option.price.toLocaleString()}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* フリーコメント */}
      {schedule.description && (
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>フリーコメント:</strong> {schedule.description}</p>
        </div>
      )}


    </div>
  );
};

export default CaseDetail; 