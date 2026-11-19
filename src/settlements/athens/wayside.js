// What stands along the visitor's walk in Athens (docs/settlements/athens.md §18): the stalls of the roadside and the Agora's edge with their
// goods and their keepers; the boundary stone of the Agora with its letters; the stelae of decrees; the conical pillars of Apollo Agyieus
// before the doors. Registered into the `greek` style as `athens_stall`, `athens_horos`, `athens_stele`, `athens_agyieus` (the style files are shared).
// The places are rules of the layout (`stallSites`): off the walk by a road's width, clear of everything built, on level ground.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { frame, B } from '../../styles/greek/agora.js';
import { blob } from '../../styles/greek/sculpture.js';
import { vase, leaning } from '../../styles/greek/vessels.js';
import { WALK, walkDist } from './walk.js';
import { KERAMEIKOS, FOUNTAIN, SHOPROW, SIMON, RAMP, height, lots, lotAt, inRect, pathAt } from './layout.js';
import { cfg } from './houses.js';
import { inscribe } from './script.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hashAt = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return k - Math.floor(k); };

/** The trades of the roadside stalls (what is sold, the keeper's dress): [kind, [sold]]. */
export const STALL_KINDS = ['veg', 'cheese', 'wool', 'wine', 'honey', 'lamps', 'sandals', 'wreath'];

// ── the places ────────────────────────────────────────────────────────────────
// what is built in the Agora and along the way (rects and circles): the stalls keep clear of them
const BUILT = [[-252, -237.6, -204, -225], [-292, -197, -273, -150], [-262, -124.89, -219, -110], [-242, -199, -178, -140], SHOPROW, FOUNTAIN, SIMON, KERAMEIKOS, [-248, -216, -232, -200]];
const THOLOS = [-280, -133, 13];
const clear = (x, z, m = 0) => !BUILT.some((r) => inRect(r, x, z, 2.5 + m)) && Math.hypot(x - THOLOS[0], z - THOLOS[1]) > THOLOS[2] + 2 + m && !lotAt(x, z, 2 + m) && pathAt(x, z, RAMP)[0] > 8;

