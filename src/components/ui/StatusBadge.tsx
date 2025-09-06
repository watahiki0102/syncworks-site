import { UnifiedCase, STATUS_STYLES } from '@/app/admin/cases/types/unified';

// ケースアイテム用のStatusBadge
interface CaseStatusBadgeProps {
  caseItem: UnifiedCase;
  showDropdown?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

// シンプルなStatusBadge（フィルタリング用）
interface SimpleStatusBadgeProps {
  status: string;
  bgColor: string;
  textColor: string;
  label: string;
}

type StatusBadgeProps = CaseStatusBadgeProps | SimpleStatusBadgeProps;

// 型ガード関数
function isCaseStatusBadge(props: StatusBadgeProps): props is CaseStatusBadgeProps {
  return 'caseItem' in props;
}

export function StatusBadge(props: StatusBadgeProps) {
  // シンプルなバッジの場合（フィルタリング用）
  if (!isCaseStatusBadge(props)) {
    const { status, bgColor, textColor, label } = props;
    return (
      <span className={`inline-flex items-center justify-center min-w-20 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {label}
      </span>
    );
  }

  // ケースアイテムバッジの場合
  const { caseItem, showDropdown = false, onStatusChange } = props;
  // エラーハンドリング
  if (!caseItem || !caseItem.status) {
    return (
      <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        -
      </span>
    );
  }

  const statusStyle = STATUS_STYLES[caseItem.status];
  
  // ステータススタイルが見つからない場合のフォールバック
  if (!statusStyle) {
    return (
      <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {caseItem.status}
      </span>
    );
  }

  // プルダウンなしの場合（支払対象一覧用）
  if (!showDropdown) {
    return (
      <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
        {statusStyle.label}
      </span>
    );
  }

  // SyncMoving の履歴データは編集不可（案件一覧用）
  if (caseItem.type === 'history' && caseItem.sourceType === 'syncmoving') {
    return (
      <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
        {statusStyle.label}
      </span>
    );
  }

  // ドロップダウン付きの場合（案件一覧用）
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          // ドロップダウン処理は親コンポーネントで実装
        }}
        className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor} hover:opacity-80 transition-opacity`}
      >
        {statusStyle.label}
      </button>
    </div>
  );
}