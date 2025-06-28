// ✅ Step2: 荷物情報ページ
// セクションは：家具・家電入力 / 段ボール目安 / 段ボール・ガムテープ準備 / その他備考

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 定数定義
const AUTOSAVE_INTERVAL = 5000;
const STORAGE_KEY = 'formStep2';

// スタイル定義
const styles = {
  section: "bg-white shadow-md rounded-lg p-6 border border-gray-200",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
  button: {
    back: "bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500",
    next: "bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700",
    minus: "px-2 py-1 bg-gray-200 rounded",
    plus: "px-2 py-1 bg-green-500 text-white rounded"
  }
};

// 荷物データ定義
const itemCategories = [
  {
    category: "ベッド",
    data: [
      "🛏️ シングルベッド",
      "🛏️ セミダブルベッド",
      "🛏️ ダブルベッド",
      "🛏️ クイーンベッド",
      "🛏️ キングベッド",
      "🛏️‍🛏️ 2段ベッド",
      "👶 ベビーベッド"
    ]
  },
  {
    category: "マットレス・布団",
    data: [
      "🛏️ マットレス（シングル）",
      "🛏️ マットレス（セミダブル）",
      "🛏️ マットレス（ダブル）",
      "🛏️ マットレス（クイーン）",
      "🛏️ マットレス（キング）",
      "🛌 布団類（羽毛、毛布など）"
    ]
  },
  {
    category: "ソファ",
    data: [
      "🛋️ ソファ（1人掛け）",
      "🛋️ ソファ（2人掛け）",
      "🛋️ ソファ（3人掛け）",
      "🛋️ カウチソファ",
      "🛋️ ソファベッド",
      "🛋️ オットマン"
    ]
  },
  {
    category: "衣類収納",
    data: [
      "👕 ハンガーラック",
      "🎽 衣装ケース",
      "🚪 洋服タンス"
    ]
  },
  {
    category: "棚・収納",
    data: [
      "🗄 タンス（小型）",
      "🗄 タンス（大型）",
      "📚 本棚",
      "🍽 食器棚",
      "🖥 テレビ台",
      "🧸 おもちゃ棚・キッズ収納",
      "📦 カラーボックス"
    ]
  },
  {
    category: "テーブル・机類",
    data: [
      "🍴 ダイニングテーブル（2人用）",
      "🍴 ダイニングテーブル（4人用）",
      "🍴 ダイニングテーブル（6人以上）",
      "🛋 リビングテーブル",
      "🛋 ローテーブル",
      "🪵 こたつ",
      "💄 ドレッサー",
      "💻 パソコンデスク",
      "🪑 チェア・イス"
    ]
  },
  {
    category: "家電",
    data: [
      "🧺 洗濯機（縦型）",
      "🧺 洗濯機（ドラム式）",
      "🧊 冷蔵庫（小型）",
      "🧊 冷蔵庫（大型）",
      "📺 テレビ（40インチ未満）",
      "📺 テレビ（40〜60インチ）",
      "📺 テレビ（60インチ以上）",
      "💻 パソコン（ノート）",
      "💻 パソコン（デスクトップ）",
      "🍱 電子レンジ",
      "🍞 オーブントースター",
      "🍚 炊飯器",
      "🔥 ストーブ・ヒーター",
      "❄️ エアコン（本体＋室外機）",
      "📡 掃除機",
      "🧼 加湿器 / 空気清浄機",
      "🤖 ロボット掃除機"
    ]
  },
  {
    category: "特殊・大型アイテム",
    data: [
      "🚲 自転車",
      "🏍 バイク",
      "🎹 ピアノ（アップライト）",
      "🎹 ピアノ（グランド）",
      "🎹 電子ピアノ",
      "🔐 金庫（小型）",
      "🔐 金庫（大型）",
      "🐠 水槽（30cm以下）",
      "🐠 水槽（30cm以上）"
    ]
  },
  {
    category: "生活雑貨",
    data: [
      "🪴 観葉植物（小型）",
      "🪴 観葉植物（大型）",
      "🧳 キャリーケース",
      "🪞 姿見・鏡",
      "🗑 ゴミ箱（大型）",
      "🪣 バケツ・掃除道具セット",
      "🧺 ランドリーバスケット",
      "🏠 物干し竿"
    ]
  },
  {
    category: "その他家電・日用品",
    data: [
      "🖨 プリンター",
      "🔊 ホームシアター（本体のみ）",
      "🎥 スクリーン",
      "🔈 スピーカー",
      "📻 アンプ",
      "🎮 ゲーム機",
      "🍳 ホットプレート",
      "💡 シーリングライト",
      "🪞 スタンドライト",
      "🪟 カーテン（左右セット）"
    ]
  }
];

