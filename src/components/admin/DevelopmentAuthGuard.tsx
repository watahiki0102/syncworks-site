'use client';

import { useEffect, useState } from 'react';

interface DevelopmentAuthGuardProps {
  children: React.ReactNode;
}

export default function DevelopmentAuthGuard({ children }: DevelopmentAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 開発環境では即座に認証完了
    if (process.env.NODE_ENV === 'development') {
      setIsLoading(false);
    }
  }, []);

  // 開発環境では認証確認中のローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">開発環境認証中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
