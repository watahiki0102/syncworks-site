-- ========================================
-- テストデータ投入SQL
-- Supabase SQLエディタで実行してください
-- ========================================

-- ========================================
-- 既存のテストデータを削除（外部キー制約の順序に注意）
-- ========================================
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email IN ('syncworks.official@gmail.com', 'customer1@example.com'));
DELETE FROM reviews WHERE job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com')));
DELETE FROM job_assignments WHERE job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com')));
DELETE FROM jobs WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com'));
DELETE FROM quote_options WHERE quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com')));
DELETE FROM quotes WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com'));
DELETE FROM moving_items WHERE quote_request_id IN (SELECT id FROM quote_requests);
DELETE FROM quote_requests;
DELETE FROM shifts WHERE employee_id IN (SELECT id FROM employees WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com')));
DELETE FROM trucks WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com'));
DELETE FROM employees WHERE company_id IN (SELECT id FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com'));
DELETE FROM moving_companies WHERE owner_user_id IN (SELECT id FROM users WHERE email = 'syncworks.official@gmail.com');
DELETE FROM users WHERE email IN ('syncworks.official@gmail.com', 'customer1@example.com');

-- ========================================
-- 1. Users（ユーザー）
-- ========================================
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'syncworks.official@gmail.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'admin', 'システム管理者', '03-1234-5678', true),
('00000000-0000-0000-0000-000000000002', 'customer1@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'customer', '木村健太', '080-1111-1111', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  phone_number = EXCLUDED.phone_number,
  is_active = EXCLUDED.is_active;

-- ========================================
-- 2. Moving Companies（引越し業者）
-- ========================================
INSERT INTO moving_companies (id, owner_user_id, company_name, company_name_kana, postal_code, prefecture, city, address_line, phone_number, email, licenses, status, rating_average, total_reviews, total_jobs_completed) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'シンクワークス引越センター', 'シンクワークスヒッコシセンター', '150-0001', '東京都', '渋谷区', '神宮前1-1-1', '03-1234-5678', 'info@syncworks.jp', ARRAY['TOK-12345'], 'active', 4.5, 150, 500)
ON CONFLICT (id) DO NOTHING;

-- 3. Employees（従業員）
INSERT INTO employees (id, company_id, employee_number, last_name, first_name, last_name_kana, first_name_kana, role, employment_type, hire_date, phone_number, points_balance) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'EMP-001', '山田', '太郎', 'ヤマダ', 'タロウ', 'leader', 'full_time', '2022-04-01', '090-1234-5678', 150),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'EMP-002', '佐藤', '次郎', 'サトウ', 'ジロウ', 'worker', 'full_time', '2023-01-15', '090-2345-6789', 80),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'EMP-003', '鈴木', '三郎', 'スズキ', 'サブロウ', 'worker', 'part_time', '2023-06-01', '090-3456-7890', 45)
ON CONFLICT (id) DO NOTHING;

