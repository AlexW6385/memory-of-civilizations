// Sumerian architecture of Ur III (c. 2100–2000 BC; docs/settlements/ur.md §4): the ziggurat —
// stages of mud brick faced with baked brick, their walls sloping in and broken by shallow
// buttresses, the three stairways on the front meeting at a gatehouse, the shrine on top —
// buttressed precinct walls, courtyard buildings and courtyard houses of plastered mud brick.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';

const BB = 'brick_baked', MB = 'mudbrick', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);
/** Shallow buttresses along the faces of a sloping stage [x0, z0, x1, z1] from y to y + h (inset at the top by b). */
function buttresses(bag, [x0, z0, x1, z1], y, h, b, step = 3.2, skip = null) {
  for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / step);
    for (let i = 1; i < n; i++) {
      const s = i * L / n, px = ax + (bx - ax) * s / L, pz = az + (bz - az) * s / L;
      if (skip && skip(px, pz)) continue;
      const tx = nz !== 0 ? 0.55 : 0.35, tz = nx !== 0 ? 0.55 : 0.35;
      bag.add(BB, frustum([px - tx + nx * 0.2, pz - tz + nz * 0.2, px + tx + nx * 0.2, pz + tz + nz * 0.2], y, y + h * 0.97, nx > 0 ? 0 : nx < 0 ? b : 0, nx > 0 ? b : 0, nz < 0 ? b : 0, nz > 0 ? b : 0));
    }
  }
}

/**
 * ziggurat: { c, y, stages: [{ w, d, h, batter }], front ('n'), shrine: { w, d, h } }: the stages
 * sloping in, buttressed; on the front the central stair projecting out to the first stage's top and
 * two stairs leaning on the wall from the corners, meeting at the gatehouse; a single stair on up;
 * the shrine on the top stage.
 */
function ziggurat(el, { bag, col }) {
  const [cx, cz] = el.c;
  let y = el.y ?? 0;
  const tops = [];
  el.stages.forEach((s, i) => {
    const r = [cx - s.w / 2, cz - s.d / 2, cx + s.w / 2, cz + s.d / 2], b = s.batter ?? s.h * 0.12;
    bag.add(i === 0 ? BB : BB, frustum(r, y, y + s.h, b, b, b, b));
    buttresses(bag, r, y, s.h, b, 3.2, (px) => Math.abs(px - cx) < 5);
    col.rect([r[0] + b * 0.4, r[1] + b * 0.4, r[2] - b * 0.4, r[3] - b * 0.4], y, y + s.h);
    col.floor([r[0] + b, r[1] + b, r[2] - b, r[3] - b], y + s.h);
    tops.push({ r, b, y0: y, y1: y + s.h });
    // the weeper holes: rows of small dark drains through the baked-brick skin, midway between the buttresses
    for (const [ax, az, bx, bz, nx, nz] of [[r[0], r[1], r[2], r[1], 0, -1], [r[0], r[3], r[2], r[3], 0, 1], [r[0], r[1], r[0], r[3], -1, 0], [r[2], r[1], r[2], r[3], 1, 0]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 3.2);
      for (let k = 0; k < n; k++) {
        const u = (k + 0.5) * L / n, px = ax + (bx - ax) * u / L, pz = az + (bz - az) * u / L;
        if (nz < 0 && Math.abs(px - cx) < 7) continue;                       // not behind the stairs
        if (nz < 0 && i === 0 && Math.abs(px - cx) > s.w / 2 - 4) continue;
        for (let yy = y + 1.4; yy < y + s.h - 1; yy += 1.8) {
          const f = (yy - y) / s.h, o = b * f, fx = px - nx * o, fz = pz - nz * o, hw = 0.13, hd = 0.09;
          bag.add('opening', nx ? box(fx - hd, yy, fz - hw, fx + hd, yy + 0.22, fz + hw) : box(fx - hw, yy, fz - hd, fx + hw, yy + 0.22, fz + hd));
        }
      }
    }
    y += s.h;
  });
  const S0 = tops[0], fz = S0.r[1];                          // the front face (north)
  // the central stair, out from the face to the first stage's top; the two leaning stairs
  const run = S0.y1 - S0.y0;
  stairs({ rect: [cx - 4, fz - run * 1.9, cx + 4, fz + S0.b + 0.5], y0: S0.y0, y1: S0.y1, dir: 's', mat: BB }, { bag, col });
  // the central stair's parapets: low walls rising with it
  for (const sx of [-1, 1]) {
    const t = [], za = fz - run * 1.9, zb = fz + S0.b + 0.5;
    beamTris(t, [cx + sx * 4.3, S0.y0, za], [cx + sx * 4.3, S0.y1, zb], 0.3, 1.0);
    bag.add(BB, fromTriangles(t)); col.segment([cx + sx * 4.3, za], [cx + sx * 4.3, zb], 0.6, S0.y0, S0.y1 + 1);
  }
  for (const s of [-1, 1]) {
    const x0 = cx + s * (S0.r[2] - cx - 3), x1 = cx + s * 5;
    stairs({ rect: [Math.min(x0, x1), fz - 1, Math.max(x0, x1), fz + 4], y0: S0.y0, y1: S0.y1, dir: s < 0 ? 'e' : 'w', mat: BB }, { bag, col });
    bag.add(BB, frustum([Math.min(x0, x1), fz - 1.4, Math.max(x0, x1), fz - 1], S0.y0, S0.y1 + 0.8, 0, 0, 0, 0));
  }
  // the gatehouse at the head of the stairs, with its arched way
  const gz = fz + S0.b + 1;
  bag.add(MP, box(cx - 6, S0.y1, gz, cx - 2, S0.y1 + 5, gz + 6)); bag.add(MP, box(cx + 2, S0.y1, gz, cx + 6, S0.y1 + 5, gz + 6));
  bag.add(MP, box(cx - 6, S0.y1 + 3.8, gz, cx + 6, S0.y1 + 5, gz + 6));
  col.rect([cx - 6, gz, cx - 2, gz + 6], S0.y1, S0.y1 + 5); col.rect([cx + 2, gz, cx + 6, gz + 6], S0.y1, S0.y1 + 5);
  // the stairs on up the second and third stages
  for (let i = 1; i < tops.length; i++) {
    const T = tops[i], f = T.r[1], h = T.y1 - T.y0;
    stairs({ rect: [cx - 2.5, f - h * 1.6, cx + 2.5, f + T.b + 0.3], y0: T.y0, y1: T.y1, dir: 's', mat: BB }, { bag, col });
  }
  // the shrine: a buttressed house of the god, plastered, with its door to the stair
  const top = tops[tops.length - 1], sh = el.shrine, sr = [cx - sh.w / 2, cz - sh.d / 2 + 1, cx + sh.w / 2, cz + sh.d / 2 + 1];
  bag.add(MP, box(sr[0], top.y1, sr[1], sr[2], top.y1 + sh.h, sr[3])); col.rect(sr, top.y1, top.y1 + sh.h);
  buttresses(bag, sr, top.y1, sh.h, 0, 1.6, (px, pz) => Math.abs(px - cx) < 1.2 && pz < cz);
  const t = []; beamTris(t, [cx - 0.9, top.y1, sr[1] - 0.03], [cx + 0.9, top.y1, sr[1] - 0.03], 0.04, 2.4); bag.add('lacquer_black', fromTriangles(t));
  bag.add('paint_blue', box(sr[0] - 0.1, top.y1 + sh.h - 0.6, sr[1] - 0.1, sr[2] + 0.1, top.y1 + sh.h, sr[3] + 0.1));
}

