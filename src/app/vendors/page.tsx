'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

// ダミーデータ
const vendors = [
    { id: 1, name: 'ABC引越し', totalRating: 4.3 },
    { id: 2, name: 'XYZ運送', totalRating: 3.8 },
    { id: 3, name: 'QuickMove', totalRating: 4.7 }
];

export default function VendorsPage() {
    // 星を表示するコンポーネント
    const renderStars = (rating: number, size: number = 20) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    style={{ width: size, height: size }}
                    className={`mr-1 ${i <= Math.floor(rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                />
            );
        }
        return <div className="flex items-center">{stars}</div>;
    };

    return (
        <main className="bg-gray-50 text-gray-800 min-h-screen">
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

            <section className="py-16 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">引越し事業者一覧</h2>
                <div className="space-y-4">
                    {vendors.map((vendor) => (
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
                                        {renderStars(vendor.totalRating, 16)}
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
