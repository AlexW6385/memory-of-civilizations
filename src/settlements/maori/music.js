// Music of the pā (docs/settlements/maori.md §9): waiata (sung chant), the kōauau and pūtōrino
// (flutes), the pūkāea (wooden trumpet); voices and a flute stand in.
export default {
  tonic: 50,
  scale: [0, 2, 3, 5, 7],
  tempo: 62,
  zones: {
    open: { drone: { notes: [-12, 0], level: 0.04, timbre: 'voice' }, lead: { timbre: 'ney', density: 0.22, range: [7, 19], level: 0.06 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, 0, 7], level: 0.05, timbre: 'voice' }, lead: { timbre: 'voice', density: 0.3, range: [0, 12], level: 0.07 }, reverb: 0.45 },
  },
};
