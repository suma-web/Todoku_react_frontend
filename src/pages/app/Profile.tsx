import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  deletePost,
  getUserTweets,
  resolveImageURL,
  type Post,
} from "../../api/posts";
import {
  getCurrentUser,
  getUserProfile,
  updateProfile,
  type CurrentUser,
  type ProfileInput,
} from "../../api/user";

const PAGE_SIZE = 10;

type EditModalProps = {
  profile: CurrentUser;
  onClose: () => void;
  onSaved: (profile: CurrentUser) => void;
};

const EditProfileModal = ({ profile, onClose, onSaved }: EditModalProps) => {
  const [form, setForm] = useState<ProfileInput>({
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof ProfileInput, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      onSaved(await updateProfile(form));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-500/40 px-0 py-0 sm:px-4 sm:py-12"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="min-h-dvh w-full bg-black text-white sm:min-h-0 sm:max-w-xl sm:rounded-2xl"
      >
        <header className="sticky top-0 flex items-center gap-6 border-b border-slate-800 bg-black/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full p-2 text-xl hover:bg-slate-900"
          >
            ×
          </button>
          <h2 id="edit-profile-title" className="flex-1 text-xl font-bold">
            プロフィールを編集
          </h2>
          <button
            disabled={saving || !form.name.trim()}
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black disabled:opacity-50"
          >
            {saving ? "保存中" : "保存"}
          </button>
        </header>
        <div className="space-y-5 p-4">
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            名前
            <input
              autoFocus
              value={form.name}
              maxLength={50}
              onChange={(e) => setField("name", e.target.value)}
              className="mt-1 w-full bg-transparent text-base text-white outline-none"
            />
            <span className="float-right">{form.name.length}/50</span>
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            自己紹介
            <textarea
              value={form.bio}
              maxLength={160}
              rows={4}
              onChange={(e) => setField("bio", e.target.value)}
              className="mt-1 w-full resize-none bg-transparent text-base text-white outline-none"
            />
            <span className="float-right">{form.bio.length}/160</span>
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            場所
            <input
              value={form.location}
              maxLength={30}
              onChange={(e) => setField("location", e.target.value)}
              className="mt-1 w-full bg-transparent text-base text-white outline-none"
            />
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            Webサイト
            <input
              value={form.website}
              maxLength={200}
              onChange={(e) => setField("website", e.target.value)}
              className="mt-1 w-full bg-transparent text-base text-white outline-none"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export const SelfProfile = () => {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CurrentUser | null>(null);
  const [viewer, setViewer] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [menuPostID, setMenuPostID] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const decodedName = decodeURIComponent(name);
        const [foundProfile, current, page] = await Promise.all([
          getUserProfile(decodedName),
          getCurrentUser(),
          getUserTweets(decodedName, PAGE_SIZE, 0),
        ]);
        if (active) {
          setProfile(foundProfile);
          setViewer(current);
          setPosts(page.tweets);
          setHasMore(page.has_more);
        }
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "プロフィールを読み込めませんでした",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [name]);

  const loadMore = async () => {
    if (!profile || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getUserTweets(profile.name, PAGE_SIZE, posts.length);
      setPosts((current) => [...current, ...page.tweets]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "投稿を取得できませんでした",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePost(deleteTarget.id);
      setPosts((current) =>
        current.filter((post) => post.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      setMenuPostID(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "投稿を削除できませんでした",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white">
        読み込み中...
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-dvh bg-black p-8 text-center text-red-400">
        {error || "ユーザーが見つかりません"}
      </div>
    );
  const isMe = viewer?.id === profile.id;

  return (
    <div className="min-h-dvh bg-black text-white">
      <main className="mx-auto min-h-dvh max-w-[600px] border-x border-slate-800">
        <header className="sticky top-0 z-10 flex items-center gap-7 bg-black/85 px-4 py-2 backdrop-blur">
          <button
            onClick={() => navigate(-1)}
            aria-label="戻る"
            className="rounded-full p-2 text-xl hover:bg-slate-900"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-xs text-slate-500">{posts.length}件のポスト</p>
          </div>
        </header>
        <div className="h-48 bg-slate-700" />
        <section className="px-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="-mt-16 flex size-32 items-center justify-center rounded-full border-4 border-black bg-slate-600 text-5xl font-bold">
              {profile.name.slice(0, 1)}
            </div>
            {isMe && (
              <button
                onClick={() => setEditing(true)}
                className="mt-3 rounded-full border border-slate-600 px-5 py-2 font-bold hover:bg-slate-900"
              >
                プロフィールを編集
              </button>
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
          <p className="text-slate-500">@{profile.name}</p>
          {profile.bio && (
            <p className="mt-4 whitespace-pre-wrap">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {profile.location && <span>⌖ {profile.location}</span>}
            {profile.website && (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 hover:underline"
              >
                🔗 {profile.website}
              </a>
            )}
            <span>
              📅{" "}
              {new Intl.DateTimeFormat("ja-JP", {
                year: "numeric",
                month: "long",
              }).format(new Date(profile.created_at))}
              から利用しています
            </span>
          </div>
        </section>
        <div className="border-b border-slate-800 text-center">
          <span className="inline-block border-b-4 border-sky-500 px-8 py-4 font-bold">
            ポスト
          </span>
        </div>
        {error && (
          <p
            role="alert"
            className="border-b border-slate-800 p-4 text-center text-sm text-red-400"
          >
            {error}
          </p>
        )}
        {posts.length === 0 && !error && (
          <p className="p-10 text-center text-slate-500">
            まだ投稿がありません
          </p>
        )}
        <div className="divide-y divide-slate-800">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/post/${post.id}/detail`)}
              className="flex cursor-pointer gap-3 p-4 hover:bg-slate-950"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                {post.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="min-w-0">
                    <strong>{post.name}</strong>{" "}
                    <span className="text-sm text-slate-500">
                      @{post.name} ·{" "}
                      {new Intl.DateTimeFormat("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                      }).format(new Date(post.created_at))}
                    </span>
                  </p>
                  {viewer?.id === post.user_id && (
                    <div className="relative ml-auto">
                      <button
                        type="button"
                        aria-label="投稿メニュー"
                        aria-expanded={menuPostID === post.id}
                        className="rounded-full p-1 text-slate-500 hover:bg-sky-500/10 hover:text-sky-400"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuPostID((current) =>
                            current === post.id ? null : post.id,
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                          />
                        </svg>
                      </button>
                      {menuPostID === post.id && (
                        <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl bg-black py-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left font-bold text-red-500 hover:bg-slate-900"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteError("");
                              setDeleteTarget(post);
                              setMenuPostID(null);
                            }}
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {post.doc && (
                  <p className="mt-2 whitespace-pre-wrap wrap-break-word">
                    {post.doc}
                  </p>
                )}
                {post.image_url && (
                  <img
                    src={resolveImageURL(post.image_url)}
                    alt="投稿画像"
                    className="mt-3 max-h-[500px] w-full rounded-2xl border border-slate-800 object-contain"
                  />
                )}
                <div className="mt-3 flex max-w-sm justify-between text-slate-500">
                  <span>♡</span>
                  <span>↻</span>
                  <span>♡</span>
                  <span>↗</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {hasMore && (
          <div className="p-5 text-center">
            <button
              disabled={loadingMore}
              onClick={loadMore}
              className="text-sky-500 disabled:opacity-50"
            >
              {loadingMore ? "読み込み中..." : "さらに表示"}
            </button>
          </div>
        )}
      </main>
      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setProfile(updated);
            setViewer(updated);
            setEditing(false);
            navigate(`/user/${encodeURIComponent(updated.name)}`, {
              replace: true,
            });
          }}
        />
      )}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/40 px-4"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !deleting &&
            setDeleteTarget(null)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-xs rounded-2xl bg-black p-8 text-white"
          >
            <h2 id="delete-title" className="text-xl font-bold">
              ポストを削除しますか？
            </h2>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              この操作は取り消せません。プロフィールやタイムラインからポストが削除されます。
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {deleteError}
              </p>
            )}
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="mt-6 w-full rounded-full bg-red-600 py-3 font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "削除中..." : "削除"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="mt-3 w-full rounded-full border border-slate-600 py-3 font-bold hover:bg-slate-900 disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