let SITES = null;
/** The stalls: [{ rect, front ('n'|'s'|'e'|'w': toward the walk), kind, y, seed }], by rule along the walk from the ramp's foot to the Dipylon. */
export function stallSites() {
  if (SITES) return SITES;
  SITES = [];
  // the walk from the ramp's foot (index of (-310, 70)) on: the Way
  const from = WALK.findIndex(([x, z]) => x === -310 && z === 70);
  for (let i = from; i + 1 < WALK.length; i++) {
    const a = WALK[i], b = WALK[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L;
    for (let s = 7; s < L - 5; s += 9.5) {
      for (const side of [-1, 1]) {
        const px = a[0] + tx * s, pz = a[1] + tz * s, nx = -tz * side, nz = tx * side;
        if (hashAt(px, pz, side) < 0.3 || pz < -245) continue;                // (to the Agora's far end: beyond it the Way goes out to the Dipylon)
        let r = null, front = 'n', cx = 0, cz = 0;
        for (const off of [7.2, 6.2, 8.8, 10.5, 12.5]) {                       // (as near as the ground and the buildings allow)
          cx = px + nx * off; cz = pz + nz * off;
          const w = 3.2 + hashAt(cx, cz, 2) * 0.8, d = 2.4, alongX = Math.abs(nz) > Math.abs(nx);
          front = alongX ? (nz > 0 ? 'n' : 's') : (nx > 0 ? 'w' : 'e');
          const q = alongX ? [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2] : [cx - d / 2, cz - w / 2, cx + d / 2, cz + w / 2];
          const pts = [[q[0], q[1]], [q[2], q[1]], [q[0], q[3]], [q[2], q[3]], [cx, cz]];
          if (!pts.every(([x, z]) => clear(x, z)) || walkDist(cx, cz) < 5.5) continue;
          const hs = pts.map(([x, z]) => height(x, z));
          if (Math.max(...hs) - Math.min(...hs) > 0.8) continue;
          r = { q, y: Math.min(...hs) }; break;
        }
        if (!r) continue;
        if (SITES.some((o) => Math.hypot((o.rect[0] + o.rect[2]) / 2 - cx, (o.rect[1] + o.rect[3]) / 2 - cz) < 8)) continue;
        SITES.push({ rect: r.q, front, kind: STALL_KINDS[Math.floor(hashAt(cx, cz, 5) * STALL_KINDS.length)], y: r.y, seed: Math.floor(hashAt(cx, cz, 7) * 1e6) });
      }
    }
  }
  return SITES;
}

// ── the stalls ─────────────────────────────────────────────────────────────────
const GOODS = { veg: 'the grocer\'s', cheese: 'the cheese-seller\'s', wool: 'the wool-seller\'s', wine: 'the wine-seller\'s', honey: 'the honey-seller\'s', lamps: 'the lamp-seller\'s', sandals: 'the shoemaker\'s', wreath: 'the garland-seller\'s' };
/** athens_stall: { rect, front, kind, y, seed }: posts and a cloth over the front, a table with the trade's goods, the keeper behind and, by hash, a buyer. */
function stall(el, ctx) {
  const { bag, col } = ctx, F = frame(el.rect, el.front ?? 's'), { L, D } = F, y = el.y ?? 0, R = rng(el.seed ?? 3), kind = el.kind;
  const rr = (u0, v0, u1, v1, y0, y1, m) => B(bag, m, F.R(u0, v0, u1, v1), y + y0, y + y1);
  const cloth = ['cloth_white', 'cloth_ochre', 'linen', 'cloth_red', 'cloth_indigo'][Math.floor(R() * 5)];
  for (const [u, v, h] of [[0, 0, 2.3], [L, 0, 2.3 + R() * 0.05], [0, D, 1.95], [L, D, 1.95]]) rr(u - 0.05, v - 0.05, u + 0.05, v + 0.05, -0.9, h, 'timber');           // (posts and legs run down into the ground: the site may fall a little)
  rr(-0.2, -0.25, L + 0.2, D + 0.1, 2.2, 2.25, cloth);                        // the cloth, a hand's breadth lower at the back is not modelled
  rr(0, D - 0.04, L, D, 0.05, 1.7, kind === 'wool' || kind === 'sandals' ? 'timber' : 'wicker');
  col.rect(F.R(0, D - 0.04, L, D), y, y + 1.7);
  // the table: board and four legs
  const tv0 = 0.2, tv1 = 1.0, tm = kind === 'cheese' || kind === 'veg' ? 'timber' : 'wood_dark';
  rr(0.25, tv0, L - 0.25, tv1, 0.78, 0.84, tm);
  for (const u of [0.35, L - 0.35]) for (const v of [tv0 + 0.08, tv1 - 0.08]) rr(u - 0.04, v - 0.04, u + 0.04, v + 0.04, -0.9, 0.78, tm);
  col.rect(F.R(0.25, tv0, L - 0.25, tv1), y, y + 0.84);
  const ty = y + 0.84, P = (u, v) => F.P(u, v), put = (m, g, u, v, yy = ty) => { const [x, z] = P(u, v); g.translate(x, yy, z); bag.add(m, g); };
  const span = (n, f) => { for (let i = 0; i < n; i++) f(i, 0.5 + i * (L - 1.0) / Math.max(1, n - 1)); };
  if (kind === 'veg') {
    // baskets of onions and cabbages, strings of garlic from the cloth's rail, bunches of greens
    span(4, (i, u) => { put('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.24, 0.22], [0.18, 0.03], [0.001, 0.03]], 9), u, 0.6); for (let k = 0; k < 6; k++) put(i % 2 ? 'stucco_ochre' : 'plaster_white', blob([0, 0.2, 0], 0.07 + R() * 0.02, [1, 0.85, 1], 5), u - 0.12 + (k % 3) * 0.12, 0.52 + Math.floor(k / 3) * 0.14, ty + 0.0); });
    for (let i = 0; i < 3; i++) put('cloth_green', blob([0, 0.12, 0], 0.15, [1, 0.8, 1], 6), 0.6 + i * 0.7, D - 0.5, y);
    for (let i = 0; i < 4; i++) { const u = 0.7 + i * (L - 1.4) / 3, [x, z] = P(u, 0.05); bag.add('rope_fibre', rod([x, y + 2.18, z], [x, y + 1.6, z], 0.006, 3)); for (let k = 0; k < 4; k++) bag.add('plaster_white', blob([x, y + 1.62 + k * 0.13, z], 0.045, [1, 1.2, 1], 5)); }
  } else if (kind === 'cheese') {
    span(5, (i, u) => put(['plaster_white', 'stucco_siena', 'plaster_white'][i % 3], lathe([[0.13, 0], [0.14, 0.05], [0.12, 0.09], [0.001, 0.09]], 9), u, 0.45 + (i % 2) * 0.28));
    span(3, (i, u) => put('wicker', lathe([[0.1, 0], [0.12, 0.08], [0.11, 0.1], [0.001, 0.1]], 8), u + 0.2, 0.8));
    for (let i = 0; i < 3; i++) vase(bag, 'oinochoe', P(0.7 + i * 0.7, D - 0.5)[0], y, P(0.7 + i * 0.7, D - 0.5)[1], { s: 1.15, dark: false, seg: 9 });
  } else if (kind === 'wool') {
    // fleeces over a rail, hanks of dyed wool on the table, spindles with their whorls
    for (let i = 0; i < 4; i++) { const u = 0.6 + i * (L - 1.2) / 3; put(['linen', 'hide_white', 'linen', 'hide_grey'][i], blob([0, 0, 0], 0.28, [1.1, 0.35, 1], 6), u, D - 0.5, y + 1.25); }
    rr(0.2, D - 0.55, L - 0.2, D - 0.5, 1.1, 1.14, 'timber');
    span(5, (i, u) => put(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'linen', 'cloth_brown'][i], lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.1], [0.07, 0.15], [0.001, 0.16]], 8), u, 0.5 + (i % 2) * 0.25));
    for (let i = 0; i < 3; i++) { const [x, z] = P(0.5 + i * 0.4, 0.9); bag.add('wood_dark', rod([x, ty, z], [x + 0.02, ty + 0.3, z], 0.006, 3)); bag.add('terracotta', lathe([[0.03, 0], [0.001, 0.015]], 8, null, x + 0.01, ty + 0.08, z)); }
  } else if (kind === 'wine') {
    // wineskins hung from the cloth's rail, amphorae leaning behind, a mixing bowl and a ladle on the table
    for (let i = 0; i < 3; i++) { const [x, z] = P(0.8 + i * (L - 1.6) / 2, 0.15); bag.add('rope_fibre', rod([x, y + 2.18, z], [x, y + 1.78, z], 0.006, 3)); bag.add('hide_brown', blob([x, y + 1.5, z], 0.2, [0.7, 1.25, 0.7], 7)); }
    { const [x, z] = P(0.5, D - 0.5), [dx, dz] = F.along; leaning(bag, x, y, z, Math.max(3, Math.floor((L - 0.8) / 0.4)), dx * 0.4, dz * 0.4, { tilt: 0.13, rot: Math.atan2(F.out[0], F.out[1]), s: 1, dark: false }); }
    { const [x, z] = P(L / 2, 0.6); vase(bag, 'krater', x, ty, z, { s: 0.8, seg: 10 }); const [x2, z2] = P(L / 2 + 0.55, 0.55); vase(bag, 'kylix', x2, ty, z2, { s: 1.2, seg: 8 }); vase(bag, 'kylix', x2 + 0.15, ty, z2 + 0.1, { s: 1.2, seg: 8 }); }
  } else if (kind === 'honey') {
    // the jars of Hymettos honey, sealed with cloth and cord, and a little comb on a dish
    span(7, (i, u) => { const [x, z] = P(u, 0.4 + (i % 2) * 0.3); vase(bag, 'oinochoe', x, ty, z, { s: 0.55, dark: false, seg: 8 }); bag.add('cloth_ochre', lathe([[0.001, 0.19], [0.045, 0.17], [0.04, 0.155], [0.001, 0.165]], 7, null, x, ty, z)); });
    for (let i = 0; i < 3; i++) vase(bag, 'pithos', P(0.6 + i * 0.8, D - 0.5)[0], y, P(0.6 + i * 0.8, D - 0.5)[1], { s: 0.45, seg: 9 });
  } else if (kind === 'lamps') {
    // the clay lamps in rows on tiers, plain and black-glazed, a few with their wicks; oil in a flask beside
    for (let tier = 0; tier < 2; tier++) span(7, (i, u) => { const [x, z] = P(u, 0.35 + tier * 0.38), m = (i + tier) % 3 ? 'terracotta' : 'pottery_dark'; bag.add(m, lathe([[0.001, 0], [0.04, 0], [0.065, 0.02], [0.06, 0.035], [0.025, 0.04], [0.001, 0.035]], 8, null, x, ty + tier * 0.14, z)); bag.add(m, box(x + 0.05, ty + tier * 0.14 + 0.012, z - 0.012, x + 0.1, ty + tier * 0.14 + 0.035, z + 0.012)); });
    rr(0.3, 0.7, L - 0.3, 0.74, 0.92, 0.96, 'timber');
    for (let i = 0; i < 3; i++) vase(bag, 'lekythos', P(L - 0.5 - i * 0.2, 0.3)[0], ty, P(L - 0.5 - i * 0.2, 0.3)[1], { s: 0.9, seg: 8 });
  } else if (kind === 'sandals') {
    // sandals and boots by the pair on a board and a peg rail, the hides they are cut from, the shoemaker's knife
    span(5, (i, u) => { const [x, z] = P(u, 0.55); bag.add('hide_tan', box(x - 0.1, ty, z - 0.04, x + 0.1, ty + 0.02, z + 0.04)); bag.add('hide_brown', box(x - 0.1, ty + 0.02, z - 0.012, x + 0.04, ty + 0.03, z + 0.012)); });
    for (let i = 0; i < 4; i++) { const [x, z] = P(0.5 + i * (L - 1) / 3, D - 0.12); bag.add('hide_brown', blob([x, y + 1.35, z], 0.2, [0.6, 1.2, 0.18], 6)); }
    { const [x, z] = P(L - 0.5, 0.9); bag.add('iron', box(x - 0.1, ty, z - 0.012, x + 0.1, ty + 0.01, z + 0.012)); }
  } else {
    // wreaths of myrtle and ivy on pegs, ribbons, and the little clay figures of the pilgrims' offering on the table
    for (let i = 0; i < 5; i++) { const [x, z] = P(0.55 + i * (L - 1.1) / 4, D - 0.2); bag.add('lotus_leaf', lathe([[0.17, 0], [0.2, 0.03], [0.17, 0.06], [0.14, 0.03]], 10).rotateX(Math.PI / 2).translate(x, y + 1.3, z)); }
    span(6, (i, u) => { const [x, z] = P(u, 0.55 + (i % 2) * 0.2); bag.add('terracotta', lathe([[0.001, 0], [0.04, 0], [0.032, 0.08], [0.02, 0.11], [0.03, 0.15], [0.001, 0.16]], 7, null, x, ty, z)); });
    span(3, (i, u) => { const [x, z] = P(u, 0.85); bag.add('cloth_red', box(x - 0.1, ty, z - 0.03, x + 0.1, ty + 0.008, z + 0.03)); });
  }
  // the keeper behind the table, a buyer before it
  const fig = STYLES.life?.elements?.figure;
  if (fig) {
    const toOut = Math.atan2(-F.out[0], -F.out[1]), toIn = Math.atan2(F.out[0], F.out[1]), man = kind !== 'wool' && kind !== 'wreath' && kind !== 'honey';
    const su = L / 2 + (R() - 0.5) * 0.6, [sx, sz] = P(su, 1.6), cl = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'linen', 'cloth_red'];
    fig({ t: 'figure', at: [sx, sz], y, rot: toOut, seed: el.seed ?? 3, pose: 'stand', dress: man ? 'tunic' : 'robe', cloth: cl[Math.floor(R() * 5)], skin: man ? 'skin_medium' : 'skin_light', hat: man && R() < 0.4 ? 'cap' : 'none', ...(man ? { legs: 'bare', over: 'belt', beard: 0.8, feet: 'bare' } : { over: 'shawl', hair: 'bun' }) }, ctx);
    if (R() < 0.6) { const [bx, bz] = P(L * (0.3 + R() * 0.4), -0.8); fig({ t: 'figure', at: [bx, bz], y, rot: toIn, seed: (el.seed ?? 3) + 9, pose: R() < 0.4 ? 'talk' : 'stand', dress: 'robe', cloth: cl[Math.floor(R() * 5)], skin: 'skin_medium', hat: 'none' }, ctx); }
  }
  void GOODS;
}

