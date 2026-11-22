// What each garden-and-street animal does, as a function of the time and of where the visitor stands
// (src/engine/fauna-critters.js runs these in the vertex shader; tests/suzhou-critters.test.mjs runs the
// same code on numbers). Each returns a RIG: the animal's place and heading, and the angles of its
// parts (src/engine/critter-models.js lists the parts). Angles in radians: pitch is positive nose
// down (a bow, a peck), yaw positive toward +z of the animal's frame, wings' spread positive outward.
//
// An instance's numbers (a b c d e are the five groups of four):
//   a = [kind, seed, size, night (1: out at night too)]    b = [home x, home y, home z, heading]
//   duck      c [loop cx, cz, ax, az]  d [loop advance per cycle (signed), phase, loop turn, k]  e [along, across, cycle s, group seed]; b.y the water's level
//   crane/hen/rooster (walkers)  c [range along, range across, step period s, speed m/s]  d [stride m]
//   cat, dog  c [far, near: the distance the head turns at, and the dog stands at]
//   cormorant c [cycle s]
//   cagebird  (hung from b)
//   swallow   c [cycle s, flight s, radius m, side ±1]   (the nest at b, its open side facing the heading b.w)
//   kingfisher c [water x, water z, cycle s]  d [water level]
//   grazer    (horse, ox, donkey, sheep) c [range along, range across, walk period s, speed m/s]  d [stride m, leg swing rad, how far the neck reaches down to graze]
//   craft     (a prop)
import { x, hyp } from './critter-math.js';

export const TAU = Math.PI * 2;
export const KIND = { duck: 0, crane: 1, hen: 2, cat: 3, dog: 4, cormorant: 5, cagebird: 6, swallow: 7, kingfisher: 8, rooster: 9, craft: 10, grazer: 11 };

const RIG0 = { X: 0, Y: 0, Z: 0, psi: 0, bp: 0, br: 0, drop: 0, vis: 1, n1p: 0, n1y: 0, n2p: 0, n2y: 0, tp: 0, ty: 0, lp: 0, la: 0, lc: 0, ws: 0, wf: 0, eye: 1, pop: 0, fish: 0, paw: 0, ox: 0, oy: 0, oyaw: 0, breath: 0, sway: 0, swayp: 0, scr: 0 };
export const RIG_FIELDS = Object.keys(RIG0);
const rig = (o) => { const r = {}; for (const k of RIG_FIELDS) r[k] = x(o[k] ?? RIG0[k]); return r; };
const sgn = (v) => v.ge(0).mul(2).sub(1);
/** The visitor's bearing from (px, pz) and the distance. */
const toCam = (c, px, pz) => { const dx = c.cx.sub(px), dz = c.cz.sub(pz); return { dx, dz, d: hyp(dx, dz), ang: dz.atan2(dx) }; };
/** a lerp between lo and hi by w (0…1) */
const lerp = (lo, hi, w) => x(lo).add(x(hi).sub(lo).mul(w));

