// The people of Fez about 1350 (docs/settlements/fez.md §8): scholars and students in the madrasa and the Qarawiyyin, merchants in the shops,
// tanners in the vats, muleteers and their donkeys in the funduq and the lanes, women in the white haik with the veil, water-carriers, cats.
import { RADIUS, SITES, SOUKS, siteY, ground0 } from './layout.js';
import { pits } from '../../styles/marinid/tannery.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function soukShops(s) {
  const [ax, az] = s.a, [bx, bz] = s.b, alongX = Math.abs(az - bz) < 0.1, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), u0 = alongX ? Math.min(ax, bx) : Math.min(az, bz), c = alongX ? az : ax, sw = 2.5, ns = Math.floor(L / sw), out = [];
  for (let i = 0; i < ns; i++) {
    const ua = u0 + i * sw + (L - ns * sw) / 2 + sw / 2;
    if (s.gaps?.some(([g0, g1]) => ua + sw / 2 > g0 && ua - sw / 2 < g1)) continue;
    const y = alongX ? ground0(ua, c) : ground0(c, ua);
    for (const side of [-1, 1]) out.push({ x: alongX ? ua : c + side * (s.w / 2 + s.depth - 1.2), z: alongX ? c + side * (s.w / 2 + s.depth - 1.2) : ua, y, face: alongX ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w'), dir: alongX ? (side < 0 ? 0 : Math.PI) : (side < 0 ? -Math.PI / 2 : Math.PI / 2) });
  }
  return out;
}
export function life() {
  const L = [], rand = rng(1350); let seed = 1350;
  const skinR = () => (rand() < 0.75 ? 'skin_medium' : rand() < 0.5 ? 'skin_light' : 'skin_dark');
  const P = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: (seed += 7919), skin: skinR(), dress: 'robe', pose: 'stand', ...o });
  const CL = ['cloth_white', 'cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
  // the djellaba, a hooded robe, and the turban of the scholar; the poor in a skullcap
  const man = (at, y, rot, o = {}) => P(at, y, rot, { cloth: CL[seed % CL.length], cloth2: 'cloth_white', over: seed % 3 ? 'cloak' : 'sash', hat: seed % 4 ? 'turban' : 'cap', hatMat: 'cloth_white', hair: 'short', beard: seed % 5 !== 0, ...o });
  const woman = (at, y, rot, o = {}) => P(at, y, rot, { cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.55, ...o });
  const b = SITES.bou, yb = siteY('bou') + 0.05, cx = (b[0] + b[2]) / 2, zN = b[1] + 8, cz0 = zN + 2.4, cz1 = b[3] - 10.3, zm = (cz0 + cz1) / 2;
  // the Bou Inania: students seated in the court's north gallery with books, a teacher on a mat before the east classroom, a man washing at the basin, a man at prayer in the hall
  for (let k = 0; k < 4; k++) man([cx - 6 + k * 1.1, zN + 1.2], yb, Math.PI, { pose: 'cross', cloth: 'cloth_white', hat: 'turban' });
  man([cx + 7.3, zN + 1.2], yb, Math.PI, { pose: 'cross', cloth: 'cloth_ochre' });
  man([b[2] - 9.9, zm + 0.7], yb, -Math.PI / 2, { pose: 'cross', cloth: 'cloth_brown', hat: 'turban' });
  for (let k = 0; k < 3; k++) man([b[2] - 8.2, zm - 1.0 + k * 1.1], yb, Math.PI / 2, { pose: 'cross' });
  man([cx - 3.4, zm - 0.7], yb, 1.2, { pose: 'squat', hat: 'cap' });
  man([cx + 2.2, b[3] - 3.6], yb, Math.PI, { pose: 'kneel', arms: 'pray', cloth: 'cloth_white' });
  man([cx - 1.0, cz0 + 2.0], yb, 0, { pose: 'talk' }); man([cx - 0.1, cz0 + 2.1], yb, Math.PI, { pose: 'talk', cloth: 'cloth_grey' });
  // the Qarawiyyin: circles of students round a master in the sahn's gallery, men at prayer in the hall
  const q = SITES.qar, yq = siteY('qar') + 0.05, qn = (q[2] - q[0]) / 14, sahnX = q[0] + qn * 4;
  for (let c = 0; c < 3; c++) { const x = sahnX + 5 + c * 9, z = q[1] + 3.5 + 1.4; man([x, z], yq, Math.PI, { pose: 'cross', hat: 'turban', cloth: 'cloth_white' }); for (let k = 0; k < 4; k++) man([x - 1.6 + k * 1.1, z + 1.5], yq, 0, { pose: 'cross' }); }
  for (let k = 0; k < 14; k++) { const x = q[0] + qn * (1 + (k % 13)) + qn / 2 - 0.4, z = q[3] - 5 - Math.floor(k / 7) * 1.6; man([x, z], yq, Math.PI, { pose: 'kneel', arms: 'pray' }); }
  for (let k = 0; k < 6; k++) man([q[0] + qn * (4.5 + k) + 0.3, q[1] + 30 + rand() * 14], yq, rand() * 6, { pose: 'cross', hat: 'turban' });
  man([q[0] + 6, -21], yq, 0); woman([q[0] - 8, -22], ground0(q[0] - 8, -22), 0);
  // the souks: a merchant in nearly every shop, seated cross-legged behind his goods; customers in the lane
  for (const s of SOUKS) for (const [i, sh] of soukShops(s).entries()) {
    if (rand() < 0.35) continue;
    const dir = sh.dir; man([sh.x, sh.z], sh.y + 0.55, dir, { pose: 'cross', cloth: CL[i % CL.length], hat: i % 3 ? 'turban' : 'cap' });
  }
  for (const s of SOUKS) {
    const [ax, az] = s.a, [bx, bz] = s.b, alongX = Math.abs(az - bz) < 0.1, L0 = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), u0 = alongX ? Math.min(ax, bx) : Math.min(az, bz), n = Math.floor(L0 / 9);
    for (let k = 0; k < n; k++) {
      const u = u0 + 4 + k * 9 + rand() * 4, c = (alongX ? az : ax) + (rand() - 0.5) * 1.4, at = alongX ? [u, c] : [c, u], y = alongX ? ground0(u, c) : ground0(c, u), rot = rand() * 6.28;
      if (k % 4 === 1) woman(at, y, rot, { carry: 'basket' }); else if (k % 4 === 2) { man(at, y, rot, { pose: 'talk' }); man([at[0] + 0.8, at[1] + 0.2], y, rot + 3.1, { pose: 'talk' }); } else man(at, y, rot);
    }
  }
  // the Place Seffarine: coppersmiths seated at their work before the shops, a donkey with copper
  { const sq = SITES.seffarine, ys = ground0(102, 39) + 0.05; for (let k = 0; k < 6; k++) man([sq[0] + 2.5 + rand() * (sq[2] - sq[0] - 5), sq[1] + 3 + rand() * (sq[3] - sq[1] - 6)], ys, rand() * 6.28, { pose: 'squat', cloth: 'cloth_brown', hat: 'cap' });
    L.push({ t: 'animal', kind: 'donkey', at: [sq[0] + 5, sq[3] - 5], y: ys, rot: 0.7, seed: 5 }); }
  // the funduq: muleteers, donkeys with their loads, bales and sacks about the court
  { const f = SITES.funduq, yf = siteY('funduq') + 0.05, fx = (f[0] + f[2]) / 2, fz = (f[1] + f[3]) / 2 - 2;
    for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'donkey', at: [f[0] + 9 + k * 3.6, fz - 4 + (k % 2) * 3], y: yf, rot: 1.6 + k, seed: 40 + k });
    for (let k = 0; k < 4; k++) man([fx - 4 + k * 2.4, fz + 3], yf, 1 + k, { dress: 'tunic', hat: 'cap', cloth: 'cloth_brown', legs: 'bare', carry: k % 2 ? 'basket' : undefined, pose: k === 3 ? 'squat' : 'stand' });
    L.push({ t: 'sacks', at: [fx + 7.5, fz + 4], y: yf, rot: 0.3, n: 4, seed: 3 }, { t: 'sacks', at: [f[0] + 8, fz + 5], y: yf, rot: 1.0, n: 3, seed: 4 }); }
  // the tannery: men standing waist-deep in the vats treading the hides, others carrying hides along the walks
  { const T = SITES.tannery, yt = siteY('tannery'), P2 = pits(T);
    for (const [i, p] of P2.entries()) if (i % 4 === 1 && p.liq !== 'limewash_white') P([p.x, p.z], yt + 0.53 - 0.95, rand() * 6.28, { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', pose: 'stand' });
    for (let k = 0; k < 8; k++) { const x = T[0] + 9 + rand() * 40, z = T[1] + 56 * 0 + 12 + rand() * 4; P([x, z], yt, rand() * 6.28, { dress: 'tunic', cloth: 'cloth_brown', hat: 'cap', hatMat: 'cloth_white', legs: 'bare', carry: 'basket' }); }
  }
  // the lanes: a water-carrier, women with baskets, a muleteer with his donkey in some of the longer lanes
  for (let k = 0; k < 40; k++) {
    const a = rand() * Math.PI * 2, r = 30 + rand() * 230, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9 - 20;
    if (Math.abs(z - -21) < 2 && x < 40) { if (rand() < 0.7) man([x, -21 + (rand() - 0.5) * 1.6], ground0(x, -21), rand() * 6.28); }
  }
  for (let k = 0; k < 26; k++) { const x = -280 + k * 8.2 + rand() * 3, z = -21 + (rand() - 0.5) * 1.8; if ((x > 40 && x < 130) || (x > -150 && x < -112)) continue; const y = ground0(x, z); if (k % 5 === 0) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y, rot: Math.PI / 2 + (rand() < 0.5 ? Math.PI : 0), seed: 60 + k }); man([x + 1.6, z + 0.3], y, 1.6, { dress: 'tunic', hat: 'cap', cloth: 'cloth_brown', legs: 'bare', hatMat: 'cloth_white' }); } else if (k % 3 === 0) woman([x, z], y, rand() * 6.28, { carry: k % 2 ? 'basket' : 'pot' }); else man([x, z], y, rand() * 6.28, { pose: k % 4 === 1 ? 'talk' : 'stand' }); }
  for (let k = 0; k < 10; k++) { const x = -200 + rand() * 330, z = -21 + (rand() - 0.5) * 1.4; L.push({ t: 'animal', kind: 'cat', at: [x, z + (rand() < 0.5 ? 1.3 : -1.3)], y: ground0(x, z), rot: rand() * 6.28, seed: 9 + k }); }
  return L;
}
export const lifePlan = () => ({ id: 'fez-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } });
