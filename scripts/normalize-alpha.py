#!/usr/bin/env python3
"""Remove low-opacity checkerboard residue from exported RGBA hero layers."""

from pathlib import Path

from PIL import Image


LAYER_DIR = Path(__file__).resolve().parents[1] / "assets" / "hero" / "layers"


def normalize(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = []
    for red, green, blue, alpha in image.getdata():
        spread = max(red, green, blue) - min(red, green, blue)
        checker_gray = spread <= 1 and red >= 125
        if path.name == "moss-foreground.png":
            checker_gray = spread <= 8 and min(red, green, blue) >= 110
        if alpha < 200 or checker_gray:
            pixels.append((red, green, blue, 0))
        else:
            pixels.append((red, green, blue, alpha))
    image.putdata(pixels)
    image.save(path, optimize=True)


for layer in sorted(LAYER_DIR.glob("*.png")):
    normalize(layer)
    print(layer.name)
