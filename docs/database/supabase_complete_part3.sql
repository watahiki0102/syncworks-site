-- ========================================
-- Supabase Complete Setup - Part 3
-- 見積もり・案件・外部キー・トリガー
-- ========================================

-- ========================================
-- 5. Quote Tables (見積もりテーブル)
-- ========================================

-- 5.1 quote_requests（見積もり依頼）
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name_kana VARCHAR(100),
  customer_first_name_kana VARCHAR(100),
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  from_postal_code VARCHAR(10),
  from_prefecture VARCHAR(50) NOT NULL,
  from_city VARCHAR(100) NOT NULL,
  from_address_line TEXT NOT NULL,
  from_building_type VARCHAR(20) CHECK (from_building_type IN ('house', 'apartment', 'mansion', 'office', 'other')),
  from_floor INT,
  from_has_elevator BOOLEAN,
  to_postal_code VARCHAR(10),
  to_prefecture VARCHAR(50) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_address_line TEXT NOT NULL,
  to_building_type VARCHAR(20) CHECK (to_building_type IN ('house', 'apartment', 'mansion', 'office', 'other')),
  to_floor INT,
  to_has_elevator BOOLEAN,
  preferred_date_1 DATE,
  preferred_time_slot_1 VARCHAR(20) CHECK (preferred_time_slot_1 IN ('morning', 'afternoon', 'evening', 'flexible')),
  preferred_date_2 DATE,
  preferred_time_slot_2 VARCHAR(20) CHECK (preferred_time_slot_2 IN ('morning', 'afternoon', 'evening', 'flexible')),
  preferred_date_3 DATE,
  preferred_time_slot_3 VARCHAR(20) CHECK (preferred_time_slot_3 IN ('morning', 'afternoon', 'evening', 'flexible')),
  household_size VARCHAR(20) CHECK (household_size IN ('single', 'couple', 'family_3', 'family_4', 'family_5_plus', 'office')),
  estimated_volume_cbm DECIMAL(10,2),
  packing_required BOOLEAN NOT NULL DEFAULT false,
  has_fragile_items BOOLEAN NOT NULL DEFAULT false,
  has_large_furniture BOOLEAN NOT NULL DEFAULT false,
  special_requirements TEXT,
  access_restrictions TEXT,
  distance_km DECIMAL(10,2),
  estimated_duration_hours INT,
  request_source VARCHAR(20) NOT NULL CHECK (request_source IN ('web', 'phone', 'agent', 'direct')),
  referrer_agent_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'expired', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_date ON quote_requests(preferred_date_1);
CREATE INDEX IF NOT EXISTS idx_quote_requests_referrer ON quote_requests(referrer_agent_id);

