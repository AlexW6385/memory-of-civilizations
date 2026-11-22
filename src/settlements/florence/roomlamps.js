// The light of the lamps hung in the rooms of the opened houses (docs/settlements/florence.md §23). The renaissance style's rooms
// (casa-open.js, casa-up.js) hang a lamp_glass from the beam; at night that glass was alone in a black room. This wraps the bag handed to those
// builders so that each lamp glass added also gets its glow ball and the pool on the floor below it, in the `halo` material (halo.js).
import { Halo } from './halo.js';

/** A bag that passes everything on and adds the halo of each lamp glass. floors: the heights of the floors a lamp may hang over. */
export function litRooms(bag, floors) {
  return {
    add(mat, g) {
      bag.add(mat, g);
      if (mat !== 'lamp_glass' || !g?.attributes?.position) return;
      const p = g.attributes.position, seen = [];
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        let c = seen.find((s) => Math.abs(s.x - x) < 0.5 && Math.abs(s.z - z) < 0.5 && Math.abs(s.y - y) < 0.6);
        if (!c) seen.push(c = { x, z, y, lo: y, hi: y }); else { c.lo = Math.min(c.lo, y); c.hi = Math.max(c.hi, y); c.x = (c.x + x) / 2; c.z = (c.z + z) / 2; }
      }
      const H = new Halo();
      for (const c of seen) {
        const fl = floors.filter((f) => f <= c.lo - 1.2).pop() ?? c.lo - 2.4;
        H.ball(c.x, (c.lo + c.hi) / 2, c.z, 0.9);
        H.floor(c.x, fl + 0.05, c.z, 2.0, 2.0, 6, 0.7);
      }
      const hg = H.geometry(); if (hg) bag.add('halo', hg);
    },
  };
}
