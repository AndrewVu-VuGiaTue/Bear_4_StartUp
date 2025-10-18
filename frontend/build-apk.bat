@echo off
echo ========================================
echo Building BEAR APK locally
echo ========================================
echo.

echo [1/5] Cleaning previous builds...
if exist android\app\build\outputs\apk rmdir /s /q android\app\build\outputs\apk

echo [2/5] Installing dependencies...
call npm install

echo [3/5] Running prebuild...
call npx expo prebuild --platform android --clean

echo [4/5] Building APK...
cd android
call gradlew assembleRelease
cd ..

echo [5/5] Done!
echo.
echo ========================================
echo APK file location:
echo android\app\build\outputs\apk\release\app-release.apk
echo ========================================
echo.
echo Copy this file to your phone and install it!
pause
