// Ming–Qing Beijing by night (docs/settlements/qing-beijing.md §39): what was lit there at the date, and the light it throws.
// Registered by one import from index.js: the street's lantern fronts and the courtyard houses' windows are wrapped in the
// halo kit (nightlight.js); the palace's own lanterns, braziers and the guards' lamps are an element of the landmark plan
// (bj_night_palace) so that the night's glow shades and halos add two meshes to it and no more; the lanes' gate lamps and the
// street shrines' oil lamps are elements of the street life.
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { Parts } from '../../styles/qing/carving.js';
import { HALLS, TIERS, WALL, TEMPLE, DANBI, houses, WALK_UP } from './layout.js';
import { GATE } from './houses.js';
import './townstyle.js';
import './style.js';
import { Halo, hashAt, lanternLight, litWindows, lampLights } from './nightlight.js';

// ── the lantern of the palace (gongdeng): a six-sided body of red silk in a lacquered frame with gilt caps and a tassel ──
/** Built hanging from its hook at the origin, 1.0 m from hook to tassel at k = 1. */
function palaceLantern(P, k = 1) {
  P.add('lacquer_red', rod([0, 0, 0], [0, -0.14 * k, 0], 0.007 * k, 3));
  P.add('gilt_bronze', lathe([[0.001, -0.14 * k], [0.05 * k, -0.15 * k], [0.19 * k, -0.22 * k], [0.225 * k, -0.21 * k], [0.225 * k, -0.235 * k], [0.19 * k, -0.245 * k], [0.001, -0.245 * k]], 6));
  P.add('lamp_paper', lathe([[0.17 * k, -0.245 * k], [0.19 * k, -0.31 * k], [0.19 * k, -0.78 * k], [0.17 * k, -0.84 * k]], 6));
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = Math.cos(a) * 0.196 * k, z = Math.sin(a) * 0.196 * k; P.add('lacquer_red', rod([x, -0.245 * k, z], [x, -0.84 * k, z], 0.008 * k, 3)); }
  P.add('gilt_bronze', lathe([[0.001, -0.87 * k], [0.185 * k, -0.87 * k], [0.185 * k, -0.84 * k], [0.001, -0.84 * k]], 6));
  P.add('cloth_red', rod([0, -0.87 * k, 0], [0, -1.02 * k, 0], 0.014 * k, 4));
}
/** A lantern on an arm from a wall (origin at the wall's foot, the arm reaching along +z): 2.7 m up, the paper body hanging 0.42 m out. */
function armLantern(P, k = 1) {
  P.add('timber', box(-0.025, 2.62, -0.2, 0.025, 2.68, 0.42));
  P.add('timber', rod([0, 2.0, -0.2], [0, 2.62, 0.2], 0.018, 4));
  P.add('lacquer_black', lathe([[0.001, 2.6], [0.06 * k, 2.6], [0.07 * k, 2.57], [0.001, 2.57]], 8, null, 0, 0, 0.42));
  P.add('lamp_paper', lathe([[0.07 * k, 2.57], [0.13 * k, 2.52], [0.15 * k, 2.42], [0.13 * k, 2.3], [0.07 * k, 2.25]], 8, null, 0, 0, 0.42));
  P.add('lacquer_black', lathe([[0.07 * k, 2.25], [0.06 * k, 2.22], [0.001, 2.22]], 8, null, 0, 0, 0.42));
}
/** A watch lamp: a post with a bracket carrying a small paper lantern, for the guards' posts. Origin at the foot. */
function watchLamp(P) {
  P.add('timber', box(-0.045, 0, -0.045, 0.045, 2.3, 0.045));
  P.add('timber', box(-0.03, 2.2, -0.03, 0.03, 2.27, 0.42));
  P.add('lacquer_black', lathe([[0.001, 2.18], [0.07, 2.18], [0.085, 2.15], [0.001, 2.15]], 8, null, 0, 0, 0.4));
  P.add('lamp_paper', lathe([[0.085, 2.15], [0.15, 2.09], [0.17, 1.97], [0.15, 1.85], [0.085, 1.79]], 8, null, 0, 0, 0.4));
  P.add('lacquer_black', lathe([[0.085, 1.79], [0.075, 1.76], [0.001, 1.76]], 8, null, 0, 0, 0.4));
}

// ── what hangs where in the palace ────────────────────────────────────────────────────────────────────────
/**
 * The lit things of the palace: lanterns { x, y (the hook), z, k, face: [nx, nz] (out of the wall), fy (the floor under it) } under the eaves of the
 * three halls' fronts and of the gates (the real ones hung the great red palace lanterns in rows under the gate towers' eaves for the
 * ceremonies of the night and the dawn [inferred]); watch lamps { x, z, y, rot } at the guards' posts; embers { x, y, z } in the
 * censers of the terrace and the great gates' braziers.
 */
