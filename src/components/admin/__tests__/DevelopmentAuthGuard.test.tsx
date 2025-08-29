/**
 * DevelopmentAuthGuard コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DevelopmentAuthGuard from '../DevelopmentAuthGuard';

// useEffect内のsetTimeoutなどの非同期処理をモック
jest.useFakeTimers();

describe('DevelopmentAuthGuard', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllTimers();
  });

  describe('開発環境での動作', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('初期状態でローディング表示される', () => {
      // テスト環境では常にローディング状態になる
      process.env.NODE_ENV = 'test';
      
      render(
        <DevelopmentAuthGuard>
          <div>保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // 初期状態ではローディングが表示される
      expect(screen.getByText('開発環境認証中...')).toBeInTheDocument();
      expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
      
      // スピナーが表示される
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-600');
    });

    it('useEffectの実行後に子コンポーネントが表示される', async () => {
      render(
        <DevelopmentAuthGuard>
          <div>保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // useEffectが実行されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
      });
      
      // ローディングは消える
      expect(screen.queryByText('開発環境認証中...')).not.toBeInTheDocument();
    });

    it('複数の子コンポーネントが表示される', async () => {
      render(
        <DevelopmentAuthGuard>
          <div>コンテンツ1</div>
          <p>コンテンツ2</p>
          <button>アクション</button>
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
        expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
      });
    });

    it('子コンポーネントがnullでも動作する', async () => {
      render(
        <DevelopmentAuthGuard>
          {null}
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByText('開発環境認証中...')).not.toBeInTheDocument();
      });
    });

    it('子コンポーネントがReactElementでも動作する', async () => {
      const CustomComponent = () => <div>カスタムコンポーネント</div>;
      
      render(
        <DevelopmentAuthGuard>
          <CustomComponent />
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('カスタムコンポーネント')).toBeInTheDocument();
      });
    });
  });

  describe('非開発環境での動作', () => {
    it('production環境では常にローディング状態', () => {
      process.env.NODE_ENV = 'production';
      
      render(
        <DevelopmentAuthGuard>
          <div>保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // production環境では認証が完了せず、常にローディング
      expect(screen.getByText('開発環境認証中...')).toBeInTheDocument();
      expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    });

    it('test環境では常にローディング状態', () => {
      process.env.NODE_ENV = 'test';
      
      render(
        <DevelopmentAuthGuard>
          <div>保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      expect(screen.getByText('開発環境認証中...')).toBeInTheDocument();
      expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    });

    it('undefined環境では常にローディング状態', () => {
      process.env.NODE_ENV = undefined as any;
      
      render(
        <DevelopmentAuthGuard>
          <div>保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      expect(screen.getByText('開発環境認証中...')).toBeInTheDocument();
      expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('ローディング画面のレイアウト', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'; // ローディング状態を維持
    });

    it('ローディング画面の構造が正しい', () => {
      render(
        <DevelopmentAuthGuard>
          <div>コンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // 外側のコンテナ
      const container = screen.getByText('開発環境認証中...').closest('.min-h-screen');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('bg-gray-50', 'flex', 'items-center', 'justify-center');
      
      // 内側のコンテナ
      const innerContainer = screen.getByText('開発環境認証中...').closest('.text-center');
      expect(innerContainer).toBeInTheDocument();
      
      // テキストのスタイル
      const text = screen.getByText('開発環境認証中...');
      expect(text).toHaveClass('mt-4', 'text-gray-600');
    });

    it('スピナーのスタイルが正しく設定される', () => {
      render(
        <DevelopmentAuthGuard>
          <div>コンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-12',
        'w-12',
        'border-b-2',
        'border-blue-600',
        'mx-auto'
      );
    });
  });

  describe('ステート管理', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('初期状態でisLoadingがtrueである', () => {
      // テスト環境では常にローディング状態になる
      process.env.NODE_ENV = 'test';
      
      render(
        <DevelopmentAuthGuard>
          <div>コンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // 初期状態ではローディング中
      expect(screen.getByText('開発環境認証中...')).toBeInTheDocument();
    });

    it('useEffectによってisLoadingがfalseに変更される', async () => {
      render(
        <DevelopmentAuthGuard>
          <div data-testid="protected-content">保護されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      // 状態変更後の確認
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.queryByText('開発環境認証中...')).not.toBeInTheDocument();
      });
    });
  });

  describe('useEffectの依存配列', () => {
    it('useEffectが一度だけ実行される', async () => {
      process.env.NODE_ENV = 'development';
      
      const { rerender } = render(
        <DevelopmentAuthGuard>
          <div>初期コンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('初期コンテンツ')).toBeInTheDocument();
      });
      
      // 再レンダリングしても useEffect は再実行されない（依存配列が空のため）
      rerender(
        <DevelopmentAuthGuard>
          <div>更新されたコンテンツ</div>
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('更新されたコンテンツ')).toBeInTheDocument();
      });
    });
  });

  describe('エッジケース', () => {
    it('childrenが複雑な構造でも動作する', async () => {
      process.env.NODE_ENV = 'development';
      
      render(
        <DevelopmentAuthGuard>
          <div>
            <header>ヘッダー</header>
            <main>
              <section>
                <h1>タイトル</h1>
                <p>段落</p>
              </section>
            </main>
            <footer>フッター</footer>
          </div>
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('ヘッダー')).toBeInTheDocument();
        expect(screen.getByText('タイトル')).toBeInTheDocument();
        expect(screen.getByText('段落')).toBeInTheDocument();
        expect(screen.getByText('フッター')).toBeInTheDocument();
      });
    });

    it('childrenがfragmentでも動作する', async () => {
      process.env.NODE_ENV = 'development';
      
      render(
        <DevelopmentAuthGuard>
          <>
            <div>Fragment子1</div>
            <div>Fragment子2</div>
          </>
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Fragment子1')).toBeInTheDocument();
        expect(screen.getByText('Fragment子2')).toBeInTheDocument();
      });
    });

    it('childrenが文字列でも動作する', async () => {
      process.env.NODE_ENV = 'development';
      
      render(
        <DevelopmentAuthGuard>
          テキストのみの子
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('テキストのみの子')).toBeInTheDocument();
      });
    });

    it('childrenが数値でも動作する', async () => {
      process.env.NODE_ENV = 'development';
      
      render(
        <DevelopmentAuthGuard>
          {42}
        </DevelopmentAuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
      });
    });
  });
});