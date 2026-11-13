// Ming–Qing Beijing — the rooms of the outer court that are walked into (docs/settlements/qing-beijing.md §31): the waiting rooms
// and duty rooms (chaofang, zhifang) in a row along the south end of the great courtyard, and the two storehouses, the pavilions
// facing each other across it (Hongyi in the west, Tiren in the east). Each is furnished inside its shell in the manner of
// interiors.js (the room's own frame: a across, b from the back wall to the front); one lamp each. Elements of style `life`.
import { box, lathe } from '../../core/geom.js';
import { Parts, limb } from '../../styles/qing/carving.js';
import { table, chair, bench, cabinet, kang, stool, frame } from './interiors.js';

const RED = 'lacquer_red', W = 'wood_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const SILK = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_green', 'cloth_maroon'];

/** el: { rect, front, y, H, seed, kind: 'duty' | 'wait' | 'silk' | 'silver' } */
export function bjPalaceRoom(el, { bag, col, lights }) {
  const F = frame(el.rect, el.front ?? 'n'), y = el.y, S = new Parts(), rand = rng(el.seed || 7), m = 0.55, Wd = F.Wd, Dp = F.Dp, H = el.H ?? 3.6;
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const u0 = -Wd / 2 + m, u1 = Wd / 2 - m;
  const lantern = (a, b) => { const Q = new Parts(); Q.add('timber', limb([0, H - 0.9, 0], [0, H - 0.4, 0], 0.006, 0.006, 3)); Q.add('lamp_paper', lathe([[0.001, 0], [0.16, 0.05], [0.2, 0.2], [0.16, 0.36], [0.001, 0.4]], 10, null, 0, H - 1.3, 0)); put(Q, a, b); };
  const kind = el.kind;
  if (kind === 'duty') {
    // the guards' and clerks' room: the kang across the back with its table, a desk and two chairs, a cabinet, a brazier, a bench along the side, a rack of staves
    { const Q = new Parts(), kw = Math.min(Wd - 2.0, 3.2); kang(Q, kw, 1.75, true); put(Q, u1 - kw / 2, m + 0.95); blk(u1 - kw, m + 0.1, u1, m + 1.85, 0.6); }
    { const Q = new Parts(); table(Q, 1.3, 0.62, 0.78); Q.add('slate', box(-0.5, 0.78, -0.1, -0.3, 0.81, 0.1)); for (let i = 0; i < 3; i++) Q.add(['cloth_white', 'cloth_indigo', 'cloth_brown'][i], box(0.15 + i * 0.1, 0.78, -0.12, 0.23 + i * 0.1, 0.78 + 0.16, 0.12)); put(Q, u0 + 1.2, Dp * 0.55); blk(u0 + 0.5, Dp * 0.55 - 0.4, u0 + 1.9, Dp * 0.55 + 0.4, 0.8); }
    for (const dz of [-0.75, 0.75]) { const C = new Parts(); chair(C); put(C, u0 + 1.2, Dp * 0.55 + dz + (dz > 0 ? 0.25 : -0.25), dz > 0 ? Math.PI : 0); }
    { const Q = new Parts(); cabinet(Q, 1.1, 1.9, 0.45); put(Q, u0 + 0.9, m + 0.3, Math.PI); blk(u0 + 0.35, m, u0 + 1.45, m + 0.55, 1.9); }
    { const Q = new Parts(); Q.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.22, 0.22], [0.001, 0.22]], 12)); Q.add('flame', lathe([[0.001, 0.2], [0.17, 0.2], [0.001, 0.21]], 10)); put(Q, 0, Dp * 0.5, 0, 0.35); const T3 = new Parts(); T3.add('iron', box(-0.2, 0, -0.2, 0.2, 0.35, 0.2)); put(T3, 0, Dp * 0.5); blk(-0.25, Dp * 0.5 - 0.25, 0.25, Dp * 0.5 + 0.25, 0.4); }
    { const Q = new Parts(); bench(Q, 1.6); put(Q, u1 - 1.4, Dp - m - 0.4); blk(u1 - 2.2, Dp - m - 0.6, u1 - 0.6, Dp - m - 0.2, 0.5); }
    for (let i = 0; i < 4; i++) { const Q = new Parts(); Q.add('timber', limb([0, 0, 0], [0.1, 2.0, 0], 0.025, 0.02, 5)); Q.add('iron', box(0.04, 2.0, -0.03, 0.14, 2.28, 0.03)); put(Q, u0 + 0.25 + i * 0.22, Dp - m - 0.15); }
    lantern(-Wd / 4, Dp * 0.4); lantern(Wd / 4, Dp * 0.7);
  } else if (kind === 'wait') {
    // the waiting room of the officials who come before dawn to the audience: benches along both side walls, small tables with tea, a screen at the back, a stool by the door
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const Q = new Parts(); bench(Q, 1.5, 0.48); put(Q, s * (Wd / 2 - m - 0.3), 2.0 + i * 2.0 + (s > 0 ? 0.5 : 0), s * Math.PI / 2 - Math.PI / 2 + (s > 0 ? Math.PI : 0)); blk(s * (Wd / 2 - m - 0.3) - 0.2, 1.2 + i * 2.0 + (s > 0 ? 0.5 : 0), s * (Wd / 2 - m - 0.3) + 0.2, 2.8 + i * 2.0 + (s > 0 ? 0.5 : 0), 0.5); }
    for (let i = 0; i < 2; i++) { const Q = new Parts(); table(Q, 0.7, 0.5, 0.74, W, true); Q.add('glaze_white', lathe([[0.001, 0], [0.08, 0.01], [0.09, 0.12], [0.06, 0.16], [0.001, 0.16]], 8, null, 0.05, 0.74, 0)); Q.add('glaze_white', lathe([[0.001, 0], [0.04, 0], [0.055, 0.06], [0.001, 0.06]], 8, null, -0.15, 0.74, 0.1)); put(Q, i ? 0.8 : -0.8, 3.0 + i); blk(i ? 0.4 : -1.2, 2.7 + i, i ? 1.2 : -0.4, 3.3 + i, 0.78); }
    { const Q = new Parts(), sw = Math.min(Wd - 2.4, 3.6); for (let k = 0; k < 4; k++) { Q.add(W, box(-sw / 2 + k * sw / 4, 0.1, -0.03, -sw / 2 + (k + 1) * sw / 4 - 0.03, 1.9, 0.03)); Q.add(['cloth_ochre', 'cloth_white', 'cloth_ochre', 'cloth_white'][k], box(-sw / 2 + k * sw / 4 + 0.05, 0.25, -0.035, -sw / 2 + (k + 1) * sw / 4 - 0.08, 1.75, -0.03)); } put(Q, 0, m + 0.5, Math.PI); blk(-sw / 2, m + 0.4, sw / 2, m + 0.6, 1.9); }
    { const Q = new Parts(); Q.add('brick_grey', box(-0.35, 0, -0.35, 0.35, 0.8, 0.35)); Q.add('bronze', lathe([[0.001, 0], [0.17, 0], [0.2, 0.2], [0.14, 0.38], [0.07, 0.46], [0.001, 0.46]], 12, null, 0, 0.8, 0)); put(Q, u1 - 0.8, m + 0.8); blk(u1 - 1.15, m + 0.45, u1 - 0.45, m + 1.15, 0.9); }
    lantern(-Wd / 4, Dp * 0.5); lantern(Wd / 4, Dp * 0.5);
  } else {
    // a storehouse of the household: racks in three tiers along both side walls and the back with the goods in bolts or ingots, chests in rows in the middle, the keeper's table with the balance and the ledger
    const silver = kind === 'silver', n = Math.max(3, Math.floor((Dp - 2 * m - 2.4) / 0.9));
    for (const s of [-1, 1]) for (let t = 0; t < 3; t++) {
      const Q = new Parts(), len = Dp - 2 * m - 3.2;
      Q.add(W, box(-0.3, 0.4 + t * 0.7, 0, 0.3, 0.44 + t * 0.7, len));
      for (const e of [0, len]) Q.add(W, box(-0.3, 0, e - 0.03, 0.3, 1.9, e + 0.03));
      for (let i = 0; i < n; i++) {
        const b = 0.25 + i * (len - 0.5) / Math.max(1, n - 1);
        if (silver) { Q.add('silver', box(-0.2, 0.44 + t * 0.7, b - 0.12, 0.2, 0.44 + t * 0.7 + 0.1, b + 0.12)); if (i % 2 === 0) Q.add('gold', box(-0.12, 0.54 + t * 0.7, b - 0.08, 0.12, 0.54 + t * 0.7 + 0.07, b + 0.08)); }
        else Q.add(SILK[(i + t * 2 + (s > 0 ? 1 : 0)) % SILK.length], box(-0.22, 0.44 + t * 0.7, b - 0.15, 0.22, 0.44 + t * 0.7 + 0.28, b + 0.15));
      }
      put(Q, s * (Wd / 2 - m - 0.35), m + 1.6, 0, 0); blk(s * (Wd / 2 - m - 0.35) - 0.35, m + 1.6, s * (Wd / 2 - m - 0.35) + 0.35, m + 1.6 + len, 0.5 + t * 0.7);
    }
    for (let i = 0; i < 4; i++) { const Q = new Parts(); Q.add(silver ? 'iron' : RED, box(-0.55, 0, -0.32, 0.55, 0.62, 0.32)); Q.add('gilt_bronze', box(-0.08, 0.38, -0.33, 0.08, 0.5, -0.32)); Q.add('iron', box(-0.56, 0.1, -0.33, 0.56, 0.16, 0.33)); put(Q, (i % 2 ? 1 : -1) * 0.9, Dp * 0.5 + (i < 2 ? 0 : 1.3)); blk((i % 2 ? 1 : -1) * 0.9 - 0.6, Dp * 0.5 + (i < 2 ? 0 : 1.3) - 0.35, (i % 2 ? 1 : -1) * 0.9 + 0.6, Dp * 0.5 + (i < 2 ? 0 : 1.3) + 0.35, 0.65); }
    { const Q = new Parts(); table(Q, 1.5, 0.7, 0.9); Q.add('bronze', box(-0.3, 0.9, -0.02, 0.3, 0.93, 0.02)); for (const s of [-1, 1]) Q.add('bronze', box(s * 0.3 - 0.07, 0.86, -0.07, s * 0.3 + 0.07, 0.9, 0.07)); Q.add('cloth_white', box(0.4, 0.9, -0.15, 0.7, 0.93, 0.15)); put(Q, 0, m + 0.7, Math.PI); blk(-0.8, m + 0.3, 0.8, m + 1.1, 0.95); }
    { const C = new Parts(); chair(C); put(C, 0, m + 1.45); }
    lantern(-Wd / 4, Dp * 0.5); lantern(Wd / 4, Dp * 0.5);
  }
  S.emit(bag, F.origin[0], y + 0.04, F.origin[1], F.yaw);
  // the lamp: one light in the room
  const c = F.WC(0, Dp * 0.5); lights?.push({ at: [c[0], y + H - 1.1, c[1]], color: '#ffb46b', intensity: 3, distance: 9 });
  void rand; void stool;
}

