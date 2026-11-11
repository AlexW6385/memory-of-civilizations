// Petra's monuments about AD 50 (docs/settlements/petra.md §2–§4): the Khazneh facing the Siq's
// mouth, the Street of Façades, the theatre, the Royal Tombs in the east cliff, the colonnaded
// street, the Great Temple and Qasr al-Bint.

import { PLAZA, OUTER, SIQ, STREET, GREAT_TEMPLE, TEMENOS, QASR, GARDEN, TRICLINIUM, floorY, RIM, VALLEY, SIQ_LINE, SIQ_WALL, KHAZNEH_ROCK, THEATRE, height, pathDist, shopUnits } from './layout.js';

const E = [];
let SIQ_EL = null;
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
      const nx = -tz * sg, nz = tx * sg, floor = height(x, z), top = Math.max(height(x + nx * (SIQ_WALL.face + 9.5), z + nz * (SIQ_WALL.face + 9.5)), x < 260 ? RIM : 0) - 0.3;
      if (top - floor < 2.5) continue;
      out.push([+x.toFixed(3), +z.toFixed(3), +nx.toFixed(5), +nz.toFixed(5), +floor.toFixed(3), +top.toFixed(3), +(floor - 1).toFixed(3)]);
    }
    const south = out[Math.floor(out.length / 2)][3] > 0;
    return { s: sg, pts: out, channel: south ? 'cut' : 'pipe' };
  });
  const si = sides.findIndex((d) => d.channel === 'cut'), ni = 1 - si;
  // no fallen blocks at the mouth, the first view of the Khazneh
  SIQ_EL = { t: 'siq_walls', face: SIQ_WALL.face, sides, niches: [[ni, 14], [si, 31], [ni, 52], [si, 64]], camel: [si, 44], clear: [[100, -200, 168, -120]] };
  E.push(SIQ_EL);
}
// the Khazneh in the west wall of the little square, facing the Siq's mouth
E.push({ t: 'khazneh', at: [PLAZA.c[0] - PLAZA.r + 2, PLAZA.c[1]], dir: 'e', w: 24.9, h: 38.77, back: 26, top: RIM - 2, flank: 1.5, cliff: 39.6 });
// the theatre cut into the Outer Siq's east side, facing west
E.push({ t: 'theatre', c: THEATRE.c, dir: 'w', r0: 10, r1: THEATRE.r1, rows: 30, span: Math.PI * 1.05 });
// the Royal Tombs in the eastern cliff of the valley, facing west across it (docs/settlements/petra.md §10): from the north the
// Palace Tomb (south of the theatre's cavea), the Corinthian Tomb, the Silk Tomb and the Urn Tomb, side by side, each set
// square to the cliff and standing on the valley's floor where it meets it
const ROYAL = [];
{
  const ell = (z) => VALLEY.c[0] + VALLEY.r[0] * Math.sqrt(Math.max(0, 1 - ((z - VALLEY.c[1]) / VALLEY.r[1]) ** 2));
  for (const [z, w, h, kind] of [[30, 49, 46, 'palace'], [72, 27.5, 28, 'corinthian'], [96, 13, 20, 'hegr'], [115, 16.5, 26, 'urn']]) {
    const x = ell(z), gx = (x - VALLEY.c[0]) / VALLEY.r[0] ** 2, gz = (z - VALLEY.c[1]) / VALLEY.r[1] ** 2, gl = Math.hypot(gx, gz), nx = gx / gl, nz = gz / gl;
    const at = [+(x + nx).toFixed(3), +(z + nz).toFixed(3)], y = +height(x - nx * 4, z - nz * 4).toFixed(3);
    const boxTop = kind === 'hegr' ? +(h * 0.66).toFixed(2) : h;
    E.push({ t: 'rock_tomb', at, dir: [-nx, -nz].map((v) => +v.toFixed(5)), w, h, kind, back: 20, top: +(y + h + 0.6).toFixed(3), flank: 1.5, y, ...(kind === 'hegr' ? { boxTop, top: undefined } : {}) });
    ROYAL.push({ x: at[0], z: at[1], nx, nz, w, base: y + boxTop + 0.15, set: kind === 'hegr' ? 1.6 : 0 });
  }
}
// the walls of the square and of the Outer Siq, built as the Siq's are (the same beds run through them), sampled every
// 2 m along the edge of the open ground, broken where the Khazneh and the theatre are cut in the rock; the tombs of the
// Street of Façades stand at the foot of the Outer Siq's west wall, the wall set back and rising from their tops
{
  const face = 6.2;
  const taken = (x, z, self) => (self !== 'plaza' && Math.hypot(x - PLAZA.c[0], z - PLAZA.c[1]) < PLAZA.r - 0.5)
    || (self !== 'outer' && pathDist(x, z, OUTER.path) < OUTER.w / 2 - 0.5)
    || (x > 138 && pathDist(x, z, SIQ_LINE) < SIQ.w / 2 - 0.5)
    || (self !== 'valley' && Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]) < 1.02)
    || (x > KHAZNEH_ROCK[0] - 4 && x < KHAZNEH_ROCK[2] + 2.6 && Math.abs(z - PLAZA.c[1]) < 13.6)
    || (self !== 'theatre' && Math.hypot(x - THEATRE.c[0], z - THEATRE.c[1]) < THEATRE.r1 + THEATRE.cliff - 0.5 && x > THEATRE.c[0] + THEATRE.west + 0.5)
    || (self === 'theatre' && x < THEATRE.c[0] + THEATRE.west - 0.5);
  const edges = [];
  // the square's round edge, counter-clockwise from the west
  { const r = PLAZA.r, n = Math.round(2 * Math.PI * r / 2), e = []; for (let k = 0; k < n; k++) { const a = Math.PI + k / n * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a); e.push([PLAZA.c[0] + nx * r, PLAZA.c[1] + nz * r, nx, nz, 'plaza']); } edges.push({ pts: e, ring: true }); }
  // the Outer Siq's two edges, its line smoothed
  { let P = OUTER.path; for (let k = 0; k < 3; k++) { const Q = [P[0]]; for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } Q.push(P[P.length - 1]); P = Q; }
    const L = [];
    for (let i = 0; i + 1 < P.length; i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], len = Math.hypot(bx - ax, bz - az), k = Math.max(1, Math.round(len / 2)); for (let j = 0; j < k; j++) L.push([ax + (bx - ax) * j / k, az + (bz - az) * j / k]); }
    for (const sg of [-1, 1]) { const e = []; for (let i = 0; i < L.length; i++) { const p = L[Math.max(0, i - 1)], q = L[Math.min(L.length - 1, i + 1)], tl = Math.hypot(q[0] - p[0], q[1] - p[1]), nx = -(q[1] - p[1]) / tl * sg, nz = (q[0] - p[0]) / tl * sg; e.push([L[i][0] + nx * OUTER.w / 2, L[i][1] + nz * OUTER.w / 2, nx, nz, 'outer']); } edges.push({ pts: e, west: e[Math.floor(e.length / 2)][2] < 0 }); }
  }
  // the cliff behind the theatre's cavea (where it is not open to the Outer Siq or the valley), rising from the top of its parapet
  { const r = THEATRE.r1 + THEATRE.cliff, n = Math.round(2 * Math.PI * r / 2), e = []; for (let k = 0; k < n; k++) { const a = Math.PI + k / n * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a); e.push([THEATRE.c[0] + nx * r, THEATRE.c[1] + nz * r, nx, nz, 'theatre']); } edges.push({ pts: e, ring: true, theatre: true }); }
  // and the straight edge of its cut on the west, where that is not open
  { const r = THEATRE.r1 + THEATRE.cliff, x = THEATRE.c[0] + THEATRE.west, h = Math.sqrt(r * r - THEATRE.west ** 2), e = []; for (let z = THEATRE.c[1] - h + 1; z < THEATRE.c[1] + h; z += 2) e.push([x, z, -1, 0, 'theatre-w']); edges.push({ pts: e }); }
  // the valley's east cliff, from the theatre past the Royal Tombs
  { const e = []; let z = -16; while (z < 128) { const q = Math.sqrt(Math.max(0, 1 - ((z - VALLEY.c[1]) / VALLEY.r[1]) ** 2)), x = VALLEY.c[0] + VALLEY.r[0] * q, gx = (x - VALLEY.c[0]) / VALLEY.r[0] ** 2, gz = (z - VALLEY.c[1]) / VALLEY.r[1] ** 2, gl = Math.hypot(gx, gz);
      e.push([x, z, gx / gl, gz / gl, 'valley']); z += 2 * Math.abs(gx / gl) + 0.15; }
    edges.push({ pts: e, royal: true }); }
  // the Street of Façades (docs/settlements/petra.md §10): tombs of the three crow-step kinds side by side along the west edge,
  // each on the edge and facing across the gorge; [kind, width, height]
  const FACADES = [['step', 9, 11], ['pylon', 7, 8.5], ['hegr', 10, 13], ['step', 8, 10.5], ['pylon', 6.5, 8], ['hegr', 11, 14], ['step', 9.5, 12], ['pylon', 7.5, 9]];
  const ZONE = { pylon: 0.27, step: 0.4, hegr: 0.34 }, FL = 1.5, tombs = [];
  {
    const west = edges.find((e) => e.west).pts, ok = west.map(([x, z]) => !taken(x, z, 'outer'));
    let i = ok.indexOf(true) + 3, k = 0;
    while (k < FACADES.length && i < west.length) {
      const [kind, w, h] = FACADES[k], span = Math.ceil((w / 2 + FL) / 2), j = i + span;
      if (j + span >= west.length || !ok[j + span]) break;
      const [x, z, nx, nz] = west[j], boxTop = +(h * (1 - ZONE[kind])).toFixed(2);
      tombs.push({ j, w, boxTop, x, z, nx, nz });
      E.push({ t: 'rock_tomb', at: [+x.toFixed(3), +z.toFixed(3)], dir: [-nx, -nz].map((v) => +v.toFixed(5)), w, h, kind, back: 12, flank: FL, boxTop, y: height(x - nx * 3, z - nz * 3) });
      i = j + span + 1 + (k % 3 === 1 ? 2 : 1); k++;
    }
  }
  const sides = [];
  for (const { pts, ring, west, royal, theatre } of edges) {
    const ok = pts.map(([x, z, , , self]) => !taken(x, z, self));
    let start = 0;
    if (ring) { start = ok.indexOf(false); if (start < 0) start = 0; }
    let run = [];
    const flush = () => {
      if (run.length >= 4) {
        const out = run.map(([x, z, nx, nz, , i]) => {
          // over a tomb: the face set back behind its crow-steps, rising from the top of the dressed rock
          let set = 0, base = null;
          if (west) for (const t of tombs) { const u = (x - t.x) * -t.nz + (z - t.z) * t.nx; if (Math.abs(u) < t.w / 2 + FL + 0.6) { set = 1.6; base = t.boxTop + 0.15; } }
          if (royal) for (const t of ROYAL) { const u = (x - t.x) * -t.nz + (z - t.z) * t.nx; if (Math.abs(u) < t.w / 2 + FL + 0.6) { set = t.set; base = t.base - height(x - nx * (face - set), z - nz * (face - set)); } }
          if (theatre) { const a = Math.atan2(z - THEATRE.c[1], x - THEATRE.c[0]); if (Math.cos(a) > Math.cos(Math.PI * 0.525) - 0.02) base = 30 * 0.42 + 0.3 - height(x - nx * face, z - nz * face); }
          const lx = x - nx * (face - set), lz = z - nz * (face - set), floor = height(lx, lz), top = Math.max(height(x + nx * 9.5, z + nz * 9.5), RIM) - 0.3;
          return [+lx.toFixed(3), +lz.toFixed(3), +nx.toFixed(5), +nz.toFixed(5), +floor.toFixed(3), +top.toFixed(3), +(base === null ? floor - 1 : floor + base).toFixed(3)];
        });
        const a = out[0], b = out[1], s = Math.sign(a[2] * -(b[1] - a[1]) + a[3] * (b[0] - a[0])) || 1;
        sides.push({ s, pts: out });
      }
      run = [];
    };
    for (let k = 0; k < pts.length; k++) { const i = (start + k) % pts.length; if (ok[i]) run.push(pts[i]); else flush(); }
    flush();
  }
  // runs that meet (the Siq and the square, the square and the Outer Siq) are joined into one, so that no end of a wall shows
  const atFace = (a) => [a[0] + a[2] * face, a[1] + a[3] * face];
  const joinable = (a, b) => { const p = atFace(a), q = atFace(b); return Math.hypot(p[0] - q[0], p[1] - q[1]) < 9 && a[2] * b[2] + a[3] * b[3] > -0.3; };
  const sgn = (P) => { const a = P[0], b = P[1]; return Math.sign(a[2] * -(b[1] - a[1]) + a[3] * (b[0] - a[0])) || 1; };
  // first onto the Siq's two walls (appended, so that their own samples keep their indices)
  for (const sd of SIQ_EL.sides) for (let k = 0; k < sides.length; k++) {
    const r = sides[k].pts, last = sd.pts[sd.pts.length - 1];
    if (joinable(last, r[0])) sd.pts.push(...r); else if (joinable(last, r[r.length - 1])) sd.pts.push(...r.slice().reverse()); else continue;
    sides.splice(k, 1); k = -1;
  }
  // then among themselves
  for (let a = 0; a < sides.length; a++) for (let b = 0; b < sides.length; b++) {
    if (a === b) continue;
    const A = sides[a].pts, B = sides[b].pts;
    let J = null;
    if (joinable(A[A.length - 1], B[0])) J = [...A, ...B]; else if (joinable(A[A.length - 1], B[B.length - 1])) J = [...A, ...B.slice().reverse()];
    if (J) { sides[a] = { pts: J }; sides.splice(b, 1); a = -1; break; }
  }
  for (const sd of sides) sd.s = sgn(sd.pts);
  // the cliff over the Khazneh, rising from just above its urn, its face 1.5 m behind the façade's plane
  { const fx = PLAZA.c[0] - PLAZA.r + 2, out = [];
    for (let z = PLAZA.c[1] - 16; z <= PLAZA.c[1] + 16.01; z += 2) out.push([+(fx + face - 1.5).toFixed(3), +z.toFixed(3), -1, 0, 0, RIM - 0.3, 39.7]);
    sides.push({ s: 1, pts: out }); }
  E.push({ t: 'siq_walls', face, sides, seed: 7, clear: [[100, -185, 160, -135]] });
}
// the colonnaded street, the Great Temple on the south, Qasr al-Bint at the west end
// (no shops where the Great Temple's propylaeum opens off the southern portico)
E.push({ t: 'colonnade_street', a: STREET.a, b: STREET.b, w: STREET.w, pd: 5, h: 6, gaps: [[GREAT_TEMPLE[0] - 1, GREAT_TEMPLE[2] + 1], [GARDEN.entry[0] - 1, GARDEN.entry[1] + 1]] });
// the garden and pool of Aretas IV east of the Great Temple, its stair up from the southern portico through a gap in the shops
E.push({ t: 'pool_garden', ...GARDEN });
// a banqueting hall cut in an outcrop on the valley's north slope, its three doors toward the street
E.push({ t: 'triclinium', at: TRICLINIUM.at, y: +floorY(...TRICLINIUM.at).toFixed(3), w: TRICLINIUM.w, d: TRICLINIUM.d, h: TRICLINIUM.h });
E.push({ t: 'great_temple', rect: GREAT_TEMPLE });
E.push({ t: 'qasr', rect: QASR.rect, podium: 3, h: 23, altar: QASR.altar, court: TEMENOS });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
// the little square before the Khazneh is no market (and no street life spills into the Siq): its room is named so that the
// life pass reads it as a forecourt (a few people about), and stops short of the Siq's mouth
const rooms = [room('the forecourt of the Khazneh', [PLAZA.c[0] - PLAZA.r + 6, PLAZA.c[1] - PLAZA.r + 4, PLAZA.c[0] + PLAZA.r - 12, PLAZA.c[1] + PLAZA.r - 4], 0, 'open'), room('the city', [-200, -80, 60, 100], 0, 'open'),
  room('the Treasury', [PLAZA.c[0] - PLAZA.r + 2 - 21.2, PLAZA.c[1] - 5.2, PLAZA.c[0] - PLAZA.r + 2 - 5.9, PLAZA.c[1] + 5.2], 1.05, 'hall'),
  room('the Great Temple', [GREAT_TEMPLE[0] + 7, GREAT_TEMPLE[1] + 52, GREAT_TEMPLE[2] - 7, GREAT_TEMPLE[1] + 64], 5.92, 'hall'),
  room('the garden', [GARDEN.rect[0] + 2, GARDEN.rect[1] + 3, GARDEN.rect[2] - 2, GARDEN.split - 1], GARDEN.gy, 'open'),
  room('the triclinium', [TRICLINIUM.at[0] - TRICLINIUM.w / 2 + 2, TRICLINIUM.at[1] - 1.6 - TRICLINIUM.d + 2, TRICLINIUM.at[0] + TRICLINIUM.w / 2 - 2, TRICLINIUM.at[1] - 2.6], +floorY(...TRICLINIUM.at).toFixed(3), 'hall'),
  room('Qasr al-Bint', [QASR.rect[0] + 3, QASR.rect[1] + 9, QASR.rect[2] - 3, QASR.rect[1] + 18], 3.02, 'hall')];
for (const u of shopUnits()) rooms.push(room(`shop ${u.i}`, [u.x0 + 0.4, u.z0, u.x1 - 0.4, u.z1 - 0.2], 0.45, 'shop'));
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
