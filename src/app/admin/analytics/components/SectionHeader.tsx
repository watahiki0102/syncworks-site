import React from 'react';

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, children, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
