import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  // モーダルが開いている時に背景のスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY;
      
      // bodyにoverflow: hiddenを適用してスクロールを無効化
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // クリーンアップ関数でスクロールを復元
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg border border-gray-300 p-0 w-full max-w-2xl mx-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* フッター */}
        {footer && (
          <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;