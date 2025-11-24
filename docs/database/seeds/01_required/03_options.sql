-- ========================================
-- Seed: Options (必須マスタデータ)
-- Description: オプションサービスマスタ
-- Created: 2025-01-24
-- ========================================

-- 梱包・養生サービス
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333301', '標準梱包', 'packing', '基本的な梱包資材の提供と梱包作業', 10000, false, NULL, false, 120, 1, true, 10),
('33333333-3333-3333-3333-333333333302', 'おまかせパック', 'packing', '全荷物の梱包・開梱を完全代行', 50000, false, NULL, false, 300, 1, true, 20),
('33333333-3333-3333-3333-333333333303', '食器梱包', 'packing', '食器類の専用梱包', 8000, false, NULL, false, 60, 1, true, 30),
('33333333-3333-3333-3333-333333333304', '家具保護', 'protection', '家具の専用カバー・養生', 5000, false, NULL, false, 30, 1, true, 40),
('33333333-3333-3333-3333-333333333305', '建物養生', 'protection', '玄関・廊下・エレベーターの養生', 8000, false, NULL, false, 45, 1, true, 50);

-- エアコン・電気工事
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333306', 'エアコン取外し', 'appliance', 'エアコン1台の取外し作業', 8000, false, NULL, true, 60, 5, true, 60),
('33333333-3333-3333-3333-333333333307', 'エアコン取付', 'appliance', 'エアコン1台の取付作業（標準工事）', 15000, false, NULL, true, 90, 5, true, 70),
('33333333-3333-3333-3333-333333333308', 'エアコン移設パック', 'appliance', 'エアコン取外し＋取付のセット', 20000, false, NULL, true, 150, 5, true, 80),
('33333333-3333-3333-3333-333333333309', '洗濯機取付', 'appliance', '洗濯機の設置と給水ホース接続', 3000, false, NULL, false, 30, 2, true, 90),
('33333333-3333-3333-3333-333333333310', 'テレビ配線', 'appliance', 'テレビ・レコーダーの配線作業', 5000, false, NULL, false, 45, 3, true, 100),
('33333333-3333-3333-3333-333333333311', '照明取付', 'appliance', '照明器具の取付作業', 3000, false, NULL, false, 20, 5, true, 110);

-- 家具組立・設置
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333312', 'ベッド組立', 'assembly', 'ベッドの解体・組立', 8000, false, NULL, false, 90, 3, true, 120),
('33333333-3333-3333-3333-333333333313', '家具組立', 'assembly', '家具1点の組立作業', 5000, false, NULL, false, 60, 5, true, 130),
('33333333-3333-3333-3333-333333333314', 'カーテン取付', 'assembly', 'カーテンレールへの取付', 3000, false, NULL, false, 30, 10, true, 140);

-- 不用品・清掃
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333315', '不用品回収（小）', 'disposal', '小型家電・小物の回収', 3000, false, NULL, true, 15, 10, true, 150),
('33333333-3333-3333-3333-333333333316', '不用品回収（中）', 'disposal', '中型家具・家電の回収', 8000, false, NULL, true, 30, 10, true, 160),
('33333333-3333-3333-3333-333333333317', '不用品回収（大）', 'disposal', '大型家具・家電の回収', 15000, false, NULL, true, 45, 10, true, 170),
('33333333-3333-3333-3333-333333333318', '簡易清掃', 'cleaning', '旧居の簡易清掃', 10000, false, NULL, false, 120, 1, true, 180),
('33333333-3333-3333-3333-333333333319', 'ハウスクリーニング', 'cleaning', '旧居の本格清掃', 30000, false, NULL, true, 240, 1, true, 190);

-- 保険・保管
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333320', '家財保険', 'insurance', '運搬中の破損・紛失補償（上限100万円）', 3000, false, NULL, false, 0, 1, true, 200),
('33333333-3333-3333-3333-333333333321', '家財保険（プレミアム）', 'insurance', '運搬中の破損・紛失補償（上限300万円）', 8000, false, NULL, false, 0, 1, true, 210),
('33333333-3333-3333-3333-333333333322', '一時保管（1週間）', 'storage', '荷物の一時保管サービス', 20000, false, NULL, true, 0, 1, true, 220),
('33333333-3333-3333-3333-333333333323', '一時保管（1ヶ月）', 'storage', '荷物の一時保管サービス', 50000, false, NULL, true, 0, 1, true, 230);

-- ピアノ・特殊品
INSERT INTO options (id, name, category, description, base_price, is_percentage, percentage_rate, requires_approval, estimated_time_minutes, max_quantity, is_active, display_order) VALUES
('33333333-3333-3333-3333-333333333324', 'ピアノ運搬（アップライト）', 'special', 'アップライトピアノの運搬', 30000, false, NULL, true, 180, 1, true, 240),
('33333333-3333-3333-3333-333333333325', 'ピアノ運搬（グランド）', 'special', 'グランドピアノの運搬', 80000, false, NULL, true, 300, 1, true, 250),
('33333333-3333-3333-3333-333333333326', 'バイク運搬', 'special', 'バイク・原付の運搬', 15000, false, NULL, true, 60, 2, true, 260),
('33333333-3333-3333-3333-333333333327', '金庫運搬', 'special', '大型金庫の運搬', 20000, false, NULL, true, 90, 1, true, 270);

-- 合計: 27オプション
