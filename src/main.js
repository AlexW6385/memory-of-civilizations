// Memory of Civilizations — boot, interface and the frame loop.

import { Vector3 } from 'three';
import { Renderer } from './engine/renderer.js';
import { ENV } from './engine/env.js';
import { World } from './engine/world.js';
import { Perf } from './engine/perf.js';
import { runBench } from './engine/bench.js';
import { HITCH } from './engine/hitch.js';
import { DynamicResolution } from './engine/dynres.js';
import { Controls } from './engine/controls.js';
import { Music } from './engine/audio.js';
import { roomAcoustics } from './engine/acoustics.js';
import { profileOf, due } from './engine/soundscape.js';
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
import { ARRIVALS } from './planet/arrivals.js';
import { Tour } from './ui/tour.js';
import { nearest, peek, take } from './ui/order.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

// the picture's quality: measured on the first visit (autoQuality below) and remembered, or as the
// address says (?quality=high|medium|low); the music's level and the look sensitivity are fixed;
// the time of day is remembered between visits
const QUALITIES = ['high', 'medium', 'low'];
const storedQuality = (() => { try { const q = JSON.parse(localStorage.getItem('mp.quality') || 'null')?.q; return QUALITIES.includes(q) ? q : null; } catch { return null; } })();
const askedQuality = QUALITIES.includes(params.get('quality')) ? params.get('quality') : null;
const settings = { quality: askedQuality || storedQuality || 'high', music: 0.6, sensitivity: 1, timeRuns: true, utc: 14, ...load('mp.time', {}) };

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
  set(stage, f, detail = '') {
    this.label = stage; this.detail = detail;
    (this.details ||= {})[stage] = detail;
    if (stage === 'renderer' || stage === 'map' || stage === 'plans') {
      // the start's own steps: the renderer, the land map, the plans of the first buildings
      f = stage === 'renderer' ? 0.05 + 0.3 * f : stage === 'map' ? 0.35 + 0.15 * f : 0.5 + 0.5 * f;
      stage = 'start';
    }
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
    const p = this.value(), now = performance.now();
    if (p > this.shown + 1e-4 || this.label !== this.lastLabel) { this.movedAt = now; this.lastLabel = this.label; }
    this.shown = Math.max(this.shown, p);
    this.bar.style.width = `${(this.shown * 100).toFixed(1)}%`;
    if (this.error) return;
    // the step in hand, so that a bar that stops says where: "37% · buildings 12/44"; after five
    // seconds without moving, how long it has waited there
    const name = (k) => `${t('ld')[k] || k}${this.details?.[k] ? ' ' + this.details[k] : ''}`;
    // the buildings and the ground come in together: both are shown while either is coming
    const step = !this.label ? '' : (this.label === 'build' || this.label === 'land') ? ` · ${name('build')} · ${name('land')}` : ` · ${name(this.label)}`;
    const wait = now - (this.movedAt || now) > 5000 ? ` (${Math.round((now - this.movedAt) / 1000)} s)` : '';
    this.text.textContent = `${(this.shown * 100).toFixed(this.shown < 0.1 ? 1 : 0)}%${step}${wait}`;
  }
  /** Something failed during the start: say what and where, and stop pretending to move. */
  fail(msg) {
    this.error = true;
    this.text.textContent = `${Math.round(this.shown * 100)}% · ${t('ld')[this.label] || this.label || ''} — ${t('error')}${msg}`;
    this.text.style.whiteSpace = 'normal';
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
  const progress = window.__progress = new Progress($('progress-bar'), status);
  const canvas = $('view');
  if (!navigator.gpu) { $('notice').textContent = t('no-webgpu'); $('notice').hidden = false; setTimeout(() => { $('notice').hidden = true; }, 12000); }

  // timings of the start, in the console (and kept for the next visit's estimate)
  let T0 = performance.now(), times = {};
  const mark = (k) => { times[k] = Math.round(performance.now() - T0); };
  // any error during the start shows on the loading screen with the step it stopped at
  const onErr = (e) => { if (!window.READY) progress.fail(String(e?.reason?.message || e?.message || e?.reason || e)); };
  addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
  progress.set('renderer', 0);
  // the hitch logger (`?perf`): on before the renderer and the world make their workers
  if (params.has('perf')) HITCH.enable();
  const R = await new Renderer(canvas).init(settings.quality);
  HITCH.watchRenderer(R.renderer);
  mark('renderer');
  progress.set('renderer', 1);
  const world = new World(R);
  await world.init((step, f) => progress.set(step, f, step === 'plans' ? '' : ''));
  // frame costs (`?perf` shows the panel; tools/perf.mjs uses window.palace.perf)
  const perf = new Perf(world, R);
  if (params.has('perf')) perf.show();
  // the pixel ratio lowered and raised by the frame time on the high preset; ?dpr=x pins it
  const dynres = perf.dynres = new DynamicResolution(R, params.has('dpr') ? parseFloat(params.get('dpr')) : null);
  mark('plans');
  progress.set('plans', 1);
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
  let placeT = 0, clockWas = null, preparedFor = null;
  const MANY_MOSQUES = new Set(['ottoman-istanbul', 'mamluk-cairo', 'isfahan']);
  const MODERN = new Set(['new-york', 'sydney', 'london', 'barcelona']);
  const AMB_TAPS = [[0, 0, 0], [1.2, 0, 0], [-1.2, 0, 0], [0, 0, 1.2], [0, 0, -1.2], [0, 0.9, 0]];
  const _view = new Vector3();
  const stats = { frames: 0, ms: 0 };
  const rain = new Rain(R.scene, R.camera);

  // the planet position of the camera, for the ground's detail
  const camPlanet = () => toPlanet(world.anchor.frame, R.camera.position.toArray());
  // arriving somewhere: the settlement (if any), the ground and the plants round are made before
  // the view is shown; everything further comes in while walking
  const arrive = async (report = null) => {
    const site = world.anchor.site;
    const u = world.here(controls);
    const poll = site && report ? setInterval(() => report('build', site.fraction, `${Math.min(site.done | 0, site.expected | 0)}/${site.expected | 0}`), 150) : null;
    await Promise.all([
      (site ? site.load() : Promise.resolve()).then(() => { clearInterval(poll); report?.('build', 1); mark('buildings'); }),
      world.terrain.readyAt(camPlanet, (f) => report?.('land', f, `${Math.round(f * 100)}%`)).then(() => mark('land')),
    ]);
    world.ensureNear(u);
    world.update(R.camera, controls);
    if (site) { const F = controls.feet; const L = [F.x, F.z]; await world.flora.ready(L[0], L[1], (f) => report?.('plants', f), 140); }
    report?.('plants', 1); mark('plants');
  };
  const boot = (stage, f, detail) => progress.set(stage, f, detail);
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
    // the settlement's chosen arrival (src/planet/arrivals.js): exactly there, facing its view
    const A = ARRIVALS[site.id];
    if (A) {
      const [ax, ay, az, ayaw, apitch] = A, feet = () => (ay ?? world.collide.terrain(ax, az));
      controls.setPose(ax, feet() + 0.02, az, ayaw, apitch);
      world.place(R.camera);
      await arrive(report);
      inFrame();
      controls.setPose(ax, feet() + 0.01, az, ayaw, apitch);
      world.place(R.camera);
      return;
    }
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
  let first = world.plans.get(params.get('start') || 'edfu');
  if (!first && params.get('start')) { await world.loadPlans(); first = world.plans.get(params.get('start')); }
  first ||= world.plans.get('edfu');
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
  const intro = $('intro'), mapPanel = $('map');
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
  const panelsOpen = () => !mapPanel.hidden;
  // a double click takes the mouse for looking round; Esc gives it back
  // the sound: muted by default (remembered); the button top right turns it on and off
  let muted = true;
  try { muted = localStorage.getItem('mp.sound') !== 'on'; } catch { /* storage unavailable */ }
  const muteBtn = $('btn-mute');
  const paintMute = () => {
    muteBtn.classList.toggle('sound', !muted);
    const k = muted ? 'sound-on' : 'sound-off';
    muteBtn.dataset.i18nLabel = k; muteBtn.dataset.i18nTitle = k; muteBtn.title = t(k); muteBtn.setAttribute('aria-label', t(k));
  };
  muteBtn.onclick = (e) => {
    e.stopPropagation();
    muted = !muted;
    try { localStorage.setItem('mp.sound', muted ? 'off' : 'on'); } catch { /* ignore */ }
    if (muted) music.ctx?.suspend(); else music.start();
    paintMute();
  };
  onLang(paintMute); paintMute();
  const startSound = () => { if (!muted) music.start(); };
  canvas.addEventListener('pointerdown', startSound);
  canvas.addEventListener('dblclick', () => { if (!panelsOpen()) { controls.enabled = true; controls.lock(); } });
  addEventListener('keydown', startSound, { once: true });
  controls.onLockChange = (locked) => {
    if (locked) controls.enabled = true;
  };

  // going somewhere from the map: to a building's entrance, or to any point of the land
  let stale = false;                    // the site was deployed again: the notice says so and stays
  const toast = (msg) => { const n = $('notice'); if (stale) msg = t('stale'); n.textContent = msg; n.hidden = !msg; };
  addEventListener('mp-stale', () => { stale = true; toast(''); });
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
      // the next settlement of the shared random order is built ahead, in the background
      world.preload(peek(nearest(world.here(controls))));
    } finally {
      toast(''); fade.classList.remove('on'); setTimeout(() => { fade.hidden = true; }, 400);
    }
  };
  // from the map: a settlement (its landmark's record fetched during the travel if not yet here)
  const mapView = new GlobeView(world, (x) => travel(async (report) => { const rec = x.plan ? x : await world.recordFor(x); if (rec) await goNear(rec, report); }), (lat, lon) => travel((report) => goToPlace(lat, lon, report)), () => sunPlanet(climate.utc));

  const closePanels = () => {
    mapPanel.hidden = true;
    document.body.classList.remove('panel-open');
    controls.enabled = true;
  };
  const openPanel = (p) => {
    controls.enabled = false; controls.unlock();
    p.hidden = false;
    document.body.classList.add('panel-open');
    if (p === mapPanel) mapView.open(world.here(controls), heading());
  };
  // Random city: the next settlement of the one shared random order (src/ui/order.js), from wherever one is
  const randomCity = () => { const S = take(nearest(world.here(controls))); if (S) mapView.go(S); };
  $('map-random').onclick = randomCity;
  // the tour: settlement after settlement, an aerial circuit over each; any input ends it
  const tour = new Tour({ controls, world, go: (S) => mapView.go(S), onChange: () => { snap = true; } });
  $('map-tour').onclick = () => { closePanels(); tour.start(); };
  const minimap = new MiniMap(world, mapView, () => openPanel(mapPanel), () => sunPlanet(climate.utc));

  for (const c of document.querySelectorAll('.panel .close')) c.onclick = closePanels;
  addEventListener('keydown', (e) => {
    // R works anywhere; in a tour it skips to the next settlement and the tour goes on there
    if (e.code === 'KeyR' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest?.('input, select')) { if (tour.active) tour.skip(); else randomCity(); }
    if (e.code === 'KeyT' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest?.('input, select')) { closePanels(); tour.start('KeyT'); }
    if (e.code === 'KeyM' && !tour.active) mapPanel.hidden ? openPanel(mapPanel) : closePanels();
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
  const GLYPH = { still: '•', walk: '›', run: '»', fly: '⌃', cruise: '≈' };
  const paintSpeed = () => {
    const g = controls.gait, F = controls.feet;
    if (gaitIcon.textContent !== GLYPH[g]) gaitIcon.textContent = GLYPH[g];
    const name = t('gaits')[g];
    if (speedName.textContent !== name) speedName.textContent = name;
    const kmh = Math.round(controls.speedNow * 3.6);
    speedKmh.textContent = String(kmh);
    const air = g === 'fly' || g === 'cruise';
    const up = air ? Math.max(0, F.y - world.collide.groundAt(F.x, F.z, F.y + 0.01)) : 0;
    void F;
    speedAlt.textContent = up >= 1 ? `${Math.round(up)} ${t('above-ground')}` : '';
    speedBar.style.width = `${Math.min(100, Math.sqrt(kmh / 400) * 100)}%`;
    speedBar.classList.toggle('fly', air);
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
    const tW = HITCH.mark();
    const here = world.update(R.camera, controls);
    HITCH.since('world', tW);
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
    const tC = HITCH.mark();
    const cl = climate.update({ sun: dirToLocal(f, sunPlanet(climate.utc)), moon: dirToLocal(f, moonPlanet(climate.utc)), up: dirToLocal(f, u), zones }, Math.min(dt, 0.25));
    HITCH.since('climate', tC);
    rain.update(dt, cl.rain, outdoors);
    const tA = HITCH.mark();
    music.ambience(cl.rain, cl.windy, !outdoors);
    HITCH.since('audio', tA);
    // the sounds of the place, sampled twice a second: water near, a town round, birds by day
    placeT -= dt;
    if (placeT <= 0) {
      placeT = 0.5;
      const tP = HITCH.mark();
      let wetN = 0;
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; for (const d of [5, 14]) if (Number.isFinite(world.collide.waterLevel(c.x + Math.cos(a) * d, c.z + Math.sin(a) * d)) && world.collide.waterLevel(c.x + Math.cos(a) * d, c.z + Math.sin(a) * d) > world.collide.terrain(c.x + Math.cos(a) * d, c.z + Math.sin(a) * d)) wetN++; }
      const inTown = near ? 1 - sm(near.s.S.radius * 0.6, near.s.S.radius + 40, near.r) : 0, modern = near && MODERN.has(near.s.id);
      const low = Math.max(0, 1 - Math.max(0, c.y - world.collide.terrain(c.x, c.z)) / 60);
      const rainy = 1 - Math.min(1, cl.rain * 2);
      // the place's own voices (src/engine/soundscape.js): its birds, animals, cicadas and frogs,
      // its roofs under the rain; out in the open country the defaults
      const P = profileOf(inTown > 0.05 ? near.s.id : null), am = climate.hour < 12;
      const hot = Math.max(0, Math.min(1, (cl.sunEl - 15) / 30));
      music.place({
        water: Math.min(1, wetN / 6) * low,
        town: inTown * low * (modern ? 0.4 : 1) * (0.35 + 0.65 * cl.day),
        traffic: modern ? inTown * low : 0,
        birds: cl.day * low * rainy * (modern ? 0.25 : 1) * (0.25 + 0.75 * (ENV.damp.value ?? 0.4)),
        crickets: (1 - cl.day) * low * rainy * (cl.sunEl > -30 ? 1 : 0.6) * (modern ? 0.2 : 1),
        voices: P.birds, animals: P.animals, roof: P.roof,
        cicadas: P.cicadas * hot * rainy * low,
        frogs: P.frogs * (1 - cl.day) * Math.min(1, 0.3 + wetN / 4 + cl.rain) * low,
        dawn: am && cl.sunEl > -8 && cl.sunEl < 14 ? 1 : 0,
        rain: cl.rain, indoors: !outdoors,
      });
      // the hours of the place: bells, drums, horns, the call to prayer — within the settlement only
      const now = { hour: climate.hour, el: cl.sunEl, lat: latLon(u)[0] };
      if (inTown > 0.1) for (const ev of due(P, clockWas, now)) music.ring(ev, { many: MANY_MOSQUES.has(near.s.id) });
      clockWas = now;
      // outdoors, the walls round for the early reflections: the distance to the nearest obstacle
      // in eight directions, ahead first and then clockwise
      if (outdoors) {
        const fy = controls.feet.y, dists = [];
        for (let k = 0; k < 8; k++) {
          const a = controls.yaw - k * Math.PI / 4, dx = -Math.sin(a), dz = -Math.cos(a);
          let hit = Infinity;
          for (let d = 1; d <= 60; d += d < 12 ? 1 : 2) if (world.collide.blockedAt(c.x + dx * d, c.z + dz * d, 0.1, fy + 0.8, fy + 2.5)) { hit = d; break; }
          dists.push(hit);
        }
        music.surround(dists);
      }
      HITCH.since('audio', tP);
    }
    // eye adaptation: open up in dark rooms (at most ~3 stops), close down outdoors
    // the light round the eye: the brightest of a few samples a step apart, so that one probe buried
    // in a wall, a column or a tree (or a volume not lit yet, all zero) cannot read as a dark room and
    // blow the view out white; outdoors and in the streets the eye opens up very little
    const openAmb = R.gi.openAmbient();
    let amb = 0;
    for (const [dx, dy, dz] of AMB_TAPS) amb = Math.max(amb, R.gi.ambientAt(c.x + dx, c.y + dy, c.z + dz));
    if (!(amb > openAmb * 0.004)) amb = openAmb;
    const cap = here.building ? 8 + 6 * (1 - cl.day) : 1.6 + 1.4 * (1 - cl.day);
    const target = cl.exposure * (1 + 2.6 * (1 - cl.day)) * Math.min(cap, Math.max(1, Math.pow(openAmb / Math.max(amb, 1e-4), 0.55)));
    // looking toward the sun the eye closes down (as a camera would), so the sky round it and the
    // backlit haze are not one white glare
    R.camera.getWorldDirection(_view);
    const sunUp = Math.max(0, Math.min(1, ENV.sunDir.value.y * 6 + 0.3)), toward = Math.max(0, Math.min(1, (_view.dot(ENV.sunDir.value) - 0.55) / 0.4));
    const target2 = target * (1 - 0.42 * sunUp * toward * toward * (3 - 2 * toward));
    exposure = snap ? target2 : exposure + (target2 - exposure) * (1 - Math.exp(-dt / (target2 > exposure ? 2.0 : 0.5)));
    snap = false;
    R.renderer.toneMappingExposure = exposure;
    // the reverberation of the room one is in, worked out from its volume and materials
    const tR = HITCH.mark();
    if (here.building !== preparedFor) { preparedFor = here.building; if (preparedFor) music.prepare(preparedFor.plan.rooms.map((r) => roomAcoustics(preparedFor.plan, r))); }
    music.room(here.building && here.room ? roomAcoustics(here.building.plan, here.room) : null);
    if (here.building) music.set(here.building.music, here.room?.kind || 'open');
    else music.set(world.anchor.site?.music || null, 'open');
    HITCH.since('audio', tR);
    return here;
  }
  // the view moves when one looks round, walks, flies or falls; tools (controls.free) hold it still
  let lookYaw = 0, lookPitch = 0, fullWas = false, measuring = null;
  const frame = () => {
    const now = performance.now();
    const looked = controls.yaw !== lookYaw || controls.pitch !== lookPitch;
    lookYaw = controls.yaw; lookPitch = controls.pitch;
    const moving = (!controls.free || tour.moving) && (looked || controls.keys.size > 0 || controls.flyHeld || controls.stick.x !== 0 || controls.stick.y !== 0 || controls.speedNow > 0.05 || controls.vy !== 0 || controls.glide || tour.moving);
    R.setMotion(moving, now);
    // held still for a second: the scene only sways, flickers and drifts, so it is drawn at
    // ~24 fps instead of 60, leaving the machine (and the rest of the picture) its breath
    if (!perf.panel && !perf.record && !measuring && !(controls.free && !tour.moving) && now - (R.movedAt ?? -1e9) > 1000 && now - last < 1000 / 24 - 2) return;
    const dt = (now - last) / 1000;
    last = now;
    tour.update(dt);
    HITCH.time('controls', () => controls.update(dt));
    frameOnce(dt);
    HITCH.time('minimap', () => minimap?.update(world.here(controls), heading()));
    const tR = HITCH.mark();
    R.render();
    HITCH.since('render', tR);
    const js = performance.now() - now;
    stats.frames++; stats.ms = stats.ms * 0.9 + js * 0.1;
    perf.tick(now, js);
    HITCH.frame(now, dt * 1000, js, R.renderer.info);
    // (the frames of a view held still are drawn at 24 fps on purpose: not counted)
    const full = !!(perf.panel || perf.record) || now - (R.movedAt ?? -1e9) < 900;
    if (measuring) measuring(now, dt * 1000);
    else dynres.update(now, dt * 1000, full && fullWas);
    fullWas = full;
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
    entrance: async (id) => { if (!world.plans.has(id)) await world.loadPlans(); return goTo(world.plans.get(id)); },
    near: async (id) => { if (!world.plans.has(id)) await world.loadPlans(); return goNear(world.plans.get(id)); },
    walk: async (keys, ms) => { controls.enabled = true; for (const k of keys) controls.keys.add(k); await new Promise((r) => setTimeout(r, ms)); controls.keys.clear(); },
    feet: () => ({ ...controls.feet }),
    world, renderer: R, controls, stats, music, climate, mapView, perf,
    get hitches() { return HITCH.ring; },
    dynres,
    ground: (x, z) => world.collide.terrain(x, z),
  };
  window.READY = true;
  // the first visit (no quality asked for or remembered): the frame times measured for a few
  // seconds, every frame drawn, and the quality chosen from them and remembered. What can change
  // without compiling every material again (the pixel ratio, the air's pass, the edge smoothing,
  // the plants' reach) changes now; the rest (the lamps, the shadow maps, the occlusion) with the
  // next visit, which starts at the remembered quality
  if (!askedQuality && !storedQuality && settings.quality === 'high') {
    // (four seconds and 30 frames at least; on a machine too slow for 30 frames in 15 s, low)
    const t0 = performance.now() + 1500, t1 = t0 + 4000, t2 = t0 + 15000, dts = [];
    measuring = (now, dt) => {
      if (document.hidden) { measuring = null; return; }      // measured again next visit
      if (now < t0 || controls.free) return;
      if (dt < 3000) dts.push(dt);
      if (now < t1 || (dts.length < 30 && now < t2)) return;
      measuring = null;
      dts.sort((a, b) => a - b);
      const p50 = dts.length < 30 ? Infinity : dts[dts.length >> 1], q = p50 <= 30 ? 'high' : p50 <= 50 ? 'medium' : 'low';
      try { localStorage.setItem('mp.quality', JSON.stringify({ q, p50: Number.isFinite(p50) ? +p50.toFixed(1) : null, frames: dts.length, ratio: R.renderer.getPixelRatio(), at: Date.now() })); } catch { /* storage unavailable */ }
      console.info('[memory of civilizations] quality:', q, `(median frame ${p50.toFixed(1)} ms over ${dts.length} frames)`);
      if (q !== 'high') {
        R.setQualityLive(q);
        world.flora.scale = world.openFlora.scale = floraScale[q];
        world.flora.dirty = true;
      }
    };
  }
  // the other settlements' landmark plans (for the map), now that the world is open
  setTimeout(() => world.prefetch(world.here(controls)), 2000);
  if (params.has('bench')) setTimeout(() => runBench(window.palace), 1000);
}

main().catch((e) => {
  console.error(e);
  const p = window.__progress;
  if (p) p.fail(e.message || e); else $('intro-status').textContent = t('error') + (e.message || e);
});
