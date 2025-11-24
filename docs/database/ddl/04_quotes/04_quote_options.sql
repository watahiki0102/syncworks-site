-- ========================================
-- Table: quote_options
-- Description: 見積に選択されたオプション（中間テーブル）
-- Created: 2025-01-24
-- ========================================

CREATE TABLE quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id),

  -- 選択時の情報
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  total_price INT NOT NULL CHECK (total_price >= 0),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_quote_option UNIQUE (quote_id, option_id)
);

-- インデックス
CREATE INDEX idx_quote_options_quote ON quote_options(quote_id);
CREATE INDEX idx_quote_options_option ON quote_options(option_id);

-- コメント
COMMENT ON TABLE quote_options IS '見積に選択されたオプション（中間テーブル）';
COMMENT ON COLUMN quote_options.unit_price IS '選択時点の単価（スナップショット）';
COMMENT ON COLUMN quote_options.total_price IS '合計金額（unit_price × quantity）';
