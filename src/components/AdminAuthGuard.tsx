/**
 * 管理者認証ガードコンポーネント
 * - 管理者ログイン状態の確認
 * - 未認証時のログインページへのリダイレクト
 * - 認証確認中のローディング表示
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * ログイン状態をチェックし、認証状態を更新
   */
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const email = localStorage.getItem('adminEmail');
    
    if (!isLoggedIn || !email) {
      router.push('/admin/login');
      return;
    }
    
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  // 認証確認中のローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証時は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 