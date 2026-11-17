// The Friday mosque of Shibam (docs/settlements/shibam.md §2): a whitewashed mudbrick mosque squeezed among the towers, a court
// before a flat-roofed prayer hall on piers and beams of palm trunk, and a tall square minaret in stages.
import { box, rod, lathe } from '../../core/geom.js';
import { frustum } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { archSpandrel, archFill, archRing } from './arch.js';
import { windowPieces } from './parts.js';

/** mosque_hall: { rect (the hall's interior), y, roofY } — square piers in two rows, palm-trunk beams, a flat roof, the mihrab niche in the west wall and a timber minbar. */
function mosqueHall(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.06, R = el.roofY ?? 5.6;
  const xs = [x0 + (x1 - x0) * 0.33, x0 + (x1 - x0) * 0.72];
  for (const x of xs) for (let z = z0 + 3.5; z < z1 - 2; z += 4.2) { bag.add('lime_plaster', box(x - 0.4, y - 0.05, z - 0.4, x + 0.4, R - 0.45, z + 0.4)); col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, R); bag.add('lime_plaster', box(x - 0.55, R - 0.75, z - 0.55, x + 0.55, R - 0.45, z + 0.55)); }
  for (let z = z0 + 0.6; z < z1; z += 1.1) bag.add('palm_trunk', rod([x0 - 0.1, R - 0.55, z], [x1 + 0.1, R - 0.55, z], 0.11, 7));
  for (const x of xs) bag.add('timber', box(x - 0.2, R - 0.45, z0, x + 0.2, R - 0.2, z1));
  bag.add('mud_plaster', box(x0 - 0.1, R - 0.2, z0 - 0.1, x1 + 0.1, R, z1 + 0.1));
  // the mihrab: a niche in the west wall's thickness, framed in lime, and the minbar beside it
  const mz = (z0 + z1) / 2;
  // arcades: a pointed lime arch between each pair of piers of a row, the wall above it up to the beam
  for (const x of xs) for (let z = z0 + 3.5; z + 4.2 < z1 - 2; z += 4.2) bag.add('lime_plaster', archSpandrel({ u0: z + 0.4, u1: z + 4.2 - 0.4, yS: 3.5, rise: 1.4, yTop: R - 0.45, w0: x - 0.15, w1: x + 0.15, axis: 'z' }));
  // the mihrab: a pointed recess in a moulded arch of lime within a rectangular frame, pilasters at its sides
  bag.add('lime_plaster', archSpandrel({ u0: mz - 1.25, u1: mz + 1.25, yS: 2.1, rise: 1.8, yTop: 4.1, w0: x0, w1: x0 + 0.12, axis: 'z' }));
  bag.add('lime_plaster', archRing({ u0: mz - 0.9, u1: mz + 0.9, yS: 2.1, rise: 1.5, d: 0.26, w0: x0, w1: x0 + 0.17, axis: 'z' }));
  bag.add('opening', archFill({ u0: mz - 0.9, u1: mz + 0.9, y0: y, yS: 2.1, rise: 1.5, w: x0 + 0.02, dir: 1, axis: 'z' }));
  for (const sgn of [-1, 1]) { bag.add('lime_plaster', box(x0, y, mz + sgn * 1.25 - (sgn > 0 ? 0 : 0.2), x0 + 0.14, 4.1, mz + sgn * 1.25 + (sgn > 0 ? 0.2 : 0))); bag.add('cedar', box(x0 + 0.14, y, mz + sgn * 1.0 - (sgn > 0 ? 0 : 0.08), x0 + 0.19, 2.1, mz + sgn * 1.0 + (sgn > 0 ? 0.08 : 0))); }
  bag.add('lime_plaster', box(x0, 4.1, mz - 1.45, x0 + 0.14, 4.3, mz + 1.45));
  for (let k = 0; k < 5; k++) bag.add('cedar', box(x0 + 0.2, y, mz + 1.6 + k * 0.0, x0 + 0.9 - k * 0.1, y + 0.3 + k * 0.28, mz + 2.5)), void k;
  col.rect([x0 + 0.2, mz + 1.6, x0 + 0.9, mz + 2.5], y, y + 1.7);
  for (let k = 0; k < 4; k++) lights.push({ at: [xs[k % 2], R - 1.0, z0 + 6 + Math.floor(k / 2) * 12], color: '#ffd9a0', intensity: 1.6, distance: 9 });
  // prayer rugs in rows before the mihrab, the Qur'an stands along the qibla wall, the shoe rack at the open side, brass lamps hung from the beams, a carved band
  for (let r = 0; r < 3; r++) for (let z = z0 + 2.2; z < z1 - 2; z += 1.0) bag.add(['cloth_green', 'cloth_red', 'cloth_maroon'][(((r + Math.floor(z)) % 3) + 3) % 3], box(x0 + 1.4 + r * 1.3, y + 0.02, z, x0 + 2.4 + r * 1.3, y + 0.035, z + 0.7));
  for (let z = z0 + 2.5; z < z1 - 2; z += 3.2) { if (Math.abs(z - mz) < 3) continue; for (const q of [-1, 1]) bag.add('wood_dark', rod([x0 + 0.5, y, z + q * 0.2], [x0 + 0.5, y + 0.4, z - q * 0.2], 0.02, 4)); bag.add('cedar', box(x0 + 0.38, y + 0.38, z - 0.28, x0 + 0.65, y + 0.42, z + 0.28)); }
  bag.add('timber', box(x1 - 0.5, y, z0 + 3, x1 - 0.1, y + 0.9, z0 + 6)); col.rect([x1 - 0.5, z0 + 3, x1 - 0.1, z0 + 6], y, y + 0.9); for (let k = 0; k < 3; k++) bag.add('timber', box(x1 - 0.5, y + 0.28 + k * 0.28, z0 + 3, x1 - 0.1, y + 0.3 + k * 0.28, z0 + 6));
  for (let k = 0; k < 5; k++) bag.add('leather_bench', box(x1 - 0.45, y + 0.3, z0 + 3.1 + k * 0.5, x1 - 0.15, y + 0.32, z0 + 3.4 + k * 0.5)), void k;
  bag.add('cedar', box(x0, R - 1.5, z0, x0 + 0.12, R - 0.9, z1)); for (let z = z0 + 0.6; z < z1 - 0.3; z += 0.9) bag.add('wood_dark', box(x0 + 0.1, R - 1.4, z, x0 + 0.13, R - 1.0, z + 0.45));
  for (let k = 0; k < 4; k++) { const lx = xs[k % 2], lz = z0 + 6 + Math.floor(k / 2) * 12; bag.add('iron', rod([lx, R - 0.55, lz], [lx, R - 1.2, lz], 0.008, 3)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.05], [0.18, 0.2], [0.1, 0.34], [0.001, 0.36]], 9, null, lx, R - 1.55, lz)); }
  // mats in rows
  for (let z = z0 + 1; z < z1 - 1; z += 1.4) bag.add('reed_mat', box(x0 + 1.2, y, z, x1 - 0.5, y + 0.02, z + 1.0));
}
/**
 * minaret: { c, w, h } a square tower of adobe in three tapering stages (as the Hadhrami minarets are, with the stair inside), the lowest brown with
 * the slits of the stair climbing its faces, the second limewashed with pointed arched windows, the muezzin's gallery on palm-trunk corbels with a
 * parapet of stepped merlons, a lantern of four pointed openings under a flat cap and a finial [stages and crown inferred; docs/settlements/shibam.md §12].
 */
