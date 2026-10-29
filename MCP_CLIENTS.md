# MCP客户端配置指南

本MCP服务器兼容所有标准的Model Context Protocol客户端。以下是各主流工具的配置方法。

## 🎯 通用配置步骤

### 1. 安装依赖
```bash
cd mcp-image-generator
npm install
```

### 2. 配置API密钥

选择以下**任一方式**配置API密钥:

#### 方式A: 环境变量 (推荐)
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_API_BASE="https://your-api-endpoint.com"

# macOS/Linux
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_API_BASE="https://your-api-endpoint.com"
```

#### 方式B: .env文件
复制`.env.example`为`.env`,填入你的API密钥:
```bash
cp .env.example .env
# 然后编辑.env文件
```

#### 方式C: JSON配置文件
创建配置文件 (Windows示例):
```json
// 路径: C:\Users\YourName\生图apikey.txt
{
  "key": "sk-your-key-here",
  "url": "https://your-api-endpoint.com"
}
```

---

## 🔧 各工具配置方法

### Claude Code (CLI / Desktop / Web)

配置文件位置:
- Windows: `C:\Users\YourName\.claude\config.json`
- macOS: `~/.claude/config.json`
- Linux: `~/.claude/config.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-image-generator/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here",
        "OPENAI_API_BASE": "https://your-api-endpoint.com",
        "IMAGE_STORAGE_PATH": "/path/to/save/images"
      }
    }
  }
}
```

### Cursor IDE

配置文件位置:
- Windows: `%APPDATA%\Cursor\User\globalStorage\mcp-config.json`
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/mcp-config.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-image-generator/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here",
        "OPENAI_API_BASE": "https://your-api-endpoint.com"
      }
    }
  }
}
```

### Windsurf IDE

配置文件位置:
- Windows: `%APPDATA%\Windsurf\mcp\settings.json`
- macOS: `~/Library/Application Support/Windsurf/mcp/settings.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-image-generator/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

### VS Code + Cline插件

配置文件位置:
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-image-generator/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

### Continue.dev (VS Code / JetBrains)

在`~/.continue/config.json`中添加:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "name": "image-generator",
        "command": "node",
        "args": [
          "/absolute/path/to/mcp-image-generator/index.js"
        ],
        "env": {
          "OPENAI_API_KEY": "sk-your-key-here"
        }
      }
    ]
  }
}
```

### Zed Editor

在`~/.config/zed/settings.json`中:

```json
{
  "context_servers": {
    "image-generator": {
      "command": {
        "path": "node",
        "args": [
          "/absolute/path/to/mcp-image-generator/index.js"
        ],
        "env": {
          "OPENAI_API_KEY": "sk-your-key-here"
        }
      }
    }
  }
}
```

---

## 🌍 环境变量说明

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI API密钥 |
| `OPENAI_API_BASE` | ❌ | `https://api.openai.com` | API端点URL |
| `IMAGE_STORAGE_PATH` | ❌ | `~/claude-images` | 图片保存路径 |
| `DEFAULT_MODEL` | ❌ | `gpt-image-2.5-flare` | 默认使用的模型 |
| `DEFAULT_SIZE` | ❌ | `1024x1024` | 默认图片尺寸 |
| `DEFAULT_QUALITY` | ❌ | `high` | 默认图片质量 |

---

## 🔍 验证配置

配置完成后,在你的AI助手中尝试:

```
生成一张可爱的小猫图片
```

或者直接调用MCP工具:

```javascript
{
  "tool": "mcp__image-generator__generate_image",
  "prompt": "cute kitten",
  "model": "gpt-image-2.5-flare",
  "size": "1024x1024"
}
```

---

## 🐛 常见问题

### 问题1: "API配置未找到"

**解决方案**: 确保设置了`OPENAI_API_KEY`环境变量,或创建了`.env`文件。

### 问题2: "node: command not found"

**解决方案**: 
1. 确保安装了Node.js (v18+)
2. 配置中使用Node.js的完整路径,例如:
   - Windows: `C:\\Program Files\\nodejs\\node.exe`
   - macOS: `/usr/local/bin/node`

### 问题3: 路径包含空格

**Windows示例**:
```json
"args": ["C:\\Program Files\\mcp\\image-generator\\index.js"]
```

### 问题4: 图片保存失败

**解决方案**: 
1. 检查`IMAGE_STORAGE_PATH`路径权限
2. 确保路径已存在或程序有创建权限

---

## 📚 支持的API端点

- ✅ OpenAI官方API (`https://api.openai.com`)
- ✅ NewAPI部署的端点
- ✅ OpenAI兼容的第三方API (如Azure OpenAI)
- ✅ 自建的OpenAI代理

---

## 🤝 获取帮助

- 提交Issue: [GitHub Issues](https://github.com/tanglifu30-blip/mcp-image-generator/issues)
- 查看文档: [README.md](README.md)
- 测试连接: 运行 `node index.js` 查看启动日志