// ── the boundary stone ────────────────────────────────────────────────────────
/**
 * athens_horos: { at, rot, y } — the boundary stone of the Agora: a narrow pillar of Parian marble with the letters ΗΟΡΟΣ ΕΙΜΙ ΤΕΣ ΑΓΟΡΑΣ in a
 * single column down its face, one letter above another, painted red (the stone, of about 500 BC, "I am the boundary of the Agora").
 */
function horos(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const W = (u, w) => [x + c * u + s * w, z - s * u + c * w];         // local u (across), w (out of the face) -> world
  const hw = 0.19, hd = 0.12, top = 1.22;
  const corners = [W(-hw, -hd), W(hw, -hd), W(hw, hd), W(-hw, hd)], xs = corners.map((p) => p[0]), zs = corners.map((p) => p[1]);
  bag.add('marble_smooth', box(Math.min(...xs), y - 0.3, Math.min(...zs), Math.max(...xs), y + top, Math.max(...zs)));
  const n = [s, c];                                                    // the face's outward normal (the local +w)
  const [fx, fz] = W(0, hd);
  const text = 'ΗΟΡΟΣΕΙΜΙΤΕΣΑΓΟΡΑΣ';                                     // (the stops between the words that the stone may have are not drawn)
  const lines = [...text];
  inscribe(bag, lines, { at: [fx, fz], n, y: y + top - 0.04, h: 0.05, line: 1.32, mat: 'wall_red' });
  col.circle(x, z, 0.28, y, y + top);
}

