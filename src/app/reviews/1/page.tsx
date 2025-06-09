'use client';

import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function VendorReviewsPage() {
    const params = useParams<{ vendorId: string }>();
    const vendorId = params.vendorId;

    const [introExpanded, setIntroExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');

    // ダミーデータ
    const vendorReview = {
        vendorName: 'ABC引越し',
        totalRating: 4.3,
        totalReviews: 3,
        description: `
私たちは、年間700件以上の引越しを手がけるプロ集団です。
お客様の大切なお荷物を、安全・確実にお届けすることを最優先に考え、保険完備で万が一のトラブルにも備えています。
土日祝や深夜でも追加料金なしで柔軟に対応し、急なご依頼にもスピーディーにお応えします。
「安心・安全・柔軟」をモットーに、これからもお客様の新生活を全力でサポートします。`,

        features: [
            '年間実績700件超',
            '土日祝・深夜問わず料金変わらず',
            '安心の保険完備',
            '関東全域、長距離もお任せ下さい',
            '急なご依頼もご相談下さい'
        ],

        experienceYears: 6,
        staffCount: 1,

        reviews: [
            {
                id: 1,
                priceSatisfaction: 4,
                workQuality: 5,
                responseQuality: 4,
                comment:
                    '価格も手頃で、スタッフの対応がとても良かったです。おすすめです！また利用したいと思います！',
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

    // 口コミ（新しい日付順でソート）
    const sortedReviews = vendorReview.reviews
        .slice()
        .sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime());


    // 星を表示するコンポーネント
    const renderStars = (rating: number, size: number = 20) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const fillPercentage = Math.min(Math.max(rating - i + 1, 0), 1) * 100;
            stars.push(
                <div key={i} className="relative inline-block">
                    {/* 背景（空の星） */}
                    <Star
                        style={{ width: size, height: size }}
                        className="text-gray-300"
                    />
                    {/* 前景（黄色の星） */}
                    <Star
                        style={{
                            width: size,
                            height: size,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
                        }}
                        className="text-yellow-500 fill-yellow-500"
                    />
                </div>
            );
        }
        return <div className="flex items-center">{stars}</div>;
    };


    const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]);
    const toggleExpand = (id: number) => {
        if (expandedReviewIds.includes(id)) {
            setExpandedReviewIds(expandedReviewIds.filter((item) => item !== id));
        } else {
            setExpandedReviewIds([...expandedReviewIds, id]);
        }
    };

    const [overflowingReviews, setOverflowingReviews] = useState<{ [id: number]: boolean }>({});
    const commentRefs = useRef<{ [id: number]: HTMLQuoteElement | null }>({});

    useEffect(() => {
        // setTimeoutでDOMレンダリング完了後に実行
        setTimeout(() => {
            const newOverflowingReviews: { [id: number]: boolean } = {};
            vendorReview.reviews.forEach((review) => {
                const el = commentRefs.current[review.id];
                if (el) {
                    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
                    newOverflowingReviews[review.id] = isOverflowing;
                }
            });
            setOverflowingReviews(newOverflowingReviews);
        }, 0);
    }, [activeTab]);

    return (
        <main className="bg-gray-50 text-gray-800">
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

            <section className="pt-16 max-w-4xl mx-auto">
                {/* タブメニュー */}
                <div className="flex border-b mb-6">
                    <button
                        className={`flex-1 text-center py-2 font-semibold ${activeTab === 'profile'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-400'
                            }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        事業者情報
                    </button>
                    <button
                        className={`flex-1 text-center py-2 font-semibold ${activeTab === 'reviews'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-400'
                            }`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        口コミ（{vendorReview.totalReviews}件）
                    </button>
                </div>

                {/* タブ切り替え */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <div className="flex flex-col items-start">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {vendorReview.vendorName}
                            </h2>
                            <div className="flex items-center space-x-2 mb-4">
                                <p className="text-sm font-bold text-gray-800">
                                    総合満足度
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {vendorReview.totalRating.toFixed(1)}
                                </p>
                                <div className="text-2xl">
                                    {renderStars(vendorReview.totalRating, 32)}
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-full">
                                <img src="/truck-icon.png" alt="アイコン" className="w-30 h-30" />
                            </div>
                            <div className="mt-4 mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">事業コンセプト</h3>
                                <p className="list-disc list-inside space-y-1">{vendorReview.description}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">アピールポイント</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {vendorReview.features.map((feature, index) => (
                                        <li key={index} className="text-gray-700">{feature}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">経験年数</h3>
                                <p className="text-gray-700">{vendorReview.experienceYears}年</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">従業員数</h3>
                                <p className="text-gray-700">{vendorReview.staffCount}人</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">追加可能なオプション</h3>

                                {/* 無料オプション */}
                                <div className="mb-2">
                                    <h4 className="font-semibold text-green-600 mb-1">無料オプション</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li className="text-gray-700">ハンガーボックス貸出し</li>
                                    </ul>
                                </div>

                                {/* 有料オプション */}
                                <div>
                                    <h4 className="font-semibold text-green-600 mb-1">有料オプション（税込）</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li className="text-gray-700">ベッドマットカバー貸出し（800円/枚）</li>
                                        <li className="text-gray-700">洗濯機の取外し（固定）2000円/台</li>
                                        <li className="text-gray-700">照明の取外し（500円/個）</li>
                                        <li className="text-gray-700">家具の養生（500円/個）</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">対応不可</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li className="text-gray-700">段ボールの事前お届け・初回のみのお引き取り時のみ有料</li>
                                    <li className="text-gray-700">大型金庫・金庫類の運搬</li>
                                    <li className="text-gray-700">仏壇（大きいもの）</li>
                                    <li className="text-gray-700">ガムテープ</li>
                                    <li className="text-gray-700">洗濯機の設置（ドラム式）</li>
                                </ul>
                            </div>

                            <div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-700 mb-2">お支払い対応情報</h3>
                                    <ul className="list-none space-y-1">
                                        <li className="text-gray-700">❌ クレジットカード（対応不可）</li>
                                        <li className="text-gray-700">❌ 電子決済（QRコード）（対応不可）</li>
                                        <li className="text-gray-700">❌ 銀行振込（対応不可）</li>
                                        <li className="text-gray-700">✅ 当日現金支払い（対応可）</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-6 text-sm">
                        {vendorReview.reviews.slice()
                            .sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime())
                            .map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-md p-6 relative">
                                    <p className="text-xs text-gray-400 mb-2">
                                        作業日: {review.workDate}
                                    </p>

                                    <div className="mb-4 flex space-x-4">
                                        <div className="flex flex-col items-center bg-gray-100 rounded p-2 w-24">
                                            <p className="text-gray-500 text-xs">価格満足</p>
                                            <div className="text-lg">
                                                <span className="font-semibold">⭐ {review.priceSatisfaction}</span>
                                                <span className="font-normal text-xs"> / 5</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center bg-gray-100 rounded p-2 w-24">
                                            <p className="text-gray-500 text-xs">作業品質</p>
                                            <div className="text-lg">
                                                <span className="font-semibold">⭐ {review.workQuality}</span>
                                                <span className="font-normal text-xs"> / 5</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center bg-gray-100 rounded p-2 w-24">
                                            <p className="text-gray-500 text-xs">応対品質</p>
                                            <div className="text-lg">
                                                <span className="font-semibold">⭐ {review.responseQuality}</span>
                                                <span className="font-normal text-xs"> / 5</span>
                                            </div>
                                        </div>
                                    </div>

                                    <blockquote
                                        ref={(el) => {
                                            commentRefs.current[review.id] = el
                                        }}
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
                )}
            </section>
        </main>
    );
}
