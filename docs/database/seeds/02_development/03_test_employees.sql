-- ========================================
-- Seed: Test Employees (テストデータ)
-- Description: テスト従業員
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- 東京エクスプレス引越センターの従業員
INSERT INTO employees (
  id, company_id, user_id,
  employee_number, last_name, first_name, last_name_kana, first_name_kana,
  role, employment_type, qualifications,
  hire_date, birth_date,
  postal_code, prefecture, city, address_line,
  phone_number, emergency_contact_name, emergency_contact_phone,
  hourly_rate, max_work_hours_per_day, max_work_days_per_month,
  points_balance, is_active
) VALUES
-- リーダー: 山田一郎
(
  '77777777-7777-7777-7777-777777777701',
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555504',
  'TE-001', '山田', '一郎', 'ヤマダ', 'イチロウ',
  'leader', 'full_time',
  ARRAY['大型免許', 'フォークリフト', '引越管理士'],
  '2020-04-01', '1985-05-15',
  '154-0001', '東京都', '世田谷区', '池尻1-1-1',
  '090-3333-3333', '山田花子', '090-3333-3334',
  2000, 10, 25,
  100, true
),
-- ドライバー: 鈴木二郎
(
  '77777777-7777-7777-7777-777777777702',
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555505',
  'TE-002', '鈴木', '二郎', 'スズキ', 'ジロウ',
  'driver', 'full_time',
  ARRAY['中型免許', 'フォークリフト'],
  '2021-06-01', '1990-08-20',
  '155-0001', '東京都', '世田谷区', '三軒茶屋2-2-2',
  '090-4444-4444', '鈴木美咲', '090-4444-4445',
  1800, 10, 25,
  80, true
);

-- 横浜スピード引越サービスの従業員
INSERT INTO employees (
  id, company_id, user_id,
  employee_number, last_name, first_name, last_name_kana, first_name_kana,
  role, employment_type, qualifications,
  hire_date, birth_date,
  postal_code, prefecture, city, address_line,
  phone_number, emergency_contact_name, emergency_contact_phone,
  hourly_rate, max_work_hours_per_day, max_work_days_per_month,
  points_balance, is_active
) VALUES
-- リーダー: 高橋三郎
(
  '77777777-7777-7777-7777-777777777703',
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555506',
  'YS-001', '高橋', '三郎', 'タカハシ', 'サブロウ',
  'leader', 'full_time',
  ARRAY['大型免許', '引越管理士'],
  '2019-04-01', '1983-03-10',
  '221-0001', '神奈川県', '横浜市神奈川区', '金港町3-3-3',
  '090-5555-5555', '高橋由美', '090-5555-5556',
  2100, 10, 25,
  120, true
),
-- 作業員: 渡辺四郎
(
  '77777777-7777-7777-7777-777777777704',
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555507',
  'YS-002', '渡辺', '四郎', 'ワタナベ', 'シロウ',
  'worker', 'part_time',
  ARRAY['普通免許'],
  '2023-04-01', '1998-11-25',
  '222-0001', '神奈川県', '横浜市港北区', '新横浜4-4-4',
  '090-6666-6666', '渡辺健太', '090-6666-6667',
  1500, 8, 20,
  50, true
);

-- 合計: 4従業員
