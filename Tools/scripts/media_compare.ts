import sharp from "sharp";

export type MediaMismatch = { reason: string; detail?: string };
export type MediaCheckResult = { valid: boolean; mismatches: MediaMismatch[] };

export async function checkImagePair(refPath: string, testPath: string): Promise<MediaCheckResult> {
  const ref = await sharp(refPath).metadata();
  const tst = await sharp(testPath).metadata();

  const mismatches: MediaMismatch[] = [];
  const dims = ["width", "height"] as const;
  for (const d of dims) {
    if ((ref[d] ?? 0) !== (tst[d] ?? 0)) {
      mismatches.push({ reason: "dimension", detail: `${d}: ${ref[d]} vs ${tst[d]}` });
    }
  }
  if ((ref.format ?? "") !== (tst.format ?? "")) {
    mismatches.push({ reason: "format", detail: `${ref.format} vs ${tst.format}` });
  }
  // Could compare channels, hasAlpha etc. if you want:
  // if ((ref.channels ?? 0) !== (tst.channels ?? 0)) { ... }

  return { valid: mismatches.length === 0, mismatches };
}
