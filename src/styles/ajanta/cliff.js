// The Ajanta cliff (docs/settlements/ajanta.md §2–§5): a squared horseshoe of grey-brown basalt, built in slabs between
// the caves (each cave a hole cut in them), the rock-cut ledge before the painted caves and the stair up to it, the
// three enterable caves (caves.js) and the shrine niches of every face and tier, the weathering streaks on the rock.
import { box, lathe } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { XF, ROCK, ZW, ZOUT, WX1, FLOOR, LEDGE, STAIR, FACES, CAVES, C1, rng } from '../../settlements/ajanta/layout.js';
import { vihara, viharaGeo, chaitya, chaityaGeo, cellHall, cellGeo, hole } from './caves.js';
import { Panel, PAL, wall, buddhaM, figM, lotusBand } from './paint.js';

const MATS = ['sandstone_relief', 'sandstone_carved', 'sandstone_relief', 'rubble'];   // the basalt's warm brown-grey, not a grey wall
const STONE = 'sandstone_dressed', PLASTER = 'plaster_ochre';

/** The rock of one face, in slabs between the holes ([d0, d1, s0, s1, y0, y1], d into the rock): a box per piece. */
function faceRock(ctx, F, holes, seed) {
  const { bag, col } = ctx, rand = rng(seed);
  const cuts = new Set([F.s0, F.s1]);
  for (const h of holes) { cuts.add(h.s0); cuts.add(h.s1); }
  for (let s = F.s0 + 4; s < F.s1; s += 5 + rand() * 6) cuts.add(Math.round(s * 4) / 4);
  const S = [...cuts].filter((s) => s >= F.s0 && s <= F.s1).sort((a, b) => a - b);
  for (let i = 0; i < S.length - 1; i++) {
    const sa = S[i], sb = S[i + 1], sm = (sa + sb) / 2;
    if (sb - sa < 0.02) continue;
    const here = holes.filter((h) => sm > h.s0 && sm < h.s1);
    const top = F.top(sm) + (rand() - 0.5) * 1.4;
    const off = here.length || (F.id === 'main' && Math.abs(sm) > ZW - 1) ? 0 : [0, 0.35, 0.3, 0.8, 0.15][Math.floor(rand() * 5)];
    const matAt = (k) => MATS[Math.floor(Math.abs(Math.sin(sm * 12.9898 + seed + k * 3.1)) * 43758) % 4];
    // a slice without a cave is laid in strata of the basalt flows: layers of differing hardness, each standing a little out or in
    const layers = [], lo = F.id === 'main' && Math.abs(sm) > ZW - 1 ? 0 : 1;
    if (!here.length) { const ys = [-0.6, 6 + rand() * 3, 12 + rand() * 3, 19 + rand() * 3, 25 + rand() * 2, top]; for (let k = 0; k < ys.length - 1; k++) if (ys[k + 1] < top + 0.01 && ys[k + 1] > ys[k]) layers.push([ys[k], Math.min(ys[k + 1], top), lo * ([0, 0.35, -0.2, 0.5, 0.1][Math.floor(rand() * 5)] + (ys[k] > 11 && rand() < 0.35 ? 0.8 + rand() * 2.2 : 0)) + off]); if (ys[4] < top) layers.push([ys[4], top, off + lo * rand() * 0.3]); }
    const pieces = layers.length ? layers.map(([ya, yb, o]) => [-o, ya, ROCK, yb]) : subtractRects([-off, -0.6, ROCK, top], here.map((h) => [h.d0, h.y0, h.d1, h.y1]));
    for (const [d0, y0, d1, y1] of pieces) {
      const [xa, za] = F.map(d0, sa), [xb, zb] = F.map(d1, sb);
      const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), z0 = Math.min(za, zb), z1 = Math.max(za, zb);
      bag.add(matAt(Math.round(y0)), box(x0, y0, z0, x1, y1, z1));
      col.rect([x0, z0, x1, z1], y0, y1);
    }
    if (!here.length && rand() < 0.35) { const w = Math.min(sb - sa, 1.5 + rand() * 2), [xa, za] = F.map(ROCK * (0.3 + rand() * 0.5), sa), [xb, zb] = F.map(1 + rand() * 5, sa + w); bag.add('rubble', box(Math.min(xa, xb), top, Math.min(za, zb), Math.max(xa, xb), top + 0.8 + rand() * 1.6, Math.max(za, zb))); }
  }
}
/** A world-space hole [x0..x1, z0..z1, y0..y1] on a face as a face-local one. */
function toLocal(F, h) {
  const [xa, za] = [h.x0, h.z0], [xb, zb] = [h.x1, h.z1];
  const A = invert(F, xa, za), B = invert(F, xb, zb);
  return { d0: Math.min(A[0], B[0]), d1: Math.max(A[0], B[0]), s0: Math.min(A[1], B[1]), s1: Math.max(A[1], B[1]), y0: h.y0, y1: h.y1 };
}
function invert(F, x, z) { return F.id === 'main' ? [XF - x, z] : F.id === 'north' ? [-ZW - z, x] : [z - ZW, x]; }

