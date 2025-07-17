'use client';
import React from 'react';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
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
