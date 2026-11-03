// Music of Ming Suzhou (docs/settlements/ming-suzhou.md §9): in the garden, the qin's slow
// pentatonic phrases and the xiao (end-blown flute) — the scholar's music; in the halls, a voice
// singing in the soft Kunqu manner over the dizi's drone; in the streets, the pipa of the
// storytellers (pingtan) and the clapper.

export default {
  tonic: 52,                              // E3
  scale: [0, 2, 4, 7, 9],                 // gong mode
  tempo: 60,
  zones: {
    open: {
      harp: { density: 0.25, range: [5, 22], level: 0.2, timbre: 'koto' },
      lead: { timbre: 'ney', density: 0.22, range: [12, 26], level: 0.08 },
      reverb: 0.35,
    },
    hall: {
      drone: { notes: [-12, 0], level: 0.05, timbre: 'ney' },
      lead: { timbre: 'voice', density: 0.5, range: [7, 19], level: 0.12, rhythm: [2, 1, 1, 3, 1] },
      harp: { density: 0.3, range: [0, 14], level: 0.14, timbre: 'pipa' },
      reverb: 0.45,
    },
  },
};
