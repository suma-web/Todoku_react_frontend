import { useEffect, useState } from "react";
import { createQuestionCategory, getQuestionCategories, updateQuestionCategory, type QuestionCategory } from "../../api/questions";
import { getSchoolGroups, type SchoolGroup } from "../../api/schoolGroups";

export const QuestionCategoriesPage = () => {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(0);
  const [editing, setEditing] = useState<QuestionCategory | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([getQuestionCategories(), getSchoolGroups()]).then(([foundCategories, foundGroups]) => {
      if (!active) return;
      setCategories(foundCategories);
      setGroups(foundGroups);
      setGroup(foundGroups.find((item) => item.type === "department")?.id ?? 0);
    }).catch((reason) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (editing) {
        const updated = await updateQuestionCategory(editing.id, { name, group_id: group, is_active: editing.is_active });
        setCategories((items) => items.map((item) => item.id === updated.id ? updated : item));
      } else {
        const created = await createQuestionCategory(name, group);
        setCategories((items) => [...items, created]);
      }
      setName("");
      setEditing(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "保存できませんでした");
    }
  };

  const beginEdit = (item: QuestionCategory) => {
    setEditing(item);
    setName(item.name);
    setGroup(item.group_id);
    setError("");
  };

  const toggleActive = async (item: QuestionCategory) => {
    const action = item.is_active ? "無効化" : "有効化";
    if (!window.confirm(`「${item.name}」を${action}しますか？`)) return;
    try {
      const updated = await updateQuestionCategory(item.id, { name: item.name, group_id: item.group_id, is_active: !item.is_active });
      setCategories((items) => items.map((current) => current.id === updated.id ? updated : current));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `${action}できませんでした`);
    }
  };

  const departments = groups.filter((item) => item.type === "department");
  return <main className="min-h-dvh bg-transparent p-6 text-slate-900"><div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold">質問カテゴリ管理</h1>
    <p className="mt-1 text-sm text-slate-600">カテゴリ名と担当部署を編集できます。不要なカテゴリは過去の質問を残したまま無効化します。</p>
    {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
    <form onSubmit={save} className="my-6 flex flex-wrap gap-3">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="進路・奨学金" className="min-w-60 flex-1 rounded border border-slate-300 bg-white p-3 text-slate-900" />
      <select value={group} onChange={(event) => setGroup(Number(event.target.value))} className="rounded border border-slate-300 bg-white p-3 text-slate-900">{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <button disabled={!name.trim() || !group} className="rounded bg-sky-600 px-4 text-white disabled:opacity-40">{editing ? "変更を保存" : "追加"}</button>
      {editing && <button type="button" onClick={() => { setEditing(null); setName(""); }} className="rounded border border-slate-300 px-4">キャンセル</button>}
    </form>
    <ul className="space-y-3">{categories.map((item) => <li key={item.id} className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 ${item.is_active ? "border-sky-100" : "border-slate-200 opacity-65"}`}>
      <div className="min-w-60 flex-1"><strong>{item.name}</strong><span className="ml-2 text-sm text-slate-600">→ {item.group_name}</span>{!item.is_active && <span className="ml-2 rounded bg-slate-200 px-2 py-1 text-xs">無効</span>}</div>
      <button type="button" onClick={() => beginEdit(item)} className="rounded border border-sky-300 px-3 py-2 text-sm text-sky-700">編集</button>
      <button type="button" onClick={() => void toggleActive(item)} className="rounded border border-slate-300 px-3 py-2 text-sm">{item.is_active ? "無効化" : "有効化"}</button>
    </li>)}</ul>
  </div></main>;
};
