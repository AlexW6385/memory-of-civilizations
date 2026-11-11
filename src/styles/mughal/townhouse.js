// The town houses of Taj Ganj (docs/settlements/mughal-agra.md §12, §14): plastered brick of two or three storeys on
// a lot with its front on the street, built in a local frame (front at z = 0 facing +z, the body behind it at −z,
// x along the frontage) and turned onto the street by `frameOf`. Ground floors on the bazaar streets are open
// shops: a raised platform (thara) behind a verandah of columns, the goods set out, a striped cloth awning, and
// behind it the shop's room — shelved on three walls, the keeper's seat (gaddi) with his ledger, a stair at one
// side to the room over it (a charpoy, a chest, the family's things; its windows latticed). The other houses
// have the street door in its sandstone frame, a third of them shut, the rest standing open on a room with its
// hearth, charpoys and water jars. Upstairs on every front: a continuous chhajja (a stone eave on brackets) at
// the floor line, a jharokha (bracketed oriel with latticed windows and a domed or slab roof) over the door or
// the middle of the shop — or on some, an open loggia, or plain shuttered windows —, a cornice, a parapet with
// merlons (kangura), on the roof the stair head (mumty) and sometimes a chhatri. Wall washes of five colours;
// plaster fallen from the lower walls to show the brick, rain streaks under the sills, damp at the foot, soot over
// the lamp niches.

import { box, lathe, place, fromTriangles } from '../../core/geom.js';
import * as F from './furnish.js';

