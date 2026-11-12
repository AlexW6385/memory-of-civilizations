// Taos Pueblo — the dress of the houses' feet, the plaza, the creek and the fields (docs/settlements/taos.md §4.5): the list of
// `pueblo_dress` items (styles/pueblo/dress.js) derived from layout.js — nothing hard-coded to a coordinate but the pens.
import { NORTH, SOUTH, CELL, KIVAS, WALL, CREEK, RADIUS, YARDS, PENS, PLAZA, RACKS, ARRIVE, nearYard, creekZ, inCreek, inRect, isRoom, roomsOf, nearRoom, onKeep, bankY } from './layout.js';
import { ground } from './ground.js';

const ST = 2.7;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, table) => { let t = rand() * table.reduce((a, [, w]) => a + w, 0); for (const [k, w] of table) if ((t -= w) < 0) return k; return table[0][0]; };

/** The four faces of a cell: where the wall starts, the way along it (the item's local +x), the normal out of it, the yaw that turns local +z to the normal. */
function faces(x0, z0) {
  const x1 = x0 + CELL, z1 = z0 + CELL;
  return [
    { di: 1, dj: 0, o: [x0, z1], t: [1, 0], n: [0, 1], rot: 0, kind: 's' },
    { di: -1, dj: 0, o: [x1, z0], t: [-1, 0], n: [0, -1], rot: Math.PI, kind: 'n' },
    { di: 0, dj: 1, o: [x1, z1], t: [0, -1], n: [1, 0], rot: Math.PI / 2, kind: 'e' },
    { di: 0, dj: -1, o: [x0, z0], t: [0, 1], n: [-1, 0], rot: -Math.PI / 2, kind: 'w' },
  ];
}

/** The woodpiles at the feet of the plaza faces (about two cells in five, not beside a room): the elements, and the set of 'B:i:j' cells that carry one. */
export function woodpiles() {
  const piles = [], wood = new Set();
  let s = 4711; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const [B, face] of [[NORTH, 1], [SOUTH, -1]]) {
    const H = B.heights;
    for (let i = 0; i < H.length; i++) for (let j = 0; j < H[0].length; j++) {
      if (!H[i][j] || nearRoom(B, i, j)) continue;
      const nb = (H[i + face] ?? [])[j] ?? 0;
      if (nb || rand() > 0.4) continue;
      const cx = B.x0 + (j + 0.5) * CELL, cz = face > 0 ? B.z0 + (i + 1) * CELL + 0.55 : B.z0 + i * CELL - 0.55;
      wood.add(`${B === NORTH ? 'N' : 'S'}:${i}:${j}`);
      piles.push({ t: 'woodpile', at: [cx + (rand() - 0.5) * 1.2, cz], yaw: 0, len: 1.6 + rand() * 1.0, rows: 3 + Math.floor(rand() * 3), seed: i * 40 + j });
    }
  }
  return { wood, piles };
}

