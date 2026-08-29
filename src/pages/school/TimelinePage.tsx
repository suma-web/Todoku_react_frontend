import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTimeline, type SchoolPost } from "../../api/schoolPosts";
import { useAuth } from "../../contexts/auth";

const preview = (content: string) => {
  const characters = Array.from(content);
  return characters.length > 10 ? `${characters.slice(0, 10).join("")}...` : content;
};

export const TimelinePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SchoolPost[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { void getTimeline().then(setPosts); }, []);
  const visible = posts.filter((post) => filter === "all" || post.priority === filter);

  return <main className="min-h-dvh bg-transparent p-5 text-slate-900"><div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold">学校からの連絡</h1>
    <div className="my-5 flex gap-2">{["all", "urgent", "important"].map((value) => <button key={value} onClick={() => setFilter(value)} className="rounded border px-4 py-2">{value === "all" ? "すべて" : value === "urgent" ? "緊急" : "重要"}</button>)}</div>
    {visible.map((post) => <Link key={post.id} to={`/school-posts/${post.id}`} className="mb-4 block rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <strong className={post.priority === "urgent" ? "text-red-600" : post.priority === "important" ? "text-amber-600" : ""}>{post.priority}</strong>
        <small className={post.read_by_me ? "text-emerald-700" : "text-slate-500"}>{post.author_id === user?.id ? "作成した連絡" : post.read_by_me ? "既読" : "未読"}</small>
      </div>
      <h2 className="mt-2 text-xl font-bold">{post.title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-slate-700">{preview(post.content)}</p>
      <small className="mt-3 block text-slate-500">{post.author_name}</small>
    </Link>)}
  </div></main>;
};
