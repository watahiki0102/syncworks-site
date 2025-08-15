'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { formatCurrencyJPY, formatLaborHours } from '@/utils/format';

interface ChartData {
  label: string;
  value: number;
}

interface TrendsChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'combo';
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export default function TrendsChart({ 
  title, 
  data, 
  type, 
  yAxisLabel = '値',
  valueFormatter,
  height = 300 
}: TrendsChartProps) {
  // データが空の場合
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  // チャート用データに変換
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value
  }));

  // デフォルトの値フォーマッター
  const defaultFormatter = (value: number) => value.toLocaleString();

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = valueFormatter ? valueFormatter(value) : defaultFormatter(value);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{label}</p>
          <p className="text-blue-600 font-bold">{formattedValue}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (): React.ReactElement => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'combo':
        return (
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} />
          </ComposedChart>
        );

      default:
        return <div>チャートタイプが無効です</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
