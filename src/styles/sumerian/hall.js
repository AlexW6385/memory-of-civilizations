// A great courtyard building of Ur that can be walked (docs/settlements/ur.md §4.5): the palace E-hursag and the
// storehouses of the temple. Rooms of plastered mud brick round a brick-paved court, each with its door on the court,
// the gateway through the front range between two towers (the doors standing open), flat roofs of mud on reed mats on
// palm trunks with a parapet, a stair from the court to the roof. By role the rooms are furnished: the audience hall
// with the dais and the king's seat, the chambers with their couches and chests, the offices of the scribes, the
// kitchens, the guards' room, the stores with their jars, sacks, bales of wool and sealed tablets.
//   ur_hall: { rect, door ('n'|'s'|'w'|'e'), h, kind ('palace' | 'stores'), seed }

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { stairs } from './index.js';

const BB = 'brick_baked', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const jarP = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];
const bigJar = [[0.15, 0], [0.3, 0.2], [0.32, 0.55], [0.24, 0.92], [0.15, 1.02], [0.17, 1.08], [0.001, 1.06]];

const PLAN = {
  palace: { front: ['guard', 'gate', 'office'], back: ['chamber', 'hall', 'chamber'], left: ['kitchen', 'store', 'store'], right: ['store', 'office', 'chamber'] },
  stores: { front: ['guard', 'gate', 'office'], back: ['store', 'store', 'store'], left: ['store', 'store', 'store'], right: ['store', 'office', 'store'] },
};

