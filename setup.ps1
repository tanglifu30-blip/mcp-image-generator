# MCP Image Generator 快速配置脚本
# 适用于 Windows PowerShell

$ErrorActionPreference = "Stop"

Write-Host "🎨 MCP Image Generator - Quick Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
try {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js版本过低 (当前: $nodeVersion, 需要: >=18.0.0)" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js未安装! 请先安装Node.js 18或更高版本" -ForegroundColor Red
    Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Cyan
npm install
Write-Host ""

# 配置.env文件
if (-not (Test-Path .env)) {
    Write-Host "🔧 配置API密钥..." -ForegroundColor Cyan
    Write-Host ""

    $apiKey = Read-Host "请输入你的OPENAI_API_KEY"
    $apiBase = Read-Host "请输入API端点URL (默认: https://api.openai.com)"

    if ([string]::IsNullOrWhiteSpace($apiBase)) {
        $apiBase = "https://api.openai.com"
    }

    $storagePath = "$env:USERPROFILE\claude-images" -replace '\\', '/'

    $envContent = @"
# API配置
OPENAI_API_KEY=$apiKey
OPENAI_API_BASE=$apiBase

# 图片存储路径 (可选)
IMAGE_STORAGE_PATH=$storagePath

# 默认配置
DEFAULT_MODEL=gpt-image-2.5-flare
DEFAULT_SIZE=1024x1024
DEFAULT_QUALITY=high
"@

    $envContent | Out-File -FilePath .env -Encoding UTF8

    Write-Host ""
    Write-Host "✅ .env文件已创建" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env文件已存在,跳过配置" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✨ 安装完成!" -ForegroundColor Green
Write-Host ""
Write-Host "下一步: 配置你的MCP客户端" -ForegroundColor Cyan
Write-Host "详细说明: 查看 MCP_CLIENTS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试运行: node index.js" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
