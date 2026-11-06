#!/usr/bin/env node
// Arrival view check (not a test: a tool run by hand, minutes per settlement): for each settlement,
// its arrival point (src/planet/arrivals.js) on the settlement as the viewer walks it
// (tools/lib/site.mjs) — is it walkable, is the body clear of colliders (and by how much), what does
// the first view hit within 10 m (rays cast from the eye over the view cone at the arrival's yaw and
// pitch), and how far off the view's centre the landmark stands.
//
// Convention (src/engine/controls.js, world.js): forward = (−sin yaw · cos pitch, sin pitch, −cos yaw · cos pitch).
//
// usage: node tests/arrival-view.mjs [id ...] [--map] [--at x,y,z,yaw,pitch ...]   (no ids: all settlements)

import { MODULES, GROUNDS } from '../src/settlements/grounds.js';
import { buildPlan, toWorld } from '../src/core/build.js';
import { topField } from '../src/core/collide.js';
import { SiteWorld, radiusOf, sitePlans, arrivalOf } from '../tools/lib/site.mjs';
import { footing, RADIUS, STEP, LOW, HEAD, EYE } from '../src/core/walk.js';

const argv = process.argv.slice(2);
const argAll = (k) => argv.flatMap((a, i) => (a === '--' + k ? [argv[i + 1]] : []));
const ids = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--at');
const list = ids.length ? ids : Object.keys(MODULES);
const NEAR = 10, FAR = 40, VFOV = 68, ASPECT = 16 / 9;
const HFOV = (2 * Math.atan(Math.tan((VFOV / 2) * Math.PI / 180) * ASPECT) * 180) / Math.PI;

