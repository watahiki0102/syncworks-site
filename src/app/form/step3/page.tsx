/**
 * 引越し見積もりフォーム Step3 ページコンポーネント
 * - 作業オプションの選択
 * - 備考・連絡事項の入力
 * - 最終確認と送信処理
 */
// ✅ Step3: 作業オプション＋備考＋確認送信ページ
// セクションは：作業オプション / 備考入力 / 最終確認

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';

/**
 * 自動保存の間隔（ミリ秒）
 */
const AUTOSAVE_INTERVAL = 5000;

/**
 * ローカルストレージのキー
 */
const STORAGE_KEY = 'formStep3';

/**
 * スタイル定義
 */
const styles = {
  section: "bg-white shadow-md rounded-lg p-6 border border-gray-200",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
  button: {
    back: "bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500",
    next: "bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700"
  }
};

/**
 * 作業オプションの選択肢
 * 引越し作業で必要な追加サービス
 */
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

/**
 * Step3フォームデータの型定義
 */
interface Step3FormData {
  options?: string[];  // 選択された作業オプション
  remarks?: string;    // 備考・連絡事項
}

/**
 * 全ステップの統合データ型定義
 */
interface CompleteFormData {
  step1: any;
  step2: any;
  step3: any;
  totalPoints: number;
  estimatedPrice: number;
  recommendedTruckType: string;
  submissionId: string;
  distance: number;
  referralId?: string | null; // 紹介ID
  contactPreference?: 'line' | 'email'; // 連絡手段
}

/**
 * 見積もり計算ロジック
 * @param step1Data - Step1のデータ
 * @param step2Data - Step2のデータ
 * @returns 計算結果
 */
const calculateEstimate = (step1Data: any, step2Data: any) => {
  // アイテムポイントの計算
  let totalPoints = 0;
  
  if (step2Data.items) {
    // 各アイテムの数量とポイントを計算
    Object.entries(step2Data.items).forEach(([itemName, quantity]) => {
      if (typeof quantity === 'number' && quantity > 0) {
        // アイテム名からポイントを取得（簡易版）
        const points = getItemPoints(itemName);
        totalPoints += points * quantity;
      }
    });
  }

  // 段ボールの追加ポイント
  if (step2Data.items?.danball) {
    const danballPoints = getDanballPoints(step2Data.items.danball);
    totalPoints += danballPoints;
  }

  // トラック種別の決定
  const recommendedTruckType = getRecommendedTruckType(totalPoints);
  
  // 基本料金の計算
  const basePrice = getBasePrice(recommendedTruckType, totalPoints);
  
  // 距離料金の計算（簡易版）
  const distance = calculateDistance(step1Data.fromAddress, step1Data.toAddress);
  const distancePrice = getDistancePrice(distance);
  
  // 総額計算
  const estimatedPrice = basePrice + distancePrice;

  return {
    totalPoints,
    estimatedPrice,
    recommendedTruckType,
    distance
  };
};

/**
 * アイテムのポイントを取得
 * @param itemName - アイテム名
 * @returns ポイント数
 */
const getItemPoints = (itemName: string): number => {
  // 簡易的なポイント計算（実際は定数ファイルから取得）
  const pointMap: Record<string, number> = {
    '🛏️ シングルベッド': 3,
    '🛏️ ダブルベッド': 5,
    '🛋️ ソファ（2人掛け）': 6,
    '🧺 洗濯機（縦型）': 5,
    '🧊 冷蔵庫（大型）': 7,
    '📺 テレビ（40〜60インチ）': 5,
    '🎹 ピアノ（アップライト）': 16,
    '🗄 タンス（大型）': 5,
    '🍴 ダイニングテーブル（4人用）': 6,
    '💻 パソコンデスク': 5,
  };
  
  return pointMap[itemName] || 2; // デフォルト2ポイント
};

/**
 * 段ボールのポイントを取得
 * @param danballOption - 段ボール選択肢
 * @returns ポイント数
 */
const getDanballPoints = (danballOption: string): number => {
  if (danballOption.includes('10箱未満')) return 5;
  if (danballOption.includes('10〜20箱')) return 10;
  if (danballOption.includes('21〜30箱')) return 15;
  if (danballOption.includes('31〜50箱')) return 25;
  if (danballOption.includes('51箱以上')) return 40;
  return 0;
};

/**
 * 推奨トラック種別を取得
 * @param totalPoints - 総ポイント
 * @returns トラック種別
 */
const getRecommendedTruckType = (totalPoints: number): string => {
  if (totalPoints <= 50) return '2tショート';
  if (totalPoints <= 75) return '2tロング';
  if (totalPoints <= 100) return '4t';
  if (totalPoints <= 150) return '6t';
  return '10t';
};

/**
 * 基本料金を取得
 * @param truckType - トラック種別
 * @param totalPoints - 総ポイント
 * @returns 基本料金
 */
