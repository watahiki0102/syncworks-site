'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { QuoteRequest, ItemInfo } from '@/types/common';
import { TruckAvailability } from '../types';
import { normalizeSourceType, getSourceTypeLabel, getManagementNumber } from '../lib/normalize';
import TruckAssignmentModal from '../../dispatch/components/TruckAssignmentModal';
import { TEST_CUSTOMERS, TEST_ADDRESSES, TEST_ITEMS } from '@/constants/testData';

type ResponseStep = 'content' | 'truck' | 'complete';

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [responseStep, setResponseStep] = useState<ResponseStep>('content');
  const [truckAvailability, setTruckAvailability] = useState<TruckAvailability | null>(null);
  const [editableItems, setEditableItems] = useState<ItemInfo[]>([]);
  const [editablePoints, setEditablePoints] = useState<number>(0);
  const [manualAmount, setManualAmount] = useState<number>(45000);
  const [contentConfirmed, setContentConfirmed] = useState<boolean>(false);
  const [showTruckAssignmentModal, setShowTruckAssignmentModal] = useState<boolean>(false);
  const [trucks] = useState([
    { 
      id: '1', 
      name: 'トラック1', 
      plateNumber: '品川500あ1234', 
      capacityKg: 2000, 
      status: 'available' as const,
      inspectionExpiry: '2025-12-31',
      truckType: '軽トラ',
      schedules: []
    },
    { 
      id: '2', 
      name: 'トラック2', 
      plateNumber: '品川500あ1235', 
      capacityKg: 3000, 
      status: 'available' as const,
      inspectionExpiry: '2025-12-31',
      truckType: '2t',
      schedules: []
    },
    { 
      id: '3', 
      name: 'トラック3', 
      plateNumber: '品川500あ1236', 
      capacityKg: 4000, 
      status: 'available' as const,
      inspectionExpiry: '2025-12-31',
      truckType: '3t',
      schedules: []
    },
  ]);

  useEffect(() => {
    // 共通テストデータから依頼データを生成
    const demoRequests: QuoteRequest[] = [
      {
        id: '1',
        customer: {
          lastName: TEST_CUSTOMERS[0].name.split(' ')[0] || TEST_CUSTOMERS[0].name,
          firstName: TEST_CUSTOMERS[0].name.split(' ')[1] || '',
          lastNameKana: '',
          firstNameKana: '',
          phone: TEST_CUSTOMERS[0].phone,
          email: TEST_CUSTOMERS[0].email || '',
          customerName: TEST_CUSTOMERS[0].name
        },
        requestDate: '2025-01-15',
        deadline: '2025-01-17',
        move: {
          moveType: '単身',
          moveDate: '2025-02-01',
          moveTime: '午前中',
          fromAddress: TEST_ADDRESSES[0].from,
          toAddress: TEST_ADDRESSES[0].to
        },
        items: {
          items: TEST_ITEMS[0].map((itemName, index) => ({
            id: `item-${index + 1}`,
            category: 'furniture',
            name: itemName,
            quantity: 1,
            points: 3
          })),
          totalPoints: TEST_ITEMS[0].length * 3
        },
        status: 'pending',
        priority: 'high',
        sourceType: 'syncmoving'
      },
      {
        id: '2',
        customer: {
          lastName: TEST_CUSTOMERS[1].name.split(' ')[0] || TEST_CUSTOMERS[1].name,
          firstName: TEST_CUSTOMERS[1].name.split(' ')[1] || '',
          lastNameKana: '',
          firstNameKana: '',
          phone: TEST_CUSTOMERS[1].phone,
          email: TEST_CUSTOMERS[1].email || '',
          customerName: TEST_CUSTOMERS[1].name
        },
        requestDate: '2025-01-14',
        deadline: '2025-01-16',
        move: {
          moveType: '家族',
          moveDate: '2025-01-30',
          moveTime: '午後',
          fromAddress: TEST_ADDRESSES[1].from,
          toAddress: TEST_ADDRESSES[1].to
        },
        items: {
          items: TEST_ITEMS[1].map((itemName, index) => ({
            id: `item-${index + 1}`,
            category: 'furniture',
            name: itemName,
            quantity: 1,
            points: 3
          })),
          totalPoints: TEST_ITEMS[1].length * 3
        },
        status: 'pending',
        priority: 'medium',
        sourceType: 'suumo'
      },
      {
        id: '3',
        customer: {
          lastName: TEST_CUSTOMERS[2].name.split(' ')[0] || TEST_CUSTOMERS[2].name,
          firstName: TEST_CUSTOMERS[2].name.split(' ')[1] || '',
          lastNameKana: '',
          firstNameKana: '',
          phone: TEST_CUSTOMERS[2].phone,
          email: TEST_CUSTOMERS[2].email || '',
          customerName: TEST_CUSTOMERS[2].name
        },
        requestDate: '2025-01-13',
        deadline: '2025-01-15',
        move: {
          moveType: '単身',
          moveDate: '2025-01-28',
          moveTime: '夜間',
          fromAddress: TEST_ADDRESSES[2].from,
          toAddress: TEST_ADDRESSES[2].to
        },
        items: {
          items: TEST_ITEMS[2].map((itemName, index) => ({
            id: `item-${index + 1}`,
            category: 'furniture',
            name: itemName,
            quantity: 1,
            points: 3
          })),
          totalPoints: TEST_ITEMS[2].length * 3
        },
        status: 'answered',
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
    const filtered = requests.filter(request => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      
      if (searchTerm) {
        const managementNumber = getManagementNumber(request.sourceType, request.id);
        const matchesCustomerName = request.customer.customerName.includes(searchTerm);
        const matchesManagementNumber = managementNumber.includes(searchTerm);
        
        if (!matchesCustomerName && !matchesManagementNumber) {
          return false;
        }
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
    setEditableItems([...request.items.items]);
    setEditablePoints(request.items.totalPoints);
    setContentConfirmed(false);
    
    // トラック空き状況の取得（デモデータ）
    const mockAvailability: TruckAvailability = {
      date: request.move.moveDate,
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
    if (responseStep === 'content' && contentConfirmed) {
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
    if (responseStep === 'content') {
      return contentConfirmed;
    }
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

  // トラック割り当てモーダル用の関数
  const assignTruckToSubmission = (submissionId: string, truckAssignment: any) => {
    console.log('トラック割り当て:', submissionId, truckAssignment);
    setShowTruckAssignmentModal(false);
  };

  const calculateRecommendedTrucks = (points: number) => {
    return trucks.filter(truck => truck.capacityKg >= points * 100);
  };

  const calculateEstimatedPrice = (points: number, distance?: number) => {
    return points * 1000 + (distance || 10) * 100;
  };

  // 見積もり依頼をトラック割り当て用フォーマットに変換
  const convertToFormSubmission = (request: QuoteRequest) => {
    return {
      id: request.id,
      customerName: request.customer.customerName,
      customerEmail: 'demo@example.com',
      customerPhone: '090-1234-5678',
      moveDate: request.move.moveDate,
      originAddress: request.move.fromAddress,
      destinationAddress: request.move.toAddress,
      totalPoints: editablePoints,
      totalCapacity: editablePoints * 50, // 仮の計算
      itemList: editableItems.map(item => item.name),
      additionalServices: [],
      status: 'pending' as const,
      truckAssignments: [],
      createdAt: request.requestDate,
      contractStatus: 'estimate' as const
    };
  };

  if (selectedRequest) {
    return (
      <AdminAuthGuard>
        <div className="w-full max-w-none px-4 py-8">
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
              <h2 className="text-xl font-semibold mb-4">依頼内容の確認・編集</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">顧客情報</h3>
                  <p className="text-gray-600">{selectedRequest.customer.customerName}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">依頼元種別</h3>
                  <p className="text-gray-600">{getSourceTypeLabel(selectedRequest.sourceType)}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">引越し日時</h3>
                  <p className="text-gray-600">
                    {selectedRequest.move.moveDate} {selectedRequest.move.moveTime}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">総ポイント</h3>
                  <input
                    type="number"
                    value={editablePoints}
                    onChange={(e) => setEditablePoints(Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-600"
                  />
                  <span className="ml-1 text-gray-600">ポイント</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">住所</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">引越し元</p>
                    <p className="text-gray-600">{selectedRequest.move.fromAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">引越し先</p>
                    <p className="text-gray-600">{selectedRequest.move.toAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">荷物（編集可能）</h3>
                <div className="space-y-2">
                  {editableItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...editableItems];
                          newItems[index] = { ...newItems[index], name: e.target.value };
                          setEditableItems(newItems);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...editableItems];
                          newItems[index] = { ...newItems[index], quantity: parseInt(e.target.value) || 1 };
                          setEditableItems(newItems);
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded"
                        placeholder="数量"
                        min="1"
                      />
                      <button
                        onClick={() => {
                          const newItems = editableItems.filter((_, i) => i !== index);
                          setEditableItems(newItems);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditableItems([...editableItems, {
                      id: `item-${editableItems.length + 1}`,
                      category: 'furniture',
                      name: '',
                      quantity: 1,
                      points: 3
                    }])}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    荷物を追加
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={contentConfirmed}
                    onChange={(e) => setContentConfirmed(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    内容を確認し、次のステップに進む準備ができました
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ステップ2: トラック割り当て */}
          {responseStep === 'truck' && truckAvailability && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">トラック割り当て</h2>
              
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
              
              {truckAvailability.availableTrucks === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-medium">トラックの空きがありません</p>
                  <p className="text-red-600 text-sm mt-1">
                    別の日時を選択するか、空き状況を確認してください。
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-800 font-medium">トラックの割り当てが可能です</p>
                      <p className="text-green-600 text-sm mt-1">
                        配車管理システムを使用してトラックを割り当ててください。
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTruckAssignmentModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      トラック割り当て
                    </button>
                  </div>
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
                  <h3 className="font-medium text-gray-900 mb-2">見積もり金額（編集可能）</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(Number(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-500">円（税抜）</span>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(manualAmount * 1.1)} <span className="text-sm text-gray-500">(税込)</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">確認した内容</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">総ポイント:</span> {editablePoints}ポイント</div>
                    <div><span className="font-medium">荷物数:</span> {editableItems.length}点</div>
                    <div><span className="font-medium">作業時間:</span> 約4時間（{selectedRequest.move.moveTime}）</div>
                  </div>
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

          {/* トラック割り当てモーダル */}
          {showTruckAssignmentModal && selectedRequest && (
            <TruckAssignmentModal
              selectedSubmission={convertToFormSubmission(selectedRequest)}
              trucks={trucks}
              pricingTrucks={trucks}
              setShowTruckModal={setShowTruckAssignmentModal}
              assignTruckToSubmission={assignTruckToSubmission}
              calculateRecommendedTrucks={calculateRecommendedTrucks}
              calculateEstimatedPrice={calculateEstimatedPrice}
            />
          )}
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="w-full max-w-none px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">見積もり回答依頼通知</h1>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="顧客名・管理Noで検索..."
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
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  回答期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ポイント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受注ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr 
                  key={request.id} 
                  className="hover:bg-gray-50"
                  aria-label={getDeadlineAriaLabel(request.deadline)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getManagementNumber(request.sourceType, request.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-block w-24 px-2 py-1 text-center text-gray-900"
                      style={{
                        fontSize: request.sourceType === '外部' 
                          ? `clamp(0.5rem, ${24 / Math.max(getSourceTypeLabel(request.sourceType).length, 1)}rem, 0.75rem)`
                          : '0.75rem'
                      }}
                    >
                      {getSourceTypeLabel(request.sourceType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.customer.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.move.moveDate} {request.move.moveTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={getDeadlineColor(request.deadline)}>
                      {request.deadline}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.items.totalPoints}pt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'answered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? '未回答' : '回答済'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority === 'high' ? '高' :
                       request.priority === 'medium' ? '中' : '低'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startResponse(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      回答する
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    見積もり依頼がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* トラック割り当てモーダル（一覧画面用） */}
        {showTruckAssignmentModal && selectedRequest && (
          <TruckAssignmentModal
            selectedSubmission={convertToFormSubmission(selectedRequest)}
            trucks={trucks}
            pricingTrucks={trucks}
            setShowTruckModal={setShowTruckAssignmentModal}
            assignTruckToSubmission={assignTruckToSubmission}
            calculateRecommendedTrucks={calculateRecommendedTrucks}
            calculateEstimatedPrice={calculateEstimatedPrice}
          />
        )}
      </div>
    </AdminAuthGuard>
  );
}
