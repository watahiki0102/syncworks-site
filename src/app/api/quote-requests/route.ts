import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/quote-requests
 * 見積もり依頼一覧を取得
 * クエリパラメータ:
 *   - status: 特定のステータスの依頼のみ取得
 *   - customer_email: 特定の顧客メールアドレスの依頼のみ取得
 *   - referrer_agent_id: 特定の紹介者の依頼のみ取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customer_email');
    const referrerAgentId = searchParams.get('referrer_agent_id');

    // フィルタ条件を構築
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (customerEmail) {
      where.customer_email = customerEmail;
    }

    if (referrerAgentId) {
      where.referrer_agent_id = referrerAgentId;
    }

    const quoteRequests = await prisma.quote_requests.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: quoteRequests,
      count: quoteRequests.length,
    });
  } catch (error) {
    console.error('[GET /api/quote-requests] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quote requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quote-requests
 * 新規見積もり依頼を作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    const requiredFields = [
      'customer_last_name',
      'customer_first_name',
      'customer_email',
      'customer_phone',
      'from_prefecture',
      'from_city',
      'from_address_line',
      'to_prefecture',
      'to_city',
      'to_address_line',
      'request_source',
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

    // 見積もり依頼を作成
    const quoteRequest = await prisma.quote_requests.create({
      data: {
        customer_last_name: body.customer_last_name,
        customer_first_name: body.customer_first_name,
        customer_last_name_kana: body.customer_last_name_kana || null,
        customer_first_name_kana: body.customer_first_name_kana || null,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        from_postal_code: body.from_postal_code || null,
        from_prefecture: body.from_prefecture,
        from_city: body.from_city,
        from_address_line: body.from_address_line,
        from_building_type: body.from_building_type || null,
        from_floor: body.from_floor || null,
        from_has_elevator: body.from_has_elevator || null,
        to_postal_code: body.to_postal_code || null,
        to_prefecture: body.to_prefecture,
        to_city: body.to_city,
        to_address_line: body.to_address_line,
        to_building_type: body.to_building_type || null,
        to_floor: body.to_floor || null,
        to_has_elevator: body.to_has_elevator || null,
        preferred_date_1: body.preferred_date_1 ? new Date(body.preferred_date_1) : null,
        preferred_time_slot_1: body.preferred_time_slot_1 || null,
        preferred_date_2: body.preferred_date_2 ? new Date(body.preferred_date_2) : null,
        preferred_time_slot_2: body.preferred_time_slot_2 || null,
        preferred_date_3: body.preferred_date_3 ? new Date(body.preferred_date_3) : null,
        preferred_time_slot_3: body.preferred_time_slot_3 || null,
        household_size: body.household_size || null,
        estimated_volume_cbm: body.estimated_volume_cbm || null,
        packing_required: body.packing_required || false,
        has_fragile_items: body.has_fragile_items || false,
        has_large_furniture: body.has_large_furniture || false,
        special_requirements: body.special_requirements || null,
        access_restrictions: body.access_restrictions || null,
        distance_km: body.distance_km || null,
        estimated_duration_hours: body.estimated_duration_hours || null,
        request_source: body.request_source,
        referrer_agent_id: body.referrer_agent_id || null,
        status: body.status || 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: quoteRequest,
      message: 'Quote request created successfully',
    });
  } catch (error) {
    console.error('[POST /api/quote-requests] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create quote request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

