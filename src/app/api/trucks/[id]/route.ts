import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trucks/[id]
 * 特定のトラックを取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const truck = await prisma.trucks.findUnique({
      where: { id },
    });

    if (!truck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Truck not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: truck,
    });
  } catch (error) {
    console.error('[GET /api/trucks/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch truck',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trucks/[id]
 * トラック情報を更新
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // トラックの存在確認
    const existingTruck = await prisma.trucks.findUnique({
      where: { id },
    });

    if (!existingTruck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Truck not found',
        },
        { status: 404 }
      );
    }

    // ナンバープレートの重複チェック（自分以外）
    if (body.license_plate && body.license_plate !== existingTruck.license_plate) {
      const duplicateTruck = await prisma.trucks.findUnique({
        where: { license_plate: body.license_plate },
      });

      if (duplicateTruck) {
        return NextResponse.json(
          {
            success: false,
            error: 'License plate already exists',
          },
          { status: 409 }
        );
      }
    }

    // 業者内でのトラック番号の重複チェック（自分以外）
    if (body.truck_number && body.truck_number !== existingTruck.truck_number) {
      const duplicateTruckNumber = await prisma.trucks.findFirst({
        where: {
          company_id: existingTruck.company_id,
          truck_number: body.truck_number,
        },
      });

      if (duplicateTruckNumber) {
        return NextResponse.json(
          {
            success: false,
            error: 'Truck number already exists for this company',
          },
          { status: 409 }
        );
      }
    }

    // 更新データの準備
    const updateData: Record<string, unknown> = {};

    // 更新可能なフィールド
    const allowedFields = [
      'truck_number',
      'license_plate',
      'truck_type',
      'capacity_cbm',
      'max_load_kg',
      'has_lift_gate',
      'has_air_conditioning',
      'manufacture_year',
      'manufacturer',
      'model_name',
      'last_inspection_date',
      'next_inspection_date',
      'fuel_type',
      'fuel_efficiency_kmpl',
      'insurance_expiry_date',
      'status',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'last_inspection_date' || field === 'next_inspection_date' || field === 'insurance_expiry_date') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // トラック情報を更新
    const truck = await prisma.trucks.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: truck,
      message: 'Truck updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/trucks/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update truck',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trucks/[id]
 * トラックを削除（論理削除: status = 'retired'）
 * 注意: 物理削除は外部キー制約により制限される可能性があるため、
 * 通常はstatusを'retired'に設定することを推奨
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // トラックの存在確認
    const existingTruck = await prisma.trucks.findUnique({
      where: { id },
    });

    if (!existingTruck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Truck not found',
        },
        { status: 404 }
      );
    }

    // 物理削除を試行（外部キー制約により失敗する可能性がある）
    try {
      await prisma.trucks.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Truck deleted successfully',
      });
    } catch (deleteError) {
      // 物理削除が失敗した場合、論理削除（status = 'retired'）を実行
      await prisma.trucks.update({
        where: { id },
        data: {
          status: 'retired',
        },
      });

      console.warn('[DELETE /api/trucks/[id]] Physical delete failed, truck is retired:', deleteError);
      return NextResponse.json({
        success: true,
        message: 'Truck retired successfully (physical delete not possible due to foreign key constraints)',
      });
    }
  } catch (error) {
    console.error('[DELETE /api/trucks/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete truck',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

