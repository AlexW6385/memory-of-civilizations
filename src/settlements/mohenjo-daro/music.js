// Music of Mohenjo-daro (docs/settlements/mohenjo-daro.md §8): nothing of its music is known; clay rattles and whistles survive, and the later music
// of the valley is modal with a drone: a plucked string, a reed pipe and a hand drum stand in. A Dorian-like mode on D.
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7, 9, 10],
  tempo: 56,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.04, timbre: 'sho' }, harp: { density: 0.2, range: [0, 15], level: 0.14, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.14, range: [7, 17], level: 0.06 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0], level: 0.06, timbre: 'sho' }, harp: { density: 0.16, range: [0, 12], level: 0.12, timbre: 'oud' }, reverb: 0.75 },
    market: { harp: { density: 0.3, range: [2, 17], level: 0.14, timbre: 'oud' }, lead: { timbre: 'ney', density: 0.22, range: [7, 19], level: 0.08 }, drum: { pattern: [1, 0, 0.5, 0, 0.7, 0, 0.5, 0.3], every: 2, level: 0.05 }, reverb: 0.3 },
    house: { harp: { density: 0.12, range: [0, 12], level: 0.1, timbre: 'oud' }, reverb: 0.4 },
  },
};