// ═════════ ducks afloat ═════════
function duck(c) {
  const { a, b, c: C, d: D, e: E, t } = c, seed = a[1];
  const u = t.div(E[2]).add(E[3]), kc = u.floor(), f = u.fract();
  const mv = f.smooth(0, 0.6);
  const th = D[1].add(D[0].mul(kc.add(mv)));
  const k = D[3], ph = th.mul(k).add(0.7);
  const lx = C[2].mul(th.sin()), lz = C[3].mul(ph.sin()), dx = C[2].mul(th.cos()), dz = C[3].mul(k).mul(ph.cos());
  const cr = D[2].cos(), sr = D[2].sin();
  const px = lx.mul(cr).sub(lz.mul(sr)), pz = lx.mul(sr).add(lz.mul(cr)), vx = dx.mul(cr).sub(dz.mul(sr)), vz = dx.mul(sr).add(dz.mul(cr));
  const s = sgn(D[0]), psi = vz.mul(s).atan2(vx.mul(s));
  // (a raft keeps its places in the loop's own axes: on a narrow canal the ducks must not swing round at the loop's ends)
  const oa = x(b[0]).ge(0.5).pick(D[2], psi), oc = oa.cos(), os = oa.sin();
  const X = C[0].add(px).add(E[0].mul(oc)).sub(E[1].mul(os)), Z = C[1].add(pz).add(E[0].mul(os)).add(E[1].mul(oc));
  // the pause that ends each cycle: preening, dipping the head, looking about
  const r = f.sub(0.64).div(0.36).clamp(0, 1), env = r.smooth(0, 0.12).mul(r.smooth(1, 0.86));
  const beh = kc.mul(1.7).add(seed.mul(13)).hash(), side = sgn(kc.mul(2.3).add(seed.mul(5)).hash().sub(0.5));
  const mP = beh.lt(0.35), mD = beh.ge(0.35).mul(beh.lt(0.55)), mL = beh.ge(0.55).mul(beh.lt(0.85));
  const nib = r.mul(60).sin();
  const cam = toCam(c, X, Z), al = cam.d.smooth(5, 2.5);
  const turn = cam.ang.sub(psi).wrap().clamp(-1.2, 1.2);
  const bob = t.mul(1.6).add(seed.mul(7)).sin(), paddle = mv.mul(Math.PI).sin();
  return rig({
    X, Z, psi, Y: x(b[1]).add(bob.mul(0.004)).add(paddle.mul(0.003)),
    n1p: bob.mul(0.05).sub(0.12).add(mP.mul(env).mul(0.3)).add(mD.mul(env).mul(1.15)).sub(al.mul(0.3)).add(paddle.mul(t.mul(5).sin()).mul(0.05)),
    n1y: mP.mul(env).mul(side).mul(1.95).add(mL.mul(env).mul(r.mul(TAU * 1.5).sin()).mul(0.9)).add(turn.mul(al).mul(0.4)),
    n2p: x(0.12).add(mP.mul(env).mul(nib.mul(0.15).add(0.85))).add(mD.mul(env).mul(0.3)).sub(al.mul(0.12)),
    n2y: mL.mul(env).mul(r.mul(TAU * 2).add(1).sin()).mul(0.5).add(turn.mul(al).mul(0.5)),
    bp: mD.mul(env).mul(0.32), tp: mD.mul(env).mul(-0.5),
    ty: r.sub(0.88).clamp(0, 0.12).smooth(0, 0.05).mul(t.mul(24).sin()).mul(0.28).mul(mP),
  });
}

// ═════════ walkers (the crane, the fowl) ═════════
/** A walk to a hashed spot in the range, a stand, the next walk: position, heading, how far through the walk it is. */
function walker(c, speedScale = 1) {
  const { a, b, c: C, d: D, t } = c, seed = a[1], tau = C[2];
  const q = t.div(tau).add(seed.mul(37)), k = q.floor(), f = q.fract();
  const cr = x(b[3]).cos(), sr = x(b[3]).sin();
  const target = (n) => {
    const al = C[0].mul(n.add(seed.mul(37)).hash().mul(2).sub(1)), ac = C[1].mul(n.mul(1.7).add(seed.mul(91)).hash().mul(2).sub(1));
    return [x(b[0]).add(al.mul(cr)).sub(ac.mul(sr)), x(b[2]).add(al.mul(sr)).add(ac.mul(cr))];
  };
  const pp = target(k.sub(2)), pr = target(k.sub(1)), cu = target(k);
  const dx = cu[0].sub(pr[0]), dz = cu[1].sub(pr[1]), dl = hyp(dx, dz), wk = dl.div(C[3].mul(tau).mul(speedScale)).clamp(0.04, 0.8);
  const lin = f.div(wk).clamp(0, 1), m = lin.mul(0.5).add(lin.smooth(0, 1).mul(0.5));      // (half eased: a bird starts and stops quickly)
  const moving = f.lt(wk).mul(dl.ge(0.05)).mul(m.mul(Math.PI).sin().abs().pow(0.4));
  const hin = dz.atan2(dx), pdx = pr[0].sub(pp[0]), pdz = pr[1].sub(pp[1]), hprev = hyp(pdx, pdz).ge(0.05).pick(pdz.atan2(pdx), b[3]);
  const hcur = dl.ge(0.05).pick(hin, hprev);
  const psi = hprev.add(hcur.sub(hprev).wrap().mul(f.smooth(0, wk.mul(0.3).max(0.02))));
  const walked = m.mul(dl), lp = walked.div(D[0]).mul(Math.PI);
  const r = f.sub(wk).div(x(1).sub(wk)).clamp(0, 1);
  return { X: pr[0].add(dx.mul(m)), Z: pr[1].add(dz.mul(m)), psi, k, f, wk, m, moving, lp, r, seed, tau, dl };
}

