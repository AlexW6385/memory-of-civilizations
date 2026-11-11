// Music of Barcelona about 1910 (docs/settlements/barcelona.md §9): the cobla's tenora and the
// sardana, guitars, the Orfeó Català's choirs; a reed, a plucked string and voices stand in.
export default {
  tonic: 52,
  scale: [0, 2, 4, 5, 7, 9, 11],
  tempo: 84,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.03, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.3, range: [7, 19], level: 0.06 }, harp: { density: 0.25, range: [0, 14], level: 0.12, timbre: 'oud' }, reverb: 0.35 },
    cafe: { drone: { notes: [-12, 0], level: 0.02, timbre: 'voice' }, harp: { density: 0.3, range: [0, 14], level: 0.14, timbre: 'oud' }, lead: { timbre: 'reed', density: 0.12, range: [7, 17], level: 0.04 }, reverb: 0.3 },
    house: { drone: { notes: [-12, 0, 7], level: 0.02, timbre: 'voice' }, harp: { density: 0.35, range: [2, 16], level: 0.13, timbre: 'oud' }, reverb: 0.4 },
    shop: { drone: { notes: [-12, 0], level: 0.02, timbre: 'sho' }, harp: { density: 0.2, range: [4, 16], level: 0.1, timbre: 'oud' }, reverb: 0.25 },
    hall: { drone: { notes: [-24, -12, 0, 7], level: 0.06, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.95 },
  },
};