export function palaceNight() {
  const lanterns = [], posts = [], embers = [];
  const bays = (rect, nb, idx, zOut, face, y, hook, k, fy) => {
    const [x0, , x1] = rect, bw = (x1 - x0) / nb;
    for (const i of idx) lanterns.push({ x: x0 + bw * (i + 0.5), y: y + hook, z: zOut, k, face, fy });
  };
  // the three great halls' fronts (south), the bays either side of the open middle one
  bays(HALLS.taihe.rect, 11, [1, 3, 7, 9], HALLS.taihe.rect[3] + 0.55, [0, 1], HALLS.taihe.y, 6.6, 1.9, HALLS.taihe.y + 0.04);
  bays(HALLS.baohe.rect, 9, [1, 3, 5, 7], HALLS.baohe.rect[3] + 0.55, [0, 1], HALLS.baohe.y, 5.4, 1.5, HALLS.baohe.y + 0.04);
  bays(HALLS.zhonghe.rect, 5, [1, 3], HALLS.zhonghe.rect[3] + 0.55, [0, 1], HALLS.zhonghe.y, 4.6, 1.4, HALLS.zhonghe.y + 0.04);
  // the Gate of Supreme Harmony: both faces
  { const t = HALLS.taihemen; for (const [z, f] of [[t.rect[3] + 0.55, [0, 1]], [t.rect[1] - 0.55, [0, -1]]]) bays(t.rect, 9, [1, 3, 5, 7], z, f, t.y, 5.0, 1.6, t.y + 0.04); }
  // the Meridian Gate: the hall on its deck (floor 12.6), south front and court face
  bays([-30, 167.2, 30, 176.8], 9, [1, 3, 5, 7], 176.8 + 0.55, [0, 1], 12.6, 5.2, 1.7, 12.64);
  bays([-30, 167.2, 30, 176.8], 9, [1, 3, 5, 7], 167.2 - 0.55, [0, -1], 12.6, 5.2, 1.7, 12.64);
  // the Gate of Heavenly Purity: the hall on its platform (floor 1.6), both faces
  bays([-17, -175, 17, -166], 5, [1, 3], -166 + 0.55, [0, 1], 1.6, 4.4, 1.3, 1.64);
  bays([-17, -175, 17, -166], 5, [1, 3], -175 - 0.55, [0, -1], 1.6, 4.4, 1.3, 1.64);
  // the side gates' gatehouses on the walls: a pair over each passage, on the court's face
  for (const x of [-74, 74]) for (const dx of [-3.2, 3.2]) lanterns.push({ x: x + dx, y: 6.5 + 3.0, z: 117.5 + 0.5, k: 1.0, face: [0, 1], fy: 6.54 });
  // the guards' posts at the courts' gates and before the Meridian Gate's passage: the watch lamp on its post beside each pair of sentries
  // (the arm of the post reaches along its rot: π into the court from the Meridian Gate's and the Gate of Supreme Harmony's north faces, 0 toward the south from the Gate of Heavenly Purity)
  for (const [x, z, rot] of [[-13, 163.8, Math.PI], [13, 163.8, Math.PI], [-22, 163.8, Math.PI], [22, 163.8, Math.PI], [-20, 103.5, Math.PI], [20, 103.5, Math.PI], [-16, -158, 0], [16, -158, 0]]) posts.push({ x, z, y: 0.03, rot });
  // the terrace's four bronze burners before the Hall of Supreme Harmony (smoke.js: x ±22, ±9 at z 17) keep their embers at night
  for (const x of [-22, 22, -9, 9]) embers.push({ x, y: TIERS[2].y + 1.9, z: 17 });
  void WALL;
  return { lanterns, posts, embers };
}

