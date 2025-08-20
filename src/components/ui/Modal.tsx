/**
 * アクセシビリティ対応のモーダルコンポーネント
 * - フォーカストラップ
 * - エスケープキーでの閉じる
 * - スクリーンリーダー対応
 */
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Heading } from './Typography';
import { createFocusTrap, generateAccessibilityProps } from '@/utils/accessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  id?: string;
  role?: 'dialog' | 'alertdialog';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  id,
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cleanupFocusTrapRef = useRef<(() => void) | null>(null);

  // モーダルが開く前にフォーカスされていた要素を保存
  const savePreviousFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  // モーダルが閉じた後に以前のフォーカスを復元
  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  // エスケープキーでの閉じる処理
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // フォーカストラップの設定
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    savePreviousFocus();
    cleanupFocusTrapRef.current = createFocusTrap(modalRef.current);

    return () => {
      if (cleanupFocusTrapRef.current) {
        cleanupFocusTrapRef.current();
      }
      restorePreviousFocus();
    };
  }, [isOpen, savePreviousFocus, restorePreviousFocus]);

  // ボディのスクロール制御
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // オーバーレイクリックでの閉じる処理
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // サイズのスタイルクラス
  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-2xl';
    }
  };

  // アクセシビリティ属性の生成
  const accessibilityProps = generateAccessibilityProps({
    label: ariaLabel,
    labelledBy: ariaLabelledBy || (title ? `${id || 'modal'}-title` : undefined),
    describedBy: ariaDescribedBy,
    role
  });

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />

      {/* モーダルコンテンツ */}
      <div
        ref={modalRef}
        id={id}
        className={`
          relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden
          ${getSizeClasses(size)} w-full mx-4
          ${className}
        `}
        {...accessibilityProps}
      >
        {/* ヘッダー */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <Heading
                level={2}
                size="xl"
                id={`${id || 'modal'}-title`}
                className="text-gray-900"
              >
                {title}
              </Heading>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="モーダルを閉じる"
                className="ml-auto"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  // ポータルを使用してbody直下にレンダリング
  return createPortal(modalContent, document.body);
};

export { Modal };
export type { ModalProps };
export default Modal; 