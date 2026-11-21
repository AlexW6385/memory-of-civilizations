// Brasília about 1970 — the street lamps (town.js places them as life elements, nightlight.js lights them): the Esplanade's two
// kerbs, the avenue's pavements, the Square's long edges, the apron at the foot of the ramp, the roof deck's parapets. Pure data.
import { AVENUE, PRACA } from './layout.js';

/** [{ at: [x, z], y, h }] — a post of height h standing on y. */
export function lampPosts() {
  const L = [];
  for (let x = -450; x < 80; x += 36) { L.push({ at: [x, -117], y: 0, h: 6.5 }, { at: [x, 117], y: 0, h: 6.5 }); }
  for (let z = AVENUE[1] + 12; z < AVENUE[3] - 20; z += 36) L.push({ at: [AVENUE[0] - 1.5, z], y: 0, h: 6.5 }, { at: [AVENUE[2] + 1.5, z], y: 0, h: 6.5 });
  for (let x = PRACA[0] + 12; x < PRACA[2] - 8; x += 40) for (const z of [-132, 132]) L.push({ at: [x, z], y: 0, h: 7 });
  for (const z of [-28, -17, 17, 28]) L.push({ at: [-100.5, z], y: 0, h: 6.5 });
  for (const x of [0, 22, 60]) for (const z of [-104, 104]) L.push({ at: [x, z], y: 6.5, h: 6 });
  return L;
}