const R = 'sandstone_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The frame of a lot rect [x0,z0,x1,z1] whose front is on side 'n'|'s'|'e'|'w': origin, yaw, frontage W, depth D, and local→world maps. */
export function frameOf(rect, front = 's') {
  const [x0, z0, x1, z1] = rect, xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
  const f = front === 's' ? { ox: xc, oz: z1, yaw: 0, W: x1 - x0, D: z1 - z0 }
    : front === 'n' ? { ox: xc, oz: z0, yaw: Math.PI, W: x1 - x0, D: z1 - z0 }
      : front === 'e' ? { ox: x1, oz: zc, yaw: Math.PI / 2, W: z1 - z0, D: x1 - x0 }
        : { ox: x0, oz: zc, yaw: -Math.PI / 2, W: z1 - z0, D: x1 - x0 };
  const c = Math.cos(f.yaw), s = Math.sin(f.yaw);
  f.pt = (lx, lz) => [f.ox + lx * c + lz * s, f.oz - lx * s + lz * c];
  f.rect = (r) => { const a = f.pt(r[0], r[1]), b = f.pt(r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  f.dir = (a) => a - f.yaw;                                     // a local yaw as a world yaw is a + f.yaw (see `world`)
  f.world = (a) => a + f.yaw;
  /** The compass letter ('n'|'s'|'e'|'w') of a local direction (ax, az): the way up of a stair in the local frame. */
  f.compass = (ax, az) => { const wx = ax * c + az * s, wz = -ax * s + az * c; return Math.abs(wx) > Math.abs(wz) ? (wx > 0 ? 'e' : 'w') : (wz > 0 ? 's' : 'n'); };
  return f;
}

const GOODS = ['cloth', 'carpets', 'brass', 'spice', 'pots', 'cloth'];
export const tradeOf = (seed) => GOODS[seed % GOODS.length];
export const FH = 3.5, UH = 3.1, T = 0.4;
const WASHES = ['stucco_warm', 'lime_plaster', 'sandstone_red', 'stucco_ochre', 'stucco_rose', 'stucco_cream'];

/**
 * What a lot's house is, from its seed: storeys, wall wash, the front (jharokha | loggia | plain), the door's place, whether
 * the door stands open on a room. One place for the builder (below) and for the dressing of its front (the settlement's fronts.js).
 */
export function layoutOf(el) {
  const r = rng(((el.seed || 1) * 7 + 3) >>> 0), f = frameOf(el.rect, el.front ?? 's'), { W, D } = f, hw = W / 2, shop = !!el.shop;
  const st = el.storeys ?? (r() < 0.5 ? 2 : 3), q = r();
  const mat = el.wash ?? WASHES[q < 0.2 ? 0 : q < 0.4 ? 1 : q < 0.55 ? 2 : q < 0.75 ? 3 : q < 0.9 ? 4 : 5];
  const variant = shop ? (r() < 0.25 ? 'loggia' : 'jharokha') : (r() < 0.35 ? 'plain' : 'jharokha');
  const dx = shop ? 0 : Math.max(-hw + 1.6, Math.min(hw - 1.6, (r() - 0.5) * (W - 3.4)));
  const enter = shop || (r() < 0.55 && D >= 9.5 && W >= 5.4);
  return { f, W, D, hw, shop, st, H: FH + (st - 1) * UH, mat, accent: mat === 'sandstone_red' ? 'marble' : R, variant, dx, enter, sx: r() < 0.5 ? -1 : 1, chh: r() < 0.4 && W > 6.5, dome: r() < 0.6, trade: shop ? GOODS[(el.seed + 0) % 6] : null, r };
}

/** A quad strip of cloth sloping from (x, y0, z0) to (x, y1, z1), width w, both faces. */
function slope(B, mat, x, w, y0, z0, y1, z1) {
  const a = [x, y0, z0], b = [x + w, y0, z0], c = [x + w, y1, z1], d = [x, y1, z1];
  B.add(mat, fromTriangles([...a, ...c, ...b, ...a, ...d, ...c]));
  B.add(mat, fromTriangles([...a, ...b, ...c, ...a, ...c, ...d].map((v, i) => v + (i % 3 === 1 ? -0.012 : 0))));
}

export function townHouse(el, { bag, col }) {
  const L = layoutOf(el), { f, W, D, hw, shop, st, H, mat, accent, variant, dx, enter } = L, rand = L.r;
  const B = { add: (m, g) => bag.add(m, place(g, f.ox, 0, f.oz, f.yaw)) };
  const C = { rect: (r, y0, y1) => col.rect(f.rect(r), y0, y1), floor: (r, y) => col.floor(f.rect(r), y), circle: (x, z, r, y0, y1) => { const [wx, wz] = f.pt(x, z); col.circle(wx, wz, r, y0, y1); },
    ramp: (r, y0, y1, ax, az) => col.ramp(f.rect(r), y0, y1, f.compass(ax, az)) };
  const none = [];                                                   // lamps in the rooms carry no lights (a light for each house is too many)
  const ZF = 2.4;                                                    // the verandah's depth
  const lining = 'lime_plaster';
  // ── the body ─────────────────────────────────────────────────────────────────────────────────────────────────
  /** A wall of the front at z ∈ [−0.5, 0] from y0 to y1 across the width with holes [x0, x1, b, t] (sill and head heights) cut. */
  const frontWall = (y0, y1, holes, z0 = -0.5) => {
    const hs = [...holes].sort((a, b) => a[0] - b[0]); let x = -hw + T;
    const piece = (a, b, ya, yb) => { if (b - a > 0.01 && yb - ya > 0.01) { B.add(mat, box(a, ya, z0, b, yb, 0)); C.rect([a, z0, b, 0], ya, yb); } };
    for (const [a, b, bb, tt] of hs) { piece(x, a, y0, y1); piece(a, b, y0, bb); piece(a, b, tt, y1); x = b; }
    piece(x, hw - T, y0, y1);
  };
  const roomWalls = (y0, y1, z1 = 0) => {                            // the side walls and the back wall of a room
    B.add(mat, box(-hw, y0, -D, -hw + T, y1, z1)); B.add(mat, box(hw - T, y0, -D, hw, y1, z1)); B.add(mat, box(-hw + T, y0, -D, hw - T, y1, -D + T));
    C.rect([-hw, -D, -hw + T, z1], y0, y1); C.rect([hw - T, -D, hw, z1], y0, y1); C.rect([-hw + T, -D, hw - T, -D + T], y0, y1);
  };
  const hole = { x0: -hw + T, x1: -hw + T + 1.05, z0: -D + T, z1: -D + T + 2.1 };   // the stair's well in the ceiling
  const slab = (y, withHole) => {                                    // a ceiling slab (the floor of the room above): joists under it
    const zr = -0.4;
    if (!withHole) { B.add(mat, box(-hw + T, y - 0.25, -D + T, hw - T, y, zr)); C.floor([-hw + T, -D + T, hw - T, zr], y); }
    else {
      B.add(mat, box(-hw + T, y - 0.25, hole.z1, hw - T, y, zr)); B.add(mat, box(hole.x1, y - 0.25, -D + T, hw - T, y, hole.z1));
      C.floor([-hw + T, hole.z1, hw - T, zr], y); C.floor([hole.x1, -D + T, hw - T, hole.z1], y);
    }
    for (let z = -D + T + 0.9; z < zr - 0.2; z += 1.1) if (!withHole || z > hole.z1 + 0.1) B.add('wood_dark', box(-hw + T, y - 0.4, z - 0.07, hw - T, y - 0.25, z + 0.07));
  };
  const ground = shop ? 0.34 : 0.04;                                 // the floor of the ground room
  if (shop) {
    roomWalls(0, FH);
    B.add(R, box(-hw + T, 0, -D + T, hw - T, 0.34, -0.06)); C.floor([-hw + T, -D + T, hw - T, -0.06], 0.34);   // the platform runs through to the back
    B.add('marble', box(-hw + T, 0.34, -0.1, hw - T, 0.37, -0.06));
    slab(FH, st > 1);
    if (st > 1) {
      // the room over the shop: walls, the front wall with its windows cut through, the slab (a roof on two storeys)
      const HL = FH + UH, loggia = variant === 'loggia';
      roomWalls(FH, HL);
      const holes = [];
      if (loggia) holes.push([-hw + 0.7, hw - 0.7, FH + 0.12, FH + 2.5]);
      else for (let x = -hw + 1.3; x < hw - 0.8; x += 2.5) if (Math.abs(x) >= 2.1) holes.push([x - 0.4, x + 0.4, FH + 0.75, FH + 2.1]);
      // (the middle of the front is the jharokha's: its door set in the wall, shut)
      frontWall(FH, HL, holes);
      if (st === 3) { B.add(mat, box(-hw, HL, -D, hw, H, 0)); C.rect([-hw, -D, hw, 0], HL, H); }
      B.add(mat, box(-hw + T, HL - 0.25, -D + T, hw - T, HL, -0.5)); C.floor([-hw + T, -D + T, hw - T, -0.5], HL);
      for (let z = -D + T + 0.9; z < -1.0; z += 1.1) B.add('wood_dark', box(-hw + T, HL - 0.4, z - 0.07, hw - T, HL - 0.25, z + 0.07));
      if (st === 2) { /* the slab is the roof: the parapet stands on it below */ }
    }
  } else if (enter) {
    roomWalls(0, FH);
    B.add('mud_plaster', box(-hw + T, 0, -D + T, hw - T, ground, -0.02)); C.floor([-hw + T, -D + T, hw - T, -0.02], ground);
    const holes = [[dx - 0.75, dx + 0.75, 0, 2.4]];
    const wx = dx > 0 ? -hw + (dx + hw) / 2 : hw - (hw - dx) / 2;
    if (Math.abs(wx - dx) > 2.2) holes.push([wx - 0.35, wx + 0.35, 1.5, 2.3]);
    frontWall(0, FH, holes);
    slab(FH, false);
    if (st > 1) { B.add(mat, box(-hw, FH, -D, hw, H, 0)); C.rect([-hw, -D, hw, 0], FH, H); }
  } else {
    B.add(mat, box(-hw, 0, -D, hw, H, 0));
    C.rect([-hw, -D, hw, 0], 0, H);
  }
  C.floor([-hw, -D, hw, 0], H);
  // the parapet round the roof, a cornice on the front, merlons along the front and the sides
  const PT = 0.3, PH = 0.9;
  B.add(mat, box(-hw - 0.05, H, -0.3, hw + 0.05, H + PH, 0)); B.add(mat, box(-hw - 0.05, H, -D, hw + 0.05, H + PH, -D + PT));
  B.add(mat, box(-hw - 0.05, H, -D + PT, -hw + PT, H + PH, -0.3)); B.add(mat, box(hw - PT, H, -D + PT, hw + 0.05, H + PH, -0.3));
  B.add(accent, box(-hw - 0.1, H - 0.28, -0.14, hw + 0.1, H, 0.12)); B.add(accent, box(-hw - 0.14, H + PH, -0.36, hw + 0.14, H + PH + 0.08, 0.04));
  for (let x = -hw + 0.45; x < hw - 0.3; x += 0.9) B.add(accent, box(x - 0.24, H + PH + 0.08, -0.3, x + 0.24, H + PH + 0.5, -0.02));
  for (const s of [-1, 1]) for (let z = -D + 1.2; z < -0.8; z += 1.5) B.add(accent, box(s < 0 ? -hw : hw - PT, H + PH, z - 0.22, s < 0 ? -hw + PT : hw, H + PH + 0.4, z + 0.22));
  // ── the door (houses) or the shop's verandah ──────────────────────────────────────────────────────────────────
  if (!shop) {
    B.add(R, box(dx - 0.95, 0, -0.02, dx - 0.75, 2.6, 0.1)); B.add(R, box(dx + 0.75, 0, -0.02, dx + 0.95, 2.6, 0.1)); B.add(R, box(dx - 0.95, 2.4, -0.02, dx + 0.95, 2.75, 0.12));
    if (!enter) {
      B.add('wood_dark', box(dx - 0.75, 0.15, -0.02, dx - 0.01, 2.4, 0.05)); B.add('wood_dark', box(dx + 0.01, 0.15, -0.02, dx + 0.75, 2.4, 0.05));
      for (let i = 0; i < 4; i++) for (const u of [-0.5, -0.2, 0.2, 0.5]) B.add('iron', box(dx + u - 0.02, 0.5 + i * 0.5, 0.05, dx + u + 0.02, 0.54 + i * 0.5, 0.07));
    } else {
      // the door stands open: its leaves swung back against the reveal, the studs on their outer faces
      for (const s of [-1, 1]) { B.add('wood_dark', box(dx + s * 0.75 - (s < 0 ? 0 : 0.05), 0.15, -0.5, dx + s * 0.75 + (s < 0 ? 0.05 : 0), 2.4, -0.02)); for (let i = 0; i < 4; i++) B.add('iron', box(dx + s * 0.75 - 0.03 + (s < 0 ? -0.0 : 0), 0.5 + i * 0.5, -0.4 - (i % 2) * 0.05, dx + s * 0.75 + 0.03, 0.54 + i * 0.5, -0.36 - (i % 2) * 0.05)); }
      B.add('wood_dark', box(dx - 0.75, 0, -0.5, dx + 0.75, 0.04, -0.02));
    }
    B.add(R, box(dx - 1.0, 0, 0, dx + 1.0, 0.15, 0.45));
    // a little chhajja over the door on two brackets, a lattice window beside it
    B.add(R, box(dx - 1.2, 2.75, 0, dx + 1.2, 2.9, 0.65));
    for (const s of [-1, 1]) B.add(R, box(dx + s * 0.95 - 0.07, 2.35, 0, dx + s * 0.95 + 0.07, 2.75, 0.4));
    const wx = dx > 0 ? -hw + (dx + hw) / 2 : hw - (hw - dx) / 2;
    if (Math.abs(wx - dx) > 2.2) { B.add('lattice', box(wx - 0.35, 1.5, 0, wx + 0.35, 2.3, 0.04)); B.add(R, box(wx - 0.45, 1.4, 0, wx + 0.45, 1.5, 0.16)); B.add(R, box(wx - 0.45, 2.3, 0, wx + 0.45, 2.42, 0.1));
      // the lamp niche beside the door's side, soot above it
      const nx = dx > 0 ? hw - 0.5 : -hw + 0.5;
      if (Math.abs(nx - wx) > 1.0) { B.add('wood_dark', box(nx - 0.14, 1.45, 0, nx + 0.14, 1.78, 0.05)); B.add('plaster_grey', box(nx - 0.11, 1.78, 0, nx + 0.11, 2.2, 0.016)); }
    }
    // the foot of the walls, darkened by the lane's dust
    const hh = 0.6 + rand() * 0.5;
    B.add('earth_wall', box(-hw, 0, 0.016, dx - 1.0, hh, 0.032)); B.add('earth_wall', box(dx + 1.0, 0, 0.016, hw, hh, 0.032));
    // the plaster fallen from the lower wall: the brick showing in two or three ragged patches, a stain of damp over the foot
    for (let k = 0; k < 2 + (rand() < 0.5 ? 1 : 0); k++) {
      const px = -hw + 0.4 + rand() * (W - 0.8);
      if (Math.abs(px - dx) < 1.5 || Math.abs(px - wx) < 0.6) continue;
      const pw = 0.35 + rand() * 0.6, ph = 0.3 + rand() * 0.5, py = 0.5 + rand() * 1.1;
      B.add('brick', box(px - pw / 2, py, 0.0, px + pw / 2, py + ph, 0.02)); B.add('brick', box(px - pw * 0.3, py + ph * 0.6, 0.0, px + pw * 0.55, py + ph * 1.1, 0.024));
    }
    B.add('plaster_damp', box(-hw + 0.1, hh, 0.0, dx - 1.0, hh + 0.4 + rand() * 0.3, 0.02));
  } else {
    // columns of the verandah with brackets and a beam, the shelves at the back (and along the right-hand wall)
    const n = Math.max(1, Math.round((W - 0.8) / 2.7)), bw = (W - 0.8) / n;
    B.add('wood_dark', box(-hw + 0.4, FH - 0.38, -0.4, hw - 0.4, FH, -0.02));
    for (let i = 0; i <= n; i++) {
      const x = -hw + 0.4 + i * bw;
      if (i > 0 && i < n) {
        B.add(R, lathe([[0.17, 0], [0.12, 0.14], [0.1, 0.5], [0.1, FH - 1.05], [0.16, FH - 0.85], [0.2, FH - 0.72], [0.2, FH - 0.36]], 8, null, x, 0.34, -0.22));
        C.circle(x, -0.22, 0.2, 0, FH);
      }
      B.add('wood_dark', box(x - 0.3, FH - 0.6, -0.4, x + 0.3, FH - 0.38, -0.02));
    }
    shopRoom(B, C, L, el);
    // the cloth awning: stripes sloping from the beam out over the street
    if (rand() < 0.65) {
      const cs = [['cloth_red', 'cloth_white'], ['cloth_indigo', 'cloth_ochre'], ['cloth_green', 'cloth_white'], ['cloth_ochre', 'cloth_red']][Math.floor(rand() * 4)];
      const sw = (W - 0.8) / Math.round((W - 0.8) / 0.55);
      for (let x = -hw + 0.4, k = 0; x < hw - 0.41; x += sw, k++) slope(B, cs[k % 2], x, sw, FH - 0.15, 0.02, FH - 0.75, 1.5);
    }
    // the plaster fallen from the upper front, rain streaks from the sills, soot above the beam
    for (let k = 0; k < 2; k++) { const px = -hw + 0.5 + rand() * (W - 1), pw = 0.4 + rand() * 0.6, py = FH + 0.3 + rand() * 1.2; if (st < 2 || Math.abs(px) < 1.6) continue; B.add('brick', box(px - pw / 2, py, 0, px + pw / 2, py + 0.45, 0.02)); B.add('brick', box(px - pw * 0.2, py + 0.3, 0, px + pw * 0.5, py + 0.75, 0.024)); }
    B.add('plaster_grey', box(-hw + 0.4, FH + 0.12, 0.0, hw - 0.4, FH + 0.5, 0.018));
  }
  // ── upstairs: the chhajja at the floor line on brackets; jharokha, loggia or shutters; windows ─────────────────────────
  if (st > 1) {
    B.add(R, box(-hw - 0.1, FH - 0.02, 0, hw + 0.1, FH + 0.12, 0.55));
    for (let x = -hw + 0.6; x < hw - 0.3; x += 1.2) { B.add(R, box(x - 0.07, FH - 0.5, 0, x + 0.07, FH - 0.02, 0.1)); B.add(R, box(x - 0.07, FH - 0.5, 0, x + 0.07, FH - 0.38, 0.35)); }
    const jx = shop ? 0 : dx, y0 = FH + 0.55;
    if (variant === 'jharokha') {
      B.add(R, box(jx - 1.45, y0 - 0.22, 0, jx + 1.45, y0, 1.15));
      for (const [yy, d, w] of [[0.2, 0.95, 1.3], [0.4, 0.65, 1.0], [0.58, 0.35, 0.65]]) B.add(R, box(jx - w, y0 - 0.22 - yy, 0, jx + w, y0 - 0.22 - yy + 0.2, d));
      for (const px of [-1.28, -0.43, 0.43, 1.28]) B.add(R, box(jx + px - 0.07, y0, 0.98, jx + px + 0.07, y0 + 1.9, 1.12));
      for (const [a, b] of [[-1.28, -0.43], [-0.43, 0.43], [0.43, 1.28]]) {
        B.add(R, box(jx + a + 0.07, y0, 1.0, jx + b - 0.07, y0 + 0.75, 1.1)); B.add('lattice', box(jx + a + 0.07, y0 + 0.75, 1.03, jx + b - 0.07, y0 + 1.75, 1.07)); B.add(R, box(jx + a + 0.07, y0 + 1.75, 1.0, jx + b - 0.07, y0 + 1.9, 1.1));
      }
      for (const s of [-1, 1]) { B.add('lattice', box(jx + s * 1.2, y0 + 0.75, 0.15, jx + s * 1.2 + 0.04, y0 + 1.75, 0.95)); B.add(R, box(jx + s * 1.2 - 0.03, y0, 0.1, jx + s * 1.2 + 0.07, y0 + 0.75, 1.0)); }
      B.add('wood_dark', box(jx - 1.1, y0 + 0.2, 0.002, jx + 1.1, y0 + 1.8, 0.03));
      B.add(R, box(jx - 1.45, y0 + 1.9, 0, jx + 1.45, y0 + 2.1, 1.22));
      if (L.dome) {
        B.add('marble', lathe([[1.05, 0], [1.22, 0.16], [0.8, 0.5], [0.32, 0.85], [0.001, 1.05]], 12, null, jx, y0 + 2.1, 0.55));
        B.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.2], [0.001, 0.26]], 6, null, jx, y0 + 3.15, 0.55));
      } else {
        // a flat slab roof edged with a row of little merlons and a lotus-bud at the middle
        B.add(accent, box(jx - 1.5, y0 + 2.1, -0.02, jx + 1.5, y0 + 2.22, 1.26));
        for (let k = -3; k <= 3; k++) B.add(accent, box(jx + k * 0.42 - 0.12, y0 + 2.22, 1.06, jx + k * 0.42 + 0.12, y0 + 2.5, 1.24));
        B.add('marble', lathe([[0.2, 0], [0.16, 0.12], [0.001, 0.4]], 8, null, jx, y0 + 2.22, 0.6));
      }
    } else if (variant === 'plain') {
      // no oriel: a wide window with a latticed screen between two shuttered leaves, a stone sill on brackets
      B.add(R, box(jx - 1.0, y0 - 0.12, 0, jx + 1.0, y0, 0.55));
      for (const s of [-1, 1]) B.add(R, box(jx + s * 0.8 - 0.06, y0 - 0.5, 0, jx + s * 0.8 + 0.06, y0 - 0.12, 0.3));
      B.add('lattice', box(jx - 0.62, y0 + 0.1, 0, jx + 0.62, y0 + 1.6, 0.04)); B.add(R, box(jx - 0.74, y0, 0, jx + 0.74, y0 + 0.1, 0.14)); B.add(R, box(jx - 0.74, y0 + 1.6, 0, jx + 0.74, y0 + 1.75, 0.14));
      const sh = (jx * 7 | 0) % 2 ? 'shutter_green' : 'shutter_brown';
      for (const s of [-1, 1]) B.add(sh, box(jx + s * 0.62 - (s < 0 ? 0.0 : 0), y0 + 0.1, 0.0, jx + s * 0.62 + s * 0.04, y0 + 1.6, 0.5));
      B.add(R, lathe([[0.74, 0], [0.7, 0.1], [0.001, 0.4]], 10, null, jx, y0 + 1.75, 0.05));
    } else {
      // the loggia: four columns and a beam, a low screen of lattice between them, the eave over, a pendant lamp
      const xs = [-hw + 0.75, -hw / 3, hw / 3, hw - 0.75].map((v, i) => i === 0 ? -hw + 0.7 : i === 3 ? hw - 0.7 : v);
      B.add(R, box(-hw + 0.5, FH + 0.12, 0, hw - 0.5, FH + 0.2, 0.7));
      for (const x of xs) B.add(R, lathe([[0.16, 0], [0.11, 0.12], [0.09, 0.5], [0.09, 2.1], [0.15, 2.3], [0.2, 2.4]], 8, null, x, FH + 0.2, 0.35));
      B.add('wood_dark', box(-hw + 0.5, FH + 2.5, 0.12, hw - 0.5, FH + 2.75, 0.58));
      for (let i = 0; i < 3; i++) { B.add(R, box(xs[i] + 0.14, FH + 0.2, 0.3, xs[i + 1] - 0.14, FH + 0.9, 0.4)); B.add('lattice', box(xs[i] + 0.16, FH + 0.9, 0.33, xs[i + 1] - 0.16, FH + 1.05, 0.37)); }
      B.add(R, box(-hw + 0.45, FH + 2.75, 0, hw - 0.45, FH + 2.95, 0.8));
      B.add('gilt_bronze', lathe([[0.06, 0], [0.1, 0.12], [0.001, 0.22]], 8, null, 0, FH + 2.5, 0.35));
    }
    // windows on every upper floor, clear of the jharokha (the shop's first floor's are cut through, see above)
    for (let s = 1; s < st; s++) {
      const yb = FH + (s - 1) * UH + 0.75;
      for (let x = -hw + 1.3; x < hw - 0.8; x += 2.5) {
        if (Math.abs(x - jx) < (variant === 'plain' ? 1.9 : 2.1) && s === 1) continue;
        if (variant === 'loggia' && s === 1) continue;
        B.add('lattice', box(x - 0.4, yb, 0, x + 0.4, yb + 1.35, 0.04));
        B.add(R, box(x - 0.55, yb - 0.12, 0, x + 0.55, yb, 0.22)); B.add(R, box(x - 0.55, yb + 1.35, 0, x + 0.55, yb + 1.5, 0.14));
        for (const q of [-1, 1]) B.add(R, box(x + q * 0.47 - 0.05, yb, 0, x + q * 0.47 + 0.05, yb + 1.35, 0.08));
        B.add(R, lathe([[0.4, 0], [0.36, 0.1], [0.001, 0.26]], 8, null, x, yb + 1.5, 0.05));
        // rain running down from the sill
        if (rand() < 0.7) B.add('plaster_streak', box(x - 0.3 + rand() * 0.1, yb - 1.2 - rand() * 0.5, 0, x + 0.2, yb - 0.12, 0.018));
      }
      if (s > 1) B.add(accent, box(-hw - 0.05, FH + (s - 1) * UH - 0.1, 0, hw + 0.05, FH + (s - 1) * UH + 0.05, 0.12));
    }
  }
  // ── on the roof: the stair head, sometimes a chhatri at a corner ───────────────────────────────────────────────────
  const sx = L.sx, sxc = sx * (hw - 1.6);
  if (D > 7) { B.add(mat, box(sxc - 1, H, -D + 1.4, sxc + 1, H + 2.3, -D + 3.4)); B.add(accent, box(sxc - 1.1, H + 2.3, -D + 1.3, sxc + 1.1, H + 2.42, -D + 3.5)); B.add('wood_dark', box(sxc - 0.4, H, -D + 3.4, sxc + 0.4, H + 1.8, -D + 3.43)); C.rect([sxc - 1, -D + 1.4, sxc + 1, -D + 3.4], H, H + 2.4); }
  if (L.chh) {
    const cx = -sx * (hw - 1.5), cz = -D + 2.2, y = H;
    B.add(accent, box(cx - 0.9, y, cz - 0.9, cx + 0.9, y + 0.15, cz + 0.9));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add(accent, box(cx + a * 0.75 - 0.07, y + 0.15, cz + b * 0.75 - 0.07, cx + a * 0.75 + 0.07, y + 2.0, cz + b * 0.75 + 0.07));
    B.add(accent, box(cx - 0.95, y + 2.0, cz - 0.95, cx + 0.95, y + 2.12, cz + 0.95));
    B.add('marble', lathe([[0.95, 0], [1.0, 0.12], [0.7, 0.45], [0.25, 0.75], [0.001, 0.9]], 10, null, cx, y + 2.12, cz));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) C.circle(cx + a * 0.75, cz + b * 0.75, 0.1, y, y + 2.2);
  }
}

