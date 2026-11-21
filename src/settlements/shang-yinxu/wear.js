// Shang Yinxu — wear on what is walked (docs/settlements/shang-yinxu.md §13): the stairs of the halls, the tomb and the archive trodden dark down their middle, the thresholds
// of the houses worn where the feet cross, the soot of the hearth over the door. Wraps the elements of the `shang` style from here (the style files stay as they were, but for
// the hook houses.js calls at each doorway); pure functions of the element's own numbers. Nothing is written (no inscription: see the dossier).
import '../../styles/shang/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { HOOK } from '../../styles/shang/houses.js';
import { TOMB, ARCHIVE } from './layout.js';

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
const wrapAfter = (fn, extra) => function worn(el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple) extra(el, ctx); return r; };

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.shang?.elements;
  if (!E) return;
  if (E.shang_hall) E.shang_hall = wrapAfter(E.shang_hall, hallStair);
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
