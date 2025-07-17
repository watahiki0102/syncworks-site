/**
 * ルートレイアウトコンポーネント
 * - アプリケーション全体のレイアウト定義
 * - フォント設定とメタデータの管理
 * - グローバルスタイルの適用
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Geist Sansフォントの設定
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Geist Monoフォントの設定
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * アプリケーションのメタデータ設定
 */
export const metadata: Metadata = {
  title: "SyncWorks - 引越し業者管理システム",
  description: "引越し業者の業務管理と顧客対応を効率化するシステム",
};

/**
 * ルートレイアウトコンポーネント
 * @param children - 子コンポーネント
 * @returns レイアウト要素
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