// ── where they stand (the great courtyard's south end and its two pavilions) and who is in them ──
const FIG = { dress: 'robe', cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash' };
/** The eight rooms along the south end of the great courtyard, four each side of the gate's passage: { rect, front 'n', kind }. */
export const COURT_ROOMS = [
  ...[[-105, -93.5, 'duty'], [-92.5, -81, 'wait'], [-64.5, -54, 'wait'], [-53, -42, 'duty'], [42, 53, 'wait'], [54, 64.5, 'duty'], [81, 92.5, 'duty'], [93.5, 105, 'wait']]
    .map(([a, b, kind]) => ({ rect: [a, 105.6, b, 113.4], front: 'n', kind })),
];
/** The pavilions' storerooms (the shells are in plan.js): the west Hongyi, the east Tiren. */
export const PAVILION_ROOMS = [{ rect: [-108, 46, -88, 64], front: 'e', kind: 'silver', y: 1.2, H: 6 }, { rect: [88, 46, 108, 64], front: 'w', kind: 'silk', y: 1.2, H: 6 }];
/** Figures in the rooms (world positions from each room's frame); a few in each, none within reach of the doors. */
export function palaceRoomFigures() {
  const out = [], rand = rng(311);
  const cl = ['cloth_indigo', 'cloth_ochre', 'cloth_brown', 'cloth_maroon'];
  const add = (r, y, a, b, { up = 0, rot = 0, ...extra }) => { const F = frame(r.rect, r.front), p = F.WC(a, b); out.push({ t: 'figure', at: p, y: y + 0.04 + up, rot: F.yaw + rot, seed: Math.floor(rand() * 1e9), ...FIG, cloth: cl[Math.floor(rand() * cl.length)], ...extra }); };
  COURT_ROOMS.forEach((r, i) => {
    const Wd = r.rect[2] - r.rect[0], Dp = r.rect[3] - r.rect[1], u1 = Wd / 2 - 0.55;
    if (r.kind === 'duty') {
      add(r, 0.3, u1 - 1.6, 0.55 + 0.95, { pose: 'sit', up: 0.55, cloth: 'cloth_red', cloth2: 'cloth_black', hat: 'cap', rot: Math.PI });           // on the kang
      if (i % 2) add(r, 0.3, -Wd / 2 + 1.7, Dp * 0.55, { pose: 'sit', cloth: 'cloth_blue', rot: -Math.PI / 2 });
    } else {
      add(r, 0.3, -(Wd / 2 - 0.85), 3.2, { pose: 'sit', cloth: i % 2 ? 'cloth_indigo' : 'cloth_blue', rot: Math.PI / 2 });
      add(r, 0.3, Wd / 2 - 0.85, 5.2, { pose: 'sit', cloth: 'cloth_green', rot: -Math.PI / 2 });
    }
  });
  for (const r of PAVILION_ROOMS) add(r, r.y, 0, 0.55 + 0.7 + 0.5, { pose: 'sit', cloth: 'cloth_ochre', rot: Math.PI });
  return out;
}
