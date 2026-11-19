#!/usr/bin/env python3
# A measure for writing stroke lists: the centre lines of a reference typeface's character, as branches
# of its skeleton in the 100-unit grid (y up), spurs pruned: python3 tools/script-skel.py 山玉 [spur]
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize
CELL = 1000
font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', int(CELL * 0.94), index=3)
spur = float(sys.argv[2]) if len(sys.argv) > 2 else 4.0
def rdp(pts, eps):
    if len(pts) < 3: return pts
    a = np.array(pts[0], float); b = np.array(pts[-1], float); ab = b - a; n = np.linalg.norm(ab)
    d = [np.linalg.norm(np.array(p, float) - a) if n == 0 else abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / n for p in pts]
    i = int(np.argmax(d))
    if d[i] > eps: return rdp(pts[:i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]
for c in sys.argv[1]:
    img = Image.new('L', (CELL, CELL), 255); ImageDraw.Draw(img).text((CELL / 2, CELL * 0.465), c, font=font, fill=0, anchor='mm')
    m = np.array(img) < 128; sk = skeletonize(m)
    ys, xs = np.nonzero(sk); S = set(zip(xs.tolist(), ys.tolist()))
    nb = lambda p: [(p[0] + dx, p[1] + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and (p[0] + dx, p[1] + dy) in S]
    deg = {p: len(nb(p)) for p in S}
    nodes = {p for p in S if deg[p] != 2}
    seen = set(); branches = []
    for n0 in nodes:
        for q in nb(n0):
            if (n0, q) in seen: continue
            path = [n0, q]; seen.add((n0, q)); prev, cur = n0, q
            while cur not in nodes:
                nxt = [r for r in nb(cur) if r != prev]
                if not nxt: break
                prev, cur = cur, nxt[0]; path.append(cur)
            seen.add((cur, prev)); branches.append(path)
    out = []
    for path in branches:
        L = len(path) / 10
        ends = deg[path[0]] == 1 or deg[path[-1]] == 1
        if L < max(spur, 3.5) and (ends or L < 3.5): continue
        pts = rdp([(p[0], p[1]) for p in path], 7)
        out.append(' '.join(f"({x / 10:.0f},{100 - y / 10:.0f})" for x, y in pts))
    # dedupe reversed duplicates
    uniq = []; keys = set()
    for o in out:
        k = frozenset(o.split()); 
        if k in keys: continue
        keys.add(k); uniq.append(o)
    print(c, len(uniq)); [print('  ', u) for u in uniq]