/** bj_night_palace: { list: palaceNight() } — the lanterns and watch lamps, their glow shades and halos, in the landmark plan. */
function bjNightPalace(el, { bag }) {
  const all = new Parts(), H = new Halo(), { lanterns, posts, embers } = el.list;
  for (const l of lanterns) {
    const P = new Parts(), k = l.k * (0.94 + 0.12 * hashAt(l.x, l.z, 3));
    palaceLantern(P, k);
    P.emit(all, l.x, l.y, l.z, 0);
    const cy = l.y - 0.55 * k, s = 0.9 * l.k;
    H.ball(l.x, cy, l.z, 0.95 * s * 1.15);
    H.floor(l.x + l.face[0] * 0.5, l.fy + 0.03, l.z + l.face[1] * 1.3, 3.0 * s, 3.4 * s);
    H.wall(l.x - l.face[0] * 0.5, cy, l.z - l.face[1] * 0.5, l.face, 1.9 * s, 1.5 * s);
  }
  for (const p of posts) {
    const P = new Parts(); watchLamp(P);
    // the arm points along +z in its frame: out to the court's side the post faces
    P.emit(all, p.x, p.y, p.z, p.rot);
    const c = Math.cos(p.rot), s = Math.sin(p.rot), lx = p.x + s * 0.4, lz = p.z + c * 0.4;
    lanternLight(H, lx, lz, p.y + 1.97, p.y, 0.9, null, 2.6);
  }
  for (const e of embers) { H.ball(e.x, e.y, e.z, 0.7); H.floor(e.x, e.y - 1.3, e.z, 1.6); }
  all.emit(bag, 0, 0, 0);
  H.flush(bag);
}

// ── the Temple of Heaven's court: lanterns at its four gates, embers in the censers of the Danbi way ────────────────────
/** The temple court's lit things: { lamps: [{ x, z, rot, k }] arm lanterns on the walls' court faces, lanterns: palace lanterns on the south gate hall, embers }. */
export function templeNight() {
  const [cx, cz] = TEMPLE.c, w = TEMPLE.wall, lamps = [], lanterns = [], embers = [];
  for (const sd of [-1, 1]) {
    lamps.push({ x: cx + sd * 4.4, z: cz - w + 0.5, rot: 0 }, { x: cx + w - 0.5, z: cz + sd * 4.4, rot: -Math.PI / 2 }, { x: cx - w + 0.5, z: cz + sd * 4.4, rot: Math.PI / 2 });
    lanterns.push({ x: cx + sd * 5.2, y: 1.2 + 4.3, z: cz + w - 4 - 0.55, k: 1.2, face: [0, -1], fy: 1.24 });
  }
  const dxm = (DANBI.rect[0] + DANBI.rect[2]) / 2;
  for (const sx of [-1, 1]) { embers.push({ x: dxm + sx * 5, y: 0.03 + 2.0, z: DANBI.rect[3] + 11 }); embers.push({ x: dxm + sx * 9, y: DANBI.y + 2.0, z: DANBI.rect[1] + 10 }); }
  return { lamps, lanterns, embers };
}
/** bj_night_temple: { list: templeNight() }. */
function bjNightTemple(el, { bag }) {
  const all = new Parts(), H = new Halo(), { lamps, lanterns, embers } = el.list;
  for (const l of lamps) {
    const P = new Parts(); armLantern(P); P.emit(all, l.x, 0.03, l.z, l.rot);
    const s = Math.sin(l.rot), c = Math.cos(l.rot);
    lanternLight(H, l.x + s * 0.42, l.z + c * 0.42, 2.41 + 0.03, 0.03, 0.85, { n: [s, c], d: 0.62 }, 2.4);
  }
  for (const l of lanterns) {
    const P = new Parts(), k = l.k; palaceLantern(P, k); P.emit(all, l.x, l.y, l.z, 0);
    const cy = l.y - 0.55 * k, s = 0.9 * l.k;
    H.ball(l.x, cy, l.z, 0.95 * s * 1.15); H.floor(l.x + l.face[0] * 0.5, l.fy + 0.03, l.z + l.face[1] * 1.3, 3.0 * s, 3.4 * s);
  }
  for (const e of embers) { H.ball(e.x, e.y, e.z, 0.7); H.floor(e.x, e.y - 1.9, e.z, 1.6); }
  all.emit(bag, 0, 0, 0);
  H.flush(bag);
}

// ── the lanes: a lantern at the gates of the courtyard houses, by rank ─────────────────────────────────────
/** bj_night street elements: { kind: 'gatelamp', at: [x, z] (of the gate, on the lane face), seed, side: -1 | 1 (the side of the door, +1 east) }. */
function bjNight(el, { bag }) {
  const H = new Halo();
  if (el.kind === 'gatelamp') {
    const [x, z] = el.at, P = new Parts();
    armLantern(P);                                              // an arm from the wall over the lane, the paper lantern hanging from it
    P.emit(bag, x, 0.03, z, 0);
    lanternLight(H, x, z + 0.42, 2.41, 0.03, 0.85, { n: [0, 1], d: 0.62 }, 2.4);
  }
  H.flush(bag);
}

