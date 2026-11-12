// Music of the Swahili coast (docs/settlements/kilwa.md §9): the call to prayer, drums (ngoma), the
// zumari's reed, the lyre (kinanda); a reed, drums and a drone stand in, under the surf.
export default {
  tonic: 50,
  scale: [0, 2, 4, 5, 7, 9, 10],
  tempo: 76,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, lead: { timbre: 'reed', density: 0.3, range: [7, 19], level: 0.07 }, harp: { timbre: 'kora', density: 0.22, range: [3, 17], level: 0.12 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.07, rhythm: [3, 1, 2, 2] }, harp: { timbre: 'oud', density: 0.15, range: [0, 12], level: 0.08 }, reverb: 0.7 },
  },
};
