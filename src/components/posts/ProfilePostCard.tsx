import { useState } from "react";
import { resolveImageURL, type Post } from "../../api/posts";

type ProfilePostCardProps = {
  post: Post;
  canDelete: boolean;
  onOpen: (postID: number) => void;
  onRequestDelete: (post: Post) => void;
};

export const ProfilePostCard = ({ post, canDelete, onOpen, onRequestDelete }: ProfilePostCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onOpen(post.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen(post.id);
      }}
      className="flex cursor-pointer gap-3 p-4 hover:bg-slate-950"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">{post.name.slice(0, 1)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="min-w-0">
            <strong>{post.name}</strong>{" "}
            <span className="text-sm text-slate-500">
              @{post.name} · {new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(post.created_at))}
            </span>
          </p>
          {canDelete && (
            <div className="relative ml-auto">
              <button
                type="button"
                aria-label="投稿メニュー"
                aria-expanded={menuOpen}
                className="rounded-full p-1 text-slate-500 hover:bg-sky-500/10 hover:text-sky-400"
                onClick={(event) => { event.stopPropagation(); setMenuOpen((current) => !current); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl bg-black py-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left font-bold text-red-500 hover:bg-slate-900"
                    onClick={(event) => { event.stopPropagation(); setMenuOpen(false); onRequestDelete(post); }}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {post.doc && <p className="mt-2 whitespace-pre-wrap wrap-break-word">{post.doc}</p>}
        {post.image_url && <img src={resolveImageURL(post.image_url)} alt="投稿画像" className="mt-3 max-h-[500px] w-full rounded-2xl border border-slate-800 object-contain" />}
        <div className="mt-3 flex max-w-sm justify-between text-slate-500"><span>♡</span><span>↻</span><span>♡</span><span>↗</span></div>
      </div>
    </article>
  );
};
