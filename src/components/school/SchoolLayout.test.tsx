import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { SchoolLayout } from "./SchoolLayout";
vi.mock("../../contexts/auth", () => ({ useAuth: () => ({ user: { id: 1, name: "末廣", role: "teacher" }, refresh: vi.fn() }) }));
vi.mock("../../api/notifications", () => ({ getNotifications: vi.fn().mockResolvedValue({ items: [], unread_count: 0 }) }));
it("uses the authenticated user's name without another me request", async () => {
 const fetchMock=vi.spyOn(globalThis,"fetch");
 render(<MemoryRouter><SchoolLayout /></MemoryRouter>);
 expect(screen.getByText("末廣")).toBeInTheDocument();
 expect(await screen.findByRole("button", {name:"通知、未読0件"})).toBeInTheDocument();
 expect(fetchMock).not.toHaveBeenCalled();
 fetchMock.mockRestore();
});
