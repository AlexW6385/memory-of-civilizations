// The dressing of Nan Madol's islets at eye level (docs/settlements/nan-madol.md §6–§8, §11): the yards of the nahs (drying racks of
// breadfruit and copra, nets on poles, mats on lines, pounding boards, coconut heaps, pig pens, log stacks, boundary walls of coral
// stones), the works of the special islets (the canoe builders' shed, the coconut-oil works, the long cook-shed, the walled tomb
// court, the food landing's store), moss and salt on the islets' retaining walls, mooring posts, fish weirs in the canals.
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { rng, laid, cribWall, ROCK } from './crib.js';
import { plants } from './plants.js';

const WOOD = 'palm_trunk', TH = 'thatch_palm', ROPE = 'rope_fibre';
/** A frame at (c, yaw); child frames hang off it. W maps local (u, v) to the plan; M places geometry. */
function frame(c, yaw, parent = null) {
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const W = (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca];
  return { W, M: new Matrix4().makeRotationY(yaw).setPosition(c[0], 0, c[1]), parent };
}
const child = (F, u, v, rot) => { const c = F.W(u, v); return frame(c, (F.yaw ?? 0) + rot, F); };
function mk(c, yaw) { const F = frame(c, yaw); F.yaw = yaw; return F; }
const sub = (F, u, v, rot) => { const c = F.W(u, v), G = frame(c, (F.yaw ?? 0) + rot); G.yaw = (F.yaw ?? 0) + rot; return G; };
void child;
const rectOf = (F, u0, v0, u1, v1) => { const a = F.W(u0, v0), b = F.W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
const dirOf = (yaw) => { const dx = Math.round(Math.sin(yaw)), dz = Math.round(Math.cos(yaw)); return dz > 0 ? 's' : dz < 0 ? 'n' : dx > 0 ? 'e' : 'w'; };
const coconut = (r = 0.12) => lathe([[0.001, 0], [r * 0.8, r * 0.3], [r, r * 0.9], [r * 0.8, r * 1.6], [0.001, r * 1.9]], 6);

/** Drying rack: 4 posts, slatted bed 1.1 m up, goods (breadfruit slices, copra) laid out. */
function rack(bag, col, F, u, v, rot, rand, len = 1.9, wid = 0.9) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  for (const x of [-len / 2, len / 2]) for (const z of [-wid / 2, wid / 2]) put(WOOD, lathe([[0.05, 0], [0.045, 1.1]], 6, null, x, 0, z));
  for (let z = -wid / 2; z <= wid / 2 + 1e-6; z += wid / 4) put('bamboo_culm', box(-len / 2 - 0.05, 1.1, z - 0.03, len / 2 + 0.05, 1.16, z + 0.03));
  for (let x = -len / 2; x < len / 2; x += 0.14) put('timber', box(x, 1.16, -wid / 2, x + 0.03, 1.19, wid / 2));
  const goods = rand() < 0.5 ? 'chalk' : 'cloth_ochre';
  for (let i = 0; i < 9; i++) put(goods, box(-len / 2 + 0.1 + rand() * (len - 0.3), 1.19, -wid / 2 + 0.1 + rand() * (wid - 0.3), -len / 2 + 0.3 + rand() * (len - 0.3), 1.22, 0));
  const a = G.W(-len / 2, 0), b = G.W(len / 2, 0);
  col.segment(a, b, wid, 0, 1.25);
}
/** A net hung between two poles, floats of light wood along its top. */
function net(bag, col, F, u, v, rot, rand) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  const L = 1.5 + rand() * 0.6;
  for (const x of [-L / 2, L / 2]) put(WOOD, lathe([[0.04, 0], [0.035, 2.3]], 6, null, x, 0, 0));
  put('timber', box(-L / 2, 2.1, -0.015, L / 2, 2.14, 0.015));
  put(ROPE, box(-L / 2 + 0.03, 1.15, -0.012, L / 2 - 0.03, 2.1, 0.012));
  for (let x = -L / 2 + 0.15; x < L / 2; x += 0.3) put('bark_dark', lathe([[0.001, 0], [0.05, 0.04], [0.001, 0.1]], 5, null, x, 1.15, 0));
  const a = G.W(-L / 2, 0), b = G.W(L / 2, 0);
  col.segment(a, b, 0.15, 0, 2.2);
}
/** Mats and bark-cloth on a pole between two posts. */
function matline(bag, col, F, u, v, rot, rand) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  const L = 1.6;
  for (const x of [-L / 2, L / 2]) put(WOOD, lathe([[0.04, 0], [0.035, 1.7]], 6, null, x, 0, 0));
  put('timber', box(-L / 2, 1.62, -0.015, L / 2, 1.66, 0.015));
  const c = ['reed_mat', 'cloth_white', 'cloth_ochre', 'reed_mat'];
  let x = -L / 2 + 0.1;
  while (x < L / 2 - 0.3) { const w = 0.35 + rand() * 0.35; put(c[Math.floor(rand() * 4)], box(x, 0.75 + rand() * 0.2, -0.02, Math.min(x + w, L / 2 - 0.05), 1.62, 0.02)); x += w + 0.04; }
  const a = G.W(-L / 2, 0), b = G.W(L / 2, 0);
  col.segment(a, b, 0.12, 0, 1.7);
}
/** A breadfruit pounding board of basalt on logs with a pestle and a wooden bowl. */
function pounding(bag, col, F, u, v, rot, rand) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  put('basalt', box(-0.55, 0, -0.3, -0.35, 0.18, 0.3)); put('basalt', box(0.35, 0, -0.3, 0.55, 0.18, 0.3));
  put('granite_black', box(-0.7, 0.18, -0.34, 0.7, 0.28, 0.34));
  put('basalt', lathe([[0.04, 0], [0.07, 0.1], [0.05, 0.45]], 6).rotateZ(Math.PI / 2 - 0.3).translate(0.1, 0.33, 0.05));
  put('bark_dark', lathe([[0.001, 0], [0.16, 0.01], [0.2, 0.12], [0.001, 0.12]], 8, null, 1.0, 0, 0.1));
  put('cloth_green', coconut(0.1).translate(-0.3, 0.28, -0.1)); put('cloth_green', coconut(0.1).translate(-0.1, 0.28, 0.15));
  const a = G.W(-0.7, 0), b = G.W(0.7, 0);
  col.segment(a, b, 0.7, 0, 0.3);
  void rand;
}
/** A heap of coconuts (some husked) and husks. */
function nutheap(bag, col, F, u, v, rot, rand) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  for (let i = 0; i < 14; i++) { const a = rand() * 6.28, d = rand() * 0.55, h = Math.max(0, 0.3 - d * 0.4) * rand(); put(i % 3 ? 'bark_dark' : 'cloth_green', coconut(0.11).translate(Math.cos(a) * d, h, Math.sin(a) * d)); }
  for (let i = 0; i < 5; i++) put('timber', lathe([[0.04, 0], [0.04, 0.4]], 5).rotateZ(Math.PI / 2).rotateY(rand() * 3).translate(0.5 + rand() * 0.3, 0.05, rand() * 0.8 - 0.4));
  const c = G.W(0, 0); col.circle(c[0], c[1], 0.55, 0, 0.3);
}
/** A pen for pigs: stakes with rails, 2.4 m square, a trough. */
function pen(bag, col, F, u, v, rot, rand, side = 2.4) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  const h = side / 2;
  for (let t = -h; t <= h + 1e-6; t += 0.4) for (const [x, z] of [[t, -h], [t, h], [-h, t], [h, t]]) put('timber', lathe([[0.035, 0], [0.03, 0.95]], 5, null, x, 0, z));
  for (const y of [0.35, 0.7]) { put('timber', box(-h, y, -h - 0.02, h, y + 0.04, -h + 0.02)); put('timber', box(-h, y, h - 0.02, h, y + 0.04, h + 0.02)); put('timber', box(-h - 0.02, y, -h, -h + 0.02, y + 0.04, h)); put('timber', box(h - 0.02, y, -h, h + 0.02, y + 0.04, h)); }
  put('bark_dark', box(-0.5, 0, h - 0.6, 0.5, 0.2, h - 0.25));
  put('silt', box(-h + 0.05, 0, -h + 0.05, h - 0.05, 0.03, h - 0.05));
  for (const [a, b] of [[[-h, -h], [h, -h]], [[-h, h], [h, h]], [[-h, -h], [-h, h]], [[h, -h], [h, h]]]) col.segment(G.W(a[0], a[1]), G.W(b[0], b[1]), 0.1, 0, 1.0);
  void rand;
}
/** Logs for canoes and posts, stacked. */
function logs(bag, col, F, u, v, rot, rand, len = 2.6) {
  const G = sub(F, u, v, rot), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); };
  for (const [z, y] of [[-0.3, 0.14], [0, 0.14], [0.3, 0.14], [-0.15, 0.4], [0.15, 0.4]]) put(rand() < 0.5 ? WOOD : 'bark_dark', lathe([[0.13, 0], [0.12, len]], 7).rotateZ(Math.PI / 2).translate(-len / 2, y, z));
  col.segment(G.W(-len / 2, 0), G.W(len / 2, 0), 0.9, 0, 0.6);
}
/** A low wall of coral stones round part of a yard (0.5 m high), open at the ends. */
function stonewall(bag, col, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  if (L < 0.8) return;
  const ux = dx / L, uz = dz / L, nx = -uz, nz = ux;
  const p = (s, t) => [a[0] + ux * s + nx * t, a[1] + uz * s + nz * t];
  const q0 = p(0, -0.22), q1 = p(L, 0.22);
  bag.add('coral_rag', box(Math.min(q0[0], q1[0]), 0, Math.min(q0[1], q1[1]), Math.max(q0[0], q1[0]), 0.38, Math.max(q0[1], q1[1])));
  // a capping course of dark columns laid along it
  for (let s = 0.1; s < L - 0.4; s += 1.1) { const q = p(s, 0); laid(bag, 'granite_black', Math.min(1.0, L - s - 0.1), q[0], 0.4, q[1], ux, uz, 90, 0.09); }
  col.segment(a, b, 0.45, 0, 0.5);
}

