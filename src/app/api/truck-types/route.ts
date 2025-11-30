import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * トラック種別一覧取得
 * GET /api/truck-types
 */
export async function GET() {
  try {
    const truckTypes = await prisma.truck_types.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: truckTypes.map(t => ({
        id: t.id,
        name: t.name,
        displayName: t.display_name || t.name,
        basePrice: t.base_price,
        capacityKg: t.capacity_kg,
        maxPoints: t.max_points,
        coefficient: Number(t.coefficient),
        sortOrder: t.sort_order,
      })),
    });
  } catch (error) {
    console.error('トラック種別取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'トラック種別の取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * トラック種別登録
 * POST /api/truck-types
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, basePrice = 0, capacityKg = 0, maxPoints = 0, coefficient = 1.0, sortOrder } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: '車種名は必須です' },
        { status: 400 }
      );
    }

    // 既存のトラック種別数を取得（sort_order計算用）
    const count = await prisma.truck_types.count();

    const truckType = await prisma.truck_types.create({
      data: {
        name: name.trim(),
        display_name: displayName?.trim() || null,
        base_price: basePrice,
        capacity_kg: capacityKg,
        max_points: maxPoints,
        coefficient: coefficient,
        sort_order: sortOrder ?? (count + 1) * 10,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: truckType.id,
        name: truckType.name,
        displayName: truckType.display_name || truckType.name,
        basePrice: truckType.base_price,
        capacityKg: truckType.capacity_kg,
        maxPoints: truckType.max_points,
        coefficient: Number(truckType.coefficient),
        sortOrder: truckType.sort_order,
      },
    });
  } catch (error) {
    console.error('トラック種別登録エラー:', error);

    // 重複エラーのハンドリング
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'この車種名は既に登録されています' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'トラック種別の登録に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * トラック種別削除
 * DELETE /api/truck-types?id=xxx
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

    await prisma.truck_types.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('トラック種別削除エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'トラック種別の削除に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * トラック種別一括更新
 * PUT /api/truck-types
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { truckTypes } = body;

    if (!Array.isArray(truckTypes)) {
      return NextResponse.json(
        { success: false, error: '無効なリクエスト形式です' },
        { status: 400 }
      );
    }

    // トランザクションで一括更新
    interface TruckTypeInput {
      id?: string;
      name: string;
      displayName?: string;
      basePrice?: number;
      capacityKg?: number;
      maxPoints?: number;
      coefficient?: number;
      sortOrder?: number;
    }

    const results = await prisma.$transaction(
      truckTypes.map((t: TruckTypeInput, index: number) => {
        if (t.id) {
          // 既存レコードの更新
          return prisma.truck_types.update({
            where: { id: t.id },
            data: {
              name: t.name.trim(),
              display_name: t.displayName?.trim() || null,
              base_price: t.basePrice ?? 0,
              capacity_kg: t.capacityKg ?? 0,
              max_points: t.maxPoints ?? 0,
              coefficient: t.coefficient ?? 1.0,
              sort_order: t.sortOrder ?? (index + 1) * 10,
              updated_at: new Date(),
            },
          });
        } else {
          // 新規レコードの作成
          return prisma.truck_types.create({
            data: {
              name: t.name.trim(),
              display_name: t.displayName?.trim() || null,
              base_price: t.basePrice ?? 0,
              capacity_kg: t.capacityKg ?? 0,
              max_points: t.maxPoints ?? 0,
              coefficient: t.coefficient ?? 1.0,
              sort_order: t.sortOrder ?? (index + 1) * 10,
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: results.map(t => ({
        id: t.id,
        name: t.name,
        displayName: t.display_name || t.name,
        basePrice: t.base_price,
        capacityKg: t.capacity_kg,
        maxPoints: t.max_points,
        coefficient: Number(t.coefficient),
        sortOrder: t.sort_order,
      })),
    });
  } catch (error) {
    console.error('トラック種別更新エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'トラック種別の更新に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
