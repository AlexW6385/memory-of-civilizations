// The ring of rooms of a square tulou (docs/settlements/hakka-tulou.md §4.5): on each of the four sides a row of rooms 3.6 m deep
// between the earth wall and a front on the court, a timber gallery in front of every upper floor, the doors on the gallery, the
// small windows from the third storey up with their bars, two stair bays (on the east and west sides: three flights, switchback),
// the gate room over the gate passage, the corner cells closed. Every room is furnished (the kinds of the round tulou's rooms).
// Local frame of a side q: x along the side, z outward from the court (the room fronts at z = hf, the earth wall's inner face at hin);
// q = 0 south, 1 west, 2 north, 3 east (the frame of `turn` in village.js, phi = -q * 90°).
import { STYLES } from '../../core/build.js';
import { box, rod } from '../../core/geom.js';
import { lbox, frameOf } from './geo.js';
import { fillRoom } from './rooms.js';

const TIMBER = 'timber';
const hash = (i, s) => { let h = Math.imul(i + 1, 374761393) ^ Math.imul(s + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** The rooms' kind by floor and a hash (docs §4.1: kitchens, pens and tools below; grain, loom, tools on the second; sleeping and sitting above). */
function kindOf(k, h) {
  if (k === 0) return h < 0.16 ? 'tools' : h < 0.3 ? 'pen' : 'kitchen';
  if (k === 1) return h < 0.22 ? 'loom' : h < 0.38 ? 'tools' : 'granary';
  return h < 0.24 ? 'tea' : h < 0.34 ? 'loom' : 'bedroom';
}

/** Split [a, b] into n equal rooms. */
const split = (a, b, n) => Array.from({ length: n }, (_, i) => [a + (b - a) * i / n, a + (b - a) * (i + 1) / n]);

/**
 * G: { cx, cz, h, hin, hf, hr, K, st, top, gw, roofAt(z) } — `roofAt` the soffit of the roof over the rooms at local z.
 */
export function squareRings(ctx, G) {
  const { bag, col } = ctx, LF = STYLES.life.elements, { cx, cz, h, hin, hf, hr, K, st, top, gw } = G;
  const xg = gw + 0.12, fh = st - 0.26, BAY = 4.0, lean = 0.3;
  for (let q = 0; q < 4; q++) {
    const phi = -q * Math.PI / 2, W = frameOf(cx, cz, phi);
    const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, phi, x0, y0, z0, x1, y1, z1));
    const wr = (x0, z0, x1, z1) => { const a = W(x0, z0), b = W(x1, z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const seg = (x0, z0, x1, z1, th, y0, y1) => col.segment(W(x0, z0), W(x1, z1), th, y0, y1);
    const side = q === 0 ? 'S' : q === 1 ? 'W' : q === 2 ? 'N' : 'E';
    // the rooms of this side: [a, b, tag]; the gate room above the passage on the south, the bay (two rooms wide) on west and east
    let rooms = [];
    if (q === 0) rooms = [...split(-hf, -xg, Math.round((hf - xg) / 3.7)).map((r) => [...r, 'room']), [-xg, xg, 'gate'], ...split(xg, hf, Math.round((hf - xg) / 3.7)).map((r) => [...r, 'room'])];
    else {
      const n = Math.round(2 * hf / BAY), all = split(-hf, hf, n);
      rooms = all.map((r) => [...r, 'room']);
      if (q !== 2) rooms.splice(n / 2 - 1, 2, [-BAY, BAY, 'bay']);
    }
    const bounds = [...new Set(rooms.flatMap(([a, b]) => [a, b]))];
    const outerAt = (y) => h - lean * Math.max(0, y - 1.0) / (top - 1.0);       // the wall's outer face at height y (local z)

    for (let k = 0; k < K; k++) {
      const y = k * st, top1 = y + fh;
      // the partitions between rooms (every boundary), up to the floor above
      for (const x of bounds) {
        if (k === 0 && q === 0 && Math.abs(x) < xg + 0.01) { B(TIMBER, x - 0.06, 0, hf, x + 0.06, fh, hin); seg(x, hf, x, hin, 0.12, 0, st + 0.2); continue; }
        B(TIMBER, x - 0.05, y, hf, x + 0.05, top1, hin); seg(x, hf, x, hin, 0.1, y, top1);
      }
      for (const [a, b, tag] of rooms) {
        const xm = (a + b) / 2, L = b - a, ceilY = top1;
        if (k === 0) { if (tag !== 'gate') bag.add('ground', lbox(cx, cz, phi, a, 0, hf, b, 0.025, hin)); }
        else if (tag !== 'bay') { B(TIMBER, a, y - 0.26, hf, b, y, hin); col.floor(wr(a, hf, b, hin), y); }
        if (tag === 'gate' && k === 0) continue;
        if (tag === 'bay') continue;
        // the front: two planks and a header round a door 1.24 m wide; red-brown door posts; couplets and a paper strip
        const d0 = xm - 0.62, d1 = xm + 0.62;
        B(TIMBER, a, y, hf - 0.04, d0, top1, hf + 0.04); B(TIMBER, d1, y, hf - 0.04, b, top1, hf + 0.04); B(TIMBER, d0, y + 2.1, hf - 0.04, d1, top1, hf + 0.04);
        seg(a, hf, d0, hf, 0.08, y, top1); seg(d1, hf, b, hf, 0.08, y, top1);
        for (const x of [d0, d1]) B('wood_dark', x - 0.045, y, hf - 0.07, x + 0.045, y + 2.1, hf + 0.07);
        if (L > 2.0) {
          for (const s of [-1, 1]) B('lacquer_red', xm + (s > 0 ? 0.74 : -0.88), y + 0.9, hf - 0.075, xm + (s > 0 ? 0.88 : -0.74), y + 2.0, hf - 0.04);
          B('cloth_red', xm - 0.5, y + 2.18, hf - 0.075, xm + 0.5, y + 2.3, hf - 0.04);
        }
        const hz = hash(Math.round(xm * 10) + q * 101, k + 3);
        if (hz < 0.2) LF.hang_lantern({ t: 'hang_lantern', at: W(xm, hf - 0.8), y: ceilY, rot: 0, seed: Math.round(xm * 10) + k }, ctx);
        else if (hz < 0.34 && k > 0) LF.laundry_pole({ t: 'laundry_pole', at: W(xm + 1.0, hf - 0.2), y: y + 3.0, rot: phi + Math.PI / 2, len: 1.5, seed: Math.round(xm * 7) + k * 3 }, ctx);
        else if (hz < 0.42 && k > 0) LF.basket({ t: 'basket', at: W(xm - 1.2, hf - 0.6), y, rot: phi, n: 2, seed: Math.round(xm) + k }, ctx);
        // the top storey: its ceiling and the fascia up to the roof's soffit
        if (k === K - 1) {
          B(TIMBER, a, top1, hf, b, top1 + 0.08, hin);
          B(TIMBER, a, top1, hf - 0.05, b, G.roofAt(hf) + 0.02, hf + 0.03);
        }
        // the window from the third storey up: a dark recess on the outer face, a frame, three bars; on the inside a frame round a dark recess;
        // the top storey also has two narrow gun ports either side [stated: slits for weapons under the dark-tiled roof — China Daily]
        if (k >= 2) {
          const wy = y + 1.0, zo = outerAt(wy + 0.32);
          B('opening', xm - 0.25, wy, zo - 0.09, xm + 0.25, wy + 0.65, zo + 0.02);
          B(TIMBER, xm - 0.3, wy - 0.06, zo - 0.07, xm + 0.3, wy, zo + 0.07); B(TIMBER, xm - 0.3, wy + 0.65, zo - 0.07, xm + 0.3, wy + 0.71, zo + 0.07);
          for (const s of [-0.28, 0.28]) B(TIMBER, xm + s - 0.03, wy, zo - 0.07, xm + s + 0.03, wy + 0.65, zo + 0.07);
          for (const s of [-0.1, 0.1]) B('wood_dark', xm + s - 0.012, wy, zo - 0.06, xm + s + 0.012, wy + 0.65, zo + 0.03);
          B('plaster_streak', xm - 0.2, wy - 1.5, zo - 0.012, xm + 0.2, wy - 0.06, zo + 0.01);
          B('opening', xm - 0.25, wy, hin - 0.03, xm + 0.25, wy + 0.65, hin + 0.01);
          for (const s of [-1, 1]) B(TIMBER, xm + s * 0.3 - 0.04, wy - 0.06, hin - 0.07, xm + s * 0.3 + 0.04, wy + 0.71, hin);
          B(TIMBER, xm - 0.34, wy - 0.08, hin - 0.12, xm + 0.34, wy - 0.02, hin); B(TIMBER, xm - 0.34, wy + 0.65, hin - 0.07, xm + 0.34, wy + 0.71, hin);
          if (k === K - 1) for (const s of [-1.25, 1.25]) if (Math.abs(xm + s) < hf) {
            const gy = y + 1.45, zg = outerAt(gy + 0.15);
            B('opening', xm + s - 0.06, gy, zg - 0.08, xm + s + 0.06, gy + 0.3, zg + 0.02); B('opening', xm + s - 0.04, gy, hin - 0.03, xm + s + 0.04, gy + 0.3, hin + 0.01);
          }
        }
        // the room
        const kind = kindOf(k, hash(Math.round(xm * 10) + q * 57, k * 11 + 1));
        fillRoom(ctx, { ox: W(xm, hin - 2.0)[0], oz: W(xm, hin - 2.0)[1], phi, y }, kind, { light: L < 3 || hz > 0.45, mirror: ((Math.round(xm * 10) + q * 3 + k) % 5) < 2, seed: Math.round(xm * 7) + q * 13 + k * 7 + 5 });
      }
    }

    // the stair bay: three flights, the first from the ground to the second storey; switchback in the strip against the earth wall
    const bay = rooms.find((r) => r[2] === 'bay');
    if (bay) {
      const xs = 2.7, zr0 = hin - 1.4, zr1 = hin - 0.15, N = 18;
      for (let k = 0; k < K; k++) {
        const y = k * st;
        if (k === 0) bag.add('ground', lbox(cx, cz, phi, -BAY, 0, hf, BAY, 0.025, hin));
        else {
          // the lobby and the two landings; the hole between them is the flight's
          const pieces = [[-BAY, hf, BAY, hin - 1.5], [-BAY, hin - 1.5, -xs, hin], [xs, hin - 1.5, BAY, hin]];
          for (const [x0, z0, x1, z1] of pieces) { B(TIMBER, x0, y - 0.26, z0, x1, y, z1); col.floor(wr(x0, z0, x1, z1), y); }
          // the rail round the hole's open edge
          B(TIMBER, -xs, y + 1.0, hin - 1.5, xs, y + 1.05, hin - 1.45); seg(-xs, hin - 1.48, xs, hin - 1.48, 0.1, y, y + 1.05);
          for (let b = 0; b <= 4; b++) { const x = -xs + 2 * xs * b / 4; B(TIMBER, x - 0.02, y, hin - 1.49, x + 0.02, y + 1.0, hin - 1.45); }
        }
        if (k === K - 1) { B(TIMBER, -BAY, y + fh, hf, BAY, y + fh + 0.08, hin); B(TIMBER, -BAY, y + fh, hf - 0.05, BAY, G.roofAt(hf) + 0.02, hf + 0.03); continue; }
        const up = k % 2 === 0 ? 1 : -1, yA = y, yB = y + st, rise = st / N, run = 2 * xs / N;
        for (let i = 0; i < N; i++) {
          const xa = up > 0 ? -xs + i * run : xs - i * run, xb = up > 0 ? xa + run : xa - run, ty = yA + (i + 1) * rise;
          B(TIMBER, Math.min(xa, xb) - 0.01, ty - 0.05, zr0, Math.max(xa, xb) + 0.01, ty, zr1);
          B('wood_dark', Math.min(xa, xb) - 0.01, ty - rise, zr0, Math.min(xa, xb) + 0.01 + (up > 0 ? 0 : run), ty - 0.05, zr0 + 0.03);
        }
        const v = [W(1, 0)[0] - W(0, 0)[0], W(1, 0)[1] - W(0, 0)[1]], asc = Math.abs(v[0]) > Math.abs(v[1]) ? (v[0] * up > 0 ? 'e' : 'w') : (v[1] * up > 0 ? 's' : 'n');
        col.ramp(wr(-xs, zr0, xs, zr1), yA, yB, asc);
        // the handrail on the open side and its posts
        const p = (x, yy, z) => { const w = W(x, z); return [w[0], yy, w[1]]; }, xa0 = up > 0 ? -xs : xs, xb0 = -xa0;
        bag.add(TIMBER, rod(p(xa0, yA + 0.95, zr0 - 0.03), p(xb0, yB + 0.95, zr0 - 0.03), 0.03, 5));
        for (let b = 0; b <= 6; b++) { const f = b / 6, x = xa0 + (xb0 - xa0) * f, yy = yA + (yB - yA) * f; bag.add(TIMBER, rod(p(x, yy, zr0 - 0.03), p(x, yy + 0.95, zr0 - 0.03), 0.02, 4)); }
      }
    }
    void side;
  }
  // the corner cells (the stairs' and the privies' side, shut): solid
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) col.rect([cx + Math.min(sx * hf, sx * hin), cz + Math.min(sz * hf, sz * hin), cx + Math.max(sx * hf, sx * hin), cz + Math.max(sz * hf, sz * hin)], 0, top);

  // the galleries in front of the upper floors, with their rails and balusters; the posts at every room boundary, to the roof
  for (let k = 1; k < K; k++) {
    const y = k * st;
    const gal = [[-hf, -hf, hf, -hr], [-hf, hr, hf, hf], [-hf, -hr, -hr, hr], [hr, -hr, hf, hr]];
    for (const r of gal) { bag.add(TIMBER, box(cx + r[0], y - 0.26, cz + r[1], cx + r[2], y, cz + r[3])); col.floor([cx + r[0], cz + r[1], cx + r[2], cz + r[3]], y); }
    const edges = [[[-hr, -hr], [hr, -hr]], [[-hr, hr], [hr, hr]], [[-hr, -hr], [-hr, hr]], [[hr, -hr], [hr, hr]]];
    for (const [p0, p1] of edges) {
      for (const [yy, r] of [[1.05, 0.035], [0.55, 0.025]]) bag.add(TIMBER, rod([cx + p0[0], y + yy, cz + p0[1]], [cx + p1[0], y + yy, cz + p1[1]], r, 5));
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), nb = Math.round(len / 1.1);
      for (let b = 1; b < nb; b++) { const f = b / nb; bag.add(TIMBER, rod([cx + p0[0] + (p1[0] - p0[0]) * f, y, cz + p0[1] + (p1[1] - p0[1]) * f], [cx + p0[0] + (p1[0] - p0[0]) * f, y + 1.05, cz + p0[1] + (p1[1] - p0[1]) * f], 0.018, 4)); }
      col.segment([cx + p0[0], cz + p0[1]], [cx + p1[0], cz + p1[1]], 0.1, y, y + 1.1);
    }
  }
  const postTop = G.roofAt(hr) - 0.16, boundsS = [];
  for (let x = -hf; x <= hf + 0.01; x += 4.0) if (Math.abs(x) < hr - 0.4) boundsS.push(x);
  boundsS.push(-hr, hr);
  const seen = new Set();
  for (const line of [[0, 1], [0, -1], [1, 0], [-1, 0]]) for (const s of boundsS) {
    const px = line[0] === 0 ? s : line[0] * hr, pz = line[0] === 0 ? line[1] * hr : s, key = `${px.toFixed(2)},${pz.toFixed(2)}`;
    if (seen.has(key)) continue; seen.add(key);
    bag.add('timber_red', box(cx + px - 0.1, 0, cz + pz - 0.1, cx + px + 0.1, postTop, cz + pz + 0.1)); col.circle(cx + px, cz + pz, 0.13, 0, top);
  }
}
