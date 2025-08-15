'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { shortenAddress } from '@/utils/format';

interface PlaceLabelsProps {
  origin: string;
  destination: string;
  className?: string;
}

type DisplayMode = 'full' | 'compact' | 'mini' | 'too-narrow';

export default function PlaceLabels({ origin, destination, className = '' }: PlaceLabelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('compact');
  const [isResizing, setIsResizing] = useState(false);

  // リサイズ処理をスロットリング
  const updateDisplayMode = useCallback((width: number) => {
    let newMode: DisplayMode = 'compact';
    
    if (width >= 200) {
      newMode = 'full';
    } else if (width >= 150) {
      newMode = 'compact';
    } else if (width >= 100) {
      newMode = 'mini';
    } else {
      newMode = 'too-narrow';
    }
    
    setDisplayMode(newMode);
  }, []);

  // ResizeObserverを使用して幅の変更を監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (isResizing) return;
      
      setIsResizing(true);
      
      // requestAnimationFrameを使用してリサイズ処理をバッチ化
      requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          updateDisplayMode(width);
        }
        setIsResizing(false);
      });
    });

    resizeObserver.observe(container);

    // 初期表示モードを設定
    const initialWidth = container.getBoundingClientRect().width;
    updateDisplayMode(initialWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDisplayMode, isResizing]);

  const getDisplayClass = () => {
    switch (displayMode) {
      case 'full':
        return 'text-sm';
      case 'compact':
        return 'text-xs';
      case 'mini':
        return 'text-xs';
      case 'too-narrow':
        return 'text-xs';
      default:
        return 'text-xs';
    }
  };

  const getLayoutClass = () => {
    switch (displayMode) {
      case 'full':
        return 'flex flex-col items-center gap-1';
      case 'compact':
        return 'flex flex-col items-center gap-0.5';
      case 'mini':
        return 'flex flex-col items-center gap-0.5';
      case 'too-narrow':
        return 'flex flex-col items-center gap-0.5';
      default:
        return 'flex flex-col items-center gap-0.5';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`${getLayoutClass()} ${getDisplayClass()} ${className}`}
      style={{ height: '2.5rem' }}
    >
      {/* 出発地 */}
      <div 
        className="text-center leading-tight"
        title={origin}
      >
        {shortenAddress(origin, displayMode)}
      </div>
      
      {/* 到着地 */}
      <div 
        className="text-center leading-tight"
        title={destination}
      >
        {shortenAddress(destination, displayMode)}
      </div>
    </div>
  );
}
