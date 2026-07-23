import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  deletePost,
  getUserTweets,
  type Post,
} from "../../api/posts";
import {
  getCurrentUser,
  getUserProfile,
  type CurrentUser,
} from "../../api/user";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import { DeletePostModal } from "../../components/posts/DeletePostModal";
import { ProfilePostCard } from "../../components/posts/ProfilePostCard";

const PAGE_SIZE = 10;

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
            <ProfilePostCard
              key={post.id}
              post={post}
              canDelete={viewer?.id === post.user_id}
              onOpen={(postID) => navigate(`/post/${postID}/detail`)}
              onRequestDelete={(target) => {
                setDeleteError("");
                setDeleteTarget(target);
              }}
            />
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
        <DeletePostModal
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
