// The monks' quarters of Foguang made rooms (docs/settlements/tang-wutai.md §10a): the two ranges along the lower courtyard (plan.js
// quarters(): seven bays of 3.9 m, 7.2 m deep, a plank door in bays 1, 3 and 5) are partitioned into three rooms each, bays 0–1, 2–3
// and 4–5 (bay 6 stays closed, a store): in the north range two dormitories of the great platform-bed and the refectory with its
// stove; in the south range the guest room, the sutra store and a dormitory [inferred: the use of the rooms; the furnishing after the
// monastic rules and the northern Chinese farmhouse (the kang)]. Elements of the `chinese` style, in settlement coordinates.

const N = 7, BAY = 3.9, D = 7.2, P = 0.45, H = 3.6, T = 0.36;
export const ROOM_KINDS = { '-1': ['dorm', 'dorm', 'refectory'], 1: ['guest', 'sutra', 'dorm'] };

/** The rooms: [{ id, s, k0, kind, rect [x0, z0, x1, z1] (inside the walls), doorX, front (z of the front wall's inner face), back }]. */
export function rooms(at) {
  const out = [];
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) {
    const x0 = at(-103, 0)[0] + r * 2 * BAY, xa = x0 + 0.22, xb = x0 + 2 * BAY - 0.22;
    const frontI = s * 35.5 + s * 0.18, backI = s * (35.5 + D) - s * 0.18;
    out.push({ id: `sengfang-${s < 0 ? 'n' : 's'}${r}`, s, r, kind: ROOM_KINDS[s][r], rect: [xa, Math.min(frontI, backI), xb, Math.max(frontI, backI)], doorX: x0 + 1.5 * BAY, frontI, backI });
  }
  return out;
}

