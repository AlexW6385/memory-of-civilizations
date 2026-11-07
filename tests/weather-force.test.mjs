// A weather held by ?weather= (or the tools' --weather) holds every region, also one whose states
// have no state of that id (London has no 'clear'): its fog set piece must never come in.
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.location ??= { search: '' };
const { forcedIndex } = await import('../src/engine/climate.js');
const { withSetPieces } = await import('../src/planet/setpieces.js');

test('a held id that a region lacks maps to the state most like it', () => {
  const S = [{ id: 'overcast', clouds: 0.8, fog: 1.3 }, { id: 'smoke', clouds: 0.6, fog: 2.2 },
    { id: 'rain', clouds: 0.95, fog: 1.8, rain: 0.8 }, { id: 'fog', clouds: 0.85, fog: 7 }];
  assert.equal(forcedIndex(S, 'clear'), 0);
  assert.equal(forcedIndex(S, 'shower'), 2);
  assert.equal(forcedIndex(S, 'lake-mist'), 3);
  assert.equal(forcedIndex(S, 'fog'), 3);
  assert.equal(forcedIndex(S, null), -1);
});

test("London with its Thames fog set piece holds 'clear' as a state without the fog", async () => {
  const mod = await import('../src/settlements/london/ground.js');
  const climate = Object.values(mod).map((v) => v?.climate || v).find((v) => v?.weather);
  assert.ok(climate, 'london climate found');
  const S = withSetPieces('london', climate).weather;
  assert.ok(S.some((w) => w.id === 'fog'), 'the set piece is merged in');
  const w = S[forcedIndex(S, 'clear')];
  assert.notEqual(w.id, 'fog');
  assert.ok((w.fog ?? 1) < 2 && !w.rain, `held state ${w.id}`);
});
