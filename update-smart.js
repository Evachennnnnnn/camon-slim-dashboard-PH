#!/usr/bin/env node
/**
 * 看板数据智能更新脚本
 * 用法: node update-smart.js --data '<JSON数据>'
 * 
 * 功能:
 * 1. 读取当前 index.html 的 D 对象
 * 2. 根据新数据更新对应字段
 * 3. null 值自动保持上次值
 * 4. 图表数据自动累积
 * 
 * 数据结构 (只需传入变化的字段):
 * {
 *   date: '10/8',
 *   google: { brand: 15.53, product: 17.39 },  // null 则保持上次
 *   tt: { vv: 23.26, search: 10.85, impressions: 230.57 },  // null 则保持上次
 *   meta: { impressions: 82.22 },  // null 则保持上次
 *   consideration: 2.38,  // null 则保持上次
 *   engagement: { value: 21.98, rank: 5, share: 10.44 },  // null 则保持上次
 *   spend: { progress: 36.55, exposure: 32.94 }  // null 则保持上次
 * }
 */

const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
let dataArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--data' && args[i + 1]) {
    dataArg = args[i + 1];
    break;
  }
}

if (!dataArg) {
  console.error('❌ 请提供 --data 参数');
  process.exit(1);
}

let newData;
try {
  newData = JSON.parse(dataArg);
} catch (e) {
  console.error('❌ JSON 解析失败:', e.message);
  process.exit(1);
}

// 读取当前文件
const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 提取当前 D 对象
const startMarker = 'const D = {';
const startIndex = content.indexOf(startMarker);
const afterStart = content.substring(startIndex);
const endMatch = afterStart.match(/\n\};\n/);
const endIndex = startIndex + endMatch.index + endMatch[0].length;
const currentDText = content.substring(startIndex, endIndex);

// 用 eval 解析当前 D 对象 (安全，因为是本地文件)
let currentD;
try {
  const objectLiteral = currentDText.replace(/^const D =\s*/, '').replace(/;\s*$/, '');
  currentD = eval('(' + objectLiteral + ')');
} catch (e) {
  console.error('❌ 无法解析当前 D 对象:', e.message);
  process.exit(1);
}

console.log('📖 当前数据:');
console.log(`   日期: ${currentD.dataAsOf}`);
console.log(`   Google Product SOV: ${currentD.hero.stats[0].value}`);
console.log(`   TT VV SOV: ${currentD.kpis[0].value}`);

// 辅助函数: 如果新值为 null/undefined，返回旧值
const keepOrNew = (newVal, oldVal) => (newVal === null || newVal === undefined) ? oldVal : newVal;

// 计算新值
const date = newData.date || currentD.dataAsOf;
const googleBrand = keepOrNew(newData.google?.brand, parseFloat(currentD.googleSov.brand[currentD.googleSov.brand.length - 1]));
const googleProduct = keepOrNew(newData.google?.product, parseFloat(currentD.googleSov.product[currentD.googleSov.product.length - 1]));
const ttVV = keepOrNew(newData.tt?.vv, parseFloat(currentD.ttSov.vvData[currentD.ttSov.vvData.length - 1]));
const ttSearch = keepOrNew(newData.tt?.search, parseFloat(currentD.ttSov.searchData[currentD.ttSov.searchData.length - 1]));
const ttImpressions = keepOrNew(newData.tt?.impressions, parseFloat(currentD.kpis[2].value));
const metaImpressions = keepOrNew(newData.meta?.impressions, parseFloat(currentD.kpis[3].value));
const consideration = keepOrNew(newData.consideration, parseFloat(currentD.hero.stats[1].value));
const engagementValue = keepOrNew(newData.engagement?.value, parseFloat(currentD.hero.stats[3].value));
const engagementRank = keepOrNew(newData.engagement?.rank, parseInt(currentD.overview[9].current.replace('#', '')));
const engagementShare = keepOrNew(newData.engagement?.share, parseFloat(currentD.kpis[5].sub.match(/行业占比：([\d.]+)%/)?.[1] || 0));
const spendProgress = keepOrNew(newData.spend?.progress, parseFloat(currentD.overview[11].current));
const exposureProgress = keepOrNew(newData.spend?.exposure, parseFloat(currentD.overview[12].current));

