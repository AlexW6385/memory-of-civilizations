// The reverberation of the halls (src/engine/acoustics.js): Eyring's formula reproduces the one hall
// measured in our set, the others follow the measured trend of reverberation with volume, and every
// room of every settlement gets a sensible impulse response.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { HALLS, acoustics, roomAcoustics, impulseResponse } from '../src/engine/acoustics.js';

test('Hagia Sophia rings as measured (about 11 s, 12 s low, 8 s at 2 kHz)', () => {
  const A = acoustics('hs', HALLS['hagia-sophia'].nave);
  assert.ok(A.rt[1] > 10 && A.rt[1] < 13.5, `250 Hz: ${A.rt[1].toFixed(1)} s`);
  assert.ok(A.mid > 8.5 && A.mid < 12, `mid: ${A.mid.toFixed(1)} s`);
  assert.ok(A.rt[4] > 4.5 && A.rt[4] < 9.5, `2 kHz: ${A.rt[4].toFixed(1)} s`);
});

test('churches and mosques follow the measured trend with volume (Fausti et al. 2003)', () => {
  const church = (V) => 2.2958 * Math.log(V) - 18.744, mosque = (V) => 1.1753 * Math.log(V) - 7.897;
  for (const [id, room, fit] of [['sainte-foy-conques', 'nave', church], ['muscovy-dormition', 'nave', church], ['florence-centre', 'nave', church],
    ['ottoman-istanbul-suleymaniye', 'prayer hall', mosque]]) {
    const A = acoustics(id, HALLS[id][room]), T = fit(A.V);
    assert.ok(A.mid > T * 0.6 && A.mid < T * 1.45, `${id}: ${A.mid.toFixed(1)} s against ${T.toFixed(1)} s`);
  }
});

test('timber, earth and cloth rooms are drier than stone and marble ones', () => {
  const t = acoustics('b', HALLS['norse-borgund-church'].nave).mid, k = acoustics('k', HALLS['giza-great-pyramid']['kings-chamber']).mid;
  assert.ok(t < k, `${t} < ${k}`);
  assert.ok(acoustics('l', HALLS['lhasa-potala']['great east hall']).mid < 1);
});

test('every room of every settlement has acoustics and an impulse response of the right length', async () => {
  const root = new URL('../src/settlements/', import.meta.url);
  let n = 0;
  for (const id of readdirSync(root)) {
    if (!existsSync(new URL(id + '/index.js', root))) continue;
    const m = await import(new URL(id + '/index.js', root));
    for (const { plan } of m.landmarks || []) for (const r of plan.rooms) {
      const A = roomAcoustics(plan, r);
      if (r.kind === 'open') { assert.equal(A, null); continue; }
      assert.ok(A.mid > 0.2 && A.mid < 16 && A.rt.every(Number.isFinite), `${plan.id}/${r.id}: ${A.mid}`);
      assert.ok(A.wet > 0 && A.wet <= 0.9 && A.gap > 0 && A.gap <= 0.12);
      n++;
    }
  }
  assert.ok(n > 100, `${n} rooms`);
  const ir = impulseResponse(acoustics('k', HALLS['giza-great-pyramid']['kings-chamber']), 8000);
  assert.equal(ir.length, 2);
  assert.ok(ir[0].length > 8000 && ir[0].length < 8000 * 2.6);
  const e = ir[0].reduce((s, v) => s + v * v, 0);
  assert.ok(Math.abs(e - 1) < 1e-3);
  // the decay: the last tenth holds far less energy than the first
  const q = Math.floor(ir[0].length / 10), head = ir[0].slice(0, q).reduce((s, v) => s + v * v, 0), tail = ir[0].slice(-q).reduce((s, v) => s + v * v, 0);
  assert.ok(tail < head * 1e-3, `${tail} vs ${head}`);
});
