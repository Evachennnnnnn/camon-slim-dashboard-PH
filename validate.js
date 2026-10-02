#!/usr/bin/env node
/**
 * 看板 HTML 验证脚本
 * 在推送前检查 HTML 完整性和数据一致性
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = process.argv[2] || 'index.html';

function validate(html) {
  const errors = [];
  const warnings = [];
  const info = [];

  // 1. 基础结构检查
  const structureChecks = [
    ['DOCTYPE', /<!DOCTYPE html>/i],
    ['<html>', /<html/i],
    ['<head>', /<head>/i],
    ['</head>', /<\/head>/i],
    ['<body>', /<body>/i],
    ['</body>', /<\/body>/i],
    ['</html>', /<\/html>/i],
    ['Chart.js CDN', /chart\.js/i],
  ];

  for (const [name, regex] of structureChecks) {
    if (!regex.test(html)) {
      errors.push(`❌ 缺少: ${name}`);
    }
  }

  // 2. 数据对象检查
  const dObjectMatch = html.match(/const D = \{([\s\S]*?)\n\};/);
  if (!dObjectMatch) {
    errors.push('❌ 找不到 const D 对象');
  } else {
    const dContent = dObjectMatch[1];
    
    const requiredKeys = [
      'updatedDate', 'dataAsOf', 'alertBanner', 'hero',
      'kpis', 'overview', 'topVideos', 'googleSov',
      'ttSov', 'consideration', 'spend', 'audience',
      'keywords', 'paidComments'
    ];

    for (const key of requiredKeys) {
      // 兼容 JSON.stringify 格式（"key":）和手写格式（key:）
      if (!dContent.includes(key + ':') && !dContent.includes('"' + key + '"')) {
        errors.push(`❌ D 对象缺少字段: ${key}`);
      }
    }
    info.push(`✅ D 对象包含 ${requiredKeys.length} 个必填字段`);
  }

  // 3. Canvas 元素检查
  const canvases = ['googleBrandChart', 'googleProductChart', 'ttSovChart', 'considerationChart', 'spendChart'];
  for (const id of canvases) {
    if (!html.includes(`id="${id}"`)) {
      errors.push(`❌ 缺少 canvas: ${id}`);
    }
  }
  info.push(`✅ 包含 ${canvases.length} 个图表 canvas`);

  // 4. render 函数检查
  if (!html.includes('function render()') && !html.includes('const render')) {
    errors.push('❌ 缺少 render() 函数');
  } else {
    info.push('✅ render() 函数存在');
  }

  // 5. DOMContentLoaded 检查
  if (!html.includes('DOMContentLoaded')) {
    warnings.push('⚠️ 未检测到 DOMContentLoaded 事件监听');
  }

  // 6. CSS 完整性检查（关键 class）
  const cssClasses = ['.header', '.container', '.kpi', '.section', '.chart', '.table', '.leaderboard'];
  for (const cls of cssClasses) {
    if (!html.includes(cls)) {
      warnings.push(`⚠️ CSS 可能缺少: ${cls}`);
    }
  }

  // 7. 数据一致性检查
  if (dObjectMatch) {
    const dContent = dObjectMatch[1];
    
    // 检查日期格式
    const dateMatch = dContent.match(/dataAsOf:\s*'([^']+)'/);
    if (dateMatch) {
      info.push(`📅 数据截至: ${dateMatch[1]}`);
    }

    // 检查 KPI 数量
    const kpiMatches = dContent.match(/label:\s*'/g);
    if (kpiMatches) {
      info.push(`📊 发现 ${kpiMatches.length} 个标签定义`);
    }
  }

  return { errors, warnings, info };
}

// 运行验证
const html = fs.readFileSync(HTML_FILE, 'utf8');
const result = validate(html);

console.log('\n🔍 看板 HTML 验证报告');
console.log('='.repeat(40));
console.log(`文件: ${HTML_FILE}`);
console.log(`大小: ${(html.length / 1024).toFixed(1)} KB`);
console.log(`行数: ${html.split('\n').length}`);
console.log('='.repeat(40));

if (result.info.length) {
  console.log('\n📋 信息:');
  result.info.forEach(i => console.log('  ' + i));
}

if (result.warnings.length) {
  console.log('\n⚠️ 警告:');
  result.warnings.forEach(w => console.log('  ' + w));
}

if (result.errors.length) {
  console.log('\n❌ 错误:');
  result.errors.forEach(e => console.log('  ' + e));
  console.log('\n🚫 验证失败，请修复后再推送');
  process.exit(1);
} else {
  console.log('\n✅ 验证通过，可以推送');
  process.exit(0);
}
