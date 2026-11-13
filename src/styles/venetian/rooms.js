// Who is at home, and the light of the room (docs/settlements/venice.md §5c): the houses and osterie that can be entered (the shared
// `house_med` builds their furnished ground floor) get here a small oil lamp on the table or the counter with the point of light it gives, and
// their people — the innkeeper behind his counter, the patrons on the benches, the housewife at the hearth, the master on his stool.
// ven_room { items: [{ k: 'lamp', at: [x, z], y } | { k: 'person', at: [x, z], y, rot, ...figure }] } — placed by settlement/venice/rooms.js.
import { STYLES } from '../../core/build.js';
import { lathe, box, fromTriangles } from '../../core/geom.js';

const lampKit = (bag, lights, x, y, z, k) => {
  bag.add('terracotta', lathe([[0.001, 0], [0.06, 0.005], [0.085, 0.03], [0.08, 0.05], [0.001, 0.045]], 9, null, x, y, z));     // the bowl of the oil lamp (a lucerna)
  bag.add('flame', lathe([[0.001, 0.045], [0.02, 0.06], [0.001, 0.12]], 6, null, x + 0.05, y, z));
  lights.push({ at: [x, y + 0.3, z], color: '#ffb46b', intensity: k ?? 2.4, distance: 7 });
};

export function venRoom(el, ctx) {
  const { bag, lights } = ctx;
  for (const o of el.items) {
    if (o.k === 'lamp') lampKit(bag, lights, o.at[0], o.y, o.at[1], o.intensity);
    else if (o.k === 'person') { const { k, ...f } = o; STYLES.life.elements.figure({ t: 'figure', ...f }, ctx); }
  }
}

/**
 * ven_front { items: [{ rect, front ('n' | 's'), y, st (the storey), seed }] } — the bottega's striped awning over the shop front: slats of cloth in
 * two colours sloping from the wall at the lintel down and out to a rail on two poles, 1.2 m out over the calle; the shutters of the shop open under it.
 */
const AWN = [['cloth_red', 'cloth_white'], ['cloth_indigo', 'cloth_white'], ['cloth_green', 'cloth_white'], ['cloth_ochre', 'cloth_white']];
export function venFront(el, { bag }) {
  for (const o of el.items) {
    const [x0, z0, x1, z1] = o.rect, s = o.front === 's' ? 1 : -1, zf = s > 0 ? z1 : z0, [c1, c2] = AWN[o.seed % AWN.length];
    const yt = o.y + 0.6 + 2.95, yb = o.y + 0.6 + 2.45, out = 1.2, u0 = x0 + 0.5, u1 = x1 - 0.5, n = Math.max(4, Math.round((u1 - u0) / 0.55)), w = (u1 - u0) / n;
    for (let i = 0; i < n; i++) {
      const a = u0 + i * w, b = a + w, za = zf + s * 0.04, zb = zf + s * out;
      const A = [a, yt, za], B = [b, yt, za], C = [b, yb, zb], D = [a, yb, zb];
      bag.add(i % 2 ? c2 : c1, fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C]));     // both faces: it is seen from above and from under
    }
    bag.add('timber', box(u0 - 0.02, yb - 0.04, Math.min(zf + s * (out - 0.03), zf + s * (out + 0.03)), u1 + 0.02, yb + 0.05, Math.max(zf + s * (out - 0.03), zf + s * (out + 0.03))));          // the rail along the awning's edge
    for (const u of [u0, u1]) bag.add('timber', box(u - 0.035, o.y + 0.6, zf + s * out - 0.035, u + 0.035, yb, zf + s * out + 0.035));                                                // its two poles
  }
}
