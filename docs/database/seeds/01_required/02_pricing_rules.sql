-- ========================================
-- Seed: Pricing Rules (必須マスタデータ)
-- Description: 料金ルールマスタ
-- Created: 2025-01-24
-- ========================================

-- 基本料金（ポイント → 料金換算）
INSERT INTO pricing_rules (id, rule_type, description, base_price, point_unit_price, distance_rate_per_km, min_charge, max_charge, effective_from, effective_to, is_active, priority) VALUES
('22222222-2222-2222-2222-222222222201', 'base_rate', '基本料金（1ポイント＝100円）', 0, 100, NULL, NULL, NULL, '2025-01-01', NULL, true, 100);

-- 距離料金
INSERT INTO pricing_rules (id, rule_type, description, base_price, point_unit_price, distance_rate_per_km, min_charge, max_charge, effective_from, effective_to, is_active, priority) VALUES
('22222222-2222-2222-2222-222222222202', 'distance', '距離料金（10km以下）', NULL, NULL, 0, 5000, NULL, '2025-01-01', NULL, true, 90),
('22222222-2222-2222-2222-222222222203', 'distance', '距離料金（10-30km）', NULL, NULL, 150, 5000, NULL, '2025-01-01', NULL, true, 90),
('22222222-2222-2222-2222-222222222204', 'distance', '距離料金（30-50km）', NULL, NULL, 200, 10000, NULL, '2025-01-01', NULL, true, 90),
('22222222-2222-2222-2222-222222222205', 'distance', '距離料金（50km以上）', NULL, NULL, 250, 15000, NULL, '2025-01-01', NULL, true, 90);

-- 階段・エレベーター料金
INSERT INTO pricing_rules (id, rule_type, description, base_price, point_unit_price, distance_rate_per_km, min_charge, max_charge, effective_from, effective_to, is_active, priority) VALUES
('22222222-2222-2222-2222-222222222206', 'floor_charge', '階段料金（1階ごと）', 3000, NULL, NULL, NULL, NULL, '2025-01-01', NULL, true, 80),
('22222222-2222-2222-2222-222222222207', 'floor_charge', 'エレベーター無し追加料金（3階以上）', 5000, NULL, NULL, NULL, NULL, '2025-01-01', NULL, true, 80);

-- 時間帯割増
INSERT INTO pricing_rules (id, rule_type, description, base_price, point_unit_price, distance_rate_per_km, min_charge, max_charge, effective_from, effective_to, is_active, priority) VALUES
('22222222-2222-2222-2222-222222222208', 'time_charge', '早朝料金（6:00-8:00）', NULL, NULL, NULL, 5000, NULL, '2025-01-01', NULL, true, 70),
('22222222-2222-2222-2222-222222222209', 'time_charge', '夜間料金（18:00-21:00）', NULL, NULL, NULL, 5000, NULL, '2025-01-01', NULL, true, 70),
('22222222-2222-2222-2222-222222222210', 'time_charge', '深夜料金（21:00-翌6:00）', NULL, NULL, NULL, 10000, NULL, '2025-01-01', NULL, true, 70);

-- 最低料金保証
INSERT INTO pricing_rules (id, rule_type, description, base_price, point_unit_price, distance_rate_per_km, min_charge, max_charge, effective_from, effective_to, is_active, priority) VALUES
('22222222-2222-2222-2222-222222222211', 'minimum', '最低保証料金', NULL, NULL, NULL, 30000, NULL, '2025-01-01', NULL, true, 50);

-- 合計: 11ルール
