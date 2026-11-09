// The benchmark (`?bench`, DESIGN §8): a fixed route in three legs of ~15 s, measured on the machine
// it runs on — turning on the ground at Edfu, walking a street in Florence, flying high over Italy.
//
// For each leg: median fps, the worst 5% of frame times, the JavaScript time per frame, draw calls
// and triangles, the JS heap, the number of geometries and textures and an estimate of the vertex
// data on the GPU, the settlements built, and the hitches (frames over 50 ms). The results are
// printed to the console (as a table and as JSON) and shown on screen; `window.BENCH` holds them.
//
// `?bench=suzhou` runs the Ming Suzhou route instead (the showcase, DESIGN §10): turning by the
// pond, walking the south canal street, turning inside the Hall of Distant Fragrance. Before each
// leg the bench waits until the frames are steady again and reports that wait (`steadyS`): the
// stall after arriving somewhere new (shaders compiled, parts streamed in) is measured apart.
// Pin the pixel ratio (`?dpr=2`) and the quality (`?quality=high`) to compare runs: otherwise the
// automatic resolution and the remembered quality change under the measurement.
//
// A/B switches for the benchmark only (never in the UI): `?logdepth=0` (no logarithmic depth
// buffer), `?plain=1` (flat materials, no procedural detail — the cost of the material shaders).

const LEG = 15000;

export async function runBench(P) {
  const { world, controls, perf, renderer: R } = P;
  const out = { backend: R.webgpu ? 'WebGPU' : 'WebGL2', ua: navigator.userAgent, dpr: devicePixelRatio, size: `${innerWidth}x${innerHeight}`, params: location.search, legs: [] };
  const panel = document.createElement('pre');
  panel.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;background:rgba(0,0,0,.78);color:#eee;font:12px/1.45 ui-monospace,monospace;padding:10px 12px;border-radius:6px;margin:0;max-width:96vw;white-space:pre-wrap;user-select:text';
  panel.textContent = 'bench: preparing…';
  document.body.appendChild(panel);
  const say = (t) => { panel.textContent = t; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const settle = async () => { await Promise.all(world.settlements.map((s) => s.loading)); await wait(1500); };
  // until 40 frames in a row are under 150 ms (at most 150 s): the seconds it took
  const steady = async () => {
    const t0 = performance.now(); let run = 0;
    perf.record = (x) => { run = x.dt < 150 ? run + 1 : 0; };
    while (run < 40 && performance.now() - t0 < 150000) await wait(200);
    perf.record = null;
    return +((performance.now() - t0) / 1000).toFixed(1);
  };
  controls.free = false; controls.enabled = true;

  const turn = (on) => { controls.keys.clear(); if (on) controls.keys.add('KeyQ'); };
  const walk = (on) => { controls.keys.clear(); if (on) controls.keys.add('KeyW'); };
  const suzhou = [
    { name: 'sz-pond-turn', start: async () => { await P.pose('ming-suzhou', 0, 0.95, -23.5, 0, -0.04); controls.free = false; await settle(); }, drive: turn },
    { name: 'sz-canal-walk', start: async () => { await P.pose('ming-suzhou', -80, 0.1, 65, -Math.PI / 2, 0.02); controls.free = false; await settle(); }, drive: walk },
    { name: 'sz-hall-turn', start: async () => { await P.pose('ming-suzhou', 0, 0.8, -14.7, 0, 0); controls.free = false; await settle(); }, drive: turn },
  ];
  const route = new URLSearchParams(location.search).get('bench');
  const legs = route === 'suzhou' ? suzhou : [
    {
      name: 'edfu-turn',
      start: async () => { await P.pose('edfu', 0, 0.1, 150, 0, 0.12); controls.free = false; await settle(); },
      drive: (on) => { if (on) controls.keys.add('KeyQ'); else controls.keys.clear(); },
    },
    {
      name: 'florence-walk',
      start: async () => { await P.pose('florence', -150, 0.1, -20, -1.2, 0.05); controls.free = false; await settle(); },
      // walk, turning a little every few seconds (walls are slid along)
      drive: (on, t) => { controls.keys.clear(); if (!on) return; controls.keys.add('KeyW'); if ((t / 2500 | 0) % 3 === 2) controls.keys.add('KeyQ'); },
    },
    {
      name: 'flight',
      start: async () => {
        await P.place(43.8, 11.3, Math.PI / 2);
        controls.free = false;
        controls.feet.y += 700; controls.glide = true; controls.vy = 0; controls.pitch = -0.35;
        await wait(2000);
      },
      drive: (on) => { controls.keys.clear(); controls.flyHeld = false; if (on) { controls.keys.add('KeyW'); controls.keys.add('ShiftLeft'); controls.flyHeld = controls.altitude < 600; } },
    },
  ];

  for (const leg of legs) {
    say(`bench: ${leg.name} — getting ready…\n\n` + report(out));
    await leg.start();
    say(`bench: ${leg.name} — waiting for steady frames…\n\n` + report(out));
    const steadyS = await steady();
    const samples = [];
    perf.record = (s) => samples.push(s);
    const t0 = performance.now();
    while (performance.now() - t0 < LEG) {
      leg.drive(true, performance.now() - t0);
      await wait(100);
      if (leg.name === 'flight') controls.flyHeld = controls.altitude < 600;
      say(`bench: ${leg.name} ${((performance.now() - t0) / 1000).toFixed(0)} / ${LEG / 1000} s\n\n` + report(out));
    }
    leg.drive(false);
    perf.record = null;
    out.legs.push({ ...summarise(leg.name, samples, world, R), steadyS });
  }
  controls.keys.clear(); controls.flyHeld = false;
  const text = report(out);
  say('bench: done\n\n' + text);
  console.log('[bench]\n' + text);
  console.table(out.legs);
  console.log('[bench json] ' + JSON.stringify(out));
  window.BENCH = out;
  return out;
}

function summarise(name, s, world, R) {
  const iv = s.map((x) => x.dt).filter((x) => x > 0).sort((a, b) => a - b);
  const q = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))] || 0;
  const mean = (k) => s.reduce((a, x) => a + x[k], 0) / Math.max(1, s.length);
  const mem = performance.memory;
  const g = gpuGeometry(R.scene);
  return {
    leg: name,
    frames: s.length,
    fps: +(1000 / Math.max(q(iv, 0.5), 0.001)).toFixed(1),
    p95ms: +q(iv, 0.95).toFixed(1),
    jsMs: +mean('js').toFixed(2),
    draws: Math.round(mean('calls')),
    tris: +(mean('tris') / 1e6).toFixed(2),
    hitches: iv.filter((x) => x > 50).length,
    heapMB: mem ? Math.round(mem.usedJSHeapSize / 1e6) : null,
    geometries: R.renderer.info.memory.geometries,
    textures: R.renderer.info.memory.textures,
    gpuGeoMB: +(g.gpu / 1e6).toFixed(0),
    jsGeoMB: +(g.js / 1e6).toFixed(0),
    built: world.settlements.filter((x) => x.state === 'ready').length,
  };
}

