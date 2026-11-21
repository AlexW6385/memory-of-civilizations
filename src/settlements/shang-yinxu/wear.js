// Shang Yinxu — wear on what is walked (docs/settlements/shang-yinxu.md §13): the stairs of the halls, the tomb and the archive trodden dark down their middle, the thresholds
// of the houses worn where the feet cross, the soot of the hearth over the door. Wraps the elements of the `shang` style from here (the style files stay as they were, but for
// the hook houses.js calls at each doorway); pure functions of the element's own numbers. Nothing is written (no inscription: see the dossier).
import '../../styles/shang/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { HOOK } from '../../styles/shang/houses.js';
import { TOMB, ARCHIVE } from './layout.js';
import { hashAt } from './nightlight.js';

/** Trodden patches down the middle of a flight (the rect and direction as geo.js steps() takes them): one on every tread, 1.6 m across, 0.6 of the tread deep. */
function wornSteps(bag, rect, y0, y1, dir, across = 1.6) {
  const [x0, z0, x1, z1] = rect, rise = y1 - y0, n = Math.max(1, Math.round(rise / 0.17)), alongX = dir === 'e' || dir === 'w', L = alongX ? x1 - x0 : z1 - z0;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sg = dir === 'n' || dir === 'w' ? -1 : 1, start = alongX ? (dir === 'e' ? x0 : x1) : (dir === 'n' ? z1 : z0);
  for (let i = 0; i < n; i++) {
    const yTop = y0 + rise * (i + 1) / n, c = start + sg * L * (i + 0.5) / n, d = L / n * 0.3;
    if (alongX) bag.add('silt', box(c - d, yTop - 0.01, cz - across / 2, c + d, yTop + 0.026, cz + across / 2));
    else bag.add('silt', box(cx - across / 2, yTop - 0.01, c - d, cx + across / 2, yTop + 0.026, c + d));
  }
}