// ── the stele of a decree ───────────────────────────────────────────────────────
/** athens_stele: { at, rot, y, h (the shaft, 1.7 m) } — a marble slab on a limestone base, a palmette on its crown, the heading of a decree cut across its top. */
function stele(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), H = el.h ?? 1.7, w = el.w ?? 0.52, th = 0.13;
  const W = (u, v) => [x + c * u + s * v, z - s * u + c * v];
  const rect = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1), q = W(u0, v1), r = W(u1, v0), X = [a[0], b[0], q[0], r[0]], Z = [a[1], b[1], q[1], r[1]]; return [Math.min(...X), Math.min(...Z), Math.max(...X), Math.max(...Z)]; };
  const bx = (u0, v0, u1, v1, y0, y1, m) => { const r = rect(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
  bx(-w / 2 - 0.15, -0.28, w / 2 + 0.15, 0.28, -0.2, 0.2, 'limestone');
  bx(-w / 2, -th, w / 2, th, 0.2, 0.2 + H, 'marble_smooth');                     // (one slab: no joints)
  bx(-w / 2 - 0.03, -th - 0.02, w / 2 + 0.03, th + 0.02, 0.2 + H, 0.2 + H + 0.07, 'marble_smooth');           // the crown's moulding
  // the palmette over the crown: a fan of seven leaves in the plane of the face, a volute at each side of its root
  for (let k = -3; k <= 3; k++) {
    const al = k * 0.36, [x0, z0] = W(0, 0), [x1, z1] = W(Math.sin(al) * 0.24, 0), base = y + 0.27 + H, top = base + Math.cos(al) * 0.26 + 0.04 - Math.abs(k) * 0.015;
    bag.add('marble_smooth', rod([x0, base, z0], [x1, top, z1], 0.022, 5)); bag.add('marble_smooth', blob([x1, top + 0.01, z1], 0.03, [0.8, 1.4, 0.4], 5));
  }
  for (const sg of [-1, 1]) { const [qx, qz] = W(sg * 0.14, 0), [rx, rz] = W(sg * 0.2, 0); bag.add('marble_smooth', rod([qx, y + 0.28 + H, qz], [rx, y + 0.34 + H, rz], 0.02, 5)); bag.add('marble_smooth', blob([rx, y + 0.34 + H, rz], 0.035, [1, 1, 0.5], 5)); }
  const n = [s, c], [fx, fz] = W(0, th + 0.02);
  inscribe(bag, el.lines ?? ['ΕΔΟΧΣΕΝ', 'ΤΕΙ ΒΟΛΕΙ', 'ΚΑΙ ΤΟΙ ΔΕΜΟΙ', 'ΑΚΑΜΑΝΤΙΣ', 'ΕΠΡΥΤΑΝΕΥΕ'], { at: [fx, fz], n, y: y + 0.2 + H - 0.1, h: el.letter ?? 0.042, line: 1.45, mat: 'wall_red', stoichedon: el.stoichedon ?? 0 });
  col.rect(rect(-w / 2 - 0.15, -0.28, w / 2 + 0.15, 0.28), y, y + 0.2 + H + 0.3);
}

// ── Apollo Agyieus ──────────────────────────────────────────────────────────────
/** athens_agyieus: { at, y } — the conical pillar of Apollo Agyieus before a door: a tapering stone on a small base, a fillet of wool tied round it. */
function agyieus(el, { bag, col }) {
  // six shapes by the place's hash (height, belly, segments), so that none repeats twelve times and nothing is made as a copy
  const [x, z] = el.at, y = el.y ?? 0, k = Math.floor(hashAt(x, z, 3) * 6), h = 1.05 + 0.05 * k, w = 0.15 + 0.008 * (k % 3), seg = 8 + (k % 3);
  bag.add('limestone', lathe([[0.001, 0], [0.26, 0], [0.26, 0.08], [0.22, 0.08], [0.2, 0.1], [0.001, 0.1]], seg, null, x, y, z));
  bag.add('marble', lathe([[0.001, 0.1], [w + 0.02, 0.1], [w - 0.03, h * 0.6], [0.06, h * 0.92], [0.001, h]], seg, null, x, y, z));
  bag.add('cloth_red', lathe([[w, 0.55], [w + 0.005, 0.6], [w - 0.005, 0.62], [w - 0.01, 0.58]], seg, null, x, y, z));
  col.circle(x, z, 0.24, y, y + h);
}

/** athens_clear: { rect } — nothing is built; the street-life pass reads its rect as a footprint (plan.js keeps the routes clear with it). */
const clear_ = () => {};
Object.assign(STYLES.greek.elements, { athens_stall: stall, athens_horos: horos, athens_stele: stele, athens_agyieus: agyieus, athens_clear: clear_ });

/** The stelae of decrees: [{ at, rot, y, lines }], by the Agora's ways and at the summit's gate; each turned toward the nearest point of the walk. */
export function steleSites() {
  const out = [], face = (x, z) => {
    let best = null;
    for (let i = 0; i + 1 < WALK.length; i++) {
      const a = WALK[i], b = WALK[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))), qx = a[0] + dx * t, qz = a[1] + dz * t, d = Math.hypot(qx - x, qz - z);
      if (!best || d < best.d) best = { d, qx, qz };
    }
    return Math.atan2(best.qx - x, best.qz - z);
  };
  const cand = [[-100, 8], [-100, -9]];
  for (let z = -225; z < -105; z += 17) { const wx = -180 + 0.5 * (z + 60); for (const side of [-1, 1]) cand.push([wx + side * 6.5 + 0.7 * Math.sin(z), z + 3]); }
  for (const [x, z] of cand) {
    if (!clear(x, z, -1.5) || (z > -50 && Math.abs(z) > 14)) continue;
    if (out.some((q) => Math.hypot(q.at[0] - x, q.at[1] - z) < 13)) continue;
    out.push({ at: [x, z], rot: face(x, z), y: height(x, z), seed: Math.floor(hashAt(x, z, 4) * 1e6) });
    if (out.length >= 7) break;
  }
  return out;
}

/**
 * Where a walk-in house's street door, its dog's place and its court are, for the `n` houses nearest the walk: { l, door, dog, court, out }.
 * The Agyieus pillar stands left of the door, the dog on the other side; the court's middle is where the hens scratch (fauna.js).
 */
export function houseSpots(n = 10) {
  return lots().filter((l) => l.open && l.kind && l.kind !== 'simon').sort((a, b) => walkDist(a.rect[0], a.rect[1]) - walkDist(b.rect[0], b.rect[1])).slice(0, n).map((l) => {
    const F = frame(l.rect, l.front), C = cfg(l.kind, F.L, l.seed), pc = C.front.find((c) => c.k === 'passage'), um = (pc.u0 + pc.u1) / 2;
    return { l, door: F.P(um - 1.35, -0.7), dog: F.P(um + 1.6, -1.1), court: F.P(F.L / 2 + ((l.seed % 5) - 2) * 0.5, (C.FR + F.D - C.RD - C.PD) / 2), out: F.out };
  });
}
