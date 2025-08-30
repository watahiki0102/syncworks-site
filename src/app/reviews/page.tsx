/**
 * お客様の声ページ
 * - 実際のお客様からのレビューと評価の表示
 * - サービス利用体験談
 */
'use client';

import { useState } from 'react';
import { Star, Quote, Users, ThumbsUp, Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { TEST_REVIEWS } from '@/constants/testData';



export default function ReviewsPage() {
    const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]);
    // const [overflowingReviews, setOverflowingReviews] = useState<{ [id: number]: boolean }>({});
    // const commentRefs = useRef<{ [id: number]: HTMLQuoteElement | null }>({});

    // 統計情報
    const stats = {
        totalReviews: TEST_REVIEWS.length,
        averageRating: TEST_REVIEWS.reduce((acc, review) => acc + review.rating, 0) / TEST_REVIEWS.length,
        satisfactionRate: Math.round((TEST_REVIEWS.filter(r => r.rating >= 4).length / TEST_REVIEWS.length) * 100),
        verifiedReviews: TEST_REVIEWS.filter(r => r.verified).length
    };

    /**
     * レビューを新しい日付順でソート
     */
    const sortedReviews = TEST_REVIEWS
        .slice()
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    
    /**
     * レビューの展開/折りたたみを切り替え
     */
    const toggleExpand = (id: number) => {
        if (expandedReviewIds.includes(id)) {
            setExpandedReviewIds(expandedReviewIds.filter((item) => item !== id));
        } else {
            setExpandedReviewIds([...expandedReviewIds, id]);
        }
    };

    /**
     * 星評価コンポーネント
     */
    const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-${size === 16 ? '4' : '5'} h-${size === 16 ? '4' : '5'} ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <Layout currentPath="/reviews">
            {/* ヒーローセクション */}
            <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        お客様の声
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                        SyncWorksをご利用いただいたお客様から
                        いただいた貴重なご意見をご紹介します
                    </p>
                </div>
            </section>

            <div className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 統計情報 */}
                    <div className="mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalReviews}</div>
                                <div className="text-sm text-gray-600">総レビュー数</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.averageRating.toFixed(1)}</div>
                                <div className="text-sm text-gray-600">平均評価</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <ThumbsUp className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.satisfactionRate}%</div>
                                <div className="text-sm text-gray-600">満足度</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <Clock className="w-8 h-8 text-purple-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.verifiedReviews}</div>
                                <div className="text-sm text-gray-600">認証済みレビュー</div>
                            </div>
                        </div>
                    </div>

                    {/* レビュー一覧 */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                            実際にご利用いただいたお客様からの声
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-md p-6 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Quote className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-gray-900">{review.customerName}</span>
                                            {review.verified && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    認証済み
                                                </span>
                                            )}
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="text-sm text-gray-600">
                                            <span>{review.location}</span> • <span>{review.serviceType}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            利用日: {review.serviceDate}
                                        </div>
                                    </div>

                                    <blockquote 
                                        className={`text-gray-700 leading-relaxed ${expandedReviewIds.includes(review.id) ? '' : 'line-clamp-4'}`}
                                    >
                                        {review.comment}
                                    </blockquote>

                                    {review.comment.length > 150 && (
                                        <button
                                            onClick={() => toggleExpand(review.id)}
                                            className="text-blue-600 text-sm mt-2 hover:underline"
                                        >
                                            {expandedReviewIds.includes(review.id) ? '閉じる' : '続きを読む'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA セクション */}
                    <div className="mt-16 text-center">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                あなたも SyncWorks で理想の引越しを
                            </h3>
                            <p className="text-gray-700 mb-6">
                                信頼できる引越し業者をお探しですか？
                                無料で複数の業者から見積もりを取得できます。
                            </p>
                            <a
                                href="/form/step1"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                                無料見積もりを依頼する
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
