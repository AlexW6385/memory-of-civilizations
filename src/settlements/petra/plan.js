// Petra's monuments about AD 50 (docs/settlements/petra.md §2–§4): the Khazneh facing the Siq's
// mouth, the Street of Façades, the theatre, the Royal Tombs in the east cliff, the colonnaded
// street, the Great Temple and Qasr al-Bint.

import { PLAZA, STREET, RIM, VALLEY, SIQ_LINE, SIQ_WALL, height } from './layout.js';

const E = [];
// the Siq's walls, sampled every 2 m along its line from the east down to the square (docs/settlements/petra.md §10)
{
  const L = SIQ_LINE, pts = [];
  for (let i = 0; i + 1 < L.length; i++) {
    const [ax, az] = L[i], [bx, bz] = L[i + 1], len = Math.hypot(bx - ax, bz - az), k = Math.max(1, Math.round(len / 2));
    for (let j = 0; j < k; j++) pts.push([ax + (bx - ax) * j / k, az + (bz - az) * j / k]);
  }
  pts.push(L[L.length - 1]);
  const sides = [-1, 1].map((sg) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const [x, z] = pts[i]; if (x < SIQ_WALL.x1 || x > 318) continue;
      const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)], tl = Math.hypot(q[0] - p[0], q[1] - p[1]), tx = (q[0] - p[0]) / tl, tz = (q[1] - p[1]) / tl;
      const nx = -tz * sg, nz = tx * sg, floor = height(x, z), top = height(x + nx * (SIQ_WALL.face + 9.5), z + nz * (SIQ_WALL.face + 9.5)) - 0.3;
      if (top - floor < 2.5) continue;
      out.push([+x.toFixed(3), +z.toFixed(3), +nx.toFixed(5), +nz.toFixed(5), +floor.toFixed(3), +top.toFixed(3)]);
    }
    const south = out[Math.floor(out.length / 2)][3] > 0;
    return { s: sg, pts: out, channel: south ? 'cut' : 'pipe' };
  });
  const si = sides.findIndex((d) => d.channel === 'cut'), ni = 1 - si;
  E.push({ t: 'siq_walls', face: SIQ_WALL.face, sides, niches: [[ni, 14], [si, 31], [ni, 52], [si, 64]], camel: [si, 44] });
}
// the Khazneh in the west wall of the little square, facing the Siq's mouth
E.push({ t: 'khazneh', at: [PLAZA.c[0] - PLAZA.r + 2, PLAZA.c[1]], dir: 'e', w: 24.9, h: 38.77, back: 26, top: RIM - 2 });
// the Street of Façades along the Outer Siq's south-west side
for (const [x, z, w, h, d] of [[105, -112, 9, 11, 'e'], [98, -96, 10, 13, 'e'], [90, -80, 8, 10, 'e'], [78, -64, 11, 14, 'e']]) E.push({ t: 'rock_tomb', at: [x, z], dir: d, w, h, kind: 'crowstep', back: 12, top: RIM - 4 });
// the theatre cut into the Outer Siq's east side, facing west
E.push({ t: 'theatre', c: [84, -44], dir: 'w', r0: 10, r1: 34, rows: 30, span: Math.PI * 1.05 });
// the Royal Tombs in the eastern cliff of the valley, facing west
const edge = (z) => VALLEY.c[0] + VALLEY.r[0] * Math.sqrt(Math.max(0, 1 - ((z - VALLEY.c[1]) / VALLEY.r[1]) ** 2));
for (const [z, w, h, k] of [[-40, 18, 26, 'pediment'], [-16, 22, 32, 'pediment'], [8, 14, 22, 'crowstep'], [48, 40, 40, 'palace']]) E.push({ t: 'rock_tomb', at: [Math.min(edge(z - w / 2), edge(z + w / 2)) + 1, z], dir: 'w', w, h, kind: k, back: 20, top: RIM - 4 });
// the colonnaded street, the Great Temple on the south, Qasr al-Bint at the west end
E.push({ t: 'colonnade_street', a: STREET.a, b: STREET.b, w: STREET.w });
E.push({ t: 'podium_temple', rect: [-72, 40, -44, 74], h: 18, podium: 2.5 });
E.push({ t: 'podium_temple', rect: [-164, -6, -132, 26], h: 23, podium: 3 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('the square', [PLAZA.c[0] - PLAZA.r, PLAZA.c[1] - PLAZA.r, PLAZA.c[0] + PLAZA.r, PLAZA.c[1] + PLAZA.r], 0, 'open'), room('the city', [-200, -80, 60, 100], 0, 'open')];
const walks = [[[180, -152], [150, -161], [132, -160], [126, -125], [100, -80], [40, -10], [0, 12]]];
walks[0].y0 = 0;

export const khazneh = {
  id: 'petra-khazneh',
  name: { en: 'The Khazneh and the city of Petra', zh: '卡兹尼神殿与佩特拉城' },
  era: { en: 'Nabataea, about AD 50', zh: '纳巴泰，约公元50年' },
  style: 'nabataean',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [140, -160], facing: 'w' },
  bounds: [-170, -200, 140, 80],
  view: [PLAZA.c[0] - PLAZA.r - 6, PLAZA.c[1] - 16, PLAZA.c[0] - 2, PLAZA.c[1] + 16],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default khazneh;
