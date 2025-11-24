-- ========================================
-- Seed: Test Moving Companies (テストデータ)
-- Description: テスト引越し業者
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- 引越し業者1: 東京エクスプレス引越センター
INSERT INTO moving_companies (
  id, owner_user_id, company_name, company_name_kana,
  postal_code, prefecture, city, address_line,
  phone_number, email, business_hours,
  service_areas, max_distance_km, min_job_price,
  provides_packing, provides_storage, storage_capacity_cbm,
  has_insurance, insurance_max_coverage, insurance_company_name,
  licenses, certifications,
  rating_average, total_reviews, total_jobs_completed,
  status, is_verified
) VALUES (
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555502', -- owner1@example.com
  '東京エクスプレス引越センター',
  'トウキョウエクスプレスヒッコシセンター',
  '150-0001', '東京都', '渋谷区', '神宮前1-2-3',
  '03-1234-5678', 'contact@tokyo-express.jp',
  '月〜日 8:00-20:00',
  ARRAY['東京都', '神奈川県', '埼玉県', '千葉県'],
  100,
  30000,
  true, true, 500,
  true, 10000000, '東京海上日動火災保険',
  ARRAY['貨物運送事業許可番号：関自貨第12345号'],
  ARRAY['引越安心マーク認定', 'ISO9001取得'],
  4.5, 120, 450,
  'active', true
);

-- 引越し業者2: 横浜スピード引越サービス
INSERT INTO moving_companies (
  id, owner_user_id, company_name, company_name_kana,
  postal_code, prefecture, city, address_line,
  phone_number, email, business_hours,
  service_areas, max_distance_km, min_job_price,
  provides_packing, provides_storage, storage_capacity_cbm,
  has_insurance, insurance_max_coverage, insurance_company_name,
  licenses, certifications,
  rating_average, total_reviews, total_jobs_completed,
  status, is_verified
) VALUES (
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555503', -- owner2@example.com
  '横浜スピード引越サービス',
  'ヨコハマスピードヒッコシサービス',
  '220-0001', '神奈川県', '横浜市西区', 'みなとみらい2-3-4',
  '045-1234-5678', 'info@yokohama-speed.jp',
  '年中無休 7:00-21:00',
  ARRAY['神奈川県', '東京都', '埼玉県'],
  80,
  25000,
  true, false, NULL,
  true, 5000000, '損保ジャパン',
  ARRAY['貨物運送事業許可番号：関自貨第67890号'],
  ARRAY['引越安心マーク認定'],
  4.2, 85, 320,
  'active', true
);

-- 合計: 2社
