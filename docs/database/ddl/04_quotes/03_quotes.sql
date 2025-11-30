-- ========================================
-- Table: quotes
-- Description: 引越し業者が提供する見積
-- Created: 2025-01-24
-- ========================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id),

  -- 見積タイプ
  quote_type VARCHAR(20) NOT NULL DEFAULT 'quote'
    CHECK (quote_type IN ('quote', 'unavailable')),

  -- 料金情報（見積可能時のみ）
  base_price INT CHECK (base_price >= 0),
  discount_amount INT DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount INT CHECK (tax_amount >= 0),
  total_price INT CHECK (total_price >= 0),

  -- 料金内訳（見積算出根拠）
  breakdown_base_price INT,
  breakdown_distance_price INT,
  breakdown_option_price INT,
  breakdown_total_points INT,
  recommended_truck VARCHAR(50),

  -- 調整情報
  adjustment_amount INT DEFAULT 0,
  adjustment_rate DECIMAL(5,2) DEFAULT 0.00,
  adjustment_reason_type VARCHAR(30)
    CHECK (adjustment_reason_type IN ('competitive', 'urgent', 'repeat_customer',
           'volume_discount', 'difficulty', 'other')),
  adjustment_reason_desc TEXT,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired', 'completed')),

  -- 有効期限
  valid_until DATE,

  -- メッセージ
  response_comment TEXT,
  message_to_customer TEXT,

  -- 回答者情報
  responded_at TIMESTAMP,
  responded_by VARCHAR(100),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- チェック制約：見積タイプがquoteの場合は料金必須
  CONSTRAINT check_quote_has_price
    CHECK (quote_type = 'unavailable' OR (base_price IS NOT NULL AND total_price IS NOT NULL))
);

-- インデックス
CREATE INDEX idx_quotes_request ON quotes(quote_request_id);
CREATE INDEX idx_quotes_company ON quotes(moving_company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_company_status_created ON quotes(moving_company_id, status, created_at DESC);

-- コメント
COMMENT ON TABLE quotes IS '引越し業者が提供する見積';
COMMENT ON COLUMN quotes.quote_type IS '見積タイプ: quote=見積可能/unavailable=見積不可';
COMMENT ON COLUMN quotes.adjustment_reason_type IS '調整理由: competitive=競合対応/urgent=緊急/repeat_customer=リピーター等';
COMMENT ON COLUMN quotes.status IS 'ステータス: pending/quoted/accepted/rejected/expired/completed';
COMMENT ON COLUMN quotes.valid_until IS '見積有効期限（通常は提出日+1週間）';
