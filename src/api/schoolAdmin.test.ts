import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteManagedUser } from "./schoolAdmin";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("deleteManagedUser", () => {
  it("sends an authenticated DELETE request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await deleteManagedUser(42);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/admin\/users\/42$/);
    expect(options).toMatchObject({ method: "DELETE", credentials: "include" });
  });

  it("shows the backend conflict reason", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: "有効な管理者を最低1人残す必要があります" },
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(deleteManagedUser(42)).rejects.toThrow(
      "有効な管理者を最低1人残す必要があります",
    );
  });
});
