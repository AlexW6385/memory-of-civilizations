// Where Mughal Agra's sounds are (docs/settlements/mughal-agra.md §17.3): the places of the emitters and the geometry the audio engine
// needs (soundscape.js's `LIFE.map`, the interface of Suzhou's and Rome's maps): the garden's fountains, the naubat on the east and west
// walls, the reciters in the tomb, the bazaar's trades, the katras, the river with its boats, washermen and jackals, the rooms.
// Pure data and functions of layout.js and cells.js. Coordinates: metres, +x east, +z south. [inferred throughout; what is [stated] is in the dossier.]

import { RADIUS, RIVER_Z, GARDEN, PLINTH, GATE, FORECOURT, KATRAS, HAVELI_OPEN, WORKSHOP, LODGES, STREETS, houses, inRect } from './layout.js';
import { rows, cells } from './cells.js';
import '../../engine/voices-agra.js';

export const HOME = [0, -62];                                // the arrival, in the garden
export const FAR = {};
export const WELLS = [];                                      // the wells' bucket is a Chinese windlass: not placed
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const RIVER_LANE = RIVER_Z - 24;
const TOMB = [-11, -214, 11, -192];
const PAV = [[-160, -14, -148, 14, 'west pavilion'], [148, -14, 160, 14, 'east pavilion']];
const MOSQUES = [[-138, -232, -115, -174, 'mosque'], [115, -232, 138, -174, 'jawab']];

// ── the places of work ───────────────────────────────────────────────────────
let SITES = null;
export function sites() {
  if (SITES) return SITES;
  const k = (id) => KATRAS.find((q) => q.id === id).rect;
  SITES = [
    { use: 'tomb', rect: TOMB, at: mid(TOMB), id: 'tomb', work: [['agraRecite', [22, 45], [0, 24]]] },       // reciters sat day and night in the mausoleum [stated]
    { use: 'workshop', rect: WORKSHOP.rect, at: mid(WORKSHOP.rect), id: 'inlay', work: [['agraInlay', [8, 18], [7, 17]]] },
    { use: 'dalan', rect: HAVELI_OPEN, at: mid(HAVELI_OPEN), id: 'haveli', work: [['agraGrind', [12, 26], [5.5, 9.5]], ['agraTawa', [16, 34], [6, 21]]] },
    { use: 'sarai', rect: k('omar-khan'), at: mid(k('omar-khan')), id: 'katra:omar-khan', work: [['agraHammer', [8, 18], [8, 17.5]], ['agraBargain', [12, 26], [7, 18]]] },
    { use: 'sarai', rect: k('fulel'), at: mid(k('fulel')), id: 'katra:fulel', work: [['agraBargain', [12, 26], [7, 18]], ['agraHookah', [20, 40], [11, 23]]] },
    { use: 'sarai', rect: k('resham'), at: mid(k('resham')), id: 'katra:resham', work: [['agraBargain', [12, 26], [7, 18]], ['agraHookah', [20, 40], [11, 23]]] },
    { use: 'sarai', rect: k('jogidas'), at: mid(k('jogidas')), id: 'katra:jogidas', work: [['agraCamel', [30, 70], [5.5, 20]], ['agraBargain', [14, 30], [7, 18]]] },
  ];
  return SITES;
}

// ── the river ──────────────────────────────────────────────────────────────────
/** The nearest point of the Yamuna's edge (the foot of the terrace's bank): { p, d, i }. */
export function canalSpot(x, z) {
  const px = Math.max(-RADIUS + 20, Math.min(RADIUS - 20, x)), p = [px, RIVER_Z - 6];
  return { p, d: Math.hypot(px - x, p[1] - z), i: 0 };
}
export const canalTrack = () => null;                          // Suzhou's oared boat is not the Yamuna's: see TRACKS
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
/** A point on the river's water within `reach` of (x, z), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (Math.abs(z - RIVER_LANE) > reach + 20) return null;
  const px = x + (rnd() - 0.5) * 2 * reach, pz = RIVER_Z - 10 - rnd() * 14;
  return Math.hypot(px - x, pz - z) < reach + 20 && Math.abs(px) < RADIUS - 30 ? [px, pz] : null;
}
const riverBoat = (x, z, rnd, reach = 130, lead = 60) => {
  if (Math.abs(z - RIVER_LANE) > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(-RADIUS + 40, Math.min(RADIUS - 40, x - dir * lead * (0.5 + 0.6 * rnd()))), b = Math.max(-RADIUS + 40, Math.min(RADIUS - 40, x + dir * lead * (0.8 + 0.8 * rnd())));
  return Math.abs(b - a) < 20 ? null : { pts: [[a, RIVER_LANE + 4 * (rnd() - 0.5)], [b, RIVER_LANE + 4 * (rnd() - 0.5)]] };
};

// ── the streets ──────────────────────────────────────────────────────────────────
/** A walker's track along the nearest street within `reach`, passing the nearest point; `bazaar` limits it to the shop streets. */
function streetPath(x, z, rnd, reach, lead, bazaar) {
  let best = null;
  STREETS.forEach((s, i) => {
    if (bazaar && !s.bazaar) return;
    const r = s.rect, px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z);
    if (d < reach && (!best || d < best.d)) best = { d, i };
  });
  if (!best) return null;
  const r = STREETS[best.i].rect, horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = Math.min((horiz ? r[2] : r[3]) - 2, RADIUS - 30), near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 3;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
