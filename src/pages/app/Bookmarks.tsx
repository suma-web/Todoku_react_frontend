import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getBookmarks,
  undoBookmark,
  type Post,
} from "../../api/posts";
import { BookmarkPostCard } from "../../components/bookmarks/BookmarkPostCard";

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
            <BookmarkPostCard
              key={post.id}
              post={post}
              isRemoving={removingIDs.has(post.id)}
              onOpenPost={(postID) => navigate(`/post/${postID}/detail`)}
              onOpenProfile={(userName) =>
                navigate(`/user/${encodeURIComponent(userName)}`)
              }
              onRemove={(postID) => void removeBookmark(postID)}
            />
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
