// Music of the Temple (docs/settlements/lu-qufu.md §8): the ritual music of the Confucian sacrifice (yayue) — slow, solemn, pentatonic (gong mode
// on D): the bells and stone chimes (stood in for by a plucked string and a bell), the sheng and the flute; in the Dacheng Hall the bell and a low chant;
// in the street a flute and a drum.
export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 54,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, harp: { density: 0.16, range: [2, 17], level: 0.13, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.1, range: [9, 19], level: 0.05 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.07, timbre: 'sho' }, harp: { density: 0.14, range: [0, 12], level: 0.12, timbre: 'koto' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.09, rhythm: [2, 1, 1, 2] }, qing: { every: 30, level: 0.22 }, reverb: 0.88 },
    market: { harp: { density: 0.28, range: [4, 20], level: 0.13, timbre: 'pipa' }, lead: { timbre: 'ney', density: 0.22, range: [9, 21], level: 0.07 }, drum: { pattern: [1, 0, 0, 0.5, 0.7, 0, 0.5, 0], every: 2, level: 0.05 }, reverb: 0.35 },
    house: { harp: { density: 0.14, range: [0, 14], level: 0.12, timbre: 'koto' }, reverb: 0.5 },
  },
};
