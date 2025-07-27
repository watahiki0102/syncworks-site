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
    const rememberMe = localStorage.getItem('adminRememberMe');
    const autoLoginExpiry = localStorage.getItem('adminAutoLoginExpiry');
    
    // 通常のログイン状態チェック
    if (isLoggedIn && email) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }
    
    // 自動ログイン機能のチェック
    if (rememberMe === 'true' && autoLoginExpiry) {
      const expiryDate = new Date(autoLoginExpiry);
      const now = new Date();
      
      if (now < expiryDate) {
        // 有効期限内の場合、自動ログインを有効にする
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', 'admin@example.com'); // デモ用
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } else {
        // 有効期限切れの場合、自動ログイン情報を削除
        localStorage.removeItem('adminAutoLoginExpiry');
        localStorage.removeItem('adminRememberMe');
      }
    }
    
    // 認証されていない場合、ログインページにリダイレクト
    router.push('/admin/login');
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