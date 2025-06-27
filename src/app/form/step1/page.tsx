// ✅ セクションは：基本情報 / 引越し希望日時 / 引越し元 / 引越し先

'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import "react-datepicker/dist/react-datepicker.css";

// 型定義
interface FormData {
  moveType: string; // 引越しタイプ
  lastName: string; // 姓
  firstName: string; // 名
  lastNameKana: string; // 姓（カタカナ）
  firstNameKana: string; // 名（カタカナ）
  phone: string; // 携帯番号
  email: string; // メールアドレス
  date1: string; // 第1希望日
  date2: string; // 第2希望日
  date3: string; // 第3希望日
  timeSlot1: string; // 第1希望時間帯
  timeSlot2: string; // 第2希望時間帯
  timeSlot3: string; // 第3希望時間帯
  fromPostalCode: string; // 引越し元郵便番号
  fromAddress: string; // 引越し元住所
  fromResidenceType: string; // 引越し元住宅タイプ
  fromResidenceOther?: string; // 引越し元その他の住宅タイプ
  fromFloor: string; // 引越し元階数
  toPostalCode: string; // 引越し先郵便番号
  toAddress: string; // 引越し先住所
  toResidenceType: string; // 引越し先住宅タイプ
  toResidenceOther?: string; // 引越し先その他の住宅タイプ
  toFloor: string; // 引越し先階数
}

// 定数
const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.co.jp',
  'icloud.com',
  'outlook.com',
  'hotmail.com'
];

const TIME_SLOTS = [
  { value: 'none', label: '指定なし' },
  { value: 'early_morning', label: '早朝（6～9時）' },
  { value: 'morning', label: '午前（9～12時）' },
  { value: 'afternoon', label: '午後（12～15時）' },
  { value: 'evening', label: '夕方（15～18時）' },
  { value: 'night', label: '夜間（18～21時）' },
  { value: 'not_early', label: '早朝以外（9～21時）' },
  { value: 'not_night', label: '夜間以外（6～18時）' },
  { value: 'daytime_only', label: '早朝・夜間以外（9～18時）' }
];

const RESIDENCE_TYPES = [
  "アパート・マンション（エレベーター利用可）",
  "アパート・マンション（エレベーター利用不可）",
  "一軒家"
];

// スタイル
const STYLES = {
  section: "bg-white shadow-md rounded-lg p-6 border border-gray-200",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
  error: "text-red-500 text-sm mt-1"
};

// ユーティリティ関数
const loadSavedData = (): Partial<FormData> => {
  if (typeof window === 'undefined') return {};
  
  const saved = localStorage.getItem('formStep1');
  if (!saved) return {};
  
  return JSON.parse(saved);
};

const validateDate = (value: string, index: number): string | true => {
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected > today || `※ 第${index}希望日に過去日が設定されています`;
};

// コンポーネント
const ErrorMessage = ({ message }: { message: string }) => (
  <p className={STYLES.error}>{message}</p>
);

