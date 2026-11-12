// More of the work and the war-gear of the pā (docs/settlements/maori.md §4f): a carver at his post (whakairo) — a log
// on skids, its head cut as a figure, the adzes and chisels, the chips; a rack of cloaks (kākahu) hung to air;
// the heaps of throwing stones by the gates and the spears (tao) racked against the stages' posts.
import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const STONE = lathe([[1, -0.5], [1.05, 0.05], [0.75, 0.55], [0.3, 0.8], [0.001, 0.85]], 6, (th) => 1 + 0.14 * Math.sin(th * 3));
function stone(bag, x, y, z, r, k) {
  const m = new Matrix4().makeTranslation(x, y, z).multiply(new Matrix4().makeRotationY(k * 2.3)).multiply(new Matrix4().makeScale(r, r * 0.7, r));
  if (bag.addInstance) bag.addInstance('basalt', STONE, m, { reach: 120 }); else bag.add('basalt', STONE.clone().applyMatrix4(m));
}

/**
 * whakairo: a carver's place { c, y, yaw, seed } — a post (pou) being cut: the log on two skids, its foot still round bark,
 * the upper part adzed square and the head blocked out with the brow and the eyes' hollows marked; chips thick on the ground, two
 * adzes (toki) and a mallet on a stump, a bundle of flax cord [inferred: the stage of the work, after Te Ara "Whakairo — carving"].
 */
function whakairo(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 4), L = 3.2;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  for (const u of [-1.1, 1.1]) add('timber', box(u - 0.08, 0, -0.45, u + 0.08, 0.26, 0.45));
  add('bark_dark', tube([[0, 0.5, -L / 2, 0.2], [0, 0.5, -0.2, 0.19], [0, 0.5, 0.0, 0.19]], 9));          // the foot, bark still on
  add('timber', box(-0.17, 0.33, 0.0, 0.17, 0.67, L / 2 - 0.55));                                            // the adzed shaft
  add('timber', box(-0.22, 0.3, L / 2 - 0.55, 0.22, 0.7, L / 2));                                            // the head, blocked out
  add('wood_dark', box(-0.17, 0.67, L / 2 - 0.5, 0.17, 0.69, L / 2 - 0.15));
  for (const s of [-1, 1]) add('wood_dark', lathe([[0.001, 0], [0.06, 0.02], [0.001, 0.04]], 6, null, s * 0.1, 0.69, L / 2 - 0.3));   // eye hollows
  for (let k = 0; k < 70; k++) {
    const u = (rand() - 0.5) * (L + 1.2), v = (rand() - 0.5) * 2.2, s = 0.03 + rand() * 0.05;
    add('timber', box(v - s, 0, u - s * 0.6, v + s, 0.012, u + s * 0.6).applyMatrix4(new Matrix4().makeRotationY(rand() * 3)));
  }
  add('timber', tube([[1.2, 0, 0.9, 0.2], [1.2, 0.36, 0.9, 0.2]], 8));                                       // a stump with the tools
  add('basalt', box(1.1, 0.36, 0.8, 1.3, 0.4, 1.4)); add('timber', rod([1.2, 0.38, 0.9], [1.5, 0.42, 1.2], 0.02, 5)); add('wood_dark', tube([[0.95, 0.36, 0.95, 0.03], [1.1, 0.42, 1.0, 0.05]], 6));
  add('basalt', box(0.9, 0.0, 1.7, 1.0, 0.07, 1.95));
  const co = (a, b) => [x + a * Math.cos(yaw) + b * Math.sin(yaw), z - a * Math.sin(yaw) + b * Math.cos(yaw)];
  col.segment(co(0, -L / 2), co(0, L / 2), 0.5, y, y + 0.7);
}

