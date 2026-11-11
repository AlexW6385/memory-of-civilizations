// The faces of the lanes of Tenochtitlan (docs/settlements/tenochtitlan.md §15): what a visitor meets at eye level
// along the calpulli's compound walls — the water jars and firewood at the walls' feet, strings of chile and maize cobs
// hung from pegs, mats leaned to dry, the stone bench at the gate, the plaster weathered (the salt of the lake at the
// foot, patches fallen away to the adobe, the streak under the roof's spout), the trade of the house at work before it
// (potter's kiln, weaver's loom, fisher's nets and drying fish, reed-gatherer's bundles, featherworker, lapidary,
// stone-cutter, the cook at her comal) — and the orchard-yards (huerto) in the cells between compounds. Small things are
// instanced, the far houses lighter.

import { STYLES } from '../../core/build.js';
import { box, lathe, place } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { carved } from '../maya/meso.js';
import { patch, ollaKit, storeJarKit, waterJarKit, bowlsKit } from '../maya/household.js';
import { maguey, nopal } from '../maya/plants.js';
import { mxPeople } from './life.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const SIDES = ['n', 's', 'w', 'e'];
const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };

/** A carving laid as instances (small ornaments: seen within `reach`). */
export function inst(bag, kit, x, y, z, yaw = 0, s = 1, reach = 70) {
  const m = new Matrix4().makeRotationY(yaw).scale(new Vector3(s, s, s)).setPosition(x, y, z);
  for (const [mat, list] of kit.m) for (const g of list) { if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { reach }); else bag.add(mat, place(g.clone(), x, y, z, yaw, s)); }
}

