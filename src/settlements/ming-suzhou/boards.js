// The inscribed boards of Ming Suzhou (docs/settlements/ming-suzhou.md §23): a raised frame round a field,
// the characters of script.js standing on it in relief. Two finishes, both chosen to read in shade:
//   'gilt'  (halls and shops): a black lacquer field, the characters in gold paint;
//   'wood'  (the garden's pavilions): a plain pale-wood field, the characters in black ink.
// Built facing +z, the origin at the bottom centre of the board.
import { box } from '../../core/geom.js';
import { canWrite, inscription } from './script.js';
import { AT } from './wen.js';

const FINISH = {
  gilt: { field: 'lacquer_black', ink: 'paint_ochre', rim: 'paint_ochre' },
  wood: { field: 'paint_ochre', ink: 'lacquer_black', rim: 'lacquer_red' },
};

/** The characters' size and pitch for a board's field (m): `room` the length they run along, `across` the other way. */
export function fit(m, room, across) {
  const size = Math.min(across * 0.92, room / m / 1.04);
  return { size, pitch: Math.min(size * 1.1, room / m) };
}

/**
 * board(P, el): P a Parts, el { w, h, text, finish ('gilt' | 'wood'), vertical, seal (a small red seal at the left end
 * of a horizontal board, where the signature stands), thick }.
 */
export function boardBuild(P, el) {
  const w = el.w ?? 2.4, h = el.h ?? 0.75, vertical = !!el.vertical, F = FINISH[el.finish ?? 'gilt'] ?? FINISH.gilt;
  const fw = Math.min(0.07, Math.min(w, h) * 0.12);
  P.add('lacquer_black', box(-w / 2, 0, -0.03, w / 2, h, 0.03));
  P.add(F.field, box(-w / 2 + fw, fw, 0.03, w / 2 - fw, h - fw, 0.04));
  // the raised frame, with a fine rim of colour inside it
  P.add('lacquer_black', box(-w / 2, 0, 0.03, w / 2, fw, 0.075)); P.add('lacquer_black', box(-w / 2, h - fw, 0.03, w / 2, h, 0.075));
  P.add('lacquer_black', box(-w / 2, fw, 0.03, -w / 2 + fw, h - fw, 0.075)); P.add('lacquer_black', box(w / 2 - fw, fw, 0.03, w / 2, h - fw, 0.075));
  const r = 0.012, a = fw - 0.002;
  P.add(F.rim, box(-w / 2 + a, a, 0.04, w / 2 - a, a + r, 0.058)); P.add(F.rim, box(-w / 2 + a, h - a - r, 0.04, w / 2 - a, h - a, 0.058));
  P.add(F.rim, box(-w / 2 + a, a + r, 0.04, -w / 2 + a + r, h - a - r, 0.058)); P.add(F.rim, box(w / 2 - a - r, a + r, 0.04, w / 2 - a, h - a - r, 0.058));
  if (!canWrite(el.text)) return;
  const m = [...el.text].length, seal = el.seal && !vertical ? 0.2 : 0, edge = fw + 0.035;
  const room = (vertical ? h : w) - 2 * edge - seal, across = (vertical ? w : h) - 2 * edge;
  const { size, pitch } = fit(m, room, across), depth = Math.min(0.022, size * 0.07);
  P.add(F.ink, inscription(el.text, { pitch, size, z0: 0.04, z1: 0.04 + depth, vertical, thick: el.thick ?? 1.3 }).translate(vertical ? 0 : seal / 2, h / 2, 0));
  if (seal) {                                                // the seal at the left end, a little below the middle: a red block in a raised border
    const s = Math.min(0.1, across * 0.34), x = -w / 2 + edge + s * 0.6, y = h / 2 - across * 0.12;
    P.add('lacquer_red', box(x - s / 2, y - s / 2, 0.04, x + s / 2, y + s / 2, 0.052));
    P.add(F.rim, box(x - s * 0.36, y - s * 0.36, 0.052, x + s * 0.36, y + s * 0.36, 0.056));
    P.add('lacquer_red', box(x - s * 0.3, y - s * 0.3, 0.056, x + s * 0.3, y + s * 0.3, 0.058));
  }
}

// ── the plain boards of Wen Zhengming's scenes (wenscenes.js): the characters on their black faces ──
const WEN_NAMES = { jingshen: '凈深亭', huaiyu: '槐雨亭', jiashi: '嘉實亭', dezhen: '得真亭' };
/** The name of the Wen pavilion standing at (cx, cz), if it is one of the four. */
export const nameAt = (cx, cz) => { for (const [id, t] of Object.entries(WEN_NAMES)) if (AT[id]?.c && Math.abs(AT[id].c[0] - cx) < 0.01 && Math.abs(AT[id].c[1] - cz) < 0.01) return t; return null; };
/** Gilt characters on the black face of a plain board centred between a and b (its front `off` m out along the normal (nx, nz)), at height ymid, read right to left. */
export function lettering(P, text, a, b, nx, nz, ymid, off = 0.056) {
  if (!canWrite(text)) return;
  const m = [...text].length, L = Math.hypot(b[0] - a[0], b[1] - a[1]), { size, pitch } = fit(m, L - 0.2, 0.34), l = Math.hypot(nx, nz) || 1;
  const g = inscription(text, { pitch, size, z0: 0, z1: Math.min(0.016, size * 0.07), thick: 1.3 }).translate(0, ymid, off);
  g.rotateY(Math.atan2(nx / l, nz / l)); g.translate((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
  P.add('paint_ochre', g);
}
