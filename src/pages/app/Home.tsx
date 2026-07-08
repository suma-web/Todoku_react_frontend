export const Home = () => {
  const navigationItems = [
    { icon: "🏠", label: "ホーム" },
    { icon: "🔍", label: "話題を検索" },
    { icon: "🔔", label: "通知" },
    { icon: "✉️", label: "メッセージ" },
    { icon: "📄", label: "リスト" },
    { icon: "👤", label: "プロフィール" },
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
            className="mt-5 h-13 w-13 rounded-full bg-sky-500 font-bold transition hover:bg-sky-600 lg:h-12 lg:w-full"
          >
            <span className="lg:hidden">＋</span>
            <span className="hidden lg:inline">ポストする</span>
          </button>

          <div className="absolute bottom-4 left-3 right-3 hidden items-center gap-3 rounded-full p-3 transition hover:bg-slate-900 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold">
              U
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">ユーザー名</p>
              <p className="truncate text-sm text-slate-500">@username</p>
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
                      🖼️
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-sky-500/10"
                    >
                      GIF
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 hover:bg-sky-500/10"
                    >
                      📊
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