/** A shrine niche (tiers 0–2, any face): a pillared mouth, a short cell, the back wall painted with a seated Buddha. */
function recess(ctx, F, c) {
  const { bag, col } = ctx, y = FLOOR[c.tier], w = c.w, h = c.h, dep = 2.3, o = F.out, R = [o[1], -o[0]];
  const P = (d, s, yy) => { const [x, z] = F.map(d, s); return [x, yy, z]; };
  const lh = { d0: 0, d1: dep, s0: c.s - w / 2, s1: c.s + w / 2, y0: y, y1: y + h };
  const [px, , pz] = P(dep, c.s, 0);
  // the painted back wall (the viewer outside faces the rock: u runs along R)
  const org = [px - R[0] * w / 2, pz - R[1] * w / 2];
  const pn = wall(bag, org[0], org[1], o, y, w, 0.03);
  pn.rect(PAL.ground, 0.02, 0.02, w - 0.02, h - 0.02, 1);
  buddhaM(pn, w / 2, 0.15, Math.min(h * 0.9, w * 0.8), { robe: c.seed % 2 ? PAL.ochre : PAL.blue, mand: c.seed % 3 ? PAL.green2 : PAL.blue }, 2);
  if (c.seed % 2) for (const s of [-1, 1]) figM(pn, w / 2 + s * w * 0.36, 0.2, h * 0.6, { dir: -s, dhoti: PAL.white, halo: PAL.ochre }, 2);
  pn.flush();
  // side plaster, the mouth: two square pillars, a lintel with a frieze
  for (const s of [-1, 1]) {
    const [qx, , qz] = P(0.3, c.s + s * (w / 2 - 0.33), 0);
    bag.add(STONE, box(qx - 0.22, y, qz - 0.22, qx + 0.22, y + h - 0.3, qz + 0.22));
    bag.add(STONE, box(qx - 0.3, y + h - 0.3, qz - 0.3, qx + 0.3, y + h, qz + 0.3));
    col.circle(qx, qz, 0.24, y, y + h);
  }
  const [lx0, , lz0] = P(-0.12, c.s - w / 2 - 0.1, 0), [lx1, , lz1] = P(0.2, c.s + w / 2 + 0.1, 0);
  bag.add(STONE, box(Math.min(lx0, lx1), y + h - 0.05, Math.min(lz0, lz1), Math.max(lx0, lx1), y + h + 0.35, Math.max(lz0, lz1)));
  for (let k = 0; k < Math.floor(w / 0.5); k++) { const [ax, , az] = P(-0.1, c.s - w / 2 + 0.25 + k * 0.5, 0), [bx, , bz] = P(-0.18, c.s - w / 2 + 0.45 + k * 0.5, 0); bag.add(k % 2 ? PLASTER : PAL.ground, box(Math.min(ax, bx), y + h + 0.06, Math.min(az, bz), Math.max(ax, bx), y + h + 0.3, Math.max(az, bz))); }
  if (c.tier < 2) {
    // a clay lamp and a leaf of offerings on the cell's floor before the painted Buddha
    const [lx, , lz] = P(dep - 0.5, c.s + w * 0.28, 0);
    bag.add('bronze', lathe([[0.001, 0], [0.07, 0.0], [0.09, 0.04], [0.001, 0.05]], 8, null, lx, y, lz)); bag.add('flame', lathe([[0.01, 0], [0.014, 0.02], [0.001, 0.05]], 5, null, lx, y + 0.05, lz));
    const [ox, , oz] = P(dep - 0.5, c.s - w * 0.28, 0);
    for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'paint_ochre' : 'cloth_red', lathe([[0.001, 0], [0.07, 0.0], [0.05, 0.05], [0.001, 0.06]], 6, null, ox + (k - 2) * 0.05, y, oz + (k % 2) * 0.06));
  }
  if (c.tier < 2) { const [fx0, , fz0] = P(0, c.s - w / 2, 0), [fx1, , fz1] = P(dep, c.s + w / 2, 0); col.floor([fx0, fz0, fx1, fz1], y); }
  return lh;
}