/** kakahu: a rack of cloaks { a, b, y } — two posts and a rail at head height, five or six cloaks of flax fibre and dog skin hung over it, with their borders (taniko). */
function kakahu(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, rand = rng(Math.floor(ax * 5 + az));
  for (const t of [0, 1]) { const px = ax + ux * L * t, pz = az + uz * L * t; bag.add('timber', tube([[px, y - 0.3, pz, 0.05], [px, y + 1.75, pz, 0.04]], 6)); col.circle(px, pz, 0.07, y, y + 1.7); }
  bag.add('timber', tube([[ax, y + 1.6, az, 0.03], [bx, y + 1.6, bz, 0.03]], 6));
  const MATS = ['cloth_ochre', 'hide_white', 'cloth_brown', 'hide_tan', 'cloth_ochre', 'cloth_black'];
  const n = Math.max(2, Math.floor(L / 0.65));
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n, px = ax + ux * L * t, pz = az + uz * L * t, len = 1.0 + rand() * 0.35, w = Math.min(0.58, L / n - 0.05);
    const mat = MATS[k % 6], yw = -Math.atan2(uz, ux) + Math.PI / 2;
    const m = new Matrix4().makeRotationY(yw).setPosition(px, y, pz);
    const g = box(-w / 2, 1.6 - len, -0.03, w / 2, 1.62, 0.03).applyMatrix4(m), g2 = box(-w / 2, 1.6 - len, -0.035, w / 2, 1.6 - len + 0.09, 0.035).applyMatrix4(m);
    bag.add(mat, g); bag.add('cloth_black', g2);
  }
}

/** kamaka: a heap of throwing stones { at, y, r } by a gate or a stage's foot, and spears (tao) racked against a post { spears: n }. */
function kamaka(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 0.9, rand = rng(Math.floor(x * 13 + z * 7));
  const n = Math.round(r * 16);
  for (let k = 0; k < n; k++) {
    const a = rand() * 6.283, d = Math.sqrt(rand()) * r, hgt = 0.18 * (1 - d / r) * 2.2;
    stone(bag, x + Math.cos(a) * d, y + hgt, z + Math.sin(a) * d, 0.07 + rand() * 0.06, k);
  }
  col.circle(x, z, r * 0.8, y, y + 0.35);
  if (el.spears) {
    const yaw = el.yaw ?? 0, ca = Math.cos(yaw), sa = Math.sin(yaw);
    bag.add('timber', tube([[x + sa * 1.2, y - 0.2, z + ca * 1.2, 0.05], [x + sa * 1.2, y + 1.3, z + ca * 1.2, 0.04]], 6));
    for (let k = 0; k < el.spears; k++) { const u = (k - el.spears / 2) * 0.12; bag.add('wood_dark', tube([[x + sa * 1.2 + ca * u * 1.5, y, z + ca * 1.2 - sa * u * 1.5, 0.018], [x + sa * 1.2 + ca * u, y + 2.1, z + ca * 1.2 - sa * u, 0.012]], 5)); }
  }
}

/** pahu: the alarm gong { c, y, yaw } — two posts crowned with carved heads and a cross-beam, a long slab of hardwood hung from it by cords at an angle, a mallet on a cord [inferred: after museum pahu, the gong hung in the pā]. */
function pahu(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  for (const s of [-1, 1]) { add('kokowai', tube([[s * 1.0, -0.4, 0, 0.1], [s * 1.0, 3.0, 0, 0.09]], 7)); add('kokowai', lathe([[0.001, 0], [0.12, 0.05], [0.1, 0.3], [0.001, 0.38]], 7, null, s * 1.0, 3.0, 0)); }
  add('kokowai', box(-1.15, 2.7, -0.07, 1.15, 2.84, 0.07));
  for (const s of [-1, 1]) add('rope_fibre', rod([s * 0.7, 2.7, 0], [s * 0.6, 1.55, 0], 0.012, 4));
  add('wood_dark', box(-0.85, 1.28, -0.13, 0.85, 1.58, 0.13)); add('kokowai', box(-0.85, 1.28, -0.14, -0.55, 1.58, -0.12)); add('opening', box(-0.5, 1.36, -0.135, 0.5, 1.5, -0.125));
  add('rope_fibre', rod([-1.0, 2.0, 0.05], [-0.95, 1.2, 0.35], 0.01, 4)); add('wood_dark', tube([[-0.95, 1.2, 0.35, 0.03], [-0.95, 0.95, 0.4, 0.05]], 6));
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  for (const s of [-1, 1]) col.circle(x + s * ca, z - s * sa, 0.15, y, y + 3);
}

export const WORKS = { whakairo, kakahu, kamaka, pahu };
