import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchoolGroups, type SchoolGroup } from "../../api/schoolGroups";
import { createSchoolPost } from "../../api/schoolPosts";

export const SchoolPostCreatePage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
  const [groupIDs, setGroupIDs] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"notice" | "emergency">("notice");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { void getSchoolGroups().then(setGroups).catch((e) => setError(e.message)); }, []);
  const toggleGroup = (id: number) => setGroupIDs((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const post = await createSchoolPost({ title, content, type, priority, expires_at: expiresAt ? new Date(expiresAt).toISOString() : null, group_ids: groupIDs });
      navigate(`/school-posts/${post.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "投稿できませんでした"); }
    finally { setSubmitting(false); }
  };

  return <main className="min-h-dvh bg-slate-950 p-6 text-white"><form onSubmit={submit} className="mx-auto max-w-2xl space-y-5"><h1 className="text-2xl font-bold">学校連絡を作成</h1>{error && <p role="alert" className="text-red-400">{error}</p>}<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" maxLength={200} className="w-full rounded bg-slate-800 p-3"/><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="本文" rows={8} className="w-full rounded bg-slate-800 p-3"/><div className="grid grid-cols-2 gap-3"><select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded bg-slate-800 p-3"><option value="notice">お知らせ</option><option value="emergency">緊急連絡</option></select><select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="rounded bg-slate-800 p-3"><option value="normal">通常</option><option value="important">重要</option><option value="urgent">緊急</option></select></div><label className="block">有効期限<input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="ml-3 rounded bg-slate-800 p-2"/></label><fieldset><legend className="mb-2 font-bold">送信対象</legend><div className="grid gap-2 sm:grid-cols-2">{groups.map((group) => <label key={group.id} className="rounded border border-slate-700 p-3"><input type="checkbox" checked={groupIDs.includes(group.id)} onChange={() => toggleGroup(group.id)} className="mr-2"/>{group.name}</label>)}</div></fieldset><button disabled={submitting || !title.trim() || !content.trim() || groupIDs.length === 0} className="w-full rounded bg-sky-600 p-3 font-bold disabled:opacity-40">{submitting ? "送信中..." : "対象者へ送信"}</button></form></main>;
};
