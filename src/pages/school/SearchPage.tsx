import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchSchool, type SearchResult } from "../../api/search";
import { schoolPostAgeWarning } from "../../utils/schoolPostAge";

export const SearchPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [items, setItems] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const result = await searchSchool(query);
      setItems(result.results);
      setParams({ q: query });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "検索できませんでした");
    }
  };

  const open = (item: SearchResult) => {
    if (item.type === "post") navigate(`/school-posts/${item.id}`);
    else if (item.type === "question") navigate(`/questions/${item.id}`);
  };

  const askContact = (categoryId: number) => {
    navigate(`/questions/new?category_id=${categoryId}`);
  };

  return <main className="min-h-dvh bg-transparent p-5 text-slate-900"><div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold">学校内を検索</h1>
    <form onSubmit={run} className="my-5 flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="お知らせ・質問・担当窓口を検索" className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-slate-900"/><button disabled={!query.trim()} className="rounded-full bg-sky-600 px-5 text-white disabled:opacity-40">検索</button></form>
    {error && <p className="text-red-600">{error}</p>}
    <div className="space-y-3">{items.map((item) => {
      const warning = item.type === "post" ? schoolPostAgeWarning(item.created_at, item.expires_at) : "";
      const content = <>
        <span className="text-sm text-sky-700">{item.type === "post" ? "お知らせ" : item.type === "question" ? "質問・回答" : "担当窓口"}</span>
        <h2 className="font-bold">{item.title}</h2><p className="text-slate-600">{item.excerpt}</p>
        {item.department && <p className="text-sm text-slate-500">担当：{item.department}</p>}
        {warning && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{warning}</p>}
      </>;

      if (item.type === "contact") {
        return <article key={`${item.type}-${item.id}`} className="w-full rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-sm">
          {content}
          <button type="button" onClick={() => askContact(item.id)} className="mt-4 rounded-full bg-sky-600 px-5 py-2 font-bold text-white transition hover:bg-sky-700">
            この窓口へ質問する
          </button>
        </article>;
      }

      return <button key={`${item.type}-${item.id}`} type="button" onClick={() => open(item)} className="block w-full rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-sm">
        {content}
      </button>;
    })}</div>
  </div></main>;
};
