#!/usr/bin/env node
// Load the site headless and print its console for a while (debugging the start).
// usage: node tools/probe.mjs [seconds] [query] [--eval "expression" (run once ready)]
import { chromium } from 'playwright';
import { join } from 'node:path';
import { serve, ROOT } from './serve.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2);
const ev = args.includes('--eval') ? args[args.indexOf('--eval') + 1] : null;
const pos = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--eval');
const secs = +(pos[0] || 60), query = pos[1] || '';
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
const t0 = Date.now();
const stamp = () => ((Date.now() - t0) / 1000).toFixed(1);
page.on('console', (m) => { const s = m.text(); if (!/GPU stall|Automatic fallback/.test(s)) console.log(`[${stamp()}] ${m.type()}: ${s.slice(0, 400)}`); });
page.on('pageerror', (e) => console.log(`[${stamp()}] pageerror: ${e.message}\n${(e.stack || '').slice(0, 800)}`));
await page.route('**/*', async (route) => {
  const url = route.request().url();
  const m = url.match(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/);
  if (m) return route.fulfill({ path: join(ROOT, 'node_modules/three', m[1]), contentType: 'text/javascript' });
  if (/fonts\.(googleapis|gstatic)/.test(url)) return route.abort();
  return route.continue();
});
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?${query}`);
for (let i = 0; i < secs; i += 5) {
  await page.waitForTimeout(5000);
  const st = await page.evaluate(() => ({ ready: !!window.READY, status: document.getElementById('intro-status')?.textContent }));
  console.log(`[${stamp()}]`, JSON.stringify(st));
  if (st.ready) break;
}
if (ev) console.log('eval:', await page.evaluate(ev).catch((e) => 'error ' + e.message));
await browser.close(); srv.close();
