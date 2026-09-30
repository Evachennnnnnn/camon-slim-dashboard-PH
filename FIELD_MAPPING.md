# 菲律宾 CAMON Slim 5G 看板 - 字段映射文档

## 数据源
- **飞书表格**: `Cr5ss850ZhqfKztuJf7c4Dipntf`
- **Wiki URL**: https://q6y68vu0j8.feishu.cn/wiki/DvhNw8COCiIDz1kpeJvcPsjhnAg

## Sheet 结构 & 字段映射

### 1. Google SOV (sheet: `inBns8`)
| 列 | 字段 | 说明 |
|----|------|------|
| A | 产品 | CAMON Slim |
| B | Day | 日期 (22-Sep, 23-Sep...) |
| C | Brand SOV | 品牌 SOV (小数，如 0.1532 = 15.32%) |
| D | Trend link | Google Trends 链接 |
| F | Product SOV | 产品 SOV (小数，如 0.3333 = 33.33%) |
| G | Trend link | Google Trends 竞品对比链接 |

**D 对象映射**:
```javascript
googleSov: {
  labels: [...],        // B 列日期
  brand: [...],         // C 列 × 100
  product: [...],       // F 列 × 100
  brandNote: '...',
  productNote: '...'
}
```

---

### 2. TT VV SOV (sheet: `7594c8`)
| 列 | 字段 | 说明 |
|----|------|------|
| B | 日期 | 19-Sep, 20-Sep... |
| C | 消耗金额(当日) | 美元 |
| D | 消耗进度 | 小数 (0.0203 = 2.03%) |
| F | TECNO总曝光(当日) | TT 曝光 |
| G | 互动量 | 数字 |
| H | 互动量行业占比 | 小数 |
| I | 互动量行业排名 | 数字 (目标 Top 3) |
| J | TTMS VV SOV(当日) | 小数 (目标 20%) |

**D 对象映射**:
```javascript
ttSov: {
  labels: [...],        // B 列
  vvData: [...],        // J 列 × 100
  searchData: [...],    // 来自 LMpCX4
  note: '...'
}

spend: {
  labels: [...],        // B 列
  dailySpend: [...],    // C 列
  spendProgress: [...], // D 列 × 100
  exposureProgress: [...] // 来自 7594c8 K 列 × 100
}
```

---

### 3. TT Search SOV (sheet: `LMpCX4`)
| 列 | 字段 | 说明 |
|----|------|------|
| B | 日期 | 19-Sep, 20-Sep... |
| I | TT Search SOV(当日) | 小数 (目标 13%) |

**D 对象映射**:
```javascript
ttSov.searchData = [...] // I 列 × 100
```

---

### 4. Meta 日曝光 (sheet: `bYVib5`)
| 列 | 字段 | 说明 |
|----|------|------|
| B | 日期 | 23-Sep, 24-Sep... |
| C | 消耗金额(当日) | 美元 |
| D | 曝光量 | Meta 曝光 |

**D 对象映射**:
```javascript
kpis[3].value = formatNumber(sum(D 列)) // Meta 曝光累计
```

---

### 5. Consideration (sheet: `6YiWEq`)
| 列 | 字段 | 说明 |
|----|------|------|
| A | 日期 | 9/1/2026, 9/2/2026... |
| B | Consideration总量 - 本品牌 | 数字 |
| C | Consideration总量 - 行业均值 | 数字 |

**D 对象映射**:
```javascript
consideration: {
  labels: [...],           // A 列 (格式化: 9/1, 9/2...)
  brandData: [...],        // B 列
  industryData: [...],     // C 列
  note: '...'
}
```

---

### 6. 高曝光视频 (sheet: `zrO88B`)
| 列 | 字段 | 说明 |
|----|------|------|
| A | Video Name | 视频名称 |
| B | Video Link | TikTok 链接 |
| C | Contributed Impressions | 贡献曝光量 |

**D 对象映射**:
```javascript
topVideos: [
  { rank: '🥇', name: '...', url: '...', value: '1.84M', gold: true },
  ...
]
```

---

### 7. KOL 高曝光视频 (sheet: `5mwb5`)
结构同 `zrO88B`，映射到 `kolVideos`。

---

### 8. 受众洞察 (sheet: `tOE4wF`)
| 字段 | 说明 |
|------|------|
| TikTok CPM/CPE | TikTok 平台指标 |
| FB&IG CPM/CPE | Meta 平台指标 |
| 分人群数据 | Core Converters, Beauty & Lifestyle... |

**D 对象映射**:
```javascript
audience: {
  platformMetrics: [...],  // CPM/CPE 卡片
  ttAudience: [...],       // TikTok 分人群表格
  fbigAudience: [...]      // FB&IG 分人群表格
}
```

---

### 9. 关键词分析 (sheet: `VMJpK0`)
**D 对象映射**:
```javascript
keywords: {
  window: '...',           // 时间窗描述
  stats: [...],            // 统计卡片
  topVideos: [...],        // TOP 10 视频
  insights: {...}          // 洞察文本
}
```

---

### 10. Paid Comments (sheet: `LkTOlT`)
**D 对象映射**:
```javascript
paidComments: {
  window: '...',           // 时间窗描述
  stats: [...],            // 统计卡片
  audienceBreakdown: [...], // 受众分布表格
  topMaterials: [...],     // 素材排行
  insights: {...}          // 洞察文本
}
```

---

## 数据转换规则

| 原始格式 | 转换规则 | 示例 |
|----------|----------|------|
| SOV 小数 | × 100 → 百分比 | 0.1532 → 15.32% |
| 曝光量 | 格式化 | 1843355 → 1.84M |
| 互动量 | 格式化 | 660088 → 660K |
| 金额 | 保留 2 位小数 | 1136 → $1,136 |
| 日期 | 简化格式 | 22-Sep → 9/22 |

---

## 更新流程

1. **拉数据**: 从飞书表格读取各 sheet
2. **转换**: 按上述规则转换数据格式
3. **生成 D 对象**: 填充到 `const D = {...}`
4. **验证**: 检查必填字段、数值范围、数组长度
5. **替换**: 更新 index.html 中的 D 对象
6. **预览**: 本地验证 HTML 完整性
7. **推送**: git commit + push
