import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser, type CurrentUser } from "../../api/user";

export const Home = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        navigate("/login", { replace: true });
      }
    };

    void loadCurrentUser();
  }, [navigate]);

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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[88px_minmax(0,600px)] lg:grid-cols-[260px_minmax(0,600px)_350px]">
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

        <main className="min-h-screen border-x border-slate-800">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-black/80 backdrop-blur">
            <div className="flex h-14 items-center px-4">
              <h1 className="text-xl font-bold">ホーム</h1>
            </div>

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

          <section className="border-b border-slate-800 px-4 py-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                U
              </div>

              <div className="flex-1">
                <div className="min-h-24 py-2 text-xl text-slate-500">
                  いまどうしてる？
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <div className="flex gap-1 text-sky-500">
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-sky-500/10"
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
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-sky-500/10"
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
                      className="rounded-full p-2 hover:bg-sky-500/10"
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
                      className="rounded-full p-2 hover:bg-sky-500/10"
                    >
                      😊
                    </button>
                  </div>

                  <button
                    type="button"
                    className="rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white opacity-50"
                    onClick={() => navigate("/post/create")}
                  >
                    ポストする
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="divide-y divide-slate-800">
            {[1, 2, 3].map((item) => (
              <article key={item} className="flex gap-3 px-4 py-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-700" />
                <div className="w-full space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-28 rounded bg-slate-700" />
                      <div className="h-3 w-20 rounded bg-slate-800" />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-full rounded bg-slate-800" />
                      <div className="h-4 w-5/6 rounded bg-slate-800" />
                    </div>
                  </div>

                  <div className="h-56 rounded-2xl border border-slate-800 bg-slate-950" />

                  <div className="flex max-w-md justify-between text-slate-500">
                    <span>💬</span>
                    <span>🔁</span>
                    <span>♡</span>
                    <span>📊</span>
                    <span>↗</span>
                  </div>
                </div>
              </article>
            ))}
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
