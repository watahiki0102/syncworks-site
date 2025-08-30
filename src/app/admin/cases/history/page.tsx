'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { QuoteHistory, TimeBandSurcharge, QuoteStatus } from '../types';
import { normalizeSourceType, getSourceTypeLabel, isSourceTypeEditable } from '../lib/normalize';
import { generateTestQuote } from '@/constants/testData';

export default function QuoteHistoryPage() {
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteHistory[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState<QuoteHistory | null>(null);
  const [editingSurcharges, setEditingSurcharges] = useState<TimeBandSurcharge[]>([]);
  const [viewingQuote, setViewingQuote] = useState<QuoteHistory | null>(null);

  useEffect(() => {
    // 共通テストデータから見積もりデータを生成
    const demoQuotes: QuoteHistory[] = [
      generateTestQuote(0, 0, 0, 0),
      generateTestQuote(1, 1, 1, 1),
      generateTestQuote(2, 2, 2, 2),
      generateTestQuote(3, 3, 3, 3),
      generateTestQuote(4, 4, 4, 4)
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
        return { ...quote, status: '完了(自動)' as QuoteStatus };
      }
      return quote;
    });

    setQuotes(updatedQuotes);
  }, []);

  useEffect(() => {
    const filtered = quotes.filter(quote => {
      if (!showCompleted && ['完了', '完了(自動)', 'キャンセル', '不成約'].includes(quote.status)) {
        return false;
      }
      
      if (searchTerm && !quote.customerName.includes(searchTerm)) {
        return false;
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

  const toggleContracted = (quoteId: string) => {
    setQuotes(quotes.map(q => 
      q.id === quoteId ? { ...q, isContracted: !q.isContracted } : q
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">見積もり回答履歴</h1>
          
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
              placeholder="顧客名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-3">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quote.customerName}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>引越し日: {quote.moveDate}</span>
                    <span>回答日: {quote.responseDate}</span>
                    {quote.isReQuote && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        再見積もり
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === '成約' ? 'bg-green-100 text-green-800' :
                    quote.status === '見積中' ? 'bg-yellow-100 text-yellow-800' :
                    quote.status === '完了' || quote.status === '完了(自動)' ? 'bg-blue-100 text-blue-800' :
                    quote.status === 'キャンセル' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                  
                  <div className="text-sm font-semibold text-blue-600">
                    {formatCurrency(quote.amountWithTax)}
                  </div>
                  
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={quote.isContracted}
                      onChange={() => toggleContracted(quote.id)}
                      disabled={quote.sourceType === 'syncmoving' && quote.isContracted}
                      className="rounded border-gray-300 text-xs"
                    />
                    <span className="text-xs text-gray-700">成約</span>
                  </label>

                  <button
                    onClick={() => setViewingQuote(quote)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                  >
                    詳細
                  </button>
                  
                  {isSourceTypeEditable(quote.sourceType) && (
                    <button
                      onClick={() => window.location.href = `/admin/cases/edit/${quote.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      編集
                    </button>
                  )}
                  
                  <select
                    value={quote.status}
                    onChange={(e) => updateStatus(quote.id, e.target.value as QuoteStatus)}
                    disabled={quote.sourceType === 'syncmoving' && quote.isContracted && quote.status !== 'キャンセル'}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="見積中">見積中</option>
                    <option value="回答済">回答済</option>
                    <option value="成約">成約</option>
                    <option value="不成約">不成約</option>
                    <option value="キャンセル">キャンセル</option>
                    <option value="完了">完了</option>
                    <option value="完了(自動)">完了(自動)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 詳細表示モーダル（閲覧のみ） */}
        {viewingQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">見積もり詳細 - {viewingQuote.customerName}</h3>
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
                      <div><span className="font-medium text-purple-600">再見積もり</span></div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">金額情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">基本金額:</span> {formatCurrency(viewingQuote.amount)}</div>
                    <div><span className="font-medium">税込金額:</span> <span className="text-lg font-semibold text-blue-600">{formatCurrency(viewingQuote.amountWithTax)}</span></div>
                    <div><span className="font-medium">成約状況:</span> {viewingQuote.isContracted ? '成約済み' : '未成約'}</div>
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
