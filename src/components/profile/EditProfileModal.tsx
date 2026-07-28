import { useState, type FormEvent } from "react";
import {
  updateProfile,
  type CurrentUser,
  type ProfileInput,
} from "../../api/user";

type EditProfileModalProps = {
  profile: CurrentUser;
  onClose: () => void;
  onSaved: (profile: CurrentUser) => void;
};

export const EditProfileModal = ({
  profile,
  onClose,
  onSaved,
}: EditProfileModalProps) => {
  const [form, setForm] = useState<ProfileInput>({
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof ProfileInput, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      onSaved(await updateProfile(form));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-500/40 px-0 py-0 sm:px-4 sm:py-12"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="min-h-dvh w-full bg-black text-white sm:min-h-0 sm:max-w-xl sm:rounded-2xl"
      >
        <header className="sticky top-0 flex items-center gap-6 border-b border-slate-800 bg-black/90 px-4 py-3 backdrop-blur">
          <button type="button" onClick={onClose} aria-label="閉じる" className="rounded-full p-2 text-xl hover:bg-slate-900">×</button>
          <h2 id="edit-profile-title" className="flex-1 text-xl font-bold">プロフィールを編集</h2>
          <button disabled={saving || !form.name.trim()} className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black disabled:opacity-50">
            {saving ? "保存中" : "保存"}
          </button>
        </header>
        <div className="space-y-5 p-4">
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            名前
            <input autoFocus value={form.name} maxLength={50} onChange={(event) => setField("name", event.target.value)} className="mt-1 w-full bg-transparent text-base text-white outline-none" />
            <span className="float-right">{form.name.length}/50</span>
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            自己紹介
            <textarea value={form.bio} maxLength={160} rows={4} onChange={(event) => setField("bio", event.target.value)} className="mt-1 w-full resize-none bg-transparent text-base text-white outline-none" />
            <span className="float-right">{form.bio.length}/160</span>
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            場所
            <input value={form.location} maxLength={30} onChange={(event) => setField("location", event.target.value)} className="mt-1 w-full bg-transparent text-base text-white outline-none" />
          </label>
          <label className="block rounded border border-slate-700 px-3 py-2 text-xs text-slate-500">
            Webサイト
            <input value={form.website} maxLength={200} onChange={(event) => setField("website", event.target.value)} className="mt-1 w-full bg-transparent text-base text-white outline-none" />
          </label>
        </div>
      </form>
    </div>
  );
};
