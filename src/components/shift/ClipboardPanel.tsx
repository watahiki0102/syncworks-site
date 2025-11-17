import { Employee, EmployeeShift } from '@/types/employee';

type ClipboardMode = 'copy' | 'paste' | 'none';

interface ClipboardPanelProps {
  clipboardMode: ClipboardMode;
  selectedShifts: EmployeeShift[];
  copiedShifts: EmployeeShift[];
  pendingPasteDates: string[];
  employees: Employee[];
  onStartCopyMode: () => void;
  onStartPasteMode: () => void;
  onExecuteCopy: () => void;
  onExecutePaste: () => void;
  onRemoveSelectedShift: (shiftId: string) => void;
  onClearSelectedShifts: () => void;
  onClearPendingPasteDates: () => void;
  onClearCopiedShifts: () => void;
}

/**
 * クリップボードパネル
 */
export function ClipboardPanel({
  clipboardMode,
  selectedShifts,
  copiedShifts,
  pendingPasteDates,
  employees,
  onStartCopyMode,
  onStartPasteMode,
  onExecuteCopy,
  onExecutePaste,
  onRemoveSelectedShift,
  onClearSelectedShifts,
  onClearPendingPasteDates,
  onClearCopiedShifts,
}: ClipboardPanelProps) {
  return (
    <div className="space-y-4">
      {/* モード選択 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onStartCopyMode}
          className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            clipboardMode === 'copy'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 コピー
        </button>

        <button
          onClick={onStartPasteMode}
          disabled={copiedShifts.length === 0}
          className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            clipboardMode === 'paste'
              ? 'bg-green-600 text-white'
              : copiedShifts.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📌 貼り付け
        </button>
      </div>

      {/* コピーモードの内容 */}
      {clipboardMode === 'copy' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-blue-900">
              {selectedShifts.length > 0 ? `選択中: ${selectedShifts.length}件` : 'コピーするシフトを選択してください'}
            </div>
            {selectedShifts.length > 0 && (
              <button
                onClick={onClearSelectedShifts}
                className="text-blue-700 hover:text-blue-900 text-sm underline font-medium"
              >
                すべてクリア
              </button>
            )}
          </div>

          {selectedShifts.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto space-y-2 mb-3">
                {selectedShifts.map(shift => {
                  const employee = employees.find(emp => emp.id === shift.employeeId);
                  return (
                    <div key={shift.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-200 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {employee?.name || '不明な従業員'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveSelectedShift(shift.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={onExecuteCopy}
                className="w-full py-2.5 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                コピー実行
              </button>
            </>
          ) : (
            <div className="text-blue-800 text-sm font-medium">
              カレンダー上のシフトをクリックして選択してください
            </div>
          )}
        </div>
      )}

      {/* ペーストモードの内容 */}
      {clipboardMode === 'paste' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-green-900">
              {pendingPasteDates.length > 0 ? `選択中: ${pendingPasteDates.length}日` : '貼り付け先の日付を選択してください'}
            </div>
            {pendingPasteDates.length > 0 && (
              <button
                onClick={onClearPendingPasteDates}
                className="text-green-700 hover:text-green-900 text-sm underline font-medium"
              >
                すべてクリア
              </button>
            )}
          </div>

          {pendingPasteDates.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto space-y-2 mb-3">
                {pendingPasteDates.map(date => (
                  <div key={date} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </span>
                    <button
                      onClick={() => {
                        // 個別削除の実装が必要な場合はonClearPendingPasteDatesに日付を渡す
                        onClearPendingPasteDates();
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={onExecutePaste}
                className="w-full py-2.5 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                貼り付け実行
              </button>
            </>
          ) : (
            <div className="text-green-800 text-sm font-medium">
              カレンダー上の日付をクリックして選択してください（複数選択可）
            </div>
          )}
        </div>
      )}

      {/* コピー済みシフト表示（コピーモード以外の時で、かつコピー済みシフトがある場合のみ表示） */}
      {clipboardMode !== 'copy' && copiedShifts.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-gray-900">
              コピー済み
            </div>
            <button
              onClick={onClearCopiedShifts}
              className="text-gray-700 hover:text-gray-900 text-sm underline font-medium"
            >
              クリア
            </button>
          </div>

          <div className="text-gray-700 mb-2 font-medium">
            {copiedShifts.length}件のシフト
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {copiedShifts.map(shift => {
              const employee = employees.find(emp => emp.id === shift.employeeId);
              return (
                <div key={shift.id} className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                  <div className="text-sm font-medium text-gray-900">
                    {employee?.name || '不明な従業員'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(shift.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {shift.startTime}-{shift.endTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
