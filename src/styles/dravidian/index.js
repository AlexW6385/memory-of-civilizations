// Dravidian architecture of the Nayaka period (16th–17th c.; docs/settlements/madurai.md §4): the
// gopuram — a granite base pierced by the passage, then storeys of brick and painted stucco
// stepping in, crowned by a barrel-vaulted roof with a row of gilded finials; granite enclosure
// walls; flat-roofed pillared halls (mandapa); gilded vimanas over the sanctums; the stepped
// temple tank in its colonnade; the town's single-storey houses with a pillared front verandah
// and a tiled roof.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';

const G = 'granite_tamil';
const PAINT = ['stucco_sky', 'stucco_rose', 'stucco_saffron', 'stucco_leaf', 'stucco_cream'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const kalasha = (bag, x, y, z, s = 1, mat = 'gilt_bronze') => bag.add(mat, lathe([[0.32 * s, 0], [0.42 * s, 0.35 * s], [0.22 * s, 0.7 * s], [0.12 * s, 1.1 * s], [0.001, 1.4 * s]], 8, null, x, y, z));

/** gopuram: { c, dir ('ns' passage along z, 'ew' along x), w (along the wall), d (through), h, tiers, y }. */
function gopuram(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, h = el.h, n = el.tiers ?? 9, alongX = el.dir === 'ew';
  const W = el.w, D = el.d, base = Math.max(8, h * 0.2), pw = Math.min(5, W * 0.18), ph = base * 0.75;
  const R = (u0, v0, u1, v1) => alongX ? [cx + v0, cz + u0, cx + v1, cz + u1] : [cx + u0, cz + v0, cx + u1, cz + v1];
  // the granite base: two piers either side of the passage, the lintel over it, a moulded plinth
  for (const [u0, u1] of [[-W / 2, -pw / 2], [pw / 2, W / 2]]) { const r = R(u0, -D / 2, u1, D / 2); bag.add(G, box(r[0], y, r[1], r[2], y + base, r[3])); col.rect(r, y, y + base); }
  { const r = R(-pw / 2, -D / 2, pw / 2, D / 2); bag.add(G, box(r[0], y + ph, r[1], r[2], y + base, r[3])); }
  { const r = R(-W / 2 - 0.4, -D / 2 - 0.4, W / 2 + 0.4, D / 2 + 0.4); bag.add(G, box(r[0], y, r[1], r[2], y + 1.2, r[3])); }
  { const r = R(-pw / 2, -D / 2, pw / 2, D / 2); bag.add('granite_tamil', box(r[0], y - 0.05, r[1], r[2], y + 0.02, r[3])); col.floor(r, y); }
  // the granite base's faces: pilasters, niches with their guardians, the moulded bands
  if (!el.simple) for (const s of [-1, 1]) {
    const v = s * D / 2, m = Math.floor(W / 2.2);
    for (let j = 0; j <= m; j++) {
      const u = -W / 2 + j * W / m;
      if (Math.abs(u) < pw / 2 + 0.4) continue;
      const q = R(u - 0.22, v - (s < 0 ? 0.18 : 0), u + 0.22, v + (s > 0 ? 0.18 : 0));
      bag.add(G, box(q[0], y + 1.2, q[1], q[2], y + base - 0.6, q[3]));
      if (j < m && Math.abs(u + W / m / 2) > pw / 2 + 1.2) {
        const c = u + W / m / 2, nq = R(c - 0.5, v - (s < 0 ? 0.04 : -0.02), c + 0.5, v + (s > 0 ? 0.04 : -0.02));
        bag.add('opening', box(nq[0], y + 2.4, nq[1], nq[2], y + Math.min(base * 0.6, 4.6), nq[3])); bag.add(G, box(nq[0] - 0.15, y + Math.min(base * 0.6, 4.6), Math.min(nq[1], nq[3]) - 0.1, nq[2] + 0.15, y + Math.min(base * 0.6, 4.6) + 0.5, Math.max(nq[1], nq[3]) + 0.1));
      }
    }
    for (const hh of [1.2, base * 0.66, base - 0.6]) { const q = R(-W / 2 - 0.1, v - (s < 0 ? 0.3 : 0), W / 2 + 0.1, v + (s > 0 ? 0.3 : 0)); bag.add(G, box(q[0], y + hh, q[1], q[2], y + hh + 0.35, q[3])); }
  }
  // the storeys, each a little smaller, with a cornice and a row of little shrines along the faces
  const topW = W * 0.42, topD = D * 0.45, tierH = (h - base - 6) / n;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, w0 = W + (topW - W) * t0, d0 = D + (topD - D) * t0, w1 = W + (topW - W) * t1, d1 = D + (topD - D) * t1;
    const y0 = y + base + i * tierH, y1 = y0 + tierH, mat = PAINT[i % PAINT.length];
    const r = R(-w0 / 2, -d0 / 2, w0 / 2, d0 / 2);
    bag.add(mat, frustum(r, y0, y1 - 0.35, (w0 - w1) / 2, (w0 - w1) / 2, (d0 - d1) / 2, (d0 - d1) / 2));
    const c = R(-w1 / 2 - 0.35, -d1 / 2 - 0.35, w1 / 2 + 0.35, d1 / 2 + 0.35);
    bag.add('stucco_cream', box(c[0], y1 - 0.35, c[1], c[2], y1, c[3]));
    // the gods and guardians standing in a row on the tier's faces, painted, between pilasters
    if (!el.simple) {
      const fh = Math.min(tierH * 0.62, 2.2), wm = (w0 + w1) / 2, dm = (d0 + d1) / 2;
      for (const [len, depth, long] of [[wm, dm, true], [dm, wm, false]]) {
        const m = Math.max(2, Math.floor(len / 1.25));
        for (let j = 0; j < m; j++) {
          const u = -len / 2 + (j + 0.5) * len / m;
          for (const s of [-1, 1]) {
            const v = s * (depth / 2 + 0.05), [px, pz] = long ? (alongX ? [cx + v, cz + u] : [cx + u, cz + v]) : (alongX ? [cx + u, cz + v] : [cx + v, cz + u]);
            const k = fh / 1.15, prof = [[0.22 * k, 0], [0.17 * k, 0.5 * k], [0.13 * k, 0.75 * k], [0.08 * k, 0.8 * k], [0.11 * k, 0.88 * k], [0.09 * k, 1.0 * k], [0.06 * k, 1.08 * k], [0.001, 1.15 * k]];
            const pm = PAINT[(i * 3 + j * 7 + (s > 0 ? 2 : 0)) % PAINT.length];
            bag.add(pm, lathe(prof, 6, null, px, y0 + 0.25, pz));
            const arm = long === !alongX ? box(px - 0.27 * k, y0 + 0.25 + 0.62 * k, pz - 0.05 * k, px + 0.27 * k, y0 + 0.25 + 0.72 * k, pz + 0.05 * k) : box(px - 0.05 * k, y0 + 0.25 + 0.62 * k, pz - 0.27 * k, px + 0.05 * k, y0 + 0.25 + 0.72 * k, pz + 0.27 * k);
            bag.add(pm, arm);
            bag.add('gilt_bronze', lathe([[0.075 * k, 0], [0.06 * k, 0.1 * k], [0.001, 0.2 * k]], 6, null, px, y0 + 0.25 + 1.08 * k, pz));
            if (j % 2 === 0) { const q = long ? R(u - len / m / 2 - 0.08, v - 0.06, u - len / m / 2 + 0.08, v + 0.12) : (alongX ? [cx + u - len / m / 2 - 0.08, cz + v - 0.06, cx + u - len / m / 2 + 0.08, cz + v + 0.12] : [cx + v - 0.06, cz + u - len / m / 2 - 0.08, cx + v + 0.12, cz + u - len / m / 2 + 0.08]); bag.add('stucco_cream', box(Math.min(q[0], q[2]), y0, Math.min(q[1], q[3]), Math.max(q[0], q[2]), y0 + fh + 0.3, Math.max(q[1], q[3]))); }
          }
        }
      }
    }
    // the little pavilions (kudu, shala) along the two long faces
    if (!el.simple) {
      const k = Math.max(2, Math.floor(w1 / 3.2));
      for (let j = 0; j < k; j++) {
        const u = -w1 / 2 + (j + 0.5) * w1 / k;
        for (const s of [-1, 1]) {
          const v = s * (d1 / 2 + 0.1), q = R(u - 0.7, v - 0.3, u + 0.7, v + 0.3), kh = Math.min(1.4, tierH * 0.6);
          // a little shrine (kudu / shala): a body, a horseshoe-arched niche, a vaulted roof with a finial
          bag.add(PAINT[(i + j + 1) % PAINT.length], box(q[0], y1 + 0.02, q[1], q[2], y1 + kh * 0.6, q[3]));
          const qa = R(u - 0.35, v - 0.32 * s - 0.02, u + 0.35, v - 0.32 * s + 0.02 + 0.62 * s);
          bag.add('stucco_cream', frustum(q, y1 + kh * 0.6, y1 + kh, alongX ? 0 : 0.6, alongX ? 0 : 0.6, alongX ? 0.25 : 0, alongX ? 0.25 : 0, { noBottom: true }));
          const nm = R(u - 0.25, v + s * 0.29, u + 0.25, v + s * 0.33);
          bag.add('opening', box(Math.min(nm[0], nm[2]), y1 + 0.12, Math.min(nm[1], nm[3]), Math.max(nm[0], nm[2]), y1 + kh * 0.5, Math.max(nm[1], nm[3])));
          void qa;
        }
      }
    }
  }
  // the crowning barrel vault (shala) and its finials
  const yv = y + base + n * tierH, vr = topD / 2;
  const prof = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8; prof.push([Math.cos(a) * vr, Math.sin(a) * vr * 1.3]); }
  const L = topW / 2;
  // the vault as a swept arch along the long axis (two triangles per strip)
  const pos = [];
  for (let k = 0; k < 8; k++) {
    const [a0, b0] = prof[k], [a1, b1] = prof[k + 1];
    const p = (u, v, hh) => { const q = alongX ? [cx + v, yv + hh, cz + u] : [cx + u, yv + hh, cz + v]; return q; };
    const A = p(-L, a0, b0), B = p(L, a0, b0), C = p(L, a1, b1), D2 = p(-L, a1, b1);
    pos.push(A, B, C, A, C, D2);
  }
  bag.add('stucco_saffron', vaultTris(pos));
  for (const s of [-1, 1]) { const r = R(s > 0 ? L - 0.3 : -L, -vr, s > 0 ? L : -L + 0.3, vr); bag.add('stucco_rose', box(r[0], yv, r[1], r[2], yv + vr * 1.25, r[3])); }
  const nk = Math.max(5, Math.round(topW / 2.2));
  for (let j = 0; j < nk; j++) { const u = -L + 0.6 + j * (2 * L - 1.2) / (nk - 1), q = alongX ? [cx, cz + u] : [cx + u, cz]; kalasha(bag, q[0], yv + vr * 1.3 - 0.1, q[1], 1.4); }
}
function vaultTris(pos) { const t = []; for (let i = 0; i < pos.length; i += 3) { t.push(...pos[i], ...pos[i + 1], ...pos[i + 2], ...pos[i], ...pos[i + 2], ...pos[i + 1]); } return fromTriangles(t); }