/** The elements: partitions, ceilings, the furniture. */
export function cellElements(at) {
  const E = [], add = (o) => (E.push(o), o);
  for (const rm of rooms(at)) {
    const { s, kind, rect, doorX, frontI, backI } = rm, [xa, , xb] = rect;
    const Z = (dep) => backI - s * dep;                                  // dep: from the back wall's inner face toward the front
    const blk = (x0, x1, d0, d1, y0, y1, mat, collide = true) => { const a = Z(d0), b = Z(d1); add({ t: 'block', rect: [x0, Math.min(a, b), x1, Math.max(a, b)], y0, y1, mat, collide }); };
    const top = P + H - 0.36;
    // the partition to the next room (bay line 2, 4, 6 from the range's west end), the ceiling of boards, the floor's brick
    const px = xb + 0.22;
    add({ t: 'wall', a: [px, Math.min(frontI, backI) - 0.18], b: [px, Math.max(frontI, backI) + 0.18], th: 0.24, y0: P, y1: top, openings: [], mat: 'plaster_white' });
    add({ t: 'block', rect: [xa, Math.min(frontI, backI), xb, Math.max(frontI, backI)], y0: top - 0.1, y1: top, mat: 'ceiling_grid', collide: false });
    add({ t: 'block', rect: [xa, Math.min(frontI, backI), xb, Math.max(frontI, backI)], y0: P, y1: P + 0.02, mat: 'brick_grey', collide: false });
    const kangEnd = (kind === 'refectory') ? xb - 2.6 : xb;
    if (kind === 'dorm') {
      // the great platform-bed (kang) along the back wall: brick, a reed mat, folded quilts in a row, a pillow-block each; robes on a rail above
      blk(xa, xb, 0, 2.0, P, P + 0.62, 'brick_grey'); blk(xa + 0.05, xb - 0.05, 0.05, 1.95, P + 0.62, P + 0.645, 'reed_mat', false);
      for (let x = xa + 0.35; x < xb - 0.8; x += 1.15) { blk(x, x + 0.8, 0.2, 1.3, P + 0.645, P + 0.8, ((x * 7) | 0) % 2 ? 'cloth_ochre' : 'cloth_grey', false); blk(x + 0.1, x + 0.55, 1.4, 1.75, P + 0.645, P + 0.76, 'timber', false); }
      blk(xa + 0.1, xb - 0.1, 0.05, 0.12, P + 1.7, P + 1.78, 'timber', false);
      for (let x = xa + 0.7; x < xb - 0.6; x += 1.4) blk(x, x + 0.5, 0.1, 0.16, P + 0.95, P + 1.7, 'cloth_brown', false);
      // a low table with the sutra and a lamp before the platform, two cushions; the washstand and bowls by the door's side
      blk(doorX - 2.7, doorX - 1.5, 2.8, 3.4, P, P + 0.42, 'lacquer_chestnut'); blk(doorX - 2.6, doorX - 2.0, 2.95, 3.25, P + 0.42, P + 0.45, 'paint_white', false);
      blk(doorX - 2.8, doorX - 2.3, 3.7, 4.2, P, P + 0.07, 'cloth_ochre', false); blk(doorX - 1.9, doorX - 1.4, 3.7, 4.2, P, P + 0.07, 'cloth_ochre', false);
      blk(xb - 0.7, xb - 0.1, 3.6, 4.5, P, P + 0.8, 'lacquer_chestnut'); for (let k = 0; k < 3; k++) blk(xb - 0.6 + k * 0.15, xb - 0.5 + k * 0.15, 3.8, 4.0, P + 0.8, P + 0.9, 'glaze_green', false);
      blk(xa + 0.1, xa + 0.7, D - 1.6, D - 0.5, P, P + 0.55, 'lacquer_black');                        // a chest
      add({ t: 'tang_lamp', at: [doorX - 2.1, Z(3.1)], y: P + 0.45, h: 0.22, intensity: 1.5, distance: 6 });
    } else if (kind === 'refectory') {
      // the stove and its great pot in the back corner, the water vat and the bowls on a shelf; two long tables with benches either side of the door line
      blk(xb - 2.4, xb - 0.1, 0, 1.2, P, P + 0.85, 'brick_grey'); blk(xb - 1.9, xb - 0.7, 0.25, 0.95, P + 0.85, P + 1.1, 'iron', false);
      blk(xa + 0.1, xa + 0.9, 0.1, 0.9, P, P + 0.9, 'pottery_dark'); blk(xa + 0.1, xb - 2.6, 0.04, 0.4, P + 1.3, P + 1.36, 'timber', false);
      for (let x = xa + 0.4; x < xb - 3.0; x += 0.34) blk(x, x + 0.2, 0.08, 0.3, P + 1.36, P + 1.5, 'glaze_white', false);
      for (const [d0, x0, x1] of [[2.0, xa + 0.3, doorX - 0.95], [2.0, doorX + 0.95, xb - 0.3], [4.2, xa + 0.3, doorX - 0.95], [4.2, doorX + 0.95, xb - 0.3]]) {
        if (x1 - x0 < 0.8) continue;
        blk(x0, x1, d0, d0 + 0.7, P, P + 0.62, 'wood_dark');
        for (const sd of [-0.5, 0.7 + 0.0]) blk(x0 + 0.05, x1 - 0.05, d0 + sd - 0.05, d0 + sd + 0.2, P, P + 0.36, 'timber', false);
        for (let x = x0 + 0.35; x < x1 - 0.3; x += 0.7) blk(x, x + 0.2, d0 + 0.25, d0 + 0.45, P + 0.62, P + 0.7, 'glaze_white', false);
      }
      add({ t: 'tang_lamp', at: [doorX, Z(3.0)], y: P + 1.9, h: 0.22, intensity: 1.5, distance: 7 });
    } else if (kind === 'sutra') {
      // shelves of scroll boxes down the back and one side wall, a reading desk with two stools, a chest; the door line clear
      blk(xa, xb, 0, 0.5, P, P + 2.5, 'wood_dark');
      for (const h of [0.3, 0.95, 1.6, 2.2]) for (let x = xa + 0.1; x < xb - 0.2; x += 0.36) blk(x, x + 0.28, 0.5, 0.62, P + h, P + h + 0.3, ((x * 5) | 0) % 3 ? 'paint_ochre' : 'cloth_indigo', false);
      blk(xa, xa + 0.5, 0.5, 4.4, P, P + 2.3, 'wood_dark');
      for (const h of [0.3, 0.95, 1.6]) for (let d = 0.6; d < 4.3; d += 0.36) blk(xa + 0.5, xa + 0.62, d, d + 0.28, P + h, P + h + 0.3, ((d * 5) | 0) % 2 ? 'paint_white' : 'paint_ochre', false);
      blk(xb - 2.6, xb - 0.9, 2.8, 3.5, P, P + 0.75, 'lacquer_black'); blk(xb - 2.3, xb - 1.7, 2.95, 3.35, P + 0.75, P + 0.78, 'paint_white', false);
      blk(xb - 2.3, xb - 1.9, 4.0, 4.4, P, P + 0.45, 'timber'); blk(xb - 1.5, xb - 1.1, 4.0, 4.4, P, P + 0.45, 'timber');
      blk(xb - 0.8, xb - 0.1, D - 1.7, D - 0.5, P, P + 0.6, 'lacquer_black');
      add({ t: 'tang_lamp', at: [xb - 2.0, Z(3.15)], y: P + 0.78, h: 0.22, intensity: 1.5, distance: 6 });
    } else if (kind === 'guest') {
      // the guest room: a platform-bed at the back with silk quilts, a screen, a square table with a tea set and four stools, a brazier, a chest
      blk(xa + 0.3, xb - 0.3, 0, 2.0, P, P + 0.55, 'brick_grey'); blk(xa + 0.35, xb - 0.35, 0.05, 1.95, P + 0.55, P + 0.575, 'reed_mat', false);
      blk(xa + 0.5, xa + 2.2, 0.2, 1.6, P + 0.575, P + 0.72, 'cloth_maroon', false); blk(xb - 2.2, xb - 0.5, 0.2, 1.6, P + 0.575, P + 0.72, 'cloth_indigo', false);
      blk(doorX + 0.9, doorX + 2.3, 2.7, 3.7, P, P + 0.72, 'lacquer_red'); for (let k = 0; k < 3; k++) blk(doorX + 1.2 + k * 0.35, doorX + 1.4 + k * 0.35, 3.0, 3.2, P + 0.72, P + 0.78, 'glaze_green', false);
      for (const [dx, dd] of [[0.5, 3.2], [2.7, 3.2], [1.6, 2.3], [1.6, 4.1]]) blk(doorX + dx, doorX + dx + 0.4, dd, dd + 0.4, P, P + 0.42, 'timber', false);
      blk(xa + 0.3, xa + 1.2, 3.2, 3.6, P, P + 0.6, 'brick_grey'); blk(xa + 0.1, xa + 0.7, D - 1.7, D - 0.5, P, P + 0.55, 'lacquer_black');
      add({ t: 'tang_lamp', at: [doorX + 1.6, Z(3.2)], y: P + 0.75, h: 0.22, intensity: 1.5, distance: 6 });
    }
  }
  return E;
}