function crane(c) {
  const W = walker(c), { t } = c, { r, k, seed, moving } = W;
  const cam = toCam(c, W.X, W.Z), al = cam.d.smooth(4.5, 2.2), turn = cam.ang.sub(W.psi).wrap().clamp(-1.2, 1.2);
  const env = r.smooth(0, 0.1).mul(r.smooth(1, 0.9)).mul(x(1).sub(moving)).mul(x(1).sub(al.mul(0.8)));      // (near the visitor it neither bows nor preens)
  const kb = k.mul(3.3).add(seed.mul(5)).hash(), side = sgn(k.mul(1.9).add(seed.mul(3)).hash().sub(0.5));
  const mLook = kb.lt(0.3), mBow = kb.ge(0.3).mul(kb.lt(0.55)), mPreen = kb.ge(0.55).mul(kb.lt(0.8));
  const bow = x(0.5).sub(r.mul(TAU * 2).cos().mul(0.5));
  const nib = r.mul(70).sin();
  const bobWalk = W.lp.sin().mul(moving);
  return rig({
    X: W.X, Z: W.Z, psi: W.psi, Y: x(c.b[1]).sub(W.lp.mul(2).sin().abs().mul(0.012).mul(moving)),
    n1p: bow.mul(env).mul(mBow).mul(1.2).sub(env.mul(mPreen).mul(1.1)).add(bobWalk.mul(0.07)).sub(al.mul(0.22)),
    n1y: env.mul(mPreen).mul(side).mul(0.4).add(env.mul(mLook).mul(r.mul(TAU * 1.5).sin()).mul(0.7)).add(turn.mul(al).mul(0.55)),
    n2p: bow.mul(env).mul(mBow).mul(0.45).add(env.mul(mPreen).mul(nib.mul(0.12).add(1.25))).add(bobWalk.mul(0.1)).sub(al.mul(0.1)),
    n2y: env.mul(mPreen).mul(side).mul(0.3).add(env.mul(mLook).mul(r.mul(TAU * 2).add(1).sin()).mul(0.55)).add(turn.mul(al).mul(0.45)),
    bp: bow.mul(env).mul(mBow).mul(0.12), lp: W.lp, la: x(0.3).mul(moving), tp: bobWalk.mul(0.02),
    breath: t.mul(TAU * 0.3).sin().mul(0.01),
  });
}

function fowl(c, rooster) {
  const W = walker(c), { t } = c, { r, k, seed, moving } = W;
  const env = r.smooth(0, 0.06).mul(r.smooth(1, 0.94)).mul(x(1).sub(moving));
  const kb = k.mul(3.1).add(seed.mul(7)).hash();
  const mPeck = kb.lt(0.55), mScratch = kb.ge(0.55).mul(kb.lt(0.72)), mCrow = kb.ge(0.78).mul(kb.lt(0.9)).mul(rooster);
  const pecks = 3 + (rooster ? 0 : 2);
  const pw = r.smooth(0.08, 0.14).mul(r.smooth(0.95, 0.85));
  const pk = r.sub(0.1).div(0.85).clamp(0, 1).mul(Math.PI * pecks).sin().abs().pow(3).mul(pw).mul(env);
  const crow = r.smooth(0.15, 0.3).mul(r.smooth(0.8, 0.65)).mul(env).mul(mCrow);
  // the visitor: they scatter ahead of him
  const cam = toCam(c, W.X, W.Z), push = cam.d.smooth(2.8, 0.9).mul(1.3), fl = cam.d.smooth(2.6, 1.7), inv = x(1).div(cam.d.max(0.05));
  const awx = cam.dx.neg().mul(inv), awz = cam.dz.neg().mul(inv), flee = awz.atan2(awx);
  const psi = W.psi.add(flee.sub(W.psi).wrap().mul(fl));
  const run = x(1).sub(fl);
  return rig({
    X: W.X.add(awx.mul(push)), Z: W.Z.add(awz.mul(push)), psi, Y: x(c.b[1]).add(t.mul(26).sin().abs().mul(0.015).mul(fl)),
    n1p: W.lp.mul(1).sin().mul(0.22).mul(moving).add(pk.mul(mPeck).mul(1.15)).sub(crow.mul(0.85)).add(fl.mul(0.2)),
    n2p: pk.mul(mPeck).mul(0.45).sub(crow.mul(0.7)),
    n1y: env.mul(kb.ge(0.9)).mul(r.mul(TAU * 2).sin()).mul(0.5),
    n2y: env.mul(kb.ge(0.9)).mul(r.mul(TAU * 3).sin()).mul(0.3),
    bp: pk.mul(mPeck).mul(0.3).sub(crow.mul(0.3)).add(fl.mul(0.15)),
    tp: pk.mul(mPeck).mul(-0.3).add(crow.mul(0.25)),
    lp: W.lp.mul(run).add(t.mul(24).mul(fl)), la: x(0.45).mul(moving).max(fl.mul(0.8)),
    scr: env.mul(mScratch).mul(r.mul(TAU * 4.5).sin().abs()).mul(0.5),
    breath: t.mul(TAU * 0.5).sin().mul(0.012),
  });
}

