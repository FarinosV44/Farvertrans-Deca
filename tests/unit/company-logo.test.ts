import { describe, expect, test } from "vitest";
import {
  detectLogoImage,
  validateLogoUpload,
  LogoValidationError,
  LOGO_MAX_BYTES,
  LOGO_MAX_DIMENSION_PX,
} from "@/lib/company/logo";

/** Builds a minimal-but-real PNG: signature + IHDR (width/height/8-bit RGBA) + IEND. */
function buildPng(width: number, height: number): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrType = Buffer.from("IHDR", "ascii");
  const ihdrCrc = Buffer.alloc(4); // CRC not checked by our parser
  const iendLen = Buffer.alloc(4);
  const iendType = Buffer.from("IEND", "ascii");
  const iendCrc = Buffer.alloc(4);
  return Buffer.concat([sig, ihdrLen, ihdrType, ihdrData, ihdrCrc, iendLen, iendType, iendCrc]);
}

/** Builds a minimal-but-real baseline JPEG: SOI + APP0 + SOF0(width/height) + EOI. */
function buildJpeg(width: number, height: number): Buffer {
  const soi = Buffer.from([0xff, 0xd8]);
  const app0 = Buffer.from([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
  ]);
  const sof0Data = Buffer.alloc(6);
  sof0Data[0] = 8; // precision
  sof0Data.writeUInt16BE(height, 1);
  sof0Data.writeUInt16BE(width, 3);
  sof0Data[5] = 1; // 1 component (grayscale-ish, fine for this test)
  const sof0Len = Buffer.alloc(2);
  sof0Len.writeUInt16BE(2 + sof0Data.length, 0);
  const sof0 = Buffer.concat([Buffer.from([0xff, 0xc0]), sof0Len, sof0Data]);
  const eoi = Buffer.from([0xff, 0xd9]);
  return Buffer.concat([soi, app0, sof0, eoi]);
}

describe("lib/company/logo — image detection", () => {
  test("detects a real PNG and reads its dimensions", () => {
    const info = detectLogoImage(buildPng(400, 120));
    expect(info).toEqual({ mime: "image/png", width: 400, height: 120 });
  });

  test("detects a real baseline JPEG and reads its dimensions", () => {
    const info = detectLogoImage(buildJpeg(300, 90));
    expect(info).toEqual({ mime: "image/jpeg", width: 300, height: 90 });
  });

  test("rejects an SVG (text, no valid magic bytes)", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', "utf8");
    expect(detectLogoImage(svg)).toBeNull();
  });

  test("rejects garbage bytes", () => {
    expect(detectLogoImage(Buffer.from([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });
});

describe("lib/company/logo — validateLogoUpload", () => {
  test("accepts a small, real PNG within dimension limits", () => {
    const info = validateLogoUpload(buildPng(200, 60));
    expect(info.mime).toBe("image/png");
  });

  test("rejects a file over the size cap", () => {
    const oversized = Buffer.concat([buildPng(10, 10), Buffer.alloc(LOGO_MAX_BYTES)]);
    expect(() => validateLogoUpload(oversized)).toThrow(LogoValidationError);
    try {
      validateLogoUpload(oversized);
    } catch (e) {
      expect((e as LogoValidationError).code).toBe("size");
    }
  });

  test("rejects an empty buffer", () => {
    expect(() => validateLogoUpload(Buffer.alloc(0))).toThrow(LogoValidationError);
  });

  test("rejects a non-image file (e.g. SVG) with a type error", () => {
    try {
      validateLogoUpload(Buffer.from("<svg></svg>", "utf8"));
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LogoValidationError);
      expect((e as LogoValidationError).code).toBe("type");
    }
  });

  test("rejects an image exceeding the max pixel dimension", () => {
    const huge = buildPng(LOGO_MAX_DIMENSION_PX + 1, 100);
    try {
      validateLogoUpload(huge);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LogoValidationError);
      expect((e as LogoValidationError).code).toBe("dimensions");
    }
  });
});
