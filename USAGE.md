# 使用指南

## 快速开始

### 1. 生成图片

直接在 Claude 对话中说：

```
生成一张赛博朋克风格的城市夜景
```

图片会自动保存到 `A:\Claude使用image出图\2026-10\cyberpunk-city-night_a1b2c3.png`

### 2. 检索图片

```
列出所有赛博朋克风格的图片
```

```
找出本月生成的所有图片
```

```
搜索包含"城市"关键词的图片
```

### 3. 浏览图片

在浏览器中打开 `viewer.html`，可以：
- 可视化浏览所有图片
- 按标签、关键词、日期过滤
- 点击图片查看大图
- 查看详细元数据

## 存储结构

```
A:\Claude使用image出图\
├─ index.json                          # 全局索引（快速检索）
├─ 2026-10/                            # 按月归档
│  ├─ cyberpunk-city-night_a1b2c3.png
│  ├─ cyberpunk-city-night_a1b2c3.json  # 元数据
│  ├─ portrait-girl-rain_d4e5f6.png
│  └─ portrait-girl-rain_d4e5f6.json
└─ 2026-11/
   └─ ...
```

## 元数据示例

每张图片的 `.json` 文件包含：

```json
{
  "tool": "generate_image",
  "model": "gpt-image-2.5-flare",
  "prompt": "赛博朋克风格的城市夜景",
  "size": "1024x1024",
  "quality": "hd",
  "revised_prompt": "A cyberpunk-style cityscape at night...",
  "original_url": "https://...",
  "saved_at": "2026-10-29T15:30:45.123Z",
  "local_path": "A:\\Claude使用image出图\\2026-10\\cyberpunk-city-night_a1b2c3.png",
  "filename": "cyberpunk-city-night_a1b2c3.png",
  "tags": ["cyberpunk", "city", "night", "cityscape", "style"]
}
```

## 标签系统

### 自动提取规则

1. 从 prompt 中提取所有有意义的词
2. 去除常见词：的、和、一张、a、the、and 等
3. 保留中英文关键词
4. 转换为小写
5. 去重，最多保留 10 个标签

### 示例

| Prompt | 提取的标签 |
|--------|-----------|
| "一张赛博朋克风格的城市夜景" | `["赛博朋克", "风格", "城市", "夜景"]` |
| "portrait of a girl in rain" | `["portrait", "girl", "rain"]` |
| "山水风景画，中国风，水墨" | `["山水", "风景画", "中国风", "水墨"]` |

## 检索技巧

### 按标签检索

```
列出标签包含 "cyberpunk" 和 "city" 的图片
```

### 按关键词检索

```
搜索提示词中包含"肖像"的图片
```

### 按时间检索

```
找出 2026 年 10 月生成的所有图片
```

### 按工具类型检索

```
列出所有通过编辑生成的图片
```

### 组合检索

```
找出本月生成的所有赛博朋克风格的图片
```

## 高级用法

### 1. 批量导出

可以通过 `list_images` 检索后，根据返回的路径批量复制：

1. 检索目标图片
2. 获取路径列表
3. 使用文件管理器批量复制到目标位置

### 2. 备份

整个 `A:\Claude使用image出图\` 目录可以直接备份，包含：
- 所有图片（按月归档）
- 所有元数据 JSON
- 全局索引 `index.json`

### 3. 迁移

如需迁移到其他位置：

1. 修改 `index.js` 中的 `STORAGE_ROOT` 常量
2. 重启 MCP 服务器
3. 移动现有图片目录（可选）

## 注意事项

### URL 过期

- API 返回的 `original_url` 可能在 24 小时后过期
- 始终使用 `local_path` 进行后续操作
- 本地文件永久有效

### 文件命名

- 文件名从 prompt 提取，自动处理特殊字符
- 使用 6 位 hash 防止重名
- 最长 30 字符 + hash，避免路径过长

### 索引更新

- 每次生成图片自动更新 `index.json`
- 如果手动删除图片，需要手动编辑索引
- 索引文件可以重新生成（扫描所有 JSON 元数据）

## 故障排除

### 图片无法加载

1. 检查存储路径是否存在
2. 检查磁盘空间是否充足
3. 检查文件权限

### 检索无结果

1. 确认 `index.json` 是否存在
2. 检查过滤条件是否过严
3. 尝试清除过滤条件重新检索

### Web 浏览器无法显示

1. 确认 `viewer.html` 的路径正确
2. 检查浏览器是否允许访问本地文件
3. 尝试使用 Chrome/Edge（更好的本地文件支持）

## 未来扩展

可选的增强功能（暂未实现）：

- [ ] 调用 Vision API 自动分析图片内容打标签
- [ ] 按标签批量导出/打包功能
- [ ] 图片相似度搜索
- [ ] 自定义标签编辑
- [ ] 统计面板（生成量、常用标签等）
- [ ] 本地 Web 服务器（更好的浏览体验）
