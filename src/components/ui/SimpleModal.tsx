/**
 * シンプルなモーダルコンポーネント
 * 既存のModalコンポーネントをより簡単に使えるようにしたラッパー
 */
import React from 'react';
import { Modal, ModalProps } from './Modal';

interface SimpleModalProps extends Omit<ModalProps, 'children'> {
  /** モーダルの内容 */
  children: React.ReactNode;
  /** フッターのボタン群（オプション） */
  footer?: React.ReactNode;
  /** フッターを表示するかどうか */
  showFooter?: boolean;
}

/**
 * シンプルなモーダルコンポーネント
 * 基本的なモーダル機能を簡単に利用できるラッパー
 */
export const SimpleModal: React.FC<SimpleModalProps> = ({
  children,
  footer,
  showFooter = true,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps}>
      {/* メインコンテンツ */}
      <div className="p-6">
        {children}
      </div>
      
      {/* フッター */}
      {showFooter && footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          {footer}
        </div>
      )}
    </Modal>
  );
};

/**
 * 確認ダイアログモーダル
 * はい/いいえの確認を求める際に使用
 */
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-700">{message}</p>
    </SimpleModal>
  );
};

/**
 * アラートモーダル
 * 情報表示のみのモーダル
 */
export const AlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '閉じる',
  variant = 'info'
}) => {
  const getIconAndColor = () => {
    switch (variant) {
      case 'success':
        return { icon: '✅', bgColor: 'bg-green-50', textColor: 'text-green-700' };
      case 'warning':
        return { icon: '⚠️', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
      case 'error':
        return { icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-700' };
      default:
        return { icon: 'ℹ️', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColor();

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {buttonText}
        </button>
      }
    >
      <div className={`flex items-start gap-4 p-4 rounded-lg ${bgColor}`}>
        <div className="text-2xl">{icon}</div>
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
    </SimpleModal>
  );
};

/**
 * フォームモーダル
 * フォーム送信用のモーダル
 */
export const FormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
}> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = '保存',
  cancelText = 'キャンセル',
  isSubmitting = false,
  isValid = true
}) => {
  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? '処理中...' : submitText}
          </button>
        </>
      }
    >
      {children}
    </SimpleModal>
  );
};

export default SimpleModal;