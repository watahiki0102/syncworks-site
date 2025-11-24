-- ========================================
-- Table: trucks
-- Description: 引越し業者が所有するトラック情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id) ON DELETE CASCADE,

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  plate_number VARCHAR(50),
  truck_type VARCHAR(30) NOT NULL
    CHECK (truck_type IN ('軽トラック', '2tショート', '2tロング', '4t', '10t')),

  -- 容量情報
  capacity_kg INT NOT NULL CHECK (capacity_kg > 0),
  capacity_points INT CHECK (capacity_points >= 0),

  -- 車検情報
  inspection_expiry DATE NOT NULL,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in_use', 'maintenance', 'inactive', 'retired')),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_trucks_company ON trucks(moving_company_id);
CREATE INDEX idx_trucks_status ON trucks(status) WHERE status IN ('available', 'in_use');
CREATE INDEX idx_trucks_plate ON trucks(plate_number);
CREATE INDEX idx_trucks_inspection ON trucks(inspection_expiry);

-- コメント
COMMENT ON TABLE trucks IS '引越し業者が所有するトラック情報';
COMMENT ON COLUMN trucks.truck_type IS 'トラック種別: 軽トラック/2tショート/2tロング/4t/10t';
COMMENT ON COLUMN trucks.capacity_kg IS '積載容量（kg）';
COMMENT ON COLUMN trucks.capacity_points IS '積載容量（ポイント換算）';
COMMENT ON COLUMN trucks.inspection_expiry IS '車検有効期限';
COMMENT ON COLUMN trucks.status IS 'ステータス: available/in_use/maintenance/inactive/retired';
