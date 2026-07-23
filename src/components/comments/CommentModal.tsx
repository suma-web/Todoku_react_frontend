import { useState, type FormEvent } from "react";
import { createComment, type Comment } from "../../api/comments";
import { resolveImageURL, type Post } from "../../api/posts";
import type { CurrentUser } from "../../api/user";

type CommentModalProps = {
  post: Post;
  currentUser: CurrentUser;
  onClose: () => void;
  onCreated?: (comment: Comment) => void;
};

export const CommentModal = ({
  post,
  currentUser,
  onClose,
  onCreated,
}: CommentModalProps) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = text.trim().length > 0 && text.length <= 140 && !submitting;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createComment(post.id, text.trim());
      onCreated?.(created);
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "コメントを投稿できませんでした",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-500/40 px-0 py-0 sm:px-4 sm:py-12"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && !submitting && onClose()
      }
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-title"
        className="min-h-dvh w-full bg-black text-white sm:min-h-0 sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex items-center px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="閉じる"
            className="rounded-full p-2 text-2xl hover:bg-slate-900 disabled:opacity-50"
          >
            ×
          </button>
          <h2 id="comment-title" className="sr-only">
            コメントを投稿
          </h2>
        </header>

        <div className="px-4 pb-3">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
              {post.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p>
                <strong>{post.name}</strong>{" "}
                <span className="text-sm text-slate-500">@{post.name}</span>
              </p>
              {post.doc && (
                <p className="mt-1 whitespace-pre-wrap wrap-break-word">
                  {post.doc}
                </p>
              )}
              {post.image_url && (
                <img
                  src={resolveImageURL(post.image_url)}
                  alt={`${post.name}の投稿画像`}
                  className="mt-3 max-h-52 w-full rounded-2xl border border-slate-800 object-contain"
                />
              )}
              <p className="mt-4 text-sm text-slate-500">
                <span className="text-sky-500">@{post.name}</span> さんに返信
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
              {currentUser.name.slice(0, 1)}
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={140}
              rows={4}
              placeholder="返信をポスト"
              className="min-h-28 flex-1 resize-none bg-transparent pt-2 text-xl outline-none placeholder:text-slate-500"
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-3 flex items-center justify-end gap-4 border-t border-slate-800 pt-3">
            <span
              className={
                text.length >= 130
                  ? "text-sm text-amber-400"
                  : "text-sm text-slate-500"
              }
            >
              {text.length}/140
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full bg-white px-5 py-2 font-bold text-black hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "返信中..." : "返信"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
