// Venice by night (docs/settlements/venice.md §5f.2): the plans of the halos (venetian/night.js, halo.js) — the open shops' glow across the arcade, the
// iron lanterns of the calli and the Merceria, the capitelli at the bridge heads, the lantern at the stern of each moored gondola. The shops' own lamps
// are in venetian/shops.js. Pure data from the dressing's plans and layout.js; near plans, so that only the streets round the visitor carry them.
import { RADIUS, GROUND, SEA, bridges, inLot, wet } from './layout.js';
import { hashAt } from '../../styles/venetian/halo.js';
import { molo } from './plan.js';

const plan = (id, elements, center, near) => ({ id, style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], entrance: { at: [-120, -5], facing: 'e' }, center, near, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], elements });

/** The capitelli: at one end of each bridge, on the quay beside the steps, facing the street. [inferred: the place; stated: they stood at bridge heads and corners] */
export function capitelli() {
  const out = [];
  for (const b of bridges()) {
    const [cx, cz] = b.c, along = b.ax === 'z', first = hashAt(cx, cz, 11) < 0.5 ? 0 : 1, lat0 = hashAt(cx, cz, 12) < 0.5 ? -1 : 1;
    const cands = [];
    for (const k of [0, 1]) for (const l of [0, 1]) {
      const e = (first + k) % 2, sg = e ? 1 : -1, lat = lat0 * (l ? -1 : 1), d = (e ? b.f[1] : b.f[0]) + 3.6 + 0.7, o = b.w / 2 + 0.9;
      cands.push({ x: along ? cx + lat * o : cx + sg * d, z: along ? cz + sg * d : cz + lat * o, rot: along ? (sg > 0 ? 0 : Math.PI) : (sg > 0 ? Math.PI / 2 : -Math.PI / 2) });
    }
    const c = cands.find(({ x, z }) => !inLot(x, z, 0.6) && wet(x, z) > 1.5 && [[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]].every(([a, d]) => wet(x + a, z + d) > 0.8));
    if (c) out.push({ t: 'ven_capitello', at: [+c.x.toFixed(2), +c.z.toFixed(2)], y: GROUND, rot: c.rot });
  }
  return out;
}

/** All the night's plans; `dress` is dressPlans()'s list (the lanterns are read from it). */
export function nightPlans(dress) {
  const out = [];
  // the lanterns, tile by tile
  for (const p of dress) {
    if (!/^venice-(fronts|merceria)/.test(p.id)) continue;
    const items = p.elements.filter((e) => e.t === 'lantern' && e.kind === 'iron').map((e) => ({ k: 'lantern', at: e.at, y: e.y ?? GROUND, rot: e.rot, h: e.h }));
    if (items.length) out.push(plan(`venice-night-${p.id.slice(7)}`, [{ t: 'ven_halo', items }], p.center, 110));
  }
  // the capitelli, by the hundred metres
  const tiles = new Map();
  for (const c of capitelli()) { const key = `${Math.floor(c.at[0] / 100)},${Math.floor(c.at[1] / 100)}`; (tiles.get(key) ?? tiles.set(key, []).get(key)).push(c); }
  for (const [key, list] of tiles) { const [i, j] = key.split(',').map(Number); out.push(plan(`venice-night-capitelli-${key}`, list, [i * 100 + 50, j * 100 + 50], 110)); }
  // the stern lanterns of the gondolas at the Molo
  const gl = molo.elements.filter((e) => e.t === 'gondola' && hashAt(e.at[0], e.at[1], 21) < 0.6).map((e) => {
    const yaw = e.yaw ?? 0, L = (e.len ?? 10.8) / 2 - 0.9;
    return { k: 'stern', at: [e.at[0] - Math.cos(yaw) * L, e.at[1] - Math.sin(yaw) * L], y: (e.y ?? SEA) + 0.2, rot: Math.atan2(-Math.cos(yaw), -Math.sin(yaw)) };
  });
  out.push(plan('venice-night-gondolas', [{ t: 'ven_halo', items: gl }], [88, 128], 150));
  return out;
}
