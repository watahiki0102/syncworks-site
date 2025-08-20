'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

interface CaseData {
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
  contractStatus: 'estimate' | 'confirmed';
  caseStatus: 'unanswered' | 'answered' | 'contracted' | 'lost' | 'cancelled';
  requestSource?: string;
  isManualRegistration?: boolean;
  registeredBy?: string;
}

function CaseEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;
  const fromPage = searchParams.get('from');
  const returnCaseId = searchParams.get('caseId');

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // サンプルデータ（実際の実装ではAPIから取得）
  useEffect(() => {
    // 実際の実装では、caseIdを使ってAPIから案件データを取得
    setCaseData({
      id: caseId,
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
      contractStatus: 'estimate',
      caseStatus: 'answered',
      requestSource: 'シンクワーク',
      isManualRegistration: false,
    });
    setIsLoading(false);
  }, [caseId]);

  const handleSave = async () => {
    if (!caseData) return;
    
    setIsSaving(true);
    try {
      // 実際の実装では、APIにデータを送信
      console.log('保存するデータ:', caseData);
      
      // 保存成功後、戻り先に遷移
      if (fromPage === 'assignment' && returnCaseId) {
        router.push(`/admin/dispatch/assignment`);
      } else {
        router.push('/admin/cases');
      }
    } catch (error) {
      console.error('保存エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (fromPage === 'assignment' && returnCaseId) {
      router.push(`/admin/dispatch/assignment`);
    } else {
      router.push('/admin/cases');
    }
  };

  const handleInputChange = (field: keyof CaseData, value: any) => {
    if (!caseData) return;
    setCaseData({
      ...caseData,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">案件データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">案件が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">案件編集</h1>
                <p className="mt-2 text-gray-600">
                  案件ID: {caseData.id} - {caseData.customerName}様
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={fromPage === 'assignment' ? '/admin/dispatch/assignment' : '/admin/cases'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ← {fromPage === 'assignment' ? '案件割り当てに戻る' : '案件管理に戻る'}
                </a>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>

          {/* 編集フォーム */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 顧客情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顧客名 *
                  </label>
                  <input
                    type="text"
                    value={caseData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={caseData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={caseData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    引越し日 *
                  </label>
                  <input
                    type="date"
                    value={caseData.moveDate}
                    onChange={(e) => handleInputChange('moveDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 住所情報 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出発地 *
                  </label>
                  <input
                    type="text"
                    value={caseData.originAddress}
                    onChange={(e) => handleInputChange('originAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="東京都新宿区西新宿1-1-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    到着地 *
                  </label>
                  <input
                    type="text"
                    value={caseData.destinationAddress}
                    onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="東京都渋谷区渋谷2-2-2"
                  />
                </div>
              </div>

              {/* 案件詳細 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    荷物ポイント *
                  </label>
                  <input
                    type="number"
                    value={caseData.totalPoints}
                    onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    総容量 (kg) *
                  </label>
                  <input
                    type="number"
                    value={caseData.totalCapacity}
                    onChange={(e) => handleInputChange('totalCapacity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              {/* ステータス */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    案件ステータス
                  </label>
                  <select
                    value={caseData.caseStatus}
                    onChange={(e) => handleInputChange('caseStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unanswered">未回答</option>
                    <option value="answered">回答済</option>
                    <option value="contracted">受注</option>
                    <option value="lost">失注</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    契約ステータス
                  </label>
                  <select
                    value={caseData.contractStatus}
                    onChange={(e) => handleInputChange('contractStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="estimate">見積もり</option>
                    <option value="confirmed">契約完了</option>
                  </select>
                </div>
              </div>

              {/* 荷物リスト */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  荷物リスト
                </label>
                <textarea
                  value={caseData.itemList.join(', ')}
                  onChange={(e) => handleInputChange('itemList', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="ソファ, テーブル, 椅子"
                />
                <p className="text-xs text-gray-500 mt-1">カンマ区切りで入力してください</p>
              </div>

              {/* 追加サービス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  追加サービス
                </label>
                <textarea
                  value={caseData.additionalServices.join(', ')}
                  onChange={(e) => handleInputChange('additionalServices', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="梱包, 開梱"
                />
                <p className="text-xs text-gray-500 mt-1">カンマ区切りで入力してください</p>
              </div>
            </div>
          </div>

          {/* 戻り先情報 */}
          {fromPage === 'assignment' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-blue-600 text-lg mr-2">ℹ️</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    案件割り当て画面から編集しています
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    保存後は案件割り当て画面に戻ります
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CaseEditPageWrapper() {
  return (
    <AdminAuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">案件編集画面を読み込み中...</p>
          </div>
        </div>
      }>
        <CaseEditPage />
      </Suspense>
    </AdminAuthGuard>
  );
}
