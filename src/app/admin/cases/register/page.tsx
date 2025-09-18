/**
 * 管理者専用他社案件登録ページコンポーネント
 * - 見積算出 or 手動概算入力の2択選択
 * - 単一フォームでの案件登録
 * - PDF表示機能付き
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminButton from '@/components/admin/AdminButton';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import CaseForm from './components/CaseForm';
import EstimatePDFButton from './components/EstimatePDFButton';

export default function CaseRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);


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
        requestSource: '他社登録',
        estimateMode: 'unified'
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
        <AdminPageHeader
          title="他社案件登録"
          subtitle="他社経由案件の登録フォーム"
          breadcrumbs={[
            { label: '案件管理', href: '/admin/cases' },
            { label: '他社案件登録' }
          ]}
          actions={
            <AdminButton
              variant="secondary"
              onClick={() => router.push('/admin/cases')}
            >
              戻る
            </AdminButton>
          }
          showBackButton={false}
        />

        {/* メインコンテンツ */}
        <main className="w-full max-w-none py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          {/* 案件登録フォーム */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  他社案件登録フォーム
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  必要な情報を入力して案件を登録してください
                </p>
              </div>

              <CaseForm
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
          </main>
        </div>
      </AdminAuthGuard>
  );
}