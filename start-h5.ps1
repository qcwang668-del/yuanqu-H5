<#
  惠企政策 H5（新版零构建单页）本地一键启动
  用法: powershell -ExecutionPolicy Bypass -File start-h5.ps1

  组件与端口：
    MySQL    3306   （已有常驻实例，本脚本只检测）
    Redis    6379   （已有常驻实例，本脚本只检测）
    后端     48081  saas-full/backend/yudao-server/target/yudao-server.jar
    H5       5273   h5-huiqi/dev-server.js（静态托管 + /app-api 同源反代到 48081）
#>

$ErrorActionPreference = 'Continue'

$Root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$H5Dir   = Join-Path $Root 'h5-huiqi'
$Backend = Join-Path $Root 'saas-full\backend'
$Jar     = Join-Path $Backend 'yudao-server\target\yudao-server.jar'
$LogDir  = Join-Path $Root '_logs'
$JavaExe = 'C:\Users\wangyan\Documents\ChatGPT\深投控\liqi-deploy\tools\jdk8u504-b01\bin\java.exe'
$NodeExe = 'C:\Program Files\nodejs\node.exe'

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Test-Port([int]$Port) {
    return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port([int]$Port, [int]$TimeoutSec) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-Port $Port) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

Write-Host '=== 惠企政策 H5 本地环境 ===' -ForegroundColor Cyan

# 1) MySQL
if (Test-Port 3306) { Write-Host '[1/4] MySQL   3306  OK' -ForegroundColor Green }
else { Write-Host '[1/4] MySQL   3306  未运行，请先启动 C:\liqi-local\tools\mysql\bin\mysqld.exe' -ForegroundColor Red }

# 2) Redis
if (Test-Port 6379) { Write-Host '[2/4] Redis   6379  OK' -ForegroundColor Green }
else { Write-Host '[2/4] Redis   6379  未运行，请先启动 redis-server' -ForegroundColor Red }

# 3) 后端 app-api
if (Test-Port 48081) {
    Write-Host '[3/4] 后端    48081 OK（已在运行）' -ForegroundColor Green
} elseif (-not (Test-Path $Jar)) {
    Write-Host "[3/4] 后端    未找到 jar: $Jar，需先执行 mvn clean package -DskipTests" -ForegroundColor Red
} else {
    Start-Process -FilePath $JavaExe `
        -ArgumentList '-jar', "`"$Jar`"", '--spring.profiles.active=local', '--server.port=48081' `
        -WorkingDirectory $Backend -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $LogDir 'backend.log') `
        -RedirectStandardError  (Join-Path $LogDir 'backend-err.log') | Out-Null
    Write-Host '[3/4] 后端    48081 启动中（约 30~60 秒）...' -ForegroundColor Yellow
    if (Wait-Port 48081 180) { Write-Host '[3/4] 后端    48081 已启动' -ForegroundColor Green }
    else { Write-Host "[3/4] 后端    启动超时，查看 $LogDir\backend.log" -ForegroundColor Red }
}

# 4) H5
if (Test-Port 5273) {
    Write-Host '[4/4] H5      5273  OK（已在运行）' -ForegroundColor Green
} else {
    $env:PORT = '5273'
    Start-Process -FilePath $NodeExe -ArgumentList "`"$H5Dir\dev-server.js`"" `
        -WorkingDirectory $H5Dir -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $LogDir 'h5.log') `
        -RedirectStandardError  (Join-Path $LogDir 'h5-err.log') | Out-Null
    if (Wait-Port 5273 30) { Write-Host '[4/4] H5      5273  已启动' -ForegroundColor Green }
    else { Write-Host "[4/4] H5      启动失败，查看 $LogDir\h5-err.log" -ForegroundColor Red }
}

Write-Host ''
Write-Host 'H5 地址  : http://127.0.0.1:5273/   （建议用手机视口）' -ForegroundColor Cyan
Write-Host '后端接口 : http://127.0.0.1:48081/app-api/liqi/*' -ForegroundColor Cyan
Write-Host 'AI 功能  : 需设置环境变量 LIQI_ARK_API_KEY 后重启后端' -ForegroundColor Yellow
