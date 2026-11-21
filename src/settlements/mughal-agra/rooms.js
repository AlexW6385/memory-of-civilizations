// The furnished rooms of the town houses as near plans (docs/settlements/mughal-agra.md §18): the walls, fronts and roofs of a house are
// the always-shown `haveli` (part 'shell'); what stands inside (the shop's goods and the keeper's seat, the household's hearth, loom or
// beds, the stair and the room over it) is this element, the same builder run for the 'inside' part, in plans of the houses of one
// 80 m square of the town shown only within reach of the visitor. The lot is carried as `lot`, not `rect`: a `rect` here would be read
// by the street life as one more house.
import { STYLES } from '../../core/build.js';
import { townHouse } from '../../styles/mughal/townhouse.js';
import '../../styles/mughal/index.js';

const NEAR_PAD = 32;                                  // how far past its farthest house a chunk's rooms are still shown (m)
const CHUNK = 100;                                    // side of the chunks (m)

export function agraRooms(el, ctx) {
  const { lot, ...rest } = el;
  townHouse({ ...rest, rect: lot, part: 'inside' }, ctx);
}

/** The houses grouped by the 80 m square their middle is in: [{ id, houses, center, near }]. */
export function roomChunks(all) {
  const m = new Map();
  for (const h of all) {
    const cx = (h.rect[0] + h.rect[2]) / 2, cz = (h.rect[1] + h.rect[3]) / 2, k = `${Math.floor(cx / CHUNK)}_${Math.floor(cz / CHUNK)}`.replace(/-/g, 'm');
    let c = m.get(k);
    if (!c) m.set(k, (c = { id: k, houses: [], sx: 0, sz: 0 }));
    c.houses.push(h); c.sx += cx; c.sz += cz;
  }
  return [...m.values()].sort((a, b) => (a.id < b.id ? -1 : 1)).map((c) => {
    const center = [c.sx / c.houses.length, c.sz / c.houses.length];
    const rmax = Math.max(...c.houses.map((h) => Math.hypot((h.rect[0] + h.rect[2]) / 2 - center[0], (h.rect[1] + h.rect[3]) / 2 - center[1]) + 8));
    return { id: c.id, houses: c.houses, center, near: Math.round(rmax + NEAR_PAD) };
  });
}

STYLES.mughal.elements.agra_rooms = agraRooms;
