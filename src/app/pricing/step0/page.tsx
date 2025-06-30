'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 荷物カテゴリとアイテムの定義
const ITEM_CATEGORIES = [
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

interface ItemPoint {
  id: string;
  category: string;
  name: string;
  points: number;
  defaultPoints: number;
}

export default function PricingStep0Page() {
  const router = useRouter();
  const [itemPoints, setItemPoints] = useState<ItemPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 初期データの読み込み
  useEffect(() => {
    const savedPoints = localStorage.getItem('pricingStep0');
    if (savedPoints) {
      setItemPoints(JSON.parse(savedPoints));
    } else {
      // デフォルトポイントを設定
      const defaultPoints = ITEM_CATEGORIES.flatMap(category =>
        category.items.map((item, index) => ({
          id: `${category.category}-${index}`,
          category: category.category,
          name: item.name,
          points: item.defaultPoints,
          defaultPoints: item.defaultPoints
        }))
      );
      setItemPoints(defaultPoints);
    }
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep0', JSON.stringify(itemPoints));
    }
  }, [itemPoints, isLoading]);

  // ポイントの更新
  const updatePoints = (id: string, points: number) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: Math.max(0, points) } : item
    ));
  };

  // デフォルト値にリセット
  const resetToDefault = (id: string) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: item.defaultPoints } : item
    ));
  };

  // 全アイテムをデフォルトにリセット
  const resetAllToDefault = () => {
    setItemPoints(itemPoints.map(item => ({
      ...item,
      points: item.defaultPoints
    })));
  };

  // フィルタリング
  const filteredItems = itemPoints.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // カテゴリ一覧
  const categories = ['all', ...ITEM_CATEGORIES.map(cat => cat.category)];

  // バリデーション
  const validatePoints = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (itemPoints.length === 0) {
      errors.push("荷物ポイントが設定されていません");
      return { isValid: false, errors };
    }

    // 負の値チェック
    const negativeItems = itemPoints.filter(item => item.points < 0);
    if (negativeItems.length > 0) {
      errors.push("ポイントは0以上にしてください");
    }

    return { isValid: errors.length === 0, errors };
  };

  // 次へ進む
  const handleNext = () => {
    const validation = validatePoints();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    router.push('/pricing/step1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            📦 荷物ポイント設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">0</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2">トラック換算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2">料金設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
              <span className="ml-2">距離加算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">4</div>
              <span className="ml-2">シーズン設定</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 設定内容</h2>
          <p className="text-gray-700">
            各荷物のポイントを設定します。このポイント合計に基づいてトラックサイズが自動判定されます。
            業者ごとに荷物の重さや大きさに応じてポイントを調整してください。
            1ポイントは段ボール1個分に相当します。
          </p>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="荷物名で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'すべて' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetAllToDefault}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                🔄 全リセット
              </button>
            </div>
          </div>
        </div>

        {/* ポイント設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 荷物ポイント設定</h2>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              該当する荷物が見つかりません。
            </div>
          ) : (
            <div className="space-y-4">
              {ITEM_CATEGORIES.map(category => {
                const categoryItems = filteredItems.filter(item => item.category === category.category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">🗂 {category.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                            <button
                              onClick={() => resetToDefault(item.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                              title="デフォルト値にリセット"
                            >
                              🔄
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={item.points}
                              onChange={(e) => updatePoints(item.id, parseInt(e.target.value) || 0)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-sm text-gray-600">ポイント</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            デフォルト: {item.defaultPoints}pt
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 参考例 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 ポイント参考例</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 軽い荷物（5-10ポイント）：小物、衣類、本など</p>
            <p>• 中程度の荷物（10-25ポイント）：家具、家電など</p>
            <p>• 重い荷物（25-50ポイント）：大型家具、大型家電など</p>
            <p>• 特別な荷物（50ポイント以上）：ピアノ、金庫など</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/vendors')}
            className="bg-gray-400 text-white px-6 py-3 rounded hover:bg-gray-500 transition"
          >
            ← 戻る
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            次へ →
          </button>
        </div>
      </div>
    </main>
  );
} 