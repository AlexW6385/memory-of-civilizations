// Beijing's critters (src/settlements/qing-beijing/fauna.js; docs/settlements/qing-beijing.md §41): every model is known, each stands where the
// layout says (the cages on the tea house's lintel between the posts, the cats on the lots' wall copings, the dog in the lane clear of the
// gate, the hens inside the yard's walls, the ducks and the kingfisher on the moat), and the moves are those of the engine's behaviours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/qing-beijing/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { LEVEL, MOAT, inMoat, interiorShops, houses, rectsMeet, inRect, AVENUE } from '../src/settlements/qing-beijing/layout.js';

const inst = expandCritters(data.critters, { id: 'qing-beijing' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));

test('the instances: every model is known; a modest count; no swallows\' nests (they are leaving in early autumn)', () => {
  assert.ok(inst.length >= 12 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.equal(of('swallow_nest').length, 0);
});

test('cages: on the tea house\'s front, at the lintel, off the door bay and out of the avenue', () => {
  const t = interiorShops().find((s) => s.kind === 'teahouse'), cages = of('cagebird');
  assert.ok(t && cages.length === 2);
  for (const c of cages) {
    const [x, y, z] = c.groups[1];
    assert.ok(z > t.z0 + 0.5 && z < t.z1 - 0.5, 'within the shop\'s width');
    assert.ok(Math.abs(x - t.front) < 0.3 && y > 3.2 && y < 3.7, 'under the lintel');
    assert.ok(!inRect(AVENUE, x, z), 'not in the carriageway');
    const mid = (t.z0 + t.z1) / 2;
    assert.ok(Math.abs(z - mid) > 1.2, 'off the door bay (the middle)');
  }
});

test('cats: asleep on a wall coping 3.2 m up inside their lot\'s run; they wake as the visitor nears', () => {
  for (const m of ['cat_tabby', 'cat_orange']) {
    const [c] = of(m), [x, y, z] = c.groups[1];
    assert.equal(y, 3.2);
    const h = houses().find((q) => x > q.rect[0] && x < q.rect[2] && Math.abs(z - q.rect[1]) < 0.01);
    assert.ok(h, 'on a lot\'s north wall');
    const farR = run(c, 3, [x + 20, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
    assert.ok(farR.eye < 0.2 && nearR.eye > 0.9);
  }
});

test('dog: in the lane beside its gate (never in a lot or the lane\'s middle) and stands for the visitor', () => {
  for (const d of of('dog')) {
    const [x, y, z] = d.groups[1], h = houses().find((q) => Math.abs(x - q.rect[2]) < 1 && Math.abs(z - q.rect[3] - 1.5) < 0.01);
    assert.ok(h, 'at the east side of a lot\'s gate');
    assert.ok(!houses().some((q) => inRect(q.rect, x, z, 0.1)));
    const lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]);
    assert.ok(lying.lc > 0.7 && up.lc < 0.1);
  }
});

test('hens and the cock: inside their yard\'s walls, at fowl\'s pace', () => {
  const fowl = [...of('hen_brown'), ...of('hen_white'), ...of('rooster')];
  assert.equal(fowl.length, 4);
  const h = houses().find((q) => { const [x, , z] = fowl[0].groups[1]; return x > q.rect[0] + 3 && x < q.rect[2] - 3 && z > q.rect[1] + 8 && z < q.rect[3] - 8; });
  assert.ok(h, 'in a yard');
  for (const f of fowl) {
    const tr = trace(f), sp = speeds(tr);
    for (const { r } of tr) assert.ok(r.X > h.rect[0] + 1 && r.X < h.rect[2] - 1 && r.Z > h.rect[1] + 7 && r.Z < h.rect[3] - 6, `at ${r.X}, ${r.Z}`);
    assert.ok(Math.max(...sp) < 0.9);
  }
});

test('mandarin ducks: afloat on the moat\'s water clear of its banks, paired, slow', () => {
  const drakes = of('mandarin_drake'), hens = of('mandarin_hen');
  assert.equal(drakes.length, 2);
  drakes.forEach((d, k) => {
    const a = trace(d, far(d), 0.5), b = trace(hens[k], far(d), 0.5);
    a.forEach((s, i) => {
      for (const q of [s.r, b[i].r]) { assert.ok(inMoat(q.X, q.Z), `on land at ${q.X}, ${q.Z}`); assert.ok(Math.abs(q.Y - LEVEL.moat) < 0.02); }
      assert.ok(Math.hypot(s.r.X - b[i].r.X, s.r.Z - b[i].r.Z) < 1.3);
    });
    assert.ok(Math.max(...speeds(a)) < 1.0);
  });
});

test('kingfisher: on the inner parapet\'s coping (1.1 m), looks over the moat, dives and returns', () => {
  const [k] = of('kingfisher'), [px, py, pz] = k.groups[1], [wx, wz] = k.groups[2], tr = trace(k, far(k), 0.02, 120);
  assert.ok(Math.abs(px - MOAT.inner[0]) < 0.01 && py > 1.1 && py < 1.2);
  assert.ok(inMoat(wx, wz), 'its water is the moat\'s');
  let reached = 0;
  for (const { r } of tr) if (Math.hypot(r.X - wx, r.Z - wz) < 0.4 && r.Y < LEVEL.moat + 0.15) reached++;
  assert.ok(reached > 5, 'it touches the water');
  const end = tr[tr.length - 1].r;
  assert.ok(Math.hypot(end.X - px, end.Z - pz) < 0.6);
});
void rectsMeet;
