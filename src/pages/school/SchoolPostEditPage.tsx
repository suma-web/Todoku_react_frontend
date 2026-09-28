import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSchoolGroups, type SchoolGroup } from "../../api/schoolGroups";
import {
  getSchoolPost,
  updateSchoolPost,
  type SchoolPostInput,
} from "../../api/schoolPosts";
import { uploadAttachments } from "../../api/attachments";
import { AttachmentPicker } from "../../components/school/AttachmentPicker";
import { attachmentsAreValid } from "../../utils/attachmentValidation";

const localDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const dateTimeLimit = (years: number) => {
  const value = new Date();
  value.setFullYear(value.getFullYear() + years);
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
};

export const SchoolPostEditPage = () => {
  const { id } = useParams();
  const postID = Number(id);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
  const [form, setForm] = useState<SchoolPostInput | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notify, setNotify] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [savedPostID, setSavedPostID] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([getSchoolPost(postID), getSchoolGroups()])
      .then(([post, groupItems]) => {
        if (!active) return;
        if (post.superseded) { setError("過去の投稿は編集できません。最新版を開いてください。"); return; }
        setGroups(groupItems);
        setNotify(false);
        setExpiresAt(localDateTime(post.expires_at));
        setForm({
          title: post.title,
          content: post.content,
          type: post.type,
          priority: post.priority,
          expires_at: post.expires_at,
          group_ids: post.group_ids,
        });
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "連絡を取得できませんでした",
          );
      });
    return () => {
      active = false;
    };
  }, [postID]);

  if (error && !form) return <p className="p-8 text-red-600">{error}</p>;
  if (!form) return <p className="p-8">読み込み中...</p>;

  const toggleGroup = (groupID: number) =>
    setForm((current) =>
      current
        ? {
            ...current,
            group_ids: current.group_ids.includes(groupID)
              ? current.group_ids.filter((value) => value !== groupID)
              : [...current.group_ids, groupID],
          }
        : current,
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const saved = savedPostID ? { id: savedPostID } : await updateSchoolPost(postID, {
        ...form,
        notify,
        change_summary: changeSummary,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setSavedPostID(saved.id);
      // Retry only attachment upload after the post has been saved.
      setNotify(false);
      await uploadAttachments("school-posts", saved.id, files);
      navigate(`/school-posts/${saved.id}`, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "編集できませんでした");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh p-6 text-slate-900">
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-2xl font-bold">学校連絡を編集</h1>
        <p className="text-sm text-slate-600">
          通常編集は本文を更新します。重要な変更は元の連絡を残して再投稿し、対象者に通知します。
        </p>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <fieldset disabled={submitting || savedPostID !== null} className="space-y-5">
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          maxLength={200}
          className="w-full rounded border border-slate-300 bg-white p-3"
        />
        <textarea
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
          rows={8}
          className="w-full rounded border border-slate-300 bg-white p-3"
        />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SchoolPostInput["type"] })} className="rounded border border-slate-300 bg-white p-3">
            <option value="notice">お知らせ</option><option value="emergency">緊急連絡</option>
          </select>
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as SchoolPostInput["priority"] })} className="rounded border border-slate-300 bg-white p-3">
            <option value="normal">通常</option><option value="important">重要</option><option value="urgent">緊急</option>
          </select>
        </div>
        <label className="block">有効期限
          <input type="datetime-local" min={dateTimeLimit(0)} max={dateTimeLimit(2)} value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="ml-3 rounded border border-slate-300 bg-white p-2" />
        </label>
        <fieldset>
          <legend className="mb-2 font-bold">送信対象</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {groups.map((group) => <label key={group.id} className="rounded-xl border border-sky-100 bg-white p-3"><input type="checkbox" checked={form.group_ids.includes(group.id)} onChange={() => toggleGroup(group.id)} className="mr-2" />{group.name}</label>)}
          </div>
        </fieldset>
        <div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={notify} disabled={submitting} onChange={event => setNotify(event.target.checked)} aria-describedby="notify-help" />元の連絡を残して再投稿し、対象者に通知する</label>
          <p id="notify-help" className="mt-2 text-sm text-slate-600">日時・場所・期限・持ち物など、行動に影響する変更時に使用してください。再投稿後の配信対象者に通知します。元の添付ファイルは過去の投稿に残ります。必要なファイルは再添付してください。</p>
        </div>
        {notify && <label className="block">変更点
          <textarea required maxLength={500} value={changeSummary} onChange={event => setChangeSummary(event.target.value)} placeholder="例：集合時間を9:00から8:30に変更しました" className="mt-2 w-full rounded border border-slate-300 bg-white p-3" />
        </label>}
        </fieldset>
        {savedPostID && <p role="status">連絡は保存済みです。添付の送信を再試行できます。</p>}
        <AttachmentPicker files={files} onChange={setFiles} disabled={submitting} />
        <button disabled={submitting || (notify && !changeSummary.trim()) || !form.title.trim() || !form.content.trim() || form.group_ids.length === 0 || !attachmentsAreValid(files)} className="w-full rounded bg-sky-600 p-3 font-bold text-white disabled:opacity-40">{submitting ? "保存中..." : savedPostID ? "添付の送信を再試行" : notify ? "変更して再投稿" : "連絡内容を更新"}</button>
      </form>
    </main>
  );
};