// ---- the kits (their own frame: x across, y up, z out from the wall) -----------------------------------------
/** A string of red chiles (or of maize cobs, `mat`) hung from a peg on the wall, 0.7 m long. */
export const stringKit = (mat) => carved('mx-string:' + mat, (k) => {
  k.bx('timber', -0.03, 0.03, 1.15, 1.2, -0.01, 0.16);                                      // the peg
  k.bx('rope_fibre', -0.008, 0.008, 0.45, 1.17, 0.12, 0.14);
  for (let i = 0; i < 7; i++) { const y = 1.08 - i * 0.095, sw = i % 2 ? 0.05 : -0.05; k.seg(mat, [sw, y, 0.13], [sw * 1.6, y - 0.1, 0.17], 0.028, 0.026, 0.02, 0.018); }
});
/** Gourds hung in a net from a peg. */
export const gourdsKit = () => carved('mx-gourds', (k) => {
  k.bx('timber', -0.03, 0.03, 1.2, 1.25, -0.01, 0.16);
  for (const [x, y, z, r] of [[-0.12, 0.95, 0.15, 0.14], [0.1, 0.9, 0.17, 0.16], [0, 0.62, 0.16, 0.13]]) k.geo('paint_ochre', lathe([[0.001, -r], [r, -r * 0.3], [r * 0.8, r * 0.5], [r * 0.3, r], [0.001, r * 1.1]], 8).translate(x, y, z));
  k.bx('rope_fibre', -0.008, 0.008, 0.95, 1.22, 0.14, 0.16);
});
/** A feather fan or standard hung on a wall peg: a disc of plumes on a handle. */
export const fanKit = () => carved('mx-fan', (k) => {
  k.bx('timber', -0.03, 0.03, 1.5, 1.55, -0.01, 0.14);
  k.seg('timber', [0, 1.52, 0.12], [0, 1.0, 0.14], 0.012, 0.012);
  for (let i = 0; i < 9; i++) { const a = -1.1 + i * 0.275; k.seg(i % 3 ? 'maya_blue' : i % 2 ? 'stucco_red' : 'stucco_saffron', [0, 1.02, 0.14], [Math.sin(a) * 0.3, 1.02 + Math.cos(a) * 0.34, 0.16], 0.018, 0.01, 0.045, 0.01); }
});
/** A rolled reed mat leaned against the wall (a petate, 1.7 m). */
export const matLean = () => carved('mx-matlean', (k) => { k.geo('reed_mat', lathe([[0.09, 0], [0.09, 1.7], [0.001, 1.7]], 8).rotateX(0.12).translate(0, 0, 0.1)); k.geo('reed_mat', lathe([[0.09, 0], [0.09, 1.55], [0.001, 1.55]], 8).rotateX(0.14).translate(0.17, 0, 0.12)); k.bx('rope_fibre', -0.1, 0.1, 0.9, 0.93, 0.05, 0.28); });
/** A stone bench at the gate (tlapechtli): a block of stuccoed rubble with a worn top. */
export const benchKit = () => carved('mx-lanebench', (k) => { k.bx('stucco_pale', -0.65, 0.65, 0, 0.42, 0, 0.42); k.bx('andesite', -0.7, 0.7, 0.42, 0.47, -0.02, 0.45); });
/** A tall water jar (apaxtli) on a ring of rushes, its lid a bowl. */
export const bigJarKit = () => carved('mx-bigjar', (k) => {
  k.geo('rope_fibre', lathe([[0.25, 0], [0.27, 0.05], [0.2, 0.09], [0.001, 0.09]], 10));
  k.geo('terracotta', lathe([[0.2, 0.06], [0.34, 0.3], [0.38, 0.55], [0.3, 0.8], [0.19, 0.92], [0.2, 1.0], [0.16, 1.0], [0.001, 0.94]], 12));
  k.geo('pottery_dark', lathe([[0.2, 0.98], [0.17, 1.04], [0.001, 1.06]], 10));
});
/** The potter's kiln: a low dome of clay with a mouth in front, the soot over it, a chimney hole. */
const kilnKit = () => carved('mx-kiln', (k) => {
  k.geo('mud_plaster', lathe([[1.05, 0], [1.0, 0.35], [0.8, 0.8], [0.45, 1.12], [0.2, 1.2], [0.001, 1.2]], 14).scale(1, 1, 0.9));
  k.bx('paint_minoan_black', -0.28, 0.28, 0.1, 0.62, 0.78, 0.96);
  k.bx('stucco_pale', -0.38, 0.38, 0.0, 0.1, 0.7, 1.05);
  k.geo('plaster_damp', lathe([[0.16, 0], [0.14, 0.04], [0.001, 0.05]], 8).translate(0, 1.2, 0));
  for (let i = 0; i < 6; i++) { const a = i * 1.05; { const cx = Math.cos(a) * 1.35, cz = Math.sin(a) * 0.7 + 0.15; k.bx('terracotta', cx - 0.11, cx + 0.11, 0, 0.22, cz - 0.1, cz + 0.1); } }  // the shards and unfired pots about
});
/** A stack of pots on a mat: three rows of bowls and jars. */
export const potsKit = () => carved('mx-potstack', (k) => {
  k.bx('reed_mat', -0.9, 0.9, 0, 0.02, -0.5, 0.5);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const x = -0.7 + i * 0.35, z = -0.25 + j * 0.5, v = (i + j) % 3; k.geo(v === 1 ? 'pottery_dark' : 'terracotta', lathe(v === 0 ? [[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.1, 0.2], [0.001, 0.2]] : v === 1 ? [[0.001, 0], [0.1, 0.02], [0.2, 0.14], [0.16, 0.3], [0.1, 0.34], [0.001, 0.3]] : [[0.001, 0], [0.14, 0.01], [0.2, 0.1], [0.22, 0.14], [0.001, 0.14]], 9).translate(x, 0.02, z)); }
  k.geo('terracotta', lathe([[0.18, 0], [0.26, 0.2], [0.25, 0.4], [0.001, 0.4]], 9).translate(0.55, 0.02, 0.62));
});
/** The backstrap loom hung from a post: the cloth's warp between the bar tied to the post and the bar at the weaver's belt (kneeling before it, 1.4 m out). */
const loomKit = () => carved('mx-loom', (k) => {
  k.bx('timber', -0.07, 0.07, 0, 1.45, -0.07, 0.07);
  k.bx('timber', -0.45, 0.45, 1.05, 1.1, 0.0, 0.05);
  k.bx('timber', -0.4, 0.4, 0.55, 0.59, 1.08, 1.12);
  k.fz('cloth_red', [-0.36, 0.36, 0.59, 0.6], [-0.36, 0.36, 1.05, 1.06], 1.08, 0.04);
  k.bx('cloth_ochre', -0.36, 0.36, 0.585, 1.06, 0.1, 0.12);
  k.bx('cloth_indigo', -0.36, 0.36, 0.8, 0.84, 0.1, 0.125);
  k.bx('cloth_white', -0.55, -0.25, 0, 0.14, 0.5, 0.9);                     // the cotton in its bag
});
/** A drying rack: two forked posts and a pole with fish (or `mat` things) hung along it. */
const rackKit = (mat) => carved('mx-rack:' + mat, (k) => {
  for (const x of [-1.0, 1.0]) k.bx('timber', x - 0.04, x + 0.04, 0, 1.55, -0.04, 0.04);
  k.seg('timber', [-1.1, 1.5, 0], [1.1, 1.5, 0], 0.03, 0.03);
  k.seg('timber', [-1.1, 1.05, 0], [1.1, 1.05, 0], 0.03, 0.03);
  for (let i = 0; i < 8; i++) { const x = -0.85 + i * 0.24, y = i % 2 ? 1.47 : 1.02; k.seg(mat, [x, y, 0.02], [x + 0.02, y - 0.44, 0.04], 0.045, 0.012, 0.025, 0.012); }
});
/** A cast net spread over a frame of poles to dry: a mesh of cord, floats of pottery along the foot. */
const netKit = () => carved('mx-net', (k) => {
  for (const x of [-1.1, 1.1]) k.bx('timber', x - 0.035, x + 0.035, 0, 1.7, -0.035, 0.035);
  k.seg('timber', [-1.15, 1.65, 0], [1.15, 1.65, 0], 0.03, 0.03);
  k.fz('rope_fibre', [-1.05, 1.05, 0.55, 0.57], [-1.05, 1.05, 1.62, 1.64], 0.05, 0.03);
  for (let i = 0; i < 7; i++) k.geo('terracotta', lathe([[0.001, 0], [0.04, 0.02], [0.001, 0.05]], 6).translate(-0.9 + i * 0.3, 0.52, 0.06));
});
/** A bundle of tule reeds stood on end, tied. */
const reedsKit = () => carved('mx-reeds', (k) => {
  for (const [x, z, r, h] of [[0, 0, 0.26, 1.7], [0.42, 0.1, 0.22, 1.5], [-0.38, 0.12, 0.2, 1.6]]) { k.geo('raupo', lathe([[r, 0], [r * 0.9, h * 0.5], [r * 0.5, h * 0.95], [0.001, h]], 9).translate(x, 0, z)); k.geo('rope_fibre', lathe([[r * 0.92, h * 0.38], [r * 0.93, h * 0.42], [r * 0.9, h * 0.42], [r * 0.9, h * 0.38]], 9).translate(x, 0, z)); }
});
/** The featherworker's frame: a board on a stand set with plumes in rows, a basket of plumes by it. */
export const featherKit = () => carved('mx-featherwork', (k) => {
  k.bx('timber', -0.5, -0.44, 0, 0.8, -0.04, 0.04); k.bx('timber', 0.44, 0.5, 0, 0.8, -0.04, 0.04);
  k.bx('wood_ochre', -0.5, 0.5, 0.5, 1.15, -0.02, 0.0);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) { const x = -0.45 + i * 0.082, y = 0.56 + r * 0.15; k.seg([ 'clay_green', 'maya_blue', 'stucco_saffron', 'stucco_red' ][(r + (i % 2)) % 4], [x, y, 0.0], [x, y + 0.13, 0.02], 0.022, 0.006, 0.03, 0.004); }
  k.geo('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.001, 0.2]], 9).translate(0.9, 0, 0.3));
  for (let i = 0; i < 6; i++) k.seg(i % 2 ? 'clay_green' : 'stucco_saffron', [0.85 + i * 0.02, 0.2, 0.3], [0.8 + i * 0.07, 0.5, 0.3 + (i % 3) * 0.04], 0.02, 0.005, 0.03, 0.004);
});
/** The lapidary's bench: a plank, lumps of jade and obsidian, a polishing slab and a bowl of sand. */
export const lapidaryKit = () => carved('mx-lapidary', (k) => {
  k.bx('timber', -0.8, 0.8, 0.42, 0.47, -0.3, 0.3); for (const x of [-0.7, 0.7]) for (const z of [-0.22, 0.22]) k.bx('timber', x - 0.04, x + 0.04, 0, 0.42, z - 0.04, z + 0.04);
  k.bx('basalt', -0.2, 0.2, 0.47, 0.53, -0.18, 0.18);
  for (const [x, z, m] of [[-0.55, 0.05, 'inlay_jade'], [-0.35, -0.12, 'obsidian'], [0.4, 0.1, 'inlay_jade'], [0.55, -0.1, 'obsidian'], [0.3, 0.2, 'inlay_carnelian']]) k.bx(m, x - 0.06, x + 0.06, 0.47, 0.55, z - 0.05, z + 0.05);
  k.geo('pottery_dark', lathe([[0.001, 0], [0.1, 0.02], [0.12, 0.08], [0.001, 0.07]], 8).translate(-0.05, 0.47, 0.2));
});
/** The mason's block-pile: dressed andesite blocks, a half-cut one with its mallet. */
export const masonKit = () => carved('mx-mason', (k) => {
  k.bx('andesite', -0.7, 0.2, 0, 0.4, -0.35, 0.35); k.bx('andesite', -0.55, 0.05, 0.4, 0.75, -0.3, 0.25); k.bx('andesite', 0.5, 1.2, 0, 0.3, -0.3, 0.3);
  k.bx('basalt', 0.2, 0.62, 0.0, 0.26, 0.5, 1.0);
  k.seg('timber', [0.0, 0.3, 0.9], [0.18, 0.3, 0.85], 0.025, 0.025); k.bx('basalt', 0.14, 0.26, 0.26, 0.38, 0.8, 0.9);
  for (const [x, z] of [[-0.1, 0.7], [0.3, 0.65], [0.0, 0.5]]) k.bx('stucco_pale', x - 0.04, x + 0.05, 0, 0.03, z - 0.04, z + 0.04);
});
/** The cook's comal: three stones, a griddle, glowing coals, a basket of tortillas and a pot on the side. */
const comalKit = () => carved('mx-comal', (k) => {
  for (const [x, z] of [[-0.3, 0], [0.3, 0], [0, 0.32]]) k.bx('stucco_pale', x - 0.1, x + 0.1, 0, 0.28, z - 0.1, z + 0.1);
  k.geo('terracotta', lathe([[0.001, 0], [0.4, 0.01], [0.42, 0.04], [0.001, 0.03]], 14).translate(0, 0.28, 0.1));
  k.geo('flame', lathe([[0.001, 0], [0.12, 0.01], [0.001, 0.04]], 8).translate(0, 0.07, 0.04));
  k.geo('wicker', lathe([[0.16, 0], [0.22, 0.1], [0.2, 0.14], [0.001, 0.14]], 9).translate(0.7, 0, -0.2));
  k.geo('cloth_white', lathe([[0.19, 0.09], [0.001, 0.15]], 9).translate(0.7, 0, -0.2));
  k.geo('pottery_dark', lathe([[0.001, 0], [0.14, 0.01], [0.24, 0.16], [0.18, 0.3], [0.001, 0.3]], 9).translate(-0.75, 0, 0.1));
});
/** A roof-edge spout: a stone gutter through the parapet — its streak below (patch()) is the weathering. */
const jarKit = () => ollaKit();

