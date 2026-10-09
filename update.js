#!/usr/bin/env node
/**
 * 看板数据更新脚本
 * 用法: node update.js --data '<JSON数据>'
 * 
 * 数据结构:
 * {
 *   date: '10/8',           // 数据日期
 *   google: { brand: 15.53, product: 17.39 },
 *   tt: { vv: 23.26, search: 10.85, impressions: 230.57 },
 *   meta: { impressions: 82.22 },
 *   consideration: 2.38,
 *   engagement: { value: 21.98, rank: 5, share: 10.44 },
 *   spend: { progress: 36.55, exposure: 32.94 },
 *   charts: {
 *     googleLabels: [...],
 *     googleBrand: [...],
 *     googleProduct: [...],
 *     ttLabels: [...],
 *     ttVV: [...],
 *     ttSearch: [...],
 *     considerationLabels: [...],
 *     considerationBrand: [...],
 *     considerationIndustry: [...],
 *     spendLabels: [...],
 *     dailySpend: [...],
 *     spendProgress: [...],
 *     exposureProgress: [...]
 *   }
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

let data;
try {
  data = JSON.parse(dataArg);
} catch (e) {
  console.error('❌ JSON 解析失败:', e.message);
  process.exit(1);
}

// 读取当前文件
const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 计算衍生值
const totalImpressions = (data.tt.impressions + data.meta.impressions).toFixed(2);
const totalImpressionsM = totalImpressions + 'M';

// 生成新的 D 对象
const newD = `const D = {
  updatedDate: '2026-${data.date.replace('/', '-')}',
  dataAsOf: '${data.date}',

  // Alert banner
  alertBanner: '数据已更新至 ${data.date}。Google Product SOV ${data.google.product}%，TT VV SOV ${data.tt.vv}%，TT Search SOV ${data.tt.search}%，Consideration ${data.consideration}M，全网总曝光 ${totalImpressionsM}，互动量 ${data.engagement.value}M。/ Data updated to ${data.date}. Google Product SOV ${data.google.product}%, TT VV SOV ${data.tt.vv}%, TT Search SOV ${data.tt.search}%, Consideration ${data.consideration}M, Total Impressions ${totalImpressionsM}, Engagement ${data.engagement.value}M.',

  // Hero section
  hero: {
    desc: 'Google Product SOV ${data.google.product}% (${data.date}), Consideration ${data.consideration}M (${data.date}), 全网总曝光 ${totalImpressionsM}, 互动量 ${data.engagement.value}M. / Google 产品 SOV ${data.google.product}%，Consideration 总量 ${data.consideration}M，全网总曝光 ${totalImpressionsM}，互动量 ${data.engagement.value}M。',
    stats: [
      { label: 'Google 产品 SOV / Product SOV', value: '${data.google.product}%' },
      { label: 'Consideration 总量 / Total', value: '${data.consideration}M' },
      { label: '全网总曝光 / Total Impressions', value: '${totalImpressionsM}' },
      { label: '互动量 / Engagement', value: '${data.engagement.value}M' }
    ]
  },

  // KPI cards
  kpis: [
    { label: 'TikTok Video View SOV', statusDot: 'status-${data.tt.vv >= 20 ? 'green' : 'red'}', value: '${data.tt.vv}%', trend: '${data.tt.vv >= 20 ? '↑' : '↓'}', trendClass: '${data.tt.vv >= 20 ? 'trend-up' : 'trend-down'}', sub: 'Target / 目标 20% · As of / 截至 ${data.date}', borderLeft: null, valueColor: null },
    { label: 'TikTok Search SOV', statusDot: 'status-${data.tt.search >= 13 ? 'green' : 'red'}', value: '${data.tt.search}%', trend: '${data.tt.search >= 13 ? '↑' : '↓'}', trendClass: '${data.tt.search >= 13 ? 'trend-up' : 'trend-down'}', sub: 'Target / 目标 13% · As of / 截至 ${data.date}', borderLeft: null, valueColor: null },
    { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: '${data.tt.impressions}M', trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 700M · Progress / 进度 ${((data.tt.impressions / 700) * 100).toFixed(2)}%', borderLeft: '#3b82f6', valueColor: '#3b82f6' },
    { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-green', value: '${data.meta.impressions}M', trend: '↑', trendClass: 'trend-up', sub: 'As of / 截至 ${data.date}', borderLeft: '#ef4444', valueColor: '#ef4444' },
    { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59e0b', valueColor: '#f59e0b' },
    { label: '互动量 / Engagement', statusDot: 'status-${data.engagement.rank <= 3 ? 'green' : 'yellow'}', value: '${data.engagement.value}M', trend: '↑', trendClass: 'trend-up', sub: 'Industry share / 行业占比：${data.engagement.share}% · Rank / 排名 #${data.engagement.rank} · As of / 截至 ${data.date}', borderLeft: '#ec4899', valueColor: '#ec4899' }
  ],

  // Overview table
  overview: [
    { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: '${data.google.brand}%', target: '—', date: '${data.date}' },
    { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: '${data.google.product}%', target: '—', date: '${data.date}' },
    { status: '${data.tt.vv >= 20 ? 'green' : 'red'}', metric: 'TikTok VV SOV', current: '${data.tt.vv}%', target: '20%', date: '${data.date}' },
    { status: '${data.tt.search >= 13 ? 'green' : 'red'}', metric: 'TikTok Search SOV', current: '${data.tt.search}%', target: '13%', date: '${data.date}' },
    { status: 'red', metric: 'TikTok曝光量 / Impressions', current: '${data.tt.impressions}M', target: '700M', date: '${data.date}' },
    { status: 'green', metric: 'Meta曝光量 / Impressions', current: '${data.meta.impressions}M', target: '—', date: '${data.date}' },
    { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
    { status: 'red', metric: '全网总曝光 / Total Impressions', current: '${totalImpressionsM}', target: '1000M+', date: '${data.date}' },
    { status: 'green', metric: '互动量 / Engagement', current: '${data.engagement.value}M', target: '—', date: '${data.date}' },
    { status: '${data.engagement.rank <= 3 ? 'green' : 'yellow'}', metric: '互动率行业排名 / Engagement Rank', current: '#${data.engagement.rank}', target: 'Top 3', date: '${data.date}' },
    { status: 'green', metric: 'Consideration 总量 / Total', current: '${data.consideration}M', target: '7M', date: '${data.date}' },
    { status: 'green', metric: '消耗进度 / Spend Progress', current: '${data.spend.progress}%', target: '—', date: '${data.date}' },
    { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: '${data.spend.exposure}%', target: '—', date: '${data.date}' }
  ],

  // Top videos leaderboard
  topVideos: [
    { rank: '🥇', name: 'EMOTIONAL VIDEO 1', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7690785425652288786', value: '14M', gold: true },
    { rank: '🥈', name: 'TVC', url: 'https://www.tiktok.com/tiktokstudio/content', value: '14M', gold: false },
    { rank: '🥉', name: 'Magbadget Function Video', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7689291481479171335', value: '8.9M', gold: false },
    { rank: '🏅', name: 'Teaser-HQ ID Video', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7690841062276893959', value: '6.8M', gold: false },
    { rank: '🏅', name: 'MAGBADGE - NOW AVAILABLE', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7690912538053168402', value: '3.6M', gold: false }
  ],

  // KOL videos leaderboard
  kolVideos: [
    { rank: '🥇', name: 'Pending / 待更新', url: null, value: '—', gold: true, pending: true },
    { rank: '🥈', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
    { rank: '🥉', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
    { rank: '🏅', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true },
    { rank: '🏅', name: 'Pending / 待更新', url: null, value: '—', gold: false, pending: true }
  ],

  // Google SOV chart data
  googleSov: {
    labels: ${JSON.stringify(data.charts.googleLabels)},
    brand: ${JSON.stringify(data.charts.googleBrand)},
    product: ${JSON.stringify(data.charts.googleProduct)},
    brandNote: 'Brand SOV latest ${data.google.brand}% (${data.date}) / 品牌 SOV 最新 ${data.google.brand}%（${data.date}）',
    productNote: 'Product SOV latest ${data.google.product}% (${data.date}) / 产品 SOV 最新 ${data.google.product}%（${data.date}）'
  },

  // Competitor comparison
  competitorCompare: {
    note: 'Google Trends 对比关键词 / Comparison: CAMON Slim 5G vs HONOR 600S, vivo V80 Lite, REDMI Note 17 Pro · 截至 ${data.date}',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    dailyLinks: [],
    chartLabels: ${JSON.stringify(data.charts.googleLabels)},
    datasets: [
      { label: 'CAMON Slim 5G (TECNO)', data: ${JSON.stringify(data.charts.googleProduct)}, borderColor: '#059669', bg: 'rgba(5,150,105,.15)', fill: true, dash: null, width: 3, pointRadius: 5 },
      { label: 'HONOR 600S', data: [], borderColor: '#7c3aed', bg: 'rgba(124,58,237,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'vivo V80 Lite', data: [], borderColor: '#2563eb', bg: 'rgba(37,99,235,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'REDMI Note 17 Pro', data: [], borderColor: '#ea580c', bg: 'rgba(234,88,12,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 }
    ],
    table: [
      { product: 'CAMON Slim 5G', brand: 'TECNO', brandBold: true, brandColor: '#059669', sov: '${data.google.product}%', sovColor: '#059669', sovBold: true, sovSize: '16px', trend: '↑', trendClass: 'trend-up', highlight: true },
      { product: 'REDMI Note 17 Pro', brand: 'Xiaomi', brandBold: false, brandColor: null, sov: '~33%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '→', trendClass: 'trend-flat', highlight: false },
      { product: 'HONOR 600S', brand: 'Honor', brandBold: false, brandColor: null, sov: '~27%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false },
      { product: 'vivo V80 Lite', brand: 'vivo', brandBold: false, brandColor: null, sov: '~26%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false }
    ],
    insight: '💡 竞品对比组合：CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro。CAMON Slim 5G 产品 SOV 最新 ${data.google.product}%（${data.date}）。竞品数据来自 Google Trends 相对搜索热度，反映搜索声量占比。/ Competitor set: CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro. Product SOV latest ${data.google.product}% (${data.date}). Competitor data from Google Trends relative search interest.'
  },

  // TikTok SOV chart data
  ttSov: {
    labels: ${JSON.stringify(data.charts.ttLabels)},
    vvData: ${JSON.stringify(data.charts.ttVV)},
    searchData: ${JSON.stringify(data.charts.ttSearch)},
    note: 'VV SOV latest ${data.tt.vv}% (${data.date}); Search SOV latest ${data.tt.search}% (${data.date}) / VV SOV 最新 ${data.tt.vv}%（${data.date}）；Search SOV 最新 ${data.tt.search}%（${data.date}）'
  },

  // Consideration chart data
  consideration: {
    labels: ${JSON.stringify(data.charts.considerationLabels)},
    brandData: ${JSON.stringify(data.charts.considerationBrand)},
    industryData: ${JSON.stringify(data.charts.considerationIndustry)},
    note: 'Brand Consideration latest ${data.consideration}M (${data.date}). / 本品牌 Consideration 最新 ${data.consideration}M（${data.date}）。'
  },

  // Spend chart data
  spend: {
    labels: ${JSON.stringify(data.charts.spendLabels)},
    dailySpend: ${JSON.stringify(data.charts.dailySpend)},
    spendProgress: ${JSON.stringify(data.charts.spendProgress)},
    exposureProgress: ${JSON.stringify(data.charts.exposureProgress)}
  },

  // Audience insights
  audience: {
    platformMetrics: [
      { label: 'TikTok CPM', value: '$0.52', color: '#6d28d9', bg: 'rgba(124,58,237,.12)', border: 'rgba(124,58,237,.25)' },
      { label: 'TikTok CPE', value: '$0.059', color: '#6d28d9', bg: 'rgba(124,58,237,.12)', border: 'rgba(124,58,237,.25)' },
      { label: 'FB&IG CPM', value: '$0.36', color: '#1d4ed8', bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.25)' },
      { label: 'FB&IG CPE', value: '$0.005', color: '#1d4ed8', bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.25)' }
    ],
    ttAudience: [],
    fbigAudience: []
  },

  // Keywords analysis
  keywords: {
    window: 'Data window / 时间窗: 2026-09-24 ~ 2026-10-04 · Brand / 品牌: Tecno · Source: TikTok Keyword Analysis',
    stats: [],
    breakdown: [],
    topVideos: [],
    insights: []
  },

  // Paid comment insights
  paidComments: {
    window: 'Data window / 时间窗: 2026-09-24 ~ 2026-10-04 · Ad type / 广告类型: 授权原生广告 / 代理商代投',
    stats: [],
    audienceTable: [],
    materialsTable: [],
    insights: []
  }
};`;

// 替换 D 对象
const startMarker = 'const D = {';
const endMarker = '\n};\n';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ 无法找到 D 对象');
  process.exit(1);
}

const newContent = content.substring(0, startIndex) + newD + content.substring(endIndex);

// 写回文件
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ D 对象已更新');
console.log(`📅 数据日期: ${data.date}`);
console.log(`📊 Google Product SOV: ${data.google.product}%`);
console.log(`📊 TT VV SOV: ${data.tt.vv}%`);
console.log(`📊 全网总曝光: ${totalImpressionsM}`);
