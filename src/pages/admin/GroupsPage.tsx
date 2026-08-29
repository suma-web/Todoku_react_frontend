import { useEffect, useState, type FormEvent } from "react";
import { getManagedUsers, type ManagedUser } from "../../api/schoolAdmin";
import {
  addSchoolGroupMember, createSchoolGroup, deleteSchoolGroup, getSchoolGroupMembers,
  getSchoolGroups, removeSchoolGroupMember, type SchoolGroup, type SchoolGroupMember,
} from "../../api/schoolGroups";

const typeLabels: Record<SchoolGroup["type"], string> = {
  grade: "学年", class: "クラス", club: "部活動", committee: "委員会", department: "部署",
};

export const GroupsPage = () => {
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [members, setMembers] = useState<SchoolGroupMember[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<SchoolGroup["type"]>("class");
  const [selectedGroupID, setSelectedGroupID] = useState(0);
  const [selectedUserID, setSelectedUserID] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([getSchoolGroups(), getManagedUsers()]).then(([foundGroups, foundUsers]) => {
      if (!active) return;
      setGroups(foundGroups); setUsers(foundUsers);
      setSelectedGroupID(foundGroups[0]?.id ?? 0); setSelectedUserID(foundUsers[0]?.id ?? 0);
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "取得に失敗しました"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedGroupID) return;
    let active = true;
    void getSchoolGroupMembers(selectedGroupID).then((items) => { if (active) setMembers(items); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "所属メンバーを取得できませんでした"); });
    return () => { active = false; };
  }, [selectedGroupID]);

  const createGroup = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    try { const item = await createSchoolGroup({ name: name.trim(), type }); setGroups((current) => [...current, item]); setName(""); setSelectedGroupID(item.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "作成に失敗しました"); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    try { await addSchoolGroupMember(selectedGroupID, selectedUserID); setMembers(await getSchoolGroupMembers(selectedGroupID)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "所属を追加できませんでした"); }
  };

  return <main className="min-h-dvh p-6 text-slate-900"><div className="mx-auto max-w-4xl">
    <h1 className="text-2xl font-bold">所属管理</h1>
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <section className="mt-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">所属を追加</h2>
      <form onSubmit={createGroup} className="mt-4 flex flex-wrap gap-3">
        <input aria-label="所属名" value={name} onChange={(e) => setName(e.target.value)} className="min-w-56 flex-1 rounded border border-slate-300 p-3" placeholder="2年A組" />
        <select aria-label="所属種別" value={type} onChange={(e) => setType(e.target.value as SchoolGroup["type"])} className="rounded border border-slate-300 bg-white p-3">{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <button disabled={!name.trim()} className="rounded bg-sky-600 px-5 text-white disabled:opacity-40">追加</button>
      </form>
    </section>
    <section className="mt-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">ユーザーの所属設定</h2>
      <form onSubmit={addMember} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-1 text-sm">所属<select value={selectedGroupID} onChange={(e) => setSelectedGroupID(Number(e.target.value))} className="rounded border border-slate-300 bg-white p-3">{groups.map((group) => <option key={group.id} value={group.id}>{group.name}（{typeLabels[group.type]}）</option>)}</select></label>
        <label className="grid gap-1 text-sm">ユーザー<select value={selectedUserID} onChange={(e) => setSelectedUserID(Number(e.target.value))} className="rounded border border-slate-300 bg-white p-3">{users.map((user) => <option key={user.id} value={user.id}>{user.name}（{user.role}）</option>)}</select></label>
        <button disabled={!selectedGroupID || !selectedUserID} className="self-end rounded bg-sky-600 px-5 py-3 text-white disabled:opacity-40">所属させる</button>
      </form>
      <h3 className="mt-6 font-bold">所属中のユーザー</h3>
      <ul className="mt-2 divide-y divide-slate-200">{members.map((member) => <li key={member.id} className="flex items-center justify-between gap-3 py-3"><span>{member.name} <small className="text-slate-500">{member.email}・{member.role}</small></span><button type="button" className="text-red-600" onClick={async () => { try { await removeSchoolGroupMember(selectedGroupID, member.id); setMembers((current) => current.filter((item) => item.id !== member.id)); } catch (reason) { setError(reason instanceof Error ? reason.message : "所属から解除できませんでした"); } }}>解除</button></li>)}</ul>
      {members.length === 0 && <p className="mt-3 text-sm text-slate-500">所属中のユーザーはいません。</p>}
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">所属一覧</h2><ul className="mt-3 divide-y divide-slate-200">{groups.map((group) => <li key={group.id} className="flex justify-between py-3"><button type="button" onClick={() => setSelectedGroupID(group.id)} className="text-left hover:text-sky-700">{group.name} <small className="text-slate-500">{typeLabels[group.type]}</small></button><button type="button" className="text-red-600" onClick={async () => { try { await deleteSchoolGroup(group.id); setGroups((current) => current.filter((item) => item.id !== group.id)); if (selectedGroupID === group.id) { setSelectedGroupID(0); setMembers([]); } } catch (reason) { setError(reason instanceof Error ? reason.message : "削除に失敗しました"); } }}>削除</button></li>)}</ul></section>
  </div></main>;
};
