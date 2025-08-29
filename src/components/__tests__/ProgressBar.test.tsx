/**
 * ProgressBar.tsx のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../ProgressBar';

describe('ProgressBar component', () => {
  it('基本的なプログレスバーがレンダリングされる', () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    
    const progressContainer = container.querySelector('.bg-gray-200');
    const progressBar = container.querySelector('.bg-blue-600');
    
    expect(progressContainer).toBeInTheDocument();
    expect(progressBar).toBeInTheDocument();
  });

  describe('進捗率の計算', () => {
    it('50%の進捗が正しく表示される', () => {
      const { container } = render(<ProgressBar current={1} total={2} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('50%');
    });

    it('25%の進捗が正しく表示される', () => {
      const { container } = render(<ProgressBar current={1} total={4} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('25%');
    });

    it('75%の進捗が正しく表示される', () => {
      const { container } = render(<ProgressBar current={3} total={4} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('75%');
    });

    it('100%の進捗が正しく表示される', () => {
      const { container } = render(<ProgressBar current={10} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('100%');
    });

    it('0%の進捗が正しく表示される', () => {
      const { container } = render(<ProgressBar current={0} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('0%');
    });
  });

  describe('エッジケース', () => {
    it('currentがtotalを超えても100%で制限される', () => {
      const { container } = render(<ProgressBar current={15} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('100%');
    });

    it('currentが負の値でも負の%として表示される', () => {
      const { container } = render(<ProgressBar current={-5} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('-50%'); // Math.min(100, -50) = -50
    });

    it('totalが0の場合はNaN回避（Infinity）', () => {
      const { container } = render(<ProgressBar current={5} total={0} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('100%'); // Math.min(100, Infinity) = 100
    });

    it('currentとtotalが両方0の場合', () => {
      const { container } = render(<ProgressBar current={0} total={0} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      // 0/0 = NaN, Math.min(100, NaN) = NaN, ブラウザはNaN%を空文字に変換
      expect(progressBar.style.width).toBe('');
    });

    it('小数点を含む値でも正しく計算される', () => {
      const { container } = render(<ProgressBar current={2.5} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('25%');
    });

    it('非常に小さな進捗も表示される', () => {
      const { container } = render(<ProgressBar current={1} total={1000} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('0.1%');
    });
  });

  describe('スタイリング', () => {
    it('コンテナに正しいクラスが適用されている', () => {
      const { container } = render(<ProgressBar current={5} total={10} />);
      const progressContainer = container.querySelector('.w-full.bg-gray-200.rounded-full');
      
      expect(progressContainer).toBeInTheDocument();
      expect(progressContainer).toHaveClass('h-2.5', 'mb-4');
    });

    it('プログレスバーに正しいクラスが適用されている', () => {
      const { container } = render(<ProgressBar current={5} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600');
      
      expect(progressBar).toHaveClass('h-2.5', 'rounded-full');
    });
  });

  describe('大きな数値', () => {
    it('大きな数値でも正しく動作する', () => {
      const { container } = render(<ProgressBar current={500000} total={1000000} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('50%');
    });

    it('非常に大きな数値でも100%制限が効く', () => {
      const { container } = render(<ProgressBar current={999999999} total={100000000} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('100%');
    });
  });

  describe('特殊な値', () => {
    it('currentがInfinityの場合', () => {
      const { container } = render(<ProgressBar current={Infinity} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('100%'); // Math.min(100, Infinity) = 100
    });

    it('totalがInfinityの場合', () => {
      const { container } = render(<ProgressBar current={10} total={Infinity} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('0%'); // Math.min(100, 10/Infinity) = 0
    });

    it('両方がInfinityの場合', () => {
      const { container } = render(<ProgressBar current={Infinity} total={Infinity} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      // Infinity/Infinity = NaN, ブラウザはNaN%を空文字に変換
      expect(progressBar.style.width).toBe('');
    });
  });

  describe('プロパティの型', () => {
    it('number型のpropsが正しく受け入れられる', () => {
      expect(() => {
        render(<ProgressBar current={42} total={100} />);
      }).not.toThrow();
    });

    it('小数点を含む値も正しく処理される', () => {
      const { container } = render(<ProgressBar current={33.33} total={100} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      expect(progressBar.style.width).toBe('33.33%');
    });
  });

  describe('スナップショット', () => {
    it('基本的なプログレスバーのスナップショット', () => {
      const { container } = render(<ProgressBar current={3} total={10} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('完了状態のプログレスバーのスナップショット', () => {
      const { container } = render(<ProgressBar current={10} total={10} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('開始状態のプログレスバーのスナップショット', () => {
      const { container } = render(<ProgressBar current={0} total={10} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('アクセシビリティ', () => {
    it('プログレスバーの構造が適切である', () => {
      const { container } = render(<ProgressBar current={7} total={10} />);
      
      // 外側のコンテナ
      const container_div = container.querySelector('.w-full');
      expect(container_div).toHaveAttribute('class', expect.stringContaining('bg-gray-200'));
      
      // 内側のプログレスバー
      const progress = container.querySelector('.bg-blue-600');
      expect(progress).toBeInTheDocument();
    });

    it('進捗の視覚的な表現が適切である', () => {
      const { container } = render(<ProgressBar current={6} total={10} />);
      const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
      
      // 60%の進捗が視覚的に表現されている
      expect(progressBar.style.width).toBe('60%');
      expect(progressBar).toHaveClass('bg-blue-600'); // 青色で進捗を示す
    });
  });
});