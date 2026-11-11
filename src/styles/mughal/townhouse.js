// The town houses of Taj Ganj (docs/settlements/mughal-agra.md §12): plastered brick of two or three storeys on
// a lot with its front on the street, built in a local frame (front at z = 0 facing +z, the body behind it at −z,
// x along the frontage) and turned onto the street by `frameOf`. Ground floors on the bazaar streets are open
// shops: a raised platform (thara) behind a verandah of columns, the goods set out, a striped cloth awning;
// the others have the street door in its sandstone frame. Upstairs: a continuous chhajja (a stone eave on
// brackets) at the floor line, a jharokha (bracketed oriel with latticed windows and a domed roof) over the
// door or the middle of the shop, latticed windows with sills and lintels, a cornice, a parapet with merlons
// (kangura), and on the roof a mumty (the stair head) and sometimes a chhatri.

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
  return f;
}

const GOODS = ['cloth', 'carpets', 'brass', 'spice', 'pots', 'cloth'];
export const tradeOf = (seed) => GOODS[seed % GOODS.length];

/** A quad strip of cloth sloping from (x, y0, z0) to (x, y1, z1), width w, both faces. */
function slope(B, mat, x, w, y0, z0, y1, z1) {
  const a = [x, y0, z0], b = [x + w, y0, z0], c = [x + w, y1, z1], d = [x, y1, z1];
  B.add(mat, fromTriangles([...a, ...c, ...b, ...a, ...d, ...c]));
  B.add(mat, fromTriangles([...a, ...b, ...c, ...a, ...c, ...d].map((v, i) => v + (i % 3 === 1 ? -0.012 : 0))));
}

