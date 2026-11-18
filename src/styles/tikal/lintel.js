// The carved wooden lintel of Temple I's doorway (docs/settlements/maya-tikal.md §15): the ruler enthroned on his jaguar-skin bench in
// the lower register under the jaguar protector, whose body arches over him from its head (fanged, open jaw) at the left to the curled
// tail and hanging paws at the right, with a ring of glyph cartouches along the top; low relief 1.5–4.5 cm on one continuous modelled
// surface (src/styles/tikal/relief.js), in the sapodilla's own wood with touches of red and jade paint.
// [stated: the three sapodilla lintels, the carved one showing the ruler enthroned, Wikipedia "Tikal Temple I"; the jaguar protector in the
// lintel's composition is the Classic Maya motif, the arrangement here is [inferred]]

import { box } from '../../core/geom.js';
import { Field, cap, ell, rect, poly, emitMeshes } from './relief.js';

const TIM = 'timber', RED = 'stucco_red', JD = 'inlay_jade', BL = 'maya_blue', CRM = 'limestone_carved';

/** The beam over a door (its front at u = 0, F the shrine's frame, face its side), y the top of the opening, half-width hw, height H. */
export function jaguarLintel(bag, F, face, y, hw, H = 0.95, cell = 0.03) {
  const r = F.R(-0.07, 0, -hw, hw);
  bag.add(TIM, box(r[0], y, r[1], r[2], y + H, r[3]));                                                  // the beam itself
  const flipV = face === 'n' || face === 'e' ? -1 : 1;
  const fld = new Field([-hw + 0.04, 0.03, hw - 0.04, H - 0.03], cell);
  const w = hw / 1.05;                                                                                   // the design is for a 2.1 m beam
  const C = (ax, ay, bx, by, ra, rb) => cap(ax * w, ay, bx * w, by, ra, rb ?? ra), E = (cx, cy, rx, ry, rot) => ell(cx * w, cy, rx * w, ry, rot);
  // border: a raised fillet along the top and bottom
  fld.put(rect(0, 0.06, hw - 0.08, 0.018, 0.01), { d: 0.012 }); fld.put(rect(0, H - 0.06, hw - 0.08, 0.018, 0.01), { d: 0.012 });
  // the glyph cartouches along the top band
  for (let i = 0; i < 9; i++) { const a = (-0.9 + i * 0.225) * w; fld.put(rect(a, H - 0.14, 0.085 * w, 0.055, 0.015), { d: 0.016 }); fld.put(ell(a - 0.02, H - 0.14, 0.03, 0.022), { d: 0.012, mat: i % 3 === 1 ? RED : null }); }
  // the throne bench in the middle, jaguar-skin, with spots
  fld.put(rect(0.05 * w, 0.17, 0.5 * w, 0.075, 0.02), { d: 0.026, mat: CRM });
  for (let i = 0; i < 6; i++) fld.put(ell((-0.28 + i * 0.12) * w, 0.17, 0.028, 0.026), { d: 0.01, mat: RED });
  // the ruler seated: crossed legs, torso, arms with the sceptre, head in profile, the headdress
  fld.put(ell(0.05 * w, 0.31, 0.3 * w, 0.075), { d: 0.026, dome: 0.3, dr: 0.05 });                         // crossed legs
  fld.put(ell(0.05 * w, 0.47, 0.2 * w, 0.21), { d: 0.038, dome: 0.3, dr: 0.1 });                          // torso
  fld.put(ell(0.05 * w, 0.52, 0.12 * w, 0.075), { d: 0.012, mat: JD });                                    // pectoral
  fld.put(C(0.17, 0.6, 0.33, 0.4, 0.05, 0.045), { d: 0.046, dome: 0.3, dr: 0.03 });                       // the arm reaching forward
  fld.put(ell(0.32 * w, 0.37, 0.045, 0.04), { d: 0.03, dome: 0.3, dr: 0.03 });
  fld.put(C(0.36, 0.2, 0.38, 0.72, 0.022, 0.03), { d: 0.03, mat: RED });                                   // the sceptre
  fld.put(C(-0.12, 0.6, -0.2, 0.4, 0.05, 0.045), { d: 0.046, dome: 0.3, dr: 0.03 });
  fld.put(poly([[0.0, 0.58], [-0.05, 0.65], [-0.03, 0.74], [0.04, 0.78], [0.09, 0.74], [0.12, 0.7], [0.145, 0.67], [0.125, 0.65], [0.12, 0.62], [0.09, 0.6]].map(([x, y]) => [(x + 0.05) * w, y])), { d: 0.034, dome: 0.15, dr: 0.04 });   // the head
  fld.put(ell(0.01 * w, 0.68, 0.03, 0.03), { d: 0.02, mat: JD });                                          // the ear flare
  for (let i = 0; i < 5; i++) { const t = i / 4 - 0.5; fld.put(C(0.05 + t * 0.06, 0.78, 0.05 + t * 0.34, 0.78 + 0.1 * (1 - Math.abs(t)), 0.026, 0.036), { d: 0.02 + 0.004 * (i % 2), mat: i % 2 ? JD : BL }); }   // the plumes
  // the jaguar protector: its body arching over the king from the left, its head at the left, a curled tail, the paws hanging at the right
  fld.put(C(-0.62, 0.72, 0.0, 0.84, 0.1, 0.09), { d: 0.034, dome: 0.3, dr: 0.06 });
  fld.put(C(0.0, 0.84, 0.66, 0.72, 0.09, 0.08), { d: 0.034, dome: 0.3, dr: 0.06 });
  fld.put(E(-0.8, 0.68, 0.19, 0.16), { d: 0.04, dome: 0.3, dr: 0.1 });                                      // the head
  fld.put(C(-0.74, 0.64, -0.98, 0.58, 0.1, 0.07), { d: 0.038 });                                             // the muzzle
  fld.put(C(-0.96, 0.47, -0.72, 0.47, 0.04, 0.04), { d: 0.034, mat: RED });                                    // the lower jaw
  for (let i = 0; i < 3; i++) fld.put(C(-0.93 + i * 0.08, 0.55, -0.93 + i * 0.08, 0.49, 0.022, 0.012), { d: 0.045, mat: CRM });   // fangs
  fld.put(E(-0.78, 0.74, 0.04, 0.032), { d: 0.05, mat: JD });                                               // the eye
  for (const dx of [-0.74, -0.62]) fld.put(E(dx, 0.84, 0.04, 0.035), { d: 0.034 });                          // the ears
  for (let i = 0; i < 9; i++) fld.put(E(-0.55 + i * 0.14, 0.77 + Math.sin(i / 8 * Math.PI) * 0.07, 0.034, 0.03), { d: 0.05, mat: RED });  // rosettes of the pelt
  fld.put(C(0.62, 0.72, 0.86, 0.6, 0.06, 0.045), { d: 0.034, dome: 0.3, dr: 0.03 });                           // the tail curling
  fld.put(C(0.86, 0.6, 0.84, 0.4, 0.045, 0.04), { d: 0.034 });
  for (const dx of [0.52, 0.66]) { fld.put(C(dx, 0.68, dx + 0.02, 0.48, 0.06, 0.05), { d: 0.036, dome: 0.3, dr: 0.03 }); }   // the hanging paws
  // glyph pairs beside the throne
  for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) fld.put(rect(sg * 0.8 * w, 0.2 + i * 0.12 - (sg < 0 ? 0 : 0.03), 0.08 * w, 0.045, 0.012), { d: 0.02, mat: i ? null : (sg < 0 ? RED : BL) });
  const to = (a, yy, zz) => { const p = F.P(-0.07 - zz, flipV * a); return [p[0], y + yy, p[1]]; }, o0 = to(0, 0, 0);
  const toN = (nx, ny, nz) => { const a = to(1, 0, 0), b = to(0, 1, 0), c = to(0, 0, 1); return [nx * (a[0] - o0[0]) + ny * (b[0] - o0[0]) + nz * (c[0] - o0[0]), nx * (a[1] - o0[1]) + ny * (b[1] - o0[1]) + nz * (c[1] - o0[1]), nx * (a[2] - o0[2]) + ny * (b[2] - o0[2]) + nz * (c[2] - o0[2])]; };
  const m = new Map(); fld.mesh(to, toN, 'stucco_ochre', m); emitMeshes(m, (mt, g) => bag.add(mt, g), 'stucco_ochre');
}
