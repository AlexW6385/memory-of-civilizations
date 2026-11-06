// The work of the pā (docs/settlements/maori.md §4b): the earth ovens (hāngī) with their fire of
// stones and the food in flax baskets, the flax (harakeke) in its clumps and the weaving of it, the
// racks where fish were dried, a canoe being hollowed with adzes on the shore, and the weapons the
// people hold (taiaha) and lay down in the challenge (rākau).

import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const STONES = [0, 1, 2].map((k) => lathe([[1, -0.55], [1.05, 0.05], [0.75, 0.55], [0.3, 0.8], [0.001, 0.85]], 7, (th) => 1 + 0.14 * Math.sin(th * (2 + k) + k)));
function stone(bag, mat, x, y, z, r, seed) {
  const m = new Matrix4().makeTranslation(x, y, z).multiply(new Matrix4().makeRotationY(seed * 2.3)).multiply(new Matrix4().makeScale(r, r * 0.75, r));
  const g = STONES[Math.abs(Math.floor(seed * 7)) % 3];
  if (bag.addInstance) bag.addInstance(mat, g, m, { reach: 160 }); else bag.add(mat, g.clone().applyMatrix4(m));
}
/** A flax basket (kono / kete) at (x, y, z): woven, a little squashed, with two handles; `fill` heaped in it. */
function basket(bag, x, y, z, r, fill = null, yaw = 0) {
  bag.add('wicker', lathe([[0.001, 0], [r * 0.8, 0.005], [r, r * 0.45], [r * 0.95, r * 0.9], [r * 0.88, r * 0.9], [r * 0.9, r * 0.45], [r * 0.72, r * 0.05], [0.001, r * 0.05]], 10, (th) => 1 + 0.18 * Math.cos(2 * th - yaw * 2), x, y, z));
  for (const s of [-1, 1]) bag.add('wicker', tube([[x + s * r * 0.9 * Math.cos(yaw), y + r * 0.85, z - s * r * 0.9 * Math.sin(yaw), 0.012], [x + s * r * 0.5 * Math.cos(yaw), y + r * 1.25, z - s * r * 0.5 * Math.sin(yaw), 0.012], [x, y + r * 1.35, z, 0.012]], 4));
  if (fill) bag.add(fill, lathe([[r * 0.9, r * 0.82], [r * 0.6, r * 1.02], [0.001, r * 1.1]], 9, null, x, y, z));
}

/**
 * hangi: a cooking place { c, y, yaw, seed } — a pit with a fire of wood heaped with stones heating
 * in it; a second oven already closed, its food baskets under leaves and a mound of earth, the
 * steam leaking at its edge; baskets of kūmara and of fern root waiting, the firewood stacked;
 * the cooking shelter (kāuta), a lean-to of raupō on posts.
 */
