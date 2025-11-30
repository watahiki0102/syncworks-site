import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * シーズンルール一覧取得
 * GET /api/season-rules
 */
export async function GET() {
  try {
    const seasonRules = await prisma.season_rules.findMany({
      where: { is_active: true },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: seasonRules.map(r => ({
        id: r.id,
        name: r.name,
        startDate: r.start_date.toISOString().split('T')[0],
        endDate: r.end_date.toISOString().split('T')[0],
        priceType: r.price_type as 'percentage' | 'fixed',
        price: r.price,
        description: r.description || '',
        isRecurring: r.is_recurring,
        recurringType: r.recurring_type as 'none' | 'weekly' | 'monthly' | 'yearly' | 'specific',
        recurringPattern: r.recurring_pattern as { weekdays?: number[]; monthlyPattern?: string; specificDates?: string[] } | null,
        recurringEndYear: r.recurring_end_year,
        priority: r.priority,
      })),
    });
  } catch (error) {
    console.error('シーズンルール取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'シーズンルールの取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * シーズンルール登録
 * POST /api/season-rules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      startDate,
      endDate,
      priceType = 'percentage',
      price = 0,
      description,
      isRecurring = false,
      recurringType = 'none',
      recurringPattern,
      recurringEndYear,
    } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'シーズン名、開始日、終了日は必須です' },
        { status: 400 }
      );
    }

    const seasonRule = await prisma.season_rules.create({
      data: {
        name: name.trim(),
        season_type: 'custom',
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        rate_multiplier: priceType === 'percentage' ? 1 + price / 100 : 1,
        price_type: priceType,
        price: price,
        description: description || null,
        is_recurring: isRecurring,
        recurring_type: recurringType,
        recurring_pattern: recurringPattern || null,
        recurring_end_year: recurringEndYear || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: seasonRule.id,
        name: seasonRule.name,
        startDate: seasonRule.start_date.toISOString().split('T')[0],
        endDate: seasonRule.end_date.toISOString().split('T')[0],
        priceType: seasonRule.price_type,
        price: seasonRule.price,
        description: seasonRule.description || '',
        isRecurring: seasonRule.is_recurring,
        recurringType: seasonRule.recurring_type,
        recurringPattern: seasonRule.recurring_pattern,
        recurringEndYear: seasonRule.recurring_end_year,
      },
    });
  } catch (error) {
    console.error('シーズンルール登録エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'シーズンルールの登録に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * シーズンルール削除
 * DELETE /api/season-rules?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが必要です' },
        { status: 400 }
      );
    }

    await prisma.season_rules.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('シーズンルール削除エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'シーズンルールの削除に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * シーズンルール一括更新
 * PUT /api/season-rules
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { seasonRules } = body;

    if (!Array.isArray(seasonRules)) {
      return NextResponse.json(
        { success: false, error: '無効なリクエスト形式です' },
        { status: 400 }
      );
    }

    interface SeasonRuleInput {
      id?: string;
      name: string;
      startDate: string;
      endDate: string;
      priceType?: 'percentage' | 'fixed';
      price?: number;
      description?: string;
      isRecurring?: boolean;
      recurringType?: string;
      recurringPattern?: { weekdays?: number[]; monthlyPattern?: string; specificDates?: string[] };
      recurringEndYear?: number;
    }

    const results = await prisma.$transaction(
      seasonRules.map((r: SeasonRuleInput, index: number) => {
        const data = {
          name: r.name.trim(),
          season_type: 'custom',
          start_date: new Date(r.startDate),
          end_date: new Date(r.endDate),
          rate_multiplier: r.priceType === 'percentage' ? 1 + (r.price || 0) / 100 : 1,
          price_type: r.priceType || 'percentage',
          price: r.price || 0,
          description: r.description || null,
          is_recurring: r.isRecurring ?? false,
          recurring_type: r.recurringType || 'none',
          recurring_pattern: r.recurringPattern || null,
          recurring_end_year: r.recurringEndYear || null,
          priority: index * 10,
          updated_at: new Date(),
        };

        if (r.id) {
          return prisma.season_rules.update({
            where: { id: r.id },
            data,
          });
        } else {
          return prisma.season_rules.create({ data });
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: results.map(r => ({
        id: r.id,
        name: r.name,
        startDate: r.start_date.toISOString().split('T')[0],
        endDate: r.end_date.toISOString().split('T')[0],
        priceType: r.price_type,
        price: r.price,
        description: r.description || '',
        isRecurring: r.is_recurring,
        recurringType: r.recurring_type,
        recurringPattern: r.recurring_pattern,
        recurringEndYear: r.recurring_end_year,
      })),
    });
  } catch (error) {
    console.error('シーズンルール更新エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'シーズンルールの更新に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
