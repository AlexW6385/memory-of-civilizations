// The opt-in poses of the figure library (the dances, the musicians, riding), children, and the newer beasts
// (cats, ducks and geese, the elephant's howdah and mahout, the camel's pack saddle) build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/objects/index.js';
import { buildPlan } from '../src/core/build.js';

const plan = (elements) => ({ id: 't', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements, rooms: [], bounds: [-50, -50, 50, 50], entrance: { at: [0, 0], facing: 'n' } });
const builds = (el) => { const b = buildPlan(plan([el])); assert.ok(b.parts.length > 0, `${JSON.stringify(el)} builds nothing`); };

test('the dance, music and riding poses build, in the dresses that go with them', () => {
  for (const pose of ['apsara', 'apsara2', 'folk', 'drum', 'flute', 'harp', 'lute', 'ride'])
    for (const dress of ['wrap', 'robe', 'tunic']) builds({ t: 'figure', at: [0, 0], seed: 5, pose, dress, top: dress === 'wrap' ? 'bare' : '', hat: pose.startsWith('apsara') ? 'mkot' : 'none' });
});

test('children build, with and without hats', () => {
  for (const hat of ['none', 'veil', 'straw']) builds({ t: 'figure', at: [0, 0], seed: 7, child: true, hat });
});

test('cats, ducks, geese, the howdah and the camel load build', () => {
  for (const pose of ['sit', 'lie', 'stand']) builds({ t: 'animal', kind: 'cat', at: [0, 0], seed: 3, pose });
  for (const kind of ['duck', 'goose']) builds({ t: 'chickens', kind, at: [0, 0], seed: 4, n: 4 });
  builds({ t: 'animal', kind: 'elephant', at: [0, 0], seed: 9, gear: true, howdah: true, canopy: true, mahout: true });
  builds({ t: 'animal', kind: 'camel', at: [0, 0], seed: 2, gear: true });
});
