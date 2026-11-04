// Music of Mamluk Cairo (docs/settlements/mamluk-cairo.md §9): the call to prayer from the
// minarets, the ney, the oud and the qanun, a maqam over a drone.
export default {
  tonic: 50,
  scale: [0, 1, 4, 5, 7, 8, 10],
  tempo: 54,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'sho' }, lead: { timbre: 'voice', density: 0.2, range: [5, 17], level: 0.07 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.05, timbre: 'sho' }, lead: { timbre: 'ney', density: 0.25, range: [7, 19], level: 0.07 }, reverb: 0.9 },
  },
};
