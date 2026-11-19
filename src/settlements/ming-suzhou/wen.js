// Ming Suzhou — the scenes of Wen Zhengming's record and album that the garden did not yet hold
// (docs/settlements/ming-suzhou.md §25): where each stands, the paths between them, the stands of
// planting round them, and what must be kept clear of them. Pure data and functions (no three.js):
// used by ground.js (planting), plan.js (the shore stones and the revetment stop at them) and
// wenscenes.js (the builders). Coordinates as layout.js: metres, +x east, +z south.

import { GARDEN, inRect } from './layout.js';

/**
 * The thirty-one scenes. `have`: 'old' (built or planted before this round, under `as`), 'new'
 * (built in wenscenes.js), 'stand' (planting only, here in the stands below).
 */
export const SCENES = [
  { n: 1, zh: '若墅堂', en: 'Ruoshu Hall', have: 'old', as: 'yuanxiang' },
  { n: 2, zh: '夢隱樓', en: 'Mengyin Tower', have: 'old', as: 'jianshan' },
  { n: 3, zh: '繁香塢', en: 'Fanxiang Wu, the bank of many fragrances', have: 'new', id: 'fanxiang' },
  { n: 4, zh: '倚玉軒', en: 'Yiyu Xuan, Leaning on Jade', have: 'old', as: 'yiyu' },
  { n: 5, zh: '小飛虹', en: 'Little Flying Rainbow', have: 'old', as: 'xiaofeihong' },
  { n: 6, zh: '芙蓉隈', en: 'Furong Wei, the hibiscus bend', have: 'stand', id: 'furong' },
  { n: 7, zh: '小滄浪', en: 'Little Canglang', have: 'old', as: 'xiaocanglang' },
  { n: 8, zh: '志清處', en: 'Zhiqing Chu, the place of pure intent', have: 'new', id: 'zhiqing' },
  { n: 9, zh: '柳隩', en: 'Liu Ao, the willow nook', have: 'new', id: 'liuao' },
  { n: 10, zh: '意遠臺', en: 'Yiyuan Tai, the terrace of far thoughts', have: 'new', id: 'yiyuan' },
  { n: 11, zh: '釣䃮', en: 'Diao Ji, the fishing rock', have: 'new', id: 'diaoji' },
  { n: 12, zh: '水華池', en: 'Shuihua Chi, the water-blossom pool', have: 'old', as: 'lotus' },
  { n: 13, zh: '凈深亭', en: 'Jingshen Ting, the clear-deep pavilion', have: 'new', id: 'jingshen' },
  { n: 14, zh: '待霜亭', en: 'Daishuang Ting, Waiting for Frost', have: 'old', as: 'daishuang' },
  { n: 15, zh: '聽松風處', en: 'Ting Songfeng Chu, where the wind is heard in the pines', have: 'new', id: 'tingsong' },
  { n: 16, zh: '怡顏處', en: 'Yiyan Chu, the place of a pleased countenance', have: 'new', id: 'yiyan' },
  { n: 17, zh: '來禽囿', en: 'Laiqin You, the crab-apple orchard', have: 'old', as: 'orchard' },
  { n: 18, zh: '玫瑰柴', en: 'Meigui Chai, the rose hedge of brushwood', have: 'new', id: 'meigui' },
  { n: 19, zh: '薔薇徑', en: 'Qiangwei Jing, the rose path', have: 'new', id: 'qiangwei' },
  { n: 20, zh: '桃花沜', en: 'Taohua Pan, the peach-blossom bank', have: 'stand', id: 'taohua' },
  { n: 21, zh: '湘筠塢', en: 'Xiangyun Wu, the bamboo hollow', have: 'old', as: 'hollow' },
  { n: 22, zh: '槐幄', en: 'Huai Wo, the locust canopy', have: 'stand', id: 'huaiwo' },
  { n: 23, zh: '槐雨亭', en: 'Huaiyu Ting, the Locust Rain Pavilion', have: 'new', id: 'huaiyu' },
  { n: 24, zh: '爾耳軒', en: 'Er\'er Xuan, the study of "that is all"', have: 'new', id: 'erer' },
  { n: 25, zh: '芭蕉檻', en: 'Bajiao Jian, the banana rail', have: 'new', id: 'bajiao' },
  { n: 26, zh: '竹澗', en: 'Zhu Jian, the bamboo brook', have: 'new', id: 'zhujian' },
  { n: 27, zh: '瑤圃', en: 'Yao Pu, the jade plot', have: 'new', id: 'yaopu' },
  { n: 28, zh: '嘉實亭', en: 'Jiashi Ting, the pavilion of fine fruit', have: 'new', id: 'jiashi' },
  { n: 29, zh: '玉泉', en: 'Yu Quan, the Jade Spring', have: 'new', id: 'yuquan' },
  { n: 30, zh: '珍李坂', en: 'Zhenli Ban, the plum slope', have: 'stand', id: 'zhenli' },
  { n: 31, zh: '得真亭', en: 'Dezhen Ting, the pavilion of finding the true', have: 'new', id: 'dezhen' },
];

