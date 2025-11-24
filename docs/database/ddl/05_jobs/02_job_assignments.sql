-- ========================================
-- Table: job_assignments
-- Description: 案件に対する従業員・トラックの割り当て
-- Created: 2025-01-24
-- ========================================

CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- リソース割り当て
  employee_id UUID REFERENCES employees(id),
  truck_id UUID REFERENCES trucks(id),

  -- 役割
  assignment_type VARCHAR(20) NOT NULL
    CHECK (assignment_type IN ('driver', 'worker', 'leader')),

  -- 作業時間
  assigned_start_time TIMESTAMP NOT NULL,
  assigned_end_time TIMESTAMP NOT NULL,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_assignment_has_resource
    CHECK (employee_id IS NOT NULL OR truck_id IS NOT NULL)
);

-- インデックス
CREATE INDEX idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_employee ON job_assignments(employee_id);
CREATE INDEX idx_job_assignments_truck ON job_assignments(truck_id);

-- コメント
COMMENT ON TABLE job_assignments IS '案件に対する従業員・トラックの割り当て';
COMMENT ON COLUMN job_assignments.assignment_type IS '役割: driver=ドライバー/worker=作業員/leader=リーダー';
COMMENT ON CONSTRAINT check_assignment_has_resource ON job_assignments IS '少なくとも従業員またはトラックのいずれかが必須';
