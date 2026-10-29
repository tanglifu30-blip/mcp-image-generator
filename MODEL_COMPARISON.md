# Image Generation Models Comparison

## Available Models

### 1. gpt-image-2.5-flare (当前默认)
- **定价**: $0.10/image (1024x1024)
- **特点**: 最新、最高质量
- **已知问题**: 用户反馈噪点较多

### 2. gpt-image-2.5-sunburst
- **定价**: $0.08/image (1024x1024)
- **特点**: GPT Image 2.5 系列的另一个变体
- **状态**: 待测试

### 3. gpt-image-2.5
- **定价**: $0.06/image (1024x1024)
- **特点**: 标准 GPT Image 2.5
- **状态**: 待测试

### 4. gpt-image-2
- **定价**: $0.04/image (1024x1024)
- **特点**: 上一代模型
- **状态**: 待测试

## 测试方案

### 测试提示词
使用相同的提示词在不同模型上生成，对比：
1. 图片清晰度
2. 噪点情况
3. 风格一致性
4. 细节表现

### 推荐测试用例
```
A serene mountain landscape at sunrise, with misty peaks and golden light, 
anime art style with soft watercolor effect and dreamy atmosphere
```

## 噪点问题分析

### 可能原因
1. **模型特性**: flare 模型本身可能倾向于更多细节/纹理
2. **质量参数**: `quality: 'high'` 在某些模型可能过度锐化
3. **尺寸选择**: 1024x1024 可能不是最优选择

### 解决方案
1. **测试不同模型**: 对比 flare vs sunburst
2. **调整质量参数**: 尝试 `quality: 'auto'`
3. **后处理**: 如果所有模型都有噪点，考虑添加降噪步骤

## 成本效益分析

| Model | 1024x1024 | 质量 | 成本效益 |
|-------|-----------|------|----------|
| flare | $0.10 | 最高(?) | 待评估 |
| sunburst | $0.08 | 未知 | 待评估 |
| 2.5 | $0.06 | 未知 | 待评估 |
| 2 | $0.04 | 较低 | 低 |

## 决策建议

**当前策略**: 保持 flare 作为默认，但需要：
1. 立即测试 sunburst 对比质量
2. 根据测试结果调整默认模型
3. 可能为不同场景提供模型建议（动漫风格 vs 写实风格）

**零预算用户策略**:
- 如果 sunburst 质量接近但更便宜 → 切换默认
- 如果 2.5 质量足够 → 最佳性价比
