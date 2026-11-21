// Manueline Lisbon about 1520: the two landmarks (docs/settlements/manueline-lisbon.md §3–§5) — the Jerónimos church and cloister on
// their plaza, and the Belém Tower on its bastion in the river.
import { frame } from '../../styles/greek/agora.js';
import { storeysOf, HEIGHTS } from '../../styles/manueline/houses.js';
import { sv1Of, SV0 } from '../../styles/manueline/upstairs.js';
import { openRoutes } from './openwalk.js';
import { MAIN_WALK, QUAY_WALK, TERREIRO_WALK } from './route.js';
import { lots, height, GROUND, CHURCH, CLOISTER, MONASTERY, PLAZA, PORTAL_X, TOWER, CAUSEWAY } from './layout.js';
import { churchFrame } from '../../styles/manueline/church.js';
import { cloisterFrame } from '../../styles/manueline/cloister.js';
import { towerFrame, FLOORS } from '../../styles/manueline/tower.js';

const g = GROUND + 0.05;
/** The cloister court's orange trees: a grid in each quarter round the basin and the crossing paths. */
function orangeGrove() {
  const [a, b, c, d] = CLOISTER, cx = (a + c) / 2, cz = (b + d) / 2, out = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const [u, v] of [[8, 8], [15, 8], [8, 15], [15, 15], [12, 11.5]]) out.push({ t: 'orange_tree', at: [cx + sx * u, cz + sz * v], y: g, seed: 100 + out.length, h: 3.4 + (out.length % 4) * 0.35 });
  return out;
}
const CF = churchFrame(CHURCH), KF = cloisterFrame(CLOISTER);
const [X0, Z0, X1, Z1] = CLOISTER;
const rings = [[X0, Z0, X1, Z0 + 7], [X0, Z1 - 7, X1, Z1], [X0, Z0 + 7, X0 + 7, Z1 - 7], [X1 - 7, Z0 + 7, X1, Z1 - 7]];
const TF = towerFrame(TOWER.c[0], TOWER.c[1]), TC = TOWER.c;
const towerWalk = (() => { const w = [[TC[0], TC[1] + 6.4], [TC[0], TC[1] + 4.0], [TF.wx0 + 0.6, TC[1] + 4.0]]; for (let s = 0; s < 4; s++) { w.push([TF.wx0 + 0.6, TF.iz1 - 1.5], [TF.wx0 + 0.6, TF.iz0 + 1.5], [TF.wx2 + 0.6, TF.iz0 + 1.5], [TF.wx2 + 0.6, TF.iz1 - 1.3]); if (s < 3) w.push([TF.wx3 + 1.0, TF.iz1 - 1.0], [TF.wx3 + 1.0, TF.iz1 - 1.0 + 0.0], [TF.wx0 + 0.6, TF.iz1 - 0.6]); } return w; })();
/** The way through each ground-floor shop to the partition's door, found on the colliders (so as to pass the counters and stock): [u, v] from the door. */
const SHOP_WAY = {
'-164,44': [[6.25,1],[7,1],[7.75,1],[8.5,1],[9,1.25],[9,2],[9,2.75],[9,3.5],[9,4.25],[9,5],[8.75,5.5],[8,5.5],[7.25,5.5],[6.5,5.5],[5.75,5.5],[5.5,6],[5.5,6.75],[5.5,7.5],[5.5,8.25],[5.5,8.5]],
'-153,44': [[2.25,1],[2.25,1.75],[1.75,2],[1,2],[1,2.75],[1,3.5],[1,4.25],[1.25,4.75],[2,4.75],[2,5.5],[2.25,6],[2.5,6.5],[3,6.75],[3,7.5],[3,8.25],[3,8.5]],
'-146,44': [[3.75,1],[3.75,1.75],[3.75,2.5],[3.75,3.25],[3.75,4],[3.5,4.5],[3,4.75],[2.5,5],[2.25,5.5],[2.5,6],[3,6.25],[3,7],[3,7.75],[3,8.5]],
'-140,44': [[5.25,1.5],[5.75,1.75],[6.5,1.75],[6.75,2.25],[6.75,3],[6.5,3.5],[6.25,4],[6,4.5],[5.5,4.75],[5,5],[5,5.75],[5,6.5],[5,7.25],[5,8],[5,8.5]],
'-154,68': [[6.25,1],[6.75,1.25],[7.25,1.5],[7.25,2.25],[7.25,3],[7,3.5],[6.5,3.75],[6.5,4.5],[6,4.75],[5.5,5],[5.5,5.75],[5.5,6.5],[5.5,7.25],[5.5,8],[5.5,8.5]],
'-142,68': [[5.75,1],[6.25,1.25],[6.75,1.5],[7,2],[7,2.75],[7,3.5],[6.75,4],[6.25,4.25],[5.75,4.5],[5.5,5],[5,5.25],[5,6],[5,6.75],[5,7.5],[5,8.25],[5,8.5]],
'-132,68': [[5.75,1],[5.75,1.75],[5.75,2.5],[5.75,3.25],[5.75,4],[5.5,4.5],[5,4.75],[4.25,4.75],[4.25,5.5],[4.5,6],[5,6.25],[5,7],[5,7.75],[5,8.5]],
'-154,92': [[6,1.25],[6.25,1.75],[7,1.75],[7.75,1.75],[7.75,2.5],[7.75,3.25],[7.5,3.75],[6.75,3.75],[6.5,4.25],[6,4.5],[5.75,5],[5.5,5.5],[5.5,6.25],[5.5,7],[5.5,7.75],[5.5,8.5]],
'-142,92': [[4.25,1],[4.25,1.75],[4.25,2.5],[4.25,3.25],[4.25,4],[4,4.5],[3.5,4.75],[3,5],[2.75,5.5],[3,6],[3.5,6.25],[3.5,7],[3.5,7.75],[3.5,8.5]],
'-135,92': [[6.75,1],[7.25,1.25],[7.75,1.5],[7.75,2.25],[7.75,3],[7.5,3.5],[7.25,4],[7,4.5],[6.5,4.75],[6,5],[6,5.75],[6,6.5],[6,7.25],[6,8],[6,8.5]],
};
/** Routes from the street to the rooms upstairs of the houses whose upper floors are open (docs §12): door, hall, up each flight, across each floor's partition door, the roof terrace; and out onto the balcony. */
export function houseWalks() {
  const W = [], T = 0.5;
  for (const l of lots()) {
    if (!l.up) continue;
    const n = storeysOf({ seed: l.seed, kind: l.kind, open: true, storeys: l.storeys }), { h0, hs } = HEIGHTS(l.kind), F = frame(l.rect, l.front), { L, D } = F;
    const sv1 = sv1Of(D), ud = T + 2.5, terrace = ['merchant', 'craft', 'inn'].includes(l.up), P = (u, v) => F.P(u, v);
    const r = [P(L / 2 - 0.9, -2.5), P(L / 2 - 0.9, -0.8), P(L / 2, 1.0), ...SHOP_WAY[`${Math.round(l.rect[0])},${Math.round(l.rect[1])}`].map(([u, v]) => P(u, v)), P(T + 0.8, sv1 + 0.8)];
    const flights = terrace ? n : n - 1;
    for (let k = 1; k <= flights; k++) {
      r.push(P(T + 0.7, sv1 - 0.4), P(T + 0.7, SV0 - 0.7));
      if (k < flights) r.push(P(ud, 6.6), P(ud, 8.8), P(T + 2.5, sv1 + 0.9), P(T + 0.8, sv1 + 0.9));
    }
    r.push(terrace ? P(T + 3.4, 5.5) : P(T + 1.0, 6.2));
    W.push(Object.assign(r, { y0: GROUND }));
    // from the first floor out onto the balcony and back
    const wn = Math.max(1, Math.floor((L - 1.2) / 2.6)), kb = 0, uc = 0.6 + (kb + 0.5) * (L - 1.2) / wn;
    W.push(Object.assign([P(T + 3.4, 5.0), P(uc, 3.0), P(uc, 0.2), P(uc, -0.6), P(uc, 2.0)], { y0: GROUND + h0 }));
    void hs;
  }
  return W;
}
export const jeronimos = {
  id: 'manueline-jeronimos',
  name: { en: 'The Jerónimos church and cloister', zh: '热罗尼莫斯修道院教堂与回廊' },
  era: { en: 'Lisbon, about 1520', zh: '里斯本，约1520年' },
  style: 'manueline',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [PORTAL_X, PLAZA[3] - 6], facing: 'n' },
  bounds: [MONASTERY[0] - 8, MONASTERY[1] - 8, MONASTERY[2] + 8, PLAZA[3] + 2],
  view: [CHURCH[0] - 20, CHURCH[3] + 20, CHURCH[2] + 20, CHURCH[3] + 90],
  bakeTop: 30,
  elements: [
    { t: 'floor', rect: PLAZA, y: g, th: 0.3, mat: 'flagstone' },
    { t: 'jeron_church', rect: CHURCH, y: g, portalX: PORTAL_X },
    { t: 'cloister', rect: CLOISTER, y: g },
    ...orangeGrove(),
    { t: 'range', rect: [MONASTERY[0], MONASTERY[1], MONASTERY[2] - 0, CLOISTER[1] - 0.0], y: g, h: 12 },
    { t: 'range', rect: [MONASTERY[0], CLOISTER[1], CLOISTER[0], CHURCH[1]], y: g, h: 11 },
    { t: 'range', rect: [CLOISTER[2], CLOISTER[1], MONASTERY[2], CHURCH[1] + 0.0], y: g, h: 11 },
  ],
  rooms: [
    { id: 'plaza', rect: [PORTAL_X - 20, 44, PORTAL_X + 20, 110], y: g, kind: 'open' },
    { id: 'nave', rect: [CF.bays[1] + 1, CF.zi0 + 1, CF.chancel - 1, CF.zi1 - 1], y: g, kind: 'hall' },
    { id: 'main chapel', rect: [CF.chancel + 1, CF.zi0 + 1, CF.xi1 - 6, CF.zi1 - 1], y: g + 1.2, kind: 'hall' },
    { id: 'cloister court', rect: [KF.court[0] + 2, KF.court[1] + 2, KF.court[2] - 2, KF.court[3] - 2], y: g, kind: 'open' },
    ...['north', 'south', 'west', 'east'].map((n, i) => ({ id: `cloister gallery ${n}`, rect: [rings[i][0] + 1, rings[i][1] + 1, rings[i][2] - 1, rings[i][3] - 1], y: g, kind: 'inner' })),
    { id: 'upper gallery north', rect: [rings[0][0] + 1, rings[0][1] + 1, rings[0][2] - 1, rings[0][3] - 1], y: g + 7, kind: 'inner' },
    { id: 'upper gallery west', rect: [rings[2][0] + 1, rings[2][1] + 1, rings[2][2] - 1, rings[2][3] - 1], y: g + 7, kind: 'inner' },
  ],
  walks: [
    Object.assign([[PORTAL_X, PLAZA[3] - 6], [PORTAL_X, 46], [PORTAL_X + 1.8, 39], [PORTAL_X + 1.8, CF.zc + 3], [CF.bays[3] - 5, CF.zc + 3], [CF.chancel - 4, CF.zc], [CF.bays[3] + 5, CF.zc - 7], [(CF.bays[3] + CF.bays[4]) / 2, CF.zi0 + 2], [(CF.bays[3] + CF.bays[4]) / 2, CHURCH[1] - 3], [(CF.bays[3] + CF.bays[4]) / 2, Z1 - 3.5],
      [X1 - 3.5, Z1 - 3.5], [X1 - 3.5, Z0 + 23.5], [X1 - 5.15, Z0 + 21], [X1 - 5.15, Z0 + 10], [X1 - 5.15, Z0 + 7.5], [X1 - 3.5, Z0 + 3.5], [X0 + 3.5, Z0 + 3.5], [X0 + 3.5, Z1 - 3.5]], { y0: g }),
  ],
};
jeronimos.walks.push(...houseWalks());
jeronimos.walks.push(...openRoutes());
// the visitor's way out of the plaza: east by the lane, the quay street, the alley to the Rua Nova and along it; the quay to the palace; the Terreiro and the yard (route.js)
jeronimos.walks.push(Object.assign([...MAIN_WALK], { y0: g }), Object.assign([...QUAY_WALK], { y0: g }), Object.assign([...TERREIRO_WALK], { y0: height(120, -4.5) }));
jeronimos.walks.push(Object.assign([[PORTAL_X, PLAZA[3] - 6], [PORTAL_X, 46], [PORTAL_X + 1.8, 39], [PORTAL_X + 1.8, CF.zc + 3], [CF.bays[3] + 2, CF.zc - 1], [CF.bays[3] + 2, CF.zi0 + 2.1], [CF.bays[1] - 1.5, CF.zi0 + 2.1], [CF.bays[1] - 3, CF.zc]], { y0: g }));
export const belem = {
  id: 'manueline-belem',
  name: { en: 'The Belém Tower', zh: '贝伦塔' },
  era: { en: 'Lisbon, about 1520', zh: '里斯本，约1520年' },
  style: 'manueline',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [CAUSEWAY[0] + 1.6, CAUSEWAY[1] + 2], facing: 's' },
  bounds: [TOWER.c[0] - 30, CAUSEWAY[1] - 4, TOWER.c[0] + 30, TOWER.c[1] + 22],
  view: [TOWER.c[0] - 60, TOWER.c[1] - 80, TOWER.c[0] + 60, TOWER.c[1] - 20],
  bakeTop: 36,
  elements: [{ t: 'belem_tower', c: TOWER.c, y: TOWER.deck, causeway: CAUSEWAY }],
  rooms: [{ id: 'bastion deck', rect: [TOWER.c[0] - 11, TOWER.c[1] - 5, TOWER.c[0] + 11, TOWER.c[1] + 9], y: TOWER.deck, kind: 'inner' }, ...['cistern', 'governor hall', 'king chamber', 'audience room', 'chapel'].map((id, i) => ({ id, rect: [TF.ix0 + 2.6, TF.iz0 + 0.3, TF.ix1 - 0.3, TF.iz1 - 1.5], y: TOWER.deck + FLOORS[i], kind: i === 4 ? 'hall' : 'inner' }))],
  walks: [Object.assign([[CAUSEWAY[0] + 1.6, CAUSEWAY[1] + 2], [CAUSEWAY[0] + 1.6, CAUSEWAY[3] - 1], [TOWER.c[0] - 9, TOWER.c[1] + 2], [TOWER.c[0], TOWER.c[1] + 9], [TOWER.c[0] + 9, TOWER.c[1] + 2]], { y0: GROUND }), Object.assign([[TC[0], TC[1] + 9], ...towerWalk], { y0: TOWER.deck })],
};