/** precinct_wall: a buttressed mud-brick wall a→b { h, th }, plastered, its top a walk. */
function precinctWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 6, th = el.th ?? 3, t = [];
  beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], th / 2, h); bag.add(el.mat ?? MB, fromTriangles(t));
  col.segment(a, b, th, 0, h);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 4);
  for (let i = 1; i < n; i++) for (const s of [-1, 1]) {
    const px = a[0] + ux * i * L / n - uz * s * (th / 2 + 0.25), pz = a[1] + uz * i * L / n + ux * s * (th / 2 + 0.25), q = [];
    beamTris(q, [px - ux * 0.6, 0, pz - uz * 0.6], [px + ux * 0.6, 0, pz + uz * 0.6], 0.25, h - 0.1); bag.add(el.mat ?? MB, fromTriangles(q));
  }
}

/** courtyard_block: a great courtyard building { rect, h, ring (depth of the rooms), door ('n'|'s'|'e'|'w') }: rooms round an open court, buttressed outer walls, flat roofs. */
function courtyardBlock(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 6, d = el.ring ?? 10, m = el.mat ?? MP;
  const wings = [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]];
  for (const r of wings) { bag.add(m, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); col.floor(r, h); }
  buttresses(bag, [x0, z0, x1, z1], 0, h, 0, 3.5);
  const door = el.door || 's', xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, t = [];
  if (door === 's' || door === 'n') beamTris(t, [xc - 1.2, 0, (door === 's' ? z1 + 0.06 : z0 - 0.06)], [xc + 1.2, 0, (door === 's' ? z1 + 0.06 : z0 - 0.06)], 0.04, 3);
  else beamTris(t, [(door === 'e' ? x1 + 0.06 : x0 - 0.06), 0, zc - 1.2], [(door === 'e' ? x1 + 0.06 : x0 - 0.06), 0, zc + 1.2], 0.04, 3);
  bag.add('lacquer_black', fromTriangles(t));
  bag.add('brick_baked', box(x0 + d, 0, z0 + d, x1 - d, 0.08, z1 - d));
}

/** ur_house: a courtyard house { rect, seed }: plastered mud brick, rooms round a court, one or two storeys, flat roof with a low parapet, a door to the lane. */
function urHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  const d = Math.min(3.8, Math.min(W, D) * 0.3), H = rand() < 0.45 ? 6 : 3.4;
  for (const r of [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) {
    const hh = r === undefined ? H : H;
    bag.add(MP, box(r[0], 0, r[1], r[2], hh, r[3])); col.rect(r, 0, hh); col.floor(r, hh);
  }
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.15, 0.5); bag.add(MP, fromTriangles(t)); }
  const side = Math.floor(rand() * 4), t = [], xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
  if (side === 0) beamTris(t, [xc - 0.5, 0, z0 - 0.04], [xc + 0.5, 0, z0 - 0.04], 0.03, 2.1);
  else if (side === 1) beamTris(t, [xc - 0.5, 0, z1 + 0.04], [xc + 0.5, 0, z1 + 0.04], 0.03, 2.1);
  else if (side === 2) beamTris(t, [x0 - 0.04, 0, zc - 0.5], [x0 - 0.04, 0, zc + 0.5], 0.03, 2.1);
  else beamTris(t, [x1 + 0.04, 0, zc - 0.5], [x1 + 0.04, 0, zc + 0.5], 0.03, 2.1);
  bag.add('timber', fromTriangles(t));
  bag.add('brick_baked', box(x0 + d, 0, z0 + d, x1 - d, 0.06, z1 - d));
}

/** reed_boat: a high-ended reed boat { at, dir, len, y }. */
function reedBoat(el, ctx) { STYLES.qing.elements.boat({ ...el }, ctx); }

registerStyle('sumerian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ziggurat, precinct_wall: precinctWall, courtyard_block: courtyardBlock, ur_house: urHouse, reed_boat: reedBoat },
  objects: {},
});
