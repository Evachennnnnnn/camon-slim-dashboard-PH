#!/usr/bin/env node
/**
 * 菲律宾 CAMON Slim 5G 看板 - 全自动更新脚本
 * 
 * 用法：
 *   node auto-update.js <data.json>
 * 
 * data.json 格式：
 * {
 *   "googleSov": { "labels": [...], "brand": [...], "product": [...] },
 *   "ttSov": { "labels": [...], "vvData": [...], "searchData": [...] },
 *   "consideration": { "labels": [...], "brandData": [...], "industryData": [...] },
 *   "spend": { "labels": [...], "dailySpend": [...], "spendProgress": [...], "exposureProgress": [...] },
 *   "metaImpressions": { "total": 13100000, "asOf": "9/29" },
 *   "topVideos": [...],
 *   "updatedDate": "2026-09-30",
 *   "dataAsOf": "9/29"
 * }
 */

const fs = require('fs');
const path = require('path');
const { validateDObject } = require('./update-dashboard.js');

const HTML_FILE = 'index.html';
const BACKUP_FILE = 'index.html.backup';

// ============ 工具函数 ============

function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toString();
}

function formatPercent(num) {
  if (num === null || num === undefined) return '—';
  return (num * 100).toFixed(2) + '%';
}

function formatDate(dateStr) {
  // "22-Sep" -> "9/22"
  const months = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
  const match = dateStr.match(/(\d+)-(\w+)/);
  if (!match) return dateStr;
  const day = parseInt(match[1]);
  const month = months[match[2]];
  return `${month}/${day}`;
}

// ============ 核心逻辑 ============