/** Where each new building or object stands: centre [x, z]; the size and the facing are in wenscenes.js. */
export const AT = {
  fanxiang: { rect: [-23, -4.6, -11.5, 6.0] },                    // the flower plot before the hall's south door
  zhiqing: { c: [-55.5, -1.6] },                                    // the seat-stone on the bank west of Little Canglang's water
  liuao: { c: [-45.5, -71.4] },                                     // a bench under the willows on the north shore of the bay
  yiyuan: { rect: [-36, -65, -30, -59.5] },                         // the terrace on the bay's east bank
  diaoji: { c: [-38.9, -61.0] },                                    // the rock at the terrace's foot
  jingshen: { c: [-6, -66.6], w: 3.0 },
  tingsong: { c: [11, -70.8] },
  yiyan: { c: [24, -67.6] },
  meigui: { a: [47.5, -14.0], b: [63.5, -14.0], gap: [59.4, 61.6] },
  qiangwei: { arches: [[39.7, -15.3], [41.7, -19.3], [43.9, -23.0], [46.2, -26.6]] },
  huaiyu: { c: [-62.2, -12.2], w: 2.9 },
  erer: { rect: [-63.4, -2.6, -60.0, 3.4] },
  bajiao: { rect: [-59.6, -15.2, -56.0, -9.4] },
  zhujian: { x: 36, z0: -75, z1: -60.2, bridge: [36, -62.7] },
  yaopu: { rect: [52.5, -4.5, 64.5, 3.5] },
  jiashi: { c: [57, -9.6], w: 3.0 },
  yuquan: { c: [62.6, 9.0] },
  dezhen: { c: [20.5, -11.5], r: 1.75 },
};

/** The paths of the Ming garden's remaining parts: [x, z] polylines, each joined to an earlier path, a gate or a bridge. */
export const WALKS = {
  east: [[11.2, 12.2], [20, 11.2], [34, 10.8], [48, 10.8], [59, 10.4]],                                        // from the gallery's moon gate east, south of the loquat court, to the spring
  spine: [[59, 10.4], [60.2, 7.5], [59.6, 3.0], [59.4, -2], [58.6, -5.6], [60.6, -7.4], [62, -11], [60.4, -14.0], [57, -19], [52.5, -24.5], [49.5, -28.5], [48, -30]],   // spring, plot, pavilion, orchard, to the old path to Wutong
  rose: [[39, -13.6], [40.4, -17.4], [42.7, -21.4], [45, -25], [47, -28.4], [48, -30]],                         // from the loquat court's north gate
  west: [[-55, -40.6], [-59.4, -39.8], [-60.2, -34.6], [-58.4, -29.4], [-56, -24.5], [-54.8, -19.5], [-55, -14.2]],      // round the stern of the stone boat, down the bank to the covered bridge
  bank: [[-55, -14.2], [-55.3, -9.5], [-56.2, -4.6], [-56.8, -0.2], [-56.6, 3.6]],                              // on south to the seat-stone and the bamboo
  canglang: [[-52.5, 10.6], [-56.2, 7.8], [-57, 3.6]],                                                         // from the old path to Little Canglang
  north: [[45, -57], [41, -60.6], [34, -63.4], [24, -64.4], [14, -64.4], [4, -64], [-6, -63.6], [-16, -63.4], [-26, -63], [-29.3, -62.3]],  // along the north bank from the east island's landing
  bay: [[-27.2, -63.2], [-29, -67], [-37, -70.2], [-44, -71.4], [-50, -72.4]],                                   // round the terrace, to the willow bench and the tower
  toJingshen: [[-6, -63.6], [-6, -65.2]],
  toTingsong: [[11, -64.3], [11, -69.2]],
  toYiyan: [[24, -64.4], [24, -66.2]],
  toDezhen: [[16, -2.1], [19, -6.5], [20.5, -9.6]],                                                              // up from the old path to the loquat court
};

