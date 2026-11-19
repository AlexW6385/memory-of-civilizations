// Ming Suzhou by night: the lanterns of the garden and the streets (docs/settlements/ming-suzhou.md §19).
// Every lantern shade is the glow material lamp_white or lamp_paper: lit from within from dusk by its own
// emissive shade, present and unlit by day; the engine makes a light of the nearest few. Nothing here is a
// plan light. Two parts:
//   `garden_lanterns` (an element of the garden's plan, style suzhou-site): the small lanterns hung from
//     the tie beams of the covered walks and of the covered bridge, from the open sides of the pavilions,
//     and the palace lanterns (gongdeng) under the eaves of the great halls and of the residence's gate;
//   `suzhou_lamp` (an element of the street life, instanced): the lantern on its pole at the head of each
//     bridge, and the tall drum lantern hung over the door of an inn, a tea house or a wine shop.
// Pieces of the garden are merged per material into one geometry (the materials are those that already
// hold the plan's fine pieces: lamp_white, lacquer_red, lacquer_black), each lantern's variation coming
// from a hash of its own position.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { assembly, placer } from '../../objects/kit.js';
import { Parts } from '../../styles/qing/carving.js';
import { LEVEL, GALLERIES, BUILDINGS, BRIDGES, lots } from './layout.js';
import { Halo, lanternLight, waterStreak } from './nightlight.js';

const G = LEVEL.garden;
/** A number in [0, 1) from a position alone (no counters, no Math.random). */
function hash(x, z) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ── the lanterns, built at their hook (the origin), hanging down ─────────────────────────────────────────
/** A small round lantern of paper on a bamboo frame, a black cap and foot, a red cord and tassel; 0.62 m from hook to tassel. */
function drum(P, k = 1, tall = false) {
  const r = tall ? 0.8 : 1, h = tall ? 1.18 : 1;
  P.add('lacquer_red', rod([0, 0, 0], [0, -0.1 * k, 0], 0.006 * k, 3));
  P.add('lacquer_black', lathe([[0.001, -0.1 * k], [0.08 * k, -0.1 * k], [0.095 * k, -0.13 * k], [0.001, -0.13 * k]], 8));
  P.add('lamp_white', lathe([[0.095 * k * r, -0.13 * k], [0.16 * k * r, -0.18 * k], [0.18 * k * r, -0.3 * k * h], [0.16 * k * r, -0.42 * k * h], [0.095 * k * r, -0.47 * k * h]], 8));
  P.add('lacquer_black', lathe([[0.001, -0.47 * k * h], [0.095 * k * r, -0.47 * k * h], [0.085 * k * r, -0.5 * k * h], [0.001, -0.5 * k * h]], 8));
  P.add('lacquer_red', rod([0, -0.5 * k * h, 0], [0, -0.62 * k * h, 0], 0.011 * k, 4));
}
/** A palace lantern (gongdeng): a six-sided body of silk in a red-lacquered frame, a tasselled foot; 1.0 m from hook to tassel at k = 1. */
function palace(P, k = 1) {
  P.add('lacquer_red', rod([0, 0, 0], [0, -0.14 * k, 0], 0.007 * k, 3));
  P.add('lacquer_red', lathe([[0.001, -0.14 * k], [0.05 * k, -0.15 * k], [0.19 * k, -0.22 * k], [0.225 * k, -0.21 * k], [0.225 * k, -0.235 * k], [0.19 * k, -0.245 * k], [0.001, -0.245 * k]], 6));
  P.add('lamp_white', lathe([[0.17 * k, -0.245 * k], [0.19 * k, -0.31 * k], [0.19 * k, -0.78 * k], [0.17 * k, -0.84 * k]], 6));
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = Math.cos(a) * 0.196 * k, z = Math.sin(a) * 0.196 * k; P.add('lacquer_red', rod([x, -0.245 * k, z], [x, -0.84 * k, z], 0.008 * k, 3)); }
  P.add('lacquer_red', lathe([[0.001, -0.87 * k], [0.185 * k, -0.87 * k], [0.185 * k, -0.84 * k], [0.001, -0.84 * k]], 6));
  P.add('lacquer_red', rod([0, -0.87 * k, 0], [0, -1.02 * k, 0], 0.014 * k, 4));
}

