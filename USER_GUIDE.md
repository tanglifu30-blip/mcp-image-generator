# Image Generator 用户指南

## 🎯 针对零预算开发者优化

本指南帮助你在有限预算下最大化图片生成质量和成本效益。

---

## 💰 费用对比（2026年10月定价）

### 每张 1024x1024 图片费用

| 模型 | 费用 | 适用场景 | 推荐度 |
|------|------|----------|--------|
| **gpt-image-2.5-flare** | $0.10 | 最高质量要求 | ⭐⭐⭐ |
| **gpt-image-2.5-sunburst** | $0.08 | 平衡质量与成本 | ⭐⭐⭐⭐⭐ |
| **gpt-image-2.5** | $0.06 | 日常使用 | ⭐⭐⭐⭐ |
| **gpt-image-2** | $0.04 | 预算紧张 | ⭐⭐⭐ |

### 成本优化技巧

1. **选择合适尺寸**
   - `256x256`: 便宜 40%，适合缩略图
   - `512x512`: 便宜 20%，适合预览
   - `1024x1024`: 标准尺寸
   - `1792x1024`: 宽屏，同价

2. **先测试后批量**
   - 用小尺寸测试提示词
   - 满意后再生成大尺寸

3. **善用编辑而非重生成**
   - `edit_image` 修改现有图片
   - 避免完全重新生成

---

## 🎨 解决噪点问题

### 当前测试状态
- ✅ flare 模型：质量最高，可能噪点较多
- 🧪 sunburst 模型：待测试（更便宜）
- 🧪 2.5 模型：待测试（最佳性价比？）

### 测试建议
使用相同提示词测试不同模型：
```
A serene mountain landscape at sunrise, 
anime art style with soft watercolor effect
```

观察：
- 图片清晰度
- 噪点情况
- 色彩饱和度

### 质量参数实验
```javascript
// 测试 1: 默认高质量
quality: 'high'

// 测试 2: 自动质量
quality: 'auto'

// 观察哪个噪点更少
```

---

## 📊 费用追踪

### 查看费用
每次生成后，返回结果包含：
```json
{
  "cost": {
    "this_request": "$0.0800 USD",      // 本次花费
    "unit_cost": "$0.0800 USD per image", // 单价
    "total_spent": "$0.2800 USD",       // 累计花费
    "total_requests": 3                 // 总请求数
  }
}
```

### 费用日志文件
位置: `A:\Claude使用image出图\cost-log.json`

示例：
```json
[
  {
    "timestamp": "2026-10-29T12:00:00.000Z",
    "tool": "generate_image",
    "model": "gpt-image-2.5-sunburst",
    "size": "1024x1024",
    "n": 1,
    "cost": 0.08,
    "unit_cost": 0.08,
    "currency": "USD"
  }
]
```

### 预算控制建议
- 每月设定预算（例如 $5）
- 定期检查 `cost-log.json`
- $5 可以生成约 60 张 sunburst 图片

---

## 🔧 工作流优化

### 推荐工作流：动漫风格图片

1. **文生图测试** ($0.08)
   ```
   用 sunburst 生成 1024x1024
   检查构图和风格
   ```

2. **风格调整** ($0.08)
   ```
   用 edit_image 修改风格
   避免重新生成
   ```

3. **最终优化** ($0.08)
   ```
   如果需要，用 flare 生成最终版
   ```

总成本: $0.16-0.24 vs 多次重生成 $0.30+

### 提示词技巧

#### 动漫/插画风格
✅ 推荐：
```
anime art style, soft watercolor effect, dreamy atmosphere
```

❌ 可能被过滤：
```
Studio Ghibli style, Hayao Miyazaki
```

#### 避免噪点
添加：
```
clean, smooth, soft lighting, gentle colors
```

避免：
```
highly detailed, ultra realistic, sharp
```

---

## 🚀 快速参考

### 生成新图片
```javascript
model: 'gpt-image-2.5-sunburst'  // 推荐：最佳性价比
size: '1024x1024'                 // 标准尺寸
quality: 'high'                   // 或 'auto' 测试噪点
```

### 编辑现有图片
```javascript
image: 'A:\\路径\\到\\图片.png'
prompt: 'Convert to anime art style'
// 不指定 size 会保持原图尺寸
```

### 搜索历史图片
```javascript
tags: ['anime', 'landscape']     // 标签过滤
keyword: 'mountain'               // 关键词搜索
month: '2026-10'                  // 按月份过滤
```

---

## 📈 性能建议

### 单次请求 vs 批量
- `n: 1` - 节省成本，逐步调整
- `n: 2-4` - 提供选择，但成本翻倍

### 最佳实践
1. 总是先用 `n: 1` 测试
2. 满意后再考虑生成变体
3. 使用 `edit_image` 微调

---

## 🐛 常见问题

### Q: 图片噪点太多怎么办？
A: 尝试：
1. 换用 sunburst 或 2.5 模型
2. quality 改为 'auto'
3. 提示词加入 'smooth, clean, soft'

### Q: 如何选择模型？
A: 
- 预算充足 → flare ($0.10)
- 平衡选择 → sunburst ($0.08) **推荐**
- 节省成本 → 2.5 ($0.06)

### Q: 累计费用如何查看？
A: 
1. 每次生成都会显示 `total_spent`
2. 查看 `A:\Claude使用image出图\cost-log.json`

### Q: 如何重启 MCP 服务器？
A: 
1. 代码更新后需要完全重启 Claude Code
2. 或运行: `Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process`

---

## 📝 更新日志
详见 [CHANGELOG.md](./CHANGELOG.md)

## 🤝 反馈
遇到问题或有改进建议？直接告诉 Claude，会被记录到记忆系统中。
