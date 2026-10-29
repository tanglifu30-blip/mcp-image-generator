# 模型质量测试结果

## 测试时间
2026-10-29

## 测试提示词
```
A serene mountain landscape at sunrise, with misty peaks and golden light, 
anime art style with soft watercolor effect and dreamy atmosphere
```

## 测试结果

### 量化指标

| 模型 | 质量设置 | 噪点水平 | 清晰度 | 费用 | 综合评分 |
|------|----------|----------|--------|------|----------|
| gpt-image-2.5-flare | high | 21.38 | 6.72 | $0.10 | ⭐⭐⭐⭐ |
| **gpt-image-2.5-sunburst** | **high** | **21.19** | **6.27** | **$0.08** | **⭐⭐⭐⭐⭐** |
| gpt-image-2.5-sunburst | auto + smooth | 21.83 | 6.51 | $0.08 | ⭐⭐⭐⭐ |

**评分说明**：
- 噪点：越低越好
- 清晰度：越高越好
- 综合考虑性价比

### 关键发现

1. **噪点水平非常接近**
   - flare: 21.38
   - sunburst: 21.19 ✅ **最低**
   - 差异仅 0.9%，实际使用中几乎无差别

2. **清晰度差异**
   - flare: 6.72 ✅ **最高**
   - sunburst: 6.27
   - 差异 6.7%，可能在细节上略有不同

3. **性价比**
   - sunburst 便宜 20% ($0.08 vs $0.10)
   - 质量差异极小
   - **sunburst 性价比最优**

4. **quality 参数影响**
   - `quality: 'auto'` 并未显著减少噪点
   - 添加 "smooth" 关键词效果有限
   - **建议保持 `quality: 'high'`**

## 结论与建议

### 🏆 推荐配置

**默认模型**: `gpt-image-2.5-sunburst`

**理由**:
1. ✅ 噪点最低 (21.19)
2. ✅ 便宜 20% ($0.08 vs $0.10)
3. ✅ 清晰度仅略低 6.7%
4. ✅ 综合性价比最高

**质量设置**: `quality: 'high'`
- `auto` 未显示明显优势
- `high` 提供稳定的高质量输出

### 使用建议

#### 日常使用
```javascript
model: 'gpt-image-2.5-sunburst'
quality: 'high'
size: '1024x1024'
```

#### 预算紧张
```javascript
model: 'gpt-image-2.5-sunburst'
quality: 'high'
size: '512x512'  // 便宜 25%
```

#### 追求极致质量
```javascript
model: 'gpt-image-2.5-flare'
quality: 'high'
size: '1024x1024'
// 额外支付 $0.02 换取 6.7% 清晰度提升
```

### 提示词优化

对于减少噪点：
✅ **有效**:
- "anime art style with soft watercolor effect"
- "dreamy atmosphere"

⚠️ **效果有限**:
- "smooth and clean" 
- `quality: 'auto'`

## 成本分析

### 月预算 $5 可生成

| 模型 | 1024x1024 | 512x512 |
|------|-----------|---------|
| **sunburst** | **62 张** | **83 张** |
| flare | 50 张 | 62 张 |

**结论**: sunburst 能多生成 24% 的图片

## 实施

### 更新默认配置

文件: `index.js` 第 149 行
```javascript
const DEFAULT_MODEL = 'gpt-image-2.5-sunburst'; // 更改自 flare
```

### 更新文档

在工具描述中明确推荐：
```
Uses gpt-image-2.5-sunburst by default (最佳性价比)
```

## 用户反馈验证

❓ **待验证**: 用户对 sunburst 输出的主观感受
- 噪点是否可接受
- 动漫风格是否理想
- 细节表现是否满意

建议用户测试后提供反馈。

---

**测试完成时间**: 2026-10-29  
**测试成本**: $0.26 (3 张图片)  
**推荐模型**: gpt-image-2.5-sunburst ⭐⭐⭐⭐⭐