COMMENT ON TABLE quote_requests IS '見積もり依頼';
COMMENT ON COLUMN quote_requests.id IS '依頼ID（主キー）';
COMMENT ON COLUMN quote_requests.customer_last_name IS '顧客姓';
COMMENT ON COLUMN quote_requests.customer_first_name IS '顧客名';
COMMENT ON COLUMN quote_requests.customer_last_name_kana IS '顧客姓（カナ）';
COMMENT ON COLUMN quote_requests.customer_first_name_kana IS '顧客名（カナ）';
COMMENT ON COLUMN quote_requests.customer_email IS '顧客メールアドレス';
COMMENT ON COLUMN quote_requests.customer_phone IS '顧客電話番号';
COMMENT ON COLUMN quote_requests.from_postal_code IS '現住所郵便番号';
COMMENT ON COLUMN quote_requests.from_prefecture IS '現住所都道府県';
COMMENT ON COLUMN quote_requests.from_city IS '現住所市区町村';
COMMENT ON COLUMN quote_requests.from_address_line IS '現住所（番地・建物名）';
COMMENT ON COLUMN quote_requests.from_building_type IS '現住所建物種別（house/apartment/mansion/office/other）';
COMMENT ON COLUMN quote_requests.from_floor IS '現住所階数';
COMMENT ON COLUMN quote_requests.from_has_elevator IS '現住所エレベーター有無';
COMMENT ON COLUMN quote_requests.to_postal_code IS '新住所郵便番号';
COMMENT ON COLUMN quote_requests.to_prefecture IS '新住所都道府県';
COMMENT ON COLUMN quote_requests.to_city IS '新住所市区町村';
COMMENT ON COLUMN quote_requests.to_address_line IS '新住所（番地・建物名）';
COMMENT ON COLUMN quote_requests.to_building_type IS '新住所建物種別';
COMMENT ON COLUMN quote_requests.to_floor IS '新住所階数';
COMMENT ON COLUMN quote_requests.to_has_elevator IS '新住所エレベーター有無';
COMMENT ON COLUMN quote_requests.preferred_date_1 IS '希望日1';
COMMENT ON COLUMN quote_requests.preferred_time_slot_1 IS '希望時間帯1（morning/afternoon/evening/flexible）';
COMMENT ON COLUMN quote_requests.preferred_date_2 IS '希望日2';
COMMENT ON COLUMN quote_requests.preferred_time_slot_2 IS '希望時間帯2';
COMMENT ON COLUMN quote_requests.preferred_date_3 IS '希望日3';
COMMENT ON COLUMN quote_requests.preferred_time_slot_3 IS '希望時間帯3';
COMMENT ON COLUMN quote_requests.household_size IS '世帯規模（single/couple/family_3/family_4/family_5_plus/office）';
COMMENT ON COLUMN quote_requests.estimated_volume_cbm IS '推定荷物量（㎥）';
COMMENT ON COLUMN quote_requests.packing_required IS '梱包希望フラグ';
COMMENT ON COLUMN quote_requests.has_fragile_items IS '壊れ物有無';
COMMENT ON COLUMN quote_requests.has_large_furniture IS '大型家具有無';
COMMENT ON COLUMN quote_requests.special_requirements IS '特別な要望';
COMMENT ON COLUMN quote_requests.access_restrictions IS 'アクセス制限・注意事項';
COMMENT ON COLUMN quote_requests.distance_km IS '移動距離（km）';
COMMENT ON COLUMN quote_requests.estimated_duration_hours IS '推定所要時間（時間）';
COMMENT ON COLUMN quote_requests.request_source IS '依頼経路（web/phone/agent/direct）';
COMMENT ON COLUMN quote_requests.referrer_agent_id IS '紹介不動産業者ID（FK: real_estate_agents）';
COMMENT ON COLUMN quote_requests.status IS 'ステータス（pending/answered/expired/cancelled）';
COMMENT ON COLUMN quote_requests.created_at IS '依頼日時';
COMMENT ON COLUMN quote_requests.updated_at IS '更新日時';

