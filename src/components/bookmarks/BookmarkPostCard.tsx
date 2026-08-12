import { resolveImageURL, type Post } from "../../api/posts";

type BookmarkPostCardProps = {
  post: Post;
  isRemoving: boolean;
  onOpenPost: (postID: number) => void;
  onOpenProfile: (userName: string) => void;
  onRemove: (postID: number) => void;
};

export const BookmarkPostCard = ({
  post,
  isRemoving,
  onOpenPost,
  onOpenProfile,
  onRemove,
}: BookmarkPostCardProps) => (
  <article
    role="link"
    tabIndex={0}
    onClick={() => onOpenPost(post.id)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") onOpenPost(post.id);
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
            onOpenProfile(post.name);
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
        disabled={isRemoving}
        onClick={(event) => {
          event.stopPropagation();
          onRemove(post.id);
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
);
