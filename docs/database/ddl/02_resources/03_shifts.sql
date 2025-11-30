-- ========================================
-- Table: shifts
-- Description: 従業員のシフト情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- シフト日時
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  time_slot VARCHAR(50),

  -- 割り当て情報
  job_id UUID,
  truck_id UUID,

  -- 作業情報
  customer_name VARCHAR(100),
  work_type VARCHAR(30)
    CHECK (work_type IN ('loading', 'moving', 'unloading', 'maintenance', 'other')),

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('available', 'planned', 'assigned', 'booked',
                     'working', 'completed', 'cancelled', 'unavailable', 'overtime')),

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 日マタギ対応の検証（同一時刻禁止）
  CONSTRAINT check_time_valid
    CHECK (
      start_time <> end_time AND (
        start_time < end_time OR
        (start_time > end_time AND time_slot IS NOT NULL)
      )
    )
);

-- インデックス
CREATE INDEX idx_shifts_employee ON shifts(employee_id, date);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_job ON shifts(job_id);
CREATE INDEX idx_shifts_truck ON shifts(truck_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_employee_date_time ON shifts(employee_id, date, start_time);

-- コメント
COMMENT ON TABLE shifts IS '従業員のシフト情報';
COMMENT ON COLUMN shifts.time_slot IS '時間帯ID（30分単位、00:00-24:00の48スロット）';
COMMENT ON COLUMN shifts.work_type IS '作業種別: loading/moving/unloading/maintenance/other';
COMMENT ON COLUMN shifts.status IS 'ステータス: available/planned/assigned/booked/working/completed/cancelled/unavailable/overtime';
COMMENT ON CONSTRAINT check_time_valid ON shifts IS '日マタギシフトの場合はtime_slot必須';