// ── what hangs where in the garden ─────────────────────────────────────────────────────────────────────────
/** The lanterns of the garden and the residence: [{ x, y (the hook), z, kind ('drum' | 'palace'), k, fy (the floor under it), wall ({ n: [x, z] outward, d } if a wall stands behind it) }]. */
export function gardenLanterns() {
  const out = [];
  const add = (x, y, z, kind, k = 1, fy = y - 2.4, wall = null) => out.push({ x, y, z, kind, k, fy, wall });
  // the covered walks: a small lantern at every second tie beam (the beams stand every ~3 m; none at a turn)
  const walks = GALLERIES.map((pts) => ({ pts, y: G + 0.3, H: 2.8 }));
  const [x0, z0, x1, z1] = BUILDINGS.xiaofeihong.rect;
  walks.push({ pts: [[x0, (z0 + z1) / 2], [x1, (z0 + z1) / 2]], y: G + BUILDINGS.xiaofeihong.y + 0.01, H: 2.7 });
  for (const { pts, y, H } of walks) for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 3));
    for (let k = 1; k < n; k++) {
      if ((k + i) % 2) continue;
      const s = k * L / n, x = a[0] + (b[0] - a[0]) / L * s, z = a[1] + (b[1] - a[1]) / L * s;
      add(x, y + H - 0.42, z, 'drum', 0.9 + 0.2 * hash(x, z), y);
    }
  }
  // the pavilions: one at the middle of each open side, just inside the beam
  for (const id of ['hefeng', 'xuexiang', 'daishuang', 'lvyi']) {
    const b = BUILDINGS[id], [cx, cz] = b.c, hex = b.kind === 'hex', H = 3.3, y = G + b.y;
    let poly, open;
    if (hex) { poly = Array.from({ length: 6 }, (_, k) => { const a = (k + 0.5) / 6 * Math.PI * 2; return [cx + Math.cos(a) * b.r, cz + Math.sin(a) * b.r]; }); open = [1, 4]; }
    else { const w = b.w / 2, d = (b.d ?? b.w) / 2; poly = [[cx - w, cz - d], [cx + w, cz - d], [cx + w, cz + d], [cx - w, cz + d]]; open = [0, 2]; }
    for (const k of open) {
      const p = poly[k], q = poly[(k + 1) % poly.length], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, dx = cx - mx, dz = cz - mz, l = Math.hypot(dx, dz);
      add(mx + dx / l * 0.3, y + H - 0.55, mz + dz / l * 0.3, 'drum', 1, y);
    }
  }
  // Little Canglang over the water: a pair on its pond front
  { const [rx0, rz0, rx1] = BUILDINGS.xiaocanglang.rect, y = G + BUILDINGS.xiaocanglang.y; for (const x of [rx0 + 2.5, rx1 - 2.5]) add(x, y + 3.4 - 0.3, rz0 - 0.45, 'palace', 0.85, y, { n: [0, -1], d: 0.4 }); }
  // the great halls: a pair of palace lanterns under the eaves of the front, hung from the middle bay's beam
  { const [rx0, rz0, rx1] = BUILDINGS.yuanxiang.rect, y = G + BUILDINGS.yuanxiang.y, cx = (rx0 + rx1) / 2; for (const s of [-1, 1]) add(cx + s * 5.4, y + 5.0 - 0.25, rz0 - 0.5, 'palace', 1.15, y, { n: [0, -1], d: 0.42 }); }
  { const [rx0, rz0, rx1] = BUILDINGS.yiyu.rect, y = G + BUILDINGS.yiyu.y, cx = (rx0 + rx1) / 2; for (const s of [-1, 1]) add(cx + s * 2.0, y + 3.8 - 0.25, rz0 - 0.5, 'palace', 1.0, y, { n: [0, -1], d: 0.42 }); }
  // the residence: the gate hall's street front (the household's lanterns, larger), the courts' fronts of the sedan hall, the main hall and the women's building
  for (const s of [-1, 1]) add(s * 2.6, G + 0.45 + 4.0 - 0.2, 61.15, 'palace', 1.3, G + 0.45, { n: [0, 1], d: 0.35 });
  for (const [zf, H, kk] of [[50.8, 4.2, 1.05], [40.2, 5.0, 1.15], [28.0, 6.6, 1.15]]) for (const s of [-1, 1]) add(s * 3.4, G + 0.45 + H - 0.25, zf + 0.5, 'palace', kk, G + 0.45, { n: [0, 1], d: 0.42 });
  return out;
}

/** garden_lanterns: { list: [{ x, y, z, kind, k }] } — each lantern merged per material into the plan's one piece. */
function gardenLanternsEl(el, { bag }) {
  const all = new Parts(), H = new Halo();
  for (const l of el.list) {
    const P = new Parts(), tall = l.kind !== 'palace' && hash(l.x + 3, l.z) < 0.35;
    if (l.kind === 'palace') palace(P, l.k); else drum(P, l.k, tall);
    P.emit(all, l.x, l.y, l.z, hash(l.z, l.x) * 6.28);
    // its light (nightlight.js): the glow round it, the pool on the floor under it, the wash on the wall behind, its reflection in the pond
    const body = l.kind === 'palace' ? 0.55 * l.k : (tall ? 0.32 : 0.28) * l.k, size = l.kind === 'palace' ? 1.15 * l.k : 0.8 * l.k;
    lanternLight(H, l.x, l.z, l.y - body, l.fy, size, l.wall, l.kind === 'palace' ? 3.0 : 2.3);
    waterStreak(H, l.x, l.z, l.fy, l.kind === 'palace' ? 1.1 : 0.8, l.kind === 'palace' ? 13 : 6);
  }
  all.emit(bag, 0, 0, 0);
  H.flush(bag);
}

