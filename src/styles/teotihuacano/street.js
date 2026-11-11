// The streets' faces of Teotihuacan's apartment compounds (docs/settlements/teotihuacan.md §15): what a
// walker at 1–5 m sees along the blank outer walls — the painted band under the roof's edge with its
// stepped frets, the crest of merlons, the roof's drain spouts and the stain under each, the doorway's
// step and painted jambs, the household's things set out by the wall (water jars, firewood, a plastered
// bench, a mat with goods, trays of maize drying, a woman grinding at her door, turkeys, a dog, a
// ladder up to the roof, washing, a little shrine in a niche) and the people at them.
// Every repeated small piece goes in as an instance (src/objects/kit.js placer), so a street of
// compounds costs matrices, not geometry.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { carved } from '../maya/meso.js';
import { merge } from '../../objects/kit.js';
import { metateKit, bowlsKit } from '../maya/household.js';
import '../../objects/index.js';

const RD = 'stucco_red', WH = 'stucco_pale', S = 'stucco_ochre';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const _q = new Quaternion(), _up = new Vector3(0, 1, 0), _p = new Vector3(), _s = new Vector3();
/** Put a carving (a Kit: x across, y up, +z its front) as instances at (x, y, z), its front turned `rot`, with a reach (m) it is still drawn at. */
const MERGED = new WeakMap();
export function inst(bag, kit, x, y, z, rot = 0, s = 1, reach = 150) {
  const M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, rot), _s.set(s, s, s));
  // one geometry per material (merged once per carving): a kit is a few instances, not dozens
  let parts = MERGED.get(kit);
  if (!parts) MERGED.set(kit, (parts = [...kit.m].map(([mat, list]) => [mat, merge(list.map((g) => g.clone()))])));
  for (const [mat, g] of parts) {
    if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { real: mat, reach });
    else { const c = g.clone(); c.applyMatrix4(M); bag.add(mat, c); }
  }
}

