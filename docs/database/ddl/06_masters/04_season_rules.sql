-- ========================================
-- Table: season_rules
-- Description: シーズン加算ルールマスタ
-- Created: 2025-01-24
-- ========================================

CREATE TABLE season_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ルール名
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- 適用期間
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- 料金設定
  price_type VARCHAR(20) NOT NULL
    CHECK (price_type IN ('percentage', 'fixed')),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- 繰り返し設定
  is_recurring BOOLEAN DEFAULT false,
  recurring_type VARCHAR(20)
    CHECK (recurring_type IN ('yearly', 'monthly', 'weekly', 'none')),
  recurring_pattern JSONB,
  recurring_end_year INT,

  -- 有効フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_season_rules_dates ON season_rules(start_date, end_date);
CREATE INDEX idx_season_rules_active ON season_rules(is_active) WHERE is_active = true;

-- コメント
COMMENT ON TABLE season_rules IS 'シーズン加算ルールマスタ（GW、お盆、年末年始等）';
COMMENT ON COLUMN season_rules.price_type IS 'タイプ: percentage=割合（%）/fixed=固定額（円）';
COMMENT ON COLUMN season_rules.price IS '料金（percentage時は%、fixed時は円）';
COMMENT ON COLUMN season_rules.is_recurring IS '繰り返しフラグ';
COMMENT ON COLUMN season_rules.recurring_type IS '繰り返しタイプ: yearly=毎年/monthly=毎月/weekly=毎週/none=なし';
COMMENT ON COLUMN season_rules.recurring_pattern IS '繰り返しパターン詳細（JSONB）';
COMMENT ON COLUMN season_rules.recurring_end_year IS '繰り返し終了年';
