'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * 管理者認証ガードコンポーネント
 * - 管理者権限の確認
 * - 未認証の場合は管理者ログインページにリダイレクト
 * - ローディング状態の表示
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 管理者認証状態をチェック
    const checkAdminAuth = async () => {
      try {
        // localStorageから認証情報を取得
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const userId = localStorage.getItem('adminUserId');
        const userEmail = localStorage.getItem('adminEmail');

        // 認証情報がない場合は未認証
        if (!isLoggedIn || (!userId && !userEmail)) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // 自動ログインの有効期限をチェック
        const rememberMe = localStorage.getItem('adminRememberMe');
        const autoLoginExpiry = localStorage.getItem('adminAutoLoginExpiry');
        
        if (rememberMe === 'true' && autoLoginExpiry) {
          const expiryDate = new Date(autoLoginExpiry);
          const now = new Date();
          
          if (now >= expiryDate) {
            // 有効期限切れ: 認証情報をクリア
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminUserId');
            localStorage.removeItem('adminUserRole');
            localStorage.removeItem('adminAutoLoginExpiry');
            localStorage.removeItem('adminRememberMe');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
        }

        // サーバー側で認証状態を確認
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (userId) {
          headers['x-user-id'] = userId;
        } else if (userEmail) {
          headers['x-user-email'] = userEmail;
        }

        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers,
        });

        const result = await response.json();
        
        if (result.success && result.authenticated) {
          setIsAuthenticated(true);
        } else {
          // 認証失敗: localStorageをクリア
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminUserId');
          localStorage.removeItem('adminUserRole');
          localStorage.removeItem('adminAutoLoginExpiry');
          localStorage.removeItem('adminRememberMe');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('管理者認証チェックエラー:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  // 認証チェック中のローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">管理者認証中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合は管理者ログインページにリダイレクト
  if (!isAuthenticated) {
    router.push('/admin/login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">管理者ログインページにリダイレクト中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
}
