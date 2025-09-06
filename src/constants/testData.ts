/**
 * 共通テストデータ
 * 各画面で使用するテストデータを一元管理
 */

// 顧客データ
export const TEST_CUSTOMERS = [
  {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区神南1-1-1',
    postalCode: '150-0044'
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    phone: '080-9876-5432',
    address: '東京都世田谷区三軒茶屋3-3-3',
    postalCode: '154-0024'
  },
  {
    id: '3',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    phone: '070-5555-6666',
    address: '東京都港区六本木5-5-5',
    postalCode: '106-0032'
  },
  {
    id: '4',
    name: '高橋美咲',
    email: 'takahashi@example.com',
    phone: '090-1111-2222',
    address: '東京都中野区中野4-4-4',
    postalCode: '164-0001'
  },
  {
    id: '5',
    name: '山田次郎',
    email: 'yamada@example.com',
    phone: '080-3333-4444',
    address: '東京都目黒区目黒6-6-6',
    postalCode: '153-0061'
  },
  {
    id: '6',
    name: '伊藤健太',
    email: 'ito@example.com',
    phone: '070-7777-8888',
    address: '大阪府大阪市北区梅田7-7-7',
    postalCode: '530-0001'
  },
  {
    id: '7',
    name: '渡辺真理',
    email: 'watanabe@example.com',
    phone: '090-9999-0000',
    address: '福岡県福岡市博多区博多駅前8-8-8',
    postalCode: '812-0011'
  },
  {
    id: '8',
    name: '中村雄一',
    email: 'nakamura@example.com',
    phone: '080-1111-3333',
    address: '神奈川県横浜市西区みなとみらい9-9-9',
    postalCode: '220-0012'
  }
];

// 住所データ（引越し元・先）
export const TEST_ADDRESSES = [
  {
    from: '東京都新宿区西新宿1-1-1',
    to: '東京都渋谷区渋谷2-2-2',
    fromPostal: '160-0023',
    toPostal: '150-0002'
  },
  {
    from: '東京都中野区中野3-3-3',
    to: '東京都杉並区阿佐ヶ谷4-4-4',
    fromPostal: '164-0001',
    toPostal: '166-0004'
  },
  {
    from: '東京都目黒区目黒5-5-5',
    to: '東京都世田谷区三軒茶屋6-6-6',
    fromPostal: '153-0061',
    toPostal: '154-0024'
  },
  {
    from: '東京都港区六本木7-7-7',
    to: '東京都品川区大井8-8-8',
    fromPostal: '106-0032',
    toPostal: '140-0014'
  },
  {
    from: '大阪府大阪市北区梅田9-9-9',
    to: '大阪府大阪市中央区難波10-10-10',
    fromPostal: '530-0001',
    toPostal: '542-0076'
  },
  {
    from: '福岡県福岡市博多区博多駅前11-11-11',
    to: '福岡県福岡市中央区天神12-12-12',
    fromPostal: '812-0011',
    toPostal: '810-0001'
  }
];

// 荷物データ
export const TEST_ITEMS = [
  ['ソファ', 'テーブル', '椅子', 'ベッド'],
  ['ワードローブ', '机', '本棚', '食器棚'],
  ['冷蔵庫', '洗濯機', '乾燥機', '電子レンジ'],
  ['シングルベッド', '冷蔵庫', 'テレビ', '洗濯機'],
  ['ダブルベッド', 'ソファ', '食器棚', '本棚'],
  ['キングベッド', 'ピアノ', '大型冷蔵庫', '食器棚'],
  ['セミダブルベッド', '電子レンジ', '本棚', 'テレビ'],
  ['ベッド', 'ワードローブ', '机', '椅子']
];

// 追加サービス
export const TEST_ADDITIONAL_SERVICES = [
  ['梱包', '開梱'],
  ['保険'],
  ['保管'],
  ['組立'],
  ['エアコン工事'],
  ['深夜作業'],
  ['即日対応'],
  ['女性スタッフ対応']
];

