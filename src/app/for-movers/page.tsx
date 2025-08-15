/**
 * 引越し事業者向けページ
 * - 事業者管理画面の機能紹介
 * - 業務改善インパクトの訴求
 * - 導入フローの説明
 * - 事業者向けFAQ
 */
'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { ImpactStats } from './components/ImpactStats';
import { Flow } from './components/Flow';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';

export default function ForMoversPage() {
  return (
    <Layout>
      <main role="main">
        {/* ヒーローセクション */}
        <Hero />
        
        {/* 機能紹介セクション */}
        <section id="features" aria-labelledby="features-heading" className="py-16 bg-gray-50">
          <FeatureGrid />
        </section>
        
        {/* 業務改善インパクトセクション */}
        <section aria-labelledby="impact-heading" className="py-16 bg-white">
          <ImpactStats />
        </section>
        
        {/* 導入フローセクション */}
        <section aria-labelledby="flow-heading" className="py-16 bg-gray-50">
          <Flow />
        </section>
        
        {/* FAQセクション */}
        <section aria-labelledby="faq-heading" className="py-16 bg-white">
          <FAQ />
        </section>
        
        {/* CTAセクション */}
        <section aria-labelledby="cta-heading" className="py-16 bg-blue-600">
          <CTA />
        </section>
      </main>
    </Layout>
  );
}
