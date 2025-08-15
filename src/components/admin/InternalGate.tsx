'use client';

import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';

interface InternalGateProps {
  children: React.ReactNode;
}

export default function InternalGate({ children }: InternalGateProps) {
  const searchParams = useSearchParams();
  const isInternal = searchParams.get('internal') === '1';
  
  // 環境変数での制御も併用
  const envEnabled = process.env.NEXT_PUBLIC_INTERNAL_CONSOLE === 'enabled';
  
  // 開発環境では一時的に権限を緩和
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 開発環境または内部フラグがある場合はアクセス許可
  if (isDevelopment || isInternal || envEnabled) {
    return <>{children}</>;
  }
  
  // 本番環境では従来通り制限
  notFound();
}
