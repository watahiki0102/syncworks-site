import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Holiday {
  date: string;
  name: string;
}

/**
 * 内閣府CSVから祝日データを取得して保存するAPIエンドポイント
 * POST /api/holidays/update
 */
export async function POST() {
  try {
    // 内閣府の祝日CSVを取得
    const csvUrl = 'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error('内閣府のCSVデータ取得に失敗しました');
    }

    // Shift_JISからUTF-8に変換
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('shift-jis');
    const csvText = decoder.decode(arrayBuffer);

    // CSVをパース（Shift_JISからUTF-8への変換が必要な場合がある）
    const lines = csvText.split('\n').filter(line => line.trim());
    const holidays: Holiday[] = [];

    for (let i = 1; i < lines.length; i++) { // ヘッダーをスキップ
      const line = lines[i].trim();
      if (!line) continue;

      const [dateStr, name] = line.split(',').map(s => s.trim());
      if (dateStr && name) {
        // 日付をYYYY-MM-DD形式に変換
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          holidays.push({ date: formattedDate, name });
        }
      }
    }

    if (holidays.length === 0) {
      throw new Error('有効な祝日データが取得できませんでした');
    }

    // データを日付順にソート
    holidays.sort((a, b) => a.date.localeCompare(b.date));

    // データディレクトリとファイルパスの設定
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(dataDir, 'holidays.json');

    // データディレクトリが存在しない場合は作成
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // JSONファイルに保存
    const jsonData = {
      holidays: holidays,
      lastUpdated: new Date().toISOString(),
      source: 'government-csv',
      count: holidays.length
    };

    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `${holidays.length}件の祝日データを更新しました`,
      count: holidays.length,
      lastUpdated: jsonData.lastUpdated
    });
  } catch (error) {
    console.error('祝日データ更新エラー:', error);
    return NextResponse.json(
      {
        error: '祝日データの更新に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}