function hangi(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 7), ca = Math.cos(yaw), sa = Math.sin(yaw);
  const P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  // the open pit: a rim of thrown-up earth, the dark hollow, the fire heaped with stones
  const [px, pz] = P(-1.4, 0);
  bag.add('banco', lathe([[1.35, -0.1], [1.25, 0.12], [1.0, 0.16], [0.85, 0.02], [0.8, -0.05]], 16, null, px, y, pz));
  bag.add('opening', lathe([[0.85, -0.04], [0.001, -0.06]], 16, null, px, y, pz));
  for (let k = 0; k < 9; k++) { const a = rand() * 6.28, d = rand() * 0.45; bag.add('bark_dark', tube([[px + Math.cos(a) * d, y, pz + Math.sin(a) * d, 0.05], [px + Math.cos(a + 2) * (d + 0.3), y + 0.12, pz + Math.sin(a + 2) * (d + 0.3), 0.05]], 5)); }
  for (let k = 0; k < 16; k++) { const a = rand() * 6.28, d = Math.sqrt(rand()) * 0.55; stone(bag, 'basalt', px + Math.cos(a) * d, y + 0.12 + 0.12 * (1 - d / 0.55), pz + Math.sin(a) * d, 0.11 + rand() * 0.05, k + x); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + rand(), d = 0.2 + rand() * 0.3; bag.add('flame', lathe([[0.07, 0], [0.04, 0.16], [0.001, 0.3 + rand() * 0.15]], 5, null, px + Math.cos(a) * d, y + 0.06, pz + Math.sin(a) * d)); }
  // the closed oven: a low mound of earth, the leaves showing at its foot
  const [qx, qz] = P(1.5, 0.2);
  bag.add('lotus_leaf', lathe([[1.15, 0.02], [0.9, 0.12], [0.001, 0.2]], 14, (th) => 1 + 0.08 * Math.sin(th * 5), qx, y, qz));
  bag.add('banco', lathe([[1.05, 0.03], [0.85, 0.3], [0.5, 0.48], [0.001, 0.53]], 14, (th) => 1 + 0.05 * Math.sin(th * 3), qx, y, qz));
  col.circle(qx, qz, 1.0, y, y + 0.5); col.circle(px, pz, 1.2, y, y + 0.3);
  // baskets of kūmara and fern root, a wooden bowl of water
  for (let k = 0; k < 5; k++) { const [bx, bz] = P(-0.2 + k * 0.55, 1.5 + rand() * 0.3); basket(bag, bx, y, bz, 0.2 + rand() * 0.05, k % 3 === 2 ? 'hide_brown' : 'terracotta', yaw); }
  const [wx, wz] = P(2.9, 1.4);
  bag.add('wood_dark', lathe([[0.001, 0], [0.22, 0.01], [0.3, 0.12], [0.28, 0.13], [0.2, 0.04], [0.001, 0.04]], 12, null, wx, y, wz));
  bag.add('water', lathe([[0.25, 0.1], [0.001, 0.1]], 12, null, wx, y, wz));
  // the firewood stacked
  for (let k = 0; k < 14; k++) {
    const row = Math.floor(k / 5), [fx, fz] = P(-3.2 + (k % 5) * 0.14 + row * 0.07, -0.9), fy = y + 0.06 + row * 0.11;
    bag.add('bark_dark', tube([[fx, fy, fz, 0.055], [fx + sa * 1.0, fy, fz + ca * 1.0, 0.055]], 6));
  }
  // the kāuta: four posts, a raupō roof sloping back, the back wall of raupō
  const kx = [-3.6, -1.6], kz = [-2.6, -1.3], hf = 2.0, hb = 1.3;
  for (const u of kx) for (const v of kz) { const [qx2, qz2] = P(u, v), hh = v === kz[1] ? hf : hb; bag.add('timber', lathe([[0.06, 0], [0.05, hh]], 6, null, qx2, y - 0.2, qz2)); col.circle(qx2, qz2, 0.08, y, y + hh); }
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  // the roof: a thick bed of raupō laid on the two beams, overhanging all round
  const r0 = [kx[0] - 0.35, kx[1] + 0.35], ra = [kz[0] - 0.35, hb - 0.35 * (hf - hb) / (kz[1] - kz[0])], rb = [kz[1] + 0.4, hf + 0.4 * (hf - hb) / (kz[1] - kz[0])];
  const roof = (dy) => [[r0[0], ra[1] + dy, ra[0]], [r0[1], ra[1] + dy, ra[0]], [r0[1], rb[1] + dy, rb[0]], [r0[0], rb[1] + dy, rb[0]]];
  const lo = roof(0), hi = roof(0.18), t = [];
  const q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  q(hi[0], hi[3], hi[2], hi[1]); q(lo[0], lo[1], lo[2], lo[3]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(lo[i], hi[i], hi[j], lo[j]); }
  add('raupo', fromTriangles(orientOutward(t)));
  add('raupo', box(kx[0] - 0.1, -0.05, kz[0] - 0.08, kx[1] + 0.1, hb - 0.2, kz[0] + 0.02));
  for (const v of kz) { const hh = v === kz[1] ? hf : hb; add('timber', box(kx[0] - 0.2, hh - 0.1, v - 0.05, kx[1] + 0.2, hh, v + 0.05)); }
}

