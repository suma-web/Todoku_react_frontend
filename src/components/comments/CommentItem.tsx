import { useState } from "react";
import type { Comment } from "../../api/comments";

type CommentItemProps = {
  comment: Comment;
  canDelete: boolean;
  onDelete: (comment: Comment) => void;
};

export const CommentItem = ({
  comment,
  canDelete,
  onDelete,
}: CommentItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="flex gap-3 border-b border-slate-800 px-4 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
        {comment.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1">
            <strong>{comment.name}</strong>{" "}
            <span className="text-sm text-slate-500">
              @{comment.name} ·{" "}
              {new Intl.DateTimeFormat("ja-JP", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(comment.created_at))}
            </span>
          </p>
          {canDelete && (
            <div
              className="relative"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="コメントメニュー"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-full p-1 text-slate-500 hover:bg-sky-500/10 hover:text-sky-400"
              >
                •••
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 w-36 overflow-hidden rounded-xl bg-black py-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(comment);
                    }}
                    className="w-full px-4 py-3 text-left font-bold text-red-500 hover:bg-slate-900"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap wrap-break-word">
          {comment.comment}
        </p>
      </div>
    </article>
  );
};