// ═════════ the cat and the dog, who watch ═════════
function cat(c) {
  const { a, b, c: C, t } = c, seed = a[1];
  const dx = c.cx.sub(b[0]), dz = c.cz.sub(b[2]), dy = c.cy.sub(x(b[1]).add(0.2)), d = dx.mul(dx).add(dz.mul(dz)).add(dy.mul(dy)).sqrt();
  const aw = d.smooth(C[0], C[1]), look = aw.smooth(0.15, 0.7), turn = dz.atan2(dx).sub(b[3]).wrap().clamp(-1.1, 1.1);
  return rig({
    X: b[0], Y: b[1], Z: b[2], psi: b[3],
    n1p: lerp(0.55, -0.12, look), n2p: lerp(0.3, -0.08, look), n1y: turn.mul(look).mul(0.35), n2y: turn.mul(look).mul(0.65),
    eye: lerp(0.08, 1, aw.smooth(0.05, 0.45)),
    ty: t.mul(1.1).add(seed.mul(9)).sin().mul(0.4).mul(aw.mul(0.85).add(0.15)),
    breath: t.mul(TAU * 0.4).add(seed.mul(5)).sin().mul(0.028),
  });
}

function dog(c) {
  const { a, b, c: C, t } = c, seed = a[1];
  const dx = c.cx.sub(b[0]), dz = c.cz.sub(b[2]), dy = c.cy.sub(x(b[1]).add(0.3)), d = dx.mul(dx).add(dz.mul(dz)).add(dy.mul(dy)).sqrt();
  const aw = d.smooth(C[0], C[1]), stand = aw.smooth(0.15, 0.6), look = aw.smooth(0.1, 0.5), turn = dz.atan2(dx).sub(b[3]).wrap().clamp(-1.3, 1.3);
  const lie = x(1).sub(stand);
  return rig({
    X: b[0], Z: b[2], psi: x(b[3]).add(turn.mul(aw.smooth(0.3, 0.8)).mul(0.9)), Y: x(b[1]).sub(lie.mul(0.205)),
    lc: lie.mul(0.86), paw: lie, eye: lerp(0.1, 1, look),
    n1p: lerp(0.9, -0.1, look), n2p: lerp(0.28, 0.0, look), n2y: turn.mul(look).mul(0.3).mul(x(1).sub(aw.smooth(0.3, 0.8))),
    ty: t.mul(TAU * 3.2).add(seed.mul(3)).sin().mul(0.55).mul(aw.smooth(0.45, 0.9)),
    breath: lie.mul(t.mul(TAU * 0.5).add(seed.mul(3)).sin()).mul(0.03),
  });
}

