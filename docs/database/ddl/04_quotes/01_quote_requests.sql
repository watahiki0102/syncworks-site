-- ========================================
-- Table: quote_requests
-- Description: 顧客からの見積依頼
-- Created: 2025-01-24
-- ========================================

CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 顧客情報
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name_kana VARCHAR(100) NOT NULL,
  customer_first_name_kana VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,

  -- 紹介元情報
  referrer_agent_id UUID REFERENCES real_estate_agents(id),
  referral_id VARCHAR(100),

  -- 引越し種別
  move_type VARCHAR(20) NOT NULL CHECK (move_type IN ('single', 'family')),

  -- 発地情報
  from_postal_code VARCHAR(10),
  from_prefecture VARCHAR(50) NOT NULL,
  from_city VARCHAR(100) NOT NULL,
  from_address_detail VARCHAR(255),
  property_type_from VARCHAR(30),
  floor_from INT,
  has_elevator_from BOOLEAN,

  -- 着地情報
  to_postal_code VARCHAR(10),
  to_prefecture VARCHAR(50) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_address_detail VARCHAR(255),
  property_type_to VARCHAR(30),
  floor_to INT,
  has_elevator_to BOOLEAN,

  -- 希望日時（3候補対応）
  preferred_date_1 DATE,
  preferred_time_slot_1 VARCHAR(50),
  preferred_date_2 DATE,
  preferred_time_slot_2 VARCHAR(50),
  preferred_date_3 DATE,
  preferred_time_slot_3 VARCHAR(50),

  -- 依頼管理
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'answered', 'expired')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  source_type VARCHAR(50) NOT NULL,

  -- 日付管理
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deadline DATE NOT NULL,

  -- 梱包資材配送管理
  packing_delivery BOOLEAN DEFAULT false,
  packing_deadline DATE,
  packing_delivery_completed BOOLEAN DEFAULT false,

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_request_date ON quote_requests(request_date DESC);
CREATE INDEX idx_quote_requests_referrer ON quote_requests(referrer_agent_id);
CREATE INDEX idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX idx_quote_requests_preferred_date ON quote_requests(preferred_date_1);

-- コメント
COMMENT ON TABLE quote_requests IS '顧客からの見積依頼';
COMMENT ON COLUMN quote_requests.move_type IS '引越し種別: single=単身/family=家族';
COMMENT ON COLUMN quote_requests.status IS 'ステータス: pending=受付中/answered=回答済/expired=期限切れ';
COMMENT ON COLUMN quote_requests.priority IS '優先度: high/medium/low';
COMMENT ON COLUMN quote_requests.source_type IS '依頼元種別（syncmoving/suumo/manual/agent等）';
COMMENT ON COLUMN quote_requests.deadline IS '回答期限（通常は依頼日+3日）';
