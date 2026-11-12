// The tower-house architecture of Shibam, Wadi Hadhramaut (docs/settlements/shibam.md §4): sun-dried mudbrick rising
// five to eleven storeys from a rubble plinth, the outer faces battered (the walls thin as they rise, the inside
// constant), brown earth plaster below and lime on the top storeys and the parapet, small windows low and larger
// carved ones high with white frames, a flat roof with parapet and corner piers, a carved door on the street.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { OPEN_ELEMENTS } from './open.js';
import { MOSQUE_ELEMENTS } from './mosque.js';
import { windowPieces, doorPieces, bayPieces, doorVariant, shopFront } from './parts.js';
import { hollowShell, furnishShop, furnishHall } from './shops.js';
import { dressFace, dressRoof, dressWindow, SABAT_ELEMENTS } from './dress.js';
import { GARDEN_ELEMENTS } from './garden.js';
import '../../objects/index.js';
import { GH, SH, K, topOf } from './dims.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Put the pieces of a part (mat → geometry list) at a point on a face, turned to face outward along (nx, nz). */
function put(bag, pieces, x, y, z, nx, nz, reach = 130) {
  const m = new Matrix4().makeRotationY(Math.atan2(nx, nz)).setPosition(x, y, z);
  for (const [mat, g] of pieces) bag.addInstance(mat, g, m.clone(), { reach });
}

/**
 * tower_house: { rect, front ('n'|'s'|'e'|'w'), storeys, seed, free: { n, s, e, w } (the faces seen: the others touch a
 * neighbour), white (storeys limewashed at the top), rich, towers (corner turrets: the palace) }.
 */
function towerHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, n = el.storeys;
  const free = el.free ?? { n: 1, s: 1, e: 1, w: 1 }, top = topOf(n), wh = el.white ?? (n >= 8 ? 2 : 1);
  const yA = top - wh * SH, a = (f) => (f ? 1 : 0);
  const ins = (y) => [a(free.w) * K * y, a(free.e) * K * y, a(free.n) * K * y, a(free.s) * K * y];
  const pw = 0.08;
  // the plinth of rubble and lime to the street's level and above
  if (!el.shop && !el.hall) bag.add('schist_rubble', frustum([x0 - pw * a(free.w), z0 - pw * a(free.n), x1 + pw * a(free.e), z1 + pw * a(free.s)], -0.6, 1.1, 0, 0, 0, 0, { noBottom: true }));
  // the brown earth-plastered body, then the limewashed top storeys
  const iA = ins(yA), hollow = !!(el.shop || el.hall);
  if (hollow) {
    // the ground storey hollowed into a room, the body above standing on its ceiling
    const q0 = ins(GH);
    bag.add('mud_plaster', frustum([x0 + q0[0], z0 + q0[2], x1 - q0[1], z1 - q0[3]], GH, yA, iA[0] - q0[0], iA[1] - q0[1], iA[2] - q0[2], iA[3] - q0[3]));
    hollowShell(ctx, el, el.hall ? 3.2 : 1.5);
    (el.hall ? furnishHall : furnishShop)(ctx, el);
  } else bag.add('mud_plaster', frustum([x0, z0, x1, z1], 0, yA, ...iA, { noBottom: true }));
  const r2 = [x0 + iA[0], z0 + iA[2], x1 - iA[1], z1 - iA[3]], iT = ins(top - yA);
  bag.add('lime_plaster', frustum(r2, yA, top, ...iT, { noBottom: true }));
  col.rect(el.rect, hollow ? GH : -1, top);
  // parapet and corner piers on the roof, a lime band under it and where the lime begins
  const t = ins(top), px0 = x0 + t[0], pz0 = z0 + t[2], px1 = x1 - t[1], pz1 = z1 - t[3], pt = 0.28;
  bag.add('lime_plaster', box(px0, top, pz0, px1, top + 0.9, pz0 + pt)); bag.add('lime_plaster', box(px0, top, pz1 - pt, px1, top + 0.9, pz1));
  bag.add('lime_plaster', box(px0, top, pz0 + pt, px0 + pt, top + 0.9, pz1 - pt)); bag.add('lime_plaster', box(px1 - pt, top, pz0 + pt, px1, top + 0.9, pz1 - pt));
  const pier = el.towers ? 1.4 : 0.55;
  for (const [cx, cz] of [[px0, pz0], [px1 - 0.55, pz0], [px0, pz1 - 0.55], [px1 - 0.55, pz1 - 0.55]]) bag.add('lime_plaster', box(cx, top, cz, cx + 0.55, top + (el.towers ? 3.2 : 1.35), cz + 0.55));
  void pier;
  dressRoof(ctx, el, top, [px0, pz0, px1, pz1], rand);
  const band = (y, h, p) => {
    const q = ins(y);
    if (free.n) bag.add('lime_plaster', box(x0 + q[0] - 0.02, y, z0 + q[2] - p, x1 - q[1] + 0.02, y + h, z0 + q[2]));
    if (free.s) bag.add('lime_plaster', box(x0 + q[0] - 0.02, y, z1 - q[3], x1 - q[1] + 0.02, y + h, z1 - q[3] + p));
    if (free.w) bag.add('lime_plaster', box(x0 + q[0] - p, y, z0 + q[2], x0 + q[0], y + h, z1 - q[3]));
    if (free.e) bag.add('lime_plaster', box(x1 - q[1], y, z0 + q[2], x1 - q[1] + p, y + h, z1 - q[3]));
  };
  band(top - 0.3, 0.3, 0.1);
  if (wh) band(yA - 0.01, 0.16, 0.06);
  // the faces: windows by storey, slits on the ground storey, the door on the front
  const faces = [['n', 0, -1, x0, x1, (u, y) => [u, y, z0 + K * y]], ['s', 0, 1, x0, x1, (u, y) => [u, y, z1 - K * y]], ['w', -1, 0, z0, z1, (u, y) => [x0 + K * y, y, u]], ['e', 1, 0, z0, z1, (u, y) => [x1 - K * y, y, u]]];
  const yOf = (s) => (s === 0 ? 0 : GH + (s - 1) * SH);
  for (const [f, nx, nz, u0, u1, at] of faces) {
    if (!free[f]) continue;
    const L = u1 - u0, c = L < 5.2 ? 1 : L < 8.4 ? 2 : 3;
    const front = el.front === f;
    // the door on the front: off the middle, a step up
    if (front) {
      const u = el.door ?? u0 + L * (0.3 + 0.4 * rand()), p = at(u, 0); rand();
      if (el.shop) put(ctx.bag, shopFront(el.hall ? 3.2 : 1.5, el.shop.awning ?? ['reed_mat', 'cloth_indigo', 'reed_mat', 'cloth_ochre'][(el.seed >>> 3) & 3]), p[0], 0, p[2], nx, nz);
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
        if (s === 0) { kind = 'slit'; sy = 2.4; } else if (s <= 2) { kind = 'small'; sy = y + 1.35; } else { kind = s >= n - 2 ? 'white' : 'big'; sy = y + 0.95; }
        if (el.rich && front && s === Math.max(3, n - 3) && i === Math.floor(c / 2)) { const p = at(u, y + 0.8); put(ctx.bag, bayPieces(), p[0] + nx * 0.02, y + 0.8, p[2] + nz * 0.02, nx, nz); continue; }
        const p = at(u, sy);
        put(ctx.bag, windowPieces(kind), p[0], sy, p[2], nx, nz);
        if (s >= 1) dressWindow(ctx, kind, p, sy, nx, nz, rand);
      }
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
  elements: { ...STYLES.life?.elements, tower_house: towerHouse, merlons, ...OPEN_ELEMENTS, ...MOSQUE_ELEMENTS, ...SABAT_ELEMENTS, ...GARDEN_ELEMENTS, reserve_wall: () => {} },
  objects: {},
});
