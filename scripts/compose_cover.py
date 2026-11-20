"""Compose a reel cover: a full-bleed 1080x1920 scene, a series label and a two-line headline.

    uv run --with pillow python scripts/compose_cover.py scene.png out/cover.png \
        --series exp "Can ChatGPT" "hear a *tune*?"
    uv run --with pillow python scripts/compose_cover.py --sheet sheet.png a.png b.png c.png

The scene is the image (usually from Codex): its top band (y 0-760) calm and dark, the subject
below. `*word*` in a headline line takes the series colour. `--zoom 1.15` enlarges the scene from
its bottom edge when the subject sits too low and leaves a dark gap under the headline.
`--sheet` lays finished covers side by side, so the author compares candidates in one image.

The profile grid crops each cover to the central 3:4 band (y 240-1680): the label and the headline
are placed inside it.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
GRID_TOP, GRID_BOTTOM = 240, 1680
MAX_TEXT_WIDTH = 940
FONT = os.environ.get("COVER_FONT", "/System/Library/Fonts/Avenir Next.ttc")
FONT_INDEX = int(os.environ.get("COVER_FONT_INDEX", "8"))  # Avenir Next Heavy

# One palette and label per series, so the grid reads as a set.
SERIES = {
    "exp": {"tag": "AI EXPERIMENTS", "accent": (110, 232, 255), "tag_text": (10, 30, 50)},
    "explained": {"tag": "AI EXPLAINED", "accent": (255, 214, 90), "tag_text": (30, 24, 6)},
    "maths": {"tag": "MATHS", "accent": (255, 150, 70), "tag_text": (40, 20, 8)},
    "sports": {"tag": "SPORTS AI", "accent": (190, 245, 110), "tag_text": (12, 36, 24)},
}


def font(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONT, size, index=FONT_INDEX)
    except OSError:
        sys.exit(f"font not found: {FONT} (set COVER_FONT and COVER_FONT_INDEX to a heavy sans)")


def parts(line: str) -> list[tuple[str, bool]]:
    """'hear a *tune*?' -> [('hear a ', False), ('tune', True), ('?', False)]"""
    return [(text, i % 2 == 1) for i, text in enumerate(line.split("*")) if text]


def scene(path: str, zoom: float) -> Image.Image:
    im = Image.open(path).convert("RGB").resize((W, H), Image.LANCZOS)
    if zoom <= 1:
        return im
    w, h = int(W * zoom), int(H * zoom)
    big = im.resize((w, h), Image.LANCZOS)
    x = (w - W) // 2
    return big.crop((x, h - H, x + W, h))


def compose(scene_path: str, out: str, series: str, lines: list[str], zoom: float = 1.0) -> None:
    s = SERIES[series]
    im = scene(scene_path, zoom)
    draw = ImageDraw.Draw(im)
    plain = [line.replace("*", "") for line in lines]

    size = 138
    while max(draw.textlength(t, font=font(size)) for t in plain) > MAX_TEXT_WIDTH:
        size -= 4
    face = font(size)
    line_h = int(size * 1.04)
    top = GRID_TOP + 130
    block_h = line_h * len(lines)

    # A dark veil that fades out under the headline keeps it readable on any scene.
    veil = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(veil)
    end = top + block_h + 140
    for y in range(GRID_TOP, end):
        vd.line((0, y, W, y), fill=int(150 * max(0.0, 1 - (y - GRID_TOP) / (end - GRID_TOP)) ** 0.9))
    im = Image.composite(Image.new("RGB", (W, H), (6, 6, 12)), im, veil)

    # Soft shadow, then the text.
    shadow = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shadow)
    for i, t in enumerate(plain):
        sd.text(((W - sd.textlength(t, font=face)) / 2, top + i * line_h + 2), t, font=face, fill=255)
    shadow = shadow.filter(ImageFilter.GaussianBlur(14)).point(lambda a: min(255, int(a * 0.9)))
    im = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, shadow)

    draw = ImageDraw.Draw(im)
    for i, line in enumerate(lines):
        x = (W - draw.textlength(plain[i], font=face)) / 2
        for text, accent in parts(line):
            draw.text((x, top + i * line_h), text, font=face, fill=s["accent"] if accent else (255, 255, 255))
            x += draw.textlength(text, font=face)

    tag_face = font(30)
    tw = draw.textlength(s["tag"], font=tag_face)
    draw.rounded_rectangle((W / 2 - tw / 2 - 26, GRID_TOP + 50, W / 2 + tw / 2 + 26, GRID_TOP + 106), 28, fill=s["accent"])
    draw.text((W / 2, GRID_TOP + 78), s["tag"], font=tag_face, fill=s["tag_text"], anchor="mm")

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out)
    print(out)


def sheet(out: str, covers: list[str]) -> None:
    gap, w, h = 20, 540, 960
    canvas = Image.new("RGB", (len(covers) * w + (len(covers) - 1) * gap, h), (10, 10, 14))
    for i, path in enumerate(covers):
        canvas.paste(Image.open(path).convert("RGB").resize((w, h), Image.LANCZOS), (i * (w + gap), 0))
    canvas.save(out)
    print(out)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--sheet", metavar="OUT", help="lay finished covers side by side into OUT")
    ap.add_argument("--series", choices=sorted(SERIES), default="exp")
    ap.add_argument("--zoom", type=float, default=1.0)
    ap.add_argument("args", nargs="+")
    a = ap.parse_intermixed_args()
    if a.sheet:
        sheet(a.sheet, a.args)
        return
    if len(a.args) < 3:
        ap.error("usage: scene.png out.png 'line 1' ['line *2*']")
    scene_path, out, *lines = a.args
    compose(scene_path, out, a.series, lines, a.zoom)


if __name__ == "__main__":
    main()
