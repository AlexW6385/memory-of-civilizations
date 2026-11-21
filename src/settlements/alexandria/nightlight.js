// Alexandria by night, the light of its fire, its lamps and its braziers (docs/settlements/alexandria.md §16.2).
// The great light of the night is the fire on the Pharos [stated: a fire at night]; under it the town is lit as a Hellenistic city was —
// clay oil lamps in the rooms and at the doors, braziers along the harbour front, torches at the gates, the lamps of the shrines, the
// fires at the ovens and the kilns, a lantern at a ship's stern. What the plans' lights and flames lack, where the real lights are off
// (the low preset), is the light they give to what is round them. It is made of geometry in the one material `halo` (palette.js,
// materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision; the shape of each
// piece is carried by its normals (a glow round the flame: three crossed discs; a pool on the floor; a wash on a wall; a sheet in a
// lit window or doorway; on water, the reflection broken into ripples). Every element of the ptolemaic style that puts a light into its
// plan gains its halo without touching the style files; the fires that have no light of their own are added from the element's own
// numbers (EXTRA). Everything is a function of the thing's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { rod, lathe } from '../../core/geom.js';
import { houseLayout, roofRoomOf, roofRoomRect } from '../../styles/ptolemaic/house.js';
import { frame } from '../../styles/greek/agora.js';
import { rng } from '../../styles/ptolemaic/dress.js';
import { SEA, PHAROS, wet } from './layout.js';

const TAU = Math.PI * 2;
const MAT = 'halo';
const g0 = 1.2;

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the shops that stay open into the evening, lit by the lamp on the counter (the rest are shuttered). */
export const SHOP_LIT = 0.6;

/** Triangles (position and a normal per corner) of the halo material; the construction of the reference's, written out here (its file is not imported). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (an ellipse) at c spanned by the unit axes U and V (semi-axes su, sv), in rings R of brightness F (carried in the vertex normals' y; a negative y marks water). */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, the water) at height y; water: the ripple-broken kind; k scales its brightness. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high. */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees, each a cone of light from its middle. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window's or doorway's lamp-lit room behind) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }) over the ground `g`. The Pharos' fire (intensity over 20) is the great light: a glow wide enough to be seen across the harbour. */
function lightHalo(H, l, g) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  if ((l.intensity ?? 0) > 20) { fireHalo(H, x, y, z); return; }
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  const fy = Math.min(g ?? y - 0.5, y - 0.2);
  if (y - fy < 3) H.floor(x, fy + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 0, 10);
}
/** The Pharos' fire: three glows of one centre, the wide one a soft haze round the lantern, the middle one the blaze, the small one its heart. */
function fireHalo(H, x, y, z) {
  H.ball(x, y, z, 15, 0.5); H.ball(x, y, z, 8, 0.62); H.ball(x, y, z, 3.6, 0.62); H.ball(x, y - 0.4, z, 1.6, 0.62);
}

let depth = 0;
const wrap = (type, fn) => function haloed(el, ctx) {
  const mine = /^alexandria/.test(ctx?.plan?.id ?? ''), lights = mine ? ctx.lights : null, n = lights ? lights.length : 0;
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  if (depth === 0 && mine && ctx.bag) {
    const H = new Halo();
    if (lights) for (const l of lights.slice(n)) lightHalo(H, l, el.y);
    if (EXTRA[type]) EXTRA[type](el, H);
    H.flush(ctx.bag);
  }
  return r;
};

