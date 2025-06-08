'use client';

import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function VendorReviewsPage() {
    const params = useParams<{ vendorId: string }>();
    const vendorId = params.vendorId;

    // ダミーデータ
    const vendorReview = {
        vendorName: 'ABC引越し',
        totalRating: 4.3,
        reviews: [
            {
                id: 1,
                priceSatisfaction: 4,
                workQuality: 5,
                responseQuality: 4,
                comment:
                    '価格も手頃で、スタッフの対応がとても良かったです。おすすめです！また利用したいと思います！本当に最高でした！',
                workDate: '2024-06-05'
            },
            {
                id: 2,
                priceSatisfaction: 3,
                workQuality: 4,
                responseQuality: 5,
                comment:
                    '作業は丁寧でしたが、見積もり時の説明が少し足りなかったです。問い合わせにもすぐに対応してくれて助かりました！',
                workDate: '2024-06-07'
            },
            {
                id: 3,
                priceSatisfaction: 5,
                workQuality: 5,
                responseQuality: 5,
                comment: '対応も早く、作業もスムーズで満足しています。',
                workDate: '2024-06-10'
            }
        ]
    };

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

    // コメント展開状態
    const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]);
    const toggleExpand = (id: number) => {
        if (expandedReviewIds.includes(id)) {
            setExpandedReviewIds(expandedReviewIds.filter((item) => item !== id));
        } else {
            setExpandedReviewIds([...expandedReviewIds, id]);
        }
    };

    // コメント行数チェック
    const [overflowingReviews, setOverflowingReviews] = useState<{ [id: number]: boolean }>({});
    const commentRefs = useRef<{ [id: number]: HTMLQuoteElement | null }>({});

    useEffect(() => {
        const newOverflowingReviews: { [id: number]: boolean } = {};
        vendorReview.reviews.forEach((review) => {
            const el = commentRefs.current[review.id];
            if (el) {
                const isOverflowing = el.scrollHeight > el.clientHeight + 1; // 1pxの誤差吸収
                newOverflowingReviews[review.id] = isOverflowing;
            }
        });
        setOverflowingReviews(newOverflowingReviews);
    }, []);

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
                {/* 総合評価 */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-10 flex items-center justify-start space-x-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {vendorReview.vendorName}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <p className="text-3xl font-bold text-gray-800">
                                {vendorReview.totalRating.toFixed(1)}
                            </p>
                            {renderStars(vendorReview.totalRating, 32)}
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        {/* アイコン画像 */}
                        <img src="/truck-icon.png" alt="アイコン" className="w-30 h-30" />
                    </div>
                </div>

                {/* 個別レビュー */}
                <div className="space-y-6 text-sm">
                    {vendorReview.reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg shadow-md p-6 relative">
                            {/* 作業日（右上） */}
                            <p className="absolute top-4 right-4 text-xs text-gray-400">
                                作業日: {review.workDate}
                            </p>

                            <div className="mb-4">
                                {/* 価格満足 */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <p className="text-gray-500">価格満足</p>
                                    {renderStars(review.priceSatisfaction, 16)}
                                </div>
                                {/* 作業品質 */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <p className="text-gray-500">作業品質</p>
                                    {renderStars(review.workQuality, 16)}
                                </div>
                                {/* 応対品質 */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <p className="text-gray-500">応対品質</p>
                                    {renderStars(review.responseQuality, 16)}
                                </div>
                            </div>
                            <blockquote
                                ref={(el) => (commentRefs.current[review.id] = el)}
                                className={`border-l-4 border-blue-500 pl-4 text-gray-700 italic bg-gray-100 p-2 overflow-hidden ${expandedReviewIds.includes(review.id) ? '' : 'line-clamp-2'
                                    }`}
                            >
                                {review.comment}
                            </blockquote>
                            {overflowingReviews[review.id] && (
                                <button
                                    onClick={() => toggleExpand(review.id)}
                                    className="text-blue-500 text-xs mt-2 hover:underline"
                                >
                                    {expandedReviewIds.includes(review.id) ? '閉じる' : '続きを読む'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
