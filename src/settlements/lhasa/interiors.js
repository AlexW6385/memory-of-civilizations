// The houses' rooms as plans of their own, built only near the visitor (docs/settlements/lhasa.md §19). A house is two elements of the
// style: its shell (`part: 'shell'`, always built, closed: the walls with their painted windows, the gate and the doorways, the gallery,
// the roof with its flags) and what furnishes its rooms (`part: 'rooms'`: the stable's manger, the store's jars, the main room's stove,
// the shrine's altar, the weaving room's loom, the household's people). Far lots keep the closed form; the rooms of the lots of one band
// of Shöl (or one sector of the farmsteads) make one plan, shown within `near` of its middle, which is the farthest of its lots and a margin.
import { SHOL, inRect } from './layout.js';

/** The band of a lot: Shöl's houses in three bands across (x −67, 67), the farmsteads in sectors of 30 degrees about the origin. */
function bandOf(l) {
  const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
  if (l.farm || !inRect(SHOL, cx, cz)) return `farm${Math.floor(Math.atan2(cz, cx) / (Math.PI / 6))}`;
  return `shol${cx < -67 ? 0 : cx < 67 ? 1 : 2}`;
}
/** [{ id, lots, center, near }]: the lots grouped into their bands. */
export function bands(all, margin = 14) {
  const by = new Map();
  for (const l of all) { const k = bandOf(l); if (!by.has(k)) by.set(k, []); by.get(k).push(l); }
  return [...by].map(([id, lots]) => {
    const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
    const c = [0, 1].map((k) => (Math.min(...lots.map((l) => mid(l)[k])) + Math.max(...lots.map((l) => mid(l)[k]))) / 2);
    const near = Math.max(...lots.map((l) => Math.hypot(mid(l)[0] - c[0], mid(l)[1] - c[1]))) + margin;
    return { id, lots, center: c, near };
  });
}