const getBasePrice = (truckType: string, totalPoints: number): number => {
  const basePrices: Record<string, number> = {
    '2tショート': 25000,
    '2tロング': 35000,
    '4t': 45000,
    '6t': 60000,
    '10t': 80000,
  };
  
  return basePrices[truckType] || 45000;
};

/**
 * 距離を計算（簡易版）
 * @param fromAddress - 引越し元住所
 * @param toAddress - 引越し先住所
 * @returns 距離（km）
 */
const calculateDistance = (fromAddress: string, toAddress: string): number => {
  // 簡易的な距離計算（実際はGoogle Maps API等を使用）
  // 都道府県が同じなら10km、違えば50kmとして計算
  const fromPrefecture = fromAddress.match(/東京都|神奈川県|埼玉県|千葉県/)?.[0];
  const toPrefecture = toAddress.match(/東京都|神奈川県|埼玉県|千葉県/)?.[0];
  
  return fromPrefecture === toPrefecture ? 10 : 50;
};

/**
 * 距離料金を取得
 * @param distance - 距離（km）
 * @returns 距離料金
 */
const getDistancePrice = (distance: number): number => {
  if (distance <= 10) return 0;
  if (distance <= 30) return 5000;
  if (distance <= 50) return 10000;
  return 15000;
};

/**
 * 管理者画面への通知データを作成
 * @param completeData - 完全なフォームデータ
 * @returns 通知データ
 */
const createNotificationData = (completeData: CompleteFormData) => {
  return {
    id: completeData.submissionId,
    customerName: `${completeData.step1.lastName} ${completeData.step1.firstName}`,
    customerEmail: completeData.step1.email,
    customerPhone: completeData.step1.phone,
    moveDate: completeData.step1.date1,
    originAddress: completeData.step1.fromAddress,
    destinationAddress: completeData.step1.toAddress,
    totalPoints: completeData.totalPoints,
    totalCapacity: completeData.totalPoints * 10, // 簡易計算
    distance: completeData.distance,
    itemList: Object.keys(completeData.step2.items || {}).filter(key => 
      completeData.step2.items[key] > 0
    ),
    additionalServices: completeData.step3.options || [],
    status: 'pending',
    truckAssignments: [],
    createdAt: new Date().toISOString(),
    contractStatus: 'estimate',
    estimatedPrice: completeData.estimatedPrice,
    recommendedTruckType: completeData.recommendedTruckType,
    referralId: completeData.referralId, // 紹介IDを含める
  };
};

export default function Step3FormPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step3FormData>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * フォームデータをローカルストレージに保存
   * @param data - 保存するフォームデータ
   */
  const saveFormData = (data: Step3FormData) => {
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
  const onSubmit = async (data: Step3FormData) => {
    setIsSubmitting(true);
    
    try {
      // 全ステップのデータを取得
      const step1Data = JSON.parse(localStorage.getItem('formStep1') || '{}');
      const step2Data = JSON.parse(localStorage.getItem('formStep2') || '{}');
      
      // 見積もり計算
      const estimateResult = calculateEstimate(step1Data, step2Data);
      
      // 完全なデータを作成
      const completeData: CompleteFormData = {
        step1: step1Data,
        step2: step2Data,
        step3: data,
        totalPoints: estimateResult.totalPoints,
        estimatedPrice: estimateResult.estimatedPrice,
        recommendedTruckType: estimateResult.recommendedTruckType,
        submissionId: `submission-${Date.now()}`,
        distance: estimateResult.distance,
        referralId: step1Data.referralId || null, // 紹介IDを含める
      };
      
      // 管理者画面への通知データを作成
      const notificationData = createNotificationData(completeData);
      
      // 既存のフォーム送信データを取得
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      
      // 新しい送信データを追加
      const updatedSubmissions = [...existingSubmissions, notificationData];
      localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
      
      // 完了画面に遷移（ticketパラメータを使用）
      router.push(`/form/complete?ticket=${completeData.submissionId}`);
      
    } catch (e) {
      console.error("Step3送信エラー:", e);
      alert('送信時にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
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
        setValue(key as keyof Step3FormData, value as any);
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

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-xl md:text-3xl font-bold text-center text-blue-800">🔧 作業オプションと備考入力</h1>
        <ProgressBar current={3} total={3} />

        {/* 作業オプション */}
        <section className={styles.section}>
          <h2 className="text-xl font-semibold mb-4">🔧 必要な作業オプションを選択してください</h2>
          <div className="space-y-2">
            {workOptions.map((opt) => (
              <label key={opt} className="block">
                <input type="checkbox" {...register("options", { validate: v => (v && v.length > 0) || '※ 1つ以上選択してください' })} value={opt} className="mr-2" />
                {opt}
              </label>
            ))}
            {errors.options && (
              <p className="text-red-600 text-sm mt-1">{errors.options.message}</p>
            )}
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
            <button type="button" onClick={() => router.back()} className={styles.button.back} disabled={isSubmitting}>
              戻る
            </button>
            <button type="submit" className={styles.button.next} disabled={isSubmitting}>
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">3 / 3 ページ</div>
        </section>
      </form>
    </main>
  );
}
