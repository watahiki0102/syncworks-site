'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import TruckAssignmentModal from '../dispatch/components/TruckAssignmentModal';
import AssignmentStatusFilter, { AssignmentStatusFilterValue } from '@/components/dispatch/AssignmentStatusFilter';
import { formatDate, formatTime } from '@/utils/dateTimeUtils';
import { Truck } from '@/types/shared';
import { ContractStatus } from '@/types/case';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  originAddress: string;
  destinationAddress: string;
  totalPoints: number;
  totalCapacity: number;
  itemList: string[];
  additionalServices: string[];
  status: 'pending' | 'assigned' | 'completed';
  truckAssignments: TruckAssignment[];
  createdAt: string;
  distance?: number;
  estimatedPrice?: number;
  recommendedTruckTypes?: string[];
  contractStatus: ContractStatus;
  contractDate?: string;
  caseStatus?: 'unanswered' | 'answered' | 'contracted' | 'lost' | 'cancelled';
  requestSource?: string;
  isManualRegistration?: boolean;
  registeredBy?: string;
}

interface TruckAssignment {
  truckId: string;
  truckName: string;
  capacity: number;
  startTime: string;
  endTime: string;
  workType: 'loading' | 'moving' | 'unloading';
}

function TruckAssignmentPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AssignmentStatusFilterValue>('all');

  // サンプルデータ（実際の実装ではAPIから取得）
  useEffect(() => {
    setFormSubmissions([
      {
        id: '1',
        customerName: '山田 太郎',
        customerEmail: 'taro@example.com',
        customerPhone: '090-1234-5678',
        moveDate: '2025-08-15',
        originAddress: '東京都新宿区西新宿1-1-1',
        destinationAddress: '東京都渋谷区渋谷2-2-2',
        totalPoints: 100,
        totalCapacity: 500,
        itemList: ['ソファ', 'テーブル', '椅子'],
        additionalServices: ['梱包', '開梱'],
        status: 'pending',
        truckAssignments: [],
        createdAt: '2025-08-01T10:00:00Z',
        contractStatus: 'estimate',
        caseStatus: 'answered',
        requestSource: 'シンクワーク',
        isManualRegistration: false,
      },
      {
        id: '2',
        customerName: '鈴木 花子',
        customerEmail: 'hanako@example.com',
        customerPhone: '080-9876-5432',
        moveDate: '2025-08-20',
        originAddress: '大阪府大阪市北区梅田3-3-3',
        destinationAddress: '大阪府大阪市中央区難波4-4-4',
        totalPoints: 150,
        totalCapacity: 750,
        itemList: ['ベッド', 'ワードローブ', '机'],
        additionalServices: ['保険'],
        status: 'assigned',
        truckAssignments: [],
        createdAt: '2025-08-02T11:00:00Z',
        contractStatus: 'estimate',
        caseStatus: 'contracted',
        requestSource: '手動登録',
        isManualRegistration: true,
      },
    ]);

    setTrucks([
      {
        id: '1',
        name: 'トラックA',
        plateNumber: '品川500 あ 1234',
        capacityKg: 1000,
        truckType: '2t',
        status: 'available',
        inspectionExpiry: '2024-12-31',
        schedules: [],
      },
      {
        id: '2',
        name: 'トラックB',
        plateNumber: '品川500 い 5678',
        capacityKg: 2000,
        truckType: '4t',
        status: 'available',
        inspectionExpiry: '2024-12-31',
        schedules: [],
      },
    ]);
  }, []);

  const filteredSubmissions = formSubmissions.filter(submission => {
    if (statusFilter === 'all') return true;
    return submission.status === statusFilter;
  });

  const calculateEstimatedPrice = (points: number, distance?: number) => {
    return points * 100 + (distance || 0) * 50;
  };

  const calculateRecommendedTrucks = (points: number) => {
    if (points <= 100) return trucks.filter(t => t.truckType === '2t');
    if (points <= 200) return trucks.filter(t => t.truckType === '4t');
    return trucks.filter(t => t.truckType === '10t');
  };

  const getStatusConfig = (type: string, status: string) => {
    const configs: Record<string, Record<string, { icon: string; text: string; color: string }>> = {
      submission: {
        pending: { icon: '⏳', text: '未割当', color: 'bg-yellow-100 text-yellow-800' },
        assigned: { icon: '✅', text: '割当済', color: 'bg-blue-100 text-blue-800' },
        completed: { icon: '🎉', text: '完了', color: 'bg-green-100 text-green-800' },
      },
      caseStatus: {
        unanswered: { icon: '❓', text: '未回答', color: 'bg-gray-100 text-gray-800' },
        answered: { icon: '💬', text: '回答済', color: 'bg-blue-100 text-blue-800' },
        contracted: { icon: '📋', text: '受注', color: 'bg-green-100 text-green-800' },
        lost: { icon: '💸', text: '失注', color: 'bg-red-100 text-red-800' },
        cancelled: { icon: '🚫', text: 'キャンセル', color: 'bg-yellow-100 text-yellow-800' },
      },
      contract: {
        estimate: { icon: '📝', text: '見積もり', color: 'bg-orange-100 text-orange-800' },
        confirmed: { icon: '✅', text: '契約完了', color: 'bg-green-100 text-green-800' },
      },
    };
    return configs[type]?.[status] || { icon: '❓', text: '不明', color: 'bg-gray-100 text-gray-800' };
  };

  const handleEdit = (caseId: string) => {
    router.push(`/admin/cases/edit/${caseId}?from=assignment&caseId=${caseId}`);
  };

  const assignTruckToSubmission = (submissionId: string, truckAssignment: TruckAssignment) => {
    setFormSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          truckAssignments: [...submission.truckAssignments, truckAssignment],
          status: 'assigned',
        };
      }
      return submission;
    }));
    setShowTruckModal(false);
  };

  const removeTruckFromSubmission = (submissionId: string, truckId: string) => {
    setFormSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        const newAssignments = submission.truckAssignments.filter(ta => ta.truckId !== truckId);
        return {
          ...submission,
          truckAssignments: newAssignments,
          status: newAssignments.length === 0 ? 'pending' : 'assigned',
        };
      }
      return submission;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">案件割り当て</h1>
                <p className="mt-2 text-gray-600">
                  引越し案件をトラックに割り当てて、効率的な配車を管理します
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/admin/dispatch"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ← 配車管理に戻る
                </a>
              </div>
            </div>
          </div>

          {/* 案件一覧と詳細 */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">引越し案件一覧</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="bg-orange-100 px-3 py-1 rounded-full">
                    未割当: {formSubmissions.filter(s => s.status === 'pending').length}件
                  </div>
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    割当済: {formSubmissions.filter(s => s.status === 'assigned').length}件
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    完了: {formSubmissions.filter(s => s.status === 'completed').length}件
                  </div>
                </div>
              </div>
            </div>

            {/* ステータスフィルタ */}
            <div className="px-6 py-4 border-b border-gray-200">
              <AssignmentStatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            {/* 案件一覧 */}
            <div className="p-6 space-y-6">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">該当する案件がありません</p>
                </div>
              ) : (
                filteredSubmissions.map(submission => {
                  const isExpanded = expandedSubmissions.has(submission.id);
                  
                  const toggleExpanded = () => {
                    const newExpandedSubmissions = new Set(expandedSubmissions);
                    if (isExpanded) {
                      newExpandedSubmissions.delete(submission.id);
                    } else {
                      newExpandedSubmissions.add(submission.id);
                    }
                    setExpandedSubmissions(newExpandedSubmissions);
                  };

                  return (
                    <div 
                      key={submission.id} 
                      className="bg-white rounded-xl shadow border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">{submission.customerName}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-sm mt-1">
                                <p className="text-gray-600">📅 {formatDate(submission.moveDate)}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-600 font-medium">
                                    📋 {submission.requestSource || (submission.isManualRegistration ? '手動登録' : 'シンクワーク')}
                                  </span>
                                  {submission.isManualRegistration && submission.customerPhone && (
                                    <span className="text-gray-600">
                                      📞 {submission.customerPhone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              📊 {submission.totalPoints}pt
                            </span>
                            <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              💰 ¥{calculateEstimatedPrice(submission.totalPoints, submission.distance || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* ステータス表示 */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusConfig('submission', submission.status).color}`}>
                            {getStatusConfig('submission', submission.status).icon} {getStatusConfig('submission', submission.status).text}
                          </span>
                          
                          {submission.caseStatus && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('caseStatus', submission.caseStatus).color}`}>
                              {getStatusConfig('caseStatus', submission.caseStatus).icon} {getStatusConfig('caseStatus', submission.caseStatus).text}
                            </span>
                          )}
                          
                          {submission.contractStatus === 'estimate' && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('contract', 'estimate').color}`}>
                              {getStatusConfig('contract', 'estimate').icon} {getStatusConfig('contract', 'estimate').text}
                            </span>
                          )}
                          {submission.contractStatus === 'confirmed' && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('contract', 'confirmed').color}`}>
                              {getStatusConfig('contract', 'confirmed').icon} {getStatusConfig('contract', 'confirmed').text}
                            </span>
                          )}
                        </div>

                        {/* 基本情報の表示 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">📦</span>
                            <span className="font-medium">容量: {submission.totalCapacity.toLocaleString()}kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">📍</span>
                            <span className="text-gray-700">出発地: {submission.originAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">🏁</span>
                            <span className="text-gray-700">到着地: {submission.destinationAddress}</span>
                          </div>
                        </div>

                        {/* 推奨トラックと割り当て状況 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">推奨トラック:</span>
                            <div className="flex gap-1">
                              {calculateRecommendedTrucks(submission.totalPoints).slice(0, 3).map(truck => (
                                <span key={truck.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {truck.truckType}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.truckAssignments.length > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                🚚 {submission.truckAssignments.length}台割当済
                              </span>
                            )}
                            {submission.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowTruckModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                + トラック割当
                              </button>
                            )}
                          </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={toggleExpanded}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded text-sm"
                          >
                            {isExpanded ? '▲ 詳細を閉じる' : '▼ 詳細を表示'}
                          </button>
                          <button
                            onClick={() => handleEdit(submission.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium"
                          >
                            編集
                          </button>
                        </div>
                      </div>

                      {/* 展開可能な詳細情報 */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-6 space-y-4">
                          {/* 連絡先情報 */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">連絡先情報</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>📧 {submission.customerEmail}</div>
                              <div>📞 {submission.customerPhone}</div>
                            </div>
                          </div>
                          
                          {/* 荷物詳細 */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">荷物リスト</h4>
                            <div className="flex flex-wrap gap-1">
                              {submission.itemList.map((item, index) => (
                                <span key={index} className="text-xs bg-white border px-2 py-1 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 追加サービス */}
                          {submission.additionalServices.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">追加サービス</h4>
                              <div className="flex flex-wrap gap-1">
                                {submission.additionalServices.map((service, index) => (
                                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 割り当てトラック */}
                          {submission.truckAssignments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">割り当てトラック</h4>
                              <div className="space-y-2">
                                {submission.truckAssignments.map((truckAssignment, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                    <div>
                                      <span className="font-medium text-sm">{truckAssignment.truckName}</span>
                                      <span className="text-xs text-gray-600 ml-2">
                                        {formatTime(truckAssignment.startTime)}-{formatTime(truckAssignment.endTime)} 
                                        ({truckAssignment.capacity.toLocaleString()}kg)
                                      </span>
                                    </div>
                                    {submission.status !== 'completed' && (
                                      <button
                                        onClick={() => removeTruckFromSubmission(submission.id, truckAssignment.truckId)}
                                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded"
                                      >
                                        削除
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* トラック一覧（割り当て用） */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">トラック一覧</h2>
              <p className="text-sm text-gray-600 mt-1">
                登録台数: {trucks.length}台 | 
                稼働中: {trucks.filter(t => t.status === 'available').length}台 | 
                整備中: {trucks.filter(t => t.status === 'maintenance').length}台
              </p>
            </div>
            
            {trucks.length === 0 ? (
              <div className="p-7 text-center">
                <p className="text-gray-500 mb-2">登録済みのトラックがありません</p>
                <p className="text-sm text-gray-400">トラック登録・編集タブから新しいトラックを追加してください</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {trucks.map(truck => {
                    const todaySchedules = truck.schedules
                      .filter(s => s.date === new Date().toISOString().split('T')[0])
                      .length;

                    return (
                      <div key={truck.id} className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                        truck.status === 'available' ? 'border-green-200 bg-green-50' :
                        truck.status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      }`}>
                        {/* ヘッダー */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">{truck.name}</h4>
                            <p className="text-sm text-gray-600">{truck.plateNumber}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              truck.status === 'available' ? 'bg-green-100 text-green-800' :
                              truck.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {truck.status === 'available' ? '🟢 稼働可能' :
                               truck.status === 'maintenance' ? '🟡 整備中' :
                               '🔴 使用中'}
                            </span>
                            {todaySchedules > 0 && (
                              <p className="text-xs text-gray-600 mt-1">本日: {todaySchedules}件</p>
                            )}
                          </div>
                        </div>

                        {/* 基本情報 */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">📦</span>
                            <span className="font-medium">{truck.capacityKg.toLocaleString()}kg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">🚛</span>
                            <span className="text-gray-700">{truck.truckType}</span>
                          </div>
                        </div>
                        
                        {truck.status === 'available' ? (
                          <div className="p-3 rounded-lg bg-green-100 border-l-4 border-green-400">
                            <p className="text-sm font-medium text-green-800">📋 割り当て可能</p>
                            <p className="text-xs text-green-600 mt-1">新しい案件をアサイン可能</p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-gray-100 border-l-4 border-gray-300">
                            <p className="text-sm font-medium text-gray-600">📋 割り当て不可</p>
                            <p className="text-xs text-gray-500 mt-1">現在割り当てできません</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* トラック割り当てモーダル */}
      {showTruckModal && selectedSubmission && (
        <TruckAssignmentModal
          selectedSubmission={selectedSubmission}
          trucks={trucks}
          pricingTrucks={[]}
          setShowTruckModal={setShowTruckModal}
          assignTruckToSubmission={assignTruckToSubmission}
          calculateRecommendedTrucks={calculateRecommendedTrucks}
          calculateEstimatedPrice={calculateEstimatedPrice}
        />
      )}
    </div>
  );
}

export default function TruckAssignmentPageWrapper() {
  return (
    <AdminAuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">案件割り当て画面を読み込み中...</p>
          </div>
        </div>
      }>
        <TruckAssignmentPage />
      </Suspense>
    </AdminAuthGuard>
  );
}
