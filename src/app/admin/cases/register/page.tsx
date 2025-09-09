/**
 * 管理者専用手動案件登録ページコンポーネント
 * - 見積もり算出 or 手動概算入力の2択選択
 * - 単一フォームでの案件登録
 * - PDF表示機能付き
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminButton from '@/components/admin/AdminButton';
import EstimateModeSelector from './components/EstimateModeSelector';
import CaseForm from './components/CaseForm';
import EstimatePDFButton from './components/EstimatePDFButton';
import { EstimateInputMode } from '@/types/case';

export default function CaseRegistrationPage() {
  const router = useRouter();
  const [estimateMode, setEstimateMode] = useState<EstimateInputMode | null>(null);
  const [formData, setFormData] = useState<any>(null);

  /**
   * 見積もり方式の選択
   */
  const handleModeChange = (mode: EstimateInputMode) => {
    setEstimateMode(mode);
  };

  /**
   * フォーム送信処理
   */
  const handleFormSubmit = (data: any) => {
    setFormData(data);
    
    // 確認ダイアログ
    const confirmMessage = `以下の内容で案件を登録しますか？

顧客名: ${data.customerName}
引越し日: ${data.moveDate} (${data.moveDateKind})
引越し元: ${data.fromAddress}
引越し先: ${data.toAddress}
見積金額: ${new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(data.priceTaxIncluded)}
契約ステータス: ${data.contractStatus}
支払方法: ${data.paymentMethod}
支払状況: ${data.paymentStatus}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 案件データの生成
      const newCase = {
        id: Date.now().toString(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        moveDate: data.moveDate,
        moveTime: data.moveTime,
        moveDateKind: data.moveDateKind,
        originAddress: data.fromAddress,
        destinationAddress: data.toAddress,
        fromPostalCode: data.fromPostalCode,
        toPostalCode: data.toPostalCode,
        totalPoints: data.totalPoints,
        additionalServices: data.additionalServices,
        estimatedPrice: data.estimatedPrice,
        taxRate: data.taxRate,
        priceTaxIncluded: data.priceTaxIncluded,
        contractStatus: data.contractStatus,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
        status: 'pending',
        truckAssignments: [],
        createdAt: new Date().toISOString(),
        // 管理者登録フラグ
        isManualRegistration: true,
        registeredBy: 'admin',
        requestSource: '手動登録',
        estimateMode: estimateMode
      };

      // ローカルストレージに保存
      const saved = localStorage.getItem('formSubmissions');
      const submissions = saved ? JSON.parse(saved) : [];
      submissions.push(newCase);
      localStorage.setItem('formSubmissions', JSON.stringify(submissions));

      alert('案件を正常に登録しました！\n配車管理画面に移動し、配車登録を行います。');
      
      // 配車管理画面に遷移し、登録した案件を自動選択状態にする
      router.push(`/admin/dispatch?selectedCase=${newCase.id}&mode=registration`);
    } catch (error) {
      console.error('案件登録エラー:', error);
      alert('案件登録中にエラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">手動案件登録</h1>
                <p className="text-sm text-gray-600 mt-1">
                  管理者専用の案件直接登録フォーム
                </p>
              </div>
              <AdminButton
                variant="secondary"
                onClick={() => router.push('/admin/cases')}
                icon="←"
              >
                案件管理に戻る
              </AdminButton>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 見積もり方式選択 */}
          <EstimateModeSelector
            selectedMode={estimateMode}
            onModeChange={handleModeChange}
          />

          {/* 案件登録フォーム */}
          {estimateMode && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {estimateMode === 'calc' ? '見積もり算出' : '手動概算入力'} - 案件登録フォーム
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    必要な情報を入力して案件を登録してください
                  </p>
                </div>

                <CaseForm
                  estimateMode={estimateMode}
                  onSubmit={handleFormSubmit}
                />

                {/* PDF表示ボタン */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-center">
                    <EstimatePDFButton
                      draftPayload={formData}
                      disabled={!formData}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ※入力内容に誤りがない場合に限る
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 方式未選択時の案内 */}
          {!estimateMode && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                見積もり方式を選択してください
              </h3>
              <p className="text-gray-600">
                上記の2つの選択肢から、案件の見積もり方式を選択してください。
                選択後、該当する入力フォームが表示されます。
              </p>
            </div>
          )}
        </main>
      </div>
    </AdminAuthGuard>
  );
} 