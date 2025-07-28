/**
 * 統一されたフッターコンポーネント
 * - 会社情報とリンク
 * - レスポンシブレイアウト
 * - アクセシビリティ対応
 */
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Heading, Text } from '@/components/ui';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

interface FooterProps {
  sections?: FooterSection[];
  contactInfo?: ContactInfo;
  companyName?: string;
  description?: string;
  copyrightYear?: number;
}

const defaultSections: FooterSection[] = [
  {
    title: 'サービス',
    links: [
      { label: '見積もり依頼', href: '/form/step1' },
      { label: '料金について', href: '/pricing' },
      { label: 'サービスエリア', href: '/areas' },
    ]
  },
  {
    title: '事業者向け',
    links: [
      { label: '事業者登録', href: '/admin/register' },
      { label: 'ログイン', href: '/admin/login' },
      { label: '料金設定', href: '/pricing/step1' },
    ]
  },
  {
    title: 'サポート',
    links: [
      { label: 'よくある質問', href: '/faq' },
      { label: 'お問い合わせ', href: '/contact' },
      { label: 'ヘルプ', href: '/help' },
    ]
  },
  {
    title: '会社情報',
    links: [
      { label: '会社概要', href: '/about' },
      { label: 'プライバシーポリシー', href: '/privacy' },
      { label: '利用規約', href: '/terms' },
    ]
  }
];

const defaultContactInfo: ContactInfo = {
  email: 'syncworks.official@gmail.com',
  phone: '03-1234-5678',
  address: '東京都渋谷区○○ 1-2-3'
};

const Footer: React.FC<FooterProps> = ({
  sections = defaultSections,
  contactInfo = defaultContactInfo,
  companyName = 'SyncWorks',
  description = '引越しのマッチングを通じて、スムーズな住まいの移転をサポートします。',
  copyrightYear = new Date().getFullYear()
}) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-12">
        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 会社情報 */}
          <div className="lg:col-span-2">
            <Heading level={3} size="xl" color="default" className="text-white mb-4">
              {companyName}
            </Heading>
            <Text variant="body" color="default" className="text-gray-300 mb-6 leading-relaxed">
              {description}
            </Text>

            {/* 連絡先情報 */}
            <div className="space-y-3">
              {contactInfo.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <Text variant="body" color="default" className="text-gray-300">
                    {contactInfo.address}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* ナビゲーションセクション */}
          {sections.map((section) => (
            <div key={section.title}>
              <Heading level={4} size="base" color="default" className="text-white mb-4">
                {section.title}
              </Heading>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ボーダー */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* フッター下部 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Text variant="small" color="default" className="text-gray-400">
            © {copyrightYear} {companyName}. All rights reserved.
          </Text>
          
          {/* 追加リンク */}
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export type { FooterProps, FooterSection, FooterLink, ContactInfo };
export default Footer; 