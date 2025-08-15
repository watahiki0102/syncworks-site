'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { QuoteRequest, TruckAvailability } from '../types';
import { SourceType, normalizeSourceType, getSourceTypeLabel } from '../lib/normalize';

type ResponseStep = 'content' | 'truck' | 'complete';

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [responseStep, setResponseStep] = useState<ResponseStep>('content');
  const [truckAvailability, setTruckAvailability] = useState<TruckAvailability | null>(null);

  useEffect(() => {
    const demoRequests: QuoteRequest[] = [
      {
        id: '1',
        customerName: '田中太郎',
        requestDate: '2025-01-15',
        deadline: '2025-01-17',
        summary: {
          moveDate: '2025-02-01',
          moveTime: '午前中',
          fromAddress: '東京都渋谷区神南1-1-1',
          toAddress: '東京都新宿区西新宿2-2-2',
          items: ['シングルベッド', '冷蔵庫', 'テレビ', '洗濯機'],
          totalPoints: 12
        },
        status: 'pending',
        priority: 'high',
        sourceType: 'syncmoving'
      },
      {
        id: '2',
        customerName: '佐藤花子',
        requestDate: '2025-01-14',
        deadline: '2025-01-16',
        summary: {
          moveDate: '2025-01-30',
          moveTime: '午後',
          fromAddress: '東京都世田谷区三軒茶屋3-3-3',
          toAddress: '神奈川県横浜市西区みなとみらい4-4-4',
          items: ['ダブルベッド', 'ソファ', '食器棚', '本棚'],
          totalPoints: 15
        },
        status: 'pending',
        priority: 'medium',
        sourceType: 'suumo'
      },
      {
        id: '3',
        customerName: '鈴木一郎',
        requestDate: '2025-01-13',
        deadline: '2025-01-15',
        summary: {
          moveDate: '2025-01-28',
          moveTime: '夜間',
          fromAddress: '東京都港区六本木5-5-5',
          toAddress: '東京都品川区大井6-6-6',
          items: ['キングベッド', 'ピアノ', '大型冷蔵庫'],
          totalPoints: 20
        },
        status: 'pending',
        priority: 'low',
        sourceType: '外部'
      }
    ];

    const normalizedRequests = demoRequests.map(request => ({
      ...request,
      sourceType: normalizeSourceType(request.sourceType)
    }));

    setRequests(normalizedRequests);
  }, []);

  useEffect(() => {
    let filtered = requests.filter(request => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      
      if (searchTerm && !request.customerName.includes(searchTerm)) {
        return false;
      }
      
      return true;
    });

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const getDeadlineColor = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'border-red-500'; // 期限当日・超過
    if (diffDays === 1) return 'border-red-500'; // 期限前日
    if (diffDays === 2) return 'border-yellow-500'; // 期限前々日
    return 'border-gray-300'; // 通常
  };

  const getDeadlineAriaLabel = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return `期限超過 ${Math.abs(diffDays)}日`;
    if (diffDays === 1) return '期限前日';
    if (diffDays === 2) return '期限前々日';
    return `残り${diffDays}日`;
  };

  const startResponse = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setResponseStep('content');
    
    // トラック空き状況の取得（デモデータ）
    const mockAvailability: TruckAvailability = {
      date: request.summary.moveDate,
      availableTrucks: Math.random() > 0.3 ? 2 : 0, // 30%の確率で空きなし
      totalTrucks: 5,
      timeSlots: {
        morning: Math.random() > 0.3 ? 1 : 0,
        afternoon: Math.random() > 0.3 ? 1 : 0,
        evening: Math.random() > 0.3 ? 1 : 0
      }
    };
    setTruckAvailability(mockAvailability);
  };

  const nextStep = () => {
    if (responseStep === 'content') {
      setResponseStep('truck');
    } else if (responseStep === 'truck') {
      setResponseStep('complete');
    }
  };

  const prevStep = () => {
    if (responseStep === 'truck') {
      setResponseStep('content');
    } else if (responseStep === 'complete') {
      setResponseStep('truck');
    }
  };

  const canProceedToNext = () => {
    if (responseStep === 'truck' && truckAvailability) {
      return truckAvailability.availableTrucks > 0;
    }
    return true;
  };

  const submitResponse = () => {
    if (!selectedRequest) return;
    
    // 回答完了処理
    setRequests(requests.map(r => 
      r.id === selectedRequest.id ? { ...r, status: 'answered' as const } : r
    ));
    
    setSelectedRequest(null);
    setResponseStep('content');
    setTruckAvailability(null);
  };

  const cancelResponse = () => {
    setSelectedRequest(null);
    setResponseStep('content');
    setTruckAvailability(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  if (selectedRequest) {
    return (
      <AdminAuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">見積もり回答</h1>
            
            {/* ステップインジケーター */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${responseStep === 'content' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    responseStep === 'content' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                  }`}>
                    1
                  </div>
                  <span className="ml-2">内容確認</span>
                </div>
                
                <div className="w-8 h-0.5 bg-gray-300"></div>
                
                <div className={`flex items-center ${responseStep === 'truck' ? 'text-blue-600' : responseStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    responseStep === 'truck' ? 'border-blue-600 bg-blue-600 text-white' :
                    responseStep === 'complete' ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300'
                  }`}>
                    2
                  </div>
                  <span className="ml-2">トラック割り当て</span>
                </div>
                
                <div className="w-8 h-0.5 bg-gray-300"></div>
                
                <div className={`flex items-center ${responseStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    responseStep === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
                  }`}>
                    3
                  </div>
                  <span className="ml-2">回答完了</span>
                </div>
              </div>
            </div>
          </div>

          {/* ステップ1: 内容確認 */}
          {responseStep === 'content' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">依頼内容の確認</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">顧客情報</h3>
                  <p className="text-gray-600">{selectedRequest.customerName}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">依頼元種別</h3>
                  <p className="text-gray-600">{getSourceTypeLabel(selectedRequest.sourceType)}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">引越し日時</h3>
                  <p className="text-gray-600">
                    {selectedRequest.summary.moveDate} {selectedRequest.summary.moveTime}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">総ポイント</h3>
                  <p className="text-gray-600">{selectedRequest.summary.totalPoints}ポイント</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">住所</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">引越し元</p>
                    <p className="text-gray-600">{selectedRequest.summary.fromAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">引越し先</p>
                    <p className="text-gray-600">{selectedRequest.summary.toAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">荷物</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.summary.items.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">時間帯割増の影響</h3>
                <p className="text-gray-600">
                  夜間作業（22:00-05:00）の場合、割増率1.25倍が適用されます。
                </p>
              </div>
            </div>
          )}

          {/* ステップ2: トラック割り当て */}
          {responseStep === 'truck' && truckAvailability && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">トラック空き状況</h2>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">選択日: {truckAvailability.date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">午前</p>
                    <p className={`text-lg font-semibold ${truckAvailability.timeSlots.morning > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {truckAvailability.timeSlots.morning}台
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">午後</p>
                    <p className={`text-lg font-semibold ${truckAvailability.timeSlots.afternoon > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {truckAvailability.timeSlots.afternoon}台
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">夜間</p>
                    <p className={`text-lg font-semibold ${truckAvailability.timeSlots.evening > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {truckAvailability.timeSlots.evening}台
                    </p>
                  </div>
                </div>
              </div>
              
              {truckAvailability.availableTrucks === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-medium">トラックの空きがありません</p>
                  <p className="text-red-600 text-sm mt-1">
                    別の日時を選択するか、空き状況を確認してください。
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ステップ3: 回答完了 */}
          {responseStep === 'complete' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">回答内容の確認</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">見積もり金額</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(45000)} <span className="text-sm text-gray-500">(税込)</span>
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">作業時間</h3>
                  <p className="text-gray-600">約4時間（午前中）</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">注意事項</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 作業当日は事前に荷物の整理をお願いします</li>
                    <li>• 貴重品は別途お持ちください</li>
                    <li>• 天候により作業時間が変動する場合があります</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between mt-8">
            <button
              onClick={cancelResponse}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
            
            <div className="flex space-x-4">
              {responseStep !== 'content' && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  戻る
                </button>
              )}
              
              {responseStep === 'complete' ? (
                <button
                  onClick={submitResponse}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  回答を送信
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    canProceedToNext()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  次へ
                </button>
              )}
            </div>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">見積もり回答依頼通知</h1>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="顧客名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              <option value="pending">未回答</option>
              <option value="answered">回答済</option>
              <option value="expired">期限切れ</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getDeadlineColor(request.deadline)}`}
              aria-label={getDeadlineAriaLabel(request.deadline)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{request.customerName}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>依頼日: {request.requestDate}</span>
                    <span>引越し日: {request.summary.moveDate}</span>
                    <span>回答期限: {request.deadline}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'answered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? '未回答' :
                     request.status === 'answered' ? '回答済' : '期限切れ'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.priority === 'high' ? 'bg-red-100 text-red-800' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority === 'high' ? '高' :
                     request.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">住所</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">元:</span> {request.summary.fromAddress}<br />
                    <span className="font-medium">先:</span> {request.summary.toAddress}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">依頼元種別</h4>
                  <p className="text-sm text-gray-600">{getSourceTypeLabel(request.sourceType)}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">荷物</h4>
                <div className="flex flex-wrap gap-2">
                  {request.summary.items.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => startResponse(request)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  回答する
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
