// Music of the Zimbabwe plateau (docs/settlements/great-zimbabwe.md §9): the mbira's interlocking
// patterns, drums, hand-clapping and voices; a plucked string, a drone and voices stand in.
export default {
  tonic: 50,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 90,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'voice' }, harp: { density: 0.45, range: [7, 22], level: 0.16, timbre: 'koto' }, lead: { timbre: 'voice', density: 0.2, range: [9, 19], level: 0.06, rhythm: [3, 2, 3, 2, 2] }, reverb: 0.25 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.04, timbre: 'voice' }, harp: { density: 0.5, range: [7, 22], level: 0.18, timbre: 'koto' }, lead: { timbre: 'voice', density: 0.4, range: [7, 17], level: 0.09, rhythm: [3, 2, 3, 2, 2] }, reverb: 0.45 },
  },
};
