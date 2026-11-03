// Music of Chichén Itzá (docs/settlements/chichen-itza.md §9): clay flutes and ocarinas over the
// slit drum (tunkul) and turtle-shell drums, conch trumpets at the temples (a reed and a struck
// sound stand in for them).

export default {
  tonic: 52,
  scale: [0, 3, 5, 7, 10],
  tempo: 84,
  zones: {
    open: {
      lead: { timbre: 'ney', density: 0.35, range: [12, 26], level: 0.09 },
      woodfish: { level: 0.12 },
      reverb: 0.3,
    },
    hall: {
      drone: { notes: [-12, 0], level: 0.06, timbre: 'reed' },
      lead: { timbre: 'ney', density: 0.4, range: [7, 19], level: 0.1, rhythm: [2, 1, 1, 2] },
      woodfish: { level: 0.16 },
      reverb: 0.5,
    },
  },
};
