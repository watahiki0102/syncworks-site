/**
 * 引越し事業者一覧ページコンポーネント
 * - 登録事業者の一覧表示
 * - 検索・フィルタリング機能
 * - レスポンシブデザイン対応
 * - 統一されたレイアウト使用
 */
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
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
  serviceAreas: string[];  // 対応可能地域に変更
  experienceYears: number;
  staffCount: number;
  description: string;
  specialties: string[];
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
    serviceAreas: ['東京都全域', '神奈川県', '千葉県', '埼玉県', '茨城県', '栃木県'],
    experienceYears: 8,
    staffCount: 15,
    description: '地域密着型の引越し専門業者。丁寧な作業と安心の料金体系で多くのお客様にご利用いただいています。',
    specialties: ['単身引越し', '家族引越し', '長距離引越し']
  },
  {
    id: 2,
    name: 'XYZ運送',
    totalRating: 3.8,
    reviewCount: 89,
    serviceAreas: ['東京都', '神奈川県', '大阪府', '京都府', '兵庫県'],
    experienceYears: 12,
    staffCount: 25,
    description: '創業12年の実績ある運送会社。大型家具の運搬から繊細な荷物まで、安全確実にお運びします。',
    specialties: ['大型家具', 'オフィス移転', 'ピアノ運送']
  },
  {
    id: 3,
    name: 'QuickMove',
    totalRating: 4.7,
    reviewCount: 203,
    serviceAreas: ['東京都', '神奈川県', '千葉県', '愛知県', '静岡県', '山梨県'],
    experienceYears: 6,
    staffCount: 20,
    description: '迅速・丁寧をモットーに、お客様の新生活を全力でサポート。土日祝日も対応可能です。',
    specialties: ['即日対応', '深夜作業', '梱包サービス']
  },
  {
    id: 4,
    name: 'SafeMove引越センター',
    totalRating: 4.1,
    reviewCount: 156,
    serviceAreas: ['東京都世田谷区', '目黒区', '渋谷区', '港区', '新宿区', '品川区'],
    experienceYears: 10,
    staffCount: 18,
    description: '保険完備で安心の引越しサービス。女性スタッフも在籍しており、一人暮らしの女性も安心してご利用いただけます。',
    specialties: ['女性スタッフ対応', '保険完備', 'エアコン工事']
  },
  {
    id: 5,
    name: '関西エクスプレス',
    totalRating: 4.5,
    reviewCount: 178,
    serviceAreas: ['大阪府', '京都府', '兵庫県', '奈良県', '滋賀県', '和歌山県'],
    experienceYears: 15,
    staffCount: 32,
    description: '関西地方専門の引越し業者。地域の特性を熟知したスタッフが、お客様の引越しを完全サポートします。',
    specialties: ['関西地方特化', '短距離引越し', '学生引越し']
  },
  {
    id: 6,
    name: '中部運輸サービス',
    totalRating: 4.2,
    reviewCount: 134,
    serviceAreas: ['愛知県', '岐阜県', '三重県', '静岡県', '長野県', '富山県'],
    experienceYears: 11,
    staffCount: 28,
    description: '中部地方を中心にサービスを展開。工業地帯での企業移転も多数実績があります。',
    specialties: ['企業移転', '工場移転', '精密機器運搬']
  },
  {
    id: 7,
    name: '九州引越センター',
    totalRating: 4.0,
    reviewCount: 95,
    serviceAreas: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    experienceYears: 9,
    staffCount: 22,
    description: '九州全域をカバーする引越し業者。離島への引越しも対応可能です。',
    specialties: ['離島対応', '長距離引越し', '海外引越し']
  },
  {
    id: 8,
    name: '北海道ムービング',
    totalRating: 4.4,
    reviewCount: 112,
    serviceAreas: ['北海道札幌市', '旭川市', '函館市', '釧路市', '帯広市'],
    experienceYears: 13,
    staffCount: 26,
    description: '北海道の厳しい気候条件にも対応。冬季の引越しも安心してお任せください。',
    specialties: ['冬季対応', '北海道内専門', '寒冷地対策']
  }
];

/**
 * 地方・都道府県データ（admin/profileページと同様の構造）
 */
const REGIONS = [
  { name: '北海道・東北', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', prefectures: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', prefectures: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] }
];

