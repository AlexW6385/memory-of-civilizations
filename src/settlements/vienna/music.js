// Music of Vienna in spring 1902 (docs/settlements/vienna.md §8): a Ländler and a waltz in the café's piano and the park's brass,
// Mahler's choral finale in the Secession's hall (voices stand in), the bells of the Karlskirche in the drone; a major scale with
// a lowered seventh, the Austrian folk colour of Mahler's own tunes.
export default {
  tonic: 50,
  scale: [0, 2, 4, 5, 7, 9, 10],
  tempo: 72,
  zones: {
    open: { drone: { notes: [-12, -5, 0], level: 0.025, timbre: 'sho' }, harp: { density: 0.3, range: [5, 19], level: 0.13, timbre: 'kithara' }, lead: { timbre: 'reed', density: 0.12, range: [7, 17], level: 0.04 }, reverb: 0.3 },
    inner: { drone: { notes: [-12, -5, 0], level: 0.03, timbre: 'voice' }, harp: { density: 0.45, range: [0, 14], level: 0.13, timbre: 'kithara' }, lead: { timbre: 'reed', density: 0.12, range: [5, 14], level: 0.04 }, reverb: 0.5 },
    hall: { drone: { notes: [-24, -12, -5, 0], level: 0.05, timbre: 'voice' }, harp: { density: 0.2, range: [0, 12], level: 0.08, timbre: 'kithara' }, lead: { timbre: 'voice', density: 0.25, range: [0, 12], level: 0.06 }, reverb: 0.9 },
  },
};
