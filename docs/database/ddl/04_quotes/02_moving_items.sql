-- ========================================
-- Table: moving_items
-- Description: 見積依頼に紐づく荷物情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE moving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  points_per_unit INT NOT NULL CHECK (points_per_unit >= 0),
  total_points INT GENERATED ALWAYS AS (quantity * points_per_unit) STORED,
  additional_cost INT DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_moving_items_request ON moving_items(quote_request_id);
CREATE INDEX idx_moving_items_category ON moving_items(category);

-- コメント
COMMENT ON TABLE moving_items IS '見積依頼に紐づく荷物情報';
COMMENT ON COLUMN moving_items.category IS 'カテゴリ（furniture/appliances/boxes等）';
COMMENT ON COLUMN moving_items.points_per_unit IS '1個あたりポイント';
COMMENT ON COLUMN moving_items.total_points IS '合計ポイント（自動計算）';
COMMENT ON COLUMN moving_items.additional_cost IS '追加コスト';