/** The engine asks for Suzhou's sedan chair (90, 40), vendor (80, 30) and watchman (90, 34) here: Agra has none of them (its own are TRACKS). */
export const streetTrack = () => null;
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  { key: 'agraBoat', voice: 'agraBoat', speed: 1.0, r50: 18, gap: [40, 90], ok: (h, r) => h >= 5.5 && h < 19.5 && r < 0.6, get: (x, z, rnd) => riverBoat(x, z, rnd) },
  { key: 'agraVend', voice: 'agraHawker', speed: 1.0, r50: 11, gap: [24, 55], ok: day(6.5, 20), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30, true) },
  { key: 'agraWater', voice: 'agraBhishti', speed: 0.9, r50: 11, gap: [90, 200], ok: (h, r) => ((h >= 6 && h < 10) || (h >= 15 && h < 18)) && r < 0.3, get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30, true) },
  { key: 'agraCamel', voice: 'agraCamel', speed: 0.9, r50: 15, gap: [110, 220], ok: day(6, 19), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 45, false) },
  { key: 'agraCart', voice: 'agraCart', speed: 1.1, r50: 15, gap: [90, 200], ok: day(6, 18), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 45, false) },
  { key: 'agraWatch', voice: 'agraChowkidar', speed: 0.9, r50: 14, gap: [40, 80], ok: (h, r) => (h >= 20 || h < 4.5) && r < 0.5, get: (x, z, rnd) => streetPath(x, z, rnd, 90, 34, false) },
];

// ── the planting ──────────────────────────────────────────────────────────────────
/** No tree spots: the engine's seasonal birds (cuckoo, oriole, magpie, tit) are not Agra's; the parakeets and peacocks are EMITTERS. */
export const treeSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
const inGarden = (x, z) => inRect(GARDEN, x, z);
export function leafNear(x, z) {
  const g = inGarden(x, z) ? 1 : 1 - sm(0, 30, Math.hypot(Math.max(GARDEN[0] - x, 0, x - GARDEN[2]), Math.max(GARDEN[1] - z, 0, z - GARDEN[3])));
  return Math.min(1, Math.max(0.12, 0.8 * g, 0.5 * sm(RADIUS - 90, RADIUS - 40, Math.hypot(x, z))));
}
export function greenNear(x, z) { return Math.max(0.08, 0.7 * leafNear(x, z)); }
/** 0..1: how much of the town's hubbub reaches (x, z): the bazaar town and the forecourt, little in the garden. */
export function townNear(x, z) {
  if (inGarden(x, z)) return 0.12;
  return Math.max(0.1, (z > 150 ? 1 : 0.4 * sm(-260, 150, z)) * (1 - 0.6 * sm(RADIUS - 90, RADIUS - 30, Math.hypot(x, z))));
}
export function frogGround(x, z) { return 0.5 * (1 - sm(0, 45, Math.abs(z - (RIVER_Z - 6)))); }

// ── the rooms (the engine asks only when the listener is indoors) ─────────────────────────────
const cellRects = () => rows().flatMap((r) => cells(r).map((c, i) => ({ id: `cell:${r.id}:${i}`, rect: [c.xc - 1.4, Math.min(c.zc, c.zb), c.xc + 1.4, Math.max(c.zc, c.zb)] })));
let CELLS = null;
/** The room the listener is in: { use, at, upper, same } or null. */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  for (const s of sites()) if (inRect(s.rect, x, z) && s.use !== 'sarai') return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [a, b, c, d, id] of PAV) if (inRect([a, b, c, d], x, z)) return { use: 'pavilion', at: mid([a, b, c, d]), upper: false, same: id };
  for (const [a, b, c, d, id] of MOSQUES) if (inRect([a, b, c, d], x, z)) return { use: 'hall', at: mid([a, b, c, d]), upper: false, same: id };
  if (Math.abs(x - GATE.c[0]) < GATE.w / 2 && Math.abs(z - GATE.c[1]) < GATE.d / 2) return { use: 'gate', at: GATE.c, upper, same: 'gate' };
  for (const l of LODGES) if (inRect(l.rect, x, z)) return { use: 'lodge', at: mid(l.rect), upper: false, same: 'lodge:' + l.seed };
  if (z > 185 && z < 215) for (const c of (CELLS ||= cellRects())) if (inRect(c.rect, x, z)) return { use: 'cell', at: mid(c.rect), upper: false, same: c.id };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: 'sarai', at: s.at, upper, same: s.id };
  for (const h of houses()) if (inRect(h.rect, x, z)) return { use: 'house', at: mid(h.rect), upper, same: 'h:' + h.rect[0] + ':' + h.rect[1] };
  return null;
}
export const ROOMS = {
  tomb: { tone: [150, 0.2], roof: 0.3, hush: 0.5, work: [['agraSteps', 70]] },
  hall: { tone: [200, 0.25], roof: 0.5, hush: 0.55, work: [['agraSteps', 55]] },
  pavilion: { tone: [320, 0.3], roof: 0.6, hush: 0.7, work: [['agraSteps', 70]] },
  gate: { tone: [300, 0.3], roof: 0.6, hush: 0.8, work: [['agraSteps', 40]] },
  lodge: { tone: [300, 0.3], roof: 1.0, hush: 0.75, work: [['broom', 70]] },
  workshop: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['agraInlay', 20]] },
  dalan: { tone: [380, 0.35], roof: 1.0, hush: 0.85, work: [['agraTawa', 40], ['agraGrind', 50]] },
  sarai: { tone: [500, 0.45], roof: 1.0, hush: 0.95, work: [['agraBargain', 20]] },
  cell: { tone: [450, 0.4], roof: 1.0, hush: 0.9, work: [['agraCoin', 40], ['agraHookah', 50]] },
  house: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