// トラックデータ
export const TEST_TRUCKS = [
  {
    id: 'truck-1',
    name: '2トンショート',
    plateNumber: '品川500 あ 1234',
    capacityKg: 2000,
    truckType: '2tショート',
    status: 'available' as const,
    inspectionExpiry: '2024-12-31'
  },
  {
    id: 'truck-2',
    name: '4トンロング',
    plateNumber: '品川500 い 5678',
    capacityKg: 4000,
    truckType: '4tロング',
    status: 'available' as const,
    inspectionExpiry: '2024-12-31'
  },
  {
    id: 'truck-3',
    name: '3トン',
    plateNumber: '品川500 う 9012',
    capacityKg: 3000,
    truckType: '3t',
    status: 'available' as const,
    inspectionExpiry: '2024-12-31'
  },
  {
    id: 'truck-4',
    name: '軽トラック',
    plateNumber: '品川500 え 3456',
    capacityKg: 1000,
    truckType: '軽トラ',
    status: 'available' as const,
    inspectionExpiry: '2024-12-31'
  },
  {
    id: 'truck-5',
    name: '5トン大型',
    plateNumber: '品川500 お 7890',
    capacityKg: 5000,
    truckType: '4t複数',
    status: 'inactive' as const,
    inspectionExpiry: '2024-08-31'
  }
];

// 従業員データ
export const TEST_EMPLOYEES = [
  {
    id: 'emp-1',
    name: '田中 一郎',
    email: 'tanaka@syncmoving.com',
    phone: '090-1234-5678',
    position: 'ドライバー',
    status: 'active' as const,
    hireDate: '2023-01-15'
  },
  {
    id: 'emp-2',
    name: '佐藤 花子',
    email: 'sato@syncmoving.com',
    phone: '080-9876-5432',
    position: '作業員',
    status: 'active' as const,
    hireDate: '2023-03-20'
  },
  {
    id: 'emp-3',
    name: '鈴木 次郎',
    email: 'suzuki@syncmoving.com',
    phone: '070-5555-6666',
    position: 'ドライバー',
    status: 'active' as const,
    hireDate: '2023-02-10'
  },
  {
    id: 'emp-4',
    name: '高橋 美咲',
    email: 'takahashi@syncmoving.com',
    phone: '090-1111-2222',
    position: '作業員',
    status: 'active' as const,
    hireDate: '2023-04-15'
  }
];