for (const id of list) {
  const t0 = performance.now();
  const G = GROUNDS[id], radius = radiusOf(id);
  const { landmarks, town } = await sitePlans(id);
  const cw = new SiteWorld();
  cw.terrain = (x, z) => (Math.hypot(x, z) < radius ? G.height(x, z) : -Infinity);
  cw.water = (x, z, y) => Math.hypot(x, z) < radius && G.water(x, z, y);
  cw.waterLevel = (x, z) => (Math.hypot(x, z) < radius ? G.waterLevel(x, z) : -Infinity);
  const owner = new Map();      // obstacle → plan id
  const tops = [];              // [T, plan id]
  let lm = null, lmT = null;                // the first landmark's extent: [x0, z0, x1, z1, y0, y1]
  for (const [pi, plan] of [...landmarks.map((l) => l.plan), ...town].entries()) {
    if (plan.nocollide) continue;
    let built;
    try { built = buildPlan(plan, { detail: true }); } catch (e) { console.log(`  ${plan.id} does not build: ${e.message}`); continue; }
    built.colliders.tops = await topField(built.parts);
    if (pi === 0) {
      const b = [Infinity, Infinity, -Infinity, -Infinity, Infinity, -Infinity];
      for (const { geometry } of built.parts) {
        const bb = geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox);
        b[0] = Math.min(b[0], bb.min.x); b[1] = Math.min(b[1], bb.min.z); b[2] = Math.max(b[2], bb.max.x); b[3] = Math.max(b[3], bb.max.z);
        b[4] = Math.min(b[4], bb.min.y); b[5] = Math.max(b[5], bb.max.y);
      }
      lm = b;
      lmT = built.colliders.tops;
    }
    cw.add(built.colliders);
    for (const o of built.colliders.obstacles) owner.set(o, plan.id);
    if (built.colliders.tops) tops.push([built.colliders.tops, plan.id]);
    for (const { geometry } of built.parts) geometry.dispose();
    built = null;
  }
  // (--at x,y,z,yaw,pitch — y may be 'null' — tries other arrivals on the same build; several may be given)
  const tries = argAll('at').map((t) => t.split(',').map((v) => (v === 'null' ? null : +v)));
  for (const A of tries.length ? tries : [arrivalOf(id)]) {
  const [ax, ay, az, yaw, pitch] = A;
  if (tries.length) console.log(`try [${A.join(', ')}]`);

  // ── footing and clearance ──
  const g0 = ay ?? cw.terrain(ax, az);   // (src/main.js: y null stands one on the open ground there)
  const feet = footing(cw, ax, az, (ay ?? g0) + STEP);
  const blocked = cw.blockedAt(ax, az, RADIUS, feet + LOW, feet + HEAD);
  let clear = Infinity;
  for (let r = 0.05; r <= 3; r += 0.05) { if (cw.blockedAt(ax, az, r, feet + LOW, feet + HEAD)) { clear = r; break; } }
  const wet = cw.water(ax, az, feet);

  // ── rays ──
  const ey = feet + EYE;
  const solidAt = (x, y, z) => {
    if (cw.terrain(x, z) > y) return ['ground'];
    for (const o of cw._near(cw.grid, x, z)) {
      if (o.y1 <= y || o.y0 >= y) continue;
      if (x < o.bb[0] || x > o.bb[2] || z < o.bb[1] || z > o.bb[3]) continue;
      if (o.circle ? Math.hypot(x - o.circle[0], z - o.circle[1]) < o.circle[2] : inPoly(x, z, o.poly)) return [owner.get(o) || '?', o];
    }
    for (const [T, pid] of tops) {
      const i = Math.floor((x - T.x0) / T.res), j = Math.floor((z - T.z0) / T.res);
      if (i < 0 || j < 0 || i >= T.w || j >= T.h) continue;
      const k = j * T.w + i;
      if (T.data[k] > y && (!T.under || T.under[k] < y)) return [pid + ' (top)'];
    }
    return null;
  };
  const hits = [], MAP = process.argv.includes('--map'), rows = [];
  let cMin = Infinity, cAt = null;
  let minD = Infinity, minAt = null, blockedRays = 0, rays = 0;
  for (let p = VFOV / 2; p >= -VFOV / 2 - 1e-6; p -= VFOV / 8) {
    let row = '';
    for (let a = HFOV / 2; a >= -HFOV / 2 - 1e-6; a -= HFOV / 16) {   // (a > 0: to the left)
      let hitD = Infinity, hitP = '';
      const yw = yaw + (a * Math.PI) / 180, pt = pitch + (p * Math.PI) / 180;
      const dx = -Math.sin(yw) * Math.cos(pt), dy = Math.sin(pt), dz = -Math.cos(yw) * Math.cos(pt);
      rays++;
      for (let d = 0.3; d <= FAR; d += 0.15) {
        const s = solidAt(ax + dx * d, ey + dy * d, az + dz * d);
        if (!s) continue;
        // looking down onto the ground, or a floor or terrace no higher than a step, is fine
        if (s[0] === 'ground' || ey + dy * d < feet + STEP) break;
        if (d < NEAR) { blockedRays++; hits.push([d, a, p, s[0]]); }
        if (d < minD && s[0] !== 'ground') { minD = d; minAt = [a, p, s[0]]; }
        if (Math.abs(a) <= 20 && Math.abs(p) <= 15 && d < cMin) { cMin = d; cAt = s[0]; }
        hitD = d; hitP = s[0];
        break;
      }
      row += hitD < 10 ? Math.floor(hitD) : hitD < 15 ? '+' : hitD < FAR ? '-' : '.';
    }
    rows.push(`    ${row}   ${(p >= 0 ? '+' : '') + p.toFixed(0)}°`);
  }

  // ── the landmark's direction ──
  let lmTxt = 'no landmark';
  if (lm && lmT) {
    // its tall mass: the cells of its top field higher than half its height
    // (inside the plan's `view` rectangle, if it names one: a plan of several buildings)
    const T = lmT, V = viewBox(landmarks[0].plan);
    const inV = (x, z) => !V || (x >= V[0] && x <= V[2] && z >= V[1] && z <= V[3]);
    let vmax = -Infinity;
    for (let j = 0; j < T.h; j++) for (let i = 0; i < T.w; i++) if (inV(T.x0 + (i + 0.5) * T.res, T.z0 + (j + 0.5) * T.res)) vmax = Math.max(vmax, T.data[j * T.w + i]);
    const cut = lm[4] + (vmax - lm[4]) * 0.5;
    let sx = 0, sz = 0, n = 0, lo = Infinity, hi = -Infinity;
    for (let j = 0; j < T.h; j++) for (let i = 0; i < T.w; i++) {
      const x = T.x0 + (i + 0.5) * T.res, z = T.z0 + (j + 0.5) * T.res;
      if (T.data[j * T.w + i] < cut || !inV(x, z)) continue;
      sx += x; sz += z; n++;
      let d = Math.atan2(-(x - ax), -(z - az)) - yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      lo = Math.min(lo, d); hi = Math.max(hi, d);
    }
    if (!n && V) { lmTxt = 'landmark: no tall cells in its view rectangle'; }
    const cx = sx / n, cz = sz / n;
    const vx = cx - ax, vz = cz - az, hd = Math.hypot(vx, vz);
    const lyaw = Math.atan2(-vx, -vz);
    let dyaw = lyaw - yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    const top = Math.atan2(vmax - ey, hd), foot = Math.atan2(lm[4] - ey, hd);
    const D = (r) => ((r * 180) / Math.PI).toFixed(0);
    lmTxt = `landmark ${landmarks[0]?.plan.id} (tall mass at ${cx.toFixed(0)}, ${cz.toFixed(0)}, ${hd.toFixed(0)} m): yaw off ${D(dyaw)}° (spans ${D(lo)}…${D(hi)}°), top ${D(top - pitch)}° / foot ${D(foot - pitch)}° from centre (half-fov ${(HFOV / 2).toFixed(0)}°×${VFOV / 2}°); aim yaw ${lyaw.toFixed(3)}`;
  }
  const byPlan = {};
  for (const [d, , , pid] of hits) byPlan[pid] = Math.min(byPlan[pid] ?? Infinity, d);
  console.log(`${id}: feet ${feet.toFixed(2)}${ay != null ? ` (given ${ay})` : ''}${blocked ? ' BLOCKED' : ''}${wet ? ' WET' : ''}, clear ${clear === Infinity ? '>3' : clear.toFixed(2)} m, ${blockedRays}/${rays} rays hit < ${NEAR} m${minAt ? `, nearest ${minD.toFixed(1)} m at (${minAt[0].toFixed(0)}°, ${minAt[1].toFixed(0)}°) ${minAt[2]}` : ''} (${((performance.now() - t0) / 1000).toFixed(0)} s)`);
  console.log(`  centre of view (±20°, ±15°): ${cMin < FAR ? `nearest ${cMin.toFixed(1)} m (${cAt})` : `clear to ${FAR} m`}`);
  console.log(`  ${lmTxt}`);
  if (MAP) console.log(rows.join('\n') + '\n    (digits: metres to the first hit; + under 15 m; - under 40 m; . clear)');
  if (Object.keys(byPlan).length) console.log('  near: ' + Object.entries(byPlan).map(([k, d]) => `${k} ${d.toFixed(1)} m`).join(', '));
  }
}

/** A plan's `view` rectangle in the settlement's frame, or null. */
function viewBox(plan) {
  if (!plan.view) return null;
  const a = toWorld(plan, plan.view[0], plan.view[1]), b = toWorld(plan, plan.view[2], plan.view[3]);
  return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
}

function inPoly(x, z, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) ins = !ins;
  }
  return ins;
}