/** Where a point at u along side f of rect r, v out from its face, is, and the way it faces (yaw: +z toward the outside). */
function frame(r, f) {
  const [x0, z0, x1, z1] = r, [dx, dz] = OUT[f], alongX = f === 'n' || f === 's';
  const L = alongX ? x1 - x0 : z1 - z0, face = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1;
  const at = (u, v) => (alongX ? [x0 + u, face + dz * v] : [face + dx * v, z0 + u]);
  return { L, at, yaw: Math.atan2(dx, dz), out: [dx, dz], alongX, face };
}
const WALL_IN = 0.25;                                                      // the compound wall stands this far in from the platform's edge

/**
 * calli_front { rect, seed, gate ('n'…), trade, lod (0 far, 1 mid, 2 near) }: the lane faces of one compound.
 */
export function calliFront(el, ctx) {
  const { bag } = ctx, rand = rng((el.seed || 1) * 7 + 3), r = el.rect, lod = el.lod ?? 2, P = 0.42;
  const sides = SIDES.filter((f) => f !== el.gate);
  const painted = rand() < 0.35, band = rand() < 0.5 ? 'stucco_red' : 'paint_ochre';
  for (const f of SIDES) {
    const F = frame(r, f), L = F.L, wallFace = (u, v) => F.at(u, v - WALL_IN);
    const gate = f === el.gate;
    // the painted dado: a band at the foot of the whole wall (the gate's side kept to its corners)
    if (painted && lod >= 1 && !gate) {
      const a = F.at(0.4, -WALL_IN + 0.01), b = F.at(L - 0.4, -WALL_IN + 0.01), d = 0.012;
      bag.add(band, box(Math.min(a[0], b[0]) - (F.alongX ? 0 : d) , P + 0.35, Math.min(a[1], b[1]) - (F.alongX ? d : 0), Math.max(a[0], b[0]) + (F.alongX ? 0 : d), P + 0.75, Math.max(a[1], b[1]) + (F.alongX ? d : 0)));
    }
    if (lod >= 1) {
      // weathering: the lake's salt at the foot, a patch fallen away to the adobe, the streak under a spout
      const nW = lod >= 2 ? 2 + Math.floor(rand() * 2) : 1;
      for (let i = 0; i < nW; i++) {
        const u = 1.2 + rand() * (L - 2.4), c = wallFace(u, 0.0), kind = rand();
        if (gate && Math.abs(u - L / 2) < 2.5) continue;
        if (kind < 0.4) patch(bag, 'plaster_damp', [c[0], P + 0.62, c[1]], [F.out[0], 0, F.out[1]], 1.1 + rand() * 1.2, 0.5 + rand() * 0.3, el.seed + i * 13 + f.charCodeAt(0), 0.012, 0, 8);
        else if (kind < 0.75) patch(bag, 'mud_plaster', [c[0], P + 0.7 + rand() * 0.9, c[1]], [F.out[0], 0, F.out[1]], 0.35 + rand() * 0.7, 0.3 + rand() * 0.6, el.seed + i * 17 + f.charCodeAt(0), 0.012, 0, 8);
        else if (lod >= 2) patch(bag, 'plaster_streak', [c[0], P + 1.4, c[1]], [F.out[0], 0, F.out[1]], 0.3, 1.3, el.seed + i * 19 + f.charCodeAt(0), 0.012, 0, 8);
      }
    }
    if (lod < 1) { if (!gate && rand() < 0.5) { const p = F.at(1 + rand() * (L - 2), 0.55); inst(bag, bigJarKit(), p[0], 0, p[1], 0, 1, 50); } continue; }
    // the ground: jars, firewood, mats, baskets, the bench — corners only on the gate's side
    const slots = gate ? [0.9, L - 0.9] : [1.0, L * 0.3 + rand() * 1.2, L * 0.6 + rand() * 1.2, L - 1.1];
    for (const u of slots) {
      const k = rand();
      if (k > 0.78) continue;
      const p = F.at(u, 0.5 + rand() * 0.1);
      if (k < 0.2) inst(bag, bigJarKit(), p[0], 0, p[1], F.yaw + rand() * 6, 0.9 + rand() * 0.3, 60);
      else if (k < 0.34) STYLES.life.elements.firewood({ at: F.at(u, 0.6), y: 0, rot: F.alongX ? 0 : Math.PI / 2, seed: el.seed + Math.floor(u * 9), len: 1.2, h: 0.6 }, ctx);
      else if (k < 0.46) { const q = F.at(u, 0.4); inst(bag, matLean(), q[0], 0, q[1], F.yaw, 1, 55); }
      else if (k < 0.58) STYLES.life.elements.basket({ at: p, y: 0, seed: el.seed + Math.floor(u * 7), n: 1 + Math.floor(rand() * 2) }, ctx);
      else if (k < 0.68 && lod >= 2) { const q = F.at(u, 0.04); inst(bag, benchKit(), q[0], 0, q[1], F.yaw, 1, 70); }
      else STYLES.life.elements.pot({ at: p, y: 0, seed: el.seed + Math.floor(u * 11), kind: rand() < 0.5 ? 'dark_pot' : 'water_pot', n: 1 + Math.floor(rand() * 3) }, ctx);
    }
    // on the wall: strings of chile and maize, gourds, a feather fan (not over the gate's side)
    if (!gate && lod >= 2) {
      const n = 1 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) {
        const u = 1.3 + rand() * (L - 2.6), c = wallFace(u, 0.0), k = rand();
        const kit = k < 0.35 ? stringKit('stucco_red') : k < 0.65 ? stringKit('paint_ochre') : k < 0.88 ? gourdsKit() : fanKit();
        inst(bag, kit, c[0], P + 0.45 + (k > 0.88 ? 0.1 : 0), c[1], F.yaw, 1, 45);
      }
    }
  }
  // the trade, before the house on a side that is not the gate's
  if (el.trade && lod >= 2) trade(el, ctx);
}

