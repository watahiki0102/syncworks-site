/**
 * StatusBadge.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
import { UnifiedCase } from '@/app/admin/cases/types/unified';

// テスト用のモックデータ
const mockCaseItem: UnifiedCase = {
  id: 'test-1',
  customerName: 'テスト顧客',
  sourceType: 'syncmoving',
  moveDate: '2024-01-01',
  status: '成約',
  type: 'history',
  amountWithTax: 100000,
  summary: {
    fromAddress: 'テスト住所1',
    toAddress: 'テスト住所2',
    items: ['テストアイテム'],
    totalPoints: 100
  }
};

describe('StatusBadge', () => {
  describe('シンプルなStatusBadge（フィルタリング用）', () => {
    it('labelが正しく表示される', () => {
      render(
        <StatusBadge 
          status="pending" 
          bgColor="bg-orange-100" 
          textColor="text-orange-800" 
          label="見積依頼" 
        />
      );
      
      expect(screen.getByText('見積依頼')).toBeInTheDocument();
    });

    it('基本クラスが適用される', () => {
      render(
        <StatusBadge 
          status="pending" 
          bgColor="bg-orange-100" 
          textColor="text-orange-800" 
          label="見積依頼" 
        />
      );
      
      const badge = screen.getByText('見積依頼');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('justify-center');
      expect(badge).toHaveClass('min-w-20');
      expect(badge).toHaveClass('rounded-full');
    });

    it('bgColorとtextColorが適用される', () => {
      render(
        <StatusBadge 
          status="pending" 
          bgColor="bg-orange-100" 
          textColor="text-orange-800" 
          label="見積依頼" 
        />
      );
      
      const badge = screen.getByText('見積依頼');
      expect(badge).toHaveClass('bg-orange-100');
      expect(badge).toHaveClass('text-orange-800');
    });
  });

  describe('ケースアイテム用のStatusBadge', () => {
    it('ケースアイテムのステータスが正しく表示される', () => {
      render(<StatusBadge caseItem={mockCaseItem} />);
      
      expect(screen.getByText('成約')).toBeInTheDocument();
    });

    it('showDropdown=falseの場合、通常のバッジが表示される', () => {
      render(<StatusBadge caseItem={mockCaseItem} showDropdown={false} />);
      
      const badge = screen.getByText('成約');
      expect(badge.tagName).toBe('SPAN');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });

    it('showDropdown=trueかつ編集可能な場合、ボタンが表示される', () => {
      const editableCaseItem = { ...mockCaseItem, type: 'request' as const };
      render(<StatusBadge caseItem={editableCaseItem} showDropdown={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('hover:opacity-80');
    });

    it('SyncMovingの履歴データは編集不可', () => {
      const syncMovingHistoryItem = { 
        ...mockCaseItem, 
        type: 'history' as const, 
        sourceType: 'syncmoving' as const 
      };
      render(<StatusBadge caseItem={syncMovingHistoryItem} showDropdown={true} />);
      
      const badge = screen.getByText('成約');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('エラーハンドリング', () => {
    it('caseItemがundefinedの場合、フォールバックが表示される', () => {
      render(<StatusBadge caseItem={undefined as any} />);
      
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('caseItem.statusがundefinedの場合、フォールバックが表示される', () => {
      const invalidCaseItem = { ...mockCaseItem, status: undefined as any };
      render(<StatusBadge caseItem={invalidCaseItem} />);
      
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('ステータススタイルが見つからない場合、ステータス名が表示される', () => {
      const unknownStatusItem = { ...mockCaseItem, status: '不明なステータス' as any };
      render(<StatusBadge caseItem={unknownStatusItem} />);
      
      expect(screen.getByText('不明なステータス')).toBeInTheDocument();
    });
  });

  describe('variant使用時', () => {
    it('variantが指定された場合のスタイルが適用される', () => {
      render(<StatusBadge variant="success">成功</StatusBadge>);
      
      const badge = screen.getByText('成功');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });

    it('children要素が表示される', () => {
      render(<StatusBadge variant="info">情報バッジ</StatusBadge>);
      
      expect(screen.getByText('情報バッジ')).toBeInTheDocument();
    });
  });
});