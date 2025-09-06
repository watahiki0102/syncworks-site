'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { QuoteHistory, TimeBandSurcharge, QuoteStatus } from '../types';
import { normalizeSourceType, getSourceTypeLabel, getManagementNumber, isSourceTypeEditable } from '../lib/normalize';
import { generateTestQuote } from '@/constants/testData';

export default function QuoteHistoryPage() {
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteHistory[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState<QuoteHistory | null>(null);
  const [editingSurcharges, setEditingSurcharges] = useState<TimeBandSurcharge[]>([]);
  const [viewingQuote, setViewingQuote] = useState<QuoteHistory | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    // 共通テストデータから見積データを生成（6つの固定データ）
    const demoQuotes: QuoteHistory[] = [
      generateTestQuote(0, 0, 0, 0),
      generateTestQuote(1, 1, 1, 1),
      generateTestQuote(2, 2, 2, 2),
      generateTestQuote(3, 3, 3, 3),
      generateTestQuote(4, 4, 4, 4),
      generateTestQuote(5, 5, 5, 5)
    ];

    const normalizedQuotes = demoQuotes.map(quote => ({
      ...quote,
      sourceType: normalizeSourceType(quote.sourceType)
    }));

    const today = new Date();
    const updatedQuotes = normalizedQuotes.map(quote => {
      const moveDate = new Date(quote.moveDate);
      const nextDay = new Date(moveDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      if (nextDay <= today && quote.status !== '成約' && quote.status !== 'キャンセル' && quote.status !== '不成約') {
        return { ...quote, status: '完了' as QuoteStatus };
      }
      return quote;
    });

    setQuotes(updatedQuotes);
  }, []);

  useEffect(() => {
    const filtered = quotes.filter(quote => {
      if (!showCompleted && ['完了', 'キャンセル', '不成約'].includes(quote.status)) {
        return false;
      }
      
      if (searchTerm) {
        const managementNumber = getManagementNumber(quote.sourceType, quote.id);
        const matchesCustomerName = quote.customerName.includes(searchTerm);
        const matchesManagementNumber = managementNumber.includes(searchTerm);
        
        if (!matchesCustomerName && !matchesManagementNumber) {
          return false;
        }
      }
      
      return true;
    });

    setFilteredQuotes(filtered);
  }, [quotes, showCompleted, searchTerm]);



  const calculateTotalWithTax = (baseAmount: number, surcharges: TimeBandSurcharge[]) => {
    let total = baseAmount;
    
    surcharges.forEach(surcharge => {
      if (surcharge.kind === 'rate') {
        total *= surcharge.value;
      } else {
        total += surcharge.value;
      }
    });
    
    total *= 1.1;
    
    return Math.round(total);
  };



  const updateStatus = (quoteId: string, newStatus: QuoteStatus) => {
    setQuotes(quotes.map(q => 
      q.id === quoteId ? { ...q, status: newStatus } : q
    ));
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">見積回答履歴</h1>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showCompleted" className="text-sm text-gray-700">
                完了も含めて表示
              </label>
            </div>
            
            <input
              type="text"
              placeholder="顧客名・管理Noで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                  引越し日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  回答日
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                    {getManagementNumber(quote.sourceType, quote.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-block w-24 px-2 py-1 text-center text-gray-900"
                      style={{
                        fontSize: quote.sourceType === '外部' 
                          ? `clamp(0.5rem, ${24 / Math.max(getSourceTypeLabel(quote.sourceType).length, 1)}rem, 0.75rem)`
                          : '0.75rem'
                      }}
                    >
                      {getSourceTypeLabel(quote.sourceType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <span
                      style={{
                        fontSize: `clamp(0.625rem, ${32 / Math.max(quote.customerName.length, 1)}rem, 0.875rem)`
                      }}
                    >
                      {quote.customerName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.moveDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.responseDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {formatCurrency(quote.amountWithTax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-xs font-medium ${
                        quote.status === '成約' ? 'bg-green-100 text-green-800' :
                        quote.status === '見積中' ? 'bg-yellow-100 text-yellow-800' :
                        quote.status === '再見積' ? 'bg-purple-100 text-purple-800' :
                        quote.status === '完了' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'キャンセル' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                      {quote.sourceType !== 'syncmoving' && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === quote.id ? null : quote.id);
                            }}
                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openDropdown === quote.id && (
                            <div className="absolute -left-16 top-full mt-1 z-50">
                              <div className="bg-white border border-gray-300 rounded-md shadow-xl py-1 w-16 max-h-48 overflow-y-auto">
                                {['見積中', '回答済', '再見積', '成約', '不成約', 'キャンセル', '完了'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateStatus(quote.id, status as QuoteStatus);
                                      setOpenDropdown(null);
                                    }}
                                    className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 transition-colors ${
                                      quote.status === status ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setViewingQuote(quote)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      詳細
                    </button>
                    {isSourceTypeEditable(quote.sourceType) && (
                      <button
                        onClick={() => window.location.href = `/admin/cases/edit/${quote.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 詳細表示モーダル（閲覧のみ） */}
        {viewingQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">見積詳細 - {viewingQuote.customerName}</h3>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">依頼日:</span> {viewingQuote.requestDate}</div>
                    <div><span className="font-medium">回答日:</span> {viewingQuote.responseDate}</div>
                    <div><span className="font-medium">引越し日:</span> {viewingQuote.moveDate}</div>
                    <div><span className="font-medium">ステータス:</span> {viewingQuote.status}</div>
                    <div><span className="font-medium">依頼元:</span> {getSourceTypeLabel(viewingQuote.sourceType)}</div>
                    {viewingQuote.isReQuote && (
                      <div><span className="font-medium text-purple-600">再見積</span></div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">金額情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">基本金額:</span> {formatCurrency(viewingQuote.amount)}</div>
                    <div><span className="font-medium">税込金額:</span> <span className="text-lg font-semibold text-blue-600">{formatCurrency(viewingQuote.amountWithTax)}</span></div>
                    <div><span className="font-medium">成約状況:</span> {viewingQuote.status === '成約' ? '成約済み' : '未成約'}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">住所</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">引越し元:</span>
                    <p className="text-gray-700">{viewingQuote.fromAddress}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">引越し先:</span>
                    <p className="text-gray-700">{viewingQuote.toAddress}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">荷物一覧</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingQuote.items.map((item, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setViewingQuote(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
