#!/usr/bin/env node
// Renders elements (of the shared library, src/objects/, or of any style) for a close look at them,
// or a settlement's view from a pose (--site), lit as the game lights them.
//
// usage: node tools/showroom.mjs '<items json>' | @items.json  [options]
//        node tools/showroom.mjs --site <id> (--at x,y,z,yaw,pitch | --arrival) [options]
//   --out shots/showroom.png   where the picture goes
//   --style life               the style the elements are built in (an item's own `style` wins)
//   --imports a,b              what to load first: style names (src/styles/<name>/index.js) or
//                              module paths (src/settlements/x/elements.js, relative to the repo
//                              root, or absolute inside it)
//   --inplace                  keep the items where they are (their own at / y / rect / a, b …)
//                              instead of laying them out in a row; the camera frames them all
//   --cols 6 --gap 4           the row (without --inplace): items per row and their spacing
//   --ground 0 | off           the height of the ground plane, or no ground (to see hulls, the
//                              undersides of bridges)
//   --cam x,y,z --look x,y,z   the camera and where it looks (default: framing the items)
//   --weld                     build as the viewer does (welded meshes, 16-bit normals, repeated
//                              pieces instanced) instead of the tools' triangle soups
//   --light game | simple      game (default): the game's renderer — sky, cascaded sun shadows, the
//                              climate's indirect light and reflections, GTAO, bloom; simple: a sun
//                              and a hemisphere light (faster; metals still reflect the sky)
//   --climate <site id>        whose sky, sun and climate light the elements (default athens)
//   --hour 10.5                the local hour (default mid-morning; --night 1 means 22)
//   --weather <id>             hold the weather in this state (as ?weather=: snow, monsoon, lake-mist,
//                              fog, harmattan, khamsin … src/planet/setpieces.js and the grounds)
//   --season winter|spring|summer|autumn   the open country's season (as ?season=; default today's)
//   --fov 68                   the camera's field of view (default the game's: 68°, 78° portrait)
//   --night 1  --size 1280x720 --quality high|medium|low  --frames 2
//   --timeout 1200             seconds to wait for the page to build and draw, and again for the
//                              screenshot (software WebGPU is slow on a busy machine)
// a settlement's view (--site <id>): its ground, plants, the plans within --radius metres (150) of
// the camera and the life of its streets, as an in-game screenshot:
//   --at x,y,z,yaw,pitch       the feet in the settlement's frame (y empty or g: on the ground; the
//                              feet land on what is under y), yaw 0 north, pitch up positive
//   --arrival                  the settlement's arrival pose (src/planet/arrivals.js)
//   --free                     --at's x,y,z is the camera itself (no eye height, no landing)
//   --radius 150               what is built: the elements within this distance of the camera
//   --trim town | all | none   town (default): town plans cut down to their elements within reach,
//                              a landmark within reach kept whole; all: landmarks cut down too;
//                              none: every plan within reach (by its bounds) whole
//   --noflora  --verbose (the page's stages as they pass)
//   --nomerge                  the plans' static meshes kept per plan (src/engine/merge.js), to compare
//                              the last frame's draw calls (printed for --site)
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { serve, ROOT } from './serve.mjs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const [W, H] = opt('size', '1280x720').split('x').map(Number);
const TIMEOUT = +opt('timeout', 1200) * 1000;
const site = opt('site');
const USAGE = 'usage: node tools/showroom.mjs \'<items json>\' | @file.json [--style s] [--imports a,b] [--inplace] [--weld] [--light game|simple] [--fov 68] [--ground y|off] [--cam x,y,z] [--look x,y,z] [--out f.png] [--timeout s]\n' +
  '       node tools/showroom.mjs --site <id> (--at x,y,z,yaw,pitch | --arrival) [--radius 150] [--free] [--hour h] [--fov 68] [--out f.png]';
