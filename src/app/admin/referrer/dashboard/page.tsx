/**
 * 引越し案件紹介者管理画面ページコンポーネント
 * - 不動産会社の担当者が顧客に引越しサービスを紹介するための管理画面
 * - 紹介案件の管理と進捗確認
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { AdminLayout, AdminCard, AdminBadge } from '@/components/admin';

export default function ReferrerDashboardPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // ログイン状態とユーザー情報をチェック
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const userType = localStorage.getItem('userType');
    const email = localStorage.getItem('adminEmail');

    if (!isLoggedIn || userType !== 'referrer') {
      router.push('/admin/login');
      return;
    }

    setAdminEmail(email || '');
  }, [router]);

  const settingsActions = null;

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="紹介者管理画面"
        actions={settingsActions}
      >
        <div className="w-full max-w-4xl mx-auto">
          {/* メインメニュー - シンプルで効率的 */}
          <div className="space-y-4">
            <Link href="/admin/referrer/referrals" className="block">
              <AdminCard
                title="紹介状況リスト"
                subtitle="案件の進捗・成約管理"
                icon="📋"
                className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-white border-green-200"
                padding="lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <AdminBadge variant="success" size="sm">案件管理</AdminBadge>
                    <p className="text-sm text-gray-600 mt-1">
                      顧客の引越し案件の進捗状況を確認できます
                    </p>
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link href="/admin/referrer/profile" className="block">
              <AdminCard
                title="プロフィール管理"
                subtitle="登録情報の更新"
                icon="👤"
                className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white border-purple-200"
                padding="lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <AdminBadge variant="default" size="sm">設定</AdminBadge>
                    <p className="text-sm text-gray-600 mt-1">
                      会社情報や振込先情報を管理します
                    </p>
                  </div>
                </div>
              </AdminCard>
            </Link>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