// 見積もり・契約データ生成ヘルパー
export const generateTestQuote = (customerIndex: number, addressIndex: number, itemIndex: number, serviceIndex: number) => {
  // 6つの固定テストデータ（SyncMoving 3つ、外部 3つ）
  const fixedTestData = [
    // SyncMoving案件 3つ
    {
      id: 'quote-1',
      customerName: '田中太郎',
      requestDate: '2025-01-10',
      responseDate: '2025-01-12',
      moveDate: '2025-02-15',
      amount: 45000,
      amountWithTax: 49500,
      status: '成約' as const,
      sourceType: 'syncmoving' as const,
      isContracted: true,
      isReQuote: false,
      fromAddress: '東京都渋谷区神南1-1-1',
      toAddress: '東京都新宿区西新宿2-2-2',
      items: ['シングルベッド', '冷蔵庫', 'テレビ', '洗濯機'],
      timeBandSurcharges: [],
      summary: {
        from: '東京都渋谷区神南1-1-1',
        to: '東京都新宿区西新宿2-2-2',
        items: ['シングルベッド', '冷蔵庫', 'テレビ', '洗濯機'],
        totalPoints: 15
      }
    },
    {
      id: 'quote-2',
      customerName: '佐藤花子',
      requestDate: '2025-01-08',
      responseDate: '2025-01-10',
      moveDate: '2025-02-20',
      amount: 55000,
      amountWithTax: 60500,
      status: '回答済' as const,
      sourceType: 'syncmoving' as const,
      isContracted: false,
      isReQuote: false,
      fromAddress: '東京都世田谷区三軒茶屋3-3-3',
      toAddress: '神奈川県横浜市西区みなとみらい4-4-4',
      items: ['ダブルベッド', 'ソファ', '食器棚', '本棚'],
      timeBandSurcharges: [
        { id: '1', start: '22:00', end: '05:00', kind: 'rate' as const, value: 1.25 }
      ],
      summary: {
        from: '東京都世田谷区三軒茶屋3-3-3',
        to: '神奈川県横浜市西区みなとみらい4-4-4',
        items: ['ダブルベッド', 'ソファ', '食器棚', '本棚'],
        totalPoints: 18
      }
    },
    {
      id: 'quote-3',
      customerName: '鈴木一郎',
      requestDate: '2025-01-05',
      responseDate: '2025-01-07',
      moveDate: '2025-02-10',
      amount: 38000,
      amountWithTax: 41800,
      status: '見積中' as const,
      sourceType: 'syncmoving' as const,
      isContracted: false,
      isReQuote: true,
      fromAddress: '大阪府大阪市北区梅田5-5-5',
      toAddress: '大阪府堺市中区深井6-6-6',
      items: ['テーブル', '椅子4脚', 'テレビボード'],
      timeBandSurcharges: [],
      summary: {
        from: '大阪府大阪市北区梅田5-5-5',
        to: '大阪府堺市中区深井6-6-6',
        items: ['テーブル', '椅子4脚', 'テレビボード'],
        totalPoints: 12
      }
    },
    // 外部案件 3つ
    {
      id: 'quote-4',
      customerName: '高橋美咲',
      requestDate: '2025-01-12',
      responseDate: '2025-01-14',
      moveDate: '2025-02-25',
      amount: 65000,
      amountWithTax: 71500,
      status: '成約' as const,
      sourceType: '外部' as const,
      isContracted: true,
      isReQuote: false,
      fromAddress: '愛知県名古屋市中区栄7-7-7',
      toAddress: '愛知県豊田市若宮町8-8-8',
      items: ['ダブルベッド', '冷蔵庫', '洗濯機', 'ソファ', 'ダイニングテーブル'],
      timeBandSurcharges: [],
      summary: {
        from: '愛知県名古屋市中区栄7-7-7',
        to: '愛知県豊田市若宮町8-8-8',
        items: ['ダブルベッド', '冷蔵庫', '洗濯機', 'ソファ', 'ダイニングテーブル'],
        totalPoints: 22
      }
    },
    {
      id: 'quote-5',
      customerName: '伊藤健太',
      requestDate: '2025-01-15',
      responseDate: '2025-01-17',
      moveDate: '2025-03-01',
      amount: 42000,
      amountWithTax: 46200,
      status: '不成約' as const,
      sourceType: '外部' as const,
      isContracted: false,
      isReQuote: false,
      fromAddress: '福岡県福岡市博多区博多駅前9-9-9',
      toAddress: '福岡県久留米市東町10-10-10',
      items: ['シングルベッド', '机', '椅子', '本棚'],
      timeBandSurcharges: [],
      summary: {
        from: '福岡県福岡市博多区博多駅前9-9-9',
        to: '福岡県久留米市東町10-10-10',
        items: ['シングルベッド', '机', '椅子', '本棚'],
        totalPoints: 14
      }
    },
    {
      id: 'quote-6',
      customerName: '山田由美',
      requestDate: '2025-01-20',
      responseDate: '2025-01-22',
      moveDate: '2025-03-05',
      amount: 75000,
      amountWithTax: 82500,
      status: 'キャンセル' as const,
      sourceType: '外部' as const,
      isContracted: false,
      isReQuote: true,
      fromAddress: '北海道札幌市中央区大通11-11-11',
      toAddress: '北海道函館市本町12-12-12',
      items: ['ダブルベッド', '冷蔵庫', '洗濯機', 'ソファ', 'ダイニングテーブル', '食器棚'],
      timeBandSurcharges: [
        { id: '1', start: '22:00', end: '05:00', kind: 'rate' as const, value: 1.25 }
      ],
      summary: {
        from: '北海道札幌市中央区大通11-11-11',
        to: '北海道函館市本町12-12-12',
        items: ['ダブルベッド', '冷蔵庫', '洗濯機', 'ソファ', 'ダイニングテーブル', '食器棚'],
        totalPoints: 26
      }
    }
  ];

  // customerIndexに基づいて固定データを返す
  const dataIndex = customerIndex % fixedTestData.length;
  return fixedTestData[dataIndex];
};