-- 5.2 moving_items（引越し荷物明細）
CREATE TABLE IF NOT EXISTS moving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL,
  item_master_id UUID,
  custom_item_name VARCHAR(200),
  quantity INT NOT NULL CHECK (quantity > 0),
  points_per_unit INT NOT NULL CHECK (points_per_unit >= 0),
  total_points INT GENERATED ALWAYS AS (quantity * points_per_unit) STORED,
  requires_disassembly BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moving_items_request ON moving_items(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_moving_items_master ON moving_items(item_master_id);

COMMENT ON TABLE moving_items IS '引越し荷物明細';
COMMENT ON COLUMN moving_items.id IS '明細ID（主キー）';
COMMENT ON COLUMN moving_items.quote_request_id IS '見積もり依頼ID（FK: quote_requests）';
COMMENT ON COLUMN moving_items.item_master_id IS '品目マスタID（FK: item_masters）';
COMMENT ON COLUMN moving_items.custom_item_name IS 'カスタム品目名（マスタにない場合）';
COMMENT ON COLUMN moving_items.quantity IS '数量';
COMMENT ON COLUMN moving_items.points_per_unit IS '単位あたりポイント';
COMMENT ON COLUMN moving_items.total_points IS '合計ポイント（計算カラム）';
COMMENT ON COLUMN moving_items.requires_disassembly IS '解体・組立必要フラグ';
COMMENT ON COLUMN moving_items.notes IS '備考';
COMMENT ON COLUMN moving_items.created_at IS '登録日時';

-- 5.3 quotes（見積もり）
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL,
  company_id UUID NOT NULL,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  total_points INT NOT NULL CHECK (total_points >= 0),
  base_price INT NOT NULL CHECK (base_price >= 0),
  distance_price INT NOT NULL CHECK (distance_price >= 0),
  option_price INT NOT NULL CHECK (option_price >= 0),
  season_adjustment_price INT DEFAULT 0,
  tax_amount INT NOT NULL CHECK (tax_amount >= 0),
  total_price INT NOT NULL CHECK (total_price >= 0),
  breakdown_base_price INT,
  breakdown_distance_price INT,
  breakdown_option_price INT,
  breakdown_total_points INT,
  valid_until DATE NOT NULL,
  proposed_date DATE,
  proposed_time_slot VARCHAR(20) CHECK (proposed_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  estimated_duration_hours INT,
  assigned_truck_ids UUID[],
  assigned_employee_ids UUID[],
  terms_and_conditions TEXT,
  internal_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled')),
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

COMMENT ON TABLE quotes IS '見積もり';
COMMENT ON COLUMN quotes.id IS '見積もりID（主キー）';
COMMENT ON COLUMN quotes.quote_request_id IS '見積もり依頼ID（FK: quote_requests）';
COMMENT ON COLUMN quotes.company_id IS '業者ID（FK: moving_companies）';
COMMENT ON COLUMN quotes.quote_number IS '見積もり番号';
COMMENT ON COLUMN quotes.total_points IS '合計ポイント';
COMMENT ON COLUMN quotes.base_price IS '基本料金';
COMMENT ON COLUMN quotes.distance_price IS '距離料金';
COMMENT ON COLUMN quotes.option_price IS 'オプション料金';
COMMENT ON COLUMN quotes.season_adjustment_price IS '繁忙期調整額';
COMMENT ON COLUMN quotes.tax_amount IS '消費税額';
COMMENT ON COLUMN quotes.total_price IS '合計金額';
COMMENT ON COLUMN quotes.breakdown_base_price IS '基本料金内訳';
COMMENT ON COLUMN quotes.breakdown_distance_price IS '距離料金内訳';
COMMENT ON COLUMN quotes.breakdown_option_price IS 'オプション料金内訳';
COMMENT ON COLUMN quotes.breakdown_total_points IS '合計ポイント内訳';
COMMENT ON COLUMN quotes.valid_until IS '見積もり有効期限';
COMMENT ON COLUMN quotes.proposed_date IS '提案引越日';
COMMENT ON COLUMN quotes.proposed_time_slot IS '提案時間帯';
COMMENT ON COLUMN quotes.estimated_duration_hours IS '推定作業時間（時間）';
COMMENT ON COLUMN quotes.assigned_truck_ids IS 'アサイン予定トラックID（配列）';
COMMENT ON COLUMN quotes.assigned_employee_ids IS 'アサイン予定従業員ID（配列）';
COMMENT ON COLUMN quotes.terms_and_conditions IS '契約条件';
COMMENT ON COLUMN quotes.internal_notes IS '社内メモ';
COMMENT ON COLUMN quotes.status IS 'ステータス（pending/sent/viewed/accepted/rejected/expired/cancelled）';
COMMENT ON COLUMN quotes.sent_at IS '送信日時';
COMMENT ON COLUMN quotes.viewed_at IS '閲覧日時';
COMMENT ON COLUMN quotes.responded_at IS '回答日時';
COMMENT ON COLUMN quotes.created_at IS '作成日時';
COMMENT ON COLUMN quotes.updated_at IS '更新日時';

-- 5.4 quote_options（見積もりオプション）
CREATE TABLE IF NOT EXISTS quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  option_id UUID NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  total_price INT GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_options_quote ON quote_options(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_options_option ON quote_options(option_id);

COMMENT ON TABLE quote_options IS '見積もりオプション';
COMMENT ON COLUMN quote_options.id IS 'オプション明細ID（主キー）';
COMMENT ON COLUMN quote_options.quote_id IS '見積もりID（FK: quotes）';
COMMENT ON COLUMN quote_options.option_id IS 'オプションID（FK: options）';
COMMENT ON COLUMN quote_options.quantity IS '数量';
COMMENT ON COLUMN quote_options.unit_price IS '単価';
COMMENT ON COLUMN quote_options.total_price IS '合計金額（計算カラム）';
COMMENT ON COLUMN quote_options.notes IS '備考';
COMMENT ON COLUMN quote_options.created_at IS '登録日時';

-- 続く（Part 4へ：案件管理テーブル）
