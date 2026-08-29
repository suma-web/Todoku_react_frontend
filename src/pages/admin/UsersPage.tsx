import { useEffect, useState, type FormEvent } from "react";
import {
  createManagedUser,
  getManagedUsers,
  updateManagedUser,
  type ManagedUser,
  type UserRole,
} from "../../api/schoolAdmin";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "student" as UserRole,
};
const roles: Array<{ value: UserRole; label: string }> = [
  { value: "student", label: "生徒" },
  { value: "teacher", label: "教員" },
  { value: "admin", label: "管理者" },
];

export const UsersPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    void getManagedUsers()
      .then((items) => {
        if (active) setUsers(items);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "ユーザー一覧を取得できませんでした",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const created = await createManagedUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setUsers((current) => [...current, created]);
      setForm(initialForm);
      setSuccess(
        `${created.name} のアカウントを追加しました。初期パスワードを本人へ安全に共有してください。`,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "アカウントを追加できませんでした",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const change = async (user: ManagedUser, patch: Partial<ManagedUser>) => {
    setError("");
    setSuccess("");
    try {
      const updated = await updateManagedUser({ ...user, ...patch });
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "更新できませんでした",
      );
    }
  };

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.length >= 8;
  return (
    <main className="min-h-dvh p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <p className="mt-1 text-sm text-slate-600">
          生徒・教員・管理者のアカウントを追加し、Roleと有効状態を管理します。
        </p>
        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold">アカウントを追加</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              ユーザー名
              <input
                required
                maxLength={50}
                autoComplete="off"
                value={form.name}
                onChange={(e) =>
                  setForm((v) => ({ ...v, name: e.target.value }))
                }
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="例：yamada_taro"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              メールアドレス
              <input
                required
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) =>
                  setForm((v) => ({ ...v, email: e.target.value }))
                }
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="例：student@example.ed.jp"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              初期パスワード
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) =>
                  setForm((v) => ({ ...v, password: e.target.value }))
                }
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="8文字以上"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Role
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((v) => ({ ...v, role: e.target.value as UserRole }))
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            初期パスワードは8文字以上で設定してください。
          </p>
          <button
            disabled={!canSubmit || submitting}
            className="mt-4 rounded-lg bg-sky-600 px-5 py-2.5 font-bold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "追加中..." : "アカウントを追加"}
          </button>
        </form>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700"
          >
            {success}
          </p>
        )}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="p-3">名前</th>
                <th className="p-3">メール</th>
                <th className="p-3">Role</th>
                <th className="p-3">有効</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-slate-600">{user.email}</td>
                  <td className="p-3">
                    <select
                      aria-label={`${user.name}のRole`}
                      value={user.role}
                      onChange={(e) =>
                        void change(user, { role: e.target.value as UserRole })
                      }
                      className="rounded border border-slate-300 bg-white p-2"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`${user.name}を有効にする`}
                      type="checkbox"
                      checked={user.is_active}
                      onChange={(e) =>
                        void change(user, { is_active: e.target.checked })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <p className="p-8 text-center text-slate-500">読み込み中...</p>
          )}
          {!loading && users.length === 0 && (
            <p className="p-8 text-center text-slate-500">ユーザーはいません</p>
          )}
        </div>
      </div>
    </main>
  );
};