/** prakara: a granite enclosure wall { a, b, h, th } with a coping. */
function prakara(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 1.6, h = el.h ?? 8, y = el.y ?? 0;
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  if (r[2] - r[0] < 0.1 || r[3] - r[1] < 0.1) return;
  bag.add(el.mat || G, box(r[0], y - 0.3, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  bag.add('stucco_cream', box(r[0] - 0.2, y + h, r[1] - 0.2, r[2] + 0.2, y + h + 0.5, r[3] + 0.2));
}

/** mandapa: a pillared hall { rect, y, h, step (pillar spacing), open ('nesw' sides without wall), roof walkable }. */
function mandapa(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 6, s = el.step ?? 3.2, p = el.pillar ?? 0.6;
  bag.add(G, box(x0, y - 0.6, z0, x1, y + 0.5, z1)); col.floor([x0, z0, x1, z1], y + 0.5);
  const nx = Math.max(1, Math.round((x1 - x0) / s)), nz = Math.max(1, Math.round((z1 - z0) / s));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) {
    const edge = i === 0 || k === 0 || i === nx || k === nz;
    if (el.simple && !edge) continue;
    const x = x0 + 0.5 + i * (x1 - x0 - 1) / nx, z = z0 + 0.5 + k * (z1 - z0 - 1) / nz;
    bag.add(G, box(x - p / 2, y + 0.5, z - p / 2, x + p / 2, y + h, z + p / 2));
    bag.add(G, box(x - p * 0.85, y + h - 0.6, z - p * 0.85, x + p * 0.85, y + h, z + p * 0.85));
    col.rect([x - p / 2, z - p / 2, x + p / 2, z + p / 2], y, y + h);
  }
  bag.add(G, box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 0.8, z1 + 0.6)); col.floor([x0, z0, x1, z1], y + h + 0.8);
  bag.add('stucco_cream', box(x0 - 0.3, y + h + 0.8, z0 - 0.3, x1 + 0.3, y + h + 1.3, z1 + 0.3));
}

