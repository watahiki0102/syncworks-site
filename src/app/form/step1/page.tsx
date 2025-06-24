// ✅ セクションは：基本情報 / 引越し希望日時 / 引越し元 / 引越し先

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function Step1FormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();


  const router = useRouter();
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  useEffect(() => {
    const init = async () => {
    };
    init();
  }, []);
  const commonDomains = [
    'gmail.com',
    'yahoo.co.jp',
    'icloud.com',
    'outlook.com',
    'hotmail.com'
  ];

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }
    if (value.includes('@')) {
      const [local, partial] = value.split('@');
      const filtered = commonDomains
        .filter((d) => d.startsWith(partial))
        .map((d) => `${local}@${d}`);
      setEmailSuggestions(filtered);
    } else {
      const suggestions = commonDomains.map((d) => `${value}@${d}`);
      setEmailSuggestions(suggestions);
    }
    setShowEmailSuggestions(true);
  };

  const onSubmit = (data: any) => {
    try {
      // ローカルストレージに保存
      localStorage.setItem('formStep1', JSON.stringify(data));
      router.push('/form/step2');
    } catch (e) {
      console.error("送信エラー:", e);
    }
  };

  // ローカルストレージから入力内容を復元
  useEffect(() => {
    const saved = localStorage.getItem('formStep1');
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
  const fromOther = watch("fromResidenceType") === "その他";
  const toOther = watch("toResidenceType") === "その他";
  const fromPostalCode = watch("fromPostalCode");
  const toPostalCode = watch("toPostalCode");
  const fromAddress = watch("fromAddress");
  const toAddress = watch("toAddress");

  // 5秒ごとに現在の入力内容をローカルストレージへ保存
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const data = watch();
        localStorage.setItem('formStep1', JSON.stringify(data));
      } catch (e) {
        console.error('自動保存エラー:', e);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [watch]);

  // 郵便番号入力時に住所を自動取得
  useEffect(() => {
    const fetchAddress = async (zipcode: string, prefix: string) => {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { address1, address2, address3 } = data.results[0];
          setValue(`${prefix}Address`, `${address1}${address2}${address3}`);
        }
      } catch (e) {
        console.error('郵便番号から住所の取得に失敗しました', e);
      }
    };

    if (fromPostalCode && /^[0-9]{7}$/.test(fromPostalCode) && !fromAddress) {
      fetchAddress(fromPostalCode, 'from');
    }
    if (toPostalCode && /^[0-9]{7}$/.test(toPostalCode) && !toAddress) {
      fetchAddress(toPostalCode, 'to');
    }
  }, [fromPostalCode, toPostalCode, fromAddress, toAddress, setValue]);


  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">📦 引越し相見積もりフォーム</h1>
        <div>
          <div className="text-center text-sm text-red-600 mb-2"><span className="text-red-600 font-bold">＊</span>が付いている項目は必須入力です</div>
          <div className="text-center text-sm text-red-600">入力内容は5秒ごとに自動保存されます</div>
          <div className="text-center text-sm text-red-600" >入力途中で閉じても再開可能です</div>
        </div>

        {/* 👤 基本情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 基本情報</h2>
          <div className="space-y-4">
            {/* 引越タイプ */}
            <div>
              <label className={labelStyle}>
                🏠 引越タイプ <span className="text-red-600">＊</span>
              </label>
              <div className={`space-x-4 text-gray-800 p-2 rounded ${errors.moveType ? 'border border-red-500' : ''}`}>
                <label>
                  <input
                    type="radio"
                    {...register("moveType", { required: true })}
                    value="単身"
                    className="mr-1"
                  />
                  単身引越し
                </label>
                <label>
                  <input
                    type="radio"
                    {...register("moveType", { required: true })}
                    value="家族"
                    className="mr-1"
                  />
                  家族引越し
                </label>
              </div>
              {errors.moveType && (
                <p className="text-red-500 text-sm mt-1">※ 引越タイプを選択してください</p>
              )}
            </div>

            {/* 姓＋名（スマホでも横並び） */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>📛 姓<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('lastName', { required: true })}
                  className={`${inputStyle} border ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">※ 姓は必須です</p>}
              </div>
              <div>
                <label className={labelStyle}>📛 名<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('firstName', { required: true })}
                  className={`${inputStyle} border ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">※ 名は必須です</p>}
              </div>
            </div>

            {/* セイ＋メイ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>📛 セイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('lastNameKana', {
                    required: true,
                    pattern: /^[ァ-ヶー　]+$/u
                  })}
                  className={`${inputStyle} border ${errors.lastNameKana ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="カタカナ"
                />
                {errors.lastNameKana?.type === 'required' && <p className="text-red-500 text-sm mt-1">※ セイは必須です</p>}
                {errors.lastNameKana?.type === 'pattern' && <p className="text-red-500 text-sm mt-1">※ カタカナで入力してください</p>}
              </div>
              <div>
                <label className={labelStyle}>📛 メイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('firstNameKana', {
                    required: true,
                    pattern: /^[ァ-ヶー　]+$/u
                  })}
                  className={`${inputStyle} border ${errors.firstNameKana ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="カタカナ"
                />
                {errors.firstNameKana?.type === 'required' && <p className="text-red-500 text-sm mt-1">※ メイは必須です</p>}
                {errors.firstNameKana?.type === 'pattern' && <p className="text-red-500 text-sm mt-1">※ カタカナで入力してください</p>}
              </div>
            </div>

            {/* 携帯番号 */}
            <div>
              <label className={labelStyle}>📞 携帯番号（ハイフンなし）<span className="text-red-600">＊</span></label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '');
                }}
                {...register("phone", {
                  required: true,
                  pattern: /^[0-9]{11}$/
                })}
                className={`${inputStyle} border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="例：08012345678"
              />
              {errors.phone?.type === "required" && (
                <p className="text-red-500 text-sm mt-1">※ 電話番号は必須です</p>
              )}
              {errors.phone?.type === "pattern" && (
                <p className="text-red-500 text-sm mt-1">※ 電話番号は11桁の数字で入力してください</p>
              )}
            </div>

            {/* メール */}
            <div className="relative">
              <label className={labelStyle}>
                📧 メールアドレス <span className="text-red-600">＊</span>
              </label>
              <input
                type="text"
                autoComplete="off"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}$/,
                    message: "※ 正しいメールアドレス形式で入力してください"
                  }
                })}
                onInput={(e) => {
                  handleEmailInput(e as React.ChangeEvent<HTMLInputElement>);
                }}
                onFocus={() => setShowEmailSuggestions(emailSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 100)}
                className={`${inputStyle} border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="例：example@gmail.com"
              />
              {showEmailSuggestions && emailSuggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-300 w-full rounded shadow max-h-48 overflow-y-auto">
                  {emailSuggestions.map((s) => (
                    <li
                      key={s}
                      className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                      onMouseDown={() => {
                        setValue('email', s);
                        setShowEmailSuggestions(false);
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {errors.email?.type === "required" && (
                <p className="text-red-500 text-sm mt-1">※ メールアドレスは必須です</p>
              )}
              {typeof errors.email?.message === "string" && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* 🕓 引越し希望日時 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🕓 引越し希望日時</h2>
          <p className="text-sm text-gray-500 mb-2">※ お申し込みから「10日後以降」の日程を目安にご入力ください</p>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => {
              const isRequired = n === 1;
              const dateError = errors[`date${n}`];
              const timeSlotError = errors[`timeSlot${n}`];

              const dateInputClass = `${inputStyle} border ${dateError ? 'border-red-500' : 'border-gray-300'}`;
              const timeSelectClass = `${inputStyle} border ${timeSlotError ? 'border-red-500' : 'border-gray-300'}`;

              return (
                <div key={n} className="grid grid-cols-2 gap-4"> {/* 常時2列 */}
                  {/* 日付 */}
                  <div>
                    <label className={labelStyle}>
                      🗓️ 第{n}希望日{isRequired && <span className="text-red-600">＊</span>}
                    </label>
                    <input
                      type="date"
                      min={(() => {
                        const today = new Date();
                        return today.toISOString().split("T")[0];
                      })()}
                      {...register(`date${n}`, {
                        required: isRequired
                      })}
                      className={dateInputClass}
                    />
                    {dateError && (
                      <p className="text-red-500 text-sm mt-1">※ 第{n}希望日は必須です</p>
                    )}
                  </div>
                  {/* 時間帯 */}
                  <div>
                    <label className={labelStyle}>
                      ⏰ 時間帯{isRequired && <span className="text-red-600">＊</span>}
                    </label>
                    <select
                      {...register(`timeSlot${n}`, { required: isRequired })}
                      className={timeSelectClass}
                    >
                      <option value=""></option>
                      <option value="none">指定なし</option>
                      <option value="early_morning">早朝(6-9時)</option>
                      <option value="morning">午前(9-12時)</option>
                      <option value="afternoon">午後(12-15時)</option>
                      <option value="evening">夕方(15-18時)</option>
                      <option value="night">夜間(18-21時)</option>
                      <option value="not_early">早朝以外(9-21時)</option>
                      <option value="not_night">夜間以外(6-18時)</option>
                      <option value="daytime_only">早朝・夜間以外(9-18時)</option>
                    </select>
                    {timeSlotError && (
                      <p className="text-red-500 text-sm mt-1">※ 第{n}希望時間帯は必須です</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 📍 引越し元・引越し先情報 */}
        <section className={sectionStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 引越し元・引越し先の情報</h2>
          {[{ label: "引越し元", prefix: "from" }, { label: "引越し先", prefix: "to" }].map(({ label, prefix }) => {
            const postalError = errors[`${prefix}PostalCode`];
            const addressError = errors[`${prefix}Address`];
            const residenceTypeError = errors[`${prefix}ResidenceType`];
            const floorError = errors[`${prefix}Floor`];
            // 住宅タイプを取得
            const fromResidenceType = watch('fromResidenceType');
            const toResidenceType = watch('toResidenceType');
            // 各ループ内で判定
            const isHouse = (prefix === "from" ? fromResidenceType : toResidenceType) === "一軒家";
            return (
              <div key={prefix} className="mb-6">
                <h3 className="text-md font-semibold mb-2">📍 {label}</h3>
                {/* 郵便番号 */}
                <div className="mb-4">
                  <label className={labelStyle}>郵便番号 {prefix === "to" && <span className="text-red-600">＊</span>}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                    {...register(`${prefix}PostalCode`, {
                      required: prefix === "to" ? "※ 郵便番号は必須です" : false,
                      pattern: {
                        value: /^[0-9]{7}$/,
                        message: "※ 郵便番号は7桁の数字で入力してください"
                      }
                    })}
                    className={`${inputStyle} border ${postalError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="例：1234567"
                  />
                  {addressError?.type === 'required' && (
                    <p className="text-red-500 text-sm mt-1">※ 郵便番号は必須です</p>
                  )}
                  {postalError?.type === 'pattern' && (
                    <p className="text-red-500 text-sm mt-1">※ 郵便番号は7桁の数字で入力してください</p>
                  )}
                </div>
                {/* 住所 */}
                <div className="mb-4">
                  <label className={labelStyle}>住所 <span className="text-red-600">＊</span></label>
                  <input
                    type="text"
                    {...register(`${prefix}Address`, {
                      required: true,
                      validate: (v) => /[市区町村郡]/.test(v)
                    })}
                    className={`${inputStyle} border ${addressError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {addressError?.type === 'required' && (
                    <p className="text-red-500 text-sm mt-1">※ 住所は必須です</p>
                  )}
                  {addressError?.type === 'validate' && (
                    <p className="text-red-500 text-sm mt-1">※ 市区町村名を含めて入力してください</p>
                  )}
                </div>
                {/* 住宅タイプ */}
                <div className="mb-4">
                  <label className={labelStyle}>住宅タイプ <span className="text-red-600">＊</span></label>
                  <div className={`space-y-1 p-2 rounded ${residenceTypeError ? 'border border-red-500' : ''}`}>
                    {[
                      "アパート・マンション（エレベーター利用可）",
                      "アパート・マンション（エレベーター利用不可）",
                      "一軒家"
                    ].map((type) => (
                      <label key={type} className="block">
                        <input
                          type="radio"
                          value={type}
                          {...register(`${prefix}ResidenceType`, { required: true })}
                          className="mr-2"
                        />
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
                  {residenceTypeError && (
                    <p className="text-red-500 text-sm mt-1">※ 住宅タイプを選択してください</p>
                  )}
                </div>
                {/* 階数 */}
                <div>
                  <label className={labelStyle}>階数 <span className="text-red-600">＊</span></label>
                  {((prefix === "from" ? fromResidenceType : toResidenceType) === "一軒家") && (
                    <p className="text-sm text-gray-500 mb-1">※ 建物全体の階数を入力してください</p>
                  )}
                  <select
                    {...register(`${prefix}Floor`, { required: true })}
                    className={`${inputStyle} border ${floorError ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">選択してください</option>
                    {[...Array(50)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}階</option>
                    ))}
                    <option value="51以上">51階以上</option>
                  </select>
                  {floorError && (
                    <p className="text-red-500 text-sm mt-1">※ 階数を選択してください</p>
                  )}
                </div>
              </div>
            );
          })}
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
