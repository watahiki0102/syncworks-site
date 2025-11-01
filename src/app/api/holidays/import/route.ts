import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Holiday {
  date: string;
  name: string;
}

/**
 * CSVから変換された祝日データをインポートするAPIエンドポイント
 * POST /api/holidays/import
 *
 * リクエストボディ:
 * {
 *   holidays: [{ date: "YYYY-MM-DD", name: "祝日名" }, ...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { holidays } = body;

    if (!holidays || !Array.isArray(holidays)) {
      return NextResponse.json(
        { error: '不正なリクエストです。holidays配列が必要です。' },
        { status: 400 }
      );
    }

    // データの検証
    const validHolidays: Holiday[] = [];
    for (const holiday of holidays) {
      if (!holiday.date || !holiday.name) {
        continue;
      }

      // 日付の妥当性チェック
      const date = new Date(holiday.date);
      if (isNaN(date.getTime())) {
        continue;
      }

      validHolidays.push({
        date: holiday.date,
        name: holiday.name
      });
    }

    if (validHolidays.length === 0) {
      return NextResponse.json(
        { error: '有効な祝日データがありません' },
        { status: 400 }
      );
    }

    // データを日付順にソート
    validHolidays.sort((a, b) => a.date.localeCompare(b.date));

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
      holidays: validHolidays,
      lastUpdated: new Date().toISOString(),
      source: 'csv-upload',
      count: validHolidays.length
    };

    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `${validHolidays.length}件の祝日データをインポートしました`,
      count: validHolidays.length,
      lastUpdated: jsonData.lastUpdated
    });
  } catch (error) {
    console.error('CSVインポートエラー:', error);
    return NextResponse.json(
      {
        error: 'CSVのインポートに失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}
