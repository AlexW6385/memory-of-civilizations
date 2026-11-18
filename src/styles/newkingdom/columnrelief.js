// The painted reliefs of a hypostyle column's shaft (docs/settlements/thebes.md §14): on each carved face of each register the king offers before a god,
// cut in sunk relief into a plastered field that follows the shaft's curve, each figure in its own colours, the signs and the cartouche in blue; one
// geometry per material for the whole column. It lies over the column's first, flat figures (nk_column), which show from beyond its reach.
import { relief, elp, rct } from './relief.js';
import { offerScene, PAINT } from './scenes.js';
import { Parts, hash } from './sculpt.js';

/** nk_column_art: { at, y, h, d, cap ('open' | 'bud'), seed, cell } — the same measures as nk_column, so that the faces and registers fall where its own do. */
export function columnArt(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2, open = (el.cap ?? 'open') === 'open', cell = el.cell ?? 0.08, P = new Parts();
  const baseH = 0.4, abH = open ? 0.5 : 0.36, capH = open ? H * 0.155 : H * 0.135, tie = open ? 1.1 : 0.8;
  const yS0 = baseH, yT1 = H - abH - capH, yS1 = yT1 - tie;
  const rAt = (v) => { const t = Math.max(0, Math.min(1, (v - yS0) / (yT1 - yS0))); if (el.tent) return R * (0.6 + 0.4 * t); return R * (0.72 + 0.28 * Math.min(1, t / 0.2)) * (1 - 0.07 * t); };
  const sh = open ? 2.4 : 1.8, v0 = yS0 + sh + 0.35, v1 = yS1 - 0.3, nReg = el.scenes ?? Math.max(1, Math.floor((v1 - v0) / (open ? 2.6 : 2.3))), reg = (v1 - v0) / nReg;
  const faces = el.faces ?? (open ? [0, Math.PI / 2, Math.PI, Math.PI * 1.5] : [0, Math.PI]);
  for (let k = 0; k < nReg; k++) {
    const vb = v0 + k * reg + 0.12, hh = reg - 0.36;
    faces.forEach((fa, fi) => {
      const arc = Math.min(R * 1.5, 3.0), flip = (fi + k + Math.round(hash(x, z, k) * 3)) % 2 === 1, S = Math.min(hh / 1.12, arc / 1.06), sc = offerScene(S, flip, { crown: hash(x, z, fi * 7 + k) < 0.5 ? 'double' : 'white', god: hash(x + 1, z, k * 5 + fi) < 0.5 ? PAINT.blue : PAINT.green });
      // u runs against the angle, so that u × v is the outward normal
      const pos = (u, v) => { const a = fa - u / R, r = rAt(v); return [x + Math.cos(a) * r, y + v, z + Math.sin(a) * r]; };
      const nrm = (u) => { const a = fa - u / R; return [Math.cos(a), 0, Math.sin(a)]; };
      const ox = -sc.w / 2, shapes = sc.shapes.map((s) => ({ ...s, sd: (uu, vv) => s.sd(uu - ox, vv - vb - 0.05), bb: [s.bb[0] + ox, s.bb[1] + vb + 0.05, s.bb[2] + ox, s.bb[3] + vb + 0.05] }));
      // the cartouche between the figures' heads: an oval ring with its bar
      const cx = ox + sc.w * 0.55, cy = vb + 0.05 + sc.h * 0.84, cw = S * 0.05, ch = S * 0.13;
      shapes.push(elp(PAINT.white, cx, cy, cw * 1.5, ch * 1.2)); shapes.push(elp(PAINT.red, cx, cy, cw * 1.1, ch * 0.9, 0, { rise: 0.2 })); shapes.push(rct(PAINT.white, cx - cw * 1.7, cy - ch * 1.3, cx + cw * 1.7, cy - ch * 1.12));
      shapes.push(rct(PAINT.blue, cx - cw * 0.6, cy - ch * 0.5, cx + cw * 0.6, cy + ch * 0.5, { rise: 0.3 }));
      const m = relief({ u0: -arc / 2, u1: arc / 2, v0: vb - 0.04, v1: vb + hh + 0.06, cell, pos, nrm, shapes, field: 'sandstone_dressed', frame: 'sandstone_column', off: 0.075, sink: 0.04, planar: false });
      for (const [mat, g] of m) P.add(mat, g);
    });
  }
  P.emit(bag);
}
