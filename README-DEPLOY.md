# Deployment Guide - AgroVision Backend

This backend is configured to run silently in the background on Windows using **Waitress** and **PM2**.

## Prerequisites
1. **Node.js**: [Download here](https://nodejs.org/) (Required for PM2 process manager)
2. **Python 3.x**: [Download here](https://www.python.org/)

## One-Click Setup
In the root directory of this project, open PowerShell and run:
```powershell
.\setup_backend.ps1
```
This script will:
- Create a virtual environment (`.venv`)
- Install all dependencies (`flask`, `waitress`, `flask-cors`)
- Install PM2 globally
- Start the backend in a windowless mode (`pythonw.exe`)

## Management Commands
Once deployed, you can manage the backend using these PM2 commands:

- **Check Status**: `pm2 status`
- **View Logs**: `pm2 logs agrovision-backend`
- **Restart**: `pm2 restart agrovision-backend`
- **Stop**: `pm2 stop agrovision-backend`
- **Enable startup on boot**: `pm2 save` (This has already been run by the script)

## Troubleshooting
If you see terminal windows "flashing", it usually means there is a crash at startup. Check the logs:
```powershell
pm2 logs agrovision-backend --lines 50
```
The backend uses `pythonw.exe` to ensure it stays invisible and silent.
