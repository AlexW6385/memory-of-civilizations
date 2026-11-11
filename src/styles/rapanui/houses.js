// Rapa Nui — the houses to walk into, their yards and their wear (docs/settlements/rapa-nui.md §4f):
//   hare_house   a hare paenga of the common kind raised so that it can be entered, furnished by what
//                goes on in it (sleeping, cooking, net-making, bark cloth, carving);
//   house_yard   what lies about the forecourt and the walls of every house: firewood, fish and
//                octopus drying on racks, bark cloth on frames, nets, baskets, mortars, thatch stock;
//   thatch_wear  the wear of the thatch: patches of newer reed, lashing hoops, damp streaks at the eaves,
//                a fringe of loose straw.
import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles, rod, frustum } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { tube } from '../../objects/kit.js';
import { rope, } from './scenes.js';
import { kavakava, tokiGeometry, GOURD } from './works.js';

const B = 'basalt_ahu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };
const ROUND = [0, 1, 2].map((k) => lathe([[1, -0.6], [1.06, 0.05], [0.78, 0.6], [0.35, 0.85], [0.001, 0.9]], 7, (th) => 1 + 0.12 * Math.sin(th * (2 + k) + k) + 0.06 * Math.cos(th * 5 + k * 2)));
function stoneAt(bag, mat, x, y, z, r, seed = 0, flat = 1) {
  const k = Math.abs(Math.floor(seed * 7.3)) % 3, m = new Matrix4().makeRotationY(seed * 2.1).premultiply(new Matrix4().makeTranslation(x, y, z)).multiply(new Matrix4().makeScale(r, r * (0.7 + 0.1 * k) * flat, r));
  if (bag.addInstance) bag.addInstance(mat, ROUND[k], m, { reach: 220 }); else bag.add(mat, ROUND[k].clone().applyMatrix4(m));
}
/** The hull of a boat-shaped house: half-width, height, arch (the same as hare_paenga's), as functions. */
const shape = (L, W, H) => ({
  half: (u) => (W / 2) * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.62,
  hh: (u) => H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4,
  arch: (c) => (1 - Math.abs(c) ** 1.3) ** 0.62,
});
const basket = (r = 0.27, h = 0.36) => [lathe([[r * 0.74, 0], [r, 0.1], [r * 1.04, h * 0.8], [r * 0.85, h], [0.001, h]], 11), lathe([[r * 0.86, h], [r * 0.7, h + 0.07], [0.001, h + 0.11]], 11)];
const lump = () => lathe([[0.001, 0], [0.05, 0.02], [0.07, 0.06], [0.05, 0.11], [0.001, 0.12]], 6).scale(1, 0.8, 1.7);

// ---- the house to walk into --------------------------------------------------------------------
/**
 * hare_house: a hare paenga of the common kind, raised and widened so that it can be entered { c, y, len, w, h,
 * yaw, seed, kind: 'sleep' | 'cook' | 'net' | 'tapa' | 'carver' } — the same boat-shaped curb of dressed basalt,
 * thatch over arched poles on purlins and a ridge pole, a second skin of thatch inside, the poles showing; the door
 * (raised: the common house's was a crawl, [stated: easterisland.travel "Hare Paenga"]) on the long side with its
 * porch gone to a stone sill; before it the poro pavement and the earth oven; inside the reed-mat floor, sleeping
 * places down both sides at one end, a hearth, and at the other end the things of the house's work
 * [inferred: the furnishing, from the long house of the chief (works.js) and what is known of Polynesian houses].
 */
function hareHouse(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 13, W = el.w ?? 3.1, H = el.h ?? 2.9, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 5), kind = el.kind ?? 'sleep';
  const ca = Math.cos(yaw), sa = Math.sin(yaw), P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const w3 = (u, y, v) => { const [a, b] = P(u, v); return [a, y0 + y, b]; };
  const { half, hh, arch } = shape(L, W, H), FL = 0.07;
  const inside = (u, v) => 0.2 + hh(u) * arch(Math.min(0.999, Math.abs(v) / (half(u) + 0.02))) - 0.1;       // the inner roof's height over (u, v)
  const n = Math.round(L * 2.1 / 1.1), pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, u = -Math.cos(t) * (L / 2 + 0.12); pts.push([u, Math.sin(t) >= 0 ? half(u) + 0.14 : -half(u) - 0.14]); }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    if (a[1] < 0 && b[1] < 0 && Math.abs(a[0]) < 0.9 && Math.abs(b[0]) < 0.9) continue;
    add(B, orientedBox(a, b, 0.24, -0.35, 0.22 + rand() * 0.04, -0.03));
  }
  add(B, box(-0.62, -0.35, -half(0) - 0.45, 0.62, 0.08, -half(0) + 0.1));
  const NU = 2 * Math.round(L * 0.85), NS = 14, JD = H > 3.1 ? 3 : 4, I0 = NU / 2 - 1, I1 = NU / 2 + 1, G = [], Gi = [];
  for (let i = 0; i <= NU; i++) {
    const u = -L / 2 + L * i / NU, w = half(u) + 0.02, r = [], ri = [];
    for (let j = 0; j <= NS; j++) {
      const c = 1 - 2 * j / NS, yy = hh(u) * arch(c), v = -c * w;
      r.push([u, 0.2 + yy, v]);
      ri.push([u, Math.max(0.2, 0.2 + yy - 0.1), Math.sign(v) * Math.max(0, Math.abs(v) - 0.1)]);
    }
    G.push(r); Gi.push(ri);
  }
  const outer = [], inner = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    if (i >= I0 && i < I1 && j < JD) continue;
    const a = G[i][j], b = G[i + 1][j], c = G[i + 1][j + 1], d = G[i][j + 1];
    outer.push(...a, ...d, ...c, ...a, ...c, ...b);
    const e = Gi[i][j], f = Gi[i + 1][j], g = Gi[i + 1][j + 1], h = Gi[i][j + 1];
    inner.push(...e, ...g, ...h, ...e, ...f, ...g);
  }
  add('thatch', fromTriangles(outer));
  add('thatch', fromTriangles(inner));
  const rev = [];
  for (const i of [I0, I1]) for (let j = 0; j < JD; j++) { const a = G[i][j], b = G[i][j + 1], c = Gi[i][j + 1], d = Gi[i][j]; rev.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let i = I0; i < I1; i++) { const a = G[i][JD], b = G[i + 1][JD], c = Gi[i + 1][JD], d = Gi[i][JD]; rev.push(...a, ...b, ...c, ...a, ...c, ...d); }
  add('thatch', fromTriangles(rev.concat(flip(rev))));
  for (let i = 2; i < NU; i += 3) for (let j = 0; j < NS; j++) add('timber', rod(Gi[i][j], Gi[i][j + 1], 0.032, 5));
  for (let j = 2; j < NS - 1; j += 2) for (let i = 0; i < NU; i++) {
    if (i >= I0 && i < I1 && j < JD + 1) continue;
    add('timber', rod(Gi[i][j], Gi[i + 1][j], 0.02, 4));
  }
  for (let i = 1; i < NU - 1; i++) add('timber', rod(Gi[i][NS / 2], Gi[i + 1][NS / 2], 0.05, 5));
  for (const i of [I0, I1]) add('timber', rod([G[i][0][0], G[i][0][1] - 0.2, G[i][0][2]], G[i][JD], 0.05, 6));
  add('timber', rod(G[I0][JD], G[I1][JD], 0.065, 6));
  const ridge = (u) => [u, 0.2 + hh(u) + 0.03, 0];
  for (let k = 0; k < 8; k++) add('thatch', rod(ridge(-L * 0.44 + L * 0.88 * k / 8), ridge(-L * 0.44 + L * 0.88 * (k + 1) / 8), 0.11, 6));
  // the poro pavement before the door and the earth oven (as the solid houses have them)
  const R = 2.6, cv = -half(0) - 0.55, nseg = 12, fan = [];
  for (let k = 0; k < nseg; k++) {
    const a0 = Math.PI * k / nseg, a1 = Math.PI * (k + 1) / nseg;
    const p0 = [Math.cos(a0) * R, -Math.sin(a0) * R * 0.75 + cv], p1 = [Math.cos(a1) * R, -Math.sin(a1) * R * 0.75 + cv];
    fan.push(0, 0.09, cv, p1[0], 0.09, p1[1], p0[0], 0.09, p0[1]);
    fan.push(p0[0], 0.09, p0[1], p1[0], 0.09, p1[1], p1[0], -0.35, p1[1], p0[0], 0.09, p0[1], p1[0], -0.35, p1[1], p0[0], -0.35, p0[1]);
    const am = (a0 + a1) / 2, [sx, sz] = P(Math.cos(am) * (R + 0.05), -Math.sin(am) * (R + 0.05) * 0.75 + cv);
    stoneAt(bag, 'pebbles', sx, y0 + 0.02, sz, 0.16 + rand() * 0.08, k);
  }
  fan.push(-R, 0.09, cv, R, 0.09, cv, R, -0.35, cv, -R, 0.09, cv, R, -0.35, cv, -R, -0.35, cv);
  const ofan = [];
  for (let k = 0; k < nseg; k++) ofan.push(0, -0.35, cv, Math.cos(Math.PI * k / nseg) * R, -0.35, -Math.sin(Math.PI * k / nseg) * R * 0.75 + cv, Math.cos(Math.PI * (k + 1) / nseg) * R, -0.35, -Math.sin(Math.PI * (k + 1) / nseg) * R * 0.75 + cv);
  add('pebbles', fromTriangles(fan.concat(ofan)));
  for (let k = 0; k < 24; k++) { const a = rand() * Math.PI, rr = Math.sqrt(rand()) * (R - 0.3), [sx, sz] = P(Math.cos(a) * rr, -Math.sin(a) * rr * 0.75 + cv); stoneAt(bag, 'pebbles', sx, y0 + 0.08, sz, 0.08 + rand() * 0.07, k * 1.3); }
  const ov = cv - 2.7, ou = L * 0.3 * ((el.seed ?? 11) % 2 ? -1 : 1);
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2, b = (k + 1) / 6 * Math.PI * 2, rr = 0.55;
    add(B, orientedBox([ou + Math.cos(a) * rr, ov + Math.sin(a) * rr], [ou + Math.cos(b) * rr, ov + Math.sin(b) * rr], 0.12, -0.3, 0.2 + (k % 2) * 0.05, -0.04));
  }
  add('opening', lathe([[0.48, 0.02], [0.001, 0.03]], 10, null, ou, 0, ov));
  // ---- inside: the mat floor, beds at the west end, the hearth, the work of the house at the east end
  const strips = [];
  for (let i = 1; i < NU - 1; i++) {
    const u0 = -L / 2 + L * i / NU, u1 = -L / 2 + L * (i + 1) / NU, h0 = half(u0) * 0.86, h1 = half(u1) * 0.86;
    strips.push(u0, FL, -h0, u1, FL, -h1, u1, FL, h1, u0, FL, -h0, u1, FL, h1, u0, FL, h0);
  }
  const up = []; for (let i = 0; i < strips.length; i += 18) { const q = strips.slice(i, i + 18); up.push(...q.slice(0, 3), ...q.slice(6, 9), ...q.slice(3, 6), ...q.slice(9, 12), ...q.slice(15, 18), ...q.slice(12, 15)); }
  add('reed_mat', fromTriangles(up));
  const bed = (u, s, ochre) => {
    const v = s * Math.min(half(u) * 0.62, 1.05);
    add('reed_mat', box(u, FL, v - 0.38, u + 1.05, FL + 0.05, v + 0.38));
    add(ochre ? 'cloth_ochre' : 'hide_white', box(u + 0.12, FL + 0.05, v - 0.3, u + 0.85, FL + 0.085, v + 0.3));
    const hv = v + s * 0.44;
    add('timber', box(u + 0.3, FL + 0.05, hv - 0.04, u + 0.75, FL + 0.1, hv + 0.04));
    add('timber', box(u + 0.3, FL + 0.1, hv - 0.06, u + 0.75, FL + 0.14, hv + 0.06));
  };
  const nb = Math.max(2, Math.floor((L / 2 - 3.0) / 1.25));
  for (const s of [-1, 1]) for (let k = 0; k < nb; k++) bed(-L / 2 + 1.5 + k * 1.25, s, (k + (s > 0 ? 1 : 0) + (el.seed ?? 0)) % 3 === 0);
  // the hearth: a ring of stones round ash, between the sleeping end and the work end; smoke finds its way through the thatch
  const hu = -1.9;
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, [sx, sz] = P(hu + Math.cos(a) * 0.5, Math.sin(a) * 0.5); stoneAt(bag, B, sx, y0 + FL - 0.03, sz, 0.11 + rand() * 0.04, k + 3); }
  add('opening', lathe([[0.42, FL + 0.005], [0.001, FL + 0.012]], 12, null, hu, 0, 0));
  col.circle(...P(hu, 0), 0.5, y0, y0 + 0.3);
  const uE = L / 2 - 1.15, uW = 1.4;                                   // the work end: from uW to uE
  const gourds = (u, v, k, sc = 1) => { for (let q = 0; q < k; q++) add('pottery_dark', GOURD().scale(sc * (1 + 0.2 * (q % 3)), sc * (1 + 0.15 * (q % 2)), sc).translate(u + (q % 3) * 0.3, FL, v + Math.floor(q / 3) * 0.3)); };
  const baskets = (u, v, k, tubers) => { for (let q = 0; q < k; q++) { const bu = u + (q % 2) * 0.62, bv = v + Math.floor(q / 2) * 0.62, [b0, b1] = basket(); add('wicker', b0.translate(bu, FL, bv)); if (tubers && q % 2 === 0) { for (let t = 0; t < 7; t++) add('hide_tan', lump().rotateY(t * 1.9).translate(bu + Math.cos(t * 2.3) * 0.1, FL + 0.34 + (t > 4 ? 0.07 : 0), bv + Math.sin(t * 2.3) * 0.1)); } else add('wicker', b1.translate(bu, FL, bv)); } };
  const wallV = (u, y) => { const t = Math.max(0.01, Math.min(0.99, (y - 0.2) / Math.max(0.3, hh(u)))), c = (1 - t ** (1 / 0.62)) ** (1 / 1.3); return c * (half(u) + 0.02); };
  const hung = (u0, u1, k, sag, v) => { for (let q = 0; q < k; q++) { const a = u0 + (u1 - u0) * q / k, b = u0 + (u1 - u0) * (q + 1) / k, ya = inside(a, v) - 0.15, yb = inside(b, v) - 0.15; rope(bag, [w3(a, ya, v), w3((a + b) / 2, Math.min(ya, yb) - sag, v), w3(b, yb, v)], 0.014); } };
  if (kind === 'sleep') {
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) bed(uW + 0.4 + k * 1.3, s, (k + (s > 0 ? 1 : 0)) % 2 === 0);
    gourds(uE - 0.5, -0.9, 5); baskets(uE - 0.7, 0.2, 4, true);
    for (let k = 0; k < 3; k++) { const u = uW + 3.2 + k * 0.28, a = [u, FL, wallV(u, 0.3) - 0.14], b = [u + 0.1, 2.0, wallV(u + 0.1, 2.0) - 0.14]; add('timber', rod(a, b, 0.017, 5)); add('obsidian', rod(b, [b[0] + 0.02, b[1] + 0.2, b[2] - 0.03], 0.021, 4)); }
    hung(uW, uE, 3, 0.12, 0.35);
  } else if (kind === 'cook') {
    const cu = uW + 2.6;
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, [sx, sz] = P(cu + Math.cos(a) * 0.7, 0.3 + Math.sin(a) * 0.7); stoneAt(bag, B, sx, y0 + FL - 0.03, sz, 0.14 + rand() * 0.05, k + 9); }
    add('opening', lathe([[0.58, FL + 0.005], [0.001, FL + 0.012]], 12, null, cu, 0, 0.3));
    col.circle(...P(cu, 0.3), 0.68, y0, y0 + 0.3);
    for (let k = 0; k < 7; k++) for (let q = 0; q < 3 + (k < 2); q++) add('timber', rod([uE - 1.1 + q * 0.17 + (k % 2) * 0.08, FL + 0.08 + k * 0.1, wallV(uE - 1.0, 0.3) * 0.7 - 0.7 - k * 0.0], [uE - 1.1 + q * 0.17 + (k % 2) * 0.08, FL + 0.08 + k * 0.1, 0.95], 0.055, 5).rotateX(0));
    baskets(uW + 5.3, -1.0, 4, true); gourds(uW + 4.3, 0.9, 6, 1.1);
    add('basalt_ahu', box(cu + 1.5, FL, 0.55, cu + 2.1, FL + 0.16, 1.05));             // a flat stone for the pounding of taro and sweet potato
    for (let k = 0; k < 3; k++) add('papyrus', lathe([[0.001, 0], [0.09, 0.03], [0.1, 0.4], [0.001, 0.46]], 7).rotateZ(Math.PI / 2).translate(cu - 1.3 + k * 0.2, FL + 0.1, -0.8));
    hung(uW, uE, 3, 0.1, -0.4);
    for (let k = 0; k < 3; k++) add('wicker', basket(0.2, 0.3)[0].translate(uW + 1.0 + k * 1.6, inside(uW + 1.0 + k * 1.6, 0.9) - 0.7, 0.9)), rope(bag, [w3(uW + 1.0 + k * 1.6, inside(uW + 1.0 + k * 1.6, 0.9) - 0.1, 0.9), w3(uW + 1.0 + k * 1.6, inside(uW + 1.0 + k * 1.6, 0.9) - 0.4, 0.9)], 0.012);
  } else if (kind === 'net') {
    // a net stretched on two posts, others festooned along the poles, coils of line, gourd floats, bone hooks on a cord
    const nu = uW + 1.4;
    for (const du of [0, 2.2]) add('timber', rod([nu + du, FL, 1.05], [nu + du, 1.95, 1.0], 0.04, 6));
    for (let k = 0; k <= 8; k++) rope(bag, [w3(nu, 0.45 + k * 0.17, 1.02), w3(nu + 1.1, 0.4 + k * 0.17, 1.02), w3(nu + 2.2, 0.45 + k * 0.17, 1.02)], 0.01);
    for (let k = 0; k <= 11; k++) { const u = nu + k * 0.2; rope(bag, [w3(u, 0.45, 1.03), w3(u, 1.0, 1.03), w3(u, 1.8, 1.03)], 0.01); }
    for (let k = 0; k < 4; k++) add('pottery_dark', GOURD().scale(0.55, 0.55, 0.55).translate(nu + 0.3 + k * 0.55, 0.05 + 0.0, 0.7));
    for (let k = 0; k < 3; k++) add('rope_fibre', lathe([[0.2, 0], [0.26, 0.04], [0.28, 0.1], [0.2, 0.16], [0.14, 0.1]], 10).translate(nu + 3.4 + k * 0.5, FL, -0.8 + (k % 2) * 0.4));
    hung(uW, uE, 4, 0.2, -0.3); hung(uW, uE, 4, 0.16, 0.35);
    for (let k = 0; k < 6; k++) add('coral', lathe([[0.001, 0], [0.012, 0.0], [0.015, 0.05], [0.001, 0.09]], 4).translate(uE - 0.6, FL + 0.01, -0.8 + k * 0.07));
    for (let k = 0; k < 2; k++) { const v = -0.95 + k * 0.3; add('timber', rod([uE - 0.2, FL + 0.03, v], [uE - 1.9, FL + 0.03, v + 0.1], 0.015, 5)); add('timber', box(uE - 2.1, FL + 0.01, v - 0.12, uE - 1.9, FL + 0.03, v + 0.14)); }
    baskets(uE - 0.7, 0.2, 2, false);
  } else if (kind === 'tapa') {
    // the beating of bark cloth: a flat basalt anvil with its beaters, strips of paper-mulberry bast soaking and laid, sheets drying on a line, rolls
    const tu = uW + 1.8;
    add(B, box(tu, FL, -0.35, tu + 1.1, FL + 0.22, 0.2));
    for (let k = 0; k < 3; k++) add('timber', box(tu + 0.1 + k * 0.28, FL + 0.22, -0.55 + k * 0.1, tu + 0.22 + k * 0.28, FL + 0.27, 0.0 + k * 0.15));
    add('hide_white', box(tu + 0.1, FL + 0.22, -0.3, tu + 0.9, FL + 0.235, 0.1));
    for (let k = 0; k < 5; k++) add('hide_tan', box(tu + 1.5, FL, -0.5 + k * 0.07, tu + 2.6, FL + 0.015 + k * 0.012, -0.44 + k * 0.07));
    for (let k = 0; k < 3; k++) add('hide_white', lathe([[0.001, 0], [0.1, 0.02], [0.11, 0.5], [0.001, 0.52]], 8).rotateZ(Math.PI / 2).translate(tu + 3.3, FL + 0.11 + (k % 2) * 0.2, 0.7 - Math.floor(k / 2) * 0.2 + (k % 2) * 0.1));
    const dye = [['hide_white', 0], ['cloth_ochre', 1], ['hide_tan', 2], ['hide_white', 3]];
    const ly = inside(tu + 2, 0) - 0.5;
    rope(bag, [w3(tu - 0.5, ly + 0.2, 0.2), w3(tu + 3.0, ly + 0.15, 0.2)], 0.012);
    for (const [m, k] of dye) add(m, box(tu - 0.2 + k * 0.85, ly - 0.95, 0.17, tu + 0.55 + k * 0.85, ly + 0.17, 0.2));
    add('pottery_dark', GOURD().translate(uE - 0.4, FL, -0.7)); add('kokowai', lathe([[0.001, 0], [0.12, 0.02], [0.13, 0.05], [0.001, 0.05]], 8).translate(uE - 0.4, FL + 0.38, -0.7));
    gourds(uE - 0.9, 0.3, 3); baskets(uE - 1.8, 0.7, 2, false);
    hung(uW, uE, 3, 0.1, -0.5);
  } else {
    // the carver: a log of toromiro on two stones with a figure coming out of it, obsidian flakes and adzes, shavings underfoot
    const cu = uW + 2.0;
    add('wood_dark', rod([cu, FL + 0.28, 0.05], [cu + 1.9, FL + 0.3, 0.1], 0.16, 8));
    for (const du of [0.2, 1.7]) { const [sx, sz] = P(cu + du, 0.07); stoneAt(bag, B, sx, y0 + 0.02, sz, 0.15, du); }
    add('timber', kavakava().clone().scale(1.6, 1.6, 1.6).rotateZ(Math.PI / 2).translate(cu + 0.3, FL + 0.43, 0.05));
    add('timber', kavakava().clone().rotateY(Math.PI / 2).translate(uE - 0.5, FL + 0.08, 0.5)); add(B, box(uE - 0.7, FL - 0.02, 0.3, uE - 0.3, FL + 0.08, 0.7));
    const tk = tokiGeometry();
    for (let k = 0; k < 5; k++) add(B, tk.clone().rotateY(k * 1.3).translate(cu + 2.4 + (k % 3) * 0.2, FL + 0.03, -0.4 + k * 0.12));
    for (let k = 0; k < 22; k++) add('obsidian', lathe([[0.001, 0], [0.018, 0.004], [0.001, 0.02]], 4).scale(1, 0.4, 2).rotateY(rand() * 6).translate(cu + 2.0 + rand() * 1.2, FL + 0.008, -0.6 + rand() * 0.6));
    for (let k = 0; k < 40; k++) add('thatch', box(cu - 0.4 + rand() * 2.7, FL + 0.004, -0.5 + rand() * 1.1, cu - 0.4 + rand() * 2.7 + 0.1, FL + 0.016, -0.5 + rand() * 1.1 + 0.025));
    gourds(uE - 1.0, -0.9, 3); baskets(uE - 0.9, 1.0, 2, false);
    hung(uW, uE, 3, 0.1, 0.3);
  }
  // colliders: a loop where the roof is a head's height, open at the door; a floor following the long axis
  const ring = [];
  for (let i = 0; i < 44; i++) { const t = i / 44 * Math.PI * 2, u = -Math.cos(t) * (L / 2 - 0.4), sg = Math.sin(t) >= 0 ? 1 : -1; ring.push([u, sg * half(u) * 0.74]); }
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    if (a[1] < 0 && b[1] < 0 && Math.abs(a[0]) < 1.4 && Math.abs(b[0]) < 1.4) continue;
    col.segment(P(a[0], a[1]), P(b[0], b[1]), 0.3, y0 - 0.5, y0 + H);
  }
  // the floor: short rects along the axis (the house is turned a little), each wide enough to cover the turn
  const step = 0.9, fw = Math.min(1.1, W * 0.34);
  for (let u = -L / 2 + 1.0; u < L / 2 - 1.0; u += step) {
    const [px, pz] = P(u + step / 2, 0), r = step / 2 + Math.abs(sa) * 0.15 + 0.12;
    col.floor([px - r - Math.abs(sa) * fw, pz - fw * Math.abs(ca) - r * Math.abs(sa), px + r + Math.abs(sa) * fw, pz + fw * Math.abs(ca) + r * Math.abs(sa)], y0 + FL);
  }
  // before the door: a floor over the sill and the first of the pavement
  const [dx, dz] = P(0, -half(0) - 0.4);
  col.floor([dx - 1.0, dz - 0.7, dx + 1.0, dz + 0.7], y0 + FL);
}