/** Flax: one leaf, unit length up +y, a stiff blade keeled down the middle, bending over near the tip. */
function flaxLeaf(k) {
  const t = [], N = 8, w = 0.045, bend = 0.25 + 0.12 * k;
  const c = (u) => [bend * u ** 2.2, u * (1 - 0.18 * u ** 3), 0];
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N, a = c(u0), b = c(u1), w0 = w * (1 - u0 ** 2), w1 = w * (1 - u1 ** 2);
    for (const s of [-1, 1]) t.push(...a, ...b, b[0] - 0.012 * (1 - u1), b[1], s * w1, ...a, b[0] - 0.012 * (1 - u1), b[1], s * w1, a[0] - 0.012 * (1 - u0), a[1], s * w0);
  }
  return fromTriangles(t);
}
const FLAX = [0, 1, 2].map(flaxLeaf);
/** harakeke: a flax clump { at, y, h, seed } — leaves in fans from the base, the outer ones bending out, a flower stalk or two. */
function harakeke(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.8, rand = rng(el.seed ?? 3), fans = 3 + Math.floor(rand() * 3);
  for (let f = 0; f < fans; f++) {
    const fa = rand() * 6.28, fx = x + Math.cos(fa) * 0.25 * f / fans, fz = z + Math.sin(fa) * 0.25 * f / fans, fy = rand() * 3.14;
    for (let k = 0; k < 9; k++) {
      const s = (k - 4) / 4, L = h * (0.65 + 0.35 * (1 - Math.abs(s))) * (0.85 + rand() * 0.25);
      const m = new Matrix4().makeTranslation(fx, y - 0.05, fz).multiply(new Matrix4().makeRotationY(fy + (s < 0 ? Math.PI : 0))).multiply(new Matrix4().makeRotationZ(-Math.abs(s) * 0.55)).multiply(new Matrix4().makeScale(L, L, L));
      if (bag.addInstance) bag.addInstance('palm_leaf', FLAX[k % 3], m, { reach: 180 }); else bag.add('palm_leaf', FLAX[k % 3].clone().applyMatrix4(m));
    }
  }
  if (rand() < 0.6) { const sx = x + 0.1, sz = z - 0.05, H = h * 1.6; bag.add('bark_dark', tube([[sx, y, sz, 0.02], [sx + 0.08, y + H * 0.6, sz, 0.015], [sx + 0.18, y + H, sz + 0.04, 0.01]], 4)); }
  col.circle(x, z, 0.5, y, y + h);
}

/**
 * weaving: a weaver's place { at, y, yaw, seed } — a mat (whāriki) being plaited on the ground, its
 * finished part laid flat and the loose strips of flax at its working edge; bundles of prepared
 * strips; a small basket and a shell for scraping.
 */
function weaving(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 5);
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  add('reed_mat', box(-0.8, 0, -0.2, 0.8, 0.025, 1.1));
  for (let k = 0; k < 32; k++) {                                     // the loose strips at the working edge, crossing as plaited
    const u = -0.78 + k * 0.05, s = k % 2 ? 1 : -1, L = 0.25 + rand() * 0.25;
    add('palm_leaf', box(u - 0.015, 0.012, -0.2 - L, u + 0.015, 0.02, -0.18).applyMatrix4(new Matrix4().makeRotationY(s * 0.12)));
  }
  for (let k = 0; k < 2; k++) {                                      // bundles of prepared strips, tied at one end
    const bx = 1.1, bz = -0.3 + k * 0.5;
    add('palm_leaf', tube([[bx, 0.05, bz, 0.04], [bx + 0.6, 0.05, bz + 0.05, 0.06], [bx + 1.1, 0.03, bz + 0.1, 0.03]], 6));
    add('sacking', lathe([[0.047, 0], [0.047, 0.04]], 6).rotateZ(Math.PI / 2).translate(bx + 0.2, 0.05, bz + 0.02));
  }
  const [kx, kz] = [x + Math.cos(yaw) * -1.1 + Math.sin(yaw) * 0.6, z + Math.sin(yaw) * 1.1 + Math.cos(yaw) * 0.6];
  basket(bag, kx, y, kz, 0.17, null, yaw);
}

