// The houses, storehouses, pits, canoes and kūmara gardens (docs/settlements/maori.md §5).
import { RADIUS, PATH, village, inGarden, height } from './layout.js';
export async function town() {
  const v = village(), E = [];
  for (const h of v.houses.slice(1)) E.push({ t: 'whare', carved: false, ...h });
  for (const p of v.pataka.slice(1)) E.push({ t: 'pataka', ...p });
  for (const p of v.pits) E.push({ t: 'rua', ...p });
  for (const w of v.waka) E.push({ t: 'waka', ...w });
  // the gardens south of the hill: plots of mounds in fences, paths between, the climbing path kept clear
  let seed = 1;
  for (let z0 = 154; z0 < RADIUS; z0 += 15) for (let x0 = -116; x0 < 116; x0 += 21) {
    const r = [x0, z0, x0 + 18, z0 + 12];
    if (r[0] < PATH.w + 2 && r[2] > -PATH.w - 2) continue;
    if (![[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].every(([x, z]) => inGarden(x, z))) continue;
    E.push({ t: 'mara', rect: r, y: height((r[0] + r[2]) / 2, (r[1] + r[3]) / 2), seed: seed++ });
  }
  return [{ id: 'maori-kainga', style: 'maori', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 160], facing: 'n' } }];
}