export const UPPER = { tone: [230, 0.15], roof: 1.3, hush: 0.6, work: [['broom', 60]] };

// ── the emitters in the open ───────────────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const FOUNT = [[0, 0], ...[40, 80, 120].flatMap((d) => [[0, d], [0, -d], [d, 0], [-d, 0]])];
export const EMITTERS = [
  // the garden: the tank's and the channels' fountains (water supplied "to the fountains", Wikipedia)
  ...FOUNT.map((p) => E('agraFountain', p, p[0] || p[1] ? 5 : 9, [3, 8], [6, 19])),
  // the naubat on the east and west walls' pavilions: the surna a ghari before sunrise, the drums an hour after, at midnight the drums and the karna
  ...PAV.map(([a, b, c, d], i) => E('agraSurna', mid([a, b, c, d]), 45, [80 + i * 20, 140], [5.7, 6.6], { dry: true })),
  ...PAV.map(([a, b, c, d], i) => E('agraNaqara', mid([a, b, c, d]), 45, [90 + i * 20, 150], [6.6, 7.6], { dry: true })),
  ...PAV.map(([a, b, c, d], i) => E(i ? 'agraKarna' : 'agraNaqara', mid([a, b, c, d]), 50, [120, 200], [23.6, 0.6], { dry: true })),
  // the garden's birds: peacocks at dawn and dusk, parakeets through the day
  ...[[-60, -60], [70, -90], [-100, -110], [100, -40]].map((p, i) => E('agraPeacock', p, 22, [30 + i * 8, 80], i % 2 ? [16.5, 19] : [5.5, 8.5], { dry: true })),
  ...[[-46, -46], [46, 46], [80, -80], [-80, 80], [114, -114], [-114, -40], [0, -150], [-30, 160]].map((p) => E('agraParakeet', p, 20, [25, 60], [7, 17.5], { dry: true })),
  // the garden's keepers watering the beds
  ...[[-80, -60], [80, -100], [-80, 60]].map((p) => E('pour', p, 8, [40, 90], [6, 9], { dry: true })),
  // the forecourt and the bazaar streets: bargaining, cries, an elephant where visitors dismounted
  E('agraBargain', [0, 205], 18, [10, 22], [7, 19], { dry: true }),
  ...[-150, -90, 90, 150].map((x) => E('agraBargain', [x, 200], 14, [12, 26], [7, 19], { dry: true })),
  ...[250, 300, 350].map((z) => E('agraBargain', [0, z], 14, [12, 26], [7, 19], { dry: true })),
  ...[-200, -100, 100, 200].map((x) => E('agraBargain', [x, 270], 14, [14, 28], [7, 19], { dry: true })),
  ...[[-60, 190], [60, 215], [0, 330], [-120, 270], [120, 270]].map((p) => E('agraHawker', p, 13, [30, 70], [6.5, 19], { dry: true })),
  ...[[-40, 214], [40, 214]].map((p, i) => E('agraElephant', p, 25, [120 + i * 40, 240], [8, 17], { dry: true })),
  // the river: washermen at the landings, jackals on the far bank by night
  E('agraDhobi', [200, RIVER_Z + 8], 10, [14, 34], [7, 16], { dry: true }),
  E('agraDhobi', [-176, RIVER_Z + 8], 10, [16, 36], [7, 16], { dry: true }),
  ...[[-150, RIVER_Z - 60], [110, RIVER_Z - 70], [-300, -100], [300, 20]].map((p, i) => E('agraJackal', p, 40, [60 + i * 10, 140], [19.5, 5], { dry: true })),
  // the watch at the great gate by night
  E('agraChowkidar', [0, GATE.c[1] + 20], 22, [90, 200], [20, 4.5], { dry: true }),
];
