'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { QuoteHistory, TimeBandSurcharge, QuoteStatus } from '../types';
import { SourceType, normalizeSourceType, getSourceTypeLabel, isSourceTypeEditable } from '../lib/normalize';

export default function QuoteHistoryPage() {
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteHistory[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState<QuoteHistory | null>(null);
  const [editingSurcharges, setEditingSurcharges] = useState<TimeBandSurcharge[]>([]);

  useEffect(() => {
    const demoQuotes: QuoteHistory[] = [
      {
        id: '1',
        customerName: '田中太郎',
        requestDate: '2025-01-15',
        responseDate: '2025-01-16',
        amount: 45000,
        amountWithTax: 49500,
        status: '成約',
        items: ['シングルベッド', '冷蔵庫', 'テレビ'],
        fromAddress: '東京都渋谷区',
        toAddress: '東京都新宿区',
        moveDate: '2025-02-01',
        sourceType: 'syncmoving',
        isContracted: true,
        timeBandSurcharges: [
          { id: '1', start: '22:00', end: '05:00', kind: 'rate', value: 1.25 }
        ]
      }
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
    let filtered = quotes.filter(quote => {
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

  const addSurcharge = () => {
    const newSurcharge: TimeBandSurcharge = {
      id: Date.now().toString(),
      start: '22:00',
      end: '05:00',
      kind: 'rate',
      value: 1.25
    };
    setEditingSurcharges([...editingSurcharges, newSurcharge]);
  };

  const removeSurcharge = (id: string) => {
    setEditingSurcharges(editingSurcharges.filter(s => s.id !== id));
  };

  const updateSurcharge = (id: string, field: keyof TimeBandSurcharge, value: any) => {
    setEditingSurcharges(editingSurcharges.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

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

  const startEditing = (quote: QuoteHistory) => {
    setEditingQuote(quote);
    setEditingSurcharges([...quote.timeBandSurcharges]);
  };

  const saveQuote = () => {
    if (!editingQuote) return;
    
    const updatedQuote = {
      ...editingQuote,
      timeBandSurcharges: editingSurcharges,
      amountWithTax: calculateTotalWithTax(editingQuote.amount, editingSurcharges)
    };
    
    setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    setEditingQuote(null);
    setEditingSurcharges([]);
  };

  const cancelEditing = () => {
    setEditingQuote(null);
    setEditingSurcharges([]);
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

        <div className="grid gap-6">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{quote.customerName}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>依頼日: {quote.requestDate}</span>
                    <span>引越し日: {quote.moveDate}</span>
                    <span>回答日: {quote.responseDate}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quote.status === '成約' ? 'bg-green-100 text-green-800' :
                    quote.status === '見積中' ? 'bg-yellow-100 text-yellow-800' :
                    quote.status === '完了' || quote.status === '完了(自動)' ? 'bg-blue-100 text-blue-800' :
                    quote.status === 'キャンセル' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quote.isContracted}
                      onChange={() => toggleContracted(quote.id)}
                      disabled={quote.sourceType === 'syncmoving' && quote.isContracted}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">成約</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">住所</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">元:</span> {quote.fromAddress}<br />
                    <span className="font-medium">先:</span> {quote.toAddress}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">依頼元種別</h4>
                  <select
                    value={quote.sourceType}
                    disabled={!isSourceTypeEditable(quote.sourceType)}
                    onChange={(e) => {
                      setQuotes(quotes.map(q => 
                        q.id === quote.id ? { ...q, sourceType: e.target.value as SourceType } : q
                      ));
                    }}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      isSourceTypeEditable(quote.sourceType) 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                        : 'border-gray-200 bg-gray-100 text-gray-500'
                    }`}
                  >
                    <option value="syncmoving">SyncMoving</option>
                    <option value="suumo">スーモ</option>
                    <option value="外部">外部</option>
                    <option value="手動">手動登録</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">荷物</h4>
                <div className="flex flex-wrap gap-2">
                  {quote.items.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">金額</h4>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(quote.amountWithTax)} <span className="text-sm text-gray-500">(税込)</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">時間帯割増賃金</h4>
                {quote.timeBandSurcharges.length > 0 ? (
                  <div className="space-y-2">
                    {quote.timeBandSurcharges.map((surcharge) => (
                      <div key={surcharge.id} className="flex items-center space-x-2 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          {surcharge.start} - {surcharge.end}
                        </span>
                        <span className="text-gray-600">
                          {surcharge.kind === 'rate' ? `×${surcharge.value}` : `+${formatCurrency(surcharge.value)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">設定なし</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {editingQuote?.id === quote.id ? (
                  <>
                    <button
                      onClick={saveQuote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(quote)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      編集
                    </button>
                    
                    <select
                      value={quote.status}
                      onChange={(e) => updateStatus(quote.id, e.target.value as QuoteStatus)}
                      disabled={quote.sourceType === 'syncmoving' && quote.isContracted && quote.status !== 'キャンセル'}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="見積中">見積中</option>
                      <option value="回答済">回答済</option>
                      <option value="成約">成約</option>
                      <option value="不成約">不成約</option>
                      <option value="キャンセル">キャンセル</option>
                      <option value="完了">完了</option>
                      <option value="完了(自動)">完了(自動)</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {editingQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">時間帯割増賃金の編集</h3>
              
              <div className="space-y-4">
                {editingSurcharges.map((surcharge) => (
                  <div key={surcharge.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                        <input
                          type="time"
                          value={surcharge.start}
                          onChange={(e) => updateSurcharge(surcharge.id, 'start', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                        <input
                          type="time"
                          value={surcharge.end}
                          onChange={(e) => updateSurcharge(surcharge.id, 'end', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                        <select
                          value={surcharge.kind}
                          onChange={(e) => updateSurcharge(surcharge.id, 'kind', e.target.value as 'rate' | 'amount')}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        >
                          <option value="rate">率(×1.25)</option>
                          <option value="amount">定額(+3000円)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">値</label>
                        <input
                          type="number"
                          step={surcharge.kind === 'rate' ? 0.01 : 1}
                          value={surcharge.value}
                          onChange={(e) => updateSurcharge(surcharge.id, 'value', parseFloat(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeSurcharge(surcharge.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      削除
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addSurcharge}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  時間帯割増を追加
                </button>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={saveQuote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
