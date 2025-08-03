/**
 * 管理者案件管理ページコンポーネント
 * - 見積もり回答履歴
 * - 見積もり回答依頼通知
 * - 成約実績管理
 * タブで切り替え可能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

/**
 * 見積もり履歴の型定義
 */
interface QuoteHistory {
  id: string;              // 見積もりID
  customerName: string;    // 顧客名
  requestDate: string;     // 依頼日
  responseDate: string;    // 回答日
  amount: number;          // 見積もり金額
  status: 'pending' | 'contracted' | 'expired'; // ステータス
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
  moveDate: string;        // 引越し予定日
}

/**
 * 見積もり依頼データの型定義
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
}

/**
 * 成約データの型定義
 */
interface Contract {
  id: string;              // 成約ID
  customerName: string;    // 顧客名
  contractDate: string;    // 成約日
  moveDate: string;        // 引越し日
  contractAmount: number;  // 成約金額
  commission: number;      // 手数料
  revenue: number;         // 売上
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
}

/**
 * 月次サマリーの型定義
 */
interface MonthlySummary {
  month: string;           // 月（YYYY-MM形式）
  totalRevenue: number;    // 総売上
  totalContracts: number;  // 総成約数
  totalAmount: number;     // 総成約金額
}

type TabType = 'history' | 'notifications' | 'contracts';