/** vimana: the gilded tower over a sanctum { c, s (side), h, y }: a square shrine, tiers, an octagonal dome. */
function vimana(el, { bag, col }) {
  const [x, z] = el.c, s = el.s, h = el.h, y = el.y ?? 0, b = h * 0.32;
  bag.add(G, box(x - s / 2, y, z - s / 2, x + s / 2, y + b, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  const n = 3, th = (h - b) * 0.5 / n;
  for (let i = 0; i < n; i++) { const w = s * (0.92 - i * 0.18), yy = y + b + i * th; bag.add('gilt_bronze', frustum([x - w / 2, z - w / 2, x + w / 2, z + w / 2], yy, yy + th, s * 0.05, s * 0.05, s * 0.05, s * 0.05)); }
  const yd = y + b + n * th, r = s * 0.28;
  bag.add('gilt_bronze', lathe([[r * 0.8, 0], [r * 1.1, r * 0.3], [r * 1.15, r * 0.7], [r * 0.9, r * 1.2], [r * 0.3, r * 1.5], [0.001, r * 1.55]], 8, null, x, yd, z));
  kalasha(bag, x, yd + r * 1.5, z, 1.2);
}

/** tank: a stepped temple tank { rect, y, depth, water } in a colonnade one bay deep. */
function tank(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, dep = el.depth ?? 4, steps = 10, st = dep / steps;
  for (let i = 0; i < steps; i++) {
    const m = 0.6 * i, ya = y - i * st;
    const r = [x0 + m, z0 + m, x1 - m, z1 - m], ri = [r[0] + 0.6, r[1] + 0.6, r[2] - 0.6, r[3] - 0.6];
    for (const q of [[r[0], r[1], r[2], ri[1]], [r[0], ri[3], r[2], r[3]], [r[0], ri[1], ri[0], ri[3]], [ri[2], ri[1], r[2], ri[3]]]) {
      bag.add(G, box(q[0], ya - st, q[1], q[2], ya, q[3])); col.floor(q, ya);
    }
  }
  const mi = 0.6 * steps;
  bag.add(G, box(x0 + mi, y - dep - 0.4, z0 + mi, x1 - mi, y - dep, z1 - mi));
  STYLES.qing.elements.water_rect({ rect: [x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y: y - (el.water ?? 2.2) }, ctx);
  // the lamp pillar in the middle
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('gilt_bronze', lathe([[0.3, 0], [0.25, 4], [0.6, 4.3], [0.001, 5]], 8, null, cx, y - dep, cz));
  // the colonnade round it
  for (const r of [[x0 - 6, z0 - 6, x1 + 6, z0], [x0 - 6, z1, x1 + 6, z1 + 6], [x0 - 6, z0, x0, z1], [x1, z0, x1 + 6, z1]]) mandapa({ rect: r, y, h: 5, step: 3.4, simple: el.simple }, ctx);
}

/** dhvaja: the gilded flagstaff before a shrine { c, h }. */
function dhvaja(el, { bag, col }) { const [x, z] = el.c, h = el.h ?? 12; bag.add(G, box(x - 1, 0, z - 1, x + 1, 1.2, z + 1)); bag.add('gilt_bronze', lathe([[0.3, 0], [0.18, h]], 8, null, x, 1.2, z)); col.circle(x, z, 1, 0, h); }

/** tamil_house: { rect, seed, facing ('n'|'s') }: one storey of plastered brick, a pillared verandah (thinnai) on the street, a hipped roof of terracotta tile. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.4 + rand() * 0.6, ver = 2.2, f = el.facing === 'n' ? -1 : 1;
  const zs = f > 0 ? z1 - ver : z0 + ver, core = f > 0 ? [x0, z0, x1, zs] : [x0, zs, x1, z1];
  const plaster = ['stucco_cream', 'plaster_white', 'stucco_saffron', 'stucco_sky'][Math.floor(rand() * 4)];
  bag.add(plaster, box(core[0], -0.3, core[1], core[2], h, core[3])); col.rect(core, 0, h);
  const vr = f > 0 ? [x0, zs, x1, z1] : [x0, z0, x1, zs];
  bag.add(G, box(vr[0], -0.3, vr[1], vr[2], 0.6, vr[3])); col.floor(vr, 0.6);
  const zp = f > 0 ? z1 - 0.3 : z0 + 0.3;
  if (!el.simple) for (let x = x0 + 0.3; x <= x1 - 0.2; x += (x1 - x0 - 0.6) / Math.max(1, Math.round((x1 - x0) / 2.6))) bag.add('timber', box(x - 0.12, 0.6, zp - 0.12, x + 0.12, h - 0.4, zp + 0.12));
  const rise = Math.min(x1 - x0, z1 - z0) * 0.3;
  bag.add('roof_tile', frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], h - 0.4, h - 0.4 + rise, (x1 - x0) * 0.3, (x1 - x0) * 0.3, (z1 - z0) / 2 + 0.45, (z1 - z0) / 2 + 0.45));
}

registerStyle('dravidian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, gopuram, prakara, mandapa, vimana, tank, dhvaja, tamil_house: house },
  objects: {},
});