/**
 * yard { c, yaw, w, l, depth, rank, seed }: the dressing of one nah: its front steps, coconut bunches and leaned poles; at its side
 * a net or a line of mats; behind it (depth metres to the islet's edge margin) a boundary wall, racks, a pounding board, nuts, a pen.
 */
export function yard(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), F = mk(el.c, el.yaw ?? 0), { w, l } = el, D = el.depth ?? 4, ph = el.rank ? 0.7 : 0.45;
  const put = (m, g) => { g.applyMatrix4(F.M); bag.add(m, g); };
  // front: steps of stone, bunches hung under the beam, a paddle and a spear leaned at the posts, a woven bag
  if (!el.rank) {
    put('granite_black', box(-0.55, 0, -l / 2 - 0.5, 0.55, 0.22, -l / 2 - 0.12));
    col.floor(rectOf(F, -0.55, -l / 2 - 0.5, 0.55, -l / 2 - 0.12), 0.22);
  }
  const nb = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < nb; i++) { const x = -w / 2 + 0.6 + rand() * (w - 1.2); put(ROPE, rod([x, 1.95, -l / 2 + 0.2], [x, 1.5, -l / 2 + 0.2], 0.012, 4)); for (let k = 0; k < 4; k++) put(k % 2 ? 'bark_dark' : 'cloth_green', coconut(0.09).translate(x + (k - 1.5) * 0.06, 1.28 + (k % 2) * 0.08, -l / 2 + 0.2)); }
  if (rand() < 0.6) { const x = (rand() < 0.5 ? -1 : 1) * (w / 2 - 0.1); put('timber', rod([x, ph, -l / 2 - 0.1], [x + 0.1, ph + 2.0, -l / 2 + 0.05], 0.025, 5)); put('timber', box(x + 0.04, ph + 1.2, -l / 2 - 0.15, x + 0.16, ph + 1.8, -l / 2 - 0.12)); }
  if (rand() < 0.5) put('wicker', lathe([[0.001, 0], [0.14, 0.04], [0.16, 0.22], [0.001, 0.26]], 7, null, -w / 2 + 0.5, ph, -l / 2 - 0.05 + 0.4));
  // the side gap between houses: a net or a mat line, a leaned log (thin things only)
  const r = rand();
  if (r < 0.35) net(bag, col, F, w / 2 + 0.55, 0.2, Math.PI / 2, rand);
  else if (r < 0.65) matline(bag, col, F, -w / 2 - 0.55, 0.0, Math.PI / 2, rand);
  // behind the nah
  const v0 = l / 2 + 1.1, room = D - 0.6;
  if (room > 2) {
    if (rand() < 0.45) {
      // a boundary wall of coral stones behind and along the sides, open toward the neighbours' end
      const e = Math.min(room, 5.5) + l / 2;
      stonewall(bag, col, F.W(-w / 2 - 0.3, l / 2 + e - l / 2 + 0.2), F.W(w / 2 + 0.3, l / 2 + e - l / 2 + 0.2));
      if (rand() < 0.6) stonewall(bag, col, F.W(-w / 2 - 0.3, l / 2 + 1.0), F.W(-w / 2 - 0.3, l / 2 + e - l / 2 + 0.2));
    }
    const kinds = ['rack', 'pound', 'nuts', 'pen', 'logs', 'rack2'];
    const n = 1 + (room > 4 ? 1 : 0) + (room > 7 ? 1 : 0);
    let vv = v0 + 0.6;
    for (let i = 0; i < n; i++) {
      const k = kinds[Math.floor(rand() * kinds.length)], uu = (rand() - 0.5) * (w - 1.8);
      if (k === 'pen') { if (room < 4.4 || vv + 2.4 > v0 + room) continue; pen(bag, col, F, uu, vv + 1.2, 0, rand); vv += 2.8; }
      else if (k === 'rack' || k === 'rack2') { rack(bag, col, F, uu, vv + 0.5, rand() < 0.5 ? 0 : Math.PI / 2, rand); vv += 1.5; }
      else if (k === 'pound') { pounding(bag, col, F, uu, vv + 0.4, rand() * 0.5, rand); vv += 1.1; }
      else if (k === 'nuts') { nutheap(bag, col, F, uu, vv + 0.5, rand() * 3, rand); vv += 1.2; }
      else { logs(bag, col, F, uu, vv + 0.5, rand() * 0.4, rand); vv += 1.1; }
      if (vv > v0 + room - 0.8) break;
    }
  }
}