export default function CaseManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  
  // フィルタリング状態
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const router = useRouter();

  /**
   * デモデータの初期化
   */
  useEffect(() => {
    // 見積もり履歴データ
    const demoQuotes: QuoteHistory[] = [
      {
        id: '1',
        customerName: '田中太郎',
        requestDate: '2025-01-15',
        responseDate: '2025-01-16',
        amount: 45000,
        status: 'contracted',
        items: ['シングルベッド', '冷蔵庫', 'テレビ'],
        fromAddress: '東京都渋谷区',
        toAddress: '東京都新宿区',
        moveDate: '2025-02-01'
      },
      {
        id: '2',
        customerName: '佐藤花子',
        requestDate: '2025-01-14',
        responseDate: '2025-01-15',
        amount: 38000,
        status: 'pending',
        items: ['ダブルベッド', '洗濯機', 'ソファ'],
        fromAddress: '東京都世田谷区',
        toAddress: '神奈川県横浜市',
        moveDate: '2025-01-30'
      },
      {
        id: '3',
        customerName: '鈴木一郎',
        requestDate: '2025-01-10',
        responseDate: '2025-01-12',
        amount: 52000,
        status: 'expired',
        items: ['キングベッド', 'ピアノ', '大型冷蔵庫'],
        fromAddress: '東京都港区',
        toAddress: '東京都品川区',
        moveDate: '2025-01-25'
      }
    ];

    // 見積もり依頼データ
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

    // 成約データ
    const demoContracts: Contract[] = [
      {
        id: '1',
        customerName: '田中太郎',
        contractDate: '2025-01-16',
        moveDate: '2025-02-01',
        contractAmount: 45000,
        commission: 4500,
        revenue: 40500,
        items: ['シングルベッド', '冷蔵庫', 'テレビ'],
        fromAddress: '東京都渋谷区',
        toAddress: '東京都新宿区'
      },
      {
        id: '2',
        customerName: '高橋美咲',
        contractDate: '2025-01-14',
        moveDate: '2025-01-28',
        contractAmount: 42000,
        commission: 4200,
        revenue: 37800,
        items: ['セミダブルベッド', '電子レンジ', '本棚'],
        fromAddress: '東京都中野区',
        toAddress: '東京都杉並区'
      }
    ];

    setQuotes(demoQuotes);
    setRequests(demoRequests);
    setContracts(demoContracts);

    // 月次サマリーの計算
    const summaries = demoContracts.reduce((acc, contract) => {
      const month = contract.contractDate.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, totalRevenue: 0, totalContracts: 0, totalAmount: 0 };
      }
      acc[month].totalRevenue += contract.revenue;
      acc[month].totalContracts += 1;
      acc[month].totalAmount += contract.contractAmount;
      return acc;
    }, {} as Record<string, MonthlySummary>);

    setMonthlySummaries(Object.values(summaries));
  }, []);

  /**
   * フィルタリングされた見積もり履歴を取得
   */
  const getFilteredQuotes = () => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.requestDate.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'requestDate':
          aValue = new Date(a.requestDate);
          bValue = new Date(b.requestDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          aValue = new Date(a.requestDate);
          bValue = new Date(b.requestDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  /**
   * フィルタリングされた見積もり依頼を取得
   */
  const getFilteredRequests = () => {
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

    return filtered;
  };

  /**
   * フィルタリングされた成約データを取得
   */
  const getFilteredContracts = () => {
    let filtered = contracts;

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractDate.includes(searchTerm)
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'contractDate':
          aValue = new Date(a.contractDate);
          bValue = new Date(b.contractDate);
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        default:
          aValue = new Date(a.contractDate);
          bValue = new Date(b.contractDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  /**
   * ステータスバッジの表示
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: '未回答', color: 'bg-yellow-100 text-yellow-800' },
      answered: { text: '回答済み', color: 'bg-blue-100 text-blue-800' },
      expired: { text: '期限切れ', color: 'bg-red-100 text-red-800' },
      contracted: { text: '成約済み', color: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  /**
   * 優先度バッジの表示
   */
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { text: '高', color: 'bg-red-100 text-red-800' },
      medium: { text: '中', color: 'bg-yellow-100 text-yellow-800' },
      low: { text: '低', color: 'bg-green-100 text-green-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  /**
   * 緊急度の判定
   */
  const isUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  /**
   * 未回答依頼数を取得
   */
  const getPendingCount = () => {
    return requests.filter(request => request.status === 'pending').length;
  };

  /**
   * 緊急依頼数を取得
   */
  const getUrgentCount = () => {
    return requests.filter(request => 
      request.status === 'pending' && isUrgent(request.deadline)
    ).length;
  };

  /**
   * アクションハンドラー
   */
  const handleViewDetails = (id: string) => {
    // TODO: 詳細画面への遷移
  };

  const handleReQuote = (id: string) => {
    // TODO: 再見積もり処理
  };

  const handleAnswer = (id: string) => {
    // TODO: 見積もり回答処理
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">案件管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積もり回答・成約実績の管理
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/case-management/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ＋案件登録
                </button>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  トップに戻る
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* タブナビゲーション */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                見積もり回答履歴
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                見積もり回答依頼通知
                {getPendingCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {getPendingCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contracts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                成約実績管理
              </button>
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 見積もり回答履歴タブ */}
          {activeTab === 'history' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
                    見積もり回答履歴
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="顧客名または日付で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">全ステータス</option>
                      <option value="pending">未回答</option>
                      <option value="contracted">成約済み</option>
                      <option value="expired">期限切れ</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="requestDate">依頼日</option>
                      <option value="customerName">顧客名</option>
                      <option value="amount">金額</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                    >
                      {sortOrder === 'asc' ? '昇順' : '降順'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          依頼日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          回答日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          見積もり金額
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
                      {getFilteredQuotes().map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {quote.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(quote.requestDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(quote.responseDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{quote.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(quote.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewDetails(quote.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              詳細
                            </button>
                            {quote.status === 'pending' && (
                              <button
                                onClick={() => handleReQuote(quote.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                再回答
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredQuotes().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">見積もり履歴がありません</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 見積もり回答依頼通知タブ */}
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                      見積もり回答依頼通知
                    </h2>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>未回答: {getPendingCount()}件</span>
                      {getUrgentCount() > 0 && (
                        <span className="text-red-600">緊急: {getUrgentCount()}件</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
                    <input
                      type="text"
                      placeholder="顧客名または住所で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">全ステータス</option>
                      <option value="pending">未回答</option>
                      <option value="answered">回答済み</option>
                      <option value="expired">期限切れ</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">全優先度</option>
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {getFilteredRequests().map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
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

                  {getFilteredRequests().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">見積もり依頼がありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 成約実績管理タブ */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* 月次サマリー */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">月次サマリー</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {monthlySummaries.map((summary) => (
                      <div key={summary.month} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {new Date(summary.month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>成約数:</strong> {summary.totalContracts}件</p>
                          <p><strong>総成約金額:</strong> ¥{summary.totalAmount.toLocaleString()}</p>
                          <p><strong>総売上:</strong> ¥{summary.totalRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 成約一覧 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
                      成約実績一覧
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        placeholder="顧客名または日付で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="contractDate">成約日</option>
                        <option value="customerName">顧客名</option>
                        <option value="revenue">売上</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                      >
                        {sortOrder === 'asc' ? '昇順' : '降順'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            顧客名
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            成約日
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            引越し日
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            成約金額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            手数料
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            売上
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredContracts().map((contract) => (
                          <tr key={contract.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {contract.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(contract.contractDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(contract.moveDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ¥{contract.contractAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              ¥{contract.commission.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ¥{contract.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {getFilteredContracts().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">成約実績がありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
