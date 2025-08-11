@echo off
echo Starting MongoDB...
echo.
echo If this fails, try one of these options:
echo.
echo Option 1: Run as Administrator and execute:
echo   net start MongoDB
echo.
echo Option 2: Start MongoDB manually:
echo   mongod --dbpath "C:\data\db"
echo.
echo Option 3: If using MongoDB Atlas, update the MONGODB_URI in backend\.env
echo.
pause

REM Try to start MongoDB service
net start MongoDB
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Service start failed. Trying manual start...
    echo Make sure the data directory exists: C:\data\db
    echo.
    mongod --dbpath "C:\data\db"
)
