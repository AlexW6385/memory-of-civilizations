// The south gate of Shibam's wall (docs/settlements/shibam.md §14): two battered towers either side of the passage, the lower part brown and the
// upper limewashed, a pointed arch of lime over the passage with a moulded ring on each face, the roof over it with a parapet, teeth and corner horns,
// arrow slits in the towers, and the two timber leaves standing open against the passage's sides, each of planks between rails with rows of iron studs
// and strap hinges, the drawbar's beam over the passage inside. All boxes, so the bag finds the repeats and instances them; every surface on the same plane
// as its neighbour is a millimetre off it.
import { box, frustum } from '../../core/geom.js';
import { archSpandrel, archRing } from './arch.js';
import { windowPieces } from './parts.js';
import { Matrix4 } from '../../core/three.js';

/** gate_house: { c: [x, z] the passage's centre on the wall's line, w (the piece's length along x), th (its depth), y0, H (the top), pw, ph (the passage) } */
export function gateHouse(el, { bag, col }) {
  const [gx, gz] = el.c, w = el.w ?? 12, th = el.th ?? 4.6, y0 = el.y0 ?? -3.2, H = el.H ?? 8.4, pw = el.pw ?? 4.6, ph = el.ph ?? 3.8, L = 'lime_plaster';
  const x0 = gx - w / 2, x1 = gx + w / 2, z0 = gz - th / 2, z1 = gz + th / 2, tw = (w - pw) / 2, yL = H - 3.0, span = H - y0, bt = 0.32;
  // the towers: the outer end and both faces lean in (the passage side stands upright), the upper 3 m limewashed
  for (const s of [-1, 1]) {
    const xa = s < 0 ? x0 : gx + pw / 2, xb = s < 0 ? gx - pw / 2 : x1, inO = bt * 1.0, inF = bt * 0.8;
    const at = (y) => (y - y0) / span, ins = (y) => [s < 0 ? inO * at(y) : 0, s < 0 ? 0 : inO * at(y), inF * at(y), inF * at(y)];
    bag.add('mud_plaster', frustum([xa, z0, xb, z1], y0, yL, ...ins(yL), { noBottom: true }));
    const q = ins(yL), r = [xa + q[0] * 0 + (s < 0 ? q[0] : 0), z0 + q[2], xb - (s < 0 ? 0 : q[1]), z1 - q[3]], t = ins(H), rem = (v, k) => v - ins(yL)[k];
    bag.add(L, frustum(r, yL, H, rem(t[0], 0), rem(t[1], 1), rem(t[2], 2), rem(t[3], 3), { noBottom: true }));
    bag.add(L, box(r[0] - (s < 0 ? 0.04 : 0), yL - 0.01, r[1] - 0.05, r[2] + (s < 0 ? 0 : 0.04), yL + 0.14, r[3] + 0.05));
    col.rect([xa, z0, xb, z1], y0, H);
    // arrow slits on the outer face and the field side, two to a face
    for (const [zz, nz] of [[z1 - 0.3 * 0 - bt * 0.8 * at(5), 1], [z0 + bt * 0.8 * at(5), -1]]) for (const dx of [0.9, 2.5]) for (const y of [4.6, 6.4]) {
      const x = s < 0 ? xa + dx : xb - dx, m = new Matrix4().makeRotationY(Math.atan2(0, nz)).setPosition(x, y, zz);
      for (const [mt, g] of windowPieces('slit')) bag.addInstance(mt, g, m.clone(), { reach: 120 });
    }
  }
  // the arch over the passage: the wall above it (brown to the lime line), moulded rings on both faces, the roof slab
  const yS = ph - 2.4, rise = 2.4;
  bag.add('mud_plaster', archSpandrel({ u0: gx - pw / 2, u1: gx + pw / 2, yS, rise, yTop: yL, w0: z0 + bt * 0.8 * (yS - y0) / span, w1: z1 - bt * 0.8 * (yS - y0) / span }));
  bag.add(L, box(gx - pw / 2, yL, z0 + bt * 0.8 * 0.9, gx + pw / 2, H - 0.4, z1 - bt * 0.8 * 0.9));
  for (const [w0, w1] of [[z1 - 0.1, z1 + 0.04], [z0 - 0.04, z0 + 0.1]]) bag.add(L, archRing({ u0: gx - pw / 2, u1: gx + pw / 2, yS, rise, d: 0.28, w0, w1, axis: 'x' }));
  bag.add('mud_plaster', box(gx - pw / 2, H - 0.4, z0 + 0.3, gx + pw / 2, H, z1 - 0.3));
  col.rect([gx - pw / 2, z0, gx + pw / 2, z1], ph, H);
  // the roof's parapet with its cap, the teeth and the four corner horns
  const pt = 0.5, ph2 = 1.0;
  for (const [a, b, c, d] of [[x0 + 0.3, z0 + 0.3, x1 - 0.3, z0 + 0.3 + pt], [x0 + 0.3, z1 - 0.3 - pt, x1 - 0.3, z1 - 0.3], [x0 + 0.3, z0 + 0.3 + pt, x0 + 0.3 + pt, z1 - 0.3 - pt], [x1 - 0.3 - pt, z0 + 0.3 + pt, x1 - 0.3, z1 - 0.3 - pt]]) {
    bag.add(L, box(a, H, b, c, H + ph2, d)); bag.add(L, box(a - 0.05, H + ph2, b - 0.05, c + 0.05, H + ph2 + 0.08, d + 0.05));
  }
  for (let x = x0 + 1.1; x < x1 - 1.4; x += 1.1) for (const z of [z0 + 0.3, z1 - 0.3 - pt]) { bag.add(L, box(x, H + ph2 + 0.08, z + 0.05, x + 0.4, H + ph2 + 0.5, z + pt - 0.05)); bag.add(L, box(x + 0.07, H + ph2 + 0.5, z + 0.1, x + 0.33, H + ph2 + 0.6, z + pt - 0.1)); }
  for (let z = z0 + 1.1; z < z1 - 1.4; z += 1.1) for (const x of [x0 + 0.3, x1 - 0.3 - pt]) bag.add(L, box(x + 0.05, H + ph2 + 0.08, z, x + pt - 0.05, H + ph2 + 0.5, z + 0.4));
  for (const [cx, cz] of [[x0 + 0.3, z0 + 0.3], [x1 - 0.3 - 0.8, z0 + 0.3], [x0 + 0.3, z1 - 0.3 - 0.8], [x1 - 0.3 - 0.8, z1 - 0.3 - 0.8]]) {
    bag.add(L, box(cx, H, cz, cx + 0.8, H + 1.7, cz + 0.8)); bag.add(L, box(cx - 0.06, H + 1.7, cz - 0.06, cx + 0.86, H + 1.8, cz + 0.86));
    bag.add(L, box(cx + 0.12, H + 1.8, cz + 0.12, cx + 0.68, H + 2.0, cz + 0.68)); bag.add(L, box(cx + 0.25, H + 2.0, cz + 0.25, cx + 0.55, H + 2.35, cz + 0.55));
  }
  // the leaves: planks between rails, studs, strap hinges, standing open along the passage's sides (a gap of a hand's breadth from the wall)
  for (const s of [-1, 1]) {
    const xa = gx + s * (pw / 2 - 0.12), xb = gx + s * (pw / 2 - 0.24), zl0 = z1 - 3.0, lh = 3.3, xm = Math.min(xa, xb), xM = Math.max(xa, xb);
    for (let z = zl0; z < z1 - 0.1; z += 0.2) bag.add('cedar', box(xm, 0.05, z + 0.01, xM, lh, z + 0.19));
    for (const y of [0.35, 1.6, 2.9]) bag.add('timber', box(xm - 0.04 * -s * 0 - (s < 0 ? 0 : 0.0), y, zl0, xM, y + 0.2, z1 - 0.1));
    for (const y of [0.35, 1.6, 2.9]) for (let z = zl0 + 0.2; z < z1 - 0.2; z += 0.4) bag.add('iron', box(s < 0 ? xM : xm - 0.04, y + 0.06, z, s < 0 ? xM + 0.04 : xm, y + 0.14, z + 0.08));
    for (const y of [0.6, 1.85, 2.75]) bag.add('iron', box(s < 0 ? xM : xm - 0.03, y, zl0, s < 0 ? xM + 0.03 : xm, y + 0.07, zl0 + 1.2));
  }
  // the beam over the passage on the inner side where the drawbar rests, with its two corbels
  bag.add('timber', box(gx - pw / 2 - 0.3, ph + 0.15, z0 + 0.35, gx + pw / 2 + 0.3, ph + 0.4, z0 + 0.65));
  for (const s of [-1, 1]) bag.add('timber', box(gx + s * (pw / 2 + 0.05) - 0.15, ph - 0.25, z0 + 0.35, gx + s * (pw / 2 + 0.05) + 0.15, ph + 0.15, z0 + 0.65));
}
export const GATE_ELEMENTS = { gate_house: gateHouse };
