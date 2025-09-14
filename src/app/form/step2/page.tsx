/**
 * 引越し見積もりフォーム Step2 ページコンポーネント
 * - 荷物情報の入力（家具・家電の数量）
 * - 段ボール目安の選択
 * - 段ボール・ガムテープの準備方法選択
 * - その他備考の入力
 */
// ✅ Step2: 荷物情報ページ
// セクションは：家具・家電入力 / 段ボール目安 / 段ボール・ガムテープ準備 / その他備考

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { ITEM_CATEGORY_NAMES } from '@/constants/items';
import { Step2FormData } from '@/types/common';

/**
 * 自動保存の間隔（ミリ秒）
 */
const AUTOSAVE_INTERVAL = 5000;

/**
 * ローカルストレージのキー
 */
const STORAGE_KEY = 'formStep2';

/**
 * スタイル定義
 */
const styles = {
  section: "bg-white shadow-md rounded-lg p-6 border border-gray-200",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
  button: {
    back: "bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500",
    next: "bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700",
    minus: "px-3 py-2 sm:px-2 sm:py-1 bg-gray-200 rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center",
    plus: "px-3 py-2 sm:px-2 sm:py-1 bg-green-500 text-white rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
  }
};

/**
 * 段ボールサイズの選択肢
 * 荷物量に応じた目安を提供
 */
const boxSizeOptions = [
  "🏠 10箱未満（荷物が少ない）",
  "🏠 10〜20箱（1R / 1K の目安）",
  "🏠 21〜30箱（1LDK / 2K の目安）",
  "🏠 31〜50箱（2LDK / 3K の目安）",
  "🏠 51箱以上（3LDK / 4K以上の目安）"
];


export default function Step2FormPage() {
  const { register, handleSubmit, setValue, watch } = useForm<Step2FormData>();
  const router = useRouter();
  const danball = watch('items.danball');

  /**
   * フォームデータをローカルストレージに保存
   * @param data - 保存するフォームデータ
   */
  const saveFormData = (data: Step2FormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("フォームデータ保存エラー:", e);
    }
  };

  /**
   * フォーム送信処理
   * @param data - 送信するフォームデータ
   */
  const onSubmit = (data: Step2FormData) => {
    try {
      saveFormData(data);
      router.push('/form/step3');
    } catch (e) {
      console.error("Step2送信エラー:", e);
    }
  };

  /**
   * 保存されたデータの復元
   * ページ読み込み時にローカルストレージから復元
   */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        setValue(key as keyof Step2FormData, value as any);
      });
    }
  }, [setValue]);

  /**
   * 自動保存機能
   * 指定間隔でフォームデータを自動保存
   */
  useEffect(() => {
    const id = setInterval(() => {
      saveFormData(watch());
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [watch]);

  /**
   * 数量調整ボタンのハンドラー
   * @param item - 調整するアイテム名
   * @param increment - 増加するかどうか（true: 増加, false: 減少）
   */
  const handleQuantityChange = (item: string, increment: boolean) => {
    const currentRaw = watch(`items.${item}`);
    const current = Number(currentRaw) || 0;
    setValue(`items.${item}`, increment ? current + 1 : Math.max(0, current - 1));
  };

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-xl md:text-3xl font-bold text-center text-blue-800">📦 荷物の数量を入力</h1>
        <ProgressBar current={2} total={3} />
        <div>
          <p className="text-center text-sm text-gray-600">必要なものをすべて入力してください（0でもOK）</p>
          <p className="text-center text-sm text-gray-500">※ 段ボールに梱包できるものは入力不要です</p>
        </div>

        {/* 家具・家電の数量入力 */}
        {ITEM_CATEGORY_NAMES.map(({ category, data }) => (
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
          <p className="text-sm text-gray-500 mb-2">※数量入力した荷物以外の梱包で必要な段ボール箱数を選択してください</p>
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
