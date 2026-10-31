"""Generates the PWA icons into public/. Run: python3 scripts/make-icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public"
BG = (20, 20, 20, 255)  # #141414
FG = (230, 230, 230, 255)  # #e6e6e6
SS = 4  # draw large and downscale for anti-aliasing


def draw_icon(size, rounded, glyph_scale):
    n = size * SS
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=int(n * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, n, n], fill=BG)

    # Stopwatch glyph: drawn in 100x100 unit coordinates
    k = n * glyph_scale / 100
    ox = oy = n * (1 - glyph_scale) / 2

    def p(x, y):
        return ox + x * k, oy + y * k

    cx, cy, r, w = 50, 57, 30, 7
    d.ellipse([*p(cx - r, cy - r), *p(cx + r, cy + r)], outline=FG, width=int(w * k))
    # top button and stem
    d.rounded_rectangle([*p(40, 12), *p(60, 20)], radius=int(3 * k), fill=FG)
    d.rectangle([*p(47, 19), *p(53, 28)], fill=FG)
    # side button
    d.line([p(76, 30), p(82, 24)], fill=FG, width=int(6 * k))
    # hand
    d.line([p(cx, cy), p(cx, cy - 18)], fill=FG, width=int(6 * k))
    d.ellipse([*p(cx - 4, cy - 4), *p(cx + 4, cy + 4)], fill=FG)

    return img.resize((size, size), Image.LANCZOS)


draw_icon(192, True, 0.72).save(OUT / "icon-192.png")
draw_icon(512, True, 0.72).save(OUT / "icon-512.png")
# Maskable: edges may be cropped, so full bleed and a smaller glyph
draw_icon(512, False, 0.56).save(OUT / "icon-maskable-512.png")
# iOS rounds the corners itself
draw_icon(180, False, 0.66).save(OUT / "apple-touch-icon.png")
print("done")
