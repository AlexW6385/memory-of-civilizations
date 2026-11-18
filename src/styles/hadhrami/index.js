// The tower-house architecture of Shibam, Wadi Hadhramaut (docs/settlements/shibam.md §4): sun-dried mudbrick rising
// five to eleven storeys from a rubble plinth, the outer faces battered (the walls thin as they rise, the inside
// constant), brown earth plaster below and lime on the top storeys and the parapet, small windows low and larger
// carved ones high with white frames, a flat roof with parapet and corner piers, a carved door on the street.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, fromTriangles } from '../../core/geom.js';
import { houseBody, triH } from './body.js';
import { Matrix4 } from '../../core/three.js';
import { OPEN_ELEMENTS } from './open.js';
import { MOSQUE_ELEMENTS } from './mosque.js';
import { windowPieces, WIN, doorPieces, bayPieces, doorVariant, shopFront, viewPortPieces } from './parts.js';
import { houseFront } from './fronts.js';
import { hollowShell, furnishShop, furnishHall } from './shops.js';
import { dressFace, dressRoof, dressWindow, SABAT_ELEMENTS } from './dress.js';
import { GARDEN_ELEMENTS } from './garden.js';
import { YARD_ELEMENTS } from './yard.js';
import { GATE_ELEMENTS } from './gate.js';
import '../../objects/index.js';
import { GH, SH, K, topOf } from './dims.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Put the pieces of a part (mat → geometry list) at a point on a face, turned to face outward along (nx, nz). */
function put(bag, pieces, x, y, z, nx, nz, reach = 130) {
  const m = new Matrix4().makeRotationY(Math.atan2(nx, nz)).setPosition(x, y, z);
  for (const [mat, g] of pieces) bag.addInstance(mat, g, m.clone(), { reach });
}

