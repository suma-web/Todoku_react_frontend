import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteSchoolPost, getSchoolPost, markSchoolPostRead, type SchoolPost } from "../../api/schoolPosts";
import { useAuth } from "../../contexts/auth";
import { isExpiredSchoolPost, schoolPostAgeWarning } from "../../utils/schoolPostAge";
import { AttachmentList } from "../../components/school/AttachmentList";

export const SchoolPostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<SchoolPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getSchoolPost(Number(id)).then((result) => { if (active) { setPost(result); setError(""); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "連絡を取得できませんでした"); });
    return () => { active = false; };
  }, [id]);

  if (error && (!post || post.id !== Number(id))) return <p className="p-8 text-red-600">{error}</p>;
  if (!post || post.id !== Number(id)) return <p className="p-8">読み込み中...</p>;
  const isCreator = user?.id === post.author_id;
  const canViewStatus = isCreator || user?.role === "admin";
  const canMarkRead = post.targeted_by_me && !isCreator && !post.superseded;
  const warning = schoolPostAgeWarning(post.created_at, post.expires_at);
  const expired = isExpiredSchoolPost(post.expires_at);

  const markRead = async () => {
    setSaving(true);
    setError("");
    try {
      await markSchoolPostRead(post.id);
      setPost({ ...post, read_by_me: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "既読状態を保存できませんでした");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`「${post.title}」を削除しますか？この操作は取り消せません。`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteSchoolPost(post.id);
      navigate("/timeline", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "連絡を削除できませんでした");
      setSaving(false);
    }
  };

  return <main className="p-6"><article className="mx-auto max-w-3xl rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
    <span className="text-sky-700">{post.priority}</span>
    <h1 className="mt-2 text-3xl font-bold">{post.title}</h1>
    {post.superseded && <div className="mt-4 rounded-lg bg-amber-50 p-3">
      <p>これは過去の連絡です。内容が更新されています。</p>
      {post.latest_post_id ? <Link className="text-sky-700 underline" to={`/school-posts/${post.latest_post_id}`}>最新の投稿を見る</Link> : <p>最新版は現在の閲覧対象外です。</p>}
    </div>}
    {post.change_summary && <div className="mt-4 rounded-lg bg-sky-50 p-3"><h2 className="font-bold">変更点</h2><p className="whitespace-pre-wrap">{post.change_summary}</p></div>}
    {post.previous_post_id && <p className="mt-3">{post.can_view_previous ? <Link className="text-sky-700 underline" to={`/school-posts/${post.previous_post_id}`}>前の投稿を見る</Link> : "前の投稿は現在の閲覧対象外です。"}</p>}
    <p className="mt-5 whitespace-pre-wrap">{post.content}</p>
    <p className="mt-4 text-sm text-slate-500">投稿者：{post.author_name}</p>
    <AttachmentList parent="school-posts" id={post.id} />
    {expired && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">有効期限切れ（通常ユーザーには表示されません）</p>}
    {warning && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{warning}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    <div className="mt-6 flex flex-wrap gap-3">
      {canMarkRead && <button disabled={post.read_by_me || saving} onClick={() => void markRead()} className="rounded bg-sky-600 px-5 py-2 text-white disabled:bg-emerald-700">{post.read_by_me ? "✓ 既読済み" : saving ? "保存中..." : "既読にする"}</button>}
      {canViewStatus && <Link to={`/teacher/school-posts/${post.id}/status`} className="rounded border border-sky-300 bg-white px-5 py-2 font-bold text-sky-700">既読状況を見る</Link>}
      {canViewStatus && !post.superseded && <Link to={`/school-posts/${post.id}/edit`} className="rounded border border-sky-300 bg-white px-5 py-2 font-bold text-sky-700">編集</Link>}
      {canViewStatus && !post.superseded && !post.previous_post_id && <button type="button" disabled={saving} onClick={() => void remove()} className="rounded border border-red-300 bg-white px-5 py-2 font-bold text-red-700 disabled:opacity-50">削除</button>}
    </div>
  </article></main>;
};