// ═════════ the cormorant on the rail ═════════
function cormorant(c) {
  const { a, b, c: C, t } = c, seed = a[1];
  const cyc = t.div(C[0]).add(seed).fract();
  const dry = cyc.smooth(0, 0.04).mul(cyc.smooth(0.3, 0.26));
  const pe = cyc.smooth(0.45, 0.5).mul(cyc.smooth(0.64, 0.6));
  const side = sgn(cyc.floor().add(seed.mul(7)).hash().sub(0.5));
  const dx = c.cx.sub(b[0]), dz = c.cz.sub(b[2]), d = hyp(dx, dz), al = d.smooth(6, 3), turn = dz.atan2(dx).sub(b[3]).wrap().clamp(-1.3, 1.3);
  const look = t.mul(0.45).add(seed.mul(6)).sin().mul(0.7).mul(x(1).sub(pe)).mul(x(1).sub(al));
  return rig({
    X: b[0], Y: b[1], Z: b[2], psi: b[3],
    ws: dry.mul(1.3).add(dry.mul(t.mul(2.4).sin()).mul(0.04)), wf: dry.mul(0.45),
    n1y: pe.mul(1.1).mul(side).add(turn.mul(al).mul(0.4)).add(look.mul(0.3)), n2p: pe.mul(0.75).add(pe.mul(t.mul(11).sin()).mul(0.08)).add(dry.mul(0.15)), n2y: look.mul(0.5).add(turn.mul(al).mul(0.6)),
    n1p: dry.mul(-0.1), breath: t.mul(TAU * 0.4).sin().mul(0.012),
  });
}

// ═════════ the songbird in its cage ═════════
function cagebird(c) {
  const { a, b, t } = c, seed = a[1];
  const sway = t.mul(1.15).add(seed.mul(3)).sin().mul(0.03), swayp = t.mul(0.83).add(seed.mul(2)).sin().mul(0.025);
  const Th = 2.8, u = t.div(Th).add(seed), kc = u.floor(), f = u.fract();
  const hop = f.smooth(0.46, 0.56), flip = kc.mul(0.5).fract().ge(0.5);       // alternate perches
  const from = flip.pick(0.07, -0.07), to = flip.pick(-0.07, 0.07);
  const ox = from.add(x(to).sub(from).mul(hop));
  const sing = t.div(9.5).add(seed.mul(2)).fract(), sg = sing.smooth(0.02, 0.08).mul(sing.smooth(0.42, 0.36));
  const trem = t.mul(38).sin().mul(0.05);
  return rig({
    X: b[0], Y: b[1], Z: b[2], psi: b[3], br: sway, bp: swayp, sway, swayp,
    ox, oy: hop.mul(Math.PI).sin().mul(0.07), oyaw: flip.pick(Math.PI, 0).add(hop.mul(Math.PI)),
    n1p: sg.mul(-0.4).add(t.mul(0.9).add(seed).sin().mul(0.05)), n2p: sg.mul(-0.55).add(sg.mul(trem)), n2y: x(1).sub(sg).mul(t.mul(1.9).add(seed.mul(4)).sin()).mul(0.8),
    tp: sg.mul(trem).mul(2).add(hop.mul(Math.PI).sin().mul(-0.3)), ws: hop.mul(Math.PI).sin().mul(0.5), wf: hop.mul(Math.PI).sin().mul(0.25),
  });
}

