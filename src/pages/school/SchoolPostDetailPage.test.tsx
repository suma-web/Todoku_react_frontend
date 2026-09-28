import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { SchoolPostDetailPage } from "./SchoolPostDetailPage";
import { getSchoolPost } from "../../api/schoolPosts";
vi.mock("../../api/schoolPosts",()=>({getSchoolPost:vi.fn()}));
vi.mock("../../contexts/auth",()=>({useAuth:()=>({user:{id:1,role:"teacher"}})}));
vi.mock("../../components/school/AttachmentList",()=>({AttachmentList:()=>null}));
const base={author_id:1,author_name:"教員",type:"notice" as const,priority:"normal" as const,expires_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),group_ids:[1],targeted_by_me:true,read_by_me:false};
beforeEach(()=>{
 vi.mocked(getSchoolPost).mockReset().mockImplementation(async id=> id===2 ? {...base,id:2,title:"最新版",content:"8:30に集合",previous_post_id:1,can_view_previous:true,change_summary:"9:00から8:30に変更"} : {...base,id:1,title:"元の連絡",content:"9:00に集合",superseded:true,latest_post_id:2});
});
const show=()=>render(<MemoryRouter initialEntries={["/school-posts/2"]}><Routes><Route path="/school-posts/:id" element={<SchoolPostDetailPage/>}/></Routes></MemoryRouter>);
it("navigates to the preserved post and back to the latest",async()=>{
 show();expect(await screen.findByText("8:30に集合")).toBeInTheDocument();
 expect(screen.getByText("9:00から8:30に変更")).toBeInTheDocument();
 fireEvent.click(screen.getByRole("link",{name:"前の投稿を見る"}));
 expect(await screen.findByText("9:00に集合")).toBeInTheDocument();
 expect(screen.queryByRole("link",{name:"編集"})).not.toBeInTheDocument();
 expect(screen.queryByRole("button",{name:"削除"})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("link",{name:"最新の投稿を見る"}));
 expect(await screen.findByText("8:30に集合")).toBeInTheDocument();
});
it("does not link to history outside the user's audience",async()=>{
 vi.mocked(getSchoolPost).mockResolvedValue({...base,id:2,title:"最新版",content:"本文",previous_post_id:1,can_view_previous:false});
 show();expect(await screen.findByText("前の投稿は現在の閲覧対象外です。")).toBeInTheDocument();
 expect(screen.queryByRole("link",{name:"前の投稿を見る"})).not.toBeInTheDocument();
});
