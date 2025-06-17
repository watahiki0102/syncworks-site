// ✅ Step3: 作業オプション＋備考＋確認送信ページ

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Step3FormPage() {
  const { register, handleSubmit,setValue } = useForm();
  const router = useRouter();

  const onSubmit = (data: any) => {
    try {
      localStorage.setItem('formStep3', JSON.stringify(data));
      console.log(data);
      alert('送信されました（仮処理）');
    } catch (e) {
      console.error("Step3送信エラー:", e);
      alert('送信時にエラーが発生しました');
    }
  };
  
  useEffect(() => {
    const saved = localStorage.getItem('formStep3');
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [setValue]);  

  const sectionStyle = "bg-white shadow-md rounded-lg p-6 border border-gray-200";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const options = [
    "❄️ エアコン（本体＋室外機）取り外し",
    "🧺 洗濯機取り外し",
    "💡 照明・テレビ配線取り外し",
    "🪑 家具・家電の分解・組み立て",
    "📦 荷造り・荷ほどきの代行",
    "🚮 不用品の回収・廃棄",
    "🏠 建物養生（壁や床の保護）",
    "🐾 ペット運搬",
    "📝 その他（下記備考欄に記入）"
  ];

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">🔧 作業オプションと備考入力</h1>

        {/* 作業オプション */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold mb-4">🔧 必要な作業オプションを選択してください</h2>
          <div className="space-y-2">
            {options.map((opt) => (
              <label key={opt} className="block">
                <input type="checkbox" {...register("options")} value={opt} className="mr-2" />
                {opt}
              </label>
            ))}
          </div>
        </section>

        {/* 備考欄 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold mb-2">🧾 その他備考・連絡事項</h2>
          <p className="text-sm text-gray-500 mb-2">自由にご記入ください（特殊荷物、希望時間帯、駐車スペースなど）</p>
          <textarea
            rows={4}
            {...register("remarks")}
            className={inputStyle}
            placeholder="例：電子ピアノあり／駐車スペースが狭い／18時以降希望など"
          />
        </section>

        {/* 確認・送信 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">⚠️ 最終確認</h2>
          <p className="text-sm text-gray-600 mb-4">送信前に入力内容をご確認ください。送信後の修正はできません。</p>
          <div className="flex justify-between">
            <button type="button" onClick={() => router.back()} className="bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500">戻る</button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700">送信する</button>
          </div>
        </section>
      </form>
    </main>
  );
}
