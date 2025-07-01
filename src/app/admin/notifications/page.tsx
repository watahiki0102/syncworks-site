'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

interface QuoteRequest {
  id: string;
  customerName: string;
  requestDate: string;
  deadline: string;
  summary: {
    moveDate: string;
    moveTime: string;
    fromAddress: string;
    toAddress: string;
    items: string[];
    totalPoints: number;
  };
  status: 'pending' | 'answered' | 'expired';
  priority: 'high' | 'medium' | 'low';
}

export default function AdminNotifications() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
        priority: 'high'
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
        priority: 'medium'
      }
    ];
    setRequests(demoRequests);
    setFilteredRequests(demoRequests);
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.summary.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.summary.toAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">未回答</span>;
      case 'answered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">回答済</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">期限切れ</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">高</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">中</span>;
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">低</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  const isUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  const handleAnswer = (requestId: string) => {
    console.log('Answer request:', requestId);
  };

  const handleViewDetails = (requestId: string) => {
    console.log('View details for request:', requestId);
  };

  const getPendingCount = () => {
    return requests.filter(request => request.status === 'pending').length;
  };

  const getUrgentCount = () => {
    return requests.filter(request => 
      request.status === 'pending' && isUrgent(request.deadline)
    ).length;
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  見積もり回答依頼通知
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  お客様からの見積もり依頼の管理
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ダッシュボードに戻る
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          未回答依頼
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {getPendingCount()}件
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">⚠️</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          緊急依頼
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {getUrgentCount()}件
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">📊</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          総依頼数
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {requests.length}件
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
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
                      placeholder="顧客名・住所"
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
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`border rounded-lg p-4 ${
                        request.status === 'pending' && isUrgent(request.deadline)
                          ? 'border-red-300 bg-red-50'
                          : request.status === 'pending'
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {request.customerName}
                            </h3>
                            {getStatusBadge(request.status)}
                            {getPriorityBadge(request.priority)}
                            {request.status === 'pending' && isUrgent(request.deadline) && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                緊急
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>依頼日:</strong> {new Date(request.requestDate).toLocaleDateString('ja-JP')}</p>
                              <p><strong>回答期限:</strong> {new Date(request.deadline).toLocaleDateString('ja-JP')}</p>
                              <p><strong>引越し日:</strong> {new Date(request.summary.moveDate).toLocaleDateString('ja-JP')} {request.summary.moveTime}</p>
                            </div>
                            <div>
                              <p><strong>搬出:</strong> {request.summary.fromAddress}</p>
                              <p><strong>搬入:</strong> {request.summary.toAddress}</p>
                              <p><strong>総ポイント:</strong> {request.summary.totalPoints}pt</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <strong>主な荷物:</strong> {request.summary.items.slice(0, 3).join('、')}
                              {request.summary.items.length > 3 && ` 他${request.summary.items.length - 3}点`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleAnswer(request.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                              回答する
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(request.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          >
                            詳細
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">見積もり依頼がありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