// ── what must stay clear of the scenes (planting, shore stones, the revetment) ────────────────────────
const RECTS = [   // [x0, z0, x1, z1]: platforms and plots with their margins
  [-23.8, -5.4, -11.0, 6.8],              // fanxiang
  [-36.8, -65.8, -29.0, -58.7],           // the terrace and its steps
  [-8.6, -69.2, -3.4, -64.0],             // jingshen
  [21.6, -70.4, 26.4, -64.8],             // yiyan
  [-64.6, -14.6, -59.6, -9.8],            // huaiyu
  [-64.4, -3.6, -58.9, 4.4],              // erer
  [-60.4, -16.0, -55.4, -8.6],            // bajiao
  [52.0, -5.0, 65.0, 4.0],                // yaopu
  [55.2, -11.8, 58.8, -7.4],              // jiashi
  [18.6, -13.4, 22.4, -9.6],              // dezhen
  [58.8, 7.2, 66.2, 11.8],                // yuquan
  [9.0, -73.0, 13.4, -69.0],              // tingsong seat
];
const CIRCLES = [   // [x, z, r]
  [-55.5, -1.6, 2.2], [-38.9, -61.0, 2.4], [-45.5, -71.4, 1.6],
];
const SEGS = [      // [ax, az, bx, bz, half width]: the fences, the rill, the paths' lines are in WALKS
  [47.5, -14.0, 63.5, -14.0, 0.9],
  [36, -75, 36, -60.2, 1.3],
];

function segDist(x, z, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / l2));
  return Math.hypot(x - ax - vx * t, z - az - vz * t);
}
const ALL_WALKS = Object.values(WALKS);
/** Is (x, z) on or within m of one of the new paths? */
export function nearWalks(x, z, m) {
  for (const p of ALL_WALKS) for (let i = 0; i + 1 < p.length; i++) if (segDist(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]) < m) return true;
  return false;
}
/** Is (x, z) within m of any of the scenes' buildings, plots, rocks, fences or the new paths? */
export function nearScene(x, z, m = 0) {
  if (!inRect(GARDEN, x, z)) return false;
  for (const r of RECTS) if (inRect(r, x, z, m)) return true;
  for (const [cx, cz, r] of CIRCLES) if (Math.hypot(x - cx, z - cz) < r + m) return true;
  for (const [ax, az, bx, bz, w] of SEGS) if (segDist(x, z, ax, az, bx, bz) < w + m) return true;
  for (const a of AT.qiangwei.arches) if (Math.hypot(x - a[0], z - a[1]) < 1.2 + m) return true;
  return nearWalks(x, z, 0.8 + m);
}

// ── the stands of planting ─────────────────────────────────────────────────────────────────────────
/**
 * The stands: { id, rect, plants (the planting density the ground returns, per 100 m²) }. The
 * flora scatter places only the species of world/flora-rules.js (MAX_DENSITY): willow, bamboo, apple (the
 * flowering fruit trees: crab-apple, plum, peach), oleander (for the hibiscus), pagoda tree (the
 * locust), Chinese pine, red pine, persimmon.
 */
export const STANDS = [
  { id: 'orchard', rect: [46, -34, 64, -14] },
  { id: 'hollow', rect: [-68, -34, -59, -25] },
  { id: 'taohua', rect: [-66, -56, -53, -43], plants: { apple: 1.6 } },
  { id: 'zhenli', rect: [22, -17, 34.5, -7.5], plants: { apple: 2.0 } },
  { id: 'furong', rect: [-58, -33, -52.5, -25], plants: { oleander: 3.5 } },
  { id: 'huaiwo', rect: [-64.4, -24.6, -56, -14.8], plants: { pagoda_tree: 3.0 } },
  { id: 'zhiqing-bamboo', rect: [-63, 8.2, -45, 12.6], plants: { bamboo: 5 } },
  { id: 'liuao-n', rect: [-57, -77, -39, -70], plants: { willow: 9 } },
  { id: 'liuao-s', rect: [-53, -56.4, -40.5, -52.6], plants: { willow: 8 } },
  { id: 'tingsong', rect: [3, -79, 20, -68], plants: { chinese_pine: 1.6 } },
  { id: 'zhujian', rect: [29, -79, 43, -60.6], plants: { bamboo: 5.5 } },
];
export const stand = (id) => STANDS.find((s) => s.id === id);