// 计算衍生值
const totalImpressions = (ttImpressions + metaImpressions).toFixed(2);
const totalImpressionsM = totalImpressions + 'M';

// 判断是否有新数据点（日期是否变化）
const hasNewGoogleData = newData.google?.brand !== null && newData.google?.brand !== undefined;
const hasNewTTData = newData.tt?.vv !== null && newData.tt?.vv !== undefined;
const hasNewConsiderationData = newData.consideration !== null && newData.consideration !== undefined;
const hasNewSpendData = newData.spend?.progress !== null && newData.spend?.progress !== undefined;

// 更新图表数据
const newGoogleLabels = [...currentD.googleSov.labels];
const newGoogleBrand = [...currentD.googleSov.brand];
const newGoogleProduct = [...currentD.googleSov.product];
if (hasNewGoogleData && !newGoogleLabels.includes(date)) {
  newGoogleLabels.push(date);
  newGoogleBrand.push(googleBrand);
  newGoogleProduct.push(googleProduct);
}

const newTTLabels = [...currentD.ttSov.labels];
const newTTVV = [...currentD.ttSov.vvData];
const newTTSearch = [...currentD.ttSov.searchData];
if (hasNewTTData && !newTTLabels.includes(date)) {
  newTTLabels.push(date);
  newTTVV.push(ttVV);
  newTTSearch.push(ttSearch);
}

const newConsiderationLabels = [...currentD.consideration.labels];
const newConsiderationBrand = [...currentD.consideration.brandData];
const newConsiderationIndustry = [...currentD.consideration.industryData];
if (hasNewConsiderationData && !newConsiderationLabels.includes(date)) {
  newConsiderationLabels.push(date);
  newConsiderationBrand.push(consideration * 1000000);
  // 行业均值需要从外部传入，这里保持上次值
  newConsiderationIndustry.push(currentD.consideration.industryData[currentD.consideration.industryData.length - 1]);
}

const newSpendLabels = [...currentD.spend.labels];
const newDailySpend = [...currentD.spend.dailySpend];
const newSpendProgress = [...currentD.spend.spendProgress];
const newExposureProgress = [...currentD.spend.exposureProgress];
if (hasNewSpendData && !newSpendLabels.includes(date)) {
  newSpendLabels.push(date);
  // 日消耗需要计算，这里用进度差值估算
  const lastProgress = currentD.spend.spendProgress[currentD.spend.spendProgress.length - 1] || 0;
  const progressDiff = spendProgress - lastProgress;
  newDailySpend.push(progressDiff * 100); // 粗略估算
  newSpendProgress.push(spendProgress);
  newExposureProgress.push(exposureProgress);
}

