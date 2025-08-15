/**
 * 事業者向けFAQコンポーネント
 * - 3つの主要な質問と回答
 * - アコーディオン形式での表示
 * - レスポンシブデザイン
 */
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: '初期費用や月額は？',
    answer: '初期費用・月額ともに0円です。成果報酬のみの料金体系となっており、実際に案件が成立した場合のみ手数料をお支払いいただきます。'
  },
  {
    question: '小規模でも使える？',
    answer: 'はい、地域密着型の事業者さまに適しています。従業員数や規模に関係なく、1社からでもご利用いただけます。'
  },
  {
    question: '最短いつから？',
    answer: 'ご契約・初期設定後すぐにご利用いただけます。テスト運用も可能で、実際の業務に合わせて段階的に導入できます。'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      {/* セクションヘッダー */}
      <div className="text-center mb-16">
        <h2 
          id="faq-heading" 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
        >
          よくあるご質問
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          事業者の方からよくいただく質問と回答をご紹介します
        </p>
      </div>
      
      {/* FAQリスト */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 質問 */}
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="text-lg font-medium text-gray-900">
                {item.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {/* 回答 */}
            <div
              id={`faq-answer-${index}`}
              className={`px-6 transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? 'max-h-48 opacity-100 pb-4' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 追加サポート情報 */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            他にもご質問がございましたら
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            専門スタッフが丁寧にお答えいたします。お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              お問い合わせ
            </a>
            <a
              href="tel:0120-000-000"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              お電話でのお問い合わせ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
