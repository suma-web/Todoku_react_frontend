import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser, type CurrentUser } from "../../api/user";
import { getPosts, resolveImageURL, type Post } from "../../api/posts";

const POSTS_PER_PAGE = 10;

export const Home = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [postData, setPostData] = useState({
    doc: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit =
    (postData.doc.trim().length > 0 || selectedImage !== null) &&
    postData.doc.length <= 140 &&
    !isSubmitting;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("画像は5MB以下にしてください");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handlePostChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const doc = textarea.value;

    setPostData((previous) => ({
      ...previous,
      doc,
    }));

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("doc", postData.doc.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const body = (await response.json().catch(() => null)) as
        | Post
        | {
            error?: { message?: string };
          }
        | null;

      if (!response.ok) {
        const message =
          body && "error" in body ? body.error?.message : undefined;

        throw new Error(message ?? "投稿に失敗しました");
      }

      setPosts((current) => [body as Post, ...current]);

      setPostData({ doc: "" });
      handleRemoveImage();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "通信に失敗しました。時間をおいてもう一度お試しください。",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadHome = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const page = await getPosts(POSTS_PER_PAGE, 0);
        setPosts(page.posts);
        setHasMorePosts(page.has_more);
      } catch (error) {
        setPostsError(
          error instanceof Error
            ? error.message
            : "投稿一覧を取得できませんでした",
        );
      } finally {
        setIsLoadingPosts(false);
      }
    };

    void loadHome();
  }, [navigate]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    setPostsError("");
    try {
      const page = await getPosts(POSTS_PER_PAGE, posts.length);
      setPosts((current) => [...current, ...page.posts]);
      setHasMorePosts(page.has_more);
    } catch (error) {
      setPostsError(
        error instanceof Error
          ? error.message
          : "投稿一覧を取得できませんでした",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const navigationItems = [
    {
      icon: (
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
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
      label: "ホーム",
    },
    {
      icon: (
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      ),
      label: "話題を検索",
    },
    {
      icon: (
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
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
      ),
      label: "通知",
    },
    {
      icon: (
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
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
      ),
      label: "メッセージ",
    },
    {
      icon: (
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
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      ),
      label: "リスト",
    },
    {
      icon: (
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
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      ),
      label: "プロフィール",
    },
    { icon: "⋯", label: "もっと見る" },
  ];

  return (
    <div className="h-dvh overflow-hidden bg-black text-white">
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 md:grid-cols-[88px_minmax(0,600px)] lg:grid-cols-[260px_minmax(0,600px)_350px]">
        <aside className="sticky top-0 hidden h-screen border-r border-slate-800 px-3 py-4 md:block">
          <div className="mb-4 px-3 text-3xl font-black">𝕏</div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-4 rounded-full px-3 py-3 text-left text-xl transition hover:bg-slate-900 lg:text-lg"
              >
                <span className="w-8 text-center text-2xl">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="mt-5 h-13 w-13 rounded-full bg-white text-black font-bold transition hover:bg-gray-300 lg:h-12 lg:w-full"
            onClick={() => navigate("/post/create")}
          >
            <span className="lg:hidden">＋</span>
            <span className="hidden lg:inline">ポストする</span>
          </button>

          <div className="absolute bottom-4 left-3 right-3 hidden items-center gap-3 rounded-full p-3 transition hover:bg-slate-900 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold">
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
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {currentUser?.name ?? "読み込み中..."}
              </p>
              <p className="truncate text-sm text-slate-500">
                @{currentUser?.name ?? ""}
              </p>
            </div>
            <span className="ml-auto text-slate-400">⋯</span>
          </div>
        </aside>

        <main className="flex h-full min-h-0 flex-col overflow-hidden border-x border-slate-800">
          <header className="z-10 shrink-0 border-b border-slate-800 bg-black/80 backdrop-blur">
            <div className="grid grid-cols-2 text-sm font-bold">
              <button
                type="button"
                className="relative flex h-13 items-center justify-center transition hover:bg-slate-900"
              >
                おすすめ
                <span className="absolute bottom-0 h-1 w-14 rounded-full bg-sky-500" />
              </button>
              <button
                type="button"
                className="flex h-13 items-center justify-center text-slate-500 transition hover:bg-slate-900"
              >
                フォロー中
              </button>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-b border-slate-800 bg-black px-4 py-3"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                  {currentUser?.name.slice(0,1) ?? ""}
                </div>
              </div>

              <div className="flex-1">
                <div className="min-h-24 text-xl text-slate-500">
                  <textarea
                    ref={textareaRef}
                    placeholder="いまどうしてる？"
                    value={postData.doc}
                    rows={1}
                    onChange={handlePostChange}
                    disabled={isSubmitting}
                    className="box-border min-h-10 w-full resize-none overflow-hidden whitespace-pre-wrap wrap-break-words border-slate-500 py-2 text-white outline-none transition focus:border-gray-200"
                  />
                </div>

                {imagePreviewUrl && (
                  <div className="relative mb-3 overflow-hidden rounded-2xl border border-slate-800">
                    <img
                      src={imagePreviewUrl}
                      alt="選択した投稿画像のプレビュー"
                      className="max-h-80 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      aria-label="選択した画像を削除"
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white transition hover:bg-black/90"
                    >
                      ×
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <p role="alert" className="mb-3 text-sm text-red-400">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <div className="flex gap-1 text-white">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isSubmitting}
                      aria-label="投稿する画像を選択"
                      className="rounded-full p-2 hover:bg-gray-500/10"
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
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-slate-900"
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
                          d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-slate-900"
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
                          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-slate-900"
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
                          d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="min-w-24 rounded-full bg-white px-5 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span
                        aria-label="投稿中"
                        className="mx-auto block size-5 animate-spin rounded-full border-2 border-black border-t-transparent"
                      />
                    ) : (
                      "ポストする"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <section className="min-h-0 flex-1 divide-y divide-slate-800 overflow-y-auto overscroll-contain">
            {isLoadingPosts && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                投稿を読み込んでいます...
              </p>
            )}

            {!isLoadingPosts && postsError && (
              <p
                role="alert"
                className="px-4 py-8 text-center text-sm text-red-400"
              >
                {postsError}
              </p>
            )}

            {!isLoadingPosts && !postsError && posts.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                まだ投稿がありません
              </p>
            )}

            {posts.map((post) => (
              <article key={post.id} className="flex gap-3 px-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                  {post.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold">{post.name}</span>
                    <span className="shrink-0 text-sm text-slate-500">
                      @{post.name} ·{" "}
                      {new Intl.DateTimeFormat("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(post.created_at))}
                    </span>
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

                  <div className="flex max-w-md justify-between text-slate-500">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                        />
                      </svg>
                    </span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                    </span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                        />
                      </svg>
                    </span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {!isLoadingPosts && posts.length > 0 && hasMorePosts && (
              <div className="px-4 py-5 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-full border border-slate-700 px-5 py-2 text-sm font-bold transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingMore ? "読み込み中..." : "さらに表示"}
                </button>
              </div>
            )}
          </section>
        </main>

        <aside className="sticky top-0 hidden h-screen space-y-4 overflow-y-auto px-6 py-3 lg:block">
          <div className="sticky top-3">
            <label className="block">
              <span className="sr-only">検索</span>
              <input
                type="search"
                placeholder="検索"
                className="h-11 w-full rounded-full border border-transparent bg-slate-900 px-5 text-sm outline-none transition focus:border-sky-500"
              />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
};
