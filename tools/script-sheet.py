#!/usr/bin/env python3
# Lays the brush outlines (tools/script-sheet.mjs) over a reference typeface, character by character:
# python3 tools/script-sheet.py outlines.json out.png [cols] [cell]   (the typeface is only a measure, nothing of it is kept)
import json, sys
from PIL import Image, ImageDraw, ImageFont
data = json.load(open(sys.argv[1])); out = sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4; cell = int(sys.argv[4]) if len(sys.argv) > 4 else 360
font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', int(cell * 0.94), index=3)  # TC
chars = list(data); rows = (len(chars) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * cell), 'white')
for i, c in enumerate(chars):
    d = data[c]; x0, y0 = (i % cols) * cell, (i // cols) * cell
    ref = Image.new('L', (cell, cell), 255); rd = ImageDraw.Draw(ref)
    rd.text((cell / 2, cell * 0.465), c, font=font, fill=150, anchor='mm')
    img = Image.merge('RGB', (ref, ref, ref)).convert('RGBA')
    ov = Image.new('RGBA', (cell, cell), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for g in range(0, 101, 10):
        p = g * cell / 100
        od.line([(p, 0), (p, cell)], fill=(0, 0, 255, 40)); od.line([(0, p), (cell, p)], fill=(0, 0, 255, 40))
    # the brush cell: 100 units across the typeface's em box (0.86 of the cell, centred)
    s = cell / 100
    for poly in d['polys']:
        pts = [(x * s, cell - y * s) for x, y in poly['poly']]
        od.polygon(pts, fill=(220, 0, 0, 120), outline=(120, 0, 0, 255))
        cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
        od.text((cx - 3, cy - 5), str(poly['stroke'] + 1), fill=(0, 0, 160, 255))
    img = Image.alpha_composite(img, ov).convert('RGB')
    ImageDraw.Draw(img).text((4, 2), f"{c} {d['strokes']}/{d['count']} W={d['W']:.3f}", fill=(0, 120, 0))
    sheet.paste(img, (x0, y0))
sheet.save(out)
