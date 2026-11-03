// Music of the Sahel (docs/settlements/djenne.md §9): the griot's kora and ngoni over the
// balafon, a voice; in the mosque the call to prayer (a plucked harp, a struck wooden sound and a
// voice stand in).

export default {
  tonic: 50,
  scale: [0, 2, 4, 7, 9],
  tempo: 96,
  zones: {
    open: { harp: { density: 0.55, range: [5, 26], level: 0.2, timbre: 'kithara' }, woodfish: { level: 0.1 }, reverb: 0.25 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.4, range: [0, 12], level: 0.12, rhythm: [3, 1, 2, 2] }, reverb: 0.5 },
  },
};
