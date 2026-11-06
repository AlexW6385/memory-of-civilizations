#!/usr/bin/env node
// Renders elements (of the shared library, src/objects/, or of any style) for a close look at them.
//
// usage: node tools/showroom.mjs '<items json>' | @items.json  [options]
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
//   --night 1  --size 1280x720
//   --timeout 1200             seconds to wait for the page to build and draw, and again for the
//                              screenshot (software WebGPU is slow on a busy machine)
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { chromium } from 'playwright';
import { serve, ROOT } from './serve.mjs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const [W, H] = opt('size', '1280x720').split('x').map(Number);
const TIMEOUT = +opt('timeout', 1200) * 1000;
const items = args[0]?.startsWith('@') ? readFileSync(args[0].slice(1), 'utf8') : args[0];
if (!items || items.startsWith('--')) { console.log('usage: node tools/showroom.mjs \'<items json>\' | @file.json [--style s] [--imports a,b] [--inplace] [--ground y|off] [--cam x,y,z] [--look x,y,z] [--out f.png] [--timeout s]'); process.exit(2); }
JSON.parse(items);   // fail here, not in the page
// each import: a style's name, or a module's path (served from the repo root)
const imports = opt('imports', '').split(',').filter(Boolean).map((s) => {
  if (!s.includes('/') && !s.endsWith('.js')) return `/src/styles/${s}/index.js`;
  const rel = relative(ROOT, isAbsolute(s) ? s : resolve(ROOT, s));
  if (rel.startsWith('..')) { console.log(`--imports ${s}: not inside the repository`); process.exit(2); }
  return '/' + rel.split('\\').join('/');
});
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
let fail;
const failed = new Promise((_, no) => { fail = no; });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 300)); });
page.on('pageerror', (e) => { console.log('pageerror', e.message); fail(e); });
const p = new URLSearchParams({ items, cols: opt('cols', '6'), gap: opt('gap', '4'), night: opt('night', '0'), style: opt('style', 'life'), imports: imports.join(','), ground: opt('ground', '0') });
if (flag('inplace')) p.set('inplace', '1');
if (opt('cam')) p.set('cam', opt('cam'));
if (opt('look')) p.set('look', opt('look'));
const out = opt('out', 'shots/showroom.png');
try {
  await page.goto(`http://127.0.0.1:${srv.address().port}/tools/showroom.html?${p}`, { timeout: TIMEOUT });
  await Promise.race([page.waitForFunction('window.DONE === true', null, { timeout: TIMEOUT, polling: 1000 }), failed]);
  await page.screenshot({ path: out, timeout: TIMEOUT });
  const info = await page.evaluate(() => window.INFO);
  if (info) console.log(`bounds (${info.min.map((v) => v.toFixed(1))}) … (${info.max.map((v) => v.toFixed(1))}), camera (${info.cam.map((v) => v.toFixed(1))}) → (${info.look.map((v) => v.toFixed(1))})`);
  console.log('→', out);
} catch (e) {
  console.log('showroom failed:', e.message.split('\n')[0]);
  process.exitCode = 1;
} finally {
  await browser.close(); srv.close();
}
