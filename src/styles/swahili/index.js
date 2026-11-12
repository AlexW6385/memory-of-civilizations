// Swahili coral-stone architecture (14th–15th c.; docs/settlements/kilwa.md §4): walls of coral rag
// in lime mortar, plastered white; flat roofs on mangrove poles; the Great Mosque's prayer hall of
// bays on pillars, roofed with small domes and vaults, its great dome; the palace of Husuni Kubwa's
// courts and octagonal pool on the cliff; stone houses round courts; dhows on the shore.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, frustum, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';
import { pointedSpandrel, orientBy } from '../sahel/index.js';
import { HUSUNI } from './husuni.js';
import { house } from './house.js';
import { coconutPalm, baobab, tusks, mangrove, banana } from './plants.js';
import { tank, tomb, benchRag, fishRack } from './yard.js';
import { wall, carvedPanel, wallFace } from './kit.js';
import { Quaternion, Vector3, Matrix4 } from '../../core/three.js';

const C = 'lime_plaster_rough', R = 'coral_rag';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The points where rays from the centre at the given angles meet the rectangle (half sizes hx, hz). */
function rectRay(th, hx, hz) { const c = Math.cos(th), s = Math.sin(th), t = Math.min(hx / Math.max(1e-9, Math.abs(c)), hz / Math.max(1e-9, Math.abs(s))); return [c * t, s * t]; }
function bayAngles(hx, hz, N = 24) {
  const a = Array.from({ length: N }, (_, k) => (k / N) * Math.PI * 2);
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) a.push((Math.atan2(sz * hz, sx * hx) + Math.PI * 2) % (Math.PI * 2));
  return a.sort((p, q) => p - q);
}
/** Push the quad (or triangle when d is omitted) a b c d turned to face along w. */
function face(out, w, a, b, c, d) { const t = d ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...b, ...c]; out.push(...orientBy(t, () => w)); }
/**
 * A domed bay over the rectangle r: inside, pendentives from the rectangle (at yT) to the dome's
 * ring (yT + pd), a drum of height `drum`, the dome a little pointed; outside, the flat roof (yTop)
 * round the dome, the drum and the outer dome.
 */
