#!/usr/bin/env node
// Door probe: walk a route in a settlement's collision world with the walker's own move() and, where it
// stops, say which test refused the next step (the walker's tests, one by one, with the cell data).
// usage: node tools/door-probe.mjs nalanda [seed ...]   (nalanda: open houses by seed; no seeds: the six that were stuck)
//        node tools/door-probe.mjs <id> --routes file.mjs   (file.mjs: export default [{ id, route: [[x, z], ...], y0? }])
import { siteWorld } from './lib/site.mjs';
import { move, footing, RADIUS, STEP, LOW, HEAD, WALK } from '../src/core/walk.js';

const args = process.argv.slice(2), ri = args.indexOf('--routes'), routesFile = ri >= 0 ? args.splice(ri, 2)[1] : null;
const [id, ...seeds] = args;
const S = await siteWorld(id), cw = S.cw;
const routes = [];
if (id === 'nalanda') {
  const W = await import('../src/settlements/nalanda/walk.js');
  const want = seeds.length ? seeds.map(Number) : [184687, 335971, 332843, 181140, 874012, 19708];
  for (const h of W.openHouses()) if (want.includes(h.seed)) routes.push({ id: 'house ' + h.seed, route: W.houseDoorway(h).route });
}
if (routesFile) routes.push(...(await import(new URL(routesFile, 'file://' + process.cwd() + '/').href)).default);
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : String(v));
function explain(P, dx, dz) {
  const d = Math.hypot(dx, dz), ux = dx / d, uz = dz / d, out = [];
  // the next 0.12 m step, as move() takes it
  const nx0 = P.x + ux * 0.12, nz0 = P.z + uz * 0.12;
  let g = footing(cw, nx0, nz0, P.y + STEP);
  out.push(`step to (${f2(nx0)}, ${f2(nz0)}): footing ${f2(g)} (feet ${f2(P.y)}), ground ${f2(cw.groundAt(nx0, nz0, P.y + STEP))}, top ${f2(cw.topAt(nx0, nz0, RADIUS, P.y + STEP))}`);
  const [rx, rz] = cw.resolve(nx0, nz0, RADIUS, Math.max(g, P.y) + LOW, Math.max(g, P.y) + HEAD);
  if (Math.hypot(rx - nx0, rz - nz0) > 1e-4) {
    out.push(`resolve pushed the body back by ${f2(Math.hypot(rx - nx0, rz - nz0))} m: obstacle(s) within y ${f2(Math.max(g, P.y) + LOW)}..${f2(Math.max(g, P.y) + HEAD)}`);
    for (const o of cw._near(cw.grid, nx0, nz0)) {
      if (o.y1 <= Math.max(g, P.y) + LOW || o.y0 >= Math.max(g, P.y) + HEAD) continue;
      if (nx0 + RADIUS < o.bb[0] || nx0 - RADIUS > o.bb[2] || nz0 + RADIUS < o.bb[1] || nz0 - RADIUS > o.bb[3]) continue;
      out.push(`   obstacle y ${f2(o.y0)}..${f2(o.y1)} bb ${o.bb.map(f2)} ${o.circle ? 'circle' : 'poly ' + JSON.stringify(o.poly.map((p) => p.map(f2)))} ${o.src || o.id || ''}`);
    }
  }
  const gy = Math.max(g, P.y);
  const sh = cw.inShell(nx0, nz0, RADIUS * 0.7, gy + LOW, gy + HEAD, P.y + STEP), sh0 = cw.inShell(P.x, P.z, RADIUS * 0.7, P.y + LOW, P.y + HEAD, P.y + STEP);
  out.push(`inShell(next)=${sh} inShell(here)=${sh0}`);
  if (sh) for (const T of cw._near ? cw.topGrid.get(Math.floor(nx0 / 16) + ',' + Math.floor(nz0 / 16)) || [] : []) {
    if (!T.under) continue;
    const r = RADIUS * 0.7;
    for (const [dx_, dz_] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) {
      const i = Math.floor((nx0 + dx_ - T.x0) / T.res), j = Math.floor((nz0 + dz_ - T.z0) / T.res);
      if (i < 0 || j < 0 || i >= T.w || j >= T.h) continue;
      const o = j * T.w + i, top = T.data[o], u = T.under[o];
      if (top > P.y + STEP && top > gy + LOW && u < gy + HEAD && !T.dn?.[o])
        out.push(`   cell (${i},${j}) at x ${f2(T.x0 + (i + 0.5) * T.res)} z ${f2(T.z0 + (j + 0.5) * T.res)} [probe ${f2(nx0 + dx_)}, ${f2(nz0 + dz_)}]: top ${top.toFixed(4)} under ${u.toFixed(3)} climb ${(P.y + STEP).toFixed(3)} UNDER ${f2(u)} steepMask ${(T.steep?.[o] >>> 0).toString(2)} box ${[...T.box.slice(o * 4, o * 4 + 4)]} ground@cell ${f2(cw.groundAt(T.x0 + (i + 0.5) * T.res, T.z0 + (j + 0.5) * T.res, top + 0.05))}`);
    }
  }
  return out.join('\n');
}
for (const r0 of routes) {
  const { id: rid, route } = r0;
  const W = route;
  const P = { x: W[0][0], y: 0, z: W[0][1], vy: 0 };
  P.y = footing(cw, P.x, P.z, 0.5 + (r0.y0 ?? cw.terrain(P.x, P.z)));
  let ok = true;
  for (let k = 1; k < W.length && ok; k++) {
    const [tx, tz] = W[k], limit = Math.hypot(tx - P.x, tz - P.z) / WALK * 2.5 + 3;
    let t = 0, reached = false;
    while (t < limit) {
      const dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz);
      if (d < 0.35) { reached = true; break; }
      const sp = Math.min(WALK / 60, d);
      move(P, dx / d * sp, dz / d * sp, 1 / 60, cw); t += 1 / 60;
    }
    if (!reached) { ok = false; console.log(`${rid}: STUCK before waypoint ${k} (${f2(tx)}, ${f2(tz)}) at (${f2(P.x)}, ${f2(P.y)}, ${f2(P.z)}), ${f2(Math.hypot(tx - P.x, tz - P.z))} m short\n` + explain(P, tx - P.x, tz - P.z)); }
  }
  if (ok) console.log(`${rid}: reaches the end`);
}
