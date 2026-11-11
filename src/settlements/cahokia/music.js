// Music of Cahokia (docs/settlements/cahokia.md §9): drums and rattles of gourd and turtle shell,
// cane flutes and voices at the plaza's ceremonies. On the plaza the cane flute (the end-blown ney
// stands for it) wanders over a low drone; in the great houses a voice chants in short repeated
// phrases over the drone, the flute answering. The drum and rattle are not synthesised: the chant's
// rhythm stands for them [inferred].
export default {
  tonic: 45,
  scale: [0, 3, 5, 7, 10],
  tempo: 72,
  zones: {
    open: {
      drone: { notes: [-12, 0], level: 0.035, timbre: 'sho' },
      lead: { timbre: 'ney', density: 0.2, range: [7, 19], level: 0.07 },
      harp: { density: 0.1, range: [0, 7], level: 0.05, timbre: 'kora' },
      reverb: 0.3,
    },
    hall: {
      drone: { notes: [-24, -12, 0], level: 0.05, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.4, range: [0, 10], level: 0.08, rhythm: [2, 1, 1, 2, 1, 1] },
      harp: { density: 0.12, range: [5, 14], level: 0.05, timbre: 'ney' },
      reverb: 0.6,
    },
  },
};
