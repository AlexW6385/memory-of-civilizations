// Sound at Stonehenge (docs/settlements/stonehenge.md §9): nothing is known of the music; bone and
// wooden pipes, drums and voices stand in, under the wind; a frame drum's slow beat in the open, a hum of voices round the hearth in the houses.
export default {
  tonic: 45,
  scale: [0, 2, 5, 7, 9],
  tempo: 50,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.15, range: [7, 19], level: 0.05 }, drum: { pattern: [1, 0, 0, 0, 0.6, 0, 0, 0.3], every: 2, level: 0.035 }, reverb: 0.2 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.2, range: [0, 12], level: 0.06 }, drum: { pattern: [0.5, 0, 0, 0.3], every: 4, level: 0.02 }, reverb: 0.5 },
  },
};
