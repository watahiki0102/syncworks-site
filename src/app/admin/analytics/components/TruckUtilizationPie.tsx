'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TruckUtilization } from '@/types/analytics';

interface TruckUtilizationPieProps {
  title?: string;
  height?: number;
}

export default function TruckUtilizationPie({ 
  title = 'トラック稼働状況（単体）',
  height = 300 
}: TruckUtilizationPieProps) {
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [trucks, setTrucks] = useState<TruckUtilization[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<TruckUtilization | null>(null);

  // 初期化時にトラック一覧を取得
  useEffect(() => {
    fetchTrucks();
  }, []);

  // 選択されたトラックが変更された時の処理
  useEffect(() => {
    if (selectedTruckId && trucks.length > 0) {
      const truck = trucks.find(t => t.truckId === selectedTruckId);
      setSelectedTruck(truck || null);
    } else {
      setSelectedTruck(null);
    }
  }, [selectedTruckId, trucks]);

  // トラック一覧を取得（仮の実装）
  const fetchTrucks = async () => {
    try {
      // 実際のAPI呼び出しに置き換え
      const mockTrucks: TruckUtilization[] = [
        {
          truckId: 'truck-001',
          truckName: '軽トラックA',
          busyRatio: 75,
          idleRatio: 25
        },
        {
          truckId: 'truck-002',
          truckName: '2tトラックB',
          busyRatio: 60,
          idleRatio: 40
        },
        {
          truckId: 'truck-003',
          truckName: '3tトラックC',
          busyRatio: 85,
          idleRatio: 15
        },
        {
          truckId: 'truck-004',
          truckName: '4tトラックD',
          busyRatio: 45,
          idleRatio: 55
        }
      ];
      setTrucks(mockTrucks);
      
      // 最初のトラックを選択
      if (mockTrucks.length > 0) {
        setSelectedTruckId(mockTrucks[0].truckId);
      }
    } catch (error) {
      console.error('トラック取得エラー:', error);
    }
  };

  // チャート用データを生成
  const chartData = selectedTruck ? [
    {
      name: '稼働中',
      value: selectedTruck.busyRatio,
      color: '#10b981'
    },
    {
      name: '非稼働',
      value: selectedTruck.idleRatio,
      color: '#6b7280'
    }
  ] : [];

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{data.name}</p>
          <p className="text-blue-600 font-bold">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        
        {/* トラック選択セレクトボックス */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">トラック:</label>
          <select
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {trucks.map((truck) => (
              <option key={truck.truckId} value={truck.truckId}>
                {truck.truckName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTruck ? (
        <>
          {/* 選択されたトラックの情報 */}
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">{selectedTruck.truckName}</h4>
            <p className="text-sm text-gray-600">稼働状況</p>
          </div>

          {/* 円グラフ */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{selectedTruck.busyRatio}%</div>
              <div className="text-sm text-green-700">稼働中</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{selectedTruck.idleRatio}%</div>
              <div className="text-sm text-gray-700">非稼働</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          トラックを選択してください
        </div>
      )}
    </div>
  );
}