/** Vertex data held by the scene's geometries: as uploaded (by count) and still in JS arrays. */
export function gpuGeometry(scene) {
  const seen = new Set();
  let gpu = 0, js = 0;
  scene.traverse((o) => {
    if (o.isInstancedMesh && !seen.has(o.instanceMatrix)) { seen.add(o.instanceMatrix); gpu += o.instanceMatrix.count * 64; js += o.instanceMatrix.array.byteLength; }
    const geo = o.geometry;
    if (!geo || seen.has(geo)) return;
    seen.add(geo);
    for (const a of [...Object.values(geo.attributes), geo.index]) {
      if (!a) continue;
      const bpe = a.array?.BYTES_PER_ELEMENT || 4;
      gpu += a.count * a.itemSize * bpe;
      js += a.array?.byteLength || 0;
    }
  });
  return { gpu, js };
}

function report(out) {
  const head = `${out.backend} · ${out.size} @${out.dpr} · ${out.params || '(no switches)'}`;
  const cols = ['leg', 'steadyS', 'fps', 'p95ms', 'jsMs', 'draws', 'tris', 'hitches', 'heapMB', 'gpuGeoMB', 'jsGeoMB', 'geometries', 'built'];
  const rows = out.legs.map((l) => cols.map((c) => String(l[c] ?? '–')));
  const w = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i].length)));
  const line = (r) => r.map((x, i) => x.padStart(w[i])).join('  ');
  return [head, line(cols), ...rows.map(line)].join('\n');
}
