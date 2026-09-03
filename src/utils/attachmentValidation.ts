const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export const attachmentsAreValid = (files: File[]) =>
  files.length <= MAX_FILES &&
  files.every((file) => ALLOWED_TYPES.has(file.type) && file.size <= MAX_FILE_BYTES) &&
  files.reduce((sum, file) => sum + file.size, 0) <= MAX_TOTAL_BYTES;
