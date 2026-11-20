"""Sets the headline over the Codex art: cover-c.png -> thumbnail-en.png (1280x720).

The art (cover-c.png) was generated with Codex from ref-robot.png as the style reference; the
headline is set here, in code, so it can change without regenerating the art.
Run: python cover/headline.py (from the project folder). Needs Pillow and Windows' Segoe UI fonts.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
BLACK = r"C:\Windows\Fonts\seguibl.ttf"
BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
WHITE = (248, 250, 252)
CORAL = (251, 113, 133)
MUTED = (148, 163, 184)

# One list per line; each part is (text, highlighted).
LINES = [[("Your AI", False)], [("has ", False), ("5", True)], [("memories.", False)]]
SIZE, STEP, TOP, MAX_X = 96, 112, 170, 600


def main() -> None:
    im = Image.open(HERE / "cover-c.png").convert("RGB").resize((1280, 720), Image.LANCZOS)
    # Darken the left side a touch so the headline reads on the art.
    shade = Image.new("L", im.size, 0)
    sd = ImageDraw.Draw(shade)
    for x in range(640):
        sd.line([(x, 0), (x, 720)], fill=int(110 * (1 - x / 640)))
    im = Image.composite(Image.new("RGB", im.size, (8, 10, 30)), im, shade)

    font = ImageFont.truetype(BLACK, SIZE)
    y = TOP
    for parts in LINES:
        d = ImageDraw.Draw(im)
        width = sum(d.textlength(t, font=font) for t, _ in parts)
        assert 64 + width <= MAX_X, f"line runs into the robot: {parts}"
        shadow = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        x = 64
        for text, _ in parts:
            sdraw.text((x + 4, y + 6), text, font=font, fill=(0, 0, 0, 170))
            x += sdraw.textlength(text, font=font)
        blurred = shadow.filter(ImageFilter.GaussianBlur(6))
        im.paste(blurred, (0, 0), blurred)
        d = ImageDraw.Draw(im)
        x = 64
        for text, hi in parts:
            d.text((x, y), text, font=font, fill=CORAL if hi else WHITE)
            x += d.textlength(text, font=font)
        y += STEP

    d = ImageDraw.Draw(im)
    d.rounded_rectangle([64, 610, 254, 660], radius=10, outline=MUTED, width=2)
    d.text((86, 614), "AGILABS", font=ImageFont.truetype(BOLD, 30), fill=WHITE)
    im.save(HERE / "thumbnail-en.png")
    print(HERE / "thumbnail-en.png")


if __name__ == "__main__":
    main()
