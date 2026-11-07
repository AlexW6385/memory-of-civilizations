// The street-life gaps of DESIGN §5: the porters' loads, the sweepers, the doorway stools, the washing across the
// lanes, the ground sellers, the pigeons and the turkeys build; the lines end inside the walls; the fowls and dogs
// of each people are their own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/objects/index.js';
import { LIFE_KINDS } from '../src/objects/index.js';
import { lifePlans } from '../src/objects/life.js';
import { buildPlan } from '../src/core/build.js';

const plan = (elements) => ({ id: 't', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements, rooms: [], bounds: [-50, -50, 50, 50], entrance: { at: [0, 0], facing: 'n' } });
const finite = (b) => b.parts.every((p) => p.geometry.attributes.position.array.every(Number.isFinite));

test('the loads, the brooms, the lines, the pigeons and the turkeys build', () => {
  assert.ok(LIFE_KINDS.includes('wash_line'));
  const els = [
    ...['sack', 'bundle', 'jige', 'yoke', 'pails', 'headload', 'wood_head', 'broom', 'besom'].map((carry, i) => ({ t: 'figure', carry, at: [i * 2, 0], seed: i + 1 })),
    { t: 'figure', carry: 'yoke', bucketMat: 'bronze', at: [0, 4], seed: 9 },
    { t: 'wash_line', at: [0, 8], y: 5, len: 3.5, emb: [0.25, 0.25], clear: [0.5, 0.5], seed: 1 },
    { t: 'wash_line', at: [5, 8], y: 5, len: 4.25, emb: [1.25, 0.25], clear: [1.5, 0.5], pole: true, seed: 2 },
    { t: 'chickens', kind: 'pigeon', at: [0, 12], seed: 3 }, { t: 'chickens', kind: 'turkey', at: [5, 12], seed: 4, n: 4 },
    { t: 'stool', at: [0, 15], seed: 1 }, { t: 'figure', pose: 'sit_low', at: [0, 15], seed: 5 },
  ];
  for (const el of els) { const b = buildPlan(plan([el])); assert.ok(b.parts.length > 0, `${el.t} ${el.carry ?? el.kind ?? ''} builds nothing`); assert.ok(finite(b), `${el.t} ${el.carry ?? ''}: not finite`); }
});

test('a line across a lane ends inside both walls and keeps its wash off them', () => {
  // two rows of three-storey Venetian houses facing each other across a 3.4 m calle
  const G = { height: () => 0, waterLevel: () => NaN };
  const rows = [];
  for (let i = 0; i < 30; i++) { rows.push({ t: 'house_med', rect: [-60 + i * 4, -10, -56 + i * 4, -1.7], storeys: 3, front: 's', y: 0 }); rows.push({ t: 'house_med', rect: [-60 + i * 4, 1.7, -56 + i * 4, 10], storeys: 3, front: 'n', y: 0 }); }
  const town = { id: 'h', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements: rows, rooms: [], bounds: [-150, -150, 150, 150] };
  const lines = lifePlans('venice', 150, [], [town], G).flatMap((p) => p.elements).filter((e) => e.t === 'wash_line');
  assert.ok(lines.length > 2, `${lines.length} lines`);
  for (const e of lines) {
    const dx = Math.cos(e.rot), dz = -Math.sin(e.rot), a = [e.at[0] - dx * e.len / 2, e.at[1] - dz * e.len / 2], b = [e.at[0] + dx * e.len / 2, e.at[1] + dz * e.len / 2];
    assert.ok(Math.abs(dx) < 1e-6, 'across the calle');
    assert.ok(Math.min(a[1], b[1]) < -1.7 - 0.1 && Math.max(a[1], b[1]) > 1.7 + 0.1, `ends inside the walls: ${a[1].toFixed(2)} … ${b[1].toFixed(2)}`);
    assert.ok(e.y > 4 && e.y < 3 * 3.3, `height ${e.y}`);
    assert.ok(e.clear.every((c) => c >= 0.3));
  }
});

test('the fowls and the dogs of each people are their own', () => {
  // a small town of houses, and what its streets hold
  const G = { height: () => 0, waterLevel: () => NaN };
  const town = { id: 'h', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements: Array.from({ length: 80 }, (_, i) => ({ t: 'house', rect: [-90 + (i % 10) * 18, -90 + Math.floor(i / 10) * 18, -80 + (i % 10) * 18, -80 + Math.floor(i / 10) * 18], front: 's' })), rooms: [], bounds: [-150, -150, 150, 150] };
  const kinds = (id) => new Set(lifePlans(id, 150, [], [town], G).flatMap((p) => p.elements).map((e) => `${e.t}${e.kind ? ':' + e.kind : ''}`));
  for (const id of ['tenochtitlan', 'teotihuacan', 'taos']) { const k = kinds(id); assert.ok(!k.has('chickens'), `${id}: chickens before 1492`); }
  assert.ok(!kinds('maori').has('chickens'), 'no chickens in Aotearoa');
  assert.ok(!kinds('rapa-nui').has('animal:dog'), 'no dogs on Rapa Nui');
});
