import React from 'react';
import { Layout } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <Heading level={1} size="3xl" color="default" className="mb-4">
              プライバシーポリシー
            </Heading>
            <Text variant="body" color="muted" className="text-lg">
              個人情報保護方針
            </Text>
          </div>

          {/* 更新日 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <Text variant="body" color="default" className="text-center">
              <strong>最終更新日：</strong>2024年12月1日
            </Text>
          </div>

          {/* 基本方針 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              1. 基本方針
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              SyncWorks株式会社（以下「当社」といいます）は、お客様の個人情報の重要性を認識し、個人情報の保護に関する法律（以下「個人情報保護法」といいます）を遵守するとともに、適切な個人情報の取得、利用、管理を行います。
            </Text>
            <Text variant="body" color="default">
              当社は、お客様の個人情報を適切に取り扱い、お客様に安心してサービスをご利用いただけるよう、個人情報保護方針を定め、全従業員に周知徹底いたします。
            </Text>
          </div>

          {/* 個人情報の定義 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              2. 個人情報の定義
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              個人情報とは、個人情報保護法第2条第1項により定義された「生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）」をいいます。
            </Text>
            <Text variant="body" color="default">
              具体的には、氏名、住所、電話番号、メールアドレス、生年月日、その他当社が取得する個人を識別できる情報を指します。
            </Text>
          </div>

          {/* 個人情報の取得 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              3. 個人情報の取得
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              当社は、以下の方法により個人情報を取得いたします：
            </Text>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>お客様が当社のサービスをご利用いただく際に、お客様から直接提供していただく情報</li>
              <li>お客様が当社のウェブサイトをご利用いただく際に、お客様の同意に基づいて取得する情報</li>
              <li>お客様からのお問い合わせやご相談の際に、お客様から提供していただく情報</li>
              <li>その他、適法な方法により取得する情報</li>
            </ul>
          </div>

          {/* 個人情報の利用目的 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              4. 個人情報の利用目的
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              当社は、取得した個人情報を以下の目的で利用いたします：
            </Text>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>引越しマッチングサービスの提供</li>
              <li>お客様からのお問い合わせへの対応</li>
              <li>サービスの改善・開発</li>
              <li>お客様への情報提供（新サービス、キャンペーン等）</li>
              <li>法令に基づく対応</li>
              <li>その他、お客様の同意に基づく利用</li>
            </ul>
          </div>

          {/* 個人情報の管理 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              5. 個人情報の管理
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              当社は、お客様の個人情報の正確性及び安全性を確保するために、セキュリティの向上及び個人情報の漏洩、滅失、き損の防止等のための適切な措置を講じます。
            </Text>
            <Text variant="body" color="default">
              また、個人情報の取扱いを委託する場合は、委託先との間で適切な契約を締結し、委託先における個人情報の安全管理が図られるよう、必要かつ適切な監督を行います。
            </Text>
          </div>

          {/* 個人情報の第三者提供 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              6. 個人情報の第三者提供
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              当社は、以下の場合を除き、お客様の個人情報を第三者に提供いたしません：
            </Text>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>お客様の事前の同意がある場合</li>
              <li>法令に基づき開示することが必要である場合</li>
              <li>人の生命、身体又は財産の保護のために必要な場合であって、お客様の同意を得ることが困難である場合</li>
              <li>公衆衛生の向上又は児童の健全な育成の推進のために特に必要な場合であって、お客様の同意を得ることが困難である場合</li>
              <li>国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、お客様の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合</li>
            </ul>
          </div>

          {/* 個人情報の開示・訂正・利用停止 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              7. 個人情報の開示・訂正・利用停止
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              お客様は、当社に対して、ご自身の個人情報の開示、訂正、追加、削除、利用停止、消去、第三者提供の停止（以下「開示等」といいます）を求めることができます。
            </Text>
            <Text variant="body" color="default" className="mb-4">
              開示等のご請求は、以下の連絡先までお申し付けください：
            </Text>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text variant="body" color="default" className="font-medium">
                お問い合わせ先
              </Text>
              <Text variant="body" color="default">
                メール：syncworks.official@gmail.com<br />
                電話：03-1234-5678<br />
                受付時間：平日 9:00〜18:00（土日祝日除く）
              </Text>
            </div>
          </div>

          {/* クッキーの使用 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              8. クッキーの使用
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              当社のウェブサイトでは、お客様により良いサービスを提供するためにクッキーを使用することがあります。クッキーは、お客様のブラウザに送信され、お客様のコンピュータに保存されます。
            </Text>
            <Text variant="body" color="default">
              お客様は、ブラウザの設定によりクッキーの受取を拒否することができますが、その場合、当社のウェブサイトの一部の機能が正常に動作しない可能性があります。
            </Text>
          </div>

          {/* プライバシーポリシーの変更 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              9. プライバシーポリシーの変更
            </Heading>
            <Text variant="body" color="default">
              当社は、必要に応じて、このプライバシーポリシーを変更することがあります。重要な変更がある場合は、当社のウェブサイト上でお知らせいたします。
            </Text>
          </div>

          {/* お問い合わせ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              10. お問い合わせ
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              このプライバシーポリシーに関するお問い合わせがございましたら、以下の連絡先までお気軽にお申し付けください。
            </Text>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text variant="body" color="default" className="font-medium">
                SyncWorks株式会社
              </Text>
              <Text variant="body" color="default">
                個人情報保護担当者<br />
                メール：syncworks.official@gmail.com<br />
                電話：03-1234-5678<br />
                住所：〒150-0002 東京都渋谷区渋谷1-2-3 渋谷ビル5階
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
