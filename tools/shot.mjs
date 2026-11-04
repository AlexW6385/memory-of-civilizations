#!/usr/bin/env node
// Screenshots at fixed viewpoints (tools/viewpoints.json) in headless Chromium.
//
// usage: node tools/shot.mjs [--building edfu] [--only name,name] [--size 1280x800] [--time 15.5|cycle]
//                            [--out shots] [--webgl] [--quality high] [--wait 2500]
//        node tools/shot.mjs --sites athens,rome --first   (each settlement's first view)
//        node tools/shot.mjs --pose site,x,y,z,yaw,pitch --name custom   (a settlement's frame, feet)
//        node tools/shot.mjs --cam site,x,y,z,yaw,pitch --name custom    (free camera in its frame)
//        node tools/shot.mjs --fly lat,lon,height,yaw,pitch --name custom (camera above a place)
//        node tools/shot.mjs --place lat,lon,yaw --name custom            (standing at a place)
// The views in tools/viewpoints.json: "planet" (fly or place views) and, per building, points in
// the building's own coordinates.
//
// three.js is served from node_modules instead of the CDN; Google Fonts are skipped.
// Headless Chromium uses SwiftShader, a software GPU: slow, but it is real WebGPU.

import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { serve, ROOT } from './serve.mjs';
import { BUILDINGS } from '../src/buildings/index.js';
import { toWorld } from '../src/core/build.js';
import { SITES } from '../src/planet/sites.js';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const [W, H] = opt('size', '1280x800').split('x').map(Number);
const out = opt('out', join(ROOT, 'shots'));
const wait = +opt('wait', 2500);
await mkdir(out, { recursive: true });

let views = [];
const siteOf = (b) => SITES.find((s) => s.legacy?.buildings.includes(b))?.id;
if (opt('pose') || opt('cam')) {
  const a = (opt('pose') || opt('cam')).split(','), v = a.slice(1).map(Number);
  views.push({ name: opt('name', 'custom'), site: a[0], world: v.slice(0, 3), yaw: v[3] || 0, pitch: v[4] || 0, free: !!opt('cam') });
} else if (opt('fly')) {
  const v = opt('fly').split(',').map(Number);
  views.push({ name: opt('name', 'custom'), fly: v });
} else if (opt('place')) {
  const v = opt('place').split(',').map(Number);
  views.push({ name: opt('name', 'custom'), place: v });
} else {
  const all = JSON.parse(await readFile(join(ROOT, 'tools/viewpoints.json'), 'utf8'));
  const only = opt('only') ? opt('only').split(',') : null;
  for (const v of all.planet || []) {
    if ((opt('building') && opt('building') !== 'planet') || opt('sites')) continue;
    if (only && !only.includes(v.name)) continue;
    views.push({ name: `planet-${v.name}`, fly: v.fly, place: v.place });
  }
  const sites = opt('sites') ? opt('sites').split(',') : null;
  for (const [site, list] of Object.entries(all.settlements || {})) {
    if (opt('building') && opt('building') !== site) continue;
    if (sites && !sites.includes(site)) continue;
    if (!SITES.some((s) => s.id === site)) continue;
    for (const v of flag('first') ? list.slice(0, 1) : list) {
      if (only && !only.includes(v.name)) continue;
      views.push({ name: `${site}-${v.name}`, site, world: v.at, yaw: v.yaw, pitch: v.pitch, free: !!v.cam });
    }
  }
  for (const b of BUILDINGS) {
    if (opt('building') && opt('building') !== b.id) continue;
    const { plan } = await b.load();
    for (const v of all[b.id] || []) {
      if (only && !only.includes(v.name)) continue;
      const p = toWorld(plan, v.at[0], v.at[2], v.at[1]);
      views.push({ name: `${b.id}-${v.name}`, site: siteOf(b.id), world: p, yaw: v.yaw - (plan.yaw || 0) * Math.PI / 180, pitch: v.pitch, free: v.at[1] > 20 });
    }
  }
}

const srv = await serve(0);
const port = srv.address().port;
const gpuArgs = flag('webgl') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] :
  ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ args: [...gpuArgs, '--ignore-gpu-blocklist'] });
const mobile = W < 700;
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const log = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) log.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
await page.route('**/*', async (route) => {
  const url = route.request().url();
  const m = url.match(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/);
  if (m) return route.fulfill({ path: join(ROOT, 'node_modules/three', m[1]), contentType: 'text/javascript' });
  if (/fonts\.(googleapis|gstatic)/.test(url)) return route.abort();
  return route.continue();
});
const t0 = Date.now();
// the time of day: each region at its baked moment unless asked (--time 21.5)
const q = `quality=${opt('quality', 'high')}&time=${opt('time', '15.5')}&weather=${opt('weather', 'clear')}` + (opt('start') ? `&start=${opt('start')}` : '');
if (flag('webgl')) await page.addInitScript(() => { Object.defineProperty(navigator, 'gpu', { get: () => undefined }); });
await page.goto(`http://127.0.0.1:${port}/index.html?${q}`);
try { await page.waitForFunction('window.READY === true', null, { timeout: 600_000 }); }
catch (e) { log.push('timeout waiting for READY'); }
console.log(`ready after ${((Date.now() - t0) / 1000).toFixed(1)}s (${await page.evaluate(() => window.palace?.renderer.webgpu ? 'WebGPU' : 'WebGL2')})`);
if (!flag('intro')) await page.evaluate(() => { document.getElementById('intro').hidden = true; document.getElementById('notice').hidden = true; const h = document.getElementById('click-hint'); if (h) h.style.display = 'none'; for (const id of ['btn-lang', 'corner']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; } });
else await page.evaluate(() => { document.getElementById('stick').hidden = !matchMedia('(pointer: coarse)').matches; });
if (opt('eval')) console.log('eval:', await page.evaluate(opt('eval')));
if (flag('begin')) { await page.evaluate(() => window.palace.begin()); await page.waitForTimeout(8000); console.log('after begin:', await page.evaluate(() => JSON.stringify(window.palace.stats))); }
for (const v of views) {
  const t1 = Date.now();
  await page.evaluate(([v]) => (v.fly ? window.palace.fly(...v.fly) : v.place ? window.palace.place(...v.place)
    : v.free ? window.palace.camera(v.site, v.world[0], v.world[1], v.world[2], v.yaw, v.pitch) : window.palace.pose(v.site, v.world[0], v.world[1], v.world[2], v.yaw, v.pitch)), [v]);
  // the hour (local): as asked, or mid-morning for a settlement's view
  const site = v.site && SITES.find((s) => s.id === v.site), hour = opt('time') ?? (site ? 10.5 : 15.5);   // (the clock's hour is local to the visitor)
  for (let k = 0; k < 2; k++) { await page.evaluate((h) => { const c = window.palace.climate; if (Number.isFinite(+h)) { c.hour = +h; c.setTime('held'); } }, String(hour)); await page.waitForTimeout(3000); }   // twice: the clock is local, and the frame loop sets the new longitude
  await page.waitForTimeout(wait);
  const file = join(out, `${v.name}.png`);
  await page.screenshot({ path: file, timeout: 600_000 });
  console.log(`${v.name}: ${((Date.now() - t1) / 1000).toFixed(1)}s → ${file}`);
}
await browser.close();
srv.close();
const uniq = [...new Set(log)];
for (const l of uniq.slice(0, 25)) console.log('  ' + l.slice(0, 400));
process.exit(uniq.some((l) => l.startsWith('pageerror') || l.startsWith('error')) ? 1 : 0);
