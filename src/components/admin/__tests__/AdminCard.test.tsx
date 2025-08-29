/**
 * AdminCard コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminCard from '../AdminCard';

describe('AdminCard', () => {
  describe('基本機能', () => {
    it('基本的なカードがレンダリングされる', () => {
      const { container } = render(
        <AdminCard>
          <div>カードコンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200');
      expect(screen.getByText('カードコンテンツ')).toBeInTheDocument();
    });

    it('childrenが正しく表示される', () => {
      render(
        <AdminCard>
          <p>テストコンテンツ</p>
          <button>アクションボタン</button>
        </AdminCard>
      );
      
      expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'アクションボタン' })).toBeInTheDocument();
    });
  });

  describe('title と subtitle', () => {
    it('titleが表示される', () => {
      render(
        <AdminCard title="カードタイトル">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('カードタイトル');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
    });

    it('subtitleが表示される', () => {
      render(
        <AdminCard title="タイトル" subtitle="サブタイトル">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const subtitle = screen.getByText('サブタイトル');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('text-sm', 'text-gray-600', 'mt-1');
    });

    it('titleなしではsubtitleも表示されない', () => {
      render(
        <AdminCard subtitle="サブタイトル">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.queryByText('サブタイトル')).not.toBeInTheDocument();
    });

    it('titleのみでsubtitleなしでも動作する', () => {
      render(
        <AdminCard title="タイトルのみ">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByText('タイトルのみ')).toBeInTheDocument();
      expect(screen.queryByText('text-sm text-gray-600 mt-1')).not.toBeInTheDocument();
    });
  });

  describe('icon', () => {
    it('iconが表示される', () => {
      render(
        <AdminCard title="アイコン付きカード" icon="🏠">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const icon = screen.getByText('🏠');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-xl');
    });

    it('titleなしではiconも表示されない', () => {
      render(
        <AdminCard icon="🏠">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.queryByText('🏠')).not.toBeInTheDocument();
    });

    it('iconとtitle、subtitleが組み合わされる', () => {
      render(
        <AdminCard title="完全なヘッダー" subtitle="説明文" icon="⭐">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const icon = screen.getByText('⭐');
      const title = screen.getByText('完全なヘッダー');
      const subtitle = screen.getByText('説明文');
      
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('headerActions', () => {
    it('headerActionsが表示される', () => {
      render(
        <AdminCard 
          title="アクション付きカード"
          headerActions={
            <button>編集</button>
          }
        >
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const editButton = screen.getByRole('button', { name: '編集' });
      expect(editButton).toBeInTheDocument();
      
      const actionsContainer = editButton.closest('.flex.items-center.gap-2');
      expect(actionsContainer).toBeInTheDocument();
    });

    it('複数のheaderActionsが表示される', () => {
      render(
        <AdminCard 
          title="複数アクション"
          headerActions={
            <>
              <button>編集</button>
              <button>削除</button>
            </>
          }
        >
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });

    it('titleなしでもheaderActionsは表示される', () => {
      render(
        <AdminCard 
          headerActions={
            <button>アクション</button>
          }
        >
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
    });
  });

  describe('loading状態', () => {
    it('loading=falseでは通常のコンテンツが表示される', () => {
      render(
        <AdminCard loading={false}>
          <div>通常コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByText('通常コンテンツ')).toBeInTheDocument();
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    it('loading=trueでローディングスピナーが表示される', () => {
      render(
        <AdminCard loading>
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const loadingText = screen.getByText('読み込み中...');
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass('ml-3', 'text-gray-600');
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-blue-600');
      
      expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
    });

    it('loading=trueで明示的に設定される', () => {
      render(
        <AdminCard loading={true}>
          <div>非表示コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
      expect(screen.queryByText('非表示コンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('error状態', () => {
    it('errorがある場合エラー表示される', () => {
      render(
        <AdminCard error="データの取得に失敗しました">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const errorTitle = screen.getByText('エラーが発生しました');
      const errorMessage = screen.getByText('データの取得に失敗しました');
      const errorIcon = screen.getByText('⚠️');
      
      expect(errorTitle).toBeInTheDocument();
      expect(errorTitle).toHaveClass('text-red-600', 'font-medium');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-sm', 'text-gray-600', 'mt-1');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('text-4xl', 'mb-2', 'block');
      
      expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
    });

    it('loading状態がerrorより優先される', () => {
      render(
        <AdminCard loading error="エラーメッセージ">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
      expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
      expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('padding prop', () => {
    it('デフォルトでmd paddingが適用される', () => {
      render(
        <AdminCard>
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer).toHaveClass('p-6');
    });

    it('padding="none"で余白なし', () => {
      render(
        <AdminCard padding="none">
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer?.className).toBe('');
    });

    it('padding="sm"で小さな余白', () => {
      render(
        <AdminCard padding="sm">
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer).toHaveClass('p-4');
    });

    it('padding="md"で中程度の余白', () => {
      render(
        <AdminCard padding="md">
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer).toHaveClass('p-6');
    });

    it('padding="lg"で大きな余白', () => {
      render(
        <AdminCard padding="lg">
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer).toHaveClass('p-8');
    });

    it('不正なpaddingでmdが適用される', () => {
      render(
        <AdminCard padding={'xl' as any}>
          <div data-testid="content">コンテンツ</div>
        </AdminCard>
      );
      
      const content = screen.getByTestId('content');
      const contentContainer = content.parentElement;
      expect(contentContainer).toHaveClass('p-6');
    });
  });

  describe('shadow prop', () => {
    it('デフォルトでmd shadowが適用される', () => {
      const { container } = render(
        <AdminCard>
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-md');
    });

    it('shadow="none"で影なし', () => {
      const { container } = render(
        <AdminCard shadow="none">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg');
    });

    it('shadow="sm"で小さな影', () => {
      const { container } = render(
        <AdminCard shadow="sm">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-sm');
    });

    it('shadow="md"で中程度の影', () => {
      const { container } = render(
        <AdminCard shadow="md">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-md');
    });

    it('shadow="lg"で大きな影', () => {
      const { container } = render(
        <AdminCard shadow="lg">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-lg');
    });

    it('不正なshadowでmdが適用される', () => {
      const { container } = render(
        <AdminCard shadow={'xl' as any}>
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-md');
    });
  });

  describe('className prop', () => {
    it('カスタムclassNameが追加される', () => {
      const { container } = render(
        <AdminCard className="custom-card">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('bg-white', 'rounded-lg'); // 基本クラスも維持
    });

    it('複数のカスタムクラスが追加される', () => {
      const { container } = render(
        <AdminCard className="custom-1 custom-2">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-1', 'custom-2');
    });

    it('空のclassNameでも動作する', () => {
      const { container } = render(
        <AdminCard className="">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white'); // 基本クラスは適用される
    });
  });

  describe('複合プロパティテスト', () => {
    it('すべてのプロパティが組み合わされて動作する', () => {
      const { container } = render(
        <AdminCard
          title="完全なカード"
          subtitle="詳細な説明"
          icon="🎯"
          headerActions={<button>アクション</button>}
          padding="lg"
          shadow="lg"
          className="test-card"
        >
          <div>メインコンテンツ</div>
        </AdminCard>
      );
      
      // カード本体
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'test-card');
      
      // ヘッダー要素
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('完全なカード')).toBeInTheDocument();
      expect(screen.getByText('詳細な説明')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
      
      // コンテンツ
      const content = screen.getByText('メインコンテンツ');
      expect(content).toBeInTheDocument();
      expect(content.parentElement).toHaveClass('p-8'); // lg padding
    });

    it('loading状態では他のコンテンツが表示されない', () => {
      render(
        <AdminCard
          title="ローディングカード"
          loading
          error="エラーメッセージ"
        >
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      // タイトルは表示される（ヘッダー部分）
      expect(screen.getByText('ローディングカード')).toBeInTheDocument();
      
      // ローディング表示
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
      
      // エラーとコンテンツは表示されない
      expect(screen.queryByText('エラーメッセージ')).not.toBeInTheDocument();
      expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('レイアウト構造', () => {
    it('ヘッダーありの場合の構造が正しい', () => {
      render(
        <AdminCard title="構造テスト">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      // ヘッダーのボーダー
      const headerContainer = screen.getByText('構造テスト').closest('.border-b.border-gray-200');
      expect(headerContainer).toBeInTheDocument();
      expect(headerContainer).toHaveClass('p-6', 'pb-4');
    });

    it('headerActionsのみの場合の構造', () => {
      render(
        <AdminCard headerActions={<button>アクション</button>}>
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      const actionButton = screen.getByRole('button');
      const headerContainer = actionButton.closest('.border-b.border-gray-200');
      expect(headerContainer).toHaveClass('p-4'); // titleがない場合のpadding
    });
  });

  describe('エッジケース', () => {
    it('children が null でも動作する', () => {
      render(<AdminCard>{null}</AdminCard>);
      
      const card = document.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
    });

    it('children が複数要素でも動作する', () => {
      render(
        <AdminCard>
          <h2>見出し</h2>
          <p>段落1</p>
          <p>段落2</p>
          <button>ボタン</button>
        </AdminCard>
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText('段落1')).toBeInTheDocument();
      expect(screen.getByText('段落2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ボタン' })).toBeInTheDocument();
    });

    it('空文字のerrorではエラー表示されない', () => {
      render(
        <AdminCard error="">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      // 空文字のerrorは falsy なので通常のコンテンツが表示される
      expect(screen.getByText('コンテンツ')).toBeInTheDocument();
      expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
    });

    it('特殊文字を含むtitleでも動作する', () => {
      render(
        <AdminCard title="特殊文字 @#$%^&*()_+ テスト">
          <div>コンテンツ</div>
        </AdminCard>
      );
      
      expect(screen.getByText('特殊文字 @#$%^&*()_+ テスト')).toBeInTheDocument();
    });
  });
});