# AgroVision Backend - One-Click Deployment Setup (Windows)

# 1. Check for Node.js (Required for PM2)
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit
}

# 2. Check for Python
if (!(Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Please install Python 3.x" -ForegroundColor Red
    exit
}

# 3. Setup Virtual Environment
Write-Host "Creating Python virtual environment..."
python -m venv .venv
& .venv\Scripts\pip install flask flask-cors waitress

# 4. Install PM2
Write-Host "Installing PM2 via npm..."
npm install pm2 -g

# 5. Start the Backend
Write-Host "Starting AgroVision Backend in background (Port 8080)..."
pm2 delete agrovision-backend 2>$null
pm2 start "agrovision-backend/start_waitress.py" --name "agrovision-backend" --interpreter ".venv/Scripts/pythonw.exe"
pm2 save

Write-Host "✅ Deployment Complete! Backend is running in the background." -ForegroundColor Green
Write-Host "Check status with: pm2 status"
Write-Host "Check logs with: pm2 logs agrovision-backend"
