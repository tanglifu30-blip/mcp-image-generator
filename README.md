# 🎨 Image Generator MCP Server

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform-orange)]()

基于 NewAPI 兼容端点的 MCP 图像生成服务器,支持**所有标准MCP客户端**。提供文生图、图生图编辑和变体生成三种模式。

> 🌍 **跨平台支持**: Windows / macOS / Linux  
> 🔌 **通用兼容**: Claude Code / Cursor / Windsurf / Cline / Continue / Zed 等

## 功能特性

### 🎨 三种生成模式
1. **文生图** (`generate_image`) - 从文本描述生成图片
2. **图生图编辑** (`edit_image`) - 编辑现有图片，支持 mask 局部修改
3. **图生图变体** (`create_variation`) - 保持风格和构图，生成变体

### 🚀 高质量模型
- `gpt-image-2.5-flare` - 最新最高质量（默认）
- `gpt-image-2.5-sunburst`
- `gpt-image-2.5`
- `gpt-image-2`

### 📁 自动管理
- 按年月组织文件（`YYYY-MM/`）
- 自动从 prompt 提取标签
- 保存完整元数据
- 全局索引支持检索

### 🔍 图片检索
- 按标签过滤（AND 逻辑）
- 按关键词搜索 prompt
- 按月份筛选
- 按工具类型筛选

## 安装

```bash
cd mcp-servers/image-generator
npm install
```

## 配置

支持三种配置方式,任选其一:

### 方式1: 环境变量 (推荐 - 跨工具通用)

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_API_BASE="https://your-api-endpoint.com"

# macOS/Linux
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_API_BASE="https://your-api-endpoint.com"
```

### 方式2: .env文件 (适合开发)

复制`.env.example`为`.env`,填入配置:

```bash
cp .env.example .env
# 编辑.env文件
```

### 方式3: JSON配置文件 (传统方式)

创建 `~/生图apikey.txt` (或自定义路径):

```json
{
  "key": "sk-your-key-here",
  "url": "https://your-api-endpoint.com"
}
```

---

## 在MCP客户端中使用

### Claude Code 配置

编辑 `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": ["/path/to/mcp-image-generator/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here",
        "OPENAI_API_BASE": "https://your-api-endpoint.com"
      }
    }
  }
}
```

### 其他客户端 (Cursor / Windsurf / Cline)

查看详细配置: **[MCP客户端配置指南](MCP_CLIENTS.md)**

支持的客户端:
- ✅ Claude Code (CLI / Desktop / Web)
- ✅ Cursor IDE
- ✅ Windsurf IDE  
- ✅ VS Code + Cline
- ✅ Continue.dev
- ✅ Zed Editor
- ✅ 所有标准MCP客户端

---

## 使用示例

### 文生图
```javascript
// 在 Claude Code 中直接使用
帮我生成一张永劫无间火男的海报
```

```javascript
// MCP 工具调用
{
  "tool": "generate_image",
  "prompt": "永劫无间火男角色海报，火焰特效",
  "model": "gpt-image-2.5-flare",
  "size": "1024x1792",
  "quality": "hd",
  "n": 1
}
```

### 图生图编辑
```javascript
{
  "tool": "edit_image",
  "image": "base64_encoded_image_or_url",
  "prompt": "将背景改成火焰场景",
  "mask": "optional_base64_mask",  // 可选：只修改透明区域
  "model": "gpt-image-2.5-flare",
  "size": "1024x1024",
  "n": 1
}
```

### 图生图变体
```javascript
{
  "tool": "create_variation",
  "image": "base64_encoded_image_or_url",
  "model": "gpt-image-2.5-flare",
  "size": "1024x1024",
  "n": 2  // 生成 2 个变体
}
```

### 检索图片
```javascript
{
  "tool": "list_images",
  "tags": ["火男", "永劫无间"],  // 必须同时包含这些标签
  "keyword": "海报",            // 在 prompt 中搜索
  "month": "2026-10",          // 筛选 2026 年 10 月
  "tool": "generate_image",    // 只看文生图的结果
  "limit": 20                  // 最多返回 20 条
}
```

## 支持的图片格式

### API 响应格式
- ✅ `b64_json` - base64 编码（当前支持）
- ✅ `url` - 图片 URL（兼容支持）

### 输入图片格式（edit_image / create_variation）
- base64 编码的 PNG
- 图片 URL

### 输出尺寸
- `256x256`
- `512x512`
- `1024x1024` - 默认
- `1792x1024` - 横版
- `1024x1792` - 竖版（海报）

## 文件组织

```
A:\Claude使用image出图\
├── index.json                    # 全局索引
├── 2026-10/                      # 按年月组织
│   ├── 火男-海报_a1b2c3.png      # 图片文件
│   ├── 火男-海报_a1b2c3.png.json # 元数据
│   ├── 小猫_d4e5f6.png
│   └── 小猫_d4e5f6.png.json
└── 2026-11/
    └── ...
```

### 元数据结构
```json
{
  "tool": "generate_image",
  "model": "gpt-image-2.5-flare",
  "prompt": "永劫无间火男角色海报",
  "size": "1024x1792",
  "quality": "hd",
  "revised_prompt": "...",
  "saved_at": "2026-10-29T12:34:56.789Z",
  "local_path": "A:\\Claude使用image出图\\2026-10\\火男-海报_a1b2c3.png",
  "filename": "火男-海报_a1b2c3.png",
  "tags": ["火男", "海报", "永劫无间", "角色"]
}
```

## 标签系统

### 自动提取规则
1. 从 prompt 中提取关键词
2. 转换为小写
3. 过滤停用词（的、一张、image、picture 等）
4. 过滤单字符词
5. 去重
6. 最多保留 10 个标签

### 支持语言
- ✅ 中文
- ✅ 英文
- ✅ 数字
- ✅ 连字符

## 故障排查

### MCP 服务器无法连接
1. 检查路径是否正确（注意空格 vs 连字符）
2. 检查 Node.js 版本（需要 v18+）
3. 检查依赖是否安装 (`npm install`)
4. 重启 Claude Code

### API 调用失败
1. 检查 API 配置文件是否存在
2. 检查 API key 是否有效
3. 检查网络连接
4. 检查 API 端点是否正常

### 图片保存失败
1. 检查存储目录权限
2. 检查磁盘空间
3. 确认 API 返回了有效的图片数据

### 查看日志
MCP 服务器的日志输出到 stderr，可以在 Claude Code 的控制台中查看。

## 测试

### 单元测试
```bash
# 测试 base64 图片处理
node test-b64.js

# 测试 URL 图片下载
node test-generate.js
```

### 预期输出
```
✓ API Config loaded
✓ API call successful
✓ Got b64_json from API
✓ Decoded base64, size: 2305380 bytes
✓ Image saved to: ...
✓ File size on disk: 2305380 bytes

✅ All tests passed!
```

## 技术栈

- **MCP SDK** - `@modelcontextprotocol/sdk` ^0.5.0
- **HTTP 客户端** - `axios` ^1.6.0
- **Node.js** - v18+ (推荐 v24+)
- **协议** - stdio transport

## 版本历史

### v1.0.0 (2026-10-29)
- ✅ 支持文生图、图生图编辑、图生图变体
- ✅ 支持 base64 和 URL 两种图片格式
- ✅ 自动标签提取
- ✅ 按月份组织文件
- ✅ 全局索引和检索
- ✅ 完整元数据保存

## 许可证

MIT - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issues 和 Pull Requests!

## 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Code](https://claude.ai/code)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

---

Made with ❤️ by Claude Opus 5.5
