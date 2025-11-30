/**
 * 紹介状況詳細スライドパネルコンポーネント（簡略版）
 */
'use client';

import React from 'react';
import { 
  ReferralCase, 
  ReferralStatus
} from '@/types/referral';
import { X } from 'lucide-react';

interface ReferralDetailPanelProps {
  referral: ReferralCase | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (referralId: string, status: ReferralStatus) => void;
  onContractUpdate?: (referralId: string, amount: number) => void;
  onCancel?: (referralId: string) => void;
}

const ReferralDetailPanel: React.FC<ReferralDetailPanelProps> = ({
  referral,
  isOpen,
  onClose
}) => {
  if (!referral || !isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              紹介詳細: {referral.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">顧客エリア</h3>
                <p className="text-sm text-gray-900">{referral.customer.area}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">引越し予定日</h3>
                <p className="text-sm text-gray-900">
                  {new Date(referral.customer.movingDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">紹介者</h3>
                <p className="text-sm text-gray-900">{referral.referrerName}</p>
              </div>
              
              {referral.contractAmount && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">紹介料</h3>
                  <p className="text-sm text-gray-900">¥{referral.contractAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetailPanel;