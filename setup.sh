#!/bin/bash
# MCP Image Generator 快速配置脚本
# 适用于 macOS/Linux

set -e

echo "🎨 MCP Image Generator - Quick Setup"
echo "======================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装! 请先安装Node.js 18或更高版本"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低 (当前: $(node -v), 需要: >=18.0.0)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install
echo ""

# 配置.env文件
if [ ! -f .env ]; then
    echo "🔧 配置API密钥..."
    echo ""

    read -p "请输入你的OPENAI_API_KEY: " api_key
    read -p "请输入API端点URL (默认: https://api.openai.com): " api_base

    api_base=${api_base:-https://api.openai.com}

    cat > .env << EOF
# API配置
OPENAI_API_KEY=$api_key
OPENAI_API_BASE=$api_base

# 图片存储路径 (可选)
IMAGE_STORAGE_PATH=$HOME/claude-images

# 默认配置
DEFAULT_MODEL=gpt-image-2.5-flare
DEFAULT_SIZE=1024x1024
DEFAULT_QUALITY=high
EOF

    echo ""
    echo "✅ .env文件已创建"
else
    echo "ℹ️  .env文件已存在,跳过配置"
fi

echo ""
echo "======================================"
echo "✨ 安装完成!"
echo ""
echo "下一步: 配置你的MCP客户端"
echo "详细说明: 查看 MCP_CLIENTS.md"
echo ""
echo "测试运行: node index.js"
echo "======================================"
