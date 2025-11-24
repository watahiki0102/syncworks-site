-- ========================================
-- Table: pricing_rules
-- Description: 料金計算ルールマスタ
-- Created: 2025-01-24
-- ========================================

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- トラック種別と適用範囲
  truck_type VARCHAR(30) NOT NULL
    CHECK (truck_type IN ('軽トラック', '2tショート', '2tロング', '4t', '10t')),
  min_point INT NOT NULL,
  max_point INT,

  -- 料金設定
  base_price INT NOT NULL CHECK (base_price >= 0),
  price_per_km DECIMAL(10,2) CHECK (price_per_km >= 0),

  -- 適用期間
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- 有効フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_pricing_rule
    UNIQUE (truck_type, min_point, max_point, valid_from)
);

-- インデックス
CREATE INDEX idx_pricing_rules_truck_type ON pricing_rules(truck_type);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active) WHERE is_active = true;

-- コメント
COMMENT ON TABLE pricing_rules IS '料金計算ルールマスタ';
COMMENT ON COLUMN pricing_rules.min_point IS '最小ポイント';
COMMENT ON COLUMN pricing_rules.max_point IS '最大ポイント（NULLの場合は上限なし）';
COMMENT ON COLUMN pricing_rules.base_price IS '基本料金';
COMMENT ON COLUMN pricing_rules.price_per_km IS '距離単価（円/km）';
COMMENT ON COLUMN pricing_rules.valid_from IS '適用開始日';
COMMENT ON COLUMN pricing_rules.valid_until IS '適用終了日（NULLの場合は無期限）';
