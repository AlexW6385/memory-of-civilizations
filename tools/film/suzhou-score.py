# The original 30 s score of the Suzhou film (src/ui/film.js): E gong pentatonic, qin plucks, xiao,
# a low drone and a soft bell and gong, phrased to the film's cuts (6, 10.5, 15, 19.5, 24 s; the title
# from 26 s, the fade to black 28.8-30 s). usage: python3 tools/film/suzhou-score.py out.wav
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
import wave, sys

SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); Rr = np.zeros(N)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
TONIC = 52                     # E3
SCALE = [0, 2, 4, 7, 9]        # gong mode
def deg(d, octv=0):            # scale degree (may exceed 4) -> midi
    o, i = divmod(d, 5)
    return TONIC + 12 * (o + octv) + SCALE[i]

def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l; Rr[i:i + len(sig)] += sig * r

def qin(m, dur=4.0, bright=0.5, slide=0.0):
    """Karplus-Strong pluck, long decay, a little body resonance; optional slide (semitones) up."""
    f = midi(m); n = int(SR * dur)
    period = SR / f
    buf_len = int(period)
    buf = rng.uniform(-1, 1, buf_len)
    buf = sosfilt(butter(2, min(0.99, 2000 * (0.5 + bright) / (SR / 2)), output='sos'), buf)
    out = np.zeros(n)
    decay = 0.9985 + 0.0012 * (1 - min(1, f / 600))
    # fractional-delay KS with slide
    hist = np.concatenate([buf, np.zeros(n)])
    for k in range(buf_len, buf_len + n):
        t = (k - buf_len) / SR
        p = SR / (f * 2 ** (slide * min(1, t / 0.35) / 12))
        d = k - p
        j = int(d); fr = d - j
        a = hist[j - 1] if j - 1 >= 0 else 0.0
        b = hist[j]
        c = hist[j + 1] if j + 1 < k else b
        hist[k] = decay * (0.5 * ((1 - fr) * a + fr * b) + 0.5 * ((1 - fr) * b + fr * c))
    out = hist[buf_len:buf_len + n]
    env = np.minimum(1, np.arange(n) / (0.003 * SR))
    out = out * env
    # wooden body: a couple of soft resonances
    body = sosfilt(butter(2, [180 / (SR / 2), 420 / (SR / 2)], btype='band', output='sos'), out)
    return (out + 0.35 * body) / (np.max(np.abs(out)) + 1e-9)

def harmonic(m, dur=5.0):
    """qin harmonic (fanyin): pure, bell-like."""
    f = midi(m); t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    env = np.exp(-t / 1.6) * np.minimum(1, t / 0.004)
    return s * env * 0.6

def xiao(m, dur, vib=5.2, glide_from=None):
    """breathy end-blown flute: sine with breath noise, slow attack, vibrato that grows."""
    n = int(SR * dur); t = np.arange(n) / SR
    f0 = midi(m)
    if glide_from is not None:
        fg = midi(glide_from); f = fg + (f0 - fg) * np.minimum(1, t / 0.25)
    else:
        f = np.full(n, f0)
    depth = 0.006 * np.minimum(1, t / 0.8)
    f = f * (1 + depth * np.sin(2 * np.pi * vib * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = sosfilt(butter(2, [f0 * 0.8 / (SR / 2), min(0.95, f0 * 3 / (SR / 2))], btype='band', output='sos'), rng.normal(0, 1, n))
    breath /= (np.max(np.abs(breath)) + 1e-9)
    env = np.minimum(1, t / 0.18) * np.minimum(1, (dur - t) / 0.35)
    env = np.clip(env, 0, 1) ** 1.3
    return (tone * 0.8 + breath * 0.22) * env

def drone(m, dur, fade_in=3.0, fade_out=3.0):
    n = int(SR * dur); t = np.arange(n) / SR
    f = midi(m)
    s = np.zeros(n)
    for h, a in [(1, 1), (2, 0.35), (3, 0.12), (1.5, 0.18)]:
        s += a * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6) + 0.3 * np.sin(2 * np.pi * 0.07 * t * h))
    s = sosfilt(butter(2, 900 / (SR / 2), output='sos'), s)
    env = np.minimum(1, t / fade_in) * np.minimum(1, (dur - t) / fade_out)
    return s * np.clip(env, 0, 1) / 2.5

def gong(dur=8.0, f=82.0):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for r, a, d in [(1, 1, 3.5), (1.48, 0.5, 2.5), (2.03, 0.4, 2.0), (2.71, 0.25, 1.4), (3.4, 0.15, 1.0)]:
        s += a * np.sin(2 * np.pi * f * r * t * (1 + 0.004 * np.exp(-t / 0.8))) * np.exp(-t / d)
    hit = sosfilt(butter(2, 600 / (SR / 2), output='sos'), rng.normal(0, 1, n)) * np.exp(-t / 0.05) * 0.3
    return (s + hit) * np.minimum(1, t / 0.01) / 2.2

def bell(m, dur=4.0):
    f = midi(m); n = int(SR * dur); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 1.8), (2.76, 0.35, 0.9), (5.4, 0.15, 0.4)])
    return s * np.minimum(1, t / 0.002) * 0.5

