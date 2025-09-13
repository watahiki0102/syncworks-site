/**
 * 見積回答ページコンポーネント（改善版）
 * - /pricingデータを活用した自動算出による見積回答支援
 * - 詳細な案件情報表示と荷物ポイント集計
 * - わかりやすい見積回答機能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import QuoteResponseForm from '@/components/admin/QuoteResponseForm';
import { QuoteResponseFormData, QuoteResponseData } from '@/app/admin/cases/types/unified';
import { UnifiedCase } from '@/types/common';
import { generateUnifiedTestData } from '@/app/admin/cases/lib/unifiedData';
import { formatCurrency } from '@/utils/format';
import { ItemPoint, PricingRule, OptionItem, PricingData, AutoQuoteResult } from '@/types/pricing';

interface QuoteResponsePageProps {
  params: {
    id: string;
  };
}

// 拡張された案件データ
interface EnhancedCase extends UnifiedCase {
  propertyDetails?: {
    fromFloor?: number;
    toFloor?: number;
    hasElevator?: boolean;
    parkingAvailable?: boolean;
    notes?: string;
  };
}

export default function QuoteResponsePage({ params }: QuoteResponsePageProps) {
  const router = useRouter();
  const [caseItem, setCaseItem] = useState<EnhancedCase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // 自動算出結果のstate
  const [autoQuote, setAutoQuote] = useState<AutoQuoteResult>({
    totalPoints: 0,
    recommendedTruck: '',
    basePrice: 0,
    distancePrice: 0,
    estimatedDistance: 0,
    optionPrice: 0,
    adjustmentAmount: 0,
    finalPrice: 0
  });
  
  // /pricingデータ
  const [pricingData, setPricingData] = useState<PricingData>({
    itemPoints: [],
    pricingRules: [],
    options: []
  });
  


  // 距離を推定する関数（簡易版）
  const estimateDistance = (caseData: EnhancedCase): number => {
    if (!caseData.move?.fromAddress || !caseData.move?.toAddress) {
      return 10; // デフォルト10km
    }
    
    const fromAddr = caseData.move.fromAddress.toLowerCase();
    const toAddr = caseData.move.toAddress.toLowerCase();
    
    // 同じ市区町村内の場合
    if (fromAddr.includes(toAddr.split('市')[0]) || toAddr.includes(fromAddr.split('市')[0])) {
      return 5; // 5km
    }
    
    // 同じ都道府県内の場合
    const prefectures = ['東京', '大阪', '愛知', '神奈川', '埼玉', '千葉'];
    const fromPref = prefectures.find(p => fromAddr.includes(p));
    const toPref = prefectures.find(p => toAddr.includes(p));
    
    if (fromPref && toPref && fromPref === toPref) {
      return 20; // 20km
    }
    
    // 県外の場合
    return 50; // 50km
  };


  // /pricingデータの読み込み
  useEffect(() => {
    const loadPricingData = () => {
      // Step1: 荷物ポイントデータ
      const step1Data = localStorage.getItem('pricingStep0');
      let itemPoints = step1Data ? JSON.parse(step1Data) : [];
      
      // Step2: 料金ルールデータ
      const step2Data = localStorage.getItem('pricingStep2');
      let pricingRules = step2Data ? JSON.parse(step2Data) : [];
      
      // オプションデータ
      const optionData = localStorage.getItem('optionPricingStep2');
      let options = optionData ? JSON.parse(optionData) : [];
      
      // デフォルトデータが空の場合はテストデータを設定
      if (pricingRules.length === 0) {
        pricingRules = [
          { id: 'rule_1', truckType: '小型トラック', minPoint: 0, maxPoint: 100, price: 25000 },
          { id: 'rule_2', truckType: '中型トラック', minPoint: 101, maxPoint: 200, price: 35000 },
          { id: 'rule_3', truckType: '大型トラック', minPoint: 201, maxPoint: 300, price: 45000 },
          { id: 'rule_4', truckType: '超大型トラック', minPoint: 301, maxPoint: 500, price: 55000 }
        ];
      }
      
      if (itemPoints.length === 0) {
        itemPoints = [
          { id: 'item_1', category: '家電', name: '冷蔵庫（小型）', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_2', category: '家電', name: '冷蔵庫（中型）', points: 20, defaultPoints: 20, additionalCost: 0 },
          { id: 'item_3', category: '家電', name: '冷蔵庫（大型）', points: 25, defaultPoints: 25, additionalCost: 0 },
          { id: 'item_4', category: '家電', name: '洗濯機', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_5', category: '家電', name: 'テレビ（32型）', points: 10, defaultPoints: 10, additionalCost: 0 },
          { id: 'item_6', category: '家電', name: 'テレビ（40型）', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_7', category: '家電', name: 'テレビ（50型）', points: 20, defaultPoints: 20, additionalCost: 0 },
          { id: 'item_8', category: '家具', name: 'ベッド（シングル）', points: 10, defaultPoints: 10, additionalCost: 0 },
          { id: 'item_9', category: '家具', name: 'ベッド（ダブル）', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_10', category: '家具', name: 'ソファ（2人掛け）', points: 20, defaultPoints: 20, additionalCost: 0 },
          { id: 'item_11', category: '家具', name: 'ソファ（3人掛け）', points: 25, defaultPoints: 25, additionalCost: 0 },
          { id: 'item_12', category: '家具', name: 'ダイニングテーブル', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_13', category: '家具', name: 'タンス', points: 10, defaultPoints: 10, additionalCost: 0 },
          { id: 'item_14', category: '生活用品', name: 'ダンボール箱（10個）', points: 10, defaultPoints: 10, additionalCost: 0 },
          { id: 'item_15', category: '生活用品', name: 'ダンボール箱（15個）', points: 15, defaultPoints: 15, additionalCost: 0 },
          { id: 'item_16', category: '生活用品', name: 'ダンボール箱（20個）', points: 20, defaultPoints: 20, additionalCost: 0 },
          { id: 'item_17', category: '生活用品', name: 'ダンボール箱（25個）', points: 25, defaultPoints: 25, additionalCost: 0 },
          { id: 'item_18', category: '生活用品', name: 'ダンボール箱（30個）', points: 30, defaultPoints: 30, additionalCost: 0 },
          { id: 'item_19', category: '生活用品', name: 'ダンボール箱（40個）', points: 40, defaultPoints: 40, additionalCost: 0 },
          { id: 'item_20', category: '生活用品', name: '衣装ケース', points: 5, defaultPoints: 5, additionalCost: 0 }
        ];
      }
      
      if (options.length === 0) {
        options = [
          { id: 'opt_1', label: '標準オプション', type: 'paid', price: 5000, isDefault: true },
          { id: 'opt_2', label: '追加オプション', type: 'paid', price: 3000, isDefault: false }
        ];
      }
      
      setPricingData({ itemPoints, pricingRules, options });
    };
    
    loadPricingData();
  }, []);

  useEffect(() => {
    // 案件データを取得してサンプル荷物データを追加
    const unifiedData = generateUnifiedTestData();
    
    // 見積依頼ステータスの案件のみをフィルタリング
    const requestCases = unifiedData.filter(item => item.status === '見積依頼');
    
    console.log('Available request cases:', requestCases.map(c => ({ id: c.id, customer: c.customer?.customerName })));
    console.log('Requested ID:', params.id);
    
    // IDが存在しない場合は最初の見積依頼案件を使用
    let foundCase = unifiedData.find(item => item.id === params.id);
    
    if (!foundCase && requestCases.length > 0) {
      // IDが見つからない場合は最初の見積依頼案件を使用
      foundCase = requestCases[0];
      console.log('Using fallback case:', foundCase.id, foundCase.customer?.customerName);
    }
    
    if (!foundCase) {
      console.log('No case found, setting not found');
      setNotFound(true);
      return;
    }

    // 見積依頼ステータスでない場合はアクセス不可
    if (foundCase.status !== '見積依頼') {
      console.log('Case status is not 見積依頼:', foundCase.status);
      setNotFound(true);
      return;
    }

    console.log('Using case:', foundCase);

    const enhancedCase: EnhancedCase = {
      ...foundCase,
      propertyDetails: {
        fromFloor: 1,
        toFloor: 1,
        hasElevator: true,
        parkingAvailable: true,
        notes: '詳細は案件確認時に調整'
      }
    };

    setCaseItem(enhancedCase);
  }, [params.id]);

  // 自動見積算出
  useEffect(() => {
    if (!caseItem || !pricingData.itemPoints?.length || !pricingData.pricingRules?.length) return;
    
    const calculateAutoQuote = () => {
      // 1. 総ポイント計算
      const totalPoints = caseItem.items?.totalPoints || 0;
      
      console.log('=== 自動見積算出 ===');
      console.log('総ポイント:', totalPoints);
      console.log('料金ルール:', pricingData.pricingRules);
      
      // 2. 推奨トラック判定
      const applicableRule = pricingData.pricingRules.find(rule => 
        rule.maxPoint !== undefined && rule.price !== undefined &&
        totalPoints >= rule.minPoint && totalPoints <= rule.maxPoint
      );
      
      const recommendedTruck = applicableRule?.truckType || '判定不可';
      const basePrice = applicableRule?.price || 0;
      
      console.log('適用ルール:', applicableRule);
      console.log('推奨トラック:', recommendedTruck);
      console.log('基本料金:', basePrice);
      
      // 3. 距離料金の算出（簡易版）
      const estimatedDistance = estimateDistance(caseItem);
      const distancePrice = Math.floor(estimatedDistance * 100); // 1kmあたり100円として簡易計算
      
      console.log('推定距離:', estimatedDistance, 'km');
      console.log('距離料金:', distancePrice);
      
      // 4. オプション料金（基本的なオプション）
      const optionPrice = pricingData.options?.length > 0 ? pricingData.options[0].price || 5000 : 5000;
      
      console.log('オプション料金:', optionPrice);
      
      // 5. 最終価格（基本料金 + 距離料金 + オプション料金）
      const subtotal = basePrice + distancePrice + optionPrice;
      const finalPrice = Math.floor(subtotal * 1.1); // 消費税10%
      
      console.log('小計:', subtotal);
      console.log('最終価格（税込）:', finalPrice);
      
      setAutoQuote({
        totalPoints,
        recommendedTruck,
        basePrice,
        distancePrice,
        estimatedDistance,
        optionPrice,
        adjustmentAmount: 0,
        finalPrice
      });
    };
    
    calculateAutoQuote();
  }, [caseItem, pricingData]);

  /**
   * 見積回答の保存処理
   */
  const handleSubmit = async (formData: QuoteResponseFormData) => {
    if (!caseItem) return;

    setIsSubmitting(true);

    try {
      let quoteResponse: QuoteResponseData;
      let newStatus: string;
      let totalWithTax = 0;

      if (formData.responseType === 'quote') {
        // 見積可能時の処理
        const basicAmount = parseFloat(formData.basicAmount) || 0;
        const optionAmount = parseFloat(formData.optionAmount) || 0;
        totalWithTax = Math.floor((basicAmount + optionAmount) * 1.1); // 税込み
        newStatus = '見積済';

        quoteResponse = {
          responseType: 'quote',
          basicAmount: basicAmount,
          optionAmount: optionAmount,
          totalAmountWithTax: totalWithTax,
          validUntil: formData.validUntil,
          comment: formData.comment,
          notes: formData.notes || '',
          confirmationMemo: formData.confirmationMemo || '',
          respondedAt: new Date().toISOString(),
          respondedBy: 'admin'
        };
      } else {
        // 見積不可時の処理（ステータスは失注に）
        newStatus = '失注';
        
        quoteResponse = {
          responseType: 'unavailable',
          comment: formData.comment,
          notes: formData.notes || '',
          confirmationMemo: formData.confirmationMemo || '',
          respondedAt: new Date().toISOString(),
          respondedBy: 'admin'
        };
      }

      // 実際の実装ではAPI呼び出し
      console.log('見積回答データ:', quoteResponse);
      
      // ローカルストレージを使用したデモ実装
      const existingResponses = JSON.parse(localStorage.getItem('quoteResponses') || '[]');
      existingResponses.push(quoteResponse);
      localStorage.setItem('quoteResponses', JSON.stringify(existingResponses));

      // 案件のステータスを更新（ローカルストレージ）
      const allCases = generateUnifiedTestData();
      const updatedCases = allCases.map(item => 
        item.id === caseItem.id 
          ? {
              ...item,
              status: newStatus as any,
              responseDate: new Date().toISOString().split('T')[0],
              amountWithTax: totalWithTax || undefined,
              quoteResponse
            }
          : item
      );
      
      // デモ用の更新（実際の実装では案件データをAPIで更新）
      localStorage.setItem('updatedCases', JSON.stringify(updatedCases));

      // 成功メッセージとリダイレクト
      if (formData.responseType === 'quote') {
        alert(`${caseItem.customer?.customerName}様への見積回答が完了しました。\n金額: ¥${totalWithTax.toLocaleString()}`);
      } else {
        alert(`${caseItem.customer?.customerName}様への見積不可回答が完了しました。`);
      }
      
      // 案件管理に戻る
      router.push('/admin/cases');
      
    } catch (error) {
      console.error('見積回答エラー:', error);
      throw new Error('回答の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル処理
   */
  const handleCancel = () => {
    if (isSubmitting) return;
    
    const confirmCancel = confirm('入力内容が失われますが、よろしいですか？');
    if (confirmCancel) {
      router.push('/admin/cases');
    }
  };

  // ローディング状態
  if (!caseItem && !notFound) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">案件データを読み込み中...</p>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  // 案件が見つからない場合
  if (notFound) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50">
          <AdminPageHeader 
            title="案件が見つかりません"
            subtitle="指定された案件は存在しないか、見積回答の対象外です"
            breadcrumbs={[
              { label: '案件管理', href: '/admin/cases' },
              { label: '見積回答' }
            ]}
          />
          
          <main className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-6xl text-gray-400 mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">案件が見つかりません</h3>
              <p className="text-gray-600 mb-6">
                指定された案件は存在しないか、既に見積回答済みです。
              </p>
              <button
                onClick={() => router.push('/admin/cases')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                案件一覧に戻る
              </button>
            </div>
          </main>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title={`見積回答 - ${caseItem!.customer?.customerName}様`}
          subtitle="案件への見積回答または見積不可の回答を入力してください"
          breadcrumbs={[
            { label: '案件管理', href: '/admin/cases' },
            { label: '見積回答' }
          ]}
        />

        <main className="max-w-7xl mx-auto py-6 px-6">
          <div className="max-w-4xl mx-auto">
            {/* 見積回答フォーム */}
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <QuoteResponseForm
                  caseItem={caseItem!}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  autoQuote={autoQuote}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}