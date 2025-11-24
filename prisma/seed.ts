/**
 * ========================================
 * Prisma Seed Script
 * Description: TypeScriptベースのシードデータ投入
 * Created: 2025-01-24
 * ========================================
 *
 * 実行方法:
 *   npx prisma db seed
 *
 * または:
 *   npm run seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Item Masters（荷物品目マスタ）
  console.log('📦 Creating item masters...');

  const itemMasters = [
    // 家具
    { category: '家具', name: 'シングルベッド', default_points: 30, typical_quantity_per_household: 1, requires_disassembly: true },
    { category: '家具', name: 'ダブルベッド', default_points: 50, typical_quantity_per_household: 1, requires_disassembly: true },
    { category: '家具', name: 'ソファ（2人掛け）', default_points: 35, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家具', name: 'ソファ（3人掛け）', default_points: 50, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家具', name: 'ダイニングテーブル', default_points: 40, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家具', name: '椅子', default_points: 5, typical_quantity_per_household: 4, requires_disassembly: false },
    { category: '家具', name: '本棚', default_points: 25, typical_quantity_per_household: 2, requires_disassembly: false },
    { category: '家具', name: 'タンス', default_points: 40, typical_quantity_per_household: 1, requires_disassembly: false },

    // 家電
    { category: '家電', name: '冷蔵庫（小）', default_points: 40, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: '冷蔵庫（大）', default_points: 60, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: '洗濯機', default_points: 35, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: 'ドラム式洗濯機', default_points: 50, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: 'テレビ（小）', default_points: 15, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: 'テレビ（大）', default_points: 30, typical_quantity_per_household: 1, requires_disassembly: false },
    { category: '家電', name: 'エアコン', default_points: 40, typical_quantity_per_household: 2, requires_disassembly: true },

    // ダンボール
    { category: 'ダンボール', name: 'ダンボール（小）', default_points: 5, typical_quantity_per_household: 10, requires_disassembly: false },
    { category: 'ダンボール', name: 'ダンボール（中）', default_points: 8, typical_quantity_per_household: 15, requires_disassembly: false },
    { category: 'ダンボール', name: 'ダンボール（大）', default_points: 10, typical_quantity_per_household: 10, requires_disassembly: false },

    // その他
    { category: 'その他', name: '自転車', default_points: 20, typical_quantity_per_household: 2, requires_disassembly: false },
    { category: 'その他', name: '布団セット', default_points: 10, typical_quantity_per_household: 3, requires_disassembly: false },
  ];

  for (const item of itemMasters) {
    await prisma.item_masters.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }

  console.log(`✅ Created ${itemMasters.length} item masters`);

  // 2. Pricing Rules（料金ルール）
  console.log('💰 Creating pricing rules...');

  await prisma.pricing_rules.upsert({
    where: { id: '22222222-2222-2222-2222-222222222201' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222201',
      rule_type: 'base_rate',
      description: '基本料金（1ポイント＝100円）',
      base_price: 0,
      point_unit_price: 100,
      effective_from: new Date('2025-01-01'),
      is_active: true,
      priority: 100,
    },
  });

  await prisma.pricing_rules.upsert({
    where: { id: '22222222-2222-2222-2222-222222222203' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222203',
      rule_type: 'distance',
      description: '距離料金（10-30km）',
      distance_rate_per_km: 150,
      min_charge: 5000,
      effective_from: new Date('2025-01-01'),
      is_active: true,
      priority: 90,
    },
  });

  console.log('✅ Created pricing rules');

  // 3. Options（オプションサービス）
  console.log('🎁 Creating options...');

  const options = [
    {
      name: '標準梱包',
      category: 'packing',
      description: '基本的な梱包資材の提供と梱包作業',
      base_price: 10000,
      is_percentage: false,
      requires_approval: false,
      estimated_time_minutes: 120,
      max_quantity: 1,
      display_order: 10,
    },
    {
      name: 'おまかせパック',
      category: 'packing',
      description: '全荷物の梱包・開梱を完全代行',
      base_price: 50000,
      is_percentage: false,
      requires_approval: false,
      estimated_time_minutes: 300,
      max_quantity: 1,
      display_order: 20,
    },
    {
      name: 'エアコン取外し',
      category: 'appliance',
      description: 'エアコン1台の取外し作業',
      base_price: 8000,
      is_percentage: false,
      requires_approval: true,
      estimated_time_minutes: 60,
      max_quantity: 5,
      display_order: 60,
    },
    {
      name: 'エアコン取付',
      category: 'appliance',
      description: 'エアコン1台の取付作業（標準工事）',
      base_price: 15000,
      is_percentage: false,
      requires_approval: true,
      estimated_time_minutes: 90,
      max_quantity: 5,
      display_order: 70,
    },
    {
      name: '不用品回収（中）',
      category: 'disposal',
      description: '中型家具・家電の回収',
      base_price: 8000,
      is_percentage: false,
      requires_approval: true,
      estimated_time_minutes: 30,
      max_quantity: 10,
      display_order: 160,
    },
  ];

  for (const option of options) {
    await prisma.options.upsert({
      where: { name: option.name },
      update: {},
      create: option,
    });
  }

  console.log(`✅ Created ${options.length} options`);

  // 4. Season Rules（繁忙期ルール）
  console.log('📅 Creating season rules...');

  await prisma.season_rules.upsert({
    where: { id: '44444444-4444-4444-4444-444444444401' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444401',
      name: '超繁忙期（3月下旬〜4月上旬）',
      season_type: 'peak_high',
      start_date: new Date('2025-03-20'),
      end_date: new Date('2025-04-10'),
      rate_multiplier: 1.5,
      applies_to_weekdays: true,
      applies_to_weekends: true,
      is_active: true,
      priority: 100,
    },
  });

  await prisma.season_rules.upsert({
    where: { id: '44444444-4444-4444-4444-444444444411' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444411',
      name: '閑散期割引（1月）',
      season_type: 'off_season',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-31'),
      rate_multiplier: 0.9,
      applies_to_weekdays: true,
      applies_to_weekends: true,
      min_discount_amount: 3000,
      max_discount_amount: 20000,
      is_active: true,
      priority: 70,
    },
  });

  console.log('✅ Created season rules');

  // 5. Test Users（開発環境用）
  if (process.env.NODE_ENV !== 'production') {
    console.log('👤 Creating test users...');

    await prisma.users.upsert({
      where: { email: 'syncworks.official@gmail.com' },
      update: {},
      create: {
        email: 'syncworks.official@gmail.com',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        role: 'admin',
        display_name: 'システム管理者',
        phone_number: '03-1234-5678',
        is_active: true,
      },
    });

    await prisma.users.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        email: 'customer1@example.com',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        role: 'customer',
        display_name: '木村健太',
        phone_number: '080-1111-1111',
        is_active: true,
      },
    });

    console.log('✅ Created test users');

    // 6. Moving Companies（引越し業者）
    console.log('🚚 Creating moving companies...');

    const company1 = await prisma.moving_companies.upsert({
      where: { id: '11111111-1111-1111-1111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-1111-1111-111111111111',
        owner_user_id: (await prisma.users.findUnique({ where: { email: 'syncworks.official@gmail.com' } }))!.id,
        company_name: 'シンクワークス引越センター',
        company_name_kana: 'シンクワークスヒッコシセンター',
        postal_code: '150-0001',
        prefecture: '東京都',
        city: '渋谷区',
        address_line: '神宮前1-1-1',
        phone_number: '03-1234-5678',
        email: 'info@syncworks.jp',
        licenses: ['TOK-12345'],
        status: 'active',
        rating_average: 4.5,
        total_reviews: 150,
        total_jobs_completed: 500,
      },
    });

    console.log('✅ Created 1 moving company');

    // 7. Employees（従業員）
    console.log('👷 Creating employees...');

    const employees = [
      {
        id: '33333333-3333-3333-3333-333333333301',
        company_id: company1.id,
        employee_number: 'EMP-001',
        last_name: '山田',
        first_name: '太郎',
        last_name_kana: 'ヤマダ',
        first_name_kana: 'タロウ',
        hire_date: new Date('2022-04-01'),
        employment_type: 'full_time',
        role: 'leader',
        phone_number: '090-1234-5678',
        email: 'yamada@syncworks.jp',
        points_balance: 150,
        is_active: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333302',
        company_id: company1.id,
        employee_number: 'EMP-002',
        last_name: '佐藤',
        first_name: '次郎',
        last_name_kana: 'サトウ',
        first_name_kana: 'ジロウ',
        hire_date: new Date('2023-01-15'),
        employment_type: 'full_time',
        role: 'worker',
        phone_number: '090-2345-6789',
        email: 'sato@syncworks.jp',
        points_balance: 80,
        is_active: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333303',
        company_id: company1.id,
        employee_number: 'EMP-003',
        last_name: '鈴木',
        first_name: '三郎',
        last_name_kana: 'スズキ',
        first_name_kana: 'サブロウ',
        hire_date: new Date('2023-06-01'),
        employment_type: 'part_time',
        role: 'worker',
        phone_number: '090-3456-7890',
        points_balance: 45,
        is_active: true,
      },
    ];

    for (const emp of employees) {
      await prisma.employees.upsert({
        where: { id: emp.id },
        update: {},
        create: emp,
      });
    }

    console.log(`✅ Created ${employees.length} employees`);

    // 8. Trucks（トラック）
    console.log('🚛 Creating trucks...');

    const trucks = [
      {
        id: '55555555-5555-5555-5555-555555555501',
        company_id: company1.id,
        truck_number: 'TRK-001',
        license_plate: '品川500あ1234',
        truck_type: '2ton',
        capacity_cbm: 15.0,
        max_load_kg: 2000,
        fuel_type: 'diesel',
        manufacturer: 'いすゞ',
        model_name: 'エルフ',
        manufacture_year: 2021,
        next_inspection_date: new Date('2025-12-31'),
        insurance_expiry_date: new Date('2025-12-31'),
        status: 'available',
      },
      {
        id: '55555555-5555-5555-5555-555555555502',
        company_id: company1.id,
        truck_number: 'TRK-002',
        license_plate: '品川500あ5678',
        truck_type: '4ton',
        capacity_cbm: 28.0,
        max_load_kg: 4000,
        fuel_type: 'diesel',
        manufacturer: 'いすゞ',
        model_name: 'フォワード',
        manufacture_year: 2020,
        next_inspection_date: new Date('2025-10-31'),
        insurance_expiry_date: new Date('2025-10-31'),
        status: 'available',
      },
    ];

    for (const truck of trucks) {
      await prisma.trucks.upsert({
        where: { id: truck.id },
        update: {},
        create: truck,
      });
    }

    console.log(`✅ Created ${trucks.length} trucks`);

    // 9. Shifts（シフト）
    console.log('📅 Creating shifts...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const shifts = [
      {
        id: '66666666-6666-6666-6666-666666666601',
        employee_id: employees[0].id,
        shift_date: today,
        shift_type: 'full_day',
        start_time: '08:00:00',
        end_time: '17:00:00',
        break_minutes: 60,
        status: 'confirmed',
      },
      {
        id: '66666666-6666-6666-6666-666666666602',
        employee_id: employees[1].id,
        shift_date: today,
        shift_type: 'full_day',
        start_time: '08:00:00',
        end_time: '17:00:00',
        break_minutes: 60,
        status: 'confirmed',
      },
      {
        id: '66666666-6666-6666-6666-666666666603',
        employee_id: employees[0].id,
        shift_date: tomorrow,
        shift_type: 'full_day',
        start_time: '08:00:00',
        end_time: '17:00:00',
        break_minutes: 60,
        status: 'confirmed',
      },
    ];

    for (const shift of shifts) {
      await prisma.shifts.upsert({
        where: { id: shift.id },
        update: {},
        create: shift,
      });
    }

    console.log(`✅ Created ${shifts.length} shifts`);

    // 10. Quote Requests（見積もり依頼）
    console.log('📝 Creating quote requests...');

    const quoteRequest1 = await prisma.quote_requests.upsert({
      where: { id: '77777777-7777-7777-7777-777777777701' },
      update: {},
      create: {
        id: '77777777-7777-7777-7777-777777777701',
        customer_last_name: '田中',
        customer_first_name: '花子',
        customer_last_name_kana: 'タナカ',
        customer_first_name_kana: 'ハナコ',
        customer_email: 'hanako.tanaka@example.com',
        customer_phone: '080-1111-2222',
        from_postal_code: '150-0001',
        from_prefecture: '東京都',
        from_city: '渋谷区',
        from_address_line: '神宮前2-2-2 マンションA 301号室',
        from_building_type: 'apartment',
        from_floor: 3,
        from_has_elevator: true,
        to_postal_code: '160-0023',
        to_prefecture: '東京都',
        to_city: '新宿区',
        to_address_line: '西新宿1-1-1 タワーマンション 1505号室',
        to_building_type: 'mansion',
        to_floor: 15,
        to_has_elevator: true,
        preferred_date_1: new Date('2025-02-15'),
        preferred_time_slot_1: 'morning',
        preferred_date_2: new Date('2025-02-16'),
        preferred_time_slot_2: 'morning',
        household_size: 'couple',
        estimated_volume_cbm: 12.0,
        packing_required: true,
        has_fragile_items: true,
        has_large_furniture: false,
        distance_km: 8.5,
        estimated_duration_hours: 6,
        request_source: 'web',
        status: 'answered',
      },
    });

    const quoteRequest2 = await prisma.quote_requests.upsert({
      where: { id: '77777777-7777-7777-7777-777777777702' },
      update: {},
      create: {
        id: '77777777-7777-7777-7777-777777777702',
        customer_last_name: '伊藤',
        customer_first_name: '一郎',
        customer_last_name_kana: 'イトウ',
        customer_first_name_kana: 'イチロウ',
        customer_email: 'ichiro.ito@example.com',
        customer_phone: '090-3333-4444',
        from_postal_code: '154-0024',
        from_prefecture: '東京都',
        from_city: '世田谷区',
        from_address_line: '三軒茶屋1-1-1 アパート 201号室',
        from_building_type: 'apartment',
        from_floor: 2,
        from_has_elevator: false,
        to_postal_code: '221-0056',
        to_prefecture: '神奈川県',
        to_city: '横浜市',
        to_address_line: '戸塚区2-2-2',
        to_building_type: 'house',
        to_floor: null,
        to_has_elevator: null,
        preferred_date_1: new Date('2025-03-01'),
        preferred_time_slot_1: 'afternoon',
        household_size: 'single',
        estimated_volume_cbm: 8.0,
        packing_required: false,
        has_fragile_items: false,
        has_large_furniture: true,
        distance_km: 25.0,
        estimated_duration_hours: 5,
        request_source: 'web',
        status: 'pending',
      },
    });

    console.log('✅ Created 2 quote requests');

    // 11. Moving Items（荷物明細）
    console.log('📦 Creating moving items...');

    const bedId = (await prisma.item_masters.findUnique({ where: { name: 'シングルベッド' } }))!.id;
    const sofaId = (await prisma.item_masters.findUnique({ where: { name: 'ソファ（2人掛け）' } }))!.id;
    const tableId = (await prisma.item_masters.findUnique({ where: { name: 'ダイニングテーブル' } }))!.id;
    const fridgeId = (await prisma.item_masters.findUnique({ where: { name: '冷蔵庫（小）' } }))!.id;
    const boxMId = (await prisma.item_masters.findUnique({ where: { name: 'ダンボール（中）' } }))!.id;

    const movingItems = [
      {
        id: '88888888-8888-8888-8888-888888888801',
        quote_request_id: quoteRequest1.id,
        item_master_id: bedId,
        quantity: 2,
        points_per_unit: 30,
        requires_disassembly: true,
      },
      {
        id: '88888888-8888-8888-8888-888888888802',
        quote_request_id: quoteRequest1.id,
        item_master_id: sofaId,
        quantity: 1,
        points_per_unit: 35,
        requires_disassembly: false,
      },
      {
        id: '88888888-8888-8888-8888-888888888803',
        quote_request_id: quoteRequest1.id,
        item_master_id: tableId,
        quantity: 1,
        points_per_unit: 40,
        requires_disassembly: false,
      },
      {
        id: '88888888-8888-8888-8888-888888888804',
        quote_request_id: quoteRequest1.id,
        item_master_id: fridgeId,
        quantity: 1,
        points_per_unit: 40,
        requires_disassembly: false,
      },
      {
        id: '88888888-8888-8888-8888-888888888805',
        quote_request_id: quoteRequest1.id,
        item_master_id: boxMId,
        quantity: 15,
        points_per_unit: 8,
        requires_disassembly: false,
      },
    ];

    for (const item of movingItems) {
      await prisma.moving_items.upsert({
        where: { id: item.id },
        update: {},
        create: item,
      });
    }

    console.log(`✅ Created ${movingItems.length} moving items`);

    // 12. Quotes（見積もり）
    console.log('💰 Creating quotes...');

    const quote1 = await prisma.quotes.upsert({
      where: { id: '99999999-9999-9999-9999-999999999901' },
      update: {},
      create: {
        id: '99999999-9999-9999-9999-999999999901',
        quote_request_id: quoteRequest1.id,
        company_id: company1.id,
        quote_number: 'Q2025-0001',
        total_points: 305, // (30*2) + 35 + 40 + 40 + (8*15)
        base_price: 30500, // 305 * 100
        distance_price: 1275, // 8.5km * 150
        option_price: 10000, // 標準梱包
        season_adjustment_price: 0,
        tax_amount: 4178, // (30500 + 1275 + 10000) * 0.1
        total_price: 45953,
        valid_until: new Date('2025-02-28'),
        proposed_date: new Date('2025-02-15'),
        proposed_time_slot: 'morning',
        estimated_duration_hours: 6,
        assigned_truck_ids: [trucks[0].id],
        assigned_employee_ids: [employees[0].id, employees[1].id],
        status: 'accepted',
        sent_at: new Date('2025-01-20T10:00:00Z'),
        viewed_at: new Date('2025-01-20T14:30:00Z'),
        responded_at: new Date('2025-01-21T09:00:00Z'),
      },
    });

    console.log('✅ Created 1 quote');

    // 13. Quote Options（見積もりオプション）
    console.log('🎁 Creating quote options...');

    const packingOptionId = (await prisma.options.findUnique({ where: { name: '標準梱包' } }))!.id;

    await prisma.quote_options.upsert({
      where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      update: {},
      create: {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        quote_id: quote1.id,
        option_id: packingOptionId,
        quantity: 1,
        unit_price: 10000,
      },
    });

    console.log('✅ Created 1 quote option');

    // 14. Jobs（案件）
    console.log('📋 Creating jobs...');

    const job1 = await prisma.jobs.upsert({
      where: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
      update: {},
      create: {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        quote_id: quote1.id,
        company_id: company1.id,
        job_number: 'J2025-0001',
        customer_last_name: '田中',
        customer_first_name: '花子',
        customer_phone: '080-1111-2222',
        customer_email: 'hanako.tanaka@example.com',
        from_address: '東京都渋谷区神宮前2-2-2 マンションA 301号室',
        to_address: '東京都新宿区西新宿1-1-1 タワーマンション 1505号室',
        scheduled_date: new Date('2025-02-15'),
        scheduled_time_slot: 'morning',
        assigned_truck_ids: [trucks[0].id],
        total_price: 45953,
        payment_method: 'credit_card',
        payment_status: 'paid',
        paid_amount: 45953,
        paid_at: new Date('2025-01-21T10:00:00Z'),
        status: 'scheduled',
        special_instructions: '割れ物注意。食器が多めです。',
      },
    });

    console.log('✅ Created 1 job');

    // 15. Job Assignments（作業割当）
    console.log('👥 Creating job assignments...');

    const jobAssignments = [
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        job_id: job1.id,
        employee_id: employees[0].id,
        role: 'leader',
        assigned_at: new Date('2025-01-21T11:00:00Z'),
        confirmed_at: new Date('2025-01-21T12:00:00Z'),
        status: 'confirmed',
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        job_id: job1.id,
        employee_id: employees[1].id,
        role: 'worker',
        assigned_at: new Date('2025-01-21T11:00:00Z'),
        confirmed_at: new Date('2025-01-21T13:00:00Z'),
        status: 'confirmed',
      },
    ];

    for (const assignment of jobAssignments) {
      await prisma.job_assignments.upsert({
        where: { id: assignment.id },
        update: {},
        create: assignment,
      });
    }

    console.log(`✅ Created ${jobAssignments.length} job assignments`);

    // 16. Reviews（レビュー）
    console.log('⭐ Creating reviews...');

    await prisma.reviews.upsert({
      where: { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' },
      update: {},
      create: {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        job_id: job1.id,
        reviewer_name: '田中花子',
        reviewer_email: 'hanako.tanaka@example.com',
        overall_rating: 5,
        punctuality_rating: 5,
        service_quality_rating: 5,
        professionalism_rating: 5,
        value_rating: 4,
        comment: '非常に丁寧な作業で、安心してお任せできました。また利用したいです。',
        would_recommend: true,
        is_verified: true,
        is_visible: true,
      },
    });

    console.log('✅ Created 1 review');

    // 17. Notifications（通知）
    console.log('🔔 Creating notifications...');

    const adminUser = await prisma.users.findUnique({ where: { email: 'syncworks.official@gmail.com' } });

    const notifications = [
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        user_id: adminUser!.id,
        notification_type: 'quote_request',
        title: '新しい見積もり依頼',
        message: '田中花子様から見積もり依頼が届きました。',
        related_entity_type: 'quote_request',
        related_entity_id: quoteRequest1.id,
        action_url: `/admin/quotes/${quoteRequest1.id}`,
        is_read: true,
        read_at: new Date('2025-01-20T09:00:00Z'),
        priority: 'high',
      },
      {
        id: 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0',
        user_id: adminUser!.id,
        notification_type: 'quote_accepted',
        title: '見積もりが承認されました',
        message: '田中花子様が見積もり Q2025-0001 を承認しました。',
        related_entity_type: 'quote',
        related_entity_id: quote1.id,
        action_url: `/admin/jobs/${job1.id}`,
        is_read: false,
        priority: 'high',
      },
    ];

    for (const notification of notifications) {
      await prisma.notifications.upsert({
        where: { id: notification.id },
        update: {},
        create: notification,
      });
    }

    console.log(`✅ Created ${notifications.length} notifications`);
  }

  console.log('');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
