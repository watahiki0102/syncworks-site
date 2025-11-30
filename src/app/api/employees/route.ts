import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/employees
 * 従業員一覧を取得
 */
export async function GET() {
  try {
    const employees = await prisma.employees.findMany({
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
      where: {
        is_active: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    console.error('[GET /api/employees] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employees',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 * 新規従業員を作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    const requiredFields = [
      'company_id',
      'employee_number',
      'last_name',
      'first_name',
      'phone_number',
      'hire_date',
      'role',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // 従業員番号の重複チェック
    const existingEmployee = await prisma.employees.findFirst({
      where: {
        company_id: body.company_id,
        employee_number: body.employee_number,
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee number already exists for this company',
        },
        { status: 409 }
      );
    }

    // 従業員を作成
    const employee = await prisma.employees.create({
      data: {
        company_id: body.company_id,
        user_id: body.user_id || null,
        employee_number: body.employee_number,
        last_name: body.last_name,
        first_name: body.first_name,
        last_name_kana: body.last_name_kana || null,
        first_name_kana: body.first_name_kana || null,
        email: body.email || null,
        role: body.role,
        employment_type: body.employment_type || 'full_time',
        qualifications: body.qualifications || [],
        hire_date: new Date(body.hire_date),
        termination_date: body.termination_date ? new Date(body.termination_date) : null,
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        postal_code: body.postal_code || null,
        prefecture: body.prefecture || null,
        city: body.city || null,
        address_line: body.address_line || null,
        phone_number: body.phone_number,
        emergency_contact_name: body.emergency_contact_name || null,
        emergency_contact_phone: body.emergency_contact_phone || null,
        hourly_rate: body.hourly_rate || null,
        max_work_hours_per_day: body.max_work_hours_per_day || 8,
        max_work_days_per_month: body.max_work_days_per_month || 25,
        points_balance: body.points_balance || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      },
      include: {
        moving_companies: {
          select: {
            id: true,
            company_name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: employee,
        message: 'Employee created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/employees] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
