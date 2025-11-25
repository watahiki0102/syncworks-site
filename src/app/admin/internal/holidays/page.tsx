'use client';

import { useState, useEffect } from 'react';
import InternalLayout from '../InternalLayout';

interface Holiday {
  date: string;
  name: string;
}

interface HolidayData {
  holidays: Holiday[];
  lastUpdated: string | null;
  count: number;
}

export default function InternalHolidaysPage() {
  const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // 祝日データを取得
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/holidays');
      if (!response.ok) {
        throw new Error('祝日データの取得に失敗しました');
      }
      const data = await response.json();
      setHolidayData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 内閣府CSVから自動更新
  const handleAutoUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/holidays/update', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('祝日データの更新に失敗しました');
      }

      const result = await response.json();
      setSuccess(`内閣府CSVから祝日データを更新しました（${result.count}件）`);

      // データを再取得
      await fetchHolidays();
    } catch (err) {
      setError(err instanceof Error ? err.message : '祝日データの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // CSVファイルをアップロード
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    try {
      setUploadingFile(true);
      setError(null);
      setSuccess(null);

      // ファイルの内容を読み込む
      const text = await file.text();

      // CSVをパースしてJSONに変換
      const lines = text.split('\n').filter(line => line.trim());
      const holidays: Holiday[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || i === 0) {continue;} // ヘッダー行をスキップ

        const [dateStr, name] = line.split(',').map(s => s.trim());
        if (dateStr && name) {
          // 日付をYYYY-MM-DD形式に変換
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split('T')[0];
            holidays.push({ date: formattedDate, name });
          }
        }
      }

      // APIに送信
      const response = await fetch('/api/holidays/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ holidays })
      });

      if (!response.ok) {
        throw new Error('CSVのインポートに失敗しました');
      }

      const result = await response.json();
      setSuccess(`CSVから祝日データをインポートしました（${result.count}件）`);

      // データを再取得
      await fetchHolidays();

      // ファイル入力をリセット
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSVのインポートに失敗しました');
    } finally {
      setUploadingFile(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <InternalLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">祝日管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              システム全体で使用される祝日データを管理します。更新内容は全事業者に即座に反映されます。
            </p>
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* CSVアップロードセクション */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">祝日データの更新</h2>

            <div className="space-y-6">
              {/* ワンクリック自動更新 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">内閣府CSVから自動更新（推奨）</h3>
                <p className="text-sm text-gray-500 mb-3">
                  内閣府が公開している最新の祝日データを自動的に取得して全事業者に反映します。
                </p>
                <button
                  onClick={handleAutoUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? '更新中...' : '内閣府CSVから自動更新'}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                {/* 手動アップロード */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">CSVファイルを手動アップロード</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    独自の祝日CSVファイルをアップロードして全事業者に反映します。<br />
                    <strong>形式:</strong> 日付,祝日名（1行目はヘッダー）<br />
                    <strong>例:</strong> 2025-01-01,元日
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={uploadingFile || loading}
                        className="hidden"
                        id="csv-upload"
                      />
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 cursor-pointer transition-colors text-sm font-medium inline-block">
                        {uploadingFile ? 'アップロード中...' : 'CSVファイルを選択'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 現在の祝日データ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">現在の祝日データ</h2>
              {holidayData?.lastUpdated && (
                <p className="text-sm text-gray-500">
                  最終更新: {new Date(holidayData.lastUpdated).toLocaleString('ja-JP')}
                </p>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : holidayData?.holidays && holidayData.holidays.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  登録件数: {holidayData.count}件
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          日付
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          祝日名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          曜日
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {holidayData.holidays.map((holiday) => {
                        const date = new Date(holiday.date);
                        const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                        return (
                          <tr key={holiday.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {holiday.date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {holiday.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {weekday}曜日
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">祝日データがまだ登録されていません</p>
                <p className="text-sm text-gray-400 mt-2">CSVファイルをアップロードして祝日データを登録してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
