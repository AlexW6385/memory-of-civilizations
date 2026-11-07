// Bilingual interface: English by default, Chinese available.

const STRINGS = {
  en: {
    title: 'Memory of Civilizations',
    lede: 'A small planet of the civilizations of Earth, each where it stood.',
    loading: 'Preparing the world…',
    compiling: 'Lighting the halls…',
    'st-start': 'Starting the renderer', 'st-land': 'Shaping the land', 'st-build': 'Raising the buildings', 'st-plants': 'Planting', 'st-shaders': 'Preparing the light',
    'stale': 'The site has been updated: reload the page to keep exploring.', 'travelling': 'Travelling…', 'map-hint': 'Click anywhere on the map to go there; on or near a settlement, you arrive beside its landmark. Night is shaded.',
    ready: 'Ready.',
    enter: 'Enter',
    resume: 'Continue',
    'controls-desktop': 'W A S D to walk · mouse to look · Shift to run · hold Space to fly, faster the longer · Space twice to cruise · M for the map · Esc to pause',
    'controls-touch': 'Left thumb to walk · drag to look · hold ↑ to fly; slide onto → to cruise',
    'ctl-k-mouse': 'Mouse', 'ctl-k-hold': 'Hold', 'ctl-k-clock': 'Clock', 'ctl-k-thumb': 'Left thumb', 'ctl-k-drag': 'Drag', 'ctl-k-holdup': 'Hold ↑', 'ctl-k-slide': 'Slide to →', 'ctl-k-corner': 'Corner map',
    'ctl-title': 'Controls', 'ctl-walk': 'Walk', 'ctl-look': 'Look (double-click to capture the mouse)', 'ctl-turn': 'Turn left / right', 'ctl-run': 'Run', 'ctl-fly': 'Fly, faster the longer you hold', 'ctl-cruise': 'Cruise', 'ctl-map': 'Map', 'ctl-random': 'Random city (on the map)', 'ctl-esc': 'Close panels, release the mouse', 'ctl-clock': 'Drag the corner slider to change the hour',
    'ctl-t-walk': 'Walk', 'ctl-t-look': 'Look around', 'ctl-t-fly': 'Fly', 'ctl-t-cruise': 'Cruise', 'ctl-t-map': 'Tap to open the map',
    random: 'Random city', tour: 'Tour', 'ctl-tour': 'Tour: an aerial circuit over settlement after settlement (any key stops it)',
    regions: { east: 'East Asia', south: 'South and Southeast Asia', mena: 'Middle East and North Africa', africa: 'Africa', europe: 'Europe', americas: 'The Americas', oceania: 'Oceania', other: 'Elsewhere' },
    map: 'Map',
    settings: 'Settings',
    language: 'Language',
    quality: 'Picture quality',
    time: 'Time of day', 't-pause': 'Pause or run the time', 'mm-hide': 'Hide the small map', 'mm-show': 'Show the small map', 'map-open': 'Open the map (M)', 'card-fold': 'Fold the card', 'card-show': 'Show the map and the clock', 'sound-on': 'Sound on', 'sound-off': 'Mute',
    gaits: { still: 'Standing', walk: 'Walking', run: 'Running', fly: 'Flying', cruise: 'Cruising' }, 'fly-hold': 'Hold to fly', cruise: 'Cruise', 'above-ground': 'm up',
    periods: ['Night', 'Dawn', 'Morning', 'Midday', 'Afternoon', 'Dusk', 'Evening', 'Night'],
    'q-high': 'High', 'q-medium': 'Medium', 'q-low': 'Low',
    music: 'Music',
    sensitivity: 'Look sensitivity',
    'no-webgpu': 'WebGPU is not available in this browser, so the world runs on WebGL 2 and may be slower. Chrome, Edge and Safari 26 support WebGPU.',
    'error': 'The world could not be started: ',
    ld: { renderer: 'renderer', map: 'land map', plans: 'plans', start: 'starting', build: 'buildings', land: 'ground', world: 'buildings and ground', plants: 'plants', shaders: 'shaders' },
    you: 'You',
    districts: { nile: 'The Nile', greece: 'Greece', rome: 'Rome', byzantium: 'Byzantium', levant: 'The Levant', francia: 'Francia', tang: 'Tang China', heian: 'Heian Japan', india: 'India' },
  },
  zh: {
    title: '文明的记忆',
    lede: '一颗小小的星球，地球上的各个文明各在其位。',
    loading: '正在准备世界……',
    compiling: '正在点亮殿堂……',
    'st-start': '正在启动渲染器', 'st-land': '正在塑造地形', 'st-build': '正在建造建筑', 'st-plants': '正在种植植物', 'st-shaders': '正在准备光照',
    'stale': '网站已更新，请刷新页面后继续浏览。', 'travelling': '正在前往……', 'map-hint': '点击地图上任意位置即可前往；点在建筑群上或附近，会直接到达其主建筑旁。阴影部分为黑夜。',
    ready: '准备好了。',
    enter: '进入',
    resume: '继续',
    'controls-desktop': 'W A S D 行走 · 鼠标环顾 · Shift 奔跑 · 按住空格飞行，越按越快 · 双击空格巡航 · M 打开地图 · Esc 暂停',
    'controls-touch': '左手拇指行走 · 拖动环顾 · 按住 ↑ 飞行，滑到 → 巡航',
    'ctl-k-mouse': '鼠标', 'ctl-k-hold': '按住', 'ctl-k-clock': '时钟', 'ctl-k-thumb': '左手拇指', 'ctl-k-drag': '拖动', 'ctl-k-holdup': '按住 ↑', 'ctl-k-slide': '滑到 →', 'ctl-k-corner': '角落地图',
    'ctl-title': '操作', 'ctl-walk': '行走', 'ctl-look': '环顾（双击以捕获鼠标）', 'ctl-turn': '向左 / 向右转身', 'ctl-run': '奔跑', 'ctl-fly': '飞行，按得越久越快', 'ctl-cruise': '巡航', 'ctl-map': '地图', 'ctl-random': '随机城市（在地图中）', 'ctl-esc': '关闭面板，释放鼠标', 'ctl-clock': '拖动角落滑块调整时间',
    'ctl-t-walk': '行走', 'ctl-t-look': '环顾', 'ctl-t-fly': '飞行', 'ctl-t-cruise': '巡航', 'ctl-t-map': '点按打开地图',
    random: '随机城市', tour: '漫游', 'ctl-tour': '游览：在空中环绕一个又一个聚落（按任意键退出）',
    regions: { east: '东亚', south: '南亚与东南亚', mena: '中东与北非', africa: '非洲', europe: '欧洲', americas: '美洲', oceania: '大洋洲', other: '其他' },
    map: '地图',
    settings: '设置',
    language: '语言',
    quality: '画质',
    time: '时间', 't-pause': '暂停或继续时间', 'mm-hide': '隐藏小地图', 'mm-show': '显示小地图', 'map-open': '打开地图（M）', 'card-fold': '收起卡片', 'card-show': '展开地图和时间', 'sound-on': '打开声音', 'sound-off': '静音',
    gaits: { still: '站立', walk: '步行', run: '奔跑', fly: '飞行', cruise: '巡航' }, 'fly-hold': '按住飞行', cruise: '巡航', 'above-ground': '米高',
    periods: ['深夜', '黎明', '上午', '正午', '下午', '黄昏', '傍晚', '夜晚'],
    'q-high': '高', 'q-medium': '中', 'q-low': '低',
    music: '音乐',
    sensitivity: '视角灵敏度',
    'no-webgpu': '此浏览器不支持 WebGPU，世界将以 WebGL 2 运行，可能较慢。Chrome、Edge 和 Safari 26 均支持 WebGPU。',
    'error': '世界无法启动：',
    ld: { renderer: '渲染器', map: '地图', plans: '建筑数据', start: '启动', build: '建筑', land: '地形', world: '建筑与地形', plants: '植物', shaders: '着色器' },
    you: '你',
    districts: { nile: '尼罗河', greece: '希腊', rome: '罗马', byzantium: '拜占庭', levant: '黎凡特', francia: '法兰西', tang: '唐', heian: '平安日本', india: '印度' },
  },
};

let lang = 'en';
const listeners = [];

export function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('mp.lang'); } catch { /* storage unavailable */ }
  const q = new URLSearchParams(location.search).get('lang');
  lang = q || saved || 'en';
  if (!STRINGS[lang]) lang = 'en';
  apply();
}

export function setLang(l) {
  if (!STRINGS[l]) return;
  lang = l;
  try { localStorage.setItem('mp.lang', l); } catch { /* ignore */ }
  apply();
  for (const f of listeners) f(lang);
}

export const getLang = () => lang;
export const onLang = (f) => listeners.push(f);
export const t = (k) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;
/** Pick the current language from a {en, zh} object. */
export const tr = (o) => (o && (o[lang] ?? o.en)) || '';

function apply() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('title');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-label]')) el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  for (const el of document.querySelectorAll('[data-i18n-title]')) el.setAttribute('title', t(el.dataset.i18nTitle));
  for (const b of document.querySelectorAll('.lang-switch button')) b.classList.toggle('on', b.dataset.lang === lang);
}
