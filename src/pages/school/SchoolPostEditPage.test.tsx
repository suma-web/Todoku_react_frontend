import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { SchoolPostEditPage } from "./SchoolPostEditPage";
import { getSchoolPost, updateSchoolPost } from "../../api/schoolPosts";
vi.mock("../../api/schoolPosts", () => ({ getSchoolPost: vi.fn(), updateSchoolPost: vi.fn() }));
vi.mock("../../api/schoolGroups", () => ({ getSchoolGroups: vi.fn().mockResolvedValue([{ id: 1, name: "A組" }]) }));
vi.mock("../../api/attachments", () => ({ uploadAttachments: vi.fn().mockResolvedValue(undefined) }));
beforeEach(() => {
 vi.mocked(getSchoolPost).mockResolvedValue({ id: 42, author_id: 1, author_name: "教員", title: "連絡", content: "本文", type: "notice", priority: "normal", expires_at: null, created_at: "", updated_at: "", group_ids: [1], targeted_by_me: false, read_by_me: false });
 vi.mocked(updateSchoolPost).mockReset().mockResolvedValue(awaitPost());
});
function awaitPost() { return { id: 42 } as Awaited<ReturnType<typeof updateSchoolPost>>; }
for (const notify of [false, true]) {
 it(`submits notify=${notify} only when selected`, async () => {
  vi.mocked(updateSchoolPost).mockResolvedValue({ id: notify ? 43 : 42 } as Awaited<ReturnType<typeof updateSchoolPost>>);
  render(<MemoryRouter initialEntries={["/school-posts/42/edit"]}><Routes><Route path="/school-posts/:id/edit" element={<SchoolPostEditPage />} /><Route path={notify ? "/school-posts/43" : "/school-posts/42"} element={<p>保存完了</p>} /></Routes></MemoryRouter>);
  const checkbox=await screen.findByRole("checkbox", { name: "元の連絡を残して再投稿し、対象者に通知する" });
  expect(checkbox).not.toBeChecked();
  if(notify) { fireEvent.click(checkbox); fireEvent.change(screen.getByLabelText("変更点"), { target: { value: "集合時間変更" } }); }
  fireEvent.click(screen.getByRole("button", { name: notify ? "変更して再投稿" : "連絡内容を更新" }));
  await waitFor(() => expect(updateSchoolPost).toHaveBeenCalledWith(42, expect.objectContaining({ notify })));
  expect(await screen.findByText("保存完了")).toBeInTheDocument();
 });
}
