import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, type AppNotification, type NotificationList } from "../../api/notifications";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<NotificationList>({ items: [], unread_count: 0 });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const request = ++revision.current;
      try {
        const result = await getNotifications();
        if (active && request === revision.current) { setData(result); setError(""); }
      } catch {
        if (active && request === revision.current) setError("通知を取得できませんでした");
      } finally {
        if (active && request === revision.current) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const select = async (item: AppNotification) => {
    if (busy) return;
    setBusy(true);
    ++revision.current;
    try {
      await markNotificationRead(item.id);
      ++revision.current;
      setData(current => ({
        unread_count: Math.max(0, current.unread_count - (current.items.some(value => value.id === item.id && !value.read_at) ? 1 : 0)),
        items: current.items.map(value => value.id === item.id ? { ...value, read_at: value.read_at ?? new Date().toISOString() } : value),
      }));
      setError("");
      setOpen(false);
      navigate(`/school-posts/${item.post_id}`);
    } catch {
      setError("通知を既読にできませんでした。もう一度お試しください。");
    } finally { setBusy(false); }
  };

  return <div ref={root} className="relative shrink-0">
    <button ref={button} type="button" aria-label={`通知、未読${data.unread_count}件`} aria-expanded={open} aria-controls="notification-list" onClick={() => setOpen(value => !value)} className="relative rounded-full p-3 text-sky-800 hover:bg-sky-50">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      {data.unread_count > 0 && <span aria-hidden="true" className="absolute right-0 top-0 rounded-full bg-red-600 px-1.5 text-xs text-white">{data.unread_count > 99 ? "99+" : data.unread_count}</span>}
    </button>
    {open && <section id="notification-list" aria-label="通知一覧" className="fixed right-3 top-16 z-30 max-h-[70vh] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-sky-100 bg-white p-4 shadow-xl sm:absolute sm:right-0 sm:top-full">
      <h2 className="mb-3 font-bold">通知</h2>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading ? <p>読み込み中...</p> : !error && data.items.length === 0 && <p className="text-sm text-slate-500">通知はありません</p>}
      {data.items.map(item => <button key={item.id} type="button" disabled={busy} onClick={() => void select(item)} className={`block w-full border-b border-slate-100 p-3 text-left hover:bg-sky-50 disabled:opacity-50 ${item.read_at ? "text-slate-500" : "bg-sky-50 text-slate-900"}`}>
        <span className="block break-words font-medium">{!item.read_at && <span aria-label="未読">● </span>}{item.title}</span>
        <span className="block text-sm">重要な変更があります</span>
        <time className="text-xs" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("ja-JP")}</time>
      </button>)}
      {data.items.length === 100 && <p className="mt-2 text-xs text-slate-500">最新100件を表示しています</p>}
    </section>}
  </div>;
};
