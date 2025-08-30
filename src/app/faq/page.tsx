/**
 * よくあるご質問ページ
 * - 引越しサービスに関するFAQ
 * - アコーディオン形式での表示
 * - カテゴリ別の分類
 */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { TEST_FAQ } from '@/constants/testData';



export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <Layout currentPath="/faq">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            よくあるご質問
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            SyncWorksの引越しマッチングサービスに関する
            よくお寄せいただく質問をまとめました
          </p>
        </div>
      </section>

      {/* FAQ コンテンツ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {TEST_FAQ.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md">
                <button
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 追加情報セクション */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              その他のご質問について
            </h2>
            <p className="text-gray-700 mb-6">
              上記以外にもご不明な点がございましたら、
              お気軽にお問い合わせください。
            </p>
            <button
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-colors"
              onClick={() => window.location.href = '/contact'}
            >
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
} 