export const generateTestContract = (customerIndex: number, addressIndex: number, itemIndex: number) => {
  const customer = TEST_CUSTOMERS[customerIndex % TEST_CUSTOMERS.length];
  const address = TEST_ADDRESSES[addressIndex % TEST_ADDRESSES.length];
  const items = TEST_ITEMS[itemIndex % TEST_ITEMS.length];
  
  const contractAmount = 30000 + (items.length * 2000);
  const commission = Math.round(contractAmount * 0.1);
  const revenue = contractAmount - commission;
  
  // 仲介元の種別をランダムに選択
  const sourceTypes = ['syncmoving', 'suumo', '外部', '手動'] as const;
  const sourceType = sourceTypes[customerIndex % sourceTypes.length];
  
  return {
    id: `contract-${customerIndex + 1}`,
    customerName: customer.name,
    contractDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    moveDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractAmount,
    commission,
    revenue,
    items,
    fromAddress: address.from,
    toAddress: address.to,
    serviceType: Math.random() > 0.5 ? 'internal' : 'external' as const,
    sourceType
  };
};

export const generateTestFormSubmission = (customerIndex: number, addressIndex: number, itemIndex: number, serviceIndex: number) => {
  const customer = TEST_CUSTOMERS[customerIndex % TEST_CUSTOMERS.length];
  const address = TEST_ADDRESSES[addressIndex % TEST_ADDRESSES.length];
  const items = TEST_ITEMS[itemIndex % TEST_ITEMS.length];
  const services = TEST_ADDITIONAL_SERVICES[serviceIndex % TEST_ADDITIONAL_SERVICES.length];
  
  const totalPoints = items.length * 10 + services.length * 5;
  const totalCapacity = totalPoints * 8;
  const distance = Math.floor(Math.random() * 20) + 1;
  
  return {
    id: `submission-${customerIndex + 1}`,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    moveDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    originAddress: address.from,
    destinationAddress: address.to,
    totalPoints,
    totalCapacity,
    distance,
    itemList: items,
    additionalServices: services,
    status: ['pending', 'assigned', 'completed'][Math.floor(Math.random() * 3)] as 'pending' | 'assigned' | 'completed',
    truckAssignments: [],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    contractStatus: Math.random() > 0.5 ? 'estimate' : 'confirmed' as 'estimate' | 'confirmed',
    caseStatus: ['unanswered', 'answered', 'contracted', 'lost', 'cancelled'][Math.floor(Math.random() * 5)] as 'unanswered' | 'answered' | 'contracted' | 'lost' | 'cancelled',
    requestSource: Math.random() > 0.5 ? 'シンクワーク' : '手動登録',
    isManualRegistration: Math.random() > 0.5
  };
};

// トラック稼働率データ
export const TEST_TRUCK_UTILIZATION = [
  {
    truckId: 'truck-001',
    truckName: '軽トラックA',
    busyRatio: 75,
    idleRatio: 25
  },
  {
    truckId: 'truck-002',
    truckName: '2tトラックB',
    busyRatio: 60,
    idleRatio: 40
  },
  {
    truckId: 'truck-003',
    truckName: '3tトラックC',
    busyRatio: 85,
    idleRatio: 15
  },
  {
    truckId: 'truck-004',
    truckName: '4tトラックD',
    busyRatio: 45,
    idleRatio: 55
  }
];

// ニュースデータ
export const TEST_NEWS = [
  { 
    date: "2024/12/28", 
    title: "自動配車最適化機能をリリース",
    content: "AI を活用した新しい配車最適化機能により、効率的な配車計画が可能になりました。",
    category: "新機能",
    isNew: true
  },
  { 
    date: "2024/12/27", 
    title: "月間成約率が過去最高を記録",
    content: "12月の成約率が85%に達し、過去最高記録を更新しました。",
    category: "実績",
    isNew: true
  },
  { 
    date: "2024/12/26", 
    title: "案件管理システムUI刷新",
    content: "より使いやすく直感的な案件管理画面にリニューアルしました。",
    category: "改善",
    isNew: false
  },
  { 
    date: "2024/12/25", 
    title: "配車効率20%向上を達成",
    content: "システム改善により、前月比で配車効率が大幅に向上しました。",
    category: "実績",
    isNew: false
  },
  { 
    date: "2024/12/24", 
    title: "シフト自動調整機能を追加",
    content: "従業員のシフト管理がより簡単になる自動調整機能を導入しました。",
    category: "新機能",
    isNew: false
  }
];