export function dressItems() {
  const { wood } = woodpiles();
  const rand = rng(4242), I = [];
  const add = (k, at, y, rot, v, o = {}) => I.push({ k, at: [+at[0].toFixed(2), +at[1].toFixed(2)], y, rot, v, ...o });
  // 1. the feet of the house faces: benches, jars, maize on the viga ends, hides, blankets airing, squash, by face and by what the face looks on
  for (const B of [NORTH, SOUTH]) {
    const H = B.heights, tag = B === NORTH ? 'N' : 'S', rooms = roomsOf(B);
    for (let i = 0; i < H.length; i++) for (let j = 0; j < H[0].length; j++) {
      if (!H[i][j]) continue;
      const x0 = B.x0 + j * CELL, z0 = B.z0 + i * CELL, room = rooms.find((r) => r.i === i && r.j === j);
      for (const f of faces(x0, z0)) {
        if ((H[i + f.di]?.[j + f.dj] ?? 0) > 0) continue;
        if (wood.has(`${tag}:${i}:${j}`) && f.kind === (B === NORTH ? 's' : 'n')) continue;
        const out = [f.o[0] + f.n[0] * 2.5 + f.t[0] * 2.5, f.o[1] + f.n[1] * 2.5 + f.t[1] * 2.5];
        const plaza = inRect(PLAZA, out[0], out[1]), alley = f.kind === 'e' || f.kind === 'w';
        // free runs along the face, clear of a doorway
        let runs = [[0.3, 2.3], [2.7, 4.7]];
        if (room && f.kind === room.door) { const dx = x0 + CELL / 2 + 0.3, pd = f.t[0] > 0 ? dx - x0 : f.t[0] < 0 ? x0 + CELL - dx : 0; runs = [[0.25, pd - 0.85], [pd + 0.85, 4.75]]; }
        for (const [a, b] of runs) {
          const w = b - a; if (w < 1.3 || rand() > (plaza ? 0.9 : alley ? 0.6 : 0.5)) continue;
          const kind = pick(rand, plaza ? [['banco', 3], ['jars', 3], ['maize', 2.2], ['hide', 1.1], ['clothes', 1.1], ['squash', 1.3]] : alley ? [['jars', 3], ['maize', 3], ['banco', 2], ['clothes', 0.8], ['squash', 0.8]] : [['jars', 2], ['maize', 2], ['clothes', 1.2], ['hide', 1.1]]);
          const v = Math.floor(rand() * 4), L = kind === 'banco' ? 1.5 + (v % 3) * 0.6 : kind === 'clothes' ? 3.5 + (v % 2) : kind === 'hide' ? 2.6 : 1.4;
          let p = kind === 'banco' ? a + rand() * Math.max(0, w - L) : a + L / 2 + rand() * Math.max(0, w - L), off = { banco: 0.1, maize: 0.05, hide: 0.55, clothes: 0.65, jars: 0.55, squash: 0.85 }[kind];
          let vv = v;
          if (kind === 'banco' && L > w) vv = 0;
          if ((kind === 'clothes' || kind === 'hide') && L > w) { if (w < 1.8) continue; }
          add(kind, [f.o[0] + f.t[0] * p + f.n[0] * off, f.o[1] + f.t[1] * p + f.n[1] * off], 0, f.rot, vv);
        }
      }
      // 2. the roofs: a rack of maize and squash on about one roof in nine
      const n = H[i][j];
      if (!room && rand() < 0.1) add('squash', [x0 + CELL * 0.3, B === NORTH ? z0 + CELL - 1.4 : z0 + 1.4], n * ST, rand() * 6.28, Math.floor(rand() * 2), { reach: 60 });
      if (!room && rand() < 0.1) add('jars', [x0 + CELL * 0.35, B === NORTH ? z0 + 1.0 : z0 + CELL - 1.0], n * ST, rand() * 6.28, Math.floor(rand() * 4), { reach: 60 });
      if (!room && rand() < 0.11) add('roofrack', [x0 + CELL * 0.62, B === NORTH ? z0 + CELL - 1.1 : z0 + 1.1], n * ST, B === NORTH ? 0 : Math.PI, Math.floor(rand() * 2), { reach: 70 });
    }
  }
  // 3. the plaza: shades, hearths, hides and blankets, jars, squash, the pens, by rejection against all that stands there
  const placed = [];
  const free = (x, z, r) => !(inCreek(x, z, 3 + r) || nearYard(x, z, 2 + r) || inRect([NORTH.x0 - 3, NORTH.z0 - 3, NORTH.x0 + NORTH.heights[0].length * CELL + 3, NORTH.z0 + NORTH.heights.length * CELL + 3 + r], x, z)
    || inRect([SOUTH.x0 - 3, SOUTH.z0 - 3 - r, SOUTH.x0 + SOUTH.heights[0].length * CELL + 3, SOUTH.z0 + SOUTH.heights.length * CELL + 3], x, z)
    || KIVAS.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + 4.5 + r) || (z < -39 + r && RACKS.some(([a, b]) => x > a - 3 - r && x < b + 3 + r)) || onKeep(x, z, 3 + r) || Math.hypot(x - ARRIVE.at[0], z - ARRIVE.at[1]) < 4.5 + r
    || PENS.some(([px, pz]) => Math.hypot(x - px, z - pz) < 3 + r) || placed.some(([px, pz, pr]) => Math.hypot(x - px, z - pz) < pr + r + 0.8));
  const place = (kind, r, tries = 60, region = [-66, -42, 66, 38]) => {
    for (let t = 0; t < tries; t++) {
      const x = region[0] + rand() * (region[2] - region[0]), z = region[1] + rand() * (region[3] - region[1]);
      if (!free(x, z, r)) continue;
      placed.push([x, z, r]); add(kind, [x, z], 0, rand() * 6.28, Math.floor(rand() * 4)); return true;
    }
    return false;
  };
  for (const [px, pz] of PENS) { placed.push([px, pz, 2.4]); add('pen', [px, pz], 0, 0, 0); }
  for (const [kind, r, n] of [['ramada', 2.9, 7], ['hearth', 1.3, 9], ['hide', 1.9, 8], ['clothes', 2.3, 8], ['squash', 1.0, 10], ['jars', 0.9, 16], ['banco', 1.3, 6]]) for (let k = 0; k < n; k++) place(kind, r);
  // 4. the creek: cattails on both banks, washing places
  const cat = [];
  for (let x = -66; x < 66; x += 2 + rand() * 3.5) for (const sd of [-1, 1]) {
    if (rand() < 0.35 || [-35, 30].some((b) => Math.abs(x - b) < 4.5) || [-12, 14].some((b) => Math.abs(x - b) < 2.5)) continue;
    const dz = 2.55 + rand() * 0.9, z = creekZ(x) + sd * dz;
    cat.push([x, z, dz]);
  }
  for (const [x, z, dz] of cat) add('cattail', [x, z], bankY(dz), rand() * 6.28, Math.floor(rand() * 3), { reach: 90 });
  for (const x of [-52, -24, 4, 42]) { const sd = x % 2 === 0 ? -1 : 1, dz = 3.6, z = creekZ(x) + sd * dz; if (free(x, z, 1) || true) add('wash', [x, z], bankY(dz), sd < 0 ? 0 : Math.PI, 0); }
  // 5. outside the wall: middens behind the houses, watchers' platforms in the fields
  const [wx0, wz0, wx1, wz1] = WALL;
  for (const [x, z] of [[-110, wz0 - 6], [-30, wz0 - 6], [40, wz0 - 6], [110, wz0 - 6], [wx0 - 6, -80], [wx0 - 6, 80], [wx1 + 6, 100], [-100, wz1 + 6], [90, wz1 + 6]]) add('midden', [x, z], ground.height(x, z), rand() * 6.28, 0, { reach: 140 });
  let w = 0;
  for (let a = 0.3; a < 6.28 && w < 8; a += 0.77) {
    const r = 205 + (w % 3) * 18, x = Math.cos(a) * r, z = Math.sin(a) * r, c = ground.cover(x, z);
    if (!(c.fields > 0.45) || ground.height(x, z) > 1.5) continue;
    add('watch', [x, z], ground.height(x, z), Math.atan2(-x, -z), 0, { reach: 200 }); w++;
  }
  void RADIUS; void CREEK;
  return I;
}
