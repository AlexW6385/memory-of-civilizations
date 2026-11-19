#!/usr/bin/env node
// Draws the garden-and-street animals (src/engine/fauna-critters.js) from chosen viewpoints at chosen
// times, in a grid (the headless showroom does not run fauna).
// usage: node tools/critter-shot.mjs '<json: { critters:[…], shots:[{ T, cam:[x,y,z], look:[x,y,z], visitor?:[x,y,z], label? }], cols?, cell?:[w,h], fov?, water?:[{x,y,z,r}], boxes? }>' | @file.json [--out shots/critters.png]
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const src = args[0]?.startsWith('@') ? readFileSync(args[0].slice(1), 'utf8') : args[0];
if (!src || src.startsWith('--')) { console.log('usage: node tools/critter-shot.mjs @spec.json [--out f.png]'); process.exit(2); }
const cfg = JSON.parse(src); cfg.cell ||= [480, 360];
const out = opt('out', 'shots/critters.png'); mkdirSync(dirname(resolve(out)), { recursive: true });
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: cfg.cell[0] * (cfg.cols || 3), height: cfg.cell[1] * Math.ceil(cfg.shots.length / (cfg.cols || 3)) } });
let fail; const failed = new Promise((_, no) => { fail = no; });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 400)); });
page.on('pageerror', (e) => { console.log('pageerror', e.message); fail(e); });
await page.route('**/__shot/config.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(cfg) }));
try {
  await page.goto(`http://127.0.0.1:${srv.address().port}/tools/critter-shot.html`, { timeout: 600000 });
  await Promise.race([page.waitForFunction('window.DONE === true', null, { timeout: 600000, polling: 500 }), failed]);
  await page.screenshot({ path: out });
  console.log('→', out);
} catch (e) { console.log('failed:', e.message.split('\n')[0]); process.exitCode = 1; } finally { await browser.close(); srv.close(); }
