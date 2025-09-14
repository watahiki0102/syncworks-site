export interface ItemDefinition {
  name: string;
  defaultPoints: number;
}

export interface ItemCategory {
  category: string;
  items: ItemDefinition[];
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  {
    category: "ベッド",
    items: [
      { name: "🛏️ シングルベッド", defaultPoints: 20 },
      { name: "🛏️ セミダブルベッド", defaultPoints: 25 },
      { name: "🛏️ ダブルベッド", defaultPoints: 30 },
      { name: "🛏️ クイーンベッド", defaultPoints: 35 },
      { name: "🛏️ キングベッド", defaultPoints: 40 },
      { name: "🛏️‍🛏️ 2段ベッド", defaultPoints: 32 },
      { name: "👶 ベビーベッド", defaultPoints: 8 }
    ]
  },
  {
    category: "マットレス・布団",
    items: [
      { name: "🛏️ マットレス（シングル）", defaultPoints: 12 },
      { name: "🛏️ マットレス（セミダブル）", defaultPoints: 16 },
      { name: "🛏️ マットレス（ダブル）", defaultPoints: 20 },
      { name: "🛏️ マットレス（クイーン）", defaultPoints: 24 },
      { name: "🛏️ マットレス（キング）", defaultPoints: 28 },
      { name: "🛌 布団類（羽毛、毛布など）", defaultPoints: 3 }
    ]
  },
  {
    category: "ソファ",
    items: [
      { name: "🛋️ ソファ（1人掛け）", defaultPoints: 12 },
      { name: "🛋️ ソファ（2人掛け）", defaultPoints: 20 },
      { name: "🛋️ ソファ（3人掛け）", defaultPoints: 28 },
      { name: "🛋️ カウチソファ", defaultPoints: 24 },
      { name: "🛋️ ソファベッド", defaultPoints: 32 },
      { name: "🛋️ オットマン", defaultPoints: 4 }
    ]
  },
  {
    category: "衣類収納",
    items: [
      { name: "👕 ハンガーラック", defaultPoints: 3 },
      { name: "🎽 衣装ケース", defaultPoints: 6 },
      { name: "🚪 洋服タンス", defaultPoints: 16 }
    ]
  },
  {
    category: "棚・収納",
    items: [
      { name: "🗄 タンス（小型）", defaultPoints: 12 },
      { name: "🗄 タンス（大型）", defaultPoints: 24 },
      { name: "📚 本棚", defaultPoints: 8 },
      { name: "🍽 食器棚", defaultPoints: 15 },
      { name: "🖥 テレビ台", defaultPoints: 6 },
      { name: "🧸 おもちゃ棚・キッズ収納", defaultPoints: 6 },
      { name: "📦 カラーボックス", defaultPoints: 3 }
    ]
  },
  {
    category: "テーブル・机類",
    items: [
      { name: "🍴 ダイニングテーブル（2人用）", defaultPoints: 8 },
      { name: "🍴 ダイニングテーブル（4人用）", defaultPoints: 12 },
      { name: "🍴 ダイニングテーブル（6人以上）", defaultPoints: 16 },
      { name: "🛋 リビングテーブル", defaultPoints: 6 },
      { name: "🛋 ローテーブル", defaultPoints: 4 },
      { name: "🪵 こたつ", defaultPoints: 14 },
      { name: "💄 ドレッサー", defaultPoints: 8 },
      { name: "💻 パソコンデスク", defaultPoints: 10 },
      { name: "🪑 チェア・イス", defaultPoints: 5 }
    ]
  },
  {
    category: "家電",
    items: [
      { name: "🧺 洗濯機（縦型）", defaultPoints: 6 },
      { name: "🧺 洗濯機（ドラム式）", defaultPoints: 8 },
      { name: "🧊 冷蔵庫（小型）", defaultPoints: 6 },
      { name: "🧊 冷蔵庫（大型）", defaultPoints: 15 },
      { name: "📺 テレビ（40インチ未満）", defaultPoints: 3 },
      { name: "📺 テレビ（40〜60インチ）", defaultPoints: 5 },
      { name: "📺 テレビ（60インチ以上）", defaultPoints: 8 },
      { name: "🍱 電子レンジ", defaultPoints: 2 },
      { name: "🔥 ストーブ・ヒーター", defaultPoints: 2 },
      { name: "❄️ エアコン（本体＋室外機）", defaultPoints: 5 },
      { name: "📡 掃除機", defaultPoints: 2 },
      { name: "🧼 加湿器 / 空気清浄機", defaultPoints: 1 },
      { name: "🤖 ロボット掃除機", defaultPoints: 2 }
    ]
  },
  {
    category: "特殊・大型アイテム",
    items: [
      { name: "🚲 自転車", defaultPoints: 3 },
      { name: "🏍 バイク", defaultPoints: 8 },
      { name: "🎹 ピアノ（アップライト）", defaultPoints: 35 },
      { name: "🎹 ピアノ（グランド）", defaultPoints: 50 },
      { name: "🎹 電子ピアノ", defaultPoints: 8 },
      { name: "🔐 金庫（小型）", defaultPoints: 8 },
      { name: "🔐 金庫（大型）", defaultPoints: 25 },
      { name: "🐠 水槽（30cm以下）", defaultPoints: 3 },
      { name: "🐠 水槽（30cm以上）", defaultPoints: 5 }
    ]
  },
  {
    category: "生活雑貨",
    items: [
      { name: "🪴 観葉植物（大型）", defaultPoints: 3 },
      { name: "🧳 キャリーケース", defaultPoints: 3 },
      { name: "🪞 姿見・鏡", defaultPoints: 3 },
      { name: "🗑 ゴミ箱（大型）", defaultPoints: 3 },
      { name: "🪣 バケツ・掃除道具セット", defaultPoints: 1 },
      { name: "🧺 ランドリーバスケット", defaultPoints: 2 },
      { name: "🏠 物干し竿", defaultPoints: 2 }
    ]
  },
  {
    category: "その他家電・日用品",
    items: [
      { name: "🖨 プリンター", defaultPoints: 3 },
      { name: "🔊 ホームシアター（本体のみ）", defaultPoints: 2 },
      { name: "🎥 スクリーン", defaultPoints: 3 },
      { name: "🔈 スピーカー", defaultPoints: 2 },
      { name: "📻 アンプ", defaultPoints: 3 },
      { name: "💡 シーリングライト", defaultPoints: 3 },
      { name: "🪞 スタンドライト", defaultPoints: 2 }
    ]
  }
];

export const ITEM_CATEGORY_NAMES = ITEM_CATEGORIES.map(c => ({
  category: c.category,
  data: c.items.map(i => i.name)
}));