// ── the shop's room and the room over it ──────────────────────────────────────────────────────────────────────────────
function shopRoom(B, C, L, el) {
  const { hw, D, st, trade } = L, rand = L.r, none = [], FY = 0.34;
  const lining = 'lime_plaster';
  const sd = el.seed | 0;
  // plaster on the inside of the walls, the lower part darkened by hands and sacks
  B.add(lining, box(-hw + T, FY, -D + T, -hw + T + 0.03, FH - 0.25, -0.4)); B.add(lining, box(hw - T - 0.03, FY, -D + T, hw - T, FH - 0.25, -0.4)); B.add(lining, box(-hw + T + 0.03, FY, -D + T, hw - T - 0.03, FH - 0.25, -D + T + 0.03));
  B.add('earth_wall', box(-hw + T + 0.03, FY, -D + T + 0.03, hw - T - 0.03, FY + 0.5, -D + T + 0.05));
  // the shelves along the back wall: boards on posts with the trade's wares; along the right-hand wall as far as the keeper's seat
  const goods = (g, x, y, z, rot, i) => {
    if (g === 'cloth') F.bolts(B, x, y, z, 5, rot);
    else if (g === 'carpets') F.rolledCarpets(B, x, y, z, 3, 1.0, rot + Math.PI / 2);
    else if (g === 'brass') F.copperware(B, x, y, z, 0, sd + i, 3);
    else if (g === 'spice') F.spiceSacks(B, x, y, z, 0, 3);
    else F.pots(B, x, y, z, 0, 3);
  };
  const nBack = Math.max(2, Math.floor((hw * 2 - 2 * T) / 1.6));
  for (let i = 0; i < nBack; i++) {
    const x = -hw + T + 0.2 + (i + 0.5) * ((hw * 2 - 2 * T - 0.4) / nBack);
    const g = trade, bw = (hw * 2 - 2 * T - 0.4) / nBack;
    for (const y of [1.0, 1.65, 2.3]) B.add('wood_dark', box(x - bw / 2 + 0.05, y, -D + T + 0.03, x + bw / 2 - 0.05, y + 0.05, -D + T + 0.4));
    for (const x1 of [-1, 1]) B.add('wood_dark', box(x + x1 * (bw / 2 - 0.05) - 0.025, FY, -D + T + 0.03, x + x1 * (bw / 2 - 0.05) + 0.025, 2.4, -D + T + 0.06));
    goods(g, x, 1.05, -D + T + 0.22, 0, i); goods(g, x, 1.7, -D + T + 0.22, 0, i + 4); if (i % 2) goods(rand() < 0.5 ? 'pots' : g, x, 2.35, -D + T + 0.22, 0, i + 8);
    goods(g, x, FY, -D + T + 0.55 + (i % 2) * 0.1, 0, i + 3);
  }
  // the right-hand wall: shelves with pots and jars, sacks on the floor below, up to the gaddi
  const zs = -D + T + 1.0;
  for (let z = zs; z < -4.6; z += 1.5) {
    for (const y of [1.0, 1.65]) B.add('wood_dark', box(hw - T - 0.4, y, z - 0.6, hw - T - 0.03, y + 0.05, z + 0.6));
    F.pots(B, hw - T - 0.22, 1.05, z, 0, 3, ['terracotta', 'glaze_white', 'glaze_blue']); F.pots(B, hw - T - 0.22, 1.7, z, 0, 2);
    F.bale(B, hw - T - 0.4, FY, z, 0.5, 0.45, 0.8, 0, ['sacking', 'cloth_white', 'cloth_ochre'][Math.floor(rand() * 3)]);
  }
  // the keeper's seat: a low dais with a white sheet, bolster, the ledger on its stand, lamp, hookah, a brass tray, scales
  const gz = -3.4, gx = Math.min(hw - T - 1.4, 0.8);
  B.add(R, box(gx - 1.05, FY, gz - 0.8, gx + 1.05, FY + 0.22, gz + 0.8)); C.rect([gx - 1.05, gz - 0.8, gx + 1.05, gz + 0.8], FY, FY + 0.22);
  F.cushion(B, gx, FY + 0.22, gz, 1.9, 1.5, 0.05, 0, 'cloth_white'); F.bolster(B, gx + 0.4, FY + 0.27, gz - 0.55, 0.9, 0.13, 0.0, 'cloth_red', 'cloth_ochre');
  F.rahle(B, gx - 0.45, FY + 0.22, gz + 0.1, Math.PI, {}); F.oilLamp(B, none, gx + 0.9, FY + 0.22, gz + 0.55, 'bronze', 0); F.hookah(B, gx - 0.8, FY + 0.22, gz - 0.2, 0.5);
  F.waterJar(B, hw - T - 0.4, FY, -2.0, 0.8, 'terracotta');
  // the beam over the seat with the pans of the scales (tarazu) hung on cords
  B.add('wood_dark', box(gx - 0.5, FH - 0.9, gz - 0.02, gx + 0.5, FH - 0.86, gz + 0.02));
  for (const s of [-1, 1]) { B.add('sacking', box(gx + s * 0.5 - 0.004, FH - 1.5, gz - 0.004, gx + s * 0.5 + 0.004, FH - 0.9, gz + 0.004)); B.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.05], [0.001, 0.04]], 8, null, gx + s * 0.5, FH - 1.55, gz)); }
  B.add('sacking', box(gx - 0.004, FH - 0.86, gz - 0.004, gx + 0.004, FH - 0.25, gz + 0.004));
  if (st > 1) {
    // the stair up the left-hand wall: seventeen treads of timber from the floor to the slab, a rail on the room's side
    const hole = { x0: -hw + T, x1: -hw + T + 1.05, z0: -D + T, z1: -D + T + 2.1 }, n = 17, rise = (FH - FY) / n, run = 0.27, zb = -D + T + n * run;
    for (let i = 0; i < n; i++) { B.add('wood_dark', box(hole.x0, FY, zb - (i + 1) * run, hole.x1, FY + rise * (i + 1), zb - i * run)); }
    C.ramp([hole.x0, -D + T, hole.x1, zb], FY, FH, 0, -1);
    B.add('wood_dark', box(hole.x1 - 0.04, FY + 0.9, -D + T, hole.x1, FY + 1.0, zb)); void hole;
    // the room over the shop: lined, a dhurrie, charpoy with its quilt, chest, jars, a niche with a lamp, a hookah
    const UY = FH, HL = FH + UH;
    B.add(lining, box(-hw + T, UY, -D + T, -hw + T + 0.03, HL - 0.25, -0.5)); B.add(lining, box(hw - T - 0.03, UY, -D + T, hw - T, HL - 0.25, -0.5)); B.add(lining, box(-hw + T + 0.03, UY, -D + T, hw - T - 0.03, HL - 0.25, -D + T + 0.03));
    const cx = (hw - T) - 1.5, cz = -D + T + 4.0;
    F.kilim(B, 0.5, UY + 0.016, -D / 2 - 0.6, Math.min(3.4, hw * 2 - 3.2), 4.0, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre']);
    F.charpoy(B, null, cx, UY, cz, Math.PI / 2, { quilt: ['cloth_red', 'cloth_indigo', 'cloth_green'][sd % 3] }); C.circle(cx, cz, 0.9, UY, UY + 0.45);
    F.chest(B, hw - T - 0.4, UY, -D + T + 1.0, 0.8, 0.5, 0.55, Math.PI / 2); C.rect([hw - T - 0.7, -D + T + 0.7, hw - T, -D + T + 1.3], UY, UY + 0.55);
    F.waterJar(B, hw - T - 0.35, UY, -2.5, 0.8, 'terracotta'); F.hookah(B, 0.2, UY + 0.012, -D + T + 1.4, 0.3);
    F.bale(B, -hw + T + 3.0, UY, -D + T + 0.5, 0.9, 0.5, 0.6, 0, 'cloth_white');
    B.add(R, box(-hw + T + 1.3, UY + 1.3, -D + T + 0.03, -hw + T + 1.55, UY + 1.7, -D + T + 0.3)); F.oilLamp(B, none, -hw + T + 1.42, UY + 1.7, -D + T + 0.15, 'terracotta', 0);
  }
}
