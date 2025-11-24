-- ========================================
-- Seed: Test Users (テストデータ)
-- Description: テストユーザーアカウント
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- パスワード: すべて "password123" でハッシュ化
-- 実際の運用では bcrypt などで適切にハッシュ化すること

-- 管理者
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'admin@syncworks.jp', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'admin', 'システム管理者', '03-1234-5678', true);

-- 引越し業者オーナー
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('55555555-5555-5555-5555-555555555502', 'owner1@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'business_owner', '田中太郎', '090-1111-1111', true),
('55555555-5555-5555-5555-555555555503', 'owner2@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'business_owner', '佐藤花子', '090-2222-2222', true);

-- 従業員
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('55555555-5555-5555-5555-555555555504', 'employee1@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'employee', '山田一郎', '090-3333-3333', true),
('55555555-5555-5555-5555-555555555505', 'employee2@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'employee', '鈴木二郎', '090-4444-4444', true),
('55555555-5555-5555-5555-555555555506', 'employee3@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'employee', '高橋三郎', '090-5555-5555', true),
('55555555-5555-5555-5555-555555555507', 'employee4@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'employee', '渡辺四郎', '090-6666-6666', true);

-- 不動産業者
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('55555555-5555-5555-5555-555555555508', 'agent1@realestate.jp', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'agent', '伊藤美咲', '03-9999-0001', true),
('55555555-5555-5555-5555-555555555509', 'agent2@realestate.jp', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'agent', '中村裕子', '03-9999-0002', true);

-- 顧客
INSERT INTO users (id, email, password_hash, role, display_name, phone_number, is_active) VALUES
('55555555-5555-5555-5555-555555555510', 'customer1@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'customer', '木村健太', '080-1111-1111', true),
('55555555-5555-5555-5555-555555555511', 'customer2@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'customer', '小林真美', '080-2222-2222', true),
('55555555-5555-5555-5555-555555555512', 'customer3@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'customer', '加藤由紀', '080-3333-3333', true);

-- 合計: 12ユーザー
