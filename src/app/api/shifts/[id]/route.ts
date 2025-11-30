import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/shifts/[id]
 * 特定のシフトを取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shift = await prisma.shifts.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            last_name: true,
            first_name: true,
            employee_number: true,
            phone_number: true,
          },
        },
      },
    });

    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shift not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shift,
    });
  } catch (error) {
    console.error('[GET /api/shifts/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shift',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shifts/[id]
 * シフト情報を更新
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // シフトの存在確認
    const existingShift = await prisma.shifts.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shift not found',
        },
        { status: 404 }
      );
    }

    // 更新データの準備
    const updateData: Record<string, unknown> = {};

    if (body.shift_date !== undefined) {
      updateData.shift_date = parseDateString(body.shift_date);
    }
    if (body.shift_type !== undefined) {
      updateData.shift_type = body.shift_type;
    }
    if (body.start_time !== undefined) {
      updateData.start_time = parseTimeToDate(body.start_time);
    }
    if (body.end_time !== undefined) {
      updateData.end_time = parseTimeToDate(body.end_time);
    }
    if (body.break_minutes !== undefined) {
      updateData.break_minutes = body.break_minutes;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // シフト情報を更新
    const shift = await prisma.shifts.update({
      where: { id },
      data: updateData,
      include: {
        employees: {
          select: {
            id: true,
            last_name: true,
            first_name: true,
            employee_number: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: shift,
      message: 'Shift updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/shifts/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update shift',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shifts/[id]
 * シフトを削除
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // シフトの存在確認
    const existingShift = await prisma.shifts.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shift not found',
        },
        { status: 404 }
      );
    }

    // シフトを削除
    await prisma.shifts.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Shift deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/shifts/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete shift',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 時刻文字列（HH:MM形式）をDate型に変換
 */
function parseTimeToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
  return date;
}

/**
 * 日付文字列（YYYY-MM-DD形式）をDate型に変換
 * タイムゾーンの問題を回避するため、UTCの正午を使用
 * これにより、どのタイムゾーンでも同じ日付として解釈される
 */
function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // UTCの正午を使用することで、タイムゾーンの影響を最小化
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}
