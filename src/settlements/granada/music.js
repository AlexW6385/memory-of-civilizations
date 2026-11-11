// Music of Nasrid Granada (docs/settlements/granada.md §9): the call to prayer from the
// minarets, the oud and the lute of al-Andalus, the nawba over a drone.
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 54,
  zones: {
    open: { harp: { density: 0.22, range: [5, 19], level: 0.12, timbre: 'oud' }, drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, lead: { timbre: 'voice', density: 0.2, range: [5, 17], level: 0.07 }, reverb: 0.45 },
    hall: { harp: { density: 0.14, range: [0, 14], level: 0.09, timbre: 'oud' }, drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [7, 19], level: 0.07 }, reverb: 0.9 },
  },
};
