// Music of Qin (docs/settlements/qin-xianyang.md §7): the bronze bells and stone chimes of the palace, the zither (zheng) and the
// xun (ocarina), a pentatonic mode; the pit is nearly silent, a low drone. (A harp, a flute and a voice stand in.)
export default {
  tonic: 52,
  scale: [0, 2, 4, 7, 9],
  tempo: 66,
  zones: {
    open: { harp: { density: 0.3, range: [5, 22], level: 0.16, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.18, range: [12, 24], level: 0.07 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.12, range: [0, 10], level: 0.07 }, harp: { density: 0.1, range: [0, 12], level: 0.08, timbre: 'kithara' }, reverb: 0.9 },
  },
};

/** The pit: nearly silent, a low drone under a long reverb, a stone-chime note now and then; the roof and the yard outside keep the open music. */
export const pitMusic = {
  tonic: 45,
  scale: [0, 2, 4, 7, 9],
  tempo: 40,
  zones: {
    open: { harp: { density: 0.18, range: [5, 20], level: 0.12, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.1, range: [12, 22], level: 0.05 }, reverb: 0.25 },
    hall: { drone: { notes: [-24, -17, -12], level: 0.09, timbre: 'voice' }, harp: { density: 0.05, range: [0, 7], level: 0.06, timbre: 'koto' }, reverb: 1.0 },
  },
};
