// Music of Tang Chang'an (dossier §9): the court and the streets took Central Asian music (the pipa, the Hu drum, the flute), the temples
// chant. Zones are the room kinds of the plans: open (street and courts: pipa and flute, sparse, a breath of sheng below), hall
// (the temple halls: chant, wooden fish, bowl-bell), tavern (the Hu wine shop: pipa and hand drum, brisk), house (the qin alone).
// Pentatonic (shang mode).
export default {
  tonic: 52,
  scale: [0, 2, 5, 7, 9],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.26, range: [2, 19], level: 0.17, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.14, range: [9, 21], level: 0.06 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.8, range: [0, 12], level: 0.12, rhythm: [1, 1, 1, 1, 2] }, woodfish: { level: 0.14 }, qing: { every: 40, level: 0.18 }, reverb: 0.78 },
    tavern: { harp: { density: 0.55, range: [5, 22], level: 0.18, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.4, range: [9, 21], level: 0.08, rhythm: [1, 1, 2, 1, 1] }, drum: { pattern: [1, 0, 0.6, 0, 0.8, 0, 0.6, 0.4], every: 1, level: 0.08 }, reverb: 0.4 },
    house: { harp: { density: 0.16, range: [0, 14], level: 0.14, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.06, range: [7, 17], level: 0.04 }, reverb: 0.5 },
  },
};
