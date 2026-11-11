globalThis.self = globalThis;
let msg = null; globalThis.postMessage = (d) => { msg = d; };
const root = new URL('../src/', import.meta.url).pathname;
const { MOVER_SITES } = await import(root + 'engine/movers-sites.js');
MOVER_SITES['song-hangzhou'] = () => import(root + 'settlements/song-hangzhou/movers.js');
await import(root + 'engine/movers-worker.js');
await globalThis.onmessage({ data: { id: 'song-hangzhou' } });
if (msg.error) { console.log(msg.error); process.exit(1); }
console.log('worker ok', Object.keys(msg), msg.walk.edges.length, msg.water.edges.length);
const THREE = await import('three/webgpu');
const { SiteMovers, walkLanes } = await import(root + 'engine/movers.js');
const W = await import(root + 'settlements/song-hangzhou/ways.js');
const LOTS = W.lots();
const inLotRect = (x, z, m) => LOTS.some((l) => x > l.rect[0] - m && x < l.rect[2] + m && z > l.rect[1] - m && z < l.rect[3] + m);
const collide = { groundAt: () => 0, blockedAt: (x, z, r) => inLotRect(x, z, r) };
const site = { id: 'song-hangzhou', group: new THREE.Group(), collide };
const sm = new SiteMovers(site, { r: null }, msg);
for (const e of sm.walk.edges) walkLanes(e, collide);
console.log('sm ok');
// ── step the simulation: closest hulls, stalls, walkers' clearance ──
const { ENV } = await import(root + 'engine/env.js');
const cam = new THREE.PerspectiveCamera();
const stub = (o, k, f) => { try { o[k] = f; } catch {} };
sm.show = null;
const arg = process.argv.slice(2);
const spots = arg.length ? [arg.map(Number)] : null;
function run(cx, cz, secs, night = 0, rain = 0) {
  cam.position.set(cx, 1.7, cz); cam.updateMatrixWorld(true);
  ENV.night.value = night; ENV.rain.value = rain;
  site.group.updateMatrixWorld(true);
  const dt = 0.1; let steps2 = 0, inside = 0, minGap = 1e9, stalls = 0, overlap = { lake: 0, canal: 0 }, wrong = { lake: 0, canal: 0 }, onWater = { lake: 0, canal: 0 }, maxB = 0, maxW = 0, minWalk = 1e9, steps = 0, stuck = new Map(), worst = null;
  for (let t = 0; t < secs; t += dt) {
    sm.view(cam); sm.update(dt); steps++;
    const act = sm.B.filter((b) => b.on); maxB = Math.max(maxB, act.length);
    const aw = sm.W.filter((w) => w.on); maxW = Math.max(maxW, aw.length); for (const w of aw) { steps2++; if (inLotRect(w.x, w.z, 0.1)) inside++; }
    for (const b of act) { const w = b.x > 120 ? 'canal' : 'lake'; onWater[w]++; if ((w === 'lake') !== (b.kind === 'covered')) wrong[w]++; }   // pleasure boats belong on the lake, cargo boats on the canals
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) {
      const a = act[i], b = act[j];
      // hull overlap along each hull's axis, a coarse test: distance between centres less the half-lengths along the line of centres
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1e-6, ux = dx / d, uz = dz / d;
      const ext = (q) => Math.abs(ux * q.hx + uz * q.hz) * q.hl + Math.abs(-uz * q.hx + ux * q.hz) * q.hw;
      const gap = d - ext(a) - ext(b);
      if (gap < -0.05) overlap[a.x > 120 ? 'canal' : 'lake']++;
      if (gap < minGap) { minGap = gap; worst = [a.x.toFixed(0), a.z.toFixed(0), b.x.toFixed(0), b.z.toFixed(0), t.toFixed(0)]; }
    }
    for (const b of act) if (b.v < 0.03 && !b.moored) { const k = b; k._s = (k._s || 0) + dt; if (k._s > 40) { stalls++; k._s = -1e9; } } else b._s = 0;
  }
  return { overlap, wrong, onWater, walkerSamples: steps2, insideLots: inside, minGap: +minGap.toFixed(2), worst, stalls, maxB, maxW, steps };
}
const where = spots ?? [[0, 0], [150, 0], [0, -150], [-150, 0]];
for (const [x, z] of where) console.log('camera', x, z, JSON.stringify(run(x, z, 1500)));
console.log('night', JSON.stringify(run(150, 0, 600, 1, 0)));
console.log('rain', JSON.stringify(run(150, 0, 600, 0, 0.5)));
process.exit(0);
