-- ========================================
-- Table: referral_cases
-- Description: 紹介者経由の案件
-- Created: 2025-01-24
-- ========================================

CREATE TABLE referral_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 紹介者
  referrer_id UUID NOT NULL REFERENCES referrers(id),
  referrer_type VARCHAR(20) NOT NULL
    CHECK (referrer_type IN ('company', 'individual')),

  -- 見積依頼（紐付け）
  quote_request_id UUID,

  -- 顧客情報（匿名化）
  customer_anonymous_id VARCHAR(100),
  customer_area VARCHAR(100),
  moving_date DATE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'expired')),

  -- 成約情報
  contract_amount INT CHECK (contract_amount >= 0),
  commission_amount INT CHECK (commission_amount >= 0),
  commission_rate DECIMAL(5,2),

  -- タイムスタンプ
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_referral_cases_referrer ON referral_cases(referrer_id);
CREATE INDEX idx_referral_cases_status ON referral_cases(status);
CREATE INDEX idx_referral_cases_application_date ON referral_cases(application_date DESC);
CREATE INDEX idx_referral_cases_quote_request ON referral_cases(quote_request_id);

-- コメント
COMMENT ON TABLE referral_cases IS '紹介者経由の案件';
COMMENT ON COLUMN referral_cases.customer_anonymous_id IS '顧客匿名ID（プライバシー保護）';
COMMENT ON COLUMN referral_cases.status IS 'ステータス: pending/in_progress/completed/cancelled/expired';
COMMENT ON COLUMN referral_cases.commission_amount IS '報酬金額（成約時に計算）';
COMMENT ON COLUMN referral_cases.commission_rate IS '報酬率（%）';
