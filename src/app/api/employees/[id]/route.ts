import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/employees/[id]
 * 特定の従業員を取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        moving_companies: {
          select: {
            id: true,
            company_name: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            display_name: true,
          },
        },
        shifts: {
          take: 10,
          orderBy: {
            shift_date: 'desc',
          },
        },
        job_assignments: {
          take: 10,
          orderBy: {
            assigned_at: 'desc',
          },
          include: {
            jobs: {
              select: {
                id: true,
                job_number: true,
                scheduled_date: true,
                status: true,
              },
            },
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('[GET /api/employees/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employee',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees/[id]
 * 従業員情報を更新
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('[PUT /api/employees] Received body:', JSON.stringify(body, null, 2));

    // 従業員の存在確認
    const existingEmployee = await prisma.employees.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        },
        { status: 404 }
      );
    }

    // 従業員番号の重複チェック（自分以外）
    if (body.employee_number && body.employee_number !== existingEmployee.employee_number) {
      const duplicateEmployee = await prisma.employees.findFirst({
        where: {
          company_id: existingEmployee.company_id,
          employee_number: body.employee_number,
          id: {
            not: id,
          },
        },
      });

      if (duplicateEmployee) {
        return NextResponse.json(
          {
            success: false,
            error: 'Employee number already exists for this company',
          },
          { status: 409 }
        );
      }
    }

    // 更新データの準備
    const updateData: Record<string, unknown> = {};

    // 更新可能なフィールド
    const allowedFields = [
      'user_id',
      'employee_number',
      'last_name',
      'first_name',
      'last_name_kana',
      'first_name_kana',
      'email',
      'role',
      'employment_type',
      'qualifications',
      'hire_date',
      'termination_date',
      'birth_date',
      'postal_code',
      'prefecture',
      'city',
      'address_line',
      'phone_number',
      'emergency_contact_name',
      'emergency_contact_phone',
      'hourly_rate',
      'max_work_hours_per_day',
      'max_work_days_per_month',
      'points_balance',
      'is_active',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'hire_date' || field === 'termination_date' || field === 'birth_date') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    console.log('[PUT /api/employees] Update data:', JSON.stringify(updateData, null, 2));

    // 従業員情報を更新
    const employee = await prisma.employees.update({
      where: { id },
      data: updateData,
      include: {
        moving_companies: {
          select: {
            id: true,
            company_name: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            display_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/employees/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update employee',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

