/**
 * プログレスバーコンポーネント
 * - 進捗状況の視覚的表示
 * - 現在値と総値から進捗率を計算
 */
'use client';
import React from 'react';

interface Props {
  current: number; // 現在の進捗値
  total: number;   // 総進捗値
}

export default function ProgressBar({ current, total }: Props) {
  /**
   * 進捗率を計算（最大100%）
   */
  const width = Math.min(100, (current / total) * 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
