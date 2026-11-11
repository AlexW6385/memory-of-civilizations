// Music of Shaolin (docs/settlements/shaolin.md §7): a low drone and a slow voice chanting in the halls, a bamboo flute outdoors;
// pentatonic gong mode.
export default {
  tonic: 47,
  scale: [0, 2, 5, 7, 9],
  tempo: 56,
  zones: {
    open: {
      drone: { notes: [-12, -5], level: 0.04, timbre: 'voice' },
      lead: { timbre: 'ney', density: 0.16, range: [7, 21], level: 0.07 },
      reverb: 0.4,
    },
    hall: {
      drone: { notes: [-24, -12, -5], level: 0.07, timbre: 'voice' },
      lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.1, rhythm: [3, 1, 2] },
      reverb: 0.75,
    },
  },
};
