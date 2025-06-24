// ✅ Step2: 荷物情報ページ
// セクションは：家具・家電入力 / 段ボール目安 / 段ボール・ガムテープ準備 / その他備考

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Step2FormPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const router = useRouter();
  const danball = watch('items.danball');

  const onSubmit = (data: any) => {
    try {
      localStorage.setItem('formStep2', JSON.stringify(data));
      router.push('/form/step3');
    } catch (e) {
      console.error("Step2送信エラー:", e);
    }
  };

  // ローカルストレージに保存された入力内容を復元
  useEffect(() => {
    const saved = localStorage.getItem('formStep2');
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [setValue]);

  const sectionStyle = "bg-white shadow-md rounded-lg p-6 border border-gray-200";
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  // 5秒ごとに現在の入力内容をローカルストレージへ保存
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const data = watch();
        localStorage.setItem('formStep2', JSON.stringify(data));
      } catch (e) {
        console.error('自動保存エラー:', e);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [watch]);

  // 荷物カテゴリと選択肢
  const items = [
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
        "🧸 おもちゃ棚・キッズ収納"
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
        "🧼 加湿器 / 空気清浄機"
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
        "🧺 ランドリーバスケット"
      ]
    },
    {
      category: "その他家電・日用品",
      data: [
        "🖨 プリンター",
        "🔈 スピーカー",
        "📻 アンプ",
        "🎮 ゲーム機",
        "🔊 ホームシアターセット",
        "🍳 ホットプレート",
        "💡 シーリングライト",
        "🪞 スタンドライト",
        "🪟 カーテン（左右セット）"
      ]
    }
  ];

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">📦 荷物の数量を入力</h1>
        <div>
          <p className="text-center text-sm text-gray-600">必要なものをすべて入力してください（0でもOK）</p>
          <p className="text-center text-sm text-gray-500">※ 段ボールに梱包できるものは入力不要です</p>
        </div>

        {/* 家具・家電の数量入力 */}
        {items.map(({ category, data }) => (
          <section key={category} className={sectionStyle}>
            <h2 className="text-lg font-semibold mb-4">🗂 {category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <label className="flex-1 mr-4">{item}</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const currentRaw = watch(`items.${item}`);
                        const current = Number(currentRaw) || 0;
                        setValue(`items.${item}`, Math.max(0, current - 1));
                      }}
                      className="px-2 py-1 bg-gray-200 rounded"
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
                      onClick={() => {
                        const currentRaw = watch(`items.${item}`);
                        const current = Number(currentRaw) || 0;
                        setValue(`items.${item}`, current + 1);
                      }}
                      className="px-2 py-1 bg-green-500 text-white rounded"
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
        <section className={sectionStyle}>
          <h2 className="text-lg font-semibold mb-4">📦 段ボール目安</h2>
          <p className="text-sm text-gray-500 mb-2">※おおまかな荷物量の目安として1つ選択してください</p>
          <div className="space-y-3">
            {[
              "🏠 10箱未満（荷物が少ない）",
              "🏠 10〜20箱（1R / 1K の目安）",
              "🏠 20〜30箱（1LDK / 2K の目安）",
              "🏠 30〜50箱（2LDK / 3K の目安）",
              "🏠 50箱以上（3LDK / 4K以上の目安）"
            ].map((item) => (
              <label key={item} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={item}
                  {...register("items.danball")}
                  className="form-radio text-blue-600"
                />
                <span>{item}</span>
              </label>
            ))}

            {danball?.includes('50箱以上') && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  必要箱数を入力
                </label>
                <input
                  type="number"
                  min={50}
                  {...register('items.boxCount')}
                  className={inputStyle}
                  placeholder="例：60"
                />
              </div>
            )}
          </div>
        </section>

        {/* 段ボールやガムテープの準備方法 */}
        <section className={sectionStyle}>
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
        <section className={sectionStyle}>
          <label className="flex-1 mr-4">📝 その他の荷物・補足があれば記入</label>
          <textarea rows={3} {...register("itemsRemarks")} className={inputStyle} placeholder="例：分解が必要なベッドあり、大型スピーカー×2など" />
        </section>

        <div className="flex justify-between">
          <button type="button" onClick={() => router.back()} className="bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500">戻る</button>
          <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700">次へ（最終ページへ）</button>
        </div>
      </form>
    </main>
  );
}