function domeBay(out, r, yT, pd, yTop, drum = 0) {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, hx = (r[2] - r[0]) / 2, hz = (r[3] - r[1]) / 2, ri = Math.min(hx, hz) - 0.05, ro = ri + 0.22, A = bayAngles(hx, hz), M = 7;
  const C = (rr, th, yy) => [cx + Math.cos(th) * rr, yy, cz + Math.sin(th) * rr];
  const yR = yT + pd, yD = yR + drum, yO = yTop + drum, rise = 0.82;
  for (let j = 0; j < A.length; j++) {
    const a0 = A[j], a1 = j === A.length - 1 ? A[0] + Math.PI * 2 : A[j + 1], am = (a0 + a1) / 2, rad = [Math.cos(am), 0, Math.sin(am)];
    const [p0x, p0z] = rectRay(a0, hx, hz), [p1x, p1z] = rectRay(a1, hx, hz);
    face(out, [-rad[0], -0.6, -rad[2]], [cx + p0x, yT, cz + p0z], [cx + p1x, yT, cz + p1z], C(ri, a1, yR), C(ri, a0, yR));     // pendentive
    face(out, [0, 1, 0], [cx + p0x, yTop, cz + p0z], [cx + p1x, yTop, cz + p1z], C(ro, a1, yTop), C(ro, a0, yTop));             // the roof round it
    if (drum) { face(out, rad.map((v) => -v), C(ri, a0, yR), C(ri, a1, yR), C(ri, a1, yD), C(ri, a0, yD)); face(out, rad, C(ro, a0, yTop), C(ro, a1, yTop), C(ro, a1, yO), C(ro, a0, yO)); }
    for (let m = 0; m < M; m++) {
      const f0 = (m / M) * Math.PI / 2, f1 = ((m + 1) / M) * Math.PI / 2, fm = (f0 + f1) / 2, n = [Math.cos(fm) * rad[0], Math.sin(fm), Math.cos(fm) * rad[2]];
      for (const [rr, yb, sg] of [[ri, yD, -1], [ro, yO, 1]]) {
        const P = (f, th) => C(rr * Math.cos(f) + 0.001, th, yb + rr * rise * Math.sin(f));
        if (m === M - 1) face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a0));
        else face(out, n.map((v) => v * sg), P(f0, a0), P(f0, a1), P(f1, a1), P(f1, a0));
      }
    }
  }
}
/** A bay roofed by a barrel vault running along z (open where the next bay is vaulted too, closed by a tympanum where not). */
function vaultBay(out, r, yT, pd, yTop, openN, openS) {
  const cx = (r[0] + r[2]) / 2, hx = (r[2] - r[0]) / 2, yR = yT + pd, N = 12, ri = hx, eo = yR + ri + 0.25 - yTop;
  const inner = (k) => { const f = Math.PI * k / N; return [cx + Math.cos(f) * ri, yR + Math.sin(f) * ri]; };
  const outer = (k) => { const f = Math.PI * k / N; return [cx + Math.cos(f) * hx, yTop + Math.sin(f) * eo]; };
  for (const sx of [-1, 1]) face(out, [-sx, 0, 0], [cx + sx * hx, yT, r[1]], [cx + sx * hx, yT, r[3]], [cx + sx * hx, yR, r[3]], [cx + sx * hx, yR, r[1]]);
  const ends = [[r[1], openN, -1], [r[3], openS, 1]];
  for (let k = 0; k < N; k++) {
    const [a, ay] = inner(k), [b, by] = inner(k + 1), [c, cy] = outer(k), [d, dy] = outer(k + 1), fm = Math.PI * (k + 0.5) / N;
    face(out, [-Math.cos(fm), -Math.sin(fm), 0], [a, ay, r[1]], [b, by, r[1]], [b, by, r[3]], [a, ay, r[3]]);
    face(out, [Math.cos(fm) * eo, Math.sin(fm) * hx, 0], [c, cy, r[1]], [d, dy, r[1]], [d, dy, r[3]], [c, cy, r[3]]);
    for (const [zz, open, sg] of ends) {
      if (open) continue;
      face(out, [0, 0, -sg], [cx, yT, zz], [a, ay, zz], [b, by, zz]);          // the tympanum, facing into the vault
      face(out, [0, 0, sg], [cx, yTop, zz], [c, cy, zz], [d, dy, zz]);         // the outer vault's end
    }
  }
  for (const [zz, open, sg] of ends) if (!open) for (const sx of [-1, 1]) face(out, [0, 0, -sg], [cx, yT, zz], [cx + sx * hx, yT, zz], [cx + sx * hx, yR, zz]);
}
/** One inset bowl, its glazed hollow facing +y (rim proud of the vault's face, the hollow a little lower). */
const BOWL = (() => lathe([[0.1, -0.03], [0.1, 0.012], [0.088, 0.02], [0.05, 0.01], [0.001, 0.004]], 8))();
const GLAZES = ['glaze_green', 'glaze_white', 'glaze_blue', 'glaze_green'];
function insetBowls(bag, { x0, z0, x1, z1, nx, nz, sx, sz, yT, PD, mid, kindOf }) {
  const q = new Quaternion(), m = new Matrix4(), up = new Vector3(0, 1, 0), nv = new Vector3();
  let k = 0;
  const put = (p, n) => { nv.set(...n).normalize(); q.setFromUnitVectors(up, nv); m.compose(new Vector3(p[0] + nv.x * 0.02, p[1] + nv.y * 0.02, p[2] + nv.z * 0.02), q, new Vector3(1, 1, 1)); bag.add(GLAZES[k++ % 4], BOWL.clone().applyMatrix4(m)); };
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const bx0 = i === 0 ? x0 + 0.8 : x0 + i * sx, bx1 = i === nx - 1 ? x1 - 0.8 : x0 + (i + 1) * sx;
    const bz0 = j === 0 ? z0 + 0.8 : z0 + j * sz, bz1 = j === nz - 1 ? z1 - 0.8 : z0 + (j + 1) * sz;
    const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2, kind = kindOf(i, j);
    if (kind === 'vault') {
      // five rows along the vault (its section a half circle of radius hx springing at yT + PD), the faces' sag allowed for
      const hx = (bx1 - bx0) / 2, yR = yT + PD;
      for (const f of [0.28, 0.39, 0.5, 0.61, 0.72]) for (let zz = bz0 + 0.55; zz < bz1 - 0.4; zz += 0.9) {
        const a = Math.PI * f, c = Math.cos(a), s2 = Math.sin(a), r = hx;
        put([cx + c * r, yR + s2 * r, zz], [-c, -s2, 0]);
      }
      continue;
    }
    const hx = (bx1 - bx0) / 2, hz = (bz1 - bz0) / 2, ri = Math.min(hx, hz) - 0.05, rise = 0.82, yD = yT + PD + (kind === 'great' ? 1.4 : 0);
    const rings = kind === 'great' ? [[0.42, 16], [0.62, 12], [0.8, 8], [1, 1]] : [[0.62, 5], [1, 1]];
    for (const [ff, n] of rings) {
      const f = ff * Math.PI / 2 * (ff === 1 ? 1 : 1);
      for (let t = 0; t < n; t++) {
        const th = t / n * Math.PI * 2 + (ff * 3), cf = Math.cos(f) * (ff === 1 ? 0 : 1), sf = ff === 1 ? 1 : Math.sin(f);
        const p = [cx + Math.cos(th) * ri * cf, yD + ri * rise * sf, cz + Math.sin(th) * ri * cf];
        put(p, [-Math.cos(th) * cf / ri, -sf / (ri * rise * rise), -Math.sin(th) * cf / ri]);
      }
    }
  }
}
/** The Qur'an stands (rehal) of the Great Mosque's hall: beside the pillars of the side bays, facing the qibla (north); [{ x, z }] from the hall's rect and bay. */
export function mosqueStands(rect, b = 4.5) {
  const [x0, z0, x1, z1] = rect, nx = Math.floor((x1 - x0) / b), nz = Math.floor((z1 - z0) / b), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz, mid = Math.floor(nx / 2), out = [];
  for (let i = 2; i < nx - 1; i++) for (let k = 2; k < nz; k++) {
    if (Math.abs(i - mid) < 1 || (i * 7 + k * 3) % 5 > 1) continue;                                   // none in the central aisle; about two pillars in five
    out.push({ x: x0 + i * sx + 0.95, z: z0 + k * sz - 0.45 });
  }
  return out;
}
/** swahili_mosque: { rect, y, bay, big (index of the bay carrying the great dome) } — a walled hall of bays on pillars, each bay roofed by a small dome. */
function mosque(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, b = el.bay ?? 4.5, yS = y + 3.4, yT = y + 6.1, PD = 0.5, yTop = yT + PD + 0.35, h = yTop - y - 0.6;
  // the enclosing walls, open at every other bay by a doorway (1.4 × 2.6 m)
  const doorsAt = (a, b2) => { const L = b2 - a, n = Math.floor(L / (b * 2)), H = []; for (let i = 0; i < n; i += 2) { const u = a + (i + 0.5) * L / n; H.push({ u0: u - 0.7, u1: u + 0.7, v0: y + 0.05, v1: y + 2.6 }); } return H; };
  for (const [ax, c, a, b2, u0, u1] of [['x', z0 + 0.4, x0, x1, x0, x1], ['x', z1 - 0.4, x0, x1, x0, x1], ['z', x0 + 0.4, z0, z1, z0 + 0.8, z1 - 0.8], ['z', x1 - 0.4, z0, z1, z0 + 0.8, z1 - 0.8]]) {
    wall({ bag, col }, { axis: ax, c, u0, u1, t: 0.8, y0: y - 0.5, y1: y + h + 0.6, holes: doorsAt(a, b2), mat: C });
  }
  // the walls' faces: doorways with their stepped stone frames along the sides, small windows above, buttresses at the corners and between
  for (const [a, b2, zz, alongX, sg] of [[x0, x1, z0, true, -1], [x0, x1, z1, true, 1], [z0, z1, x0, false, -1], [z0, z1, x1, false, 1]]) {
    const L = b2 - a, n = Math.floor(L / (b * 2));
    for (let i = 0; i < n; i++) {
      const u = a + (i + 0.5) * L / n, f = (m, u0, u1, v0, v1, d0, d1) => { const p0 = zz + sg * d0, p1 = zz + sg * d1; bag.add(m, alongX ? box(u + u0, y + v0, Math.min(p0, p1), u + u1, y + v1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + v0, u + u0, Math.max(p0, p1), y + v1, u + u1)); };
      if (i % 2 === 0) { f('limestone', -1.0, -0.7, 0, 3.0, -0.01, 0.12); f('limestone', 0.7, 1.0, 0, 3.0, -0.01, 0.12); f('limestone', -0.7, 0.7, 2.6, 3.0, -0.01, 0.12); } else { f('limestone', -0.5, 0.5, 2.8, 4.0, -0.01, 0.1); f('opening', -0.35, 0.35, 3.0, 3.8, 0.09, 0.12); }
      f(C, L / n / 2 - 0.45, L / n / 2 + 0.45, -0.5, h + 0.6, -0.01, 0.55);
    }
  }
  // weathering: the darker damp band at the foot of the outer walls, broken by the doorways' frames; rain streaks
  // greying the whitewash under the cresting (the spouts' and the merlons' runs), between the windows
  for (const [a, b2, zz, alongX, sg] of [[x0, x1, z0, true, -1], [x0, x1, z1, true, 1], [z0, z1, x0, false, -1], [z0, z1, x1, false, 1]]) {
    const L = b2 - a, n = Math.floor(L / (b * 2)), cuts = [];
    for (let i = 0; i < n; i += 2) { const u = a + (i + 0.5) * L / n; cuts.push([u - 1.02, u + 1.02]); }
    const band = (m, u0, u1, v0, v1, d) => { const p0 = zz + sg * -0.002, p1 = zz + sg * d; bag.add(m, alongX ? box(u0, y + v0, Math.min(p0, p1), u1, y + v1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + v0, u0, Math.max(p0, p1), y + v1, u1)); };
    let u = a + 0.02;
    for (const [c0, c1] of [...cuts, [b2 - 0.02, b2]]) { if (c0 - u > 0.2) band('plaster_damp', u, c0, -0.3, 0.85 + 0.1 * Math.sin(u), 0.012); u = c1; }
    for (let i = 0; i < n; i++) { const um = a + (i + 1) * L / n - L / n * 0.25, hs = 1.4 + 0.9 * ((i * 7) % 5) / 5; band('plaster_streak', um - 0.14, um + 0.14, h + 0.6 - hs, h + 0.6, 0.008); }
    // the rag showing where the render has fallen (ragged courses), and salt-bloomed grey patches low down
    for (let i = 0; i < n; i++) {
      const k = (i * 5 + Math.round(zz * 3)) % 7; if (k > 3) continue;
      const um = a + (i + 0.5) * L / n + (k - 1.5) * 0.35, w = 0.5 + 0.25 * k, v0 = 1.3 + 0.7 * ((i * 3) % 4), uu = um - w / 2;
      for (let j = 0; j < 3; j++) band(R, uu + 0.07 * ((j + i) % 2), uu + w - 0.09 * ((j + k) % 2), v0 + j * 0.17, v0 + (j + 1) * 0.17, 0.006);
      band('plaster_grey', um + 0.9, um + 1.6, 0.9, 1.25 + 0.2 * (i % 3), 0.007);
    }
  }
  // a stepped merlon cresting along the roof's edge
  for (let x = x0 + 0.6; x < x1 - 0.4; x += 1.4) for (const zz of [z0 + 0.1, z1 - 0.7]) bag.add(C, box(x, y + h + 0.6, zz, x + 0.7, y + h + 1.3, zz + 0.6));
  for (let z = z0 + 0.6; z < z1 - 0.4; z += 1.4) for (const xx of [x0 + 0.1, x1 - 0.7]) bag.add(C, box(xx, y + h + 0.6, z, xx + 0.6, y + h + 1.3, z + 0.7));
  // the hall's supports: coral columns, octagonal below and squared above, under capitals of one
  // block with concave brackets (docs/settlements/kilwa.md §4); pointed arches between them both ways
  const nx = Math.floor((x1 - x0) / b), nz = Math.floor((z1 - z0) / b), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  for (let i = 1; i < nx; i++) for (let k = 1; k < nz; k++) {
    const x = x0 + i * sx, z = z0 + k * sz;
    // faced in dressed coral like the capitals, "rectangular coral panels on the alternating faces" of the octagon
    // (dunyacamileri, after Archnet); not the dark rubble core, which showed as dark shafts lit pale at the foot
    bag.add('limestone', lathe([[0.36, -0.05], [0.36, 0.25], [0.32, 0.3], [0.32, 1.6], [0.001, 1.6]], 8, null, x, y, z));
    bag.add('limestone', box(x - 0.26, y + 1.6, z - 0.26, x + 0.26, y + 3.0, z + 0.26));
    for (let f = 0; f < 8; f += 2) {
      const a = (f + 0.5) * Math.PI / 4, ap = 0.32 * Math.cos(Math.PI / 8);
      bag.add('limestone_carved', box(-0.006, -0.52, -0.085, 0.006, 0.52, 0.085).rotateY(-a).translate(x + Math.cos(a) * (ap + 0.004), y + 0.93, z + Math.sin(a) * (ap + 0.004)));
    }
    bag.add('limestone', frustum([x - 0.26, z - 0.26, x + 0.26, z + 0.26], y + 3.0, y + 3.16, -0.1, -0.1, -0.1, -0.1));
    bag.add('limestone', frustum([x - 0.36, z - 0.36, x + 0.36, z + 0.36], y + 3.16, y + 3.3, -0.1, -0.1, -0.1, -0.1));
    bag.add('limestone', box(x - 0.47, y + 3.3, z - 0.47, x + 0.47, y + 3.4, z + 0.47));
    bag.add(C, box(x - 0.35, y + 3.4, z - 0.35, x + 0.35, yT, z + 0.35));
    col.rect([x - 0.36, z - 0.36, x + 0.36, z + 0.36], y, yT);
  }
  const arches = [];
  for (let i = 1; i < nx; i++) { const x = x0 + i * sx; for (let k = 0; k < nz; k++) pointedSpandrel(arches, x, 0.3, k === 0 ? z0 + 0.8 : z0 + k * sz + 0.35, k === nz - 1 ? z1 - 0.8 : z0 + (k + 1) * sz - 0.35, yS, yT, false, 0.6); }
  for (let k = 1; k < nz; k++) { const z = z0 + k * sz; for (let i = 0; i < nx; i++) pointedSpandrel(arches, z, 0.3, i === 0 ? x0 + 0.8 : x0 + i * sx + 0.35, i === nx - 1 ? x1 - 0.8 : x0 + (i + 1) * sx - 0.35, yS, yT, true, 0.6); }
  bag.add(C, fromTriangles(arches));
  // the roof: over each bay a dome on pendentives, seen from below as from above; barrel vaults down
  // the central aisle; the great dome raised on its drum (Archnet: domes and vaults of lime-coral concrete)
  const mid = Math.floor(nx / 2), roof = [];
  const kindOf = (i, k) => (el.big && i === el.big[0] && k === el.big[1] ? 'great' : i === mid ? 'vault' : 'dome');
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const bx0 = i === 0 ? x0 + 0.8 : x0 + i * sx, bx1 = i === nx - 1 ? x1 - 0.8 : x0 + (i + 1) * sx;
    const bz0 = k === 0 ? z0 + 0.8 : z0 + k * sz, bz1 = k === nz - 1 ? z1 - 0.8 : z0 + (k + 1) * sz;
    const kind = kindOf(i, k);
    if (kind === 'vault') vaultBay(roof, [bx0, bz0, bx1, bz1], yT, PD, yTop, k > 0 && kindOf(i, k - 1) === 'vault', k < nz - 1 && kindOf(i, k + 1) === 'vault');
    else domeBay(roof, [bx0, bz0, bx1, bz1], yT, PD, yTop, kind === 'great' ? 1.4 : 0);
  }
  bag.add(C, fromTriangles(roof));
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  if (el.simple) return;
  // inset glazed bowls in the domes and vaults (docs/settlements/kilwa.md §15: three concentric rings in the
  // great dome, rows of bowls along the barrel vaults); a crown bowl and a ring in each small dome
  insetBowls(bag, { x0, z0, x1, z1, nx, nz, sx, sz, yT, PD, mid, kindOf });
  // the mihrab in the middle of the qibla (north) wall: three frames of dressed coral stepping in to the niche,
  // dark under its pointed head; a herringbone cable carved up the outer jambs; over it a carved plaque with two
  // bowls inset either side (Archnet: "two bowls are inset into either side of a rectangular plaque"); carved
  // bosses in the spandrels either side; the minbar of three steps beside it
  const mx = (x0 + x1) / 2, qz = z0 + 0.8, L = 'limestone';
  for (const [wo, wi, top, hd, dz] of [[1.5, 1.15, 3.0, 0.6, 0.35], [1.15, 0.95, 2.8, 0.2, 0.25], [0.95, 0.8, 2.6, 0.2, 0.15]]) {
    for (const sg of [-1, 1]) bag.add(L, box(Math.min(mx + sg * wo, mx + sg * wi), y, qz, Math.max(mx + sg * wo, mx + sg * wi), y + top, qz + dz));
    bag.add(L, box(mx - wo, y + top, qz, mx + wo, y + top + hd, qz + dz));
  }
  bag.add(L, box(mx - 0.8, y + 2.2, qz, mx + 0.8, y + 2.6, qz + 0.03));
  bag.add('opening', box(mx - 0.8, y + 0.05, qz, mx + 0.8, y + 2.2, qz + 0.035));
  for (let k = 0; k < 5; k++) { const w = 0.8 * (1 - (k + 1) / 5 * 0.85); bag.add('opening', box(mx - w, y + 2.2 + k * 0.08, qz + 0.03, mx + w, y + 2.28 + k * 0.08, qz + 0.045)); }
  const FM = wallFace('x', qz + 0.35, 1, y), ctxM = { bag, col };
  for (const sg of [-1, 1]) carvedPanel(ctxM, FM, mx + (sg < 0 ? -1.45 : 1.2), 0.35, mx + (sg < 0 ? -1.2 : 1.45), 2.9, 'cable');
  carvedPanel(ctxM, FM, mx - 0.85, 3.06, mx + 0.85, 3.54, 'stars');
  for (const dx of [-1.32, -1.04, 1.04, 1.32]) { const g = lathe([[0.11, -0.01], [0.11, 0.012], [0.1, 0.02], [0.06, 0.012], [0.001, 0.006]], 10); g.rotateX(Math.PI / 2); g.translate(mx + dx, y + 3.3, qz + 0.35); bag.add(dx % 0.5 ? 'glaze_green' : 'glaze_white', g); }
  for (const dx of [-2.25, 2.25]) carvedPanel(ctxM, wallFace('x', qz, 1, y), mx + dx - 0.3, 2.9, mx + dx + 0.3, 3.5, 'boss');
  for (let k = 0; k < 3; k++) bag.add('wood_dark', box(mx + 2.0, y, qz + 0.4 + k * 0.5, mx + 2.8, y + 0.4 + k * 0.4, qz + 0.9 + k * 0.5));
  bag.add('wood_dark', box(mx + 2.0, y, qz + 0.4, mx + 2.8, y + 1.9, qz + 0.7));
  for (const sx of [2.0, 2.72]) bag.add('wood_dark', box(mx + sx, y + 0.4, qz + 0.7, mx + sx + 0.08, y + 1.6, qz + 1.9));
  // reed mats in rows facing the qibla, and lamps hanging in the bays on chains
  for (let z = qz + 2.2; z < z1 - 2; z += 1.6) for (let x = x0 + 1.6; x < x1 - 2.4; x += 2.6) bag.add('reed_mat', box(x, y + 0.05, z, x + 2.3, y + 0.075, z + 1.25));
  for (let i = 0; i < nx; i += 2) for (let k = 0; k < nz; k += 2) {
    const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (k + 0.5) * (z1 - z0) / nz;
    const crown = (i === mid ? yT + PD + sx / 2 - 0.05 : yT + PD + 0.82 * (Math.min(sx, sz) / 2 - 0.05)) - 0.05;
    bag.add('iron', box(x - 0.01, y + 2.9, z - 0.01, x + 0.01, crown, z + 0.01));
    bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.16, 0.2], [0.1, 0.32], [0.001, 0.34]], 8, null, x, y + 2.6, z));
  }
  // the furnishing of the hall (docs/settlements/kilwa.md §4a): the imam's carpet before the mihrab, small rugs by the pillars, a Qur'an stand (rehal) with its book at
  // the foot of every second pillar, a water jar with its cup and a row of sandals inside each south door, an alms chest by the door nearest the arrival
  bag.add('cloth_red', box(mx - 1.7, y + 0.075, qz + 0.5, mx + 1.7, y + 0.095, qz + 2.1)); bag.add('cloth_indigo', box(mx - 1.5, y + 0.095, qz + 0.7, mx + 1.5, y + 0.105, qz + 1.9)); bag.add('cloth_ochre', box(mx - 1.2, y + 0.105, qz + 0.9, mx + 1.2, y + 0.112, qz + 1.7));
  for (const p of mosqueStands(el.rect, b)) {
    bag.add('cloth_brown', box(p.x - 0.55, y + 0.075, p.z - 0.4, p.x + 0.65, y + 0.088, p.z + 0.5));
    for (const sg of [-1, 1]) bag.add('wood_dark', box(-0.2, -0.18, -0.013, 0.2, 0.18, 0.013).rotateX(sg * 0.5).rotateY(0).translate(p.x + sg * 0.0, y + 0.3, p.z));
    bag.add('cloth_white', box(-0.14, -0.012, -0.1, 0.14, 0.012, 0.1).rotateX(-0.5).translate(p.x, y + 0.45, p.z + 0.02));
  }
  for (let i = 0; i < Math.floor((x1 - x0) / (b * 2)); i += 2) {
    const u = x0 + (i + 0.5) * (x1 - x0) / Math.floor((x1 - x0) / (b * 2)), jz = z1 - 1.25;
    bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.16], [0.22, 0.34], [0.14, 0.5], [0.09, 0.56], [0.1, 0.62], [0.001, 0.62]], 10, null, u + 1.4, y + 0.55, jz));
    for (const sg of [0, 1, 2]) bag.add('wood_dark', box(-0.02, -0.55, -0.02, 0.02, 0, 0.02).rotateZ(0).translate(u + 1.4 + Math.cos(sg * 2.09) * 0.16, y + 0.55, jz + Math.sin(sg * 2.09) * 0.16));
    bag.add('wood_dark', lathe([[0.001, 0], [0.06, 0.01], [0.07, 0.07], [0.001, 0.07]], 8, null, u + 1.72, y + 0.05, jz));
    for (let k = 0; k < 5; k++) for (const sg of [-1, 1]) bag.add('hide_brown', box(u - 1.3 + k * 0.26 + sg * 0.05, y + 0.05, z1 - 1.2 - (k % 2) * 0.12, u - 1.3 + k * 0.26 + sg * 0.05 + 0.09, y + 0.07, z1 - 1.2 - (k % 2) * 0.12 + 0.22));
    if (i === 2) { bag.add('wood_dark', box(u + 0.5, y + 0.05, jz - 0.3, u + 1.1, y + 0.5, jz + 0.3)); bag.add('iron', box(u + 0.5, y + 0.28, jz - 0.31, u + 1.1, y + 0.32, jz + 0.31)); }
  }
}
/**
 * mtepe: a sewn boat of the coast drawn up on the beach { at, dir, len, y (the sand), seed }: a
 * plank hull with sharp ends and strong sheer, the long raking stem-head forward, the planks' lines
 * of coir stitching, thwarts; a single mast stepped forward with its yard lowered and the square
 * mat sail furled along it; wooden props under the bilges, a stone anchor and coir rope by the bow.
 */
