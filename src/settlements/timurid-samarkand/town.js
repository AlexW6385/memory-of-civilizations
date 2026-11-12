// The town of Timurid Samarkand (docs/settlements/timurid-samarkand.md §2, §6, §7): the monuments besides the Registan (Bibi-Khanym,
// Gur-e Amir, the observatory, the chorsu and the bazaar's streets), the courtyard houses (the one by the bazaar open and furnished), the aryk
// in the lanes. Each a plan of its own so that they stream.

import { RADIUS, ARYK_X, ARYK_W, BIBI, GUR, OBS, CHORSU, BAZAAR, houses, houseGeom, onAryk } from './layout.js';
import { lifePlan } from './life.js';

const base = (id, elements, bounds, rooms = []) => ({ id, style: 'timurid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds, entrance: { at: [38, 0], facing: 'w' } });

export async function town() {
  const all = houses().slice().sort((p, q) => Math.hypot(p.rect[0], p.rect[1]) - Math.hypot(q.rect[0], q.rect[1])), plans = [];
  for (let i = 0; i < all.length; i += 24) {
    const part = all.slice(i, i + 24), rooms = [];
    for (const h of part) if (h.full && !h.garden) {
      const G = houseGeom(h), [ax, az] = G.toWorld(-3.6, -G.D / 2 + 2.3), [bx2, bz] = G.toWorld(3.6, -G.D / 2 + 4.8);
      rooms.push({ id: `talar ${h.seed}`, rect: [Math.min(ax, bx2), Math.min(az, bz), Math.max(ax, bx2), Math.max(az, bz)], y: 0.45, kind: 'hall' });
    }
    plans.push({ ...base(`samarkand-houses-${i / 24}`, part.map((h) => ({ t: h.garden ? 'tim_garden' : 'tim_house', h })), [-RADIUS, -RADIUS, RADIUS, RADIUS]), rooms });
  }
  plans.push(base('samarkand-bibi-khanym', [{ t: 'bibi_khanym', c: BIBI.c }], [BIBI.c[0] - 105, BIBI.c[1] - 105, BIBI.c[0] + 105, BIBI.c[1] + 105], [{ id: 'bibi court', rect: [BIBI.c[0] - 30, BIBI.c[1] - 30, BIBI.c[0] + 30, BIBI.c[1] + 30], y: 0, kind: 'open' }]));
  plans.push(base('samarkand-gur-e-amir', [{ t: 'gur_e_amir', rect: GUR.rect }], [GUR.rect[0] - 8, GUR.rect[1] - 8, GUR.rect[2] + 8, GUR.rect[3] + 8]));
  plans.push({ ...base('samarkand-observatory', [{ t: 'observatory', c: OBS.c, y: OBS.y, r: OBS.r }], [OBS.c[0] - 60, OBS.c[1] - 40, OBS.c[0] + 60, OBS.c[1] + 80]) });
  // the chorsu and the bazaar's streets
  const E = [{ t: 'chorsu', c: CHORSU.c, r: CHORSU.r }];
  for (const { a, b } of BAZAAR) E.push({ t: 'bazaar', a, b, w: 5, h: 7, bay: 5, shops: 5 });
  plans.push(base('samarkand-bazaar', E, [CHORSU.c[0] - 110, CHORSU.c[1] - 70, CHORSU.c[0] + 110, CHORSU.c[1] + 75]));
  plans.push(aryk());
  return [...plans, lifePlan()];
}

/** The aryk: the irrigation channel down each lane named in the layout: a curbed channel of stone with the water in it, in runs between the monuments and houses. */
function aryk() {
  const E = [];
  for (const ax of ARYK_X) {
    let z = -RADIUS + 30, run = null;
    const flush = (end) => {
      if (!run || end - run < 6) { run = null; return; }
      E.push({ t: 'water_rect', rect: [ax - ARYK_W / 2, run, ax + ARYK_W / 2, end], y: 0.12 });
      for (const r of [[ax - ARYK_W / 2 - 0.22, run, ax - ARYK_W / 2, end], [ax + ARYK_W / 2, run, ax + ARYK_W / 2 + 0.22, end]]) E.push({ t: 'block', walk: true, rect: r, y0: 0, y1: 0.28, mat: 'limestone' });
      run = null;
    };
    for (; z < RADIUS - 30; z += 2) {
      const on = onAryk(ax, z, 0.3) && onAryk(ax, z + 2, 0.3);
      if (on && run === null) run = z; else if (!on && run !== null) flush(z);
    }
    flush(z);
  }
  return base('samarkand-aryk', E, [-RADIUS, -RADIUS, RADIUS, RADIUS]);
}
