#!/usr/bin/env node
/**
 * 菲律宾 CAMON Slim 5G 看板更新脚本
 * 
 * 用法：
 *   1. 从飞书拉取最新数据（手动或通过 API）
 *   2. 运行此脚本生成新的 D 对象
 *   3. 替换 index.html 中的 const D = {...}
 *   4. 验证 HTML 完整性
 *   5. git commit + push
 */

const fs = require('fs');
const path = require('path');

// ============ 字段映射配置 ============
// 飞书 Sheet → D 对象字段映射
const FIELD_MAPPING = {
  // Google SOV (sheet: inBns8)
  'inBns8': {
    brandSov: { column: 'C', description: 'Google 品牌 SOV' },
    productSov: { column: 'F', description: 'Google 产品 SOV' },
    dateColumn: 'B'
  },
  
  // TT VV SOV (sheet: 7594c8)
  '7594c8': {
    spendAmount: { column: 'C', description: '消耗金额' },
    spendProgress: { column: 'D', description: '消耗进度（小数，需×100）' },
    ttImpressions: { column: 'F', description: 'TT 总曝光' },
    engagement: { column: 'G', description: '互动量' },
    engagementShare: { column: 'H', description: '互动量行业占比' },
    engagementRank: { column: 'I', description: '互动量行业排名' },
    vvSov: { column: 'J', description: 'TT VV SOV' },
    dateColumn: 'B'
  },
  
  // TT Search SOV (sheet: LMpCX4)
  'LMpCX4': {
    searchSov: { column: 'I', description: 'TT Search SOV' },
    dateColumn: 'B'
  },
  
  // Meta 日曝光 (sheet: bYVib5)
  'bYVib5': {
    metaImpressions: { column: 'D', description: 'Meta 曝光量' },
    dateColumn: 'B'
  },
  
  // Consideration (sheet: 6YiWEq)
  '6YiWEq': {
    considerationBrand: { column: 'B', description: 'Consideration 本品牌' },
    considerationIndustry: { column: 'C', description: 'Consideration 行业均值' },
    dateColumn: 'A'
  },
  
  // 高曝光视频 (sheet: zrO88B)
  'zrO88B': {
    videoName: { column: 'A', description: '视频名称' },
    videoLink: { column: 'B', description: '视频链接' },
    impressions: { column: 'C', description: '贡献曝光量' }
  }
};

// ============ 数据验证规则 ============
const VALIDATION_RULES = {
  requiredFields: [
    'updatedDate',
    'dataAsOf',
    'alertBanner',
    'hero',
    'kpis',
    'overview',
    'topVideos',
    'googleSov',
    'ttSov',
    'consideration',
    'spend'
  ],
  numericRanges: {
    'sovPercentage': { min: 0, max: 100 },
    'impressions': { min: 0 },
    'engagement': { min: 0 }
  }
};

// ============ 工具函数 ============

/**
 * 从飞书表格数据提取指定列的值
 */
function extractColumn(sheetData, column, startRow = 2) {
  const colIndex = column.charCodeAt(0) - 65; // A=0, B=1, C=2...
  return sheetData.slice(startRow).map(row => row[colIndex]);
}

/**
 * 格式化数字
 */
function formatNumber(num, unit = '') {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2) + unit;
}

/**
 * 格式化百分比
 */
function formatPercent(num) {
  if (num === null || num === undefined) return '—';
  return (num * 100).toFixed(2) + '%';
}

/**
 * 验证 D 对象完整性
 */
function validateDObject(D) {
  const errors = [];
  const warnings = [];
  
  // 检查必填字段
  for (const field of VALIDATION_RULES.requiredFields) {
    if (!(field in D)) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }
  
  // 检查数值范围
  if (D.googleSov) {
    const brandSov = D.googleSov.brand?.slice(-1)[0];
    const productSov = D.googleSov.product?.slice(-1)[0];
    if (brandSov !== undefined && (brandSov < 0 || brandSov > 1)) {
      warnings.push(`Google 品牌 SOV 值异常: ${brandSov}`);
    }
    if (productSov !== undefined && (productSov < 0 || productSov > 1)) {
      warnings.push(`Google 产品 SOV 值异常: ${productSov}`);
    }
  }
  
  // 检查数组长度一致性
  if (D.googleSov) {
    const len = D.googleSov.labels?.length || 0;
    if (D.googleSov.brand?.length !== len) {
      warnings.push(`Google 品牌 SOV 数组长度不一致`);
    }
    if (D.googleSov.product?.length !== len) {
      warnings.push(`Google 产品 SOV 数组长度不一致`);
    }
  }
  
  return { errors, warnings, valid: errors.length === 0 };
}

/**
 * 生成更新报告
 */
function generateUpdateReport(oldD, newD) {
  const changes = [];
  
  // 比较关键指标
  const comparisons = [
    { name: 'Google 产品 SOV', old: oldD?.hero?.stats?.[0]?.value, new: newD?.hero?.stats?.[0]?.value },
    { name: 'Consideration', old: oldD?.hero?.stats?.[1]?.value, new: newD?.hero?.stats?.[1]?.value },
    { name: '全网总曝光', old: oldD?.hero?.stats?.[2]?.value, new: newD?.hero?.stats?.[2]?.value },
    { name: 'Meta 曝光', old: oldD?.kpis?.[3]?.value, new: newD?.kpis?.[3]?.value }
  ];
  
  for (const comp of comparisons) {
    if (comp.old !== comp.new) {
      changes.push(`${comp.name}: ${comp.old} → ${comp.new}`);
    }
  }
  
  return changes;
}

// ============ 导出 ============

module.exports = {
  FIELD_MAPPING,
  VALIDATION_RULES,
  extractColumn,
  formatNumber,
  formatPercent,
  validateDObject,
  generateUpdateReport
};

// 如果直接运行，显示帮助
if (require.main === module) {
  console.log('📊 菲律宾 CAMON Slim 5G 看板更新工具');
  console.log('');
  console.log('用法：');
  console.log('  1. 从飞书拉取数据');
  console.log('  2. 调用 generateDObject(sheetData) 生成 D 对象');
  console.log('  3. 调用 validateDObject(D) 验证');
  console.log('  4. 替换 index.html 中的 const D');
  console.log('  5. git commit + push');
  console.log('');
  console.log('字段映射：');
  console.log(JSON.stringify(FIELD_MAPPING, null, 2));
}
