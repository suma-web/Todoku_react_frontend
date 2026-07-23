import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteComment, getComments, type Comment } from "../../api/comments";
import { getPost, resolveImageURL, type Post } from "../../api/posts";
import { getCurrentUser, type CurrentUser } from "../../api/user";
import { CommentItem } from "../../components/comments/CommentItem";
import { CommentModal } from "../../components/comments/CommentModal";
import { DeleteCommentModal } from "../../components/comments/DeleteCommentModal";

const COMMENTS_PER_PAGE = 20;

export const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const postID = Number(id);
  const isValidPostID = Number.isInteger(postID) && postID > 0;
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!isValidPostID) return;
    let active = true;
    const load = async () => {
      try {
        const [foundPost, viewer, page] = await Promise.all([
          getPost(postID),
          getCurrentUser(),
          getComments(postID, COMMENTS_PER_PAGE, 0),
        ]);
        if (active) {
          setPost(foundPost);
          setCurrentUser(viewer);
          setComments(page.comments);
          setHasMoreComments(page.has_more);
        }
      } catch (reason) {
        if (active)
          setErrorMessage(
            reason instanceof Error
              ? reason.message
              : "投稿を取得できませんでした",
          );
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [postID, isValidPostID]);

  const loadMoreComments = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setCommentsError("");
    try {
      const page = await getComments(
        postID,
        COMMENTS_PER_PAGE,
        comments.length,
      );
      setComments((current) => [...current, ...page.comments]);
      setHasMoreComments(page.has_more);
    } catch (reason) {
      setCommentsError(
        reason instanceof Error
          ? reason.message
          : "コメント一覧を取得できませんでした",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteComment(deleteTarget.id);
      setComments((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error
          ? reason.message
          : "コメントを削除できませんでした",
      );
    } finally {
      setDeleting(false);
    }
  };

  const displayError = isValidPostID ? errorMessage : "投稿IDが不正です";
  const isDisplayingLoading = isValidPostID && isLoading;

  return (
    <>
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
            <h1 className="text-xl font-bold">ポスト</h1>
          </header>

          {isDisplayingLoading && (
            <p className="px-4 py-10 text-center text-slate-500">
              読み込み中...
            </p>
          )}
          {!isDisplayingLoading && displayError && (
            <div className="px-4 py-10 text-center">
              <p role="alert" className="text-red-400">
                {displayError}
              </p>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="mt-5 rounded-full border border-slate-700 px-5 py-2 font-bold hover:bg-slate-900"
              >
                ホームへ戻る
              </button>
            </div>
          )}

          {!isDisplayingLoading && !displayError && post && (
            <>
              <article className="border-b border-slate-800 px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-bold">
                    {post.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{post.name}</p>
                    <p className="truncate text-sm text-slate-500">
                      @{post.name}
                    </p>
                  </div>
                </div>
                {post.doc && (
                  <p className="mt-5 whitespace-pre-wrap wrap-break-word text-xl leading-7">
                    {post.doc}
                  </p>
                )}
                {post.image_url && (
                  <img
                    src={resolveImageURL(post.image_url)}
                    alt={`${post.name}の投稿画像`}
                    className="mt-5 max-h-[650px] w-full rounded-2xl border border-slate-800 object-contain"
                  />
                )}
                <time
                  dateTime={post.created_at}
                  className="mt-5 block border-b border-slate-800 pb-4 text-sm text-slate-500"
                >
                  {new Intl.DateTimeFormat("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(post.created_at))}
                </time>
                <div
                  className="flex justify-around py-3 text-slate-500"
                  aria-label="投稿アクション"
                >
                  <button
                    type="button"
                    aria-label="返信"
                    onClick={() => setCommenting(true)}
                    className="rounded-full p-2 hover:bg-sky-500/10 hover:text-sky-400"
                  >
                    💬
                  </button>
                  <button
                    type="button"
                    aria-label="リポスト"
                    className="rounded-full p-2 hover:bg-slate-900"
                  >
                    ↻
                  </button>
                  <button
                    type="button"
                    aria-label="いいね"
                    className="rounded-full p-2 hover:bg-slate-900"
                  >
                    ♡
                  </button>
                  <button
                    type="button"
                    aria-label="共有"
                    className="rounded-full p-2 hover:bg-slate-900"
                  >
                    ↗
                  </button>
                </div>
              </article>

              <section aria-labelledby="comments-heading">
                <h2
                  id="comments-heading"
                  className="border-b border-slate-800 px-4 py-3 font-bold"
                >
                  コメント{" "}
                  <span className="font-normal text-slate-500">
                    {comments.length}件
                  </span>
                </h2>
                {commentsError && (
                  <p
                    role="alert"
                    className="border-b border-slate-800 p-4 text-center text-sm text-red-400"
                  >
                    {commentsError}
                  </p>
                )}
                {comments.length === 0 && !commentsError && (
                  <p className="p-10 text-center text-slate-500">
                    まだコメントがありません
                  </p>
                )}
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    canDelete={currentUser?.id === comment.user_id}
                    onDelete={(target) => {
                      setDeleteError("");
                      setDeleteTarget(target);
                    }}
                  />
                ))}
                {hasMoreComments && (
                  <div className="p-5 text-center">
                    <button
                      type="button"
                      disabled={isLoadingMore}
                      onClick={loadMoreComments}
                      className="text-sky-500 disabled:opacity-50"
                    >
                      {isLoadingMore ? "読み込み中..." : "さらに表示"}
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {commenting && post && currentUser && (
        <CommentModal
          post={post}
          currentUser={currentUser}
          onClose={() => setCommenting(false)}
          onCreated={(created) =>
            setComments((current) => [...current, created])
          }
        />
      )}
      {deleteTarget && (
        <DeleteCommentModal
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};
