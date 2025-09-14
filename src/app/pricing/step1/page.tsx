/**
 * 料金設定 Step1 ページコンポーネント
 * - 荷物ポイント設定機能
 * - 各荷物のポイントと加算金の管理
 * - ローカルストレージでのデータ保存
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ITEM_CATEGORIES } from '@/constants/items';
import { ItemPoint } from '@/types/pricing';

export default function PricingStep0Page() {
  const router = useRouter();
  const [itemPoints, setItemPoints] = useState<ItemPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  /**
   * 初期データの読み込み
   * - ローカルストレージから保存データを復元
   * - 保存データがない場合はデフォルト値を設定
   */
  useEffect(() => {
    // バージョン管理でデータを強制更新
    const DATA_VERSION = 'v2.3'; // 新しいバージョン
    const savedVersion = localStorage.getItem('pricingStep0_version');
    
    // バージョンが異なる場合はデータをクリアして新しいデフォルト値を適用
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem('pricingStep0');
      localStorage.setItem('pricingStep0_version', DATA_VERSION);
    }
    
    const savedPoints = localStorage.getItem('pricingStep0');
    if (savedPoints) {
      setItemPoints(JSON.parse(savedPoints));
    } else {
      // 新しいデフォルトポイントを設定（段ボール中基準の現実的な値）
      const defaultPoints = ITEM_CATEGORIES.flatMap(category =>
        category.items.map((item, index) => {
          // 段ボール中（50×35×35cm）基準の現実的なポイント設定
          let realPoints = item.defaultPoints;
          
          if (category.category === '大型家具') {
          if (item.name.includes('ベッド')) {
            realPoints = item.name.includes('シングル') ? 20 : 
                        item.name.includes('セミダブル') ? 25 :
                        item.name.includes('ダブル') ? 30 :
                        item.name.includes('クイーン') ? 35 :
                        item.name.includes('キング') ? 40 :
                        item.name.includes('2段') ? 32 : 25;
          } else if (item.name.includes('ソファ')) {
            realPoints = item.name.includes('1人') ? 12 :
                        item.name.includes('2人') ? 20 :
                        item.name.includes('3人') ? 28 :
                        item.name.includes('L字') ? 32 : 20;
          } else if (item.name.includes('テーブル')) {
            realPoints = item.name.includes('小') ? 6 :
                        item.name.includes('中') ? 12 :
                        item.name.includes('大') ? 20 :
                        item.name.includes('ダイニング') ? 16 :
                        item.name.includes('こたつ') ? 14 : 12;
          } else if (item.name.includes('タンス') || item.name.includes('クローゼット')) {
            realPoints = item.name.includes('大') ? 24 :
                        item.name.includes('中') ? 16 :
                        item.name.includes('小') ? 12 : 16;
            } else if (item.name.includes('本棚')) {
              realPoints = item.name.includes('大') ? 12 :
                          item.name.includes('中') ? 8 :
                          item.name.includes('小') ? 5 : 8;
            } else if (item.name.includes('デスク')) {
              realPoints = item.name.includes('大') ? 10 :
                          item.name.includes('学習') ? 8 :
                          item.name.includes('パソコン') ? 6 : 8;
            } else if (item.name.includes('食器棚')) {
              realPoints = 15;
            } else if (item.name.includes('キャビネット')) {
              realPoints = 10;
            } else if (item.name.includes('チェスト')) {
              realPoints = 8;
            } else if (item.name.includes('ワードローブ')) {
              realPoints = 20;
            } else {
              realPoints = 10;
            }
          } else if (category.category === '家電製品') {
            if (item.name.includes('冷蔵庫')) {
              realPoints = item.name.includes('小') ? 6 :
                          item.name.includes('中') ? 10 :
                          item.name.includes('大') ? 15 :
                          item.name.includes('業務用') ? 20 : 10;
            } else if (item.name.includes('洗濯機')) {
              realPoints = item.name.includes('ドラム') ? 8 :
                          item.name.includes('縦型') ? 6 :
                          item.name.includes('二槽式') ? 5 : 6;
            } else if (item.name.includes('テレビ')) {
              realPoints = item.name.includes('32インチ以下') ? 3 :
                          item.name.includes('43インチ') ? 5 :
                          item.name.includes('55インチ') ? 7 :
                          item.name.includes('65インチ以上') ? 10 :
                          item.name.includes('小') ? 3 :
                          item.name.includes('中') ? 5 :
                          item.name.includes('大') ? 8 : 5;
            } else if (item.name.includes('エアコン')) {
              realPoints = 5;
            } else if (item.name.includes('電子レンジ')) {
              realPoints = 2;
            } else if (item.name.includes('炊飯器')) {
              realPoints = 1;
            } else if (item.name.includes('掃除機')) {
              realPoints = 2;
            } else if (item.name.includes('オーブン')) {
              realPoints = 3;
            } else if (item.name.includes('食洗機')) {
              realPoints = 4;
            } else if (item.name.includes('プリンター')) {
              realPoints = 2;
            } else if (item.name.includes('パソコン')) {
              realPoints = 1;
            } else if (item.name.includes('ステレオ')) {
              realPoints = 3;
            } else {
              realPoints = 3;
            }
          } else if (category.category === '小型家具') {
            if (item.name.includes('椅子')) {
              realPoints = item.name.includes('オフィス') ? 3 :
                          item.name.includes('ダイニング') ? 2 :
                          item.name.includes('折りたたみ') ? 1 : 2;
            } else if (item.name.includes('スツール')) {
              realPoints = 1;
            } else if (item.name.includes('サイドテーブル')) {
              realPoints = 2;
            } else if (item.name.includes('コーヒーテーブル')) {
              realPoints = 3;
            } else if (item.name.includes('ラック')) {
              realPoints = 4;
            } else if (item.name.includes('カラーボックス')) {
              realPoints = 3;
            } else if (item.name.includes('ハンガーラック')) {
              realPoints = 2;
            } else {
              realPoints = 3;
            }
          } else if (category.category === '特殊荷物') {
            if (item.name.includes('ピアノ')) {
              realPoints = item.name.includes('グランド') ? 50 :
                          item.name.includes('アップライト') ? 35 :
                          item.name.includes('電子') ? 8 : 35;
            } else if (item.name.includes('金庫')) {
              realPoints = item.name.includes('大') ? 25 :
                          item.name.includes('中') ? 15 :
                          item.name.includes('小') ? 8 : 15;
            } else if (item.name.includes('仏壇')) {
              realPoints = 12;
            } else if (item.name.includes('神棚')) {
              realPoints = 3;
            } else if (item.name.includes('美術品')) {
              realPoints = 5;
            } else {
              realPoints = 10;
            }
          } else {
            realPoints = Math.max(item.defaultPoints, 2);
          }
          
          return {
            id: `${category.category}-${index}`,
            category: category.category,
            name: item.name,
            points: realPoints,
            defaultPoints: realPoints,
            additionalCost: 0 // 加算金を0で初期化
          };
        })
      );
      setItemPoints(defaultPoints);
    }
    setIsLoading(false);
  }, []);

  /**
   * データの自動保存
   * - アイテムポイントが変更されるたびにローカルストレージに保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep0', JSON.stringify(itemPoints));
    }
  }, [itemPoints, isLoading]);

  /**
   * ポイントの更新
   * @param id - 更新するアイテムのID
   * @param points - 新しいポイント値（0以上）
   */
  const updatePoints = (id: string, points: number) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: Math.max(0, points) } : item
    ));
  };

  /**
   * 加算金の更新
   * @param id - 更新するアイテムのID
   * @param cost - 新しい加算金（0以上）
   */
  const updateAdditionalCost = (id: string, cost: number) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, additionalCost: Math.max(0, cost) } : item
    ));
  };

  /**
   * 指定アイテムをデフォルト値にリセット
   * @param id - リセットするアイテムのID
   */
  const resetToDefault = (id: string) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: item.defaultPoints, additionalCost: 0 } : item
    ));
  };

  /**
   * 全アイテムをデフォルト値にリセット
   */
  const resetAllToDefault = () => {
    setItemPoints(itemPoints.map(item => ({
      ...item,
      points: item.defaultPoints,
      additionalCost: 0
    })));
  };


  /**
   * アイテムのフィルタリング
   * - 検索語とカテゴリで絞り込み
   */
  const filteredItems = itemPoints.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  /**
   * カテゴリ一覧の取得
   */
  const categories = ['all', ...ITEM_CATEGORIES.map(cat => cat.category)];

  /**
   * ポイント設定のバリデーション
   * @returns バリデーション結果
   */
  const validatePoints = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (itemPoints.length === 0) {
      errors.push("荷物ポイントが設定されていません");
      return { isValid: false, errors };
    }

    // 負の値チェック
    const negativeItems = itemPoints.filter(item => item.points < 0 || item.additionalCost < 0);
    if (negativeItems.length > 0) {
      errors.push("ポイントと加算金は0以上にしてください");
    }

    return { isValid: errors.length === 0, errors };
  };

  /**
   * 次のステップへ進む
   * - バリデーション後に次のページへ遷移
   */
  const handleNext = () => {
    const validation = validatePoints();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    router.push('/pricing/step2');
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            📦 荷物ポイント設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2">料金設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
              <span className="ml-2">シーズン設定</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 設定内容</h2>
          <p className="text-gray-700">
            各荷物のポイントを設定します。このポイント合計に基づいてトラックサイズが自動判定されます。
            荷物の重さや大きさに応じてポイントを調整してください。
          </p>
          <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-800">📦 ポイント基準</p>
            <p className="text-sm text-gray-700">1ポイント = 段ボールMサイズ1個分（50×35×35cm）</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div key={item.id} className="border border-gray-200 rounded p-3 min-h-[200px]">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-medium text-gray-800 flex-1 pr-2">{item.name}</span>
                            <button
                              onClick={() => resetToDefault(item.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="デフォルト値にリセット"
                            >
                              🔄
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">ポイント</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.points}
                                  onChange={(e) => updatePoints(item.id, parseInt(e.target.value) || 0)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="text-xs text-gray-500">pt</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">加算料金</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.additionalCost}
                                  onChange={(e) => updateAdditionalCost(item.id, parseInt(e.target.value) || 0)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                                <span className="text-xs text-gray-500">円</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-1">
                            <div className="text-xs text-gray-400">
                              ※追加料金が必要な場合のみ入力
                            </div>
                            <div className="text-xs text-gray-500">
                              デフォルト: {item.defaultPoints}pt
                            </div>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 ポイント参考例（1ポイント=段ボール中1個分：50×35×35cm）</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 小物（1-3ポイント）：炊飯器、電子レンジ、スツールなど</p>
            <p>• 中型荷物（4-8ポイント）：テレビ、洗濯機、デスクなど</p>
            <p>• 大型荷物（20-32ポイント）：シングルベッド、2人ソファ、タンスなど</p>
            <p>• 特大荷物（35ポイント以上）：ダブルベッド、大型冷蔵庫、ワードローブなど</p>
            <p>• 特殊荷物（30ポイント以上）：アップライトピアノ、グランドピアノ、大型金庫など</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
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