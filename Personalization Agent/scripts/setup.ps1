# Setup script for Windows PowerShell
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Starting PostgreSQL (pgvector)..." -ForegroundColor Cyan
docker compose up -d
Start-Sleep -Seconds 5

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env — add your GOOGLE_API_KEY" -ForegroundColor Yellow
}

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
.\venv\Scripts\pip install -r requirements.txt

Write-Host "Seeding 6 months mock data..." -ForegroundColor Cyan
.\venv\Scripts\python -m app.data.seed_mock_data

Write-Host "`nSetup complete! Run: .\venv\Scripts\python run.py" -ForegroundColor Green
Write-Host "API docs: http://localhost:8000/docs" -ForegroundColor Green
