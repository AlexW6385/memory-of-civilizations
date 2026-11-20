// Tang Chang'an by night (docs/settlements/tang-changan.md §18): the city of the curfew, not an open night market.
//   - the street drums ended the day: the ward gates were shut by the ward headman and the two markets were closed at dusk, so that
//     by night the ward gates are SHUT (leaves of planks across the passage, present at night only: the `wood_dark+night` material, cut
//     away by day) and the market's shops are SHUT (a shutter in every bay) with their lanterns covered, the market gates shut;
//   - the temples and the monasteries were exempt from the curfew, so Daci'en and the Daoist temple are LIT: the lanterns at the halls'
//     doors, the lamps within, the stone lamps of the courts, the embers of the censers, the lamps in each storey of the pagoda that show
//     in its windows, a lamp at the temple's gate;
//   - inside the wards the families are at home by lamplight: a share of the houses show lit windows and a lantern at the gate (the
//     great houses', the gentry's), the rest are dark; at the ward gates the guard's lamp; the street drum towers keep a lamp for the
//     drummers.
// The light is the halo kit's (nightkit.js, the engine's additive `halo` material: night only, no light, no shadow). Wrappers over the
// style's elements, registered once by registerNight(); a function of place only (no counters, no Math.random).

import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { inFrame, YAW } from '../../styles/tang/kit.js';
import { Halo, hashAt, boxesOf, litWindows, lampLights } from './nightkit.js';

const NIGHT_MAT = 'wood_dark+night';
/** A small variation of a size by the hash of its own place (so that repeated shapes are not identical: they would be made instanced draws). */
const jit = (x, z, s, a = 0.06) => 1 + (hashAt(x, z, s) - 0.5) * 2 * a;
/** Share of the ward houses that are lit (a lamp burning, windows and gate lantern), of the monastery's cells and rooms. */
export const SHARE = { house: 0.5, cells: 0.5 };

/** The world frame of a hall facing `face` at centre c: P(local) -> world [x, z], N = the outward normal in the world. */
export function frameOf(c, face) {
  const yaw = YAW[face || 's'], cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  return { P: ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs], N: [sn, cs], yaw };
}

/** A glow shade's cover, drawn at night only: the lamp stays dark (the lanterns of a closed market, of a house asleep). */
function shellBag(real) {
  return new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g) => {
        if (mat === 'lamp_paper' && g?.attributes?.position) for (const b of boxesOf(g)) {
          const w = Math.max(b.x1 - b.x0, b.z1 - b.z0), h = b.y1 - b.y0;
          if (w >= 0.1 && w <= 1.6 && h >= 0.1 && h <= 2.2) { const m = 0.025 + 0.012 * hashAt(b.x0, b.z0, 4); t.add(NIGHT_MAT, box(b.x0 - m, b.y0 - m, b.z0 - m, b.x1 + m, b.y1 + m * 1.3, b.z1 + m)); }
        }
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}

/** A lantern hung at (x, y, z) (y the cord's top) over a floor at gy with a wall behind it, lit: the body, its cord and the halo. */
function hangLantern(bag, H, x, y, z, gy, wallN = null, k0 = 1, lit = true) {
  const k = k0 * jit(x, z, 6, 0.1), cord = 0.2 + 0.1 * hashAt(x, z, 7);
  bag.add('wood_dark', box(x - 0.008, y - cord, z - 0.008, x + 0.008, y, z + 0.008));
  bag.add('lamp_paper', lathe([[0.001, 0], [0.1 * k, 0.03], [0.16 * k, 0.17], [0.17 * k, 0.26], [0.14 * k, 0.4], [0.08 * k, 0.45], [0.001, 0.46]], 8, null, x, y - cord - 0.46, z));
  bag.add('timber_red', box(x - 0.08 * k, y - cord - 0.02, z - 0.08 * k, x + 0.08 * k, y - cord, z + 0.08 * k));
  if (!lit) return;
  H.ball(x, y - cord - 0.23, z, 0.95 * k);
  H.floor(x, gy + 0.03, z, 2.4 * k * (0.7 + 0.3 * Math.min(1, (y - gy) / 2.4)));
  if (wallN) H.wall(x - wallN[0] * 0.35, y - cord - 0.23, z - wallN[1] * 0.35, wallN, 1.5 * k, 1.2 * k);
}

