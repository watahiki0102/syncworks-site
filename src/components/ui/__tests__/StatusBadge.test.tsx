/**
 * StatusBadge.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen } from '@testing-library/react';
import { StatusBadge, StatusBadges } from '../StatusBadge';

describe('StatusBadge', () => {
  it('子要素を正しく表示する', () => {
    render(<StatusBadge>Test Status</StatusBadge>);
    
    expect(screen.getByText('Test Status')).toBeInTheDocument();
  });

  it('基本クラスが適用される', () => {
    render(<StatusBadge>Status</StatusBadge>);
    
    const badge = screen.getByText('Status');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('font-medium');
    expect(badge).toHaveClass('rounded-full');
  });

  describe('バリアント', () => {
    it('デフォルト（neutral）バリアントが適用される', () => {
      render(<StatusBadge>Neutral</StatusBadge>);
      
      const badge = screen.getByText('Neutral');
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-800');
    });

    it('successバリアントが適用される', () => {
      render(<StatusBadge variant="success">Success</StatusBadge>);
      
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });

    it('warningバリアントが適用される', () => {
      render(<StatusBadge variant="warning">Warning</StatusBadge>);
      
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });

    it('errorバリアントが適用される', () => {
      render(<StatusBadge variant="error">Error</StatusBadge>);
      
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });

    it('infoバリアントが適用される', () => {
      render(<StatusBadge variant="info">Info</StatusBadge>);
      
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-800');
    });

    it('neutralバリアントが適用される', () => {
      render(<StatusBadge variant="neutral">Neutral</StatusBadge>);
      
      const badge = screen.getByText('Neutral');
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-800');
    });

    it('pendingバリアントが適用される', () => {
      render(<StatusBadge variant="pending">Pending</StatusBadge>);
      
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-orange-100');
      expect(badge).toHaveClass('text-orange-800');
    });
  });

  describe('サイズ', () => {
    it('デフォルト（md）サイズが適用される', () => {
      render(<StatusBadge>Medium</StatusBadge>);
      
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-sm');
    });

    it('smallサイズが適用される', () => {
      render(<StatusBadge size="sm">Small</StatusBadge>);
      
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-xs');
    });

    it('mediumサイズが適用される', () => {
      render(<StatusBadge size="md">Medium</StatusBadge>);
      
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-sm');
    });

    it('largeサイズが適用される', () => {
      render(<StatusBadge size="lg">Large</StatusBadge>);
      
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('py-1');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('アニメーション', () => {
    it('animatedがfalse（デフォルト）の場合、アニメーションなし', () => {
      render(<StatusBadge>No Animation</StatusBadge>);
      
      const badge = screen.getByText('No Animation');
      expect(badge).not.toHaveClass('animate-pulse');
    });

    it('animatedがtrueの場合、パルスアニメーション', () => {
      render(<StatusBadge animated>Animated</StatusBadge>);
      
      const badge = screen.getByText('Animated');
      expect(badge).toHaveClass('animate-pulse');
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      render(<StatusBadge className="custom-class">Custom</StatusBadge>);
      
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex'); // 基本クラスも保持
    });

    it('複数のカスタムクラスが適用される', () => {
      render(<StatusBadge className="custom1 custom2">Multiple</StatusBadge>);
      
      const badge = screen.getByText('Multiple');
      expect(badge).toHaveClass('custom1');
      expect(badge).toHaveClass('custom2');
    });
  });

  describe('複合設定', () => {
    it('すべてのプロパティが同時に適用される', () => {
      render(
        <StatusBadge
          variant="success"
          size="lg"
          animated
          className="custom-class"
        >
          Complex Badge
        </StatusBadge>
      );
      
      const badge = screen.getByText('Complex Badge');
      
      // バリアント
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
      // サイズ
      expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
      // アニメーション
      expect(badge).toHaveClass('animate-pulse');
      // カスタムクラス
      expect(badge).toHaveClass('custom-class');
      // 基本クラス
      expect(badge).toHaveClass('inline-flex', 'items-center', 'font-medium', 'rounded-full');
    });
  });

  describe('React.ReactNode対応', () => {
    it('文字列以外のReactNodeも表示される', () => {
      render(
        <StatusBadge>
          <span>📧</span> With Icon
        </StatusBadge>
      );
      
      expect(screen.getByText('📧')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('複雑なReactNodeも表示される', () => {
      render(
        <StatusBadge>
          <div>
            <strong>Bold</strong> and <em>italic</em>
          </div>
        </StatusBadge>
      );
      
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });
  });
});

describe('StatusBadges - 事前定義バッジ', () => {
  it('Contractedバッジが正しく表示される', () => {
    render(<StatusBadges.Contracted />);
    
    const badge = screen.getByText('成約');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800'); // success variant
  });

  it('Unansweredバッジが正しく表示される', () => {
    render(<StatusBadges.Unanswered />);
    
    const badge = screen.getByText('未回答');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800'); // error variant
  });

  it('Answeredバッジが正しく表示される', () => {
    render(<StatusBadges.Answered />);
    
    const badge = screen.getByText('回答済');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800'); // success variant
  });

  it('Estimatingバッジが正しく表示される', () => {
    render(<StatusBadges.Estimating />);
    
    const badge = screen.getByText('見積中');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800'); // warning variant
  });

  it('Completedバッジが正しく表示される', () => {
    render(<StatusBadges.Completed />);
    
    const badge = screen.getByText('完了');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800'); // info variant
  });

  it('Cancelledバッジが正しく表示される', () => {
    render(<StatusBadges.Cancelled />);
    
    const badge = screen.getByText('キャンセル');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800'); // neutral variant
  });

  it('Lostバッジが正しく表示される', () => {
    render(<StatusBadges.Lost />);
    
    const badge = screen.getByText('失注');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800'); // error variant
  });

  it('Newバッジが正しく表示される', () => {
    render(<StatusBadges.New />);
    
    const badge = screen.getByText('NEW');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800'); // error variant
    expect(badge).toHaveClass('animate-pulse'); // animated
  });

  describe('事前定義バッジのプロパティ継承', () => {
    it('カスタムクラスが適用される', () => {
      render(<StatusBadges.Contracted className="custom-contracted" />);
      
      const badge = screen.getByText('成約');
      expect(badge).toHaveClass('custom-contracted');
    });

    it('サイズが適用される', () => {
      render(<StatusBadges.Estimating size="lg" />);
      
      const badge = screen.getByText('見積中');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
    });

    it('アニメーション設定が上書きされる', () => {
      render(<StatusBadges.Completed animated />);
      
      const badge = screen.getByText('完了');
      expect(badge).toHaveClass('animate-pulse');
    });

    it('複数のプロパティが同時に適用される', () => {
      render(
        <StatusBadges.Answered 
          size="sm" 
          className="custom-answered"
          animated
        />
      );
      
      const badge = screen.getByText('回答済');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs'); // size sm
      expect(badge).toHaveClass('custom-answered'); // custom class
      expect(badge).toHaveClass('animate-pulse'); // animated
      expect(badge).toHaveClass('bg-green-100', 'text-green-800'); // success variant
    });
  });

  describe('事前定義バッジの型安全性', () => {
    it('variantとchildrenが事前定義バッジで除外されている', () => {
      // TypeScriptの型チェックにより、以下はコンパイルエラーになるべき
      // <StatusBadges.Contracted variant="warning">Custom Text</StatusBadges.Contracted>
      
      // ただし、JavaScriptテストでは実行時の動作を確認
      render(<StatusBadges.Contracted />);
      
      const badge = screen.getByText('成約');
      expect(badge).toBeInTheDocument();
      // variantはsuccessで固定されている
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });
});