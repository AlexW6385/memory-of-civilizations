// Music of Çatalhöyük (docs/settlements/catalhoyuk.md §9): nothing of it survives; a bone flute and a hand drum over a
// voice's drone, a small pentatonic line, slow [inferred].
export default {
  tonic: 47,
  scale: [0, 2, 5, 7, 9],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.14, range: [7, 17], level: 0.06 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [0, 10], level: 0.06 }, reverb: 0.75 },
  },
};
