import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSchoolPostStatus, type SchoolPostStatus } from "../../api/schoolPosts";

const UserList = ({ title, users, empty }: { title: string; users: Array<{ id: number; name: string }>; empty: string }) => (
  <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
    <h2 className="font-bold">{title}</h2>
    {users.length === 0 ? <p className="mt-3 text-sm text-slate-500">{empty}</p> : <ul className="mt-2 divide-y divide-slate-200">{users.map((user) => <li key={user.id} className="py-2">{user.name}</li>)}</ul>}
  </section>
);

export const PostStatusPage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState<SchoolPostStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getSchoolPostStatus(Number(id)).then((result) => { if (active) setStatus(result); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "確認状況を取得できませんでした"); });
    return () => { active = false; };
  }, [id]);

  return <main className="p-6"><div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold">確認状況</h1>
    <p className="mt-1 text-sm text-slate-600">この画面は連絡作成者と管理者だけが閲覧できます。</p>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {status && <>
      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["対象者", status.target_count], ["閲覧済", status.read_count], ["確認済", status.confirmed_count], ["未確認", status.unconfirmed_count]].map(([label, value]) => <div key={label} className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm"><strong className="block text-2xl">{value}</strong>{label}</div>)}</div>
      <div className="grid gap-4 md:grid-cols-3">
        <UserList title="確認済み" users={status.confirmed_users} empty="確認済みの人はいません。" />
        <UserList title="閲覧済み・未確認" users={status.read_only_users} empty="該当者はいません。" />
        <UserList title="未読" users={status.unread_users} empty="未読の人はいません。" />
      </div>
    </>}
  </div></main>;
};
