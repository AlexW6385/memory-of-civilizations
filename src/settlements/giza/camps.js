// Giza — the gangs' camps on the plateau east of the pyramid, in the arrival's view (docs/settlements/giza.md §14): shelters of reed
// mats, hearths, water jars in the shade, sacks of grain, rollers and ropes, a mortar trough, sleeping mats, the spoil of the dressing.
// Pure data (positions in the settlement's frame on the level plateau), the people about them, the smoke's places.

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0

/** The camps' things: [{ kind, x, z, rot, seed }]. North of the arrival's line (to the right of the view), south of it (to the left), far north. */
export const CAMP_ITEMS = [
  // north camp: three shelters round two hearths, the jars in the lee, sacks and mats
  { kind: 'hut', x: 232, z: -84, rot: 0, seed: 1 }, { kind: 'hut', x: 240.5, z: -87, rot: 0.25, seed: 2 }, { kind: 'hut', x: 248.5, z: -81, rot: -0.2, seed: 3 },
  { kind: 'fire', x: 237, z: -77, seed: 4 }, { kind: 'fire', x: 244.5, z: -75.5, seed: 5 },
  { kind: 'jars', x: 253.5, z: -86, rot: 0, seed: 6 }, { kind: 'sacks', x: 226.5, z: -79, rot: 0.4, seed: 7 }, { kind: 'mats', x: 252, z: -72, rot: 1.4, seed: 8 },
  { kind: 'rollers', x: 228, z: -92, rot: 0.1, seed: 9 }, { kind: 'sacks', x: 244, z: -93, rot: 0, seed: 10 },
  // south camp: shelters, a hearth with its pot, the mortar trough where the gypsum is mixed, rollers, jars
  { kind: 'hut', x: 230, z: -27, rot: 0.1, seed: 11 }, { kind: 'hut', x: 238.5, z: -19, rot: 0, seed: 12 }, { kind: 'hut', x: 247, z: -26, rot: -0.2, seed: 13 },
  { kind: 'fire', x: 238, z: -28.5, seed: 14 }, { kind: 'trough', x: 227, z: -36, rot: 0.3, seed: 15 }, { kind: 'rollers', x: 247.5, z: -35, rot: 0.2, seed: 16 },
  { kind: 'jars', x: 221, z: -21, rot: 0, seed: 17 }, { kind: 'sacks', x: 244, z: -11.5, rot: 0.2, seed: 18 }, { kind: 'mats', x: 255, z: -17, rot: 1.6, seed: 19 },
  // the far camp, at the plateau's northern edge of the works
  { kind: 'hut', x: 201, z: -102, rot: 0.1, seed: 20 }, { kind: 'hut', x: 210, z: -106, rot: -0.1, seed: 21 }, { kind: 'hut', x: 218.5, z: -101, rot: 0.2, seed: 22 },
  { kind: 'fire', x: 208, z: -98, seed: 23 }, { kind: 'jars', x: 224, z: -106, rot: 0, seed: 24 },
];

/** The spoil of the dressing: [x, z, radius, seed] — about the stacks, the ramp's foot, the road, the camps' edges, the temple's east front. */
export const CHIPS = [
  [214, -77, 3.4], [205.6, -77, 3.0], [199.5, -76, 2.6], [217.5, -56.5, 3.0], [208, -55, 3.2], [201, -55, 2.4], [211, -72, 2.2],
  [183, -64, 3.0], [188, -73, 2.0], [194, -56, 2.4], [230, -62, 2.6], [240, -52.5, 1.8], [256, -48, 2.4],
  [229, -73, 2.2], [255, -80, 2.6], [225, -30, 2.2], [251, -29, 2.2], [236, -36, 1.9], [190, -90, 2.6], [212, -92, 2.4], [172, -52, 2.4], [174, -28, 2.4],
];