// ── the works of the special islets ──────────────────────────────────────────────────────────────
/** A long open shed: posts, ridge and a hip roof of palm thatch, nothing in its walls. */
function shed(bag, col, F, L, Wd, h = 2.7, floor = 0) {
  const put = (m, g) => { g.applyMatrix4(F.M); bag.add(m, g); };
  const nx = Math.max(2, Math.round(L / 3.2) + 1);
  for (let i = 0; i < nx; i++) for (const z of [-Wd / 2, Wd / 2]) { const x = -L / 2 + i * L / (nx - 1); put(WOOD, lathe([[0.09, 0], [0.08, h]], 7, null, x, floor, z)); const p = F.W(x, z); col.circle(p[0], p[1], 0.11, floor, floor + h); }
  put('timber', box(-L / 2 - 0.1, floor + h - 0.05, -Wd / 2 - 0.08, L / 2 + 0.1, floor + h + 0.1, -Wd / 2 + 0.08));
  put('timber', box(-L / 2 - 0.1, floor + h - 0.05, Wd / 2 - 0.08, L / 2 + 0.1, floor + h + 0.1, Wd / 2 + 0.08));
  for (let i = 0; i < nx; i++) { const x = -L / 2 + i * L / (nx - 1); put('timber', box(x - 0.06, floor + h - 0.1, -Wd / 2, x + 0.06, floor + h + 0.02, Wd / 2)); }
  const rise = Wd * 0.62, ov = 1.0;
  put(TH, frustum([-L / 2 - ov, -Wd / 2 - ov, L / 2 + ov, Wd / 2 + ov], floor + h - 0.3, floor + h + rise, Wd / 2 + ov - 0.2 + (L - Wd) * 0, Wd / 2 + ov - 0.2, Wd / 2 + ov - 0.2, Wd / 2 + ov - 0.2));
  put(TH, box(-L / 2 + Wd / 2 - 0.2, floor + h + rise - 0.02, -0.18, L / 2 - Wd / 2 + 0.2, floor + h + rise + 0.2, 0.18));
  // rafters seen from below
  for (const s of [-1, 1]) for (let i = 0; i < nx * 2; i++) { const x = -L / 2 + i * L / (nx * 2 - 1); put('timber', rod([x, floor + h + 0.05, s * Wd / 2], [x, floor + h + rise - 0.05, s * 0.1], 0.025, 4)); }
}
/**
 * works { kind, c, yaw, l, w, seed }: kinds shipyard (a canoe hull on stocks under a shed, adze chips, logs, rope), oilworks (a rack of copra,
 * a grating bench, hanging presses of fibre, nut heaps, bamboo tubes), cookshed (a shed over four earth ovens, hot stones, leaf piles, firewood),
 * landing (a store shed with heaped baskets and yams, mats, poles), hall (the chief's assembly: a raised platform under a great roof, mats).
 */
