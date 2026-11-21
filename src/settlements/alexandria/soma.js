// The life of the Soma street and the Canopic Way (docs/settlements/alexandria.md §17): stalls at the edges of the great streets, porters and a litter,
// two fountain-houses and the king's statues at the crossing, placed by the position's own hash along the visitor's walk (walk.js). The
// elements are the ptolemaic style's (street.js) and are built into near plans: figures included, so they cost no life element.
import { STALL_TRADES, crew } from '../../styles/ptolemaic/street.js';
import { RADIUS, GROUND, SOMA, CANOPIC, STREETS_Z, wet } from './layout.js';
import { hashAt } from './nightlight.js';

const CANOPIC_TRADES = ['wine', 'oil', 'pottery', 'grain', 'bread'];        // (the trades whose goods are of the materials the shops' plans already hold)
const g = GROUND + 0.04, CX = 60, CZ = 70;

/** The elements of the street scenes, in world coordinates. */
export function somaElements() {
  const E = [], near = (z) => STREETS_Z.some((c) => Math.abs(z - c) < 5.5);
  // the Soma street, from just inside the harbour gate to the lake: the two edges alternate; the cross streets and the crossing are left free
  let i = 0;
  for (let z = -64; z <= 190; z += 8, i++) {
    if (near(z) || Math.abs(z - CZ) < 15 || wet(CX, z) < 3 || Math.abs(z + 28) < 7 || Math.abs(z - 32) < 7) continue;
    for (const side of [-1, 1]) {
      const h = hashAt(CX + side, z, 11), x = side < 0 ? SOMA[0] + 3.2 : SOMA[2] - 3.2, out = side < 0 ? [1, 0] : [-1, 0], tr = () => STALL_TRADES[Math.floor(hashAt(x, z, 2) * STALL_TRADES.length)];
      if (h < 0.66) E.push({ t: 'alx_stall', at: [x, z], out, y: g, trade: tr(), seed: 100 + i * 2 + (side > 0 ? 1 : 0), shift: side * 0.3 });
      else if (h < 0.8) E.push({ t: 'alx_porters', at: [CX + side * 4.4, z], dir: [0, hashAt(x, z, 4) < 0.5 ? 1 : -1], y: g, seed: 200 + i });
      else if (h < 0.86) E.push({ t: 'alx_litter', at: [CX - side * 4.8, z], dir: [0, hashAt(x, z, 5) < 0.5 ? 1 : -1], y: g, seed: 300 + i });
      if (i % 3 === 0 && h < 0.5) E.push({ t: 'alx_stall', at: [CX + side * 6.4, z + 3], out: [-side, 0], y: g, trade: STALL_TRADES[Math.floor(hashAt(x, z, 7) * STALL_TRADES.length)], seed: 600 + i, shift: 0.3 });   // an inner row, the lane in the middle left free
    }
  }
  // the Canopic Way: stalls before the colonnades of the shops, both sides, within the reach of the crossing
  for (let x = CX - 60, k = 0; x <= CX + 60; x += 11, k++) {
    if (Math.abs(x - CX) < 16) continue;
    const north = k % 2 === 0, z = north ? CANOPIC[1] + 2.6 : CANOPIC[3] - 2.6, h = hashAt(x, z, 12);
    if (h < 0.6) E.push({ t: 'alx_stall', at: [x, z], canopic: true, out: north ? [0, 1] : [0, -1], y: g, trade: CANOPIC_TRADES[Math.floor(hashAt(x, z, 3) * CANOPIC_TRADES.length)], seed: 400 + k, shift: 0.3 });
  }
  // the fountain-houses of the Soma street (back to the street's edge) and the king's statues: four at the crossing's corners, two inside the gate
  E.push({ t: 'alx_fountain', at: [SOMA[0] + 0.7, -28], out: [1, 0], y: g, seed: 1 }, { t: 'alx_fountain', at: [SOMA[2] - 0.7, 32], out: [-1, 0], y: g, seed: 2 });
  for (const [x, z, r] of [[CX - 7.5, CZ - 7.5, Math.PI / 4], [CX + 7.5, CZ - 7.5, -Math.PI / 4], [CX - 7.5, CZ + 7.5, 3 * Math.PI / 4], [CX + 7.5, CZ + 7.5, -3 * Math.PI / 4], [CX - 6, -62, Math.PI], [CX + 6, -62, Math.PI]]) E.push({ t: 'alx_statue', at: [x, z], y: g, rot: r });
  return E.filter((e) => Math.hypot(e.at[0], e.at[1]) < RADIUS - 80);
}
/**
 * The scenes added to the town's existing near plans of their 100 m tile (the houses', else the shops'): their materials are already in those plans, so they merge
 * into meshes the tile has and cost almost no draws; a tile with neither gets a plan of its own.
 */
export function addSoma(plans) {
  const extra = new Map(), can = [];
  for (const e of somaElements()) {
    if (e.canopic) { can.push(e); continue; }
    const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`, host = plans.find((p) => p.id === `alexandria-houses-${k}`) || plans.find((p) => p.id === `alexandria-shops-${k}`);
    if (host) host.elements.push(e); else { if (!extra.has(k)) extra.set(k, []); extra.get(k).push(e); }
  }
  // the Canopic Way's stalls: a plan of their own seen only within 55 m of the crossing (the walk's far poses along the Way keep their draw budget)
  if (can.length) plans.push({ id: 'alexandria-canopic-stalls', style: 'ptolemaic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: can, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -86], facing: 'e' }, center: [CX, CZ], near: 55 });
  // the people: life figures (shared meshes, no draw of their own), in 100 m tiles
  const people = new Map();
  for (const e of somaElements()) for (const f of crew(e)) { const k = `${Math.floor(f.at[0] / 100)},${Math.floor(f.at[1] / 100)}`; if (!people.has(k)) people.set(k, []); people.get(k).push(f); }
  for (const [k, list] of people) { const [i, j] = k.split(',').map(Number); plans.push({ id: `alexandria-somalife-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -86], facing: 'e' }, center: [i * 100 + 50, j * 100 + 50], near: 200 }); }
  for (const [k, list] of extra) { const [i, j] = k.split(',').map(Number); plans.push({ id: `alexandria-soma-${k}`, style: 'ptolemaic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -86], facing: 'e' }, center: [i * 100 + 50, j * 100 + 50], near: 135 }); }
  return plans;
}
