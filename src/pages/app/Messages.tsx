import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createGroup,
  createMessage,
  getGroup,
  getGroups,
  getMessages,
  type DirectMessage,
  type MessageGroup,
} from "../../api/messages";
import { getCurrentUser, type CurrentUser } from "../../api/user";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const Messages = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getGroups()
      .then((page) => {
        if (active) {
          setGroups(page.groups);
          setHasMore(page.has_more);
        }
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "取得に失敗しました"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const memberNames = members.split(",").map((value) => value.trim()).filter(Boolean);
      const group = await createGroup(name.trim(), memberNames);
      navigate(`/messages/${group.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "グループを作成できませんでした");
    } finally {
      setBusy(false);
    }
  };

  const loadMore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const page = await getGroups(20, groups.length);
      setGroups((current) => [...current, ...page.groups]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto min-h-dvh max-w-[600px] border-x border-slate-800">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 text-xl hover:bg-slate-900">←</button>
            <h1 className="text-xl font-bold">メッセージ</h1>
          </div>
          <button type="button" onClick={() => setShowCreate((value) => !value)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
            新しいグループ
          </button>
        </header>

        {showCreate && (
          <form onSubmit={handleCreate} className="space-y-3 border-b border-slate-800 p-4">
            <label className="block text-sm font-bold">グループ名
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required className="mt-1 w-full rounded-xl border border-slate-700 bg-black px-3 py-2 font-normal outline-none focus:border-sky-500" />
            </label>
            <label className="block text-sm font-bold">メンバーのユーザー名
              <input value={members} onChange={(event) => setMembers(event.target.value)} placeholder="test02, test03" className="mt-1 w-full rounded-xl border border-slate-700 bg-black px-3 py-2 font-normal outline-none focus:border-sky-500" />
              <span className="mt-1 block font-normal text-slate-500">複数の場合はカンマで区切ってください</span>
            </label>
            <button type="submit" disabled={busy || !name.trim()} className="rounded-full bg-sky-500 px-5 py-2 font-bold disabled:opacity-50">
              {busy ? "作成中..." : "作成"}
            </button>
          </form>
        )}

        {error && <p role="alert" className="border-b border-slate-800 p-4 text-red-400">{error}</p>}
        {loading && <p className="p-10 text-center text-slate-500">読み込み中...</p>}
        {!loading && groups.length === 0 && !error && <p className="p-10 text-center text-slate-500">まだグループがありません</p>}
        <section aria-label="グループ一覧" className="divide-y divide-slate-800">
          {groups.map((group) => (
            <button key={group.id} type="button" onClick={() => navigate(`/messages/${group.id}`)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-950">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-bold">{group.name.slice(0, 1)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="truncate font-bold">{group.name}</p>
                  {group.last_message_at && <time className="shrink-0 text-xs text-slate-500">{formatDate(group.last_message_at)}</time>}
                </div>
                <p className="truncate text-sm text-slate-500">{group.last_message ?? `${group.member_count}人のグループ`}</p>
              </div>
            </button>
          ))}
        </section>
        {hasMore && <div className="p-5 text-center"><button type="button" disabled={busy} onClick={loadMore} className="text-sky-500 disabled:opacity-50">{busy ? "読み込み中..." : "さらに表示"}</button></div>}
      </div>
    </main>
  );
};

export const MessageGroupDetail = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const id = Number(groupId);
  const validID = Number.isInteger(id) && id > 0;
  const [group, setGroup] = useState<MessageGroup | null>(null);
  const [viewer, setViewer] = useState<CurrentUser | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(validID);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(validID ? "" : "グループIDが不正です");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!validID) return;
    let active = true;
    Promise.all([getGroup(id), getMessages(id), getCurrentUser()])
      .then(([foundGroup, page, current]) => {
        if (active) {
          setGroup(foundGroup);
          setMessages(page.messages);
          setHasMore(page.has_more);
          setViewer(current);
          window.setTimeout(() => bottomRef.current?.scrollIntoView(), 0);
        }
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "読み込みに失敗しました"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, validID]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const created = await createMessage(id, text.trim());
      setMessages((current) => [...current, created]);
      setText("");
      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "投稿に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const loadOlder = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const page = await getMessages(id, 50, messages.length);
      setMessages((current) => [...page.messages, ...current]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="h-dvh bg-black text-white">
      <div className="mx-auto flex h-full max-w-[600px] flex-col border-x border-slate-800">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
          <button type="button" onClick={() => navigate("/messages")} className="rounded-full p-2 text-xl hover:bg-slate-900">←</button>
          <div><h1 className="font-bold">{group?.name ?? "メッセージ"}</h1>{group && <p className="text-xs text-slate-500">{group.member_count}人</p>}</div>
        </header>
        <section aria-label="メッセージ一覧" className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading && <p className="p-10 text-center text-slate-500">読み込み中...</p>}
          {!loading && error && messages.length === 0 && <p role="alert" className="p-10 text-center text-red-400">{error}</p>}
          {hasMore && <div className="pb-4 text-center"><button type="button" disabled={busy} onClick={loadOlder} className="text-sm text-sky-500">以前のメッセージを表示</button></div>}
          <div className="space-y-3">
            {messages.map((message) => {
              const mine = viewer?.id === message.user_id;
              return <article key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%]">
                  {!mine && <p className="mb-1 text-xs text-slate-500">{message.user_name}</p>}
                  <p className={`whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2 ${mine ? "bg-sky-500" : "bg-slate-800"}`}>{message.message}</p>
                  <time className="mt-1 block text-xs text-slate-600">{formatDate(message.created_at)}</time>
                </div>
              </article>;
            })}
          </div>
          <div ref={bottomRef} />
        </section>
        {error && messages.length > 0 && <p role="alert" className="px-4 py-2 text-sm text-red-400">{error}</p>}
        <form onSubmit={send} className="flex shrink-0 items-end gap-2 border-t border-slate-800 p-3">
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} rows={1} placeholder="メッセージを入力" disabled={!group || busy} className="min-h-11 flex-1 resize-none rounded-2xl bg-slate-900 px-4 py-3 outline-none" />
          <button type="submit" disabled={!group || !text.trim() || busy} className="rounded-full bg-sky-500 px-5 py-3 font-bold disabled:opacity-50">{busy ? "送信中" : "送信"}</button>
        </form>
      </div>
    </main>
  );
};