/**
 * The oil lamp of a street shrine: the base builder, then a small lamp (a clay dish of oil with a lit wick) on the red cloth of the sill
 * before the niche (the shrine faces +z: its niche panel stands at 0.76–0.805 m, the sill at 0.3–0.34 m), its glow on the niche and the stone.
 */
function shrineWithLamp(base) {
  return (el, ctx) => {
    base(el, ctx);
    const P = new Parts(), H = new Halo(), [x, z] = el.at;
    P.add('pottery_dark', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.04, 0.04], [0.001, 0.04]], 8));
    P.add('lamp_white', lathe([[0.001, 0.045], [0.012, 0.05], [0.006, 0.085], [0.001, 0.1]], 5));
    P.emit(ctx.bag, x, 0.03 + 0.34, z + 0.85, 0);
    H.ball(x, 0.03 + 0.5, z + 0.9, 0.5);
    H.floor(x, 0.08, z + 1.3, 1.5, 1.3);
    H.wall(x, 0.03 + 0.62, z + 0.83, [0, 1], 0.7, 0.55);
    H.flush(ctx.bag);
  };
}

// ── registration ────────────────────────────────────────────────────────────────────────────────────────────
/** Wrap a style's element in the lit windows: STYLES[style].elements[name] */
function wrapWindows(style, name, share, ok = () => true) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__night) return;
  const base = S.elements[name];
  const f = (el, ctx) => { if (!ok(el)) return base(el, ctx); const L = litWindows(ctx, el.litShare ?? share); base(el, L.ctx); L.finish(); };
  f.__night = true;
  S.elements[name] = f;
}
/** Wrap a style's element so that the glow shades it makes throw their light on the floor `floorOf(el)`. */
function wrapLamps(style, name, floorOf, opt = {}, extra = null) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__night) return;
  const base = S.elements[name];
  const f = (el, ctx) => { const L = lampLights(ctx, floorOf(el), opt); base(el, L.ctx); if (extra) extra(el, L.halo); L.finish(); };
  f.__night = true;
  S.elements[name] = f;
}

export function registerNight() {
  // the courtyard houses' windows: a share of the rooms lit (the near houses; the far ones are dark masses)
  wrapWindows('beijing-site', 'hutong_house', 0.36, (el) => (el.lod ?? 0) <= 2);
  // the shop street's fronts: the lanterns under the eave and the lamp-light of the open front across the apron
  wrapLamps('beijing-site', 'qing_shop', () => WALK_UP + 0.04, { pool: 2.0 }, (el, H) => {
    const out = el.side === 'w' ? 1 : -1, L = el.z1 - el.z0, cz = (el.z0 + el.z1) / 2;
    if (hashAt(el.front, cz, 5) < 0.85) H.floor(el.front + out * 1.3, WALK_UP + 0.08, cz, 2.2, Math.min(2.9, L / 2 + 0.4), Math.PI / 2);
  });
  // the interiors: the lanterns of the rooms (their real point lights are the engine's; these show at the low preset)
  const floorY = (el) => (el.y ?? 0.3) + 0.04;
  for (const n of ['bj_teahouse', 'bj_pharmacy', 'bj_shop_cloth', 'bj_shop_grain', 'bj_shop_pawn', 'bj_shop_wine', 'bj_shop_lantern', 'bj_shop_shoes', 'bj_palace_room']) wrapLamps('life', n, floorY, { pool: 1.5, scale: 0.9 });
  const S = STYLES.life;
  if (S) {
    S.elements.bj_night = bjNight;
    S.elements.bj_shrine = shrineWithLamp(S.elements.bj_shrine);
  }
  if (STYLES.qing) { STYLES.qing.elements.bj_night_palace = bjNightPalace; STYLES.qing.elements.bj_night_temple = bjNightTemple; }
}
registerNight();

/** The gate lamps of the near courtyard houses (rank gates; the poorer lots keep a dark gate): street elements for life.js's lane tiles. */
export function gateLamps() {
  const out = [];
  for (const h of houses()) {
    if ((h.lod ?? 0) > 1 || h.gate === 'wall') continue;
    const G = GATE[h.gate], x1 = h.rect[2], z1 = h.rect[3], gxC = x1 - 0.25 - G.gw / 2 - 0.15;
    const both = h.gate === 'guangliang' || h.gate === 'jinzhu';
    if (!both && hashAt(x1, z1, 7) < 0.5) continue;
    for (const sd of both ? [-1, 1] : [1]) out.push({ t: 'bj_night', kind: 'gatelamp', at: [gxC + sd * (G.gw / 2 + 0.55), z1 - 0.2], seed: h.seed });
  }
  return out;
}
void TEMPLE; void DANBI; void GATE;