# ── the arrangement ─────────────────────────────────────────────────────────────
# 0-6: aerial — drone rises, qin harmonics like distant bells
place(drone(TONIC - 12, 30.5, fade_in=4.0, fade_out=2.5), 0.0, 0.0, 0.55)
place(drone(TONIC - 5, 24.0, fade_in=6.0, fade_out=4.0), 4.0, 0.0, 0.22)      # B1, the fifth
for t, d, pan in [(0.6, 10, -0.3), (2.1, 12, 0.3), (3.4, 11, -0.1), (4.6, 13, 0.25)]:
    place(harmonic(deg(d)), t, pan, 0.35)

# 6-10.5: canal — the qin's walking figure (tempo 80: a beat is 0.75 s)
beat = 0.75
fig = [0, 2, 3, 2, 4, 3, 2, 1]
for k, d in enumerate(fig):
    t = 6.0 + k * beat * 0.75
    place(qin(deg(d + 5, -1), dur=3.0, bright=0.4), t, -0.15 + 0.05 * (k % 3), 0.55 if k % 2 == 0 else 0.42)
place(qin(deg(0, -1), dur=4.5, bright=0.2), 6.0, -0.2, 0.5)                 # the low open string under it

# 10.5-15: rising over the residence — the xiao enters, the qin rolls
place(bell(deg(10)), 10.5, 0.1, 0.25)
place(xiao(deg(7), 1.6), 10.6, 0.15, 0.5)
place(xiao(deg(8), 1.2, glide_from=deg(7)), 12.1, 0.15, 0.5)
place(xiao(deg(9), 2.6, glide_from=deg(8)), 13.2, 0.15, 0.55)
for k, d in enumerate([5, 7, 8, 9, 7, 8]):
    place(qin(deg(d, -1), dur=2.5, bright=0.5), 10.5 + k * 0.72, -0.25, 0.38)

# 15-19.5: the stone boat — calm: the xiao's long phrase, qin answers with a slide
place(qin(deg(5, -1), dur=4.0, bright=0.3, slide=2), 15.0, -0.2, 0.55)
place(xiao(deg(8), 1.8, glide_from=deg(9)), 15.4, 0.15, 0.5)
place(xiao(deg(7), 1.4), 17.1, 0.15, 0.48)
place(xiao(deg(5), 1.4, glide_from=deg(6)), 18.4, 0.15, 0.48)
for t, d in [(16.5, 3), (17.6, 4), (18.7, 2)]:
    place(qin(deg(d, 0), dur=3.0, bright=0.6), t, -0.3, 0.33)

# 19.5-24: lotus toward the hall — warmth: qin figure an octave up, harmonics, the drone opens
for k, d in enumerate([5, 7, 9, 10, 9, 7, 8, 7]):
    place(qin(deg(d, -1), dur=2.8, bright=0.55), 19.5 + k * 0.56, -0.2 + 0.08 * (k % 2), 0.4)
place(xiao(deg(10), 2.2, glide_from=deg(9)), 20.6, 0.2, 0.5)
place(xiao(deg(9), 1.6), 22.6, 0.2, 0.48)
place(harmonic(deg(12)), 21.0, 0.35, 0.25)

# 24-30: the crane up — the swell, a gong on the title, the closing chord, the fade
place(gong(7.0, midi(TONIC - 12)), 24.0, 0.0, 0.5)
for k, d in enumerate([0, 2, 4, 5, 7, 9, 10]):                                # a slow roll up the strings
    place(qin(deg(d, -1), dur=5.5, bright=0.45), 24.05 + k * 0.11, -0.4 + k * 0.12, 0.4)
place(xiao(deg(9), 1.8), 25.0, 0.15, 0.55)
place(xiao(deg(10), 3.4, glide_from=deg(9)), 26.6, 0.15, 0.6)
place(harmonic(deg(10)), 26.0, -0.3, 0.3)
place(harmonic(deg(12)), 26.8, 0.3, 0.28)
place(qin(deg(0, -1), dur=4.0, bright=0.3), 26.0, -0.1, 0.5)
place(qin(deg(5, -1), dur=3.5, bright=0.35), 26.0, 0.1, 0.4)
place(bell(deg(15)), 27.6, 0.0, 0.18)

# ── room and master ────────────────────────────────────────────────────────────
def reverb(x, secs=3.2, wet=0.32):
    n = int(SR * secs); t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t / (secs / 6.9))
    ir = sosfilt(butter(1, 5000 / (SR / 2), output='sos'), ir)
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[: len(x)]
    return x * (1 - wet) + y * wet * 1.4

L2 = reverb(L); R2 = reverb(Rr)
st = np.stack([L2, R2], 1)
# master fade: in over 1.2 s, out over the last 1.4 s (with the picture's fade to black)
t = np.arange(N) / SR
fade = np.minimum(1, t / 1.2) * np.clip((DUR - t) / 1.4, 0, 1) ** 1.5
st *= fade[:, None]
st /= np.max(np.abs(st)) + 1e-9
st *= 0.89
pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
