#!/usr/bin/env python3
"""Stamp Filthfactory logo + exact campaign copy onto stills."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/workspace")
OUT = ROOT / "public" / "campaign"
OUT.mkdir(parents=True, exist_ok=True)
LOGO = Image.open(ROOT / "public" / "art" / "brand" / "logo.png").convert("RGBA")
FONT_H = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"
FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FG = (244, 244, 240, 255)
LIVE = (196, 69, 60, 255)
MUTED = (180, 180, 174, 255)

def load(path):
    return Image.open(path).convert("RGBA")

def fit_logo(w):
    s = int(w)
    return LOGO.resize((s, s), Image.Resampling.LANCZOS)

def shadow_logo(base, logo, xy, blur=18, opacity=140):
    x, y = xy
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh = Image.new("RGBA", logo.size, (0, 0, 0, opacity))
    layer.paste(sh, (x, y), logo)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    out = Image.alpha_composite(base, layer)
    out.paste(logo, (x, y), logo)
    return out

def gradient(img, top=0, bot=0.42):
    w, h = img.size
    g = Image.new("L", (w, h), 0)
    gd = ImageDraw.Draw(g)
    span = int(h * bot)
    for i in range(span):
        a = int(230 * (i / max(span - 1, 1)))
        gd.line([(0, h - span + i), (w, h - span + i)], fill=a)
    if top:
        ts = int(h * top)
        for i in range(ts):
            a = int(160 * (1 - i / max(ts - 1, 1)))
            gd.line([(0, i), (w, i)], fill=max(g.getpixel((0, i)), a))
    overlay = Image.new("RGBA", (w, h), (10, 10, 10, 255))
    overlay.putalpha(g)
    return Image.alpha_composite(img, overlay)

def font(path, size):
    return ImageFont.truetype(path, size)

def draw_centered(draw, text, y, font_obj, fill, w):
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, y), text, font=font_obj, fill=fill)

def stamp_story(src, dest, kicker, title, sub, live=False):
    img = load(src)
    img = gradient(img, top=0.18, bot=0.46)
    w, h = img.size
    d = ImageDraw.Draw(img)
    logo = fit_logo(int(w * 0.22))
    img = shadow_logo(img, logo, ((w - logo.width) // 2, int(h * 0.055)))
    d = ImageDraw.Draw(img)
    kfont = font(FONT_B, max(22, w // 28))
    tfont = font(FONT_H, max(48, w // 10))
    sfont = font(FONT_R, max(22, w // 26))
    y = int(h * 0.68)
    if live:
        pill = " LIVE "
        pb = d.textbbox((0, 0), pill, font=kfont)
        pw, ph = pb[2] - pb[0] + 24, pb[3] - pb[1] + 16
        px = (w - pw) // 2
        d.rounded_rectangle((px, y, px + pw, y + ph), radius=4, fill=LIVE)
        d.text((px + 12, y + 6), pill, font=kfont, fill=(255, 246, 244, 255))
        y += ph + 18
    else:
        draw_centered(d, kicker, y, kfont, MUTED, w)
        y += int(kfont.size * 1.5)
    for line in title.split("\n"):
        draw_centered(d, line, y, tfont, FG, w)
        y += int(tfont.size * 1.05)
    y += 8
    draw_centered(d, sub, y, sfont, MUTED, w)
    img.convert("RGB").save(dest, "JPEG", quality=92)
    print("wrote", dest)

def stamp_wide(src, dest, kicker, title, sub):
    img = load(src)
    img = gradient(img, top=0.12, bot=0.5)
    w, h = img.size
    logo = fit_logo(int(h * 0.28))
    img = shadow_logo(img, logo, (int(w * 0.04), int(h * 0.08)))
    d = ImageDraw.Draw(img)
    kfont = font(FONT_B, max(18, h // 22))
    tfont = font(FONT_H, max(40, h // 8))
    sfont = font(FONT_R, max(18, h // 20))
    x = int(w * 0.04)
    y = int(h * 0.58)
    d.text((x, y), kicker, font=kfont, fill=MUTED)
    y += int(kfont.size * 1.4)
    for line in title.split("\n"):
        d.text((x, y), line, font=tfont, fill=FG)
        y += int(tfont.size * 1.02)
    d.text((x, y + 6), sub, font=sfont, fill=MUTED)
    img.convert("RGB").save(dest, "JPEG", quality=92)
    print("wrote", dest)

def stamp_square(src, dest, kicker, title, sub):
    img = load(src)
    img = gradient(img, top=0.16, bot=0.48)
    w, h = img.size
    logo = fit_logo(int(w * 0.2))
    img = shadow_logo(img, logo, ((w - logo.width) // 2, int(h * 0.05)))
    d = ImageDraw.Draw(img)
    kfont = font(FONT_B, max(20, w // 32))
    tfont = font(FONT_H, max(42, w // 12))
    sfont = font(FONT_R, max(20, w // 28))
    y = int(h * 0.7)
    draw_centered(d, kicker, y, kfont, MUTED, w)
    y += int(kfont.size * 1.45)
    for line in title.split("\n"):
        draw_centered(d, line, y, tfont, FG, w)
        y += int(tfont.size * 1.05)
    draw_centered(d, sub, y + 6, sfont, MUTED, w)
    img.convert("RGB").save(dest, "JPEG", quality=92)
    print("wrote", dest)

def end_card(w, h, dest, title, sub):
    img = Image.new("RGBA", (w, h), (10, 10, 10, 255))
    logo = fit_logo(int(min(w, h) * 0.42))
    img.paste(logo, ((w - logo.width) // 2, int(h * 0.14)), logo)
    d = ImageDraw.Draw(img)
    tfont = font(FONT_H, max(40, w // 11))
    sfont = font(FONT_R, max(20, w // 24))
    y = int(h * 0.62)
    for line in title.split("\n"):
        draw_centered(d, line, y, tfont, FG, w)
        y += int(tfont.size * 1.05)
    draw_centered(d, sub, y + 10, sfont, MUTED, w)
    img.convert("RGB").save(dest, "JPEG", quality=92)
    print("wrote", dest)

ART = Path("/workspace/artifacts/imagine_images")
stamp_story(
    ART / "359a7023-b153-4789-9cf3-219b8ab9b197.jpg",
    OUT / "01-open-the-factory.jpg",
    "FILTHFACTORY",
    "OPEN THE\nFACTORY",
    "UK underground. Live. No playlists.",
    live=True,
)
stamp_square(
    ART / "42c38a78-a95b-49f8-a3ac-8efbe466b40a.jpg",
    OUT / "02-go-live-from-the-afters.jpg",
    "ONE TAP. SAME AS TIKTOK.",
    "GO LIVE FROM\nTHE AFTERS",
    "Kitchen, cellar, warehouse. We don't care.",
)
stamp_wide(
    ART / "a52b7ff6-426b-4a3b-8ece-72c96cada354.jpg",
    OUT / "03-headphones-in.jpg",
    "FILTHFACTORY",
    "PUT YA\nHEADPHONES IN",
    "Turn it up and chill out. Listening is free.",
)
stamp_wide(
    ART / "7e1932be-1adf-4051-a56c-765c37ce7bc8.jpg",
    OUT / "04-gift-the-dj.jpg",
    "50% TO THE DJ  ·  50% RUNS THE FACTORY",
    "GIFT THE DJ",
    "No Super Follow theatre. Cash in the booth.",
)
end_card(1080, 1920, OUT / "05-endcard-story.jpg", "OPEN THE\nFACTORY", "filthfactory  ·  18+")
end_card(1080, 1080, OUT / "05-endcard-square.jpg", "OPEN THE\nFACTORY", "UK underground mixes & live  ·  18+")
end_card(1920, 1080, OUT / "05-endcard-wide.jpg", "OPEN THE FACTORY", "UK underground mixes and live broadcasts  ·  18+")
