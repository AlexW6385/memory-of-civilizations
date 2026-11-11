// The town of Timurid Samarkand (docs/settlements/timurid-samarkand.md §2, §6, §7): the monuments besides the Registan (Bibi-Khanym,
// Gur-e Amir, the observatory, the chorsu and the bazaar's streets), the courtyard houses (the one by the bazaar open and furnished), the aryk
// in the lanes. Each a plan of its own so that they stream.

import { RADIUS, ARYK_X, ARYK_W, BIBI, GUR, OBS, CHORSU, BAZAAR, houses, OPEN_HOUSE, onAryk } from './layout.js';
import { lifePlan } from './life.js';

const base = (id, elements, bounds, rooms = []) => ({ id, style: 'timurid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds, entrance: { at: [38, 0], facing: 'w' } });

export async function town() {
  const all = houses(), open = OPEN_HOUSE(), plans = [];
  const shut = all.filter((h) => h !== open);
  for (let i = 0; i < shut.length; i += 90) plans.push(base(`samarkand-houses-${i / 90}`, shut.slice(i, i + 90).map((h) => ({ t: 'khaneh', ...h })), [-RADIUS, -RADIUS, RADIUS, RADIUS]));
  const [x0, z0, x1, z1] = open.rect;
  plans.push({ ...base('samarkand-open-house', [{ t: 'khaneh_open', rect: open.rect, entry: 'w', seed: open.seed }], [x0 - 2, z0 - 2, x1 + 2, z1 + 2]),
    rooms: [{ id: 'talar', rect: [x0 + 3.6, z0 + 0.6, x1 - 3.8, z0 + 4.35], y: 0.45, kind: 'hall' }, { id: 'house court', rect: [x0 + 3.6, z0 + 4.8, x1 - 3.8, z1 - 3.4], y: 0, kind: 'open' }] });
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
