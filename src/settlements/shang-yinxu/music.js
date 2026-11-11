// Music of Yinxu (docs/settlements/shang-yinxu.md §7): the bronze bells and the stone chime of the ancestral halls, drums, the
// ocarina (xun), a pentatonic mode (gong, zhi, yu). A harp stands in for the chime, a drone for the bells, a flute for the xun.
export default {
  tonic: 50,
  scale: [0, 3, 5, 7, 10],
  tempo: 60,
  zones: {
    open: { drone: { notes: [-12, -5], level: 0.04, timbre: 'voice' }, harp: { density: 0.22, range: [5, 20], level: 0.13, timbre: 'kithara' }, lead: { timbre: 'ney', density: 0.14, range: [12, 24], level: 0.06 }, reverb: 0.3 },
    hall: { drone: { notes: [-12, -5, 0], level: 0.06, timbre: 'voice' }, harp: { density: 0.12, range: [0, 12], level: 0.09, timbre: 'kithara' }, lead: { timbre: 'voice', density: 0.1, range: [0, 10], level: 0.06 }, reverb: 0.8 },
  },
};