// ── the street: the lamp on its pole at a bridge head, the tall lantern over an inn's door ─────────────
const U = {}, DEF = {};
function unit(name, defaults, build) { DEF[name] = defaults; U[name] = assembly(`suzhou-lamp|${name}`, build); }
// the lamp pole: a timber post 2.7 m, a bracket arm out along +z, the lantern hanging from its end
unit('pole', { w: 'timber', b: 'lacquer_black', l: 'lamp_white', r: 'lacquer_red' }, (a) => {
  a('w', box(-0.05, 0, -0.05, 0.05, 2.75, 0.05));
  a('w', box(-0.035, 2.6, -0.035, 0.035, 2.68, 0.68));
  a('w', rod([0, 2.15, 0], [0, 2.62, 0.4], 0.02, 4));
  a('b', lathe([[0.001, 2.78], [0.08, 2.74], [0.07, 2.7], [0.001, 2.7]], 6));
  a('b', lathe([[0.001, 2.6], [0.07, 2.6], [0.085, 2.56], [0.001, 2.56]], 8, null, 0, 0, 0.62));
  a('l', lathe([[0.085, 2.56], [0.15, 2.5], [0.17, 2.38], [0.15, 2.26], [0.085, 2.2]], 8, null, 0, 0, 0.62));
  a('b', lathe([[0.001, 2.2], [0.085, 2.2], [0.075, 2.17], [0.001, 2.17]], 8, null, 0, 0, 0.62));
  a('r', rod([0, 2.17, 0.62], [0, 2.07, 0.62], 0.01, 4));
});
// the tall drum lantern over a door: a cord, red caps, a long paper body, a tassel; its hook at the origin
unit('inn', { b: 'lacquer_red', l: 'lamp_paper', k: 'lacquer_black' }, (a) => {
  a('k', rod([0, 0, 0], [0, -0.25, 0], 0.008, 3));
  a('b', lathe([[0.001, -0.25], [0.15, -0.25], [0.17, -0.29], [0.001, -0.29]], 10));
  a('l', lathe([[0.16, -0.29], [0.2, -0.36], [0.21, -0.55], [0.21, -0.8], [0.2, -1.0], [0.16, -1.07]], 10));
  for (const y of [-0.5, -0.88]) a('k', lathe([[0.2, y], [0.215, y], [0.215, y - 0.04], [0.2, y - 0.04]], 10));
  a('b', lathe([[0.001, -1.07], [0.16, -1.07], [0.14, -1.11], [0.001, -1.11]], 10));
  a('b', rod([0, -1.11, 0], [0, -1.32, 0], 0.016, 4));
});
/** suzhou_lamp: { at, y, rot (+z out), kind ('pole' | 'inn') }. */
function suzhouLamp(el, { bag, col }) {
  const put = placer(el, bag);
  for (const [role, g] of Object.entries(U[el.kind])) put(DEF[el.kind][role], g.clone());
  if (el.kind === 'pole') col?.circle(el.at[0], el.at[1], 0.1, el.y ?? 0, (el.y ?? 0) + 2.8);
}

/** The bridge-head lamps and the inn lanterns' places for the town (town.js): lists of suzhou_lamp elements. */
export function bridgeLamps(inDisc) {
  const out = [], rects = lots().map((l) => l.rect);
  const free = ([x, z]) => !rects.some(([a, b, c, d]) => x > a - 0.4 && x < c + 0.4 && z > b - 0.4 && z < d + 0.4);
  for (const b of BRIDGES) {
    const half = b.span / 2 + 4.6, W = b.width / 2, alongZ = b.across === 'z';
    for (const s of [-1, 1]) for (const o of [-1, 1]) {
      // beside the end post of the parapet, a little beyond the bridge's end, the arm reaching over the way
      const p = alongZ ? [b.at[0] + o * (W + 0.1), b.at[1] + s * (half + 0.45)] : [b.at[0] + s * (half + 0.45), b.at[1] + o * (W + 0.1)];
      if (!inDisc(p, 25) || !free(p)) continue;
      if ((s + o) % 2 === 0 && hash(p[0], p[1]) < 0.35) continue;      // a few of the four are left out (by the position's own hash)
      const n = alongZ ? [-o, 0] : [0, -o];
      out.push({ t: 'suzhou_lamp', kind: 'pole', at: p, y: LEVEL.street + 0.04, rot: Math.atan2(n[0], n[1]) });
    }
  }
  return out;
}

registerLamps();
function registerLamps() {
  if (STYLES['suzhou-site']) STYLES['suzhou-site'].elements.garden_lanterns = gardenLanternsEl;
  if (STYLES.life) STYLES.life.elements.suzhou_lamp = suzhouLamp;
}
export { registerLamps };
