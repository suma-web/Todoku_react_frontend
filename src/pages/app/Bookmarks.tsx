import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getBookmarks,
  resolveImageURL,
  undoBookmark,
  type Post,
} from "../../api/posts";

const PAGE_SIZE = 20;

export const Bookmarks = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removingIDs, setRemovingIDs] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const page = await getBookmarks(PAGE_SIZE, 0);
        if (active) {
          setPosts(page.posts);
          setHasMore(page.has_more);
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "ブックマーク一覧を取得できませんでした",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const page = await getBookmarks(PAGE_SIZE, posts.length);
      setPosts((current) => [...current, ...page.posts]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "ブックマーク一覧を取得できませんでした",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const removeBookmark = async (postID: number) => {
    if (removingIDs.has(postID)) return;
    setRemovingIDs((current) => new Set(current).add(postID));
    setError("");
    try {
      await undoBookmark(postID);
      setPosts((current) => current.filter((post) => post.id !== postID));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "ブックマークを解除できませんでした",
      );
    } finally {
      setRemovingIDs((current) => {
        const next = new Set(current);
        next.delete(postID);
        return next;
      });
    }
  };

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto min-h-dvh w-full max-w-[600px] border-x border-slate-800">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-5 border-b border-slate-800 bg-black/85 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="前の画面へ戻る"
            className="flex size-9 items-center justify-center rounded-full text-2xl hover:bg-slate-900"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">ブックマーク</h1>
        </header>

        {loading && (
          <p className="p-10 text-center text-slate-500">読み込み中...</p>
        )}
        {!loading && error && posts.length === 0 && (
          <p role="alert" className="p-10 text-center text-red-400">
            {error}
          </p>
        )}
        {!loading && !error && posts.length === 0 && (
          <p className="p-10 text-center text-slate-500">
            まだブックマークはありません
          </p>
        )}

        <section aria-label="ブックマーク一覧" className="divide-y divide-slate-800">
          {posts.map((post) => (
            <article
              key={post.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/post/${post.id}/detail`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(`/post/${post.id}/detail`);
                }
              }}
              className="flex cursor-pointer gap-3 px-4 py-4 hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                {post.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/user/${encodeURIComponent(post.name)}`);
                    }}
                    className="truncate font-bold hover:underline"
                  >
                    {post.name}
                  </button>
                  <time
                    dateTime={post.created_at}
                    className="shrink-0 text-sm text-slate-500"
                  >
                    @{post.name} · {new Intl.DateTimeFormat("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(post.created_at))}
                  </time>
                </div>

                {post.doc && (
                  <p className="whitespace-pre-wrap wrap-break-word text-[15px]">
                    {post.doc}
                  </p>
                )}
                {post.image_url && (
                  <img
                    src={resolveImageURL(post.image_url)}
                    alt={`${post.name}の投稿画像`}
                    loading="lazy"
                    className="max-h-[500px] w-full rounded-2xl border border-slate-800 object-contain"
                  />
                )}

                <button
                  type="button"
                  disabled={removingIDs.has(post.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeBookmark(post.id);
                  }}
                  aria-label={`${post.name}の投稿のブックマークを解除`}
                  className="rounded-full p-1 text-sky-400 hover:bg-sky-500/10 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </section>

        {error && posts.length > 0 && (
          <p role="alert" className="p-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}
        {hasMore && (
          <div className="p-5 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="text-sky-500 disabled:opacity-50"
            >
              {loadingMore ? "読み込み中..." : "さらに表示"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
