'use client';

import { useState } from 'react';

interface EstimatePDFButtonProps {
  caseId?: string;
  draftPayload?: any;
  disabled?: boolean;
}

export default function EstimatePDFButton({ caseId, draftPayload, disabled = false }: EstimatePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (disabled) return;
    
    setIsGenerating(true);
    try {
      let targetId = caseId;
      
      // 新規作成前のドラフトの場合は一時保存
      if (!caseId && draftPayload) {
        // 一時保存APIを呼び出し（実装は後で）
        const response = await fetch('/api/cases/temp-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftPayload)
        });
        
        if (response.ok) {
          const result = await response.json();
          targetId = result.id;
        } else {
          throw new Error('一時保存に失敗しました');
        }
      }
      
      if (targetId) {
        // PDFを新規タブで表示
        window.open(`/api/estimates/${targetId}/pdf`, '_blank');
      }
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePDF}
      disabled={disabled || isGenerating}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
      }`}
    >
      {isGenerating ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PDF生成中...
        </span>
      ) : (
        <span className="flex items-center">
          📄 見積もりPDF表示
        </span>
      )}
    </button>
  );
}