// ── the fires the elements model without a light of their own ────────────────────────────────────────────────────────
/** A brazier or lamp's fire at (x, y, z): the glow ball of radius r and the pool on the ground gy. */
function fire(H, x, y, z, r, gy, pool = 2.6) { H.ball(x, y, z, r); if (gy !== null) H.floor(x, gy + 0.03, z, pool, pool, 0, 10); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

const EXTRA = {
  // the brazier on its stone pillar (front.js quayLamp): the bronze bowl 2.85 m up, the flame 3.15–3.8
  quay_lamp: (el, H) => { const [x, z] = el.at, y = el.y ?? 0; fire(H, x, y + 3.45, z, 1.7, y, 4.2); },
  // the lamp burning before the street shrine of Isis (quay.js shrine): on the altar's bowl in front of the aedicula
  shrine: (el, H) => { const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0; fire(H, x - 0.7 * Math.sin(rot), y + 0.85, z - 0.7 * Math.cos(rot), 0.9, y, 2.0); },
  // the lamp on its bracket at the customs post's front corner, and the clerk's lamp on the table
  customs_post: (el, H) => { const [x, z] = el.at, y = el.y ?? 0; fire(H, x + 2.4, y + 2.34, z - 1.7 - 0.3, 0.8, y, 2.4); fire(H, x - 0.3, y + 1.2, z, 0.6, y, 1.6); },
  // the lamp on a hawker's counter (street.js stall: its corner, 1.1 m along the front and 0.55 m out) and the lamp on the fountain-house's wall
  alx_stall: (el, H) => { const y = el.y ?? 0, al = [-el.out[1], el.out[0]], x = el.at[0] + al[0] * 1.1 + el.out[0] * 0.55, z = el.at[1] + al[1] * 1.1 + el.out[1] * 0.55; fire(H, x, y + 1.05, z, 0.8, y, 2.6); },
  alx_fountain: (el, H) => { const y = el.y ?? 0, al = [-el.out[1], el.out[0]], x = el.at[0] + al[0] * 1.8 + el.out[0] * 0.46, z = el.at[1] + al[1] * 1.8 + el.out[1] * 0.46; fire(H, x, y + 2.5, z, 0.9, y, 3.4); H.wall(el.at[0] + al[0] * 1.8 + el.out[0] * 0.08, y + 2.4, el.at[1] + al[1] * 1.8 + el.out[1] * 0.08, el.out, 1.4, 1.1, 8, 0.6); },
  // the torches in the harbour gate's passage (the towers' inner faces, on the quay's side)
  harbour_gate: (el, H) => { const [cx, cz] = el.c, y = el.y ?? 0, gw = el.gw ?? 12; for (const s of [-1, 1]) fire(H, cx + s * (gw / 2 - 0.5), y + 3.0, cz - 2.5, 1.1, y, 3.0); },
  // a stern lantern on the merchantmen and the galleys at their moorings (shipParts: the bow at −z, the stern at +z, yawed by rot)
  ship: (el, H) => {
    if (el.kind === 'lighter') return;
    const L = el.len ?? (el.kind === 'galley' ? 34 : 24), rot = el.rot ?? 0, S = L / 24, sx = Math.sin(rot) * L * 0.46, sz = Math.cos(rot) * L * 0.46;
    H.ball(el.at[0] + sx, (el.y ?? SEA) + 3.2 * S + 0.6, el.at[1] + sz, 0.8 + 0.2 * S);
    H.floor(el.at[0] + sx, (el.y ?? SEA) + 0.03, el.at[1] + sz, 3.2, 3.2, 0, 8, true, 0.7);          // its reflection on the harbour water
  },
  // the houses: the lamp in its bracket at the front door, the hearth and oven of the kitchen, and the shop's lit window (the shops that keep open into the evening)
  ptol_house: (el, H) => {
    if (el.simple) return;
    const K = houseLayout({ rect: el.rect, seed: el.seed, front: el.front ?? 's' }), F = K.F, y = el.y ?? 0, [ox, oz] = F.out, { du, dw, wA, df, sw, L, cv1, cv0, left } = K;
    { const [lx, lz] = F.P(du + dw + 0.5, -0.12), px = lx + ox * 0.4, pz = lz + oz * 0.4; H.ball(px, y + 2.64, pz, 0.62); H.wall(lx + ox * 0.03, y + 2.45, lz + oz * 0.03, [ox, oz], 1.5, 1.2, 8, 0.7); H.floor(px + ox * 0.7, y + 0.05, pz + oz * 0.7, 2.4, 2.4, 0, 10, false, 0.8); }
    { const sideX = left ? sw + 0.4 : L - sw - 0.4, ku0 = left ? 0.8 : sideX + 0.4, ku1 = left ? sideX - 0.2 : L - 0.8, [hx, hz] = F.P(left ? ku0 + 1.6 : ku1 - 1.6, df + 0.9), cy = y + 0.75;
      H.ball(hx, cy, hz, 0.9); H.floor(hx, y + 0.03, hz, 1.8, 1.8, 0, 8); }
    if (K.aShop && hashAt(el.rect[0], el.rect[1], 3) < SHOP_LIT) {
      const [ax, az] = F.P(0.95, 0.75), [bx, bz] = F.P(wA - 0.35, 0.75), u = (wA + 0.6) / 2;
      H.quad([ax, y + 1.0, az], [bx, y + 1.0, bz], [bx, y + 2.5, bz], [ax, y + 2.5, az], [ox, oz], 0.5);
      H.ball(...F.P(u - 0.3, 1.6).flatMap((v, i) => (i === 0 ? [v] : [y + 1.6, v])), 0.7);
      const [fx, fz] = F.P(u, -1.6); H.floor(fx, y + 0.05, fz, 2.6, 1.8, Math.atan2(ox, oz), 10, false, 0.7);
    }
    void cv0; void cv1; void dw;
  },
  // the houses of Rhakotis: the lit doorway of a ground room with its lamp, the lamp in the roof room, a row of small lamps on the sill of the front on a festival street (§16.2: Herodotus 2.62)
  egyptian_house: (el, H) => {
    if (el.simple) return;
    const r = rng(el.seed || 1), F = frame(el.rect, el.front ?? 's'), { L, D } = F, y = el.y ?? 0, [ox, oz] = F.out;
    const n = 2 + (r() < 0.4 ? 1 : 0), sh = 2.9, H0 = n * sh, hd = Math.min(D - 4.5, 8.6 + r() * 2); r(); const dw = 1.7, du = 1.2 + r() * (L - 5.2);
    if (hashAt(el.rect[0], el.rect[1], 5) < 0.55) {
      const [ax, az] = F.P(du + 0.05, 0.2), [bx, bz] = F.P(du + dw - 0.05, 0.2);
      H.quad([ax, y + 0.1, az], [bx, y + 0.1, bz], [bx, y + 2.0, bz], [ax, y + 2.0, az], [ox, oz], 0.4);
      const [fx, fz] = F.P(du + dw / 2, -1.4); H.floor(fx, y + 0.05, fz, 1.9, 1.4, Math.atan2(ox, oz), 10, false, 0.6);
      H.ball(...F.P(du + dw / 2, 1.4).flatMap((v, i) => (i === 0 ? [v] : [y + 1.3, v])), 0.6);
    }
    if (roofRoomOf(el)) { const [, b, c, d] = roofRoomRect(L, hd); const [lx, lz] = F.P(c - 0.45, d - 0.6); H.ball(lx, y + H0 + 0.1 + 0.95, lz, 0.9); void b; }
    if (hashAt(el.rect[0], el.rect[1], 7) < 0.4) for (let u = 1.0; u < L - 1.0; u += 2.2) { const [lx, lz] = F.P(u, -0.2); H.ball(lx, y + 0.62, lz, 0.2); }       // sill lamps (small: they are 20 cm)
  },
};

// ── the fires that are elements of their own ─────────────────────────────────────────────────────────────────────
/** alx_torch: { at: [x, z], y, h? } — a resinous torch in an iron holder on a post (the gates, the Museion's gateway, the court of the Pharos): its flame, its light and its halo. */
function torch(el, { bag, col, lights }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 2.3;
  bag.add('bronze', rod([x, y, z], [x, y + h, z], 0.035, 5));
  bag.add('bronze', lathe([[0.001, 0], [0.11, 0.0], [0.14, 0.16], [0.1, 0.16], [0.001, 0.06]], 6, null, x, y + h - 0.05, z));
  bag.add('flame', lathe([[0.001, 0], [0.09, 0.01], [0.04, 0.3], [0.001, 0.46]], 6, null, x, y + h + 0.08, z));
  col.circle(x, z, 0.08, y, y + h);
  if (lights) lights.push({ at: [x, y + h + 0.3, z], color: '#ff9a4a', intensity: 2.8, distance: 9 });
  const H = new Halo(); fire(H, x, y + h + 0.3, z, 1.2, y, 3.2); H.flush(bag);
}
/**
 * alx_seaglow: { c: [x, z] (under the fire), to: [x, z] (toward the harbour: the way the visitor looks), y? } — the fire's reflection on the water: a narrow
 * path along the line from the island to the viewer, broken into ripples, and a broad dim pool about the island's feet (halo, water kind).
 */
function seaglow(el, { bag }) {
  const [cx, cz] = el.c, [tx, tz] = el.to, y = (el.y ?? SEA) + 0.06, dx = tx - cx, dz = tz - cz, L = Math.hypot(dx, dz), yaw = Math.atan2(dz, dx) - Math.PI / 2;
  const H = new Halo();
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + i * 0.14, px = cx + dx * t, pz = cz + dz * t;
    if (wet(px, pz) > -0.5) continue;
    H.floor(px, y, pz, 6 + 7 * t, L * 0.1, yaw, 10, true, 1.0 - 0.45 * t);
  }
  for (const [ox, oz] of [[0, 90], [-60, 60], [60, 60]]) if (wet(cx + ox, cz + oz) < -0.5) H.floor(cx + ox, y, cz + oz, 40, 40, 0, 12, true, 0.35);
  H.flush(bag);
}

let done = false;
/** Wraps the ptolemaic style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.ptolemaic.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.alx_torch = torch; E.alx_seaglow = seaglow;
}
/** The torches at the gates and the court of the Pharos, and the fire's reflection (plan elements: the museion plan's, the harbour's). */
export function fires() {
  const [px, pz] = PHAROS.c, y = g0;
  return {
    pharos: [[-3.4, 1], [3.4, 1]].map(([dx]) => ({ t: 'alx_torch', at: [px + dx, pz + 15 + 3.4], y, h: 2.4 })),
    museion: [[243, -81.9], [249, -81.9]].map((at) => ({ t: 'alx_torch', at, y })),
    sea: [{ t: 'alx_seaglow', c: [px, pz + 20], to: [102, -86], y: SEA }],
  };
}
