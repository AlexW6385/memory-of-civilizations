// Music of Muscovy (docs/settlements/muscovy.md §9): znamenny chant, the bells of Ivan the Great
// and the churches, the gusli and the skomorokhi's songs in the square; voices, a drone and a
// plucked string stand in.
export default {
  tonic: 48,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 58,
  zones: {
    open: { drone: { notes: [-24, -12, 0], level: 0.04, timbre: 'voice' }, harp: { density: 0.2, range: [0, 14], level: 0.12, timbre: 'oud' }, reverb: 0.5 },
    // Red Square's market: the gusli (plucked, quick) and the skomorokhi's reed-pipe, a tabor's beat
    market: { harp: { density: 0.34, range: [3, 19], level: 0.14, timbre: 'oud' }, lead: { timbre: 'reed', density: 0.24, range: [7, 19], level: 0.08 }, drum: { pattern: [1, 0, 0.6, 0, 0.8, 0, 0.5, 0.3], every: 2, level: 0.05 }, reverb: 0.4 },
    // inside a log house: a woman's low song over the spindle, the soft pluck of a gusli string
    house: { harp: { density: 0.12, range: [0, 12], level: 0.1, timbre: 'oud' }, lead: { timbre: 'voice', density: 0.15, range: [0, 9], level: 0.05 }, reverb: 0.3 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.07, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 9], level: 0.06 }, reverb: 0.95 },
  },
};
