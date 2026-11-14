# The 45 s score of the promo (src/ui/film.js, PROMO): a low drone in D, a slow rising line of bell tones
# with one struck at every cut, a soft pulse from the middle on, the swell and last chord under the end
# card, the fade over the last 1.2 s. usage: python3 tools/film/promo-score.py out.wav
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
import wave, sys

SR = 48000
CUTS = [5, 8, 11, 14, 17, 20, 23.5, 26.5, 29.5, 32, 35, 38, 41]   # the shots' starts after the first
DUR = 45.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)

def bell(m, dur=5.0):
    t = np.arange(int(dur * SR)) / SR; f = midi(m)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 0.9), (2.01, 0.45, 1.6), (2.99, 0.22, 2.4), (4.2, 0.12, 3.5), (5.43, 0.06, 5)])
    return s * np.minimum(1, t / 0.004)

def pad(ms, dur):
    t = np.arange(int(dur * SR)) / SR; s = np.zeros_like(t)
    for m in ms:
        for det in (-0.06, 0.0, 0.07):
            f = midi(m + det); s += np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) + 0.3 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / 3.0) * np.minimum(1, (dur - t) / 3.0)
    return s * env / (3 * len(ms))

# the drone and the chords: D, then B flat and C under the middle, D again with its fifth for the end
place(pad([38, 45], 45), 0, 0, 0.5)
for t0, ch in [(0, [50, 57, 62]), (11, [46, 53, 62]), (20, [48, 55, 64]), (29.5, [50, 57, 65]), (40.5, [50, 57, 62, 66, 69])]:
    place(pad(ch, min(14.5, DUR - t0)), t0, rng.uniform(-0.3, 0.3), 0.42)
# a bell at every cut, the line climbing; a higher answer between
line = [62, 65, 69, 67, 69, 72, 74, 72, 76, 74, 77, 79, 81, 74]
for k, t0 in enumerate([0.6] + CUTS[:-1]):
    place(bell(line[k]), t0, (-1) ** k * 0.35, 0.22)
    place(bell(line[k] + 7, 3.5), t0 + (CUTS[k] - t0) * 0.5 if k < len(CUTS) else t0 + 1.5, -(-1) ** k * 0.5, 0.09)
place(bell(74, 6), CUTS[-1], 0, 0.3); place(bell(62, 6), CUTS[-1], 0, 0.25); place(bell(81, 6), CUTS[-1] + 0.02, 0.2, 0.12)
# a soft pulse on D from 14.5 s, twice a second, swelling toward the end card
t = np.arange(int(0.25 * SR)) / SR
tick = np.sin(2 * np.pi * midi(50) * t) * np.exp(-t * 22)
for k in range(int((CUTS[-1] - 14.5) * 2)):
    tt = 14.5 + k * 0.5
    place(tick, tt, 0.15 * (-1) ** k, 0.05 + 0.1 * (tt - 14.5) / 26)
# a hall: a decaying noise tail
ir_n = int(2.8 * SR); ti = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-ti * 2.2); ir = sosfilt(butter(2, [200, 6000], 'bandpass', fs=SR, output='sos'), ir)
ir /= np.sqrt(np.sum(ir ** 2))
out = []
for ch in (L, R):
    wet = fftconvolve(ch, ir)[:N]
    out.append(ch * 0.8 + wet * 0.35)
S = np.stack(out)
tt = np.arange(N) / SR
S *= np.minimum(1, tt / 1.0) * np.minimum(1, np.maximum(0, (DUR - tt) / 1.2))
S = np.tanh(S / np.max(np.abs(S)) * 1.4) * 0.85
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((S.T * 32767).astype('<i2').tobytes())
