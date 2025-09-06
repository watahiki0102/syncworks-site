'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UnifiedCase, UnifiedCaseFilter, STATUS_FILTERS, STATUS_STYLES, PRIORITY_STYLES } from '../types/unified';
import { generateUnifiedTestData, filterUnifiedCases, sortUnifiedCases } from '../lib/unifiedData';
import { getSourceTypeLabel, getManagementNumber } from '../lib/normalize';
import { formatCurrency } from '@/utils/format';

export default function UnifiedCasesPage() {
  const [cases, setCases] = useState<UnifiedCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<UnifiedCase[]>([]);
  const [filter, setFilter] = useState<UnifiedCaseFilter>({
    status: 'all',
    type: 'all',
    sourceType: 'all',
    searchTerm: ''
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'pending', 'answered', '再見積', '成約', '不成約', 'キャンセル'
  ]);
  const [viewingCase, setViewingCase] = useState<UnifiedCase | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(100);

  // ドロップダウンの外側をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    // 統合テストデータを生成
    const unifiedData = generateUnifiedTestData();
    setCases(unifiedData);
  }, []);

  useEffect(() => {
    // フィルタリングとソート
    const filtered = cases.filter(caseItem => {
      // ステータスチェックボックスフィルター
      if (!selectedStatuses.includes(caseItem.status)) {
        return false;
      }

      // タイプフィルター
      if (filter.type !== 'all' && caseItem.type !== filter.type) {
        return false;
      }

      // 仲介元フィルター
      if (filter.sourceType !== 'all' && caseItem.sourceType !== filter.sourceType) {
        return false;
      }

      // 検索キーワードフィルター
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        const managementNumber = getManagementNumber(caseItem.sourceType, caseItem.id);
        
        const matchesCustomerName = caseItem.customerName.toLowerCase().includes(searchTerm);
        const matchesManagementNumber = managementNumber.toLowerCase().includes(searchTerm);
        const matchesAddress = caseItem.summary?.fromAddress?.toLowerCase().includes(searchTerm) ||
                             caseItem.summary?.toAddress?.toLowerCase().includes(searchTerm);
        
        if (!matchesCustomerName && !matchesManagementNumber && !matchesAddress) {
          return false;
        }
      }

      return true;
    });

    const sorted = sortUnifiedCases(filtered);
    setFilteredCases(sorted);
    
    // フィルターが変更されたら最初のページに戻る
    setCurrentPage(1);
  }, [cases, filter, selectedStatuses]);

  // ページネーション用の計算
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  /**
   * ステータスチェックボックスの操作
   */
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  /**
   * 全選択
   */
  const handleSelectAll = () => {
    const allStatuses = ['pending', 'answered', '再見積', '成約', '不成約', 'キャンセル'];
    setSelectedStatuses(allStatuses);
  };

  /**
   * 全解除
   */
  const handleDeselectAll = () => {
    setSelectedStatuses([]);
  };

  /**
   * ステータス更新処理
   */
  const updateStatus = (caseId: string, newStatus: string) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id === caseId 
          ? { ...caseItem, status: newStatus as any }
          : caseItem
      )
    );
  };

  /**
   * 見積回答処理 (依頼データ用)
   */
  const handleQuoteResponse = (caseItem: UnifiedCase) => {
    // 実際の実装では見積回答フォームを表示
    console.log('見積回答:', caseItem);
    alert(`${caseItem.customerName}様への見積回答を開始します`);
  };

  /**
   * 案件詳細表示
   */
  const handleViewDetails = (caseItem: UnifiedCase) => {
    setViewingCase(caseItem);
  };

  /**
   * 期限・日付の表示
   */
  const getDateDisplay = (caseItem: UnifiedCase) => {
    if (caseItem.type === 'request') {
      return caseItem.deadline ? `期限: ${caseItem.deadline}` : '';
    } else {
      return caseItem.responseDate ? `回答: ${caseItem.responseDate}` : '';
    }
  };

  /**
   * 金額の表示
   */
  const getAmountDisplay = (caseItem: UnifiedCase) => {
    if (caseItem.type === 'history' && caseItem.amountWithTax) {
      return formatCurrency(caseItem.amountWithTax);
    }
    return '-';
  };

  /**
   * 操作ボタンの表示
   */
  const renderActionButtons = (caseItem: UnifiedCase) => {
    if (caseItem.type === 'request') {
      if (caseItem.status === 'pending') {
        return (
          <button
            onClick={() => handleQuoteResponse(caseItem)}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            回答する
          </button>
        );
      } else {
        return (
          <button
            onClick={() => handleViewDetails(caseItem)}
            className="text-blue-600 hover:text-blue-800"
          >
            詳細
          </button>
        );
      }
    } else {
      return (
        <button
          onClick={() => handleViewDetails(caseItem)}
          className="text-blue-600 hover:text-blue-800"
        >
          詳細
        </button>
      );
    }
  };

  /**
   * ステータス変更ドロップダウンの表示
   */
  const renderStatusDropdown = (caseItem: UnifiedCase) => {
    // SyncMoving の履歴データは編集不可
    if (caseItem.type === 'history' && caseItem.sourceType === 'syncmoving') {
      const statusStyle = STATUS_STYLES[caseItem.status];
      return (
        <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
          {statusStyle.label}
        </span>
      );
    }

    // 依頼データのステータス選択肢
    const requestStatuses = ['pending', 'answered'];
    
    // 履歴データのステータス選択肢（成約後のキャンセル修正を考慮）
    let historyStatuses: string[] = [];
    if (caseItem.status === '成約') {
      // 成約の場合は、キャンセルに変更可能
      historyStatuses = ['成約', 'キャンセル'];
    } else if (caseItem.status === 'キャンセル') {
      // キャンセルの場合は、成約に戻すことも可能
      historyStatuses = ['成約', 'キャンセル'];
    } else {
      // その他の場合は、キャンセル以外の選択肢
      historyStatuses = ['answered', '再見積', '成約', '不成約'];
    }
    
    const availableStatuses = caseItem.type === 'request' ? requestStatuses : historyStatuses;
    const statusStyle = STATUS_STYLES[caseItem.status];

    return (
      <div className="flex items-center space-x-1">
        <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
          {statusStyle.label}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenDropdown(openDropdown === caseItem.id ? null : caseItem.id);
            }}
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === caseItem.id && (
            <div className="absolute -left-20 top-full mt-1 z-50">
              <div className="bg-white border border-gray-300 rounded-md shadow-xl py-1 w-20 max-h-48 overflow-y-auto">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateStatus(caseItem.id, status);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 transition-colors whitespace-nowrap ${
                      caseItem.status === status ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {STATUS_STYLES[status as keyof typeof STATUS_STYLES]?.label || status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">案件一覧</h1>
          
          <div className="space-y-4 mb-6">
            {/* ステータスフィルター（チェックボックス）と検索 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-6">
                {/* 左側：ステータス絞り込み */}
                <div className="flex-shrink-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-medium text-gray-700">表示ステータス絞込</h3>
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          onClick={handleSelectAll}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          すべて選択
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={handleDeselectAll}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          すべて解除
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
           {[
             'pending', 'answered', '再見積', '成約', '不成約', 'キャンセル'
           ].map((statusValue) => {
             const statusStyle = STATUS_STYLES[statusValue as keyof typeof STATUS_STYLES];
             return (
               <label key={statusValue} className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={selectedStatuses.includes(statusValue)}
                   onChange={() => handleStatusToggle(statusValue)}
                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
                 <StatusBadge
                   status={statusValue}
                   bgColor={statusStyle.bgColor}
                   textColor={statusStyle.textColor}
                   label={statusStyle.label}
                 />
               </label>
             );
           })}
                  </div>
                </div>
                
                {/* 右側：検索絞り込み */}
                <div className="flex-1 ml-8 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700">絞込検索</h3>
                  </div>
                  <div className="flex items-center justify-center flex-1 mt-2">
                    <input
                      type="text"
                      placeholder="顧客名・管理Noで検索..."
                      value={filter.searchTerm}
                      onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 件数表示 */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            {totalPages > 1 ? (
              <>
                <span className="font-medium">該当{filteredCases.length}件</span>
                <span className="text-gray-500 ml-1">
                  （全{cases.length}件）
                </span>
              </>
            ) : (
              <>
                <span className="font-medium">{filteredCases.length}件表示</span>
                <span className="text-gray-500 ml-1">
                  （全{filteredCases.length}件中）
                </span>
              </>
            )}
          </p>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <span>{startIndex + 1}-{Math.min(endIndex, filteredCases.length)}件目</span>
              <span>ページ {currentPage} / {totalPages}</span>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  管理No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  仲介元
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  引越し日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期限/回答日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  金額（税込）
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-50 divide-y divide-gray-200">
              {paginatedCases.map((caseItem) => (
                <tr key={caseItem.id} className="bg-white hover:bg-gray-100">
                  <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                    {getManagementNumber(caseItem.sourceType, caseItem.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-block w-24 px-2 py-1 text-center text-gray-900"
                      style={{
                        fontSize: caseItem.sourceType === '外部' 
                          ? `clamp(0.5rem, ${24 / Math.max(getSourceTypeLabel(caseItem.sourceType).length, 1)}rem, 0.75rem)`
                          : '0.75rem'
                      }}
                    >
                      {getSourceTypeLabel(caseItem.sourceType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <span
                      style={{
                        fontSize: `clamp(0.625rem, ${32 / Math.max(caseItem.customerName.length, 1)}rem, 0.875rem)`
                      }}
                    >
                      {caseItem.customerName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.moveDate} {caseItem.moveTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDateDisplay(caseItem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {getAmountDisplay(caseItem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusDropdown(caseItem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {renderActionButtons(caseItem)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              条件に一致する案件がありません
            </div>
          )}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* 前のページ */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                前へ
              </button>

              {/* ページ番号 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 最初、最後、現在ページの前後1ページを表示
                const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                
                if (!showPage) {
                  // 省略記号を表示
                  if ((page === 2 && currentPage > 4) || (page === totalPages - 1 && currentPage < totalPages - 3)) {
                    return (
                      <span key={page} className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* 次のページ */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                次へ
              </button>
            </nav>
          </div>
        )}

        {/* 詳細表示モーダル */}
        {viewingCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">案件詳細 - {viewingCase.customerName}</h3>
                <button
                  onClick={() => setViewingCase(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">顧客名:</span> {viewingCase.customerName}</div>
                    <div><span className="font-medium">引越し日:</span> {viewingCase.moveDate}</div>
                    <div><span className="font-medium">ステータス:</span> {STATUS_STYLES[viewingCase.status].label}</div>
                    <div><span className="font-medium">仲介元:</span> {getSourceTypeLabel(viewingCase.sourceType)}</div>
                    {viewingCase.type === 'request' && viewingCase.priority && (
                      <div><span className="font-medium">優先度:</span> {PRIORITY_STYLES[viewingCase.priority].label}</div>
                    )}
                    {viewingCase.amountWithTax && (
                      <div><span className="font-medium">金額:</span> {formatCurrency(viewingCase.amountWithTax)}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-4">引越し詳細</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">引越し元:</span> {viewingCase.summary?.fromAddress}</div>
                    <div><span className="font-medium">引越し先:</span> {viewingCase.summary?.toAddress}</div>
                    <div><span className="font-medium">荷物:</span> {viewingCase.summary?.items?.join(', ')}</div>
                    <div><span className="font-medium">ポイント:</span> {viewingCase.summary?.totalPoints}pt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
