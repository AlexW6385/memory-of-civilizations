#!/usr/bin/env python3
# A reference sheet: the typeface's characters on the 100-unit grid (a measure for writing stroke lists)
# python3 tools/script-ref.py 山玉永 out.png [cols] [cell]
import sys
from PIL import Image, ImageDraw, ImageFont
chars = list(sys.argv[1]); out = sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3; cell = int(sys.argv[4]) if len(sys.argv) > 4 else 520
font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', int(cell * 0.94), index=3)
rows = (len(chars) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * cell), 'white')
for i, c in enumerate(chars):
    img = Image.new('RGB', (cell, cell), 'white'); d = ImageDraw.Draw(img)
    d.text((cell / 2, cell * 0.465), c, font=font, fill=(90, 90, 90), anchor='mm')
    for g in range(0, 101, 10):
        p = g * cell / 100; col = (150, 150, 255) if g % 50 else (255, 120, 120)
        d.line([(p, 0), (p, cell)], fill=col); d.line([(0, p), (cell, p)], fill=col)
        d.text((p + 2, cell - 12), str(g), fill=(0, 0, 200)); d.text((2, cell - p - 12), str(g), fill=(0, 0, 200))
    d.text((cell - 40, 4), c, fill=(0, 140, 0))
    sheet.paste(img, ((i % cols) * cell, (i // cols) * cell))
sheet.save(out)