export function works(el, { bag, col, lights }) {
  const rand = rng(el.seed ?? 5), F = mk(el.c, el.yaw ?? 0), put = (m, g) => { g.applyMatrix4(F.M); bag.add(m, g); };
  const L = el.l ?? 14, Wd = el.w ?? 6;
  if (el.kind === 'drift') {
    // beach litter on the sea wall's islets: a bleached log, coral lumps, a few shells
    put('timber', lathe([[0.1, 0], [0.08, 2.2 + rand() * 1.5]], 6).rotateZ(Math.PI / 2).translate(0, 0.1, 0));
    for (let i = 0; i < 4; i++) put('coral', lathe([[0.001, 0], [0.18, 0.05], [0.12, 0.16], [0.001, 0.2]], 6, null, rand() * 2 - 1, 0, rand() * 1.4 - 0.7));
    put('chalk', lathe([[0.001, 0], [0.06, 0.02], [0.001, 0.05]], 6, null, 0.5, 0, 0.3));
  } else if (el.kind === 'shipyard') {
    shed(bag, col, F, L, Wd, 3.0);
    // the hull on stocks: a log dug out, nearly finished, its inside scooped; a second hull begun
    for (const [z, len, done] of [[-1.3, L - 3, 1], [1.5, L * 0.55, 0.4]]) {
      const hw = 0.42 * (0.6 + done * 0.4);
      for (const x of [-len * 0.3, len * 0.3]) put('timber', box(x - 0.1, 0, z - 0.5, x + 0.1, 0.3, z + 0.5));
      put('wood_dark', box(-len / 2, 0.3, z - hw, len / 2, 0.75, z + hw));
      put('timber', box(-len / 2 + 0.2, 0.7, z - hw * 0.5, len / 2 - 0.2, 0.78, z + hw * 0.5));
    }
    for (let i = 0; i < 12; i++) { const x = -L / 2 + rand() * L, z = -Wd / 2 - 0.5 + rand() * (Wd + 1); put('timber', box(x, 0, z, x + 0.25, 0.04, z + 0.12)); }
    for (let i = 0; i < 3; i++) logs(bag, col, F, -L / 2 + 2 + i * 4, Wd / 2 + 2.0, 0.05 * i, rand, 3.2);
    put(ROPE, lathe([[0.3, 0], [0.3, 0.12]], 10, null, L / 2 - 1.2, 0, Wd / 2 + 1.0));
  } else if (el.kind === 'oilworks') {
    shed(bag, col, F, L, Wd, 2.6);
    rack(bag, col, F, -L / 4, Wd / 2 + 2.0, 0, rand, 3.4, 1.4);
    rack(bag, col, F, L / 4, Wd / 2 + 2.0, 0, rand, 3.4, 1.4);
    for (const x of [-L / 4, L / 4]) {
      // a press: two posts with a long lever, a fibre bag hung under it, a trough below
      put(WOOD, lathe([[0.07, 0], [0.06, 2.2]], 6, null, x - 0.5, 0, 0)); put(WOOD, lathe([[0.07, 0], [0.06, 2.2]], 6, null, x + 0.5, 0, 0));
      put('timber', rod([x - 0.5, 1.9, 0], [x + 1.8, 2.3, 0], 0.05, 6));
      put(ROPE, lathe([[0.001, 0], [0.18, 0.1], [0.2, 0.35], [0.1, 0.6], [0.04, 0.7]], 7, null, x + 0.3, 1.25, 0));
      put('bark_dark', box(x - 0.1, 0.0, -0.3, x + 0.7, 0.25, 0.3));
      col.circle(...F.W(x, 0), 0.9, 0, 1.5);
    }
    put('timber', box(-1.5, 0.4, -Wd / 2 + 0.4, 1.5, 0.48, -Wd / 2 + 0.9));
    for (const x of [-1.3, 1.3]) put(WOOD, lathe([[0.05, 0], [0.05, 0.4]], 5, null, x, 0, -Wd / 2 + 0.65));
    for (let i = 0; i < 4; i++) put('bamboo_culm', lathe([[0.04, 0], [0.04, 0.9]], 6, null, -0.7 + i * 0.35, 0.48, -Wd / 2 + 0.65));
    nutheap(bag, col, F, -L / 2 + 1.5, -Wd / 2 - 1.2, 0, rand); nutheap(bag, col, F, L / 2 - 1.5, -Wd / 2 - 1.5, 1, rand);
  } else if (el.kind === 'cookshed') {
    shed(bag, col, F, L, Wd, 2.5);
    const n = Math.max(3, Math.floor(L / 4));
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + (i + 0.5) * L / n;
      for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; put('basalt', lathe([[0.17, 0], [0.19, 0.08], [0.12, 0.2], [0.001, 0.24]], 6, null, x + Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7)); }
      put(i % 2 ? 'palm_leaf' : 'cloth_green', lathe([[0.62, 0], [0.5, 0.14], [0.22, 0.24], [0.001, 0.26]], 9, null, x, 0, 0));
      if (i % 2 === 0) put('flame', lathe([[0.001, 0.02], [0.05, 0.06], [0.001, 0.18]], 5, null, x + 0.1, 0.0, 0.7));
      col.circle(...F.W(x, 0), 0.8, 0, 0.3);
    }
    for (let i = 0; i < 4; i++) put('timber', box(-L / 2 + 0.5 + i * 0.6, 0, Wd / 2 + 0.6, -L / 2 + 0.5 + i * 0.6 + 0.4, 0.5 + i * 0.1, Wd / 2 + 2.4));
    for (let i = 0; i < 5; i++) { const x = L / 2 - 1.0 - rand() * 2; put('cloth_green', lathe([[0.001, 0], [0.4, 0.15], [0.3, 0.4], [0.001, 0.5]], 7, null, x, 0, -Wd / 2 - 1.2 - rand() * 0.8)); }
    pounding(bag, col, F, -L / 2 + 1.2, -Wd / 2 - 1.5, 0, rand); pounding(bag, col, F, -L / 2 + 3.2, -Wd / 2 - 1.5, 0.3, rand);
  } else if (el.kind === 'landing') {
    shed(bag, col, F, L, Wd, 2.5, 0.35);
    put('coral_rag', box(-L / 2 - 0.2, 0, -Wd / 2 - 0.3, L / 2 + 0.2, 0.35, Wd / 2 + 0.3)); put('reed_mat', box(-L / 2, 0.35, -Wd / 2, L / 2, 0.37, Wd / 2));
    col.floor(rectOf(F, -L / 2 - 0.2, -Wd / 2 - 0.3, L / 2 + 0.2, Wd / 2 + 0.3), 0.35);
    for (let i = 0; i < 9; i++) { const x = -L / 2 + 0.7 + i * (L - 1.4) / 8; put('wicker', lathe([[0.001, 0], [0.3, 0.05], [0.34, 0.3], [0.28, 0.5], [0.001, 0.52]], 8, null, x, 0.37, (i % 2 ? 1 : -1) * Wd * 0.28)); put(i % 3 ? 'cloth_ochre' : 'cloth_green', lathe([[0.001, 0], [0.26, 0], [0.18, 0.12], [0.001, 0.16]], 7, null, x, 0.87, (i % 2 ? 1 : -1) * Wd * 0.28)); }
    for (let i = 0; i < 12; i++) put('timber', lathe([[0.07, 0], [0.07, 0.3]], 6).rotateZ(Math.PI / 2).rotateY(rand() * 3).translate(-0.9 + rand() * 1.8, 0.45, -0.4 + rand() * 0.8));
    // a pole with its two baskets, laid down
    put('timber', lathe([[0.03, 0], [0.03, 2.0]], 5).rotateZ(Math.PI / 2).translate(-1.0, 0.42, 0));
    { const q = F.W(0, Wd * 0.28); lights?.push({ at: [q[0], 1.4, q[1]], color: '#ffb46b', intensity: 2.0, distance: 7 }); put('bark_dark', lathe([[0.001, 0], [0.08, 0.01], [0.09, 0.07], [0.001, 0.07]], 7, null, 0, 0.37, Wd * 0.28)); put('flame', lathe([[0.001, 0.07], [0.02, 0.08], [0.001, 0.19]], 5, null, 0, 0.37, Wd * 0.28)); }
  } else if (el.kind === 'hall') {
    // the chief's assembly: a platform 0.9 m, a great hip roof on posts, the chief's seat at the far end, mats, kava cups
    const ph = 0.9;
    put('granite_black', box(-L / 2 - 0.2, 0, -Wd / 2 - 0.2, L / 2 + 0.2, ph - 0.1, Wd / 2 + 0.2)); put('dolerite_spotted', box(-L / 2 - 0.25, 0, -Wd / 2 - 0.25, L / 2 + 0.25, 0.22, Wd / 2 + 0.25));
    put('coral_rag', box(-L / 2 - 0.2, ph - 0.1, -Wd / 2 - 0.2, L / 2 + 0.2, ph, Wd / 2 + 0.2)); put('reed_mat', box(-L / 2 + 0.1, ph, -Wd / 2 + 0.1, L / 2 - 0.1, ph + 0.03, Wd / 2 - 0.1));
    col.floor(rectOf(F, -L / 2 - 0.2, -Wd / 2 - 0.2, L / 2 + 0.2, Wd / 2 + 0.2), ph);
    for (const [x0, x1] of [[-1.2, 1.2]]) for (const z of [-Wd / 2 - 0.2, Wd / 2 + 0.2]) { void x0; void x1; void z; }
    // ramp steps at the front (−z)
    for (let k = 0; k < 3; k++) put('granite_black', box(-1.2, 0, -Wd / 2 - 0.5 - (2 - k) * 0.4 - 0.4, 1.2, 0.3 * (k + 1) - 0.0, -Wd / 2 - 0.5 - (2 - k) * 0.4));
    col.ramp(rectOf(F, -1.2, -Wd / 2 - 1.7, 1.2, -Wd / 2 - 0.2), 0, ph, dirOf((el.yaw ?? 0)));
    const G = F, nx = Math.max(3, Math.round(L / 3) + 1);
    for (let i = 0; i < nx; i++) for (const z of [-Wd / 2 + 0.2, Wd / 2 - 0.2]) { const x = -L / 2 + 0.3 + i * (L - 0.6) / (nx - 1); put(WOOD, lathe([[0.11, 0], [0.1, 3.4]], 7, null, x, ph, z)); const p = G.W(x, z); col.circle(p[0], p[1], 0.13, ph, ph + 3.4); }
    put('timber', box(-L / 2, ph + 3.35, -Wd / 2 + 0.1, L / 2, ph + 3.5, -Wd / 2 + 0.3)); put('timber', box(-L / 2, ph + 3.35, Wd / 2 - 0.3, L / 2, ph + 3.5, Wd / 2 - 0.1));
    const rise = Wd * 0.58, ov = 1.3;
    put(TH, frustum([-L / 2 - ov, -Wd / 2 - ov, L / 2 + ov, Wd / 2 + ov], ph + 3.1, ph + 3.5 + rise, Wd / 2 + ov - 0.25, Wd / 2 + ov - 0.25, Wd / 2 + ov - 0.25, Wd / 2 + ov - 0.25));
    put(TH, box(-L / 2 + Wd / 2 - 0.3, ph + 3.5 + rise - 0.02, -0.22, L / 2 - Wd / 2 + 0.3, ph + 3.5 + rise + 0.25, 0.22));
    for (const s of [-1, 1]) for (let i = 0; i < nx * 2; i++) { const x = -L / 2 + i * L / (nx * 2 - 1); put('timber', rod([x, ph + 3.5, s * Wd / 2], [x, ph + 3.5 + rise - 0.05, s * 0.1], 0.03, 4)); }
    put('timber', box(L / 2 - 1.6, ph, -Wd / 2 + 0.5, L / 2 - 0.6, ph + 0.26, Wd / 2 - 0.5));            // the chief's seat, a long low bench of wood
    for (let i = 0; i < 6; i++) { const z = -Wd / 2 + 1.0 + i * (Wd - 2) / 5; put('bark_dark', lathe([[0.001, 0], [0.1, 0.01], [0.13, 0.08], [0.001, 0.08]], 7, null, L / 2 - 2.6, ph + 0.03, z)); }
    for (const z of [-1, 1]) put('reed_mat', box(-L / 4 - 1, ph + 0.03, z * 1.4 - 0.5, -L / 4 + 1, ph + 0.05, z * 1.4 + 0.5));
    // two bowls of burning coconut oil on the floor either side of the chief's seat, their light in the hall
    for (const z of [-1, 1]) { put('bark_dark', lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.08], [0.001, 0.08]], 7, null, L / 2 - 1.9, ph + 0.03, z * (Wd / 2 - 1.2))); put('flame', lathe([[0.001, 0.08], [0.02, 0.09], [0.001, 0.2]], 5, null, L / 2 - 1.9, ph + 0.03, z * (Wd / 2 - 1.2))); const q = F.W(L / 2 - 1.9, z * (Wd / 2 - 1.2)); lights?.push({ at: [q[0], ph + 0.7, q[1]], color: '#ffb46b', intensity: 2.6, distance: 8 }); }
  }
}

