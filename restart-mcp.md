# 重启 MCP 服务器说明

## 问题
MCP 服务器的代码更新后，需要重启 Claude Code 才能加载新代码。

## 解决方案

### 方法 1: 重启 Claude Code（推荐）
1. 保存当前工作
2. 完全关闭 Claude Code
3. 重新启动 Claude Code

### 方法 2: 手动重启 Node 进程
```powershell
# 查找并停止 image-generator 进程
Get-Process | Where-Object { $_.ProcessName -eq 'node' } | 
  Where-Object { $_.CommandLine -like '*image-generator*' } | 
  Stop-Process -Force

# Claude Code 会自动重启 MCP 服务器
```

## 验证更新是否生效

生成一张图片后，检查返回结果是否包含 `cost` 字段：
```json
{
  "cost": {
    "this_request": "$0.0800 USD",
    "unit_cost": "$0.0800 USD per image",
    "total_spent": "$0.1000 USD",
    "total_requests": 2
  }
}
```

## 当前更新内容

1. ✅ 添加费用计算模块
2. ✅ 添加费用日志记录
3. ✅ 所有工具返回费用信息
4. ⏳ 等待 Claude Code 重启生效