// ═════════ the swallow at its nest: perched, then a loop over the pond, then back with food ═════════
function swallow(c) {
  const { a, b, c: C, t } = c, seed = a[1];
  const T = C[0], Tf = C[1], R = C[2], sg = C[3], H = x(c.d[0]);
  const secs = t.div(T).add(seed).fract().mul(T), s = secs.div(Tf).clamp(0, 1), inFlight = secs.lt(Tf);
  const u = s.sub(s.mul(TAU).sin().div(TAU));                                 // eased: slow to leave, slow to land
  const A = R.mul(1.0), B = R.mul(0.55);
  const path = (uu) => ({
    F: A.mul(uu.mul(Math.PI).sin()), S: B.mul(uu.mul(TAU).sin()).mul(sg), Yh: uu.mul(Math.PI).sin().abs().pow(2).mul(H),
    dF: A.mul(Math.PI).mul(uu.mul(Math.PI).cos()), dS: B.mul(TAU).mul(uu.mul(TAU).cos()).mul(sg), dY: H.mul(Math.PI).mul(uu.mul(TAU).sin()),
  });
  const p0 = path(u), p1 = path(u.add(0.02));
  const cr = x(b[3]).cos(), sr = x(b[3]).sin();
  const world = (p) => [p.dF.mul(cr).sub(p.dS.mul(sr)), p.dF.mul(sr).add(p.dS.mul(cr))];
  const [vx, vz] = world(p0), [vx1, vz1] = world(p1);
  const h0 = vz.atan2(vx), h1 = vz1.atan2(vx1);
  const hp = x(b[3]).add(h0.sub(b[3]).wrap().mul(u.smooth(0, 0.07))), psiF = hp.add(x(b[3]).sub(hp).wrap().mul(u.smooth(0.93, 1)));
  const flight = inFlight.mul(u.smooth(0, 0.025)).mul(u.smooth(1, 0.975));
  const roll = h1.sub(h0).wrap().mul(5).clamp(-0.8, 0.8).mul(flight);
  const pitch = p0.dY.neg().atan2(hyp(p0.dF, p0.dS)).mul(0.5).mul(flight);
  const X = x(b[0]).add(p0.F.mul(cr)).sub(p0.S.mul(sr)), Z = x(b[2]).add(p0.F.mul(sr)).add(p0.S.mul(cr)), Y = x(b[1]).add(p0.Yh);
  const since = secs.sub(Tf), pop = since.smooth(0, 0.4).mul(since.smooth(3.4, 2.6)).mul(secs.ge(Tf)).max(t.mul(0.7).add(seed.mul(5)).sin().abs().pow(10).mul(0.5));
  const look = t.mul(0.9).add(seed.mul(9)).sin(), chirp = t.mul(1.7).add(seed).sin().abs().pow(6);
  return rig({
    X, Y, Z, psi: psiF, br: roll, bp: pitch,
    ws: flight.mul(1.3), wf: flight.mul(0.55).mul(t.mul(TAU * 7).add(seed.mul(3)).sin()), lc: flight.mul(0.95),
    n2y: x(1).sub(flight).mul(look).mul(0.8), n2p: x(1).sub(flight).mul(chirp).mul(-0.35), tp: x(1).sub(flight).mul(t.mul(2.2).sin().abs().pow(8)).mul(0.25), pop,
  });
}

// ═════════ the kingfisher: waits, dives, returns with a fish ═════════
function kingfisher(c) {
  const { a, b, c: C, d: D, t } = c, seed = a[1], Tc = C[2];
  const secs = t.div(Tc).add(seed).fract().mul(Tc), t0 = x(Tc).sub(6), s = secs.sub(t0).max(0);
  const d1 = 0.6, d2 = 0.35, d3 = 1.1;
  const ao = s.div(d1).clamp(0, 1), bo = s.sub(d1 + d2).div(d3).clamp(0, 1), moving = secs.ge(t0).mul(s.lt(d1 + d2 + d3));
  const out = ao.mul(ao).max(0), back = bo.smooth(0, 1);
  const px = x(b[0]), pz = x(b[2]), py = x(b[1]), wx = C[0], wz = C[1], wy = D[0];
  const atWater = s.ge(d1).mul(s.lt(d1 + d2));
  const X = ao.ge(1).pick(wx.add(px.sub(wx).mul(back)), px.add(wx.sub(px).mul(ao))), Z = ao.ge(1).pick(wz.add(pz.sub(wz).mul(back)), pz.add(wz.sub(pz).mul(ao)));
  const Yout = py.add(wy.add(0.02).sub(py).mul(out)).add(ao.mul(Math.PI).sin().mul(0.12));
  const Yback = wy.add(0.02).add(py.sub(wy).mul(back)).add(bo.mul(Math.PI).sin().mul(0.45));
  const Y = ao.ge(1).pick(Yback, Yout);
  const hOut = wz.sub(pz).atan2(wx.sub(px)), hBack = hOut.add(Math.PI);
  const psi = ao.ge(1).pick(hBack.add(x(b[3]).sub(hBack).wrap().mul(bo.smooth(0.8, 1))), hOut);
  const sbm = s.sub(d1).smooth(0.08, 0.14).mul(x(1).sub(s.sub(d1 + d2).smooth(-0.06, 0))).mul(atWater), vis = x(1).sub(sbm);
  const fish = s.ge(d1 + d2 + 0.1).mul(s.lt(d1 + d2 + d3 + 2.4)).mul(secs.ge(t0));
  const fly = moving.max(0);
  const look = t.mul(0.9).add(seed.mul(6)).sin(), settle = fly.neg().add(1);
  return rig({
    X, Y, Z, psi, bp: ao.ge(1).pick(back.mul(-0.5), out.mul(0.9)).mul(fly), vis,
    ws: fly.mul(1.3), wf: fly.mul(0.6).mul(t.mul(TAU * 14).sin()), lc: fly.mul(0.9), fish,
    n2y: settle.mul(look).mul(0.7), n2p: settle.mul(t.mul(1.3).add(seed).sin().abs().pow(6)).mul(0.5), tp: settle.mul(t.mul(1.9).sin().abs().pow(6)).mul(0.3),
  });
}

