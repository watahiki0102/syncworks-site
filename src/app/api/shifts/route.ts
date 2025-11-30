import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/shifts
 * シフト一覧を取得
 * クエリパラメータ:
 *   - employee_id: 特定の従業員のシフトのみ取得
 *   - start_date: 開始日（YYYY-MM-DD形式）
 *   - end_date: 終了日（YYYY-MM-DD形式）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // フィルタ条件を構築
    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employee_id = employeeId;
    }

    if (startDate || endDate) {
      where.shift_date = {};
      if (startDate) {
        // タイムゾーンの問題を回避するため、parseDateStringを使用
        (where.shift_date as Record<string, Date>).gte = parseDateString(startDate);
      }
      if (endDate) {
        // タイムゾーンの問題を回避するため、parseDateStringを使用
        (where.shift_date as Record<string, Date>).lte = parseDateString(endDate);
      }
    }

    const shifts = await prisma.shifts.findMany({
      where,
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
      orderBy: [
        { shift_date: 'asc' },
        { start_time: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: shifts,
      count: shifts.length,
    });
  } catch (error) {
    console.error('[GET /api/shifts] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shifts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shifts
 * 新規シフトを作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    if (!body.employee_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: employee_id' },
        { status: 400 }
      );
    }
    if (!body.shift_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: shift_date' },
        { status: 400 }
      );
    }

    // 出勤不可ステータスの場合でも時刻は必須、デフォルト値を使用
    const startTime = body.start_time || '00:00';
    const endTime = body.end_time || '23:59';

    // 従業員の存在確認
    const employee = await prisma.employees.findUnique({
      where: { id: body.employee_id },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        },
        { status: 404 }
      );
    }

    // 日付をパース（タイムゾーン問題を回避）
    const shiftDate = parseDateString(body.shift_date);

    // 同日同時間帯のシフト重複チェック
    const existingShift = await prisma.shifts.findFirst({
      where: {
        employee_id: body.employee_id,
        shift_date: shiftDate,
      },
    });

    if (existingShift) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shift already exists for this employee on this date',
        },
        { status: 409 }
      );
    }

    // シフトを作成
    const shift = await prisma.shifts.create({
      data: {
        employee_id: body.employee_id,
        shift_date: shiftDate,
        shift_type: body.shift_type || 'regular',
        start_time: parseTimeToDate(startTime),
        end_time: parseTimeToDate(endTime),
        break_minutes: body.break_minutes ?? 60,
        status: body.status || 'scheduled',
        notes: body.notes || null,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: shift,
        message: 'Shift created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/shifts] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create shift',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 時刻文字列（HH:MM形式）をDate型に変換
 * PostgreSQLのTIME型は日付部分を無視するので、任意の日付を使用
 * UTCで作成することでタイムゾーンのずれを防ぐ
 */
function parseTimeToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  // UTCで時刻を設定
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
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