-- 4. Trucks（トラック）
INSERT INTO trucks (id, company_id, truck_number, license_plate, truck_type, capacity_cbm, max_load_kg, fuel_type, manufacturer, model_name, manufacture_year, next_inspection_date, insurance_expiry_date, status) VALUES
('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'TRK-001', '品川500あ1234', '2t', 15.0, 2000, 'diesel', 'いすゞ', 'エルフ', 2021, '2025-12-31', '2025-12-31', 'available'),
('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'TRK-002', '品川500あ5678', '4t', 28.0, 4000, 'diesel', 'いすゞ', 'フォワード', 2020, '2025-10-31', '2025-10-31', 'available')
ON CONFLICT (id) DO NOTHING;

-- 5. Shifts（シフト）
INSERT INTO shifts (id, employee_id, shift_date, shift_type, start_time, end_time, break_minutes, status) VALUES
('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, 'regular', '08:00:00', '17:00:00', 60, 'confirmed'),
('66666666-6666-6666-6666-666666666602', '33333333-3333-3333-3333-333333333302', CURRENT_DATE, 'regular', '08:00:00', '17:00:00', 60, 'confirmed'),
('66666666-6666-6666-6666-666666666603', '33333333-3333-3333-3333-333333333301', CURRENT_DATE + INTERVAL '1 day', 'regular', '08:00:00', '17:00:00', 60, 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- 6. Quote Requests（見積もり依頼）
INSERT INTO quote_requests (
  id, customer_last_name, customer_first_name, customer_last_name_kana, customer_first_name_kana,
  customer_email, customer_phone,
  from_postal_code, from_prefecture, from_city, from_address_line, from_building_type, from_floor, from_has_elevator,
  to_postal_code, to_prefecture, to_city, to_address_line, to_building_type, to_floor, to_has_elevator,
  preferred_date_1, preferred_time_slot_1, preferred_date_2, preferred_time_slot_2,
  household_size, estimated_volume_cbm, packing_required, has_fragile_items, has_large_furniture,
  distance_km, estimated_duration_hours, request_source, status
) VALUES
(
  '77777777-7777-7777-7777-777777777701', '田中', '花子', 'タナカ', 'ハナコ',
  'hanako.tanaka@example.com', '080-1111-2222',
  '150-0001', '東京都', '渋谷区', '神宮前2-2-2 マンションA 301号室', 'apartment', 3, true,
  '160-0023', '東京都', '新宿区', '西新宿1-1-1 タワーマンション 1505号室', 'mansion', 15, true,
  '2025-02-15', 'morning', '2025-02-16', 'morning',
  'couple', 12.0, true, true, false,
  8.5, 6, 'web', 'answered'
),
(
  '77777777-7777-7777-7777-777777777702', '伊藤', '一郎', 'イトウ', 'イチロウ',
  'ichiro.ito@example.com', '090-3333-4444',
  '154-0024', '東京都', '世田谷区', '三軒茶屋1-1-1 アパート 201号室', 'apartment', 2, false,
  '221-0056', '神奈川県', '横浜市', '戸塚区2-2-2', 'house', NULL, NULL,
  '2025-03-01', 'afternoon', NULL, NULL,
  'single', 8.0, false, false, true,
  25.0, 5, 'web', 'pending'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Moving Items（荷物明細）
-- まず、item_mastersからIDを取得する必要があるため、サブクエリを使用
INSERT INTO moving_items (id, quote_request_id, item_master_id, quantity, points_per_unit, requires_disassembly) VALUES
('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701', (SELECT id FROM item_masters WHERE name = 'シングルベッド'), 2, 30, true),
('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777701', (SELECT id FROM item_masters WHERE name = 'ソファ（2人掛け）'), 1, 35, false),
('88888888-8888-8888-8888-888888888803', '77777777-7777-7777-7777-777777777701', (SELECT id FROM item_masters WHERE name = 'ダイニングテーブル'), 1, 40, false),
('88888888-8888-8888-8888-888888888804', '77777777-7777-7777-7777-777777777701', (SELECT id FROM item_masters WHERE name = '冷蔵庫（小）'), 1, 40, false),
('88888888-8888-8888-8888-888888888805', '77777777-7777-7777-7777-777777777701', (SELECT id FROM item_masters WHERE name = 'ダンボール（中）'), 15, 8, false)
ON CONFLICT (id) DO NOTHING;

-- 8. Quotes（見積もり）
INSERT INTO quotes (
  id, quote_request_id, company_id, quote_number,
  total_points, base_price, distance_price, option_price, season_adjustment_price, tax_amount, total_price,
  valid_until, proposed_date, proposed_time_slot, estimated_duration_hours,
  assigned_truck_ids, assigned_employee_ids,
  status, sent_at, viewed_at, responded_at
) VALUES
(
  '99999999-9999-9999-9999-999999999901', '77777777-7777-7777-7777-777777777701', '11111111-1111-1111-1111-111111111111', 'Q2025-0001',
  305, 30500, 1275, 10000, 0, 4178, 45953,
  '2025-02-28', '2025-02-15', 'morning', 6,
  ARRAY['55555555-5555-5555-5555-555555555501'::uuid],
  ARRAY['33333333-3333-3333-3333-333333333301'::uuid, '33333333-3333-3333-3333-333333333302'::uuid],
  'accepted', '2025-01-20 10:00:00+00', '2025-01-20 14:30:00+00', '2025-01-21 09:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Quote Options（見積もりオプション）
INSERT INTO quote_options (id, quote_id, option_id, quantity, unit_price) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999901', (SELECT id FROM options WHERE name = '標準梱包'), 1, 10000)
ON CONFLICT (id) DO NOTHING;

-- 10. Jobs（案件）
INSERT INTO jobs (
  id, quote_id, company_id, job_number,
  customer_last_name, customer_first_name, customer_phone, customer_email,
  from_address, to_address,
  scheduled_date, scheduled_time_slot, assigned_truck_ids,
  total_price, payment_method, payment_status, paid_amount, paid_at,
  status, special_instructions
) VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', 'J2025-0001',
  '田中', '花子', '080-1111-2222', 'hanako.tanaka@example.com',
  '東京都渋谷区神宮前2-2-2 マンションA 301号室', '東京都新宿区西新宿1-1-1 タワーマンション 1505号室',
  '2025-02-15', 'morning', ARRAY['55555555-5555-5555-5555-555555555501'::uuid],
  45953, 'card', 'paid', 45953, '2025-01-21 10:00:00+00',
  'scheduled', '割れ物注意。食器が多めです。'
)
ON CONFLICT (id) DO NOTHING;

-- 11. Job Assignments（作業割当）
INSERT INTO job_assignments (
  id, job_id, employee_id, role, assigned_at, confirmed_at, status
) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333301', 'leader', '2025-01-21 11:00:00+00', '2025-01-21 12:00:00+00', 'confirmed'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333302', 'worker', '2025-01-21 11:00:00+00', '2025-01-21 13:00:00+00', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- 12. Reviews（レビュー）
INSERT INTO reviews (
  id, job_id, reviewer_name, reviewer_email,
  overall_rating, punctuality_rating, service_quality_rating, professionalism_rating, value_rating,
  comment, would_recommend, is_verified, is_visible
) VALUES
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '田中花子', 'hanako.tanaka@example.com',
  5, 5, 5, 5, 4,
  '非常に丁寧な作業で、安心してお任せできました。また利用したいです。', true, true, true
)
ON CONFLICT (id) DO NOTHING;

-- 13. Notifications（通知）
INSERT INTO notifications (
  id, user_id, notification_type, title, message,
  related_entity_type, related_entity_id, action_url,
  is_read, read_at, priority
) VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000001', 'quote_request', '新しい見積もり依頼', '田中花子様から見積もり依頼が届きました。',
  'quote_request', '77777777-7777-7777-7777-777777777701', '/admin/quotes/77777777-7777-7777-7777-777777777701',
  true, '2025-01-20 09:00:00+00', 'high'
),
(
  'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', '00000000-0000-0000-0000-000000000001', 'quote_accepted', '見積もりが承認されました', '田中花子様が見積もり Q2025-0001 を承認しました。',
  'quote', '99999999-9999-9999-9999-999999999901', '/admin/jobs/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  false, NULL, 'high'
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- データ確認クエリ
-- ========================================

-- 各テーブルのレコード数確認
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'moving_companies', COUNT(*) FROM moving_companies
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'trucks', COUNT(*) FROM trucks
UNION ALL
SELECT 'shifts', COUNT(*) FROM shifts
UNION ALL
SELECT 'quote_requests', COUNT(*) FROM quote_requests
UNION ALL
SELECT 'moving_items', COUNT(*) FROM moving_items
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'quote_options', COUNT(*) FROM quote_options
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'job_assignments', COUNT(*) FROM job_assignments
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;