// ═════════ the grazers (horse, ox, donkey, sheep): a walk to a spot, then the head down to the grass or up, looking about ═════════
function grazer(c) {
  const W = walker(c), { t } = c, { r, k, seed, moving } = W, D = c.d;
  const env = r.smooth(0, 0.08).mul(r.smooth(1, 0.92)).mul(x(1).sub(moving));
  const kb = k.mul(2.9).add(seed.mul(11)).hash(), graze = kb.lt(0.72);
  const cam = toCam(c, W.X, W.Z), al = cam.d.smooth(10, 3.5), turn = cam.ang.sub(W.psi).wrap().clamp(-1.2, 1.2);
  const gz = env.mul(graze).mul(x(1).sub(al));
  const chew = t.mul(2.6).add(seed.mul(9)).sin();
  const look = env.mul(x(1).sub(graze)).mul(r.mul(TAU * 1.5).sin()).mul(x(1).sub(al));
  const nod = W.lp.sin().mul(moving);
  return rig({
    X: W.X, Z: W.Z, psi: W.psi, Y: x(c.b[1]).add(W.lp.mul(2).sin().abs().mul(0.008).mul(moving)),
    n1p: D[2].mul(0.95).mul(gz).add(nod.mul(0.05)).add(moving.mul(0.1)).sub(al.mul(0.12)).add(gz.mul(chew).mul(0.03)),
    n2p: x(0.5).mul(gz).add(nod.mul(0.06)).sub(al.mul(0.05)).add(gz.mul(chew).mul(0.05)),
    n1y: look.mul(0.55).add(turn.mul(al).mul(0.5)), n2y: look.mul(0.3).add(turn.mul(al).mul(0.5)),
    bp: gz.mul(0.035),
    ty: t.mul(1.7).add(seed.mul(7)).sin().mul(0.28).mul(x(1).sub(moving.mul(0.5))), tp: nod.mul(0.04),
    lp: W.lp, la: x(D[1]).mul(moving),
    breath: t.mul(TAU * 0.35).add(seed.mul(5)).sin().mul(0.012),
  });
}

function craft(c) {
  const { a, b, t } = c, seed = a[1];
  return rig({ X: b[0], Y: x(b[1]).add(t.mul(0.7).add(seed.mul(5)).sin().mul(0.008)), Z: b[2], psi: b[3], br: t.mul(0.55).add(seed.mul(3)).sin().mul(0.006) });
}

/** The pose function of a kind (an id of KIND). */
export const POSES = {
  [KIND.duck]: duck, [KIND.crane]: crane, [KIND.hen]: (c) => fowl(c, 0), [KIND.rooster]: (c) => fowl(c, 1), [KIND.cat]: cat, [KIND.dog]: dog,
  [KIND.cormorant]: cormorant, [KIND.cagebird]: cagebird, [KIND.swallow]: swallow, [KIND.kingfisher]: kingfisher, [KIND.craft]: craft, [KIND.grazer]: grazer,
};

/** A context from an instance's numbers (plain numbers or nodes) and the clock and the visitor. */
export function context(t, cam, groups) {
  const [a, b, c, d, e] = groups.map((g) => g.map((v) => x(v)));
  return { t: x(t), cx: x(cam[0]), cy: x(cam[1]), cz: x(cam[2]), a, b, c, d, e };
}
