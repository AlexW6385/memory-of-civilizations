// Memory of Civilizations — boot, interface and the frame loop.

import { Renderer } from './engine/renderer.js';
import { World } from './engine/world.js';
import { Controls } from './engine/controls.js';
import { Music } from './engine/audio.js';
import { Climate, sunPlanet, moonPlanet } from './engine/climate.js';
import { Rain } from './engine/rain.js';
import { GlobeView } from './ui/globe.js';
import { MiniMap } from './ui/minimap.js';
import { initLang, setLang, getLang, t, onLang } from './ui/i18n.js';
import { toWorld } from './core/build.js';
import { viewpoint, openYaw, standAt } from './core/arrival.js';
import { dirToLocal, toPlanet, latLon, norm, enuFrame, unit } from './planet/geo.js';
import { climateAt } from './planet/land.js';
import { PLANET_RADIUS, BLEND } from './planet/relief.js';
import { REGION } from './world/regions.js';
import { openClimate } from './planet/climates.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

// the picture is always made at the highest quality (?quality=medium|low for testing); the music's
// level and the look sensitivity are fixed; only the time of day is remembered between visits
const settings = { quality: params.get('quality') || 'high', music: 0.6, sensitivity: 1, timeRuns: true, utc: 14, ...load('mp.time', {}) };

function sm(e0, e1, x) { const q = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return q * q * (3 - 2 * q); }
function load(k, d) { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch { return d; } }
function save() { try { localStorage.setItem('mp.time', JSON.stringify({ timeRuns: settings.timeRuns, utc: settings.utc })); } catch { /* ignore */ } }

/**
 * The loading bar. The start is a row of stages — the renderer, then the buildings and the ground
 * together, the plants, the shaders — each reporting its fraction done. Each stage's share of the
 * bar is the time it took on this machine the last time (kept in storage), so that the bar moves
 * at an even pace; without a last time, typical shares. The shaders report nothing while they
 * compile: there the bar follows the time they took last time. The bar never goes back.
 */
class Progress {
  constructor(bar, text) {
    this.bar = bar; this.text = text;
    this.t0 = performance.now();
    this.order = ['start', 'world', 'plants', 'shaders'];
    this.f = {}; this.end = {};
    let prev = null;
    try { prev = JSON.parse(localStorage.getItem('mp.loadtimes') || 'null'); } catch { /* storage unavailable */ }
    this.prev = prev;
    const d = prev?.d || { start: 2, world: 7, plants: 2.5, shaders: 9 };
    const tot = this.order.reduce((s, k) => s + Math.max(0.3, d[k] || 1), 0);
    this.w = Object.fromEntries(this.order.map((k) => [k, Math.max(0.3, d[k] || 1) / tot]));
    this.d = d; this.shown = 0;
    this.timer = setInterval(() => this.paint(), 100);
  }
  /** stage: start | build | land | plants | shaders; build and land together make the 'world' stage. */
  set(stage, f) {
    if (stage === 'build' || stage === 'land') { this.f[stage] = Math.max(this.f[stage] || 0, f); f = 0.4 * (this.f.build || 0) + 0.6 * (this.f.land || 0); stage = 'world'; }
    this.f[stage] = Math.max(this.f[stage] || 0, Math.min(1, f));
    if (this.f[stage] >= 1 && !this.end[stage]) this.end[stage] = performance.now();
    if (stage === 'shaders' && !this.shaderT0) this.shaderT0 = performance.now();
  }
  value() {
    if (this.shaderT0 && (this.f.shaders || 0) < 1) {
      const exp = Math.max(2, this.d.shaders || 9), el = (performance.now() - this.shaderT0) / 1000;
      // follow last time's duration, slowing toward 97% if it takes longer
      this.f.shaders = el < exp ? 0.9 * el / exp : 0.9 + 0.07 * (1 - Math.exp(-(el - exp) / exp));
    }
    let v = 0; for (const k of this.order) v += this.w[k] * (this.f[k] || 0); return v;
  }
  paint() {
    const p = this.value();
    this.shown = Math.max(this.shown, p);
    this.bar.style.width = `${(this.shown * 100).toFixed(1)}%`;
    const el = (performance.now() - this.t0) / 1000;
    let left = null;
    if (this.prev?.total) left = Math.max(0, (1 - this.shown) * this.prev.total);
    else if (this.shown > 0.08) left = el / this.shown - el;
    const tail = left === null ? '' : left < 1.5 ? ` · ${t('left-done')}` : ` · ${t('left-s').replace('{n}', Math.ceil(left))}`;
    this.text.textContent = `${Math.round(this.shown * 100)}%${tail}`;
  }
  finish() {
    clearInterval(this.timer);
    const now = performance.now(), total = (now - this.t0) / 1000;
    // each stage's own time: from the end of the one before (the world after the start, …)
    const d = {}; let from = this.t0;
    for (const k of this.order) { const e = this.end[k] || now; d[k] = Math.max(0.2, (e - from) / 1000); from = Math.max(from, e); }
    try { localStorage.setItem('mp.loadtimes', JSON.stringify({ total, d })); } catch { /* ignore */ }
    this.shown = 1; this.bar.style.width = '100%';
    this.text.textContent = '100%';
  }
}

