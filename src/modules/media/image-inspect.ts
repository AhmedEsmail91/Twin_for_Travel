/**
 * Image inspection from raw bytes.
 *
 * An uploaded file's declared MIME type and extension are attacker-controlled, so
 * they are treated as hints only. The real type is sniffed from the magic bytes, and
 * the dimensions are parsed from the file header. This also removes any need for a
 * native image dependency. CLAUDE.md §15.
 */

export type ImageInfo = { contentType: string; width: number; height: number };

export function inspectImage(bytes: Uint8Array): ImageInfo | null {
  return inspectJpeg(bytes) ?? inspectPng(bytes) ?? inspectRiff(bytes) ?? inspectAvif(bytes);
}

/* --- PNG ------------------------------------------------------------------ */
// 89 50 4E 47 0D 0A 1A 0A, then an IHDR chunk carrying width/height as big-endian u32.
function inspectPng(bytes: Uint8Array): ImageInfo | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || !startsWith(bytes, signature)) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { contentType: 'image/png', width: view.getUint32(16), height: view.getUint32(20) };
}

/* --- JPEG ----------------------------------------------------------------- */
// FF D8, then a chain of markers; SOFn (except DHT/DAC/RSTn) carries the dimensions.
function inspectJpeg(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1] ?? 0;

    // Start-of-frame markers, excluding DHT (C4), DAC (CC) and the RSTn range.
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return {
        contentType: 'image/jpeg',
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      };
    }

    // Padding bytes and standalone markers carry no length field.
    if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }

    const segmentLength = view.getUint16(offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }

  return null;
}

/* --- WebP ----------------------------------------------------------------- */
// "RIFF" .... "WEBP", then a VP8 / VP8L / VP8X chunk with its own dimension encoding.
function inspectRiff(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 30) return null;
  if (readAscii(bytes, 0, 4) !== 'RIFF' || readAscii(bytes, 8, 4) !== 'WEBP') return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const format = readAscii(bytes, 12, 4);

  if (format === 'VP8 ') {
    // Lossy: 14-bit width and height, little-endian, after the 3-byte start code.
    return {
      contentType: 'image/webp',
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (format === 'VP8L') {
    // Lossless: 14 bits each, packed into the 4 bytes after the signature byte.
    const packed = view.getUint32(21, true);
    return {
      contentType: 'image/webp',
      width: (packed & 0x3fff) + 1,
      height: ((packed >> 14) & 0x3fff) + 1,
    };
  }

  if (format === 'VP8X') {
    // Extended: 24-bit canvas width and height minus one, little-endian.
    return {
      contentType: 'image/webp',
      width: readUint24LE(bytes, 24) + 1,
      height: readUint24LE(bytes, 27) + 1,
    };
  }

  return null;
}

/* --- AVIF ----------------------------------------------------------------- */
/*
 * AVIF dimensions live in an `ispe` box inside a nested `meta` hierarchy. Walking
 * the full ISO-BMFF tree is out of proportion here, so the brand is confirmed and
 * the first `ispe` box is read directly; a file without one is rejected rather than
 * guessed at.
 */
function inspectAvif(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 32 || readAscii(bytes, 4, 4) !== 'ftyp') return null;

  const brand = readAscii(bytes, 8, 4);
  if (brand !== 'avif' && brand !== 'avis' && brand !== 'mif1') return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const searchLimit = Math.min(bytes.length - 20, 65_536);

  for (let offset = 16; offset < searchLimit; offset += 1) {
    if (readAscii(bytes, offset, 4) !== 'ispe') continue;
    // 4 bytes of version/flags follow the box name, then two big-endian u32s.
    return {
      contentType: 'image/avif',
      width: view.getUint32(offset + 8),
      height: view.getUint32(offset + 12),
    };
  }

  return null;
}

/* --- helpers -------------------------------------------------------------- */

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let out = '';
  for (let index = 0; index < length; index += 1) {
    out += String.fromCharCode(bytes[offset + index] ?? 0);
  }
  return out;
}

function readUint24LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16);
}