/** The stair of a hall (hall.js: on the front face, in the middle bay, 6.4 m wide, the run 0.3 m a tread). */
function hallStair(el, { bag }) {
  const [px0, pz0, px1, pz1] = el.plat, cx = (px0 + px1) / 2, cz = (pz0 + pz1) / 2, h = el.h ?? 1.2, rot = !!el.rot, sv = el.flip ? -1 : 1;
  const pv = rot ? (sv > 0 ? px1 - cx : cx - px0) : (sv > 0 ? pz1 - cz : cz - pz0), run = h / 0.17 * 0.3;
  const M = (u, v) => (rot ? [cx + sv * v, cz + u] : [cx + u, cz + sv * v]), a = M(-3.2, pv), b = M(3.2, pv + run);
  wornSteps(bag, [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0, h, rot ? (sv > 0 ? 'w' : 'e') : (sv > 0 ? 'n' : 's'), 2.0);
}
/**
 * The rammed platform's own layering and the way feet went: the beaten layers of the platform (5-10 cm each, §4) show on its four faces as thin lenses of darker and paler
 * earth, a lens a few metres long at every second layer, offset by the hash of its place; and a trodden fan on the court's floor at the foot of the stair, narrowing toward the
 * stair, where everyone who went up crossed. [inferred: the layering is the method of rammed earth; the track follows from use] Layers in 'silt', the trodden fan in 'mud_plaster' (a duller, warmer earth).
 */
function platformWear(el, { bag }) {
  const [x0, z0, x1, z1] = el.plat, h = el.h ?? 1.2, rot = !!el.rot, sv = el.flip ? -1 : 1, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, o = 0.012;
  const nL = Math.floor(h / 0.2);
  for (let k = 0; k < nL; k++) {
    const y = 0.14 + k * 0.2 + 0.03 * hashAt(x0, z0, k), t = 0.022;
    for (const [fx, fz, alongX] of [[0, z0, true], [0, z1, true], [x0, 0, false], [x1, 0, false]]) {
      const A = alongX ? x0 : z0, B = alongX ? x1 : z1, back = alongX ? fz === z0 : fx === x0;
      let u = A + 0.6 + 4 * hashAt(fx + k, fz, 1);
      while (u < B - 1) {
        const len = 2.4 + 3.6 * hashAt(u + fx, fz + k, 2), e = Math.min(B - 0.4, u + len);
        if (hashAt(u, fz + fx + k, 3) < 0.6 && y + t < h - 0.03) {
          if (alongX) bag.add('silt', box(u, y, fz + (back ? -o : 0), e, y + t, fz + (back ? 0 : o)));
          else bag.add('silt', box(fx + (back ? -o : 0), y, u, fx + (back ? 0 : o), y + t, e));
        }
        u = e + 1.2 + 3 * hashAt(e, fz + fx, 4);
      }
    }
  }
  // the fan of trodden earth before the stair
  const pv = rot ? (sv > 0 ? x1 - cx : cx - x0) : (sv > 0 ? z1 - cz : cz - z0), run = h / 0.17 * 0.3 + 0.2;
  const M = (u, v) => (rot ? [cx + sv * v, cz + u] : [cx + u, cz + sv * v]);
  for (let i = 0; i < 40; i++) {
    const v = pv + run + 5.5 * hashAt(x0 + i, z0, 11) ** 1.3, w = 2.8 - 0.35 * (v - pv - run), u = (hashAt(x0, z0 + i, 12) * 2 - 1) * Math.max(0.6, w) * 0.8, l = 0.5 + 0.9 * hashAt(i, x0, 13), d = 0.4 + 0.6 * hashAt(i, z0, 14);
    if (hashAt(u + x0, v + z0, 15) > 0.8 - 0.1 * (v - pv - run)) continue;
    const a = M(u - l / 2, v), b = M(u + l / 2, v + d);
    bag.add('mud_plaster', box(Math.min(a[0], b[0]), 0.004, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 0.012 + 0.006 * hashAt(i, v, 16), Math.max(a[1], b[1])));
  }
}
const wrapAfter = (fn, extra) => function worn(el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple) extra(el, ctx); return r; };

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.shang?.elements;
  if (!E) return;
  if (E.shang_hall) E.shang_hall = wrapAfter(E.shang_hall, (el, c) => { hallStair(el, c); platformWear(el, c); });
  if (E.shang_tomb) E.shang_tomb = wrapAfter(E.shang_tomb, ({ }, { bag }) => { const cx = (TOMB.hall[0] + TOMB.hall[2]) / 2; wornSteps(bag, [cx - 1.4, TOMB.plat[3], cx + 1.4, TOMB.plat[3] + 1.2], 0, TOMB.h, 'n', 1.1); });
  if (E.shang_archive) E.shang_archive = wrapAfter(E.shang_archive, ({ }, { bag }) => { const cx = (ARCHIVE.rect[0] + ARCHIVE.rect[2]) / 2, z1 = ARCHIVE.rect[3]; wornSteps(bag, [cx - 1.3, z1 + 0.6, cx + 1.3, z1 + 2.4], 0, ARCHIVE.h, 'n', 1.3); });
  // the thresholds: the worn dark patch on the slab (houses.js doorway) or the bank's step (a pit house), the soot of the hearth above a house's lintel
  const prev = HOOK.door;
  HOOK.door = (F, dc, b, y0, wid, ht, th, pit) => {
    prev?.(F, dc, b, y0, wid, ht, th, pit);
    const top = pit ? 0.12 : y0 + 0.06;
    F.b('granite_black', dc - 0.35, top - 0.01, b - (pit ? 0.4 : 0.3), dc + 0.35, top + 0.026, b - 0.04, false);
    if (!pit) F.b('granite_black', dc - 0.5, y0 + ht + 0.2, b - 0.026, dc + 0.5, y0 + ht + 0.5, b - 0.02, false);
  };
}
registerWear();