/**
 * tomb_court { rect, h, seed, gate }: the walled court of a lesser tomb islet: a crib wall round it (3.2 m, thickness 1.6) with a gap at the south,
 * inside it a raised platform with a crypt (a smaller sibling of Nandauwas's), tabu posts at the gate.
 */
export function tomb_court(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, th = 1.6, top = 3.3, seed = el.seed ?? 7, g = el.gate, e = [th / 2, th / 2];
  cribWall(bag, { a: [x0, z0], b: [x1, z0], th, top, seed, ends: e, proj: 0 }); col.segment([x0 - th / 2, z0], [x1 + th / 2, z0], th, 0, top);
  cribWall(bag, { a: [x1, z0], b: [x1, z1], th, top, seed: seed + 1, ends: e, proj: 1 }); col.segment([x1, z0 - th / 2], [x1, z1 + th / 2], th, 0, top);
  cribWall(bag, { a: [x0, z1], b: [x1, z1], th, top, seed: seed + 2, ends: e, proj: 0 }); col.segment([x0 - th / 2, z1], [x1 + th / 2, z1], th, 0, top);
  // the west wall in two pieces round the gate, which the causeway meets
  cribWall(bag, { a: [x0, z0], b: [x0, g[0]], th, top, seed: seed + 3, ends: [th / 2, 0], proj: 1 }); col.segment([x0, z0 - th / 2], [x0, g[0]], th, 0, top);
  cribWall(bag, { a: [x0, g[1]], b: [x0, z1], th, top, seed: seed + 4, ends: [0, th / 2], proj: 1 }); col.segment([x0, g[1]], [x0, z1 + th / 2], th, 0, top);
}