type SortOption = 'rating' | 'reviews' | 'experience';

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // フィルター外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // 検索とソートの処理
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      // 1. 地域フィルターチェック
      let passesAreaFilter = true;

      if (selectedPrefectures.length > 0) {
        const serviceAreasText = vendor.serviceAreas.join(' ');
        passesAreaFilter = selectedPrefectures.some(pref => {
          // 都道府県名から都・県・府を除いた名前でもマッチ
          const prefCore = pref.replace(/[都道府県]/g, '');
          return serviceAreasText.includes(pref) || serviceAreasText.includes(prefCore);
        });
      }

      // 2. 検索条件チェック
      const passesSearchFilter = !searchTerm.trim() ||
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.serviceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()));

      return passesAreaFilter && passesSearchFilter;
    });
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.totalRating - a.totalRating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'experience':
          return b.experienceYears - a.experienceYears;
        default:
          return 0;
      }
    });
  }, [searchTerm, sortBy, selectedPrefectures]);

  // 地方選択
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
  };

  // 都道府県チェック
  const handlePrefectureToggle = (pref: string) => {
    setSelectedPrefectures(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  // 都道府県タグ削除
  const handleRemovePrefTag = (pref: string) => {
    setSelectedPrefectures(prev => prev.filter(p => p !== pref));
  };

  // フィルターリセット
  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedPrefectures([]);
    setSearchTerm('');
  };

  return (
    <Layout currentPath="/vendors">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            引越し業者一覧
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            全国の信頼できる引越し業者が揃っています。<br className="hidden md:block" />
            お客様のニーズに合った業者をお選びください。
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
                placeholder="業者名、サービスで検索..."
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
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                対応地域で絞り込み
              </button>
            </div>
          </div>

          {/* フィルターパネル */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white rounded-lg shadow-md border" ref={filterRef}>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">対応地域で絞り込み</h3>

                {/* 地方選択ボタン */}
                <div className="mb-4">
                  <div className="mb-2 font-medium text-gray-700">地域を選択</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {REGIONS.map(region => (
                      <button
                        key={region.name}
                        type="button"
                        className={`px-3 py-2 rounded-md border transition-colors ${selectedRegion === region.name
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        onClick={() => handleRegionSelect(region.name)}
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 都道府県選択 */}
                {selectedRegion && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700">都道府県を選択（複数可）</div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 border border-blue-200 transition-colors"
                          onClick={() => {
                            const prefs = REGIONS.find(r => r.name === selectedRegion)?.prefectures || [];
                            setSelectedPrefectures(prev => Array.from(new Set([...prev, ...prefs])));
                          }}
                        >
                          すべて選択
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 border border-gray-200 transition-colors"
                          onClick={() => {
                            const prefs = REGIONS.find(r => r.name === selectedRegion)?.prefectures || [];
                            setSelectedPrefectures(prev => prev.filter(p => !prefs.includes(p)));
                          }}
                        >
                          すべて外す
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {REGIONS.find(r => r.name === selectedRegion)?.prefectures.map(pref => (
                        <label key={pref} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPrefectures.includes(pref)}
                            onChange={() => handlePrefectureToggle(pref)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 選択済み都道府県タグ */}
                {selectedPrefectures.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">選択中の都道府県</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrefectures.map(pref => (
                        <span
                          key={pref}
                          className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {pref}
                          <button
                            type="button"
                            onClick={() => handleRemovePrefTag(pref)}
                            className="ml-2 text-blue-600 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* フィルターリセットボタン */}
                <div className="flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    フィルターをリセット
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 検索結果数 */}
          <div className="mt-4 text-sm text-gray-600">
            {selectedPrefectures.length > 0 && (
              <span className="text-blue-600 font-medium">
                {selectedPrefectures.join('、')}での検索結果:
              </span>
            )}
            <span className="ml-1">
              {filteredAndSortedVendors.length}件の引越し業者が見つかりました
            </span>
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
                onClick={handleResetFilters}
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
                  href={`/form/step1?vendor=${vendor.id}`}
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
                            <span>対応地域: {vendor.serviceAreas.join('、')}</span>
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

                    {/* 詳細ボタンのみ表示 */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-blue-600 font-medium">
                        見積もり依頼
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