export function townHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), f = frameOf(el.rect, el.front ?? 's'), { W, D } = f, hw = W / 2;
  const B = { add: (m, g) => bag.add(m, place(g, f.ox, 0, f.oz, f.yaw)) };
  const C = { rect: (r, y0, y1) => col.rect(f.rect(r), y0, y1), floor: (r, y) => col.floor(f.rect(r), y), circle: (x, z, r, y0, y1) => { const [wx, wz] = f.pt(x, z); col.circle(wx, wz, r, y0, y1); } };
  const st = el.storeys ?? (rand() < 0.55 ? 2 : 3), shop = !!el.shop, FH = 3.5, UH = 3.1, H = FH + (st - 1) * UH;
  const mat = rand() < 0.45 ? 'stucco_warm' : rand() < 0.6 ? 'lime_plaster' : 'sandstone_red';
  const accent = mat === 'sandstone_red' ? 'marble' : R;
  const ZF = 2.4;                                                   // the verandah's depth
  // the body
  if (shop) {
    B.add(mat, box(-hw, 0, -D, hw, FH, -ZF));
    for (const s of [-1, 1]) B.add(mat, box(s < 0 ? -hw : hw - 0.4, 0, -ZF, s < 0 ? -hw + 0.4 : hw, FH, 0));
    C.rect([-hw, -D, hw, -ZF], 0, FH); C.rect([-hw, -ZF, -hw + 0.4, 0], 0, FH); C.rect([hw - 0.4, -ZF, hw, 0], 0, FH);
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
  // the door (houses) or the shop's verandah
  const dx = shop ? 0 : Math.max(-hw + 1.6, Math.min(hw - 1.6, (rand() - 0.5) * (W - 3.4)));
  if (!shop) {
    B.add(R, box(dx - 0.95, 0, -0.02, dx - 0.75, 2.6, 0.1)); B.add(R, box(dx + 0.75, 0, -0.02, dx + 0.95, 2.6, 0.1)); B.add(R, box(dx - 0.95, 2.4, -0.02, dx + 0.95, 2.75, 0.12));
    B.add('wood_dark', box(dx - 0.75, 0.15, -0.02, dx - 0.01, 2.4, 0.05)); B.add('wood_dark', box(dx + 0.01, 0.15, -0.02, dx + 0.75, 2.4, 0.05));
    for (let i = 0; i < 4; i++) for (const u of [-0.5, -0.2, 0.2, 0.5]) B.add('iron', box(dx + u - 0.02, 0.5 + i * 0.5, 0.05, dx + u + 0.02, 0.54 + i * 0.5, 0.07));
    B.add(R, box(dx - 1.0, 0, 0, dx + 1.0, 0.15, 0.45));
    // a little chhajja over the door on two brackets, a lattice window beside it
    B.add(R, box(dx - 1.2, 2.75, 0, dx + 1.2, 2.9, 0.65));
    for (const s of [-1, 1]) B.add(R, box(dx + s * 0.95 - 0.07, 2.35, 0, dx + s * 0.95 + 0.07, 2.75, 0.4));
    const wx = dx > 0 ? -hw + (dx + hw) / 2 : hw - (hw - dx) / 2;
    if (Math.abs(wx - dx) > 2.2) { B.add('lattice', box(wx - 0.35, 1.5, 0, wx + 0.35, 2.3, 0.04)); B.add(R, box(wx - 0.45, 1.4, 0, wx + 0.45, 1.5, 0.16)); B.add(R, box(wx - 0.45, 2.3, 0, wx + 0.45, 2.42, 0.1)); }
    // the foot of the walls, darkened by the lane's dust
    const hh = 0.6 + rand() * 0.5;
    B.add('earth_wall', box(-hw, 0, 0.016, dx - 1.0, hh, 0.032)); B.add('earth_wall', box(dx + 1.0, 0, 0.016, hw, hh, 0.032));
  } else {
    // columns of the verandah with brackets and a beam, the platform, the shelves at the back
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
    B.add(R, box(-hw + 0.4, 0, -ZF, hw - 0.4, 0.34, -0.06)); C.floor([-hw + 0.4, -ZF, hw - 0.4, -0.06], 0.34);
    B.add('marble', box(-hw + 0.4, 0.34, -0.1, hw - 0.4, 0.37, -0.06));
    for (let i = 0; i < n; i++) {
      const x = -hw + 0.4 + (i + 0.5) * bw, k = (el.seed + i * 3) % 6, trade = GOODS[k];
      B.add('wood_dark', box(x - bw / 2 + 0.3, 1.2, -ZF, x + bw / 2 - 0.3, 1.26, -ZF + 0.35));
      B.add('wood_dark', box(x - bw / 2 + 0.3, 1.9, -ZF, x + bw / 2 - 0.3, 1.96, -ZF + 0.35));
      const g = el.trade ?? trade;
      if (g === 'cloth') { F.bolts(B, x - 0.4, 1.26, -ZF + 0.2, 5, 0); F.bolts(B, x + 0.4, 1.26, -ZF + 0.2, 4, 0); F.bolts(B, x, 1.96, -ZF + 0.2, 6, 0); F.bolts(B, x, 0.37, -0.9, 3, 0.3); }
      else if (g === 'carpets') { F.rolledCarpets(B, x, 0.37, -ZF + 0.35, 4, 1.2, Math.PI / 2); F.rolledCarpets(B, x + 0.2, 1.26, -ZF + 0.3, 3, 0.9, Math.PI / 2); }
      else if (g === 'brass') { F.copperware(B, x, 0.37, -ZF + 0.5, 0, el.seed + i, 4); F.copperware(B, x, 1.26, -ZF + 0.2, 0, el.seed + i + 9, 4); F.copperware(B, x, 1.96, -ZF + 0.2, 0, el.seed + i + 4, 3); }
      else if (g === 'spice') { F.spiceSacks(B, x, 0.37, -1.0, 0, 4); F.spiceSacks(B, x, 0.37, -ZF + 0.35, 0, 4); F.pots(B, x, 1.26, -ZF + 0.2, 0, 3, ['terracotta', 'glaze_white']); }
      else { F.pots(B, x, 0.37, -0.9, 0, 4); F.pots(B, x, 1.26, -ZF + 0.2, 0, 4); F.pots(B, x, 1.96, -ZF + 0.2, 0, 4, ['glaze_blue', 'glaze_green']); }
    }
    // the cloth awning: stripes sloping from the beam out over the street
    if (rand() < 0.65) {
      const cs = [['cloth_red', 'cloth_white'], ['cloth_indigo', 'cloth_ochre'], ['cloth_green', 'cloth_white'], ['cloth_ochre', 'cloth_red']][Math.floor(rand() * 4)];
      const sw = (W - 0.8) / Math.round((W - 0.8) / 0.55);
      for (let x = -hw + 0.4, k = 0; x < hw - 0.41; x += sw, k++) slope(B, cs[k % 2], x, sw, FH - 0.15, 0.02, FH - 0.75, 1.5);
    }
  }
  // upstairs: the chhajja at the floor line on brackets; jharokha; windows
  if (st > 1) {
    B.add(R, box(-hw - 0.1, FH - 0.02, 0, hw + 0.1, FH + 0.12, 0.55));
    for (let x = -hw + 0.6; x < hw - 0.3; x += 1.2) { B.add(R, box(x - 0.07, FH - 0.5, 0, x + 0.07, FH - 0.02, 0.1)); B.add(R, box(x - 0.07, FH - 0.5, 0, x + 0.07, FH - 0.38, 0.35)); }
    const jx = shop ? 0 : dx, y0 = FH + 0.55;
    B.add(R, box(jx - 1.45, y0 - 0.22, 0, jx + 1.45, y0, 1.15));
    for (const [yy, d, w] of [[0.2, 0.95, 1.3], [0.4, 0.65, 1.0], [0.58, 0.35, 0.65]]) B.add(R, box(jx - w, y0 - 0.22 - yy, 0, jx + w, y0 - 0.22 - yy + 0.2, d));
    for (const px of [-1.28, -0.43, 0.43, 1.28]) B.add(R, box(jx + px - 0.07, y0, 0.98, jx + px + 0.07, y0 + 1.9, 1.12));
    for (const [a, b] of [[-1.28, -0.43], [-0.43, 0.43], [0.43, 1.28]]) {
      B.add(R, box(jx + a + 0.07, y0, 1.0, jx + b - 0.07, y0 + 0.75, 1.1)); B.add('lattice', box(jx + a + 0.07, y0 + 0.75, 1.03, jx + b - 0.07, y0 + 1.75, 1.07)); B.add(R, box(jx + a + 0.07, y0 + 1.75, 1.0, jx + b - 0.07, y0 + 1.9, 1.1));
    }
    for (const s of [-1, 1]) { B.add('lattice', box(jx + s * 1.2, y0 + 0.75, 0.15, jx + s * 1.2 + 0.04, y0 + 1.75, 0.95)); B.add(R, box(jx + s * 1.2 - 0.03, y0, 0.1, jx + s * 1.2 + 0.07, y0 + 0.75, 1.0)); }
    B.add('wood_dark', box(jx - 1.1, y0 + 0.2, 0.002, jx + 1.1, y0 + 1.8, 0.03));
    B.add(R, box(jx - 1.45, y0 + 1.9, 0, jx + 1.45, y0 + 2.1, 1.22));
    B.add('marble', lathe([[1.05, 0], [1.22, 0.16], [0.8, 0.5], [0.32, 0.85], [0.001, 1.05]], 12, null, jx, y0 + 2.1, 0.55));
    B.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.2], [0.001, 0.26]], 6, null, jx, y0 + 3.15, 0.55));
    // windows on every upper floor, clear of the jharokha
    for (let s = 1; s < st; s++) {
      const yb = FH + (s - 1) * UH + 0.75;
      for (let x = -hw + 1.3; x < hw - 0.8; x += 2.5) {
        if (Math.abs(x - jx) < 2.1 && s === 1) continue;
        B.add('lattice', box(x - 0.4, yb, 0, x + 0.4, yb + 1.35, 0.04));
        B.add(R, box(x - 0.55, yb - 0.12, 0, x + 0.55, yb, 0.22)); B.add(R, box(x - 0.55, yb + 1.35, 0, x + 0.55, yb + 1.5, 0.14));
        for (const q of [-1, 1]) B.add(R, box(x + q * 0.47 - 0.05, yb, 0, x + q * 0.47 + 0.05, yb + 1.35, 0.08));
        B.add(R, lathe([[0.4, 0], [0.36, 0.1], [0.001, 0.26]], 8, null, x, yb + 1.5, 0.05));
      }
      if (s > 1) B.add(accent, box(-hw - 0.05, FH + (s - 1) * UH - 0.1, 0, hw + 0.05, FH + (s - 1) * UH + 0.05, 0.12));
    }
  }
  // on the roof: the stair head, sometimes a chhatri at a corner
  const sx = rand() < 0.5 ? -1 : 1, sxc = sx * (hw - 1.6);
  if (D > 7) { B.add(mat, box(sxc - 1, H, -D + 1.4, sxc + 1, H + 2.3, -D + 3.4)); B.add(accent, box(sxc - 1.1, H + 2.3, -D + 1.3, sxc + 1.1, H + 2.42, -D + 3.5)); B.add('wood_dark', box(sxc - 0.4, H, -D + 3.4, sxc + 0.4, H + 1.8, -D + 3.43)); C.rect([sxc - 1, -D + 1.4, sxc + 1, -D + 3.4], H, H + 2.4); }
  if (rand() < 0.4 && W > 6.5) {
    const cx = -sx * (hw - 1.5), cz = -D + 2.2, y = H;
    B.add(accent, box(cx - 0.9, y, cz - 0.9, cx + 0.9, y + 0.15, cz + 0.9));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add(accent, box(cx + a * 0.75 - 0.07, y + 0.15, cz + b * 0.75 - 0.07, cx + a * 0.75 + 0.07, y + 2.0, cz + b * 0.75 + 0.07));
    B.add(accent, box(cx - 0.95, y + 2.0, cz - 0.95, cx + 0.95, y + 2.12, cz + 0.95));
    B.add('marble', lathe([[0.95, 0], [1.0, 0.12], [0.7, 0.45], [0.25, 0.75], [0.001, 0.9]], 10, null, cx, y + 2.12, cz));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) C.circle(cx + a * 0.75, cz + b * 0.75, 0.1, y, y + 2.2);
  }
}