// 生成新的 D 对象
const newD = `const D = {
  updatedDate: '2026-${date.replace('/', '-').padStart(5, '0')}',
  dataAsOf: '${date}',

  // Alert banner
  alertBanner: '数据已更新至 ${date}。Google Product SOV ${googleProduct}%，TT VV SOV ${ttVV}%，TT Search SOV ${ttSearch}%，Consideration ${consideration}M，全网总曝光 ${totalImpressionsM}，互动量 ${engagementValue}M。/ Data updated to ${date}. Google Product SOV ${googleProduct}%, TT VV SOV ${ttVV}%, TT Search SOV ${ttSearch}%, Consideration ${consideration}M, Total Impressions ${totalImpressionsM}, Engagement ${engagementValue}M.',

  // Hero section
  hero: {
    desc: 'Google Product SOV ${googleProduct}% (${date}), Consideration ${consideration}M (${date}), 全网总曝光 ${totalImpressionsM}, 互动量 ${engagementValue}M. / Google 产品 SOV ${googleProduct}%，Consideration 总量 ${consideration}M，全网总曝光 ${totalImpressionsM}，互动量 ${engagementValue}M。',
    stats: [
      { label: 'Google 产品 SOV / Product SOV', value: '${googleProduct}%' },
      { label: 'Consideration 总量 / Total', value: '${consideration}M' },
      { label: '全网总曝光 / Total Impressions', value: '${totalImpressionsM}' },
      { label: '互动量 / Engagement', value: '${engagementValue}M' }
    ]
  },

  // KPI cards
  kpis: [
    { label: 'TikTok Video View SOV', statusDot: 'status-${ttVV >= 20 ? 'green' : 'red'}', value: '${ttVV}%', trend: '${ttVV >= 20 ? '↑' : '↓'}', trendClass: '${ttVV >= 20 ? 'trend-up' : 'trend-down'}', sub: 'Target / 目标 20% · As of / 截至 ${date}', borderLeft: null, valueColor: null },
    { label: 'TikTok Search SOV', statusDot: 'status-${ttSearch >= 13 ? 'green' : 'red'}', value: '${ttSearch}%', trend: '${ttSearch >= 13 ? '↑' : '↓'}', trendClass: '${ttSearch >= 13 ? 'trend-up' : 'trend-down'}', sub: 'Target / 目标 13% · As of / 截至 ${date}', borderLeft: null, valueColor: null },
    { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: '${ttImpressions}M', trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 700M · Progress / 进度 ${((ttImpressions / 700) * 100).toFixed(2)}%', borderLeft: '#3b82f6', valueColor: '#3b82f6' },
    { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-green', value: '${metaImpressions}M', trend: '↑', trendClass: 'trend-up', sub: 'As of / 截至 ${date}', borderLeft: '#ef4444', valueColor: '#ef4444' },
    { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59e0b', valueColor: '#f59e0b' },
    { label: '互动量 / Engagement', statusDot: 'status-${engagementRank <= 3 ? 'green' : 'yellow'}', value: '${engagementValue}M', trend: '↑', trendClass: 'trend-up', sub: 'Industry share / 行业占比：${engagementShare}% · Rank / 排名 #${engagementRank} · As of / 截至 ${date}', borderLeft: '#ec4899', valueColor: '#ec4899' }
  ],

  // Overview table
  overview: [
    { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: '${googleBrand}%', target: '—', date: '${date}' },
    { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: '${googleProduct}%', target: '—', date: '${date}' },
    { status: '${ttVV >= 20 ? 'green' : 'red'}', metric: 'TikTok VV SOV', current: '${ttVV}%', target: '20%', date: '${date}' },
    { status: '${ttSearch >= 13 ? 'green' : 'red'}', metric: 'TikTok Search SOV', current: '${ttSearch}%', target: '13%', date: '${date}' },
    { status: 'red', metric: 'TikTok曝光量 / Impressions', current: '${ttImpressions}M', target: '700M', date: '${date}' },
    { status: 'green', metric: 'Meta曝光量 / Impressions', current: '${metaImpressions}M', target: '—', date: '${date}' },
    { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
    { status: 'red', metric: '全网总曝光 / Total Impressions', current: '${totalImpressionsM}', target: '1000M+', date: '${date}' },
    { status: 'green', metric: '互动量 / Engagement', current: '${engagementValue}M', target: '—', date: '${date}' },
    { status: '${engagementRank <= 3 ? 'green' : 'yellow'}', metric: '互动率行业排名 / Engagement Rank', current: '#${engagementRank}', target: 'Top 3', date: '${date}' },
    { status: 'green', metric: 'Consideration 总量 / Total', current: '${consideration}M', target: '7M', date: '${date}' },
    { status: 'green', metric: '消耗进度 / Spend Progress', current: '${spendProgress}%', target: '—', date: '${date}' },
    { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: '${exposureProgress}%', target: '—', date: '${date}' }
  ],

  // Top videos leaderboard
  topVideos: ${JSON.stringify(currentD.topVideos, null, 4).replace(/\n/g, '\n  ')},

  // KOL videos leaderboard
  kolVideos: ${JSON.stringify(currentD.kolVideos, null, 4).replace(/\n/g, '\n  ')},

  // Google SOV chart data
  googleSov: {
    labels: ${JSON.stringify(newGoogleLabels)},
    brand: ${JSON.stringify(newGoogleBrand)},
    product: ${JSON.stringify(newGoogleProduct)},
    brandNote: 'Brand SOV latest ${googleBrand}% (${date}) / 品牌 SOV 最新 ${googleBrand}%（${date}）',
    productNote: 'Product SOV latest ${googleProduct}% (${date}) / 产品 SOV 最新 ${googleProduct}%（${date}）'
  },

  // Competitor comparison
  competitorCompare: {
    note: 'Google Trends 对比关键词 / Comparison: CAMON Slim 5G vs HONOR 600S, vivo V80 Lite, REDMI Note 17 Pro · 截至 ${date}',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    dailyLinks: [],
    chartLabels: ${JSON.stringify(newGoogleLabels)},
    datasets: [
      { label: 'CAMON Slim 5G (TECNO)', data: ${JSON.stringify(newGoogleProduct)}, borderColor: '#059669', bg: 'rgba(5,150,105,.15)', fill: true, dash: null, width: 3, pointRadius: 5 },
      { label: 'HONOR 600S', data: [], borderColor: '#7c3aed', bg: 'rgba(124,58,237,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'vivo V80 Lite', data: [], borderColor: '#2563eb', bg: 'rgba(37,99,235,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'REDMI Note 17 Pro', data: [], borderColor: '#ea580c', bg: 'rgba(234,88,12,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 }
    ],
    table: [
      { product: 'CAMON Slim 5G', brand: 'TECNO', brandBold: true, brandColor: '#059669', sov: '${googleProduct}%', sovColor: '#059669', sovBold: true, sovSize: '16px', trend: '↑', trendClass: 'trend-up', highlight: true },
      { product: 'REDMI Note 17 Pro', brand: 'Xiaomi', brandBold: false, brandColor: null, sov: '~33%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '→', trendClass: 'trend-flat', highlight: false },
      { product: 'HONOR 600S', brand: 'Honor', brandBold: false, brandColor: null, sov: '~27%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false },
      { product: 'vivo V80 Lite', brand: 'vivo', brandBold: false, brandColor: null, sov: '~26%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false }
    ],
    insight: '💡 竞品对比组合：CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro。CAMON Slim 5G 产品 SOV 最新 ${googleProduct}%（${date}）。竞品数据来自 Google Trends 相对搜索热度，反映搜索声量占比。/ Competitor set: CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro. Product SOV latest ${googleProduct}% (${date}). Competitor data from Google Trends relative search interest.'
  },

  // TikTok SOV chart data
  ttSov: {
    labels: ${JSON.stringify(newTTLabels)},
    vvData: ${JSON.stringify(newTTVV)},
    searchData: ${JSON.stringify(newTTSearch)},
    note: 'VV SOV latest ${ttVV}% (${date}); Search SOV latest ${ttSearch}% (${date}) / VV SOV 最新 ${ttVV}%（${date}）；Search SOV 最新 ${ttSearch}%（${date}）'
  },

  // Consideration chart data
  consideration: {
    labels: ${JSON.stringify(newConsiderationLabels)},
    brandData: ${JSON.stringify(newConsiderationBrand)},
    industryData: ${JSON.stringify(newConsiderationIndustry)},
    note: 'Brand Consideration latest ${consideration}M (${date}). / 本品牌 Consideration 最新 ${consideration}M（${date}）。'
  },

  // Spend chart data
  spend: {
    labels: ${JSON.stringify(newSpendLabels)},
    dailySpend: ${JSON.stringify(newDailySpend)},
    spendProgress: ${JSON.stringify(newSpendProgress)},
    exposureProgress: ${JSON.stringify(newExposureProgress)}
  },

  // Audience insights
  audience: ${JSON.stringify(currentD.audience, null, 4).replace(/\n/g, '\n  ')},

  // Keywords analysis
  keywords: ${JSON.stringify(currentD.keywords, null, 4).replace(/\n/g, '\n  ')},

  // Paid comment insights
  paidComments: ${JSON.stringify(currentD.paidComments, null, 4).replace(/\n/g, '\n  ')}
};`;

// 替换 D 对象
const newContent = content.substring(0, startIndex) + newD + '\n' + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('\n✅ 更新完成');
console.log(`📅 数据日期: ${date}`);
console.log(`📊 Google Product SOV: ${googleProduct}%`);
console.log(`📊 TT VV SOV: ${ttVV}%`);
console.log(`📊 全网总曝光: ${totalImpressionsM}`);
console.log(`📊 互动量: ${engagementValue}M`);
