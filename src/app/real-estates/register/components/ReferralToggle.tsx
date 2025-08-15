/**
 * 登録モード切替コンポーネント
 * - 自社登録と紹介登録の切り替え
 * - タブ形式のUI
 */
import React from 'react';
import { Building2, Users } from 'lucide-react';
import { RegisterMode } from '@/types/realEstate';

interface ReferralToggleProps {
  mode: RegisterMode;
  onModeChange: (mode: RegisterMode) => void;
}

export function ReferralToggle({ mode, onModeChange }: ReferralToggleProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <div className="flex">
        <button
          type="button"
          onClick={() => onModeChange('self')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
            mode === 'self'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          自社を登録する
        </button>
        
        <button
          type="button"
          onClick={() => onModeChange('referral')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
            mode === 'referral'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          不動産会社を紹介する
        </button>
      </div>
    </div>
  );
}
