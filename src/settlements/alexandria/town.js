// The town of Alexandria (docs/settlements/alexandria.md §2, §5–§7): the harbour with its quays, bridges and ships; the Canopic
// Way with its colonnaded shops; the courtyard houses of the Greek and Jewish quarters and the mudbrick houses of Rhakotis; the
// Gymnasium, the agora's booths, a Greek craftsman's house, the prayer house, the Serapeum.
import { lodTiles } from '../lod.js';
import { frame } from '../../styles/greek/agora.js';
import { TRADES } from '../../styles/greek/shops.js';
import { streetPlans } from './streets.js';
import { houseRooms } from '../../styles/ptolemaic/house.js';
import { RADIUS, GROUND, SEA, QUAYS, CHANNELS, SHIPS, CANOPIC, QUAY, SOMA, AGORA, GYM, SEROUTE, HILL, JEWISH, OPEN_HOUSE, ROYAL, MOLE, PHAROS, ISLAND, inRect, wet, height, lots, isle } from './layout.js';

const base = (id, elements, extra = {}) => ({ id, style: 'ptolemaic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -86], facing: 'e' }, ...extra });
const g = GROUND;

function harbour() {
  const E = [];
  QUAYS.forEach((r, i) => E.push({ t: 'quay', rect: r, y0: SEA - 2.2, y1: g + 0.05, bollards: i < 2, side: 0.5 }));
  for (const c of CHANNELS) E.push({ t: 'mole_bridge', rect: c, y: g });
  for (const s of SHIPS) E.push({ t: 'ship', ...s, y: SEA });
  for (const x of [-128, -35, 114, 190, 298]) E.push({ t: 'quay_steps', at: [x, QUAYS[0][1]], w: 3, y: g + 0.05, yw: SEA });
  for (const x of [SOMA[0] - 3.5, SOMA[2] + 3.5]) E.push({ t: 'obelisk', at: [x, -85.6], y: g + 0.05, h: 11 });
  for (let x = -200; x < 420; x += 26) if (wet(x, -89) > 1 && ![-128, -35, 114, 190, 298].some((q) => Math.abs(q - x) < 6) && Math.abs(x - 61) > 22 && Math.abs(x - 80) > 6) E.push({ t: 'quay_lamp', at: [x + 0.7, QUAYS[0][1] + 2.8], y: g + 0.05 });
  for (let z = -245; z < -100; z += 32) E.push({ t: 'quay_lamp', at: [MOLE[0] + 1.2, z], y: g + 0.05 });
  E.push({ t: 'harbour_gate', c: [(SOMA[0] + SOMA[2]) / 2, -77], y: g, face: 'n', gw: 12, tower: 6, h: 13 });
  // the promenade and the great streets paved in slabs of limestone
  E.push({ t: 'floor', rect: [QUAY[0], QUAY[1], QUAY[2], QUAY[3]], y: g + 0.04, th: 0.2, mat: 'travertine' });
  E.push({ t: 'floor', rect: [-440, CANOPIC[1], 440, CANOPIC[3]], y: g + 0.04, th: 0.2, mat: 'travertine' });
  E.push({ t: 'floor', rect: [SOMA[0], -82, SOMA[2], 250], y: g + 0.045, th: 0.2, mat: 'travertine' });
  E.push({ t: 'floor', rect: [MOLE[0], -262, MOLE[2], -216], y: g + 0.04, th: 0.2, mat: 'sandstone_floor' });
  E.push({ t: 'floor', rect: [MOLE[0], -202, MOLE[2], -152], y: g + 0.04, th: 0.2, mat: 'sandstone_floor' });
  E.push({ t: 'floor', rect: [MOLE[0], -138, MOLE[2], -91], y: g + 0.04, th: 0.2, mat: 'sandstone_floor' });
  return base('alexandria-harbour', E);
}
/**
 * The shops of the Canopic Way: stoas with a row of workshops behind them, along both sides, each room fitted for its trade — in
 * full only near the crossing (the rest are fronts with the colonnade; their rooms are not furnished). Tiled by 100 m, near and far.
 */
function shopStoas() {
  const els = [], rooms = [];
  for (const north of [true, false]) {
    const z0 = north ? 46 : 82, z1 = north ? 58 : 94, front = north ? 's' : 'n';
    // the runs of the street's side between the great crossing and the open ground of the agora and the Gymnasium
    const spans = north ? [[-440, SOMA[0] - 4], [SOMA[2] + 4, 440]] : [[-440, SOMA[0] - 4], [GYM[2] + 72, 440]];
    for (const [a, b] of spans) {
      const n = Math.max(1, Math.round((b - a) / 50)), len = (b - a) / n;
      for (let i = 0; i < n; i++) {
        const x = a + i * len, x1 = x + len, cx = x + len / 2;
        if (wet(x + 3, z0) < 3 || wet(x1 - 3, z0) < 3 || Math.hypot(cx, z0) > RADIUS - 70) continue;
        const full = Math.abs(cx - 60) < 150;
        els.push({ t: 'stoa', rect: [x, z0, x1, z1], front, y: g, h: 4.4, d: 0.6, sp: 2.5, flutes: 0, simple: true, mat: 'limestone', wall: 'plaster_white', triglyphMat: 'egyptian_blue', ...(full ? { rooms: { n: 5, depth: 6, trades: TRADES } } : {}), seed: 40 + Math.round(x / 10) });
        if (full) {
          const F = frame([x, z0, x1, z1], front), wt = 0.7, rw = (len - 2 * wt) / 5;
          for (let r = 0; r < 5; r++) rooms.push({ id: `shop: ${TRADES[r]} ${rooms.length}`, rect: F.R(wt + r * rw + 0.3, 12 - 6 + 0.55, wt + (r + 1) * rw - 0.1, 12 - 0.8), y: g, kind: 'inner', market: false, _c: [cx, (z0 + z1) / 2] });
        }
      }
    }
  }
  const plans = lodTiles('alexandria-shops', 'ptolemaic', els, { R: RADIUS });
  for (const p of plans) if (p.id.endsWith('-far')) p.elements = p.elements.map((e) => ({ ...e, rooms: undefined }));
  for (const r of rooms) {
    const [cx, cz] = r._c, id = `alexandria-shops-${Math.floor(cx / 100)},${Math.floor(cz / 100)}`;
    delete r._c; plans.find((p) => p.id === id).rooms.push(r);
  }
  return plans;
}
function civic() {
  const E = [];
  E.push({ t: 'gymnasium', rect: GYM, front: 'n', y: g, seed: 9 });
  // the agora where the Canopic Way meets the street of the Soma: booths in two rows round a paved court, a herm and a fountain
  E.push({ t: 'floor', rect: AGORA, y: g + 0.04, th: 0.2, mat: 'sandstone_floor' });
  const kinds = ['pots', 'oil', 'fish', 'bread', 'bank', 'myrtle'];
  for (let i = 0; i < 6; i++) E.push({ t: 'booth', rect: [AGORA[0] + 4 + i * 8, AGORA[1] + 4, AGORA[0] + 4 + i * 8 + 5.5, AGORA[1] + 8.5], front: 's', kind: kinds[i], y: g + 0.04, seed: 70 + i });
  for (let i = 0; i < 5; i++) E.push({ t: 'booth', rect: [AGORA[0] + 8 + i * 8, AGORA[3] - 9, AGORA[0] + 8 + i * 8 + 5.5, AGORA[3] - 4.5], front: 'n', kind: kinds[(i + 2) % 6], y: g + 0.04, seed: 80 + i });
  E.push({ t: 'herm', at: [AGORA[0] + 26, (AGORA[1] + AGORA[3]) / 2], y: g + 0.04, rot: 0 });
  E.push({ t: 'simon_house', rect: OPEN_HOUSE, y: g, seed: 250 });
  // the prayer house of the Jewish quarter
  E.push({ t: 'proseuche', rect: [352, 112, 366, 123], front: 'n', y: g, seed: 5 });
  return base('alexandria-civic', E, { rooms: [
    { id: 'craftsman shop', rect: [OPEN_HOUSE[0] + 0.5, OPEN_HOUSE[1] + 0.5, OPEN_HOUSE[0] + 5, OPEN_HOUSE[1] + 5.3], y: g, kind: 'inner', market: false },
    { id: 'andron', rect: [OPEN_HOUSE[0] + 7.4, OPEN_HOUSE[1] + 0.5, OPEN_HOUSE[2] - 0.5, OPEN_HOUSE[1] + 5.3], y: g, kind: 'inner' },
    { id: 'prayer house', rect: [353, 117, 365, 122.5], y: g, kind: 'inner' }] });
}
function serapeum() {
  const [x0, z0, x1, z1] = SEROUTE.rect, y = SEROUTE.y, E = [], zc = (z0 + z1) / 2, th = 1.0;
  const W = (a, b, openings) => E.push({ t: 'wall', a, b, th, y0: y - 3, y1: y + 4.2, mat: 'limestone', openings });
  W([x0, z0], [x1, z0]); W([x0, z1], [x1, z1]); W([x0, z0], [x0, z1]);
  W([x1, z0], [x1, zc - 2.5]); W([x1, zc + 2.5], [x1, z1]);
  E.push({ t: 'pylon', c: [x1, zc], y, face: 'e', w: 5, h: 13, tower: 8 });
  E.push({ t: 'floor', rect: [x0 + 1, z0 + 1, x1 - 1, z1 - 1], y: y + 0.03, th: 0.2, mat: 'sandstone_floor' });
  E.push({ t: 'serapeum_temple', rect: [x0 + 14, zc - 20, x0 + 54, zc + 20], y: y + 0.03 });
  for (const s of [-1, 1]) for (const dx of [12, 22, 32, 42]) E.push({ t: 'sphinx', at: [x1 + dx, zc + s * 5.5], yaw: Math.PI / 2, y: (dx === 12 ? y : height(x1 + dx, zc + s * 5.5)) - 0.3, s: dx === 12 ? 1.1 : 0.9 });
  // the colonnades round the court (the daughter library in the south one), trees in the court, shrines before the wall
  const st = { y: y + 0.03, h: 4.6, d: 0.6, sp: 2.6, flutes: 0, simple: true, mat: 'limestone', wall: 'plaster_white', triglyphMat: 'egyptian_blue' };
  E.push({ t: 'stoa', rect: [x0 + 3, z0 + 1.2, x1 - 14, z0 + 8.5], front: 's', seed: 91, ...st });
  E.push({ t: 'stoa', rect: [x0 + 3, z1 - 8.5, x1 - 14, z1 - 1.2], front: 'n', seed: 92, ...st });
  for (const [dx, dz, k] of [[60, -22, 'palm'], [60, 22, 'palm'], [66, -12, 'fig'], [66, 12, 'fig'], [8, -14, 'palm'], [8, 14, 'palm']]) E.push({ t: 'ptol_tree', at: [x0 + dx, zc + dz], y: y + 0.03, kind: k, h: k === 'palm' ? 6.5 : 3.4, seed: dx + dz + 7 });
  for (const dz of [-30, 30]) E.push({ t: 'shrine', at: [x0 + 62, zc + dz], y: y + 0.03, rot: dz > 0 ? Math.PI : 0 });
  return base('alexandria-serapeum', E, { rooms: [{ id: 'cella of Serapis', rect: [x0 + 16, zc - 18, x0 + 48, zc + 18], y: y + 1.1, kind: 'hall', market: false }, { id: 'Serapeum court', rect: [x0 + 56, z0 + 10, x1 - 14, z1 - 10], y: y + 0.03, kind: 'open', market: false }, { id: 'north colonnade', rect: [x0 + 5, z0 + 3, x1 - 16, z0 + 7], y: y + 0.03, kind: 'inner', market: false }, { id: 'library of the Serapeum', rect: [x0 + 5, z1 - 7, x1 - 16, z1 - 3], y: y + 0.03, kind: 'inner', market: false }] });
}
/** The houses: courtyard houses (Greek and Jewish quarters) and the houses of Rhakotis, each with its rooms furnished; the nearest to the arrival with a lit lamp. */
function houses() {
  const L = lots(), ARR = [100, -86];
  const byD = [...L].sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - ARR[0], (a.rect[1] + a.rect[3]) / 2 - ARR[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - ARR[0], (b.rect[1] + b.rect[3]) / 2 - ARR[1]));
  const lamp = new Set(byD.slice(0, 10));
  const els = L.map((l) => (l.warehouse ? { t: 'horreum', rect: l.rect, front: 'n', y: l.y, seed: l.seed, tint: ['plaster_white', 'limewash_yellow', 'plaster_ochre'][l.seed % 3] } : l.quarter === 'egyptian'
    ? { t: 'egyptian_house', rect: l.rect, seed: l.seed, y: l.y, front: l.front }
    : { t: 'ptol_house', rect: l.rect, seed: l.seed, y: l.y, front: l.front, quarter: l.quarter, lamp: lamp.has(l) }));
  const plans = lodTiles('alexandria-houses', 'ptolemaic', els, { R: RADIUS, near: 150 });
  for (const e of els) {
    if (e.t !== 'ptol_house') continue;
    const [x, z] = [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2], id = `alexandria-houses-${Math.floor(x / 100)},${Math.floor(z / 100)}`;
    plans.find((p) => p.id === id).rooms.push(...houseRooms(e, e.y));
  }
  return plans;
}
/** The village on the island of Pharos under the tower: houses of the fishermen and the keepers along the quay, the fuel store, the quay's paving. */
function isleTown() {
  const I = isle(), E = [];
  E.push({ t: 'floor', rect: [-228, -259, 44, -251.2], y: g + 0.04, th: 0.2, mat: 'sandstone_floor' });
  for (const h of I.houses) E.push({ t: 'egyptian_house', rect: h.rect, seed: h.seed, y: h.y, front: 's' });
  E.push({ t: 'horreum', rect: I.store, front: 's', y: g, seed: 61 });
  // one plan, built simple (walls and roofs; no house here is entered): the island's fronts at a fraction of the meshes
  return [base('alexandria-isle', E.map((e) => (e.t === 'egyptian_house' || e.t === 'horreum' ? { ...e, simple: true } : e)))];
}
export async function town() {
  const plans = [harbour(), ...isleTown(), ...shopStoas(), civic(), serapeum(), ...houses(), ...streetPlans()];
  void HILL; void JEWISH; void ISLAND; void PHAROS;
  return plans;
}
