"""YouTube thumbnail candidates for "How an AI learns": cover/thumb-art.png (Codex) -> cover/thumbnail-{a,b,c}.png (1280x720).

The art leaves its left third calm for the headline; the headline is set here, in code.
Run: python3 cover/thumbnail.py (from the project folder). Needs Pillow and macOS' Arial fonts.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
WHITE, ACCENT, MUTED = (248, 250, 252), (196, 181, 253), (148, 163, 184)
CANDIDATES = {
    "a": [[("How an AI", False)], [("learns", True)]],
    "b": [[("4", True), (" ways to", False)], [("teach an AI", False)]],
    # "The thorough way / did the most / damage" set at 43 px; re-broken so it reads at 320x180
    "c": [[("The thorough", False)], [("way did the", False)], [("most ", False), ("damage", True)]],
}
SIZE, STEP, LEFT, TOP = 84, 94, 56, 140


def render(name, lines):
    im = Image.open(HERE / "thumb-art.png").convert("RGB").resize((1280, 853), Image.LANCZOS)
    canvas = im.crop((0, 66, 1280, 786))
    # darken the left side a little so the headline reads at thumbnail size
    shade = Image.new("L", (1280, 720), 0)
    ImageDraw.Draw(shade).rectangle([0, 0, 640, 720], fill=110)
    shade = shade.filter(ImageFilter.GaussianBlur(160))
    canvas = Image.composite(Image.new("RGB", canvas.size, (8, 8, 28)), canvas, shade)
    font = ImageFont.truetype(BLACK, SIZE)
    d = ImageDraw.Draw(canvas)
    widest = max(sum(d.textlength(t, font=font) for t, _ in parts) for parts in lines)
    scale = min(1, 430 / widest)
    font = ImageFont.truetype(BLACK, int(SIZE * scale))
    step = int(STEP * scale)
    y = TOP + (3 - len(lines)) * step // 2
    for parts in lines:
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        x = LEFT
        for t, _ in parts:
            sd.text((x + 4, y + 6), t, font=font, fill=(0, 0, 0, 200)); x += sd.textlength(t, font=font)
        blurred = shadow.filter(ImageFilter.GaussianBlur(6))
        canvas.paste(blurred, (0, 0), blurred)
        d = ImageDraw.Draw(canvas)
        x = LEFT
        for t, hi in parts:
            d.text((x, y), t, font=font, fill=ACCENT if hi else WHITE); x += d.textlength(t, font=font)
        y += step
    d.rounded_rectangle([LEFT, 60, LEFT + 170, 104], radius=10, outline=MUTED, width=2)
    d.text((LEFT + 20, 66), "AGILABS", font=ImageFont.truetype(BOLD, 27), fill=WHITE)
    out = HERE / f"thumbnail-{name}.png"
    canvas.save(out)
    return out


if __name__ == "__main__":
    outs = [render(n, l) for n, l in CANDIDATES.items()]
    sheet = Image.new("RGB", (1280, 720 * 3 + 40), (30, 30, 40))
    for i, o in enumerate(outs):
        sheet.paste(Image.open(o), (0, i * 740))
    sheet.save(HERE / "thumbnail-candidates.png")
    print(*outs, sep="\n")