/** whata: a rack for drying fish { a, b, y, h } — posts at each end and the middle, two rails, fish split and hung over them. */
function whata(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 2.0, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, rand = rng(Math.floor(ax * 7 + az * 3));
  const n = Math.max(2, Math.round(L / 2.2));
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) {
    const px = ax + ux * L * i / n - uz * s * 0.35, pz = az + uz * L * i / n + ux * s * 0.35;
    bag.add('timber', tube([[px, y - 0.3, pz, 0.05], [px, y + h + 0.15, pz, 0.04]], 5));
    col.circle(px, pz, 0.06, y, y + h);
  }
  for (const s of [-1, 1]) for (const hh of [h, h - 0.7]) bag.add('timber', tube([[ax - uz * s * 0.35, y + hh, az + ux * s * 0.35, 0.03], [bx - uz * s * 0.35, y + hh, bz + ux * s * 0.35, 0.03]], 5));
  const fish = lathe([[0.001, 0], [0.05, 0.06], [0.07, 0.2], [0.05, 0.36], [0.015, 0.44], [0.05, 0.52], [0.001, 0.53]], 6).scale(1, 1, 0.25);
  for (let k = 0; k < Math.round(L * 5); k++) {
    const t = (k + 0.5) / Math.round(L * 5), s = rand() < 0.5 ? -1 : 1, hh = rand() < 0.5 ? h : h - 0.7, fl = 0.7 + rand() * 0.6;
    const px = ax + ux * L * t - uz * s * 0.35, pz = az + uz * L * t + ux * s * 0.35;
    const m = new Matrix4().makeTranslation(px, y + hh - 0.02 - 0.53 * fl, pz).multiply(new Matrix4().makeRotationY(Math.atan2(ux, uz))).multiply(new Matrix4().makeScale(fl, fl, fl));
    if (bag.addInstance) bag.addInstance('hide_grey', fish, m, { reach: 140 }); else bag.add('hide_grey', fish.clone().applyMatrix4(m));
  }
}

/**
 * waka_build: a canoe being made on the shore { c, y, yaw, l } — the trunk, its bark off, laid on
 * skids; its top adzed flat and the hull's outside shaped; the inside hollowed from the stern half
 * of its length, the rest still solid; chips round it; adzes (toki) with their stone blades.
 */
function wakaBuild(el, { bag, col }) {
  const [x, z] = el.c, L = el.l ?? 12, yaw = el.yaw ?? 0, y0 = el.y ?? 0, B = 0.55 + L * 0.015, D = 0.75, lift = 0.24;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  for (const u of [-L * 0.32, 0, L * 0.32]) add('bark_dark', tube([[-1.0, 0.12, u, 0.13], [1.0, 0.12, u + 0.1, 0.14]], 8));
  const beam = (u) => B / 2 * Math.max(0.05, 1 - Math.abs(2 * u / L) ** 2.2) ** 0.6, h0 = 0.24;              // the hull's keel resting in the skids' tops
  const NU = 24, NS = 10, uh = -L * 0.05;                            // hollowed aft of uh (+z), solid forward
  const pt = (i, j, inner) => {
    const u = -L / 2 + L * i / NU, b = beam(u), a = Math.PI * j / NS;
    if (!inner) return [-Math.cos(a) * b, h0 + D - D * Math.sin(a) ** 0.7, u];
    const dig = Math.min(1, Math.max(0, (u - uh) / 1.2)) * Math.min(1, Math.max(0, (L / 2 - 0.6 - u) / 0.8));
    return [-Math.cos(a) * b * 0.82, h0 + D - (D - 0.14) * dig * Math.sin(a) ** 0.6, u];
  };
  const t = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j + 1, false), d = pt(i, j + 1, false);
    t.push(...a, ...c, ...b, ...a, ...d, ...c);
    const a2 = pt(i, j, true), b2 = pt(i + 1, j, true), c2 = pt(i + 1, j + 1, true), d2 = pt(i, j + 1, true);
    t.push(...a2, ...b2, ...c2, ...a2, ...c2, ...d2);
  }
  for (let i = 0; i < NU; i++) for (const j of [0, NS]) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j, true), d = pt(i, j, true);
    if (j === 0) t.push(...a, ...b, ...c, ...a, ...c, ...d); else t.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  // close the ends
  for (const i of [0, NU]) for (let j = 0; j < NS; j++) { const a = pt(i, j, false), b = pt(i, j + 1, false), c = pt(i, j + 1, true), d = pt(i, j, true); if (i === 0) t.push(...a, ...c, ...b, ...a, ...d, ...c); else t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  add('timber', fromTriangles(t));
  // chips of wood round the hull and in it
  const rand = rng(Math.floor(x * 11 + z * 5));
  for (let k = 0; k < 90; k++) {
    const u = -L / 2 + rand() * L, side = rand() < 0.5 ? -1 : 1, v = side * (B / 2 + 0.2 + rand() * 1.4), s = 0.04 + rand() * 0.05;
    add('timber', box(v - s, 0.0, u - s * 0.5, v + s, 0.015, u + s * 0.5).applyMatrix4(new Matrix4().makeRotationY(rand() * 3)));
  }
  // adzes leaning on the hull and lying by it: the handle bent at the head, the blade lashed on
  const adze = (p, dir, up) => {
    const hx = p[0] + dir[0] * 0.55, hy = p[1] + up * 0.55, hz = p[2] + dir[2] * 0.55;
    add('timber', tube([[...p, 0.02], [hx, hy, hz, 0.025], [hx + dir[2] * 0.0, hy + 0.12, hz, 0.03]], 5));
    add('basalt', box(hx - 0.03, hy + 0.08, hz - 0.03, hx + 0.03, hy + 0.15, hz + 0.18).applyMatrix4(new Matrix4().makeTranslation(0, 0, 0)));
    add('sacking', lathe([[0.036, 0], [0.036, 0.05]], 6, null, hx, hy + 0.1, hz));
  };
  adze([B / 2 + 0.5, 0.01, 1.2], [-0.6, 0, 0.8], 0.1);
  adze([-B / 2 - 0.7, 0.01, -0.8], [0.3, 0, 0.95], 0.05);
  adze([B / 2 + 0.9, 0.01, L * 0.3], [-0.9, 0, 0.4], 0.05);
  col.segment([x - Math.sin(yaw) * L / 2, z - Math.cos(yaw) * L / 2], [x + Math.sin(yaw) * L / 2, z + Math.cos(yaw) * L / 2], B, y0, y0 + D + lift);
}

