// Sailendra Java (Borobudur), c. 825 — wear on what is walked (docs/settlements/borobudur.md §20.5): the bare trodden earth where the feet of a household come down from the
// stair to the yard, and before each stall's counter where its buyers stand. The wet tropics leave no dust: wet feet on bare ground make earth, the grass gone. Wraps the
// style's `rumah` and `warung` from here (the style file stays as it was); the patches are flat slabs of the style's own `mudbrick`, big enough not to be fine pieces (no new
// draw), their edges broken by the hash of their own place. Nothing is written anywhere: no inscription could be set down in Old Javanese or Sanskrit here with every
// letter verified, so the monument's and the shops' boards stay plain (§20.5).
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { rumahPlace } from '../../styles/javanese/index.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.javanese.elements, house = E.rumah, stall = E.warung;
  E.rumah = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (el.kind === 'lumbung' || el.simple) return r;
    const { su, D, run, P } = rumahPlace(el), a = P(su - 0.95, D / 2 + run + 0.1), b = P(su + 0.95, D / 2 + run + 1.5), h = hashAt(a[0], a[1], 41);
    const x0 = Math.min(a[0], b[0]) - 0.2 * h, x1 = Math.max(a[0], b[0]) + 0.2 * (1 - h), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]) + 0.3 * h;
    ctx.bag.add('mudbrick', box(x0, 0.002, z0, x1, 0.012, z1));
    return r;
  };
  E.warung = function worn(el, ctx) {
    const r = stall.call(this, el, ctx);
    const s = el.face === 's' ? 1 : el.face === 'n' ? -1 : 0, e = el.face === 'e' ? 1 : el.face === 'w' ? -1 : 0, W = el.w ?? 4;
    const cx = el.at[0] + e * 2.1, cz = el.at[1] + s * 2.1, hx = e ? 0.9 : W / 2 - 0.2, hz = s ? 0.9 : W / 2 - 0.2;
    ctx.bag.add('mudbrick', box(cx - hx, 0.002, cz - hz, cx + hx, 0.01, cz + hz));
    return r;
  };
}
/**
 * bb_wear { c, base, squares }: the monument worn where feet went (§21): along each gallery a strip of trodden earth 1.2-1.6 m wide down the middle of the way round it, in pieces of 5-9 m
 * broken at the stairs and at the redents, and at the foot of each flight a patch where the climbers stand; flat `mudbrick` slabs a few millimetres over the paving (no collision), their
 * lengths, widths and gaps set by the hash of their own place. The wet tropics: bare feet bring wet earth up from the ground, and it is left where they step. [inferred]
 */
function monumentWear({ c: [cx, cz], base, squares }, { bag }) {
  const p = base.p;
  let prevA = base.a + 0.2, prevY = base.h;
  for (const s of squares) {
    const mid = (s.a + prevA) / 2, t = s.a / 3, y = prevY;
    for (const [sx, sz, nx, nz] of [[1, 0, 0, -1], [1, 0, 0, 1], [0, 1, -1, 0], [0, 1, 1, 0]]) {
      for (const [u0, u1, d] of [[-s.a + 2, -t - 1.8, mid], [-t + 1.8, -4.5, mid + p], [4.5, t - 1.8, mid + p], [t + 1.8, s.a - 2, mid]]) {
        for (let u = u0 + 3 * hashAt(cx + s.a, u0 * 2 + sx, 51); u < u1 - 1;) {
          const L = Math.min(u1 - u, 5 + 4 * hashAt(u + sx * 5, s.a + nz * 3, 52)), w = 0.6 + 0.2 * hashAt(u, d + nx, 53), dd = d + (hashAt(u, d, 54) - 0.5) * 0.3;
          const ax = cx + sx * u + nx * (dd - w), az = cz + sz * u + nz * (dd - w), bx = cx + sx * (u + L) + nx * (dd + w), bz = cz + sz * (u + L) + nz * (dd + w);
          bag.add('mudbrick', box(Math.min(ax, bx), y + 0.003, Math.min(az, bz), Math.max(ax, bx), y + 0.011, Math.max(az, bz)));
          u += L + 2.5 + 3 * hashAt(u, L, 55);
        }
      }
    }
    prevA = s.a; prevY = s.y;
  }
  // where the climbers stand at the foot of the flights on the ground (the three that are not the paved way's)
  const d0 = base.a + p + Math.max(2.4, base.h) + 0.6;
  for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0]]) {
    const ux = -nz, uz = nx, h = hashAt(nx * 9, nz * 9, 56), a = d0 + 1.9, b = d0 + 4.2 + h, w = 1.5 + 0.3 * h;
    const x0 = cx + nx * a + ux * -w, z0 = cz + nz * a + uz * -w, x1 = cx + nx * b + ux * w, z1 = cz + nz * b + uz * w;
    bag.add('mudbrick', box(Math.min(x0, x1), 0.004, Math.min(z0, z1), Math.max(x0, x1), 0.012, Math.max(z0, z1)));
  }
}
/** bb_keepers { list: [figure parameters] }: the stalls' sellers, built into the near plan of the stalls they stand in (a life element's figures reach 170 m wherever they stand). */
function keepers(el, ctx) {
  const fig = STYLES.life?.elements?.figure;
  if (!fig) return;
  for (const f of el.list) fig({ ...f }, { bag: ctx.bag, col: ctx.col });
}
let done2 = false;
export function registerMonumentWear() { if (done2) return; done2 = true; STYLES.javanese.elements.bb_wear = monumentWear; STYLES.javanese.elements.bb_keepers = keepers; }
registerMonumentWear();
registerWear();