/** The frame of a compound's trade (its own sequence): the point at du along, v out. Used by smoke.js for the kilns and comals. */
export function tradeFrame(el) {
  const rand = rng((el.seed || 1) * 11 + 5), sides = SIDES.filter((f) => f !== el.gate), f = sides[Math.floor(rand() * sides.length)], F = frame(el.rect, f);
  const u = F.L * (0.3 + rand() * 0.4);
  return { at: (du, v) => F.at(u + du, v), face: F.yaw };
}
function trade(el, ctx) {
  const { bag } = ctx, who = [], { at: p, face } = tradeFrame(el);
  const put = (kit, du, v, yaw = face, s = 1) => { const q = p(du, v); inst(bag, kit, q[0], 0, q[1], yaw, s, 80); };
  const person = (who2, du, v, rot = face + Math.PI, extra) => { const q = p(du, v); who.push([q[0], q[1], 0, rot, who2, el.seed + who.length * 5 + 1, extra]); };
  switch (el.trade) {
    case 'potter': put(kilnKit(), -1.2, 1.7); put(potsKit(), 1.4, 0.9); person('potter', 0.2, 1.3, face + Math.PI * 0.5); break;
    case 'weaver': put(loomKit(), 0, 0.5); person('weaver', 0, 1.7, face + Math.PI); break;
    case 'fisher': put(rackKit('hide_grey'), -1.3, 0.55); put(netKit(), 1.4, 0.5); person('fisher', 0, 1.2, face + 2.4); break;
    case 'reeds': put(reedsKit(), -1.0, 0.5); put(reedsKit(), 0.9, 0.55, face + 1); person('seller', 0.1, 1.2, face + Math.PI * 0.8, { pose: 'sit_ground' }); put(matLean(), 2.0, 0.3); break;
    case 'feather': put(featherKit(), 0, 0.5); person('featherer', 0.1, 1.3, face + Math.PI); break;
    case 'lapidary': put(lapidaryKit(), 0, 0.8); person('mason', 0.1, 1.5, face + Math.PI, { pose: 'sit_low' }); break;
    case 'mason': put(masonKit(), 0, 0.9); person('mason', 1.5, 1.1, face + Math.PI * 1.2); break;
    case 'cook': put(comalKit(), 0, 0.9); person('cook', 0.1, 1.6, face + Math.PI); person('seller', 1.6, 1.3, face + 3.6, { pose: 'sit_ground' }); break;
    default: break;
  }
  if (who.length) mxPeople({ people: who }, ctx);
}

