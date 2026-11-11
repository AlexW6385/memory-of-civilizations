// Music of Tikal (docs/settlements/maya-tikal.md §9): conch trumpets and clay flutes over the turtle-shell drum and rattles
// (a reed drone and a flute voice stand in), pentatonic.
export default {
  tonic: 50,
  scale: [0, 3, 5, 7, 10],
  tempo: 78,
  zones: {
    open: {
      drone: { notes: [-12, -5], level: 0.04, timbre: 'reed' },
      lead: { timbre: 'ney', density: 0.3, range: [12, 26], level: 0.085 },
      woodfish: { level: 0.1 },
      reverb: 0.35,
    },
    hall: {
      drone: { notes: [-12, 0], level: 0.06, timbre: 'reed' },
      lead: { timbre: 'ney', density: 0.35, range: [5, 17], level: 0.09, rhythm: [2, 1, 1, 2] },
      woodfish: { level: 0.14 },
      reverb: 0.75,
    },
  },
};