function mtepe(el, { bag, col }) {
  const [x, z] = el.at, L = el.len ?? 13, B = L * 0.24, D = L * 0.11, y = el.y ?? 0, rand = rng(el.seed || Math.floor(x * 31 + z * 17));
  const len = Math.hypot(el.dir[0], el.dir[1]), fx = el.dir[0] / len, fz = el.dir[1] / len, sx = -fz, sz = fx;   // forward, starboard
  const W = (u, v, w) => [x + fx * u + sx * v, y + w, z + fz * u + sz * v];
  const n = 16, m = 7, T = [];
  // the hull: half-breadth by sin^0.7 along, the section rounder toward the ends, the sheer rising fore and aft
  const P = (i, j) => { const t = i / n, uu = -L / 2 + L * t, half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2, s = j / m * 2 - 1, sh = 0.9 * (2 * t - 1) ** 4 + (t > 0.5 ? 0.3 * (2 * t - 1) ** 2 : 0); return W(uu, half * s, D + sh - D * (1 - Math.abs(s) ** 2.2) * Math.pow(Math.sin(Math.PI * t), 0.25)); };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...a, ...b, ...c, ...a, ...c, ...b, ...a, ...c, ...d, ...a, ...d, ...c); }
  bag.add('wood_dark', fromTriangles(T));
  // the stitching: dark lines of coir along two plank seams each side
  const S = [];
  for (const sj of [1, 2, m - 2, m - 1]) for (let i = 1; i < n - 1; i++) { const a = P(i, sj), b = P(i + 1, sj); const o = [0, 0.012, 0]; S.push(...a.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0)), ...a.map((v, k) => v + o[k]), ...b.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0)), ...a.map((v, k) => v + o[k] + (k === 1 ? 0.04 : 0))); }
  { const N2 = S.length; for (let k = 0; k < N2; k += 9) S.push(S[k], S[k + 1], S[k + 2], S[k + 6], S[k + 7], S[k + 8], S[k + 3], S[k + 4], S[k + 5]); }
  bag.add('hide_brown', fromTriangles(S));
  // the stem-head raking forward from the bow, the stern-post
  const bow = P(n, Math.floor(m / 2)), st = P(0, Math.floor(m / 2)), t1 = [];
  beamTris(t1, [bow[0] - fx * 0.3, bow[1] - 0.6, bow[2] - fz * 0.3], [bow[0] + fx * 1.6, bow[1] + 0.9, bow[2] + fz * 1.6], 0.09, 0.22);
  beamTris(t1, [st[0] + fx * 0.2, st[1] - 0.5, st[2] + fz * 0.2], [st[0] - fx * 0.5, st[1] + 0.5, st[2] - fz * 0.5], 0.09, 0.2);
  // thwarts
  for (const t of [0.3, 0.45, 0.62]) { const half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2 * 0.9, a = W(-L / 2 + L * t, -half, D - 0.15), b = W(-L / 2 + L * t, half, D - 0.15); beamTris(t1, a, b, 0.09, 0.07); }
  bag.add('timber', fromTriangles(t1));
  // the mast forward of amidships, the yard lowered along the boat with the furled mat sail
  const af = !!el.afloat, mb = W(L * 0.12, 0, 0.25), mh = L * (af ? 0.78 : 0.62);
  bag.add('timber', lathe([[0.12, 0], [0.08, mh], [0.001, mh + 0.05]], 8, null, mb[0], mb[1], mb[2]));
  if (af) {
    // under way: the yard hoisted slanting up toward the bow, the square mat sail bellied by the wind below it, the foot spar and the sheet
    const hy = [D + mh * 0.56, D + mh * 0.97], hf = [D + 1.0, D + 1.5], u0 = -L * 0.3, u1 = L * 0.5, G = 12, H = 8, sg = [], yv = [];
    const Sp = (i, j) => { const u = i / G, t = j / H, uu = u0 + (u1 - u0) * u, top = hy[0] + (hy[1] - hy[0]) * u, bot = hf[0] + (hf[1] - hf[0]) * u * 0.9; return W(uu, 0.15 + 0.85 * Math.sin(Math.PI * u) * Math.sin(Math.PI * t * 0.9 + 0.15) * 0.7 + 0.05, top + (bot - top) * t); };
    for (let i = 0; i < G; i++) for (let j = 0; j < H; j++) { const A = Sp(i, j), B = Sp(i + 1, j), C = Sp(i + 1, j + 1), E = Sp(i, j + 1); sg.push(...A, ...B, ...C, ...A, ...C, ...E, ...A, ...C, ...B, ...A, ...E, ...C); }
    bag.add('reed_mat', fromTriangles(sg));
    beamTris(yv, W(u0 - 0.5, 0.15, hy[0] - 0.05), W(u1 + 0.4, 0.15, hy[1] + 0.05), 0.06, 0.1);
    beamTris(yv, W(u0, 0.15, hf[0]), W(u1 * 0.9, 0.15, hf[1]), 0.05, 0.08);
    beamTris(yv, W(u1 * 0.9, 0.15, hf[1]), W(L * 0.36, 0.8, D + 0.5), 0.012, 0.02);
    bag.add('timber', fromTriangles(yv));
  } else {
    const ya = W(-L * 0.38, 0.15, D + 0.75), yb = W(L * 0.42, 0.15, D + 0.95), ty = [];
    beamTris(ty, ya, yb, 0.06, 0.1); bag.add('timber', fromTriangles(ty));
    const sail = []; beamTris(sail, W(-L * 0.33, 0.15, D + 0.55), W(L * 0.36, 0.15, D + 0.75), 0.2, 0.32); bag.add('reed_mat', fromTriangles(sail));
  }
  // a stay from the masthead to the stem, of coir
  const stay = []; beamTris(stay, [mb[0], mb[1] + mh - 0.3, mb[2]], [bow[0] + fx * 1.4, bow[1] + 0.8, bow[2] + fz * 1.4], 0.012, 0.025); bag.add('hide_brown', fromTriangles(stay));
  if (!af) {
  // props under the bilges, an anchor stone and a coil of rope on the sand
  for (const t of [0.35, 0.65]) for (const sg of [-1, 1]) { const half = Math.pow(Math.sin(Math.PI * t), 0.7) * B / 2, tp = []; beamTris(tp, W(-L / 2 + L * t, sg * (half + 0.7), -0.1), W(-L / 2 + L * t, sg * half * 0.82, D * 0.55), 0.05, 0.1); bag.add('timber', fromTriangles(tp)); }
  const an = W(L / 2 + 1.2, 0.8, 0); bag.add('rubble', lathe([[0.001, -0.05], [0.28, 0.0], [0.3, 0.14], [0.2, 0.26], [0.001, 0.28]], 8, null, an[0], an[1], an[2]));
  bag.add('hide_brown', lathe([[0.18, 0], [0.3, 0.02], [0.3, 0.08], [0.18, 0.1], [0.18, 0]], 12, null, an[0] - sx * 0.7, an[1], an[2] - sz * 0.7));
  }
  col.circle(x, z, B / 2, y, y + D + 1);
  void rand;
}
registerStyle('swahili', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, swahili_mosque: mosque, swahili_house: house, ...HUSUNI, mtepe, coconut_palm: coconutPalm, baobab, tusks, mangrove, banana, swahili_tank: tank, swahili_tomb: tomb, swahili_bench: benchRag, fish_rack: fishRack },
  objects: {},
});
