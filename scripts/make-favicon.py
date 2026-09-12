"""
Finalises the icon set: normalises the rendered PNGs to RGBA, assembles
favicon.ico, and copies the files Next reads by convention.

Run after scripts/make-icons.mjs.

Chromium writes truecolour PNGs without an alpha channel when every pixel is
opaque, and Next's favicon.ico parser rejects anything that is not RGBA. There
is no Pillow here, so the conversion is done by hand. PNG is simple enough:
inflate the image data, undo the per scanline filters, splice in an opaque
alpha byte, then write it back unfiltered.
"""

import shutil
import struct
import zlib
from pathlib import Path

SRC = Path("public/icons")
ICO_SIZES = [16, 32, 48]
ICO_OUT = Path("src/app/favicon.ico")
COPIES = [(32, Path("src/app/icon.png")), (180, Path("src/app/apple-icon.png"))]


def _chunks(data: bytes):
    pos = 8  # skip the signature
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        tag = data[pos + 4 : pos + 8]
        yield tag, data[pos + 8 : pos + 8 + length]
        pos += 12 + length  # length + tag + payload + crc


def _chunk(tag: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + tag
        + payload
        + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
    )


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def to_rgba(png: bytes) -> bytes:
    """Rewrite an 8 bit truecolour PNG as 8 bit RGBA. RGBA input passes through."""
    header, idat = None, b""
    for tag, payload in _chunks(png):
        if tag == b"IHDR":
            header = payload
        elif tag == b"IDAT":
            idat += payload

    if header is None:
        raise ValueError("PNG has no IHDR")

    width, height, depth, colour, compression, filt, interlace = struct.unpack(
        ">IIBBBBB", header
    )
    if colour == 6:
        return png
    if (depth, colour, interlace) != (8, 2, 0):
        raise ValueError(f"expected 8 bit non interlaced RGB, got {depth=} {colour=} {interlace=}")

    raw = zlib.decompress(idat)
    bpp = 3
    stride = width * bpp
    out = bytearray()
    previous = bytearray(stride)
    pos = 0

    for _ in range(height):
        method = raw[pos]
        pos += 1
        line = bytearray(raw[pos : pos + stride])
        pos += stride

        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b = previous[i]
            c = previous[i - bpp] if i >= bpp else 0
            if method == 0:
                pass
            elif method == 1:
                line[i] = (line[i] + a) & 0xFF
            elif method == 2:
                line[i] = (line[i] + b) & 0xFF
            elif method == 3:
                line[i] = (line[i] + ((a + b) >> 1)) & 0xFF
            elif method == 4:
                line[i] = (line[i] + _paeth(a, b, c)) & 0xFF
            else:
                raise ValueError(f"unknown filter {method}")

        out.append(0)  # write back unfiltered
        for x in range(width):
            out += line[x * bpp : x * bpp + bpp]
            out.append(0xFF)
        previous = line

    new_header = struct.pack(">IIBBBBB", width, height, 8, 6, compression, filt, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", new_header)
        + _chunk(b"IDAT", zlib.compress(bytes(out), 9))
        + _chunk(b"IEND", b"")
    )


converted = 0
for path in sorted(SRC.glob("icon-*.png")):
    original = path.read_bytes()
    rgba = to_rgba(original)
    if rgba is not original:
        path.write_bytes(rgba)
        converted += 1
print(f"  normalised {converted} PNG(s) to RGBA")

# ICO: a 6 byte header, a 16 byte directory entry per image, then whole PNG
# payloads. PNG inside ICO is supported by every browser in use.
payloads = [(s, (SRC / f"icon-{s}.png").read_bytes()) for s in ICO_SIZES]
header = struct.pack("<HHH", 0, 1, len(payloads))
offset = len(header) + 16 * len(payloads)
directory, body = b"", b""
for size, data in payloads:
    directory += struct.pack(
        "<BBBBHHII",
        size if size < 256 else 0,  # width, 0 means 256
        size if size < 256 else 0,  # height
        0,                           # palette entries, 0 for truecolour
        0,                           # reserved
        1,                           # colour planes
        32,                          # bits per pixel
        len(data),
        offset,
    )
    body += data
    offset += len(data)
ICO_OUT.write_bytes(header + directory + body)
print(f"  {ICO_OUT} ({ICO_OUT.stat().st_size} bytes, sizes {ICO_SIZES})")

for size, dest in COPIES:
    shutil.copyfile(SRC / f"icon-{size}.png", dest)
    print(f"  {dest}")