// ---- the wall's small pieces ---------------------------------------------------------------------------------
/** A stepped fret (xicalcoliuhqui) in white on the painted band, 0.8 m wide, 0.34 high, flat on the wall, facing +z. */
const fretKit = () => carved('st-fret', (k) => {
  k.bx(WH, -0.4, 0.4, 0.04, 0.09, 0, 0.012); k.bx(WH, -0.4, 0.4, 0.26, 0.31, 0, 0.012);
  for (let i = 0; i < 3; i++) { const x = -0.34 + i * 0.26; k.bx(WH, x, x + 0.05, 0.04, 0.31, 0, 0.012); k.bx(WH, x, x + 0.2, 0.15, 0.2, 0, 0.012); }
});
/** A merlon (almena) on the wall's head: white, a red inset, 0.5 wide, 0.5 high, set on y = 0. */
const merlonKit = () => carved('st-merlon', (k) => {
  k.bx(S, -0.26, 0.26, 0, 0.5, -0.1, 0.1); k.bx(RD, -0.13, 0.13, 0.15, 0.37, 0.1, 0.112); k.bx(RD, -0.13, 0.13, 0.15, 0.37, -0.112, -0.1);
});
/** A roof drain (a stone canale) jutting 0.5 m from the wall, its mouth dark. */
const spoutKit = () => carved('st-spout', (k) => {
  k.bx('andesite', -0.1, 0.1, -0.06, 0.07, -0.02, 0.5); k.bx('paint_minoan_black', -0.07, 0.07, -0.02, 0.04, 0.46, 0.505);
});
/** The streak of damp and soot under a drain, running down the wall, 0.45 wide, 1.9 long, hanging from y = 0. */
const streakKit = () => carved('st-streak', (k) => {
  const g = lathe([[0.001, 0], [0.5, 0], [0.5, 0.005], [0.001, 0.005]], 10, (th) => 0.86 + 0.12 * Math.sin(th * 3));
  g.scale(0.22, 1, 0.95); g.rotateX(Math.PI / 2); g.translate(0, -0.95, 0.006);
  k.geo('plaster_damp', g);
});
/** The doorway's step: a stone threshold block and two painted jambs, 1.8 m between them (built along x, front +z). */
const doorKit = () => carved('st-door', (k) => {
  k.bx('andesite', -1.35, 1.35, 0, 0.16, 0.0, 0.7); k.bx(S, -1.2, 1.2, 0.16, 0.3, 0.0, 0.36);
  for (const sx of [-1, 1]) { k.bx(RD, sx * 0.9 - (sx > 0 ? 0 : 0.34), sx * 0.9 + (sx > 0 ? 0.34 : 0), 0, 2.35, 0, 0.05); k.bx(WH, sx * 0.9 + sx * 0.05 - 0.04, sx * 0.9 + sx * 0.05 + 0.04, 0.3, 2.2, 0.05, 0.065); }
  k.bx(RD, -1.28, 1.28, 2.62, 2.9, 0, 0.06);
});
/** A little street shrine in a niche: a red frame round a dark recess, a ledge with two bowls and a flower offering, facing +z, its back on the wall. */
const nicheKit = () => carved('st-niche', (k) => {
  k.bx(RD, -0.34, 0.34, 0.95, 1.85, 0, 0.04); k.bx('paint_minoan_black', -0.24, 0.24, 1.05, 1.75, 0.04, 0.05);
  k.bx(WH, -0.38, 0.38, 0.86, 0.95, 0, 0.26); k.bx(RD, -0.38, 0.38, 0.8, 0.86, 0, 0.26);
  k.bx(S, -0.1, 0.1, 1.08, 1.5, 0.05, 0.1);                                                                   // a little stone idol in it
  k.bx('paint_cab_yellow', -0.04, 0.04, 1.5, 1.6, 0.06, 0.09);
  k.geo('terracotta', lathe([[0.001, 0.95], [0.07, 0.96], [0.1, 1.0], [0.001, 0.97]], 10).translate(-0.2, 0, 0.15));
  k.geo('terracotta', lathe([[0.001, 0.95], [0.07, 0.96], [0.1, 1.0], [0.001, 0.97]], 10).translate(0.2, 0, 0.15));
  k.geo('cloth_red', lathe([[0.001, 0.97], [0.06, 0.975], [0.04, 1.02], [0.001, 1.04]], 7).translate(0.2, 0, 0.15));
});
/** A hanging gourd and a string of maize cobs on the wall by a door (the husks tied together), facing +z. */
const cobsKit = () => carved('st-cobs', (k) => {
  k.bx('timber', -0.04, 0.04, 1.9, 2.0, 0, 0.05);
  for (let i = 0; i < 6; i++) { const x = -0.2 + i * 0.08; k.seg('paint_cab_yellow', [x, 1.9, 0.06], [x + 0.01, 1.52 - (i % 2) * 0.1, 0.07], 0.03, 0.03, 0.04, 0.04); k.seg('cloth_ochre', [x, 1.92, 0.06], [x, 1.78, 0.065], 0.035, 0.03, 0.035, 0.03); }
});
const stoolKit = () => carved('st-stoolrock', (k) => { k.geo('andesite', lathe([[0.001, 0], [0.17, 0.0], [0.15, 0.2], [0.001, 0.22]], 7)); });

// ---- people --------------------------------------------------------------------------------------------------
const SKIN = ['skin_medium', 'skin_dark', 'skin_medium'];
/** A still figure from the life catalogue: who 'man' | 'woman' | 'child' | 'elder'. */
export function fig(ctx, o) {
  const L = STYLES.life.elements, r = rng(o.seed), base = { t: 'figure', at: o.at, y: o.y ?? 0, rot: o.rot ?? 0, seed: o.seed, skin: SKIN[Math.floor(r() * 3)], hairMat: 'hide_black', feet: 'bare', pose: o.pose ?? 'stand', carry: o.carry };
  const cl = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_white'], cw = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'];
  if (o.who === 'woman') L.figure({ ...base, dress: 'wrap', over: 'shawl', hair: 'bun', cloth: cw[Math.floor(r() * 4)], cloth2: 'cloth_white' }, ctx);
  else if (o.who === 'child') L.figure({ ...base, child: true, dress: 'tunic', legs: 'bare', over: 'none', hair: 'long', cloth: cl[Math.floor(r() * 4)], cloth2: 'cloth_brown' }, ctx);
  else L.figure({ ...base, dress: 'tunic', legs: 'bare', over: o.who === 'elder' || r() < 0.4 ? 'cape' : 'none', hair: 'long', cloth: cl[Math.floor(r() * 4)], cloth2: 'cloth_white' }, ctx);
}