let items = null;
if (!site) {
  const src = args[0]?.startsWith('@') ? readFileSync(args[0].slice(1), 'utf8') : args[0];
  if (!src || src.startsWith('--')) { console.log(USAGE); process.exit(2); }
  items = JSON.parse(src);   // fail here, not in the page
} else if (!opt('at') && !flag('arrival')) { console.log('--site needs --at x,y,z,yaw,pitch or --arrival\n' + USAGE); process.exit(2); }
// each import: a style's name, or a module's path (served from the repo root)
const imports = opt('imports', '').split(',').filter(Boolean).map((s) => {
  if (!s.includes('/') && !s.endsWith('.js')) return `/src/styles/${s}/index.js`;
  const rel = relative(ROOT, isAbsolute(s) ? s : resolve(ROOT, s));
  if (rel.startsWith('..')) { console.log(`--imports ${s}: not inside the repository`); process.exit(2); }
  return '/' + rel.split('\\').join('/');
});
const light = opt('light', 'game');
if (!['game', 'simple'].includes(light)) { console.log('--light game | simple'); process.exit(2); }
// the page's configuration, served as JSON (an element list of any size: the address held ~8 kB)
const cfg = {
  items, cols: +opt('cols', 6), gap: +opt('gap', 4), night: +opt('night', 0), style: opt('style', 'life'), imports, ground: opt('ground', '0'),
  inplace: flag('inplace'), cam: opt('cam'), look: opt('look'), weld: flag('weld'), light, climate: opt('climate'), hour: opt('hour'), weather: opt('weather'),
  fov: opt('fov'), quality: opt('quality'), frames: opt('frames'),
  site, at: opt('at'), arrival: flag('arrival'), free: flag('free'), radius: opt('radius'), trim: opt('trim'), noflora: flag('noflora'),
};
const t0 = Date.now();
// the planet's land map is made, not kept in the repository: made here if missing (a minute or two)
if (site && !existsSync(resolve(ROOT, 'data/planet/land.bin'))) {
  console.log('data/planet/land.bin is missing: making it (node tools/planet-land.mjs) …');
  const r = spawnSync(process.execPath, [resolve(ROOT, 'tools/planet-land.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) { console.log('could not make the land map'); process.exit(1); }
}
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
let fail;
const failed = new Promise((_, no) => { fail = no; });
// (a plan without baked light has no data/gi file: its 404 is expected and not shown)
page.on('response', (r) => { if (r.status() >= 400 && !/\/data\/gi\//.test(r.url())) console.log('error', r.status(), r.url()); });
page.on('console', (m) => {
  if (/the server responded with a status of 404/.test(m.text())) return;
  if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 300));
  else if (flag('verbose') && m.text().startsWith('[showroom]')) console.log(m.text());
});
page.on('pageerror', (e) => { console.log('pageerror', e.message); fail(e); });
await page.route('**/__showroom/config.json', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(cfg) }));
const out = opt('out', 'shots/showroom.png');
mkdirSync(dirname(resolve(out)), { recursive: true });
try {
  // (no build workers: the page builds only what it was asked for)
  await page.goto(`http://127.0.0.1:${srv.address().port}/tools/showroom.html?worker=0${opt('season') ? '&season=' + opt('season') : ''}${flag('nomerge') ? '&merge=0' : ''}`, { timeout: TIMEOUT });
  await Promise.race([page.waitForFunction('window.DONE === true', null, { timeout: TIMEOUT, polling: 1000 }), failed]);
  await page.screenshot({ path: out, timeout: TIMEOUT });
  const info = await page.evaluate(() => window.INFO), times = await page.evaluate(() => window.TIMES);
  const f = (a) => a.map((v) => (+v).toFixed(1));
  if (info?.site) console.log(`${info.site}: ${info.plans}/${info.of} plans, ${info.elements}/${info.elementsOf} elements within ${info.radius} m (built in ${info.buildSeconds}s), feet (${f(info.pose.slice(0, 3))}) yaw ${(+info.pose[3]).toFixed(2)} pitch ${(+info.pose[4]).toFixed(2)}, fov ${info.fov}, hour ${info.hour}`);
  else if (info) console.log(`bounds (${f(info.min)}) … (${f(info.max)}), camera (${f(info.cam)}) → (${f(info.look)}), fov ${info.fov}${info.sky ? `, sky of ${info.sky.site} at ${info.sky.hour}h` : ''}`);
  if (info?.draws) console.log(`last frame (all three cascades drawn): ${info.draws.drawCalls} draw calls, ${(info.draws.triangles / 1e6).toFixed(2)} M triangles${flag('nomerge') ? ' (plans not merged)' : ''}`);
  if (info?.stats) console.log(`meshes ${info.stats.meshes} (indexed ${info.stats.indexed}, 16-bit normals ${info.stats.int16}, instanced ${info.stats.instanced})`);
  if (times) console.log('times (s from page start):', Object.entries(times).map(([k, v]) => `${k} ${v}`).join(', '), `| total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log('→', out);
} catch (e) {
  console.log('showroom failed:', e.message.split('\n')[0]);
  process.exitCode = 1;
} finally {
  await browser.close(); srv.close();
}