/** The people in them: monks reading, sleeping platforms' sitters, the cook at the stove, the guest and the keeper of the scrolls. */
export function cellPeople(at, mk) {
  const L = [];
  for (const rm of rooms(at)) {
    const { s, kind, rect, doorX, backI } = rm, [xa, , xb] = rect, Z = (dep) => backI - s * dep, y = P, toFront = [0, -s], toBack = [0, s];
    if (kind === 'dorm') { L.push(mk([xa + 1.5, Z(1.0)], y + 0.62, toFront, { pose: 'cross' })); L.push(mk([doorX - 2.55, Z(3.95)], y, toBack, { pose: 'cross' })); }
    else if (kind === 'refectory') {
      L.push(mk([xb - 1.3, Z(1.7)], y, toBack, { pose: 'stand' }));
      L.push(mk([xa + 1.0, Z(1.6)], y, toFront, { pose: 'cross' })); L.push(mk([xa + 2.0, Z(3.0)], y, toBack, { pose: 'cross' })); L.push(mk([doorX + 1.8, Z(1.6)], y, toFront, { pose: 'cross' }));
    }
    else if (kind === 'sutra') L.push(mk([xb - 1.7, Z(4.2)], y, toBack, { pose: 'cross' }));
    else if (kind === 'guest') L.push(mk([doorX + 0.7, Z(3.2)], y, [1, 0], { pose: 'cross', hat: 'brim' }));
  }
  return L;
}
