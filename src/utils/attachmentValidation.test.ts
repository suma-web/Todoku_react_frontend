import { describe, expect, it } from "vitest";
import { attachmentsAreValid } from "./attachmentValidation";

const file = (type: string, size: number) => ({ type, size }) as File;

describe("attachmentsAreValid", () => {
  it.each([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ])("allows %s", (type) => {
    expect(attachmentsAreValid([file(type, 1024)])).toBe(true);
  });

  it("rejects unsupported file types", () => {
    expect(attachmentsAreValid([file("image/svg+xml", 1024)])).toBe(false);
  });

  it("rejects a sixth file", () => {
    expect(
      attachmentsAreValid(
        Array.from({ length: 6 }, () => file("image/png", 1024)),
      ),
    ).toBe(false);
  });

  it("rejects a file larger than 10 MB", () => {
    expect(
      attachmentsAreValid([file("application/pdf", 10 * 1024 * 1024 + 1)]),
    ).toBe(false);
  });

  it("rejects files whose total size exceeds 25 MB", () => {
    expect(
      attachmentsAreValid([
        file("application/pdf", 10 * 1024 * 1024),
        file("image/png", 10 * 1024 * 1024),
        file("image/webp", 5 * 1024 * 1024 + 1),
      ]),
    ).toBe(false);
  });
});
