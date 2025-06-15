// ✅ セクションは：基本情報 / 引越し希望日時 / 引越し元 / 引越し先

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
// @ts-ignore
import Kuroshiro from 'kuroshiro';
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

export default function Step1FormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const router = useRouter();

  const onSubmit = (data: any) => {
    console.log(data);
    router.push('/form/step2');
  };

  const sectionStyle = "bg-white shadow-md rounded-lg p-6 border border-gray-200";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const fromOther = watch("fromResidenceType") === "その他";
  const toOther = watch("toResidenceType") === "その他";

  const [kuroshiro, setKuroshiro] = useState<any>(null);

  useEffect(() => {
    const initKuroshiro = async () => {
      const kuro = new Kuroshiro();
      await kuro.init(new KuromojiAnalyzer());
      setKuroshiro(kuro);
    };
    initKuroshiro();
  }, []);

  const autoFillKana = async (field: 'lastName' | 'firstName', value: string) => {
    if (!kuroshiro || typeof value !== 'string') return;
    try {
      const kana = await kuroshiro.convert(value, { to: 'katakana', mode: 'okuri' });
      if (field === 'lastName') setValue('lastNameKana', kana);
      if (field === 'firstName') setValue('firstNameKana', kana);
    } catch (error) {
      console.error('Kana conversion error:', error);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">📦 引越し相見積もりフォーム</h1>
        <div className="text-center text-sm text-red-600 mt-2">※<span className="text-red-600 font-bold">＊</span>が付いている項目は必須入力です</div>

        {/* 👤 基本情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>🏠 引越タイプ <span className="text-red-600">＊</span></label>
              <div className="space-x-4 text-gray-800">
                <label><input type="radio" {...register("moveType", { required: true })} value="単身" className="mr-1" />単身引越し</label>
                <label><input type="radio" {...register("moveType", { required: true })} value="家族" className="mr-1" />家族引越し</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>📛 姓</label>
                <input type="text" {...register('lastName')} className={inputStyle} onBlur={(e) => autoFillKana('lastName', e.target.value)} placeholder="漢字で入力してください" />
              </div>
              <div>
                <label className={labelStyle}>📛 名（漢字）<span className="text-red-600">＊</span></label>
                <input type="text" {...register('firstName')} className={inputStyle} onBlur={(e) => autoFillKana('firstName', e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>📛 セイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input type="text" {...register('lastNameKana')} className={inputStyle} placeholder="カタカナ" />
              </div>
              <div>
                <label className={labelStyle}>📛 メイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input type="text" {...register('firstNameKana')} className={inputStyle} placeholder="カタカナ" />
              </div>
            </div>

            <div>
              <label className={labelStyle}>📞 電話番号（ハイフンなし）<span className="text-red-600">＊</span></label>
              <input type="tel" {...register("phone", { required: true, pattern: /^[0-9]{10,11}$/ })} className={inputStyle} placeholder="例：08012345678" />
              <p className="text-sm text-gray-500 mt-1">ハイフンなしで入力してください（例：08012345678）</p>
            </div>

            <div>
              <label className={labelStyle}>📧 メールアドレス <span className="text-red-600">＊</span></label>
              <input type="email" {...register("email", {
                required: true,
                pattern: /^[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}$/
              })} className={inputStyle} placeholder="例：example@gmail.com" list="email-suggestions" />
              <datalist id="email-suggestions">
                <option value="@gmail.com" />
                <option value="@yahoo.co.jp" />
                <option value="@icloud.com" />
              </datalist>
            </div>
          </div>
        </section>

        {/* 🕓 引越し希望日時 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🕓 引越し希望日時</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>🗓️ 第{n}希望日{n === 1 && <span className="text-red-600">＊</span>}</label>
                  <input type="date" {...register(`date${n}`, { required: n === 1 })} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>⏰ 第{n}希望時間帯{n === 1 && <span className="text-red-600">＊</span>}</label>
                  <select {...register(`timeSlot${n}`, { required: n === 1 })} className={inputStyle}>
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
            ))}
          </div>
        </section>

        {/* 📍 引越し元・引越し先情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 引越し元・引越し先の情報</h2>
          {[{ label: "引越し元", prefix: "from" }, { label: "引越し先", prefix: "to" }].map(({ label, prefix }) => (
            <div key={prefix} className="mb-6">
              <h3 className="text-md font-semibold mb-2">📍 {label}</h3>
              <div className="mb-4">
                <label className={labelStyle}>住所 <span className="text-red-600">＊</span></label>
                <p className="text-sm text-gray-500 mb-1">都道府県、市区町村まででも可</p>
                <input type="text" {...register(`${prefix}Address`)} className={inputStyle} />
              </div>
              <div className="mb-4">
                <label className={labelStyle}>住宅タイプ <span className="text-red-600">＊</span></label>
                <div className="space-y-1">
                  {["アパート・マンション（エレベーターあり）", "アパート・マンション（エレベーターなし）", "一軒家", "その他"].map((type) => (
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
                <label className={labelStyle}>階数 <span className="text-red-600">＊</span></label>
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

        <section className="text-center">
          <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded hover:bg-blue-700 transition">
            次へ（荷物情報ページへ）
          </button>
        </section>
      </form>
    </main>
  );
}
