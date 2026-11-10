#!/usr/bin/env node
// Loads the site in headless Chromium (SwiftShader WebGPU) and prints console errors and warnings
// until it is ready (window.READY): a quick check that start-up and the shaders still work.
// usage: node tools/console-check.mjs
import { chromium } from 'playwright';
import { join } from 'node:path';
import { serve, ROOT } from '/home/claude/wt/smoke/tools/serve.mjs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const srv = await serve(0); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 400)));
await page.route('**/*', async (route) => { const url = route.request().url(); const m = url.match(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/); if (m) return route.fulfill({ path: join(ROOT, 'node_modules/three', m[1]), contentType: 'text/javascript' }); if (/fonts\.(googleapis|gstatic)/.test(url)) return route.abort(); return route.continue(); });
await page.goto(`http://127.0.0.1:${port}/index.html?quality=low&start=ming-suzhou&time=18`);
for (let i = 0; i < 60; i++) { await page.waitForTimeout(15000); const r = await page.evaluate(() => ({ ready: window.READY, gpu: !!navigator.gpu, p: document.querySelector('#progress, .progress')?.textContent })); console.log(i, JSON.stringify(r)); if (r.ready) break; }
await browser.close(); srv.close();
