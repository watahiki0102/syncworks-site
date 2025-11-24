-- ========================================
-- Seed: Test Quote Requests (テストデータ)
-- Description: テスト見積もり依頼
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- 見積もり依頼1: 単身引越し（回答済み）
INSERT INTO quote_requests (
  id,
  customer_last_name, customer_first_name,
  customer_last_name_kana, customer_first_name_kana,
  customer_email, customer_phone,
  from_postal_code, from_prefecture, from_city, from_address_line,
  from_building_type, from_floor, from_has_elevator,
  to_postal_code, to_prefecture, to_city, to_address_line,
  to_building_type, to_floor, to_has_elevator,
  preferred_date_1, preferred_time_slot_1,
  preferred_date_2, preferred_time_slot_2,
  preferred_date_3, preferred_time_slot_3,
  household_size, estimated_volume_cbm,
  packing_required, has_fragile_items, has_large_furniture,
  special_requirements, access_restrictions,
  distance_km, estimated_duration_hours,
  request_source, referrer_agent_id,
  status
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  '木村', '健太', 'キムラ', 'ケンタ',
  'customer1@example.com', '080-1111-1111',
  '150-0001', '東京都', '渋谷区', '神宮前1-2-3 マンションA 301号室',
  'apartment', 3, true,
  '158-0001', '東京都', '世田谷区', '池尻2-3-4 ハイツB 205号室',
  'apartment', 2, true,
  '2025-03-15', 'morning',
  '2025-03-16', 'morning',
  '2025-03-22', 'afternoon',
  'single', 8.5,
  false, false, false,
  '特になし', NULL,
  12.5, 4,
  'web', NULL,
  'answered'
);

-- 見積もり依頼2: ファミリー引越し（見積もり中）
INSERT INTO quote_requests (
  id,
  customer_last_name, customer_first_name,
  customer_last_name_kana, customer_first_name_kana,
  customer_email, customer_phone,
  from_postal_code, from_prefecture, from_city, from_address_line,
  from_building_type, from_floor, from_has_elevator,
  to_postal_code, to_prefecture, to_city, to_address_line,
  to_building_type, to_floor, to_has_elevator,
  preferred_date_1, preferred_time_slot_1,
  preferred_date_2, preferred_time_slot_2,
  household_size, estimated_volume_cbm,
  packing_required, has_fragile_items, has_large_furniture,
  special_requirements, access_restrictions,
  distance_km, estimated_duration_hours,
  request_source, referrer_agent_id,
  status
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
  '小林', '真美', 'コバヤシ', 'マミ',
  'customer2@example.com', '080-2222-2222',
  '220-0001', '神奈川県', '横浜市西区', 'みなとみらい1-1-1 戸建て',
  'house', NULL, NULL,
  '244-0001', '神奈川県', '横浜市戸塚区', '戸塚町2-2-2 戸建て',
  'house', NULL, NULL,
  '2025-04-05', 'morning',
  '2025-04-06', 'morning',
  'family_4', 25.0,
  true, true, true,
  'ピアノあり（アップライト）、エアコン2台移設希望', '駐車スペース狭い',
  15.8, 8,
  'agent', '99999999-9999-9999-9999-999999999902',
  'pending'
);

-- 見積もり依頼3: 不動産経由（回答済み・契約済み）
INSERT INTO quote_requests (
  id,
  customer_last_name, customer_first_name,
  customer_last_name_kana, customer_first_name_kana,
  customer_email, customer_phone,
  from_postal_code, from_prefecture, from_city, from_address_line,
  from_building_type, from_floor, from_has_elevator,
  to_postal_code, to_prefecture, to_city, to_address_line,
  to_building_type, to_floor, to_has_elevator,
  preferred_date_1, preferred_time_slot_1,
  preferred_date_2, preferred_time_slot_2,
  preferred_date_3, preferred_time_slot_3,
  household_size, estimated_volume_cbm,
  packing_required, has_fragile_items, has_large_furniture,
  special_requirements, access_restrictions,
  distance_km, estimated_duration_hours,
  request_source, referrer_agent_id,
  status
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
  '加藤', '由紀', 'カトウ', 'ユキ',
  'customer3@example.com', '080-3333-3333',
  '160-0001', '東京都', '新宿区', '西新宿2-1-1 マンションC 1205号室',
  'apartment', 12, true,
  '154-0001', '東京都', '世田谷区', '池尻3-5-6 マンションD 505号室',
  'apartment', 5, true,
  '2025-02-28', 'afternoon',
  '2025-03-01', 'morning',
  '2025-03-02', 'morning',
  'couple', 15.0,
  true, false, true,
  '不用品回収希望（中型家具2点）', NULL,
  8.3, 6,
  'agent', '99999999-9999-9999-9999-999999999901',
  'answered'
);

-- 合計: 3見積もり依頼
