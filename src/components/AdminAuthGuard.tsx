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
        // TODO: 実際の認証APIを実装
        // 現在は開発環境では認証をスキップ
        if (process.env.NODE_ENV === 'development') {
          setIsAuthenticated(true);
        } else {
          // 本番環境での認証チェック
          // const response = await fetch('/api/admin/auth/check');
          // setIsAuthenticated(response.ok);
          
          // 開発中のため、とりあえず認証済みとして扱う
          setIsAuthenticated(true);
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