function minaret(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 3.8, h = el.h ?? 27;
  const st = [[0, h * 0.55, w], [h * 0.55, h * 0.85, w * 0.72], [h * 0.85, h, w * 0.52]];
  const face = (i, y) => { const [ya, yb, ww] = st[i], ins = i === 0 ? 0.35 : 0.12; return ww / 2 - ins * (y - ya) / (yb - ya); };
  const onFace = (i, y, u, d, fn) => { for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const f = face(i, y), m = new Matrix4().makeRotationY(Math.atan2(nx, nz)).setPosition(cx + nx * f + (nz ? (nz > 0 ? u : -u) : 0), y, cz + nz * f + (nx ? (nx > 0 ? -u : u) : 0)); fn(m, nx, nz, f); } void d; };
  st.forEach(([ya, yb, ww], i) => {
    const hw = ww / 2, ins = i === 0 ? 0.35 : 0.12;
    bag.add(i === 0 ? 'mud_plaster' : 'lime_plaster', frustum([cx - hw, cz - hw, cx + hw, cz + hw], ya, yb, ins, ins, ins, ins, { noBottom: i === 0 }));
    if (i < 2) { bag.add('lime_plaster', box(cx - hw - 0.08, yb - 0.25, cz - hw - 0.08, cx + hw + 0.08, yb, cz + hw + 0.08)); bag.add('lime_plaster', box(cx - hw - 0.04, ya + (yb - ya) * 0.5, cz - hw - 0.04, cx + hw + 0.04, ya + (yb - ya) * 0.5 + 0.1, cz + hw + 0.04)); }
  });
  // stage 1: the slits of the stair climbing each face, from one side to the other
  for (let k = 0; k < 7; k++) { const y = 1.6 + k * 1.8, u = ((k % 3) - 1) * 0.7; onFace(0, y, u, 0, (m) => { for (const [mt, g] of windowPieces('slit')) bag.addInstance(mt, g, m.clone(), { reach: 120 }); }); }
  // stage 2: a pointed arched window in a lime ring on each face, two above each other
  const [ya2, yb2, w2] = st[1];
  for (const yy of [ya2 + 1.6, ya2 + 4.8]) onFace(1, yy, 0, 0, (m, nx, nz, f) => {
    const wx = (a, b) => { const v = [a, b]; return v; }; void wx;
    const geoms = [['opening', archFill({ u0: -0.32, u1: 0.32, y0: 0, yS: 0.9, rise: 0.6, w: 0.02, dir: 1, axis: 'x' })], ['lime_plaster', archRing({ u0: -0.32, u1: 0.32, yS: 0.9, rise: 0.6, d: 0.14, w0: 0, w1: 0.07, axis: 'x' })], ['lime_plaster', box(-0.5, -0.07, 0, 0.5, 0, 0.12)]];
    for (const [mt, g] of geoms) bag.addInstance(mt, g, m.clone(), { reach: 120 }); void nx; void nz; void f;
  });
  // the gallery: a slab over the second stage's head on palm-trunk corbels, its parapet of lime with stepped merlons
  const gh = h * 0.85, ge = w2 / 2 - 0.12 + 0.55, g3 = w * 0.52 / 2;
  bag.add('lime_plaster', box(cx - ge, gh, cz - ge, cx + ge, gh + 0.22, cz + ge));
  for (const s of [-1, 1]) for (const t of [-0.8, 0, 0.8]) { bag.add('palm_trunk', rod([cx + t, gh - 0.55, cz + s * (ge - 0.55)], [cx + t, gh + 0.02, cz + s * (ge - 0.02)], 0.07, 6)); bag.add('palm_trunk', rod([cx + s * (ge - 0.55), gh - 0.55, cz + t], [cx + s * (ge - 0.02), gh + 0.02, cz + t], 0.07, 6)); }
  const pw = 0.2, py = gh + 0.22;
  for (const [a, b, c, d] of [[-ge, -ge, ge, -ge + pw], [-ge, ge - pw, ge, ge], [-ge, -ge + pw, -ge + pw, ge - pw], [ge - pw, -ge + pw, ge, ge - pw]]) bag.add('lime_plaster', box(cx + a, py, cz + b, cx + c, py + 0.8, cz + d));
  for (let t = -ge + 0.3; t < ge - 0.35; t += 0.62) for (const [a, b] of [[t, -ge], [t, ge - pw], [-ge, t], [ge - pw, t]]) bag.add('lime_plaster', box(cx + a, py + 0.8, cz + b, cx + a + (a === -ge || a === ge - pw ? pw : 0.3), py + 1.08, cz + b + (b === -ge || b === ge - pw ? pw : 0.3)));
  // the lantern: four pointed openings, a flat cap with a lime coping and a finial
  const [ya3, yb3] = st[2];
  onFace(2, ya3 + 1.2, 0, 0, (m) => { for (const [mt, g] of [['opening', archFill({ u0: -0.38, u1: 0.38, y0: 0, yS: 1.5, rise: 0.7, w: 0.02, dir: 1, axis: 'x' })], ['lime_plaster', archRing({ u0: -0.38, u1: 0.38, yS: 1.5, rise: 0.7, d: 0.14, w0: 0, w1: 0.06, axis: 'x' })]]) bag.addInstance(mt, g, m.clone(), { reach: 150 }); });
  bag.add('lime_plaster', box(cx - g3 - 0.15, yb3, cz - g3 - 0.15, cx + g3 + 0.15, yb3 + 0.22, cz + g3 + 0.15));
  bag.add('lime_plaster', box(cx - g3 * 0.6, yb3 + 0.22, cz - g3 * 0.6, cx + g3 * 0.6, yb3 + 0.7, cz + g3 * 0.6));
  bag.add('lime_plaster', lathe([[0.001, 0], [0.22, 0], [0.26, 0.12], [0.18, 0.26], [0.07, 0.34], [0.05, 0.9], [0.001, 1.05]], 8, null, cx, yb3 + 0.7, cz));
  col.rect([cx - w / 2, cz - w / 2, cx + w / 2, cz + w / 2], -1, h + 2.4);
}
export const MOSQUE_ELEMENTS = { mosque_hall: mosqueHall, minaret };
