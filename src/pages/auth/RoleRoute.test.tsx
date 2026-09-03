import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "../../api/user";
import { RoleRoute } from "./RoleRoute";

const authState = vi.hoisted(() => ({
  user: null as CurrentUser | null,
  loading: false,
}));

vi.mock("../../contexts/auth", () => ({
  useAuth: () => ({ ...authState, refresh: vi.fn() }),
}));

const renderAdminRoute = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/" element={<p>ホーム</p>} />
        <Route path="/login" element={<p>ログイン</p>} />
        <Route element={<RoleRoute roles={["admin"]} />}>
          <Route path="/admin" element={<p>管理画面</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("RoleRoute", () => {
  it("allows an administrator", () => {
    authState.user = {
      id: 1,
      name: "管理者",
      email: "admin@example.com",
      created_at: "2026-01-01T00:00:00Z",
      role: "admin",
      is_active: true,
    };

    renderAdminRoute();

    expect(screen.getByText("管理画面")).toBeInTheDocument();
  });

  it("redirects a student away from an administrator route", () => {
    authState.user = {
      id: 2,
      name: "生徒",
      email: "student@example.com",
      created_at: "2026-01-01T00:00:00Z",
      role: "student",
      is_active: true,
    };

    renderAdminRoute();

    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.queryByText("管理画面")).not.toBeInTheDocument();
  });

  it("redirects an unauthenticated user to login", () => {
    authState.user = null;

    renderAdminRoute();

    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });
});
