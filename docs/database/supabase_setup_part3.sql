-- ========================================
-- Supabase Setup Script - Part 3
-- 案件・レビュー・通知・外部キー・トリガー
-- ========================================
--
-- Part 2 実行後にこのスクリプトを実行してください
--
-- ========================================

-- ========================================
-- 6. Job Tables
-- ========================================

-- jobs テーブル
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  company_id UUID NOT NULL,
  job_number VARCHAR(50) NOT NULL UNIQUE,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(20) NOT NULL CHECK (scheduled_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  assigned_truck_ids UUID[],
  total_price INT NOT NULL CHECK (total_price >= 0),
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'invoice')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'cancelled')),
  paid_amount INT DEFAULT 0 CHECK (paid_amount >= 0),
  paid_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  special_instructions TEXT,
  internal_notes TEXT,
  completion_notes TEXT,
  customer_signature_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_number ON jobs(job_number);
CREATE INDEX IF NOT EXISTS idx_jobs_quote ON jobs(quote_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_last_name, customer_first_name);

COMMENT ON TABLE jobs IS '引越し案件';

-- job_assignments テーブル
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('driver', 'worker', 'leader', 'supervisor')),
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  worked_hours DECIMAL(5,2),
  points_earned INT DEFAULT 0 CHECK (points_earned >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'checked_in', 'completed', 'cancelled', 'absent')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_employee ON job_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status ON job_assignments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_assignments_unique ON job_assignments(job_id, employee_id);

COMMENT ON TABLE job_assignments IS '案件担当割当';

-- reviews テーブル
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  reviewer_name VARCHAR(200) NOT NULL,
  reviewer_email VARCHAR(255),
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  service_quality_rating INT CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  comment TEXT,
  would_recommend BOOLEAN,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  response_from_company TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible ON reviews(is_visible) WHERE is_visible = true;

COMMENT ON TABLE reviews IS 'レビュー・評価';

-- ========================================
-- 7. System Tables
-- ========================================

-- notifications テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('quote_request', 'quote_received', 'quote_accepted', 'job_assigned', 'job_reminder', 'job_completed', 'payment_received', 'review_received', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS '通知';

-- ========================================
-- 8. Foreign Keys
-- ========================================

-- users関連
ALTER TABLE moving_companies ADD CONSTRAINT fk_moving_companies_owner
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employees ADD CONSTRAINT fk_employees_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE employees ADD CONSTRAINT fk_employees_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE real_estate_agents ADD CONSTRAINT fk_real_estate_agents_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- trucks, shifts
ALTER TABLE trucks ADD CONSTRAINT fk_trucks_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE shifts ADD CONSTRAINT fk_shifts_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- referrals
ALTER TABLE referrers ADD CONSTRAINT fk_referrers_agent
  FOREIGN KEY (agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

ALTER TABLE referral_cases ADD CONSTRAINT fk_referral_cases_referrer
  FOREIGN KEY (referrer_id) REFERENCES referrers(id) ON DELETE CASCADE;

-- quotes
ALTER TABLE quote_requests ADD CONSTRAINT fk_quote_requests_referrer_agent
  FOREIGN KEY (referrer_agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

ALTER TABLE moving_items ADD CONSTRAINT fk_moving_items_request
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE;

ALTER TABLE moving_items ADD CONSTRAINT fk_moving_items_master
  FOREIGN KEY (item_master_id) REFERENCES item_masters(id) ON DELETE SET NULL;

ALTER TABLE quotes ADD CONSTRAINT fk_quotes_request
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE;

ALTER TABLE quotes ADD CONSTRAINT fk_quotes_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE quote_options ADD CONSTRAINT fk_quote_options_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE quote_options ADD CONSTRAINT fk_quote_options_option
  FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE;

-- jobs
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE job_assignments ADD CONSTRAINT fk_job_assignments_job
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE job_assignments ADD CONSTRAINT fk_job_assignments_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT fk_reviews_job
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- ========================================
-- 9. Triggers
-- ========================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moving_companies_updated_at BEFORE UPDATE ON moving_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_real_estate_agents_updated_at BEFORE UPDATE ON real_estate_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrers_updated_at BEFORE UPDATE ON referrers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_cases_updated_at BEFORE UPDATE ON referral_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at BEFORE UPDATE ON job_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_masters_updated_at BEFORE UPDATE ON item_masters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_season_rules_updated_at BEFORE UPDATE ON season_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- マイグレーション記録
-- ========================================

INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Initial schema creation - All 19 tables, foreign keys, and triggers')
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- 完了メッセージ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 19 tables';
  RAISE NOTICE '  - All foreign key constraints';
  RAISE NOTICE '  - All update triggers';
  RAISE NOTICE '  - All indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run seed data (optional)';
  RAISE NOTICE '  2. Generate Prisma Client: npx prisma generate';
  RAISE NOTICE '  3. Test connection: npx prisma db pull';
END $$;