/** A warm sheet in a hall's door (the lamps within, seen through the opening) and the spill of it on the terrace before the door. */
function doorGlow(H, fr, y, dw, dh, depth, f = 0.8) {
  const a = fr.P([-dw / 2, depth - 0.45]), b = fr.P([dw / 2, depth - 0.45]);
  H.quad([a[0], y + 0.15, a[1]], [b[0], y + 0.15, b[1]], [b[0], y + dh - 0.1, b[1]], [a[0], y + dh - 0.1, a[1]], fr.N, f);
  const s = fr.P([0, depth + 1.6]);
  H.floor(s[0], y + 0.03, s[1], dw * 0.95, dw * 0.8, 0, 8);
  // the pool across the threshold itself (inside the door)
  const t = fr.P([0, depth - 1.0]);
  H.floor(t[0], y + 0.06, t[1], dw * 0.8, dw * 0.6, 0, 8);
}

const hall = (el) => { // door of an element of the Tang hall family
  const nb = el.nb || 3, bay = el.w / nb, dw = Math.min(bay - 0.9, el.doorW ?? 2.6), dh = Math.min((el.H ?? 4) - 0.8, 3.3);
  return { dw, dh, y: (el.y ?? 0) + (el.plat ?? 0) };
};

let DONE = false;
/** Wrap the elements of the style `tang-changan` for the night. Idempotent. */
export function registerNight() {
  if (DONE) return;
  const S = STYLES['tang-changan'];
  if (!S) return;
  DONE = true;
  const E = { ...S.elements };
  const was = (n) => E[n];
  const set = (n, f) => { E[n] = f; };

  // ── a hall (the temples', the monastery's rooms, the market office, the gate guard's hut): lit lamps and lit windows
  for (const name of ['tang_hall', 'daci_hall']) {
    const base = was(name);
    set(name, (el, ctx) => {
      const temple = name === 'daci_hall' || el.lit === true;
      const lit = temple || (el.interior && hashAt(el.c[0], el.c[1], 3) < SHARE.cells);
      if (!el.interior && name === 'tang_hall') return base(el, ctx);              // galleries, open sheds: nothing of their own
      const floor = (el.y ?? 0) + (el.plat ?? 0);
      if (!lit) return base(el, ctx);
      const W = litWindows(ctx, temple ? 0.9 : 0.8, 17), L = lampLights(W.ctx, floor, { pool: 2.2, max: 40 });
      base(el, L.ctx);
      if (el.kind === 'hall' && (el.doorW || el.nb)) { const d = hall(el); doorGlow(L.halo, frameOf(el.c, el.face), d.y, d.dw, d.dh, el.d / 2, temple ? 0.85 : 0.6); }
      L.finish(); W.finish();
    });
  }
  // ── the temple's furnishings: the lamps of the halls (temple_interior), the stone lamps and censers of the courts
  { const base = was('temple_interior');
    set('temple_interior', (el, ctx) => { const L = lampLights(ctx, el.y ?? 0, { pool: 2.0, max: 40 }); base(el, L.ctx); L.finish(); }); }
  { const base = was('stone_lamp');
    set('stone_lamp', (el, ctx) => { const L = lampLights(ctx, el.y ?? 0, { pool: 1.8, scale: 1.2, max: 2 }); base(el, L.ctx); L.finish(); }); }
  { const base = was('incense_ding');
    set('incense_ding', (el, ctx) => {
      base(el, ctx);
      const H = new Halo(), [x, z] = el.at, s = el.s ?? 1.4, y = (el.y ?? 0) + 2.1 * s;
      H.ball(x, y, z, 0.45 * s); H.floor(x, (el.y ?? 0) + 0.04, z, 1.5 * s);          // the embers of the incense, glowing at the censer's mouth
      H.flush(ctx.bag);
    }); }
  // ── the pagoda: the lamp in each storey shows in its windows; the ground chamber's lamps in the doors
  { const base = was('tang_pagoda');
    set('tang_pagoda', (el, ctx) => {
      const L = lampLights(ctx, (el.y ?? 0) + 4.32, { pool: 2.4, max: 24 });
      base(el, L.ctx);
      pagodaPanes(L.halo, el);
      L.finish();
    }); }
  // ── the ward gates: shut by the headman, a guard's lamp each side (the plans of tc_night_gate, near the visitor); the temple's gate stays
  //    open: a lamp at each pier (temples were exempt from the curfew)
  { const base = was('fang_gate');
    set('fang_gate', (el, ctx) => {
      base(el, ctx);
      if (!el.open) return;
      gateLamps(ctx, el);
    }); }
  set('tc_night_gate', (el, ctx) => { gateLeaves(ctx, el); gateLamps(ctx, el); });
  set('tc_night_shutters', (el, ctx) => shutters(ctx, el));
  // ── the street drum's pavilion: the drummers' lamp
  { const base = was('drum_tower');
    set('drum_tower', (el, ctx) => {
      base(el, ctx);
      const fr = frameOf(el.c, el.face), H = new Halo();
      for (const s of [-1, 1]) { const p = fr.P([s * 2.3, 0]); hangLantern(ctx.bag, H, p[0], 8.1, p[1], 4.8, null, 1, true); }
      H.flush(ctx.bag);
    }); }
  // ── a house of a ward: by hash, lit (lamps, lit windows, the lantern at the gate) or dark (lamps covered)
  { const base = was('tang_house');
    set('tang_house', (el, ctx) => {
      const [cx, cz] = [(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2], lit = el.furnished || hashAt(cx, cz, 9) < SHARE.house;
      if (!lit) return base(el, ctx);
      const W = litWindows(ctx, 0.85, 31), L = lampLights(W.ctx, 0, { pool: 2.0, max: 12 });
      base(el, L.ctx);
      houseGateLamp(ctx, L.halo, el);
      L.finish(); W.finish();
    }); }
  // ── the market's shop rows: the lanterns covered (the shutters are the market's night plan)
  { const base = was('tang_shop_row');
    set('tang_shop_row', base); }

  registerStyle('tang-changan', { ...S, elements: E });
}

/** The windows of the pagoda's upper storeys and the doors of the ground one show the lamp within (sheets in the openings). */
const STOREYS = [{ h: 10.0, s: 12.5, bays: 9 }, { h: 8.0, s: 11.7, bays: 9 }, { h: 7.2, s: 10.9, bays: 7 }, { h: 6.6, s: 10.2, bays: 7 }, { h: 6.1, s: 9.6, bays: 5 }, { h: 5.7, s: 9.0, bays: 5 }, { h: 5.4, s: 8.5, bays: 5 }];
function pagodaPanes(H, el) {
  const [cx, cz] = el.c, y0 = el.y ?? 0;
  let y = y0 + 4.2 + 0.12;
  STOREYS.forEach((S, i) => {
    const { h, s, bays } = S, bodyH = h - 1.05, bw = (2 * s) / bays, aw = Math.min(bw * 0.62, 2.8), ah = i === 0 ? 5.4 : Math.min(bodyH * 0.6, 3.6), sill = i === 0 ? 0 : 0.9;
    const f = i === 0 ? 0.55 : 0.9 - 0.04 * i, tw = 0.16;                 // (a sheet just inside the outer face of the opening, so that it is seen from the court below)
    for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const px = cx + fx * (s - tw), pz = cz + fz * (s - tw), ux = fz !== 0 ? 1 : 0, uz = fz !== 0 ? 0 : 1, hw = aw / 2 - 0.05, ya = y + sill + 0.05, yb = y + sill + ah - 0.1;
      H.quad([px - ux * hw, ya, pz - uz * hw], [px + ux * hw, ya, pz + uz * hw], [px + ux * hw, yb, pz + uz * hw], [px - ux * hw, yb, pz - uz * hw], [fx, fz], f);
    }
    y += h;
  });
}