// ---- a compound's four faces ---------------------------------------------------------------------------------
const FACES = (r) => { const [x0, z0, x1, z1] = r; return [
  { n: [0, -1], a0: x0, a1: x1, c: z0, ax: 'x' }, { n: [0, 1], a0: x0, a1: x1, c: z1, ax: 'x' },
  { n: [-1, 0], a0: z0, a1: z1, c: x0, ax: 'z' }, { n: [1, 0], a0: z0, a1: z1, c: x1, ax: 'z' }]; };

/**
 * Dress the outer wall of a compound (rect, its gate on side `gate` as numbered in `compound`, h the wall's height).
 * `richness` 0..1 sets how much is set out; the band, the merlons and the spouts are on every face.
 */
export function streetFront(ctx, rect, gate, h, seed, richness = 0.6) {
  const { bag, col } = ctx, L = STYLES.life.elements, rand = rng(seed ^ 0x2f1b), faces = FACES(rect);
  const fret = fretKit(), merlon = merlonKit(), spout = spoutKit(), streak = streakKit();
  faces.forEach((s, i) => {
    const [nx, nz] = s.n, mid = (s.a0 + s.a1) / 2, isGate = i === gate, yawK = Math.atan2(nx, nz), yawF = Math.atan2(-nx, -nz);
    const P = (u, d) => (s.ax === 'x' ? [u, s.c + nz * d] : [s.c + nx * d, u]);
    const nearGate = (u, w) => isGate && Math.abs(u - mid) < 1.6 + w;
    // the painted band under the roof's edge: a red strip with the stepped frets along it, broken by the doorway
    const bandRuns = isGate ? [[s.a0, mid - 1.5], [mid + 1.5, s.a1]] : [[s.a0, s.a1]];
    for (const [a, b] of bandRuns) {
      if (b - a < 1) continue;
      const q = s.ax === 'x' ? [a, 2.5, s.c + (nz > 0 ? 0 : -0.035), b, 2.95, s.c + (nz > 0 ? 0.035 : 0)] : [s.c + (nx > 0 ? 0 : -0.035), 2.5, a, s.c + (nx > 0 ? 0.035 : 0), 2.95, b];
      bag.add(RD, box(q[0], q[1], q[2], q[3], q[4], q[5]));
      const n = Math.floor((b - a - 0.4) / 0.95);
      for (let k = 0; k < n; k++) { const u = a + 0.2 + (b - a - 0.4) * (k + 0.5) / n, [x, z] = P(u, 0.035); inst(bag, fret, x, 2.56, z, yawK, 0.95, 110); }
    }
    // the merlons along the wall's head (the wall is 1 m thick, their middle on its middle)
    {
      const n = Math.floor((s.a1 - s.a0 - 1.5) / 1.5);
      for (let k = 0; k < n; k++) { const u = s.a0 + 0.75 + (s.a1 - s.a0 - 1.5) * (k + 0.5) / n, [x, z] = P(u, -0.5); inst(bag, merlon, x, h, z, s.ax === 'x' ? 0 : Math.PI / 2, 1, 170); }
    }
    // the drain spouts, each with its streak of damp below
    for (let u = s.a0 + 4 + rand() * 5; u < s.a1 - 3; u += 8 + rand() * 7) {
      if (nearGate(u, 1)) continue;
      const [x, z] = P(u, 0);
      inst(bag, spout, x, 2.95, z, yawK, 1, 90); inst(bag, streak, x, 2.9, z, yawK, 1, 80);
    }
    // the doorway: its step and painted jambs
    if (isGate) {
      const [x, z] = P(mid, 0);
      inst(bag, doorKit(), x, 0, z, yawK, 1, 120);
      col.rect(s.ax === 'x' ? [mid - 1.3, nz > 0 ? s.c : s.c - 0.7, mid + 1.3, nz > 0 ? s.c + 0.7 : s.c] : [nx > 0 ? s.c : s.c - 0.7, mid - 1.3, nx > 0 ? s.c + 0.7 : s.c, mid + 1.3], 0, 0.3);
    }
    // what is set out by the wall, in slots along it
    if (rand() > richness) return;
    let u = s.a0 + 2.5 + rand() * 3, last = '';
    while (u < s.a1 - 2) {
      let kind = pick(rand);
      if (kind === last) kind = pick(rand);
      last = kind;
      const w = item(ctx, L, kind, s, P, u, rand, { nx, nz, yawK, yawF, mid, isGate, seed: Math.floor(rand() * 1e9) });
      u += w + 3 + rand() * 5.5;
    }
  });
}

