// Music of Karakorum (docs/settlements/mongol-karakorum.md §10): a long-song drone with a throat-voice and a flute over it in the open (the steppe), the court's
// slower drone and strings in the hall; pentatonic. (The engine's timbres: drone 'voice', lead 'ney'.)
export default {
  tonic: 45,
  scale: [0, 2, 4, 7, 9],
  tempo: 56,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.2, range: [7, 21], level: 0.07 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0, 7], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 14], level: 0.08 }, harp: { density: 0.25, range: [0, 14], level: 0.12, timbre: 'pipa' }, reverb: 0.6 },
  },
};
