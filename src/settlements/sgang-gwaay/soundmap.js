// Where SG̱ang Gwaay's sounds are (docs/settlements/sgang-gwaay.md §11c): the surf on the pebbles along the whole beach, the adze on the canoe log, bark
// beaten and fish split in the street, hides scraped and cedar wedged at the houses' sides, the fires of the street, children on the beach, ravens about
// the poles and eagles high over, a sea lion off the rocks, the drip of the forest behind, a box drum and wordless singing from the great house in the
// evening, and in each house one can enter the hearth and the work of its families. Pure data and functions of layout.js and yards.js (no three.js),
// read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-sgang.js).
// Coordinates: metres, +x east (the sea), +z south. No bell, no horse, no cart. What the scheduler asks of a map but this place has not (canals, ponds,
// bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-sgang.js';
import { RADIUS, G, LANDMARK, houses, village, shoreX, arc, toWorld } from './layout.js';
import { yards } from './yards.js';

export const HOME = [43, 5];                                   // the arrival (src/planet/arrivals.js)

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
const PIT = G - 1.2, HEAD = 5.6;

/** The work heard in each kind of house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the work of the winter house, dossier §5a]. */
const FIRE = ['sgaFire', [8, 20], [0, 24]];
const WORK = {
  hall: [FIRE, ['sgaDrum', [150, 300], [17, 23]], ['sgaSong', [170, 320], [17.5, 23]]],
  weave: [FIRE, ['sgaWeave', [14, 34], [7, 18]]],
  cook: [FIRE, ['sgaSteam', [25, 60], [6, 20]]],
  hide: [FIRE, ['sgaScrape', [25, 60], [7, 17]]],
  bark: [FIRE, ['sgaBark', [20, 50], [7, 17]]],
};
const KIND = ['weave', 'cook', 'hide', 'bark'];
let SITES = null;
/** The houses with sounds: { use, rect, at, id: 'house:N', work, y (the pit's floor) }. The rect is the inside of the walls (the ledge round the pit), the box shrunk for the yaw. */
export function sites() {
  if (SITES) return SITES;
  SITES = houses().map((h) => {
    const hw = h.w / 2 - 0.4, hd = h.d / 2 - 0.4, cs = Math.abs(Math.cos(h.yaw)), sn = Math.abs(Math.sin(h.yaw));
    const kx = (hw * cs + hd * sn) - Math.min(hw, hd) * 0.2 * sn * cs * 2, kz = (hw * sn + hd * cs) - Math.min(hw, hd) * 0.2 * sn * cs * 2;
    const use = h.landmark ? 'hall' : KIND[h.i % KIND.length];
    return { use, rect: [h.c[0] - kx, h.c[1] - kz, h.c[0] + kx, h.c[1] + kz], at: [h.c[0], h.c[1]], id: 'house:' + h.i, work: WORK[use], y: PIT };
  });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + HEAD);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What the inside of a plank house sounds like: `tone` its hush (a lowpass in Hz and a level: thick cedar planks and a big dark room), `roof` the rain's loudness from inside (cedar planks over a big hollow: loud), `hush` how much of the outdoors comes through (a doorway 1.6 m wide, no door), `work`. */
