/**
 * ルートレイアウトコンポーネント（改善版）
 * - 最新のNext.js機能を活用
 * - パフォーマンス最適化
 * - アクセシビリティ対応
 * - SEO対応
 */
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Geist Sansフォントの設定（最適化）
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

/**
 * Geist Monoフォントの設定（最適化）
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // モノスペースフォントは必要時のみ
});

/**
 * ビューポート設定
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
};

/**
 * アプリケーションのメタデータ設定（SEO最適化）
 */
export const metadata: Metadata = {
  title: {
    default: "SyncWorks - 引越し業者管理システム",
    template: "%s | SyncWorks"
  },
  description: "引越し業者の業務管理と顧客対応を効率化するシステム。見積もり管理、配車管理、シフト管理を統合したプラットフォームです。",
  keywords: ["引越し", "業者管理", "見積もり", "配車管理", "シフト管理", "SyncWorks"],
  authors: [{ name: "SyncWorks Team" }],
  creator: "SyncWorks",
  publisher: "SyncWorks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://syncworks.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName: 'SyncWorks',
    title: 'SyncWorks - 引越し業者管理システム',
    description: '引越し業者の業務管理と顧客対応を効率化するシステム',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SyncWorks - 引越し業者管理システム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SyncWorks - 引越し業者管理システム',
    description: '引越し業者の業務管理と顧客対応を効率化するシステム',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
};

/**
 * ルートレイアウトコンポーネント
 * @param children - 子コンポーネント
 * @returns レイアウト要素
 */
export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html 
      lang="ja" 
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* プリロード重要リソース */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 重要なCSS変数のインライン設定 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-sans: ${geistSans.style.fontFamily};
              --font-mono: ${geistMono.style.fontFamily};
            }
          `
        }} />
      </head>
      <body 
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          メインコンテンツにスキップ
        </a>
        
        {/* Main content wrapper */}
        <div id="main-content">
          {children}
        </div>

        {/* Script for theme detection */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `
          }}
        />
      </body>
    </html>
  );
}
