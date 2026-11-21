// Where Kilwa's new night lights stand (docs/settlements/kilwa.md §22.2): the bronze stands before the sultan's doors, a fire by each landing place of the beach,
// the lanterns of the dhows at anchor. Pure data (the elements are made by nightlight.js).
import { PY, SEA, height, inSea } from './layout.js';

const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
/** Elements of the swahili style for Husuni Kubwa (the plan of the landmark): at the audience court's west door and the pavilion's foot, and outside the South Court's gate. */
export function palaceLamps() {
  const E = [];
  for (const [x, z] of [[147.6, -118.2], [147.6, -114.8], [156.6, -121.6], [156.6, -111.4], [163.6, -49.6], [172.4, -49.6]]) E.push({ t: 'kw_stand', at: [x, z], y: PY });
  return E;
}
/** Elements of the swahili style for the town's open ground: the fires and the dhows' lanterns. */
export function shoreLamps() {
  const E = [];
  for (const x of [-140, -75, -45]) { const fx = x + 6.8, fz = shoreAt(x) + 14.4; if (height(fx, fz) > 0.3) E.push({ t: 'kw_fire', at: [fx, fz], y: height(fx, fz) }); }
  for (const x of [-110, -20]) { let z = shoreAt(x) - 22; while (!inSea(x, z) && z > -300) z -= 4; E.push({ t: 'kw_glow', at: [x, z - 14], y: SEA + 2.7, r: 0.8 }); }
  return E;
}