const R0 = { tone: [360, 0.3], roof: 0.85, hush: 0.5 };
export const ROOMS_SOUND = {
  hall: { ...R0, tone: [420, 0.35], work: [['sgaFire', 10]] },
  weave: { ...R0, work: [['sgaWeave', 16]] },
  cook: { ...R0, work: [['sgaSteam', 30]] },
  hide: { ...R0, work: [['sgaScrape', 30]] },
  bark: { ...R0, work: [['sgaBark', 25]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { tone: [300, 0.1], roof: 0.8, hush: 0.6, work: [] };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the rain forest behind the row is all green; the beach little. */
export function greenNear(x, z) { return 0.2 + 0.7 * sm(shoreX(z) - 38, shoreX(z) - 70, x); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the cedars and spruce of the forest edge behind the houses. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && shoreX(pz) - px > 36 && px > -120) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the street between the houses and the water most, the forest little. */
export function townNear(x, z) {
  const d = arc(z) - x, along = 1 - sm(150, 185, Math.abs(z));
  if (d > -8 && d < 32) return along * (d < 20 ? 1 : 0.6) + 0.05;
  return Math.max(0.05, 0.5 * along * (1 - sm(32, 90, d)));
}
// what this place has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
let EM = null;
const spread = (a, n) => a.filter((_, i) => i % Math.max(1, Math.ceil(a.length / n)) === 0).slice(0, n);
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
export function emitters() {
  if (EM) return EM;
  const V = village(), Y = yards(), H = houses();
  EM = [];
  // the surf along the whole beach, in reaches of 36 m
  for (let z = -150; z <= 150; z += 30) EM.push(E('sgaSurf', [shoreX(z) + 2.5, z], 28, [7, 12], [0, 24], { rainMax: 1 }));
  // the log being hollowed (the adze), at the north end
  EM.push(E('sgaAdze', V.hollow.c, 16, [10, 24], [7, 17], { dry: true }));
  // the fish split at the racks, the wedges driven, the bark beaten, the hides scraped, the children's play, the open fires, a paddle on a canoe
  const kind = (k) => Y.props.filter((p) => p.kind === k);
  spread(V.racks, 6).forEach((r) => EM.push(E('sgaKnife', [r.c[0], r.c[1] - 0.9], 11, [24, 55], [6, 18], { dry: true })));
  spread(kind('chopblock'), 5).forEach((p) => EM.push(E('sgaSplit', p.c, 14, [30, 70], [7, 17], { dry: true })));
  spread(kind('bark'), 5).forEach((p) => EM.push(E('sgaBark', p.c, 12, [28, 60], [7, 17], { dry: true })));
  spread(kind('hideframe'), 5).forEach((p) => EM.push(E('sgaScrape', p.c, 12, [30, 70], [7, 17], { dry: true })));
  spread(kind('toy'), 3).forEach((p) => EM.push(E('sgaPlay', p.c, 22, [30, 80], [8, 19], { dry: true })));
  spread(kind('fire'), 10).forEach((p) => EM.push(E('sgaFire', p.c, 10, [6, 14], [0, 24], { rainMax: 0.5 })));
  spread(V.canoes.filter((c) => !c.moored), 4).forEach((c) => EM.push(E('sgaPaddle', [c.c[0] + 1.5, c.c[1]], 18, [30, 80], [6, 19], { rainMax: 0.5 })));
  // the evening at the great house, heard from the street through its doorway: the box drum and singing (a gathering, not a ceremony we show)
  const lm = H[LANDMARK], door = toWorld(lm, 0, -lm.d / 2 - 1);
  EM.push(E('sgaDrum', door, 45, [110, 250], [17, 23], { rainMax: 0.3, after: true }), E('sgaSong', door, 40, [130, 280], [17.5, 23], { rainMax: 0.3, after: true }));
  // the ravens about the poles, the eagles high over, a sea lion off the rocks of the north end
  [[40, -80], [38, 10], [40, 90]].forEach((p) => EM.push(E('sgaRaven', p, 55, [16, 50], [5, 21], { rainMax: 0.6 })));
  [[20, -40], [30, 100]].forEach((p) => EM.push(E('sgaEagle', p, 90, [40, 110], [6, 20], { rainMax: 0.5 })));
  EM.push(E('sgaSeal', [shoreX(-150) + 30, -150], 80, [50, 140], [4, 21], { rainMax: 0.8 }));
  // the forest: the drip off the boughs, loud after rain and in it; owls at night (a small owl of the islands) and the gulls come from the engine's birds
  [-100, -30, 40, 110].forEach((z) => EM.push(E('sgaDrip', [shoreX(z) - 52, z], 20, [3, 7], [0, 24], { rainMax: 1 })));
  EM.push(E('owl', [shoreX(-40) - 60, -40], 60, [50, 120], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [shoreX(80) - 60, 80], 60, [70, 150], [21, 4], { rainMax: 0.4 }));
  return EM;
}
export const EMITTERS = emitters();
