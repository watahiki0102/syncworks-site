/**
 * 引越し事業者一覧ページコンポーネント
 * - 登録事業者の一覧表示
 * - 評価順でのソート機能
 * - 料金設定ページへの誘導
 */
'use client';

import Link from 'next/link';
import StarRating from '@/components/StarRating';

/**
 * 事業者データの型定義
 */
interface Vendor {
  id: number;        // 事業者ID
  name: string;      // 事業者名
  totalRating: number; // 総合評価
}

/**
 * ダミー事業者データ
 * 実際のアプリケーションではAPIから取得
 */
const vendors: Vendor[] = [
    { id: 1, name: 'ABC引越し', totalRating: 4.3 },
    { id: 2, name: 'XYZ運送', totalRating: 3.8 },
    { id: 3, name: 'QuickMove', totalRating: 4.7 }
];

export default function VendorsPage() {
    /**
     * 評価の高い順（降順）で事業者をソート
     */
    const sortedVendors = vendors.slice().sort((a, b) => b.totalRating - a.totalRating);

    return (
        <main className="bg-gray-50 text-gray-800 min-h-screen">
            {/* ヘッダー */}
            <header className="bg-white shadow">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-800">SyncWorks</div>
                    <nav className="space-x-6 text-sm text-gray-700">
                        <a href="/" className="hover:text-blue-600">
                            ホーム
                        </a>
                    </nav>
                </div>
            </header>

            {/* メインコンテンツ */}
            <section className="py-16 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4">引越し事業者一覧</h2>
                    <Link
                        href="/pricing/step0"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-6"
                    >
                        💰 料金設定を開始
                    </Link>
                </div>
                
                {/* 事業者リスト */}
                <div className="space-y-4">
                    {sortedVendors.map((vendor) => (
                        <Link
                            key={vendor.id}
                            href={`/reviews/${vendor.id}`}
                            className="block bg-white rounded-lg shadow-md p-4 hover:bg-blue-50 transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{vendor.name}</h3>
                                    <div className="flex items-center mt-1 space-x-2">
                                        <span className="text-xl font-bold text-gray-800">
                                            {vendor.totalRating.toFixed(1)}
                                        </span>
                                        <StarRating rating={vendor.totalRating} size={16} />
                                    </div>
                                </div>
                                <div className="text-blue-500 text-sm hover:underline">詳細</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