/**
 * things { list: [{ k, at: [x, z], rot, side }], seed }: single pieces of the dressing of an open ground (the palace islet's forecourt):
 * k is 'rack', 'net', 'matline', 'pound', 'nuts', 'pen', 'logs' or 'hull' (a canoe's dug-out hull on its rollers, the adze work half done).
 */
export function things(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), F = mk([0, 0], 0);
  for (const t of el.list) {
    const [x, z] = t.at, r = t.rot ?? 0;
    if (t.k === 'rack') rack(bag, col, F, x, z, r, rand, t.len ?? 1.9, t.wid ?? 0.9);
    else if (t.k === 'net') net(bag, col, F, x, z, r, rand);
    else if (t.k === 'matline') matline(bag, col, F, x, z, r, rand);
    else if (t.k === 'pound') pounding(bag, col, F, x, z, r, rand);
    else if (t.k === 'nuts') nutheap(bag, col, F, x, z, r, rand);
    else if (t.k === 'pen') pen(bag, col, F, x, z, r, rand, t.side ?? 2.4);
    else if (t.k === 'logs') logs(bag, col, F, x, z, r, rand, t.len ?? 2.6);
    else if (t.k === 'hull') {
      // the log hull: two sawn-off trunks' length of dug-out wood on three rollers, chips round it, the adze marks pale on the cut side
      const G = sub(F, x, z, r), put = (m, g) => { g.applyMatrix4(G.M); bag.add(m, g); }, L = t.len ?? 5.2;
      for (const u of [-L * 0.35, 0, L * 0.35]) put('timber', lathe([[0.1, 0], [0.1, 1.0]], 6).rotateX(Math.PI / 2).translate(u, 0.1, -0.5));
      put(WOOD, lathe([[0.001, 0], [0.34, 0.35], [0.42, L * 0.5], [0.34, L - 0.35], [0.001, L]], 8).rotateZ(-Math.PI / 2).translate(-L / 2, 0.55, 0));
      put('timber', box(-L / 2 + 0.3, 0.74, -0.16, L / 2 - 0.3, 0.8, 0.16));
      for (let i = 0; i < 12; i++) put('palm_leaf', box(-L / 2 + rand() * L, 0.0, -0.9 + rand() * 1.8, -L / 2 + rand() * L + 0.12, 0.03, -0.9 + rand() * 1.8 + 0.08));
      col.segment(G.W(-L / 2, 0), G.W(L / 2, 0), 1.0, 0, 0.8);
    }
  }
}

