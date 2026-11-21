// Angkor by night (docs/settlements/angkor.md §32): the light of its lamps, hearths and kiln, readable at the low preset. Made of geometry in the
// engine's one material `halo` (palette.js, materials.js 'halo': light ADDED over what is behind it, at night only, no light, no shadow, no collision), its
// brightness carried by the vertex normals' y. The same construction as Suzhou's and Thebes' (their files are not imported). Elements of the khmer style:
//   ak_lampstand: a stone lamp-stand with a bronze bowl of oil and a flame (a prop with a collider; its glow is in an ak_halo);
//   ak_halo { house, far } the glow of one house: the oil lamp by the sleeping mats, the embers of the hearth, the lit doorway and the lit shutters, the spill on
//     the deck (a share of the houses by the hash of their own place; every house keeps the embers); far: the glow ball of the lit room only;
//   ak_halo { items } glows given as data: [{ k: 'ball' | 'floor' | 'quad', ... }].
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, lathe } from '../../core/geom.js';
import { frame, houseUp } from '../../styles/khmer/village.js';
import { houses, shops, ponds, LIBRARIES, CX, T, CAUSEWAY, BASINS } from './layout.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone (no counters, no Math.random). */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the village's houses with a lamp lit at night: the rest sleep (the oil of coconut or palm is dear). [inferred] */
export const LIT_SHARE = 0.5;
export const houseLit = (h) => hashAt((h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2, 7) < LIT_SHARE;

/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A pool of light lying on a floor (or the ground) at height y, radius r, brightness k. */
  floor(x, y, z, r, k = 1, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (the light of a room seen through a door or a shutter), facing n = [x, z]; both faces are seen. */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

// ── a house ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** The glow of one house into H (see the head of the file). */
function houseGlow(H, h, far) {
  const { W, hF, hS } = frame(h.rect, h.front), up = houseUp(h), lit = houseLit(h), P = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  if (far) { if (lit) { const [x, y, z] = P(0, 0, up + 1.2); H.ball(x, y, z, 2.2, 0.5); } return; }
  // the embers of the hearth tray (by the back-right corner), a low red glow
  { const [x, y, z] = P(hS - 0.7, -hF + 0.7, up + 0.2); H.floor(x, up + 0.03, z, 0.9, 0.35); H.ball(x, y, z, 0.35, 0.3); }
  if (!lit) return;
  // the oil lamp by the sleeping mats: its glow, the pool on the planks
  { const [x, y, z] = P(hS * 0.3, -hF * 0.15, up + 0.55); H.ball(x, y, z, 0.9); H.floor(x, up + 0.03, z, 2.0, 0.85, 10); }
  // the doorway lit from within (the door is an opening: the sheet stands in it, facing out), and the spill on the deck
  const nF = [W(0, 1)[0] - W(0, 0)[0], W(0, 1)[1] - W(0, 0)[1]], d = 0.75;
  { const a = P(-d, hF - 0.12, up + 0.05), b = P(d, hF - 0.12, up + 0.05), c = P(d, hF - 0.12, up + 1.85), e = P(-d, hF - 0.12, up + 1.85); H.quad(a, b, c, e, nF, 0.4); }
  // the light falling through the floor boards and out of the door onto the yard in front of the stair
  { const [x, , z] = P(0, hF + 2.6, 0); H.floor(x, 0.07, z, 4.2, 0.55, 10); const [x2, , z2] = P(0, 0, 0); H.floor(x2, 0.07, z2, 3.2, 0.4, 10); }
  if (h.kind !== 'small') { const [x, , z] = P(0, hF + 0.5, 0); H.floor(x, up + 0.04, z, 1.5, 0.6); }
  // the shuttered window of each long side wall, propped open: the lamp seen through it
  if (hF > 2.6) for (const s of [-1, 1]) {
    const w0 = -hF * 0.3 * (s < 0 ? -1 : 1), u = s * hS, sill = up + 0.95, head = up + 1.65, nS = [W(1, 0)[0] - W(0, 0)[0], W(1, 0)[1] - W(0, 0)[1]], n = [nS[0] * s, nS[1] * s];
    H.quad(P(u + s * 0.05, w0 - 0.45, sill), P(u + s * 0.05, w0 + 0.45, sill), P(u + s * 0.05, w0 + 0.45, head), P(u + s * 0.05, w0 - 0.45, head), n, 0.45);
  }
}
function haloEl(el, { bag }) {
  const H = new Halo();
  if (el.house) houseGlow(H, el.house, el.far);
  for (const it of el.items ?? []) {
    if (it.k === 'ball') H.ball(it.x, it.y, it.z, it.r, it.f);
    else if (it.k === 'floor') H.floor(it.x, it.y, it.z, it.r, it.f ?? 1, it.segs ?? 8);
    else if (it.k === 'quad') H.quad(it.a, it.b, it.c, it.d, it.n, it.f);
  }
  H.flush(bag);
}

// ── the stone lamp-stand ──────────────────────────────────────────────────────────────────────────────────────────
/** ak_lampstand: { at, y } a sandstone pedestal 1.1 m high carrying a bronze bowl of oil with a flame; the temple's lamps (Khmer inscriptions list lamp, candle and oil among the gifts to temples [stated]). */
function lampstand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('sandstone_khmer', lathe([[0.3, 0], [0.3, 0.12], [0.2, 0.2], [0.14, 0.3], [0.12, 0.9], [0.2, 1.0], [0.001, 1.02]], 10, null, x, y, z));
  bag.add(el.stone ? 'sandstone_khmer' : 'bronze', lathe([[0.001, 1.02], [0.12, 1.02], [0.18, 1.08], [0.19, 1.14], [0.001, 1.1]], 10, null, x, y, z));
  if (!el.stone) bag.add('flame', lathe([[0.001, 1.1], [0.02, 1.17], [0.001, 1.3]], 4, null, x, y, z));
  col.circle(x, z, 0.32, y, y + 1.3);
}
Object.assign(STYLES.khmer.elements, { ak_lampstand: lampstand, ak_halo: haloEl });

// ── where the temple's and the village's lights are ───────────────────────────────────────────────────────────────
/** The lamp-stands: either side of the outer causeway before the gate, and flanking the image in the central sanctuary. */
export function stands() {
  const out = [];
  for (const x of [-186, -172, -158, -144]) for (const s of [-1, 1]) out.push({ at: [x, s * 2.3], y: 1.0 });
  const fy = T.bakan.y + 0.7;
  for (const s of [-1, 1]) out.push({ at: [CX - 2.0, s * 2.1], y: fy });
  return out;
}
/** The glows of the temple, as data, by zone: `causeway` (the stands and the first offering table, all in one cell before the gate: what the arrival sees), `court` (the offering tables of the inner causeway and the terrace, the libraries' fire pits and lamp stands), `sanctuary` (the stands by the image). */
export function templeItems(zone) {
  const items = [], lamp = (x, y, z, fy, r = 2.4, k = 0.85, br = 0.9, bf = 0.62) => { items.push({ k: 'ball', x, y, z, r: br, f: bf }, { k: 'floor', x, y: fy + 0.03, z, r, f: k, segs: 10 }); };
  const fy = T.bakan.y + 0.7;
  if (zone === 'causeway') {
    for (const s of stands().filter((q) => q.at[0] < 0 && q.y === 1.0)) lamp(s.at[0], s.y + 1.3, s.at[1], s.y, 3.6, 0.75, 1.3, 0.6);
    for (const s of [-1, 1]) lamp(-136, 0.9, s * 7.4, 0, 1.8, 0.7, 0.9, 0.6);
  } else if (zone === 'sanctuary') {
    for (const s of stands().filter((q) => q.y === fy)) lamp(s.at[0], s.y + 1.3, s.at[1], s.y);
  } else {
    // the offering tables (yards.js): at (x, ±7.4)
    for (const s of [-1, 1]) for (const x of [-118, -100, -88]) {
      const at = [x, s * 7.4];
      if (LIBRARIES.some((b) => at[0] > b[0] - 3 && at[0] < b[2] + 3 && at[1] > b[1] - 3 && at[1] < b[3] + 3) || BASINS.some((b) => at[0] > b[0] - 2 && at[0] < b[2] + 2 && at[1] > b[1] - 2 && at[1] < b[3] + 2)) continue;
      lamp(at[0], 0.9, at[1], 0, 1.3, 0.7);
    }
    for (const s of [-1, 1]) lamp(CX - 96.8, T.base.y + 0.9, s * 7.5, T.base.y, 1.3, 0.7);
    // the libraries: the fire pit at the middle, the lamp stands at the door-end corners of the chest wall
    for (const r of LIBRARIES) {
      const lx = (r[0] + r[2]) / 2, lz = (r[1] + r[3]) / 2, ly = 1.4 + 0.6, side = lz < 0 ? 1 : -1;
      items.push({ k: 'ball', x: lx, y: ly + 0.7, z: lz, r: 1.1, f: 0.62 }, { k: 'floor', x: lx, y: ly + 0.03, z: lz, r: 3.4, f: 0.9, segs: 12 });
      for (const d of [-4.6, 4.6]) lamp(lx + d, ly + 1.3, lz + side * 2.55, ly, 2.0, 0.8);
    }
  }
  return items;
}
/** The forges' and the kilns' glow: a smith's hearth, a potter's kiln fired through the night. [inferred] */
export function workItems() {
  const items = [];
  for (const s of shops()) {
    const { W, hF, hS } = frame(s.rect, s.front);
    if (s.trade === 'smith') { const [x, z] = W(-hS * 0.3, -hF + 0.9); items.push({ k: 'ball', x, y: 1.5, z, r: 1.0, f: 0.7 }, { k: 'floor', x, y: 0.58, z, r: 2.4, f: 0.9, segs: 10 }); }
    else if (s.trade === 'potter') { const [x, z] = W(0, -hF - 2.4 + 1.5); items.push({ k: 'ball', x, y: 0.5, z, r: 0.9, f: 0.7 }, { k: 'floor', x, y: 0.03, z, r: 2.6, f: 0.9, segs: 10 }); }
  }
  return items;
}
void houses; void ponds; void CAUSEWAY; void box;
