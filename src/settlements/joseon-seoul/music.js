// Music of the Joseon court (docs/settlements/joseon-seoul.md §9): bells and stones, the haegeum,
// the daegeum (a plucked string, the ney and a reed organ stand in), pentatonic.
export default {
  tonic: 51,
  scale: [0, 2, 5, 7, 9],
  tempo: 50,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.04, timbre: 'sho' }, harp: { density: 0.24, range: [0, 17], level: 0.16, timbre: 'koto' }, lead: { timbre: 'ney', density: 0.18, range: [7, 19], level: 0.07 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.22, range: [7, 19], level: 0.07 }, reverb: 0.75 },
  },
};
