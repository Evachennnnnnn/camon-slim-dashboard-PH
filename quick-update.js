#!/usr/bin/env node
/**
 * 看板快速更新脚本
 * 
 * 用法：
 *   1. 从飞书拉取 6 个 sheet 数据（手动或通过 API）
 *   2. 保存为 data.json
 *   3. 运行: node quick-update.js data.json
 *   4. 自动完成：生成 D 对象 → 替换 HTML → 验证 → git push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HTML_FILE = 'index.html';

// 格式化数字
function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toString();
}

// 格式化百分比
function fmtPct(n) {
  if (n == null) return '—';
  return (n * 100).toFixed(2) + '%';
}

// 从飞书数据提取最新有效值
function getLatest(arr, startIdx = 2) {
  if (!arr || arr.length === 0) return null;
  for (let i = arr.length - 1; i >= startIdx; i--) {
    if (arr[i] != null && arr[i] !== '') return arr[i];
  }
  return null;
}

// 获取最新日期
function getLatestDate(dates, startIdx = 2) {
  if (!dates || dates.length === 0) return null;
  for (let i = dates.length - 1; i >= startIdx; i--) {
    if (dates[i] != null && dates[i] !== '') return dates[i];
  }
  return null;
}

// 解析日期格式 "22-Sep" -> "9/22"
function parseDate(dateStr) {
  if (!dateStr) return null;
  const months = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
  const match = dateStr.match(/(\d+)-(\w+)/);
  if (!match) return dateStr;
  const day = parseInt(match[1]);
  const month = months[match[2]];
  return `${month}/${day}`;
}

// 解析日期格式 "9/30/2026" -> "9/30"
function parseDateFull(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d+)\/(\d+)\/\d+/);
  if (match) return `${match[1]}/${match[2]}`;
  return dateStr;
}

// 主函数
function main() {
  const dataFile = process.argv[2];
  if (!dataFile) {
    console.error('用法: node quick-update.js <data.json>');
    console.error('data.json 格式见 README.md');
    process.exit(1);
  }

  console.log('🚀 开始快速更新看板...\n');

  // 1. 读取数据
  console.log('📖 读取数据文件:', dataFile);
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log('✅ 数据读取成功\n');

  // 2. 提取关键指标
  console.log('🔍 提取关键指标...');
  
  // Google SOV
  const googleSov = data.googleSov;
  const googleDates = googleSov.map(r => r[1]).filter(d => d);
  const googleBrand = googleSov.map(r => r[2]).filter(v => v != null);
  const googleProduct = googleSov.map(r => r[5]).filter(v => v != null);
  const googleLatestDate = parseDate(getLatestDate(googleSov.map(r => r[1])));
  const googleBrandLatest = getLatest(googleSov.map(r => r[2]));
  const googleProductLatest = getLatest(googleSov.map(r => r[5]));

  // TT VV SOV
  const ttVV = data.ttVV;
  const ttVVDates = ttVV.map(r => parseDate(r[1])).filter(d => d);
  const ttVVData = ttVV.map(r => r[9]).filter(v => v != null);
  const ttImpressions = ttVV.map(r => r[5]).filter(v => v != null);
  const ttEngagement = ttVV.map(r => r[6]).filter(v => v != null);
  const ttEngagementShare = ttVV.map(r => r[7]).filter(v => v != null);
  const ttEngagementRank = ttVV.map(r => r[8]).filter(v => v != null);
  const ttSpendAmount = ttVV.map(r => r[2]).filter(v => v != null);
  const ttSpendProgress = ttVV.map(r => r[3]).filter(v => v != null);
  const ttExposureProgress = ttVV.map(r => r[11]).filter(v => v != null);
  const ttLatestDate = getLatestDate(ttVV.map(r => r[1]));

  // TT Search SOV
  const ttSearch = data.ttSearch;
  const ttSearchData = ttSearch.map(r => r[8]).filter(v => v != null);
  const ttSearchLatestDate = getLatestDate(ttSearch.map(r => r[1]));

  // Meta
  const meta = data.meta;
  const metaImpressions = meta.map(r => r[3]).filter(v => v != null);
  const metaLatestDate = getLatestDate(meta.map(r => r[1]));

  // Consideration
  const consideration = data.consideration;
  const considerationDates = consideration.map(r => parseDateFull(r[0])).filter(d => d);
  const considerationBrand = consideration.map(r => r[1]).filter(v => v != null);
  const considerationIndustry = consideration.map(r => r[2]).filter(v => v != null);
  const considerationLatestDate = getLatestDate(consideration.map(r => r[0]));

  // 计算汇总
  const ttImpressionsTotal = ttImpressions.reduce((a, b) => a + b, 0);
  const metaImpressionsTotal = metaImpressions.reduce((a, b) => a + b, 0);
  const totalImpressions = ttImpressionsTotal + metaImpressionsTotal;

  console.log('✅ 指标提取完成\n');

  // 3. 生成 D 对象
  console.log('🔧 生成 D 对象...');
  const D = {
    updatedDate: new Date().toISOString().split('T')[0],
    dataAsOf: parseDate(ttLatestDate) || parseDate(metaLatestDate),

    alertBanner: `数据已更新至 ${parseDate(ttLatestDate) || parseDate(metaLatestDate)}。Google Product SOV ${fmtPct(googleProductLatest)}, TT VV SOV ${fmtPct(getLatest(ttVVData))}, Consideration ${fmtNum(getLatest(considerationBrand))}，全网总曝光 ${fmtNum(totalImpressions)}。/ Data updated to ${parseDate(ttLatestDate) || parseDate(metaLatestDate)}. Google Product SOV ${fmtPct(googleProductLatest)}, TT VV SOV ${fmtPct(getLatest(ttVVData))}, Consideration ${fmtNum(getLatest(considerationBrand))}, Total Impressions ${fmtNum(totalImpressions)}.`,

    hero: {
      desc: `Google Product SOV ${fmtPct(googleProductLatest)} (${googleLatestDate}), Consideration ${fmtNum(getLatest(considerationBrand))} (${parseDateFull(considerationLatestDate)}), 全网总曝光 ${fmtNum(totalImpressions)}, 互动量行业排名 #${getLatest(ttEngagementRank)}. / Google 产品 SOV ${fmtPct(googleProductLatest)}，Consideration 总量 ${fmtNum(getLatest(considerationBrand))}，全网总曝光 ${fmtNum(totalImpressions)}，互动量行业排名 #${getLatest(ttEngagementRank)}。`,
      stats: [
        { label: 'Google 产品 SOV / Product SOV', value: fmtPct(googleProductLatest) },
        { label: 'Consideration 总量 / Total', value: fmtNum(getLatest(considerationBrand)) },
        { label: '全网总曝光 / Total Impressions', value: fmtNum(totalImpressions) },
        { label: '互动量行业排名 / Engagement Rank', value: `#${getLatest(ttEngagementRank)}` }
      ]
    },

    kpis: [
      { label: 'TikTok Video View SOV', statusDot: 'status-yellow', value: fmtPct(getLatest(ttVVData)), trend: '↑', trendClass: 'trend-up', sub: `Target / 目标 20% · As of / 截至 ${parseDate(ttLatestDate)}`, borderLeft: null, valueColor: null },
      { label: 'TikTok Search SOV', statusDot: 'status-yellow', value: fmtPct(getLatest(ttSearchData)), trend: '↓', trendClass: 'trend-down', sub: `Target / 目标 13% · As of / 截至 ${parseDate(ttSearchLatestDate)}`, borderLeft: null, valueColor: null },
      { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: fmtNum(ttImpressionsTotal), trend: null, trendClass: null, sub: `Target / 目标 700M · Progress / 进度 ${((ttImpressionsTotal / 700000000) * 100).toFixed(2)}%`, borderLeft: '#3b82f6', valueColor: '#3b82f6' },
      { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-yellow', value: fmtNum(metaImpressionsTotal), trend: '↑', trendClass: 'trend-up', sub: `As of / 截至 ${parseDate(metaLatestDate)}`, borderLeft: '#ef4444', valueColor: '#ef4444' },
      { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59669', valueColor: '#f59669' },
      { label: '互动量 / Engagement', statusDot: 'status-yellow', value: fmtNum(getLatest(ttEngagement)), trend: null, trendClass: null, sub: `Industry share / 行业占比：${fmtPct(getLatest(ttEngagementShare))} · Rank / 排名 #${getLatest(ttEngagementRank)}`, borderLeft: '#ec4899', valueColor: '#ec4899' }
    ],

    overview: [
      { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: fmtPct(googleBrandLatest), target: '—', date: googleLatestDate },
      { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: fmtPct(googleProductLatest), target: '—', date: googleLatestDate },
      { status: 'red', metric: 'TikTok VV SOV', current: fmtPct(getLatest(ttVVData)), target: '20%', date: parseDate(ttLatestDate) },
      { status: 'yellow', metric: 'TikTok Search SOV', current: fmtPct(getLatest(ttSearchData)), target: '13%', date: parseDate(ttSearchLatestDate) },
      { status: 'red', metric: 'TikTok曝光量 / Impressions', current: fmtNum(ttImpressionsTotal), target: '700M', date: parseDate(ttLatestDate) },
      { status: 'yellow', metric: 'Meta曝光量 / Impressions', current: fmtNum(metaImpressionsTotal), target: '—', date: parseDate(metaLatestDate) },
      { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
      { status: 'red', metric: '全网总曝光 / Total Impressions', current: fmtNum(totalImpressions), target: '1000M+', date: parseDate(ttLatestDate) || parseDate(metaLatestDate) },
      { status: 'yellow', metric: '互动量 / Engagement', current: fmtNum(getLatest(ttEngagement)), target: '—', date: parseDate(ttLatestDate) },
      { status: 'red', metric: '互动率行业排名 / Engagement Rank', current: `#${getLatest(ttEngagementRank)}`, target: 'Top 3', date: parseDate(ttLatestDate) },
      { status: 'red', metric: 'Consideration 总量 / Total', current: fmtNum(getLatest(considerationBrand)), target: '7M', date: parseDateFull(considerationLatestDate) },
      { status: 'red', metric: '消耗进度 / Spend Progress', current: fmtPct(getLatest(ttSpendProgress)), target: '—', date: parseDate(ttLatestDate) },
      { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: fmtPct(getLatest(ttExposureProgress)), target: '—', date: parseDate(ttLatestDate) }
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
      labels: googleDates.map(parseDate),
      brand: googleBrand.map(v => v * 100),
      product: googleProduct.map(v => v * 100),
      brandNote: `Brand SOV latest ${fmtPct(googleBrandLatest)} (${googleLatestDate}) / 品牌 SOV 最新 ${fmtPct(googleBrandLatest)}（${googleLatestDate}）`,
      productNote: `Product SOV latest ${fmtPct(googleProductLatest)} (${googleLatestDate}) / 产品 SOV 最新 ${fmtPct(googleProductLatest)}（${googleLatestDate}）`
    },

    competitorCompare: null,
    audience: null,
    keywords: null,
    paidComments: null,

    ttSov: {
      labels: ttVVDates,
      vvData: ttVVData.map(v => v * 100),
      searchData: ttSearchData.map(v => v * 100),
      note: `VV SOV latest ${fmtPct(getLatest(ttVVData))} (${parseDate(ttLatestDate)}); Search SOV latest ${fmtPct(getLatest(ttSearchData))} (${parseDate(ttSearchLatestDate)}) / VV SOV 最新 ${fmtPct(getLatest(ttVVData))}（${parseDate(ttLatestDate)}）；Search SOV 最新 ${fmtPct(getLatest(ttSearchData))}（${parseDate(ttSearchLatestDate)}）`
    },

    consideration: {
      labels: considerationDates,
      brandData: considerationBrand,
      industryData: considerationIndustry,
      note: `Brand Consideration ${considerationDates[0]}~${considerationDates.slice(-1)[0]}, peak ${fmtNum(Math.max(...considerationBrand))} (${considerationDates[considerationBrand.indexOf(Math.max(...considerationBrand))]}), latest ${fmtNum(getLatest(considerationBrand))} (${parseDateFull(considerationLatestDate)}). Top 5 行业均值 peak ${fmtNum(Math.max(...considerationIndustry))} (${considerationDates[considerationIndustry.indexOf(Math.max(...considerationIndustry))]}), latest ${fmtNum(getLatest(considerationIndustry))} (${parseDateFull(considerationLatestDate)}). / 本品牌 Consideration ${considerationDates[0]}~${considerationDates.slice(-1)[0]}，峰值 ${fmtNum(Math.max(...considerationBrand))}（${considerationDates[considerationBrand.indexOf(Math.max(...considerationBrand))]}），最新 ${fmtNum(getLatest(considerationBrand))}（${parseDateFull(considerationLatestDate)}）。Top 5 行业均值峰值 ${fmtNum(Math.max(...considerationIndustry))}（${considerationDates[considerationIndustry.indexOf(Math.max(...considerationIndustry))]}），最新 ${fmtNum(getLatest(considerationIndustry))}（${parseDateFull(considerationLatestDate)}）。`
    },

    spend: {
      labels: ttVVDates,
      dailySpend: ttSpendAmount,
      spendProgress: ttSpendProgress.map(v => v * 100),
      exposureProgress: ttExposureProgress.map(v => v * 100)
    }
  };

  console.log('✅ D 对象生成成功\n');

  // 4. 读取当前 HTML
  console.log('📖 读取当前 HTML...');
  const html = fs.readFileSync(HTML_FILE, 'utf8');
  console.log('✅ HTML 读取成功\n');

  // 5. 替换 D 对象
  console.log('🔧 替换 D 对象...');
  const dStart = html.indexOf('const D = {');
  if (dStart === -1) {
    throw new Error('找不到 const D 对象');
  }

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

  const newDStr = 'const D = ' + JSON.stringify(D, null, 2) + ';';
  const newHtml = html.substring(0, dStart) + newDStr + html.substring(dEnd);
  console.log('✅ D 对象替换成功\n');

  // 6. 写入新 HTML
  console.log('💾 写入新 HTML...');
  fs.writeFileSync(HTML_FILE, newHtml);
  console.log('✅ HTML 写入成功\n');

  // 7. 验证
  console.log('🔍 验证 HTML...');
  try {
    execSync('node validate.js', { stdio: 'inherit' });
    console.log('✅ 验证通过\n');
  } catch (err) {
    console.error('❌ 验证失败');
    process.exit(1);
  }

  // 8. Git 提交
  console.log('📦 Git 提交...');
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "update: 数据更新至 ${D.dataAsOf}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Git 提交成功\n');
  } catch (err) {
    console.error('❌ Git 提交失败');
    process.exit(1);
  }

  console.log('🎉 看板更新完成！');
  console.log('');
  console.log('📊 关键指标：');
  console.log(`  Google Product SOV: ${fmtPct(googleProductLatest)} (${googleLatestDate})`);
  console.log(`  TT VV SOV: ${fmtPct(getLatest(ttVVData))} (${parseDate(ttLatestDate)})`);
  console.log(`  TT Search SOV: ${fmtPct(getLatest(ttSearchData))} (${parseDate(ttSearchLatestDate)})`);
  console.log(`  Meta 曝光: ${fmtNum(metaImpressionsTotal)} (${parseDate(metaLatestDate)})`);
  console.log(`  Consideration: ${fmtNum(getLatest(considerationBrand))} (${parseDateFull(considerationLatestDate)})`);
  console.log(`  全网总曝光: ${fmtNum(totalImpressions)}`);
  console.log('');
  console.log('🌐 在线地址: https://evachennnnnnn.github.io/camon-slim-dashboard-PH/');
}

main();