const DateTimeSection = ({ 
  index, 
  register, 
  watch, 
  errors, 
  isRequired 
}: {
  index: number;
  register: any;
  watch: any;
  errors: any;
  isRequired: boolean;
}) => {
  const selectedDate = watch(`date${index}`);
  const selectedTime = watch(`timeSlot${index}`);
  const dateError = errors[`date${index}`];
  const timeSlotError = errors[`timeSlot${index}`];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className={STYLES.label}>
          🗓️ 第{index}希望日{isRequired && <span className="text-red-600">＊</span>}
        </label>
        <input
          type="date"
          {...register(`date${index}`, {
            required: isRequired ? `※ 第${index}希望日は必須です` : false,
            validate: (value: string) => {
              // 非必須の場合は空の場合はtrueを返す
              if (!isRequired && !value) return true;
              const selected = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              selected.setHours(0, 0, 0, 0);
              
              if (selected < today) {
                return `※ 第${index}希望日に過去の日付は選択できません`;
              }
              return true;
            }
          })}
          className={`${STYLES.input} border ${dateError ? 'border-red-500' : 'border-gray-300'}`}
        />
        {dateError?.message && (
          <ErrorMessage message={dateError.message} />
        )}
      </div>
      <div>
        <label className={STYLES.label}>
          ⏰ 時間帯{isRequired && <span className="text-red-600">＊</span>}
        </label>
        <select
          {...register(`timeSlot${index}`, {
            required: isRequired,
            validate: (value: string) => {
              if (!isRequired) {
                // 任意枠で両方空ならOK
                if (!selectedDate && !value) return true;
                // 日付が選択されている場合かつ時間帯が空の場合はエラーメッセージを返す
                if (selectedDate && !value) {
                  return `※ 第${index}希望日に対する時間帯を選択してください`;
                }
                // 日付が選択されていない場合かつ時間帯が選択されている場合はエラーメッセージを返す
                if (!selectedDate && value) {
                  return `※ 第${index}希望日の入力が先に必要です`;
                }
              }
              return true;
            },
          })}
          className={`${STYLES.input} border ${timeSlotError ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">選択してください</option>
          {TIME_SLOTS.map(slot => (
            <option key={slot.value} value={slot.value}>{slot.label}</option>
          ))}
        </select>
        {/* 時間帯が選択されていない場合はエラーメッセージを表示 */}
        {timeSlotError && selectedDate && isRequired && (
          <ErrorMessage message={
            typeof timeSlotError === "string" 
              ? timeSlotError 
              : `※ 第${index}希望時間帯を選択してください`
          } />
        )}
      </div>
    </div>
  );
};

const AddressSection = ({ 
  label, 
  prefix, 
  register, 
  watch, 
  errors, 
  setValue 
}: {
  label: string;
  prefix: 'from' | 'to';
  register: any;
  watch: any;
  errors: any;
  setValue: any;
}) => {
  const residenceType = watch(`${prefix}ResidenceType`);
  const isHouse = residenceType === "一軒家";
  const isOther = residenceType === "その他";

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2">📍 {label}</h3>
      
      <div className="mb-4">
        <label className={STYLES.label}>
          郵便番号 {prefix === "from" && <span className="text-red-600">＊</span>}
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9]/g, '');
          }}
          {...register(`${prefix}PostalCode`, {
            required: prefix === "from" && "※ 郵便番号は必須です",
            pattern: {
              value: /^[0-9]{7}$/,
              message: "※ 郵便番号は7桁の数字で入力してください"
            },
            validate: (value: string) => {
              if (!value) return true;
              return value.length === 7 || "※ 郵便番号は7桁ちょうどで入力してください";
            }
          })}
          className={`${STYLES.input} border ${errors[`${prefix}PostalCode`] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="例：1234567"
        />
        {errors[`${prefix}PostalCode`] && (
          <ErrorMessage message={errors[`${prefix}PostalCode`].message || "※ 郵便番号は必須です"} />
        )}
      </div>

      <div className="mb-4">
        <label className={STYLES.label}>住所 <span className="text-red-600">＊</span></label>
        <input
          type="text"
          {...register(`${prefix}Address`, {
            required: true,
            validate: (v: string) => /[市区町村郡]/.test(v)
          })}
          className={`${STYLES.input} border ${errors[`${prefix}Address`] ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors[`${prefix}Address`]?.type === 'required' && (
          <ErrorMessage message="※ 住所は必須です" />
        )}
        {errors[`${prefix}Address`]?.type === 'validate' && (
          <ErrorMessage message="※ 市区町村名を含めて入力してください" />
        )}
      </div>

      <div className="mb-4">
        <label className={STYLES.label}>住宅タイプ <span className="text-red-600">＊</span></label>
        <div className={`space-y-1 p-2 rounded ${errors[`${prefix}ResidenceType`] ? 'border border-red-500' : ''}`}>
          {RESIDENCE_TYPES.map((type) => (
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
          {isOther && (
            <input
              type="text"
              placeholder="住宅タイプを入力"
              {...register(`${prefix}ResidenceOther`)}
              className={`${STYLES.input} mt-2`}
            />
          )}
        </div>
        {errors[`${prefix}ResidenceType`] && (
          <ErrorMessage message="※ 住宅タイプを選択してください" />
        )}
      </div>

      <div>
        <label className={STYLES.label}>階数 <span className="text-red-600">＊</span></label>
        {isHouse && (
          <p className="text-sm text-gray-500 mb-1">※ 建物全体の階数を入力してください</p>
        )}
        <select
          {...register(`${prefix}Floor`, { required: true })}
          className={`${STYLES.input} border ${errors[`${prefix}Floor`] ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">選択してください</option>
          {[...Array(50)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}階</option>
          ))}
          <option value="51以上">51階以上</option>
        </select>
        {errors[`${prefix}Floor`] && (
          <ErrorMessage message="※ 階数を選択してください" />
        )}
      </div>
    </div>
  );
};

export default function Step1FormPage() {
  const router = useRouter();
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const prevPostalCodeRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormData>();

  // クライアントサイドでのみローカルストレージからデータを読み込み
  useEffect(() => {
    setIsClient(true);
    const savedData = loadSavedData();
    if (Object.keys(savedData).length > 0) {
      Object.entries(savedData).forEach(([key, value]) => {
        setValue(key as keyof FormData, value);
      });
    }
  }, [setValue]);

  // メールアドレスのサジェスチョンを処理する関数
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }
    
    if (value.includes('@')) {
      const [local, partial] = value.split('@');
      const filtered = COMMON_DOMAINS
        .filter((d) => d.startsWith(partial))
        .map((d) => `${local}@${d}`);
      setEmailSuggestions(filtered);
    } else {
      const suggestions = COMMON_DOMAINS.map((d) => `${value}@${d}`);
      setEmailSuggestions(suggestions);
    }
    setShowEmailSuggestions(true);
  };

  // フォーム送信時の処理
  const onSubmit = (data: FormData) => {
    try {
      localStorage.setItem('formStep1', JSON.stringify(data));
      router.push('/form/step2');
    } catch (e) {
      console.error("送信エラー:", e);
    }
  };

  // 5秒ごとに自動保存
  useEffect(() => {
    if (!isClient) return;
    
    const id = setInterval(() => {
      try {
        const data = watch();
        localStorage.setItem('formStep1', JSON.stringify(data));
      } catch (e) {
        console.error('自動保存エラー:', e);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [watch, isClient]);

  // 郵便番号から住所を自動補完
  useEffect(() => {
    if (!isClient) return;
    
    const subscription = watch((value, { name }) => {
      if (name === 'fromPostalCode' || name === 'toPostalCode') {
        const zipcode = value[name];
        const prev = prevPostalCodeRef.current;

        if (zipcode && zipcode !== prev && /^\d{7}$/.test(zipcode)) {
          prevPostalCodeRef.current = zipcode;
          const addressField = name === 'fromPostalCode' ? 'fromAddress' : 'toAddress';

          fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                const { address1, address2, address3 } = data.results[0];
                setValue(addressField, `${address1}${address2}${address3}`);
              }
            })
            .catch((e) => {
              console.error('郵便番号から住所の取得に失敗しました:', e);
            });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, isClient]);

  // クライアントサイドでない場合はローディング表示
  if (!isClient) {
    return (
      <main className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">フォームを読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-800">📦 引越し相見積もりフォーム</h1>
        <div className="text-center text-sm text-gray-600 mb-4">
          <p className="mb-1">📝 入力項目：<span className="font-semibold">全3ページ</span></p>
          <p className="mb-1">⏳ 所要時間：<span className="font-semibold">約15分</span>（目安）</p>
        </div>
        <div>
          <div className="text-center text-sm text-red-600 mb-2">
            <span className="text-red-600 font-bold">＊</span>が付いている項目は必須入力です
          </div>
          <div className="text-center text-sm text-red-600">入力内容は5秒ごとに自動保存されます</div>
          <div className="text-center text-sm text-red-600">入力途中で閉じても再開可能です</div>
        </div>

        {/* 👤 基本情報 */}
        <section className={STYLES.section}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 基本情報</h2>
          <div className="space-y-4">
            {/* 引越タイプ */}
            <div>
              <label className={STYLES.label}>
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
                <ErrorMessage message="※ 引越タイプを選択してください" />
              )}
            </div>

            {/* 姓＋名 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={STYLES.label}>📛 姓<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('lastName', { required: true })}
                  className={`${STYLES.input} border ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <ErrorMessage message="※ 姓は必須です" />}
              </div>
              <div>
                <label className={STYLES.label}>📛 名<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('firstName', { required: true })}
                  className={`${STYLES.input} border ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.firstName && <ErrorMessage message="※ 名は必須です" />}
              </div>
            </div>

            {/* セイ＋メイ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={STYLES.label}>📛 セイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('lastNameKana', {
                    required: true,
                    pattern: /^[ァ-ヶー　]+$/u
                  })}
                  className={`${STYLES.input} border ${errors.lastNameKana ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="カタカナ"
                />
                {errors.lastNameKana?.type === 'required' && <ErrorMessage message="※ セイは必須です" />}
                {errors.lastNameKana?.type === 'pattern' && <ErrorMessage message="※ カタカナで入力してください" />}
              </div>
              <div>
                <label className={STYLES.label}>📛 メイ（カタカナ）<span className="text-red-600">＊</span></label>
                <input
                  type="text"
                  {...register('firstNameKana', {
                    required: true,
                    pattern: /^[ァ-ヶー　]+$/u
                  })}
                  className={`${STYLES.input} border ${errors.firstNameKana ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="カタカナ"
                />
                {errors.firstNameKana?.type === 'required' && <ErrorMessage message="※ メイは必須です" />}
                {errors.firstNameKana?.type === 'pattern' && <ErrorMessage message="※ カタカナで入力してください" />}
              </div>
            </div>

            {/* 携帯番号 */}
            <div>
              <label className={STYLES.label}>📞 携帯番号（ハイフンなし）<span className="text-red-600">＊</span></label>
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
                className={`${STYLES.input} border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="例：08012345678"
              />
              {errors.phone?.type === "required" && (
                <ErrorMessage message="※ 電話番号は必須です" />
              )}
              {errors.phone?.type === "pattern" && (
                <ErrorMessage message="※ 電話番号は11桁の数字で入力してください" />
              )}
            </div>

            {/* メール */}
            <div className="relative">
              <label className={STYLES.label}>
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
                  },
                  onChange: (e) => handleEmailInput(e),
                })}
                onFocus={() => setShowEmailSuggestions(emailSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 100)}
                className={`${STYLES.input} border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
                <ErrorMessage message="※ メールアドレスは必須です" />
              )}
              {typeof errors.email?.message === "string" && (
                <ErrorMessage message={errors.email.message} />
              )}
            </div>
          </div>
        </section>

        {/* 🕓 引越し希望日時 */}
        <section className={STYLES.section}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🕓 引越し希望日時</h2>
          <p className="text-sm text-gray-500 mb-2">※ お申し込みから「10日後以降」の日程を目安にご入力ください</p>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <DateTimeSection
                key={n}
                index={n}
                register={register}
                watch={watch}
                errors={errors}
                isRequired={n === 1}
              />
            ))}
          </div>
        </section>

        {/* 📍 引越し元・引越し先情報 */}
        <section className={STYLES.section}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 引越し元・引越し先の情報</h2>
          <AddressSection
            label="引越し元（現住所）"
            prefix="from"
            register={register}
            watch={watch}
            errors={errors}
            setValue={setValue}
          />
          <AddressSection
            label="引越し先（新住所）"
            prefix="to"
            register={register}
            watch={watch}
            errors={errors}
            setValue={setValue}
          />
        </section>

        <section className="text-center">
          <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded hover:bg-blue-700 transition">
            次へ（荷物情報ページへ）
          </button>
          <div className="text-sm text-gray-600">1 / 3 ページ</div>
        </section>
      </form>
    </main>
  );
}
