/**
 * Verifies a file's real content type by inspecting its first few
 * bytes, rather than trusting the browser-supplied `file.type` (which
 * is just read from the file extension client-side and is trivial to
 * spoof — e.g. renaming malicious.exe to report.pdf).
 *
 * DOCX detection is necessarily loose: .docx files are ZIP archives
 * (OOXML), and their magic bytes (PK\x03\x04) are identical to any
 * ZIP file — there's no way to tell "a real .docx" from "a zip file
 * renamed to .docx" from the first 4 bytes alone without unzipping and
 * checking for OOXML's internal structure, which is more than this
 * needs. Still meaningfully raises the bar: it blocks anything that
 * isn't even zip-shaped (most malicious payloads aren't), just not a
 * renamed-zip attack specifically.
 */

type AllowedMime =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "image/jpeg"
  | "image/png";

const SIGNATURES: { mime: AllowedMime; bytes: number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  {
    // Old binary .doc (OLE compound file header) — this signature is
    // also shared by .xls/.ppt, but since we only offer .doc as an
    // option this is an acceptable simplification.
    mime: "application/msword",
    bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  },
  {
    // .docx (ZIP/OOXML) — see the loose-detection note above.
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
];

function bytesMatch(header: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, i) => header[i] === byte);
}

/**
 * Returns true if the file's actual byte content is consistent with
 * the claimed MIME type. Reads only the first 8 bytes — cheap even for
 * a 25MB file.
 */
export async function verifyFileSignature(
  file: File,
  claimedMimeType: string,
): Promise<boolean> {
  const headerBuffer = await file.slice(0, 8).arrayBuffer();
  const header = new Uint8Array(headerBuffer);

  const matchingSignature = SIGNATURES.find((sig) =>
    bytesMatch(header, sig.bytes),
  );

  if (!matchingSignature) return false;
  return matchingSignature.mime === claimedMimeType;
}
