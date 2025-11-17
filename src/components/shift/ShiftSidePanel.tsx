import { Employee, EmployeeMonthlySummary, EmployeeShift } from '@/types/employee';
import { EmployeeSummaryPanel } from './EmployeeSummaryPanel';
import { ClipboardPanel } from './ClipboardPanel';

type SidePanelTab = 'employeeSummary' | 'clipboard' | null;
type ClipboardMode = 'copy' | 'paste' | 'none';

interface ShiftSidePanelProps {
  showEmployeeSummary: boolean;
  showClipboard: boolean;
  activeSidePanelTab: SidePanelTab;
  monthlySummary: EmployeeMonthlySummary[];
  totalStats: {
    totalWorkingDays: number;
    totalWorkingTime: string;
    workingEmployeeCount: number;
    activeEmployeeCount: number;
  };
  clipboardMode: ClipboardMode;
  selectedShifts: EmployeeShift[];
  copiedShifts: EmployeeShift[];
  pendingPasteDates: string[];
  employees: Employee[];
  onActiveSidePanelTabChange: (tab: SidePanelTab) => void;
  onClose: () => void;
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
 * シフト管理サイドパネル - 従業員集計とクリップボードを統合
 */
export function ShiftSidePanel({
  showEmployeeSummary,
  showClipboard,
  activeSidePanelTab,
  monthlySummary,
  totalStats,
  clipboardMode,
  selectedShifts,
  copiedShifts,
  pendingPasteDates,
  employees,
  onActiveSidePanelTabChange,
  onClose,
  onStartCopyMode,
  onStartPasteMode,
  onExecuteCopy,
  onExecutePaste,
  onRemoveSelectedShift,
  onClearSelectedShifts,
  onClearPendingPasteDates,
  onClearCopiedShifts,
}: ShiftSidePanelProps) {
  return (
    <div className="fixed top-0 right-0 w-[25%] h-full bg-white border-l border-gray-300 shadow-lg z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* ヘッダー - タブ切り替え */}
        <div className="flex border-b border-gray-200">
          {showEmployeeSummary && (
            <button
              onClick={() => onActiveSidePanelTabChange('employeeSummary')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSidePanelTab === 'employeeSummary'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg">📊</span>
              従業員集計
            </button>
          )}
          {showClipboard && (
            <button
              onClick={() => onActiveSidePanelTabChange('clipboard')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSidePanelTab === 'clipboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg">📋</span>
              クリップボード
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSidePanelTab === 'employeeSummary' && (
            <EmployeeSummaryPanel
              monthlySummary={monthlySummary}
              totalStats={totalStats}
            />
          )}

          {activeSidePanelTab === 'clipboard' && (
            <ClipboardPanel
              clipboardMode={clipboardMode}
              selectedShifts={selectedShifts}
              copiedShifts={copiedShifts}
              pendingPasteDates={pendingPasteDates}
              employees={employees}
              onStartCopyMode={onStartCopyMode}
              onStartPasteMode={onStartPasteMode}
              onExecuteCopy={onExecuteCopy}
              onExecutePaste={onExecutePaste}
              onRemoveSelectedShift={onRemoveSelectedShift}
              onClearSelectedShifts={onClearSelectedShifts}
              onClearPendingPasteDates={onClearPendingPasteDates}
              onClearCopiedShifts={onClearCopiedShifts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
