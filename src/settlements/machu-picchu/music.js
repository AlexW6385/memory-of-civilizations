// Music of the Inca (docs/settlements/machu-picchu.md §9): panpipes (antara, siku) and the
// end-notched flute (quena) on the pentatonic scale, drums (wankar) and the conch (pututu); a
// flute and a reed stand in, with a struck sound for the drum.

export default {
  tonic: 52,
  scale: [0, 3, 5, 7, 10],
  tempo: 76,
  zones: {
    open: { lead: { timbre: 'ney', density: 0.45, range: [12, 28], level: 0.1 }, harp: { density: 0.2, range: [7, 19], level: 0.12, timbre: 'kithara' }, woodfish: { level: 0.08 }, reverb: 0.45 },
    hall: { drone: { notes: [-12, 0], level: 0.05, timbre: 'reed' }, lead: { timbre: 'ney', density: 0.35, range: [7, 19], level: 0.1 }, reverb: 0.55 },
  },
};
