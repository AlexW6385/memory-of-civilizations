// The town of Athens (docs/settlements/athens.md §5): courtyard houses in blocks round the hills.
import { RADIUS, lots, pathAt, WAY, RAMP, inRect, SLOPE, AGORA } from './layout.js';
import { SIMON, lifePlan } from './life.js';
import { WORKSHOPS, FOUNTAIN, ACADEMY, PALAESTRA, XYSTOS, PARADROMIS, GATE, ALTAR_PROMETHEUS, HEROON, EXEDRA, ACADEMY_PATHS } from './quarters.js';
// the houses along the ways, round the Agora and below the theatre are seen close: their herms, altars and wells
const near = ([x0, z0, x1, z1]) => { const x = (x0 + x1) / 2, z = (z0 + z1) / 2; return pathAt(x, z, WAY)[0] < 40 || pathAt(x, z, RAMP)[0] < 40 || inRect(SLOPE, x, z, 30) || inRect(AGORA, x, z, 40); };
const base = (id, elements) => ({ id, style: 'greek', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-300, 70], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`athens-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'greek_house', simple: true, near: near(l.rect), ...l }))));
  // the house and shop by the south-west corner of the Agora that the finds name Simon the shoemaker's (§5b), walked into
  plans.push({ ...base('athens-simon', [{ t: 'simon_house', rect: SIMON, y: 0, seed: 410 }]), rooms: [
    { id: 'shoemaker shop', rect: [SIMON[0] + 0.5, SIMON[1] + 0.5, SIMON[0] + 5, SIMON[1] + 5.3], y: 0, kind: 'inner', market: false },
    { id: 'andron', rect: [SIMON[0] + 7.4, SIMON[1] + 0.5, SIMON[2] - 0.5, SIMON[1] + 5.3], y: 0, kind: 'inner' }] });
  // the potters' quarter of the Kerameikos (§11a): workshops in two rows on a lane, each walked into
  plans.push({ ...base('athens-kerameikos', WORKSHOPS.map((w, i) => ({ t: 'potter_works', ...w, y: 0, firing: i % 4 === 1 }))), rooms: WORKSHOPS.map((w, i) => {
    const [x0, z0, x1, z1] = w.rect, n = w.front === 'n';
    return { id: `workshop ${i + 1}`, rect: n ? [x0 + 0.5, z0 + 0.5, x0 + 9.6, z0 + 5.3] : [x0 + 0.5, z1 - 5.3, x0 + 9.6, z1 - 0.5], y: 0, kind: 'inner', market: false };
  }) });
  plans.push(base('athens-fountain', [{ t: 'fountain_house', rect: FOUNTAIN, front: 'n', y: 0.1 }]));
  // the Academy (§11c): the grove's precinct and its sanctuaries, the palaestra, the covered track
  plans.push({ ...base('athens-academy', [
    { t: 'academy_grounds', rect: ACADEMY, y: 0, gate: GATE, altar: ALTAR_PROMETHEUS, heroon: HEROON, exedra: EXEDRA, paths: ACADEMY_PATHS },
    { t: 'gymnasium', rect: PALAESTRA, front: 's', y: 0, seed: 7 },
    { t: 'stoa', rect: XYSTOS, front: 'n', y: 0, h: 3.4, d: 0.5, sp: 1.9, flutes: 0, mat: 'limestone', wall: 'mud_plaster', arch: 0.4, frieze: 0.4, geison: 0.2, tw: 0.3, triglyphMat: 'egyptian_blue' },
    { t: 'block', rect: PARADROMIS, y0: -0.3, y1: 0.02, mat: 'sandstone_white', walk: true }],
  ), rooms: [{ id: 'palaestra', rect: PALAESTRA, y: 0, kind: 'open' }] });
  plans.push(lifePlan());
  return plans;
}
