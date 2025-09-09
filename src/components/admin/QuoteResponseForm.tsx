/**
 * 見積回答フォームコンポーネント
 * - 見積金額と詳細の入力
 * - バリデーション機能
 * - 税額自動計算
 */
'use client';

import { useState } from 'react';
import { QuoteResponseFormData, QuoteResponseFormErrors } from '@/app/admin/cases/types/unified';
import { UnifiedCase } from '@/types/common';
import { getSourceTypeLabel } from '@/app/admin/cases/lib/normalize';
import { formatCurrency } from '@/utils/format';
import { AutoQuoteResult } from '@/types/pricing';

interface QuoteResponseFormProps {
  caseItem: UnifiedCase;
  onSubmit: (formData: QuoteResponseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  autoQuote?: AutoQuoteResult;
}

const TAX_RATE = 0.1; // 10%


export default function QuoteResponseForm({
  caseItem,
  onSubmit,
  onCancel,
  isSubmitting = false,
  autoQuote
}: QuoteResponseFormProps) {
  const [formData, setFormData] = useState<QuoteResponseFormData>({
    responseType: 'quote',
    basicAmount: '',
    optionAmount: '',
    validUntil: '',
    comment: '',
    notes: '',
    adjustmentReason: ''
  });

  const [errors, setErrors] = useState<QuoteResponseFormErrors>({});

  // 税込総額の計算
  const calculateTotalWithTax = () => {
    if (formData.responseType !== 'quote') return 0;
    const basic = parseFloat(formData.basicAmount) || 0;
    const option = parseFloat(formData.optionAmount) || 0;
    const subtotal = basic + option;
    return Math.floor(subtotal * (1 + TAX_RATE));
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: QuoteResponseFormErrors = {};

    if (formData.responseType === 'quote') {
      // 見積可能時のバリデーション
      if (!formData.basicAmount.trim()) {
        newErrors.basicAmount = '基本料金は必須です';
      } else if (isNaN(parseFloat(formData.basicAmount)) || parseFloat(formData.basicAmount) <= 0) {
        newErrors.basicAmount = '正の数値を入力してください';
      }

      // オプション料金のバリデーション（任意だが、入力時は数値チェック）
      if (formData.optionAmount.trim() && (isNaN(parseFloat(formData.optionAmount)) || parseFloat(formData.optionAmount) < 0)) {
        newErrors.optionAmount = '0以上の数値を入力してください';
      }


      // 有効期限は自動設定なのでバリデーション不要
    }

    // コメントのバリデーション（見積可能・不可共通）
    if (!formData.comment.trim()) {
      newErrors.comment = '回答コメントは必須です';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = '10文字以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('見積回答エラー:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '見積回答の保存に失敗しました。もう一度お試しください。';
      setErrors({ submit: errorMessage });
    }
  };

  // 入力変更処理
  const handleInputChange = (field: keyof QuoteResponseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 算出価格を適用する機能
  const applyCalculatedQuote = () => {
    if (!autoQuote) return;
    
    setFormData(prev => ({
      ...prev,
      basicAmount: autoQuote.basePrice.toString(),
      optionAmount: (autoQuote.optionPrice + autoQuote.distancePrice).toString(),
      responseType: 'quote'
    }));
    
    // エラーをクリア
    setErrors({});
  };

  // デフォルトの有効期限（7日後）を設定
  const getDefaultValidUntil = () => {
    const date = new Date(caseItem.requestDate || caseItem.move?.moveDate || new Date()); // 依頼日または引越日を基準に
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  // 初回レンダリング時にデフォルト値を設定（見積可能時のみ）
  if (!formData.validUntil && formData.responseType === 'quote') {
    setFormData(prev => ({ ...prev, validUntil: getDefaultValidUntil() }));
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: 案件・算出情報（統合） */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">案件・算出情報</h3>
          
          <div className="space-y-6">
            {/* 案件情報 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">案件情報</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">顧客名</span>
                  <span className="font-medium">{caseItem.customer.customerName}</span>
                </div>
                {caseItem.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">電話番号</span>
                    <span className="font-medium">{caseItem.customer.phone}</span>
                  </div>
                )}
                {caseItem.customer.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">メール</span>
                    <span className="font-medium">{caseItem.customer.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">引越し日</span>
                  <span className="font-medium">
                    {new Date(caseItem.move.moveDate).toLocaleDateString('ja-JP')}
                    {caseItem.move.moveTime && ` ${caseItem.move.moveTime}`}
                  </span>
                </div>
                {caseItem.move.moveType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">引越しタイプ</span>
                    <span className="font-medium">{caseItem.move.moveType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">仲介元</span>
                  <span className="font-medium">{getSourceTypeLabel(caseItem.sourceType as any)}</span>
                </div>
                {caseItem.priority && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">優先度</span>
                    <span className="font-medium">
                      {caseItem.priority === 'high' ? '高' : 
                       caseItem.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                )}
                {caseItem.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">回答期限</span>
                    <span className="font-medium text-red-600">
                      {new Date(caseItem.deadline).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 住所・荷物情報 */}
            {caseItem.move && caseItem.items && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">住所・荷物</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">引越し元</span>
                    <span className="font-medium text-right max-w-xs">{caseItem.move.fromAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">引越し先</span>
                    <span className="font-medium text-right max-w-xs">{caseItem.move.toAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">荷物一覧</span>
                    <div className="mt-1 space-y-1">
                      {caseItem.items.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          • {item.name} (数量: {item.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ポイント</span>
                    <span className="font-medium">{caseItem.items.totalPoints}pt</span>
                  </div>
                </div>
              </div>
            )}

            {/* 算出詳細 */}
            {autoQuote && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">算出詳細</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">推奨トラック</span>
                    <span className="font-medium">{autoQuote.recommendedTruck}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">基準価格</span>
                    <span className="font-medium">{formatCurrency(autoQuote.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">距離料金</span>
                    <span className="font-medium">{formatCurrency(autoQuote.distancePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">オプション料金</span>
                    <span className="font-medium">{formatCurrency(autoQuote.optionPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">算出総額</span>
                    <span className="font-bold text-blue-600">{formatCurrency(autoQuote.finalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側: 見積入力フォーム */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">見積回答入力</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 回答タイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                回答タイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('responseType', 'quote')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.responseType === 'quote'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">見積可能</div>
                  <div className="text-xs text-gray-500 mt-1">金額を提示</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('responseType', 'unavailable')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.responseType === 'unavailable'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">見積不可</div>
                  <div className="text-xs text-gray-500 mt-1">対応不可</div>
                </button>
              </div>
              {errors.responseType && <p className="mt-2 text-sm text-red-600">{errors.responseType}</p>}
            </div>
            {/* 見積金額セクション - 見積可能時のみ表示 */}
            {formData.responseType === 'quote' && (
              <>
                {/* 算出価格適用ボタン */}
                {autoQuote && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">算出価格を適用</h4>
                    <button
                      type="button"
                      onClick={applyCalculatedQuote}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      算出価格を適用
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      参考: {formatCurrency(autoQuote.finalPrice)}
                    </p>
                  </div>
                )}


                {/* 料金入力 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      基本料金 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">¥</span>
                      <input
                        type="number"
                        value={formData.basicAmount}
                        onChange={(e) => handleInputChange('basicAmount', e.target.value)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.basicAmount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="30000"
                        min="0"
                        step="1000"
                      />
                    </div>
                    {errors.basicAmount && <p className="mt-1 text-sm text-red-600">{errors.basicAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      オプション料金
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">¥</span>
                      <input
                        type="number"
                        value={formData.optionAmount}
                        onChange={(e) => handleInputChange('optionAmount', e.target.value)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.optionAmount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="5000"
                        min="0"
                        step="1000"
                      />
                    </div>
                    {errors.optionAmount && <p className="mt-1 text-sm text-red-600">{errors.optionAmount}</p>}
                  </div>
                </div>

                {/* 税込総額（自動計算） */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">税込総額</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(calculateTotalWithTax())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">消費税10%込み</p>
                </div>
              </>
            )}

            {/* コメント・特記事項 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  回答コメント <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.comment ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="お見積りの詳細や注意事項をご記入ください（10文字以上）"
                />
                <div className="flex justify-between mt-1">
                  {errors.comment && <p className="text-sm text-red-600">{errors.comment}</p>}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.comment.length}/200文字
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特記事項
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="その他の特記事項があればご記入ください"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '送信中...' : (formData.responseType === 'quote' ? '見積回答を送信' : '見積不可として送信')}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}