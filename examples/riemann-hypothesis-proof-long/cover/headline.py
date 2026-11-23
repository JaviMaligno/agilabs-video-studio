"""Sets the headline over the Codex art: cover/cover-art.png -> cover/cover-{a,b}.png (1080x1920).

The art was generated with Codex (walker.png and robot-violet.png as identity references); the
headline is set here, in code, inside the calm top of the grid's 3:4 band (y 240-1680).
Run: python3 cover/headline.py (from the project folder). Needs Pillow and macOS' Arial fonts.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
WHITE = (248, 250, 252)
ACCENT = (196, 181, 253)  # brand violet, light
MUTED = (148, 163, 184)

# One list per line; each part is (text, highlighted).
CANDIDATES = {
    "a": [[("“Math is", False)], [("dead.”", True)]],
    "b": [[("A proof", False)], [("nobody", True)], [("has read", False)]],
}
SIZE, STEP, TOP = 150, 168, 300


def render(name: str, lines) -> Path:
    im = Image.open(HERE / "cover-art.png").convert("RGB").resize((1080, 1620), Image.LANCZOS)
    canvas = Image.new("RGB", (1080, 1920), (14, 12, 40))
    canvas.paste(im, (0, 300))
    # Fill the top 300 px with the sky colour, blending into the art.
    top = im.crop((0, 0, 1080, 4)).resize((1080, 300))
    canvas.paste(top, (0, 0))
    font = ImageFont.truetype(BLACK, SIZE)
    y = TOP
    for parts in lines:
        d = ImageDraw.Draw(canvas)
        width = sum(d.textlength(t, font=font) for t, _ in parts)
        assert width <= 960, f"line too wide: {parts}"
        x0 = (1080 - width) / 2
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        x = x0
        for text, _ in parts:
            sdraw.text((x + 5, y + 8), text, font=font, fill=(0, 0, 0, 190))
            x += sdraw.textlength(text, font=font)
        blurred = shadow.filter(ImageFilter.GaussianBlur(8))
        canvas.paste(blurred, (0, 0), blurred)
        d = ImageDraw.Draw(canvas)
        x = x0
        for text, hi in parts:
            d.text((x, y), text, font=font, fill=ACCENT if hi else WHITE)
            x += d.textlength(text, font=font)
        y += STEP
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([430, 140, 650, 196], radius=12, outline=MUTED, width=2)
    d.text((456, 146), "AGILABS", font=ImageFont.truetype(BOLD, 34), fill=WHITE)
    out = HERE / f"cover-{name}.png"
    canvas.save(out)
    return out


if __name__ == "__main__":
    for name, lines in CANDIDATES.items():
        print(render(name, lines))
