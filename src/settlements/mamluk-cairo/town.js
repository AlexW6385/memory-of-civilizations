import { lodTiles } from '../lod.js';
// The city's houses (docs/settlements/mamluk-cairo.md §5): Cairene town houses (house_mamluk, style
// vernacular) — and sabil-kuttabs on three street corners in place of a house.
import { RADIUS, lots, SABILS, SUQ, QAA, BAYN, QALAWUN, NASIR, BARQUQ, KHAN, SUQ2, SUQ3, HAMMAM, SHOP, STALLS } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-37, -30], facing: 's' } });
const dist = (l, [x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
export async function town() {
  const all = lots(), plans = [];
  // the corner lot nearest each sabil's place becomes the sabil-kuttab, its corner the one nearest the crossing
  const taken = new Map();
  for (const p of SABILS) { const l = all.filter((q) => !taken.has(q)).sort((a, b) => dist(a, p) - dist(b, p))[0]; taken.set(l, p); }
  const houses = all.filter((l) => !taken.has(l));
  // the houses (house_mamluk, style vernacular: stone storey, corbelled plastered storeys, mashrabiyas,
  // the bent entrance, malqafs), in 100 m tiles, near and far
  plans.push(...lodTiles('mamluk-cairo-houses', 'vernacular', houses.map((l) => ({ t: 'house_mamluk', ...l })), { R: RADIUS, entrance: { at: [-37, -30], facing: 's' } }));
  const sabils = [...taken].map(([l, [x, z]]) => {
    const [x0, z0, x1, z1] = l.rect, sx = Math.abs(x - x1) < Math.abs(x - x0) ? 1 : -1, sz = Math.abs(z - z1) < Math.abs(z - z0) ? 1 : -1;
    const w = Math.min(8, x1 - x0), d = Math.min(8, z1 - z0), r = [sx > 0 ? x1 - w : x0, sz > 0 ? z1 - d : z0, sx > 0 ? x1 : x0 + w, sz > 0 ? z1 : z0 + d];
    return { t: 'sabil_kuttab', rect: r, y: l.y, corner: [sx, sz] };
  });
  plans.push({ ...base('mamluk-cairo-sabils', sabils), style: 'mamluk' });
  // the covered market street north from the madrasa's portal
  plans.push({ ...base('mamluk-cairo-suq', [{ t: 'suq_covered', rect: SUQ, y: 0, street: 5, seed: 1363 }]), style: 'mamluk', bounds: [SUQ[0] - 2, SUQ[1] - 2, SUQ[2] + 2, SUQ[3] + 2] });
  // the merchant's house with its qa'a (§10)
  plans.push({ ...base('mamluk-cairo-qaa', [{ t: 'cairo_qaa', rect: QAA, entry: 'e', seed: 1350 }]), style: 'mamluk', bounds: [QAA[0] - 2, QAA[1] - 2, QAA[2] + 2, QAA[3] + 2],
    rooms: [{ id: 'qaa', rect: [QAA[0] + 3.6, QAA[1] + 0.7, QAA[2] - 3.4, QAA[1] + 6.5], y: 0.3, kind: 'hall' }, { id: 'house court', rect: [QAA[0] + 3.6, QAA[1] + 7, QAA[2] - 3.4, QAA[3] - 4], y: 0, kind: 'open' }] });
  // the Bayn al-Qasrayn: the paved bed, the fronts of the three complexes with their minarets and domes (docs §11)
  const bayn = [{ t: 'bayn_bed', rect: BAYN, y: 0 },
    { t: 'bayn_front', rect: QALAWUN, face: 'e', kind: 'qalawun', seed: 1285 }, { t: 'bayn_front', rect: NASIR, face: 'e', kind: 'nasir', seed: 1304 }, { t: 'bayn_front', rect: BARQUQ, face: 'e', kind: 'barquq', seed: 1386 },
    { t: 'mamluk_minaret', c: [-181, -216.5], h: 24, r: 1.9, y: 21 }, { t: 'mamluk_dome', c: [-187, -233], r: 6.5, y: 19 },
    { t: 'mamluk_minaret', c: [-189, -264.5], h: 22, r: 1.7, y: 16.5 }, { t: 'mamluk_minaret', c: [-189, -305], h: 26, r: 1.9, y: 18.5 }, { t: 'mamluk_dome', c: [-188, -318.5], r: 6, y: 17 }];
  plans.push({ ...base('mamluk-cairo-bayn', bayn), style: 'mamluk', bounds: [BARQUQ[0] - 3, BARQUQ[1] - 3, BAYN[2] + 3, QALAWUN[3] + 3] });
  // the khan: the wikala of al-Khalili with its court
  plans.push({ ...base('mamluk-cairo-khan', [{ t: 'cairo_wikala', rect: KHAN, y: 0, seed: 1382 }]), style: 'mamluk', bounds: [KHAN[0] - 2, KHAN[1] - 2, KHAN[2] + 2, KHAN[3] + 2],
    rooms: [{ id: 'khan court', rect: [KHAN[0] + 10, KHAN[1] + 10, KHAN[2] - 10, KHAN[3] - 10], y: 0, kind: 'open' }] });
  // the khan's market lanes: brass, lamps and spices; cloth and carpets
  const lampGoods = [['bronze', 'tray'], ['lamp_glass', 'lamp'], ['bronze', 'tray'], ['cloth_ochre', 'spice'], ['cloth_red', 'spice'], ['pottery_dark', 'pot'], ['lamp_glass', 'lamp'], ['iron', 'blade']];
  const clothGoods = [['cloth_indigo', 'bolt'], ['cloth_red', 'bolt'], ['cloth_green', 'bolt'], ['cloth_ochre', 'bolt'], ['cloth_white', 'bolt'], ['cloth_maroon', 'bolt'], ['wicker', 'basket'], ['cloth_black', 'bolt']];
  plans.push({ ...base('mamluk-cairo-suq2', [{ t: 'suq_covered', rect: SUQ2, y: 0, street: 5, seed: 1389, goods: lampGoods }]), style: 'mamluk', bounds: [SUQ2[0] - 2, SUQ2[1] - 2, SUQ2[2] + 2, SUQ2[3] + 2] });
  plans.push({ ...base('mamluk-cairo-suq3', [{ t: 'suq_covered', rect: SUQ3, y: 0, street: 5, seed: 1391, goods: clothGoods }]), style: 'mamluk', bounds: [SUQ3[0] - 2, SUQ3[1] - 2, SUQ3[2] + 2, SUQ3[3] + 2] });
  // the bath on the Qasaba; the merchant's shop and the sherbet sellers' stands
  plans.push({ ...base('mamluk-cairo-hammam', [{ t: 'cairo_hammam', rect: HAMMAM, y: 0, seed: 1341 }]), style: 'mamluk', bounds: [HAMMAM[0] - 2, HAMMAM[1] - 2, HAMMAM[2] + 2, HAMMAM[3] + 2],
    rooms: [{ id: 'maslakh', rect: [HAMMAM[0] + 0.7, HAMMAM[1] + 0.7, HAMMAM[0] + 12, HAMMAM[3] - 6], y: 0, kind: 'hall' }, { id: 'hot room', rect: [HAMMAM[0] + 12.5, HAMMAM[1] + 0.7, HAMMAM[2] - 0.7, HAMMAM[3] - 6], y: 0, kind: 'hall' }] });
  plans.push({ ...base('mamluk-cairo-shop', [{ t: 'cairo_shop', rect: SHOP, face: 'e', y: 0, seed: 1360 }]), style: 'mamluk', bounds: [SHOP[0] - 2, SHOP[1] - 2, SHOP[2] + 2, SHOP[3] + 2],
    rooms: [{ id: 'shop', rect: [SHOP[0] + 0.5, SHOP[1] + 0.5, SHOP[2] - 0.5, SHOP[3] - 0.5], y: 0.2, kind: 'hall' }] });
  STALLS.forEach((s, i) => plans.push({ ...base('mamluk-cairo-stall' + i, [{ t: 'sharbat_stall', ...s, y: 0 }]), style: 'mamluk', bounds: [s.at[0] - 6, s.at[1] - 6, s.at[0] + 6, s.at[1] + 6] }));
  plans.push(lifePlan());
  return plans;
}
