/**
 * 紹介状況リスト画面のメインコンポーネント
 * 不動産側からの紹介案件を1画面で俯瞰できる一覧を表示する
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataTable, TableColumn, TableSort } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Typography';
import { StatusBadge, StatusVariant } from '@/components/ui/StatusBadge';
import ReferralDetailPanel from './ReferralDetailPanel';
import { 
  ReferralCase, 
  ReferralStatus, 
  ReferrerType, 
  ReferralFilter,
  ReferralSort,
  ReferralSearchParams
} from '@/types/referral';
import { 
  Building2,
  User
} from 'lucide-react';

interface ReferralListProps {
  initialData?: ReferralCase[];
}

const ReferralList: React.FC<ReferralListProps> = ({
  initialData = []
}) => {
  const [referrals, setReferrals] = useState<ReferralCase[]>(initialData);
  const [selectedReferral, setSelectedReferral] = useState<ReferralCase | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReferralFilter>({});
  const [sort, setSort] = useState<ReferralSort>({ key: 'updatedAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // サンプルデータ（実際の実装ではAPIから取得）
  useEffect(() => {
    if (initialData.length === 0) {
      setReferrals(generateSampleData());
    }
  }, [initialData]);

  // サンプルデータ生成（固定データ）
  const generateSampleData = (): ReferralCase[] => {
    return [
      {
        id: 'REF-0001',
        applicationDate: '2025-01-15T09:30:00.000Z',
        customer: {
          anonymousId: 'CUST-0001',
          area: '東京都',
          movingDate: '2025-02-15T00:00:00.000Z'
        },
        referrerName: '山田太郎',
        referrerType: 'individual',
        preferredDate: '2025-02-20T00:00:00.000Z',
        status: 'in_progress',
        contractAmount: 7500,
        updatedAt: '2025-01-28T14:20:00.000Z',
        referrerId: 'REF-USER-0001'
      },
      {
        id: 'REF-0002',
        applicationDate: '2024-12-20T11:15:00.000Z',
        customer: {
          anonymousId: 'CUST-0002',
          area: '神奈川県',
          movingDate: '2025-01-10T00:00:00.000Z'
        },
        referrerName: '田中佳子',
        referrerType: 'individual',
        preferredDate: '2025-01-12T00:00:00.000Z',
        status: 'completed',
        contractAmount: 4200,
        updatedAt: '2025-01-15T16:45:00.000Z',
        referrerId: 'REF-USER-0002'
      },
      {
        id: 'REF-0003',
        applicationDate: '2025-01-25T14:30:00.000Z',
        customer: {
          anonymousId: 'CUST-0003',
          area: '埼玉県',
          movingDate: '2025-02-25T00:00:00.000Z'
        },
        referrerName: '佐藤大輔',
        referrerType: 'individual',
        preferredDate: '2025-02-28T00:00:00.000Z',
        status: 'pending',
        contractAmount: undefined,
        updatedAt: '2025-01-31T10:00:00.000Z',
        referrerId: 'REF-USER-0003'
      }
    ];
  };

  // フィルタリングとソート
  const filteredAndSortedReferrals = useMemo(() => {
    let filtered = referrals.filter(referral => {
      // 検索クエリによるフィルタリング
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          referral.id.toLowerCase().includes(query) ||
          referral.referrerName.toLowerCase().includes(query) ||
          referral.customer.area.toLowerCase().includes(query) ||
          referral.customer.anonymousId.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // ステータスフィルター
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(referral.status)) return false;
      }

      // 紹介者種別フィルター
      if (filters.referrerType && filters.referrerType.length > 0) {
        if (!filters.referrerType.includes(referral.referrerType)) return false;
      }

      // 日付範囲フィルター
      if (filters.dateRange) {
        const applicationDate = new Date(referral.applicationDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (applicationDate < startDate || applicationDate > endDate) return false;
      }

      // 紹介者名フィルター
      if (filters.referrerName) {
        if (!referral.referrerName.toLowerCase().includes(filters.referrerName.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // ソート
    filtered.sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sort.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sort.direction === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [referrals, searchQuery, filters, sort]);

  // ページネーション
  const paginatedReferrals = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedReferrals.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedReferrals, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedReferrals.length / pageSize);

  // テーブルカラム定義
  const columns = [
    {
      key: 'id',
      label: '紹介ID',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <span className="font-mono text-sm text-blue-600">{value}</span>
      )
    },
    {
      key: 'applicationDate',
      label: '申込日',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </span>
      )
    },
    {
      key: 'customer',
      label: '顧客（匿名）',
      sortable: false,
      width: '150px',
      render: (value: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value.anonymousId}</div>
          <div className="text-gray-500">{value.area}</div>
        </div>
      )
    },
    {
      key: 'referrerName',
      label: '紹介者名',
      sortable: true,
      width: '120px',
      render: (value: string, item: any) => (
        <div className="flex items-center text-sm">
          {item.referrerType === 'company' ? (
            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
          ) : (
            <User className="w-4 h-4 text-gray-400 mr-2" />
          )}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'referrerType',
      label: '紹介者種別',
      sortable: true,
      width: '100px',
      render: (value: ReferrerType) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'company' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'company' ? '会社' : '個人'}
        </span>
      )
    },
    {
      key: 'preferredDate',
      label: '希望日',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </span>
      )
    },
    {
      key: 'status',
      label: 'ステータス',
      sortable: true,
      width: '100px',
      render: (value: ReferralStatus) => {
        const statusConfig = {
          pending: { variant: 'warning', text: '待機中' },
          in_progress: { variant: 'info', text: '進行中' },
          completed: { variant: 'success', text: '完了' },
          cancelled: { variant: 'error', text: 'キャンセル' },
          expired: { variant: 'neutral', text: '期限切れ' }
        };
        
        const config = statusConfig[value];
        return <StatusBadge variant={config.variant as StatusVariant}>{config.text}</StatusBadge>;
      }
    },
    {
      key: 'contractAmount',
      label: '紹介料',
      sortable: true,
      width: '120px',
      render: (value: number | undefined) => (
        <span className="text-sm">
          {value ? `¥${value.toLocaleString()}` : '-'}
        </span>
      )
    },
    {
      key: 'updatedAt',
      label: '最終更新',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </span>
      )
    }
  ];

  // イベントハンドラー
  const handleRowClick = (item: any, index: number) => {
    setSelectedReferral(item as ReferralCase);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedReferral(null);
  };

  const handleStatusUpdate = async (referralId: string, status: ReferralStatus) => {
    setLoading(true);
    try {
      // 実際の実装ではAPI呼び出し
      setReferrals(prev => 
        prev.map(ref => 
          ref.id === referralId ? { ...ref, status, updatedAt: new Date().toISOString() } : ref
        )
      );
      
      // 詳細パネルも更新
      if (selectedReferral && selectedReferral.id === referralId) {
        setSelectedReferral(prev => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContractUpdate = async (referralId: string, amount: number) => {
    setLoading(true);
    try {
      // 実際の実装ではAPI呼び出し
      setReferrals(prev => 
        prev.map(ref => 
          ref.id === referralId ? { ...ref, contractAmount: amount, updatedAt: new Date().toISOString() } : ref
        )
      );
      
      // 詳細パネルも更新
      if (selectedReferral && selectedReferral.id === referralId) {
        setSelectedReferral(prev => prev ? { ...prev, contractAmount: amount, updatedAt: new Date().toISOString() } : null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (referralId: string) => {
    setLoading(true);
    try {
      // 実際の実装ではAPI呼び出し
      setReferrals(prev => 
        prev.map(ref => 
          ref.id === referralId ? { ...ref, status: 'cancelled', updatedAt: new Date().toISOString() } : ref
        )
      );
      
      // 詳細パネルも更新
      if (selectedReferral && selectedReferral.id === referralId) {
        setSelectedReferral(prev => prev ? { ...prev, status: 'cancelled', updatedAt: new Date().toISOString() } : null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: TableSort) => {
    setSort({
      key: newSort.key as keyof ReferralCase,
      direction: newSort.direction
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  return (
    <div className="space-y-6">

      {/* 検索・フィルター */}
      <Card className="p-4">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="紹介ID・紹介者名・エリアで検索"
          showSearchIcon={true}
        />
      </Card>


      {/* データテーブル */}
      <Card>
        <DataTable
          data={paginatedReferrals}
          columns={columns}
          loading={loading}
          sort={sort}
          onSortChange={handleSortChange}
          onRowClick={handleRowClick}
          hoverable
          striped
          bordered
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalItems: filteredAndSortedReferrals.length,
            onPageChange: handlePageChange
          }}
          emptyMessage="紹介案件がありません"
        />
      </Card>

      {/* 詳細スライドパネル */}
      <ReferralDetailPanel
        referral={selectedReferral}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
        onStatusUpdate={handleStatusUpdate}
        onContractUpdate={handleContractUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ReferralList;
