import React from 'react';
import { Layout } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

export default function TermsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <Heading level={1} size="3xl" color="default" className="mb-4">
              利用規約
            </Heading>
            <Text variant="body" color="muted" className="text-lg">
              サービス利用に関する規約
            </Text>
          </div>

          {/* 更新日 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <Text variant="body" color="default" className="text-center">
              <strong>最終更新日：</strong>2024年12月1日
            </Text>
          </div>

          {/* 前文 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Text variant="body" color="default" className="mb-4">
              この利用規約（以下「本規約」といいます）は、SyncWorks株式会社（以下「当社」といいます）が提供する引越しマッチングサービス「SyncWorks」（以下「本サービス」といいます）の利用条件を定めるものです。
            </Text>
            <Text variant="body" color="default">
              本サービスをご利用いただくお客様（以下「ユーザー」といいます）は、本規約に同意したものとみなします。
            </Text>
          </div>

          {/* 第1条 適用 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第1条 適用
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              1. 本規約は、本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </Text>
            <Text variant="body" color="default">
              2. 当社が当ウェブサイトに掲載するお知らせ等は本規約の一部を構成するものとします。
            </Text>
          </div>

          {/* 第2条 定義 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第2条 定義
            </Heading>
            <div className="space-y-4">
              <div>
                <Text variant="body" color="default" className="mb-2">
                  本規約において使用する以下の用語は、各々以下に定める意味を有するものとします。
                </Text>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>「コンテンツ」とは、テキスト、音声、音楽、画像、動画、ソフトウェア、プログラム、コードその他の情報のことをいいます。</li>
                  <li>「本コンテンツ」とは、本サービスを通じてアクセスすることができる当社が提供するコンテンツをいいます。</li>
                  <li>「ユーザーコンテンツ」とは、ユーザーが本サービスを通じて送信、アップロード、投稿、その他の方法により提供するコンテンツをいいます。</li>
                  <li>「知的財産権」とは、著作権、特許権、実用新案権、意匠権、商標権その他の知的財産権（それらの権利について登録等を出願する権利を含みます）をいいます。</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 第3条 登録 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第3条 登録
            </Heading>
            <div className="space-y-4">
              <Text variant="body" color="default">
                1. 本サービスの利用を希望する者は、本規約に同意の上、当社の定める方法により本サービスの利用登録を申請するものとします。
              </Text>
              <Text variant="body" color="default">
                2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
              </Text>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を相当でないと判断した場合</li>
              </ul>
            </div>
          </div>

          {/* 第4条 禁止事項 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第4条 禁止事項
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </Text>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>他のユーザーの個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </div>

          {/* 第5条 本サービスの提供の停止等 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第5条 本サービスの提供の停止等
            </Heading>
            <div className="space-y-4">
              <Text variant="body" color="default">
                1. 当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              </Text>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
              <Text variant="body" color="default">
                2. 当社は、本サービスの提供の停止または中断によりユーザーまたは第三者に生じた損害について、一切の責任を負いません。
              </Text>
            </div>
          </div>

          {/* 第6条 利用制限および登録抹消 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第6条 利用制限および登録抹消
            </Heading>
            <div className="space-y-4">
              <Text variant="body" color="default">
                1. 当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              </Text>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>当社からの連絡に対し、相当の期間が経過しても返答がない場合</li>
                <li>本サービスについて、最終の利用から相当期間利用がない場合</li>
                <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
              </ul>
              <Text variant="body" color="default">
                2. 当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
              </Text>
            </div>
          </div>

          {/* 第7条 免責事項 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第7条 免責事項
            </Heading>
            <div className="space-y-4">
              <Text variant="body" color="default">
                1. 当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </Text>
              <Text variant="body" color="default">
                2. 当社は、本サービスがユーザーの特定の目的に適合すること、期待する機能・商品的価値・正確性・有用性を有すること、ユーザーによる本サービスの利用がユーザーに適用のある法令または業界団体の内部規則等に適合すること、および不具合が生じないことについて、何ら保証するものではありません。
              </Text>
              <Text variant="body" color="default">
                3. 当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </Text>
            </div>
          </div>

          {/* 第8条 サービス内容の変更等 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第8条 サービス内容の変更等
            </Heading>
            <Text variant="body" color="default">
              当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
            </Text>
          </div>

          {/* 第9条 利用規約の変更 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第9条 利用規約の変更
            </Heading>
            <Text variant="body" color="default">
              当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約変更後、本サービスの利用を継続した場合には、変更後の規約に同意したものとみなします。
            </Text>
          </div>

          {/* 第10条 通知または連絡 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第10条 通知または連絡
            </Heading>
            <Text variant="body" color="default">
              ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方法に従った変更の届出がない限り、現在登録されている連絡先に通知または連絡を行ったものとみなします。
            </Text>
          </div>

          {/* 第11条 権利義務の譲渡の禁止 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第11条 権利義務の譲渡の禁止
            </Heading>
            <Text variant="body" color="default">
              ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
            </Text>
          </div>

          {/* 第12条 準拠法・裁判管轄 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              第12条 準拠法・裁判管轄
            </Heading>
            <div className="space-y-4">
              <Text variant="body" color="default">
                1. 本規約の解釈にあたっては、日本法を準拠法とします。
              </Text>
              <Text variant="body" color="default">
                2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </Text>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              お問い合わせ
            </Heading>
            <Text variant="body" color="default" className="mb-4">
              本規約に関するお問い合わせがございましたら、以下の連絡先までお気軽にお申し付けください。
            </Text>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text variant="body" color="default" className="font-medium">
                SyncWorks株式会社
              </Text>
              <Text variant="body" color="default">
                カスタマーサポート<br />
                メール：syncworks.official@gmail.com<br />
                電話：03-1234-5678<br />
                住所：〒150-0002 東京都渋谷区渋谷1-2-3 渋谷ビル5階<br />
                受付時間：平日 9:00〜18:00（土日祝日除く）
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
