/**
 * トップページコンポーネント
 * - SyncWorksのメインランディングページ
 * - サービス紹介と事業者向け案内
 * - レスポンシブデザイン対応
 */
'use client';

import { Handshake, Calculator, HomeIcon, Settings } from 'lucide-react';

export default function Home() {
  /**
   * ハンバーガーメニューの表示/非表示を切り替え
   */
  const toggleMenu = () => {
    const menu = document.getElementById('menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

  return (
    <main className="bg-white text-gray-800">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">SyncWorks</div>
          <div className="flex items-center">
            <a href="/admin/login" className="text-xs text-gray-700 hover:bg-gray-100 mr-4">事業者はこちら</a>
            <a href="/vendors" className="text-xs text-gray-700 hover:bg-gray-100 mr-4">口コミ</a>
          </div>
          <nav className="space-x-6 text-sm text-gray-700">
            <div className="relative">
              <button
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
                onClick={toggleMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
              <div id="menu" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 hidden">
                <a href="#service" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">サービス</a>
                <a href="/admin/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">事業者はこちら</a>
                <a href="/vendors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">口コミ</a>
                <a href="#news" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">お知らせ</a>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">引越しを、もっとシンプルに</h1>
        <p className="text-lg">SyncWorksは、引越しのマッチングを通じて、スムーズな住まいの移転をサポートします。</p>
        <a
          href="/form/step1"
          className="inline-block bg-white text-blue-600 font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
        >
          無料見積もり申し込み
        </a>
      </section>

      {/* SyncMoving概要セクション */}
      <section id="service" className="py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">引越しマッチングサービス「SyncMoving」</h2>
        <p className="text-gray-600">SyncMovingは、不動産契約後のお客様と地域の引越し業者をつなぐ、相見積もり支援サービスです。条件入力は一度だけ、上位3社から自動で見積もりが届き、価格交渉不要で安心して選べます。</p>
      </section>

      {/* サービスの特徴セクション */}
      <section className="bg-gray-50 py-16">
        <h3 className="text-xl font-bold text-center mb-10">サービスの特徴</h3>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="flex justify-center mb-4 text-blue-600"><Handshake size={32} /></div>
            <h4 className="font-semibold text-blue-600 mb-2">引越しマッチング</h4>
            <p>地域の信頼できる引越し業者から、条件に合った業者を自動でご案内します。</p>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="flex justify-center mb-4 text-blue-600"><Calculator size={32} /></div>
            <h4 className="font-semibold text-blue-600 mb-2">安心の料金体系</h4>
            <p>初回提示金額のままご契約いただける安心設計で、あとからの価格交渉はありません。</p>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="flex justify-center mb-4 text-blue-600"><HomeIcon size={32} /></div>
            <h4 className="font-semibold text-blue-600 mb-2">不動産連携</h4>
            <p>地域の不動産会社を通じて紹介されることで、質の高い見込み顧客とのマッチングが実現します。</p>
          </div>
        </div>
      </section>

      {/* 事業者用セクション */}
      <section className="bg-white py-16">
        <h3 className="text-xl font-bold text-center mb-10">事業者用設定</h3>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-100 rounded p-6">
            <div className="flex justify-center mb-4 text-blue-600"><Settings size={32} /></div>
            <h4 className="font-semibold mb-2">事業者の皆様へ</h4>
            <p>引越し事業者として、サービスを開始しましょう。</p>
            <a href="/admin/login/" className="text-blue-500 hover:underline">事業者ログインページへ</a>
          </div>
        </div>
      </section>

      {/* 選ばれる理由セクション */}
      <section className="py-20 text-center">
        <h3 className="text-xl font-bold mb-10">選ばれる理由</h3>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 px-6">
          <div className="bg-gray-100 rounded p-6">
            <h4 className="font-semibold mb-2">信頼性の高いサービス</h4>
            <p>紹介されるのは、条件提示に納得し成約意志の高い顧客のみ。効率よく成約につながります。</p>
          </div>
          <div className="bg-gray-100 rounded p-6">
            <h4 className="font-semibold mb-2">迅速な対応</h4>
            <p>引越し条件の入力後、自動で複数業者に見積もり依頼が届き、手間なく比較が完了します。</p>
          </div>
        </div>
      </section>

      {/* お知らせセクション */}
      <section id="news" className="bg-gray-50 py-16">
        <h3 className="text-xl font-bold text-center mb-10">お知らせ</h3>
        <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
          <p className="text-sm text-gray-500 mb-1">2025年5月15日</p>
          <h4 className="font-semibold mb-1">SyncWorks公式サイトを公開しました。</h4>
          <p className="text-sm text-gray-600">引越しマッチングサービス「SyncMoving」の公式サイトをオープンしました。</p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-[#2d3f50] text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between">
          <div>
            <h4 className="font-bold mb-2">SyncWorks</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2">お問い合わせ</h4>
            <ul className="space-y-1 text-sm">
              <li> syncworks.official@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-300 mt-8">
          © 2025 SyncWorks. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
