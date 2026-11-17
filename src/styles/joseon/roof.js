// The tiled roofs' relief (docs/settlements/joseon-seoul.md §18): the rows of convex tiles (sumkiwa) that run
// down every slope of a palace roof from the ridge to the eaves, and along the eaves' edge the row of round
// end-tiles (wadang). Both follow rectRoof's surface (src/styles/ming/index.js): the same height formula,
// laid over it as thin raised strips, so that the roof reads as tiled from the court and not as one smooth sheet.

import { box, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { dapoHeight } from './dancheong.js';

/** rectRoof's surface: the height at (x, z) in the roof's own frame, and the frame's turn into the world. */
function frame(r) {
  const [cx, cz] = r.c, { A, B, y, rise: R } = r, sw = r.sweep ?? 0.9, kind = r.kind || 'xieshan', p = r.p ?? 1.7, gAt = r.gableAt ?? 0.42;
  const rot = (x, z) => (r.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const H = (x, z, off = 0) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = kind === 'gable' ? 9 : Math.max(0, (A - ax) / B);
    if (kind === 'xieshan' && te > gAt) te = 9;
    const t = Math.min(ts, te), corner = kind === 'gable' ? 0 : Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return y + R * Math.pow(t, p) + sw * corner * corner + off;
  };
  return { cx, cz, A, B, kind, gAt, rot, H };
}

/**
 * Rows of convex tiles over roof r (rectRoof's parameters) and the round end-tiles on its eaves.
 * o.pitch: the rows' spacing (0.4 m); o.dLimit: the rows stop this far up from the eave (a skirt's, where the storey above stands);
 * o.ridgeGap: the rows stop this short of the ridge; o.discs: the end-tiles (default true).
 */
export function tileRoof(bag, r, o = {}) {
  const { cx, cz, A, B, kind, gAt, rot, H } = frame(r), mat = o.mat ?? r.mat, pitch = o.pitch ?? 0.42, lim = o.dLimit ?? B, gap = o.ridgeGap ?? 0.3;
  const out = [], seg = 6, w = 0.07, h = 0.11;
  const rib = (pts) => { for (let i = 0; i + 1 < pts.length; i++) beamTris(out, pts[i], pts[i + 1], w, h, true); };
  const W = (x, z) => { const [rx, rz] = rot(x, z); return [rx, H(x, z) - 0.025, rz]; };
  // the front and back slopes: a row at each x from the eave in to where the slope meets the hip, the gable line or the ridge
  const xg = A - gAt * B, nx = Math.floor((A - 0.5) / pitch);
  for (let i = -nx; i <= nx; i++) {
    const x = cx + i * pitch, ax = Math.abs(x - cx);
    const dmax = Math.min(lim, kind === 'gable' || (kind === 'xieshan' && ax <= xg) ? B - gap : Math.min(B - gap, A - ax - 0.15));
    if (dmax < 0.6) continue;
    for (const sz of [-1, 1]) { const pts = []; for (let k = 0; k <= seg; k++) pts.push(W(x, cz + sz * (B - 0.12 - (dmax - 0.12) * k / seg))); rib(pts); }
  }
  // the end slopes of a hip or a hip-and-gable: rows along x at each z, from the end eave in to the hip or the gable line
  if (kind !== 'gable') {
    const nz = Math.floor((B - 0.5) / pitch);
    for (let j = -nz; j <= nz; j++) {
      const z = cz + j * pitch, az = Math.abs(z - cz);
      const dmax = Math.min(lim, kind === 'xieshan' ? gAt * B - 0.1 : B - az - 0.15);
      if (dmax < 0.6) continue;
      for (const sx of [-1, 1]) { const pts = []; for (let k = 0; k <= seg; k++) pts.push(W(cx + sx * (A - 0.12 - (dmax - 0.12) * k / seg), z)); rib(pts); }
    }
  }
  if (out.length) bag.add(mat, fromTriangles(out));
  // the round end-tiles along the eaves: little discs standing on the edge, as boxes (about 0.2 m)
  if (o.discs !== false) {
    const ring = [], step = o.discStep ?? 0.3, na = Math.max(2, Math.round(2 * A / step)), nb = Math.max(2, Math.round(2 * B / step));
    for (let i = 0; i < na; i++) { const x = cx - A + (i + 0.5) * 2 * A / na; ring.push([x, cz - B, 0, -1], [x, cz + B, 0, 1]); }
    for (let j = 0; j < nb; j++) { const z = cz - B + (j + 0.5) * 2 * B / nb; ring.push([cx - A, z, -1, 0], [cx + A, z, 1, 0]); }
    const D = [];
    for (const [x, z, fx, fz] of ring) {
      const [rx, rz] = rot(x, z), [ox, oz] = r.alongZ ? [-fz, fx] : [fx, fz], y = H(x, z) - 0.1, hw = 0.1, hd = 0.035;
      const cxw = rx + ox * 0.02, czw = rz + oz * 0.02;
      D.push(box(cxw - (ox ? hd : hw), y - 0.1, czw - (oz ? hd : hw), cxw + (ox ? hd : hw), y + 0.1, czw + (oz ? hd : hw)));
    }
    for (const g of D) bag.add(mat, g);
  }
}

/**
 * The roofs of a double-eaved qing_hall (as src/styles/qing/index.js lays them out): rows of tiles on the lower skirt up to the
 * upper storey's wall, and on the whole upper roof.
 */
export function doubleRoofRelief(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0, Lx = x1 - x0, Lz = z1 - z0, o = el.eave ?? 1.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const inset = el.inset ?? Math.min(Lx, Lz) / ((el.bays?.[1] ?? 4) + 0.5), bk = el.dapo ? dapoHeight(el.dapo) : 0, H = el.H, D = el.double, yb = el.y + H + bk;
  const mat = el.pal?.roof || 'tile_grey';
  const skirt = { c: [cx, cz], A: (along ? Lx : Lz) / 2 + o, B: (along ? Lz : Lx) / 2 + o, y: el.y + H - 0.25 + bk, rise: (inset + o) * 0.55, p: 1.25, kind: 'hip', sweep: el.sweep ?? 0.5, alongZ: !along, mat };
  tileRoof(bag, skirt, { dLimit: inset + o - 0.2 });
  const u = [x0 + inset, z0 + inset, x1 - inset, z1 - inset], A2 = (along ? u[2] - u[0] : u[3] - u[1]) / 2 + o * 1.1, B2 = (along ? u[3] - u[1] : u[2] - u[0]) / 2 + o * 1.1;
  const upper = { c: [cx, cz], A: A2, B: B2, y: yb + D - 0.25 + bk, rise: el.rise ?? B2 * 0.78, kind: el.roof || 'hip', sweep: el.sweep ?? 0.6, alongZ: !along, gableAt: 0.45, mat };
  tileRoof(bag, upper, { discStep: 0.32 });
}
