// The furnished interiors (dossier §11): the Hu wine shop of the West Market, with its earthen counter, the dais, the tables with
// folding stools, the round carpet where the Hu girl whirls, a lute player and a drummer, the patrons — walkable from the lane; the
// hall of an official's house near the avenue, with its dais, screen and zither — walkable from its court; the temple's halls are
// the plan's. The rooms give the music its zones.
import { YAW, rng } from '../../styles/tang/kit.js';
import { lots, WINE, DACI_AX, DACI_MAIN, OFFICE, DACI_QUARTERS } from './layout.js';

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const ext = (rect, f) => { const w = rect[2] - rect[0], d = rect[3] - rect[1]; return f === 'n' || f === 's' ? [w, d] : [d, w]; };
const frameOf = (c, front) => { const yaw = YAW[front], cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw)); return { P: ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs], D: ([x, z]) => [x * cs + z * sn, -x * sn + z * cs] }; };
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

let FL = null;
/** The furnished house: the mansion nearest the avenue's crossing with full detail. */
export function furnishedLot() {
  if (FL) return FL;
  const c = lots().filter((l) => l.kind === 'mansion' && l.det === 2).sort((a, b) => Math.hypot(...mid(a.rect)) - Math.hypot(...mid(b.rect)));
  return (FL = c[0] || null);
}
const WH = { plat: 0.3 };
/** The hall of the furnished house: its centre in the lot's frame and its size (as tangHouse builds it). */
function houseHall(l) {
  const [W, D] = ext(l.rect, l.front), hw = Math.min(W - 5.5, 17.5), hd = 7.4;
  return { W, D, hw, hd, hz: -D / 2 + hd / 2 + 2.0, plat: 0.55 };
}
/** Elements (style tang) of the wine shop: its hall (open front), its furniture, the pole and flag, the jars before it. */
export function interiorElements() {
  const f = WINE.foot, c = mid(f), { w, d, nb } = WINE.hall, E = [];
  E.push({ t: 'tang_hall', c, w, d, face: 's', y: 0, plat: WH.plat, H: 3.8, nb, kind: 'open', roof: 'hip', over: 1.7, bh: 1.0, interior: true, det: 2, chi: 1.1 });
  E.push({ t: 'tang_interior', c, face: 's', w, d, y: WH.plat, kind: 'wine', seed: 5 });
  const px = f[0] + 1.2, pz = f[3] + 1.9;
  E.push({ t: 'block', rect: [px - 0.06, pz - 0.06, px + 0.06, pz + 0.06], y0: 0, y1: 5.6, mat: 'bamboo_culm' });
  E.push({ t: 'block', rect: [px + 0.06, pz - 0.02, px + 0.9, pz + 0.02], y0: 3.9, y1: 5.4, mat: 'cloth_ochre', collide: false });
  E.push({ t: 'tang_jars', at: [f[0] + 4, f[3] + 1.8], n: 5, y: 0, dir: [1, 0], seed: 4 });
  // Daci'en's ordinary buildings: each a hall of its own frame with its furnished room (tang style interior.js)
  for (const q of DACI_QUARTERS) {
    E.push({ t: 'tang_hall', c: q.c, w: q.w, d: q.d, face: q.face, y: 0, plat: q.plat, H: q.H, nb: q.nb, kind: 'hall', roof: q.roof, over: 1.8, bh: 1.0, doorW: q.w > 12 ? 2.6 : 2.2, interior: true, det: 2, chi: q.chi, pal: q.pal });
    E.push({ t: 'tang_interior', c: q.c, face: q.face, w: q.w, d: q.d, y: q.plat, kind: q.kind, seed: q.c[0] | 0 });
  }
  return E;
}
/** The rooms (music zones): the wine shop (with the apron before it) and the furnished house's hall. */
export function interiorRooms() {
  const f = WINE.foot, out = [{ id: 'hu-wine-shop', rect: [f[0], f[1], f[2], f[3] + 2.5], y: WH.plat, kind: 'tavern' }];
  const l = furnishedLot();
  if (l) { const h = houseHall(l), fr = frameOf(mid(l.rect), l.front), a = fr.P([-h.hw / 2, h.hz - h.hd / 2]), b = fr.P([h.hw / 2, h.hz + h.hd / 2 + 1.5]); out.push({ id: 'official-hall', rect: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y: h.plat, kind: 'house' }); }
  for (const q of DACI_QUARTERS) { const al = q.face === 'e' || q.face === 'w'; out.push({ id: 'daci-' + q.id, rect: [q.c[0] - (al ? q.d : q.w) / 2, q.c[1] - (al ? q.w : q.d) / 2, q.c[0] + (al ? q.d : q.w) / 2, q.c[1] + (al ? q.w : q.d) / 2], y: q.plat, kind: q.kind === 'refectory' || q.kind === 'library' ? 'hall' : 'house' }); }
  return out;
}
/** The people of the interiors (style life). */
export function interiorLife() {
  const out = [], rand = rng(752), f = WINE.foot, c = mid(f), { w, d } = WINE.hall, hx = w / 2 - 0.4, bz = -d / 2 + 0.4, y = WH.plat;
  const fr = frameOf(c, 's'), pt = ([x, z]) => fr.P([x, z]);
  const person = (at, yy, toward, o = {}) => { const p = pt(at), q = pt(toward); out.push({ t: 'figure', at: p, y: yy, rot: face([q[0] - p[0], q[1] - p[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', ...o }); };
  const hu = { dress: 'robe', over: 'sash', skin: 'skin_medium', hat: 'brim', hair: 'short', beard: true };
  // the dancer on the carpet, whirling; the lute player and the drummer on the dais's edge; a flute
  person([-0.2, bz + 4.4], y + 0.07, [-0.2, bz + 8], { pose: 'folk', dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hair: 'bun', skin: 'skin_light', h: 1.6 });
  person([-hx + 1.5, bz + 2.0], y + 0.36, [-0.2, bz + 4.4], { pose: 'lute', dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', ...hu });
  person([-hx + 2.6, bz + 1.9], y + 0.36, [-0.2, bz + 4.4], { pose: 'drum', cloth: 'cloth_ochre', ...hu, beard: false });
  person([-hx + 3.6, bz + 2.0], y + 0.36, [-0.2, bz + 4.4], { pose: 'flute', cloth: 'cloth_green', hat: 'cap', hair: 'topknot' });
  // guests on the dais at the low tables, and on stools at the tables on the right
  person([-hx + 2.3, bz + 3.2], y + 0.36, [-hx + 2.3, bz + 4.1], { pose: 'cross', cloth: 'cloth_brown', hat: 'cap', hair: 'topknot' });
  person([-hx + 2.3, bz + 5.0], y + 0.36, [-hx + 2.3, bz + 4.1], { pose: 'cross', cloth: 'cloth_maroon', ...hu });
  for (const [x, z, s] of [[hx - 1.6, bz + 3.4, 0], [hx - 1.6, bz + 5.6, 1], [hx - 4.2, bz + 5.0, 2]]) {
    person([x - 0.85, z], y, [x, z], { pose: 'sit', cloth: ['cloth_blue', 'cloth_brown', 'cloth_green'][s], ...(s === 1 ? hu : { hat: 'cap', hair: 'topknot' }) });
    if (s !== 2) person([x + 0.85, z], y, [x, z], { pose: 'sit', cloth: 'cloth_white', ...hu, hat: 'turban', skin: 'skin_dark' });
  }
  // the Hu girl at the counter
  person([hx - 2.2, bz + 1.7], y, [hx - 2.2, bz + 5], { pose: 'stand', cloth: 'cloth_green', cloth2: 'cloth_red', hair: 'bun', skin: 'skin_light' });
  person([hx - 0.9, bz + 1.7], y, [hx - 0.9, bz + 5], { pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_indigo', hair: 'short', hat: 'cap', beard: true });
  // the house: the master on the dais, a servant, a lady with the zither, a guest on the hu chuang
  const l = furnishedLot();
  if (l) {
    const h = houseHall(l), fr2 = frameOf(mid(l.rect), l.front), Hp = ([x, z]) => fr2.P([x, h.hz + z]), bz2 = -h.hd / 2 + 0.4, yy = h.plat + 0.34 + 0.03;
    const per = (at, y2, toward, o = {}) => { const p = Hp(at), q = Hp(toward); out.push({ t: 'figure', at: p, y: y2, rot: face([q[0] - p[0], q[1] - p[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', ...o }); };
    per([0, bz2 + 1.35], yy, [0, 5], { pose: 'cross', cloth: 'cloth_maroon', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_black', hair: 'topknot', beard: true });
    per([2.3, bz2 + 3.5], yy, [0, 0], { pose: 'harp', cloth: 'cloth_green', cloth2: 'cloth_red', hair: 'bun', skin: 'skin_light' });
    per([1.6, 0.9], h.plat, [0, bz2], { pose: 'sit', cloth: 'cloth_indigo', hat: 'cap', hair: 'topknot' });
    per([-1.5, 2.3], h.plat, [0, bz2], { pose: 'stand', cloth: 'cloth_grey', hair: 'topknot' });
  }
  // the translation hall of Daci'en: the monks at their desks, the master (Xuanzang) at the middle, a scribe standing with a scroll
  { const tc = [DACI_AX + 52, DACI_MAIN[1]], tw = 22, td = 9.6, ty = 0.7, fr3 = frameOf(tc, 'w'), z0 = -td / 2 + 0.3, hx3 = tw / 2 - 0.45, n = Math.max(4, Math.floor((tw - 4) / 2.4));
    const per = (at, y2, toward, o = {}) => { const p = fr3.P(at), q = fr3.P(toward); out.push({ t: 'figure', at: p, y: y2, rot: face([q[0] - p[0], q[1] - p[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', hair: 'shaven', over: 'shawl', ...o }); };
    for (let k = 0; k < n; k++) { const x = -hx3 + 2.0 + k * ((2 * hx3 - 4.0) / (n - 1)); if (Math.abs(x) < 0.4 || rand() < 0.15) continue; per([x, z0 + 2.9], ty + 0.25, [x, z0 + 2.2], { pose: 'cross', cloth: ['cloth_ochre', 'cloth_grey', 'cloth_brown'][k % 3], cloth2: 'cloth_maroon' }); }
    per([0, z0 + 2.75], ty + 0.45, [0, z0 + 2.0], { pose: 'cross', cloth: 'cloth_ochre', cloth2: 'cloth_maroon', beard: false });
    per([3.4, 1.0], ty, [0, z0 + 2], { pose: 'stand', cloth: 'cloth_grey', cloth2: 'cloth_ochre' }); }
  // the market office: the director (shi) on his dais, clerks at the side, a merchant with his weights waiting
  { const oc = [(OFFICE[0] + OFFICE[2]) / 2, OFFICE[1] + 17], fr4 = frameOf(oc, 's'), bz4 = -9 / 2 + 0.4, y4 = 0.7;
    const per = (at, y2, toward, o = {}) => { const p = fr4.P(at), q = fr4.P(toward); out.push({ t: 'figure', at: p, y: y2, rot: face([q[0] - p[0], q[1] - p[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'cap', hatMat: 'cloth_black', hair: 'topknot', ...o }); };
    per([0, bz4 + 1.35], y4 + 0.37, [0, 5], { pose: 'cross', cloth: 'cloth_maroon', cloth2: 'cloth_white', over: 'sash', beard: true });
    per([-7.5, 0.4], y4, [0, bz4], { pose: 'stand', cloth: 'cloth_green', cloth2: 'cloth_white', over: 'sash' }); per([7.4, 0.8], y4, [0, bz4], { pose: 'stand', cloth: 'cloth_green', cloth2: 'cloth_white', over: 'sash', beard: true });
    per([2.5, 2.4], y4, [0, bz4], { pose: 'stand', cloth: 'cloth_indigo', cloth2: 'cloth_white', over: 'belt', hat: 'brim', skin: 'skin_medium', beard: true, hair: 'short' }); }
  // Daci'en's ordinary buildings: monks at their meal and work, the cook at the stove, a reader in the library, the steward in the storehouse
  for (const q of DACI_QUARTERS) {
    const fr = frameOf(q.c, q.face), bz = -q.d / 2 + 0.35, hx = q.w / 2 - 0.5, y = q.plat;
    const per = (at, y2, toward, o = {}) => { const p = fr.P(at), t = fr.P(toward); out.push({ t: 'figure', at: p, y: y2, rot: face([t[0] - p[0], t[1] - p[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', hair: 'shaven', over: 'shawl', cloth: ['cloth_ochre', 'cloth_grey', 'cloth_brown'][Math.floor(rand() * 3)], cloth2: 'cloth_maroon', ...o }); };
    if (q.kind === 'refectory') {
      per([0, bz + 1.1], y + 0.3, [0, 5], { pose: 'cross', cloth: 'cloth_ochre' });
      for (const sx of [-1, 1]) for (const [z, k] of [[bz + 3.2, 0], [bz + 5.4, 1]]) for (let i = 0; i < 4; i++) { if (rand() < 0.25) continue; const x = sx * (hx - 3.6) - 3.0 + 0.6 + i * 1.1 + (i > 1 ? 1.1 : 0); per([x, z + (k ? 0.75 : -0.75)], y, [x, z], { pose: 'cross' }); }
    } else if (q.kind === 'kitchen') {
      per([-hx / 2 - 0.4, bz + 2.0], y, [-hx / 2 - 0.4, bz], { pose: 'stand', cloth: 'cloth_brown', hair: 'topknot', over: 'belt' });
      per([hx - 2.2, 2.1], y, [hx - 2.2, 1.0], { pose: 'stand', cloth: 'cloth_grey' });
    } else if (q.kind === 'library') {
      per([0.7, bz + 2.0], y, [0, bz + 1.2], { pose: 'sit', cloth: 'cloth_ochre' });
      per([-3.4, bz + 2.5], y, [-2.6, bz + 2.5], { pose: 'stand', cloth: 'cloth_grey' });
    } else if (q.kind === 'cell') {
      per([0, bz + 1.15], y + 0.07, [0, bz], { pose: 'cross', cloth: 'cloth_grey' });
    } else if (q.kind === 'guest') {
      per([0, bz + 1.75], y + 0.3, [0, bz + 1.2], { pose: 'cross', cloth: 'cloth_maroon', hair: 'topknot', hat: 'cap', hatMat: 'cloth_black', beard: true });
    } else if (q.kind === 'store') {
      per([0, 2.3], y, [0, 0.9], { pose: 'stand', cloth: 'cloth_brown', hair: 'topknot', over: 'belt' });
    }
  }
  return out;
}