/** taiaha: a long staff weapon held upright { at, y, h } — the shaft, the blade (rau) at the foot, the carved head with its tongue at the top, the collar of dog hair. */
function taiaha(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.75;
  bag.add('wood_dark', tube([[x, y, z, 0.022], [x, y + 0.45, z, 0.03], [x, y + h - 0.35, z, 0.019], [x, y + h - 0.12, z, 0.02], [x, y + h, z, 0.012]], 6));
  bag.add('hide_white', lathe([[0.03, 0], [0.05, 0.06], [0.04, 0.16], [0.02, 0.18]], 7, null, x, y + h - 0.4, z));
}
/** rakau: a dart or baton laid on the ground in the challenge { at, y, yaw }. */
function rakau(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw) * 0.35, s = Math.sin(yaw) * 0.35;
  bag.add('wood_dark', tube([[x - c, y + 0.015, z + s, 0.012], [x, y + 0.02, z, 0.016], [x + c, y + 0.015, z - s, 0.01]], 5));
}

/** paepae: a bench of split logs for the elders { a, b, y } — the flat face up at seat height on short posts. */
function paepae(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, L = Math.hypot(bx - ax, bz - az), yaw = -Math.atan2(bz - az, bx - ax);
  const M = new Matrix4().makeRotationY(yaw).setPosition((ax + bx) / 2, y, (az + bz) / 2), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const half = [];
  for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8; half.push([Math.cos(a) * 0.2, 0.47 - Math.sin(a) * 0.17]); }
  const t = [], q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let k = 0; k < 8; k++) { const [x0, y0] = half[k], [x1, y1] = half[k + 1]; q([-L / 2, y0, x0], [L / 2, y0, x0], [L / 2, y1, x1], [-L / 2, y1, x1]); }
  q([-L / 2, 0.47, -0.2], [L / 2, 0.47, -0.2], [L / 2, 0.47, 0.2], [-L / 2, 0.47, 0.2]);
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) { const [x0, y0] = half[k], [x1, y1] = half[k + 1]; t.push(s * L / 2, 0.47, 0, s * L / 2, y0, x0, s * L / 2, y1, x1); }
  add('wood_dark', fromTriangles(orientOutward(t)));
  for (let u = -L / 2 + 0.3; u < L / 2; u += Math.max(0.8, (L - 0.6) / Math.ceil((L - 0.6) / 1.4))) add('wood_dark', box(u - 0.07, -0.1, -0.08, u + 0.07, 0.31, 0.08));
  col.segment(el.a, el.b, 0.4, y, y + 0.47);
}

export const SCENES = { paepae, hangi, harakeke, weaving, whata, waka_build: wakaBuild, taiaha, rakau };
