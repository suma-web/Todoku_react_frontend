import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/api/auth.ts",
        "src/pages/auth/RoleRoute.tsx",
        "src/utils/attachmentValidation.ts",
      ],
    },
  },
});