/**
 * huerto { rect, seed }: an orchard-yard in a cell between compounds (Cortés: the gardens of flowers and fruit; the yards
 * kept maguey, nopal, chile and maize): a low adobe wall with a gate, beds of marigold, chile and amaranth in rows, a
 * granary, a turkey pen, maguey and nopal along the wall inside and out, a woman at work.
 */
export function huerto(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), r = el.rect, [x0, z0, x1, z1] = r, wh = 1.35, t = 0.35;
  const gate = SIDES[Math.floor(rand() * 4)], gm = 0.5 + rand() * 0.4;
  const wall = (a, b, c, d) => { bag.add('plaster_white', box(a, 0, b, c, wh, d)); bag.add('stucco_pale', box(a - 0.04, wh, b - 0.04, c + 0.04, wh + 0.1, d + 0.04)); col.rect([a, b, c, d], 0, wh); };
  for (const f of SIDES) {
    const alongX = f === 'n' || f === 's', a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1, face = f === 'n' ? z0 : f === 's' ? z1 - t : f === 'w' ? x0 : x1 - t;
    const seg = (s0, s1) => (alongX ? wall(s0, face, s1, face + t) : wall(face, s0, face + t, s1));
    if (f === gate) { const m = a0 + (a1 - a0) * gm, g0 = m - 0.9, g1 = m + 0.9; seg(a0, g0); seg(g1, a1); bag.add('timber', alongX ? box(g0 - 0.1, 1.75, face - 0.05, g1 + 0.1, 1.95, face + t + 0.05) : box(face - 0.05, 1.75, g0 - 0.1, face + t + 0.05, 1.95, g1 + 0.1)); } else seg(a0, a1);
  }
  const I = [x0 + t + 0.5, z0 + t + 0.5, x1 - t - 0.5, z1 - t - 0.5];
  // beds in rows
  const rows = Math.max(2, Math.floor((I[3] - I[1] - 5) / 1.6));
  for (let i = 0; i < rows; i++) {
    const z = I[1] + 0.3 + i * 1.6, kind = (i + Math.floor(rand() * 3)) % 4, mat = ['stucco_saffron', 'stucco_red', 'stucco_rose', 'clay_green'][kind];
    bag.add('mud_plaster', box(I[0] + 0.5, 0, z, I[2] - 0.5, 0.16, z + 0.9));
    for (let x = I[0] + 0.9; x < I[2] - 0.7; x += 0.55) {
      bag.add('clay_green', lathe([[0.18, 0], [0.22, 0.1], [0.14, 0.3], [0.001, 0.38]], 7, null, x, 0.14, z + 0.45));
      if (kind < 3) bag.add(mat, lathe([[0.07, 0], [0.09, 0.04], [0.001, 0.1]], 6, null, x + 0.04, 0.5, z + 0.43));
    }
  }
  // the corner granary, a turkey pen, maguey and nopal at the walls
  const gx = x1 - t - 1.5, gz = z1 - t - 1.5;
  carved('mx-yard-granary', (k) => {
    k.bx('andesite', -0.7, 0.7, 0, 0.3, -0.7, 0.7);
    k.geo('mud_plaster', lathe([[0.5, 0], [0.8, 0.5], [0.88, 1.0], [0.7, 1.6], [0.42, 1.85], [0.001, 1.95]], 14).translate(0, 0.3, 0));
    k.geo('thatch', lathe([[0.7, 0], [0.6, 0.12], [0.001, 0.7]], 12).translate(0, 2.1, 0));
  }).m.forEach((list, mat) => list.forEach((g) => (bag.addInstance ? bag.addInstance(mat, g.clone(), new Matrix4().setPosition(gx, 0, gz), { reach: 120 }) : bag.add(mat, place(g.clone(), gx, 0, gz)))));
  col.circle(gx, gz, 0.9, 0, 2.2);
  STYLES.life.elements.chickens({ at: [x0 + t + 2.2, z1 - t - 2.2], y: 0, n: 4, kind: 'turkey', seed: el.seed }, ctx);
  for (let i = 0; i < 6; i++) {
    const f = SIDES[i % 4], alongX = f === 'n' || f === 's', u = 1.5 + rand() * ((alongX ? x1 - x0 : z1 - z0) - 3), out = i < 3;
    if (f === gate && Math.abs(u / ((alongX ? x1 - x0 : z1 - z0)) - gm) < 0.2) continue;
    const base = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, d = (f === 's' || f === 'e' ? 1 : -1) * (out ? 0.9 : -0.9) ;
    const px = alongX ? x0 + u : base + d, pz = alongX ? base + d : z0 + u;
    if (i % 2) nopal(bag, null, px, 0, pz, 0.8 + rand() * 0.5, rand() * 6, i); else maguey(bag, null, px, 0, pz, 0.7 + rand() * 0.5, rand() * 6, i);
  }
  if (rand() < 0.7) mxPeople({ people: [[(x0 + x1) / 2 + (rand() - 0.5) * 4, I[1] + rows * 1.6 + 1.2, 0, rand() * 6.28, rand() < 0.5 ? 'planter' : 'woman', el.seed + 3]] }, ctx);
}
void storeJarKit; void waterJarKit; void bowlsKit; void jarKit;