function generateDObject(data) {
  // 计算全网总曝光（TT + Meta）
  const ttImpressions = data.ttImpressions?.total || 0;
  const metaImpressions = data.metaImpressions?.total || 0;
  const totalImpressions = ttImpressions + metaImpressions;

  // 生成 D 对象
  const D = {
    updatedDate: data.updatedDate,
    dataAsOf: data.dataAsOf,

    alertBanner: `数据已更新至 ${data.dataAsOf}。Google Product SOV ${formatPercent(data.googleSov?.product?.slice(-1)[0])}，TT VV SOV ${formatPercent(data.ttSov?.vvData?.slice(-1)[0])}，TT Search SOV ${formatPercent(data.ttSov?.searchData?.slice(-1)[0])}，Consideration ${formatNumber(data.consideration?.brandData?.slice(-1)[0])}，Meta 曝光 ${formatNumber(metaImpressions)}。/ Data updated to ${data.dataAsOf}. Google Product SOV ${formatPercent(data.googleSov?.product?.slice(-1)[0])}, TT VV SOV ${formatPercent(data.ttSov?.vvData?.slice(-1)[0])}, TT Search SOV ${formatPercent(data.ttSov?.searchData?.slice(-1)[0])}, Consideration ${formatNumber(data.consideration?.brandData?.slice(-1)[0])}, Meta Impressions ${formatNumber(metaImpressions)}.`,

    hero: {
      desc: `Google Product SOV ${formatPercent(data.googleSov?.product?.slice(-1)[0])} (${data.dataAsOf}), Consideration ${formatNumber(data.consideration?.brandData?.slice(-1)[0])} (${data.consideration?.labels?.slice(-1)[0]}), 全网总曝光 ${formatNumber(totalImpressions)}, 互动量行业排名 #5. / Google 产品 SOV ${formatPercent(data.googleSov?.product?.slice(-1)[0])}，Consideration 总量 ${formatNumber(data.consideration?.brandData?.slice(-1)[0])}，全网总曝光 ${formatNumber(totalImpressions)}，互动量行业排名 #5。`,
      stats: [
        { label: 'Google 产品 SOV / Product SOV', value: formatPercent(data.googleSov?.product?.slice(-1)[0]) },
        { label: 'Consideration 总量 / Total', value: formatNumber(data.consideration?.brandData?.slice(-1)[0]) },
        { label: '全网总曝光 / Total Impressions', value: formatNumber(totalImpressions) },
        { label: '互动量行业排名 / Engagement Rank', value: '#5' }
      ]
    },

    kpis: [
      { label: 'TikTok Video View SOV', statusDot: 'status-yellow', value: formatPercent(data.ttSov?.vvData?.slice(-1)[0]), trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 20% · As of / 截至 ' + data.ttSov?.labels?.slice(-1)[0], borderLeft: null, valueColor: null },
      { label: 'TikTok Search SOV', statusDot: 'status-yellow', value: formatPercent(data.ttSov?.searchData?.slice(-1)[0]), trend: '↓', trendClass: 'trend-down', sub: 'Target / 目标 13% · As of / 截至 ' + data.ttSov?.labels?.slice(-1)[0], borderLeft: null, valueColor: null },
      { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: formatNumber(ttImpressions), trend: null, trendClass: null, sub: `Target / 目标 700M · Progress / 进度 ${((ttImpressions / 700000000) * 100).toFixed(2)}%`, borderLeft: '#3b82f6', valueColor: '#3b82f6' },
      { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-yellow', value: formatNumber(metaImpressions), trend: '↑', trendClass: 'trend-up', sub: 'As of / 截至 ' + data.metaImpressions?.asOf, borderLeft: '#ef4444', valueColor: '#ef4444' },
      { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59e0b', valueColor: '#f59e0b' },
      { label: '互动量 / Engagement', statusDot: 'status-yellow', value: '660K', trend: null, trendClass: null, sub: 'Industry share / 行业占比：6.03% · Rank / 排名 #5', borderLeft: '#ec4899', valueColor: '#ec4899' }
    ],

    overview: [
      { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: formatPercent(data.googleSov?.brand?.slice(-1)[0]), target: '—', date: data.googleSov?.labels?.slice(-1)[0] },
      { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: formatPercent(data.googleSov?.product?.slice(-1)[0]), target: '—', date: data.googleSov?.labels?.slice(-1)[0] },
      { status: 'red', metric: 'TikTok VV SOV', current: formatPercent(data.ttSov?.vvData?.slice(-1)[0]), target: '20%', date: data.ttSov?.labels?.slice(-1)[0] },
      { status: 'yellow', metric: 'TikTok Search SOV', current: formatPercent(data.ttSov?.searchData?.slice(-1)[0]), target: '13%', date: data.ttSov?.labels?.slice(-1)[0] },
      { status: 'red', metric: 'TikTok曝光量 / Impressions', current: formatNumber(ttImpressions), target: '700M', date: data.ttSov?.labels?.slice(-1)[0] },
      { status: 'yellow', metric: 'Meta曝光量 / Impressions', current: formatNumber(metaImpressions), target: '—', date: data.metaImpressions?.asOf },
      { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
      { status: 'red', metric: '全网总曝光 / Total Impressions', current: formatNumber(totalImpressions), target: '1000M+', date: data.dataAsOf },
      { status: 'yellow', metric: '互动量 / Engagement', current: '660K', target: '—', date: '9/21' },
      { status: 'red', metric: '互动率行业排名 / Engagement Rank', current: '#5', target: 'Top 3', date: '9/20' },
      { status: 'red', metric: 'Consideration 总量 / Total', current: formatNumber(data.consideration?.brandData?.slice(-1)[0]), target: '7M', date: data.consideration?.labels?.slice(-1)[0] },
      { status: 'red', metric: '消耗进度 / Spend Progress', current: formatPercent(data.spend?.spendProgress?.slice(-1)[0]), target: '—', date: data.spend?.labels?.slice(-1)[0] },
      { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: formatPercent(data.spend?.exposureProgress?.slice(-1)[0]), target: '—', date: data.spend?.labels?.slice(-1)[0] }
    ],

    topVideos: data.topVideos || [],
    
    kolVideos: [
      { rank: '🥇', name: 'Pending / 待更新', url: null, value: '—', gold: true, pending: true },
      { rank: '🥈', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
      { rank: '🥉', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
      { rank: '🏅', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
      { rank: '🏅', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true }
    ],

    googleSov: {
      labels: data.googleSov?.labels || [],
      brand: data.googleSov?.brand || [],
      product: data.googleSov?.product || [],
      brandNote: `Brand SOV latest ${formatPercent(data.googleSov?.brand?.slice(-1)[0])} (${data.googleSov?.labels?.slice(-1)[0]}) / 品牌 SOV 最新 ${formatPercent(data.googleSov?.brand?.slice(-1)[0])}（${data.googleSov?.labels?.slice(-1)[0]}）`,
      productNote: `Product SOV latest ${formatPercent(data.googleSov?.product?.slice(-1)[0])} (${data.googleSov?.labels?.slice(-1)[0]}) / 产品 SOV 最新 ${formatPercent(data.googleSov?.product?.slice(-1)[0])}（${data.googleSov?.labels?.slice(-1)[0]}）`
    },

    ttSov: {
      labels: data.ttSov?.labels || [],
      vvData: data.ttSov?.vvData || [],
      searchData: data.ttSov?.searchData || [],
      note: `VV SOV latest ${formatPercent(data.ttSov?.vvData?.slice(-1)[0])} (${data.ttSov?.labels?.slice(-1)[0]}); Search SOV latest ${formatPercent(data.ttSov?.searchData?.slice(-1)[0])} (${data.ttSov?.labels?.slice(-1)[0]}) / VV SOV 最新 ${formatPercent(data.ttSov?.vvData?.slice(-1)[0])}（${data.ttSov?.labels?.slice(-1)[0]}）；Search SOV 最新 ${formatPercent(data.ttSov?.searchData?.slice(-1)[0])}（${data.ttSov?.labels?.slice(-1)[0]}）`
    },

    consideration: {
      labels: data.consideration?.labels || [],
      brandData: data.consideration?.brandData || [],
      industryData: data.consideration?.industryData || [],
      note: `Brand Consideration ${data.consideration?.labels?.[0]}~${data.consideration?.labels?.slice(-1)[0]}, peak 3.82M (9/18), latest ${formatNumber(data.consideration?.brandData?.slice(-1)[0])} (${data.consideration?.labels?.slice(-1)[0]}). Top 5 行业均值 peak 4.35M (9/18). / 本品牌 Consideration ${data.consideration?.labels?.[0]}~${data.consideration?.labels?.slice(-1)[0]}，峰值 3.82M（9/18），最新 ${formatNumber(data.consideration?.brandData?.slice(-1)[0])}（${data.consideration?.labels?.slice(-1)[0]}）。Top 5 行业均值峰值 4.35M（9/18）。`
    },

    spend: {
      labels: data.spend?.labels || [],
      dailySpend: data.spend?.dailySpend || [],
      spendProgress: data.spend?.spendProgress || [],
      exposureProgress: data.spend?.exposureProgress || []
    },

    // 以下字段保持不变（需要从原 D 对象复制）
    competitorCompare: null, // 占位，后续从原文件读取
    audience: null,
    keywords: null,
    paidComments: null
  };

  return D;
}

function updateHTML(html, newD) {
  // 找到 const D = {...} 的位置
  const dStart = html.indexOf('const D = {');
  if (dStart === -1) {
    throw new Error('找不到 const D 对象');
  }

  // 找到 D 对象的结束位置（匹配大括号）
  let braceCount = 0;
  let dEnd = -1;
  for (let i = dStart; i < html.length; i++) {
    if (html[i] === '{') braceCount++;
    if (html[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        dEnd = i + 1;
        break;
      }
    }
  }

  if (dEnd === -1) {
    throw new Error('找不到 D 对象结束位置');
  }

  // 生成新的 D 对象字符串
  const newDStr = 'const D = ' + JSON.stringify(newD, null, 2) + ';';

  // 替换
  const newHtml = html.substring(0, dStart) + newDStr + html.substring(dEnd);

  return newHtml;
}

// ============ 主流程 ============

function main() {
  const dataFile = process.argv[2];
  if (!dataFile) {
    console.error('用法: node auto-update.js <data.json>');
    process.exit(1);
  }

  console.log('🚀 开始自动更新看板...\n');

  // 1. 读取数据
  console.log('📖 读取数据文件:', dataFile);
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log('✅ 数据读取成功\n');

  // 2. 生成 D 对象
  console.log('🔧 生成 D 对象...');
  const newD = generateDObject(data);
  console.log('✅ D 对象生成成功\n');

  // 3. 验证 D 对象
  console.log('🔍 验证 D 对象...');
  const validation = validateDObject(newD);
  if (!validation.valid) {
    console.error('❌ D 对象验证失败:');
    validation.errors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }
  if (validation.warnings.length) {
    console.warn('⚠️ 警告:');
    validation.warnings.forEach(w => console.warn('  ' + w));
  }
  console.log('✅ D 对象验证通过\n');

  // 4. 备份原文件
  console.log('💾 备份原文件:', BACKUP_FILE);
  const html = fs.readFileSync(HTML_FILE, 'utf8');
  fs.writeFileSync(BACKUP_FILE, html);
  console.log('✅ 备份完成\n');

  // 5. 更新 HTML
  console.log('📝 更新 HTML...');
  const newHtml = updateHTML(html, newD);
  console.log('✅ HTML 更新成功\n');

  // 6. 写入新文件
  console.log('💾 写入新文件:', HTML_FILE);
  fs.writeFileSync(HTML_FILE, newHtml);
  console.log('✅ 写入完成\n');

  // 7. 验证新 HTML
  console.log('🔍 验证新 HTML...');
  const { execSync } = require('child_process');
  try {
    execSync('node validate.js', { stdio: 'inherit' });
    console.log('✅ HTML 验证通过\n');
  } catch (err) {
    console.error('❌ HTML 验证失败，回滚...');
    fs.writeFileSync(HTML_FILE, fs.readFileSync(BACKUP_FILE));
    console.log('✅ 已回滚到备份文件');
    process.exit(1);
  }

  console.log('🎉 自动更新完成！');
  console.log('');
  console.log('下一步：');
  console.log('  1. 检查更新结果');
  console.log('  2. git add -A && git commit -m "update: 数据更新至 ' + data.dataAsOf + '"');
  console.log('  3. git push origin main');
}

main();