const boxSizeOptions = [
  "🏠 10箱未満（荷物が少ない）",
  "🏠 10〜20箱（1R / 1K の目安）",
  "🏠 21〜30箱（1LDK / 2K の目安）",
  "🏠 31〜50箱（2LDK / 3K の目安）",
  "🏠 51箱以上（3LDK / 4K以上の目安）"
];

export default function Step2FormPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const router = useRouter();
  const danball = watch('items.danball');

  // フォームデータの保存
  const saveFormData = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("フォームデータ保存エラー:", e);
    }
  };

  // フォーム送信処理
  const onSubmit = (data: any) => {
    try {
      saveFormData(data);
      router.push('/form/step3');
    } catch (e) {
      console.error("Step2送信エラー:", e);
    }
  };

  // 保存データの復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [setValue]);

  // 自動保存
  useEffect(() => {
    const id = setInterval(() => {
      saveFormData(watch());
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [watch]);

  // 数量調整ボタンのハンドラー
  const handleQuantityChange = (item: string, increment: boolean) => {
    const currentRaw = watch(`items.${item}`);
    const current = Number(currentRaw) || 0;
    setValue(`items.${item}`, increment ? current + 1 : Math.max(0, current - 1));
  };

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center">📦 荷物の数量を入力</h1>
        <div>
          <p className="text-center text-sm text-gray-600">必要なものをすべて入力してください（0でもOK）</p>
          <p className="text-center text-sm text-gray-500">※ 段ボールに梱包できるものは入力不要です</p>
        </div>

        {/* 家具・家電の数量入力 */}
        {itemCategories.map(({ category, data }) => (
          <section key={category} className={styles.section}>
            <h2 className="text-lg font-semibold mb-4">🗂 {category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <label className="flex-1 mr-4">{item}</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, false)}
                      className={styles.button.minus}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      {...register(`items.${item}`)}
                      className="w-16 text-center border border-gray-300 rounded"
                      defaultValue={0}
                    />

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, true)}
                      className={styles.button.plus}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* 段ボールの数の目安 */}
        <section className={styles.section}>
          <h2 className="text-lg font-semibold mb-4">📦 段ボール目安</h2>
          <p className="text-sm text-gray-500 mb-2">※おおまかな荷物量の目安として1つ選択してください</p>
          <div className="space-y-3">
            {boxSizeOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={option}
                  {...register("items.danball")}
                  className="form-radio text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}

            {danball?.includes('51箱以上') && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  必要箱数を入力
                </label>
                <input
                  type="number"
                  min={50}
                  {...register('items.boxCount')}
                  className={styles.input}
                  placeholder="例：60"
                />
              </div>
            )}
          </div>
        </section>

        {/* 段ボールやガムテープの準備方法 */}
        <section className={styles.section}>
          <h2 className="text-lg font-semibold mb-4">📦 段ボール・ガムテープ準備</h2>
          <p className="text-sm text-gray-500 mb-2">※どちらかを選択してください</p>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="引越し業者に手配してほしい"
                {...register("items.boxSupply")}
                className="form-radio text-blue-600"
                defaultChecked
              />
              <span>📦 引越し業者に手配してほしい</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="自分で準備する"
                {...register("items.boxSupply")}
                className="form-radio text-blue-600"
              />
              <span>🙋 自分で準備する</span>
            </label>
          </div>
        </section>

        {/* その他の荷物に関する備考 */}
        <section className={styles.section}>
          <label className="flex-1 mr-4">📝 その他の荷物・補足があれば記入（ガラス製など取扱注意がある場合は記載）</label>
          <textarea 
            rows={3} 
            {...register("itemsRemarks")} 
            className={styles.input} 
            placeholder="例：ガラス製の棚があるため丁寧に扱ってほしいなど" 
          />
        </section>

        <div>
          <div className="flex justify-between">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className={styles.button.back}
            >
              戻る
            </button>
            <button 
              type="submit" 
              className={styles.button.next}
            >
              次へ（最終ページへ）
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">2 / 3 ページ</div>
        </div>
      </form>
    </main>
  );
}
