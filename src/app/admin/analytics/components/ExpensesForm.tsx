'use client';

import React, { useState, useEffect } from 'react';
import { ExternalExpense, SourceTypeCode } from '@/types/analytics';
import { formatCurrencyJPY } from '@/utils/format';

interface ExpensesFormProps {
  onExpenseCreated: () => void;
}

export default function ExpensesForm({ onExpenseCreated }: ExpensesFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    amountInclTax: '',
    memo: '',
    source: 'syncmoving' as SourceTypeCode
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<ExternalExpense[]>([]);

  // 初期化時に最新の経費を取得
  useEffect(() => {
    fetchRecentExpenses();
  }, []);

  // 最新3件の経費を取得（仮の実装）
  const fetchRecentExpenses = async () => {
    try {
      // 実際のAPI呼び出しに置き換え
      const mockExpenses: ExternalExpense[] = [
        {
          id: '1',
          date: '2025-01-15',
          amountInclTax: 15000,
          memo: 'ガソリン代',
          source: '他社サービス'
        },
        {
          id: '2',
          date: '2025-01-10',
          amountInclTax: 8000,
          memo: '駐車場代',
          source: '手動'
        },
        {
          id: '3',
          date: '2025-01-05',
          amountInclTax: 12000,
          memo: '高速道路料金',
          source: '他社サービス'
        }
      ];
      setRecentExpenses(mockExpenses);
    } catch (error) {
      console.error('経費取得エラー:', error);
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = '日付は必須です';
    }

    if (!formData.amountInclTax || parseFloat(formData.amountInclTax) <= 0) {
      newErrors.amountInclTax = '金額は0より大きい値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 実際のAPI呼び出しに置き換え
      const newExpense: Omit<ExternalExpense, 'id'> = {
        date: formData.date,
        amountInclTax: parseFloat(formData.amountInclTax),
        memo: formData.memo || undefined,
        source: formData.source
      };

      // createExternalExpense(newExpense) を呼び出す

      // 成功後の処理
      setFormData({
        date: '',
        amountInclTax: '',
        memo: '',
        source: 'syncmoving'
      });
      
      // 最新経費を再取得
      await fetchRecentExpenses();
      
      // 親コンポーネントに通知
      onExpenseCreated();
      
    } catch (error) {
      console.error('経費作成エラー:', error);
      setErrors({ submit: '経費の作成に失敗しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">💰 経費入力</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              金額（税込） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.amountInclTax}
              onChange={(e) => handleInputChange('amountInclTax', e.target.value)}
              placeholder="例：15000"
              className={`w-full border rounded-md px-3 py-2 text-sm ${
                errors.amountInclTax ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amountInclTax && (
              <p className="text-red-500 text-xs mt-1">{errors.amountInclTax}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="例：ガソリン代、駐車場代など"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* 依頼元 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              依頼元
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="syncmoving">syncmoving</option>
              <option value="他社サービス">他社サービス</option>
              <option value="手動">手動</option>
            </select>
          </div>
        </div>

        {/* 送信エラー */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>

      {/* 最新3件の経費一覧 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">最新の経費</h4>
        {recentExpenses.length > 0 ? (
          <div className="space-y-2">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{expense.date}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{expense.source}</span>
                    {expense.memo && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700">{expense.memo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrencyJPY(expense.amountInclTax)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">経費データがありません</p>
        )}
      </div>
    </div>
  );
}