/** Moss, salt and fern on a stretch of an islet's retaining wall: wall_dress { a, b, out, seed }. */
export function wall_dress(el, { bag }) {
  const [a, b] = [el.a, el.b], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, [nx, nz] = el.out, rand = rng(el.seed ?? 1);
  const p = (u, o) => [a[0] + ux * u + nx * o, a[1] + uz * u + nz * o];
  const patch = (mat, u, y, w, hgt, o = 0.17) => {
    const q0 = p(u, o), q1 = p(u + w, o + 0.03);
    bag.add(mat, box(Math.min(q0[0], q1[0]), y, Math.min(q0[1], q1[1]), Math.max(q0[0], q1[0]), y + hgt, Math.max(q0[1], q1[1])));
  };
  for (let u = 0.3; u < L - 0.6; u += 0.9 + rand() * 1.8) {
    patch('palm_leaf', u, -1.62 + rand() * 0.1, 0.5 + rand() * 1.2, 0.25 + rand() * 0.2);        // the green at the waterline
    if (rand() < 0.5) patch('verde_antico', u + rand() * 0.4, -1.3 + rand() * 0.2, 0.3 + rand() * 0.7, 0.12 + rand() * 0.15, 0.2);
    if (rand() < 0.35) patch('chalk', u + rand() * 0.5, -1.0 + rand() * 0.9, 0.15 + rand() * 0.4, 0.1 + rand() * 0.1, 0.19);   // barnacles and salt
    if (rand() < 0.3) { const q = p(u + rand() * 0.5, 0.0); for (let i = 0; i < 5; i++) bag.add('flax_leaf', rod([q[0], 0.1, q[1]], [q[0] + nx * (0.15 + 0.12 * i) + ux * (i - 2) * 0.07, 0.35 + 0.1 * (i % 3), q[1] + nz * (0.15 + 0.12 * i) + uz * (i - 2) * 0.07], 0.012, 3)); }
  }
}
/** A mooring post with its rope coil: post { at, h }. */
export function post(el, { bag, col }) {
  const [x, z] = el.at, h = el.h ?? 1.2;
  bag.add(WOOD, lathe([[0.1, -0.4], [0.09, h]], 7, null, x, 0, z));
  bag.add(ROPE, lathe([[0.12, 0], [0.12, 0.06]], 7, null, x, h - 0.25, z));
  col.circle(x, z, 0.14, 0, h);
}
/** A fish weir on the bed of a canal or the reef flat: two arms of stakes and stones meeting at a trap: weir { at, yaw, len }. */
export function weir(el, { bag }) {
  const [x, z] = el.at, yaw = el.yaw ?? 0, len = el.len ?? 8, ca = Math.cos(yaw), sa = Math.sin(yaw), rand = rng(el.seed ?? 4), y0 = el.y ?? -2.4, top = el.top ?? -1.0;
  const W = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  for (const s of [-1, 1]) for (let t = 0; t <= len; t += 0.45) {
    const q = W(t, s * (len * 0.45 - t * 0.38));
    bag.add(WOOD, lathe([[0.03, 0], [0.025, top - y0 + (rand() - 0.5) * 0.25]], 5, null, q[0], y0, q[1]));
    if (rand() < 0.4) bag.add('basalt', lathe([[0.001, 0], [0.2, 0.06], [0.001, 0.2]], 6, null, q[0], y0, q[1]));
  }
  for (let a = 0; a < 6; a++) { const q = W(len + 0.4 * Math.cos(a), 0.55 * Math.sin(a)); bag.add(WOOD, lathe([[0.035, 0], [0.03, top - y0 + 0.15]], 5, null, q[0], y0, q[1])); }
}
void ROCK; void plants;
