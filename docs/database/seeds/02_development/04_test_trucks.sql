-- ========================================
-- Seed: Test Trucks (テストデータ)
-- Description: テストトラック
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- 東京エクスプレス引越センターのトラック
INSERT INTO trucks (
  id, company_id, truck_number, license_plate,
  truck_type, capacity_cbm, max_load_kg,
  has_lift_gate, has_air_conditioning,
  manufacture_year, manufacturer, model_name,
  last_inspection_date, next_inspection_date,
  fuel_type, fuel_efficiency_kmpl,
  insurance_expiry_date, status
) VALUES
-- 2tトラック
(
  '88888888-8888-8888-8888-888888888801',
  '66666666-6666-6666-6666-666666666601',
  'TK-001', '品川300あ1234',
  '2t', 10.5, 2000,
  true, true,
  2022, 'いすゞ', 'エルフ',
  '2024-12-01', '2026-12-01',
  'diesel', 10.5,
  '2025-12-31', 'available'
),
-- 3tトラック
(
  '88888888-8888-8888-8888-888888888802',
  '66666666-6666-6666-6666-666666666601',
  'TK-002', '品川300あ5678',
  '3t', 15.0, 3000,
  true, false,
  2021, '日野', 'レンジャー',
  '2024-11-01', '2026-11-01',
  'diesel', 9.2,
  '2025-11-30', 'available'
),
-- 4tトラック
(
  '88888888-8888-8888-8888-888888888803',
  '66666666-6666-6666-6666-666666666601',
  'TK-003', '品川300あ9999',
  '4t', 20.0, 4000,
  false, false,
  2020, '三菱ふそう', 'ファイター',
  '2024-10-01', '2026-10-01',
  'diesel', 8.5,
  '2025-10-31', 'in_use'
);

-- 横浜スピード引越サービスのトラック
INSERT INTO trucks (
  id, company_id, truck_number, license_plate,
  truck_type, capacity_cbm, max_load_kg,
  has_lift_gate, has_air_conditioning,
  manufacture_year, manufacturer, model_name,
  last_inspection_date, next_inspection_date,
  fuel_type, fuel_efficiency_kmpl,
  insurance_expiry_date, status
) VALUES
-- 2tトラック
(
  '88888888-8888-8888-8888-888888888804',
  '66666666-6666-6666-6666-666666666602',
  'YS-001', '横浜300か1111',
  '2t', 10.0, 2000,
  true, true,
  2023, 'いすゞ', 'エルフ',
  '2024-12-15', '2026-12-15',
  'diesel', 11.0,
  '2026-01-31', 'available'
),
-- 3tトラック
(
  '88888888-8888-8888-8888-888888888805',
  '66666666-6666-6666-6666-666666666602',
  'YS-002', '横浜300か2222',
  '3t', 14.5, 3000,
  false, false,
  2021, '日野', 'レンジャー',
  '2024-11-15', '2026-11-15',
  'diesel', 9.0,
  '2025-12-31', 'available'
);

-- 合計: 5トラック
