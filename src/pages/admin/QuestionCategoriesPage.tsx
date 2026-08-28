import { useEffect, useState } from "react";
import {
  createQuestionCategory,
  getQuestionCategories,
  type QuestionCategory,
} from "../../api/questions";
import { getSchoolGroups, type SchoolGroup } from "../../api/schoolGroups";

export const QuestionCategoriesPage = () => {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([getQuestionCategories(), getSchoolGroups()])
      .then(([foundCategories, foundGroups]) => {
        if (!active) return;
        setCategories(foundCategories);
        setGroups(foundGroups);
        setGroup(foundGroups.find((item) => item.type === "department")?.id ?? 0);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await createQuestionCategory(name, group);
      setCategories((current) => [...current, created]);
      setName("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "作成できませんでした");
    }
  };

  return (
    <main className="min-h-dvh bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">質問カテゴリ管理</h1>
        {error && <p className="text-red-400">{error}</p>}
        <form onSubmit={submit} className="my-6 flex gap-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="進路・奨学金" className="flex-1 rounded bg-slate-800 p-3" />
          <select value={group} onChange={(event) => setGroup(Number(event.target.value))} className="rounded bg-slate-800 p-3">
            {groups.filter((item) => item.type === "department").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button disabled={!name.trim() || !group} className="rounded bg-sky-600 px-4 disabled:opacity-40">追加</button>
        </form>
        <ul>{categories.map((item) => <li key={item.id} className="border-b border-slate-800 py-3">{item.name} → {item.group_name}</li>)}</ul>
      </div>
    </main>
  );
};