// FAQデータ
export const TEST_FAQ = [
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
  }
];

// 業者データ
export const TEST_VENDORS = [
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
    name: '不動産サービスA',
    totalRating: 4.2,
    reviewCount: 156,
    serviceAreas: ['東京都', '神奈川県', '千葉県', '埼玉県'],
    experienceYears: 10,
    staffCount: 18,
    description: '不動産売買・賃貸の専門会社。お客様の不動産に関するご相談を親身にお聞きし、最適なソリューションをご提案いたします。',
    specialties: ['不動産売買', '賃貸管理', '不動産コンサルティング']
  }
];

// 地域・都道府県データ
export const TEST_REGIONS = [
  { name: '北海道・東北', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', prefectures: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', prefectures: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州・沖縄', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] }
];

// レビューデータ
export const TEST_REVIEWS = [
  {
    id: 1,
    customerName: '田中様',
    location: '東京都渋谷区',
    rating: 5,
    comment: 'SyncWorksを利用して本当に良かったです。複数の業者から見積もりを取れるので、価格比較ができて安心でした。最終的に選んだ業者さんもとても丁寧で、荷物の扱いも慎重で満足しています。',
    serviceDate: '2024-07-15',
    serviceType: '単身引越し',
    verified: true
  },
  {
    id: 2,
    customerName: '佐藤様',
    location: '神奈川県横浜市',
    rating: 4,
    comment: '初めての引越しで不安でしたが、SyncWorksのおかげでスムーズに進みました。事業者の選択肢が豊富で、レビューも参考になりました。カスタマーサポートの対応も親切で助かりました。',
    serviceDate: '2024-07-08',
    serviceType: 'ファミリー引越し',
    verified: true
  },
  {
    id: 3,
    customerName: '山田様',
    location: '千葉県船橋市',
    rating: 5,
    comment: '急な転勤で時間がない中、SyncWorksで迅速に業者を見つけることができました。見積もりも明確で、追加費用もなく予算内で収まりました。また機会があれば利用したいと思います。',
    serviceDate: '2024-06-28',
    serviceType: 'オフィス移転',
    verified: true
  },
  {
    id: 4,
    customerName: '鈴木様',
    location: '埼玉県さいたま市',
    rating: 4,
    comment: 'サイトが使いやすく、簡単に見積もり依頼ができました。複数の業者から連絡をもらい、条件に合う業者を選ぶことができました。作業当日もスムーズで、大満足です。',
    serviceDate: '2024-06-20',
    serviceType: '単身引越し',
    verified: true
  },
  {
    id: 5,
    customerName: '高橋様',
    location: '東京都品川区',
    rating: 5,
    comment: '家族4人の引越しでしたが、SyncWorksで見つけた業者さんが本当に素晴らしかったです。子供の荷物も丁寧に扱ってくれて、新居での配置まで相談に乗ってくれました。',
    serviceDate: '2024-06-12',
    serviceType: 'ファミリー引越し',
    verified: true
  },
  {
    id: 6,
    customerName: '伊藤様',
    location: '東京都世田谷区',
    rating: 4,
    comment: '複数見積もりのおかげで、相場を把握できて良かったです。最終的に選んだ業者の作業も丁寧で、時間通りに完了しました。SyncWorksのシステムがとても便利でした。',
    serviceDate: '2024-05-30',
    serviceType: '単身引越し',
    verified: true
  }
];

// 統計情報
export const TEST_STATS = [
  { number: "1000+", label: "成功事例" },
  { number: "50+", label: "提携業者" },
  { number: "99%", label: "顧客満足度" },
  { number: "24/7", label: "サポート" }
];

// 機能情報
export const TEST_FEATURES = [
  {
    title: "引越しマッチング",
    description: "地域の信頼できる引越し業者から、条件に合った業者を自動でご案内します。"
  },
  {
    title: "安心の料金体系",
    description: "提示金額のままご契約いただける安心設計。あとからの価格交渉はありません。※入力内容に誤りがない場合に限る"
  },
  {
    title: "信頼性の高いサービス",
    description: "厳選された引越し業者から、条件に合ったサービスをご提供いたします。"
  },
  {
    title: "実績と信頼",
    description: "多くのお客様にご利用いただき、高い満足度をいただいているサービスです。"
  }
];
