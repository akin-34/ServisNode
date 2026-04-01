@echo off
setlocal
set REPO_URL=https://github.com/akin-34/ServisNode.git

echo [INFO] ServisNode GitHub Yayini Baslatiliyor...
echo ------------------------------------------

:: Git kontrolü
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Git sisteminizde yuklu degil! Lutfen Git yukleyip tekrar deneyin.
    pause
    exit /b
)

:: Git baslatilmamissa baslat
if not exist .git (
    echo [INFO] Git deposu baslatiliyor...
    git init
    git branch -M main
)

:: Uzak depo (remote) kontrolü
git remote -v | find "origin" >nul
if %errorlevel% neq 0 (
    echo [INFO] Remote origin ekleniyor: %REPO_URL%
    git remote add origin %REPO_URL%
)

:: Degisiklikleri ekle ve commit et
echo [INFO] Dosyalar hazirlaniyor...
git add .

set /p commit_msg="Commit mesaji girin (Bos birakirsaniz varsayilan kullanilir): "
if "%commit_msg%"=="" set commit_msg="Initial commit - ServisNode Project Foundation"

echo [INFO] Commit islemi yapiliyor...
git commit -m "%commit_msg%"

:: Push islemi
echo [INFO] GitHub'a yukleniyor (main branch)...
git push -u origin main

if %errorlevel% neq 0 (
    echo [HATA] Push islemi sirasinda bir hata olustu. Lutfen internet baglantinizi ve yetkilerinizi kontrol edin.
) else (
    echo ------------------------------------------
    echo [BASARILI] Proje basariyla GitHub'a gonderildi!
    echo URL: %REPO_URL%
)

pause
