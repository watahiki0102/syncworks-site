import { ContractStatus, SourceType } from '../types/case';

export const STATUS_META: Record<ContractStatus, { label: string; colorClass: string }> = {
  confirmed: {
    label: '確定',
    colorClass: 'bg-green-100 text-green-800 border-green-200'
  },
  estimate: {
    label: '見積もり',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
};

export const SOURCE_META: Record<SourceType, { label: string; badgeClass: string }> = {
  sync: {
    label: 'SYNC',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  suumo: {
    label: 'SUUMO',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  other_agency: {
    label: '他社代理',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  manual: {
    label: '手動入力',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200'
  }
};