// ---- the yard --------------------------------------------------------------------------------------
const FISH = () => lathe([[0.001, -0.17], [0.05, -0.1], [0.07, 0.0], [0.05, 0.1], [0.025, 0.16], [0.001, 0.17]], 5).scale(1, 0.12, 1);
/**
 * house_yard: what lies about a house { c, y, len, w, yaw, seed } — three or four of: a stack of firewood
 * (dry brush and branches) against the wall; a rack of poles with split fish and octopus hung to dry [inferred:
 * the island's fishing and the sun and wind to dry it]; a frame with bark cloth drying; a net hung on poles with
 * its gourd floats; baskets of sweet potato and gourds of water by the door; a stone mortar and a flat grinding stone;
 * a stock of reed bundles for the thatch leaned at the end wall; fish traps of wicker and sinker stones; a flat
 * stone to sit on. Always some gourds and a basket at the door and scattered stones.
 */
function houseYard(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 13, W = el.w ?? 3, yaw = el.yaw ?? 0, rand = rng((el.seed ?? 3) + 77);
  const ca = Math.cos(yaw), sa = Math.sin(yaw), M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  const w3 = (u, yy, v) => { const [a, b] = P(u, v); return [a, y0 + yy, b]; };
  const dv = -W / 2;                                                      // the door wall
  const col1 = (u, v, r, h) => { const [a, b] = P(u, v); col.circle(a, b, r, y0, y0 + h); };
  const side = (k) => (k % 2 ? 1 : -1);
  const picks = ['wood', 'fish', 'tapa', 'net', 'baskets', 'mortar', 'thatch', 'traps', 'seat'];
  const mine = []; while (mine.length < 3) { const q = picks[Math.floor(rand() * picks.length)]; if (!mine.includes(q)) mine.push(q); }
  mine.forEach((what, k) => {
    const s = side(k + (el.seed ?? 0)), u0 = s * (L * 0.16 + 3.3 + rand() * 1.4), v0 = dv - 0.55 - rand() * 0.3;
    if (what === 'wood') {
      // brush and branches stacked against the wall, the ends of cut limbs showing
      for (let r = 0; r < 5; r++) for (let q = 0; q < 6 - r; q++) add('timber', rod([u0 - 0.9 + q * 0.3 + r * 0.15, 0.1 + r * 0.14, v0 + 0.35], [u0 - 0.9 + q * 0.3 + r * 0.15, 0.1 + r * 0.14, v0 - 0.7 - (r % 2) * 0.15], 0.06 + (q % 2) * 0.012, 5));
      for (let q = 0; q < 8; q++) add('thatch', rod([u0 - 0.9 + q * 0.22, 0.75, v0 + 0.3], [u0 - 0.5 + q * 0.2, 0.85 + (q % 3) * 0.05, v0 - 0.5], 0.03, 4));
      col1(u0, v0 - 0.2, 0.7, 0.8);
    } else if (what === 'fish') {
      // two forked posts and a pole across; split fish and a couple of octopus hung head down
      const w = 2.1;
      for (const du of [-w / 2, w / 2]) { add('timber', rod([u0 + du, -0.1, v0 - 0.5], [u0 + du, 1.55, v0 - 0.5], 0.045, 6)); add('timber', rod([u0 + du - 0.1, 1.5, v0 - 0.5], [u0 + du + 0.1, 1.64, v0 - 0.5], 0.03, 5)); }
      add('timber', rod([u0 - w / 2 - 0.1, 1.55, v0 - 0.5], [u0 + w / 2 + 0.1, 1.57, v0 - 0.5], 0.035, 6));
      add('timber', rod([u0 - w / 2, 1.0, v0 - 0.5], [u0 + w / 2, 1.0, v0 - 0.5], 0.03, 5));
      for (let q = 0; q < 8; q++) { const fu = u0 - w / 2 + 0.2 + q * 0.24, hi = q % 2; add(hi ? 'hide_grey' : 'hide_tan', FISH().rotateZ(Math.PI).rotateY(rand() * 0.6).translate(fu, (hi ? 1.55 : 1.0) - 0.2, v0 - 0.5)); }
      for (const fu of [-0.5, 0.45]) add('hide_brown', lathe([[0.001, 0], [0.06, 0.03], [0.05, 0.2], [0.02, 0.5], [0.001, 0.55]], 5).translate(u0 + fu, 0.98 - 0.5, v0 - 0.5));
      col1(u0 - w / 2, v0 - 0.5, 0.12, 1.6); col1(u0 + w / 2, v0 - 0.5, 0.12, 1.6);
    } else if (what === 'tapa') {
      // a frame of poles with sheets of bark cloth laid over the crossbar to dry
      const w = 2.4;
      for (const du of [-w / 2, w / 2]) add('timber', rod([u0 + du, -0.05, v0 - 0.4], [u0 + du, 1.7, v0 - 0.4], 0.04, 6));
      for (const hy of [1.65, 1.0]) add('timber', rod([u0 - w / 2, hy, v0 - 0.4], [u0 + w / 2, hy, v0 - 0.4], 0.03, 5));
      const cl = ['hide_white', 'cloth_ochre', 'hide_tan', 'hide_white', 'cloth_brown'];
      for (let q = 0; q < 3; q++) add(cl[(q + (el.seed ?? 0)) % 5], box(u0 - w / 2 + 0.15 + q * 0.75, 0.55, v0 - 0.43, u0 - w / 2 + 0.8 + q * 0.75, 1.68, v0 - 0.4));
      col1(u0 - w / 2, v0 - 0.4, 0.12, 1.7); col1(u0 + w / 2, v0 - 0.4, 0.12, 1.7);
    } else if (what === 'net') {
      // a net hung between two poles, its floats of gourd along the top
      const w = 2.6;
      for (const du of [-w / 2, w / 2]) add('timber', rod([u0 + du, -0.05, v0 - 0.45], [u0 + du, 2.1, v0 - 0.45], 0.04, 6));
      for (let q = 0; q <= 7; q++) rope(bag, [w3(u0 - w / 2, 0.5 + q * 0.2, v0 - 0.45), w3(u0, 0.42 + q * 0.2, v0 - 0.45), w3(u0 + w / 2, 0.5 + q * 0.2, v0 - 0.45)], 0.008);
      for (let q = 0; q <= 12; q++) { const u = u0 - w / 2 + q * w / 12; rope(bag, [w3(u, 0.5, v0 - 0.45), w3(u, 1.0, v0 - 0.45), w3(u, 1.9, v0 - 0.45)], 0.008); }
      for (let q = 0; q < 5; q++) add('pottery_dark', GOURD().scale(0.4, 0.4, 0.4).translate(u0 - w / 2 + 0.3 + q * 0.5, 1.95 - 0.19, v0 - 0.52));
      col1(u0 - w / 2, v0 - 0.45, 0.12, 2); col1(u0 + w / 2, v0 - 0.45, 0.12, 2);
    } else if (what === 'baskets') {
      for (let q = 0; q < 4; q++) { const [b0, b1] = basket(); const bu = u0 + (q % 2) * 0.6, bv = v0 - 0.2 - Math.floor(q / 2) * 0.6; add('wicker', b0.translate(bu, 0.05, bv)); if (q % 2) add('wicker', b1.translate(bu, 0.05, bv)); else for (let t = 0; t < 7; t++) add('hide_tan', lump().rotateY(t * 1.9).translate(bu + Math.cos(t * 2.3) * 0.1, 0.39 + (t > 4 ? 0.07 : 0), bv + Math.sin(t * 2.3) * 0.1)); }
      for (let q = 0; q < 4; q++) add('pottery_dark', GOURD().translate(u0 + 1.3 + (q % 2) * 0.3, 0.05, v0 - 0.2 - Math.floor(q / 2) * 0.3));
      col1(u0 + 0.3, v0 - 0.5, 0.7, 0.5);
    } else if (what === 'mortar') {
      add(B, lathe([[0.001, 0], [0.28, 0.0], [0.34, 0.14], [0.3, 0.3], [0.2, 0.3], [0.17, 0.14], [0.001, 0.12]], 9).translate(u0, 0.0, v0 - 0.4));
      add(B, rod([u0 + 0.05, 0.12, v0 - 0.4], [u0 + 0.5, 0.3, v0 - 0.15], 0.045, 6));
      add(B, box(u0 + 0.9, 0.0, v0 - 0.8, u0 + 1.7, 0.12, v0 - 0.15)); add(B, box(u0 + 1.0, 0.12, v0 - 0.6, u0 + 1.5, 0.19, v0 - 0.3));
      col1(u0, v0 - 0.4, 0.34, 0.3);
    } else if (what === 'thatch') {
      // bundles of reed leaned against the end wall, tied in the middle, for the next renewal
      const ux = (s > 0 ? 1 : -1) * (L / 2 + 0.5);
      for (let q = 0; q < 7; q++) { const vv = -0.6 + q * 0.2; add('thatch', lathe([[0.001, 0], [0.09, 0.03], [0.1, 0.25], [0.09, 1.1], [0.11, 1.6], [0.001, 1.65]], 7).rotateZ(-s * 0.18).translate(ux, 0, vv)); add('rope_fibre', rod([ux - s * 0.02, 0.8, vv - 0.1], [ux - s * 0.02, 0.8, vv + 0.1], 0.02, 4)); }
      col1(ux, 0, 0.9, 1.5);
    } else if (what === 'traps') {
      // fish traps of wicker, a bell-shaped weave with a mouth, and stones with a hole, the sinkers of a line
      for (let q = 0; q < 2; q++) add('wicker', lathe([[0.001, 0.5], [0.12, 0.48], [0.3, 0.3], [0.34, 0.06], [0.28, 0.0], [0.22, 0.02]], 10).translate(u0 + q * 0.8, 0.0, v0 - 0.4 - q * 0.2));
      for (let q = 0; q < 6; q++) { const [sx, sz] = P(u0 + 1.8 + (q % 3) * 0.14, v0 - 0.2 - Math.floor(q / 3) * 0.14); stoneAt(bag, 'pebbles', sx, y0 + 0.05, sz, 0.06, q); }
      col1(u0 + 0.4, v0 - 0.5, 0.7, 0.5);
    } else if (what === 'seat') {
      // a flat slab on two stones by the door, where one sits to work in the sun
      add(B, box(u0 - 0.55, 0.28, v0 - 0.55, u0 + 0.55, 0.38, v0 - 0.15));
      for (const du of [-0.4, 0.4]) add(B, box(u0 + du - 0.12, 0.0, v0 - 0.5, u0 + du + 0.12, 0.28, v0 - 0.2));
      col1(u0, v0 - 0.35, 0.5, 0.4);
    }
  });
  // always: gourds and a basket by the door, a scatter of stones and a tuft or two
  { const [b0, b1] = basket(0.22, 0.3); add('wicker', b0.translate(1.2, 0.05, dv - 0.45)); add('wicker', b1.translate(1.2, 0.05, dv - 0.45)); add('pottery_dark', GOURD().translate(-1.3, 0.05, dv - 0.5)); add('pottery_dark', GOURD().scale(0.9, 0.9, 0.9).translate(-1.05, 0.05, dv - 0.35)); }
  for (let k = 0; k < 14; k++) { const [a, b] = P((rand() - 0.5) * (L + 6), dv - 0.5 - rand() * 4.5); stoneAt(bag, rand() < 0.5 ? B : 'pebbles', a, y0 + 0.02, b, 0.05 + rand() * 0.07, k); }
}

