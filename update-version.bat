@echo off
REM Script tự động cập nhật version cho cache busting (Windows)

REM Tạo version từ timestamp hiện tại
for /f "tokens=2 delims==" %%I in ('wmic OS Get localdatetime /value') do set "dt=%%I"
set "version=%dt:~0,12%"

echo 🔄 Updating version to: %version%

REM Backup các file gốc
copy index.html index.html.backup >nul
copy otp.js otp.js.backup >nul
copy messageRenderer.js messageRenderer.js.backup >nul

REM Cập nhật version trong index.html
powershell -Command "(gc index.html) -replace '\?v=\d+', '?v=%version%' | Out-File -encoding UTF8 index.html"

REM Cập nhật version trong các file JS
powershell -Command "(gc otp.js) -replace '\?v=\d+', '?v=%version%' | Out-File -encoding UTF8 otp.js"
powershell -Command "(gc messageRenderer.js) -replace '\?v=\d+', '?v=%version%' | Out-File -encoding UTF8 messageRenderer.js"

echo ✅ Version updated successfully!
echo 📝 Files updated:
echo    - index.html (CSS and main JS)
echo    - otp.js (imports)
echo    - messageRenderer.js (imports)
echo.
echo 📋 Next steps:
echo    1. Test the application
echo    2. git add .
echo    3. git commit -m "Update version to %version%"
echo    4. git push

pause