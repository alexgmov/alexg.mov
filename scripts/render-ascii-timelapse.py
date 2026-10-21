#!/usr/bin/env python3
"""Render the homepage desk time lapse as inverted paper-and-ink ASCII cells.

Requires ffmpeg, ffprobe, Pillow, NumPy, and a local monospace font.
The original video is read only. Pass --still to inspect one frame first,
or --light to reproduce the original light-background treatment.
"""

import argparse
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PAPER = np.array([247, 248, 243], dtype=np.float32)
INKS = np.array([[47, 55, 55], [66, 77, 99], [84, 79, 58]], dtype=np.float32)
CELL_W, CELL_H = 12, 15
COLS, ROWS = 160, 72
WIDTH, HEIGHT = COLS * CELL_W, ROWS * CELL_H
LEVELS = 32
FPS = "24000/1001"


def make_atlas(font_path):
    font = ImageFont.truetype(str(font_path), 13)
    atlas = np.empty((3, LEVELS, 4, CELL_H, CELL_W, 3), dtype=np.uint8)
    for palette, ink in enumerate(INKS):
        for level in range(LEVELS):
            density = level / (LEVELS - 1)
            for variant in range(4):
                tile = Image.new("RGB", (CELL_W, CELL_H), tuple(PAPER.astype(int)))
                draw = ImageDraw.Draw(tile)
                grid = tuple((PAPER - 4).astype(int))
                draw.line((CELL_W - 1, 0, CELL_W - 1, CELL_H - 1), fill=grid)
                draw.line((0, CELL_H - 1, CELL_W - 1, CELL_H - 1), fill=grid)
                if level:
                    if density < .27:
                        ramp = ["..,'", ":;-+", "ox*:"]
                        glyph = ramp[min(2, int(density / .09))][variant]
                        color = PAPER * (1 - density * 1.6) + ink * density * 1.6
                    else:
                        # Pale glyphs cut into ink blocks, as in the shark reference.
                        opacity = .15 + .82 * ((density - .27) / .73) ** .8
                        fill = PAPER * (1 - opacity) + ink * opacity
                        draw.rectangle((1, 1, CELL_W - 2, CELL_H - 2), fill=tuple(fill.astype(int)))
                        glyph = ["tSx%", "S8%X", "8@%S"][min(2, int((density - .27) / .25))][variant]
                        color = PAPER * .95 + ink * .05
                    draw.text((CELL_W / 2, CELL_H / 2 - .5), glyph,
                              font=font, fill=tuple(color.astype(int)), anchor="mm")
                atlas[palette, level, variant] = np.asarray(tile)
    return atlas


def render_frame(rgb, atlas, frame_number, exposure):
    rgb = rgb.astype(np.float32) / 255
    luma = rgb @ np.array([.2126, .7152, .0722])
    # Keep dark room areas as paper; reveal the face, hands, and screens in ink.
    signal = np.clip((luma * exposure - .045) / .63, 0, 1) ** .72
    levels = np.minimum(LEVELS - 1, np.rint(signal * (LEVELS - 1)).astype(int))
    palettes = np.zeros((ROWS, COLS), dtype=int)
    palettes[rgb[..., 2] > rgb[..., 0] * 1.13] = 1
    palettes[rgb[..., 0] > rgb[..., 2] * 1.12] = 2
    y, x = np.indices((ROWS, COLS))
    # Spatially stable patterns with a restrained, staggered character shimmer.
    variants = (x * 7 + y * 13 + levels + (frame_number + x * 3 + y) // 10) % 4
    tiles = atlas[palettes, levels, variants]
    return tiles.transpose(0, 2, 1, 3, 4).reshape(HEIGHT, WIDTH, 3)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "videos/website landing page.mp4")
    parser.add_argument("--output", type=Path, default=ROOT / "videos/website landing page.ascii.mp4")
    parser.add_argument("--font", type=Path, default=Path("/Library/Fonts/IBMPlexMono-Regular.ttf"))
    parser.add_argument("--still", type=float, help="Render only this timestamp as PNG")
    parser.add_argument("--light", action="store_true", help="Use the original light background instead of the inverted treatment")
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error("Output must differ from input")
    atlas = make_atlas(args.font)
    if not args.light:
        atlas = 255 - atlas
    args.output.parent.mkdir(parents=True, exist_ok=True)
    filters = f"fps={FPS},scale={COLS}:{ROWS}:flags=area"
    decode = ["ffmpeg", "-hide_banner", "-loglevel", "error"]
    if args.still is not None:
        decode += ["-ss", str(args.still)]
    decode += ["-i", str(args.input), "-vf", filters]
    if args.still is not None:
        decode += ["-frames:v", "1"]
    decode += ["-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    decoder = subprocess.Popen(decode, stdout=subprocess.PIPE)
    encoder = None
    if args.still is None:
        encoder = subprocess.Popen([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}",
            "-r", FPS, "-i", "-", "-an", "-c:v", "libx264", "-preset", "slow",
            "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(args.output)
        ], stdin=subprocess.PIPE)
    frame_number = 0
    exposure = None
    try:
        while True:
            raw = decoder.stdout.read(COLS * ROWS * 3)
            if not raw:
                break
            if len(raw) != COLS * ROWS * 3:
                raise RuntimeError("Incomplete decoded frame")
            rgb = np.frombuffer(raw, dtype=np.uint8).reshape(ROWS, COLS, 3)
            luma = (rgb.astype(float) / 255) @ np.array([.2126, .7152, .0722])
            target = float(np.clip(.55 / max(.12, np.quantile(luma, .98)), .95, 2.4))
            exposure = target if exposure is None else exposure * .97 + target * .03
            frame = render_frame(rgb, atlas, frame_number, exposure)
            if encoder:
                encoder.stdin.write(frame.tobytes())
            else:
                Image.fromarray(frame).save(args.output.with_suffix(".png"))
            if frame_number % 60 == 0:
                print(f"Rendered frame {frame_number}", flush=True)
            frame_number += 1
        if decoder.wait() != 0:
            raise RuntimeError("Video decoder failed")
        if encoder:
            encoder.stdin.close()
            if encoder.wait() != 0:
                raise RuntimeError("Video encoder failed")
    finally:
        decoder.stdout.close()
        if decoder.poll() is None:
            decoder.terminate()
        if encoder and encoder.poll() is None:
            encoder.terminate()
    if not frame_number:
        raise RuntimeError("No frames rendered")
    print(json.dumps({"frames": frame_number, "width": WIDTH, "height": HEIGHT,
                      "output": str(args.output.with_suffix('.png') if args.still is not None else args.output)}))


if __name__ == "__main__":
    main()
