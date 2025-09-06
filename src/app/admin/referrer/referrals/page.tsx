/**
 * 引越し案件紹介者用紹介状況リストページコンポーネント
 * - 紹介した案件の一覧表示
 * - 案件の詳細情報表示
 * - ステータス更新機能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReferralList from '@/components/referral/ReferralList';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { AdminLayout } from '@/components/admin';

export default function ReferrerReferralsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ログイン状態とユーザー情報をチェック
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const userType = localStorage.getItem('userType');

    if (!isLoggedIn || userType !== 'referrer') {
      router.push('/admin/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const actions = null;

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="紹介状況リスト"
        actions={actions}
        breadcrumbs={[
          { label: '紹介状況リスト' }
        ]}
      >
        <div className="mb-6">
          <p className="text-gray-600">
            紹介した引越し案件の進捗状況、成約状況、回答社数などを確認できます。
          </p>
        </div>

        <ReferralList />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