const MENU = [['jars', 16], ['wood', 11], ['bench', 12], ['mat', 6], ['trays', 8], ['turkey', 7], ['dog', 4], ['sacks', 7], ['grinder', 8], ['ladder', 6], ['pair', 7], ['laundry', 5], ['niche', 7], ['cobs', 4]];
const TOTAL = MENU.reduce((a, [, w]) => a + w, 0);
function pick(rand) { let t = rand() * TOTAL; for (const [k, w] of MENU) { if ((t -= w) < 0) return k; } return 'jars'; }

/** One thing set out at u along face s; returns the width it takes. */
function item(ctx, L, kind, s, P, u, rand, o) {
  const { bag, col } = ctx, { nx, nz, yawK, yawF } = o, sd = o.seed;
  const gateClash = (w) => o.isGate && Math.abs(u - o.mid) < 2.2 + w;
  const circ = (x, z, r, hh) => col.circle(x, z, r, 0, hh);
  switch (kind) {
    case 'jars': {
      if (gateClash(0.6)) return 0;
      const [x, z] = P(u, 0.98), pk = rand() < 0.55 ? 'water_pot' : 'dark_pot', n = 1 + Math.floor(rand() * 3);
      L.pot({ t: 'pot', kind: pk, n, at: [x, z], y: 0, seed: sd }, ctx); circ(x, z, 0.5 + 0.1 * n, 0.6);
      return 1.2;
    }
    case 'wood': {
      if (gateClash(1)) return 0;
      const [x, z] = P(u, 0.95);
      L.firewood({ t: 'firewood', at: [x, z], y: 0, rot: s.ax === 'x' ? 0 : Math.PI / 2, len: 1 + Math.floor(rand() * 3) * 0.25, seed: sd }, ctx);
      col.rect(s.ax === 'x' ? [x - 0.65, z - 0.45, x + 0.65, z + 0.45] : [x - 0.45, z - 0.65, x + 0.45, z + 0.65], 0, 0.7);
      return 1.6;
    }
    case 'bench': {
      if (gateClash(1.2)) return 0;
      const len = 1.8 + rand() * 0.6, [x, z] = P(u, 0.82), sit = rand() < 0.55;
      L.bench({ t: 'bench', at: [x, z], y: 0, rot: yawF, len, mat: 'stucco_pale', seed: sd }, ctx);
      col.rect(s.ax === 'x' ? [x - len / 2, z - 0.2, x + len / 2, z + 0.2] : [x - 0.2, z - len / 2, x + 0.2, z + len / 2], 0, 0.5);
      if (sit) {
        const [fx, fz] = P(u + (rand() - 0.5) * 0.6, 0.78);
        fig(ctx, { who: rand() < 0.5 ? 'elder' : rand() < 0.5 ? 'woman' : 'man', at: [fx, fz], y: 0.0, rot: yawF, seed: sd + 1, pose: 'sit' });
        if (rand() < 0.35) { const [cx, cz] = P(u + 0.9, 1.5); fig(ctx, { who: 'child', at: [cx, cz], rot: yawF + 0.6, seed: sd + 2, pose: 'squat' }); }
      }
      return len;
    }
    case 'mat': {
      if (gateClash(1.5)) return 0;
      const [x, z] = P(u, 1.8), [sx, sz] = P(u + 0.1, 1.0);
      L.goods_mat({ t: 'goods_mat', at: [x, z], y: 0, rot: s.ax === 'x' ? 0 : Math.PI / 2, goods: ['basket', 'water_pot', 'dark_pot', 'heap'], seed: sd }, ctx);
      fig(ctx, { who: rand() < 0.7 ? 'woman' : 'man', at: [sx, sz], rot: yawF, seed: sd + 3, pose: 'kneel' });
      return 2;
    }
    case 'trays': {
      if (gateClash(1.2)) return 0;
      for (let i = 0; i < 2; i++) { const [x, z] = P(u + i * 1.15, 1.15); L.drying_tray({ t: 'drying_tray', at: [x, z], y: 0, rot: rand() * 6, seed: sd + i }, ctx); circ(x, z, 0.45, 0.6); }
      return 2.3;
    }
    case 'turkey': {
      const [x, z] = P(u, 1.7);
      L.chickens({ t: 'chickens', kind: 'turkey', n: 2 + Math.floor(rand() * 3), at: [x, z], y: 0, rot: rand() * 6, seed: sd }, ctx);
      return 2.4;
    }
    case 'dog': {
      const [x, z] = P(u, 1.3);
      L.animal({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: sd, mat: rand() < 0.5 ? 'hide_tan' : 'hide_black' }, ctx);
      return 1;
    }
    case 'sacks': {
      if (gateClash(1)) return 0;
      const [x, z] = P(u, 0.95);
      L.sacks({ t: 'sacks', at: [x, z], y: 0, rot: yawF, n: 3 + Math.floor(rand() * 2), seed: sd }, ctx);
      const [bx, bz] = P(u + 1.3, 0.9); L.basket({ t: 'basket', at: [bx, bz], y: 0, n: 1 + Math.floor(rand() * 2), seed: sd + 1 }, ctx);
      col.rect(s.ax === 'x' ? [x - 0.9, z - 0.4, x + 0.9, z + 0.4] : [x - 0.4, z - 0.9, x + 0.4, z + 0.9], 0, 0.6);
      return 2.2;
    }
    case 'grinder': {
      if (gateClash(1.6)) return 0;
      const [x, z] = P(u, 1.5), th = Math.atan2(-nx, -nz) - Math.PI / 2;
      bag.add && L.goods_mat({ t: 'goods_mat', at: [x, z], y: 0, rot: s.ax === 'x' ? 0 : Math.PI / 2, goods: ['basket'], seed: sd }, ctx);
      inst(bag, metateKit(), x, 0.015, z, th, 1, 90);
      fig(ctx, { who: 'woman', at: [x, z], y: 0.015, rot: th, seed: sd + 4, pose: 'kneel' });
      if (rand() < 0.5) { const [cx, cz] = P(u - 1.0, 1.7); L.pot({ t: 'pot', kind: 'dark_pot', n: 1, at: [cx, cz], y: 0, seed: sd }, ctx); }
      return 2;
    }
    case 'ladder': {
      if (gateClash(0.8)) return 0;
      const [x, z] = P(u, 1.02);
      L.ladder({ t: 'ladder', at: [x, z], y: 0, rot: yawK, len: 3.5, seed: sd }, ctx);
      return 0.8;
    }
    case 'pair': {
      const [x, z] = P(u, 1.9), a = rand() * 0.8;
      const kids = rand() < 0.35;
      fig(ctx, { who: rand() < 0.5 ? 'man' : 'woman', at: [x, z], rot: yawF + Math.PI / 2 + a, seed: sd + 5, pose: 'talk' });
      const [x2, z2] = P(u + 0.9, 1.9);
      fig(ctx, { who: kids ? 'child' : rand() < 0.5 ? 'woman' : 'man', at: [x2, z2], rot: yawF - Math.PI / 2 - a, seed: sd + 6, pose: kids ? 'stand' : 'talk' });
      return 1.8;
    }
    case 'laundry': {
      if (gateClash(1.8)) return 0;
      const [x, z] = P(u + 1.4, 1.35);
      L.laundry({ t: 'laundry', at: [x, z], y: 0, rot: s.ax === 'x' ? 0 : Math.PI / 2, len: 3, seed: sd }, ctx);
      return 3.2;
    }
    case 'niche': {
      if (gateClash(0.8)) return 0;
      const [x, z] = P(u, 0);
      inst(bag, nicheKit(), x, 0, z, yawK, 1, 100);
      const [ox, oz] = P(u, 0.55); inst(bag, bowlsKit(RD), ox, 0, oz, rand() * 6, 0.9, 70);
      if (rand() < 0.5) { const [kx, kz] = P(u + 0.5, 0.75); fig(ctx, { who: 'woman', at: [kx, kz], rot: yawK + Math.PI, seed: sd + 7, pose: 'kneel' }); }
      return 0.9;
    }
    case 'cobs': {
      if (gateClash(0.8)) return 0;
      const [x, z] = P(u, 0.0);
      inst(bag, cobsKit(), x, 0, z, yawK, 1, 70);
      const [rx, rz] = P(u + 0.6, 1.1); inst(bag, stoolKit(), rx, 0, rz, 0, 1, 70);
      return 1.2;
    }
    default: return 0;
  }
}
