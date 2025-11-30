import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 祝日データ取得APIエンドポイント
 * GET /api/holidays
 *
 * 保存されている祝日データを返す
 */
export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(dataDir, 'holidays.json');

    // ファイルが存在するか確認
    try {
      await fs.access(filePath);
    } catch {
      // ファイルが存在しない場合は空の配列を返す
      return NextResponse.json({
        holidays: [],
        lastUpdated: null,
        message: '祝日データがまだ取得されていません。/api/holidays/update にアクセスしてデータを取得してください。'
      });
    }

    // ファイルを読み込む
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      holidays: data.holidays || [],
      lastUpdated: data.lastUpdated || null,
      count: data.holidays?.length || 0
    });
  } catch (error) {
    console.error('祝日データ取得エラー:', error);
    return NextResponse.json(
      {
        error: '祝日データの取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}