export function urHall(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, f = el.door ?? 's', H = el.h ?? 5, rand = rng(el.seed || 11), plan = PLAN[el.kind ?? 'stores'];
  const U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, V = f === 'n' || f === 's' ? z1 - z0 : x1 - x0, d = Math.min(el.ring ?? 10, V * 0.34), t = 0.9, ti = 0.55, tp = 0.45;
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); if (y1 - y0 > 1e-3 && r[2] > r[0] && r[3] > r[1]) bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const LP = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  const L = (mat, prof, u, v, y, seg = 12) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const foot = 1.0, up = MP, hallH = el.kind === 'palace' ? H : H;
  // a wall segment with doorways [{ a, b, h }] along its long axis
  const wall = (u0, v0, u1, v1, holes = [], h = H, outer = false) => {
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Bn = alongU ? u1 : v1;
    const seg = (a, b, y0, y1) => {
      if (b - a < 1e-3 || y1 - y0 < 1e-3) return; const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b];
      if (outer && y0 < foot) { B(BB, ...q, y0, Math.min(foot, y1)); if (y1 > foot) B(up, ...q, foot, y1); } else B(up, ...q, y0, y1);
      col.rect(R(...q), y0, y1);
    };
    let a = A; for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, -0.3, h); seg(o.a, o.b, o.h, h); a = o.b; } seg(a, Bn, -0.3, h);
  };
  const lintel = (a0, a1, v0, v1, h, alongU = true) => { const p = alongU ? W(a0 - 0.2, (v0 + v1) / 2) : W((v0 + v1) / 2, a0 - 0.2), q = alongU ? W(a1 + 0.2, (v0 + v1) / 2) : W((v0 + v1) / 2, a1 + 0.2); beam('palm_trunk', [p[0], h, p[1]], [q[0], h, q[1]], Math.abs(v1 - v0) / 2 + 0.05, 0.2); };
  // ---- the rooms: each wing divided along its length; the gate takes the middle of the front range
  const rooms = [];
  const split = (list, len, a0, pad) => { const wts = list.map((k) => (k === 'hall' ? 3 : k === 'gate' ? 0 : 1)), gate = list.includes('gate') ? 3.6 : 0, tot = wts.reduce((s, w) => s + w, 0); let a = a0; const avail = len - gate; return list.map((k, i) => { const w = k === 'gate' ? gate : avail * wts[i] / tot, r = { role: k, a, b: a + w }; a += w; return r; }); };
  const sideLen = V - 2 * d, sideN = Math.max(2, Math.round(sideLen / 8)), sideList = (l) => { const o = []; for (let i = 0; i < sideN; i++) o.push(l[i % l.length]); return o; };
  const wings = [
    { id: 'front', ranges: split(plan.front, U, 0), court: 'v+', fix: [0, d] },
    { id: 'back', ranges: split(plan.back, U, 0), court: 'v-', fix: [V - d, V] },
    { id: 'left', ranges: split(sideList(plan.left), sideLen, d), court: 'u+', fix: [0, d] },
    { id: 'right', ranges: split(sideList(plan.right), sideLen, d), court: 'u-', fix: [U - d, U] },
  ];
  // the room rectangles (local), the wall facing the court at ti thick, partitions at tp
  const doors = [];
  for (const w of wings) {
    const [c0, c1] = w.fix;
    for (const rg of w.ranges) {
      if (rg.role === 'gate') continue;
      const along = w.id === 'front' || w.id === 'back', pa = rg.a + (rg.a === 0 || rg.a === d ? t : tp / 2), pb = rg.b - (rg.b >= (along ? U : V - d) - 0.01 ? t : tp / 2);
      const a0 = along ? pa : pa, a1 = pb;
      let r;
      if (w.id === 'front') r = [a0, t, a1, c1 - ti]; else if (w.id === 'back') r = [a0, c0 + ti, a1, V - t]; else if (w.id === 'left') r = [t, a0, c1 - ti, a1]; else r = [c0 + ti, a0, U - t, a1];
      rooms.push({ ...rg, w: w.id, r, court: w.court });
    }
  }
  // ---- walls
  // outer walls with the gate in the front, the court-facing walls with a door to each room, partitions
  const gateR = wings[0].ranges.find((x) => x.role === 'gate'), gA = gateR.a + 0.3, gB = gateR.b - 0.3, gh = Math.min(4.2, H - 0.6);
  wall(0, 0, U, t, [{ a: gA, b: gB, h: gh }], H, true); wall(0, V - t, U, V, [], H, true); wall(0, t, t, V - t, [], H, true); wall(U - t, t, U, V - t, [], H, true);
  lintel(gA, gB, 0, t, gh);
  const dh = (r) => (r.role === 'hall' ? 3.6 : 2.5), dw = (r) => (r.role === 'hall' ? 3.2 : 1.3);
  const holesOf = (w) => rooms.filter((r) => r.w === w).map((r) => { const along = w === 'front' || w === 'back', c = along ? (r.r[0] + r.r[2]) / 2 : (r.r[1] + r.r[3]) / 2; return { a: c - dw(r) / 2, b: c + dw(r) / 2, h: dh(r), room: r }; });
  const hf = holesOf('front'), hb = holesOf('back'), hl = holesOf('left'), hr = holesOf('right');
  hf.push({ a: gA, b: gB, h: gh });
  wall(t, d - ti, U - t, d, hf, H); wall(t, V - d, U - t, V - d + ti, hb, H);
  wall(d - ti, d, d, V - d, hl, H); wall(U - d, d, U - d + ti, V - d, hr, H);
  for (const [hs, vv, uu, side] of [[hf, d - ti, null, 'f'], [hb, V - d, null, 'b'], [hl, null, d - ti, 'l'], [hr, null, U - d, 'r']]) for (const o of hs) {
    if (!o.room) { lintel(o.a, o.b, vv, vv + ti, o.h); continue; }
    if (side === 'f' || side === 'b') { lintel(o.a, o.b, vv, vv + ti, o.h); } else { lintel(o.a, o.b, uu, uu + ti, o.h, false); }
    // the door: two cedar leaves open against the jambs, a threshold
    if (side === 'f' || side === 'b') for (const [u, s] of [[o.a, 1], [o.b, -1]]) col.rect(B('cedar', Math.min(u, u + s * 0.07), vv + (side === 'f' ? -0.55 : ti + 0.0), Math.max(u, u + s * 0.07), vv + (side === 'f' ? 0 : ti + 0.55), 0.08, o.h - 0.05), 0.08, o.h - 0.05);
    else for (const [v, s] of [[o.a, 1], [o.b, -1]]) col.rect(B('cedar', uu + (side === 'l' ? -0.55 : ti), Math.min(v, v + s * 0.07), uu + (side === 'l' ? 0 : ti + 0.55), Math.max(v, v + s * 0.07), 0.08, o.h - 0.05), 0.08, o.h - 0.05);
  }
  // partitions between rooms (perpendicular to each wing)
  for (const w of wings) for (let i = 1; i < w.ranges.length; i++) {
    const a = w.ranges[i].a; if (w.ranges[i].role === 'gate' || w.ranges[i - 1].role === 'gate') continue;   // (the passage's walls: below)
    if (w.id === 'front') wall(a - tp / 2, t, a + tp / 2, d - ti, [], H); else if (w.id === 'back') wall(a - tp / 2, V - d + ti, a + tp / 2, V - t, [], H);
    else if (w.id === 'left') wall(t, a - tp / 2, d - ti, a + tp / 2, [], H); else wall(U - d + ti, a - tp / 2, U - t, a + tp / 2, [], H);
  }
  // the gate passage's walls beyond the first (the left jamb stands at the gate's start)
  { const a = gateR.a; wall(a - tp / 2, t, a + tp / 2, d - ti, [], H); const b = gateR.b; wall(b - tp / 2, t, b + tp / 2, d - ti, [], H); }
  // the towers at the gateway, outside the front wall, with buttresses; the wall's own pilasters every 3.5 m
  for (const [u0, u1] of [[gA - 4.2, gA - 0.4], [gB + 0.4, gB + 4.2]]) { const q = B(BB, u0, -1.6, u1, 0.1, -0.3, H + 1.2); col.rect(q, 0, H + 1.2); col.floor(q, H + 1.2); B(up, u0 + 0.2, -1.6, u1 - 0.2, -1.55, H + 1.2, H + 1.7); }
  for (let u = 2; u < U - 1.5; u += 3.5) { if (u > gA - 5 && u < gB + 5) continue; for (const [a, b] of [[-0.35, 0.02], [V - 0.02, V + 0.35]]) col.rect(B(up, u - 0.3, a, u + 0.3, b, 0, H), 0, H); }
  for (let v = 2; v < V - 1.5; v += 3.5) { for (const [a, b] of [[-0.35, 0.02], [U - 0.02, U + 0.35]]) col.rect(B(up, a, v - 0.3, b, v + 0.3, 0, H), 0, H); }
  B(BB, gA, -1.0, gB, t, -0.3, 0.1);
  // ---- floors, roofs, parapets
  B(BB, t, t, U - t, V - t, -0.3, 0.06); col.floor(R(0, 0, U, V), 0.06);
  const roof = (u0, v0, u1, v1, spanU) => {
    B(MP, u0, v0, u1, v1, H - 0.3, H); B('reed_mat', u0, v0, u1, v1, H - 0.35, H - 0.3); col.floor(R(u0, v0, u1, v1), H);
    const step = 0.7;
    if (spanU) for (let v = v0 + 0.35; v < v1 - 0.1; v += step) { const a = LP(u0, v, H - 0.5), b = LP(u1, v, H - 0.5); beam('palm_trunk', a, b, 0.08, 0.15); }
    else for (let u = u0 + 0.35; u < u1 - 0.1; u += step) { const a = LP(u, v0, H - 0.5), b = LP(u, v1, H - 0.5); beam('palm_trunk', a, b, 0.08, 0.15); }
  };
  roof(t, t, U - t, d, false); roof(t, V - d, U - t, V - t, false); roof(t, d, d, V - d, true); roof(U - d, d, U - t, V - d, true);
  B(MP, 0, 0, U, 0.35, H, H + 0.6); B(MP, 0, V - 0.35, U, V, H, H + 0.6); B(MP, 0, 0.35, 0.35, V - 0.35, H, H + 0.6); B(MP, U - 0.35, 0.35, U, V - 0.35, H, H + 0.6);
  const uEnd = Math.min(d + 0.3 + Math.round(H / 0.16) * 0.28, U - d - 1);
  for (const q of [[d - 0.3, d - 0.25, uEnd - 2.6, d], [uEnd + 1.2, d - 0.25, U - d + 0.3, d], [d - 0.3, V - d, U - d + 0.3, V - d + 0.25], [d - 0.25, d, d, V - d], [U - d, d, U - d + 0.25, V - d]]) { B(MP, ...q, H, H + 0.45); col.rect(R(...q), H, H + 0.45); }
  // the roof's way: gateway between the parapets stays open (the roof of the front range is walked over the gate)
  // ---- the court: brick paving with its drain, the stair to the roof, a basin, palms in pits, benches
  const cu0 = d, cu1 = U - d, cv0 = d, cv1 = V - d, cu = (cu0 + cu1) / 2, cv = (cv0 + cv1) / 2;
  { const q = R(d + 0.3, d + 0.2, uEnd, d + 1.0);
    stairs({ rect: q, y0: 0.06, y1: H, dir: f === 'n' ? 'e' : f === 's' ? 'w' : f === 'w' ? 'n' : 's', mat: BB }, { bag, col }); }
  B('bitumen', cu - 3.2, cv - 1.8, cu + 3.2, cv + 1.8, 0.06, 0.5); B(BB, cu - 3.4, cv - 2.0, cu + 3.4, cv - 1.8, 0.06, 0.62); B(BB, cu - 3.4, cv + 1.8, cu + 3.4, cv + 2.0, 0.06, 0.62); B(BB, cu - 3.4, cv - 1.8, cu - 3.2, cv + 1.8, 0.06, 0.62); B(BB, cu + 3.2, cv - 1.8, cu + 3.4, cv + 1.8, 0.06, 0.62);
  B('opening', cu - 3.0, cv - 1.6, cu + 3.0, cv + 1.6, 0.5, 0.505); col.rect(R(cu - 3.4, cv - 2.0, cu + 3.4, cv + 2.0), 0, 0.62);
  for (const [pu, pv] of [[cu - 9, cv - 5], [cu + 9, cv - 5], [cu - 9, cv + 5], [cu + 9, cv + 5]]) { L(BB, [[1.0, 0], [1.0, 0.2], [0.8, 0.2], [0.8, 0]], pu, pv, 0.06, 14); bag.add('palm_trunk', lathe([[0.2, 0], [0.18, 3.2], [0.15, 6.0], [0.001, 6.0]], 8, null, ...(() => { const w = W(pu, pv); return [w[0], 0.1, w[1]]; })())); L('palm_leaf', [[0.001, 6.0], [1.6, 6.15], [2.6, 5.6], [2.7, 5.4], [1.5, 5.9], [0.001, 5.95]], pu, pv, 0, 12); col.circle(...W(pu, pv), 0.4, 0, 6); }
  for (let u = cu0 + 6; u < cu1 - 6; u += 8) { B(BB, u, cv0 + 0.1, u + 3.0, cv0 + 0.6, 0.06, 0.48); col.rect(R(u, cv0 + 0.1, u + 3.0, cv0 + 0.6), 0, 0.5); }

  // ---- the furniture of each room, in its own frame: p along the back wall, q out from it toward the court
  for (const rm of rooms) {
    const [r0, r1, r2, r3] = rm.r, along = rm.w === 'front' || rm.w === 'back', rw = along ? r2 - r0 : r3 - r1, rd = along ? r3 - r1 : r2 - r0;
    const toLocal = (p, q) => (rm.w === 'front' ? [r0 + p, r1 + q] : rm.w === 'back' ? [r0 + p, r3 - q] : rm.w === 'left' ? [r0 + q, r1 + p] : [r2 - q, r1 + p]);
    const RB = (mat, p0, q0, p1, q1, y0, y1) => { const a = toLocal(p0, q0), b = toLocal(p1, q1); return B(mat, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), y0, y1); };
    const RL = (mat, prof, p, q, y, seg = 12) => { const a = toLocal(p, q); L(mat, prof, a[0], a[1], y, seg); };
    const RC = (p0, q0, p1, q1, h) => { const a = toLocal(p0, q0), b = toLocal(p1, q1); col.rect(R(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])), 0, h); };
    const RBeam = (mat, p0, q0, y0, p1, q1, y1, w, h) => { const a = toLocal(p0, q0), b = toLocal(p1, q1); beam(mat, LP(a[0], a[1], y0), LP(b[0], b[1], y1), w, h); };
    const soot = (p, q, hw, y0, y1) => { const a = toLocal(p - hw, q), b = toLocal(p + hw, q), c = toLocal(p + hw * 0.5, q), dd = toLocal(p - hw * 0.5, q); const A = LP(a[0], a[1], y0), Bq = LP(b[0], b[1], y0), C = LP(c[0], c[1], y1), D = LP(dd[0], dd[1], y1); bag.add('pottery_dark', fromTriangles([...A, ...Bq, ...C, ...A, ...C, ...D, ...A, ...C, ...Bq, ...A, ...D, ...C])); };
    const lamp = (p, q, y) => { RL('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], p, q, y, 10); RB('flame', p - 0.012, q - 0.012, p + 0.012, q + 0.012, y + 0.04, y + 0.08); const a = toLocal(p, q + 0.4); lights.push({ at: LP(a[0], a[1], y + 0.4), color: '#ffb46b', intensity: 2.5, distance: 7 }); };
    const mats = () => { RB('reed_mat', 0.25, 0.25, rw - 0.25, rd - 0.25, 0.06, 0.072); };
    const jarsRow = (q, n, big = true, y = 0.06) => { for (let i = 0; i < n; i++) { const p = 0.5 + i * ((rw - 1.0) / Math.max(1, n - 1)); RL('terracotta', big ? bigJar : jarP(1.2), p, q, y, 14); } };
    const sack = (p, q, y = 0.06) => RL('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], p, q, y, 10);
    const role = rm.role;
    if (role === 'store') {
      jarsRow(0.5, Math.floor((rw - 0.6) / 0.62));
      RC(0.2, 0.15, rw - 0.2, 0.85, 1.1);
      for (let k = 0; k < 8; k++) sack(0.6 + (k % 4) * 0.6, rd - 0.6 - (k >> 2) * 0.55);
      RB('hide_white', rw - 1.6, 1.3, rw - 0.5, 2.0, 0.06, 0.5); RC(rw - 1.6, 1.3, rw - 0.5, 2.0, 0.5);          // a bale of wool
      RB('timber', 0.3, 1.2, 1.4, 1.7, 0.06, 0.4); for (let k = 0; k < 5; k++) RB('mud_plaster', 0.4 + k * 0.2, 1.3, 0.55 + k * 0.2, 1.6, 0.4, 0.44);    // sealed tablets on a bench
      lamp(0.15, rd - 0.1, 1.4);
    } else if (role === 'office') {
      mats(); for (const q of [0.5, 1.3]) { RB(MP, 0.5, q, rw - 0.5, q + 0.35, 0.06, 0.42); RC(0.5, q, rw - 0.5, q + 0.35, 0.42); for (let p = 0.7; p < rw - 0.8; p += 0.45) RB('mud_plaster', p, q + 0.05, p + 0.3, q + 0.3, 0.42, 0.45); }
      for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) RB('mud_plaster', 0.2 + j * 0.45, rd - 0.15 - 0.0, 0.5 + j * 0.45, rd - 0.05, 0.6 + k * 0.35, 0.78 + k * 0.35);   // the shelves' tablets (fronts)
      RB('timber', rw - 1.0, rd - 1.0, rw - 0.4, rd - 0.4, 0.06, 0.4); lamp(0.15, rd * 0.5, 1.3);
    } else if (role === 'chamber') {
      mats(); const cu0b = 0.4, cv1b = rd - 0.1;
      RB('timber', cu0b, 0.0 + 0.1, cu0b + 1.9, 0.95, 0.06, 0.45); RB('linen', cu0b + 0.02, 0.12, cu0b + 1.88, 0.93, 0.45, 0.55); RB('cloth_red', cu0b + 0.5, 0.1, cu0b + 1.8, 0.95, 0.55, 0.565); RC(cu0b, 0.1, cu0b + 1.9, 0.95, 0.56);
      RB('cedar', rw - 1.1, 0.1, rw - 0.2, 0.6, 0.06, 0.55); RB('bronze', rw - 1.12, 0.08, rw - 0.18, 0.62, 0.5, 0.52); RC(rw - 1.1, 0.1, rw - 0.2, 0.6, 0.55);
      RB('timber', rw * 0.5 - 0.4, rd * 0.5, rw * 0.5 + 0.4, rd * 0.5 + 0.5, 0.06, 0.42); lamp(rw - 0.1, rd * 0.5, 1.3); void cv1b;
    } else if (role === 'kitchen') {
      for (const p of [0.9, 2.0]) { RL('terracotta', [[0.38, 0], [0.37, 0.4], [0.28, 0.75], [0.16, 0.85], [0.15, 0.85], [0.26, 0.74], [0.34, 0.4], [0.35, 0.03]], p, 0.55, 0.06, 16); }
      RC(0.4, 0.15, 2.5, 0.95, 0.9);
      soot(1.5, 0.0, 0.9, 0.9, 3.0);
      RB('mud_plaster', rw - 1.5, 0.3, rw - 0.4, 1.0, 0.06, 0.5); RB('basalt', rw - 1.35, 0.4, rw - 0.55, 0.9, 0.5, 0.6); RC(rw - 1.5, 0.3, rw - 0.4, 1.0, 0.6);
      for (let k = 0; k < 4; k++) RL('terracotta', jarP(1.1), 0.5 + k * 0.5, rd - 0.4, 0.06, 12);
      for (let k = 0; k < 6; k++) RL('pottery_dark', [[0.001, 0], [0.13, 0.005], [0.14, 0.035], [0.001, 0.04]], rw - 0.5, rd - 0.5, 0.06 + k * 0.04, 10);
      { const a = toLocal(1.5, 1.4); lights.push({ at: LP(a[0], a[1], 0.8), color: '#ff9a4a', intensity: 3, distance: 6 }); }
    } else if (role === 'guard') {
      mats(); RB(BB, 0.3, 0.2, rw - 0.3, 0.7, 0.06, 0.44); RC(0.3, 0.2, rw - 0.3, 0.7, 0.44);
      for (let k = 0; k < 4; k++) RBeam('timber', 0.4 + k * 0.18, rd - 0.15, 0.06, 0.4 + k * 0.18, rd - 0.45, 2.2, 0.015, 0.03);   // spears on the wall
      for (let k = 0; k < 2; k++) RL('terracotta', jarP(1.0), rw - 0.5, 1.2 + k * 0.5, 0.06, 12);
      lamp(0.15, rd * 0.5, 1.3);
    } else if (role === 'hall') {
      // the audience hall: the dais across the back, the king's seat of cedar and bronze, benches along the sides, braziers, piers carrying the roof
      mats(); const dp = rw * 0.5, dq = 0.0;
      RB(BB, dp - 3.0, dq, dp + 3.0, 2.6, 0.06, 0.6); RB(MP, dp - 3.05, dq, dp + 3.05, 2.65, 0.6, 0.66); RC(dp - 3.05, dq, dp + 3.05, 2.65, 0.66);
      for (let k = 0; k < 2; k++) RB(BB, dp - 1.4, 2.65 + k * 0.3, dp + 1.4, 2.95 + k * 0.3, 0.06, 0.4 - k * 0.2);
      RB('cedar', dp - 0.5, 0.5, dp + 0.5, 1.1, 0.66, 1.1); RB('cedar', dp - 0.5, 0.45, dp + 0.5, 0.58, 1.1, 2.1); RB('bronze', dp - 0.52, 0.43, dp + 0.52, 0.47, 1.9, 2.1); RB('cloth_red', dp - 0.45, 0.62, dp + 0.45, 1.05, 1.1, 1.14);   // the king's seat
      RB('timber', dp - 0.3, 1.5, dp + 0.3, 1.9, 0.66, 0.82);                                                                                     // the footstool
      RC(dp - 0.55, 0.4, dp + 0.55, 1.1, 2.1);
      for (const s of [-1, 1]) { RB(MP, s < 0 ? 0.3 : rw - 0.9, 3.8, s < 0 ? 0.9 : rw - 0.3, rd - 0.8, 0.06, 0.4); RC(s < 0 ? 0.3 : rw - 0.9, 3.8, s < 0 ? 0.9 : rw - 0.3, rd - 0.8, 0.4); RB('cloth_red', s < 0 ? 0.32 : rw - 0.88, 3.9, s < 0 ? 0.88 : rw - 0.32, rd - 0.9, 0.4, 0.42); }
      for (let k = 0; k < 2; k++) for (const s of [-1, 1]) { const p = rw / 2 + s * (rw * 0.22), q = 4.5 + k * 3.5; if (q < rd - 1) { RB(MP, p - 0.45, q - 0.45, p + 0.45, q + 0.45, 0.06, H - 0.3); RC(p - 0.45, q - 0.45, p + 0.45, q + 0.45, H - 0.3); } }
      for (const s of [-1, 1]) { const p = rw / 2 + s * 4.5; RL('bronze', [[0.001, 0.85], [0.3, 0.9], [0.34, 1.05], [0.3, 1.07], [0.001, 0.95]], p, 2.9, 0.06, 12); RB('flame', p - 0.1, 2.8, p + 0.1, 3.0, 1.1, 1.45); const a = toLocal(p, 2.9); lights.push({ at: LP(a[0], a[1], 1.9), color: '#ff9a4a', intensity: 5, distance: 11 }); }
    }
  }
}
