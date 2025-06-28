// ✅ Step3: 作業オプション＋備考＋確認送信ページ
// セクションは：作業オプション / 備考入力 / 最終確認

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 定数定義
const AUTOSAVE_INTERVAL = 5000;
const STORAGE_KEY = 'formStep3';

// スタイル定義
const styles = {
  section: "bg-white shadow-md rounded-lg p-6 border border-gray-200",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
  button: {
    back: "bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500",
    next: "bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700"
  }
};

// 作業オプション定義
const workOptions = [
  "🏠 建物養生（壁や床の保護）",
  "📦 荷造り・荷ほどきの代行",
  "🪑 家具・家電の分解・組み立て",
  "🧺 洗濯機取り外し",
  "❄️ エアコン（本体＋室外機）取り外し",
  "💡 照明・テレビ配線取り外し",
  "🚮 不用品の回収・廃棄",
  "🐾 ペット運搬",
  "📝 その他（下記備考欄に記入）"
];

export default function Step3FormPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const router = useRouter();

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
      console.log(data);
      alert('送信されました（仮処理）');
    } catch (e) {
      console.error("Step3送信エラー:", e);
      alert('送信時にエラーが発生しました');
    }
  };
  
  // ローカルストレージから入力内容を復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [setValue]);  

  // 5秒ごとに現在の入力内容をローカルストレージへ保存
  useEffect(() => {
    const id = setInterval(() => {
      saveFormData(watch());
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [watch]);

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">🔧 作業オプションと備考入力</h1>

        {/* 作業オプション */}
        <section className={styles.section}>
          <h2 className="text-xl font-semibold mb-4">🔧 必要な作業オプションを選択してください</h2>
          <div className="space-y-2">
            {workOptions.map((opt) => (
              <label key={opt} className="block">
                <input type="checkbox" {...register("options")} value={opt} className="mr-2" />
                {opt}
              </label>
            ))}
          </div>
        </section>

        {/* 備考欄 */}
        <section className={styles.section}>
          <h2 className="text-xl font-semibold mb-2">🧾 その他備考・連絡事項</h2>
          <p className="text-sm text-gray-500 mb-2">自由にご記入ください（特殊荷物、駐車スペースなど）</p>
          <textarea
            rows={4}
            {...register("remarks")}
            className={styles.input}
            placeholder="例：搬入経路が狭い／トラックが停められないなど"
          />
        </section>

        {/* 確認・送信 */}
        <section className={styles.section}>
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">⚠️ 最終確認</h2>
          <p className="text-sm text-gray-600">送信前に入力内容をご確認ください</p>
          <p className="text-sm text-gray-600 mb-4">送信後の修正はできません</p>
          <div className="flex justify-between">
            <button type="button" onClick={() => router.back()} className={styles.button.back}>
              戻る
            </button>
            <button type="submit" className={styles.button.next}>
              送信する
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">3 / 3 ページ</div>
        </section>
      </form>
    </main>
  );
}
