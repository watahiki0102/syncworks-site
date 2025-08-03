/**
 * 引越し事業者一覧ページコンポーネント
 * - 登録事業者の一覧表示
 * - 検索・フィルタリング機能
 * - レスポンシブデザイン対応
 * - 統一されたレイアウト使用
 */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import StarRating from '@/components/StarRating';

/**
 * 事業者データの型定義
 */
interface Vendor {
  id: number;
  name: string;
  totalRating: number;
  reviewCount: number;
  location: string;
  experienceYears: number;
  staffCount: number;
  description: string;
  specialties: string[];
  priceRange: string;
  image?: string;
}

/**
 * 拡張された事業者データ
 * 実際のアプリケーションではAPIから取得
 */
const vendors: Vendor[] = [
  {
    id: 1,
    name: 'ABC引越し',
    totalRating: 4.3,
    reviewCount: 127,
    location: '東京都渋谷区',
    experienceYears: 8,
    staffCount: 15,
    description: '地域密着型の引越し専門業者。丁寧な作業と安心の料金体系で多くのお客様にご利用いただいています。',
    specialties: ['単身引越し', '家族引越し', '長距離引越し'],
    priceRange: '¥20,000〜¥100,000'
  },
  {
    id: 2,
    name: 'XYZ運送',
    totalRating: 3.8,
    reviewCount: 89,
    location: '東京都新宿区',
    experienceYears: 12,
    staffCount: 25,
    description: '創業12年の実績ある運送会社。大型家具の運搬から繊細な荷物まで、安全確実にお運びします。',
    specialties: ['大型家具', 'オフィス移転', 'ピアノ運送'],
    priceRange: '¥25,000〜¥150,000'
  },
  {
    id: 3,
    name: 'QuickMove',
    totalRating: 4.7,
    reviewCount: 203,
    location: '東京都品川区',
    experienceYears: 6,
    staffCount: 20,
    description: '迅速・丁寧をモットーに、お客様の新生活を全力でサポート。土日祝日も対応可能です。',
    specialties: ['即日対応', '深夜作業', '梱包サービス'],
    priceRange: '¥18,000〜¥120,000'
  },
  {
    id: 4,
    name: 'SafeMove引越センター',
    totalRating: 4.1,
    reviewCount: 156,
    location: '東京都世田谷区',
    experienceYears: 10,
    staffCount: 18,
    description: '保険完備で安心の引越しサービス。女性スタッフも在籍しており、一人暮らしの女性も安心してご利用いただけます。',
    specialties: ['女性スタッフ対応', '保険完備', 'エアコン工事'],
    priceRange: '¥22,000〜¥110,000'
  }
];

type SortOption = 'rating' | 'reviews' | 'experience' | 'price';

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);

  // 検索とソートの処理
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.totalRating - a.totalRating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'experience':
          return b.experienceYears - a.experienceYears;
        case 'price':
          return a.name.localeCompare(b.name); // 仮の価格ソート
        default:
          return 0;
      }
    });
  }, [searchTerm, sortBy]);

  return (
    <Layout currentPath="/vendors">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            お客様の声
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            実際にサービスをご利用いただいたお客様の声をご紹介します。<br className="hidden md:block" />
            信頼できる引越し業者をお選びください。
          </p>
          <Link
            href="/form/step1"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            無料見積もりを始める
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 検索・フィルターセクション */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 検索バー */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="業者名、地域、サービスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ソート・フィルター */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">評価順</option>
                <option value="reviews">口コミ数順</option>
                <option value="experience">経験年数順</option>
                <option value="price">価格順</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                フィルター
              </button>
            </div>
          </div>

          {/* 検索結果数 */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredAndSortedVendors.length}件の引越し業者が見つかりました
          </div>
        </div>
      </section>

      {/* 事業者一覧セクション */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAndSortedVendors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                該当する業者が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                検索条件を変更してもう一度お試しください
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                検索条件をクリア
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/reviews/${vendor.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* ヘッダー情報 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {vendor.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {vendor.experienceYears}年
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {vendor.staffCount}名
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {vendor.totalRating.toFixed(1)}
                          </span>
                          <StarRating rating={vendor.totalRating} size={20} />
                        </div>
                        <div className="text-sm text-gray-600">
                          {vendor.reviewCount}件の口コミ
                        </div>
                      </div>
                    </div>

                    {/* 説明文 */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {vendor.description}
                    </p>

                    {/* 特徴タグ */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {/* 料金範囲と詳細ボタン */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-sm text-gray-600">料金目安:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {vendor.priceRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-medium">
                        口コミを見る
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            お気に入りの業者が見つかりましたか？
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            まずは無料見積もりで詳細な料金をご確認ください
          </p>
          <Link
            href="/form/step1"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            無料見積もりを始める
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
