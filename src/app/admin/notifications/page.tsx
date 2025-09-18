/**
 * 管理者見積回答依頼通知ページコンポーネント
 * - お客様からの見積依頼の一覧表示
 * - 優先度・ステータスによるフィルタリング
 * - 緊急度の判定と表示
 * - 回答機能への誘導
 */
'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminCard from '@/components/admin/AdminCard';
import AdminBadge from '@/components/admin/AdminBadge';
import { SourceType, getSourceTypeLabel, getManagementNumber } from '@/app/admin/cases/lib/normalize';

/**
 * 見積依頼データの型定義
 */
interface QuoteRequest {
  id: string;                    // 依頼ID
  customerName: string;          // 顧客名
  requestDate: string;           // 依頼日
  deadline: string;              // 回答期限
  summary: {                     // 依頼概要
    moveDate: string;            // 引越し日
    moveTime: string;            // 引越し時間帯
    fromAddress: string;         // 引越し元住所
    toAddress: string;           // 引越し先住所
    items: string[];             // 荷物リスト
    totalPoints: number;         // 総ポイント
  };
  status: 'pending' | 'answered' | 'expired';  // ステータス
  priority: 'high' | 'medium' | 'low';         // 優先度
  sourceType: SourceType;        // 依頼元種別
}

export default function AdminNotifications() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * デモデータの初期化
   * 実際のアプリケーションではAPIから取得
   */
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
        sourceType: 'suumo'
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
        sourceType: 'syncmoving'
      }
    ];
    setRequests(demoRequests);
    setFilteredRequests(demoRequests);
  }, []);

  /**
   * フィルタリングとソートの処理
   * - ステータスによる絞り込み
   * - 優先度による絞り込み
   * - 検索語による絞り込み
   * - 優先度と期限によるソート
   */
  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(request => {
        const managementNumber = getManagementNumber(request.sourceType, request.id);
        return request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.summary.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.summary.toAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
               managementNumber.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    setFilteredRequests(filtered);
  }, [requests, statusFilter, priorityFilter, searchTerm]);

  /**
   * ステータスに応じたバッジコンポーネントを生成
   * @param status - ステータス
   * @returns ステータスバッジのJSX
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <AdminBadge variant="danger">未回答</AdminBadge>;
      case 'answered':
        return <AdminBadge variant="success">回答済</AdminBadge>;
      case 'expired':
        return <AdminBadge variant="default">期限切れ</AdminBadge>;
      default:
        return <AdminBadge variant="default">不明</AdminBadge>;
    }
  };

  /**
   * 優先度に応じたバッジコンポーネントを生成
   * @param priority - 優先度
   * @returns 優先度バッジのJSX
   */
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AdminBadge variant="danger">高</AdminBadge>;
      case 'medium':
        return <AdminBadge variant="warning">中</AdminBadge>;
      case 'low':
        return <AdminBadge variant="success">低</AdminBadge>;
      default:
        return <AdminBadge variant="default">不明</AdminBadge>;
    }
  };

  /**
   * 緊急度の判定
   * @param deadline - 回答期限
   * @returns 緊急かどうか（1日以内の場合）
   */
  const isUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  /**
   * 見積回答処理
   * @param requestId - 依頼ID
   */
  const handleAnswer = (requestId: string) => {
    // TODO: implement answer logic
  };

  /**
   * 依頼詳細の表示
   * @param requestId - 依頼ID
   */
  const handleViewDetails = (requestId: string) => {
    // TODO: navigate to details view
  };

  /**
   * 未回答依頼数を取得
   * @returns 未回答依頼数
   */
  const getPendingCount = () => {
    return requests.filter(request => request.status === 'pending').length;
  };

  /**
   * 緊急依頼数を取得
   * @returns 緊急依頼数（未回答かつ期限1日以内）
   */
  const getUrgentCount = () => {
    return requests.filter(request => 
      request.status === 'pending' && isUrgent(request.deadline)
    ).length;
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="見積回答依頼通知"
          subtitle="お客様からの見積依頼の管理"
          breadcrumbs={[
            { label: '通知管理' }
          ]}
        />

        <main className="w-full py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <AdminCard 
                title="未回答依頼"
                icon="📋"
                padding="md"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {getPendingCount()}件
                </div>
              </AdminCard>

              <AdminCard 
                title="緊急依頼"
                icon="⚠️"
                padding="md"
              >
                <div className="text-2xl font-bold text-orange-600">
                  {getUrgentCount()}件
                </div>
              </AdminCard>

              <AdminCard 
                title="総依頼数"
                icon="📊"
                padding="md"
              >
                <div className="text-2xl font-bold text-blue-600">
                  {requests.length}件
                </div>
              </AdminCard>
            </div>

            <AdminCard title="検索・フィルタ" padding="lg" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="pending">未回答</option>
                    <option value="answered">回答済</option>
                    <option value="expired">期限切れ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    検索
                  </label>
                  <input
                    type="text"
                    placeholder="顧客名・住所・管理No"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    更新
                  </button>
                </div>
              </div>
            </AdminCard>

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
                      依頼日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回答期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ポイント
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
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
                      className={`hover:bg-gray-50 ${
                        request.status === 'pending' && isUrgent(request.deadline)
                          ? 'bg-red-50'
                          : request.status === 'pending'
                          ? 'bg-yellow-50'
                          : ''
                      }`}
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
                        {request.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.summary.moveDate).toLocaleDateString('ja-JP')} {request.summary.moveTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {new Date(request.deadline).toLocaleDateString('ja-JP')}
                          {request.status === 'pending' && isUrgent(request.deadline) && (
                            <AdminBadge variant="danger" icon="⚠️" className="ml-2">緊急</AdminBadge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.summary.totalPoints}pt
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(request.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleAnswer(request.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            回答する
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(request.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                        見積依頼がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
