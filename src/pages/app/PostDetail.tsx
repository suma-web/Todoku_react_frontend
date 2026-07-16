import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getPost, resolveImageURL, type Post } from "../../api/posts";

export const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postID = Number(id);
    if (!Number.isInteger(postID) || postID <= 0) {
      setErrorMessage("投稿IDが不正です");
      setIsLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        setPost(await getPost(postID));
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "投稿を取得できませんでした",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPost();
  }, [id]);

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto min-h-dvh w-full max-w-[600px] border-x border-slate-800">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-5 border-b border-slate-800 bg-black/85 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="前の画面へ戻る"
            className="flex size-9 items-center justify-center rounded-full text-2xl transition hover:bg-slate-900"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">ポスト</h1>
        </header>

        {isLoading && (
          <p className="px-4 py-10 text-center text-slate-500">読み込み中...</p>
        )}

        {!isLoading && errorMessage && (
          <div className="px-4 py-10 text-center">
            <p role="alert" className="text-red-400">{errorMessage}</p>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-5 rounded-full border border-slate-700 px-5 py-2 font-bold hover:bg-slate-900"
            >
              ホームへ戻る
            </button>
          </div>
        )}

        {!isLoading && post && (
          <article className="border-b border-slate-800 px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-bold">
                {post.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{post.name}</p>
                <p className="truncate text-sm text-slate-500">@{post.name}</p>
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

            <div className="flex justify-around py-3 text-slate-500" aria-label="投稿アクション">
              <button type="button" aria-label="返信" className="rounded-full p-2 hover:bg-slate-900">💬</button>
              <button type="button" aria-label="リポスト" className="rounded-full p-2 hover:bg-slate-900">↻</button>
              <button type="button" aria-label="いいね" className="rounded-full p-2 hover:bg-slate-900">♡</button>
              <button type="button" aria-label="共有" className="rounded-full p-2 hover:bg-slate-900">↗</button>
            </div>
          </article>
        )}
      </div>
    </main>
  );
};
