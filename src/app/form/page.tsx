// ✅ これはGoogleフォーム完全移行用のNext.js + Tailwind CSSフォームテンプレートです
// ✅ セクションは：基本情報 / 引越し元 / 引越し先 / 日時 / 荷物 / 作業オプション / 備考 / 確認送信

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
// @ts-ignore
import Kuroshiro from 'kuroshiro';
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

export default function FullFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    alert('送信されました（仮処理）');
  };
  const sectionStyle = "bg-white shadow-md rounded-lg p-6 border border-gray-200";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const fromOther = watch("fromResidenceType") === "その他";
  const toOther = watch("toResidenceType") === "その他";
  const { setValue } = useForm();
  const [kuroshiro, setKuroshiro] = useState<Kuroshiro | null>(null);

  useEffect(() => {
    const initKuroshiro = async () => {
      const kuro = new Kuroshiro();
      await kuro.init(new KuromojiAnalyzer());
      setKuroshiro(kuro);
    };
    initKuroshiro();
  }, []);

  const autoFillKana = async (field: 'lastName' | 'firstName', value: string) => {
    if (kuroshiro && value) {
      const kana = await kuroshiro.convert(value, { to: 'katakana', mode: 'okuri' });
      if (field === 'lastName') setValue('lastNameKana', kana);
      if (field === 'firstName') setValue('firstNameKana', kana);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-blue-800">📦 引越し相見積もりフォーム</h1>
        <div className='text-red-900'>　　　　* 必須項目</div>
        {/* 👤 基本情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 基本情報（）</h2>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>🏠 引越タイプ *</label>
              <div className="space-x-4 text-gray-800">
                <label><input type="radio" {...register("moveType", { required: true })} value="単身" className="mr-1" />単身引越し</label>
                <label><input type="radio" {...register("moveType", { required: true })} value="家族" className="mr-1" />家族引越し</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 姓（漢字） */}
              <div>
                <label className="block font-semibold mb-1">📛 姓</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="w-full border rounded p-2"
                  onBlur={(e) => autoFillKana('lastName', e.target.value)}
                  placeholder="漢字で入力してください"
                />
              </div>

              {/* 名（漢字） */}
              <div>
                <label className="block font-semibold mb-1">📛 名（漢字）*</label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="w-full border rounded p-2"
                  onBlur={(e) => autoFillKana('firstName', e.target.value)}
                />
              </div>

              {/* セイ（カタカナ） */}
              <div>
                <label className="block font-semibold mb-1">📛 セイ（カタカナ）*</label>
                <input
                  type="text"
                  {...register('lastNameKana')}
                  className="w-full border rounded p-2"
                  placeholder="カタカナ"
                />
              </div>

              {/* メイ（カタカナ） */}
              <div>
                <label className="block font-semibold mb-1">📛 メイ（カタカナ）*</label>
                <input
                  type="text"
                  {...register('firstNameKana')}
                  className="w-full border rounded p-2"
                  placeholder="カタカナ"
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>📞 電話番号（ハイフンなし）*</label>
              <input
                type="tel"
                {...register("phone", {
                  required: true,
                  pattern: /^[0-9]{10,11}$/,
                })}
                className={inputStyle}
                placeholder="例：08012345678"
              />
              <p className="text-sm text-gray-500 mt-1">ハイフンなしで入力してください（例：08012345678）</p>
            </div>

            <div>
              <label className={labelStyle}>📧 メールアドレス *</label>
              <input
                type="email"
                {...register("email", {
                  required: true,
                  pattern: /^[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}$/,
                })}
                className={inputStyle}
                placeholder="例：example@gmail.com"
                list="email-suggestions"
              />
              <datalist id="email-suggestions">
                <option value="@gmail.com" />
                <option value="@yahoo.co.jp" />
                <option value="@icloud.com" />
              </datalist>
            </div>
          </div>
        </section>

        {/* 🕓 日時情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🕓 引越し希望日時</h2>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>🗓️ 第1希望日 *</label>
              <input type="date" {...register("date1", { required: true })} className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>🗓️ 第2希望日</label>
              <input type="date" {...register("date2")} className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>🗓️ 第3希望日</label>
              <input type="date" {...register("date3")} className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>⏰ 希望時間帯 *</label>
              <select {...register("timeSlot", { required: true })} className={inputStyle}>
                <option value="">選択してください</option>
                <option value="指定なし">指定なし</option>
                <option value="早朝">早朝（6〜9時）</option>
                <option value="午前">午前（9〜12時）</option>
                <option value="午後">午後（12〜15時）</option>
                <option value="夕方">夕方（15〜18時）</option>
                <option value="夜間">夜間（18〜21時）</option>
              </select>
            </div>
          </div>
        </section>
        {/* 📍 引越し元・引越し先情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 引越し元・引越し先の情報</h2>
          {[
            { label: "引越し元", prefix: "from", color: "blue" },
            { label: "引越し先", prefix: "to", color: "pink" },
          ].map(({ label, prefix, color }) => (
            <div key={prefix} className="mb-6">
              <h3 className={`text-md font-semibold text-${color}-600 mb-2`}>📍 {label}</h3>
              <div className="mb-4">
                <label className={labelStyle}>住所 *</label>
                <p className="text-sm text-gray-500 mb-1">都道府県、市区町村まででも可</p>
                <input type="text" {...register(`${prefix}Address`)} className={inputStyle} />
              </div>
              <div className="mb-4">
                <label className={labelStyle}>住宅タイプ *</label>
                <div className="space-y-1">
                  {["マンション（エレベーターあり）", "マンション（エレベーターなし）", "一軒家", "その他"].map((type) => (
                    <label key={type} className="block">
                      <input type="radio" value={type} {...register(`${prefix}ResidenceType`)} className="mr-2" />
                      {type}
                    </label>
                  ))}
                  {(prefix === "from" ? fromOther : toOther) && (
                    <input
                      type="text"
                      placeholder="住宅タイプを入力"
                      {...register(`${prefix}ResidenceOther`)}
                      className={`${inputStyle} mt-2`}
                    />
                  )}
                </div>
              </div>
              <div>
                <label className={labelStyle}>階数 *</label>
                <select {...register(`${prefix}Floor`)} className={inputStyle}>
                  <option value="">選択してください</option>
                  {[...Array(30)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}階</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </section>
        {/* 📦 荷物情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 荷物情報（数量を入力）</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "シングルベッド", "セミダブルベッド", "ダブルベッド",
              "1人掛けソファ", "2人掛けソファ", "3人掛けソファ",
              "タンス", "本棚", "食器棚", "テレビ台", "衣装ケース",
              "スーツケース", "冷蔵庫", "洗濯機", "電子レンジ",
              "炊飯器", "掃除機", "テレビ", "パソコン",
              "段ボール（小）", "段ボール（中）", "段ボール（大）",
              "自転車", "バイク", "ピアノ", "観葉植物",
              "金庫", "水槽"
            ].map((item) => (
              <div key={item}>
                <label className={labelStyle}>📌 {item}</label>
                <input
                  type="number"
                  min="0"
                  defaultValue={0}
                  {...register(`items.${item}`)}
                  className={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className={labelStyle}>📝 その他の荷物・サイズ・補足があれば記入</label>
            <textarea
              rows={3}
              {...register("itemsRemarks")}
              className={inputStyle}
              placeholder="例：分解が必要なベッドあり、大型スピーカー×2、など"
            />
          </div>
        </section>

        {/* 🔧 作業オプション */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 作業オプション（必要なものを選択）</h2>
          <div className="space-y-2">
            {[
              "梱包資材の希望（段ボール・ガムテープなど）",
              "エアコン取り外し",
              "洗濯機取り外し",
              "照明・テレビ配線取り外し",
              "家具・家電の分解・組み立て",
              "荷造り・荷ほどきの代行",
              "不用品の回収・廃棄",
              "建物養生（壁や床の保護）",
              "ペット運搬",
              "その他（下記備考欄に記入）"
            ].map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  {...register("options")}
                  value={option}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </section>

        {/* 🧾 備考欄 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧾 その他備考・連絡事項</h2>
          <p className="text-sm text-gray-500 mb-2">自由にご記入ください（特殊荷物、時間帯の詳細希望など）</p>
          <textarea
            rows={4}
            {...register("remarks")}
            className={inputStyle}
            placeholder="例：電子ピアノあり／駐車スペースが狭い／18時以降希望 など"
          />
        </section>
        {/* ✅ 確認・送信 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold mb-2 text-yellow-600">⚠️ 最終確認</h2>
          <p className="text-sm text-gray-600 mb-4">送信前に入力内容をご確認ください。送信後の修正はできません。</p>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition">
            送信する
          </button>
        </section>
      </form>
    </main>
  );
}
