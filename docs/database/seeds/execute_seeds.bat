@echo off
REM ========================================
REM シードデータ一括実行スクリプト（Windows）
REM Created: 2025-01-24
REM ========================================

echo ========================================
echo SyncWorks Database Seed Script
echo ========================================
echo.

REM 環境変数の確認
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set
    echo Please set: DATABASE_URL=postgresql://user:password@localhost:5432/syncworks_db
    pause
    exit /b 1
)

echo Database URL: %DATABASE_URL%
echo.

REM 実行モードの選択
echo Select execution mode:
echo [1] Required master data only (recommended for production)
echo [2] Required + Development test data (for development)
echo.
set /p MODE="Enter mode (1 or 2): "

if "%MODE%"=="1" goto REQUIRED_ONLY
if "%MODE%"=="2" goto FULL_SEED
echo Invalid selection
pause
exit /b 1

:REQUIRED_ONLY
echo.
echo ========================================
echo Executing REQUIRED master data only
echo ========================================
echo.

echo [1/4] Inserting item masters...
psql %DATABASE_URL% -f 01_required\01_item_masters.sql
if errorlevel 1 goto ERROR

echo [2/4] Inserting pricing rules...
psql %DATABASE_URL% -f 01_required\02_pricing_rules.sql
if errorlevel 1 goto ERROR

echo [3/4] Inserting options...
psql %DATABASE_URL% -f 01_required\03_options.sql
if errorlevel 1 goto ERROR

echo [4/4] Inserting season rules...
psql %DATABASE_URL% -f 01_required\04_season_rules.sql
if errorlevel 1 goto ERROR

goto SUCCESS

:FULL_SEED
echo.
echo ========================================
echo Executing FULL seed (Required + Test data)
echo WARNING: This includes test data for development only!
echo ========================================
echo.

echo [1/10] Inserting item masters...
psql %DATABASE_URL% -f 01_required\01_item_masters.sql
if errorlevel 1 goto ERROR

echo [2/10] Inserting pricing rules...
psql %DATABASE_URL% -f 01_required\02_pricing_rules.sql
if errorlevel 1 goto ERROR

echo [3/10] Inserting options...
psql %DATABASE_URL% -f 01_required\03_options.sql
if errorlevel 1 goto ERROR

echo [4/10] Inserting season rules...
psql %DATABASE_URL% -f 01_required\04_season_rules.sql
if errorlevel 1 goto ERROR

echo [5/10] Inserting test users...
psql %DATABASE_URL% -f 02_development\01_test_users.sql
if errorlevel 1 goto ERROR

echo [6/10] Inserting test companies...
psql %DATABASE_URL% -f 02_development\02_test_companies.sql
if errorlevel 1 goto ERROR

echo [7/10] Inserting test employees...
psql %DATABASE_URL% -f 02_development\03_test_employees.sql
if errorlevel 1 goto ERROR

echo [8/10] Inserting test trucks...
psql %DATABASE_URL% -f 02_development\04_test_trucks.sql
if errorlevel 1 goto ERROR

echo [9/10] Inserting test agents...
psql %DATABASE_URL% -f 02_development\05_test_agents.sql
if errorlevel 1 goto ERROR

echo [10/10] Inserting test quote requests...
psql %DATABASE_URL% -f 02_development\06_test_quote_requests.sql
if errorlevel 1 goto ERROR

goto SUCCESS

:ERROR
echo.
echo ========================================
echo ERROR: Seed execution failed!
echo ========================================
pause
exit /b 1

:SUCCESS
echo.
echo ========================================
echo SUCCESS: All seed data inserted successfully!
echo ========================================
echo.
echo Summary:
if "%MODE%"=="1" (
    echo - Item Masters: 37 items
    echo - Pricing Rules: 11 rules
    echo - Options: 27 options
    echo - Season Rules: 19 rules
)
if "%MODE%"=="2" (
    echo - Item Masters: 37 items
    echo - Pricing Rules: 11 rules
    echo - Options: 27 options
    echo - Season Rules: 19 rules
    echo - Test Users: 12 users
    echo - Test Companies: 2 companies
    echo - Test Employees: 4 employees
    echo - Test Trucks: 5 trucks
    echo - Test Agents: 2 agents
    echo - Test Quote Requests: 3 requests
)
echo.
pause
