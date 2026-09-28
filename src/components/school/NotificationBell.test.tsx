import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { NotificationBell } from "./NotificationBell";
import { getNotifications, markNotificationRead } from "../../api/notifications";
vi.mock("../../api/notifications", () => ({ getNotifications: vi.fn(), markNotificationRead: vi.fn() }));
const item = { id: 1, post_id: 42, kind: "important_update" as const, title: "集合時間", read_at: null, created_at: "2026-09-28T09:00:00Z" };
beforeEach(() => {
 vi.mocked(getNotifications).mockReset().mockResolvedValue({ items: [item], unread_count: 1 });
 vi.mocked(markNotificationRead).mockReset().mockResolvedValue();
});
const show = () => render(<MemoryRouter><NotificationBell /><Routes><Route path="/school-posts/42" element={<p>対象の連絡</p>} /></Routes></MemoryRouter>);
it("shows unread count, marks read and opens the existing post route", async () => {
 show();
 fireEvent.click(await screen.findByRole("button", { name: "通知、未読1件" }));
 await screen.findByText("集合時間");
 vi.mocked(getNotifications).mockResolvedValue({ items: [{ ...item, read_at: "2026-09-28T10:00:00Z" }], unread_count: 0 });
 fireEvent.click(screen.getByText("集合時間"));
 expect(await screen.findByText("対象の連絡")).toBeInTheDocument();
 expect(markNotificationRead).toHaveBeenCalledWith(1);
 expect(await screen.findByRole("button", { name: "通知、未読0件" })).toBeInTheDocument();
});
it("refreshes the badge when a new notification arrives on focus", async () => {
 show(); await screen.findByRole("button", { name: "通知、未読1件" });
 vi.mocked(getNotifications).mockResolvedValue({ items: [item, { ...item, id: 2 }], unread_count: 2 });
 act(() => window.dispatchEvent(new Event("focus")));
 expect(await screen.findByRole("button", { name: "通知、未読2件" })).toBeInTheDocument();
});
it("keeps the notification unread and displays errors when marking fails", async () => {
 vi.mocked(markNotificationRead).mockRejectedValue(new Error("failed"));
 show();fireEvent.click(await screen.findByRole("button", { name: "通知、未読1件" }));
 fireEvent.click(await screen.findByText("集合時間"));
 expect(await screen.findByRole("alert")).toHaveTextContent("既読にできませんでした");
 expect(screen.queryByText("対象の連絡")).not.toBeInTheDocument();
 expect(screen.getByRole("button", { name: "通知、未読1件" })).toBeInTheDocument();
});
it("closes on Escape and restores focus to the bell", async () => {
 show(); const bell=await screen.findByRole("button", { name: "通知、未読1件" });fireEvent.click(bell);
 await screen.findByText("集合時間");fireEvent.keyDown(document, { key: "Escape" });
 await waitFor(() => expect(screen.queryByRole("region", { name: "通知一覧" })).not.toBeInTheDocument());
 expect(bell).toHaveFocus();
});
