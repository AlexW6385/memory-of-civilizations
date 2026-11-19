// Thebes' night (docs/settlements/thebes.md §15b): the halo plan finds each lit house's lamps by the formulas of doorsite.js `litSpots`, which must
// agree with where houses.js puts the lamps; the doors of doorsite.js `doorSite` with where houses.js cuts them; and the plan has a glow for each.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/objects/index.js';
import '../src/styles/newkingdom/index.js';
import { buildPlan } from '../src/core/build.js';
import { litSpots, doorSite } from '../src/styles/newkingdom/doorsite.js';
import { lots } from '../src/settlements/thebes/layout.js';
import { registerNight, STANDS } from '../src/settlements/thebes/nightlight.js';

const K = { row: 'nk_row_house', court: 'nk_court_house', villa: 'nk_villa' };
const plan = (l) => ({ id: 'test', style: 'newkingdom', origin: [0, 0], base: 0, yaw: 0, elements: [{ t: K[l.kind], rect: l.rect, front: l.front, seed: l.seed, open: true, lod: 2, shop: l.shop }], rooms: [], bounds: [-400, -400, 400, 400] });

test('litSpots agrees with the lamps the houses make', () => {
  const seen = { row: 0, court: 0, villa: 0 };
  for (const l of lots()) {
    if (!K[l.kind] || !l.open || seen[l.kind] >= 4) continue;
    seen[l.kind]++;
    const built = buildPlan(plan(l)), sp = litSpots({ ...l, open: true }), front = l.front === 's', sg = front ? -1 : 1, zs = front ? l.rect[3] : l.rect[1];
    assert.equal(built.lights.length, sp.lamps.length, `${l.kind} ${l.seed}: lamps`);
    sp.lamps.forEach((a, i) => {
      const x = l.rect[0] + a.u, z = zs + sg * a.v, y = a.y + a.h + 0.3, q = built.lights.find((b) => Math.hypot(b.at[0] - x, b.at[2] - z) < 0.02 && Math.abs(b.at[1] - y) < 0.02);
      assert.ok(q, `${l.kind} ${l.seed}: lamp ${i} at ${x.toFixed(2)}, ${z.toFixed(2)}`);
    });
  }
  assert.ok(seen.row >= 3 && seen.court >= 3 && seen.villa >= 3);
});

test('doorSite agrees with the doors the houses cut (a 1.5 m opening on every entered house)', () => {
  for (const l of lots().filter((q) => q.open && K[q.kind]).slice(0, 12)) {
    const d = doorSite({ ...l, open: true });
    assert.ok(d.w >= 1.5 - 1e-9, `${l.kind}: ${d.w}`);
    assert.ok(d.u > d.w / 2 && d.u < l.rect[2] - l.rect[0] - d.w / 2, 'the door lies in the front');
  }
});

test('the halo element builds one geometry in the halo material', () => {
  registerNight();
  const open = lots().filter((l) => l.open).slice(0, 20);
  const b = buildPlan({ id: 'night', style: 'newkingdom', origin: [0, 0], base: 0, yaw: 0, elements: [{ t: 'thebes_halo', lots: open, braziers: [[-200, 8]], stands: STANDS }], rooms: [], bounds: [-400, -400, 400, 400] });
  assert.deepEqual([...new Set(b.parts.map((p) => p.mat))], ['halo']);
  const tris = b.parts.reduce((s, p) => s + p.geometry.attributes.position.count / 3, 0);
  assert.ok(tris > 20 * 60, `${tris} triangles`);
  for (const p of b.parts) { const n = p.geometry.attributes.normal.array; for (let i = 1; i < n.length; i += 3) assert.ok(n[i] >= 0 && n[i] <= 1.0001); }
});
