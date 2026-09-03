import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createQuestion, getQuestionCategories, type QuestionCategory } from "../../api/questions";
import { uploadAttachments } from "../../api/attachments";
import { AttachmentPicker } from "../../components/school/AttachmentPicker";
import { attachmentsAreValid } from "../../utils/attachmentValidation";

export const QuestionCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedCategoryId = searchParams.get("category_id");
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [category, setCategory] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void getQuestionCategories().then((items) => {
      if (!active) return;
      const enabled = items.filter((item) => item.is_active);
      const requestedCategory = Number(requestedCategoryId);
      const initialCategory = enabled.some((item) => item.id === requestedCategory)
        ? requestedCategory
        : (enabled[0]?.id ?? 0);
      setCategories(enabled);
      setCategory(initialCategory);
    }).catch((reason) => setError(reason.message));
    return () => { active = false; };
  }, [requestedCategoryId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const question = await createQuestion({ category_id: category, title, content, visibility });
      await uploadAttachments("questions", question.id, files);
      navigate(`/questions/${question.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "質問できませんでした");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-dvh bg-transparent p-6 text-slate-900"><form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
    <h1 className="text-2xl font-bold">質問・相談を作成</h1>
    {error && <p className="text-red-600">{error}</p>}
    <select value={category} onChange={(event) => setCategory(Number(event.target.value))} className="w-full rounded border border-slate-300 bg-white p-3 text-slate-900">
      {categories.map((item) => <option key={item.id} value={item.id}>{item.name}（担当：{item.group_name}）</option>)}
    </select>
    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="タイトル" className="w-full rounded border border-slate-300 bg-white p-3 text-slate-900" />
    <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="質問内容" rows={8} className="w-full rounded border border-slate-300 bg-white p-3 text-slate-900" />
    <fieldset className="flex gap-5"><label><input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} /> 公開質問</label><label><input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} /> 個別相談</label></fieldset>
    <AttachmentPicker files={files} onChange={setFiles} disabled={submitting} />
    <button disabled={submitting || !category || !title.trim() || !content.trim() || !attachmentsAreValid(files)} className="w-full rounded bg-sky-600 p-3 font-bold text-white disabled:opacity-40">{submitting ? "送信中..." : "送信する"}</button>
  </form></main>;
};
