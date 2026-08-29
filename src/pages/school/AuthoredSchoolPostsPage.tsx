import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMySchoolPosts, type SchoolPost } from "../../api/schoolPosts";

const preview = (content: string) => {
  const characters = Array.from(content);
  return characters.length > 10 ? `${characters.slice(0, 10).join("")}...` : content;
};

export const AuthoredSchoolPostsPage = () => {
  const [posts, setPosts] = useState<SchoolPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void getMySchoolPosts().then(setPosts).catch((reason) => setError(reason instanceof Error ? reason.message : "作成した連絡を取得できませんでした"));
  }, []);

  return <main className="p-6"><div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold">作成した連絡</h1>
    <p className="mt-1 text-sm text-slate-600">連絡を既読にしたユーザーを確認できます。</p>
    {error && <p role="alert" className="mt-5 text-red-600">{error}</p>}
    <div className="mt-5 space-y-4">{posts.map((post) => <article key={post.id} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold"><Link to={`/school-posts/${post.id}`} className="hover:text-sky-700">{post.title}</Link></h2>
      <p className="mt-2 text-slate-700">{preview(post.content)}</p>
      <small className="mt-3 block text-slate-500">既読：{post.read_users?.length ? post.read_users.map((reader) => reader.name).join("、") : "まだ誰も既読にしていません"}</small>
      <Link to={`/teacher/school-posts/${post.id}/status`} className="mt-3 inline-block text-sm font-bold text-sky-700">既読状況を見る</Link>
    </article>)}</div>
  </div></main>;
};
