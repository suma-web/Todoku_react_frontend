import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, login } from "./auth";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("sends credentials and login data to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1, role: "student" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await login({ email: "student@example.com", password: "password" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/login$/);
    expect(options).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(JSON.parse(String(options.body))).toEqual({
      email: "student@example.com",
      password: "password",
    });
  });

  it("converts a 401 response into ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "INVALID_CREDENTIALS", message: "認証に失敗しました" },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = login({ email: "invalid@example.com", password: "wrong" });

    await expect(result).rejects.toMatchObject<Partial<ApiError>>({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "認証に失敗しました",
    });
  });
});