export function cliff(el, ctx) {
  const { bag, col } = ctx, rand = rng(7);
  const holes = { main: [], north: [], south: [] };
  const mainCaves = {};
  // the three enterable caves of the main face: their holes (world → local)
  const c1 = CAVES.find((c) => c.id === 'c1'), c19 = CAVES.find((c) => c.id === 'c19'), c12 = CAVES.find((c) => c.id === 'c12'), y1 = FLOOR[1];
  for (const g of [viharaGeo(XF, c1.s, y1), chaityaGeo(XF, c19.s, y1), cellGeo(XF, c12.s, y1)]) for (const h of g.holes) holes.main.push(toLocal(FACES.main, h));
  void mainCaves;
  const recesses = [];
  for (const c of CAVES) if (c.kind === 'recess') { const F = FACES[c.face]; const lh = recess(ctx, F, c); holes[c.face].push(lh); recesses.push(c); }
  faceRock(ctx, { ...FACES.main, s0: -ZOUT, s1: ZOUT }, holes.main, 3);
  faceRock(ctx, FACES.north, holes.north, 4);
  faceRock(ctx, FACES.south, holes.south, 5);
  // the ledge before the painted caves and the stair up to it
  {
    const { x0, x1, z0, z1 } = LEDGE;
    bag.add('rubble', box(x0, -0.7, z0, x1, FLOOR[1], z1));
    bag.add('sandstone_carved', box(x1 - 0.5, FLOOR[1] - 1.1, z0, x1 + 0.2, FLOOR[1], z1));
    col.floor([x0, z0, x1, z1], FLOOR[1]);
    // the foot of the ledge: its front stepped back in a few ragged blocks
    for (let z = z0; z < z1; z += 3 + rand() * 4) { const w = 2 + rand() * 3; bag.add('rubble', box(x1 - 0.3, -0.75, z, x1 + 0.3 + rand() * 0.7, 1.2 + rand() * 3.5, Math.min(z1, z + w))); }
  }
  {
    const { x0, x1, z0, z1 } = STAIR, n = Math.round((FLOOR[1] - FLOOR[0]) / 0.17), L = (z1 - z0) / n;
    for (let k = 0; k < n; k++) bag.add(STONE, box(x0, -0.65, z0 + k * L, x1, FLOOR[0] + (FLOOR[1] - FLOOR[0]) * (k + 1) / n, z0 + (k + 1) * L + 0.02));
    col.ramp([x0, z0, x1, z1], FLOOR[0], FLOOR[1], 's');
  }
  // the three caves
  vihara(ctx, XF, c1.s, y1);
  chaitya(ctx, XF, c19.s, y1);
  cellHall(ctx, XF, c12.s, y1);
  void C1;
  // the weathering of the rock: iron-red streaks and pale salt under the cave mouths and ledges (thin pieces on the face)
  const r2 = rng(19);
  for (let k = 0; k < 110; k++) {
    const z = -ZW + 3 + r2() * (2 * ZW - 6), y = 10 + r2() * 20, hh = 1.2 + r2() * 5;
    if (CAVES.some((c) => c.face === 'main' && Math.abs(c.s - z) < (c.w ?? 14) / 2 + 1.2 && y < FLOOR[c.tier] + (c.h ?? 8) + 1.5 && y + hh > FLOOR[c.tier] - 0.2)) continue;
    if (Math.abs(z - c1.s) < 14.5 && y < 17) continue;
    if (Math.abs(z - CAVES.find((c) => c.id === 'c19').s) < 7 && y < 18) continue;
    bag.add(k % 3 ? 'tuff_red' : 'sandstone_white', box(XF - 0.02, y, z, XF + 0.012, y + hh, z + 0.12 + r2() * 0.35));
  }
  void WX1; void lathe; void Panel; void lotusBand;
}