/** Everyone at the camps: the people at the hearths and the shelters, boys at their games, dogs, donkeys hobbled at their stakes. */
export function campLife() {
  const rand = rng(2575), L = [];
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'sheath', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'long', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const fires = CAMP_ITEMS.filter((i) => i.kind === 'fire');
  fires.forEach((f, k) => {
    const c = [f.x, f.z];
    // three round the hearth, sitting cross-legged on the ground, facing the pot; one woman standing at it with a jar on her head
    const a0 = rand() * 6.28;
    for (let i = 0; i < 3; i++) {
      const a = a0 + i * 2.1, at = [c[0] + Math.cos(a) * 1.35, c[1] + Math.sin(a) * 1.35];
      if (i === 1) woman(at, face(at, c), { pose: 'cross' }); else man(at, face(at, c), { pose: i === 0 ? 'cross' : 'sit_ground', over: i === 2 ? 'sash' : 'none' });
    }
    const wa = a0 + 4.3, wat = [c[0] + Math.cos(wa) * 1.9, c[1] + Math.sin(wa) * 1.9];
    woman(wat, face(wat, c), { carry: k % 2 ? 'pot' : 'basket' });
    // a boy squatting with a knuckle-bone game beside, or a dog lying by the fire
    if (k % 2 === 0) man([c[0] + 2.1, c[1] - 1.2], 2.5, { pose: 'squat', child: true, dress: 'loincloth' });
    else L.push({ t: 'animal', kind: 'dog', at: [c[0] - 1.2, c[1] + 1.9], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  });
  // by each shelter: a man at the door of it, mending a rope or a basket (kneeling), another leaving for the work with a hoe or a jar
  CAMP_ITEMS.filter((i) => i.kind === 'hut').forEach((h, k) => {
    if (k % 3 === 0) man([h.x + 2.9, h.z + 0.5], -1.2 + h.rot, { pose: 'kneel' });
    if (k % 3 === 1) man([h.x - 2.8, h.z - 0.6], 1.6 + h.rot, { carry: k % 2 ? 'pot' : 'basket' });
  });
  // the trough: two men mixing gypsum with hoes (bent over it), a boy pouring water
  const tr = CAMP_ITEMS.find((i) => i.kind === 'trough');
  man([tr.x + 0.3, tr.z + 1.1], Math.PI + tr.rot, { pose: 'kneel', carry: 'hoe', len: 1.2 }); man([tr.x - 1.0, tr.z - 1.1], tr.rot, { pose: 'squat' });
  man([tr.x + 2.1, tr.z - 0.6], 1.6, { carry: 'pot', child: true, dress: 'loincloth' });
  // the jar rows: a girl and a woman filling, a man drinking
  CAMP_ITEMS.filter((i) => i.kind === 'jars').forEach((j, k) => { woman([j.x + 0.9, j.z - 1.5 + k * 0.7], -Math.PI / 2 + 0.2, { pose: 'kneel' }); if (k % 2) man([j.x - 0.8, j.z + 1.9], 1.1, { carry: 'pot' }); });
  // the donkeys, hobbled at stakes at the camps' edges, and the porters resting by the sacks
  for (const [x, z, r] of [[259, -81, 0.6], [261, -78.5, 2.4], [219, -88, 1.0], [250, -30, 2.0], [253, -27.5, 0.4]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: r, seed: Math.floor(rand() * 1e9) });
  for (const s of CAMP_ITEMS.filter((i) => i.kind === 'sacks')) man([s.x - 1.5, s.z + 0.5], 1.4, { pose: 'sit_ground', carry: 'none', over: 'none' });
  return L;
}

/** Smoke from the camps' hearths. */
export const CAMP_FIRES = CAMP_ITEMS.filter((i) => i.kind === 'fire').map((f) => [f.x, f.z]);

/** A block on its sledge on the sleeper road, a few metres from the arrival: the road's heading, the sledge, and the gang hauling it to the ramp's foot. */
export const HAUL = (() => {
  const S = [241, -58.6], ang = Math.atan2(-18, -34), d = [Math.cos(ang), Math.sin(ang)], pr = [-d[1], d[0]];
  return { at: S, ang, d, pr };
})();
export function haulLife() {
  const rand = rng(2576), L = [], { at: S, d, pr } = HAUL;
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: 0.02, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const dir = face([0, 0], d);
  for (let k = 0; k < 6; k++) for (const sg of [-1, 1]) {
    const t = 6.0 + k * 1.25, p = [S[0] + d[0] * t + pr[0] * 0.45 * sg, S[1] + d[1] * t + pr[1] * 0.45 * sg];
    man(p, dir, { pose: 'pull', carry: 'rope', len: 1.4 });
  }
  // the overseer beside them with his staff, the boy pouring water on the sand under the runners, two men with levers at the sledge's back, a man with a basket of sand
  man([S[0] + d[0] * 8 + pr[0] * 2.3, S[1] + d[1] * 8 + pr[1] * 2.3], dir + 2.6, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 });
  man([S[0] + d[0] * 2.4 - pr[0] * 1.5, S[1] + d[1] * 2.4 - pr[1] * 1.5], dir + 1.57, { carry: 'pot', child: true, dress: 'loincloth' });
  man([S[0] - d[0] * 2.4 + pr[0] * 1.1, S[1] - d[1] * 2.4 + pr[1] * 1.1], dir, { pose: 'brace', carry: 'staff', len: 1.7 });
  man([S[0] - d[0] * 2.3 - pr[0] * 1.2, S[1] - d[1] * 2.3 - pr[1] * 1.2], dir, { pose: 'staff', carry: 'staff', len: 1.7 });
  man([S[0] - d[0] * 6 + pr[0] * 3, S[1] - d[1] * 6 + pr[1] * 3], dir + Math.PI, { carry: 'basket' });
  return L;
}

/** The masons' yard south of the causeway (casing stones, tools, a shade) and the priests' waiting-place before the causeway's northern doorway. */
export const YARD = {
  stacks: [[191, -12, 0.2, 2], [195.6, -9.4, 0, 3], [199.4, -12.6, 0.4, 1], [193, -4.8, 0.1, 2], [198.6, -5.6, 0.3, 1]],
  masons: [[189.2, -9.6, 0.3], [194, -6.4, 3.3], [198.4, -9.6, 0.2], [196.4, -3.2, 3.4]],
  shade: [203.5, -6.2, 209.7, -1.4],
  lane: [[204.6, -2.6, 'bench', 0, 31], [188, -14.6, 'pots', 0.2, 32], [201.4, -14.2, 'basket', 0, 33], [200.2, -3.0, 'wood', 0, 34], [186.4, -7, 'sherds', 0, 35], [177.6, -45.8, 'bench', 0, 36], [172.2, -46.2, 'pots', 0, 37], [183, -47.4, 'basket', 0.3, 38]],
};
export function yardLife() {
  const rand = rng(2577), L = [];
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'sheath', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'long', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const [x, z, r] of YARD.masons) man([x, z], r, { pose: 'kneel' });
  man([205.2, -4.2], 3.4, { pose: 'sit', over: 'sash' }); man([200, -7.6], 0.9, { pose: 'talk', over: 'sash' }); man([207.6, -1.6], -0.4, { carry: 'pot' });
  // before the doorway: two priests with staffs, a bearer with bread and a woman with a beer jar, waiting their turn; a boy sweeping the threshold with a palm-rib broom
  man([176.4, -47.8], 0.0, { pose: 'staff', carry: 'staff', len: 1.7, over: 'sash', hair: 'shaven' }); man([179.0, -47.4], 0.3, { pose: 'staff', carry: 'staff', len: 1.7, over: 'sash', hair: 'shaven' });
  man([174.4, -46.6], -0.4, { carry: 'basket' }); woman([181.2, -48.4], 0.2, { carry: 'pot' }); man([177.4, -45.9], 3.1, { pose: 'kneel', child: true, dress: 'loincloth' });
  return L;
}
