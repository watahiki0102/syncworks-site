/**
 * AdminBadge コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminBadge from '../AdminBadge';

describe('AdminBadge', () => {
  it('基本的なバッジがレンダリングされる', () => {
    render(<AdminBadge>テストバッジ</AdminBadge>);
    
    const badge = screen.getByText('テストバッジ');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('inline-flex', 'items-center', 'font-medium', 'rounded-full', 'border');
  });

  describe('variant prop', () => {
    it('default variantが適用される', () => {
      render(<AdminBadge variant="default">Default</AdminBadge>);
      
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200');
    });

    it('primary variantが適用される', () => {
      render(<AdminBadge variant="primary">Primary</AdminBadge>);
      
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
    });

    it('success variantが適用される', () => {
      render(<AdminBadge variant="success">Success</AdminBadge>);
      
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
    });

    it('warning variantが適用される', () => {
      render(<AdminBadge variant="warning">Warning</AdminBadge>);
      
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800', 'border-orange-200');
    });

    it('danger variantが適用される', () => {
      render(<AdminBadge variant="danger">Danger</AdminBadge>);
      
      const badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');
    });

    it('info variantが適用される', () => {
      render(<AdminBadge variant="info">Info</AdminBadge>);
      
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800', 'border-purple-200');
    });

    it('variant未指定でdefaultが適用される', () => {
      render(<AdminBadge>No Variant</AdminBadge>);
      
      const badge = screen.getByText('No Variant');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200');
    });
  });

  describe('size prop', () => {
    it('sm sizeが適用される', () => {
      render(<AdminBadge size="sm">Small</AdminBadge>);
      
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('md sizeが適用される', () => {
      render(<AdminBadge size="md">Medium</AdminBadge>);
      
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
    });

    it('lg sizeが適用される', () => {
      render(<AdminBadge size="lg">Large</AdminBadge>);
      
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-sm');
    });

    it('size未指定でmdが適用される', () => {
      render(<AdminBadge>No Size</AdminBadge>);
      
      const badge = screen.getByText('No Size');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
    });

    it('不正なsizeでmdが適用される', () => {
      render(<AdminBadge size={'xl' as any}>Invalid Size</AdminBadge>);
      
      const badge = screen.getByText('Invalid Size');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
    });
  });

  describe('icon prop', () => {
    it('アイコンが表示される', () => {
      render(<AdminBadge icon="🔥">With Icon</AdminBadge>);
      
      const badge = screen.getByText('With Icon');
      expect(badge).toBeInTheDocument();
      
      const icon = screen.getByText('🔥');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-1');
    });

    it('アイコンなしでも正常に動作する', () => {
      render(<AdminBadge>Without Icon</AdminBadge>);
      
      const badge = screen.getByText('Without Icon');
      expect(badge).toBeInTheDocument();
      
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });

    it('文字列アイコンが正しく表示される', () => {
      render(<AdminBadge icon="★">Star Icon</AdminBadge>);
      
      const icon = screen.getByText('★');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-1');
    });
  });

  describe('className prop', () => {
    it('カスタムclassNameが追加される', () => {
      render(<AdminBadge className="custom-class">Custom Class</AdminBadge>);
      
      const badge = screen.getByText('Custom Class');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex'); // 基本クラスも維持される
    });

    it('複数のカスタムクラスが追加される', () => {
      render(<AdminBadge className="custom-1 custom-2">Multiple Classes</AdminBadge>);
      
      const badge = screen.getByText('Multiple Classes');
      expect(badge).toHaveClass('custom-1', 'custom-2');
    });

    it('classNameが空文字でも動作する', () => {
      render(<AdminBadge className="">Empty ClassName</AdminBadge>);
      
      const badge = screen.getByText('Empty ClassName');
      expect(badge).toHaveClass('inline-flex'); // 基本クラスは適用される
    });

    it('classNameなしでも動作する', () => {
      render(<AdminBadge>No ClassName</AdminBadge>);
      
      const badge = screen.getByText('No ClassName');
      expect(badge).toHaveClass('inline-flex'); // 基本クラスは適用される
    });
  });

  describe('children prop', () => {
    it('文字列childrenが表示される', () => {
      render(<AdminBadge>Text Content</AdminBadge>);
      
      const badge = screen.getByText('Text Content');
      expect(badge).toBeInTheDocument();
    });

    it('数値childrenが表示される', () => {
      render(<AdminBadge>{42}</AdminBadge>);
      
      const badge = screen.getByText('42');
      expect(badge).toBeInTheDocument();
    });

    it('複雑なReactNodeが表示される', () => {
      render(
        <AdminBadge>
          <span>Complex</span>
          <strong> Content</strong>
        </AdminBadge>
      );
      
      const badge = screen.getByText('Complex');
      const strong = screen.getByText('Content');
      
      expect(badge).toBeInTheDocument();
      expect(strong).toBeInTheDocument();
    });

    it('空のchildrenでも動作する', () => {
      render(<AdminBadge>{''}</AdminBadge>);
      
      const badge = document.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('複合props', () => {
    it('全てのpropsが組み合わさって正しく動作する', () => {
      render(
        <AdminBadge
          variant="success"
          size="lg"
          className="test-badge"
          icon="✓"
        >
          Complete Badge
        </AdminBadge>
      );
      
      const badge = screen.getByText('Complete Badge');
      const icon = screen.getByText('✓');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        'bg-green-100', 'text-green-800', 'border-green-200', // success variant
        'px-3', 'py-1', 'text-sm', // lg size
        'test-badge', // custom class
        'inline-flex', 'items-center', 'font-medium', 'rounded-full', 'border' // base classes
      );
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-1');
    });

    it('variant="primary" + size="sm" + iconの組み合わせ', () => {
      render(
        <AdminBadge variant="primary" size="sm" icon="📌">
          Small Primary
        </AdminBadge>
      );
      
      const badge = screen.getByText('Small Primary');
      const icon = screen.getByText('📌');
      
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
      expect(icon).toHaveClass('mr-1');
    });
  });

  describe('CSS クラス処理', () => {
    it('クラス文字列が正しく結合される', () => {
      render(<AdminBadge variant="danger" className="extra-class">Test</AdminBadge>);
      
      const badge = screen.getByText('Test');
      
      // 基本クラス + variant + size + custom classが全て適用される
      expect(badge).toHaveClass('inline-flex', 'items-center', 'font-medium');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
      expect(badge).toHaveClass('extra-class');
    });

    it('余分な空白が正しく処理される', () => {
      // baseClassesの文字列処理をテスト
      render(<AdminBadge>Whitespace Test</AdminBadge>);
      
      const badge = screen.getByText('Whitespace Test');
      
      // クラス名に余分なスペースがないことを確認（視覚的に確認は困難だが、動作することを確認）
      expect(badge.className).not.toMatch(/\s{2,}/); // 連続する空白がない
      expect(badge.className).not.toMatch(/^\s|\s$/); // 先頭末尾に空白がない
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なrole属性が設定されていない（基本的なspan要素）', () => {
      render(<AdminBadge>Accessible Badge</AdminBadge>);
      
      const badge = screen.getByText('Accessible Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('テキストコンテンツが読み取り可能', () => {
      render(<AdminBadge icon="🏆">アクセシブルテキスト</AdminBadge>);
      
      const badge = screen.getByText('アクセシブルテキスト');
      expect(badge).toHaveTextContent('🏆アクセシブルテキスト');
    });
  });
});