/** The lantern at a house's gate (the great houses' and the gentry's; the common hang none, the poor a rushlight in the lintel's hollow). */
function houseGateLamp(ctx, H, el) {
  const kind = el.kind || 'house', wk = el.wk || 'official';
  if (kind === 'hut' || wk === 'poor') return;
  const rank = kind === 'mansion', f = el.front || 's', al = f === 'n' || f === 's';
  const W = al ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1], D = al ? el.rect[3] - el.rect[1] : el.rect[2] - el.rect[0];
  const rand = (() => { let s = (el.seed || 1) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const gx = (rand() < 0.5 ? -1 : 1) * W * 0.2, fr = frameOf([(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2], f);
  for (const s of rank ? [-1, 1] : [1]) {
    const p = fr.P([W / 2 + gx + s * (rank ? 1.5 : 1.0), D / 2 + 0.55]);
    hangLantern(ctx.bag, H, p[0], 3.05, p[1], 0, fr.N, rank ? 1.15 : 0.9, true);
  }
}

/** The two leaves of a ward gate, shut across its passage (planks, three rails, a bar): night only. */
function gateLeaves(ctx, el) {
  const w = el.w ?? 6.4, T = el.T ?? 2.6, D = T + 1.2, ph = 3.5, c = el.c, yaw = el.axis === 'z' ? YAW.e : YAW.s;
  inFrame(ctx, c, yaw, (L) => {
    const z0 = -D / 2 + 0.34;
    for (const s of [-1, 1]) {
      const j = jit(c[0], c[1], 11 + s, 0.012), x0 = s > 0 ? 0.03 : -w / 2 * j, x1 = s > 0 ? w / 2 * j : -0.03, z1 = z0 + 0.12 * jit(c[1], c[0], 12, 0.2);
      L.bag.add(NIGHT_MAT, box(x0, 0, z0, x1, (ph - 0.5) * jit(c[0], c[1], 13 + s, 0.015), z1));
      for (const yy of [0.5, 1.6, 2.6]) L.bag.add(NIGHT_MAT, box(x0, yy * jit(c[0], c[1], 14, 0.05), z1, x1, yy + 0.18 * jit(c[1], c[0], 15, 0.2), z1 + 0.05));
    }
    L.bag.add(NIGHT_MAT, box(-w / 2 + 0.1, 1.55, z0 + 0.17, w / 2 - 0.1, 1.7 * jit(c[0], c[1], 16, 0.03), z0 + 0.27));
  });
}
/** The guard's lamp hung from the great lintel at each face of a gate (street side +z, ward side -z). */
function gateLamps(ctx, el) {
  const w = el.w ?? 6.4, T = el.T ?? 2.6, D = T + 1.2, ph = 3.5, yaw = el.axis === 'z' ? YAW.e : YAW.s, c = el.c, cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  const P = ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs], N = (n) => [n[0] * cs + n[1] * sn, -n[0] * sn + n[1] * cs], H = new Halo();
  for (const [sz, k] of [[1, 1], [-1, 0.9]]) for (const sx of [-1, 1]) {
    const p = P([sx * (w / 2 - 0.5), sz * (D / 2 + 0.2)]);
    hangLantern(ctx.bag, H, p[0], ph - 0.45, p[1], 0, N([0, sz]), k, true);
  }
  H.flush(ctx.bag);
}
/** The market's shop rows shut: a shutter in every bay of each row (as tang_shop_row lays its bays). */
function shutters(ctx, el) {
  for (const r of el.rows) {
    const f = r.front || 's', al = f === 'n' || f === 's', W = al ? r.foot[2] - r.foot[0] : r.foot[3] - r.foot[1], D = al ? r.foot[3] - r.foot[1] : r.foot[2] - r.foot[0];
    const c = [(r.foot[0] + r.foot[2]) / 2, (r.foot[1] + r.foot[3]) / 2], nbT = r.units.reduce((a, u) => a + u.nb, 0), hw = W - 1.6, hd = D - 1.6, bay = hw / nbT;
    inFrame(ctx, c, YAW[f], (L) => {
      for (let k = 0; k < nbT; k++) {
        const a0 = -hw / 2 + k * bay + 0.3, a1 = -hw / 2 + (k + 1) * bay - 0.3, q = hashAt(c[0] + a0, c[1] + k, 21);
        L.bag.add(NIGHT_MAT, box(a0, 0.32, hd / 2, a1, 3.2 + 0.12 * q, hd / 2 + 0.1));
        for (const yy of [0.9, 1.9, 2.8]) L.bag.add(NIGHT_MAT, box(a0 - 0.02, yy + 0.05 * q, hd / 2 + 0.1, a1 + 0.02, yy + 0.12 + 0.05 * q, hd / 2 + 0.14));
      }
      // the covers over the lanterns hung before the units (frontage(): at each unit's ends, z = the unit's frontage - 0.68…-0.42)
      let k = 0;
      for (const u of r.units) {
        const x0 = -hw / 2 + k * bay + 0.7, x1 = -hw / 2 + (k + u.nb) * bay - 0.2, zf = hd / 2 + 0.9;
        for (const x of [x0 + 0.5, x1 - 0.5]) L.bag.add(NIGHT_MAT, box(x - 0.16, 2.59, zf - 0.71, x + 0.16, 3.06 + 0.02 * hashAt(x, zf, 3), zf - 0.39));
        k += u.nb;
      }
    });
  }
}
/** The night plans (shown within 215 m of their ward's centre): the ward's gates shut and lamp-lit; the market's shutters. */
export function nightPlans(base, wards, gates, marketId, marketRows) {
  const out = [];
  for (const w of wards) {
    if (w.kind === 'daci\'en') continue;
    const els = gates().filter((g) => g.ward === w.id).map((g) => ({ t: 'tc_night_gate', c: g.c, axis: g.axis, w: g.ward === marketId ? 7.2 : 6.4 }));
    if (w.id === marketId) els.push({ t: 'tc_night_shutters', rows: marketRows() });
    if (els.length) out.push({ ...base(`tang-changan-night-${w.id}`, els), near: 215, center: w.c });
  }
  return out;
}