// ---- the wear of the thatch --------------------------------------------------------------------
/**
 * thatch_wear: the weathering of a hare paenga's roof { c, y, len, w, h, yaw, seed } laid over its hull: patches of
 * newer, paler reed where the old has been mended, hoops of lashing round the roof, long damp dark streaks down from
 * the ridge and along the eaves, a fringe of loose straw hanging at the eaves [inferred: reed thatch in a wet
 * trade-wind climate, the hull's own form from hare_paenga].
 */
function thatchWear(el, { bag }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 13, W = el.w ?? 3, H = el.h ?? 2.6, yaw = el.yaw ?? 0, rand = rng((el.seed ?? 3) + 5);
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const { half, hh, arch } = shape(L, W, H);
  const at = (u, c, off = 0.03) => { const w = half(u) + 0.02, a = arch(c), y = 0.2 + hh(u) * a; return [u, y + off * (0.4 + 0.6 * a), -c * (w + off * 0.9)]; };
  const quad = (u0, u1, c0, c1, off = 0.03, nu = 3, nc = 3) => {
    const t = [];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nc; j++) {
      const ua = u0 + (u1 - u0) * i / nu, ub = u0 + (u1 - u0) * (i + 1) / nu, ca = c0 + (c1 - c0) * j / nc, cb = c0 + (c1 - c0) * (j + 1) / nc;
      const a = at(ua, ca, off), b = at(ub, ca, off), c = at(ub, cb, off), d = at(ua, cb, off);
      t.push(...a, ...d, ...c, ...a, ...c, ...b);
    }
    return fromTriangles(t.concat(flip(t)));
  };
  // patches of mended reed, paler, on both slopes
  for (let k = 0; k < 4; k++) {
    const s = rand() < 0.5 ? -1 : 1, u = (rand() - 0.5) * (L - 4), w = 1.0 + rand() * 1.4, c0 = s * (0.12 + rand() * 0.3), c1 = s * (0.55 + rand() * 0.3);
    const g = quad(u - w / 2, u + w / 2, c0, c1, 0.035);
    add('thatch_palm', g);
  }
  // damp, dark streaks from the eaves up the slope and under the ridge's drip
  for (let k = 0; k < 7; k++) {
    const s = rand() < 0.5 ? -1 : 1, u = (rand() - 0.5) * (L - 3), w = 0.25 + rand() * 0.5;
    add('bark_dark', quad(u - w / 2, u + w / 2, s * 0.98, s * (0.55 + rand() * 0.25), 0.028, 1, 2));
  }
  // hoops of lashing round the roof, every metre and a bit
  for (let u = -L / 2 + 1.6; u < L / 2 - 1.2; u += 1.3 + rand() * 0.25) {
    const P2 = [];
    for (let j = 0; j <= 14; j++) { const c = 1 - 2 * j / 14, a = at(u, c * 0.96, 0.05); P2.push([...a, 0.014]); }
    add('rope_fibre', tube(P2, 4));
  }
  // loose straw hanging at the eaves
  for (const s of [-1, 1]) for (let u = -L / 2 + 1.2; u < L / 2 - 1.0; u += 0.28 + rand() * 0.2) {
    if (Math.abs(u) < 0.8 && s < 0) continue;
    const a = at(u, s * 0.97, 0.0), len = 0.12 + rand() * 0.22;
    add('thatch', rod([a[0], a[1] + 0.02, a[2]], [a[0] + (rand() - 0.5) * 0.06, a[1] - len, a[2] - s * 0.05 * (0.5 + rand())], 0.012, 3));
  }
}

export const HOUSES = { hare_house: hareHouse, house_yard: houseYard, thatch_wear: thatchWear };
void frustum;
