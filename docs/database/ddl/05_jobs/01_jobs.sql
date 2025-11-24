-- ========================================
-- Table: jobs
-- Description: 受注確定した引越し案件
-- Created: 2025-01-24
-- ========================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 参照情報
  quote_id UUID NOT NULL REFERENCES quotes(id),
  quote_request_id UUID REFERENCES quote_requests(id),
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id),
  referrer_agent_id UUID REFERENCES real_estate_agents(id),

  -- 顧客情報スナップショット
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  from_address VARCHAR(500) NOT NULL,
  to_address VARCHAR(500) NOT NULL,

  -- 作業情報
  total_points INT,
  distance DECIMAL(10,2),

  -- 作業日時
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIMESTAMP,
  scheduled_end_time TIMESTAMP,
  time_slot VARCHAR(50),
  estimated_duration INT,

  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,

  -- リソース割り当て
  crew_size INT,
  truck_count INT,

  -- 選択オプション
  selected_options JSONB,

  -- 支払情報
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer', 'invoice')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  payment_amount INT,
  payment_due_date DATE,
  contract_date DATE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_jobs_quote ON jobs(quote_id);
CREATE INDEX idx_jobs_request ON jobs(quote_request_id);
CREATE INDEX idx_jobs_company ON jobs(moving_company_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_referrer ON jobs(referrer_agent_id);

-- コメント
COMMENT ON TABLE jobs IS '受注確定した引越し案件';
COMMENT ON COLUMN jobs.customer_name IS '顧客名（スナップショット）';
COMMENT ON COLUMN jobs.estimated_duration IS '想定作業時間（分単位）';
COMMENT ON COLUMN jobs.actual_start_time IS '実際の開始時刻';
COMMENT ON COLUMN jobs.actual_end_time IS '実際の終了時刻';
COMMENT ON COLUMN jobs.selected_options IS '選択オプション（JSONB）';
COMMENT ON COLUMN jobs.status IS 'ステータス: scheduled/in_progress/completed/cancelled/rescheduled';
