// Kilwa about 1330 (docs/settlements/kilwa.md §2–§4): the Great Mosque, Husuni Kubwa and its pool, dhows on the beach.
import { MOSQUE, PALACE, POOL, PY, CORE, SOUTH, COURTS, STAIR, BEACH_MOSQUE, GATE_STAIRS, TERRACES, height, inLot } from './layout.js';

const E = [];
E.push({ t: 'swahili_mosque', rect: MOSQUE, bay: 4.6, big: [6, 5], y: height(-10, 15) });
// Husuni Kubwa on its headland (docs/settlements/kilwa.md §11): the core of four courts, the South
// Court, the stair to the beach and the mosque at its foot, the terraces' retaining walls
E.push({ t: 'husuni_core', rect: CORE, courts: COURTS, pool: POOL, y: PY });
E.push({ t: 'husuni_south', rect: SOUTH, y: PY });
E.push({ t: 'husuni_stair', rect: [STAIR.bHead[0], STAIR.b.rect[1], STAIR.head[2], STAIR.head[3]], head: STAIR.head, fa: STAIR.a, mid: STAIR.mid, bHead: STAIR.bHead, fb: STAIR.b, y: PY });
E.push({ t: 'beach_mosque', rect: BEACH_MOSQUE, y: TERRACES.find((T) => T.id === 'beach').y });
{
  // the retaining walls of coral rag along the terraces' built edges, each from the ground below it
  const T = Object.fromEntries(TERRACES.map((t) => [t.id, t]));
  // the lowest ground just outside the wall's low face (face −1: toward −z or −x)
  const lowAlong = (r, face) => { let m = Infinity; for (let k = 0; k <= 16; k++) { const ax = r[2] - r[0] > r[3] - r[1], u = k / 16; const x = ax ? r[0] + (r[2] - r[0]) * u : (face < 0 ? r[0] - 0.8 : r[2] + 0.8), z = ax ? (face < 0 ? r[1] - 0.8 : r[3] + 0.8) : r[1] + (r[3] - r[1]) * u; m = Math.min(m, height(x, z)); } return m; };
  const tw = (rect, y1, parapet, face) => { const low = lowAlong(rect, face); E.push({ t: 'terrace_wall', rect, y0: low - 0.5, y1, parapet, face, low }); };
  // the top terrace's north wall, behind the first flight, broken by the stair's head
  tw([138, -156.6, STAIR.head[0], -156], PY, 0.12, -1); tw([STAIR.head[2], -156.6, 198, -156], PY, 0.9, -1);
  // its south wall over the town and the gate terrace, a parapet along it; the gap for the gate stair
  for (const [a, b] of [[138, 154], [154, 165], [171, 182], [182, 198]]) tw([a, -48, b, -47.4], PY, 0.9, 1);
  // the north terrace's walls over the beach, the west one broken where the second flight's head passes
  tw([137.5, -166, 200, -165.4], T.north.y, 0.9, -1);
  tw([136.9, -166, 137.5, STAIR.bHead[1]], T.north.y, 0.12, -1); tw([136.9, STAIR.bHead[3], 137.5, -156], T.north.y, 0.12, -1);
  // the gate terrace's walls
  tw([154, -37, 165, -36.4], T.gate.y, 0.9, 1); tw([171, -37, 182, -36.4], T.gate.y, 0.9, 1);
  tw([153.4, -48, 154, -36.4], T.gate.y, 0.9, -1); tw([182, -48, 182.6, -36.4], T.gate.y, 0.9, 1);
  // the gate stairs: from the town up to the terrace, from the terrace to the South Court's gate
  const g0 = GATE_STAIRS[0], g1 = GATE_STAIRS[1], foot = height((g0.rect[0] + g0.rect[2]) / 2, g0.rect[3]);
  E.push({ t: 'gate_stair', rect: g0.rect, y0: foot, y1: g0.y1, dir: 'n', base: foot - 0.5 });
  E.push({ t: 'gate_stair', rect: g1.rect, y0: g1.y0, y1: g1.y1, dir: 'n', base: g1.y0 - 0.5, landing: [g1.rect[0], -48, g1.rect[2], g1.rect[1]] });
}
// mtepe, the sewn boats of the coast, drawn up along the top of the beach above the tide line
// (the shore drops steeply below), clear of the houses
const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
for (let k = 0, x = -170; k < 7 && x < 60; x += 9) {
  for (let d = 9.5; d < 16; d += 0.5) {
    const z = shoreAt(x) + d, L = 11 + (k % 3) * 2, a = [x - L / 2 - 1, z], b = [x + L / 2 + 1, z];
    const hs = [a, [x, z], b, [x, z - 2.2], [x, z + 2.2], [a[0], z - 2], [b[0], z + 2]].map(([p, q]) => height(p, q));
    if (Math.max(...hs) - Math.min(...hs) > 0.25 || [a, [x, z], b].some(([p, q]) => inLot(p, q, 3.5))) continue;
    E.push({ t: 'mtepe', at: [x, z], dir: [k % 2 ? 1 : -1, 0.08 * (k % 3 - 1)], len: L, y: Math.min(...hs) - 0.05, seed: 40 + k });
    k++; x += L; break;
  }
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const kilwa = {
  id: 'kilwa-mosque',
  name: { en: 'The Great Mosque of Kilwa', zh: '基尔瓦大清真寺' },
  era: { en: 'The Swahili coast, about 1330', zh: '斯瓦希里海岸，约1330年' },
  style: 'swahili',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-15, -30], facing: 's' },
  bounds: [-160, -178, PALACE[2] + 10, 45],
  view: [MOSQUE[0] - 2, MOSQUE[1] - 2, MOSQUE[2] + 2, MOSQUE[3] + 2],
  bakeTop: 12,
  elements: E,
  rooms: [room('prayer hall', MOSQUE, E[0].y, 'hall'), room('pavilion', [162.2, -124, 169.4, -106.6], PY + 3, 'hall'),
    // the second suite's ante-room (the arcaded walkway) and main room; the South Court's upper terrace and its vaulted rooms
    room('ante-room', [175.4, -145, 176.4, -129.5], PY + 0.03, 'hall'), room('second suite', [172, -145.5, 174.4, -135], PY + 0.03, 'hall'),
    room('south court terrace', [150, -94, 186, -91], PY + 3.08, 'open'), room('upper rooms', [152.5, -97.2, 180, -94.8], PY + 3.08, 'hall')],
  walks: Object.assign([[[-15, -30], [-15, -15]]], {}),
};
kilwa.walks[0].y0 = height(-15, -30);
export default kilwa;
