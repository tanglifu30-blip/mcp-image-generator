# 兼容性说明

## 🌍 MCP客户端兼容性

本MCP服务器完全符合[Model Context Protocol](https://modelcontextprotocol.io)标准,兼容所有标准MCP客户端。

### ✅ 已测试兼容

| 工具 | 平台 | 状态 | 配置文档 |
|------|------|------|----------|
| **Claude Code** | Windows / macOS / Linux | ✅ 完全兼容 | [查看配置](MCP_CLIENTS.md#claude-code-cli--desktop--web) |
| **Cursor** | Windows / macOS / Linux | ✅ 完全兼容 | [查看配置](MCP_CLIENTS.md#cursor-ide) |
| **Windsurf** | Windows / macOS / Linux | ✅ 完全兼容 | [查看配置](MCP_CLIENTS.md#windsurf-ide) |
| **VS Code + Cline** | Windows / macOS / Linux | ✅ 完全兼容 | [查看配置](MCP_CLIENTS.md#vs-code--cline插件) |
| **Continue.dev** | Windows / macOS / Linux | ✅ 理论兼容 | [查看配置](MCP_CLIENTS.md#continuedev-vs-code--jetbrains) |
| **Zed Editor** | macOS / Linux | ✅ 理论兼容 | [查看配置](MCP_CLIENTS.md#zed-editor) |

### 🎯 通用MCP客户端

任何实现了标准MCP协议的客户端都应该可以使用本服务器,只需配置:

```json
{
  "command": "node",
  "args": ["/path/to/index.js"],
  "env": {
    "OPENAI_API_KEY": "your-key",
    "OPENAI_API_BASE": "your-endpoint"
  }
}
```

---

## 🔌 API端点兼容性

### ✅ 已测试兼容

| API端点 | 状态 | 说明 |
|---------|------|------|
| **OpenAI官方API** | ✅ 完全兼容 | `https://api.openai.com` |
| **NewAPI部署** | ✅ 完全兼容 | 自建NewAPI服务 |
| **Azure OpenAI** | ✅ 理论兼容 | 需配置正确的端点格式 |
| **OpenAI兼容代理** | ✅ 理论兼容 | 如Cloudflare AI Gateway |

### 要求

API端点必须支持以下OpenAI接口:

- `POST /v1/images/generations` - 文生图
- `POST /v1/images/edits` - 图生图编辑
- `POST /v1/images/variations` - 图生图变体

---

## 💻 平台兼容性

### ✅ 操作系统

| 平台 | 状态 | 最低版本 |
|------|------|----------|
| **Windows** | ✅ 完全支持 | Windows 10+ |
| **macOS** | ✅ 完全支持 | macOS 10.15+ |
| **Linux** | ✅ 完全支持 | Ubuntu 18.04+ / Debian 10+ |

### ✅ Node.js版本

| 版本 | 状态 |
|------|------|
| **Node.js 18.x** | ✅ 推荐 |
| **Node.js 20.x** | ✅ 推荐 |
| **Node.js 22.x** | ✅ 支持 |
| Node.js 16.x | ⚠️ 理论支持,未测试 |
| Node.js 14.x及以下 | ❌ 不支持 |

---

## 🔧 配置方式兼容性

### 1. 环境变量 (推荐)

**优点:**
- ✅ 跨工具通用
- ✅ 易于CI/CD集成
- ✅ 不会泄露到Git

**适用场景:**
- 多个MCP客户端共享配置
- 容器化部署
- CI/CD环境

### 2. .env文件

**优点:**
- ✅ 适合开发环境
- ✅ 易于版本控制(通过.env.example)
- ✅ 本地配置隔离

**适用场景:**
- 本地开发
- 多套API密钥切换
- 团队协作

### 3. JSON配置文件

**优点:**
- ✅ 向后兼容
- ✅ 可以存储复杂配置
- ✅ 易于程序化读取

**适用场景:**
- 需要多个配置项
- 从旧版本迁移
- 配置管理系统集成

---

## 🐛 已知限制

### 1. 图片格式限制

- ✅ 支持: PNG (推荐), JPEG, WebP
- ❌ 不支持: GIF, BMP, TIFF等
- ✅ 输出格式: 始终为PNG

### 2. 图片大小限制

根据OpenAI API限制:

- 文生图: 最大 `1792x1024` 或 `1024x1792`
- 图生图: 需要正方形输入 (`1024x1024`等)
- Base64编码: 建议 < 4MB

### 3. 并发限制

取决于你的API端点:

- OpenAI官方: 根据账户等级
- NewAPI: 根据部署配置
- 建议: 不要同时发起超过3个请求

### 4. 文件系统

- Windows: 文件名不能包含 `<>:"|?*`
- macOS/Linux: 文件名不能包含 `/`
- 自动处理: 从prompt中提取的文件名会自动清理

---

## 📋 测试清单

在新环境中部署后,建议测试:

- [ ] **基本功能**: 文生图工具能否正常生成
- [ ] **图生图**: 编辑和变体功能
- [ ] **文件保存**: 图片是否正确保存到存储路径
- [ ] **元数据**: JSON元数据文件是否创建
- [ ] **索引文件**: index.json是否更新
- [ ] **费用追踪**: cost-log.json是否记录
- [ ] **检索功能**: search_images工具是否正常

---

## 🤝 报告兼容性问题

如果你在某个环境中遇到兼容性问题,请提供:

1. **环境信息**
   - 操作系统及版本
   - Node.js版本 (`node -v`)
   - MCP客户端及版本

2. **错误信息**
   - 完整的错误堆栈
   - MCP客户端的日志
   - 配置文件内容 (隐藏密钥)

3. **重现步骤**
   - 如何触发该问题
   - 是否每次都会发生

提交Issue: https://github.com/tanglifu30-blip/mcp-image-generator/issues

---

## 📚 相关文档

- [MCP客户端配置指南](MCP_CLIENTS.md)
- [使用手册](USAGE.md)
- [API文档](README.md#api-说明)
- [常见问题](README.md#常见问题)
