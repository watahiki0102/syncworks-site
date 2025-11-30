-- ========================================
-- 外部キー制約の追加
-- Description: テーブル作成後に外部キーを追加
-- Created: 2025-01-24
-- Note: 循環参照を避けるため、テーブル作成後に外部キーを追加
-- ========================================

-- users → moving_companies, employees, real_estate_agents
-- ON DELETE SET NULL: 関連先が削除されてもユーザーアカウントは保持
ALTER TABLE users
  ADD CONSTRAINT fk_users_moving_company
    FOREIGN KEY (moving_company_id) REFERENCES moving_companies(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_real_estate_agent
    FOREIGN KEY (real_estate_agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

-- shifts → jobs
ALTER TABLE shifts
  ADD CONSTRAINT fk_shifts_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_shifts_truck
    FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL;

-- referral_cases → quote_requests
ALTER TABLE referral_cases
  ADD CONSTRAINT fk_referral_cases_quote_request
    FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id);

-- quote_options → options (前方参照)
-- 注: quote_options作成時に既にoptionsが存在する必要がある
-- このため、マスタテーブル（options）を先に作成すること

COMMENT ON CONSTRAINT fk_users_moving_company ON users IS 'ユーザー→引越し業者';
COMMENT ON CONSTRAINT fk_users_employee ON users IS 'ユーザー→従業員';
COMMENT ON CONSTRAINT fk_users_real_estate_agent ON users IS 'ユーザー→不動産業者';
COMMENT ON CONSTRAINT fk_shifts_job ON shifts IS 'シフト→案件（削除時SET NULL）';
COMMENT ON CONSTRAINT fk_shifts_truck ON shifts IS 'シフト→トラック（削除時SET NULL）';