async function main() {
  initLang();
  // the one button: the language (there from the start, the loading included)
  const langBtn = $('btn-lang');
  const paintLang = () => { langBtn.textContent = getLang() === 'zh' ? 'EN' : '中'; };
  langBtn.onclick = () => setLang(getLang() === 'zh' ? 'en' : 'zh');
  onLang(paintLang); paintLang();
  const status = $('intro-status');
  const progress = new Progress($('progress-bar'), status);
  const canvas = $('view');
  if (!navigator.gpu) { $('notice').textContent = t('no-webgpu'); $('notice').hidden = false; setTimeout(() => { $('notice').hidden = true; }, 12000); }

  // timings of the start, in the console (and kept for the next visit's estimate)
  let T0 = performance.now(), times = {};
  const mark = (k) => { times[k] = Math.round(performance.now() - T0); };
  progress.set('start', 0.15);
  const R = await new Renderer(canvas).init(settings.quality);
  mark('renderer');
  progress.set('start', 0.7);
  const world = new World(R);
  await world.init();
  mark('plans');
  progress.set('start', 1);
  const climate = new Climate(R);
  // the time of day: it runs (days pass) or is held, from the hour the visitor last chose; the URL
  // may hold it (?time=21.5, the hour where one arrives) or run it (?time=cycle)
  climate.utc = Number.isFinite(+settings.utc) ? +settings.utc : 14;
  climate.setTime(settings.timeRuns ? 'cycle' : 'held');
  const tq = params.get('time');
  const floraScale = { high: 1, medium: 0.7, low: 0.45 };
  world.flora.scale = world.openFlora.scale = floraScale[settings.quality] ?? 1;
  const controls = new Controls(R.camera, canvas, world.collide);
  world.onCollide = (c) => { controls.collide = c; };
  controls.sensitivity = settings.sensitivity;
  const music = new Music();
  music.setVolume(settings.music);
  let exposure = 0.55, snap = true, last = performance.now();
  const stats = { frames: 0, ms: 0 };
  const rain = new Rain(R.scene, R.camera);

  // the planet position of the camera, for the ground's detail
  const camPlanet = () => toPlanet(world.anchor.frame, R.camera.position.toArray());
  // arriving somewhere: the settlement (if any), the ground and the plants round are made before
  // the view is shown; everything further comes in while walking
  const arrive = async (report = null) => {
    const site = world.anchor.site;
    const u = world.here(controls);
    const poll = site && report ? setInterval(() => report('build', site.fraction), 150) : null;
    await Promise.all([
      (site ? site.load() : Promise.resolve()).then(() => { clearInterval(poll); report?.('build', 1); mark('buildings'); }),
      world.terrain.readyAt(camPlanet, (f) => report?.('land', f)).then(() => mark('land')),
    ]);
    world.ensureNear(u);
    world.update(R.camera, controls);
    if (site) { const F = controls.feet; const L = [F.x, F.z]; await world.flora.ready(L[0], L[1], (f) => report?.('plants', f), 140); }
    report?.('plants', 1); mark('plants');
  };
  const boot = (stage, f) => progress.set(stage, f);
  // a free place to stand near (x, z), once everything there is built: on the ground or a floor,
  // not in water, with nothing built over the head and no wall in the body — so that one never
  // arrives inside a building, under a roof or below the ground
  const clearSpot = (x, z) => {
    const C = world.collide;
    for (let r = 0; r <= 45; r += 1.5) {
      const n = r === 0 ? 1 : Math.ceil(r * 2);
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, g = standAt(C, px, pz);
        if (g !== null) return [px, g, pz];
      }
    }
    return [x, Math.max(C.groundAt(x, z, 1e4), C.topAt(x, z, 0.3, 1e4)), z];
  };
  const settle = () => {
    const F = controls.feet, [x, y, z] = clearSpot(F.x, F.z);
    controls.setPose(x, y + 0.01, z, controls.yaw, controls.pitch);
    world.place(R.camera);
  };
  // to a building's entrance: into its settlement's frame
  const goTo = async (rec, report) => {
    const site = rec.site;
    world.setAnchor(site.S.frame, site);
    const [x, y, z, yaw] = world.entrance(rec.plan);
    controls.feet = { x, y, z }; controls.yaw = yaw; controls.pitch = 0.04;
    world.tilt.identity();
    await site.load();
    controls.setPose(x, y, z, yaw, 0.04);
    world.place(R.camera);
    await arrive(report);
    controls.setPose(x, y, z, yaw, 0.04);
  };
  // to any point of the planet (lat, lon): stand on the ground there, facing `yaw` from north
  const goToPlace = async (lat, lon, report, yaw = 0) => {
    world.setAnchor(enuFrame(unit(lat, lon), PLANET_RADIUS), null);
    world.tilt.identity();
    const g = world.collide.groundAt(0, 0, 1e4);
    controls.setPose(0, Math.max(g, world.collide.waterLevel(0, 0)) + 0.05, 0, yaw, 0.02);
    world.reanchor(controls);                   // into a settlement's frame if this is in its zone
    controls.apply(); world.place(R.camera);
    await arrive(report);
    settle();
    // face the widest view (leaning toward the nearest settlement, if any is close)
    const F = controls.feet, near = world.anchor.site;
    const prefer = near ? Math.atan2(-(near.S.local.center[0] - F.x), -(near.S.local.center[1] - F.z)) : null;
    controls.setPose(F.x, F.y, F.z, openYaw(world.collide, F.x, F.y, F.z, prefer), 0.03);
    world.place(R.camera);
  };
  // from the map: beside the settlement's landmark, a little way in front of it and facing it
  const goNear = async (rec, report) => {
    const site = rec.site, plan = rec.plan;
    // the landmark's main body (a rectangle in the settlement's frame)
    const b = plan.view || plan.bakeBounds || plan.bounds;
    const c0 = toWorld(plan, b[0], b[1]), c1 = toWorld(plan, b[2], b[3]);
    const core = [Math.min(c0[0], c1[0]), Math.min(c0[2], c1[2]), Math.max(c0[0], c1[0]), Math.max(c0[2], c1[2])];
    // into the settlement's frame, standing in its zone at once (the frame loop runs during the
    // waits below, and would otherwise carry the visitor out into the open country's frame)
    const inFrame = () => { world.setAnchor(site.S.frame, site); world.tilt.identity(); };
    inFrame();
    const [lx, lz] = site.S.local.center;
    controls.setPose(lx, 1e4, lz, 0, 0);
    await site.load();
    inFrame();
    const part = site.parts.find((p) => p.plan === plan);
    let top = (plan.base || 0) + (plan.bakeTop || 15);
    if (part) for (const { geometry } of part.built.parts) top = Math.max(top, Math.min(geometry.boundingBox.max.y, (plan.base || 0) + 60));
    const dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[plan.entrance?.facing] || [0, -1];
    const fw = toWorld(plan, -dir[0], -dir[1]), o = toWorld(plan, 0, 0), front = [fw[0] - o[0], fw[2] - o[2]];
    const cxw = (core[0] + core[2]) / 2, czw = (core[1] + core[3]) / 2;
    const place = () => viewpoint(world.collide, core, top, front, world.flora.trees(cxw, czw, 260), plan.viewY != null ? (plan.base || 0) + plan.viewY : null);
    let v = place();
    const cx = (core[0] + core[2]) / 2, cz = (core[1] + core[3]) / 2;
    const start = v || { x: cx + front[0] * 30, y: world.collide.groundAt(cx + front[0] * 30, cz + front[1] * 30, 1e4), z: cz + front[1] * 30, yaw: Math.atan2(front[0], front[1]), pitch: 0.08 };
    controls.setPose(start.x, start.y + 0.02, start.z, start.yaw, start.pitch);
    world.place(R.camera);
    await arrive(report);
    inFrame();
    // the ground and the plants are in now: choose again (nothing changes for the buildings)
    v = place() || start;
    controls.setPose(v.x, v.y + 0.01, v.z, v.yaw, v.pitch);
    if (!place()) settle();
    world.place(R.camera);
  };
  const first = world.plans.get(params.get('start') || 'edfu') || world.plans.get('edfu');
  if (params.get('pose')) {
    // ?pose=site,x,y,z,yaw,pitch (in the settlement's frame) or ?pose=lat,lon (on the planet)
    const p = params.get('pose').split(',');
    if (world.byId[p[0]]) {
      const site = world.byId[p[0]], v = p.slice(1).map(Number);
      world.setAnchor(site.S.frame, site);
      await site.load();
      controls.setPose(v[0], v[1], v[2], v[3] || 0, v[4] || 0);
      world.place(R.camera);
      await arrive(boot);
      controls.setPose(v[0], v[1], v[2], v[3] || 0, v[4] || 0);
    } else await goToPlace(+p[0], +p[1], boot, +(p[2] || 0));
  } else await goTo(first, boot);
  if (tq) {
    const h = parseFloat(tq);
    climate.lonHours = latLon(world.here(controls))[1] / 15;
    if (Number.isFinite(h)) { climate.hour = h; climate.setTime('held'); } else climate.setTime('cycle');
  }

  progress.set('shaders', 0);
  progress.shaderT0 = performance.now();
  frameOnce(0);
  await R.warmup();
  mark('shaders');
  console.info('[memory of civilizations] start (ms):', JSON.stringify(times));
  progress.set('shaders', 1);
  progress.finish();

  // interface: the world opens by itself; a click (or a key) starts looking and the music
  const intro = $('intro'), mapPanel = $('map'), hint = $('click-hint');
  intro.classList.add('fading');
  setTimeout(() => { intro.hidden = true; intro.classList.remove('fading'); }, 850);
  // the corner card folds into one button (remembered; folded by default on phones)
  const corner = $('corner'), cornerOpen = $('corner-open');
  let folded = matchMedia('(max-width: 560px)').matches;
  try { const f = localStorage.getItem('mp.card'); if (f) folded = f === 'folded'; } catch { /* storage unavailable */ }
  const fold = (f) => {
    folded = f; corner.hidden = f; cornerOpen.hidden = !f;
    try { localStorage.setItem('mp.card', f ? 'folded' : 'open'); } catch { /* ignore */ }
  };
  fold(folded);
  $('corner-fold').onclick = (e) => { e.stopPropagation(); fold(true); };
  cornerOpen.onclick = () => fold(false);
  $('stick').hidden = !controls.touch;
  $('touch-btns').hidden = !controls.touch;
  controls.enabled = true;
  hint.hidden = controls.touch;
  const panelsOpen = () => !mapPanel.hidden;
  const begin = () => { music.start(); controls.enabled = true; hint.hidden = true; };
  canvas.addEventListener('pointerdown', () => { music.start(); if (!panelsOpen()) { controls.enabled = true; controls.lock(); } });
  addEventListener('keydown', () => music.start(), { once: true });
  controls.onLockChange = (locked) => {
    hint.hidden = locked || controls.touch || panelsOpen();
    if (locked) controls.enabled = true;
  };

  // going somewhere from the map: to a building's entrance, or to any point of the land
  const toast = (msg) => { const n = $('notice'); n.textContent = msg; n.hidden = !msg; };
  // travelling: the view fades out, the new place is made ready (ground, plants, buildings, their
  // shaders), and the view fades in there
  const fade = $('fade');
  const travel = async (fn) => {
    closePanels(); toast(t('travelling'));
    fade.hidden = false; requestAnimationFrame(() => fade.classList.add('on'));
    T0 = performance.now(); times = {};
    // the notice counts down what is still being made ready
    const f = { build: 0, land: 0, plants: 0 };
    const report = (stage, v) => { f[stage] = v; toast(`${t('travelling')} ${Math.round((f.build * 0.45 + f.land * 0.35 + f.plants * 0.2) * 90)}%`); };
    try {
      await fn(report);
      frameOnce(0);
      toast(`${t('travelling')} 95%`);
      await R.warmup();
      mark('shaders');
      console.info('[memory of civilizations] travel (ms):', JSON.stringify(times));
    } finally {
      toast(''); fade.classList.remove('on'); setTimeout(() => { fade.hidden = true; }, 400);
    }
  };
  const mapView = new GlobeView(world, (rec) => travel((report) => goNear(rec, report)), (lat, lon) => travel((report) => goToPlace(lat, lon, report)), () => sunPlanet(climate.utc));

  const closePanels = () => {
    mapPanel.hidden = true;
    document.body.classList.remove('panel-open');
    controls.enabled = true;
    if (!controls.touch) { controls.lock(); hint.hidden = !!document.pointerLockElement; }
  };
  const openPanel = (p) => {
    controls.enabled = false; controls.unlock();
    hint.hidden = true;
    p.hidden = false;
    document.body.classList.add('panel-open');
    if (p === mapPanel) mapView.open(world.here(controls), heading());
  };
  const minimap = new MiniMap(world, mapView, () => openPanel(mapPanel), () => sunPlanet(climate.utc));

  for (const c of document.querySelectorAll('.panel .close')) c.onclick = closePanels;
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyM') mapPanel.hidden ? openPanel(mapPanel) : closePanels();
    if (e.code === 'Escape' && panelsOpen()) closePanels();
  });

  // the clock beside the small map: the hour (drag to change it) and run / hold
  const clockTime = $('clock-time'), clockHour = $('clock-hour'), clockPlay = $('clock-play'), clockIcon = $('clock-icon'), clockPeriod = $('clock-period');
  const paintClock = () => {
    const h = climate.hour, hh = Math.floor(h) % 24, mm = Math.floor((h - Math.floor(h)) * 60);
    clockTime.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    if (document.activeElement !== clockHour) clockHour.value = h;
    const runs = climate.mode === 'cycle';
    clockPlay.textContent = runs ? '❚❚' : '▶';
    const day = climate.state?.day ?? 1;
    clockIcon.style.background = day > 0.5 ? '#ffcf6e' : '#dfe5f5';
    clockIcon.style.boxShadow = day > 0.5 ? '0 0 10px #ffcf6e' : 'inset -4px -1px 0 #7d86a0, 0 0 6px rgba(200, 210, 240, 0.5)';
    const periods = t('periods'), bounds = [5, 7, 11, 14, 17.5, 20, 22];
    let k = bounds.findIndex((b) => h < b); if (k < 0) k = 7;
    clockPeriod.textContent = periods[k];
  };
  clockHour.oninput = () => {
    climate.hour = +clockHour.value % 24;
    settings.utc = climate.utc; save(); paintClock();
  };
  clockPlay.onclick = () => {
    const runs = climate.mode !== 'cycle';
    climate.setTime(runs ? 'cycle' : 'held');
    settings.timeRuns = runs; settings.utc = climate.utc; save(); paintClock();
  };
  setInterval(() => { paintClock(); settings.utc = climate.utc; }, 1000);
  setInterval(save, 15000);
  paintClock();
  // how the visitor is moving, under the clock: walking, running or flying, how fast, how high
  const gaitIcon = $('gait-icon'), speedName = $('speed-name'), speedKmh = $('speed-kmh'), speedAlt = $('speed-alt'), speedBar = $('speed-bar');
  const GLYPH = { still: '•', walk: '›', run: '»', fly: '⌃' };
  const paintSpeed = () => {
    const g = controls.gait, F = controls.feet;
    if (gaitIcon.textContent !== GLYPH[g]) gaitIcon.textContent = GLYPH[g];
    const name = t('gaits')[g];
    if (speedName.textContent !== name) speedName.textContent = name;
    const kmh = Math.round(controls.speedNow * 3.6);
    speedKmh.textContent = String(kmh);
    const up = g === 'fly' ? Math.max(0, F.y - world.collide.groundAt(F.x, F.z, F.y + 0.01)) : 0;
    void F;
    speedAlt.textContent = up >= 1 ? `${Math.round(up)} ${t('above-ground')}` : '';
    speedBar.style.width = `${Math.min(100, Math.sqrt(kmh / 400) * 100)}%`;
    speedBar.classList.toggle('fly', g === 'fly');
  };
  setInterval(paintSpeed, 250);
  onLang(() => { paintSpeed(); paintClock(); });

  // the visitor's heading: the angle of the view from north, clockwise (for the maps)
  const heading = () => {
    const u = world.here(controls), f = world.anchor.frame;
    const fwd = [-Math.sin(controls.yaw), 0, -Math.cos(controls.yaw)];
    const fp = [0, 1, 2].map((i) => f.x[i] * fwd[0] + f.y[i] * fwd[1] + f.z[i] * fwd[2]);
    const e = norm([u[2], 0, -u[0]]), n = [-u[1] * u[0] / Math.hypot(u[0], u[2] || 1e-9) || 0, Math.hypot(u[0], u[2]), -u[1] * u[2] / (Math.hypot(u[0], u[2]) || 1e-9)];
    return Math.atan2(fp[0] * e[0] + fp[1] * e[1] + fp[2] * e[2], fp[0] * n[0] + fp[1] * n[1] + fp[2] * n[2]);
  };

  // frame loop
  function frameOnce(dt) {
    if (!controls.free) { world.reanchor(controls); controls.apply(); }
    world.place(R.camera, !controls.free);
    const here = world.update(R.camera, controls);
    const c = R.camera.position;
    const u = world.here(controls), f = world.anchor.frame;
    R.setRange(world.camAlt ?? 2, c.y - world.collide.terrain(c.x, c.z));
    const outdoors = !here.room || here.room.kind === 'open';
    climate.indoors += ((outdoors ? 0 : 1) - climate.indoors) * Math.min(1, dt / 1.5);
    // the sky: the settlement's own in its zone, blended out into the open country's
    climate.lonHours = latLon(u)[1] / 15;
    const zones = [];
    const near = world.nearestSite(u);
    const open = openClimate(climateAt(u));
    if (near) {
      const w = 1 - sm(near.s.S.radius + BLEND * 0.5, near.s.S.radius + BLEND + 250, near.r);
      zones.push({ zone: { id: near.s.id, climate: near.s.S.ground?.climate || REGION[near.s.S.focus.region].climate }, w });
      for (const z of open) zones.push({ zone: z.zone, w: z.w * (1 - w) });
    } else zones.push(...open);
    const cl = climate.update({ sun: dirToLocal(f, sunPlanet(climate.utc)), moon: dirToLocal(f, moonPlanet(climate.utc)), up: dirToLocal(f, u), zones }, Math.min(dt, 0.25));
    rain.update(dt, cl.rain, outdoors);
    music.ambience(cl.rain, cl.windy, !outdoors);
    // eye adaptation: open up in dark rooms (at most ~3 stops), close down outdoors
    const amb = R.gi.ambientAt(c.x, c.y, c.z);
    const target = cl.exposure * (1 + 2.6 * (1 - cl.day)) * Math.min(8 + 6 * (1 - cl.day), Math.max(1, Math.pow(R.gi.openAmbient() / Math.max(amb, 1e-4), 0.55)));
    exposure = snap ? target : exposure + (target - exposure) * (1 - Math.exp(-dt / (target > exposure ? 1.6 : 0.6)));
    snap = false;
    R.renderer.toneMappingExposure = exposure;
    if (here.building) music.set(here.building.music, here.room?.kind || 'open');
    else music.set(world.anchor.site?.music || null, 'open');
    return here;
  }
  const frame = () => {
    const now = performance.now(), dt = (now - last) / 1000;
    last = now;
    controls.update(dt);
    frameOnce(dt);
    minimap?.update(world.here(controls), heading());
    R.render();
    stats.frames++; stats.ms = stats.ms * 0.9 + (performance.now() - now) * 0.1;
  };
  R.renderer.setAnimationLoop(frame);

  // hooks for the screenshot and walk-through tools (poses in a settlement's frame, or on the planet)
  window.palace = {
    pose: async (site, x, y, z, yaw = 0, pitch = 0) => {
      const s = world.byId[site];
      world.setAnchor(s.S.frame, s); world.tilt.identity();
      await s.load(); controls.setPose(x, y, z, yaw, pitch); world.place(R.camera); await arrive(); controls.setPose(x, y, z, yaw, pitch); snap = true;
    },
    place: async (lat, lon, yaw = 0) => { await goToPlace(lat, lon, null, yaw); snap = true; },
    settle: () => { snap = true; },
    camera: async (site, x, y, z, yaw = 0, pitch = 0) => {
      await window.palace.pose(site, x, Math.max(y, 0), z, yaw, pitch);
      controls.free = true; R.camera.position.set(x, y, z); R.camera.rotation.set(pitch, yaw, 0, 'YXZ'); world.place(R.camera, false);
      await world.terrain.readyAt(camPlanet);
    },
    fly: async (lat, lon, height, yaw = 0, pitch = -0.3) => {
      await goToPlace(lat, lon, null, yaw);
      controls.free = true;
      const g = controls.feet.y;
      R.camera.position.set(controls.feet.x, g + height, controls.feet.z); R.camera.rotation.set(pitch, yaw, 0, 'YXZ');
      world.place(R.camera, false);
      await world.terrain.readyAt(camPlanet);
      snap = true;
    },
    entrance: (id) => goTo(world.plans.get(id)),
    near: (id) => goNear(world.plans.get(id)),
    walk: async (keys, ms) => { controls.enabled = true; for (const k of keys) controls.keys.add(k); await new Promise((r) => setTimeout(r, ms)); controls.keys.clear(); },
    feet: () => ({ ...controls.feet }),
    world, renderer: R, controls, stats, music, climate, mapView,
    ground: (x, z) => world.collide.terrain(x, z),
    begin,
  };
  window.READY = true;
}

main().catch((e) => {
  console.error(e);
  $('intro-status').textContent = t('error') + (e.message || e);
});
