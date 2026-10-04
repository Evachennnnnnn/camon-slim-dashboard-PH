const fs = require('fs');
const path = '/home/node/.openclaw/workspace-philippines-digital-marketing/dashboard-repo/index.html';
let s = fs.readFileSync(path, 'utf8');
const oldBlock = `  hero: {
    desc: 'Google Product SOV 16.67% (10/2), Consideration 2.18M (9/29), 全网总曝光 122.22M, 互动量行业排名 #4. / Google 产品 SOV 16.67%，Consideration 总量 2.18M，全网总曝光 122.22M，互动量行业排名 #4。',
    stats: [
      { label: 'Google 产品 SOV / Product SOV', value: '16.67%' },
      { label: 'Consideration 总量 / Total', value: '2.18M' },
      { label: '全网总曝光 / Total Impressions', value: '122.22M' },
      { label: '互动量行业排名 / Engagement Rank', value: '#4' }
    ]
  },

  // KPI cards
  kpis: [
    { label: 'TikTok Video View SOV', statusDot: 'status-yellow', value: '14.60%', trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 20% · As of / 截至 9/29', borderLeft: null, valueColor: null },
    { label: 'TikTok Search SOV', statusDot: 'status-yellow', value: '10.24%', trend: '↓', trendClass: 'trend-down', sub: 'Target / 目标 13% · As of / 截至 9/29', borderLeft: null, valueColor: null },
    { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: '90.95M', trend: null, trendClass: null, sub: 'Target / 目标 700M · Progress / 进度 12.99%', borderLeft: '#3b82f6', valueColor: '#3b82f6' },
    { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-green', value: '31.28M', trend: '↑', trendClass: 'trend-up', sub: 'As of / 截至 10/2', borderLeft: '#ef4444', valueColor: '#ef4444' },
    { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59e0b', valueColor: '#f59e0b' },
    { label: '互动量 / Engagement', statusDot: 'status-yellow', value: '1.03M', trend: null, trendClass: null, sub: 'Industry share / 行业占比：8.38% · Rank / 排名 #4 · As of / 截至 9/29', borderLeft: '#ec4899', valueColor: '#ec4899' }
  ],

  // Overview table
  overview: [
    { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: '15.44%', target: '—', date: '10/2' },
    { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: '16.67%', target: '—', date: '10/2' },
    { status: 'red', metric: 'TikTok VV SOV', current: '14.60%', target: '20%', date: '9/29' },
    { status: 'yellow', metric: 'TikTok Search SOV', current: '10.24%', target: '13%', date: '9/29' },
    { status: 'red', metric: 'TikTok曝光量 / Impressions', current: '90.95M', target: '700M', date: '9/29' },
    { status: 'green', metric: 'Meta曝光量 / Impressions', current: '31.28M', target: '—', date: '10/2' },
    { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
    { status: 'red', metric: '全网总曝光 / Total Impressions', current: '122.22M', target: '1000M+', date: '10/2' },
    { status: 'yellow', metric: '互动量 / Engagement', current: '1.03M', target: '—', date: '9/29' },
    { status: 'yellow', metric: '互动率行业排名 / Engagement Rank', current: '#4', target: 'Top 3', date: '9/29' },
    { status: 'red', metric: 'Consideration 总量 / Total', current: '2.18M', target: '7M', date: '9/29' },
    { status: 'red', metric: '消耗进度 / Spend Progress', current: '7.82%', target: '—', date: '9/30' },
    { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: '12.99%', target: '—', date: '9/29' }
  ],

  // Top videos leaderboard
  topVideos: [
    { rank: '🥇', name: 'MAGBADGE TEASER 1 COMING SOON', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688621974376959240', value: '1.84M', gold: true },
    { rank: '🥈', name: 'CAMON SLIM 5G PHONE TEASER', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688638865195748626', value: '1.83M', gold: false },
    { rank: '🥉', name: 'CAMON SLIM 5G TEASER', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688993031059557640', value: '1.72M', gold: false },
    { rank: '🏅', name: 'MagBadge Functions', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7689291481479171335', value: '1.51M', gold: false },
    { rank: '🏅', name: 'CAMON Slim Flashsnap Badminton HQ', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7689312958182083848', value: '1.49M', gold: false }
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
    labels: ['9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2'],
    brand: [15.32,15.24,15.41,15.62,15.44,16.74,15.44,15.55,15.36,15.33,15.44],
    product: [6.67,6.45,8.57,8.33,10.26,9.52,11.63,12.77,13.43,15.71,16.67],
    brandNote: 'Brand SOV latest 15.44% (10/2) / 品牌 SOV 最新 15.44%（10/2）',
    productNote: 'Product SOV latest 16.67% (10/2) / 产品 SOV 最新 16.67%（10/2）'
  },

  // Competitor comparison
  competitorCompare: {
    note: 'Google Trends 对比关键词 / Comparison: CAMON Slim 5G vs HONOR 600S, vivo V80 Lite, REDMI Note 17 Pro · 截至 10/2',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    dailyLinks: [
      { date: '9/22', link: 'https://trends.google.com/trends/explore?date=2026-08-22%202026-09-22&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/23', link: 'https://trends.google.com/trends/explore?date=2026-08-23%202026-09-23&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/24', link: 'https://trends.google.com/trends/explore?date=2026-08-24%202026-09-24&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/25', link: 'https://trends.google.com/trends/explore?date=2026-08-25%202026-09-25&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/26', link: 'https://trends.google.com/trends/explore?date=2026-08-26%202026-09-26&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/27', link: 'https://trends.google.com/trends/explore?date=2026-08-27%2026-09-27&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/28', link: 'https://trends.google.com/trends/explore?date=2026-08-28%202026-09-28&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/29', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/30', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '10/1', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '10/2', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' }
    ],
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    chartLabels: ['9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2'],
    datasets: [
      { label: 'CAMON Slim 5G (TECNO)', data: [6.67,6.45,8.57,8.33,10.26,9.52,11.63,12.77,13.43,15.71,16.67], borderColor: '#059669', bg: 'rgba(5,150,105,.15)', fill: true, dash: null, width: 3, pointRadius: 5 },
      { label: 'HONOR 600S', data: [35,35,31,32,31,32,29,28,28,27,27], borderColor: '#7c3aed', bg: 'rgba(124,58,237,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'vivo V80 Lite', data: [31,31,28,28,28,28,28,27,27,26,26], borderColor: '#2563eb', bg: 'rgba(37,99,235,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'REDMI Note 17 Pro', data: [27,27,31,31,31,30,31,33,33,33,33], borderColor: '#ea580c', bg: 'rgba(234,88,12,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 }
    ],
    table: [
      { product: 'CAMON Slim 5G', brand: 'TECNO', brandBold: true, brandColor: '#059669', sov: '16.67%', sovColor: '#059669', sovBold: true, sovSize: '16px', trend: '↑ +10.00pp', trendClass: 'trend-up', highlight: true },
      { product: 'REDMI Note 17 Pro', brand: 'Xiaomi', brandBold: false, brandColor: null, sov: '~33%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '→', trendClass: 'trend-flat', highlight: false },
      { product: 'HONOR 600S', brand: 'Honor', brandBold: false, brandColor: null, sov: '~27%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false },
      { product: 'vivo V80 Lite', brand: 'vivo', brandBold: false, brandColor: null, sov: '~26%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false }
    ],
    insight: '💡 竞品对比组合：CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro。CAMON Slim 5G 产品 SOV 从 6.67%（9/22）升至 16.67%（10/2），11日提升 +10.00pp，呈持续快速上升趋势。竞品数据来自 Google Trends 相对搜索热度，反映搜索声量占比。/ Competitor set: CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro. Product SOV rose from 6.67% to 16.67% in 11 days (+10.00pp). Competitor data from Google Trends relative search interest.'
  },

  // TikTok SOV chart data
  ttSov: {
    labels: ['9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29'],
    vvData: [5.91,5.86,6.98,4.87,5.81,8.65,9.15,9.99,10.77,12.48,14.60],
    searchData: [10.16,10.46,10.20,10.40,10.37,10.59,10.90,10.58,10.41,10.39,10.24],
    note: 'VV SOV latest 14.60% (9/29); Search SOV latest 10.24% (9/29) / VV SOV 最新 14.60%（9/29）；Search SOV 最新 10.24%（9/29）'
  },

  // Consideration chart data
  consideration: {
    labels: ['9/1','9/2','9/3','9/4','9/5','9/6','9/7','9/8','9/9','9/10','9/11','9/12','9/13','9/14','9/15','9/16','9/17','9/18','9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29'],
    brandData: [2089916,2046584,2039830,2092499,2277829,2624653,2771283,3106841,3539842,3540106,3507328,3494628,3477955,3560376,3740292,3752809,3735487,3821243,3689704,3372097,2953133,2871458,2497108,2046936,2063109,2082804,2116158,2218912,2180228],
    industryData: [2659331,2647541,2654025,2719212,2897390,3148738,3243339,3566055,3963690,4018355,4028618,4088046,4129734,4149206,4259073,4278714,4276787,4353727,4278515,4071568,3820202,3890857,3658237,3353637,3328297,3330730,3326506,3313913,3267573],
    note: 'Brand Consideration 9/1~9/29, peak 3.82M (9/18), latest 2.18M (9/29). Top 5 行业均值 peak 4.35M (9/18), latest 3.27M (9/29). / 本品牌 Consideration 9/1~9/29，峰值 3.82M（9/18），最新 2.18M（9/29）。Top 5 行业均值峰值 4.35M（9/18），最新 3.27M（9/29）。'
  },

  // Spend chart data
  spend: {
    labels: ['9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2'],
    dailySpend: [0,0,250,0,67.43,388.14,770.95,1132.44,1616.93,2064.44,3423.80,5444.64,4467.63,2711.27],
    spendProgress: [0,0,0.17,0.17,0.19,0.37,0.73,1.25,2.03,3.06,4.86,7.82,null,null],
    exposureProgress: [0.71,1.43,2.21,2.95,3.61,4.59,5.72,7.11,8.85,10.79,12.99,null,null,null]
  },
`;
const newBlock = `  hero: {
    desc: 'Google Product SOV 18.06% (10/3), Consideration 2.39M (10/2), 全网总曝光 150.81M, 互动量行业排名 #3. / Google 产品 SOV 18.06%，Consideration 总量 2.39M，全网总曝光 150.81M，互动量行业排名 #3。',
    stats: [
      { label: 'Google 产品 SOV / Product SOV', value: '18.06%' },
      { label: 'Consideration 总量 / Total', value: '2.39M' },
      { label: '全网总曝光 / Total Impressions', value: '150.81M' },
      { label: '互动量行业排名 / Engagement Rank', value: '#3' }
    ]
  },

  // KPI cards
  kpis: [
    { label: 'TikTok Video View SOV', statusDot: 'status-green', value: '17.66%', trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 20% · As of / 截至 9/30', borderLeft: null, valueColor: null },
    { label: 'TikTok Search SOV', statusDot: 'status-yellow', value: '10.94%', trend: '↑', trendClass: 'trend-up', sub: 'Target / 目标 13% · As of / 截至 9/30', borderLeft: null, valueColor: null },
    { label: 'TikTok曝光量 / TikTok Impressions', statusDot: 'status-red', value: '110.39M', trend: null, trendClass: null, sub: 'Target / 目标 700M · Progress / 进度 15.77%', borderLeft: '#3b82f6', valueColor: '#3b82f6' },
    { label: 'Meta曝光量 / Meta Impressions', statusDot: 'status-green', value: '40.42M', trend: '↑', trendClass: 'trend-up', sub: 'As of / 截至 10/3', borderLeft: '#ef4444', valueColor: '#ef4444' },
    { label: 'Google曝光量 / Google Impressions', statusDot: 'status-yellow', value: '0', trend: null, trendClass: null, sub: 'No data / 暂无数据', borderLeft: '#f59e0b', valueColor: '#f59e0b' },
    { label: '互动量 / Engagement', statusDot: 'status-green', value: '1.24M', trend: '↑', trendClass: 'trend-up', sub: 'Industry share / 行业占比：10.16% · Rank / 排名 #3 · As of / 截至 9/30', borderLeft: '#ec4899', valueColor: '#ec4899' }
  ],

  // Overview table
  overview: [
    { status: 'green', metric: 'Google 品牌 SOV / Brand SOV', current: '15.65%', target: '—', date: '10/3' },
    { status: 'green', metric: 'Google 产品 SOV / Product SOV', current: '18.06%', target: '—', date: '10/3' },
    { status: 'green', metric: 'TikTok VV SOV', current: '17.66%', target: '20%', date: '9/30' },
    { status: 'yellow', metric: 'TikTok Search SOV', current: '10.94%', target: '13%', date: '9/30' },
    { status: 'red', metric: 'TikTok曝光量 / Impressions', current: '110.39M', target: '700M', date: '9/30' },
    { status: 'green', metric: 'Meta曝光量 / Impressions', current: '40.42M', target: '—', date: '10/3' },
    { status: 'red', metric: 'Google曝光量 / Impressions', current: '0', target: '—', date: '—' },
    { status: 'red', metric: '全网总曝光 / Total Impressions', current: '150.81M', target: '1000M+', date: '10/3' },
    { status: 'green', metric: '互动量 / Engagement', current: '1.24M', target: '—', date: '9/30' },
    { status: 'green', metric: '互动率行业排名 / Engagement Rank', current: '#3', target: 'Top 3', date: '9/30' },
    { status: 'green', metric: 'Consideration 总量 / Total', current: '2.39M', target: '7M', date: '10/2' },
    { status: 'red', metric: '消耗进度 / Spend Progress', current: '7.82%', target: '—', date: '9/30' },
    { status: 'red', metric: '曝光完成进度 / Exposure Progress', current: '15.77%', target: '—', date: '9/30' }
  ],

  // Top videos leaderboard
  topVideos: [
    { rank: '🥇', name: 'MAGBADGE TEASER 1 COMING SOON', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688621974376959240', value: '1.84M', gold: true },
    { rank: '🥈', name: 'CAMON SLIM 5G PHONE TEASER', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688638865195748626', value: '1.83M', gold: false },
    { rank: '🥉', name: 'CAMON SLIM 5G TEASER', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7688993031059557640', value: '1.72M', gold: false },
    { rank: '🏅', name: 'MagBadge Functions', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7689291481479171335', value: '1.51M', gold: false },
    { rank: '🏅', name: 'CAMON Slim Flashsnap Badminton HQ', url: 'https://www.tiktok.com/@tecnomobilephilippines/video/7689312958182083848', value: '1.49M', gold: false }
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
    labels: ['9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2','10/3'],
    brand: [15.32,15.24,15.41,15.62,15.44,16.74,15.44,15.55,15.36,15.33,15.44,15.65],
    product: [6.67,6.45,8.57,8.33,10.26,9.52,11.63,12.77,13.43,15.71,16.67,18.06],
    brandNote: 'Brand SOV latest 15.65% (10/3) / 品牌 SOV 最新 15.65%（10/3）',
    productNote: 'Product SOV latest 18.06% (10/3) / 产品 SOV 最新 18.06%（10/3）'
  },

  // Competitor comparison
  competitorCompare: {
    note: 'Google Trends 对比关键词 / Comparison: CAMON Slim 5G vs HONOR 600S, vivo V80 Lite, REDMI Note 17 Pro · 截至 10/3',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    dailyLinks: [
      { date: '9/22', link: 'https://trends.google.com/trends/explore?date=2026-08-22%202026-09-22&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/23', link: 'https://trends.google.com/trends/explore?date=2026-08-23%202026-09-23&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/24', link: 'https://trends.google.com/trends/explore?date=2026-08-24%202026-09-24&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/25', link: 'https://trends.google.com/trends/explore?date=2026-08-25%202026-09-25&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/26', link: 'https://trends.google.com/trends/explore?date=2026-08-26%202026-09-26&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/27', link: 'https://trends.google.com/trends/explore?date=2026-08-27%2026-09-27&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/28', link: 'https://trends.google.com/trends/explore?date=2026-08-28%202026-09-28&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/29', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '9/30', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '10/1', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '10/2', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' },
      { date: '10/3', link: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en' }
    ],
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    trendLink: 'https://trends.google.com/trends/explore?date=today%201-m&geo=PH&q=CAMON%20Slim%205G,HONOR%20600S,vivo%20V80%20Lite,REDMI%20Note%2017%20Pro&hl=en',
    chartLabels: ['9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2','10/3'],
    datasets: [
      { label: 'CAMON Slim 5G (TECNO)', data: [6.67,6.45,8.57,8.33,10.26,9.52,11.63,12.77,13.43,15.71,16.67,18.06], borderColor: '#059669', bg: 'rgba(5,150,105,.15)', fill: true, dash: null, width: 3, pointRadius: 5 },
      { label: 'HONOR 600S', data: [35,35,31,32,31,32,29,28,28,27,27,27], borderColor: '#7c3aed', bg: 'rgba(124,58,237,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'vivo V80 Lite', data: [31,31,28,28,28,28,28,27,27,26,26,26], borderColor: '#2563eb', bg: 'rgba(37,99,235,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 },
      { label: 'REDMI Note 17 Pro', data: [27,27,31,31,31,30,31,33,33,33,33,33], borderColor: '#ea580c', bg: 'rgba(234,88,12,.05)', fill: false, dash: [4,2], width: null, pointRadius: 3 }
    ],
    table: [
      { product: 'CAMON Slim 5G', brand: 'TECNO', brandBold: true, brandColor: '#059669', sov: '18.06%', sovColor: '#059669', sovBold: true, sovSize: '16px', trend: '↑ +11.39pp', trendClass: 'trend-up', highlight: true },
      { product: 'REDMI Note 17 Pro', brand: 'Xiaomi', brandBold: false, brandColor: null, sov: '~33%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '→', trendClass: 'trend-flat', highlight: false },
      { product: 'HONOR 600S', brand: 'Honor', brandBold: false, brandColor: null, sov: '~27%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false },
      { product: 'vivo V80 Lite', brand: 'vivo', brandBold: false, brandColor: null, sov: '~26%', sovColor: '#64748b', sovBold: false, sovSize: null, trend: '↓', trendClass: 'trend-down', highlight: false }
    ],
    insight: '💡 竞品对比组合：CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro。CAMON Slim 5G 产品 SOV 从 6.67%（9/22）升至 18.06%（10/3），12日提升 +11.39pp，呈持续快速上升趋势。竞品数据来自 Google Trends 相对搜索热度，反映搜索声量占比。/ Competitor set: CAMON Slim 5G vs HONOR 600S / vivo V80 Lite / REDMI Note 17 Pro. Product SOV rose from 6.67% to 18.06% in 12 days (+11.39pp). Competitor data from Google Trends relative search interest.'
  },

  // TikTok SOV chart data
  ttSov: {
    labels: ['9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30'],
    vvData: [5.91,5.86,6.98,4.87,5.81,8.65,9.15,9.99,10.77,12.48,14.60,17.66],
    searchData: [10.16,10.46,10.20,10.40,10.37,10.59,10.90,10.58,10.41,10.39,10.24,10.94],
    note: 'VV SOV latest 17.66% (9/30); Search SOV latest 10.94% (9/30) / VV SOV 最新 17.66%（9/30）；Search SOV 最新 10.94%（9/30）'
  },

  // Consideration chart data
  consideration: {
    labels: ['9/1','9/2','9/3','9/4','9/5','9/6','9/7','9/8','9/9','9/10','9/11','9/12','9/13','9/14','9/15','9/16','9/17','9/18','9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2'],
    brandData: [2089916,2046584,2039830,2092499,2277829,2624653,2771283,3106841,3539842,3540106,3507328,3494628,3477955,3560376,3740292,3752809,3735487,3821243,3689704,3372097,2953133,2871458,2497108,2046936,2063109,2082804,2116158,2218912,2180228,2121159,2179502,2387021],
    industryData: [2659331,2647541,2654025,2719212,2897390,3148738,3243339,3566055,3963690,4018355,4028618,4088046,4129734,4149206,4259073,4278714,4276787,4353727,4278515,4071568,3820202,3890857,3658237,3353637,3328297,3330730,3326506,3313913,3267573,3197379,3152750,3174641],
    note: 'Brand Consideration 9/1~10/2, peak 3.82M (9/18), latest 2.39M (10/2). Top 5 行业均值 peak 4.35M (9/18), latest 3.17M (10/2). / 本品牌 Consideration 9/1~10/2，峰值 3.82M（9/18），最新 2.39M（10/2）。Top 5 行业均值峰值 4.35M（9/18），最新 3.17M（10/2）。'
  },

  // Spend chart data
  spend: {
    labels: ['9/19','9/20','9/21','9/22','9/23','9/24','9/25','9/26','9/27','9/28','9/29','9/30','10/1','10/2','10/3'],
    dailySpend: [0,0,250,0,67.43,388.14,770.95,1132.44,1616.93,2064.44,3423.80,5444.64,4467.63,2711.27,4144.63],
    spendProgress: [0,0,0.17,0.17,0.19,0.37,0.73,1.25,2.03,3.06,4.86,7.82,null,null,null],
    exposureProgress: [0.71,1.43,2.21,2.95,3.61,4.59,5.72,7.11,8.85,10.79,12.99,15.77,null,null,null]
  },
`;
if (!s.includes(oldBlock)) throw new Error('Old block not found');
s = s.replace(oldBlock, newBlock);
fs.writeFileSync(path, s);
console.log('patched');