/** A hash of a position (and a salt) into [0, 1): the same on every build. */
const hs = (x, z, s = 0) => { let h = Math.imul(Math.round(x * 16) + 0x9e3779b1, 0x85ebca6b) ^ Math.imul(Math.round(z * 16) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(s + 1, 0x27d4eb2f); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

/**
 * tower_house: { rect, front ('n'|'s'|'e'|'w'), storeys, seed, free: { n, s, e, w } (the faces seen: the others touch a
 * neighbour), white (storeys limewashed at the top), rich, towers (corner turrets: the palace) }.
 * Each house differs by rule from a hash of its own position (docs/settlements/shibam.md §14): the batter, the depth and the lower edge of the
 * lime band, the height of the parapet, the pitch of its teeth, the spacing of the windows.
 */
function towerHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, n = el.storeys;
  const free = el.free ?? { n: 1, s: 1, e: 1, w: 1 }, top = topOf(n);
  const H = (s) => hs(x0, z0, s);
  const k = K * (0.55 + 1.0 * H(1)), wh = el.white ?? (n >= 9 && H(2) < 0.35 ? 3 : n >= 8 || (n >= 6 && H(2) < 0.2) ? 2 : 1);
  const yA = top - wh * SH + (H(3) - 0.5) * 0.9, a = (f) => (f ? 1 : 0);
  el._k = k;
  const kk = [a(free.w) * k, a(free.e) * k, a(free.n) * k, a(free.s) * k];
  const ins = (y) => kk.map((q) => q * y);
  const pw = 0.08, hollow = !!(el.shop || el.hall);
  // the plinth of rubble and lime to the street's level and above
  if (!hollow) bag.add('schist_rubble', frustum([x0 - pw * a(free.w), z0 - pw * a(free.n), x1 + pw * a(free.e), z1 + pw * a(free.s)], -0.6, 1.1, 0, 0, 0, 0, { noBottom: true }));
  if (hollow) {
    hollowShell(ctx, el, el.hall ? 3.2 : (el.shop.doorW ?? 1.5), el.shop?.H ?? 2.35);
    (el.hall ? furnishHall : furnishShop)(ctx, el);
  }
  col.rect(el.rect, hollow ? GH : -1, top);
  const t = ins(top), px0 = x0 + t[0], pz0 = z0 + t[2], px1 = x1 - t[1], pz1 = z1 - t[3], pt = 0.28;
  // the parapet: its height, the cap, the teeth, the corner piers with their horns
  const ph = 0.85 + 0.3 * H(4), pier = el.towers ? 3.2 : ph + 0.45 + 0.25 * H(5);
  bag.add('lime_plaster', box(px0, top, pz0, px1, top + ph, pz0 + pt)); bag.add('lime_plaster', box(px0, top, pz1 - pt, px1, top + ph, pz1));
  bag.add('lime_plaster', box(px0, top, pz0 + pt, px0 + pt, top + ph, pz1 - pt)); bag.add('lime_plaster', box(px1 - pt, top, pz0 + pt, px1, top + ph, pz1 - pt));
  { const o = 0.045, cy = top + ph;
    bag.add('lime_plaster', box(px0 - o * a(free.w), cy, pz0 - o * a(free.n), px1 + o * a(free.e), cy + 0.06, pz0 + pt + 0.02)); bag.add('lime_plaster', box(px0 - o * a(free.w), cy, pz1 - pt - 0.02, px1 + o * a(free.e), cy + 0.06, pz1 + o * a(free.s)));
    bag.add('lime_plaster', box(px0 - o * a(free.w), cy, pz0 + pt + 0.02, px0 + pt + 0.02, cy + 0.06, pz1 - pt - 0.02)); bag.add('lime_plaster', box(px1 - pt - 0.02, cy, pz0 + pt + 0.02, px1 + o * a(free.e), cy + 0.06, pz1 - pt - 0.02));
    // the teeth along the free faces' parapets, a pitch of 0.8–1.3 m by house, each a tapering block on a lime cap
    const pitch = 1.0 + 0.5 * H(6), tw = 0.3 + 0.08 * H(7), th = 0.3 + 0.14 * H(8), tooth = (xa, za, xb, zb) => { bag.add('lime_plaster', box(xa, cy + 0.06, za, xb, cy + 0.06 + th, zb)); bag.add('lime_plaster', box(xa + 0.07, cy + 0.06 + th, za + 0.07, xb - 0.07, cy + 0.12 + th, zb - 0.07)); };
    for (let x = px0 + 0.85; x < px1 - 0.85 - tw; x += pitch) {
      if (free.n) tooth(x, pz0 + 0.02, x + tw, pz0 + pt - 0.02);
      if (free.s) tooth(x, pz1 - pt + 0.02, x + tw, pz1 - 0.02);
    }
    for (let z = pz0 + 0.85; z < pz1 - 0.85 - tw; z += pitch) {
      if (free.w) tooth(px0 + 0.02, z, px0 + pt - 0.02, z + tw);
      if (free.e) tooth(px1 - pt + 0.02, z, px1 - 0.02, z + tw);
    }
    const f0 = el.front ?? 's';
    if (free[f0] && !hollow && n >= 6) {
      const [lo, hi] = f0 === 'n' || f0 === 's' ? [px0, px1] : [pz0, pz1], c = hi - lo > 8 ? 3 : 2, nz = { n: [0, -1, pz0], s: [0, 1, pz1], w: [-1, 0, px0], e: [1, 0, px1] }[f0];
      for (let i = 0; i < c; i++) {
        const u = lo + 1.4 + (hi - lo - 2.8) * (c === 1 ? 0.5 : i / (c - 1)) + (rand() - 0.5) * 0.3;
        if (f0 === 'n' || f0 === 's') put(bag, viewPortPieces(), u, top + 0.3, nz[2], nz[0], nz[1], 60); else put(bag, viewPortPieces(), nz[2], top + 0.3, u, nz[0], nz[1], 60);
      }
    }
  }
  // the corner piers, each stepped and capped and drawn up into a horn
  for (const [cx, cz] of [[px0, pz0], [px1 - 0.55, pz0], [px0, pz1 - 0.55], [px1 - 0.55, pz1 - 0.55]]) {
    bag.add('lime_plaster', box(cx, top, cz, cx + 0.55, top + pier, cz + 0.55));
    if (!el.towers) {
      const hh = 0.25 + 0.3 * H(9);
      bag.add('lime_plaster', box(cx - 0.04, top + pier, cz - 0.04, cx + 0.59, top + pier + 0.07, cz + 0.59));
      bag.add('lime_plaster', box(cx + 0.06, top + pier + 0.07, cz + 0.06, cx + 0.49, top + pier + 0.17, cz + 0.49));
      bag.add('lime_plaster', box(cx + 0.14, top + pier + 0.17, cz + 0.14, cx + 0.41, top + pier + 0.17 + hh, cz + 0.41));
      bag.add('lime_plaster', box(cx + 0.2, top + pier + 0.17 + hh, cz + 0.2, cx + 0.35, top + pier + 0.3 + hh, cz + 0.35));
    } else bag.add('lime_plaster', box(cx - 0.05, top + pier, cz - 0.05, cx + 0.6, top + pier + 0.12, cz + 0.6));
  }
  dressRoof(ctx, el, top, [px0, pz0, px1, pz1], rand);
  // a room on the roof (a mafraj under the sky) on some houses: a lime box set back from the parapet on the side away from the stair-head, its own cap and four horns
  if (!hollow && H(11) < 0.42 && px1 - px0 > 5.2 && pz1 - pz0 > 6) {
    const rw = 2.6 + 1.6 * H(12), rd = 2.4 + 1.2 * H(13), rh = 2.2 + 0.5 * H(14), rx = px1 - rw - 0.9 - 0.5 * H(15), rz = H(16) < 0.5 ? pz0 + 1.2 : pz1 - rd - 1.2, L = 'lime_plaster';
    bag.add(L, box(rx, top, rz, rx + rw, top + rh, rz + rd)); bag.add(L, box(rx - 0.08, top + rh, rz - 0.08, rx + rw + 0.08, top + rh + 0.1, rz + rd + 0.08));
    bag.add('timber', box(rx + 0.4, top + 0.9, rz + (rz > pz0 + 3 ? rd : 0) - 0.02, rx + rw - 0.4, top + 1.7, rz + (rz > pz0 + 3 ? rd : 0) + 0.02));
    for (const [cx, cz] of [[rx - 0.08, rz - 0.08], [rx + rw - 0.2, rz - 0.08], [rx - 0.08, rz + rd - 0.2], [rx + rw - 0.2, rz + rd - 0.2]]) { bag.add(L, box(cx, top + rh + 0.1, cz, cx + 0.28, top + rh + 0.3, cz + 0.28)); bag.add(L, box(cx + 0.06, top + rh + 0.3, cz + 0.06, cx + 0.22, top + rh + 0.5, cz + 0.22)); }
  }
  const band = (y, h, p) => {
    const q = ins(y);
    if (free.n) bag.add('lime_plaster', box(x0 + q[0] - 0.02, y, z0 + q[2] - p, x1 - q[1] + 0.02, y + h, z0 + q[2]));
    if (free.s) bag.add('lime_plaster', box(x0 + q[0] - 0.02, y, z1 - q[3], x1 - q[1] + 0.02, y + h, z1 - q[3] + p));
    if (free.w) bag.add('lime_plaster', box(x0 + q[0] - p, y, z0 + q[2], x0 + q[0], y + h, z1 - q[3]));
    if (free.e) bag.add('lime_plaster', box(x1 - q[1], y, z0 + q[2], x1 - q[1] + p, y + h, z1 - q[3]));
  };
  band(top - 0.3, 0.3, 0.1);
  band(yA - 0.01, 0.16, 0.06);
  // the faces: windows by storey (their number by the face's length and the house's spacing), slits on the ground storey, the door on the front
  const faces = [['n', 0, -1, x0, x1, (u, y) => [u, y, z0 + k * a(free.n) * y]], ['s', 0, 1, x0, x1, (u, y) => [u, y, z1 - k * a(free.s) * y]], ['w', -1, 0, z0, z1, (u, y) => [x0 + k * a(free.w) * y, y, u]], ['e', 1, 0, z0, z1, (u, y) => [x1 - k * a(free.e) * y, y, u]]];
  const yOf = (s) => (s === 0 ? 0 : GH + (s - 1) * SH), spacing = (3.3 + 1.2 * H(10)) * (el.hall ? 3.0 : 1), wins = { n: [], s: [], w: [], e: [] }, placed = [];
  for (const [f, nx, nz, u0, u1, at] of faces) {
    if (!free[f]) continue;
    const L = u1 - u0, c = Math.max(1, Math.round(L / spacing));
    const front = el.front === f;
    if (front) {
      const u = el.door ?? u0 + L * (0.3 + 0.4 * rand()), p = at(u, 0); rand();
      if (el.shop && el.shop.fashion && el.shop.fashion !== 'shop') put(ctx.bag, houseFront(el.shop.fashion, el.shop.doorW, el.shop.H ?? 2.35), p[0], 0, p[2], nx, nz);
      else if (el.shop) put(ctx.bag, shopFront(el.hall ? 3.2 : 1.5, el.shop.awning ?? ['reed_mat', 'cloth_indigo', 'reed_mat', 'cloth_ochre'][(el.seed >>> 3) & 3]), p[0], 0, p[2], nx, nz);
      else if (el.hall) put(ctx.bag, shopFront(3.2, 'cloth_indigo'), p[0], 0, p[2], nx, nz);
      else put(ctx.bag, doorVariant((el.seed >>> 5) & 3), p[0], 0, p[2], nx, nz);
      el._door = u;
      dressFace(ctx, el, f, nx, nz, u, p, rand);
    }
    for (let s = 0; s < n; s++) {
      const y = yOf(s);
      for (let i = 0; i < c; i++) {
        let u = u0 + L * (i + 0.5) / c + (((s + i) & 1) ? 0.18 : -0.18) * Math.min(1, L / 8);
        if (front && s === 0 && el._door !== undefined && Math.abs(u - el._door) < 1.3) u += u < el._door ? -1.0 : 1.0;
        if (u < u0 + 0.9 || u > u1 - 0.9 || rand() < 0.08) continue;
        let kind, sy;
        if (s === 0) { kind = 'slit'; sy = 2.4; } else if (s <= 2) { kind = 'small'; sy = y + 1.35; } else { kind = (y + 0.95 > yA ? 'white' : 'big'); sy = y + 0.95; }
        if (el.rich && front && s === Math.max(3, n - 3) && i === Math.floor(c / 2)) { const p = at(u, y + 0.8); put(ctx.bag, bayPieces(), p[0] + nx * 0.02, y + 0.8, p[2] + nz * 0.02, nx, nz); continue; }
        placed.push([f, kind, u, sy, nx, nz, at]);
        if (kind !== 'slit') { const [w, h] = WIN[kind]; wins[f].push({ u, sy, w, h }); }
      }
    }
  }
  // the body: the faces around the windows' recesses
  const lowY = hollow ? GH : -1;
  const B = houseBody({ rect: el.rect, k: kk, y0: Math.max(lowY, 0), y1: top, yA, wins, hollow });
  if (B.mud) bag.add('mud_plaster', B.mud);
  if (B.lime) bag.add('lime_plaster', B.lime);
  if (B.opening) bag.add('opening', B.opening);
  if (B.earth_wall) bag.add('earth_wall', B.earth_wall);
  for (const [, kind, u, sy, nx, nz, at] of placed) {
    const p = at(u, sy);
    put(ctx.bag, windowPieces(kind), p[0], sy, p[2], nx, nz);
    if (sy > GH + 0.5) dressWindow(ctx, kind, p, sy, nx, nz, rand);
  }
  // the lime of the band's lower edge, run down the mud in tongues of uneven length where the whitewash has been laid on in strokes
  for (const [f, nx, nz, u0, u1, at] of faces) {
    if (!free[f]) continue;
    const r = rng(((el.seed ^ (f.charCodeAt(0) * 7919)) >>> 0) || 1);
    for (let u = u0 + 0.5; u < u1 - 0.5; u += 0.4 + r() * 0.55) {
      const wd = 0.1 + r() * 0.16, len = 0.2 + r() * r() * 1.1, p = at(u, yA), q = at(u - wd, yA + 0.02), q2 = at(u + wd, yA + 0.02), tip = at(u + (r() - 0.5) * 0.05, yA - len);
      const o = 0.016, g = (v) => [v[0] + nx * o, v[1], v[2] + nz * o];
      void p;
      const T = []; triH(T, g(q), g(q2), g(tip), [nx, 0, nz]);
      bag.add('lime_plaster', fromTriangles(T));
    }
  }
  // the stone of the footing: two rows of joggled stones set proud of the plinth on the faces that show, a lime ledge on its head
  if (!hollow) {
    const R = 'schist_rubble';
    for (const [f, nx, nz, u0, u1, at] of faces) {
      if (!free[f]) continue;
      const r = rng(((el.seed ^ (f.charCodeAt(0) * 104729)) >>> 0) || 1), door = el.front === f ? el._door : -1e9;
      [0.05].forEach((y, row) => {
        for (let u = u0 + 0.12 + row * 0.2; u < u1 - 0.3;) {
          const w = 0.5 + r() * 0.8, hh = 0.5 * (0.85 + r() * 0.3), ue = Math.min(u + w - 0.03, u1 - 0.1), d = 0.07 + r() * 0.05;
          if (Math.abs((u + ue) / 2 - door) > 0.95) {
            const pf = { n: z0 - pw, s: z1 + pw, w: x0 - pw, e: x1 + pw }[f], o = f === 'n' || f === 'w' ? -1 : 1, pa = pf + o * d, lo = Math.min(pf, pa), hi = Math.max(pf, pa);
            bag.add(R, f === 'n' || f === 's' ? box(u, y, lo, ue, y + hh, hi) : box(lo, y, u, hi, y + hh, ue));
          }
          u += w;
        }
      });
    }
  }
}

/** merlons: a row of small battlements along a→b at height y (the wall's head). */
function merlons(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, st = el.step ?? 1.7, h = el.h ?? 0.7, th = el.th ?? 0.9;
  for (let s = 0.2; s + 0.8 < L; s += st) {
    const cx = ax + ux * (s + 0.4), cz = az + uz * (s + 0.4);
    bag.add('mud_plaster', box(cx - Math.abs(ux) * 0.4 - Math.abs(uz) * th / 2, el.y, cz - Math.abs(uz) * 0.4 - Math.abs(ux) * th / 2, cx + Math.abs(ux) * 0.4 + Math.abs(uz) * th / 2, el.y + h, cz + Math.abs(uz) * 0.4 + Math.abs(ux) * th / 2));
  }
}

registerStyle('hadhrami', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.life?.elements, tower_house: towerHouse, merlons, ...OPEN_ELEMENTS, ...MOSQUE_ELEMENTS, ...SABAT_ELEMENTS, ...GARDEN_ELEMENTS, ...YARD_ELEMENTS, ...GATE_ELEMENTS, reserve_wall: () => {} },
  objects: {},
});
