import { describe, it, expect } from "vitest";
import { verifyFileSignature } from "@/lib/file-signature";

function makeFile(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("verifyFileSignature", () => {
  it("accepts a real PDF header claiming to be a PDF", async () => {
    const file = makeFile(
      [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34],
      "report.pdf",
      "application/pdf",
    );
    expect(await verifyFileSignature(file, "application/pdf")).toBe(true);
  });

  it("accepts a real PNG header claiming to be a PNG", async () => {
    const file = makeFile(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      "photo.png",
      "image/png",
    );
    expect(await verifyFileSignature(file, "image/png")).toBe(true);
  });

  it("rejects a file whose bytes don't match ANY known signature (e.g. a renamed executable)", async () => {
    const file = makeFile(
      [0x4d, 0x5a, 0x90, 0x00], // "MZ" — Windows PE executable header
      "totally-a-report.pdf",
      "application/pdf",
    );
    expect(await verifyFileSignature(file, "application/pdf")).toBe(false);
  });

  it("rejects a file whose real content type doesn't match its claimed type", async () => {
    // Real PNG bytes, but uploaded claiming to be a PDF — e.g. a form
    // field tampered with client-side.
    const file = makeFile(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      "sneaky.pdf",
      "application/pdf",
    );
    expect(await verifyFileSignature(file, "application/pdf")).toBe(false);
  });
});
