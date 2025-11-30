import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trucks
 * トラック一覧を取得
 * クエリパラメータ:
 *   - company_id: 特定の業者のトラックのみ取得
 *   - status: 特定のステータスのトラックのみ取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const status = searchParams.get('status');

    // フィルタ条件を構築
    const where: Record<string, unknown> = {};

    if (companyId) {
      where.company_id = companyId;
    }

    if (status) {
      where.status = status;
    }

    const trucks = await prisma.trucks.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: trucks,
      count: trucks.length,
    });
  } catch (error) {
    console.error('[GET /api/trucks] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trucks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trucks
 * 新規トラックを作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    const requiredFields = [
      'company_id',
      'truck_number',
      'license_plate',
      'truck_type',
      'capacity_cbm',
      'max_load_kg',
      'next_inspection_date',
      'insurance_expiry_date',
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

    // ナンバープレートの重複チェック
    const existingTruck = await prisma.trucks.findUnique({
      where: { license_plate: body.license_plate },
    });

    if (existingTruck) {
      return NextResponse.json(
        {
          success: false,
          error: 'License plate already exists',
        },
        { status: 409 }
      );
    }

    // 業者内でのトラック番号の重複チェック
    const existingTruckNumber = await prisma.trucks.findFirst({
      where: {
        company_id: body.company_id,
        truck_number: body.truck_number,
      },
    });

    if (existingTruckNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Truck number already exists for this company',
        },
        { status: 409 }
      );
    }

    // トラックを作成
    const truck = await prisma.trucks.create({
      data: {
        company_id: body.company_id,
        truck_number: body.truck_number,
        license_plate: body.license_plate,
        truck_type: body.truck_type,
        capacity_cbm: body.capacity_cbm,
        max_load_kg: body.max_load_kg,
        has_lift_gate: body.has_lift_gate || false,
        has_air_conditioning: body.has_air_conditioning || false,
        manufacture_year: body.manufacture_year || null,
        manufacturer: body.manufacturer || null,
        model_name: body.model_name || null,
        last_inspection_date: body.last_inspection_date ? new Date(body.last_inspection_date) : null,
        next_inspection_date: new Date(body.next_inspection_date),
        fuel_type: body.fuel_type || null,
        fuel_efficiency_kmpl: body.fuel_efficiency_kmpl || null,
        insurance_expiry_date: new Date(body.insurance_expiry_date),
        status: body.status || 'available',
      },
    });

    return NextResponse.json({
      success: true,
      data: truck,
      message: 'Truck created successfully',
    });
  } catch (error) {
    console.error('[POST /api/trucks] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create truck',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

