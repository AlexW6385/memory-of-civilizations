#!/usr/bin/env node
// Renders objects of the shared library (src/objects/) in a row, for a close look at them.
// usage: node tools/showroom.mjs '<items json>' [--out shots/showroom.png] [--cols 6] [--gap 4] [--cam x,y,z] [--night 1] [--size 1280x720]
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [W, H] = opt('size', '1280x720').split('x').map(Number);
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('pageerror', e.message));
const p = new URLSearchParams({ items: args[0], cols: opt('cols', '6'), gap: opt('gap', '4'), night: opt('night', '0'), style: opt('style', 'life'), imports: opt('imports', '') });
if (opt('cam')) p.set('cam', opt('cam'));
await page.goto(`http://127.0.0.1:${srv.address().port}/tools/showroom.html?${p}`);
await page.waitForFunction('window.DONE === true', null, { timeout: 600_000 });
await page.screenshot({ path: opt('out', 'shots/showroom.png') });
await browser.close(); srv.close();
console.log('→', opt('out', 'shots/showroom.png'));
