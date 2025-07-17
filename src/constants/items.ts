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
      { name: "🛏️ シングルベッド", defaultPoints: 3 },
      { name: "🛏️ セミダブルベッド", defaultPoints: 4 },
      { name: "🛏️ ダブルベッド", defaultPoints: 5 },
      { name: "🛏️ クイーンベッド", defaultPoints: 6 },
      { name: "🛏️ キングベッド", defaultPoints: 7 },
      { name: "🛏️‍🛏️ 2段ベッド", defaultPoints: 5 },
      { name: "👶 ベビーベッド", defaultPoints: 2 }
    ]
  },
  {
    category: "マットレス・布団",
    items: [
      { name: "🛏️ マットレス（シングル）", defaultPoints: 2 },
      { name: "🛏️ マットレス（セミダブル）", defaultPoints: 2 },
      { name: "🛏️ マットレス（ダブル）", defaultPoints: 3 },
      { name: "🛏️ マットレス（クイーン）", defaultPoints: 3 },
      { name: "🛏️ マットレス（キング）", defaultPoints: 4 },
      { name: "🛌 布団類（羽毛、毛布など）", defaultPoints: 1 }
    ]
  },
  {
    category: "ソファ",
    items: [
      { name: "🛋️ ソファ（1人掛け）", defaultPoints: 4 },
      { name: "🛋️ ソファ（2人掛け）", defaultPoints: 6 },
      { name: "🛋️ ソファ（3人掛け）", defaultPoints: 8 },
      { name: "🛋️ カウチソファ", defaultPoints: 7 },
      { name: "🛋️ ソファベッド", defaultPoints: 9 },
      { name: "🛋️ オットマン", defaultPoints: 2 }
    ]
  },
  {
    category: "衣類収納",
    items: [
      { name: "👕 ハンガーラック", defaultPoints: 2 },
      { name: "🎽 衣装ケース", defaultPoints: 2 },
      { name: "🚪 洋服タンス", defaultPoints: 5 }
    ]
  },
  {
    category: "棚・収納",
    items: [
      { name: "🗄 タンス（小型）", defaultPoints: 3 },
      { name: "🗄 タンス（大型）", defaultPoints: 5 },
      { name: "📚 本棚", defaultPoints: 2 },
      { name: "🍽 食器棚", defaultPoints: 4 },
      { name: "🖥 テレビ台", defaultPoints: 3 },
      { name: "🧸 おもちゃ棚・キッズ収納", defaultPoints: 2 },
      { name: "📦 カラーボックス", defaultPoints: 2 }
    ]
  },
  {
    category: "テーブル・机類",
    items: [
      { name: "🍴 ダイニングテーブル（2人用）", defaultPoints: 4 },
      { name: "🍴 ダイニングテーブル（4人用）", defaultPoints: 6 },
      { name: "🍴 ダイニングテーブル（6人以上）", defaultPoints: 8 },
      { name: "🛋 リビングテーブル", defaultPoints: 3 },
      { name: "🛋 ローテーブル", defaultPoints: 2 },
      { name: "🪵 こたつ", defaultPoints: 4 },
      { name: "💄 ドレッサー", defaultPoints: 4 },
      { name: "💻 パソコンデスク", defaultPoints: 5 },
      { name: "🪑 チェア・イス", defaultPoints: 2 }
    ]
  },
  {
    category: "家電",
    items: [
      { name: "🧺 洗濯機（縦型）", defaultPoints: 5 },
      { name: "🧺 洗濯機（ドラム式）", defaultPoints: 6 },
      { name: "🧊 冷蔵庫（小型）", defaultPoints: 4 },
      { name: "🧊 冷蔵庫（大型）", defaultPoints: 7 },
      { name: "📺 テレビ（40インチ未満）", defaultPoints: 3 },
      { name: "📺 テレビ（40〜60インチ）", defaultPoints: 5 },
      { name: "📺 テレビ（60インチ以上）", defaultPoints: 7 },
      { name: "💻 パソコン（ノート）", defaultPoints: 2 },
      { name: "💻 パソコン（デスクトップ）", defaultPoints: 3 },
      { name: "🍱 電子レンジ", defaultPoints: 2 },
      { name: "🍞 オーブントースター", defaultPoints: 1 },
      { name: "🍚 炊飯器", defaultPoints: 1 },
      { name: "🔥 ストーブ・ヒーター", defaultPoints: 2 },
      { name: "❄️ エアコン（本体＋室外機）", defaultPoints: 4 },
      { name: "📡 掃除機", defaultPoints: 2 },
      { name: "🧼 加湿器 / 空気清浄機", defaultPoints: 1 },
      { name: "🤖 ロボット掃除機", defaultPoints: 2 }
    ]
  },
  {
    category: "特殊・大型アイテム",
    items: [
      { name: "🚲 自転車", defaultPoints: 2 },
      { name: "🏍 バイク", defaultPoints: 5 },
      { name: "🎹 ピアノ（アップライト）", defaultPoints: 16 },
      { name: "🎹 ピアノ（グランド）", defaultPoints: 24 },
      { name: "🎹 電子ピアノ", defaultPoints: 5 },
      { name: "🔐 金庫（小型）", defaultPoints: 3 },
      { name: "🔐 金庫（大型）", defaultPoints: 6 },
      { name: "🐠 水槽（30cm以下）", defaultPoints: 2 },
      { name: "🐠 水槽（30cm以上）", defaultPoints: 3 }
    ]
  },
  {
    category: "生活雑貨",
    items: [
      { name: "🪴 観葉植物（小型）", defaultPoints: 1 },
      { name: "🪴 観葉植物（大型）", defaultPoints: 2 },
      { name: "🧳 キャリーケース", defaultPoints: 2 },
      { name: "🪞 姿見・鏡", defaultPoints: 2 },
      { name: "🗑 ゴミ箱（大型）", defaultPoints: 2 },
      { name: "🪣 バケツ・掃除道具セット", defaultPoints: 1 },
      { name: "🧺 ランドリーバスケット", defaultPoints: 1 },
      { name: "🏠 物干し竿", defaultPoints: 2 }
    ]
  },
  {
    category: "その他家電・日用品",
    items: [
      { name: "🖨 プリンター", defaultPoints: 2 },
      { name: "🔊 ホームシアター（本体のみ）", defaultPoints: 3 },
      { name: "🎥 スクリーン", defaultPoints: 2 },
      { name: "🔈 スピーカー", defaultPoints: 2 },
      { name: "📻 アンプ", defaultPoints: 2 },
      { name: "🎮 ゲーム機", defaultPoints: 1 },
      { name: "🍳 ホットプレート", defaultPoints: 1 },
      { name: "💡 シーリングライト", defaultPoints: 2 },
      { name: "🪞 スタンドライト", defaultPoints: 1 },
      { name: "🪟 カーテン（左右セット）", defaultPoints: 2 }
    ]
  }
];

export const ITEM_CATEGORY_NAMES = ITEM_CATEGORIES.map(c => ({
  category: c.category,
  data: c.items.map(i => i.name)
}));
