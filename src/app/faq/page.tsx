/**
 * よくあるご質問ページ
 * - 引越しサービスに関するFAQ
 * - アコーディオン形式での表示
 * - カテゴリ別の分類
 */
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Layout } from '@/components/layout';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: '見積もりは無料ですか？',
    answer: 'はい、見積もりは完全無料です。複数の引越し業者から見積もりを取得でき、追加料金は一切発生しません。'
  },
  {
    id: 2,
    question: '見積もりにはどのくらい時間がかかりますか？',
    answer: '基本情報の入力は約3分で完了します。見積もり結果は入力完了後、最短で当日中にお受け取りいただけます。'
  },
  {
    id: 3,
    question: '土日や祝日の引越しも対応していますか？',
    answer: 'はい、土日祝日の引越しにも対応しています。ただし、業者や時期によって料金が異なる場合がありますので、詳細は見積もり時にご確認ください。'
  },
  {
    id: 4,
    question: 'キャンセル料は発生しますか？',
    answer: '原則として発生するものとお考えください。'
  },
  {
    id: 5,
    question: '梱包材は提供してもらえますか？',
    answer: 'はい、多くの業者でダンボールや梱包材を提供しています。詳細な内容や料金については、各業者の見積もり時にご確認ください。'
  },
  {
    id: 6,
    question: 'エアコンの取り外し・取り付けはできますか？',
    answer: '対応可否は業者によって異なります。事前に業者ごとにご確認ください。'
  },
  {
    id: 7,
    question: '荷物の破損が心配です。保険はありますか？',
    answer: '補償内容に関しては、各業者にお問い合わせください。'
  },
  {
    id: 8,
    question: '引越し当日に立ち会いは必要ですか？',
    answer: 'はい、引越し当日はお客様の立ち会いが必要です。荷物の確認や新居での配置指示など、重要な作業がありますので、可能な限りご同席をお願いします。'
  },
  {
    id: 9,
    question: 'ペットの運搬はできますか？',
    answer: 'ペットの運搬は専門業者への依頼が必要な場合があります。一般的な引越し業者では対応できない場合が多いため、事前にご相談ください。'
  },
  {
    id: 10,
    question: '支払い方法はどのようなものがありますか？',
    answer: '現金払い、銀行振込、クレジットカード決済など、業者によって対応可能な支払い方法が異なります。詳細は各業者にご確認ください。'
  }
];

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
            {faqData.map((item) => (
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