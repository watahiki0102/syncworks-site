'use client';

import React, { useEffect, useRef } from 'react';
import { CaseDetail } from '../../types/case';
import { STATUS_META, SOURCE_META } from '../../constants/case';
import { formatPriceJPY, formatDateYMD, formatHHmm } from '../../utils/format';

interface CaseDetailPanelProps {
  open: boolean;
  onClose: () => void;
  caseDetail: CaseDetail | null;
  onEdit: (caseId: string) => void;
}

export default function CaseDetailPanel({
  open,
  onClose,
  caseDetail,
  onEdit
}: CaseDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // スクロール固定
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  // パネルが開いたときに最初のフォーカス可能要素にフォーカス
  useEffect(() => {
    if (open && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [open]);

  // 外側クリックで閉じる
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open || !caseDetail) return null;

  const { 
    id, 
    customerName, 
    customerPhone, 
    sourceType, 
    preferredDate, 
    confirmedDate, 
    arrivalAddress, 
    options, 
    priceTaxIncluded, 
    truckName, 
    assignedEmployees, 
    startTime, 
    endTime, 
    contractStatus 
  } = caseDetail;

  const statusMeta = STATUS_META[contractStatus];
  const sourceMeta = sourceType ? SOURCE_META[sourceType] : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div 
        ref={panelRef}
        className="w-full max-w-md h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {customerName}
            </h2>
            {statusMeta && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusMeta.colorClass}`}>
                {statusMeta.label}
              </span>
            )}
          </div>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 本文 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 依頼元種別 */}
          {sourceMeta && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">依頼元種別</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sourceMeta.badgeClass}`}>
                {sourceMeta.label}
              </span>
            </div>
          )}

          {/* 希望日 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">希望日</h3>
            <p className="text-sm text-gray-900">
              {preferredDate ? formatDateYMD(preferredDate) : '希望日なし'}
            </p>
          </div>

          {/* 確定日 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">確定日</h3>
            <p className="text-sm text-gray-900">
              {formatDateYMD(confirmedDate)}
            </p>
          </div>

          {/* 到着地 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">到着地</h3>
            <p className="text-sm text-gray-900 break-words">
              {arrivalAddress}
            </p>
          </div>

          {/* 作業オプション */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">作業オプション</h3>
            <p className="text-sm text-gray-900">
              {options && options.length > 0 ? options.join(', ') : 'なし'}
            </p>
          </div>

          {/* 金額 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">金額</h3>
            <p className="text-sm text-gray-900">
              {formatPriceJPY(priceTaxIncluded)}
            </p>
          </div>

          {/* 割当トラック */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">割当トラック</h3>
            <p className="text-sm text-gray-900">
              {truckName || '未割当'}
            </p>
          </div>

          {/* 従業員 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">従業員</h3>
            <p className="text-sm text-gray-900">
              {assignedEmployees && assignedEmployees.length > 0 
                ? assignedEmployees.map(emp => emp.name).join(', ')
                : '未割当'
              }
            </p>
          </div>

          {/* 時間帯 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">時間帯</h3>
            <p className="text-sm text-gray-900">
              {formatHHmm(startTime)} – {formatHHmm(endTime)}
            </p>
          </div>

          {/* 顧客電話番号（オプション） */}
          {customerPhone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">顧客電話番号</h3>
              <p className="text-sm text-gray-900">
                {customerPhone}
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            閉じる
          </button>
          <button
            ref={lastFocusableRef}
            onClick={() => onEdit(id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            編集
          </button>
        </div>
      </div>
    </div>
  );
}
