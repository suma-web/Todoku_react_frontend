import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getNotifications,
  type Notification,
} from "../../api/notifications";

const PAGE_SIZE = 20;

const notificationMessage = (notification: Notification) => {
  switch (notification.kind) {
    case "like":
      return "あなたのポストをいいねしました";
    case "follow":
      return "あなたをフォローしました";
    case "comment":
      return "あなたのポストにコメントしました";
    case "retweet":
      return "あなたのポストをリツイートしました";
  }
};

export const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const page = await getNotifications(PAGE_SIZE, 0);
        if (active) {
          setNotifications(page.notifications);
          setHasMore(page.has_more);
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "通知一覧を取得できませんでした",
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
    if (loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const page = await getNotifications(PAGE_SIZE, notifications.length);
      setNotifications((current) => [...current, ...page.notifications]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "通知一覧を取得できませんでした",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const openNotification = (notification: Notification) => {
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}/detail`);
      return;
    }
    navigate(`/user/${encodeURIComponent(notification.actor_name)}`);
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
          <h1 className="text-xl font-bold">通知</h1>
        </header>

        {loading && (
          <p className="p-10 text-center text-slate-500">読み込み中...</p>
        )}
        {!loading && error && notifications.length === 0 && (
          <p role="alert" className="p-10 text-center text-red-400">
            {error}
          </p>
        )}
        {!loading && !error && notifications.length === 0 && (
          <p className="p-10 text-center text-slate-500">
            まだ通知はありません
          </p>
        )}

        <section aria-label="通知一覧" className="divide-y divide-slate-800">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              role="link"
              tabIndex={0}
              onClick={() => openNotification(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openNotification(notification);
                }
              }}
              className="flex cursor-pointer gap-3 px-4 py-4 hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold">
                {notification.actor_name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(
                        `/user/${encodeURIComponent(notification.actor_name)}`,
                      );
                    }}
                    className="font-bold hover:underline"
                  >
                    {notification.actor_name}
                  </button>{" "}
                  {notificationMessage(notification)}
                </p>
                {notification.comment && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {notification.comment}
                  </p>
                )}
                <time
                  dateTime={notification.created_at}
                  className="mt-1 block text-xs text-slate-500"
                >
                  {new Intl.DateTimeFormat("ja-JP", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(notification.created_at))}
                </time>
              </div>
            </article>
          ))}
        </section>

        {error && notifications.length > 0 && (
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
