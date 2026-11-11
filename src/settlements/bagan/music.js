// Music of Pagan (docs/settlements/bagan.md §9): the hsaing waing's gongs and drums and the hne (oboe) — a drone and a voice; the pentatonic of the Burmese mode.
export default {
  tonic: 49,
  scale: [0, 2, 5, 7, 9],
  tempo: 66,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'voice' }, harp: { density: 0.18, range: [5, 19], level: 0.14, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.15, range: [7, 19], level: 0.07 }, reverb: 0.4 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.22, range: [0, 12], level: 0.08 }, reverb: 0.85 },
  },
};
