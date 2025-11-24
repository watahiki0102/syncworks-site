@echo off
REM ========================================
REM DDL一括実行スクリプト（Windows用）
REM Description: すべてのDDLを順番に実行
REM Created: 2025-01-24
REM ========================================

echo SyncWorks データベース構築開始...
echo.

REM 設定
set PGUSER=syncworks_app
set PGDATABASE=syncworks_db
set PGHOST=localhost
set PGPORT=5432

echo [1/20] データベース初期セットアップ...
psql -U postgres -f 00_setup\create_database.sql
if %ERRORLEVEL% neq 0 (
    echo エラー: データベース作成に失敗しました
    pause
    exit /b 1
)

echo [2/20] users テーブル作成...
psql -f 01_core\01_users.sql

echo [3/20] moving_companies テーブル作成...
psql -f 01_core\02_moving_companies.sql

echo [4/20] item_masters テーブル作成...
psql -f 06_masters\01_item_masters.sql

echo [5/20] pricing_rules テーブル作成...
psql -f 06_masters\02_pricing_rules.sql

echo [6/20] options テーブル作成...
psql -f 06_masters\03_options.sql

echo [7/20] season_rules テーブル作成...
psql -f 06_masters\04_season_rules.sql

echo [8/20] employees テーブル作成...
psql -f 02_resources\01_employees.sql

echo [9/20] trucks テーブル作成...
psql -f 02_resources\02_trucks.sql

echo [10/20] real_estate_agents テーブル作成...
psql -f 03_referrals\01_real_estate_agents.sql

echo [11/20] referrers テーブル作成...
psql -f 03_referrals\02_referrers.sql

echo [12/20] quote_requests テーブル作成...
psql -f 04_quotes\01_quote_requests.sql

echo [13/20] moving_items テーブル作成...
psql -f 04_quotes\02_moving_items.sql

echo [14/20] quotes テーブル作成...
psql -f 04_quotes\03_quotes.sql

echo [15/20] quote_options テーブル作成...
psql -f 04_quotes\04_quote_options.sql

echo [16/20] referral_cases テーブル作成...
psql -f 03_referrals\03_referral_cases.sql

echo [17/20] jobs テーブル作成...
psql -f 05_jobs\01_jobs.sql

echo [18/20] job_assignments テーブル作成...
psql -f 05_jobs\02_job_assignments.sql

echo [19/20] reviews テーブル作成...
psql -f 05_jobs\03_reviews.sql

echo [20/20] shifts テーブル作成...
psql -f 02_resources\03_shifts.sql

echo [21/20] notifications テーブル作成...
psql -f 07_system\01_notifications.sql

echo [22/20] 外部キー追加...
psql -f 98_foreign_keys\add_foreign_keys.sql

echo [23/20] トリガー追加...
psql -f 99_triggers\update_timestamps.sql

echo.
echo ========================================
echo データベース構築完了！
echo ========================================
echo.
echo テーブル一覧を表示します...
psql -c "\dt"

echo.
echo 次のステップ:
echo 1. シードデータ投入: cd ..\seeds ^&^& psql -f 01_required\all_masters.sql
echo 2. Prisma設定: cd ..\..\..\ ^&^& npx prisma db pull
echo.
pause
